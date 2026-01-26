# GIUZU: Analysis Plan

## Data Source Status
*   [x] **WhatsApp (`rahib_glord_mub_maia.txt`)**: Ingested (20k+ lines). High signal for mentorship, tech vision, and casual comms.
*   [ ] **X.com**: Automated scraping failed. Need manual dump or API access.
*   [ ] **Instagram**: Automated scraping failed. Need manual dump.

## Preliminary Insights (from WhatsApp)
**Subject "G" (Giulio) Profile:**

### 1. Core Philosophy (The "Accelerationist" Mindset)
*   Believes "Devs will be replaced by AI".
*   Strategy: Become a "Cyborg" (AI + Human) to stay ahead.
*   Goal: "Hack money", find "glitches" in the system using AI speed.
*   Tone: Excited by the chaos/singularity ("most fun place to be while everyone shits their pants").

### 2. Communication Style
*   **Brevity**: Often one-word answers ("Ok", "Sure") or short bursts.
*   **Media-Heavy**: Uses voice notes (audio omitted) and screenshots frequently.
*   **Directness**: No sugar-coating. "Tf do you mean... Do as I say".
*   **Mentorship**: Guides the other party on tools (Cursor, MCP, Cline), business tactics ("cold calling"), and pricing.

### 3. Tech Stack & Preferences
*   **Tools**: Cursor (strongly preferred), Claude 3.5/3.7, n8n, Coolify, Supabase.
*   **Concepts**: MCP (Model Context Protocol), Firecrawl, Agents ("Vibe Coding").
*   **Hardware/Environment**: Mac, "Office", heavily mobile (WhatsApp).

## Next Steps: Processing Pipeline

### Step 1: Text Cleaning & Segmentation
We will write a script (`process_whatsapp.py`) to:
1.  Filter for messages from "G".
2.  Remove system messages (omitted media, edited tags).
3.  Group consecutive messages into "thoughts".
4.  Pair with "Rahib" messages to create `(Input, Response)` training pairs.

### Step 2: Vector Store Generation
Embed these pairs into a local vector store (using `chromadb` or similar) to allow Giuzu to "recall" how G answered specific questions.

### Step 3: Social Media Gap Fill
Since we can't scrape, we will ask the user to **copy-paste** their bio and last 10 tweets/posts into a file named `.opencode/ingest/socials/manual_dump.md`.

### Step 4: The "Soul" Config
We will update `.opencode/agents/giuzu.md` with a `persona` block derived from this analysis.
