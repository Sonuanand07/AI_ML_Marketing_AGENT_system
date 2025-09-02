import { BaseAgent } from './BaseAgent';
import { 
  AgentType, 
  AgentAction, 
  ActionResult, 
  Lead, 
  Campaign, 
  CampaignType, 
  CampaignStatus,
  ActionType,
  Interaction,
  InteractionType,
  InteractionOutcome
} from '../types';
import { MCPClient } from '../mcp/MCPClient';
import { WebSocketManager } from '../communication/WebSocketManager';
import { v4 as uuidv4 } from 'uuid';

export class EngagementAgent extends BaseAgent {
  private readonly PERSONALIZATION_TEMPLATES = {
    welcome: 'Hi {name}, welcome to {company}! We noticed you\'re interested in {topic}.',
    followup: 'Hi {name}, following up on your interest in {topic}. Here\'s some additional information...',
    nurture: 'Hi {name}, thought you might find this {content_type} about {topic} valuable.',
    conversion: 'Hi {name}, based on your engagement with {previous_content}, you might be ready for {next_step}.'
  };

  constructor(mcpClient: MCPClient, wsManager: WebSocketManager) {
    super(
      'Engagement Agent',
      AgentType.ENGAGEMENT,
      [
        'email_campaigns',
        'personalization',
        'lead_nurturing',
        'social_media_engagement',
        'content_recommendation',
        'followup_scheduling',
        'sentiment_analysis'
      ],
      mcpClient,
      wsManager
    );
  }

  protected initialize(): void {
    console.log(`${this.name} initialized with capabilities:`, this.capabilities);
    this.loadEngagementStrategies();
    this.setupMessageHandlers();
  }

