import { 
  AgentMemory, 
  ShortTermMemory, 
  LongTermMemory, 
  EpisodicMemory, 
  SemanticMemory,
  LearningPattern,
  KnowledgeNode,
  Relationship
} from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MemoryManager {
  private agentId: string;
  private memory: AgentMemory;
  private readonly MAX_SHORT_TERM_ITEMS = 100;
  private readonly CONSOLIDATION_THRESHOLD = 50;
  private readonly MEMORY_DECAY_FACTOR = 0.95;

  constructor(agentId: string) {
    this.agentId = agentId;
    this.memory = this.initializeMemory();
  }

  private initializeMemory(): AgentMemory {
    return {
      shortTerm: {
        currentContext: [],
        activeLeads: [],
        recentActions: [],
        workingMemory: {}
      },
      longTerm: {
        customerProfiles: [],
        campaignHistory: [],
        performanceMetrics: [],
        learningPatterns: []
      },
      episodic: {
        successfulInteractions: [],
        problemResolutions: [],
        decisionOutcomes: [],
        contextualLearnings: []
      },
      semantic: {
        domainKnowledge: [],
        relationships: [],
        concepts: [],
        rules: []
      }
    };
  }

  public getMemory(): AgentMemory {
    return this.memory;
  }

  public async store(type: 'short' | 'long' | 'episodic' | 'semantic', data: any): Promise<void> {
    const timestamp = new Date();
    const memoryItem = {
      id: uuidv4(),
      agentId: this.agentId,
      timestamp,
      ...data
    };

    switch (type) {
      case 'short':
        await this.storeShortTerm(memoryItem);
        break;
      case 'long':
        await this.storeLongTerm(memoryItem);
        break;
      case 'episodic':
        await this.storeEpisodic(memoryItem);
        break;
      case 'semantic':
        await this.storeSemantic(memoryItem);
        break;
    }

    // Check if consolidation is needed
    if (this.shouldConsolidate()) {
      await this.consolidate();
    }
  }

  private async storeShortTerm(item: any): Promise<void> {
    switch (item.type) {
      case 'conversation_context':
        this.memory.shortTerm.currentContext.push(item.data);
        break;
      case 'active_lead':
      case 'processed_lead':
        this.memory.shortTerm.activeLeads.push(item.data);
        break;
      case 'recent_action':
        this.memory.shortTerm.recentActions.push(item.data);
        break;
      default:
        this.memory.shortTerm.workingMemory[item.type] = item.data;
    }

    // Maintain size limits
    await this.enforceShortTermLimits();
  }

  private async storeLongTerm(item: any): Promise<void> {
    switch (item.type) {
      case 'customer_profile':
        this.memory.longTerm.customerProfiles.push(item.data);
        break;
      case 'campaign':
        this.memory.longTerm.campaignHistory.push(item.data);
        break;
      case 'performance_metric':
        this.memory.longTerm.performanceMetrics.push(item.data);
        break;
      case 'learning_pattern':
        this.memory.longTerm.learningPatterns.push(item.data);
        break;
    }
  }

  private async storeEpisodic(item: any): Promise<void> {
    switch (item.type) {
      case 'interaction':
      case 'successful_interaction':
        this.memory.episodic.successfulInteractions.push(item.data);
        break;
      case 'problem_resolution':
        this.memory.episodic.problemResolutions.push(item.data);
        break;
      case 'decision_outcome':
      case 'learning_outcome':
        this.memory.episodic.decisionOutcomes.push(item.data);
        break;
      case 'contextual_learning':
        this.memory.episodic.contextualLearnings.push(item.data);
        break;
    }
  }

  private async storeSemantic(item: any): Promise<void> {
    switch (item.type) {
      case 'domain_knowledge':
        this.memory.semantic.domainKnowledge.push(item.data);
        break;
      case 'relationship':
        this.memory.semantic.relationships.push(item.data);
        break;
      case 'concept':
        this.memory.semantic.concepts.push(item.data);
        break;
      case 'business_rule':
      case 'learning_pattern':
      case 'optimization_strategy':
      case 'engagement_strategy':
        this.memory.semantic.rules.push(item.data);
        break;
    }
  }

  public async retrieve(type: 'short' | 'long' | 'episodic' | 'semantic', query: any): Promise<any[]> {
    let results: any[] = [];

    switch (type) {
      case 'short':
        results = await this.retrieveShortTerm(query);
        break;
      case 'long':
        results = await this.retrieveLongTerm(query);
        break;
      case 'episodic':
        results = await this.retrieveEpisodic(query);
        break;
      case 'semantic':
        results = await this.retrieveSemantic(query);
        break;
    }

    // Apply relevance scoring and ranking
    return this.rankByRelevance(results, query);
  }

  private async retrieveShortTerm(query: any): Promise<any[]> {
    const results: any[] = [];

    // Search current context
    if (query.type === 'conversation_context') {
      results.push(...this.memory.shortTerm.currentContext.map(item => ({ data: item, type: 'context' })));
    }

    // Search active leads
    if (query.type === 'active_lead' || query.leadId) {
      const matchingLeads = this.memory.shortTerm.activeLeads.filter(lead => 
        !query.leadId || lead.id === query.leadId
      );
      results.push(...matchingLeads.map(item => ({ data: item, type: 'lead' })));
    }

    // Search recent actions
    if (query.type === 'recent_action' || query.agentId) {
      const matchingActions = this.memory.shortTerm.recentActions.filter(action => 
        !query.agentId || action.agentId === query.agentId
      );
      results.push(...matchingActions.map(item => ({ data: item, type: 'action' })));
    }

    // Search working memory
    if (query.type && this.memory.shortTerm.workingMemory[query.type]) {
      results.push({ data: this.memory.shortTerm.workingMemory[query.type], type: query.type });
    }

    return results;
  }

  private async retrieveLongTerm(query: any): Promise<any[]> {
    const results: any[] = [];

    // Search customer profiles
    if (query.type === 'customer_profile' || query.email) {
      const matchingProfiles = this.memory.longTerm.customerProfiles.filter(profile => 
        !query.email || profile.email === query.email
      );
      results.push(...matchingProfiles.map(item => ({ data: item, type: 'customer_profile' })));
    }

    // Search campaign history
    if (query.type === 'campaign' || query.campaignId || query.id) {
      const matchingCampaigns = this.memory.longTerm.campaignHistory.filter(campaign => 
        (!query.campaignId || campaign.id === query.campaignId) &&
        (!query.id || campaign.id === query.id) &&
        (!query.status || campaign.status === query.status)
      );
      results.push(...matchingCampaigns.map(item => ({ data: item, type: 'campaign' })));
    }

    // Search performance metrics
    if (query.type === 'performance_metric' || query.agentId) {
      const matchingMetrics = this.memory.longTerm.performanceMetrics.filter(metric => 
        !query.agentId || metric.agentId === query.agentId
      );
      results.push(...matchingMetrics.map(item => ({ data: item, type: 'performance_metric' })));
    }

    // Search learning patterns
    if (query.type === 'learning_pattern') {
      results.push(...this.memory.longTerm.learningPatterns.map(item => ({ data: item, type: 'learning_pattern' })));
    }

    return results;
  }

  private async retrieveEpisodic(query: any): Promise<any[]> {
    const results: any[] = [];

    // Search successful interactions
    if (query.type === 'successful_interaction' || query.type === 'interaction') {
      const matchingInteractions = this.memory.episodic.successfulInteractions.filter(interaction => 
        (!query.agentId || interaction.agentId === query.agentId) &&
        (!query.customerId || interaction.customerId === query.customerId)
      );
      results.push(...matchingInteractions.map(item => ({ data: item, type: 'interaction' })));
    }

    // Search problem resolutions
    if (query.type === 'problem_resolution') {
      results.push(...this.memory.episodic.problemResolutions.map(item => ({ data: item, type: 'problem_resolution' })));
    }

    // Search decision outcomes
    if (query.type === 'decision_outcome' || query.type === 'learning_outcome' || query.type === 'action_log') {
      const matchingOutcomes = this.memory.episodic.decisionOutcomes.filter(outcome => 
        !query.agentId || outcome.agentId === query.agentId
      );
      results.push(...matchingOutcomes.map(item => ({ data: item, type: 'decision_outcome' })));
    }

    // Search contextual learnings
    if (query.type === 'contextual_learning') {
      results.push(...this.memory.episodic.contextualLearnings.map(item => ({ data: item, type: 'contextual_learning' })));
    }

    return results;
  }

  private async retrieveSemantic(query: any): Promise<any[]> {
    const results: any[] = [];

    // Search domain knowledge
    if (query.type === 'domain_knowledge' || query.concept) {
      const matchingKnowledge = this.memory.semantic.domainKnowledge.filter(knowledge => 
        !query.concept || knowledge.concept.includes(query.concept)
      );
      results.push(...matchingKnowledge.map(item => ({ data: item, type: 'domain_knowledge' })));
    }

    // Search relationships
    if (query.type === 'relationship') {
      results.push(...this.memory.semantic.relationships.map(item => ({ data: item, type: 'relationship' })));
    }

    // Search concepts
    if (query.type === 'concept') {
      results.push(...this.memory.semantic.concepts.map(item => ({ data: item, type: 'concept' })));
    }

    // Search rules and patterns
    if (query.type === 'business_rule' || query.type === 'learning_pattern' || 
        query.type === 'optimization_strategy' || query.type === 'engagement_strategy' ||
        query.type === 'categorization_pattern' || query.type === 'successful_strategy') {
      const matchingRules = this.memory.semantic.rules.filter(rule => 
        rule.name?.includes(query.type) || rule.pattern?.includes(query.type)
      );
      results.push(...matchingRules.map(item => ({ data: item, type: query.type })));
    }

    return results;
  }

  private rankByRelevance(results: any[], query: any): any[] {
    return results
      .map(result => ({
        ...result,
        relevanceScore: this.calculateRelevance(result, query)
      }))
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, 50); // Limit results
  }

  private calculateRelevance(result: any, query: any): number {
    let score = 0.5; // Base relevance

    // Exact type match
    if (result.type === query.type) {
      score += 0.3;
    }

    // Recency bonus
    if (result.timestamp) {
      const age = Date.now() - new Date(result.timestamp).getTime();
      const daysSinceCreation = age / (1000 * 60 * 60 * 24);
      score += Math.max(0, 0.2 * Math.exp(-daysSinceCreation / 30)); // Exponential decay
    }

    // Agent relevance
    if (result.agentId === this.agentId) {
      score += 0.1;
    }

    // Query-specific matching
    Object.keys(query).forEach(key => {
      if (result.data && result.data[key] === query[key]) {
        score += 0.1;
      }
    });

    return Math.min(score, 1.0);
  }

  public async consolidate(): Promise<void> {
    console.log(`Starting memory consolidation for agent ${this.agentId}`);

    // Move important short-term memories to long-term
    await this.consolidateShortToLong();

    // Extract patterns from episodic memories
    await this.extractPatternsFromEpisodic();

    // Update semantic knowledge based on new learnings
    await this.updateSemanticKnowledge();

    // Apply memory decay to reduce noise
    await this.applyMemoryDecay();

    console.log(`Memory consolidation completed for agent ${this.agentId}`);
  }

  private async consolidateShortToLong(): Promise<void> {
    // Move frequently accessed or important short-term items to long-term storage
    const importantContexts = this.memory.shortTerm.currentContext.filter(context => 
      context.priority > 7 || context.messages.length > 10
    );

    importantContexts.forEach(context => {
      this.memory.longTerm.customerProfiles.push({
        id: context.leadId,
        email: '', // Would be populated from lead data
        name: '',
        interactionHistory: context.messages.map(msg => ({
          id: msg.id,
          customerId: context.leadId,
          agentId: this.agentId,
          type: 'chat' as any,
          content: msg.content,
          outcome: 'neutral' as any,
          sentiment: 0,
          timestamp: msg.timestamp,
          metadata: msg.metadata
        })),
        segmentTags: [],
        lifetimeValue: 0,
        lastEngagement: new Date(),
        company: undefined,
        industry: undefined,
        preferences: {
          communicationChannel: ['email'],
          contentTypes: ['text'],
          frequency: 'weekly',
          topics: [],
          timezone: 'UTC'
        }
      });
    });

    // Clear consolidated items from short-term memory
    this.memory.shortTerm.currentContext = this.memory.shortTerm.currentContext.filter(context => 
      context.priority <= 7 && context.messages.length <= 10
    );
  }

  private async extractPatternsFromEpisodic(): Promise<void> {
    const interactions = this.memory.episodic.successfulInteractions;
    const outcomes = this.memory.episodic.decisionOutcomes;

    // Extract successful interaction patterns
    const interactionPatterns = this.findInteractionPatterns(interactions);
    interactionPatterns.forEach(pattern => {
      this.memory.longTerm.learningPatterns.push(pattern);
    });

    // Extract decision patterns
    const decisionPatterns = this.findDecisionPatterns(outcomes);
    decisionPatterns.forEach(pattern => {
      this.memory.longTerm.learningPatterns.push(pattern);
    });
  }

  private findInteractionPatterns(interactions: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const patternMap = new Map<string, any>();

    interactions.forEach(interaction => {
      const key = `${interaction.type}_${interaction.outcome}`;
      
      if (!patternMap.has(key)) {
        patternMap.set(key, {
          type: interaction.type,
          outcome: interaction.outcome,
          count: 0,
          successCount: 0,
          contexts: []
        });
      }

      const pattern = patternMap.get(key);
      pattern.count++;
      
      if (interaction.outcome === 'positive' || interaction.outcome === 'conversion') {
        pattern.successCount++;
      }
      
      pattern.contexts.push(interaction.metadata);
    });

    patternMap.forEach((patternData, key) => {
      if (patternData.count >= 3) { // Minimum occurrences for pattern recognition
        patterns.push({
          id: uuidv4(),
          pattern: key,
          confidence: patternData.successCount / patternData.count,
          applications: patternData.count,
          successRate: patternData.successCount / patternData.count,
          lastUsed: new Date(),
          context: patternData.contexts.map((ctx: any) => JSON.stringify(ctx))
        });
      }
    });

    return patterns;
  }

  private findDecisionPatterns(outcomes: any[]): LearningPattern[] {
    const patterns: LearningPattern[] = [];
    const decisionMap = new Map<string, any>();

    outcomes.forEach(outcome => {
      const key = outcome.decision || outcome.actionType;
      
      if (!decisionMap.has(key)) {
        decisionMap.set(key, {
          decision: key,
          count: 0,
          successCount: 0,
          impacts: []
        });
      }

      const pattern = decisionMap.get(key);
      pattern.count++;
      
      if (outcome.success || outcome.impact > 0) {
        pattern.successCount++;
        pattern.impacts.push(outcome.impact || 1);
      }
    });

    decisionMap.forEach((patternData, key) => {
      if (patternData.count >= 2) {
        const avgImpact = patternData.impacts.length > 0 
          ? patternData.impacts.reduce((a: number, b: number) => a + b, 0) / patternData.impacts.length 
          : 0;

        patterns.push({
          id: uuidv4(),
          pattern: `decision_${key}`,
          confidence: patternData.successCount / patternData.count,
          applications: patternData.count,
          successRate: patternData.successCount / patternData.count,
          lastUsed: new Date(),
          context: [`average_impact:${avgImpact}`]
        });
      }
    });

    return patterns;
  }

  private async updateSemanticKnowledge(): Promise<void> {
    // Update knowledge nodes based on new learnings
    const recentLearnings = this.memory.episodic.contextualLearnings
      .filter(learning => {
        const age = Date.now() - new Date(learning.timestamp).getTime();
        return age < 7 * 24 * 60 * 60 * 1000; // Last 7 days
      });

    recentLearnings.forEach(learning => {
      // Create or update knowledge nodes
      const existingNode = this.memory.semantic.domainKnowledge.find(node => 
        node.concept === learning.context
      );

      if (existingNode) {
        existingNode.confidence = Math.min(existingNode.confidence + 0.1, 1.0);
        existingNode.lastUpdated = new Date();
      } else {
        this.memory.semantic.domainKnowledge.push({
          id: uuidv4(),
          concept: learning.context,
          description: learning.learning,
          relationships: [],
          confidence: learning.confidence,
          lastUpdated: new Date()
        });
      }
    });

    // Update relationships between concepts
    await this.updateConceptRelationships();
  }

  private async updateConceptRelationships(): Promise<void> {
    const concepts = this.memory.semantic.domainKnowledge;
    
    // Find related concepts and create relationships
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const similarity = this.calculateConceptSimilarity(concepts[i], concepts[j]);
        
        if (similarity > 0.6) {
          const relationship = {
            id: uuidv4(),
            source: concepts[i].id,
            target: concepts[j].id,
            type: 'related_to' as any,
            strength: similarity,
            metadata: {
              createdAt: new Date(),
              agentId: this.agentId
            }
          };

          // Check if relationship already exists
          const existingRelationship = this.memory.semantic.relationships.find(rel => 
            (rel.source === relationship.source && rel.target === relationship.target) ||
            (rel.source === relationship.target && rel.target === relationship.source)
          );

          if (!existingRelationship) {
            this.memory.semantic.relationships.push(relationship);
          }
        }
      }
    }
  }

  private calculateConceptSimilarity(concept1: KnowledgeNode, concept2: KnowledgeNode): number {
    // Simple similarity calculation based on concept names and descriptions
    const name1 = concept1.concept.toLowerCase();
    const name2 = concept2.concept.toLowerCase();
    const desc1 = concept1.description.toLowerCase();
    const desc2 = concept2.description.toLowerCase();

    // Check for common words
    const words1 = new Set([...name1.split(' '), ...desc1.split(' ')]);
    const words2 = new Set([...name2.split(' '), ...desc2.split(' ')]);
    
    const intersection = new Set([...words1].filter(word => words2.has(word)));
    const union = new Set([...words1, ...words2]);
    
    return intersection.size / union.size;
  }

  private async applyMemoryDecay(): Promise<void> {
    // Apply decay to learning patterns
    this.memory.longTerm.learningPatterns.forEach(pattern => {
      const age = Date.now() - new Date(pattern.lastUsed).getTime();
      const daysSinceUse = age / (1000 * 60 * 60 * 24);
      
      if (daysSinceUse > 30) {
        pattern.confidence *= this.MEMORY_DECAY_FACTOR;
      }
    });

    // Remove very low confidence patterns
    this.memory.longTerm.learningPatterns = this.memory.longTerm.learningPatterns.filter(
      pattern => pattern.confidence > 0.1
    );

    // Apply decay to semantic knowledge
    this.memory.semantic.domainKnowledge.forEach(node => {
      const age = Date.now() - new Date(node.lastUpdated).getTime();
      const daysSinceUpdate = age / (1000 * 60 * 60 * 24);
      
      if (daysSinceUpdate > 60) {
        node.confidence *= this.MEMORY_DECAY_FACTOR;
      }
    });
  }

  private async enforceShortTermLimits(): Promise<void> {
    // Limit current context
    if (this.memory.shortTerm.currentContext.length > this.MAX_SHORT_TERM_ITEMS) {
      this.memory.shortTerm.currentContext = this.memory.shortTerm.currentContext
        .sort((a, b) => b.priority - a.priority)
        .slice(0, this.MAX_SHORT_TERM_ITEMS);
    }

    // Limit active leads
    if (this.memory.shortTerm.activeLeads.length > this.MAX_SHORT_TERM_ITEMS) {
      this.memory.shortTerm.activeLeads = this.memory.shortTerm.activeLeads
        .sort((a, b) => b.score - a.score)
        .slice(0, this.MAX_SHORT_TERM_ITEMS);
    }

    // Limit recent actions
    if (this.memory.shortTerm.recentActions.length > this.MAX_SHORT_TERM_ITEMS) {
      this.memory.shortTerm.recentActions = this.memory.shortTerm.recentActions
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, this.MAX_SHORT_TERM_ITEMS);
    }
  }

  private shouldConsolidate(): boolean {
    const shortTermSize = this.memory.shortTerm.currentContext.length + 
                         this.memory.shortTerm.activeLeads.length + 
                         this.memory.shortTerm.recentActions.length;
    
    return shortTermSize > this.CONSOLIDATION_THRESHOLD;
  }

  public getMemoryStats(): Record<string, number> {
    return {
      shortTermItems: this.memory.shortTerm.currentContext.length + 
                     this.memory.shortTerm.activeLeads.length + 
                     this.memory.shortTerm.recentActions.length,
      longTermItems: this.memory.longTerm.customerProfiles.length + 
                    this.memory.longTerm.campaignHistory.length + 
                    this.memory.longTerm.performanceMetrics.length + 
                    this.memory.longTerm.learningPatterns.length,
      episodicItems: this.memory.episodic.successfulInteractions.length + 
                    this.memory.episodic.problemResolutions.length + 
                    this.memory.episodic.decisionOutcomes.length + 
                    this.memory.episodic.contextualLearnings.length,
      semanticItems: this.memory.semantic.domainKnowledge.length + 
                    this.memory.semantic.relationships.length + 
                    this.memory.semantic.concepts.length + 
                    this.memory.semantic.rules.length
    };
  }

  public async compressMemory(): Promise<void> {
    // Compress episodic memories by summarizing similar events
    await this.compressEpisodicMemory();
    
    // Merge similar semantic concepts
    await this.mergeSemanticConcepts();
    
    // Remove redundant relationships
    await this.cleanupRelationships();
  }

  private async compressEpisodicMemory(): Promise<void> {
    // Group similar interactions and create summaries
    const interactions = this.memory.episodic.successfulInteractions;
    const grouped = this.groupSimilarInteractions(interactions);

    // Replace groups with summaries if they have more than 5 similar interactions
    Object.entries(grouped).forEach(([key, group]: [string, any]) => {
      if (group.length > 5) {
        const summary = this.createInteractionSummary(group);
        
        // Remove individual interactions
        this.memory.episodic.successfulInteractions = this.memory.episodic.successfulInteractions
          .filter(interaction => !group.includes(interaction));
        
        // Add summary
        this.memory.episodic.contextualLearnings.push({
          id: uuidv4(),
          context: key,
          learning: summary.pattern,
          confidence: summary.confidence,
          applications: group.length,
          timestamp: new Date()
        });
      }
    });
  }

  private groupSimilarInteractions(interactions: any[]): Record<string, any[]> {
    const groups: Record<string, any[]> = {};

    interactions.forEach(interaction => {
      const key = `${interaction.type}_${interaction.outcome}`;
      
      if (!groups[key]) {
        groups[key] = [];
      }
      
      groups[key].push(interaction);
    });

    return groups;
  }

  private createInteractionSummary(interactions: any[]): any {
    const totalSentiment = interactions.reduce((sum, int) => sum + int.sentiment, 0);
    const avgSentiment = totalSentiment / interactions.length;

    return {
      pattern: `${interactions[0].type} interactions with ${interactions[0].outcome} outcome`,
      confidence: Math.min(interactions.length / 10, 0.9),
      averageSentiment: avgSentiment,
      frequency: interactions.length,
      timespan: {
        start: Math.min(...interactions.map(int => new Date(int.timestamp).getTime())),
        end: Math.max(...interactions.map(int => new Date(int.timestamp).getTime()))
      }
    };
  }

  private async mergeSemanticConcepts(): Promise<void> {
    const concepts = this.memory.semantic.domainKnowledge;
    const toMerge: Array<[number, number]> = [];

    // Find concepts that should be merged
    for (let i = 0; i < concepts.length; i++) {
      for (let j = i + 1; j < concepts.length; j++) {
        const similarity = this.calculateConceptSimilarity(concepts[i], concepts[j]);
        
        if (similarity > 0.8) {
          toMerge.push([i, j]);
        }
      }
    }

    // Merge similar concepts
    toMerge.reverse().forEach(([i, j]) => {
      const concept1 = concepts[i];
      const concept2 = concepts[j];
      
      // Merge into the more confident concept
      const target = concept1.confidence >= concept2.confidence ? concept1 : concept2;
      const source = concept1.confidence >= concept2.confidence ? concept2 : concept1;
      
      target.description += ` ${source.description}`;
      target.confidence = Math.max(target.confidence, source.confidence);
      target.relationships.push(...source.relationships);
      
      // Remove the merged concept
      concepts.splice(Math.max(i, j), 1);
    });
  }

  private async cleanupRelationships(): Promise<void> {
    // Remove relationships pointing to non-existent concepts
    const conceptIds = new Set(this.memory.semantic.domainKnowledge.map(node => node.id));
    
    this.memory.semantic.relationships = this.memory.semantic.relationships.filter(rel => 
      conceptIds.has(rel.source) && conceptIds.has(rel.target)
    );

    // Remove duplicate relationships
    const uniqueRelationships = new Map<string, any>();
    
    this.memory.semantic.relationships.forEach(rel => {
      const key = `${rel.source}_${rel.target}_${rel.type}`;
      const reverseKey = `${rel.target}_${rel.source}_${rel.type}`;
      
      if (!uniqueRelationships.has(key) && !uniqueRelationships.has(reverseKey)) {
        uniqueRelationships.set(key, rel);
      }
    });

    this.memory.semantic.relationships = Array.from(uniqueRelationships.values());
  }
}