import { MCPRequest, MCPResponse, MCPError, MCPNotification } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class MCPClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;
  private retryAttempts: number;

  constructor(baseUrl: string, apiKey: string, timeout: number = 30000, retryAttempts: number = 3) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.timeout = timeout;
    this.retryAttempts = retryAttempts;
  }

  public async request(method: string, params?: any): Promise<any> {
    const request: MCPRequest = {
      jsonrpc: '2.0',
      id: uuidv4(),
      method,
      params
    };

    return await this.sendRequest(request);
  }

  private async sendRequest(request: MCPRequest, attempt: number = 1): Promise<any> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);

      const response = await fetch(`${this.baseUrl}/mcp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-MCP-Version': '1.0'
        },
        body: JSON.stringify(request),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const mcpResponse: MCPResponse = await response.json();

      if (mcpResponse.error) {
        throw new MCPError(mcpResponse.error);
      }

      return mcpResponse.result;

    } catch (error) {
      if (attempt < this.retryAttempts && this.isRetryableError(error)) {
        console.warn(`MCP request failed (attempt ${attempt}), retrying...`, error);
        await this.delay(Math.pow(2, attempt) * 1000); // Exponential backoff
        return await this.sendRequest(request, attempt + 1);
      }

      throw error;
    }
  }

  private isRetryableError(error: any): boolean {
    // Network errors, timeouts, and 5xx server errors are retryable
    return error.name === 'AbortError' ||
           error.message?.includes('fetch') ||
           (error.status && error.status >= 500);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // Marketing Database Operations
  public async getLeads(filters?: any): Promise<any[]> {
    return await this.request('marketing.getLeads', { filters });
  }

  public async createLead(leadData: any): Promise<any> {
    return await this.request('marketing.createLead', { lead: leadData });
  }

  public async updateLead(leadId: string, updates: any): Promise<any> {
    return await this.request('marketing.updateLead', { leadId, updates });
  }

  public async getCampaigns(filters?: any): Promise<any[]> {
    return await this.request('marketing.getCampaigns', { filters });
  }

  public async createCampaign(campaignData: any): Promise<any> {
    return await this.request('marketing.createCampaign', { campaign: campaignData });
  }

  public async updateCampaign(campaignId: string, updates: any): Promise<any> {
    return await this.request('marketing.updateCampaign', { campaignId, updates });
  }

  public async getAnalytics(query: any): Promise<any> {
    return await this.request('analytics.query', query);
  }

  public async getCustomerProfiles(filters?: any): Promise<any[]> {
    return await this.request('customers.getProfiles', { filters });
  }

  public async updateCustomerProfile(customerId: string, updates: any): Promise<any> {
    return await this.request('customers.updateProfile', { customerId, updates });
  }

  // Email Service Operations
  public async sendEmail(emailData: any): Promise<any> {
    return await this.request('email.send', emailData);
  }

  public async getEmailTemplates(): Promise<any[]> {
    return await this.request('email.getTemplates');
  }

  public async trackEmailEvent(eventData: any): Promise<any> {
    return await this.request('email.trackEvent', eventData);
  }

  // Social Media Operations
  public async postToSocialMedia(postData: any): Promise<any> {
    return await this.request('social.post', postData);
  }

  public async getSocialMetrics(platform: string, timeRange: any): Promise<any> {
    return await this.request('social.getMetrics', { platform, timeRange });
  }

  // External API Integrations
  public async enrichLeadData(leadData: any): Promise<any> {
    return await this.request('enrichment.enrichLead', leadData);
  }

  public async validateEmail(email: string): Promise<any> {
    return await this.request('validation.validateEmail', { email });
  }

  public async getMarketIntelligence(query: any): Promise<any> {
    return await this.request('intelligence.getMarketData', query);
  }

  // Notification Operations
  public async sendNotification(notification: MCPNotification): Promise<void> {
    await fetch(`${this.baseUrl}/mcp/notify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify(notification)
    });
  }

  // Health Check
  public async healthCheck(): Promise<boolean> {
    try {
      await this.request('system.ping');
      return true;
    } catch (error) {
      console.error('MCP health check failed:', error);
      return false;
    }
  }
}

class MCPError extends Error {
  public code: number;
  public data?: any;

  constructor(error: MCPError) {
    super(error.message);
    this.name = 'MCPError';
    this.code = error.code;
    this.data = error.data;
  }
}