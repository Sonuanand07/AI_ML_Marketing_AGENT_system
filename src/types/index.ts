// Core system types for the marketing multi-agent system

export interface Agent {
  id: string;
  name: string;
  type: AgentType;
  status: AgentStatus;
  capabilities: string[];
  memory: AgentMemory;
  lastActive: Date;
}

export enum AgentType {
  LEAD_TRIAGE = 'lead_triage',
  ENGAGEMENT = 'engagement',
  CAMPAIGN_OPTIMIZATION = 'campaign_optimization'
}

export enum AgentStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  PROCESSING = 'processing',
  ERROR = 'error'
}

export interface AgentMemory {
  shortTerm: ShortTermMemory;
  longTerm: LongTermMemory;
  episodic: EpisodicMemory;
  semantic: SemanticMemory;
}

export interface ShortTermMemory {
  currentContext: ConversationContext[];
  activeLeads: Lead[];
  recentActions: AgentAction[];
  workingMemory: Record<string, any>;
}

export interface LongTermMemory {
  customerProfiles: CustomerProfile[];
  campaignHistory: Campaign[];
  performanceMetrics: PerformanceMetric[];
  learningPatterns: LearningPattern[];
}

export interface EpisodicMemory {
  successfulInteractions: Interaction[];
  problemResolutions: Resolution[];
  decisionOutcomes: DecisionOutcome[];
  contextualLearnings: ContextualLearning[];
}

export interface SemanticMemory {
  domainKnowledge: KnowledgeNode[];
  relationships: Relationship[];
  concepts: Concept[];
  rules: BusinessRule[];
}

export interface Lead {
  id: string;
  email: string;
  name: string;
  company?: string;
  source: string;
  category: LeadCategory;
  score: number;
  status: LeadStatus;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export enum LeadCategory {
  CAMPAIGN_QUALIFIED = 'campaign_qualified',
  COLD_LEAD = 'cold_lead',
  GENERAL_INQUIRY = 'general_inquiry',
  HOT_PROSPECT = 'hot_prospect',
  EXISTING_CUSTOMER = 'existing_customer'
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  ENGAGED = 'engaged',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost'
}

export interface Campaign {
  id: string;
  name: string;
  type: CampaignType;
  status: CampaignStatus;
  targetAudience: string[];
  content: CampaignContent;
  metrics: CampaignMetrics;
  startDate: Date;
  endDate?: Date;
  budget: number;
  createdBy: string;
}

export enum CampaignType {
  EMAIL = 'email',
  SOCIAL_MEDIA = 'social_media',
  CONTENT_MARKETING = 'content_marketing',
  PAID_ADS = 'paid_ads',
  WEBINAR = 'webinar'
}

export enum CampaignStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled'
}

export interface CampaignContent {
  subject?: string;
  body: string;
  attachments?: string[];
  callToAction: string;
  personalizationTokens: string[];
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  converted: number;
  bounced: number;
  unsubscribed: number;
  revenue: number;
}

export interface CustomerProfile {
  id: string;
  email: string;
  name: string;
  company?: string;
  industry?: string;
  preferences: CustomerPreferences;
  interactionHistory: Interaction[];
  segmentTags: string[];
  lifetimeValue: number;
  lastEngagement: Date;
}

export interface CustomerPreferences {
  communicationChannel: string[];
  contentTypes: string[];
  frequency: string;
  topics: string[];
  timezone: string;
}

export interface Interaction {
  id: string;
  customerId: string;
  agentId: string;
  type: InteractionType;
  content: string;
  outcome: InteractionOutcome;
  sentiment: number;
  timestamp: Date;
  metadata: Record<string, any>;
}

export enum InteractionType {
  EMAIL = 'email',
  PHONE = 'phone',
  CHAT = 'chat',
  SOCIAL_MEDIA = 'social_media',
  MEETING = 'meeting'
}

