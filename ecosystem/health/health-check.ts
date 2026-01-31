/**
 * MAIA Ecosystem Health Check Module
 *
 * Provides health check endpoints and monitoring for the entire ecosystem.
 * Checks agent status, service availability, and system resources.
 */

import { createLogger } from '../../UNIVERSAL/logger/src/index.js';

const logger = createLogger({ useWinston: true, enableFile: true });
const healthLogDir = process.env.HEALTH_LOG_DIR || './logs';

// Health check results interface
interface HealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: Record<string, HealthCheck>;
  summary: HealthSummary;
}

interface HealthCheck {
  status: 'pass' | 'warn' | 'fail';
  message?: string;
  duration?: number;
  metadata?: Record<string, unknown>;
}

interface HealthSummary {
  total: number;
  passing: number;
  warning: number;
  failing: number;
}

// Health check registry
const healthChecks = new Map<string, () => Promise<HealthCheck>>();

/**
 * Register a health check function
 */
export function registerHealthCheck(name: string, check: () => Promise<HealthCheck>): void {
  healthChecks.set(name, check);
  logger.info(`Health check registered: ${name}`);
}

/**
 * Deregister a health check function
 */
export function deregisterHealthCheck(name: string): void {
  healthChecks.delete(name);
  logger.info(`Health check deregistered: ${name}`);
}

/**
 * Run all registered health checks
 */
export async function runHealthChecks(): Promise<HealthCheckResult> {
  const startTime = Date.now();
  const checks: Record<string, HealthCheck> = {};
  let passing = 0;
  let warning = 0;
  let failing = 0;

  // Run all health checks in parallel
  const results = await Promise.allSettled(
    Array.from(healthChecks.entries()).map(async ([name, check]) => {
      const checkStart = Date.now();
      try {
        const result = await check();
        const duration = Date.now() - checkStart;
        return { name, result: { ...result, duration } };
      } catch (error) {
        const duration = Date.now() - checkStart;
        return {
          name,
          result: {
            status: 'fail' as const,
            message: error instanceof Error ? error.message : 'Unknown error',
            duration,
          },
        };
      }
    }),
  );

  // Process results
  for (const result of results) {
    if (result.status === 'fulfilled') {
      checks[result.value.name] = result.value.result;
      if (result.value.result.status === 'pass') passing++;
      else if (result.value.result.status === 'warn') warning++;
      else failing++;
    }
  }

  // Determine overall health
  const total = passing + warning + failing;
  let status: 'healthy' | 'degraded' | 'unhealthy';
  if (failing === 0 && warning === 0) {
    status = 'healthy';
  } else if (failing === 0) {
    status = 'degraded';
  } else {
    status = 'unhealthy';
  }

  const healthResult: HealthCheckResult = {
    status,
    timestamp: new Date().toISOString(),
    checks,
    summary: { total, passing, warning, failing },
  };

  // Log health check result
  const duration = Date.now() - startTime;
  logger.info('Health check completed', {
    status,
    duration: `${duration}ms`,
    ...healthResult.summary,
  });

  return healthResult;
}

/**
 * Built-in health checks
 */

// Agent directory health check
registerHealthCheck('agent-directory', async () => {
  const { existsSync, readdirSync } = await import('fs');
  const agentsPath = './.opencode/agents';

  if (!existsSync(agentsPath)) {
    return {
      status: 'fail',
      message: 'Agent directory not found',
    };
  }

  const agentFiles = readdirSync(agentsPath).filter((f) => f.endsWith('.md'));
  const agentCount = agentFiles.length;

  if (agentCount === 0) {
    return {
      status: 'warn',
      message: 'No agent files found',
      metadata: { agentCount },
    };
  }

  return {
    status: 'pass',
    message: `${agentCount} agents available`,
    metadata: { agentCount },
  };
});

// Environment variables health check
registerHealthCheck('environment', async () => {
  const requiredVars = ['NODE_ENV'];
  const optionalVars = [
    'OPENAI_API_KEY',
    'GEMINI_API_KEY',
    'OPENROUTER_API_KEY',
    'LOG_LEVEL',
  ];

  const missing: string[] = [];
  const present: string[] = [];

  for (const varName of requiredVars) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  for (const varName of optionalVars) {
    if (process.env[varName]) {
      present.push(varName);
    }
  }

  if (missing.length > 0) {
    return {
      status: 'fail',
      message: `Missing required variables: ${missing.join(', ')}`,
      metadata: { missing, present },
    };
  }

  return {
    status: 'pass',
    message: `${present.length} optional variables configured`,
    metadata: { present, missing },
  };
});

// Logger health check
registerHealthCheck('logger', async () => {
  try {
    // Test logger by writing a health log entry
    logger.debug('Health check debug message');
    return {
      status: 'pass',
      message: 'Logger functional',
      metadata: {
        logLevel: process.env.LOG_LEVEL || 'info',
        useWinston: process.env.USE_WINSTON === 'true',
      },
    };
  } catch (error) {
    return {
      status: 'fail',
      message: error instanceof Error ? error.message : 'Logger error',
    };
  }
});

// File system health check
registerHealthCheck('filesystem', async () => {
  const { accessSync, constants, existsSync } = await import('fs');

  const checks = [
    { name: 'logs', path: healthLogDir },
    { name: 'universal', path: './UNIVERSAL' },
    { name: 'agents', path: './.opencode/agents' },
  ];

  let passing = 0;
  const failing: string[] = [];

  for (const check of checks) {
    if (existsSync(check.path)) {
      try {
        accessSync(check.path, constants.R_OK | constants.W_OK);
        passing++;
      } catch {
        failing.push(check.name);
      }
    } else {
      failing.push(check.name);
    }
  }

  if (failing.length > 0) {
    return {
      status: 'warn',
      message: `Some directories not accessible: ${failing.join(', ')}`,
      metadata: { passing, failing },
    };
  }

  return {
    status: 'pass',
    message: 'All directories accessible',
    metadata: { passing, failing: [] },
  };
});

/**
 * Express/Node.js HTTP handler for health checks
 */
export async function healthCheckHandler(): Promise<HealthCheckResult> {
  const result = await runHealthChecks();

  // Return appropriate HTTP status based on health
  const httpStatus = result.status === 'healthy' ? 200 : result.status === 'degraded' ? 200 : 503;

  // In an Express app, you would do:
  // res.status(httpStatus).json(result);

  return result;
}

/**
 * Liveness probe (simple - is the process running?)
 */
export function livenessProbe(): { status: string; timestamp: string } {
  return {
    status: 'alive',
    timestamp: new Date().toISOString(),
  };
}

/**
 * Readiness probe (is the system ready to handle requests?)
 */
export async function readinessProbe(): Promise<{
  status: 'ready' | 'not_ready';
  timestamp: string;
  checks: Record<string, boolean>;
}> {
  const checks: Record<string, boolean> = {
    agents: false,
    logger: false,
    config: false,
  };

  // Quick checks for readiness
  const { existsSync } = await import('fs');
  checks.agents = existsSync('./.opencode/agents');
  checks.logger = existsSync('./UNIVERSAL/logger');
  checks.config = existsSync('./UNIVERSAL/config');

  const allReady = Object.values(checks).every((v) => v);

  return {
    status: allReady ? 'ready' : 'not_ready',
    timestamp: new Date().toISOString(),
    checks,
  };
}
