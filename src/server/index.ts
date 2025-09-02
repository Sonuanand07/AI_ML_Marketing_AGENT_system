import express from 'express';
import { createServer } from 'http';
import { MCPServer } from '../api/MCPServer';
import { WebSocketServer } from '../api/WebSocketServer';
import { AgentOrchestrator } from '../system/AgentOrchestrator';

const app = express();
const server = createServer(app);
const port = process.env.PORT || 3001;
const wsPort = process.env.WEBSOCKET_PORT || 3002;

async function startServer() {
  try {
    console.log('🚀 Starting AIML Marketing Multi-Agent System...');

    // Initialize MCP Server
    const mcpServer = new MCPServer(port);
    console.log('✅ MCP Server initialized');

    // Initialize WebSocket Server
    const wsServer = new WebSocketServer(wsPort);
    console.log('✅ WebSocket Server initialized');

    // Initialize Agent Orchestrator
    const orchestrator = new AgentOrchestrator();
    await orchestrator.initialize();
    console.log('✅ Agent Orchestrator initialized');

    // Start servers
    await Promise.all([
      mcpServer.start(),
      wsServer.start()
    ]);

    console.log(`🎯 AIML Marketing System running on:`);
    console.log(`   HTTP API: http://localhost:${port}`);
    console.log(`   WebSocket: ws://localhost:${wsPort}`);
    console.log(`   Frontend: http://localhost:5173`);
    console.log('');
    console.log('📊 System Status:');
    console.log('   - Lead Triage Agent: Active');
    console.log('   - Engagement Agent: Active');
    console.log('   - Campaign Optimization Agent: Active');
    console.log('   - Adaptive Memory System: Operational');
    console.log('');
    console.log('🔗 Access the dashboard to start managing leads and campaigns!');

    // Graceful shutdown
    process.on('SIGTERM', async () => {
      console.log('🛑 Shutting down gracefully...');
      await orchestrator.shutdown();
      await wsServer.stop();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();