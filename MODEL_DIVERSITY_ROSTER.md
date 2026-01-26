# 🎯 MAIA Agent Model Diversity Roster

**Updated**: 2026-01-24
**Philosophy**: Maximum model diversity for specialized tasks while ensuring reliability.

---

## Model Providers Available

| Provider | Authentication | Status |
| :--- | :--- | :--- |
| **Z.AI** (GLM-4.7) | `zai-coding-plan/` prefix | ✅ Paid (3-month subscription) |
| **Google** (Gemini) | `google/` prefix | ✅ Direct integration |
| **OpenAI** (GPT-5.2) | `openai/` prefix | ✅ Premium reserve |
| **OpenRouter** (Free Models) | `openrouter/` prefix | ✅ Configured |

---

## Final Agent Roster

### Tier 1: Core Reasoning (Z.AI GLM-4.7 - Paid)
High-stakes, logic-intensive work requiring reliability.

| Agent | Model | Rationale |
| :--- | :--- | :--- |
| **@maia** | `zai-coding-plan/glm-4.7` | Orchestrator needs best reasoning |
| **@coder** | `zai-coding-plan/glm-4.7` | Code synthesis demands precision |
| **@ops** | `zai-coding-plan/glm-4.7` | Infrastructure commands are high-risk |
| **@reviewer** | `zai-coding-plan/glm-4.7` | Must catch bugs the coder missed |

### Tier 2: Research (Google Gemini - Direct)
Deep context windows for document ingestion.

| Agent | Model | Rationale |
| :--- | :--- | :--- |
| **@researcher** | `google/gemini-2.5-pro` | 1M token context for deep research |
| **@researcher_fast** | `google/gemini-2.5-flash` | Fast, high availability fallback |
| **@vision** | `google/gemini-2.5-flash` | Native multimodal capabilities |
| **@opencode** | `google/gemini-2.5-flash` | Config tasks don't need premium |
| **@starter** | `google/gemini-2.5-flash` | Onboarding is conversational |

### Tier 3: Specialized (OpenRouter Free Models)
Unique capabilities for specialized tasks.

| Agent | Model | Rationale |
| :--- | :--- | :--- |
| **@workflow** | `openrouter/qwen/qwen3-coder:free` | Qwen3 Coder excels at JSON/automation |
| **@giuzu** | `openrouter/deepseek/deepseek-r1-0528:free` | DeepSeek R1 for reasoning/pattern learning |

### Tier 4: Premium Reserve (OpenAI GPT-5.2)
For complex challenges requiring escalation.

| Agent | Model | Rationale |
| :--- | :--- | :--- |
| **@maia_premium** | `zai-coding-plan/glm-4.7` | Heavy-duty reasoning when needed |

---

## OpenRouter Free Models Registered

These models are configured in the `provider.openrouter.models` section:

| Model ID | Display Name | Best For |
| :--- | :--- | :--- |
| `qwen/qwen3-coder:free` | Qwen3 Coder | Code generation, JSON, automation |
| `deepseek/deepseek-r1-0528:free` | DeepSeek R1 | Deep reasoning, chain-of-thought |
| `meta-llama/llama-3.3-70b-instruct:free` | Llama 3.3 70B | General purpose, instruction following |
| `google/gemini-2.0-flash-exp:free` | Gemini 2.0 Flash | Fast multimodal |
| `mistralai/mistral-small-3.1-24b-instruct:free` | Mistral Small 3.1 | Efficient, French/European languages |
| `moonshotai/kimi-k2:free` | Kimi K2 | Long context, Chinese support |
| `z-ai/glm-4.5-air:free` | GLM 4.5 Air | Fallback for GLM-4.7 |

---

## Model Format Reference

| Provider | Format | Example |
| :--- | :--- | :--- |
| Z.AI | `zai-coding-plan/model` | `zai-coding-plan/glm-4.7` |
| Google | `google/model` | `google/gemini-2.5-pro` |
| OpenAI | `openai/model` | `zai-coding-plan/glm-4.7` |
| OpenRouter | `openrouter/org/model:variant` | `openrouter/qwen/qwen3-coder:free` |

---

## Diversity Benefits

1. **Resilience**: If one provider has issues, others still work
2. **Cost Optimization**: Use free models for high-volume tasks
3. **Specialization**: Match model strengths to task requirements
4. **Fallback Chain**: Each agent has fallback options defined

---

## How to Add More OpenRouter Models

1. Find the model ID on OpenRouter: https://openrouter.ai/models
2. Add to `provider.openrouter.models` in `opencode.json`:
   ```json
   "provider": {
     "openrouter": {
       "models": {
         "org/model-name:variant": {
           "name": "Display Name"
         }
       }
     }
   }
   ```
3. Reference in agent config: `"model": "openrouter/org/model-name:variant"`

---

*This roster maximizes resource utilization across all available providers.*
