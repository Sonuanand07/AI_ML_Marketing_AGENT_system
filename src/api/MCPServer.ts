import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { MCPRequest, MCPResponse, MCPError } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MCPServer {
  private app: express.Application;
  private port: number;
  private rateLimiter: RateLimiterMemory;
  private requestHandlers: Map<string, (params: any) => Promise<any>> = new Map();

  constructor(port: number = 3001) {
    this.app = express();
    this.port = port;
    
    // Rate limiting: 100 requests per minute per IP
    this.rateLimiter = new RateLimiterMemory({
      keyGenerator: (req) => req.ip,
      points: 100,
      duration: 60,
    });

    this.setupMiddleware();
    this.setupRoutes();
    this.registerHandlers();
  }

  private setupMiddleware(): void {
    // Security middleware
    this.app.use(helmet());
    this.app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
      credentials: true
    }));

    // Body parsing
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true }));

    // Rate limiting middleware
    this.app.use(async (req, res, next) => {
      try {
        await this.rateLimiter.consume(req.ip);
        next();
      } catch (rejRes) {
        res.status(429).json({
          jsonrpc: '2.0',
          error: {
            code: -32000,
            message: 'Rate limit exceeded'
          },
          id: null
        });
      }
    });

    // Request logging
    this.app.use((req, res, next) => {
      console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
      next();
    });
  }

  private setupRoutes(): void {
    // Health check endpoint
    this.app.get('/health', (req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      });
    });

    // Main MCP endpoint
    this.app.post('/mcp', async (req, res) => {
      try {
        const request: MCPRequest = req.body;
        const response = await this.handleMCPRequest(request);
        res.json(response);
      } catch (error) {
        const errorResponse: MCPResponse = {
          jsonrpc: '2.0',
          id: req.body.id || null,
          error: {
            code: -32603,
            message: 'Internal error',
            data: error instanceof Error ? error.message : 'Unknown error'
          }
        };
        res.status(500).json(errorResponse);
      }
    });

    // Notification endpoint
    this.app.post('/mcp/notify', async (req, res) => {
      try {
        const notification = req.body;
        await this.handleNotification(notification);
        res.status(200).json({ success: true });
      } catch (error) {
        res.status(500).json({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Unknown error' 
        });
      }
    });
  }

  private async handleMCPRequest(request: MCPRequest): Promise<MCPResponse> {
    try {
      // Validate request format
      if (!request.jsonrpc || request.jsonrpc !== '2.0') {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32600,
            message: 'Invalid Request'
          }
        };
      }

      if (!request.method) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: 'Method not found'
          }
        };
      }

      // Get handler for the method
      const handler = this.requestHandlers.get(request.method);
      if (!handler) {
        return {
          jsonrpc: '2.0',
          id: request.id,
          error: {
            code: -32601,
            message: `Method '${request.method}' not found`
          }
        };
      }

      // Execute handler
      const result = await handler(request.params || {});

      return {
        jsonrpc: '2.0',
        id: request.id,
        result
      };

    } catch (error) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: error instanceof Error ? error.message : 'Unknown error'
        }
      };
    }
  }

  private async handleNotification(notification: any): Promise<void> {
    console.log('Received notification:', notification);
    // In production, this would handle various notification types
    // such as webhook events, system alerts, etc.
  }

  private registerHandlers(): void {
    // System methods
    this.requestHandlers.set('system.ping', async () => ({ pong: true, timestamp: new Date() }));
    
    // Marketing methods
    this.requestHandlers.set('marketing.getLeads', this.handleGetLeads.bind(this));
    this.requestHandlers.set('marketing.createLead', this.handleCreateLead.bind(this));
    this.requestHandlers.set('marketing.updateLead', this.handleUpdateLead.bind(this));
    this.requestHandlers.set('marketing.getCampaigns', this.handleGetCampaigns.bind(this));
    this.requestHandlers.set('marketing.createCampaign', this.handleCreateCampaign.bind(this));
    this.requestHandlers.set('marketing.updateCampaign', this.handleUpdateCampaign.bind(this));

    // Analytics methods
    this.requestHandlers.set('analytics.query', this.handleAnalyticsQuery.bind(this));
    
    // Customer methods
    this.requestHandlers.set('customers.getProfiles', this.handleGetCustomerProfiles.bind(this));
    this.requestHandlers.set('customers.updateProfile', this.handleUpdateCustomerProfile.bind(this));

    // Email service methods
    this.requestHandlers.set('email.send', this.handleSendEmail.bind(this));
    this.requestHandlers.set('email.getTemplates', this.handleGetEmailTemplates.bind(this));
    this.requestHandlers.set('email.trackEvent', this.handleTrackEmailEvent.bind(this));

    // Social media methods
    this.requestHandlers.set('social.post', this.handleSocialPost.bind(this));
    this.requestHandlers.set('social.getMetrics', this.handleGetSocialMetrics.bind(this));

    // Data enrichment methods
    this.requestHandlers.set('enrichment.enrichLead', this.handleEnrichLead.bind(this));
    this.requestHandlers.set('validation.validateEmail', this.handleValidateEmail.bind(this));
    this.requestHandlers.set('intelligence.getMarketData', this.handleGetMarketIntelligence.bind(this));
  }

  // Handler implementations
  private async handleGetLeads(params: any): Promise<any> {
    // Simulate database query with filters
    const mockLeads = this.generateMockLeads(params.filters);
    return { leads: mockLeads, total: mockLeads.length };
  }

  private async handleCreateLead(params: any): Promise<any> {
    const lead = {
      id: uuidv4(),
      ...params.lead,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return { lead, success: true };
  }

  private async handleUpdateLead(params: any): Promise<any> {
    return {
      leadId: params.leadId,
      updates: params.updates,
      updatedAt: new Date(),
      success: true
    };
  }

  private async handleGetCampaigns(params: any): Promise<any> {
    const mockCampaigns = this.generateMockCampaigns(params.filters);
    return { campaigns: mockCampaigns, total: mockCampaigns.length };
  }

  private async handleCreateCampaign(params: any): Promise<any> {
    const campaign = {
      id: uuidv4(),
      ...params.campaign,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    return { campaign, success: true };
  }

  private async handleUpdateCampaign(params: any): Promise<any> {
    return {
      campaignId: params.campaignId,
      updates: params.updates,
      updatedAt: new Date(),
      success: true
    };
  }

  private async handleAnalyticsQuery(params: any): Promise<any> {
    // Generate mock analytics data based on query
    return {
      data: this.generateAnalyticsData(params),
      timestamp: new Date()
    };
  }

  private async handleGetCustomerProfiles(params: any): Promise<any> {
    const mockProfiles = this.generateMockCustomerProfiles(params.filters);
    return { profiles: mockProfiles, total: mockProfiles.length };
  }

  private async handleUpdateCustomerProfile(params: any): Promise<any> {
    return {
      customerId: params.customerId,
      updates: params.updates,
      updatedAt: new Date(),
      success: true
    };
  }

  private async handleSendEmail(params: any): Promise<any> {
    // Simulate email sending
    const deliveryTime = Math.random() * 2000 + 500;
    await new Promise(resolve => setTimeout(resolve, deliveryTime));
    
    return {
      messageId: uuidv4(),
      status: Math.random() > 0.05 ? 'delivered' : 'failed',
      deliveryTime,
      timestamp: new Date()
    };
  }

  private async handleGetEmailTemplates(params: any): Promise<any> {
    return {
      templates: [
        { id: '1', name: 'Welcome Email', type: 'welcome' },
        { id: '2', name: 'Follow-up', type: 'followup' },
        { id: '3', name: 'Newsletter', type: 'newsletter' }
      ]
    };
  }

  private async handleTrackEmailEvent(params: any): Promise<any> {
    return {
      eventId: uuidv4(),
      tracked: true,
      timestamp: new Date()
    };
  }

  private async handleSocialPost(params: any): Promise<any> {
    return {
      postId: uuidv4(),
      platform: params.platform,
      status: 'published',
      timestamp: new Date()
    };
  }

  private async handleGetSocialMetrics(params: any): Promise<any> {
    return {
      platform: params.platform,
      metrics: {
        impressions: Math.floor(Math.random() * 10000) + 1000,
        engagement: Math.floor(Math.random() * 500) + 50,
        clicks: Math.floor(Math.random() * 200) + 20
      },
      timeRange: params.timeRange
    };
  }

  private async handleEnrichLead(params: any): Promise<any> {
    // Simulate lead enrichment
    const enrichedData = {
      ...params,
      companySize: Math.floor(Math.random() * 1000) + 10,
      industry: 'Technology',
      socialProfiles: ['linkedin', 'twitter'],
      confidence: 0.85
    };
    return { enrichedData };
  }

  private async handleValidateEmail(params: any): Promise<any> {
    const isValid = params.email.includes('@') && params.email.includes('.');
    return {
      email: params.email,
      valid: isValid,
      deliverable: isValid && Math.random() > 0.1,
      confidence: isValid ? 0.9 : 0.1
    };
  }

  private async handleGetMarketIntelligence(params: any): Promise<any> {
    return {
      marketData: {
        trends: ['AI adoption increasing', 'Remote work tools in demand'],
        competitors: ['CompetitorA', 'CompetitorB'],
        opportunities: ['Emerging markets', 'New technology adoption']
      },
      confidence: 0.8,
      lastUpdated: new Date()
    };
  }

  // Mock data generators
  private generateMockLeads(filters: any): any[] {
    return Array.from({ length: 10 }, (_, i) => ({
      id: `lead_${i}`,
      name: `Lead ${i + 1}`,
      email: `lead${i + 1}@example.com`,
      company: `Company ${i + 1}`,
      score: Math.floor(Math.random() * 100),
      status: 'new',
      createdAt: new Date()
    }));
  }

  private generateMockCampaigns(filters: any): any[] {
    return Array.from({ length: 5 }, (_, i) => ({
      id: `campaign_${i}`,
      name: `Campaign ${i + 1}`,
      type: 'email',
      status: 'active',
      metrics: {
        sent: Math.floor(Math.random() * 1000) + 100,
        opened: Math.floor(Math.random() * 300) + 20,
        clicked: Math.floor(Math.random() * 50) + 5
      },
      createdAt: new Date()
    }));
  }

  private generateMockCustomerProfiles(filters: any): any[] {
    return Array.from({ length: 8 }, (_, i) => ({
      id: `customer_${i}`,
      name: `Customer ${i + 1}`,
      email: `customer${i + 1}@example.com`,
      company: `Company ${i + 1}`,
      lifetimeValue: Math.floor(Math.random() * 50000) + 5000,
      lastEngagement: new Date()
    }));
  }

  private generateAnalyticsData(query: any): any {
    return {
      metrics: {
        totalLeads: Math.floor(Math.random() * 1000) + 500,
        conversionRate: (Math.random() * 0.1 + 0.02).toFixed(3),
        averageScore: Math.floor(Math.random() * 40) + 60
      },
      trends: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        value: Math.floor(Math.random() * 100) + 50
      }))
    };
  }

  public start(): Promise<void> {
    return new Promise((resolve) => {
      this.app.listen(this.port, () => {
        console.log(`MCP Server running on port ${this.port}`);
        resolve();
      });
    });
  }

  public registerHandler(method: string, handler: (params: any) => Promise<any>): void {
    this.requestHandlers.set(method, handler);
  }

  public getApp(): express.Application {
    return this.app;
  }
}