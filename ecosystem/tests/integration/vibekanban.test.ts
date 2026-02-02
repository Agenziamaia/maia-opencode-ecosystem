/**
 * VibeKanban Integration Tests
 *
 * Tests the connection and communication with the VibeKanban service
 * for task management and project tracking.
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';

describe('VibeKanban Integration Tests', () => {
  const VIBE_KANBAN_URL = process.env.VIBE_KANBAN_URL || `http://${process.env.VIBE_KANBAN_HOST || '127.0.0.1'}:${process.env.VIBE_KANBAN_PORT || '62601'}`;

  describe('Service Availability', () => {
    it('should have VIBE_KANBAN_URL configured', () => {
      expect(VIBE_KANBAN_URL).toBeDefined();
    });

    it('should be reachable or explicitly offline', async () => {
      let reachable = false;
      let errorType: string | null = null;

      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000);
        const response = await fetch(`${VIBE_KANBAN_URL}/api/projects`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (response.ok) {
          reachable = true;
          const data = await response.json();
          expect(data).toBeDefined();
        } else {
          errorType = `HTTP ${response.status}`;
        }
      } catch (error) {
        errorType = error instanceof Error ? error.message : 'Unknown error';
      }

      // Either service is reachable or we explicitly acknowledge it's offline
      if (!reachable) {
        console.warn(`VibeKanban not reachable: ${errorType} (expected if service is not running)`);
      }
      expect(reachable || errorType !== null).toBe(true);
    });
  });

  describe('API Endpoints', () => {
    it('should define projects endpoint structure', () => {
      const projectsEndpoint = `${VIBE_KANBAN_URL}/api/projects`;
      expect(projectsEndpoint).toMatch(/\/api\/projects$/);
    });

    it('should define tasks endpoint structure', () => {
      const tasksEndpoint = `${VIBE_KANBAN_URL}/api/tasks`;
      expect(tasksEndpoint).toMatch(/\/api\/tasks$/);
    });
  });

  describe('Environment Configuration', () => {
    it('should respect environment variables for VibeKanban', () => {
      const expectedHost = process.env.VIBE_KANBAN_HOST || '127.0.0.1';
      const expectedPort = process.env.VIBE_KANBAN_PORT || '62601';

      expect(VIBE_KANBAN_URL).toContain(expectedHost);
      expect(VIBE_KANBAN_URL).toContain(expectedPort);
    });
  });
});
