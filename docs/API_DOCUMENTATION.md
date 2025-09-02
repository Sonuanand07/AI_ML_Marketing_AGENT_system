# API Documentation

## Overview

The AIML Marketing Multi-Agent System provides RESTful APIs and WebSocket connections for real-time marketing automation. The system uses the Model Context Protocol (MCP) with JSON-RPC 2.0 for structured communication.

## Base URLs

- **HTTP API**: `http://localhost:3001`
- **WebSocket**: `ws://localhost:3002`
- **Production**: `https://api.purplemerit.com`

## Authentication

All API requests require authentication using Bearer tokens:

```http
Authorization: Bearer YOUR_API_KEY
```

## MCP Protocol Specification

### Request Format

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "method": "method.name",
  "params": {
    "parameter1": "value1",
    "parameter2": "value2"
  }
}
```

### Response Format

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "result": {
    "data": "response_data"
  }
}
```

### Error Format

```json
{
  "jsonrpc": "2.0",
  "id": "unique-request-id",
  "error": {
    "code": -32603,
    "message": "Internal error",
    "data": "Additional error information"
  }
}
```

## Lead Management API

### Get Leads

**Method**: `marketing.getLeads`

**Parameters**:
```json
{
  "filters": {
    "category": "hot_prospect",
    "status": "new",
    "source": "website_form",
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    }
  },
  "pagination": {
    "page": 1,
    "limit": 50
  },
  "sort": {
    "field": "score",
    "order": "desc"
  }
}
```

**Response**:
```json
{
  "leads": [
    {
      "id": "lead_123",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "company": "TechCorp Inc.",
      "source": "website_form",
      "category": "hot_prospect",
      "score": 85,
      "status": "new",
      "metadata": {
        "interest": "AI solutions",
        "processingTimestamp": "2025-01-15T10:30:00Z"
      },
      "createdAt": "2025-01-15T10:00:00Z",
      "updatedAt": "2025-01-15T10:30:00Z"
    }
  ],
  "total": 150,
  "page": 1,
  "totalPages": 3
}
```

### Create Lead

**Method**: `marketing.createLead`

**Parameters**:
```json
{
  "lead": {
    "name": "Jane Smith",
    "email": "jane.smith@example.com",
    "company": "Startup Inc.",
    "source": "referral",
    "metadata": {
      "referredBy": "john.doe@example.com",
      "interest": "marketing automation"
    }
  }
}
```

### Update Lead

**Method**: `marketing.updateLead`

**Parameters**:
```json
{
  "leadId": "lead_123",
  "updates": {
    "status": "contacted",
    "score": 90,
    "metadata": {
      "lastContactDate": "2025-01-15T14:00:00Z",
      "contactMethod": "email"
    }
  }
}
```

## Campaign Management API

### Get Campaigns

**Method**: `marketing.getCampaigns`

**Parameters**:
```json
{
  "filters": {
    "type": "email",
    "status": "active",
    "dateRange": {
      "start": "2025-01-01",
      "end": "2025-01-31"
    }
  }
}
```

**Response**:
```json
{
  "campaigns": [
    {
      "id": "campaign_456",
      "name": "Q1 Product Launch",
      "type": "email",
      "status": "active",
      "targetAudience": ["tech_companies", "startups"],
      "content": {
        "subject": "Introducing Our Latest Innovation",
        "body": "Discover how our new product can transform your business...",
        "callToAction": "Schedule a demo",
        "personalizationTokens": ["name", "company"]
      },
      "metrics": {
        "sent": 2500,
        "delivered": 2450,
        "opened": 980,
        "clicked": 245,
        "converted": 37,
        "revenue": 185000
      },
      "budget": 15000,
      "startDate": "2025-01-01T00:00:00Z",
      "createdBy": "engagement_agent"
    }
  ]
}
```

### Create Campaign

**Method**: `marketing.createCampaign`

