# Production Deployment Complete

# Stripe Integration & Vercel Deployment Setup

## ✅ Files Created

### 1. Stripe Configuration

- **`lib/stripe.ts`** - Client-side Stripe integration
  - Product definitions: Basic ($797), Standard ($1,197), Premium ($1,497)
  - Checkout session creation functions
  - Price formatting utilities
  - Already existed in project

### 2. Serverless API Function

- **`api/create-checkout-session.js`** - Vercel serverless function
  - POST handler: Creates Stripe checkout sessions
  - GET handler: Retrieves session information
  - Auto-creates products/prices if not configured
  - CORS support for cross-origin requests
  - Error handling and validation

### 3. Environment Variables

- **`.env.production.example`** - Production environment template
  - Stripe secrets and public keys
  - Vercel configuration
  - Optional: Analytics, notifications, feature flags
  - Security headers and CORS settings

### 4. Deployment Script

- **`scripts/deploy-landing.sh`** - Automated deployment pipeline
  - Test execution (optional with `--skip-tests`)
  - Linting and type checking
  - Build validation
  - Vercel deployment (preview/production)
  - Deployment verification (HTTP + HTTPS)
  - Custom domain configuration
  - Notification support (Slack/Discord)
  - Executable: `chmod +x` already applied

### 5. DNS Setup Guide

- **`docs/dns-setup.md`** - Complete DNS configuration documentation
  - Quick setup steps
  - CNAME and A record configurations
  - SSL certificate management (automatic via Vercel)
  - Email configuration guidance
  - Common DNS provider instructions (Cloudflare, GoDaddy, etc.)
  - Troubleshooting guide
  - Security best practices

### 6. Updated Vercel Configuration

- **`vercel.json`** - Enhanced for production
  - Added API route rewrites: `/api/*` → `/api/*`
  - Enhanced security headers:
    - HSTS (HTTP Strict Transport Security)
    - Permissions Policy (geolocation, microphone, camera control)
  - CORS headers for API routes
  - Production environment variables
  - Function duration limits

---

## 🚀 Deployment Steps

### Phase 1: Environment Setup

#### Step 1.1: Install Stripe Package

```bash
# Already done
npm install stripe @stripe/stripe-js --save
```

#### Step 1.2: Create Production Environment

```bash
# Copy the example template
cp .env.production.example .env.production

# Edit with your values
nano .env.production
```

**Required Variables:**

```bash
# Stripe (get from https://dashboard.stripe.com/test/apikeys)
STRIPE_SECRET_KEY=sk_live_your_secret_key
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_publishable_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Vercel (get from https://vercel.com/account/tokens)
VERCEL_TOKEN=your_vercel_token
VERCEL_PROJECT_ID=your_project_id

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

#### Step 1.3: Create Stripe Products (Optional but Recommended)

**Option A: Use Dashboard**

1. Go to https://dashboard.stripe.com/test/products
2. Create three products:
   - **Basic Plan**: $797/month
   - **Standard Plan**: $1,197/month
   - **Premium Plan**: $1,497/month
3. Copy price IDs (starts with `price_`)
4. Add to `.env.production`:
   ```
   STRIPE_PRICE_ID_BASIC=price_xxxxxxxxxxxxx
   STRIPE_PRICE_ID_STANDARD=price_xxxxxxxxxxxxx
   STRIPE_PRICE_ID_PREMIUM=price_xxxxxxxxxxxxx
   ```

**Option B: Auto-Create**

- The API function will auto-create products on first request
- Less control over product settings
- Suitable for quick testing

---

### Phase 2: Local Testing

#### Step 2.1: Build Project

```bash
# Run build to verify everything compiles
npm run build

# Check output directory
ls -la dist/
```

#### Step 2.2: Type Check

```bash
# Verify TypeScript is valid
npm run typecheck
```

#### Step 2.3: Test Locally

```bash
# Start dev server
npm run dev

# Visit http://localhost:3000
# Test Stripe checkout flow
```

**Test Checklist:**

- [ ] Landing page loads
- [ ] Pricing cards display correctly
- [ ] "Select Plan" buttons work
- [ ] Stripe checkout redirects successfully
- [ ] Payment flow completes (use test cards: https://stripe.com/docs/testing)
- [ ] Success/cancel redirects work

---

### Phase 3: Vercel Deployment

#### Step 3.1: Deploy to Preview (Testing)

```bash
# Deploy to preview environment
./scripts/deploy-landing.sh --preview

