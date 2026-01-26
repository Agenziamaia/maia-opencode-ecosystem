# Hybrid Architecture Quick Start Guide

This guide will help you implement the hybrid WhatsApp bot architecture with Trigger.dev cloud integration.

---

## 🚀 Prerequisites

- Mac with existing WhatsApp bot running
- Node.js 20+
- Redis (local)
- Coolify account (free tier)
- Trigger.dev account (free tier)
- Domain name (for Cloudflare Tunnel)
- VPS (Hetzner/DigitalOcean, 2GB RAM, $5/mo)

---

## 📋 Implementation Roadmap (6 Weeks)

### Week 1: Local Infrastructure

**Day 1-2: Setup Service Mesh Gateway**

```bash
# 1. Install dependencies
cd whatsapp-agentic-bot
npm install express-rate-limit opossum

# 2. Build TypeScript
npm run build

# 3. Test gateway
npm run dev:gateway

# Verify: curl http://localhost:3001/health
```

**Day 3-4: Cloudflare Tunnel Setup**

```bash
# 1. Install cloudflared
brew install cloudflared

# 2. Create tunnel
cloudflared tunnel create whatsapp-bot-tunnel

# 3. Configure tunnel
cat > config.yml <<EOF
tunnel: <TUNNEL_ID>
credentials-file: ~/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: bot.yourdomain.com
    service: http://localhost:3001
  - service: http_status:404
EOF

# 4. Start tunnel (in background)
cloudflared tunnel --config config.yml run &

# 5. Test external access
curl https://bot.yourdomain.com/health
```

**Day 5: Event Buffering**

```bash
# Test event buffering with Trigger.dev offline
curl -X POST http://localhost:3001/api/mesh/events \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your_api_key" \
  -d '{
    "type": "test",
    "source": "local",
    "payload": { "message": "test event" }
  }'
```

---

### Week 2: Backup VPS

**Day 1-2: Provision VPS**

```bash
# 1. Create VPS on Hetzner
# CX22 instance (2GB RAM, €4.50/mo)
# Ubuntu 22.04

# 2. SSH into VPS
ssh root@your-vps-ip

# 3. Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 4. Install Coolify
curl -fsSL https://cdn.coollabs.io/coolify/install.sh | bash
```

**Day 3-4: Deploy Backup Stack**

```bash
# On VPS:

# 1. Clone repository
git clone <your-repo>
cd whatsapp-agentic-bot

# 2. Copy environment file
cp .env.hybrid.example .env
nano .env

# 3. Update variables:
# - LOCAL_MAC_IP (your Mac's IP)
# - BACKUP_VPS_USER
# - BACKUP_VPS_PASSWORD
# - POSTGRES_PASSWORD
# - GRAFANA_PASSWORD

# 4. Start Coolify stack
docker-compose -f config/coolify-compose.yml up -d

# 5. Verify services
docker ps

# 6. Access Grafana
# http://vps-ip:3001
# Login: admin / <GRAFANA_PASSWORD>
```

**Day 5: Configure Backup Sync**

```bash
# On Mac:

# 1. Setup SSH keys
ssh-keygen -t ed25519
ssh-copy-id root@your-vps-ip

# 2. Test backup script
cd whatsapp-agentic-bot
./scripts/backup/backup.sh

# 3. Schedule cron (every 15 minutes)
crontab -e

# Add line:
*/15 * * * * /Users/g/Desktop/MAIA\ opencode/whatsapp-agentic-bot/scripts/backup/backup.sh

# 4. Verify sync on VPS
ssh root@your-vps-ip
ls -lh /backups/data/
```

---

### Week 3: Trigger.dev Integration

**Day 1-2: Setup Trigger.dev**