**Parameters**:
```json
{
  "campaign": {
    "name": "New Product Launch",
    "type": "email",
    "targetAudience": ["enterprise", "mid_market"],
    "content": {
      "subject": "Revolutionary AI Solution Launch",
      "body": "We're excited to announce our latest AI-powered solution...",
      "callToAction": "Get early access",
      "personalizationTokens": ["name", "company", "industry"]
    },
    "budget": 25000,
    "startDate": "2025-02-01T00:00:00Z"
  }
}
```

## Analytics API

### Query Analytics

**Method**: `analytics.query`

**Parameters**:
```json
{
  "metrics": ["conversion_rate", "open_rate", "click_rate"],
  "dimensions": ["campaign_type", "lead_source"],
  "dateRange": {
    "start": "2025-01-01",
    "end": "2025-01-31"
  },
  "filters": {
    "campaign_type": "email"
  }
}
```

**Response**:
```json
{
  "data": [
    {
      "campaign_type": "email",
      "lead_source": "website_form",
      "conversion_rate": 0.024,
      "open_rate": 0.22,
      "click_rate": 0.035,
      "date": "2025-01-15"
    }
  ],
  "summary": {
    "total_conversions": 156,
    "total_revenue": 780000,
    "average_conversion_rate": 0.021
  }
}
```

## Customer Profile API

### Get Customer Profiles

**Method**: `customers.getProfiles`

**Parameters**:
```json
{
  "filters": {
    "industry": "technology",
    "lifetimeValue": {
      "min": 10000,
      "max": 100000
    },
    "lastEngagement": {
      "after": "2025-01-01"
    }
  }
}
```

### Update Customer Profile

**Method**: `customers.updateProfile`

**Parameters**:
```json
{
  "customerId": "customer_789",
  "updates": {
    "preferences": {
      "communicationChannel": ["email", "phone"],
      "frequency": "weekly",
      "topics": ["AI", "automation"]
    },
    "segmentTags": ["high_value", "tech_enthusiast"]
  }
}
```

## Email Service API

### Send Email

**Method**: `email.send`

**Parameters**:
```json
{
  "to": "recipient@example.com",
  "subject": "Personalized Subject Line",
  "body": "Email content with personalization",
  "templateId": "template_123",
  "personalization": {
    "name": "John Doe",
    "company": "TechCorp"
  },
  "trackingEnabled": true
}
```

**Response**:
```json
{
  "messageId": "msg_456",
  "status": "delivered",
  "deliveryTime": 1250,
  "timestamp": "2025-01-15T10:30:00Z"
}
```

### Track Email Event

**Method**: `email.trackEvent`

**Parameters**:
```json
{
  "messageId": "msg_456",
  "event": "opened",
  "timestamp": "2025-01-15T10:35:00Z",
  "metadata": {
    "userAgent": "Mozilla/5.0...",
    "ipAddress": "192.168.1.1"
  }
}
```

## WebSocket Events

### Agent Registration

```json
{
  "type": "agent_register",
  "agentId": "triage_agent_001",
  "agentType": "lead_triage",
  "capabilities": ["lead_categorization", "lead_scoring"]
}
```

### Agent Handoff

```json
{
  "type": "AGENT_HANDOFF",
  "agentId": "triage_agent_001",
  "payload": {
    "targetAgent": "engagement_agent_001",
    "context": {
      "leadId": "lead_123",
      "category": "hot_prospect",
      "score": 85
    },
    "reason": "Lead qualified for immediate engagement"
  }
}
```

### Memory Update

```json
{
  "type": "MEMORY_UPDATE",
  "agentId": "engagement_agent_001",
  "payload": {
    "memoryType": "semantic",
    "data": {
      "concept": "successful_email_pattern",
      "pattern": "personalized_subject_high_open_rate",
      "confidence": 0.85
    }
  }
}
```

### Performance Alert

