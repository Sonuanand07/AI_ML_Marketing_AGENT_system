import { Agent, AgentType, AgentStatus, AgentMemory, AgentAction, ActionResult } from '../types';
import { MemoryManager } from '../memory/MemoryManager';
import { MCPClient } from '../mcp/MCPClient';
import { WebSocketManager } from '../communication/WebSocketManager';
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseAgent implements Agent {
  public readonly id: string;
  public readonly name: string;
  public readonly type: AgentType;
  public status: AgentStatus = AgentStatus.IDLE;
  public readonly capabilities: string[];
  public memory: AgentMemory;
  public lastActive: Date = new Date();

  protected memoryManager: MemoryManager;
  protected mcpClient: MCPClient;
  protected wsManager: WebSocketManager;

  constructor(
    name: string,
    type: AgentType,
    capabilities: string[],
    mcpClient: MCPClient,
    wsManager: WebSocketManager
  ) {
    this.id = uuidv4();
    this.name = name;
    this.type = type;
    this.capabilities = capabilities;
    this.mcpClient = mcpClient;
    this.wsManager = wsManager;
    
    this.memoryManager = new MemoryManager(this.id);
    this.memory = this.memoryManager.getMemory();
    
    this.initialize();
  }

  protected abstract initialize(): void;
  public abstract processAction(action: AgentAction): Promise<ActionResult>;

  protected updateStatus(status: AgentStatus): void {
    this.status = status;
    this.lastActive = new Date();
    this.broadcastStatusUpdate();
  }

  protected async storeMemory(type: 'short' | 'long' | 'episodic' | 'semantic', data: any): Promise<void> {
    await this.memoryManager.store(type, data);
    this.memory = this.memoryManager.getMemory();
  }

  protected async retrieveMemory(type: 'short' | 'long' | 'episodic' | 'semantic', query: any): Promise<any[]> {
    return await this.memoryManager.retrieve(type, query);
  }

  protected async consolidateMemory(): Promise<void> {
    await this.memoryManager.consolidate();
    this.memory = this.memoryManager.getMemory();
  }

  protected async sendMessage(targetAgentId: string, message: any): Promise<void> {
    await this.wsManager.sendMessage({
      type: 'AGENT_COMMUNICATION',
      agentId: this.id,
      targetAgentId,
      payload: message,
      timestamp: new Date()
    });
  }

  protected async broadcastStatusUpdate(): void {
    await this.wsManager.broadcast({
      type: 'AGENT_STATUS_UPDATE',
      agentId: this.id,
      payload: {
        status: this.status,
        lastActive: this.lastActive
      },
      timestamp: new Date()
    });
  }

  protected async logAction(action: AgentAction, result: ActionResult): Promise<void> {
    const logEntry = {
      agentId: this.id,
      action,
      result,
      timestamp: new Date()
    };

    await this.storeMemory('episodic', {
      type: 'action_log',
      data: logEntry
    });

    // Store performance metrics
    if (result.metrics) {
      for (const [metric, value] of Object.entries(result.metrics)) {
        await this.storeMemory('long', {
          type: 'performance_metric',
          data: {
            metric,
            value,
            timestamp: new Date(),
            context: action
          }
        });
      }
    }
  }

  protected async learnFromOutcome(action: AgentAction, result: ActionResult): Promise<void> {
    const learning = {
      actionType: action.type,
      context: action.payload,
      outcome: result,
      success: result.success,
      timestamp: new Date()
    };

    await this.storeMemory('episodic', {
      type: 'learning_outcome',
      data: learning
    });

    // Update semantic memory with new patterns
    if (result.success) {
      await this.updateSemanticKnowledge(action, result);
    }
  }

  private async updateSemanticKnowledge(action: AgentAction, result: ActionResult): Promise<void> {
    const pattern = {
      id: uuidv4(),
      pattern: `${action.type}_success_pattern`,
      confidence: 0.8,
      applications: 1,
      successRate: 1.0,
      lastUsed: new Date(),
      context: [action.type, JSON.stringify(action.payload)]
    };

    await this.storeMemory('semantic', {
      type: 'learning_pattern',
      data: pattern
    });
  }

  public async getPerformanceMetrics(): Promise<Record<string, number>> {
    const metrics = await this.retrieveMemory('long', {
      type: 'performance_metric',
      agentId: this.id
    });

    const aggregated: Record<string, number> = {};
    metrics.forEach((metric: any) => {
      if (!aggregated[metric.data.metric]) {
        aggregated[metric.data.metric] = 0;
      }
      aggregated[metric.data.metric] += metric.data.value;
    });

    return aggregated;
  }

  public async getMemoryStats(): Promise<Record<string, number>> {
    return {
      shortTermItems: this.memory.shortTerm.currentContext.length + 
                     this.memory.shortTerm.activeLeads.length + 
                     this.memory.shortTerm.recentActions.length,
      longTermItems: this.memory.longTerm.customerProfiles.length + 
                    this.memory.longTerm.campaignHistory.length + 
                    this.memory.longTerm.performanceMetrics.length,
      episodicItems: this.memory.episodic.successfulInteractions.length + 
                    this.memory.episodic.problemResolutions.length,
      semanticItems: this.memory.semantic.domainKnowledge.length + 
                    this.memory.semantic.relationships.length
    };
  }
}