```bash
# 1. Install Trigger.dev CLI
npm install -g trigger.dev

# 2. Initialize project
cd whatsapp-agentic-bot
trigger.dev init

# 3. Follow prompts:
# - Account: (sign up at trigger.dev)
# - Project: whatsapp-hybrid-bot
# - API Key: (copy from dashboard)

# 4. Create first job
cp jobs/flight-delay-job.ts .
cp jobs/email-reservation-job.ts .

# 5. Test locally
trigger.dev dev

# 6. Deploy
trigger.dev deploy
```

**Day 3-4: Configure Flight Monitoring**

```bash
# 1. Get FlightAware API key
# Sign up at: https://flightaware.com/commercial

# 2. Update .env
FLIGHTAWARE_API_KEY=your_key_here

# 3. Test flight delay job
curl -X POST https://api.trigger.dev/v1/events \
  -H "Authorization: Bearer your_trigger_dev_key" \
  -d '{
    "name": "flight.delay.detected",
    "payload": {
      "flightNumber": "AA123",
      "delayMinutes": 45,
      "newArrivalTime": "2026-01-22T15:30:00Z"
    }
  }'

# 4. Check Trigger.dev dashboard
# View job execution logs
```

**Day 5: Email Parsing Setup**

```bash
# 1. Create email parser service
# (See jobs/email-reservation-job.ts)

# 2. Test email parsing
# Send test email to configured Gmail

# 3. Check Trigger.dev logs
# Email should be parsed and guest created
```

---

### Week 4: Agentic Workflows

**Day 1-2: Analytics Agent**

```typescript
// Create jobs/analytics-agent.ts
// Analyze guest behavior patterns
// Generate weekly reports

// Deploy:
trigger.dev deploy
```

**Day 3-4: Predictive Agent**

```typescript
// Create jobs/predictive-agent.ts
// Predict guest needs based on history
// Suggest upsells at optimal times

// Deploy:
trigger.dev deploy
```

**Day 5: Translation Agent**

```typescript
// Create jobs/translation-agent.ts
// Detect guest language from messages
// Auto-translate responses

// Deploy:
trigger.dev deploy
```

---

### Week 5: Cost Optimization

**Day 1-2: Pause/Resume Jobs**

```bash
# 1. Create pause job
# (See jobs/cost-monitor-job.ts)

# 2. Test pause
curl -X POST http://localhost:3001/api/mesh/commands \
  -H "X-API-Key: your_key" \
  -d '{"action": "PAUSE_WORKERS"}'

# 3. Test resume
curl -X POST http://localhost:3001/api/mesh/commands \
  -H "X-API-Key: your_key" \
  -d '{"action": "RESUME_WORKERS"}'

# 4. Deploy
trigger.dev deploy
```

**Day 3-4: Job Consolidation**

```typescript
// Batch multiple notifications
// Instead of individual jobs, send batches

// Deploy:
trigger.dev deploy
```

**Day 5: Cost Monitoring**

```bash
# 1. Setup Slack webhook
# https://api.slack.com/messaging/webhooks

# 2. Add to .env
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# 3. Test alert
curl -X POST $SLACK_WEBHOOK_URL \
  -H "Content-Type: application/json" \
  -d '{"text": "Test alert from WhatsApp bot"}'

# 4. Monitor cost
# Trigger.dev dashboard -> Usage
```

---

### Week 6: Testing & Launch

**Day 1-2: End-to-End Testing**

| Test              | Command                     | Expected         |
| ----------------- | --------------------------- | ---------------- |
| WhatsApp message  | Send via Spoki              | < 500ms response |
| Flight delay      | curl to Trigger.dev         | Guest notified   |
| Email reservation | Send email                  | Guest created    |
| Mac failover      | Unplug Mac                  | VPS takes over   |
| Restore           | ./scripts/backup/restore.sh | System recovered |

**Day 3-4: Performance Tuning**

```bash
# 1. Adjust worker concurrency
# Edit .env
WORKER_CONCURRENCY=10

# 2. Tune Redis
# Edit redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru

# 3. Restart services
redis-cli FLUSHALL
brew services restart redis
```

