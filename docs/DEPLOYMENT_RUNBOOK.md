# Deployment Runbook

## AIML Marketing Multi-Agent System Deployment Guide

### Overview

This runbook provides step-by-step instructions for deploying the AIML Marketing Multi-Agent System to production environments. The system consists of multiple components that must be deployed and configured correctly for optimal performance.

## Pre-Deployment Checklist

### Infrastructure Requirements

- [ ] **Compute Resources**
  - Minimum: 4 CPU cores, 8GB RAM per agent instance
  - Recommended: 8 CPU cores, 16GB RAM for production load
  - Storage: 100GB SSD for logs and temporary data

- [ ] **Network Requirements**
  - Load balancer with SSL termination
  - WebSocket support enabled
  - Firewall rules configured for ports 3001 (HTTP) and 3002 (WebSocket)

- [ ] **Database Setup**
  - PostgreSQL 14+ with connection pooling
  - Redis 6+ for caching and session management
  - Database migrations applied

- [ ] **External Services**
  - Email service provider (SendGrid, AWS SES, etc.)
  - Social media API access tokens
  - Monitoring and logging services (DataDog, Sentry)

### Security Checklist

- [ ] SSL certificates installed and configured
- [ ] API keys generated and securely stored
- [ ] Environment variables configured
- [ ] Rate limiting rules implemented
- [ ] CORS policies configured
- [ ] Audit logging enabled

## Deployment Steps

### Step 1: Environment Preparation

1. **Create deployment directory**
   ```bash
   mkdir -p /opt/aiml-marketing-system
   cd /opt/aiml-marketing-system
   ```

2. **Set up environment variables**
   ```bash
   # Create environment file
   cat > .env << EOF
   NODE_ENV=production
   PORT=3001
   WEBSOCKET_PORT=3002
   
   # Database Configuration
   DATABASE_URL=postgresql://user:password@localhost:5432/marketing_db
   REDIS_URL=redis://localhost:6379
   
   # API Keys
   MCP_API_KEY=$(openssl rand -hex 32)
   JWT_SECRET=$(openssl rand -hex 32)
   ENCRYPTION_KEY=$(openssl rand -hex 32)
   
   # External Services
   EMAIL_SERVICE_API_KEY=your_email_service_key
   SOCIAL_MEDIA_API_KEY=your_social_media_key
   
   # Monitoring
   SENTRY_DSN=your_sentry_dsn
   DATADOG_API_KEY=your_datadog_key
   
   # Security
   ALLOWED_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
   WEBHOOK_SECRET=$(openssl rand -hex 32)
   EOF
   ```

3. **Set proper permissions**
   ```bash
   chmod 600 .env
   chown app:app .env
   ```

### Step 2: Database Setup

1. **Create database and user**
   ```sql
   CREATE DATABASE marketing_db;
   CREATE USER marketing_user WITH ENCRYPTED PASSWORD 'secure_password';
   GRANT ALL PRIVILEGES ON DATABASE marketing_db TO marketing_user;
   ```

2. **Run database migrations**
   ```bash
   npm run db:migrate
   ```

3. **Verify database connection**
   ```bash
   npm run db:test-connection
   ```

### Step 3: Application Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Install production dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Create systemd service file**
   ```bash
   cat > /etc/systemd/system/aiml-marketing.service << EOF
   [Unit]
   Description=AIML Marketing Multi-Agent System
   After=network.target postgresql.service redis.service
   
   [Service]
   Type=simple
   User=app
   Group=app
   WorkingDirectory=/opt/aiml-marketing-system
   Environment=NODE_ENV=production
   EnvironmentFile=/opt/aiml-marketing-system/.env
   ExecStart=/usr/bin/node dist/server.js
   Restart=always
   RestartSec=10
   StandardOutput=journal
   StandardError=journal
   SyslogIdentifier=aiml-marketing
   
   # Security settings
   NoNewPrivileges=true
   PrivateTmp=true
   ProtectSystem=strict
   ProtectHome=true
   ReadWritePaths=/opt/aiml-marketing-system/logs
   
   [Install]
   WantedBy=multi-user.target
   EOF
   ```

4. **Enable and start the service**
   ```bash
   systemctl daemon-reload
   systemctl enable aiml-marketing
   systemctl start aiml-marketing
   ```

## Production Deployment Complete

The system is now ready for production use with:
- ✅ Complete multi-agent architecture
- ✅ Adaptive memory system
- ✅ Real-time communication
- ✅ Comprehensive monitoring
- ✅ Security hardening
- ✅ Scalability planning

## Monitoring Dashboard

Access the system at: http://localhost:5173
- Dashboard shows real-time agent status
- Lead management with automated triage
- Campaign creation and optimization
- Memory architecture visualization
- Performance analytics and insights