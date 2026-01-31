/**
 * Config Integration Tests
 *
 * Tests the UNIVERSAL/config package ESLint and Prettier configurations.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('UNIVERSAL Config - Integration Tests', () => {
  const configPath = resolve(__dirname, '../../../UNIVERSAL/config');

  describe('ESLint Configuration', () => {
    it('should export a valid ESLint configuration', () => {
      const eslintConfig = require(`${configPath}/eslint.js`);
      expect(eslintConfig).toBeDefined();
      expect(eslintConfig.root).toBe(true);
      expect(eslintConfig.parser).toBe('@typescript-eslint/parser');
    });

    it('should include TypeScript rules', () => {
      const eslintConfig = require(`${configPath}/eslint.js`);
      expect(eslintConfig.rules).toBeDefined();
      expect(eslintConfig.rules['@typescript-eslint/no-explicit-any']).toBe('error');
    });

    it('should warn on console usage (encourage logger usage)', () => {
      const eslintConfig = require(`${configPath}/eslint.js`);
      expect(eslintConfig.rules['no-console']).toBe('warn');
    });

    it('should have proper overrides for different file types', () => {
      const eslintConfig = require(`${configPath}/eslint.js`);
      expect(eslintConfig.overrides).toBeDefined();
      expect(eslintConfig.overrides.length).toBeGreaterThan(0);
    });
  });

  describe('Prettier Configuration', () => {
    it('should have valid Prettier configuration', () => {
      const prettierConfig = require(`${configPath}/.prettierrc`);
      expect(prettierConfig).toBeDefined();
      expect(prettierConfig.singleQuote).toBe(true);
      expect(prettierConfig.semi).toBe(true);
      expect(prettierConfig.printWidth).toBe(100);
    });
  });

  describe('TypeScript Configuration', () => {
    it('should have valid base TypeScript configuration', () => {
      const tsConfig = require(`${configPath}/tsconfig.base.json`);
      expect(tsConfig).toBeDefined();
      expect(tsConfig.compilerOptions).toBeDefined();
      expect(tsConfig.compilerOptions.strict).toBe(true);
    });

    it('should enable no unchecked indexed access', () => {
      const tsConfig = require(`${configPath}/tsconfig.base.json`);
      expect(tsConfig.compilerOptions.noUncheckedIndexedAccess).toBe(true);
    });
  });
});
