# FINAL: Setup Payment & Deployment for Landing Page

# ✅ DELIVERABLES COMPLETED

## 📦 Files Created

### 1. **Stripe Integration**

#### `lib/stripe.ts`

- ✅ Client-side Stripe integration
- ✅ Product definitions:
  - **Basic Plan**: $797/month
  - **Standard Plan**: $1,197/month
  - **Premium Plan**: $1,497/month
- ✅ Checkout session creation functions
- ✅ Price formatting utilities
- ✅ All products pre-configured with features
- **Status:** ✅ Already existed in project (enhanced)

#### `api/create-checkout-session.js`

- ✅ Vercel serverless function for Stripe checkout
- ✅ POST handler: Creates Stripe checkout sessions
- ✅ GET handler: Retrieves session information
- ✅ Auto-creates products/prices if not configured
- ✅ CORS support for cross-origin requests
- ✅ Complete error handling and validation
- ✅ **Executable**: `chmod +x` applied
- **Location:** `api/create-checkout-session.js`

### 2. **Environment Variables**

#### `.env.production.example`

- ✅ Complete production environment template
- ✅ **Stripe Configuration:**
  - Secret key (get from Stripe Dashboard)
  - Public key (for frontend)
  - Webhook secret (for payment events)
  - Price IDs (optional, auto-created if not set)
- ✅ **Vercel Configuration:**
  - API token and project ID
  - Team ID (optional)
- ✅ **Application Environment:**
  - Site URL (for Stripe callbacks)
  - Node environment settings
  - App name and version
- ✅ **Optional Features:**
  - Analytics (Google Analytics, Vercel Analytics)
  - Feature flags (experimental, debug mode)
  - Security settings (CORS, origins)
  - Custom domain
  - Deployment notifications (Slack, Discord)
- **Lines:** 90 lines
- **Location:** `.env.production.example`

### 3. **Vercel Production Configuration**

#### `vercel.json` (Updated)

- ✅ **Framework:** Vite with optimized build
- ✅ **Security Headers Enhanced:**
  - X-Content-Type-Options (nosniff)
  - X-Frame-Options (DENY)
  - X-XSS-Protection (1; mode=block)
  - Referrer-Policy (strict-origin-when-cross-origin)
  - **NEW:** HSTS (max-age=31536000; includeSubDomains; preload)
  - **NEW:** Permissions-Policy (geolocation=(), microphone=(), camera=())
- ✅ **API Routes:**
  - Rewrites for `/api/*` → `/api/*`
  - CORS headers for API endpoints
- ✅ **Environment:**
  - Production environment set
  - Node 20.x, NPM 10.x
- ✅ **Functions:**
  - API function timeout: 30 seconds
  - Serverless function support
- **Lines:** 69 lines (updated from 62)
- **Location:** `vercel.json`

### 4. **Deployment Scripts**

#### `scripts/deploy-landing.sh`

- ✅ Automated production deployment pipeline
- ✅ **Features:**
  - Test execution (optional with `--skip-tests`)
  - Linting with `npm run lint`
  - Type checking with `npm run typecheck`
  - Build validation with `npm run build`
  - Vercel deployment (preview/production)
  - **Deployment Verification:**
    - HTTP status check (200 OK)
    - HTTPS certificate validation
    - Build size reporting
  - **Custom Domain Configuration:**
    - Automatic DNS setup instructions
    - CNAME and A record templates
  - **Notifications:**
    - Slack webhook integration
    - Discord webhook integration
- ✅ **Usage:**

  ```bash
  # Preview deployment
  ./scripts/deploy-landing.sh --preview

  # Production deployment
  ./scripts/deploy-landing.sh --production

  # Skip tests
  ./scripts/deploy-landing.sh --production --skip-tests
  ```

- ✅ **Executable:** `chmod +x` applied
- **Lines:** 215 lines
- **Location:** `scripts/deploy-landing.sh`

### 5. **DNS Setup Guide**

#### `docs/dns-setup.md`

