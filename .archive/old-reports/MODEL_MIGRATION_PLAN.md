# Model Migration Plan: Best Agent for the Job

## Goal

Ensure every agent has the **Best Available Model** based on:
1.  **Reliability**: Must work 100% of the time (no 404/429 errors).
2.  **Capability**: Must fit the agent's specific niche (Code, Vision, Research).
3.  **Cost Efficiency**: Use Paid GLM-4.7 for critical tasks, High-Quality Free models for volume.

---

## 2. Updated Roster

| Agent | Role | New Model | Provider | Why? |
| :--- | :--- | :--- | :--- | :--- |
| **@maia** | Orchestrator | `zai-coding-plan/glm-4.7` | Paid (Z.AI) | Requires top-tier reasoning. You paid for it! |
| **@coder** | Architect | `zai-coding-plan/glm-4.7` | Paid (Z.AI) | Coding requires the best logic available. |
| **@ops** | DevOps God | `zai-coding-plan/glm-4.7` | Paid (Z.AI) | One mistake in `rm -rf` is fatal. Use the best. |
| **@reviewer** | Gatekeeper | `zai-coding-plan/glm-4.7` | Paid (Z.AI) | **UPGRADE**. Previous model (`hermes:free`) was rate-limited/flaky. Reviewer needs to be smarter than the Coder. |
| **@researcher** | Oracle | `google/gemini-2.5-pro` | OpenRouter (Free/Paid) | Deep context window is critical for research. |
| **@researcher_fast** | Fast Oracle | `google/gemini-2.5-flash` | OpenRouter (Free) | Validated as working and fast. |
| **@vision** | The Eyes | `google/gemini-2.5-flash` | OpenRouter (Free) | **UPGRADE**. `gemini-flash` is multimodal native and vastly superior to `nvidia/nemotron-nano`. |
| **@workflow** | Automation | `qwen/qwen-2.5-coder-32b-instruct` | OpenRouter (Free) | Best open-source coding model. Perfect for n8n/json tasks. |
| **@giuzu** | Clone | `qwen/qwen-2.5-coder-32b-instruct` | OpenRouter (Free) | Best personality/roleplay + code mix for a clone. |

---

## 3. Why This Wins

1.  **Zero Flakiness**: We removed the rate-limited `hermes` and the confused `nemotron`.
2.  **Maximum ROI**: You paid for GLM-4.7. We now use it for the Reviewer, ensuring your code audits are actually useful (God-Tier).
3.  **Better Vision**: Moving Vision to Gemini Flash gives you state-of-the-art image understanding, not a small local model.
4.  **No Dead Ends**: Every model on this list was verified as "Online" in our test script.

## 4. Next Steps

1.  Applying changes to `opencode.json`.
2.  Restart OpenCode to load the new config.
3.  Enjoy a fully operational battle station.
