#!/usr/bin/env python3
"""
MAIA OpenCode Config Validator
Validates opencode.json against the JSON schema
"""

import json
import sys
from pathlib import Path

# Try to import jsonschema, fallback to basic validation if not available
try:
    from jsonschema import validate, ValidationError
    HAS_JSONSCHEMA = True
except ImportError:
    HAS_JSONSCHEMA = False

def get_project_root():
    """Find the project root (where opencode.json lives)"""
    current = Path(__file__).resolve()
    for parent in current.parents:
        if (parent / 'opencode.json').exists():
            return parent
    return None

def basic_validate(config):
    """Basic validation when jsonschema is not available"""
    errors = []
    
    # Required top-level keys
    required = ['default_agent', 'model', 'agent']
    for key in required:
        if key not in config:
            errors.append(f"Missing required key: {key}")
    
    # Check agent structure
    if 'agent' in config:
        for agent_name, agent_config in config['agent'].items():
            if not isinstance(agent_config, dict):
                errors.append(f"Agent '{agent_name}' must be an object")
                continue
            for req in ['description', 'model', 'mode']:
                if req not in agent_config:
                    errors.append(f"Agent '{agent_name}' missing '{req}'")
            
            # Check mode is valid
            if agent_config.get('mode') not in ['primary', 'subagent']:
                errors.append(f"Agent '{agent_name}' has invalid mode")
    
    return errors

def main():
    root = get_project_root()
    if not root:
        print("❌ Could not find project root (opencode.json)")
        sys.exit(1)
    
    config_path = root / 'opencode.json'
    schema_path = root / '.opencode' / 'schema' / 'opencode.schema.json'
    
    # Load config
    try:
        with open(config_path) as f:
            config = json.load(f)
    except json.JSONDecodeError as e:
        print(f"❌ Invalid JSON in opencode.json: {e}")
        sys.exit(1)
    
    # Validate
    if HAS_JSONSCHEMA and schema_path.exists():
        try:
            with open(schema_path) as f:
                schema = json.load(f)
            validate(instance=config, schema=schema)
            print(f"✅ opencode.json is valid ({len(config.get('agent', {}))} agents)")
            sys.exit(0)
        except ValidationError as e:
            print(f"❌ Schema validation failed: {e.message}")
            print(f"   Path: {list(e.absolute_path)}")
            sys.exit(1)
    else:
        # Fallback to basic validation
        errors = basic_validate(config)
        if errors:
            print("❌ Config validation failed:")
            for err in errors:
                print(f"   - {err}")
            sys.exit(1)
        else:
            agent_count = len(config.get('agent', {}))
            print(f"✅ opencode.json is valid ({agent_count} agents) [basic check]")
            sys.exit(0)

if __name__ == '__main__':
    main()
