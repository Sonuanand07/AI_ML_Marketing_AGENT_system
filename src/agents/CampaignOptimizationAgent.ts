import { BaseAgent } from './BaseAgent';
import { 
  AgentType, 
  AgentAction, 
  ActionResult, 
  Campaign, 
  CampaignMetrics,
  ActionType,
  PerformanceMetric
} from '../types';
import { MCPClient } from '../mcp/MCPClient';
import { WebSocketManager } from '../communication/WebSocketManager';
import { v4 as uuidv4 } from 'uuid';

export class CampaignOptimizationAgent extends BaseAgent {
  private readonly OPTIMIZATION_THRESHOLDS = {
    low_open_rate: 0.15,
    low_click_rate: 0.02,
    high_bounce_rate: 0.05,
    low_conversion_rate: 0.01,
    budget_utilization: 0.8
  };

  private readonly ESCALATION_CRITERIA = {
    critical_performance_drop: 0.5,
    budget_overrun: 1.2,
    negative_sentiment_threshold: -0.3,
    consecutive_failures: 3
  };

  constructor(mcpClient: MCPClient, wsManager: WebSocketManager) {
    super(
      'Campaign Optimization Agent',
      AgentType.CAMPAIGN_OPTIMIZATION,
      [
        'performance_analysis',
        'a_b_testing',
        'budget_optimization',
        'audience_segmentation',
        'predictive_analytics',
        'automated_optimization',
        'escalation_management'
      ],
      mcpClient,
      wsManager
    );
  }

  protected initialize(): void {
    console.log(`${this.name} initialized with capabilities:`, this.capabilities);
    this.loadOptimizationStrategies();
    this.startPerformanceMonitoring();
  }

