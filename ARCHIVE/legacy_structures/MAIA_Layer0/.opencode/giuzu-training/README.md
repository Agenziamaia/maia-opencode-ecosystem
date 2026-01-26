# Giuzu Training Data

This folder contains the training data for **Giuzu**, Giulio's digital clone.

## Structure

```
giuzu-training/
├── conversations/       # Past chats and decision examples
├── retrospectives/      # Project learnings (successes, failures)
├── style-guide.md       # Communication patterns
├── preferences.json     # Technical preferences
└── vocabulary.md        # Common phrases and expressions
```

## How to Train Giuzu

### 1. Add Conversation Examples
Copy or paste examples of your communication style into `conversations/`.
Name files descriptively: `slack-message-examples.md`, `email-templates.md`, etc.

### 2. Record Decision Patterns
When you make a significant decision, document it:
```markdown
# Decision: [Title]
**Context**: [Situation]
**Options**: [A, B, C]
**Chosen**: [X]
**Reasoning**: [Why]
```

### 3. Update Preferences
Edit `preferences.json` with your technical preferences:
- Preferred languages/frameworks
- Coding patterns you like/dislike
- Tools you use regularly

### 4. Add Vocabulary
Document phrases you commonly use in `vocabulary.md`:
- Technical jargon
- Communication shortcuts
- Expressions that define your voice

## Giuzu Will Learn From

- Your responses in conversations
- Decisions you make and why
- Feedback you give to agents
- Patterns MAIA observes over sessions
