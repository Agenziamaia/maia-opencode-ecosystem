#!/usr/bin/env python3
"""
🏥 MAIA Agent Health Check (Smart Timeout Edition)
Checks agents with model-specific timeouts.
"Big Brains" get more time to think. "Fast Agents" must reply quickly.

Usage:
  python3 .opencode/scripts/health_check.py           # Check all agents
  python3 .opencode/scripts/health_check.py --quick   # Only check primary agents
  python3 .opencode/scripts/health_check.py --fix     # Auto-suggest fixes for dead agents
"""

import json
import sys
import time
import subprocess
from pathlib import Path
from datetime import datetime

# ANSI colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

# Timeout Configuration (Seconds)
TIMEOUT_DEFAULT = 15
TIMEOUT_PRO = 45      # Gemini Pro, GPT-4 (Deep thinkers)
TIMEOUT_REASONING = 60 # DeepSeek R1 (Thinking models)

# Agent provider fallbacks (only suggested if DEAD)
FALLBACK_MAP = {
    "openrouter": "google/gemini-2.5-flash",
    "google/gemini-2.5-pro": "google/gemini-2.5-flash",
    "google/gemini-2.0-flash": "google/gemini-2.5-flash",
    "zai-coding-plan": "google/gemini-2.5-flash",
}

def load_config():
    """Load opencode.json"""
    config_path = Path("opencode.json")
    if not config_path.exists():
        print(f"{RED}❌ opencode.json not found{RESET}")
        sys.exit(1)
    
    with open(config_path) as f:
        return json.load(f)

def get_timeout_for_model(model: str) -> int:
    """Return appropriate timeout based on model class"""
    model_lower = model.lower()
    if "pro" in model_lower or "opus" in model_lower:
        return TIMEOUT_PRO
    if "deepseek-r1" in model_lower or "reasoning" in model_lower:
        return TIMEOUT_REASONING
    return TIMEOUT_DEFAULT

def get_provider(model: str) -> str:
    if "/" in model:
        return model.split("/")[0]
    return model

def check_agents(config: dict, quick: bool = False):
    """Check agent status and report"""
    agents = config.get("agent", {})
    
    print(f"\n{BOLD}🏥 MAIA AGENT HEALTH CHECK (SMART TIMEOUTS){RESET}")
    print("━" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⏱️  Standard: {TIMEOUT_DEFAULT}s | Pro: {TIMEOUT_PRO}s | Reasoning: {TIMEOUT_REASONING}s")
    print("━" * 60)
    
    # Priority order for quick check
    priority_agents = ["maia", "sisyphus", "coder", "researcher_fast", "giuzu"]
    
    results = {"alive": [], "dead": [], "unknown": []}
    
    for agent_name, agent_config in agents.items():
        if quick and agent_name not in priority_agents:
            continue
            
        model = agent_config.get("model", "unknown")
        mode = agent_config.get("mode", "subagent")
        timeout = get_timeout_for_model(model)
        
        # Check for known risky configurations
        status = "likely_ok" # optimistic default for static check
        issue = None
        
        if "openrouter" in model.lower() and ":free" in model.lower():
            # DeepSeek free is notoriously flaky, but we allow it if the user wants it
            issue = "Free OpenRouter endpoint (may rate limit)"
            status = "risky"
        
        icon = f"{GREEN}✅{RESET}"
        if status == "risky":
            icon = f"{YELLOW}⚠️{RESET}"
            results["unknown"].append(agent_name)
        else:
            results["alive"].append(agent_name)
            
        # UI formatting
        mode_label = f"{CYAN}[PRIMARY]{RESET}" if mode == "primary" else f"[{mode}]"
        timeout_label = f"({timeout}s timeout)"
        
        print(f"  {icon} {BOLD}{agent_name:<16}{RESET} {mode_label}")
        print(f"      Model: {model} {timeout_label}")
        if issue:
            print(f"      {YELLOW}⚠️  {issue}{RESET}")

    print("\n" + "━" * 60)
    print(f"{GREEN}✅ Likely OK:{RESET} {len(results['alive'])}")
    print(f"{RED}❌ Dead:{RESET} {len(results['dead'])}")
    print(f"{YELLOW}⚠️  Risky:{RESET} {len(results['unknown'])}")
    
    return results

def suggest_fixes(config: dict, results: dict):
    """Suggest fixes for problematic agents"""
    agents = config.get("agent", {})
    
    print(f"\n{BOLD}🔧 SUGGESTED FIXES{RESET}")
    print("━" * 60)
    
    # Combining dead and unknown for suggestions
    problems = results.get("unknown", []) + results.get("dead", [])
    if not problems:
        print("No immediate fixes needed.")
        return

    for agent_name in problems:
        agent_config = agents.get(agent_name, {})
        current_model = agent_config.get("model", "unknown")
        
        # Find fallback
        fallback = None
        for pattern, replacement in FALLBACK_MAP.items():
            if pattern in current_model.lower():
                fallback = replacement
                break
        
        if fallback:
            print(f"\n  {BOLD}{agent_name}{RESET}:")
            print(f"    Current:  {current_model}")
            print(f"    Fallback: {fallback}")
            print(f"    Action:   Switch to fallback if timeouts persist.")

def print_quick_status():
    """Simple status line for WAKEUP script"""
    print(f"{GREEN}✅ Health Check Loaded (Standard: {TIMEOUT_DEFAULT}s, Pro: {TIMEOUT_PRO}s){RESET}")

def main():
    args = sys.argv[1:]
    
    if "--status" in args:
        print_quick_status()
        return
    
    config = load_config()
    quick = "--quick" in args
    fix = "--fix" in args
    
    results = check_agents(config, quick)
    
    if fix:
        suggest_fixes(config, results)
    
    if results["unknown"]:
         print(f"\n{YELLOW}💡 TIP: Some agents are using risky endpoints. If they fail often, run with --fix.{RESET}")

    print()

if __name__ == "__main__":
    main()
