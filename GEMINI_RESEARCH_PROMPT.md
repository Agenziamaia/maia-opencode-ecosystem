# Gemini Research Task: OpenCode Agent God Mode Configuration

## Context
I am building a multi-agent orchestration system using **OpenCode** (https://opencode.ai). I have 5 specialized agents:
- **MAIA**: Orchestrator (GPT-5.2)
- **Coder**: Code Architect (GLM-4.7)
- **Ops**: Infrastructure/DevOps (GLM-4.7)
- **Researcher**: Deep Context Analyst (Gemini-2.5-Pro)
- **Reviewer**: Code Auditor (GLM-4.7)

## What I Need You to Research

### 1. OpenCode Documentation Deep Dive
Go to these URLs and extract ALL relevant information:
- https://opencode.ai/docs/tools/ (ALL built-in tools)
- https://opencode.ai/docs/agents/ (Agent configuration options)
- https://opencode.ai/docs/mcp-servers/ (MCP per-agent assignment)
- https://opencode.ai/docs/custom-tools/ (Creating custom tools)
- https://opencode.ai/docs/skills/ (Skill system)
- https://opencode.ai/docs/permissions/ (Fine-grained permissions)
- https://opencode.ai/docs/config/ (Full config reference)

### 2. Specific Questions to Answer
1. **What is the FULL list of built-in tools** and their capabilities? (I may be missing some)
2. **Can MCP servers be assigned per-agent** and how? (I have partial implementation)
3. **What custom tools should I create** for each agent role?
4. **How do subagent/primary modes work** in practice?
5. **What experimental features exist** (like `OPENCODE_EXPERIMENTAL_LSP_TOOL`)?
6. **Are there any agent orchestration patterns** or examples in the community?

### 3. External Research
- Search for "OpenCode AI agent configuration best practices 2026"
- Search for "multi-agent orchestration LLM tools 2026"
- Search for "OpenCode MCP server examples GitHub"
- Look for any Discord/community discussions about advanced agent setups

### 4. Output Format
Return a structured report with:
1. **Full Tool Reference** (all tools I should enable per agent)
2. **MCP Per-Agent Strategy** (which MCPs for which agents)
3. **Custom Tool Ideas** (per agent role)
4. **Configuration Recommendations** (opencode.json best practices)
5. **Missing Features** (what I haven't implemented yet)
6. **Code Examples** (ready-to-use JSON/Markdown snippets)

## My Current Config (for reference)
I have already implemented:
- Basic tool enable/disable per agent
- MCP servers (filesystem, git, openskills)
- Agent models with explicit provider prefixes
- bash permission guards for dangerous commands

What am I MISSING to make these agents truly "Gods in their own field"?