```json
{
  "type": "PERFORMANCE_ALERT",
  "agentId": "optimization_agent_001",
  "payload": {
    "campaignId": "campaign_456",
    "alertType": "low_conversion_rate",
    "severity": "medium",
    "metrics": {
      "current_rate": 0.008,
      "threshold": 0.015
    },
    "recommendations": [
      "optimize_subject_line",
      "adjust_send_time"
    ]
  }
}
```

## Error Codes

| Code | Message | Description |
|------|---------|-------------|
| -32700 | Parse error | Invalid JSON received |
| -32600 | Invalid Request | JSON-RPC format error |
| -32601 | Method not found | Requested method doesn't exist |
| -32602 | Invalid params | Invalid method parameters |
| -32603 | Internal error | Server-side error |
| -32000 | Rate limit exceeded | Too many requests |
| -32001 | Authentication failed | Invalid or missing API key |
| -32002 | Authorization failed | Insufficient permissions |

## Rate Limiting

- **Default Limit**: 100 requests per minute per IP
- **Burst Limit**: 10 requests per second
- **Headers**: Rate limit information in response headers

```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1642694400
```

## Data Models

### Lead Model

```typescript
interface Lead {
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
```

### Campaign Model

```typescript
interface Campaign {
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
```

### Customer Profile Model

```typescript
interface CustomerProfile {
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
```

## SDK Examples

### JavaScript/TypeScript

```typescript
import { MCPClient } from '@purplemerit/mcp-client';

const client = new MCPClient('https://api.purplemerit.com', 'your-api-key');

// Get leads
const leads = await client.request('marketing.getLeads', {
  filters: { category: 'hot_prospect' }
});

// Create campaign
const campaign = await client.request('marketing.createCampaign', {
  campaign: {
    name: 'New Product Launch',
    type: 'email',
    targetAudience: ['enterprise']
  }
});
```

### Python

```python
import asyncio
import aiohttp
import json

class MCPClient:
    def __init__(self, base_url, api_key):
        self.base_url = base_url
        self.api_key = api_key
    
    async def request(self, method, params=None):
        payload = {
            "jsonrpc": "2.0",
            "id": str(uuid.uuid4()),
            "method": method,
            "params": params or {}
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"{self.base_url}/mcp",
                json=payload,
                headers=headers
            ) as response:
                return await response.json()

# Usage
client = MCPClient("https://api.purplemerit.com", "your-api-key")
leads = await client.request("marketing.getLeads")
```

## WebSocket Integration

### Connection

```javascript
const ws = new WebSocket('wss://ws.purplemerit.com/agents');

ws.onopen = () => {
  // Register agent
  ws.send(JSON.stringify({
    type: 'agent_register',
    agentId: 'custom_agent_001',
    agentType: 'custom',
    capabilities: ['data_analysis']
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  handleMessage(message);
};
```

### Sending Messages

```javascript
// Send agent message
ws.send(JSON.stringify({
  type: 'agent_message',
  agentId: 'custom_agent_001',
  payload: {
    targetAgentId: 'engagement_agent',
    data: {
      leadId: 'lead_123',
      recommendation: 'immediate_followup'
    }
  }
}));
```

## Webhook Integration

### Campaign Events

```http
POST /webhooks/campaign-events
Content-Type: application/json
X-Webhook-Signature: sha256=...

{
  "event": "campaign.completed",
  "campaignId": "campaign_456",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "finalMetrics": {
      "sent": 2500,
      "converted": 37,
      "revenue": 185000
    }
  }
}
```

### Lead Events

```http
POST /webhooks/lead-events
Content-Type: application/json

{
  "event": "lead.qualified",
  "leadId": "lead_123",
  "timestamp": "2025-01-15T10:30:00Z",
  "data": {
    "category": "hot_prospect",
    "score": 85,
    "triageAgent": "triage_agent_001"
  }
}
```

## Performance Considerations

### Pagination

All list endpoints support pagination:

```json
{
  "pagination": {
    "page": 1,
    "limit": 50,
    "offset": 0
  }
}
```

### Caching