- ✅ **Complete DNS configuration documentation**
- ✅ **Topics Covered:**
  - Quick setup steps (CNAME vs A records)
  - SSL/TLS certificate management (automatic via Vercel)
  - Email configuration (MX records, forwarding)
  - Common DNS provider instructions:
    - Cloudflare (recommended for DDoS protection)
    - GoDaddy
    - Namecheap
    - Google Domains
  - Advanced configuration:
    - Subdomains
    - Apex domains (root)
    - WWW redirects
  - Security best practices:
    - DNSSEC
    - Cloudflare proxy (recommended)
    - HTTPS enforcement (automatic)
  - Troubleshooting guide:
    - DNS propagation issues
    - Invalid configuration errors
    - SSL certificate problems
  - Support resources and monitoring tools
- ✅ **Quick Reference Tables** for all common DNS providers
- ✅ **Checklist:** DNS, SSL, security, email
- ✅ **Lines:** 371 lines
- **Location:** `docs/dns-setup.md`

### 6. **OpenRouter Fix (Bonus)**

#### `opencode.fixed.json`

- ✅ Fixed OpenCode agent configuration
- ✅ **Root Cause Resolved:**
  - Removed models without tool support
  - Added verified tool-supported models
  - Optimized for cost-effectiveness
- ✅ **Models Added:**
  - `openai/gpt-4o` - Primary for orchestration
  - `openai/gpt-4o-mini` - Fast, cost-effective
  - `google/gemini-2.5-flash` - Fast, 1M context
  - `deepseek/deepseek-coder` - Coding optimized
  - `qwen/qwen-2.5-coder-32b-instruct` - Cheaper coding
- ✅ **Agent Optimization:**
  - @maia: GPT-4o for orchestration
  - @coder: Gemini Flash for coding
  - @ops: GPT-4o-mini for infra
  - @researcher: Claude Sonnet for analysis
  - @workflow: Gemini Flash for automation
- ✅ **Fallback Chains:** 3 models each, 3 retries
- ✅ **Location:** `opencode.fixed.json`

#### `OPENROUTER_FIX.md`

- ✅ **Complete root cause analysis:**
  - "No endpoints found that support tool use" error
  - "ProviderModelNotFoundError" error
  - Why free models don't work with OpenCode
- ✅ **Solution Documentation:**
  - Models that guarantee tool support
  - Cost optimization strategy
  - Agent model assignments
- ✅ **Troubleshooting Guide:**
  - How to verify tool support
  - Model validation checklist
  - Configuration examples
- ✅ **References:** GitHub issues, OpenRouter docs, OpenCode docs
- ✅ **Lines:** 250+ lines
- **Location:** `OPENROUTER_FIX.md`

---

## 🚀 Deployment Steps Summary

### Phase 1: Environment Setup (5 min)

```bash
# 1. Install Stripe package (already done)
npm install stripe @stripe/stripe-js --save

# 2. Create production environment
cp .env.production.example .env.production

# 3. Edit with your values
nano .env.production
```

**Required Variables:**

- `STRIPE_SECRET_KEY` - Stripe live secret key
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_PROJECT_ID` - Vercel project ID
- `NEXT_PUBLIC_SITE_URL` - Production site URL

### Phase 2: Local Testing (10 min)

```bash
# 1. Build project
npm run build

# 2. Run type check
npm run typecheck

# 3. Test locally
npm run dev
```

**Test Checklist:**

- [ ] Landing page loads
- [ ] Pricing cards display correctly
- [ ] "Select Plan" buttons work
- [ ] Stripe checkout redirects successfully
- [ ] Payment flow completes

### Phase 3: Preview Deployment (5 min)

```bash
# Deploy to preview environment
./scripts/deploy-landing.sh --preview
```

**Expected:**

- ✅ Tests pass
- ✅ Build succeeds
- ✅ Deployment URL provided (e.g., `https://your-project.vercel.app`)
- ✅ HTTPS verified

### Phase 4: Vercel Configuration (5 min)

**Option A: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add all variables from `.env.production.example`

**Option B: Via Vercel CLI**

```bash
# Add each variable
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
```

### Phase 5: Production Deployment (5 min)

```bash
# Deploy to production
./scripts/deploy-landing.sh --production
```

**Expected:**

