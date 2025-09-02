import { WebSocketMessage, MessageType } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class WebSocketManager {
  private ws: WebSocket | null = null;
  private url: string;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private messageHandlers: Map<string, (message: any) => void> = new Map();
  private connectionPromise: Promise<void> | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  constructor(url: string) {
    this.url = url;
  }

  public async connect(): Promise<void> {
    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(this.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.stopHeartbeat();
          this.connectionPromise = null;
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          reject(error);
        };

      } catch (error) {
        reject(error);
      }
    });

    return this.connectionPromise;
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({
          type: 'ping',
          timestamp: new Date().toISOString()
        }));
      }
    }, 30000); // Send ping every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  public async sendMessage(message: WebSocketMessage): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      await this.connect();
    }

    const messageWithId = {
      ...message,
      id: uuidv4(),
      timestamp: new Date()
    };

    this.ws!.send(JSON.stringify(messageWithId));
  }

  public async broadcast(message: Omit<WebSocketMessage, 'agentId'>): Promise<void> {
    const broadcastMessage: WebSocketMessage = {
      ...message,
      agentId: 'system'
    };

    await this.sendMessage(broadcastMessage);
  }

  private handleMessage(message: any): void {
    // Handle system messages
    if (message.type === 'pong') {
      return; // Heartbeat response
    }

    // Route message to appropriate handlers
    this.messageHandlers.forEach((handler, handlerId) => {
      try {
        handler(message);
      } catch (error) {
        console.error(`Message handler ${handlerId} failed:`, error);
      }
    });
  }

  public onMessage(handler: (message: any) => void): string {
    const handlerId = uuidv4();
    this.messageHandlers.set(handlerId, handler);
    return handlerId;
  }

  public offMessage(handlerId: string): void {
    this.messageHandlers.delete(handlerId);
  }

  public async disconnect(): Promise<void> {
    this.stopHeartbeat();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    
    this.connectionPromise = null;
    this.messageHandlers.clear();
  }

  public getConnectionState(): string {
    if (!this.ws) return 'disconnected';
    
    switch (this.ws.readyState) {
      case WebSocket.CONNECTING:
        return 'connecting';
      case WebSocket.OPEN:
        return 'connected';
      case WebSocket.CLOSING:
        return 'closing';
      case WebSocket.CLOSED:
        return 'disconnected';
      default:
        return 'unknown';
    }
  }

  // Agent Communication Methods
  public async requestAgentHandoff(fromAgentId: string, toAgentId: string, context: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.AGENT_HANDOFF,
      agentId: fromAgentId,
      payload: {
        targetAgent: toAgentId,
        context,
        reason: 'Agent handoff requested',
        priority: context.priority || 5
      },
      timestamp: new Date()
    });
  }

  public async notifyMemoryUpdate(agentId: string, memoryType: string, data: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.MEMORY_UPDATE,
      agentId,
      payload: {
        memoryType,
        data,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  public async notifyCampaignUpdate(agentId: string, campaignId: string, updates: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.CAMPAIGN_UPDATE,
      agentId,
      payload: {
        campaignId,
        updates,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  public async notifyLeadUpdate(agentId: string, leadId: string, updates: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.LEAD_UPDATE,
      agentId,
      payload: {
        leadId,
        updates,
        timestamp: new Date()
      },
      timestamp: new Date()
    });
  }

  public async sendPerformanceAlert(agentId: string, alert: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.PERFORMANCE_ALERT,
      agentId,
      payload: alert,
      timestamp: new Date()
    });
  }

  public async sendSystemStatus(status: any): Promise<void> {
    await this.sendMessage({
      type: MessageType.SYSTEM_STATUS,
      agentId: 'system',
      payload: status,
      timestamp: new Date()
    });
  }

  // Message Queue Management
  private messageQueue: WebSocketMessage[] = [];
  private isProcessingQueue: boolean = false;

  public async queueMessage(message: WebSocketMessage): Promise<void> {
    this.messageQueue.push(message);
    
    if (!this.isProcessingQueue) {
      await this.processMessageQueue();
    }
  }

  private async processMessageQueue(): Promise<void> {
    this.isProcessingQueue = true;

    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message) {
        try {
          await this.sendMessage(message);
          await this.delay(100); // Rate limiting
        } catch (error) {
          console.error('Failed to send queued message:', error);
          // Re-queue the message for retry
          this.messageQueue.unshift(message);
          break;
        }
      }
    }

    this.isProcessingQueue = false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Connection Health Monitoring
  public async monitorConnection(): Promise<void> {
    setInterval(() => {
      const state = this.getConnectionState();
      
      if (state === 'disconnected' && this.reconnectAttempts < this.maxReconnectAttempts) {
        console.log('Connection lost, attempting to reconnect...');
        this.connect().catch(error => {
          console.error('Auto-reconnection failed:', error);
        });
      }
    }, 10000); // Check every 10 seconds
  }

  // Message Statistics
  private messageStats = {
    sent: 0,
    received: 0,
    errors: 0,
    lastActivity: new Date()
  };

  public getMessageStats(): any {
    return { ...this.messageStats };
  }

  private updateStats(type: 'sent' | 'received' | 'error'): void {
    this.messageStats[type]++;
    this.messageStats.lastActivity = new Date();
  }
}