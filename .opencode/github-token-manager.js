/**
 * OPS (GLM-5): Secure GitHub Token Manager
 *
 * SECURITY PROTOCOLS:
 * - Token never appears in logs
 * - Token loaded fresh from environment on each use
 * - No in-memory caching of token
 * - All token values masked in outputs
 * - Strict validation on initialization
 */

const https = require('https');

class GitHubTokenManager {
  constructor() {
    this.requiredScopes = ['repo', 'workflow'];
    this.optionalScopes = ['admin:org'];
  }

  /**
   * Load token from environment (fresh load, no caching)
   * @returns {string} The GitHub token
   * @throws {Error} If token is not set
   */
  loadToken() {
    const token = process.env.GITHUB_TOKEN_DEV_ROOT;

    if (!token) {
      throw new Error(
        'GITHUB_TOKEN_DEV_ROOT environment variable is not set. ' +
        'Please configure this environment variable before proceeding.',
      );
    }

    if (typeof token !== 'string' || token.trim().length === 0) {
      throw new Error('GITHUB_TOKEN_DEV_ROOT is empty or invalid.');
    }

    // Validate token format (GitHub PAT starts with ghp_ or ghu_)
    const tokenPattern = /^(ghp|ghu|gho|ghs|ghr)_[A-Za-z0-9_]{36}$/;
    if (!tokenPattern.test(token)) {
      throw new Error('GITHUB_TOKEN_DEV_ROOT does not match GitHub token format.');
    }

    return token;
  }

  /**
   * Mask token for safe logging/output
   * @param {string} token - The token to mask
   * @returns {string} Masked token (e.g., ghp_••••••••••••••••••••••••••••••••)
   */
  maskToken(token) {
    if (!token || token.length < 12) return '••••••••••••••••••••••••••••••••';
    return token.substring(0, 4) + '••••••••••••••••••••••••••••••••';
  }

  /**
   * Get headers for GitHub API requests (always loads fresh token)
   * @returns {Object} Headers object with Authorization
   */
  getHeaders() {
    const token = this.loadToken();
    return {
      Authorization: `token ${token}`,
      'User-Agent': 'MAIA-OPS-GitHub-Token-Manager',
      Accept: 'application/vnd.github.v3+json',
    };
  }

  /**
   * Validate token by calling GitHub API
   * @returns {Promise<Object>} Token validation result with scopes
   */
  async validateToken() {
    const token = this.loadToken();
    const maskedToken = this.maskToken(token);

    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'api.github.com',
        port: 443,
        path: '/user',
        method: 'GET',
        headers: {
          Authorization: `token ${token}`,
          'User-Agent': 'MAIA-OPS-GitHub-Token-Manager',
        },
      };

      const req = https.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
          data += chunk;
        });

        res.on('end', () => {
          // Extract scopes from response headers
          const scopesHeader = res.headers['x-oauth-scopes'];
          const scopes = scopesHeader ? scopesHeader.split(', ').map((s) => s.trim()) : [];

          if (res.statusCode === 200 || res.statusCode === 204) {
            const validationResult = {
              valid: true,
              maskedToken,
              statusCode: res.statusCode,
              scopes,
              hasRequiredScopes: this.checkRequiredScopes(scopes),
              timestamp: new Date().toISOString(),
            };

            resolve(validationResult);
          } else {
            reject(
              new Error(
                `Token validation failed. Status: ${res.statusCode}. ` +
                `Masked token: ${maskedToken}`,
              ),
            );
          }
        });
      });

      req.on('error', (error) => {
        reject(new Error(`Token validation error: ${error.message}. Masked token: ${maskedToken}`));
      });

      req.setTimeout(10000, () => {
        req.destroy();
        reject(new Error('Token validation timeout'));
      });

      req.end();
    });
  }

  /**
   * Check if token has all required scopes
   * @param {string[]} scopes - Array of scopes from token
   * @returns {Object} Scope validation result
   */
  checkRequiredScopes(scopes) {
    const missing = this.requiredScopes.filter((scope) => !scopes.includes(scope));
    const optionalMissing = this.optionalScopes.filter((scope) => !scopes.includes(scope));

    return {
      hasAllRequired: missing.length === 0,
      missing,
      hasOptional: optionalMissing.length < this.optionalScopes.length,
      optionalMissing,
    };
  }

  /**
   * Validate and return full token health report
   * @returns {Promise<Object>} Complete health report
   */
  async getHealthReport() {
    try {
      const token = this.loadToken();
      const validation = await this.validateToken();
      const scopeCheck = this.checkRequiredScopes(validation.scopes);

      return {
        status: 'healthy',
        maskedToken: this.maskToken(token),
        tokenValidation: {
          valid: validation.valid,
          statusCode: validation.statusCode,
        },
        scopes: {
          present: validation.scopes,
          required: this.requiredScopes,
          optional: this.optionalScopes,
          check: scopeCheck,
        },
        security: {
          loadedFromEnv: true,
          cached: false,
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

// Export singleton instance
module.exports = new GitHubTokenManager();