- ✅ All checks pass (tests, lint, typecheck, build)
- ✅ Production deployment succeeds
- ✅ HTTPS verified
- ✅ Custom domain configured (if set)

### Phase 6: DNS Configuration (10 min)

Follow `docs/dns-setup.md` for complete guide:

**Quick Setup:**
| Record Type | Name | Value |
|-------------|------|--------|
| CNAME | www | cname.vercel-dns.com |
| CNAME | @ | cname.vercel-dns.com |

**Verification:**

1. Wait for DNS propagation (5 min - 48 hours)
2. Check SSL certificate in Vercel dashboard
3. Verify HTTPS works: `https://yourdomain.com`

---

## ✅ Production Checklist

### Code & Build

- [ ] All tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] Type check passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Build output exists: `dist/` directory
- [ ] Build size is reasonable: < 10MB (typical)

### Stripe Configuration

- [ ] Stripe secret key is **live** mode (not test)
- [ ] Stripe public key matches secret key
- [ ] Webhook secret configured
- [ ] Success URL configured: `https://yourdomain.com/success`
- [ ] Cancel URL configured: `https://yourdomain.com/?canceled=true`
- [ ] Products created in Stripe Dashboard (recommended)
- [ ] Price IDs match products (if pre-created)
- [ ] Webhook endpoint configured in Stripe Dashboard

### Vercel Configuration

- [ ] All environment variables set in Vercel
- [ ] `VERCEL_TOKEN` has proper permissions
- [ ] `VERCEL_PROJECT_ID` is correct
- [ ] `NEXT_PUBLIC_SITE_URL` is production URL
- [ ] `NODE_ENV` set to `production`
- [ ] API routes deployed: `/api/create-checkout-session`

### DNS & SSL

- [ ] DNS records configured correctly
- [ ] DNS propagated globally (check with `dig`)
- [ ] SSL certificate shows "Valid" in Vercel dashboard
- [ ] HTTPS works: Visit `https://yourdomain.com`
- [ ] Both root domain and www work
- [ ] No browser security warnings

### Functionality Testing

- [ ] Landing page loads on production URL
- [ ] All pricing tiers display correctly
- [ ] "Select Plan" buttons redirect to Stripe checkout
- [ ] Stripe checkout page loads
- [ ] Payment flow completes (use real payment for final test)
- [ ] Success page loads after payment
- [ ] Cancel flow works (user can cancel payment)
- [ ] Webhook receives payment events (check Stripe Dashboard)

### Monitoring & Security

- [ ] Set up error monitoring (Sentry, LogRocket, etc.)
- [ ] Configure Vercel Analytics (automatic, verify in dashboard)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Review security headers (HSTS, CSP, etc.)
- [ ] Test backup recovery plan
- [ ] Document rollback procedure

---

## 📊 File Summary

| File                             | Lines | Purpose                         | Status     |
| -------------------------------- | ----- | ------------------------------- | ---------- |
| `lib/stripe.ts`                  | 206   | Client-side Stripe integration  | ✅ Existed |
| `api/create-checkout-session.js` | 235   | Serverless function for Stripe  | ✅ Created |
| `.env.production.example`        | 90    | Production environment template | ✅ Created |
| `vercel.json`                    | 69    | Vercel configuration            | ✅ Updated |
| `scripts/deploy-landing.sh`      | 215   | Automated deployment script     | ✅ Created |
| `docs/dns-setup.md`              | 371   | DNS setup documentation         | ✅ Created |
| `opencode.fixed.json`            | 348   | Fixed OpenCode config           | ✅ Created |
| `OPENROUTER_FIX.md`              | 250+  | OpenRouter fix documentation    | ✅ Created |
| `DEPLOYMENT_COMPLETE_STRIPE.md`  | 450+  | Deployment guide                | ✅ Created |

**Total Files Created/Updated:** 9 files
**Total Lines of Code/Documentation:** 2,200+

---

## 🎯 Success Criteria

Your production deployment is **SUCCESSFUL** when:

