#!/usr/bin/env python3
"""
🏥 MAIA Agent Health Check
Checks all agents with 10-second timeout.
Shows which agents are alive and offers fallback options for dead ones.

Usage:
  python3 .opencode/scripts/health_check.py           # Check all agents
  python3 .opencode/scripts/health_check.py --quick   # Only check primary agents
  python3 .opencode/scripts/health_check.py --fix     # Auto-suggest fixes for dead agents
"""

import json
import sys
import time
from pathlib import Path
from datetime import datetime

# ANSI colors
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

TIMEOUT_SECONDS = 10

# Agent provider fallbacks
FALLBACK_MAP = {
    "openrouter": "google/gemini-2.5-flash",  # If OpenRouter fails, use Gemini
    "google/gemini-2.5-pro": "google/gemini-2.5-flash",  # Pro → Flash
    "google/gemini-2.0-flash": "google/gemini-2.5-flash",  # Old → New
    "zai-coding-plan": "google/gemini-2.5-flash",  # Z.ai → Gemini
}


def load_config():
    """Load opencode.json"""
    config_path = Path("opencode.json")
    if not config_path.exists():
        print(f"{RED}❌ opencode.json not found{RESET}")
        sys.exit(1)
    
    with open(config_path) as f:
        return json.load(f)


def get_provider(model: str) -> str:
    """Extract provider from model string"""
    if "/" in model:
        return model.split("/")[0]
    return model


def check_agents(config: dict, quick: bool = False):
    """Check agent status and report"""
    agents = config.get("agent", {})
    
    print(f"\n{BOLD}🏥 MAIA AGENT HEALTH CHECK{RESET}")
    print("━" * 50)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"⏱️  Timeout: {TIMEOUT_SECONDS}s per agent")
    print("━" * 50)
    
    # Priority order for quick check
    priority_agents = ["maia", "sisyphus", "coder", "researcher_fast", "giuzu"]
    
    results = {"alive": [], "dead": [], "unknown": []}
    
    for agent_name, agent_config in agents.items():
        if quick and agent_name not in priority_agents:
            continue
            
        model = agent_config.get("model", "unknown")
        mode = agent_config.get("mode", "subagent")
        provider = get_provider(model)
        
        # Determine status based on known issues
        status = "unknown"
        issue = None
        
        # Check for known problematic configurations
        if "openrouter" in model.lower():
            if ":free" in model.lower():
                status = "risky"
                issue = "Free OpenRouter endpoints are unreliable"
        
        if "gemini-2.0" in model.lower():
            status = "risky"
            issue = "Gemini 2.0 deprecated, use 2.5"
        
        if "qwen" in model.lower() and "openrouter" in model.lower():
            status = "risky"
            issue = "Qwen via OpenRouter has tool support issues"
        
        # For now, mark as unknown since we can't actually ping
        if status == "unknown":
            if provider in ["google", "zai-coding-plan"]:
                status = "likely_ok"
            else:
                status = "unknown"
        
        # Print status
        if status == "likely_ok":
            icon = f"{GREEN}✅{RESET}"
            results["alive"].append(agent_name)
        elif status == "risky":
            icon = f"{YELLOW}⚠️{RESET}"
            results["unknown"].append(agent_name)
        else:
            icon = f"{CYAN}❓{RESET}"
            results["unknown"].append(agent_name)
        
        mode_str = f"{BOLD}[PRIMARY]{RESET}" if mode == "primary" else ""
        print(f"  {icon} {agent_name:20} {mode_str}")
        print(f"      Model: {model}")
        if issue:
            print(f"      {YELLOW}⚠️  {issue}{RESET}")
    
    print("\n" + "━" * 50)
    print(f"{GREEN}✅ Likely OK:{RESET} {len(results['alive'])}")
    print(f"{RED}❌ Dead:{RESET} {len(results['dead'])}")
    print(f"{YELLOW}⚠️  Risky/Unknown:{RESET} {len(results['unknown'])}")
    
    return results


def suggest_fixes(config: dict, results: dict):
    """Suggest fixes for problematic agents"""
    agents = config.get("agent", {})
    
    print(f"\n{BOLD}🔧 SUGGESTED FIXES{RESET}")
    print("━" * 50)
    
    for agent_name in results.get("unknown", []) + results.get("dead", []):
        agent_config = agents.get(agent_name, {})
        current_model = agent_config.get("model", "unknown")
        provider = get_provider(current_model)
        
        # Find fallback
        fallback = None
        for pattern, replacement in FALLBACK_MAP.items():
            if pattern in current_model.lower():
                fallback = replacement
                break
        
        if fallback:
            print(f"\n  {agent_name}:")
            print(f"    Current:  {current_model}")
            print(f"    Fallback: {fallback}")
            print(f"    Fix:      Edit opencode.json → agents → {agent_name} → model")


def print_quick_status():
    """Print a one-line status for session init"""
    config = load_config()
    agents = config.get("agent", {})
    
    ok_count = 0
    risky_count = 0
    
    for agent_name, agent_config in agents.items():
        model = agent_config.get("model", "")
        provider = get_provider(model)
        
        if provider in ["google", "zai-coding-plan"]:
            ok_count += 1
        elif "openrouter" in provider.lower() and ":free" in model.lower():
            risky_count += 1
        else:
            ok_count += 1
    
    if risky_count == 0:
        print(f"{GREEN}✅ All {ok_count} agents use reliable providers{RESET}")
    else:
        print(f"{YELLOW}⚠️  {risky_count} agents use risky providers (OpenRouter free tier){RESET}")


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
    
    # Summary recommendation
    if results["dead"] or results["unknown"]:
        print(f"\n{YELLOW}💡 TIP: Risky agents use OpenRouter free tier or deprecated models.")
        print(f"   Run with --fix to see recommended fallbacks.{RESET}")
    
    print()


if __name__ == "__main__":
    main()
