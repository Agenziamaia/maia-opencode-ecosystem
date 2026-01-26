# Migration Guide: From Local to Cloud

## Overview

This guide explains how to migrate the WhatsApp Agentic Bot from local macOS to cloud infrastructure when needed.

---

## Migration Decision Tree

```
Start Local
    |
    ├── Is Mac stable 24/7? ── Yes ── Stay Local (Cost: $0)
    |
    └── No
        |
        ├── Need cheap solution? ── Yes ── Cheap VPS (Cost: $6/mo)
        |
        └── Need enterprise features?
            |
            └── Yes ── trigger.dev or Temporal (Cost: $100+/mo)
```

---

## Stage 1: Containerization (Docker)

### Why Docker?

- Consistent environment across local and cloud
- Easy deployment
- Scalable architecture

### Dockerfile

Create `Dockerfile`:

```dockerfile
# Base image
FROM node:20-alpine

# Install Redis (optional, or use external Redis)
RUN apk add --no-cache redis

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build TypeScript
RUN npm run build

# Create necessary directories
RUN mkdir -p logs data

# Expose ports
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start application
CMD ["npm", "run", "start"]
```

### docker-compose.yml

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # WhatsApp Agentic Bot
  bot:
    build: .
    ports:
      - '3000:3000'
    env_file:
      - .env
    volumes:
      - ./data:/app/data
      - ./logs:/app/logs
    depends_on:
      - redis
    restart: unless-stopped
    healthcheck:
      test: ['CMD', 'wget', '--no-verbose', '--tries=1', '--spider', 'http://localhost:3000/health']
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s

  # Redis (optional - use external Redis for production)
  redis:
    image: redis:7-alpine
    ports:
      - '6379:6379'
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes
    restart: unless-stopped

  # Nginx (reverse proxy - optional for production)
  nginx:
    image: nginx:alpine
    ports:
      - '80:80'
      - '443:443'
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - bot
    restart: unless-stopped

volumes:
  redis-data:
