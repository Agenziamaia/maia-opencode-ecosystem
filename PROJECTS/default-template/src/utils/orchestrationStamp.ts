/**
 * Orchestration Stamp Utility
 *
 * Generates a deterministic, stable string representation from input data.
 * Useful for tracking orchestration pipelines and ensuring reproducible builds.
 *
 * @example
 * orchestrationStamp({ service: 'api', version: '1.0.0' })
 * // Returns: 'api-1.0.0-7f3d2a'
 */

interface StampInput {
  service: string;
  version: string;
  environment?: string;
}

/**
 * Creates a deterministic string from orchestration metadata.
 *
 * @param input - The orchestration input data
 * @returns A stable, deterministic string stamp
 */
export function orchestrationStamp(input: StampInput): string {
  // Validate required fields
  if (!input.service || input.service.length === 0) {
    throw new Error('Service name is required');
  }

  if (!input.version || input.version.length === 0) {
    throw new Error('Version is required');
  }

  // Sanitize inputs to prevent injection
  const sanitizedService = input.service.replace(/[^a-zA-Z0-9-]/g, '');
  const sanitizedVersion = input.version.replace(/[^a-zA-Z0-9.-]/g, '');
  const sanitizedEnvironment = input.environment
    ? input.environment.replace(/[^a-zA-Z0-9-]/g, '')
    : 'prod';

  // Create base string
  const baseString = `${sanitizedService}-${sanitizedVersion}-${sanitizedEnvironment}`;

  // Create deterministic hash (simple but stable)
  let hash = 0;
  const combined = baseString;

  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }

  // Convert to positive hex string
  const hexHash = Math.abs(hash).toString(16).padStart(6, '0');

  return `${baseString}-${hexHash}`;
}
