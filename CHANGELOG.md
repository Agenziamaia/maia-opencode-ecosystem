# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial MAIA Droids ecosystem setup
- Multi-agent collaboration framework
- Auto-handoff tracking system
- Code quality gates with CI/CD
- Loadable skill modules
- Agent performance metrics

### Changed
- Project structure to support agentic development
- Permission model to "allow" for frictionless agent operation

### Deprecated
- Old manual development workflows (replaced by /plan command)

## [0.1.0] - 2025-01-21

### Added
- React + Vite + TypeScript project structure
- Core template files for components, services, utils
- Testing infrastructure with Vitest
- ESLint and Prettier configuration
- Agent configuration and profiles
- Documentation and README

### Security
- No known vulnerabilities

---

## MAIA Agent Commit Convention

When agents commit changes, they follow this format:
```
{agent}:{model}: {description} (session-{id})

Examples:
- coder:glm-4: Add user authentication (session-abc123)
- maia:gpt-4o: Plan new feature (session-def456)
- reviewer:claude-3-5-sonnet: Fix type errors (session-ghi789)
```
