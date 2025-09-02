# AIML Marketing Multi-Agent System with Adaptive Memory

## Overview

This project implements a sophisticated AI-driven marketing automation system featuring three specialized agents that collaborate to optimize lead management, campaign execution, and customer engagement. The system incorporates adaptive memory architecture enabling continuous learning and improvement from customer interactions.

## System Architecture

### Core Components

1. **Lead Triage Agent** - Intelligent lead categorization and scoring
2. **Engagement Agent** - Personalized outreach and campaign management
3. **Campaign Optimization Agent** - Performance monitoring and automated optimization
4. **Adaptive Memory System** - Multi-layered memory architecture for learning
5. **MCP Protocol Integration** - Secure data access and communication
6. **WebSocket Communication** - Real-time agent coordination

### Memory Architecture

The system implements a four-tier memory architecture:

- **Short-term Memory**: Current conversation contexts and active processing
- **Long-term Memory**: Customer profiles, campaign history, performance metrics
- **Episodic Memory**: Successful interaction patterns and problem resolutions
- **Semantic Memory**: Domain knowledge graphs and learned concepts

## Features

### Lead Management
- Automated lead categorization and scoring
- Duplicate detection and data enrichment
- Real-time lead processing pipeline
- Intelligent lead routing and prioritization

### Campaign Management
- Multi-channel campaign creation and execution
- Personalized content generation
- A/B testing and optimization
- Performance monitoring and alerts

### Analytics & Insights
- Real-time performance dashboards
- Predictive analytics for campaign outcomes
- Memory usage visualization
- System health monitoring

### Adaptive Learning
- Continuous learning from customer interactions
- Pattern recognition and extraction
- Cross-agent knowledge sharing
- Memory consolidation and optimization

## Technical Implementation

### Technology Stack
- **Frontend**: React 18, TypeScript, Tailwind CSS, Framer Motion
- **Communication**: WebSocket, JSON-RPC 2.0, MCP Protocol
- **Memory**: In-memory storage with persistence simulation
- **Visualization**: Recharts, Custom SVG components
- **Security**: Helmet, CORS, Rate limiting

### Agent Communication
Agents communicate through:
- WebSocket connections for real-time updates
- JSON-RPC 2.0 protocol for structured messaging
- MCP (Model Context Protocol) for secure data access
- Event-driven architecture for loose coupling

### Memory Management
- Automatic memory consolidation
- Pattern extraction from episodic memories
- Semantic knowledge graph updates
- Memory decay to prevent information overload

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Access the application at `http://localhost:5173`

### Development

The system automatically initializes with sample data for demonstration purposes. The following components are available:

- **Dashboard**: System overview and real-time metrics
- **Lead Management**: Lead processing and categorization
- **Campaign Manager**: Campaign creation and monitoring
- **Analytics**: Performance insights and trends
- **Memory Visualization**: Memory architecture monitoring
- **Settings**: System configuration and optimization

## API Documentation

### MCP Protocol Endpoints

#### Lead Management
- `marketing.getLeads` - Retrieve leads with filtering
- `marketing.createLead` - Create new lead
- `marketing.updateLead` - Update lead information

#### Campaign Management
- `marketing.getCampaigns` - Retrieve campaigns
- `marketing.createCampaign` - Create new campaign
- `marketing.updateCampaign` - Update campaign settings

#### Analytics
- `analytics.query` - Query performance metrics
- `customers.getProfiles` - Retrieve customer profiles

#### Email Services
- `email.send` - Send personalized emails
- `email.trackEvent` - Track email interactions

### WebSocket Events

#### Agent Communication
- `AGENT_HANDOFF` - Transfer context between agents
- `MEMORY_UPDATE` - Share memory updates
- `CAMPAIGN_UPDATE` - Campaign status changes
- `PERFORMANCE_ALERT` - Performance threshold alerts

## Security Features

- API key authentication
- Rate limiting (100 requests/minute)
- CORS protection
- Request validation
- Audit logging
- Encrypted communication

## Performance Optimization

### Memory Optimization
- Automatic memory consolidation
- Pattern-based compression
- Relevance-based retrieval
- Configurable decay factors

### System Optimization
- Connection pooling
- Message queuing
- Retry mechanisms with exponential backoff
- Health monitoring and auto-recovery

## Scalability Considerations

### 10x Load Increase Strategy

1. **Horizontal Scaling**
   - Agent instance replication
   - Load balancer implementation
   - Database sharding

2. **Memory Optimization**
   - Distributed memory architecture
   - Redis/Memcached integration
   - Intelligent caching strategies

3. **Communication Optimization**
   - Message broker integration (RabbitMQ/Apache Kafka)
   - Connection pooling
   - Async processing queues

4. **Database Optimization**
   - Read replicas
   - Query optimization
   - Indexing strategies

## Deployment

### Production Deployment

1. **Environment Setup**
   ```bash
   npm run build
   ```

2. **Docker Deployment**
   ```dockerfile
   FROM node:18-alpine
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci --only=production
   COPY dist ./dist
   EXPOSE 3000
   CMD ["npm", "start"]
   ```

3. **Environment Variables**
   ```env
   NODE_ENV=production
   MCP_API_URL=https://api.purplemerit.com
   MCP_API_KEY=your_api_key
   WEBSOCKET_URL=wss://ws.purplemerit.com
   ```

### Monitoring & Observability

- Application performance monitoring (APM)
- Error tracking and alerting
- Memory usage monitoring
- Agent performance metrics
- System health dashboards

## Testing

### Unit Tests
```bash
npm run test
```

### Integration Tests
```bash
npm run test:integration
```

### Performance Tests
```bash
npm run test:performance
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit pull request with detailed description

## License

This project is proprietary to Purple Merit Technologies.

## Support

For technical support or questions, contact: career@purplemerit.com