  public async processAction(action: AgentAction): Promise<ActionResult> {
    this.updateStatus('processing');
    
    try {
      let result: ActionResult;

      switch (action.type) {
        case ActionType.ANALYZE_PERFORMANCE:
          result = await this.analyzeCampaignPerformance(action.payload.campaignId);
          break;
        case ActionType.UPDATE_CAMPAIGN:
          result = await this.optimizeCampaign(action.payload);
          break;
        case ActionType.ESCALATE:
          result = await this.escalateToManager(action.payload);
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

  private async analyzeCampaignPerformance(campaignId: string): Promise<ActionResult> {
    try {
      // Retrieve campaign data
      const campaigns = await this.retrieveMemory('long', {
        type: 'campaign',
        id: campaignId
      });

      if (campaigns.length === 0) {
        return {
          success: false,
          error: 'Campaign not found'
        };
      }

      const campaign = campaigns[0].data;
      const metrics = campaign.metrics;

      // Calculate performance indicators
      const analysis = await this.performDetailedAnalysis(campaign, metrics);
      
      // Generate optimization recommendations
      const recommendations = await this.generateOptimizationRecommendations(analysis);
      
      // Check for escalation criteria
      const escalationNeeded = this.checkEscalationCriteria(analysis);

      // Store analysis results
      await this.storeMemory('long', {
        type: 'performance_analysis',
        data: {
          campaignId,
          analysis,
          recommendations,
          escalationNeeded,
          timestamp: new Date()
        }
      });

      // Auto-apply safe optimizations
      if (!escalationNeeded && recommendations.autoApplicable.length > 0) {
        await this.autoApplyOptimizations(campaignId, recommendations.autoApplicable);
      }

      // Escalate if needed
      if (escalationNeeded) {
        await this.escalateToManager({
          campaignId,
          reason: analysis.escalationReason,
          severity: analysis.severity,
          recommendations: recommendations.manualReview
        });
      }

      return {
        success: true,
        data: {
          analysis,
          recommendations,
          escalationNeeded
        },
        metrics: {
          analysis_confidence: analysis.confidence,
          recommendations_count: recommendations.autoApplicable.length + recommendations.manualReview.length,
          performance_score: analysis.overallScore
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Performance analysis failed'
      };
    }
  }

  private async performDetailedAnalysis(campaign: Campaign, metrics: CampaignMetrics): Promise<any> {
    const analysis = {
      campaignId: campaign.id,
      overallScore: 0,
      confidence: 0.8,
      issues: [] as string[],
      strengths: [] as string[],
      trends: {} as Record<string, number>,
      escalationReason: '',
      severity: 'low' as 'low' | 'medium' | 'high' | 'critical'
    };

    // Calculate rates
    const openRate = metrics.sent > 0 ? metrics.opened / metrics.sent : 0;
    const clickRate = metrics.opened > 0 ? metrics.clicked / metrics.opened : 0;
    const conversionRate = metrics.sent > 0 ? metrics.converted / metrics.sent : 0;
    const bounceRate = metrics.sent > 0 ? metrics.bounced / metrics.sent : 0;

    // Analyze performance against thresholds
    let score = 100;

    if (openRate < this.OPTIMIZATION_THRESHOLDS.low_open_rate) {
      analysis.issues.push('Low open rate detected');
      score -= 20;
    } else if (openRate > 0.25) {
      analysis.strengths.push('Strong open rate performance');
    }

    if (clickRate < this.OPTIMIZATION_THRESHOLDS.low_click_rate) {
      analysis.issues.push('Low click-through rate');
      score -= 15;
    } else if (clickRate > 0.05) {
      analysis.strengths.push('Good engagement rate');
    }

    if (conversionRate < this.OPTIMIZATION_THRESHOLDS.low_conversion_rate) {
      analysis.issues.push('Low conversion rate');
      score -= 25;
    } else if (conversionRate > 0.03) {
      analysis.strengths.push('Excellent conversion performance');
    }

    if (bounceRate > this.OPTIMIZATION_THRESHOLDS.high_bounce_rate) {
      analysis.issues.push('High bounce rate - list quality concern');
      score -= 10;
      analysis.severity = 'medium';
    }

    // Check for escalation criteria
    if (score < 50) {
      analysis.escalationReason = 'Campaign performance below acceptable thresholds';
      analysis.severity = 'high';
    }

    if (conversionRate < this.ESCALATION_CRITERIA.critical_performance_drop * 0.02) {
      analysis.escalationReason = 'Critical performance drop detected';
      analysis.severity = 'critical';
    }

    analysis.overallScore = Math.max(score, 0);
    analysis.trends = {
      openRate,
      clickRate,
      conversionRate,
      bounceRate
    };

    return analysis;
  }

  private async generateOptimizationRecommendations(analysis: any): Promise<any> {
    const recommendations = {
      autoApplicable: [] as any[],
      manualReview: [] as any[]
    };

    // Generate recommendations based on issues
    for (const issue of analysis.issues) {
      const recs = await this.getRecommendationsForIssue(issue, analysis);
      recommendations.autoApplicable.push(...recs.auto);
      recommendations.manualReview.push(...recs.manual);
    }

    // Learn from historical successful optimizations
    const historicalOptimizations = await this.retrieveMemory('episodic', {
      type: 'successful_optimization'
    });

    historicalOptimizations.forEach((opt: any) => {
      if (this.isApplicableOptimization(opt.data, analysis)) {
        recommendations.autoApplicable.push({
          type: 'historical_pattern',
          action: opt.data.action,
          confidence: opt.data.successRate,
          reason: 'Based on previous successful optimization'
        });
      }
    });

    return recommendations;
  }

  private async getRecommendationsForIssue(issue: string, analysis: any): Promise<any> {
    const recommendations = { auto: [], manual: [] };

    switch (issue) {
      case 'Low open rate detected':
        recommendations.auto.push({
          type: 'subject_line_optimization',
          action: 'test_subject_variations',
          confidence: 0.7,
          reason: 'A/B test different subject lines to improve open rates'
        });
        recommendations.manual.push({
          type: 'send_time_optimization',
          action: 'analyze_optimal_send_times',
          reason: 'Manual review of audience timezone and engagement patterns needed'
        });
        break;

      case 'Low click-through rate':
        recommendations.auto.push({
          type: 'cta_optimization',
          action: 'enhance_call_to_action',
          confidence: 0.8,
          reason: 'Optimize call-to-action placement and wording'
        });
        break;

      case 'Low conversion rate':
        recommendations.manual.push({
          type: 'landing_page_review',
          action: 'review_conversion_funnel',
          reason: 'Manual review of landing page and conversion funnel required'
        });
        break;

      case 'High bounce rate - list quality concern':
        recommendations.auto.push({
          type: 'list_cleaning',
          action: 'remove_invalid_emails',
          confidence: 0.9,
          reason: 'Clean email list to improve deliverability'
        });
        break;
    }

    return recommendations;
  }

  private checkEscalationCriteria(analysis: any): boolean {
    return analysis.severity === 'high' || 
           analysis.severity === 'critical' ||
           analysis.overallScore < 40;
  }

  private async autoApplyOptimizations(campaignId: string, optimizations: any[]): Promise<void> {
    for (const optimization of optimizations) {
      try {
        await this.applyOptimization(campaignId, optimization);
        
        // Log successful optimization
        await this.storeMemory('episodic', {
          type: 'successful_optimization',
          data: {
            campaignId,
            optimization,
            timestamp: new Date(),
            appliedBy: this.id
          }
        });

      } catch (error) {
        console.error(`Failed to apply optimization:`, error);
      }
    }
  }

  private async applyOptimization(campaignId: string, optimization: any): Promise<void> {
    // Simulate optimization application
    console.log(`Applying optimization: ${optimization.type} to campaign ${campaignId}`);
    
    // Store optimization action
    await this.storeMemory('short', {
      type: 'optimization_applied',
      data: {
        campaignId,
        optimization,
        timestamp: new Date()
      }
    });
  }

  private async escalateToManager(payload: any): Promise<ActionResult> {
    const escalation = {
      id: uuidv4(),
      campaignId: payload.campaignId,
      agentId: this.id,
      reason: payload.reason,
      severity: payload.severity,
      recommendations: payload.recommendations,
      timestamp: new Date(),
      status: 'pending_review'
    };

    await this.storeMemory('long', {
      type: 'escalation',
      data: escalation
    });

    // Notify system administrators
    await this.wsManager.broadcast({
      type: 'ESCALATION_ALERT',
      agentId: this.id,
      payload: escalation,
      timestamp: new Date()
    });

    return {
      success: true,
      data: escalation,
      metrics: {
        escalation_severity: payload.severity === 'critical' ? 4 : payload.severity === 'high' ? 3 : 2
      }
    };
  }

  private isApplicableOptimization(historicalOpt: any, currentAnalysis: any): boolean {
    // Check if historical optimization is applicable to current situation
    const similarIssues = historicalOpt.context?.issues?.some((issue: string) => 
      currentAnalysis.issues.includes(issue)
    );

    const similarPerformance = Math.abs(
      historicalOpt.context?.overallScore - currentAnalysis.overallScore
    ) < 20;

    return similarIssues && similarPerformance && historicalOpt.successRate > 0.6;
  }

  private async startPerformanceMonitoring(): Promise<void> {
    // Set up continuous monitoring
    setInterval(async () => {
      await this.monitorActiveCampaigns();
    }, 60000); // Monitor every minute
  }

  private async monitorActiveCampaigns(): Promise<void> {
    const activeCampaigns = await this.retrieveMemory('long', {
      type: 'campaign',
      status: 'active'
    });

    for (const campaignData of activeCampaigns) {
      const campaign = campaignData.data;
      
      // Analyze performance
      const action: AgentAction = {
        id: uuidv4(),
        agentId: this.id,
        type: ActionType.ANALYZE_PERFORMANCE,
        target: campaign.id,
        payload: { campaignId: campaign.id },
        timestamp: new Date()
      };

      await this.processAction(action);
    }
  }

  private async loadOptimizationStrategies(): Promise<void> {
    const strategies = [
      {
        name: 'subject_line_ab_testing',
        description: 'Test multiple subject line variations to optimize open rates',
        effectiveness: 0.85,
        applicableMetrics: ['open_rate']
      },
      {
        name: 'send_time_optimization',
        description: 'Optimize email send times based on audience behavior',
        effectiveness: 0.72,
        applicableMetrics: ['open_rate', 'click_rate']
      },
      {
        name: 'content_personalization',
        description: 'Increase personalization to improve engagement',
        effectiveness: 0.88,
        applicableMetrics: ['click_rate', 'conversion_rate']
      },
      {
        name: 'audience_segmentation',
        description: 'Segment audience for more targeted messaging',
        effectiveness: 0.91,
        applicableMetrics: ['conversion_rate', 'unsubscribe_rate']
      }
    ];

    for (const strategy of strategies) {
      await this.storeMemory('semantic', {
        type: 'optimization_strategy',
        data: strategy
      });
    }
  }

  public async generatePerformanceReport(campaignId: string): Promise<any> {
    const analysis = await this.retrieveMemory('long', {
      type: 'performance_analysis',
      campaignId
    });

    if (analysis.length === 0) {
      return {
        error: 'No performance data available for this campaign'
      };
    }

    const latestAnalysis = analysis[analysis.length - 1].data;
    
    const report = {
      campaignId,
      generatedAt: new Date(),
      overallScore: latestAnalysis.analysis.overallScore,
      keyMetrics: latestAnalysis.analysis.trends,
      issues: latestAnalysis.analysis.issues,
      strengths: latestAnalysis.analysis.strengths,
      recommendations: latestAnalysis.recommendations,
      optimizationsApplied: await this.getAppliedOptimizations(campaignId),
      nextReviewDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
    };

    return report;
  }

  private async getAppliedOptimizations(campaignId: string): Promise<any[]> {
    const optimizations = await this.retrieveMemory('short', {
      type: 'optimization_applied',
      campaignId
    });

    return optimizations.map((opt: any) => opt.data);
  }

  public async predictCampaignOutcome(campaignData: Partial<Campaign>): Promise<any> {
    // Use historical data and machine learning patterns to predict outcomes
    const historicalCampaigns = await this.retrieveMemory('long', {
      type: 'campaign'
    });

    const similarCampaigns = historicalCampaigns.filter((camp: any) => 
      camp.data.type === campaignData.type &&
      this.calculateSimilarity(camp.data, campaignData) > 0.7
    );

    if (similarCampaigns.length === 0) {
      return {
        prediction: 'insufficient_data',
        confidence: 0.1,
        expectedMetrics: this.getDefaultExpectedMetrics()
      };
    }

    // Calculate average performance of similar campaigns
    const avgMetrics = this.calculateAverageMetrics(similarCampaigns);
    
    const prediction = {
      expectedOpenRate: avgMetrics.openRate,
      expectedClickRate: avgMetrics.clickRate,
      expectedConversionRate: avgMetrics.conversionRate,
      expectedRevenue: avgMetrics.revenue,
      confidence: Math.min(similarCampaigns.length / 10, 0.9),
      basedOnCampaigns: similarCampaigns.length,
      riskFactors: await this.identifyRiskFactors(campaignData, avgMetrics)
    };

    return prediction;
  }

  private calculateSimilarity(campaign1: Campaign, campaign2: Partial<Campaign>): number {
    let similarity = 0;
    let factors = 0;

    // Type similarity
    if (campaign1.type === campaign2.type) {
      similarity += 0.4;
    }
    factors++;

    // Audience size similarity
    if (campaign1.targetAudience && campaign2.targetAudience) {
      const sizeDiff = Math.abs(campaign1.targetAudience.length - campaign2.targetAudience.length);
      const maxSize = Math.max(campaign1.targetAudience.length, campaign2.targetAudience.length);
      similarity += (1 - sizeDiff / maxSize) * 0.3;
      factors++;
    }

    // Budget similarity
    if (campaign1.budget && campaign2.budget) {
      const budgetDiff = Math.abs(campaign1.budget - campaign2.budget);
      const maxBudget = Math.max(campaign1.budget, campaign2.budget);
      similarity += (1 - budgetDiff / maxBudget) * 0.3;
      factors++;
    }

    return factors > 0 ? similarity / factors : 0;
  }

  private calculateAverageMetrics(campaigns: any[]): any {
    const totals = {
      openRate: 0,
      clickRate: 0,
      conversionRate: 0,
      revenue: 0
    };

    campaigns.forEach((camp: any) => {
      const metrics = camp.data.metrics;
      totals.openRate += metrics.sent > 0 ? metrics.opened / metrics.sent : 0;
      totals.clickRate += metrics.opened > 0 ? metrics.clicked / metrics.opened : 0;
      totals.conversionRate += metrics.sent > 0 ? metrics.converted / metrics.sent : 0;
      totals.revenue += metrics.revenue;
    });

    const count = campaigns.length;
    return {
      openRate: totals.openRate / count,
      clickRate: totals.clickRate / count,
      conversionRate: totals.conversionRate / count,
      revenue: totals.revenue / count
    };
  }

  private getDefaultExpectedMetrics(): any {
    return {
      openRate: 0.22,
      clickRate: 0.035,
      conversionRate: 0.015,
      revenue: 1000
    };
  }

  private async identifyRiskFactors(campaignData: Partial<Campaign>, avgMetrics: any): Promise<string[]> {
    const risks: string[] = [];

    // Analyze potential risks based on campaign characteristics
    if (campaignData.budget && campaignData.budget > avgMetrics.revenue * 2) {
      risks.push('High budget relative to expected revenue');
    }

    if (campaignData.targetAudience && campaignData.targetAudience.length > 10000) {
      risks.push('Large audience size may reduce personalization effectiveness');
    }

    // Check for seasonal factors, market conditions, etc.
    const currentMonth = new Date().getMonth();
    if ([11, 0].includes(currentMonth)) { // December, January
      risks.push('Holiday season may impact engagement rates');
    }

    return risks;
  }

  public async getOptimizationMetrics(): Promise<Record<string, number>> {
    const optimizations = await this.retrieveMemory('episodic', {
      type: 'successful_optimization'
    });

    const escalations = await this.retrieveMemory('long', {
      type: 'escalation'
    });

    return {
      totalOptimizations: optimizations.length,
      successfulOptimizations: optimizations.filter((opt: any) => opt.data.successRate > 0.6).length,
      totalEscalations: escalations.length,
      criticalEscalations: escalations.filter((esc: any) => esc.data.severity === 'critical').length,
      averageOptimizationImpact: this.calculateAverageImpact(optimizations),
      automationRate: optimizations.length > 0 ? 
        optimizations.filter((opt: any) => opt.data.automated).length / optimizations.length : 0
    };
  }

  private calculateAverageImpact(optimizations: any[]): number {
    if (optimizations.length === 0) return 0;
    
    const impacts = optimizations
      .filter((opt: any) => opt.data.impact !== undefined)
      .map((opt: any) => opt.data.impact);
    
    return impacts.length > 0 ? 
      impacts.reduce((sum, impact) => sum + impact, 0) / impacts.length : 0;
  }

  private async optimizeCampaign(payload: any): Promise<ActionResult> {
    const { campaignId, optimizations } = payload;
    
    try {
      const results = [];
      
      for (const optimization of optimizations) {
        const result = await this.applyOptimization(campaignId, optimization);
        results.push(result);
      }

      return {
        success: true,
        data: {
          campaignId,
          optimizationsApplied: results.length,
          results
        },
        metrics: {
          optimization_count: results.length,
          success_rate: results.filter(r => r.success).length / results.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Campaign optimization failed'
      };
    }
  }
}