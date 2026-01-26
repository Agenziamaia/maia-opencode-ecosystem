#!/usr/bin/env node

/**
 * OPS (GLM-4.7): GitHub Token Validation Script
 *
 * Usage:
 *   node .opencode/validate-github-token.js
 *
 * Environment:
 *   GITHUB_TOKEN_DEV_ROOT must be set
 */

const tokenManager = require('./github-token-manager');

console.log('╔════════════════════════════════════════════════════════════╗');
console.log('║   GITHUB TOKEN VALIDATION & HEALTH CHECK                 ║');
console.log('╚════════════════════════════════════════════════════════════╝\n');

(async () => {
  try {
    console.log('🔍 Loading token from environment...');
    const healthReport = await tokenManager.getHealthReport();

    if (healthReport.status === 'healthy') {
      console.log('✅ Token Status: HEALTHY\n');

      console.log('📋 Token Details:');
      console.log(`   Masked: ${healthReport.maskedToken}`);
      console.log(
        `   Validation Status: ${healthReport.tokenValidation.valid ? 'Valid' : 'Invalid'}`,
      );
      console.log(`   HTTP Status: ${healthReport.tokenValidation.statusCode}\n`);

      console.log('🔐 Scopes:');
      console.log(`   Present: [${healthReport.scopes.present.join(', ') || 'none'}]`);
      console.log(`   Required: [${healthReport.scopes.required.join(', ')}]`);
      console.log(`   Optional: [${healthReport.scopes.optional.join(', ')}]\n`);

      if (healthReport.scopes.check.hasAllRequired) {
        console.log('✅ All required scopes are present.');
      } else {
        console.log('❌ Missing required scopes:');
        healthReport.scopes.check.missing.forEach((scope) => {
          console.log(`   - ${scope}`);
        });
      }

      if (healthReport.scopes.check.hasOptional) {
        const presentOptional = healthReport.scopes.optional.filter(
          (s) => !healthReport.scopes.check.optionalMissing.includes(s),
        );
        if (presentOptional.length > 0) {
          console.log('ℹ️  Optional scopes present:', presentOptional.join(', '));
        }
      } else {
        console.log('ℹ️  Optional scopes not present (optional):');
        healthReport.scopes.check.optionalMissing.forEach((scope) => {
          console.log(`   - ${scope}`);
        });
      }

      console.log('\n🛡️  Security Status:');
      console.log(`   Loaded from Environment: ${healthReport.security.loadedFromEnv}`);
      console.log(`   Cached in Memory: ${healthReport.security.cached}`);
      console.log(`   Timestamp: ${healthReport.security.timestamp}\n`);

      if (healthReport.scopes.check.hasAllRequired) {
        console.log('✅ Token is ready for use by @coder API layer.\n');
        process.exit(0);
      } else {
        console.log('⚠️  Token is missing required scopes. Please regenerate token.\n');
        process.exit(1);
      }
    } else {
      console.log('❌ Token Status: UNHEALTHY\n');
      console.log('Error:', healthReport.error);
      console.log('\nPlease check your GITHUB_TOKEN_DEV_ROOT environment variable.\n');
      process.exit(1);
    }
  } catch (error) {
    console.log('❌ Validation failed:\n');
    console.log(error.message);
    console.log('\nTroubleshooting:');
    console.log('1. Ensure GITHUB_TOKEN_DEV_ROOT is set in .env.github');
    console.log('2. Source the environment file: source .env.github');
    console.log('3. Verify token format (must start with ghp_, ghu_, etc.)');
    console.log('4. Check network connectivity to api.github.com\n');
    process.exit(1);
  }
})();
