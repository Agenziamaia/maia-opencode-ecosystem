# GIUZU: Deep Cloning Protocol

## Objective
Create a high-fidelity "Digital Soul" of Giulio (Giuzu) by ingesting, analyzing, and synthesizing behavioral patterns from WhatsApp, Discord, and Social Media history.

## Phase 1: Data Acquisition (The "Munch")
We need raw data to feed the analysis engine.

1.  **WhatsApp**:
    *   **Action**: Export specific chat logs (without media) from WhatsApp.
    *   **Target**: `.opencode/ingest/whatsapp/`
    *   **Format**: `_chat.txt` files.
    *   **Privacy**: Run a local sanitization script (regex) to mask emails/phones if desired.

2.  **Discord**:
    *   **Action**: Request "Data Package" from Discord Privacy settings (takes a few days) OR use a Discord Scraper Bot for specific channels.
    *   **Target**: `.opencode/ingest/discord/`
    *   **Focus**: Your replies in high-signal servers.

3.  **Social Media (X/Twitter/LinkedIn)**:
    *   **Action**: Download Twitter Archive or scrape recent timeline.
    *   **Target**: `.opencode/ingest/socials/`
    *   **Focus**: original tweets/posts (high 'voice' signal).

## Phase 2: Behavioral Analysis (The "Psychoanalysis")
We will use `OpenCode` agents to process this data in chunks, extracting:

*   **Lexicon**: Custom vocabulary, slang, emoji usage patterns.
*   **Tone Vectors**: Formality vs. casualness, optimism vs. cynicism, brevity vs. verbosity.
*   **Belief Systems**: Implicit rules about work, code, life.
*   **Narrative History**: Key life events and decisions referenced in chat.

**Output Artifacts**:
*   `personality_matrix.md`
*   `speaking_style_guide.md`
*   `autobiographical_memory.json`

## Phase 3: Soul Construction (The "Encoding")
We will implement the clone using the **Open Souls** framework (or a custom lightweight equivalent if preferred).

**Why Open Souls?**
*   It separates "Soul" (personality/drive) from "Body" (IO).
*   Allows "Subconscious" processing (background thoughts).
*   Persists state effectively.

**Implementation Steps**:
1.  Initialize `soul-engine`.
2.  Translate `personality_matrix.md` into `staticMemories/core.md`.
3.  Define `MentalProcesses` (e.g., `CodingMode`, `ShitpostingMode`, `AdvisoryMode`).
4.  Train the "Voice" by fine-tuning prompts with few-shot examples from the analysis phase.

## Phase 4: Integration (The "Awakening")
1.  Connect Giuzu Soul to a local endpoint.
2.  Update `.opencode/agents/giuzu.md` to route deep queries to this Soul Engine instance.
3.  **Testing**: "Turing Test" against yourself. (e.g., "How would I respond to this email?")

---

## Immediate Next Steps
1.  Confirm availability of data dumps (WhatsApp/Discord).
2.  Set up the ingestion directory structure.
3.  Run a test analysis on a sample text file.
