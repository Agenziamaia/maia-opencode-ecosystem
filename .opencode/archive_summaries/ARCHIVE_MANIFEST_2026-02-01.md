# 🦅 THE MAIA GRIMOIRE (2026-02-01)
> *The Backpack for the Next Level / The Deep Manifest*

**Location**: `../ARCHIVE_2026-02-01`
**Status**: ACTIVE MEMORY (Preserved & Referenceable)
**Objective**: To arm the next agent with the tools, patterns, and lessons required to survive and thrive.

---

## 🎒 THE BACKPACK (Essential External Intelligence)
*These are the tools we scouted. Do not lose them.*

| Tool | URL | Why we need it |
| :--- | :--- | :--- |
| **Vibe Kanban** | [https://github.com/BloopAI/vibe-kanban](https://github.com/BloopAI/vibe-kanban) | The only Kanban board that feels "alive". We need to integrate this for task visualization. |
| **MCP Browser** | [https://github.com/modelcontextprotocol/mcp-browser](https://github.com/modelcontextprotocol/mcp-browser) | The eyes of the agent. Allows headless navigation for research. |
| **Agent Lightning** | [https://github.com/microsoft/agent-lightning](https://github.com/microsoft/agent-lightning) | Optimization framework. We used this to study how to tune our `MetaLearning` engine. |

---

## ⚡ THE BREAKTHROUGHS (Monumental Leaps)

### 1. The Great Purge (Reclaiming 1GB)
*The moment we became lean.*
We were carrying 941MB of dead weight in `ARCHIVE/`. The `.gitignore` was ignored because the files were already tracked.
**The Fix**:
```bash
# The Surgical Strike
git rm -r --cached ARCHIVE/
git rm -r --cached tsconfig.tsbuildinfo
git rm -r --cached .DS_Store
find . -name ".DS_Store" -print0 | xargs -0 git rm --cached --ignore-unmatch
```
*Lesson*: `git rm --cached` is the only way to respect a new `.gitignore` rule for old files.

### 2. The Daemon Singleton (The Brain)
*The moment we became a system.*
We moved from "scripts" to a "Daemon".
**The Pattern**:
```typescript
// .opencode/ecosystem/execution/maia-daemon.ts
export class MaiaDaemon extends EventEmitter {
  private static instance: MaiaDaemon;
  
  // Singleton Pattern: One Mind, One State
  public static getInstance(): MaiaDaemon {
    if (!MaiaDaemon.instance) {
      MaiaDaemon.instance = new MaiaDaemon();
    }
    return MaiaDaemon.instance;
  }

  // The Dispatcher: Decouples Intent from Execution
  public async dispatch(instruction: string, preferredAgent?: string) {
     const agentId = preferredAgent || this.decideAgent(instruction);
     return this.execution.createTask(instruction, { agentId });
  }
}
```

### 3. The Wiring (Real Agent Dispatch)
*The moment we stopped pretending.*
We replaced mock maps with real execution calls.
**The Fix in `session-tools.ts`**:
```typescript
// Before: return "started session (mock)"
// After:
const daemon = getMaiaDaemon();
const task = await daemon.dispatch(args.text, args.agent);
return \`🦅 MAIA DAEMON: Dispatched Task \${task.id} to @\${args.agent}\`;
```

---

## 🧬 THE SPELLBOOK (Reusable Design Patterns)

### A. The "Glassmorphism" CSS Token
*Copy this to any `globals.css` to instantly upgrade UI quality.*
```css
@layer components {
  .card-glass {
    @apply bg-white/5 backdrop-blur-lg border border-white/10;
  }
}
```

### B. The "Next.js Safe" p5.js Loader
*How to run generative art without breaking SSR.*
```typescript
useEffect(() => {
  if (isOpen && !P5) {
    import('p5').then((mod) => {
      P5 = mod.default;
      createSketch();
    });
  }
}, [isOpen]);
```

### C. The Drag-and-Drop State Logic
*Native HTML5 DnD, lighter than any library.*
```typescript
const handleDrop = (targetColumnId: string) => {
  setTasks(prev => {
    // Filter from Source, Push to Target
    // Simple, Immutable, Fast.
  });
}
```

---

## � THE ARCHIVE INDEX (Where the bodies are buried)

If you need to dig deeper, the files are physically located at:
`../ARCHIVE_2026-02-01/`

-   **`maia-landing-page(paused)/`**: The complete Next.js 15 + Tailwind app.
-   **`legacy_structures/`**: The old `layer0` prompts and broken discord bots.
-   **`broken_tools/`**: Failed experiments.

> *We carry this backpack so we don't have to reinvent the wheel. We only invent the future.*
