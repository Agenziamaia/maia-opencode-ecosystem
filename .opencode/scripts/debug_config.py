#!/usr/bin/env python3
import json
import os
import sys

def check_config():
    config_path = "opencode.json"
    if not os.path.exists(config_path):
        print(f"Error: {config_path} not found")
        sys.exit(1)
        
    try:
        with open(config_path, 'r') as f:
            data = json.load(f)
            
        print("--- Config Debug ---")
        if 'agent' in data:
            print(f"Agents defined: {list(data['agent'].keys())}")
            for name, cfg in data['agent'].items():
                print(f"  {name}: {cfg.get('model', 'UNKNOWN MODEL')}")
        else:
            print("No 'agent' block found.")
            
        if 'provider' in data:
            print(f"\nProviders defined: {list(data['provider'].keys())}")
        
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in {config_path}: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"❌ Error reading config: {e}")
        sys.exit(1)

if __name__ == "__main__":
    check_config()
