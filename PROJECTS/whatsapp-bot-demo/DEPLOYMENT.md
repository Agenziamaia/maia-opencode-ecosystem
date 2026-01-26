# Deployment & Operations Guide

## Quick Start (5 Minutes)

### 1. Install Dependencies

```bash
cd "/Users/g/Desktop/MAIA opencode/whatsapp-agentic-bot"
./scripts/setup.sh
```

### 2. Configure Environment

```bash
# Edit .env with your API keys
nano .env
```

Required variables:

- `SPOKI_API_KEY`: WhatsApp API key
- `SMOBU_API_KEY`: Property management API
- `OPENAI_API_KEY`: For concierge Q&A (optional)

### 3. Run Locally (Development)

```bash
npm run dev
```

### 4. Run 24/7 (Production)

```bash
./scripts/setup-launchd.sh
```

---

## Monitoring

### Check Health Status

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-22T10:30:00.000Z",
  "uptime": 3600.5,
  "services": {
    "redis": true,
    "database": true
  }
}
```

### View Logs

#### Real-time logs

```bash
# All logs
npm run logs:tail

# Health check logs
npm run logs:health

# Error logs only
npm run logs:error
```

#### Launchd logs (production)

```bash
tail -f logs/launchd-stdout.log
tail -f logs/launchd-stderr.log
```

### Check Redis Status

```bash
redis-cli ping
# Should return: PONG

redis-cli info stats
# View Redis statistics
```

### Check Database

```bash
sqlite3 data/hotel-bot.db "SELECT COUNT(*) FROM bookings;"
sqlite3 data/hotel-bot.db "SELECT * FROM messages ORDER BY created_at DESC LIMIT 5;"
```

---

## Operations

### Managing Services

#### Start Services

```bash
# Development
npm run dev

# Production (if using launchd, automatic)
launchctl load ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist
```

#### Stop Services

```bash
# Development
Ctrl+C

# Production
launchctl unload ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist
```

#### Restart Services

```bash
# Development
# Stop and start again

# Production
launchctl kickstart -k gui/$(id -u)/com.hotelbot.whatsapp-agentic-bot
```

### Manual Testing

#### Send Test Message

```bash
curl -X POST http://localhost:3000/test/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+1234567890",
    "message": "Test message from bot"
  }'
```

#### Check Queue Status

```bash
# Using BullMQ Board (optional UI)
npm install -g @bull-board/api @bull-board/express
```

### Troubleshooting

#### Service Not Starting

1. Check Redis:

   ```bash
   redis-cli ping
   ```

2. Check logs:

   ```bash
   tail -100 logs/error.log
   ```

3. Verify environment:
   ```bash
   cat .env | grep -v SECRET
   ```

#### Messages Not Sending

1. Check API keys:

   ```bash
   # Verify Spoki API key
   curl -H "Authorization: Bearer YOUR_KEY" https://api.spoki.com/v1/health
   ```

2. Check job queue:

   ```bash
   redis-cli KEYS "bull:whatsapp-messages:*"
   redis-cli LLEN "bull:whatsapp-messages:waiting"
   ```

3. Check message status:
   ```bash
   sqlite3 data/hotel-bot.db "SELECT * FROM messages WHERE status = 'failed';"
   ```

#### High Memory Usage

1. Restart Redis:

   ```bash
   redis-cli FLUSHDB
   # Or
   brew services restart redis
   ```

2. Check logs for leaks:
   ```bash
   grep "memory" logs/health.log
   ```

---

## Maintenance

### Daily Tasks

- [ ] Check `logs/health.log` for errors
- [ ] Verify message delivery (check sent messages in Spoki)
- [ ] Monitor memory usage

### Weekly Tasks

- [ ] Review failed messages in database
- [ ] Check dead letter queue in Redis
- [ ] Archive old logs (older than 30 days)

### Monthly Tasks

- [ ] Backup database: `cp data/hotel-bot.db data/backups/hotel-bot-$(date +%Y%m%d).db`
- [ ] Review agent logs for patterns
- [ ] Update dependencies: `npm update`

### Update Process

```bash
# 1. Pull latest code
git pull

# 2. Install updated dependencies
npm install

# 3. Build TypeScript
npm run build

