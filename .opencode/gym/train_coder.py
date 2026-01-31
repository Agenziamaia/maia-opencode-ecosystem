import os
import agentlightning as agl

# Concept: A simple agent that generates code
# We want to optimize its prompt.

# Signature must be (task, llm) or (task, prompt_template)
@agl.rollout
def coder_agent(task: str, llm=None):
    """
    A simple coder agent.
    """
    # This is a placeholder. In a real scenario, we would call an LLM here.
    # agl.call_llm(..., prompt=...)
    return f"Code for {task}"

def main():
    print("Agent Lightning Gym - Pilot")
    # Placeholder for optimization logic
    # trainer = agl.Trainer(...)
    # trainer.fit(coder_agent, dataset=...)
    print("coder_agent created successfully.")

if __name__ == "__main__":
    main()
