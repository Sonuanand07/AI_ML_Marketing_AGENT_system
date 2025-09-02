import { BaseAgent } from './BaseAgent';
import { AgentType, AgentAction, ActionResult, Lead, LeadCategory, LeadStatus, ActionType } from '../types';
import { MCPClient } from '../mcp/MCPClient';
import { WebSocketManager } from '../communication/WebSocketManager';

export class LeadTriageAgent extends BaseAgent {
  private readonly SCORING_WEIGHTS = {
    email_domain: 0.2,
    company_size: 0.3,
    source_quality: 0.25,
    engagement_history: 0.25
  };

  constructor(mcpClient: MCPClient, wsManager: WebSocketManager) {
    super(
      'Lead Triage Agent',
      AgentType.LEAD_TRIAGE,
      [
        'lead_categorization',
        'lead_scoring',
        'priority_assessment',
        'data_enrichment',
        'duplicate_detection'
      ],
      mcpClient,
      wsManager
    );
  }

  protected initialize(): void {
    console.log(`${this.name} initialized with capabilities:`, this.capabilities);
    this.loadDomainKnowledge();
  }

  public async processAction(action: AgentAction): Promise<ActionResult> {
    this.updateStatus('processing');
    
    try {
      let result: ActionResult;

      switch (action.type) {
        case ActionType.CATEGORIZE_LEAD:
          result = await this.categorizeLead(action.payload.lead);
          break;
        default:
          result = {
            success: false,
            error: `Unsupported action type: ${action.type}`
          };
      }

      await this.logAction(action, result);
      await this.learnFromOutcome(action, result);
      
      this.updateStatus('idle');
      return result;

    } catch (error) {
      const errorResult: ActionResult = {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      
      await this.logAction(action, errorResult);
      this.updateStatus('error');
      return errorResult;
    }
  }

  private async categorizeLead(lead: Partial<Lead>): Promise<ActionResult> {
    try {
      // Enrich lead data
      const enrichedLead = await this.enrichLeadData(lead);
      
      // Score the lead
      const score = await this.scoreLead(enrichedLead);
      
      // Categorize based on score and other factors
      const category = await this.determinateCategory(enrichedLead, score);
      
      // Check for duplicates
      const isDuplicate = await this.checkDuplicate(enrichedLead);
      
      const processedLead: Lead = {
        id: enrichedLead.id || this.generateLeadId(),
        email: enrichedLead.email!,
        name: enrichedLead.name || 'Unknown',
        company: enrichedLead.company,
        source: enrichedLead.source || 'unknown',
        category,
        score,
        status: isDuplicate ? LeadStatus.LOST : LeadStatus.NEW,
        metadata: {
          ...enrichedLead.metadata,
          isDuplicate,
          processingTimestamp: new Date(),
          triageAgent: this.id
        },
        createdAt: enrichedLead.createdAt || new Date(),
        updatedAt: new Date()
      };

      // Store in memory
      await this.storeMemory('short', {
        type: 'processed_lead',
        data: processedLead
      });

      // Notify engagement agent if lead is qualified
      if (category !== LeadCategory.COLD_LEAD && !isDuplicate) {
        await this.handoffToEngagementAgent(processedLead);
      }

      return {
        success: true,
        data: processedLead,
        metrics: {
          processing_time: Date.now() - (enrichedLead.createdAt?.getTime() || Date.now()),
          lead_score: score,
          category_confidence: this.getCategoryConfidence(category)
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Lead categorization failed'
      };
    }
  }

  private async enrichLeadData(lead: Partial<Lead>): Promise<Partial<Lead>> {
    // Simulate data enrichment from external sources
    const enriched = { ...lead };
    
    if (lead.email) {
      const domain = lead.email.split('@')[1];
      enriched.metadata = {
        ...enriched.metadata,
        emailDomain: domain,
        domainType: this.classifyEmailDomain(domain)
      };
    }

    // Retrieve historical data if available
    const historicalData = await this.retrieveMemory('long', {
      type: 'customer_profile',
      email: lead.email
    });

    if (historicalData.length > 0) {
      enriched.metadata = {
        ...enriched.metadata,
        hasHistory: true,
        previousInteractions: historicalData.length
      };
    }

    return enriched;
  }

  private async scoreLead(lead: Partial<Lead>): Promise<number> {
    let score = 0;

    // Email domain scoring
    const domainType = lead.metadata?.domainType;
    if (domainType === 'business') score += this.SCORING_WEIGHTS.email_domain * 100;
    else if (domainType === 'personal') score += this.SCORING_WEIGHTS.email_domain * 50;

    // Company size scoring (simulated)
    if (lead.company) {
      score += this.SCORING_WEIGHTS.company_size * 80;
    }

    // Source quality scoring
    const sourceScore = this.getSourceQualityScore(lead.source || 'unknown');
    score += this.SCORING_WEIGHTS.source_quality * sourceScore;

    // Engagement history scoring
    const hasHistory = lead.metadata?.hasHistory || false;
    if (hasHistory) {
      score += this.SCORING_WEIGHTS.engagement_history * 90;
    }

    return Math.min(Math.max(score, 0), 100);
  }

  private async determinateCategory(lead: Partial<Lead>, score: number): Promise<LeadCategory> {
    // Use learned patterns from semantic memory
    const patterns = await this.retrieveMemory('semantic', {
      type: 'categorization_pattern'
    });

    // Apply business rules
    if (score >= 80) return LeadCategory.HOT_PROSPECT;
    if (score >= 60) return LeadCategory.CAMPAIGN_QUALIFIED;
    if (score >= 40) return LeadCategory.GENERAL_INQUIRY;
    
    return LeadCategory.COLD_LEAD;
  }

  private async checkDuplicate(lead: Partial<Lead>): Promise<boolean> {
    const existingLeads = await this.retrieveMemory('long', {
      type: 'customer_profile',
      email: lead.email
    });

    return existingLeads.length > 0;
  }

  private classifyEmailDomain(domain: string): string {
    const businessDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
    return businessDomains.includes(domain) ? 'personal' : 'business';
  }

  private getSourceQualityScore(source: string): number {
    const sourceScores: Record<string, number> = {
      'website_form': 90,
      'referral': 85,
      'social_media': 70,
      'cold_outreach': 40,
      'purchased_list': 30,
      'unknown': 20
    };

    return sourceScores[source] || 20;
  }

  private getCategoryConfidence(category: LeadCategory): number {
    // Simulate confidence based on historical accuracy
    const confidenceMap: Record<LeadCategory, number> = {
      [LeadCategory.HOT_PROSPECT]: 0.95,
      [LeadCategory.CAMPAIGN_QUALIFIED]: 0.85,
      [LeadCategory.GENERAL_INQUIRY]: 0.75,
      [LeadCategory.COLD_LEAD]: 0.80,
      [LeadCategory.EXISTING_CUSTOMER]: 0.99
    };

    return confidenceMap[category] || 0.5;
  }

  private generateLeadId(): string {
    return `lead_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async handoffToEngagementAgent(lead: Lead): Promise<void> {
    await this.sendMessage('engagement_agent', {
      type: 'new_qualified_lead',
      lead,
      triageNotes: {
        score: lead.score,
        category: lead.category,
        recommendedApproach: this.getRecommendedApproach(lead)
      }
    });
  }

  private getRecommendedApproach(lead: Lead): string {
    switch (lead.category) {
      case LeadCategory.HOT_PROSPECT:
        return 'immediate_personal_outreach';
      case LeadCategory.CAMPAIGN_QUALIFIED:
        return 'targeted_email_sequence';
      case LeadCategory.GENERAL_INQUIRY:
        return 'educational_content_series';
      default:
        return 'nurture_campaign';
    }
  }

  private async loadDomainKnowledge(): Promise<void> {
    const domainKnowledge = [
      {
        concept: 'lead_qualification',
        description: 'Process of evaluating leads based on fit and intent',
        category: 'sales_process'
      },
      {
        concept: 'lead_scoring',
        description: 'Numerical assessment of lead quality and conversion probability',
        category: 'analytics'
      },
      {
        concept: 'lead_nurturing',
        description: 'Process of developing relationships with buyers at every stage',
        category: 'marketing_strategy'
      }
    ];

    for (const knowledge of domainKnowledge) {
      await this.storeMemory('semantic', {
        type: 'domain_knowledge',
        data: knowledge
      });
    }
  }

  public async getTriageStats(): Promise<Record<string, number>> {
    const recentActions = await this.retrieveMemory('episodic', {
      type: 'action_log',
      agentId: this.id
    });

    const stats = {
      totalProcessed: 0,
      hotProspects: 0,
      campaignQualified: 0,
      generalInquiries: 0,
      coldLeads: 0,
      duplicatesFound: 0,
      averageScore: 0
    };

    let totalScore = 0;

    recentActions.forEach((action: any) => {
      if (action.data.action.type === ActionType.CATEGORIZE_LEAD && action.data.result.success) {
        stats.totalProcessed++;
        const lead = action.data.result.data;
        
        switch (lead.category) {
          case LeadCategory.HOT_PROSPECT:
            stats.hotProspects++;
            break;
          case LeadCategory.CAMPAIGN_QUALIFIED:
            stats.campaignQualified++;
            break;
          case LeadCategory.GENERAL_INQUIRY:
            stats.generalInquiries++;
            break;
          case LeadCategory.COLD_LEAD:
            stats.coldLeads++;
            break;
        }

        if (lead.metadata?.isDuplicate) {
          stats.duplicatesFound++;
        }

        totalScore += lead.score;
      }
    });

    stats.averageScore = stats.totalProcessed > 0 ? totalScore / stats.totalProcessed : 0;

    return stats;
  }
}