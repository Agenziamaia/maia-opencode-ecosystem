# 🏛️ MAIA DEEP ARCHIVE MANIFEST (2026-02-01)
> *Preserving the Soul of the Machine*

**Status**: Archived / Preserved
**Location**: `../ARCHIVE_2026-02-01` (External Backup)
**Objective**: To document, analyze, and preserve the "Pattern DNA" of deprecated components so that lessons are never lost, even if code is.

---

## 💎 The Crown Jewel: `maia-landing-page(paused)`

**What was it?**
A production-grade Next.js 15 application designed to showcase MAIA's agentic capabilities. It was not just a landing page but a "Skill Demonstration Platform" featuring live React generation, algorithmic art, and PDF automation.

**Why was it archived?**
It represents a "Completed Artifact" that does not need to be in the active monorepo development loop. It is a product, not a toolchain component. Keeping it in the main repo slowed down `git` operations due to heavy `node_modules` and build artifacts (900MB+).

### 🧠 Strategic Lessons & DNA
From `IMPLEMENTATION_SUMMARY.md`, we extracted these critical patterns for future "Frontend Agent" tasks:

1.  **The "Glassmorphism" Standard**: 
    -   *Technique*: Semi-transparent cards with backdrop blur + gradients.
    -   *Why*: It solves the "Generic AI Look" (purple on black) by adding depth and texture.
    -   *Lesson*: Don't use flat colors. Use layered opacity.

2.  **Next.js 15 + Tailwind 4 Conflicts**:
    -   *Issue*: Tailwind v4 had compatibility issues with the specific PostCSS setup.
    -   *Fix*: Downgraded to Tailwind v3.4 for stability.
    -   *Rule*: For new Next.js projects, pin Tailwind to v3.4 until v4 stabilizes.

3.  **Client-Side "Sparkle"**:
    -   *Component*: `AlgorithmicArtDemo.tsx` using `p5.js`.
    -   *Insight*: Client-side generative art requires careful handling of `window` objects in Next.js (SSR). Even "static" sites need dynamic islands.

### 📦 Artifact Inventory
| Component | Function | Lines of Code | Key Tech |
| :--- | :--- | :--- | :--- |
| **VibeKanban** | React Drag-n-Drop Board | ~200 | HTML5 DnD, Framer Motion |
| **AlgorithmicArt** | Generative Canvas | ~150 | p5.js, Seeded Randomness |
| **InternalComms** | PDF Generator | ~300 | jsPDF, Auto-Form |
| **ReactGen** | Live Code Editor | ~100 | React-Live (simulated) |

### 🛠️ Restoration Guide
To bring this back to life:
1.  Copy `../ARCHIVE_2026-02-01/maia-landing-page(paused)` to `PROJECTS/maia-web`.
2.  Run `npm install` (The heavy node_modules were purged, but `package.json` is intact).
3.  Run `npm run dev`.

---

## 🦕 Legacy Structures

**What was it?**
The fossil record of MAIA's evolution from a simple prompt (`layer0`) to a complex agent.

### 1. `MAIA_Layer0`
-   **Description**: The "Primordial Soup". The first prompt that defined you.
-   **Lesson**: Simplicity works. The original prompt had high compliance because it lacked conflicting instructions. Modern agents suffer from "Instruction Bloat".

### 2. `broken_tools/`
-   **`discord.ts.disabled`**: An attempt to run a discord bot directly in the agent process.
    -   *Failure Mode*: Blocking the event loop.
    -   *Solution*: Moved to **n8n** (External Event Driven).
    -   *Rule*: Agents should *emit* messages, not *host* listeners.

---

## ⚡ Quick Stats of the Purge
-   **Files Removed**: ~1,200
-   **Space Reclaimed**: ~940 MB
-   **Repo Health**: 100% (Green)

> *We do not delete memory. We crystalize it.*
