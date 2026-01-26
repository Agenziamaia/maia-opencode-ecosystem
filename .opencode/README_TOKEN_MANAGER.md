# GitHub Token Manager - Integration Guide

## 🚀 Quick Start for @coder

### 1. Setup Environment

```bash
# Copy the example file
cp .env.github.example .env.github

# Edit and add your actual token
nano .env.github

# Source the file (securely)
set +o history
source .env.github
set -o history
```

### 2. Validate Token

```bash
node .opencode/validate-github-token.js
```

### 3. Use in Your Code

```javascript
const tokenManager = require('./.opencode/github-token-manager');

// Get fresh headers for API calls
const headers = tokenManager.getHeaders();

// Validate before critical operations
const health = await tokenManager.getHealthReport();
if (health.status !== 'healthy' || !health.scopes.check.hasAllRequired) {
  throw new Error('Token validation failed');
}

// Mask token for logging (NEVER log raw token)
const masked = tokenManager.maskToken(process.env.GITHUB_TOKEN_DEV_ROOT);
console.log(`Using token: ${masked}`);
```

## 📦 Module API

### `loadToken()`

Load token from environment (always fresh, no caching).

- **Returns**: `string` - The GitHub token
- **Throws**: `Error` if token is not set or invalid

### `maskToken(token)`

Mask token for safe logging/output.

- **Parameters**: `token` (string) - The token to mask
- **Returns**: `string` - Masked token (e.g., `ghp_••••••••••••••••••••••••••••••••`)

### `getHeaders()`

Get headers for GitHub API requests (always loads fresh token).

- **Returns**: `Object` - Headers object with Authorization

```javascript
{
  'Authorization': 'token <token>',
  'User-Agent': 'MAIA-OPS-GitHub-Token-Manager',
  'Accept': 'application/vnd.github.v3+json'
}
```

### `validateToken()`

Validate token by calling GitHub API.

- **Returns**: `Promise<Object>` - Token validation result

```javascript
{
  valid: boolean,
  maskedToken: string,
  statusCode: number,
  scopes: string[],
  hasRequiredScopes: Object,
  timestamp: string
}
```

### `checkRequiredScopes(scopes)`

Check if token has all required scopes.

- **Parameters**: `scopes` (string[]) - Array of scopes from token
- **Returns**: `Object` - Scope validation result

```javascript
{
  hasAllRequired: boolean,
  missing: string[],
  hasOptional: boolean,
  optionalMissing: string[]
}
```

### `getHealthReport()`

Validate and return full token health report.

- **Returns**: `Promise<Object>` - Complete health report

```javascript
{
  status: 'healthy' | 'unhealthy',
  maskedToken: string,
  tokenValidation: { valid: boolean, statusCode: number },
  scopes: {
    present: string[],
    required: string[],
    optional: string[],
    check: Object
  },
  security: {
    loadedFromEnv: boolean,
    cached: boolean,
    timestamp: string
  }
}
```

## 🔒 Security Patterns

### Pattern 1: Safe API Calls

```javascript
const https = require('https');
const tokenManager = require('./.opencode/github-token-manager');

async function githubRequest(path, method = 'GET', data = null) {
  const options = {
    hostname: 'api.github.com',
    port: 443,
    path,
    method,
    headers: tokenManager.getHeaders(),
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(body));
        } else {
          reject(new Error(`GitHub API error: ${res.statusCode}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Usage
const user = await githubRequest('/user');
console.log(`Authenticated as: ${user.login}`);
```

### Pattern 2: Pre-flight Validation

```javascript
const tokenManager = require('./.opencode/github-token-manager');

async function initializeService() {
  const health = await tokenManager.getHealthReport();

  if (health.status !== 'healthy') {
    throw new Error(`Token unhealthy: ${health.error}`);
  }

  if (!health.scopes.check.hasAllRequired) {
    const missing = health.scopes.check.missing.join(', ');
    throw new Error(`Missing required scopes: ${missing}`);
  }

  console.log('✅ Token validated successfully');
  console.log(`   Masked: ${health.maskedToken}`);
  console.log(`   Scopes: ${health.scopes.present.join(', ')}`);

  return health;
}
```

### Pattern 3: Error Handling

```javascript
const tokenManager = require('./.opencode/github-token-manager');

try {
  const headers = tokenManager.getHeaders();
  // Use headers for API call
} catch (error) {
  if (error.message.includes('GITHUB_TOKEN_DEV_ROOT')) {
    console.error('Token not configured. Check .env.github');
  } else if (error.message.includes('does not match GitHub token format')) {
    console.error('Invalid token format. Check token in .env.github');
  } else {
    console.error('Unexpected error:', error.message);
  }
  process.exit(1);
}
```

## 🧪 Testing

### Unit Test Example

```javascript
const tokenManager = require('./.opencode/github-token-manager');

// Test token masking
const testToken = 'ghp_test1234567890123456789012345678901234';
const masked = tokenManager.maskToken(testToken);
console.assert(masked.startsWith('ghp_'), 'Mask should preserve prefix');
console.assert(masked.includes('•••'), 'Mask should contain dots');
console.assert(!masked.includes('test123'), 'Mask should hide actual characters');

// Test scope checking
const scopes = ['repo', 'workflow', 'admin:org'];
const check = tokenManager.checkRequiredScopes(scopes);
console.assert(check.hasAllRequired === true, 'Should have all required scopes');
console.assert(check.missing.length === 0, 'Should have no missing scopes');
```

### Integration Test

```bash
# Set up test environment
export GITHUB_TOKEN_DEV_ROOT="ghp_test_token_for_testing"

# Run validation
node .opencode/validate-github-token.js

# Expected: Token validation fails (invalid test token)
# But the token manager should work correctly
```

## 📊 Health Check Output

### Healthy Token

```json
{
  "status": "healthy",
  "maskedToken": "ghp_••••••••••••••••••••••••••••••••",
  "tokenValidation": {
    "valid": true,
    "statusCode": 200
  },
  "scopes": {
    "present": ["repo", "workflow", "admin:org"],
    "required": ["repo", "workflow"],
    "optional": ["admin:org"],
    "check": {
      "hasAllRequired": true,
      "missing": [],
      "hasOptional": true,
      "optionalMissing": []
    }
  },
  "security": {
    "loadedFromEnv": true,
    "cached": false,
    "timestamp": "2026-01-22T02:15:00.000Z"
  }
}
```

### Unhealthy Token

```json
{
  "status": "unhealthy",
  "error": "GITHUB_TOKEN_DEV_ROOT environment variable is not set.",
  "timestamp": "2026-01-22T02:15:00.000Z"
}
```

## 🔧 Troubleshooting

### Common Issues

**Issue**: "GITHUB_TOKEN_DEV_ROOT environment variable is not set"

- **Solution**: Ensure `.env.github` exists and source it: `source .env.github`

**Issue**: "does not match GitHub token format"

- **Solution**: Verify token starts with `ghp_`, `ghu_`, `gho_`, `ghs_`, or `ghr_`

**Issue**: "Missing required scopes: workflow"

- **Solution**: Regenerate token at GitHub with all required scopes

**Issue**: "Token validation timeout"

- **Solution**: Check network connectivity to `api.github.com`

## 📚 Additional Resources

- [GitHub Personal Access Tokens Docs](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token)
- [GitHub OAuth Scopes](https://docs.github.com/en/developers/building-oauth-apps/scopes-for-oauth-apps)
- [Security Best Practices](https://docs.github.com/en/code-security/getting-started/github-security-best-practices)

---

**Ready for @coder to build API layer** ✅
