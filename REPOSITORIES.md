# 🗺️ MAIA Ecosystem: Unified Topology

This document defines the purpose, structure, and external intelligence sources within the ecosystem.

---

## 🏛️ INTERNAL REPOSITORIES

### 1. 🧠 Layer 0 (Universal Intelligence)
**Path**: `/Users/g/Desktop/MAIA opencode/layer0`
**Role**: The "Brain" and template engine.
- **Purpose**: Source of truth for agent behavior (`.opencode/agents/`), global scripts, and verified successes.
- **Protocol**: Every major fix or success in a project should be "promoted" back to Layer 0 to ensure progressive improvement.
- **Sync Master**: Located at `layer0/.opencode/scripts/strategy_sync.py`.

### 2. 🚀 MAIA Production Ecosystem
**Path**: `/Users/g/Desktop/MAIA opencode`
**Role**: The "Execution" layer.
- **Purpose**: The active workspace where projects are built and agents are executed in production.
- **Structure**: Contains the `layer0/` folder to allow a unified terminal experience and easy access to core logic.

### 3. 🛡️ MAIA Redundancy (Archive)
**Path**: `/Users/g/Desktop/MAIA_Layer0`
**Role**: The "Safety" layer.
- **Purpose**: A mirrored archive maintained for version-safety and emergency recovery.

---

## 🛰️ EXTERNAL INTELLIGENCE (Studied & Validated)

| Repository | Purpose | Key Notes | Status |
| :--- | :--- | :--- | :--- |
| **[Sisyphus OG](https://github.com/CovertLab/sisyphus)** | Task Execution Engine | **Concept**: Decentralized worker running commands in containers. **Agency**: Pulls/Pushes to data stores. No leader nodes. Used as the logical foundation for our `@sisyphus` agent. | ✅ Studied |
| **[Ecosystem Remote](https://github.com/Agenziamaia/maia-opencode-ecosystem)** | GitHub Remote | Production remote for coordination. | ✅ Active |
| **[Layer-0 Remote](https://github.com/Agenziamaia/multiagent-layer0)** | GitHub Remote | Brain-tier logic remote. | ✅ Active |

---

## 📜 THE LIBRARIAN PROTOCOL
Whenever a link is provided in the chat:
1.  **@researcher** studies the content to understand intent, safety, and utility.
2.  **@sisyphus** creates a project task to integrate the information if relevant.
3.  **@librarian** (or @ops) updates this `REPOSITORIES.md` with:
    - **Link** + **Description**
    - **Key Takeaways** (Safe/Useful/Clean status)
    - **Implementation Note** (How it helps the current task)

---

## 📋 Folder Management for User
- **Unified Workspace**: Access everything by opening `/Users/g/Desktop/MAIA opencode`. 
- **Layer 0 Access**: Core logic and scripts are inside the `layer0/` subdirectory.
- **Progressive Place**: Always move verified fixes from production into `layer0/` to build the "Universal Layer".