export enum InteractionOutcome {
  POSITIVE = 'positive',
  NEUTRAL = 'neutral',
  NEGATIVE = 'negative',
  CONVERSION = 'conversion',
  ESCALATION = 'escalation'
}

export interface AgentAction {
  id: string;
  agentId: string;
  type: ActionType;
  target: string;
  payload: Record<string, any>;
  timestamp: Date;
  result?: ActionResult;
}

export enum ActionType {
  CATEGORIZE_LEAD = 'categorize_lead',
  SEND_EMAIL = 'send_email',
  SCHEDULE_FOLLOWUP = 'schedule_followup',
  UPDATE_CAMPAIGN = 'update_campaign',
  ESCALATE = 'escalate',
  ANALYZE_PERFORMANCE = 'analyze_performance'
}

export interface ActionResult {
  success: boolean;
  data?: any;
  error?: string;
  metrics?: Record<string, number>;
}

export interface ConversationContext {
  id: string;
  leadId: string;
  agentId: string;
  messages: Message[];
  intent: string;
  entities: Entity[];
  sentiment: number;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  id: string;
  role: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface Entity {
  type: string;
  value: string;
  confidence: number;
  start: number;
  end: number;
}

export interface PerformanceMetric {
  id: string;
  agentId: string;
  metric: string;
  value: number;
  timestamp: Date;
  context: Record<string, any>;
}

export interface LearningPattern {
  id: string;
  pattern: string;
  confidence: number;
  applications: number;
  successRate: number;
  lastUsed: Date;
  context: string[];
}

export interface Resolution {
  id: string;
  problemType: string;
  solution: string;
  effectiveness: number;
  context: Record<string, any>;
  timestamp: Date;
}

export interface DecisionOutcome {
  id: string;
  decision: string;
  outcome: string;
  success: boolean;
  impact: number;
  timestamp: Date;
  context: Record<string, any>;
}

export interface ContextualLearning {
  id: string;
  context: string;
  learning: string;
  confidence: number;
  applications: number;
  timestamp: Date;
}

export interface KnowledgeNode {
  id: string;
  concept: string;
  description: string;
  relationships: string[];
  confidence: number;
  lastUpdated: Date;
}

export interface Relationship {
  id: string;
  source: string;
  target: string;
  type: RelationshipType;
  strength: number;
  metadata: Record<string, any>;
}

export enum RelationshipType {
  SIMILAR_TO = 'similar_to',
  PART_OF = 'part_of',
  CAUSES = 'causes',
  RELATED_TO = 'related_to',
  OPPOSITE_OF = 'opposite_of'
}

export interface Concept {
  id: string;
  name: string;
  definition: string;
  examples: string[];
  category: string;
  importance: number;
}

export interface BusinessRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  priority: number;
  active: boolean;
  lastModified: Date;
}

// MCP Protocol Types
export interface MCPRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: any;
}

export interface MCPResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: any;
  error?: MCPError;
}

export interface MCPError {
  code: number;
  message: string;
  data?: any;
}

export interface MCPNotification {
  jsonrpc: '2.0';
  method: string;
  params?: any;
}

// WebSocket Message Types
export interface WebSocketMessage {
  type: MessageType;
  agentId: string;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export enum MessageType {
  AGENT_HANDOFF = 'agent_handoff',
  MEMORY_UPDATE = 'memory_update',
  CAMPAIGN_UPDATE = 'campaign_update',
  LEAD_UPDATE = 'lead_update',
  PERFORMANCE_ALERT = 'performance_alert',
  SYSTEM_STATUS = 'system_status'
}

export interface AgentHandoff {
  fromAgent: string;
  toAgent: string;
  context: ConversationContext;
  reason: string;
  priority: number;
  timestamp: Date;
}

export interface SystemMetrics {
  totalLeads: number;
  activeAgents: number;
  campaignsRunning: number;
  conversionRate: number;
  averageResponseTime: number;
  systemLoad: number;
  memoryUsage: number;
  lastUpdated: Date;
}