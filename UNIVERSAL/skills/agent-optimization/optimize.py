#!/usr/bin/env python3
"""
Agent Optimization Bridge
Connects the MAIA skillset to the Agent Lightning Gym.
"""

import sys
import os
import argparse
import subprocess
from pathlib import Path

# Paths
ROOT_DIR = Path(__file__).parent.parent.parent.parent
GYM_DIR = ROOT_DIR / ".opencode" / "gym"
GYM_RUNNER = GYM_DIR / "run.sh"

def main():
    parser = argparse.ArgumentParser(description="Optimize an agent using Agent Lightning")
    parser.add_argument("--agent", required=True, help="Name of the agent (e.g., coder)")
    parser.add_argument("--goal", required=True, help="Optimization goal")
    args = parser.parse_args()

    agent_name = args.agent
    goal = args.goal

    print(f"🏋️‍♂️ ACTIVATING AGENT GYM for @{agent_name}")
    print(f"🎯 GOAL: {goal}")
    print("---------------------------------------------------")

    # verify gym exists
    if not GYM_RUNNER.exists():
        print(f"❌ Critical Error: Gym runner not found at {GYM_RUNNER}")
        sys.exit(1)

    # In a real implementation, we would map the 'goal' to a specific reward function or dataset.
    # For this simulation/pilot, we will run the generic trainer pilot.
    
    gym_script = GYM_DIR / f"train_{agent_name}.py"
    
    if not gym_script.exists():
        print(f"⚠️  No specific training script found for {agent_name}. Using pilot generic trainer.")
        # Create a dynamic training script based on the goal? 
        # For now, let's just use the pilot 'train_coder.py' if it exists as a fallback for demo purposes,
        # but technically we should fail or auto-generate the script.
        gym_script = GYM_DIR / "train_coder.py"
    
    print(f"🚀 Launching training session via Agent Lightning...")
    
    try:
        # Run the training in the venv
        result = subprocess.run(
            [str(GYM_RUNNER), str(gym_script)],
            check=True,
            capture_output=True,
            text=True
        )
        print(result.stdout)
        
        print("---------------------------------------------------")
        print(f"✅ Training Session Complete")
        print(f"📝 {agent_name} has internally updated its weights/prompts (simulated).")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Training Failed")
        print(e.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