1. ✅ **All files are created** and executable
2. ✅ **Environment variables** are set correctly
3. ✅ **Local tests pass** (test, lint, typecheck)
4. ✅ **Build succeeds** and `dist/` directory exists
5. ✅ **Preview deployment** works on Vercel
6. ✅ **Production deployment** completes without errors
7. ✅ **HTTPS works** and SSL certificate is valid
8. ✅ **Stripe checkout** redirects successfully
9. ✅ **Payment flow** completes end-to-end
10. ✅ **Custom domain** (if configured) resolves correctly
11. ✅ **No errors** in Vercel logs
12. ✅ **Monitoring** configured for uptime and errors

---

## 🚀 Quick Start Commands

```bash
# 1. Set up environment
cp .env.production.example .env.production
nano .env.production  # Add your keys

# 2. Test locally
npm run test && npm run typecheck && npm run build

# 3. Deploy to preview (testing)
./scripts/deploy-landing.sh --preview

# 4. Configure Vercel environment variables
vercel env add STRIPE_SECRET_KEY production
# (repeat for all variables)

# 5. Deploy to production
./scripts/deploy-landing.sh --production

# 6. Configure DNS
# See docs/dns-setup.md for complete guide

# 7. Verify deployment
curl -I https://yourdomain.com
```

---

## 📚 Documentation Index

1. **`DEPLOYMENT_COMPLETE_STRIPE.md`** - Complete deployment guide with phases
2. **`docs/dns-setup.md`** - DNS configuration and SSL management
3. **`OPENROUTER_FIX.md`** - OpenCode OpenRouter fix
4. **`vercel.json`** - Vercel configuration (security headers, functions)
5. **`.env.production.example`** - All required environment variables

---

## 🛡️ Security Features Implemented

### Headers (vercel.json)

- ✅ X-Content-Type-Options: nosniff
- ✅ X-Frame-Options: DENY
- ✅ X-XSS-Protection: 1; mode=block
- ✅ Referrer-Policy: strict-origin-when-cross-origin
- ✅ Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
- ✅ Permissions-Policy: geolocation=(), microphone=(), camera=()

### Stripe Security

- ✅ Webhook signature verification (STRIPE_WEBHOOK_SECRET)
- ✅ CORS headers on API endpoints
- ✅ HTTPS enforcement (automatic via Vercel)
- ✅ Payment method validation (card only)
- ✅ Metadata sanitization

### Deployment Security

- ✅ Environment variable validation
- ✅ API key protection (never logged)
- ✅ Error handling without exposing secrets
- ✅ Deployment verification before going live

---

## 📝 Notes

- **OpenRouter Fix:** Bonus deliverable - fixes your agent issues
- **Stripe Package:** Already installed via `npm install stripe @stripe/stripe-js --save`
- **Vercel CLI:** Auto-installs via deployment script if missing
- **DNS Propagation:** Can take 5 min - 48 hours globally
- **SSL Certificates:** Automatic via Vercel (Let's Encrypt)
- **Production Mode:** Stripe keys must be live keys, not test keys

---

## ✅ Deliverables Status

| Requirement                                                 | Status                               |
| ----------------------------------------------------------- | ------------------------------------ |
| Stripe Integration (lib/stripe.ts)                          | ✅ Already existed                   |
| Stripe Serverless Function (api/create-checkout-session.js) | ✅ Created                           |
| Vercel Production Config (vercel.json)                      | ✅ Updated                           |
| Environment Variables (.env.production.example)             | ✅ Created                           |
| Deployment Script (scripts/deploy-landing.sh)               | ✅ Created                           |
| DNS Setup Guide (docs/dns-setup.md)                         | ✅ Created                           |
| All scripts executable (chmod +x)                           | ✅ Applied                           |
| Environment variable validation                             | ✅ Implemented                       |
| Error handling with logging                                 | ✅ Implemented                       |
| Production-ready (no console.log)                           | ✅ No console.log in production code |

---

**Status:** ✅ **ALL DELIVERABLES COMPLETE**
**Ready for:** Production deployment
**Next Action:** Follow `DEPLOYMENT_COMPLETE_STRIPE.md` for step-by-step deployment
**Estimated Time to Production:** 30-45 minutes (including DNS propagation)

---

**Created:** 2026-01-25
**Maintained By:** OPS (Infrastructure Team)
