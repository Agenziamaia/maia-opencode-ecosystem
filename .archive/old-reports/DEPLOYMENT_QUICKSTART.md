# 🚀 Quick Start Guide - Vercel Deployment

## ⚡ 5-Minute Setup

### 1. Get Your Vercel Token

```bash
# 1. Go to: https://vercel.com/account/tokens
# 2. Click "Create Token"
# 3. Name it something like "maia-deployment"
# 4. Copy the token
```

### 2. Create Environment File

```bash
# Copy the example file
cp .env.example .env

# Edit it with your credentials
nano .env
```

Add your values:

```bash
VERCEL_TOKEN=prv_your_token_here
VERCEL_PROJECT_ID=prj_your_project_id_here
CUSTOM_DOMAIN=yourdomain.com  # Optional
```

### 3. Get Your Project ID

```bash
# Option 1: Create new project (recommended)
vercel link
# This will create .vercel/project.json with your ID

# Option 2: Get from existing project
# Go to: https://vercel.com/dashboard → Your Project → Settings → General
```

### 4. Deploy Now!

#### Quick Preview Deploy

```bash
npm run deploy:preview
```

#### Production Deploy

```bash
npm run deploy:production
```

#### Deploy with Release Tag

```bash
npm run deploy:release
```

---

## 📋 What Happens During Deployment?

The deployment script automatically:

1. ✅ Validates your environment
2. 🧪 Runs all tests
3. 🔍 Runs linter
4. 🏗️ Builds the project
5. 🚀 Deploys to Vercel
6. 🌐 Configures custom domain (if set)
7. 🏷️ Creates GitHub release (if requested)
8. 📢 Sends notifications (if configured)

---

## 🌐 Adding a Custom Domain

```bash
# Add main domain
npm run domain:add yourdomain.com

# Add subdomain
npm run domain:add app.yourdomain.com
```

The script will show you exactly what DNS records to add.

---

## 🔄 CI/CD Setup (Optional)

### 1. Add GitHub Secrets

Go to: Repository → Settings → Secrets and variables → Actions

Add these secrets:

- `VERCEL_TOKEN` - Your Vercel API token
- `VERCEL_PROJECT_ID` - Your Vercel project ID
- `CUSTOM_DOMAIN` - Your domain (optional)

### 2. That's It!

Now deployments happen automatically:

- Push to `main` → Production deploy
- Push to `develop` → Preview deploy
- Pull Request → Preview deploy + URL comment

---

## 🛠️ Advanced Usage

### Skip Tests (Quick Deploy)

```bash
./scripts/deploy.sh --preview --skip-tests
```

### Specific Release Type

```bash
# Major version bump
./scripts/deploy.sh --production --release --release-type major

# Minor version bump
./scripts/deploy.sh --production --release --release-type minor

# Patch version bump (default)
./scripts/deploy.sh --production --release --release-type patch
```

### Manual Rollback

```bash
vercel rollback
```

---

## 📖 Full Documentation

See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete documentation.

---

## ❓ Common Issues

### "VERCEL_TOKEN not set"

Make sure you created the `.env` file and added your token.

### "Build failed"

Run locally first:

```bash
npm run build
```

### "Custom domain not working"

1. Check DNS propagation: https://dnschecker.org/
2. Wait 5-60 minutes for DNS to propagate
3. Check Vercel dashboard for SSL status

---

## 📚 Resources

- [Full Deployment Guide](./DEPLOYMENT.md)
- [Vercel Docs](https://vercel.com/docs)
- [GitHub Actions Docs](https://docs.github.com/actions)

---

## ✅ Checklist Before First Deploy

- [ ] Vercel account created
- [ ] Vercel token generated
- [ ] Project created in Vercel
- [ ] `.env` file configured
- [ ] Dependencies installed (`npm install`)
- [ ] Tests passing locally (`npm test`)

---

**Need Help?** Check the [DEPLOYMENT.md](./DEPLOYMENT.md) file for detailed troubleshooting.
