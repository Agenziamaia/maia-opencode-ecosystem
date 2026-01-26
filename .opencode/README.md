# MAIA OPS - OpenCode Infrastructure

## 📁 Directory Structure

```
.opencode/
├── github-token-manager.js       # Secure token management module
├── validate-github-token.js      # Token validation script
├── GITHUB_TOKEN_SECURITY.md      # Security protocols & best practices
├── README_TOKEN_MANAGER.md       # Integration guide for @coder
├── agents/                       # Agent configurations
├── commands/                     # Command definitions
├── context/                      # Context providers
├── skills/                       # Open Skills library
└── workflows/                    # n8n workflow definitions
```

## 🚀 Quick Start

### 1. GitHub Token Setup

```bash
# Setup token environment
cp .env.github.example .env.github
nano .env.github  # Add your token
source .env.github

# Validate token
node .opencode/validate-github-token.js
```

### 2. Token Manager Usage

```javascript
const tokenManager = require('./.opencode/github-token-manager');

// Get fresh headers
const headers = tokenManager.getHeaders();

// Validate before use
const health = await tokenManager.getHealthReport();
console.log(health.maskedToken); // ghp_••••••••••••••••••••••••••••••••
```

## 🛡️ Security Protocols

### Token Management

- ✅ Load from environment only (no hardcoding)
- ✅ Fresh load on each use (no caching)
- ✅ Mask all token outputs
- ✅ Validate scopes on initialization
- ✅ Secure bash commands (no history)

### Required Scopes

- `repo` - Full control of private repositories
- `workflow` - Update GitHub Actions workflows
- `admin:org` (optional) - Organization administration

## 📖 Documentation

- [Token Security Guide](./GITHUB_TOKEN_SECURITY.md) - Complete security protocols
- [Token Manager Integration](./README_TOKEN_MANAGER.md) - API documentation for @coder

## 🔧 Maintenance

### Token Rotation

```bash
# 1. Generate new token in GitHub
# 2. Update .env.github
set +o history
echo "GITHUB_TOKEN_DEV_ROOT=ghp_NEW_TOKEN" > .env.github
set -o history

# 3. Validate
node .opencode/validate-github-token.js

# 4. Revoke old token in GitHub
```

### Health Check

```bash
# Run full health check
node .opencode/validate-github-token.js

# Expected output: Token status, scopes, security validation
```

## ⚠️ Emergency Procedures

### Token Compromised

1. **Immediately revoke** in GitHub Settings
2. **Generate new token** with same scopes
3. **Update** `.env.github`
4. **Restart** all services
5. **Audit** GitHub logs

### Token Validation Failed

1. Check `.env.github` exists
2. Verify token format
3. Validate required scopes
4. Test network connectivity

## 📊 Current Status

### Infrastructure Health

- ✅ Token Manager Module: Deployed
- ✅ Validation Script: Operational
- ✅ Security Documentation: Complete
- ✅ Integration Guide: Ready for @coder
- ⏳ API Layer: Pending @coder implementation

### Security Audit

- ✅ Environment variable isolation
- ✅ Token masking implementation
- ✅ No caching in memory
- ✅ Fresh load on each use
- ✅ Scope validation enabled

---

**Maintained by**: OPS (GLM-4.7)
**Last Updated**: 2026-01-22
**Status**: ✅ Infrastructure Ready for @coder
