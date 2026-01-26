# MAIA Environment Variables Setup Guide

## Quick Setup

1. Copy the appropriate example file:
   ```bash
   cp .env.github.example .env.github
   ```

2. Edit the file and add your actual values:
   ```bash
   nano .env.github
   ```

3. Source the file (for current session):
   ```bash
   set +o history && source .env.github && set -o history
   ```

## Environment Files

### `.env.github`
- **Purpose**: GitHub API tokens and configuration
- **Required**: GITHUB_TOKEN_DEV_ROOT
- **Template**: `.env.github.example`

### Sub-project Environment Files

Each sub-project has its own .env requirements:

- `whatsapp-agentic-bot/.env.example`
- `whatsapp-bot-demo/.env.example`
- `list/.env.example` (if exists)

## Security Rules

❌ **NEVER** commit real .env files to git
✅ **ALWAYS** use .env.example templates
✅ **ALWAYS** add .env files to .gitignore
✅ **ROTATE** tokens regularly

## Common Variables

| Variable | Purpose | Example |
|----------|---------|----------|
| `GITHUB_TOKEN_DEV_ROOT` | GitHub API token | `ghp_••••••••••••••••••••••` |
| `OPENAI_API_KEY` | OpenAI API access | `sk-••••••••••••••••••••••` |
| `DATABASE_URL` | Database connection | `postgresql://user:pass@host:5432/db` |

## Token Generation

### GitHub Token
1. Go to: https://github.com/settings/tokens
2. Click "Generate new token (classic)"
3. Scopes: `repo`, `read:org`, `workflow`
4. Copy and paste into `.env.github`

### OpenAI API Key
1. Go to: https://platform.openai.com/api-keys
2. Click "Create new secret key"
3. Copy and paste into relevant .env file

## Troubleshooting

**Issue**: "Environment variable not found"
- **Solution**: Ensure you've sourced the .env file before running commands

**Issue**: "Permission denied"
- **Solution**: Check token has required scopes

**Issue**: "Token expired"
- **Solution**: Generate new token and update .env file

---

**Last Updated**: 2026-01-22