- **Cache Headers**: Responses include appropriate cache headers
- **ETags**: Support for conditional requests
- **TTL**: Configurable time-to-live for cached responses

### Bulk Operations

```json
{
  "method": "marketing.bulkUpdateLeads",
  "params": {
    "updates": [
      {
        "leadId": "lead_123",
        "status": "contacted"
      },
      {
        "leadId": "lead_124",
        "status": "qualified"
      }
    ]
  }
}
```

## Testing

### Health Check

```http
GET /health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-01-15T10:30:00Z",
  "version": "1.0.0",
  "services": {
    "database": "healthy",
    "memory": "healthy",
    "agents": "healthy"
  }
}
```

### System Ping

```json
{
  "method": "system.ping",
  "params": {}
}
```

Response:
```json
{
  "result": {
    "pong": true,
    "timestamp": "2025-01-15T10:30:00Z",
    "latency": 45
  }
}
```

## Error Handling

### Retry Strategy

```javascript
async function requestWithRetry(client, method, params, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await client.request(method, params);
    } catch (error) {
      if (attempt === maxRetries || !isRetryableError(error)) {
        throw error;
      }
      await delay(Math.pow(2, attempt) * 1000); // Exponential backoff
    }
  }
}
```

### Circuit Breaker

```javascript
class CircuitBreaker {
  constructor(threshold = 5, timeout = 60000) {
    this.failureThreshold = threshold;
    this.timeout = timeout;
    this.failureCount = 0;
    this.state = 'CLOSED'; // CLOSED, OPEN, HALF_OPEN
    this.nextAttempt = Date.now();
  }

  async execute(operation) {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttempt) {
        throw new Error('Circuit breaker is OPEN');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
}
```

## Security Best Practices

### API Key Management

- Use environment variables for API keys
- Rotate keys regularly
- Implement key scoping for different permissions
- Monitor key usage and detect anomalies

### Request Validation

```typescript
import Joi from 'joi';

const leadSchema = Joi.object({
  name: Joi.string().required().max(100),
  email: Joi.string().email().required(),
  company: Joi.string().max(100),
  source: Joi.string().valid('website_form', 'referral', 'social_media').required()
});

// Validate request
const { error, value } = leadSchema.validate(request.params.lead);
if (error) {
  throw new ValidationError(error.details[0].message);
}
```

### Rate Limiting Configuration

```typescript
const rateLimitConfig = {
  windowMs: 60 * 1000, // 1 minute
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP',
  standardHeaders: true,
  legacyHeaders: false
};
```

## Monitoring & Observability

### Metrics Collection

```javascript
// Custom metrics
const metrics = {
  'api.requests.total': counter,
  'api.requests.duration': histogram,
  'api.errors.total': counter,
  'agents.active.count': gauge,
  'memory.usage.bytes': gauge
};
```

### Logging

```javascript
const logger = {
  info: (message, metadata) => console.log(JSON.stringify({
    level: 'info',
    message,
    timestamp: new Date().toISOString(),
    ...metadata
  })),
  error: (message, error, metadata) => console.error(JSON.stringify({
    level: 'error',
    message,
    error: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    ...metadata
  }))
};
```

## Deployment Configuration

### Environment Variables

```env
# Server Configuration
PORT=3001
NODE_ENV=production

# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/marketing_db

# Redis (for caching and sessions)
REDIS_URL=redis://localhost:6379

# API Keys
MCP_API_KEY=your_secure_api_key
WEBHOOK_SECRET=your_webhook_secret

# External Services
EMAIL_SERVICE_API_KEY=your_email_service_key
SOCIAL_MEDIA_API_KEY=your_social_media_key

# Security
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key

# Monitoring
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
```

### Docker Configuration

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY dist ./dist
COPY docs ./docs

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Start application
CMD ["node", "dist/server.js"]
```

This comprehensive API documentation provides all the necessary information for integrating with the AIML Marketing Multi-Agent System, including authentication, request/response formats, error handling, and best practices for production deployment.