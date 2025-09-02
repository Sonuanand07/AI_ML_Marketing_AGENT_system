import { LeadTriageAgent } from '../agents/LeadTriageAgent';
import { EngagementAgent } from '../agents/EngagementAgent';
import { CampaignOptimizationAgent } from '../agents/CampaignOptimizationAgent';
import { MCPClient } from '../mcp/MCPClient';
import { WebSocketManager } from '../communication/WebSocketManager';
import { Agent, AgentAction, ActionResult, Lead, Campaign, SystemMetrics } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class AgentOrchestrator {
  private agents: Map<string, Agent> = new Map();
  private mcpClient: MCPClient;
  private wsManager: WebSocketManager;
  private systemMetrics: SystemMetrics;
  private isRunning: boolean = false;

  constructor() {
    // Initialize MCP client with mock endpoint
    this.mcpClient = new MCPClient(
      'https://api.purplemerit.com',
      'mock-api-key-for-demo'
    );

    // Initialize WebSocket manager with mock endpoint
    this.wsManager = new WebSocketManager('wss://ws.purplemerit.com/agents');

    this.systemMetrics = {
      totalLeads: 0,
      activeAgents: 0,
      campaignsRunning: 0,
      conversionRate: 0,
      averageResponseTime: 0,
      systemLoad: 0,
      memoryUsage: 0,
      lastUpdated: new Date()
    };
  }

  public async initialize(): Promise<void> {
    console.log('Initializing Agent Orchestrator...');

    try {
      // Initialize communication layer
      await this.initializeCommunication();

      // Create and register agents
      await this.createAgents();

      // Set up system monitoring
      await this.setupSystemMonitoring();

      // Start the orchestration loop
      await this.startOrchestration();

      this.isRunning = true;
      console.log('Agent Orchestrator initialized successfully');

    } catch (error) {
      console.error('Failed to initialize Agent Orchestrator:', error);
      throw error;
    }
  }

  private async initializeCommunication(): Promise<void> {
    // In a real implementation, this would connect to actual WebSocket server
    // For demo purposes, we'll simulate the connection
    console.log('Initializing communication layer...');
    
    // Set up message routing
    this.wsManager.onMessage((message: any) => {
      this.routeMessage(message);
    });

    // Start connection monitoring
    await this.wsManager.monitorConnection();
  }

  private async createAgents(): Promise<void> {
    console.log('Creating specialized agents...');

    // Create Lead Triage Agent
    const triageAgent = new LeadTriageAgent(this.mcpClient, this.wsManager);
    this.agents.set(triageAgent.id, triageAgent);
    this.agents.set('triage_agent', triageAgent); // Alias for easy access

    // Create Engagement Agent
    const engagementAgent = new EngagementAgent(this.mcpClient, this.wsManager);
    this.agents.set(engagementAgent.id, engagementAgent);
    this.agents.set('engagement_agent', engagementAgent); // Alias for easy access

    // Create Campaign Optimization Agent
    const optimizationAgent = new CampaignOptimizationAgent(this.mcpClient, this.wsManager);
    this.agents.set(optimizationAgent.id, optimizationAgent);
    this.agents.set('optimization_agent', optimizationAgent); // Alias for easy access

    console.log(`Created ${this.agents.size / 2} agents`); // Divide by 2 due to aliases
  }

  private async setupSystemMonitoring(): Promise<void> {
    // Monitor system performance every 30 seconds
    setInterval(async () => {
      await this.updateSystemMetrics();
    }, 30000);

    // Memory cleanup every 5 minutes
    setInterval(async () => {
      await this.performMemoryCleanup();
    }, 300000);

    // Health checks every minute
    setInterval(async () => {
      await this.performHealthChecks();
    }, 60000);
  }

  private async startOrchestration(): Promise<void> {
    console.log('Starting agent orchestration...');

    // Set up inter-agent communication patterns
    this.setupAgentCommunication();

    // Start processing queued tasks
    this.startTaskProcessing();

    // Initialize with sample data for demonstration
    await this.initializeSampleData();
  }

  private setupAgentCommunication(): void {
    // Set up communication patterns between agents
    this.wsManager.onMessage((message: any) => {
      switch (message.type) {
        case 'AGENT_HANDOFF':
          this.handleAgentHandoff(message);
          break;
        case 'MEMORY_UPDATE':
          this.handleMemoryUpdate(message);
          break;
        case 'CAMPAIGN_UPDATE':
          this.handleCampaignUpdate(message);
          break;
        case 'LEAD_UPDATE':
          this.handleLeadUpdate(message);
          break;
        case 'PERFORMANCE_ALERT':
          this.handlePerformanceAlert(message);
          break;
        case 'ESCALATION_ALERT':
          this.handleEscalationAlert(message);
          break;
      }
    });
  }

  private async handleAgentHandoff(message: any): Promise<void> {
    const { targetAgent, context, reason } = message.payload;
    const targetAgentInstance = this.agents.get(targetAgent);

    if (targetAgentInstance) {
      console.log(`Handing off from ${message.agentId} to ${targetAgent}: ${reason}`);
      
      // Create handoff action for target agent
      const handoffAction: AgentAction = {
        id: uuidv4(),
        agentId: targetAgent,
        type: 'HANDOFF_RECEIVED' as any,
        target: context.leadId || context.campaignId,
        payload: {
          fromAgent: message.agentId,
          context,
          reason
        },
        timestamp: new Date()
      };

      // Process the handoff
      await (targetAgentInstance as any).processAction(handoffAction);
    }
  }

  private async handleMemoryUpdate(message: any): Promise<void> {
    // Broadcast memory updates to relevant agents
    const { memoryType, data } = message.payload;
    
    // Update system-wide knowledge if it's semantic memory
    if (memoryType === 'semantic') {
      this.broadcastSemanticUpdate(data);
    }
  }

  private async handleCampaignUpdate(message: any): Promise<void> {
    const { campaignId, updates } = message.payload;
    
    // Notify optimization agent of campaign changes
    const optimizationAgent = this.agents.get('optimization_agent');
    if (optimizationAgent) {
      const action: AgentAction = {
        id: uuidv4(),
        agentId: optimizationAgent.id,
        type: 'CAMPAIGN_UPDATED' as any,
        target: campaignId,
        payload: { campaignId, updates },
        timestamp: new Date()
      };

      await (optimizationAgent as any).processAction(action);
    }
  }

  private async handleLeadUpdate(message: any): Promise<void> {
    const { leadId, updates } = message.payload;
    
    // Update system metrics
    this.systemMetrics.totalLeads = await this.getTotalLeadsCount();
    this.systemMetrics.lastUpdated = new Date();
  }

  private async handlePerformanceAlert(message: any): Promise<void> {
    const alert = message.payload;
    console.warn(`Performance alert from ${message.agentId}:`, alert);
    
    // Log alert for system administrators
    // In production, this would trigger notifications to ops teams
  }

  private async handleEscalationAlert(message: any): Promise<void> {
    const escalation = message.payload;
    console.error(`Escalation alert from ${message.agentId}:`, escalation);
    
    // In production, this would:
    // 1. Create tickets in project management systems
    // 2. Send notifications to marketing managers
    // 3. Trigger automated fallback procedures
  }

  private broadcastSemanticUpdate(data: any): void {
    // Share semantic knowledge across all agents
    this.agents.forEach(async (agent, agentId) => {
      if (!agentId.includes('_agent')) return; // Skip aliases
      
      try {
        await (agent as any).storeMemory('semantic', {
          type: 'shared_knowledge',
          data,
          sharedBy: 'system',
          timestamp: new Date()
        });
      } catch (error) {
        console.error(`Failed to share knowledge with agent ${agentId}:`, error);
      }
    });
  }

  private startTaskProcessing(): void {
    // Process tasks every 5 seconds
    setInterval(async () => {
      await this.processScheduledTasks();
    }, 5000);
  }

  private async processScheduledTasks(): Promise<void> {
    // Check for scheduled followups
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (engagementAgent) {
      const followups = await engagementAgent.retrieveMemory('short', {
        type: 'scheduled_followup'
      });

      const dueFollowups = followups.filter((followup: any) => 
        new Date(followup.data.scheduledFor) <= new Date() &&
        followup.data.status === 'scheduled'
      );

      for (const followup of dueFollowups) {
        const action: AgentAction = {
          id: uuidv4(),
          agentId: engagementAgent.id,
          type: 'SEND_EMAIL' as any,
          target: followup.data.leadId,
          payload: {
            lead: { id: followup.data.leadId },
            campaignType: 'followup',
            customMessage: followup.data.message
          },
          timestamp: new Date()
        };

        await engagementAgent.processAction(action);

        // Mark followup as completed
        followup.data.status = 'completed';
        followup.data.completedAt = new Date();
      }
    }
  }

  private async updateSystemMetrics(): Promise<void> {
    const activeAgentCount = Array.from(this.agents.values())
      .filter(agent => !agent.id.includes('_agent')) // Exclude aliases
      .filter(agent => agent.status === 'active' || agent.status === 'processing').length;

    this.systemMetrics = {
      totalLeads: await this.getTotalLeadsCount(),
      activeAgents: activeAgentCount,
      campaignsRunning: await this.getActiveCampaignsCount(),
      conversionRate: await this.calculateSystemConversionRate(),
      averageResponseTime: await this.calculateAverageResponseTime(),
      systemLoad: this.calculateSystemLoad(),
      memoryUsage: await this.calculateMemoryUsage(),
      lastUpdated: new Date()
    };

    // Broadcast system status
    await this.wsManager.sendSystemStatus(this.systemMetrics);
  }

  private async getTotalLeadsCount(): Promise<number> {
    let totalLeads = 0;
    
    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      try {
        const memoryStats = await (agent as any).getMemoryStats();
        totalLeads += memoryStats.shortTermItems || 0;
      } catch (error) {
        console.error(`Failed to get memory stats for agent ${agentId}:`, error);
      }
    }

    return totalLeads;
  }

  private async getActiveCampaignsCount(): Promise<number> {
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (!engagementAgent) return 0;

    try {
      const campaigns = await engagementAgent.retrieveMemory('long', {
        type: 'campaign',
        status: 'active'
      });
      return campaigns.length;
    } catch (error) {
      return 0;
    }
  }

  private async calculateSystemConversionRate(): Promise<number> {
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (!engagementAgent) return 0;

    try {
      const metrics = await engagementAgent.getEngagementMetrics();
      return metrics.conversionRate || 0;
    } catch (error) {
      return 0;
    }
  }

  private async calculateAverageResponseTime(): Promise<number> {
    let totalResponseTime = 0;
    let responseCount = 0;

    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      try {
        const performanceMetrics = await (agent as any).getPerformanceMetrics();
        if (performanceMetrics.processing_time) {
          totalResponseTime += performanceMetrics.processing_time;
          responseCount++;
        }
      } catch (error) {
        console.error(`Failed to get performance metrics for agent ${agentId}:`, error);
      }
    }

    return responseCount > 0 ? totalResponseTime / responseCount : 0;
  }

  private calculateSystemLoad(): number {
    const processingAgents = Array.from(this.agents.values())
      .filter(agent => !agent.id.includes('_agent')) // Exclude aliases
      .filter(agent => agent.status === 'processing').length;

    const totalAgents = Array.from(this.agents.values())
      .filter(agent => !agent.id.includes('_agent')).length;

    return totalAgents > 0 ? processingAgents / totalAgents : 0;
  }

  private async calculateMemoryUsage(): Promise<number> {
    let totalMemoryItems = 0;
    const maxMemoryItems = 10000; // Arbitrary limit for calculation

    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      try {
        const memoryStats = await (agent as any).getMemoryStats();
        totalMemoryItems += Object.values(memoryStats).reduce((sum: number, count: any) => sum + count, 0);
      } catch (error) {
        console.error(`Failed to get memory stats for agent ${agentId}:`, error);
      }
    }

    return Math.min(totalMemoryItems / maxMemoryItems, 1.0);
  }

  private async performMemoryCleanup(): Promise<void> {
    console.log('Performing system-wide memory cleanup...');

    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      try {
        await (agent as any).consolidateMemory();
      } catch (error) {
        console.error(`Memory cleanup failed for agent ${agentId}:`, error);
      }
    }
  }

  private async performHealthChecks(): Promise<void> {
    // Check MCP client health
    const mcpHealthy = await this.mcpClient.healthCheck();
    if (!mcpHealthy) {
      console.warn('MCP client health check failed');
    }

    // Check WebSocket connection
    const wsState = this.wsManager.getConnectionState();
    if (wsState !== 'connected') {
      console.warn(`WebSocket connection state: ${wsState}`);
    }

    // Check agent health
    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      if (agent.status === 'error') {
        console.warn(`Agent ${agentId} is in error state`);
        // In production, this would trigger recovery procedures
      }
    }
  }

  private routeMessage(message: any): void {
    // Route messages to appropriate agents
    if (message.targetAgentId) {
      const targetAgent = this.agents.get(message.targetAgentId);
      if (targetAgent) {
        // Message will be handled by the agent's message handler
        return;
      }
    }

    // Broadcast messages to all agents if no specific target
    if (message.type === 'SYSTEM_BROADCAST') {
      this.agents.forEach((agent, agentId) => {
        if (!agentId.includes('_agent')) { // Skip aliases
          // Agent will handle the message through its message handler
        }
      });
    }
  }

  // Public API Methods
  public async processNewLead(leadData: Partial<Lead>): Promise<ActionResult> {
    const triageAgent = this.agents.get('triage_agent') as any;
    if (!triageAgent) {
      return {
        success: false,
        error: 'Triage agent not available'
      };
    }

    const action: AgentAction = {
      id: uuidv4(),
      agentId: triageAgent.id,
      type: 'CATEGORIZE_LEAD' as any,
      target: leadData.email || 'unknown',
      payload: { lead: leadData },
      timestamp: new Date()
    };

    return await triageAgent.processAction(action);
  }

  public async createCampaign(campaignData: Partial<Campaign>): Promise<ActionResult> {
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (!engagementAgent) {
      return {
        success: false,
        error: 'Engagement agent not available'
      };
    }

    try {
      const campaign = await engagementAgent.createCampaign(campaignData);
      
      return {
        success: true,
        data: campaign,
        metrics: {
          creation_time: Date.now(),
          target_audience_size: campaign.targetAudience.length
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Campaign creation failed'
      };
    }
  }

  public async optimizeCampaign(campaignId: string): Promise<ActionResult> {
    const optimizationAgent = this.agents.get('optimization_agent') as any;
    if (!optimizationAgent) {
      return {
        success: false,
        error: 'Optimization agent not available'
      };
    }

    const action: AgentAction = {
      id: uuidv4(),
      agentId: optimizationAgent.id,
      type: 'ANALYZE_PERFORMANCE' as any,
      target: campaignId,
      payload: { campaignId },
      timestamp: new Date()
    };

    return await optimizationAgent.processAction(action);
  }

  public getSystemMetrics(): SystemMetrics {
    return { ...this.systemMetrics };
  }

  public getAgentStatuses(): Record<string, any> {
    const statuses: Record<string, any> = {};

    this.agents.forEach((agent, agentId) => {
      if (!agentId.includes('_agent')) { // Skip aliases
        statuses[agentId] = {
          name: agent.name,
          type: agent.type,
          status: agent.status,
          lastActive: agent.lastActive,
          capabilities: agent.capabilities
        };
      }
    });

    return statuses;
  }

  public async getSystemReport(): Promise<any> {
    const report = {
      systemMetrics: this.getSystemMetrics(),
      agentStatuses: this.getAgentStatuses(),
      memoryStats: await this.getSystemMemoryStats(),
      performanceMetrics: await this.getSystemPerformanceMetrics(),
      generatedAt: new Date()
    };

    return report;
  }

  private async getSystemMemoryStats(): Promise<Record<string, any>> {
    const stats: Record<string, any> = {};

    for (const [agentId, agent] of this.agents) {
      if (agentId.includes('_agent')) continue; // Skip aliases
      
      try {
        stats[agentId] = await (agent as any).getMemoryStats();
      } catch (error) {
        stats[agentId] = { error: 'Failed to retrieve memory stats' };
      }
    }

    return stats;
  }

  private async getSystemPerformanceMetrics(): Promise<Record<string, any>> {
    const metrics: Record<string, any> = {};

    // Get triage agent metrics
    const triageAgent = this.agents.get('triage_agent') as any;
    if (triageAgent) {
      try {
        metrics.triage = await triageAgent.getTriageStats();
      } catch (error) {
        metrics.triage = { error: 'Failed to retrieve triage stats' };
      }
    }

    // Get engagement agent metrics
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (engagementAgent) {
      try {
        metrics.engagement = await engagementAgent.getEngagementMetrics();
      } catch (error) {
        metrics.engagement = { error: 'Failed to retrieve engagement stats' };
      }
    }

    // Get optimization agent metrics
    const optimizationAgent = this.agents.get('optimization_agent') as any;
    if (optimizationAgent) {
      try {
        metrics.optimization = await optimizationAgent.getOptimizationMetrics();
      } catch (error) {
        metrics.optimization = { error: 'Failed to retrieve optimization stats' };
      }
    }

    return metrics;
  }

  private async initializeSampleData(): Promise<void> {
    console.log('Initializing sample data for demonstration...');

    // Create sample leads
    const sampleLeads = [
      {
        email: 'john.doe@techcorp.com',
        name: 'John Doe',
        company: 'TechCorp Inc.',
        source: 'website_form',
        metadata: { interest: 'AI solutions' }
      },
      {
        email: 'sarah.smith@startup.io',
        name: 'Sarah Smith',
        company: 'Startup.io',
        source: 'referral',
        metadata: { interest: 'marketing automation' }
      },
      {
        email: 'mike.johnson@enterprise.com',
        name: 'Mike Johnson',
        company: 'Enterprise Corp',
        source: 'cold_outreach',
        metadata: { interest: 'data analytics' }
      }
    ];

    // Process sample leads
    for (const leadData of sampleLeads) {
      await this.processNewLead(leadData);
      await this.delay(1000); // Stagger processing
    }

    // Create sample campaign
    await this.createCampaign({
      name: 'Q4 AI Solutions Campaign',
      type: 'EMAIL' as any,
      targetAudience: ['tech_companies', 'startups'],
      content: {
        body: 'Discover how AI can transform your business operations',
        callToAction: 'Schedule a demo',
        personalizationTokens: ['name', 'company', 'industry']
      },
      budget: 10000,
      startDate: new Date()
    });

    console.log('Sample data initialization completed');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  public async shutdown(): Promise<void> {
    console.log('Shutting down Agent Orchestrator...');
    
    this.isRunning = false;
    
    // Disconnect WebSocket
    await this.wsManager.disconnect();
    
    // Clear agents
    this.agents.clear();
    
    console.log('Agent Orchestrator shutdown completed');
  }

  public isSystemRunning(): boolean {
    return this.isRunning;
  }

  public async loadMarketingData(data: any): Promise<void> {
    console.log('📊 Loading marketing data into agent system...');
    
    try {
      // Load leads into triage agent
      const triageAgent = this.agents.get('triage_agent') as any;
      if (triageAgent && data.leads) {
        for (const lead of data.leads.slice(0, 20)) { // Load first 20 for demo
          await this.processNewLead(lead);
          await this.delay(100); // Stagger processing
        }
      }

      // Load campaigns into engagement agent
      const engagementAgent = this.agents.get('engagement_agent') as any;
      if (engagementAgent && data.campaigns) {
        for (const campaign of data.campaigns.slice(0, 10)) { // Load first 10 for demo
          await this.createCampaign(campaign);
          await this.delay(100);
        }
      }

      // Load customer profiles
      if (data.customers) {
        for (const customer of data.customers.slice(0, 30)) { // Load first 30 for demo
          await this.loadCustomerProfile(customer);
          await this.delay(50);
        }
      }

      console.log('✅ Marketing data loaded successfully into agent system');
      
    } catch (error) {
      console.error('❌ Failed to load marketing data:', error);
    }
  }

  private async loadCustomerProfile(customer: any): Promise<void> {
    // Store customer profile in agent memory
    const engagementAgent = this.agents.get('engagement_agent') as any;
    if (engagementAgent) {
      await engagementAgent.storeMemory('long', {
        type: 'customer_profile',
        data: customer
      });
    }
  }
}