  public async processAction(action: AgentAction): Promise<ActionResult> {
    this.updateStatus('processing');
    
    try {
      let result: ActionResult;

      switch (action.type) {
        case ActionType.SEND_EMAIL:
          result = await this.sendPersonalizedEmail(action.payload);
          break;
        case ActionType.SCHEDULE_FOLLOWUP:
          result = await this.scheduleFollowup(action.payload);
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

  private async sendPersonalizedEmail(payload: any): Promise<ActionResult> {
    const { lead, campaignType, customMessage } = payload;
    
    try {
      // Retrieve customer preferences and history
      const customerHistory = await this.retrieveMemory('long', {
        type: 'customer_profile',
        email: lead.email
      });

      // Generate personalized content
      const personalizedContent = await this.generatePersonalizedContent(
        lead, 
        campaignType, 
        customerHistory,
        customMessage
      );

      // Simulate email sending
      const emailResult = await this.simulateEmailSend(lead, personalizedContent);

      // Store interaction
      const interaction: Interaction = {
        id: uuidv4(),
        customerId: lead.id,
        agentId: this.id,
        type: InteractionType.EMAIL,
        content: personalizedContent.body,
        outcome: emailResult.delivered ? InteractionOutcome.POSITIVE : InteractionOutcome.NEGATIVE,
        sentiment: 0.7, // Positive sentiment for outreach
        timestamp: new Date(),
        metadata: {
          subject: personalizedContent.subject,
          campaignType,
          deliveryStatus: emailResult.status
        }
      };

      await this.storeMemory('long', {
        type: 'interaction',
        data: interaction
      });

      // Update lead status
      await this.updateLeadStatus(lead.id, LeadStatus.CONTACTED);

      return {
        success: emailResult.delivered,
        data: {
          interaction,
          deliveryStatus: emailResult.status,
          personalizedContent
        },
        metrics: {
          personalization_score: personalizedContent.personalizationScore,
          delivery_time: emailResult.deliveryTime,
          content_length: personalizedContent.body.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Email sending failed'
      };
    }
  }

  private async generatePersonalizedContent(
    lead: Lead, 
    campaignType: string, 
    customerHistory: any[],
    customMessage?: string
  ): Promise<any> {
    // Analyze customer preferences from history
    const preferences = this.analyzeCustomerPreferences(customerHistory);
    
    // Select appropriate template
    const template = this.selectTemplate(campaignType, preferences);
    
    // Generate personalized content
    const personalizationTokens = {
      name: lead.name || 'there',
      company: 'Purple Merit Technologies',
      topic: this.inferTopicOfInterest(lead, customerHistory),
      content_type: preferences.preferredContentType || 'article',
      previous_content: preferences.lastEngagedContent || 'our services',
      next_step: this.suggestNextStep(lead, preferences)
    };

    const personalizedContent = {
      subject: this.personalizeText(template.subject, personalizationTokens),
      body: customMessage || this.personalizeText(template.body, personalizationTokens),
      callToAction: this.personalizeText(template.callToAction, personalizationTokens),
      personalizationScore: this.calculatePersonalizationScore(personalizationTokens, customerHistory)
    };

    return personalizedContent;
  }

  private analyzeCustomerPreferences(history: any[]): any {
    const preferences = {
      preferredContentType: 'article',
      communicationFrequency: 'weekly',
      topicsOfInterest: ['technology', 'marketing'],
      lastEngagedContent: 'product demo',
      responseRate: 0.3
    };

    // Analyze historical interactions
    history.forEach((item: any) => {
      if (item.data?.type === 'interaction') {
        const interaction = item.data.data;
        if (interaction.outcome === InteractionOutcome.POSITIVE) {
          // Extract successful patterns
          preferences.responseRate += 0.1;
        }
      }
    });

    return preferences;
  }

  private selectTemplate(campaignType: string, preferences: any): any {
    const templates = {
      welcome: {
        subject: 'Welcome to {company}, {name}!',
        body: this.PERSONALIZATION_TEMPLATES.welcome,
        callToAction: 'Schedule a demo to learn more'
      },
      followup: {
        subject: 'Following up on your interest, {name}',
        body: this.PERSONALIZATION_TEMPLATES.followup,
        callToAction: 'Reply to continue the conversation'
      },
      nurture: {
        subject: 'Thought you\'d find this interesting, {name}',
        body: this.PERSONALIZATION_TEMPLATES.nurture,
        callToAction: 'Read the full {content_type}'
      },
      conversion: {
        subject: 'Ready for the next step, {name}?',
        body: this.PERSONALIZATION_TEMPLATES.conversion,
        callToAction: 'Schedule your {next_step}'
      }
    };

    return templates[campaignType as keyof typeof templates] || templates.welcome;
  }

  private personalizeText(template: string, tokens: Record<string, string>): string {
    let personalized = template;
    
    Object.entries(tokens).forEach(([key, value]) => {
      const regex = new RegExp(`{${key}}`, 'g');
      personalized = personalized.replace(regex, value);
    });

    return personalized;
  }

  private inferTopicOfInterest(lead: Lead, history: any[]): string {
    // Analyze lead source and metadata to infer interests
    const topics = ['AI/ML solutions', 'marketing automation', 'data analytics', 'customer engagement'];
    
    if (lead.source?.includes('ai')) return 'AI/ML solutions';
    if (lead.source?.includes('marketing')) return 'marketing automation';
    
    return topics[Math.floor(Math.random() * topics.length)];
  }

  private suggestNextStep(lead: Lead, preferences: any): string {
    const nextSteps = ['consultation call', 'product demo', 'free trial', 'case study review'];
    
    if (lead.score > 80) return 'consultation call';
    if (lead.score > 60) return 'product demo';
    
    return nextSteps[Math.floor(Math.random() * nextSteps.length)];
  }

  private calculatePersonalizationScore(tokens: Record<string, string>, history: any[]): number {
    let score = 50; // Base score
    
    // Increase score based on personalization depth
    if (tokens.name !== 'there') score += 20;
    if (tokens.company) score += 15;
    if (history.length > 0) score += 15;
    
    return Math.min(score, 100);
  }

  private async simulateEmailSend(lead: Lead, content: any): Promise<any> {
    // Simulate email delivery with realistic delays and success rates
    const deliveryTime = Math.random() * 2000 + 500; // 500-2500ms
    const successRate = 0.95; // 95% delivery success rate
    
    await new Promise(resolve => setTimeout(resolve, deliveryTime));
    
    const delivered = Math.random() < successRate;
    
    return {
      delivered,
      status: delivered ? 'delivered' : 'failed',
      deliveryTime,
      messageId: uuidv4()
    };
  }

  private async updateLeadStatus(leadId: string, status: LeadStatus): Promise<void> {
    await this.storeMemory('short', {
      type: 'lead_status_update',
      data: {
        leadId,
        status,
        updatedBy: this.id,
        timestamp: new Date()
      }
    });
  }

  private async scheduleFollowup(payload: any): Promise<ActionResult> {
    const { leadId, delay, message } = payload;
    
    try {
      const followup = {
        id: uuidv4(),
        leadId,
        agentId: this.id,
        scheduledFor: new Date(Date.now() + delay),
        message,
        status: 'scheduled',
        createdAt: new Date()
      };

      await this.storeMemory('short', {
        type: 'scheduled_followup',
        data: followup
      });

      return {
        success: true,
        data: followup,
        metrics: {
          delay_hours: delay / (1000 * 60 * 60),
          message_length: message.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Followup scheduling failed'
      };
    }
  }

  private setupMessageHandlers(): void {
    // Handle messages from other agents
    this.wsManager.onMessage((message: any) => {
      if (message.targetAgentId === this.id || message.targetAgentId === 'engagement_agent') {
        this.handleIncomingMessage(message);
      }
    });
  }

  private async handleIncomingMessage(message: any): Promise<void> {
    switch (message.payload.type) {
      case 'new_qualified_lead':
        await this.processNewQualifiedLead(message.payload.lead, message.payload.triageNotes);
        break;
      case 'campaign_performance_update':
        await this.processCampaignUpdate(message.payload);
        break;
    }
  }

  private async processNewQualifiedLead(lead: Lead, triageNotes: any): Promise<void> {
    // Automatically initiate engagement based on triage recommendations
    const action: AgentAction = {
      id: uuidv4(),
      agentId: this.id,
      type: ActionType.SEND_EMAIL,
      target: lead.id,
      payload: {
        lead,
        campaignType: this.mapApproachToCampaign(triageNotes.recommendedApproach),
        urgency: lead.score > 80 ? 'high' : 'normal'
      },
      timestamp: new Date()
    };

    await this.processAction(action);
  }

  private mapApproachToCampaign(approach: string): string {
    const mapping: Record<string, string> = {
      'immediate_personal_outreach': 'welcome',
      'targeted_email_sequence': 'nurture',
      'educational_content_series': 'nurture',
      'nurture_campaign': 'followup'
    };

    return mapping[approach] || 'welcome';
  }

  private async processCampaignUpdate(payload: any): Promise<void> {
    // Update engagement strategies based on campaign performance
    await this.storeMemory('long', {
      type: 'campaign_performance',
      data: payload
    });

    // Learn from performance data
    if (payload.metrics.conversionRate > 0.1) {
      await this.storeMemory('semantic', {
        type: 'successful_strategy',
        data: {
          strategy: payload.strategy,
          performance: payload.metrics,
          context: payload.context
        }
      });
    }
  }

  private async loadEngagementStrategies(): Promise<void> {
    const strategies = [
      {
        name: 'value_first_approach',
        description: 'Lead with value proposition before asking for anything',
        effectiveness: 0.85,
        applicableScenarios: ['cold_outreach', 'first_contact']
      },
      {
        name: 'social_proof_integration',
        description: 'Include testimonials and case studies in communications',
        effectiveness: 0.78,
        applicableScenarios: ['nurture_campaigns', 'conversion_focused']
      },
      {
        name: 'problem_solution_fit',
        description: 'Align messaging with specific customer pain points',
        effectiveness: 0.92,
        applicableScenarios: ['qualified_leads', 'demo_requests']
      }
    ];

    for (const strategy of strategies) {
      await this.storeMemory('semantic', {
        type: 'engagement_strategy',
        data: strategy
      });
    }
  }

  public async getEngagementMetrics(): Promise<Record<string, number>> {
    const interactions = await this.retrieveMemory('long', {
      type: 'interaction',
      agentId: this.id
    });

    const metrics = {
      totalEmails: 0,
      emailsDelivered: 0,
      emailsOpened: 0,
      emailsClicked: 0,
      responseRate: 0,
      conversionRate: 0,
      averageSentiment: 0,
      followupsScheduled: 0
    };

    let totalSentiment = 0;
    let positiveOutcomes = 0;
    let conversions = 0;

    interactions.forEach((item: any) => {
      const interaction = item.data;
      
      if (interaction.type === InteractionType.EMAIL) {
        metrics.totalEmails++;
        
        if (interaction.metadata?.deliveryStatus === 'delivered') {
          metrics.emailsDelivered++;
        }
        
        totalSentiment += interaction.sentiment;
        
        if (interaction.outcome === InteractionOutcome.POSITIVE) {
          positiveOutcomes++;
        }
        
        if (interaction.outcome === InteractionOutcome.CONVERSION) {
          conversions++;
        }
      }
    });

    if (metrics.totalEmails > 0) {
      metrics.responseRate = positiveOutcomes / metrics.totalEmails;
      metrics.conversionRate = conversions / metrics.totalEmails;
      metrics.averageSentiment = totalSentiment / metrics.totalEmails;
    }

    // Get scheduled followups
    const followups = await this.retrieveMemory('short', {
      type: 'scheduled_followup'
    });
    metrics.followupsScheduled = followups.length;

    return metrics;
  }

  public async createCampaign(campaignData: Partial<Campaign>): Promise<Campaign> {
    const campaign: Campaign = {
      id: uuidv4(),
      name: campaignData.name || 'Untitled Campaign',
      type: campaignData.type || CampaignType.EMAIL,
      status: CampaignStatus.DRAFT,
      targetAudience: campaignData.targetAudience || [],
      content: campaignData.content || {
        body: '',
        callToAction: '',
        personalizationTokens: []
      },
      metrics: {
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        converted: 0,
        bounced: 0,
        unsubscribed: 0,
        revenue: 0
      },
      startDate: campaignData.startDate || new Date(),
      endDate: campaignData.endDate,
      budget: campaignData.budget || 0,
      createdBy: this.id
    };

    await this.storeMemory('long', {
      type: 'campaign',
      data: campaign
    });

    return campaign;
  }

  public async optimizeEngagementTiming(leadId: string): Promise<Date> {
    // Analyze historical engagement patterns
    const history = await this.retrieveMemory('long', {
      type: 'interaction',
      customerId: leadId
    });

    // Default to business hours if no history
    if (history.length === 0) {
      const now = new Date();
      const businessHour = new Date(now);
      businessHour.setHours(10, 0, 0, 0); // 10 AM
      return businessHour;
    }

    // Find optimal engagement times from successful interactions
    const successfulTimes = history
      .filter((item: any) => item.data.outcome === InteractionOutcome.POSITIVE)
      .map((item: any) => new Date(item.data.timestamp).getHours());

    const optimalHour = successfulTimes.length > 0 
      ? Math.round(successfulTimes.reduce((a, b) => a + b, 0) / successfulTimes.length)
      : 10;

    const optimalTime = new Date();
    optimalTime.setHours(optimalHour, 0, 0, 0);
    
    return optimalTime;
  }
}