# This will:
# 1. Run tests (unless --skip-tests)
# 2. Run linter
# 3. Run type check
# 4. Build project
# 5. Deploy to Vercel preview
# 6. Verify deployment (HTTP 200)
# 7. Verify HTTPS
# 8. Return preview URL
```

**Expected Output:**

```
[INFO] 🚀 Landing Page Deployment Script
[INFO] Environment: preview
[INFO] 🧪 Running tests...
[SUCCESS] Tests passed
[INFO] 🔍 Running linter...
[SUCCESS] Linting passed
[INFO] 🔍 Running type check...
[SUCCESS] Type check passed
[INFO] 🏗️  Building project...
[SUCCESS] Build completed successfully
[INFO] 📦 Checking deployment artifacts...
[INFO] Build size: 2.5M
[INFO] 🚀 Deploying to Vercel (environment: preview)...
[SUCCESS] Deployment successful!
[INFO] 🌐 Deployment URL: https://your-project.vercel.app
[SUCCESS] ✅ Deployment verified (HTTP 200)
[SUCCESS] ✅ HTTPS certificate valid
[SUCCESS] ✨ Landing page deployment completed successfully!
```

#### Step 3.2: Test Preview Deployment

1. Visit the preview URL provided
2. Test complete user flow:
   - Landing page → Select plan → Checkout → Success page
3. Use Stripe test cards: https://stripe.com/docs/testing
4. Verify all functionality works

**Important:** Preview deployments use Stripe **test mode** keys.

---

### Phase 4: Production Deployment

#### Step 4.1: Set Production Environment Variables in Vercel

**Option A: Via Vercel CLI**

```bash
# Add environment variables to Vercel
vercel env add STRIPE_SECRET_KEY production
vercel env add NEXT_PUBLIC_STRIPE_PUBLIC_KEY production
vercel env add STRIPE_WEBHOOK_SECRET production
vercel env add NEXT_PUBLIC_SITE_URL production
```

**Option B: Via Vercel Dashboard**

1. Go to https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add each variable:
   - Name: `STRIPE_SECRET_KEY`
   - Value: `sk_live_...` (your live secret key)
   - Environment: **Production** → **All**
   - Click **Save**
5. Repeat for all required variables

#### Step 4.2: Deploy to Production

```bash
# Deploy to production (FINAL STEP - BE CAREFUL)
./scripts/deploy-landing.sh --production

# This will:
# 1. Run tests, linter, type check
# 2. Build project
# 3. Deploy to Vercel production
# 4. Verify deployment
# 5. Configure custom domain (if CUSTOM_DOMAIN set)
# 6. Provide DNS instructions
```

**Expected Output:**

```
[INFO] 🚀 Landing Page Deployment Script
[INFO] Environment: production
[WARNING] ⚠️  PRODUCTION DEPLOYMENT - VERIFY CAREFULLY
[SUCCESS] ✨ Landing page deployment completed successfully!
[INFO] 📋 Deployment Summary:
[INFO]   Environment: production
[INFO]   URL: https://your-project.vercel.app
[INFO]   Build Size: 2.5M
[INFO]   HTTPS: ✅ Verified
[INFO] Next steps:
[INFO]   1. Visit https://your-project.vercel.app to verify deployment
[INFO]   2. Test Stripe checkout flow
[INFO]   3. Monitor production logs
```

#### Step 4.3: Configure Custom Domain (Optional but Recommended)

If you have a custom domain, follow these steps:

**Option A: Via Script**

```bash
# Set custom domain in .env.production
CUSTOM_DOMAIN=yourdomain.com

# The deployment script will automatically configure it
```

**Option B: Via Vercel Dashboard**

1. Go to Vercel project **Settings** → **Domains**
2. Click **Add Domain**
3. Enter your domain (e.g., `yourdomain.com`)
4. Click **Add**
5. Vercel will provide DNS instructions

**DNS Configuration:**
See `docs/dns-setup.md` for complete guide.

**Quick Reference:**
| Record Type | Name | Value |
|-------------|------|--------|
| CNAME | www | cname.vercel-dns.com |
| CNAME | @ | cname.vercel-dns.com |

---

## ✅ Production Checklist

Before going live, verify all items:

### Code & Build

- [ ] All tests pass: `npm run test`
- [ ] Linting passes: `npm run lint`
- [ ] Type check passes: `npm run typecheck`
- [ ] Build succeeds: `npm run build`
- [ ] Build output exists: `dist/` directory
- [ ] Build size is reasonable: Check with `du -sh dist/`

### Stripe Configuration

- [ ] Stripe secret key is **live** mode (not test)
- [ ] Stripe public key matches secret key
- [ ] Webhook secret configured (for payment events)
- [ ] Success URL configured: `https://yourdomain.com/success`
- [ ] Cancel URL configured: `https://yourdomain.com/?canceled=true`
- [ ] Products created in Stripe Dashboard (recommended)
- [ ] Price IDs match products (if pre-created)

### Vercel Configuration

- [ ] All environment variables set in Vercel
- [ ] `VERCEL_TOKEN` has proper permissions
- [ ] `VERCEL_PROJECT_ID` is correct
- [ ] `NEXT_PUBLIC_SITE_URL` is production URL
- [ ] `NODE_ENV` set to `production`

### DNS & SSL