# 4. Restart services
# Development: stop and start
# Production:
launchctl unload ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist
launchctl load ~/Library/LaunchAgents/com.hotelbot.whatsapp-agentic-bot.plist
```

---

## Security

### API Key Management

1. Never commit `.env` file
2. Rotate keys periodically
3. Use separate keys for dev/prod
4. Monitor API usage for anomalies

### Access Control

1. Restrict webhook endpoint (add authentication if needed)
2. Use HTTPS for production (if exposing to internet)
3. Validate all incoming webhooks
4. Rate limit API endpoints

### Data Protection

1. Regular backups of database
2. Encrypt sensitive data at rest
3. Secure Redis with password
4. Use firewall rules to restrict access

---

## Performance Tuning

### Redis Optimization

```bash
# In redis.conf
maxmemory 256mb
maxmemory-policy allkeys-lru
save 900 1
save 300 10
```

### Worker Concurrency

Edit `.env`:

```env
WORKER_CONCURRENCY=10
MAX_CONCURRENT_API_CALLS=50
```

### Database Optimization

```bash
# Vacuum database
sqlite3 data/hotel-bot.db "VACUUM;"

# Analyze query performance
sqlite3 data/hotel-bot.db "EXPLAIN QUERY PLAN SELECT * FROM bookings WHERE status = 'confirmed';"
```

---

## Scaling

### Vertical Scaling

- Increase Mac resources (more RAM)
- Adjust worker concurrency

### Horizontal Scaling

- Migrate to VPS (see MIGRATION.md)
- Use external Redis (Redis Cloud)
- Use PostgreSQL instead of SQLite

---

## Alerts

### Setup Email Alerts

Add to `src/utils/monitoring.ts`:

```typescript
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ALERT_EMAIL,
    pass: process.env.ALERT_PASSWORD,
  },
});

async function sendAlert(subject: string, message: string) {
  await transporter.sendMail({
    from: process.env.ALERT_EMAIL,
    to: process.env.ADMIN_EMAIL,
    subject,
    text: message,
  });
}
```

### Alert Conditions

- Service down for > 5 minutes
- More than 10 failed messages in 1 hour
- Database connection failed
- Redis connection failed

---

## Emergency Procedures

### Complete System Failure

1. **Check power/network**
2. **Restart Redis**: `brew services restart redis`
3. **Check logs**: `tail -100 logs/error.log`
4. **Restart service**: See "Managing Services" above

### Database Corruption

1. **Restore from backup**:

   ```bash
   cp data/backups/hotel-bot-YYYYMMDD.db data/hotel-bot.db
   ```

2. **Verify integrity**:
   ```bash
   sqlite3 data/hotel-bot.db "PRAGMA integrity_check;"
   ```

### API Rate Limits

1. **Increase delay** in `.env`:

   ```env
   WEBHOOK_RETRY_DELAY_MS=5000
   ```

2. **Upgrade API plan** if limits exceeded

---

## Support & Resources

### Documentation

- `README.md`: Project overview
- `COST_ANALYSIS.md`: Cost comparison
- `MIGRATION.md`: Cloud migration guide

### Logs Location

- Application logs: `logs/app-YYYY-MM-DD.log`
- Health logs: `logs/health-YYYY-MM-DD.log`
- Error logs: `logs/error-YYYY-MM-DD.log`
- Launchd logs: `logs/launchd-*.log`

### Configuration Files

- Environment: `.env`
- TypeScript: `tsconfig.json`
- Launchd: `com.hotelbot.whatsapp-agentic-bot.plist`

---

## Best Practices

1. **Test locally before production**: Always test changes in dev mode
2. **Monitor regularly**: Check logs daily
3. **Backup often**: At least weekly database backups
4. **Update dependencies**: Monthly security updates
5. **Document changes**: Update README when modifying behavior
6. **Use environment-specific configs**: Separate dev/prod .env files

---

## Troubleshooting Matrix

| Symptom              | Likely Cause       | Solution                     |
| -------------------- | ------------------ | ---------------------------- |
| Service won't start  | Redis not running  | `brew services start redis`  |
| Messages not sending | Invalid API key    | Check `.env` and API console |
| High memory usage    | Redis not clearing | `redis-cli FLUSHDB`          |
| Database errors      | Corrupted DB file  | Restore from backup          |
| Webhooks failing     | Network issue      | Check internet connection    |
| Agent not responding | OpenAI API down    | Check status.openai.com      |

---

## Success Metrics

Track these to ensure system health:

- **Uptime**: Should be > 99%
- **Message success rate**: Should be > 95%
- **Response time**: Webhook response < 2s
- **Database queries**: < 100ms average
- **Memory usage**: < 2GB

---

## Conclusion

This system is designed to be:

- ✅ **Reliable**: Auto-restart, retry logic
- ✅ **Observable**: Comprehensive logging
- ✅ **Maintainable**: Clear structure, good docs
- ✅ **Cost-effective**: $0 monthly cost
- ✅ **Scalable**: Easy migration to cloud

Follow this guide for smooth operations.
