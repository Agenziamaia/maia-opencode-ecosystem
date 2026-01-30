#!/usr/bin/env python3
"""
🗺️ KNOWLEDGE MAPPER
Generates a structural map of the ecosystem for the agents to understand context.
"""

import os
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent
OUTPUT_FILE = ROOT / '.opencode' / 'data' / 'knowledge_map.json'

EXCLUDE_DIRS = {'.git', 'node_modules', '.venv', '__pycache__', '.DS_Store', 'dist', 'build'}

def generate_map():
    tree = {"name": "ROOT", "type": "directory", "children": []}
    
    for root, dirs, files in os.walk(ROOT):
        # Filter dirs
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        path = Path(root)
        relative = path.relative_to(ROOT)
        
        if str(relative) == ".":
            node = tree
        else:
            # Find parent node
            parts = relative.parts
            node = tree
            for part in parts:
                found = next((c for c in node["children"] if c["name"] == part), None)
                if not found:
                    found = {"name": part, "type": "directory", "children": []}
                    node["children"].append(found)
                node = found
        
        # Add files
        for f in files:
            if f in EXCLUDE_DIRS: continue
            if f.endswith('.md') or f.endswith('.ts') or f.endswith('.py') or f.endswith('.json'):
                node["children"].append({"name": f, "type": "file"})

    # Save
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_FILE.write_text(json.dumps(tree, indent=2))
    print(f"✅ Knowledge Map generated: {OUTPUT_FILE}")

if __name__ == "__main__":
    generate_map()