```

### .dockerignore

```
node_modules
dist
.git
.gitignore
.env
logs/*
!logs/.gitkeep
data/*
!data/.gitkeep
*.log
```

---

## Stage 2: Cloud Deployment Options

### Option A: Cheap VPS (DigitalOcean, Linode, Hetzner)

**Recommended for most use cases.**

#### Requirements

- 2GB RAM minimum
- 2 CPU cores minimum
- 20GB SSD storage
- Ubuntu 22.04 LTS

#### Setup Steps

1. **Create VPS**

   ```bash
   # On VPS
   apt update
   apt install -y docker docker-compose git curl
   ```

2. **Clone Repository**

   ```bash
   git clone https://github.com/your-repo/whatsapp-agentic-bot.git
   cd whatsapp-agentic-bot
   ```

3. **Configure Environment**

   ```bash
   cp .env.example .env
   nano .env  # Edit with your API keys
   ```

4. **Update docker-compose.yml**
   - Use external Redis (Redis Cloud or similar)
   - Set up domain name (optional)

5. **Start Services**

   ```bash
   docker-compose up -d
   ```

6. **Setup SSL (Optional)**
   ```bash
   apt install -y certbot
   certbot certonly --standalone -d yourdomain.com
   ```

#### Cost: $6/mo (2GB VPS)

#### Monitoring

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Update code
git pull
docker-compose up -d --build
```

---

### Option B: Cloud Services (AWS, GCP, Azure)

**Use if you need auto-scaling or enterprise features.**

#### AWS Setup

1. **Create ECS Cluster**

   ```bash
   aws ecs create-cluster --cluster-name hotel-bot-cluster
   ```

2. **Create Task Definition**

   ```json
   {
     "family": "hotel-bot-task",
     "containerDefinitions": [
       {
         "name": "bot",
         "image": "your-docker-registry/hotel-bot:latest",
         "memory": 2048,
         "cpu": 1024,
         "essential": true,
         "portMappings": [
           {
             "containerPort": 3000,
             "protocol": "tcp"
           }
         ]
       }
     ]
   }
   ```

3. **Create Service**

   ```bash
   aws ecs create-service \
     --cluster hotel-bot-cluster \
     --service-name hotel-bot-service \
     --task-definition hotel-bot-task \
     --desired-count 1
   ```

4. **Setup Load Balancer** (for auto-scaling)

#### Cost: $30-100/mo (depending on usage)

---

### Option C: PaaS (Railway, Render, Fly.io)

**Easiest but more expensive.**

#### Railway Setup

1. **Connect GitHub**
2. **Select Repository**
3. **Configure Environment Variables**
4. **Deploy**

#### Cost: $20-50/mo

---

## Stage 3: External Services

### Redis Cloud

Instead of running Redis locally, use Redis Cloud:

1. **Sign up**: https://redis.com/try-free/
2. **Create Database**
3. **Get Connection String**
4. **Update .env**:
   ```
   REDIS_HOST=your-redis-instance.cloud.redislabs.com
   REDIS_PORT=12345
   REDIS_PASSWORD=your-redis-password
   ```

**Cost**: Free tier (30MB) or $5-15/mo (256MB-1GB)

### Database Migration

#### Option 1: Keep SQLite

- Simpler, no migration needed
- Backup: `cp data/hotel-bot.db data/hotel-bot.db.backup`

#### Option 2: Migrate to PostgreSQL

Better for multiple instances:

```sql
-- Create PostgreSQL schema
CREATE TABLE bookings (
  id TEXT PRIMARY KEY,
  smobu_id TEXT UNIQUE NOT NULL,
  guest_name TEXT NOT NULL,
  -- ... same schema as SQLite
);
```

**Cost**: $0-15/mo (depending on provider)

---

## Stage 4: Monitoring & Logging

### Health Monitoring

#### Simple (Built-in)

```bash
# Check health endpoint
curl https://your-domain.com/health

# Monitor logs
docker-compose logs -f
```

#### Advanced (Prometheus + Grafana)

```yaml
# docker-compose.yml additions
services:
  prometheus:
    image: prom/prometheus
    ports:
      - '9090:9090'
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml

  grafana:
    image: grafana/grafana
    ports:
      - '3001:3000'
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

**Cost**: $0 (self-hosted)

### Log Aggregation

#### Simple: File-based

```bash
# Rotate logs
logrotate -f /etc/logrotate.conf
```

#### Advanced: ELK Stack

- Elasticsearch: Storage
- Logstash: Processing
- Kibana: Visualization

**Cost**: $0 (self-hosted) or $50-200/mo (managed)

---

## Stage 5: Scaling Strategies

### Vertical Scaling (Easier)

- Increase VPS size: 2GB → 4GB → 8GB
- Better for < 1,000 messages/day

### Horizontal Scaling (Better for high volume)

- Multiple bot instances
- Load balancer (Nginx, AWS ALB)
- Shared Redis
- Shared database (PostgreSQL)

**Architecture:**

```
          Load Balancer
            /    |    \
         Bot-1 Bot-2 Bot-3
           \    |    /
          Redis Cluster
               |
          PostgreSQL
```

---

## Stage 6: Backup & Disaster Recovery

### Backup Strategy

```bash
#!/bin/bash
# backup.sh

# Backup database
cp data/hotel-bot.db backups/hotel-bot-$(date +%Y%m%d-%H%M%S).db

# Backup Redis
redis-cli --rdb backups/redis-$(date +%Y%m%d-%H%M%S).rdb

# Keep last 7 days
find backups -name "*.db" -mtime +7 -delete
find backups -name "*.rdb" -mtime +7 -delete
```

### Automated Backups

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

---

## Migration Checklist

### Pre-Migration

- [ ] Test Docker locally
- [ ] Export current database
- [ ] Document current configuration
- [ ] Create backup strategy

### Migration

- [ ] Provision VPS/cloud resources
- [ ] Setup external Redis
- [ ] Deploy application
- [ ] Import database
- [ ] Configure DNS (if using domain)
- [ ] Setup SSL certificates
- [ ] Configure monitoring

### Post-Migration

- [ ] Test all webhooks
- [ ] Verify message delivery
- [ ] Monitor logs for 24h
- [ ] Update webhook URLs (Spoki, Smobu)
- [ ] Shut down local instance

---

## Rollback Plan

If cloud migration fails:

1. **Immediate**: Stop cloud services
2. **Database**: Import backup to local
3. **Webhooks**: Update URLs back to local (ngrok/tunnel)
4. **Monitor**: Ensure local instance running
5. **Investigate**: Check cloud logs for issues

---

## Cost Summary: Migration Paths

| Path        | Setup Cost | Monthly Cost | Complexity |
| ----------- | ---------- | ------------ | ---------- |
| Stay Local  | $0         | $0           | Low        |
| Cheap VPS   | $0         | $6           | Medium     |
| AWS/GCP     | $50-100    | $30-100      | High       |
| PaaS        | $0         | $20-50       | Low        |
| trigger.dev | $0         | $29+         | Low        |

---

## Recommended Path

1. **Start**: Local (free)
2. **Scale**: Cheap VPS when local becomes unreliable ($6/mo)
3. **Grow**: AWS/GCP when hitting VPS limits ($50/mo+)
4. **Migrate**: trigger.dev if you want managed service ($29/mo+)

**Never migrate before it's necessary.**
