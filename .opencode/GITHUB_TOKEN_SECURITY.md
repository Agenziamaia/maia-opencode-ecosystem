# GitHub Token Security Guide

## ⚠️ CRITICAL SECURITY PROTOCOLS

This document outlines the security protocols for managing GitHub tokens in the MAIA ecosystem.

## Token Storage

### Environment Variables

- **Variable Name**: `GITHUB_TOKEN_DEV_ROOT`
- **Location**: `.env.github` (gitignored)
- **Never commit**: Actual token files to version control

### Required Token Scopes

- `repo` - Full control of private repositories
- `workflow` - Ability to update GitHub Action workflows
- `admin:org` (optional) - Organization administration

## Token Manager Usage

### Loading the Token

```javascript
const tokenManager = require('./.opencode/github-token-manager');

// Always loads fresh from environment - no caching
const headers = tokenManager.getHeaders();
```

### Validating the Token

```javascript
const healthReport = await tokenManager.getHealthReport();
console.log(healthReport);
```

### Masking for Logs

```javascript
const masked = tokenManager.maskToken(process.env.GITHUB_TOKEN_DEV_ROOT);
// Output: ghp_••••••••••••••••••••••••••••••••
```

## Security Best Practices

### ✅ DO

1. Store tokens in `.env.github` (gitignored)
2. Load tokens from environment variables only
3. Mask tokens before logging
4. Validate token scopes on startup
5. Use `set +o history` in bash when setting tokens
6. Rotate tokens regularly (recommend every 90 days)

### ❌ DO NOT

1. Hardcode tokens in source code
2. Commit `.env.github` to git
3. Log unmasked tokens
4. Cache tokens in memory
5. Share tokens in chat/communication channels
6. Use tokens in URLs or query parameters

## Environment Setup

### 1. Create Environment File

```bash
# This file is gitignored (.env.github)
GITHUB_TOKEN_DEV_ROOT=ghp_your_actual_token_here
```

### 2. Source Environment File

```bash
# Secure method - no history logging
set +o history
source .env.github
set -o history

# Verify (masked)
echo $GITHUB_TOKEN_DEV_ROOT | cut -c1-4
# Output: ghp_
```

### 3. Test Token Manager

```bash
node -e "
const tm = require('./.opencode/github-token-manager');
tm.getHealthReport().then(report => console.log(JSON.stringify(report, null, 2)));
"
```

## Token Rotation Protocol

### Automated Rotation (Recommended)

1. Generate new PAT in GitHub Settings
2. Update `.env.github` with new token
3. Restart services
4. Verify new token works
5. Revoke old token in GitHub Settings

### Manual Rotation Steps

```bash
# 1. Generate new token in GitHub
# 2. Update .env.github (securely)
set +o history
echo "GITHUB_TOKEN_DEV_ROOT=ghp_NEW_TOKEN" > .env.github
set -o history

# 3. Test new token
node -e "
const tm = require('./.opencode/github-token-manager');
tm.validateToken().then(r => console.log('Valid:', r.valid));
"

# 4. If valid, revoke old token in GitHub Settings
```

## Emergency Token Revocation

If a token is compromised:

1. **Immediately revoke** in GitHub Settings → Developer Settings → Personal Access Tokens
2. **Generate new token** with same scopes
3. **Update** `.env.github`
4. **Restart** all services
5. **Audit** GitHub logs for unauthorized access

## Troubleshooting

### Token Not Found

```
Error: GITHUB_TOKEN_DEV_ROOT environment variable is not set.
```

**Solution**: Ensure `.env.github` exists and is sourced.

### Invalid Token Format

```
Error: GITHUB_TOKEN_DEV_ROOT does not match GitHub token format.
```

**Solution**: Verify token starts with `ghp_`, `ghu_`, `gho_`, `ghs_`, or `ghr_`.

### Missing Scopes

```
Warning: Token missing required scope: workflow
```

**Solution**: Regenerate token with all required scopes.

### Validation Timeout

```
Error: Token validation timeout
```

**Solution**: Check network connectivity to `api.github.com`.

## GitHub CLI Integration

### Authenticate with Token

```bash
# Secure method - no history
set +o history
echo "$GITHUB_TOKEN_DEV_ROOT" | gh auth login --with-token
set -o history

# Verify authentication
gh auth status
```

### Re-authenticate on Token Rotation

```bash
gh auth logout
set +o history
echo "$GITHUB_TOKEN_DEV_ROOT" | gh auth login --with-token
set -o history
```

## Compliance & Auditing

### Audit Checklist

- [ ] Token never appears in logs
- [ ] `.env.github` in `.gitignore`
- [ ] Token validated on startup
- [ ] All required scopes present
- [ ] Token rotation schedule documented
- [ ] Emergency revocation procedure tested

### Regular Reviews

- **Monthly**: Verify token still valid
- **Quarterly**: Review token scopes
- **Annually**: Full security audit of token usage

---

**Maintained by**: OPS (GLM-4.7)
**Last Updated**: 2026-01-22
**Version**: 1.0.0
