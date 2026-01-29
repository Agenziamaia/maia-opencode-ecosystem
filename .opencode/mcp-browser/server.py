from mcp.server.fastmcp import FastMCP
from browser_use import Agent
import asyncio
import os
import sys

# Initialize FastMCP
mcp = FastMCP("browser-use")

@mcp.tool()
async def browse_web(task: str) -> str:
    """
    Autonomous browser agent (God Mode).
    Give it a high-level task like:
    - "Go to amazon.com and find the cheapest iPhone 15 case"
    - "Login to X and post a tweet" (if logged in)
    - "Research the latest news on CNN"
    
    The agent will control a headless Chrome instance to navigate, click, type, and extract data.
    
    Args:
        task: The natural language description of what to do in the browser.
    """
    try:
        # Using default LLM configuraton from browser-use (expects OPENAI_API_KEY or similar in env)
        agent = Agent(task=task)
        history = await agent.run()
        
        # Extract result
        # history is a History object. We want the final result.
        return str(history)

    except Exception as e:
        return f"Browser Agent Error: {str(e)}"

if __name__ == "__main__":
    mcp.run()
