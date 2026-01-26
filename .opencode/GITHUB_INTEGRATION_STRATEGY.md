# MAIA GitHub Integration Strategy

## 🎯 HYBRID STRUCTURE

### Core Repository (This Repo)

- **Purpose**: MAIA orchestrator, shared infrastructure
- **Branches**:
  - `main` - Stable production
  - `develop` - Integration branch
  - `experimental/*` - New features, experiments
- **Scope**: Agent ecosystem, skills, MCP integrations

### Production Applications (Separate Repos)

- **Pattern**: `maia-{app-name}` or `{app-name}-maia`
- **Examples**:
  - `maia-whatsapp-bot` (from whatsapp-agentic-bot)
  - `maia-list-app` (from list project)
  - `maia-layer0-core` (from MAIA_Layer0)
- **Advantages**:
  - Independent deployments
  - Separate access control
  - Clean git history
  - Scoped CI/CD

### Experimental Projects (Branches)

- **Pattern**: `experimental/{feature-name}` in core repo
- **Lifecycle**:
  - Created as branch
  - Developed and tested
  - If successful → either:
    - Merge to core (infrastructure feature)
    - Move to separate repo (new product)
- **Advantages**:
  - Quick iteration
  - Shared infrastructure
  - Easy cleanup (delete branch)

---

## 🔄 GITHUB MCP TOOLS AVAILABLE

### Repository Management (`github_repos_*`)

- `create_repository` - Create new repo (for production apps)
- `get_repository` - Get repo details
- `list_repositories` - List repos
- `update_repository` - Update repo settings
- `delete_repository` - Delete repo
- `fork_repository` - Fork a repo
- `configure_branch_protection` - Branch rules

### Branch Management (`github_git_*`)

- `create_branch` - Create experimental branch
- `delete_branch` - Delete merged/failed branch
- `get_branch` - Get branch details
- `list_branches` - List all branches

### Pull Requests (`github_pull_requests_*`)

- `create_pull_request` - Create PR for review
- `list_pull_requests` - List PRs
- `get_pull_request` - Get PR details
- `merge_pull_request` - Merge PR
- `add_review` - Request review

### Files (`github_files_*`)

- `get_file_content` - Read file from GitHub
- `create_or_update_file` - Sync files to GitHub
- `delete_file` - Remove file from GitHub

### Issues (`github_issues_*`)

- `create_issue` - Track bugs/features
- `list_issues` - View issues
- `update_issue` - Update issue status

### CI/CD (`github_actions_*`)

- `list_workflow_runs` - Check CI status
- `get_workflow_run` - Get build details
- `rerun_workflow` - Retry failed builds

---

## 🚀 GITHUB WORKFLOW PATTERNS

### Pattern 1: Create Production App (New Repo)

```
1. User: "I want a new WhatsApp bot for hotels"
2. MAIA: Uses github_repos_create_repository()
3. Result: Creates maia-whatsapp-hotel-bot repo
4. MAIA: Clones to workspace
5. MAIA: Builds using existing template
6. MAIA: Commits and pushes
7. MAIA: Configures CI/CD via github_actions_*
```

### Pattern 2: Experimental Feature (Branch)

```
1. User: "Try adding Discord integration"
2. MAIA: Uses github_git_create_branch("experimental/discord")
3. MAIA: Develops feature
4. MAIA: Creates PR via github_pull_requests_create_pull_request()
5. User: Reviews PR
6. MAIA: Merges or deletes branch
```

### Pattern 3: File Sync

```
1. User: "Sync README to GitHub"
2. MAIA: Uses github_files_create_or_update_file()
3. Result: README.md updated in repo
```

---

## 🔐 SECURITY & ACCESS

### Token Management

- Uses `GITHUB_TOKEN_DEV_ROOT` from `.env.github`
- Never logged or exposed
- Validated on startup

### Agent Permissions

| Agent       | GitHub Access                               |
| ----------- | ------------------------------------------- |
| @maia       | Read repos, list repos (strategic overview) |
| @coder      | Full access (create, update, files, PRs)    |
| @ops        | Full access + webhooks, actions             |
| @workflow   | Targeted access (issues, PRs, triggers)     |
| @researcher | Read-only (list, get)                       |
| @reviewer   | Read-only (PRs, files)                      |

---

## 📋 GITHUB INTEGRATION STATUS

| Component             | Status         | Notes                              |
| --------------------- | -------------- | ---------------------------------- |
| GitHub Remote MCP     | ✅ ACTIVE      | 100+ tools available               |
| Token Manager         | ✅ ACTIVE      | Secure, validated                  |
| Agent Permissions     | ✅ CONFIGURED  | Per-agent access                   |
| Custom Implementation | ❌ REMOVED     | Bloat eliminated                   |
| Hybrid Structure      | 🟡 IN PROGRESS | Core repo + separate repos         |
| Guided Stage System   | 🟡 IN PROGRESS | Start→Plan→Code→Test→Deploy→Expand |

---

## 🎯 NEXT STEPS

1. **Test GitHub Tools**: Verify tools work with your token
2. **Create Production Repo**: Use GitHub MCP to create first production app repo
3. **File Sync**: Implement bi-directional sync for README, config
4. **CI/CD Enhancement**: Update GitHub workflows with new tools
5. **Guided System**: Build lifecycle prompts for each stage

---

**Last Updated**: 2026-01-22
**MCP Version**: Official GitHub Remote Server
