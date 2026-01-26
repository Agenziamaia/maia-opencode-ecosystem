# Skill Module: Cloud Skills Adapter
# Usage: "Load Skill: Cloud Skills"

# Concept
This module allows MAIA Droids (running on GLM/GPT) to "read" and "execute" the logic found in Anthropic/Claude-style `SKILL.md` files *without* using the Anthropic API.

# Adaptation Logic
1.  **Input**: User provides a path to a `SKILL.md` (e.g., `skills/n8n-workflow/SKILL.md`).
2.  **Analysis**:
    -   Identify the `<triggers>` (when to use this).
    -   Extract the `<procedure>` (step-by-step logic).
    -   Ignore specific Claude-xml tags; focus on the *intent*.
3.  **Execution**:
    -   Translate the XML procedure into a Droid Plan.
    -   Execute steps using available tools (`write`, `edit`, `bash`).

# Why this works
We don't need the model to *be* Claude; we just need it to understand the *instructions written for* Claude. GLM-4 and GPT-4o reasoning is sufficient to interpret these high-quality prompts.
