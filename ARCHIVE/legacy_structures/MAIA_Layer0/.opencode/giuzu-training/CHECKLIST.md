# Giuzu Training Checklist

To bring your digital clone to life, you need to feed it data.

## 1. Governance & Personality
- [ ] **Edit `style-guide.md`**: Define your tone (e.g., "Direct", "Sarcastic", "No fluff").
- [ ] **Edit `preferences.json`**: Set your tech stack hard rules (e.g., "No jQuery", "Always TRPC").
- [ ] **Edit `vocabulary.md`**: Add your catchphrases (e.g., "LGTM", "Ship it", "Absolute cinema").

## 2. Conversation Data (`/conversations`)
Upload raw text examples of:
- [ ] `slack-threads.txt`: How you debate technical decisions.
- [ ] `code-reviews.txt`: How you critique code (harsh vs. gentle).
- [ ] `email-replies.txt`: How you handle requests/reject ideas.
- [ ] `brainstorms.txt`: How you think out loud.

## 3. Decision Patterns (`/retrospectives`)
Create a file `decisions.md` and document 3-5 major calls:
- [ ] **The "Why"**: Why we chose X over Y.
- [ ] **The Process**: How you arrived there.
- [ ] **The Regret**: What you would do differently.

## 4. Calibration
- [ ] Run `/clone "Review this PR"` and compare with your actual review.
- [ ] Run `/clone "How should we build this feature?"` and rate the architecture.
- [ ] **Feedback Loop**: When Giuzu gets it wrong, edit its response and save it to `conversations/corrections.md`.
