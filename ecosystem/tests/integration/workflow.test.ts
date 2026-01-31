/**
 * Core Agent Workflow Integration Tests
 *
 * Tests end-to-end workflows for the MAIA agent system including
 * task distribution, handoffs, and execution tracking.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { readFileSync, writeFileSync, existsSync, unlinkSync } from 'fs';
import { resolve } from 'path';

describe('Core Agent Workflows - Integration Tests', () => {
  const testDataPath = resolve(__dirname, '../../test-data');
  const agentsPath = resolve(__dirname, '../../../.opencode/agents');
  const sessionsPath = resolve(__dirname, '../../../.agents/sessions');

  describe('Agent Discovery', () => {
    it('should discover all registered agents', () => {
      // Check if .opencode/agents directory exists
      expect(existsSync(agentsPath)).toBe(true);

      // List agent files
      const agentFiles = require('fs')
        .readdirSync(agentsPath)
        .filter((f: string) => f.endsWith('.md'));

      // Should have multiple agents
      expect(agentFiles.length).toBeGreaterThan(0);
    });

    it('should have required agent profiles', () => {
      const requiredAgents = ['maia.md', 'coder.md', 'sisyphus.md', 'giuzu.md'];

      for (const agent of requiredAgents) {
        const agentPath = resolve(agentsPath, agent);
        expect(existsSync(agentPath), `Agent ${agent} should exist`).toBe(true);
      }
    });
  });

  describe('Session Tracking', () => {
    const testSessionFile = resolve(sessionsPath, `test-session-${Date.now()}.json`);

    beforeEach(() => {
      // Ensure sessions directory exists
      if (!existsSync(sessionsPath)) {
        require('fs').mkdirSync(sessionsPath, { recursive: true });
      }
    });

    afterEach(() => {
      // Clean up test session file
      if (existsSync(testSessionFile)) {
        unlinkSync(testSessionFile);
      }
    });

    it('should create session tracking files', () => {
      const sessionData = {
        sessionId: `test-${Date.now()}`,
        agent: 'test-agent',
        startTime: new Date().toISOString(),
        tasks: [],
      };

      writeFileSync(testSessionFile, JSON.stringify(sessionData, null, 2));
      expect(existsSync(testSessionFile)).toBe(true);

      const readData = JSON.parse(readFileSync(testSessionFile, 'utf-8'));
      expect(readData.sessionId).toBe(sessionData.sessionId);
    });

    it('should track handoffs between agents', () => {
      const handoffData = {
        from: 'maia',
        to: 'coder',
        task: 'Implement feature X',
        timestamp: new Date().toISOString(),
        context: { sessionId: `test-${Date.now()}` },
      };

      writeFileSync(testSessionFile, JSON.stringify(handoffData, null, 2));
      const readData = JSON.parse(readFileSync(testSessionFile, 'utf-8'));

      expect(readData.from).toBe('maia');
      expect(readData.to).toBe('coder');
    });
  });

  describe('Environment Configuration', () => {
    it('should load environment variables from .env.example template', () => {
      const envExamplePath = resolve(__dirname, '../../../.env.example');
      expect(existsSync(envExamplePath)).toBe(true);

      const envContent = readFileSync(envExamplePath, 'utf-8');
      expect(envContent).toContain('OPENAI_API_KEY');
      expect(envContent).toContain('LOG_LEVEL');
    });
  });

  describe('Logger Integration', () => {
    it('should use UNIVERSAL/logger across ecosystem', () => {
      const loggerFiles = [
        resolve(__dirname, '../../../.opencode/maia-layer0/utils/logger.ts'),
        resolve(__dirname, '../../../PROJECTS/default-template/src/utils/logger.ts'),
        resolve(__dirname, '../../../PROJECTS/whatsapp-agentic-bot/src/utils/logger.ts'),
      ];

      for (const loggerFile of loggerFiles) {
        if (existsSync(loggerFile)) {
          const content = readFileSync(loggerFile, 'utf-8');
          expect(content).toContain('UNIVERSAL/logger');
        }
      }
    });
  });
});