**Day 5: Production Launch**

```bash
# 1. Final health check
curl https://bot.yourdomain.com/health

# 2. Verify all services
# - Local bot: running
# - Service mesh: running
# - Cloudflare tunnel: connected
# - Backup VPS: syncing
# - Trigger.dev: workers running

# 3. Setup monitoring alerts
# - Grafana: email alerts
# - Slack: critical errors
# - PagerDuty: optional

# 4. Document handoff
# Create ops runbook:
# - Start/stop procedures
# - Emergency contacts
# - Backup locations
# - Cost monitoring
```

---

## 📊 Monitoring Dashboard

Access your Grafana dashboard:

```
http://your-vps-ip:3001
Username: admin
Password: <GRAFANA_PASSWORD>
```

**Key Metrics to Watch**:

- **Uptime**: Should be > 99%
- **Message Success Rate**: > 95%
- **Queue Depth**: < 100
- **Trigger.dev Cost**: < $5/mo
- **Memory Usage**: < 2GB

---

## 🔄 Daily Operations

```bash
# Check health
curl https://bot.yourdomain.com/health

# View logs
npm run logs:tail

# Check queue
redis-cli KEYS "bull:*"

# Monitor Trigger.dev
# Visit dashboard.trigger.dev

# View backups
ls -lh backups/data/
```

---

## 🚨 Emergency Procedures

### Mac Power Failure

```bash
# On VPS, workers auto-activate
# When Mac returns:

cd /Users/g/Desktop/MAIA\ opencode/whatsapp-agentic-bot
./scripts/backup/restore.sh vps latest

# Verify
redis-cli KEYS "bull:*"
curl http://localhost:3000/health
```

### Database Corruption

```bash
# Restore from backup
./scripts/backup/restore.sh local 20260122_100000

# Verify integrity
sqlite3 data/hotel-bot.db "PRAGMA integrity_check;"
```

### Trigger.dev Outage

```bash
# Events are buffered locally
# When service returns, events auto-replay

# Check buffered events
redis-cli LRANGE "mesh-events:waiting" 0 10
```

---

## 💰 Cost Breakdown

| Component             | Cost              |
| --------------------- | ----------------- |
| **Mac (always-on)**   | $0                |
| **VPS (2GB)**         | $5/mo             |
| **Trigger.dev**       | $5/mo (free tier) |
| **Cloudflare Tunnel** | $0                |
| **Total**             | **$10/mo**        |

**Cost Optimization Tips**:

1. Pause Trigger.dev at 2 AM (low traffic)
2. Use batch jobs instead of individual
3. Process locally when possible
4. Monitor cost weekly

---

## 📚 Additional Resources

- **Architecture Doc**: `HYBRID_ARCHITECTURE.md`
- **Service Mesh**: `src/gateway/service-mesh.ts`
- **Trigger.dev Jobs**: `jobs/*.ts`
- **Coolify Config**: `config/coolify-compose.yml`
- **Backup Scripts**: `scripts/backup/`

---

## 🆘 Support

**Documentation**:

- Trigger.dev: https://trigger.dev/docs
- Coolify: https://coolify.io/docs
- BullMQ: https://docs.bullmq.io

**Community**:

- Slack: #whatsapp-hybrid-bot
- GitHub: issues/<your-repo>

**Emergency Contact**:

- Email: admin@yourdomain.com
- Slack: @ops-alerts

---

## ✨ Success Criteria

- [x] Local bot running 24/7
- [x] Service mesh gateway accessible via HTTPS
- [x] Backup VPS syncing every 15m
- [x] Trigger.dev jobs executing successfully
- [x] Flight delay alerts working
- [x] Email reservations parsing
- [x] Cost < $10/mo
- [x] Grafana dashboard active
- [x] Backup/restore tested

---

**Status**: 🚀 READY TO DEPLOY
**Last Updated**: 2026-01-22
**Version**: 1.0.0
