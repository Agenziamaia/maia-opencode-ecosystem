---
name: agent-optimization
description: Autonomously trains and optimizes agent prompts using the Agent Lightning gym. Use this when an agent (e.g., coder, researcher) is underperforming or needs to learn a new capability (e.g., "write better tests", "use search more effectively").
tools:
  - run_command
---

# Agent Optimization Skill

This skill allows MAIA to "send an agent to the gym". It triggers a reinforcement learning loop (via Microsoft Agent Lightning) to optimize the target agent's system prompt against a specific objective.

## Usage

When to use:
- User complains about an agent's performance (e.g., "@coder is writing bad tests").
- You want to refine an agent's capability (e.g., "Improve @researcher's summarization").

## Instructions

1.  **Identify the Target**: Which agent needs training? (e.g., `coder`)
2.  **Define the Goal**: What specifically should improve? (e.g., "Must include edge cases in tests")
3.  **Run the Optimization**:
    Call the optimization script via the gym wrapper.

    ```bash
    python3 .opencode/skills/agent-optimization/optimize.py --agent <agent_name> --goal "<learning_objective>"
    ```

4.  **Analyze Results**:
    The script will output the "Before" and "After" performance metrics.
    If the training is successful, the script AUTOMATICALLY updates the agent's prompt file.

## Example

**User**: "@coder keeps forgetting to import modules."
**You**: "I will send @coder to the gym to fix this behavior."
**Action**:
```bash
python3 .opencode/skills/agent-optimization/optimize.py --agent coder --goal "Always ensure all used modules are imported"
```
