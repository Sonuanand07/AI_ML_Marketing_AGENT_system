import { WebSocketServer as WSServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { WebSocketMessage, MessageType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WebSocketServer {
  private wss: WSServer;
  private server: any;
  private port: number;
  private clients: Map<string, WebSocket> = new Map();
  private agentConnections: Map<string, string> = new Map(); // agentId -> clientId

  constructor(port: number = 3002) {
    this.port = port;
    this.server = createServer();
    this.wss = new WSServer({ server: this.server });
    this.setupWebSocketHandlers();
  }

  private setupWebSocketHandlers(): void {
    this.wss.on('connection', (ws: WebSocket, req) => {
      const clientId = uuidv4();
      this.clients.set(clientId, ws);

      console.log(`WebSocket client connected: ${clientId}`);

      // Send welcome message
      ws.send(JSON.stringify({
        type: 'connection_established',
        clientId,
        timestamp: new Date()
      }));

      ws.on('message', async (data) => {
        try {
          const message = JSON.parse(data.toString());
          await this.handleMessage(clientId, message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
          ws.send(JSON.stringify({
            type: 'error',
            error: 'Invalid message format',
            timestamp: new Date()
          }));
        }
      });

      ws.on('close', () => {
        console.log(`WebSocket client disconnected: ${clientId}`);
        this.clients.delete(clientId);
        
        // Remove agent connection if exists
        for (const [agentId, connectedClientId] of this.agentConnections) {
          if (connectedClientId === clientId) {
            this.agentConnections.delete(agentId);
            break;
          }
        }
      });

      ws.on('error', (error) => {
        console.error(`WebSocket error for client ${clientId}:`, error);
      });

      // Send periodic ping to keep connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.ping();
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });
  }

  private async handleMessage(clientId: string, message: any): Promise<void> {
    switch (message.type) {
      case 'agent_register':
        await this.handleAgentRegistration(clientId, message);
        break;
      case 'agent_message':
        await this.handleAgentMessage(clientId, message);
        break;
      case 'broadcast_request':
        await this.handleBroadcastRequest(clientId, message);
        break;
      case 'ping':
        await this.handlePing(clientId);
        break;
      default:
        console.warn(`Unknown message type: ${message.type}`);
    }
  }

  private async handleAgentRegistration(clientId: string, message: any): Promise<void> {
    const { agentId, agentType } = message;
    
    this.agentConnections.set(agentId, clientId);
    
    const client = this.clients.get(clientId);
    if (client) {
      client.send(JSON.stringify({
        type: 'registration_confirmed',
        agentId,
        timestamp: new Date()
      }));
    }

    console.log(`Agent registered: ${agentId} (${agentType})`);
  }

  private async handleAgentMessage(clientId: string, message: WebSocketMessage): Promise<void> {
    const { agentId, payload } = message;

    // Route message to target agent if specified
    if (payload.targetAgentId) {
      const targetClientId = this.agentConnections.get(payload.targetAgentId);
      const targetClient = targetClientId ? this.clients.get(targetClientId) : null;
      
      if (targetClient && targetClient.readyState === WebSocket.OPEN) {
        targetClient.send(JSON.stringify({
          ...message,
          routedFrom: agentId,
          timestamp: new Date()
        }));
      } else {
        // Target agent not connected, queue message or handle appropriately
        console.warn(`Target agent ${payload.targetAgentId} not connected`);
      }
    } else {
      // Broadcast to all connected agents
      await this.broadcastToAgents(message, agentId);
    }
  }

  private async handleBroadcastRequest(clientId: string, message: any): Promise<void> {
    await this.broadcastToAll(message.payload, message.agentId);
  }

  private async handlePing(clientId: string): Promise<void> {
    const client = this.clients.get(clientId);
    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        type: 'pong',
        timestamp: new Date()
      }));
    }
  }

  public async broadcastToAgents(message: WebSocketMessage, excludeAgentId?: string): Promise<void> {
    const broadcastMessage = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };

    for (const [agentId, clientId] of this.agentConnections) {
      if (agentId !== excludeAgentId) {
        const client = this.clients.get(clientId);
        if (client && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify(broadcastMessage));
        }
      }
    }
  }

  public async broadcastToAll(message: any, fromAgentId?: string): Promise<void> {
    const broadcastMessage = {
      type: 'system_broadcast',
      fromAgent: fromAgentId,
      payload: message,
      timestamp: new Date()
    };

    this.clients.forEach((client, clientId) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(broadcastMessage));
      }
    });
  }

  public async sendToAgent(agentId: string, message: any): Promise<boolean> {
    const clientId = this.agentConnections.get(agentId);
    const client = clientId ? this.clients.get(clientId) : null;

    if (client && client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({
        ...message,
        targetAgent: agentId,
        timestamp: new Date()
      }));
      return true;
    }

    return false;
  }

  public getConnectedAgents(): string[] {
    return Array.from(this.agentConnections.keys());
  }

  public getConnectionStats(): any {
    return {
      totalClients: this.clients.size,
      connectedAgents: this.agentConnections.size,
      activeConnections: Array.from(this.clients.values()).filter(
        client => client.readyState === WebSocket.OPEN
      ).length
    };
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.server.listen(this.port, () => {
        console.log(`WebSocket Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve) => {
      this.wss.close(() => {
        this.server.close(() => {
          console.log('WebSocket Server stopped');
          resolve();
        });
      });
    });
  }
}