- [ ] DNS records configured correctly
- [ ] DNS propagated globally (wait 48 hours)
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

### Monitoring & Backup

- [ ] Set up error monitoring (e.g., Sentry, LogRocket)
- [ ] Configure Vercel Analytics (automatic, verify in dashboard)
- [ ] Set up uptime monitoring (e.g., UptimeRobot, Pingdom)
- [ ] Test backup recovery plan
- [ ] Document rollback procedure

---

## 🔍 Troubleshooting

### Issue: Stripe Checkout Fails

**Symptoms:**

- Redirect fails
- "No such plan" error
- "Invalid price ID"

**Solutions:**

1. Verify Stripe secret key is correct (live mode)
2. Check price IDs match (if pre-created products)
3. Verify success/cancel URLs are correct
4. Check Vercel logs: `vercel logs` in project directory
5. Test with Stripe Dashboard: Create checkout session manually

### Issue: Deployment Fails

**Symptoms:**

- Build fails during deployment
- "Module not found" errors
- Type check fails in production

**Solutions:**

1. Ensure `package.json` has all dependencies: `stripe`, `@stripe/stripe-js`
2. Run `npm install` before deployment
3. Check `vercel.json` build command: `npm run build`
4. Verify Node version matches `vercel.json`: `NODE_VERSION: "20.x"`
5. Check Vercel build logs in dashboard

### Issue: DNS Not Propagating

**Symptoms:**

- `yourdomain.com` doesn't load
- "Server not found" error
- Works from some devices, not others

**Solutions:**

1. Check DNS records match Vercel instructions exactly
2. Verify no conflicting DNS records (remove old ones)
3. Wait up to 48 hours for global propagation
4. Check with: `dig yourdomain.com`
5. If using Cloudflare, ensure proxy is enabled (orange cloud icon)
6. Clear browser DNS cache
7. Test with online tool: https://www.whatsmydns.net/

### Issue: SSL Certificate Not Provisioning

**Symptoms:**

- Vercel shows "Configuring" for >24 hours
- Browser shows "Not Secure" warning
- Mixed content warnings

**Solutions:**

1. Verify DNS is 100% correct
2. Check domain isn't locked by registrar
3. Ensure domain is not on Cloudflare SSL (disable there if yes)
4. Remove and re-add domain in Vercel dashboard
5. Wait up to 48 hours for Let's Encrypt
6. Contact Vercel Support: https://vercel.com/support

---

## 📚 Additional Resources

### Documentation

- **Vercel Deployment:** https://vercel.com/docs/deployments
- **Vercel Domains:** https://vercel.com/docs/domains
- **Stripe Checkout:** https://stripe.com/docs/payments/checkout
- **Stripe Webhooks:** https://stripe.com/docs/webhooks
- **DNS Setup Guide:** `docs/dns-setup.md` (in this project)

### Tools & Utilities

- **Vercel CLI:** `npm install -g vercel`
- **Stripe CLI:** `npm install -g stripe`
- **DNS Checker:** https://www.whatsmydns.net/
- **SSL Tester:** https://www.ssllabs.com/ssltest/
- **Cronitor:** https://cronitor.io/ (uptime monitoring)

### Support

- **Vercel Support:** https://vercel.com/support
- **Stripe Support:** https://stripe.com/contact
- **Vercel Status:** https://vercel-status.com/

---

## 🎯 Success Criteria

Your production deployment is successful when:

1. ✅ **Deployment completes** without errors
2. ✅ **Site loads** on production URL
3. ✅ **HTTPS works** (no security warnings)
4. ✅ **Stripe checkout** redirects successfully
5. ✅ **Payment flow** completes end-to-end
6. ✅ **Success page** loads after payment
7. ✅ **DNS configured** (if custom domain)
8. ✅ **SSL certificate** shows "Valid" in Vercel
9. ✅ **No errors** in Vercel logs
10. ✅ **Monitoring** configured for uptime

---

## 📝 Deployment Script Usage

### Available Options

```bash
# Deploy to preview (for testing)
./scripts/deploy-landing.sh --preview

# Deploy to production (FINAL)
./scripts/deploy-landing.sh --production

# Quick deploy without tests
./scripts/deploy-landing.sh --production --skip-tests

# Show help
./scripts/deploy-landing.sh --help
```

### Environment Variables Required

- `VERCEL_TOKEN` - Vercel API token
- `VERCEL_PROJECT_ID` - Vercel project ID
- `STRIPE_SECRET_KEY` - Stripe live secret key
- `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- `NEXT_PUBLIC_SITE_URL` - Production site URL

**Optional:**

- `CUSTOM_DOMAIN` - Custom domain name
- `SLACK_WEBHOOK_URL` - Slack notification webhook
- `DISCORD_WEBHOOK_URL` - Discord notification webhook

---

**Deployment Status:** ✅ Ready
**Last Updated:** 2026-01-25
**Maintained By:** Infrastructure Team (OPS)
