#!/usr/bin/env python3
"""
🔍 MAIA Semantic Search Service
Uses embeddings to search the knowledge base semantically

This is a foundation script. For full embedding support, install:
  pip install sentence-transformers numpy

Usage:
  python3 semantic_search.py --index           # Build/update index
  python3 semantic_search.py --search "query"  # Search the knowledge base
  python3 semantic_search.py --status          # Show index status
"""

import os
import sys
import json
import hashlib
from pathlib import Path
from datetime import datetime

# Configuration
ROOT = Path(__file__).parent.parent.parent
OPENCODE_DIR = ROOT / '.opencode'
INDEX_DIR = OPENCODE_DIR / 'data' / 'search_index'
INDEX_FILE = INDEX_DIR / 'documents.json'
EMBEDDINGS_FILE = INDEX_DIR / 'embeddings.json'

# Directories to index
INDEXABLE_DIRS = [
    OPENCODE_DIR / 'context',
    OPENCODE_DIR / 'agents',
    OPENCODE_DIR / 'giuzu-training',
    OPENCODE_DIR / 'commands',
    ROOT / 'DOCS',
]

# File extensions to index
INDEXABLE_EXTENSIONS = ['.md', '.txt', '.json']


def ensure_dirs():
    INDEX_DIR.mkdir(parents=True, exist_ok=True)


def get_file_hash(content):
    return hashlib.md5(content.encode()).hexdigest()


def chunk_text(text, max_size=1000, overlap=100):
    """Split text into overlapping chunks"""
    chunks = []
    words = text.split()
    
    if len(words) <= max_size:
        return [text]
    
    start = 0
    while start < len(words):
        end = min(start + max_size, len(words))
        chunk = ' '.join(words[start:end])
        chunks.append(chunk)
        start = end - overlap
    
    return chunks


def collect_documents():
    """Collect all indexable documents"""
    docs = []
    
    for dir_path in INDEXABLE_DIRS:
        if not dir_path.exists():
            continue
        
        for ext in INDEXABLE_EXTENSIONS:
            for filepath in dir_path.rglob(f'*{ext}'):
                try:
                    content = filepath.read_text(encoding='utf-8')
                    relative = filepath.relative_to(ROOT)
                    
                    # Chunk large documents
                    chunks = chunk_text(content)
                    for i, chunk in enumerate(chunks):
                        docs.append({
                            'path': str(relative),
                            'chunk': i,
                            'total_chunks': len(chunks),
                            'content': chunk,
                            'hash': get_file_hash(chunk),
                            'indexed_at': datetime.now().isoformat()
                        })
                except Exception as e:
                    print(f"⚠️  Error reading {filepath}: {e}")
    
    return docs


def build_index():
    """Build the document index (without embeddings)"""
    ensure_dirs()
    
    print("🔍 Building semantic search index...")
    docs = collect_documents()
    print(f"   📄 Found {len(docs)} document chunks")
    
    # Save document index
    with open(INDEX_FILE, 'w') as f:
        json.dump(docs, f, indent=2)
    
    print(f"   ✅ Index saved to {INDEX_FILE}")
    
    # Check for embedding support
    try:
        from sentence_transformers import SentenceTransformer
        print("   🧠 Generating embeddings with sentence-transformers...")
        
        model = SentenceTransformer('all-MiniLM-L6-v2')
        texts = [d['content'] for d in docs]
        embeddings = model.encode(texts, show_progress_bar=True)
        
        # Save as list for JSON compatibility
        embeddings_data = {
            'model': 'all-MiniLM-L6-v2',
            'count': len(embeddings),
            'embeddings': [e.tolist() for e in embeddings]
        }
        
        with open(EMBEDDINGS_FILE, 'w') as f:
            json.dump(embeddings_data, f)
        
        print(f"   ✅ Embeddings saved ({len(embeddings)} vectors)")
        
    except ImportError:
        print("   ℹ️  sentence-transformers not installed")
        print("   ℹ️  Run: pip install sentence-transformers numpy")
        print("   ℹ️  Using keyword search fallback")


def keyword_search(query, docs, top_k=5):
    """Simple keyword-based fallback search"""
    query_words = set(query.lower().split())
    
    scored = []
    for doc in docs:
        content_lower = doc['content'].lower()
        score = sum(1 for w in query_words if w in content_lower)
        if score > 0:
            scored.append((score, doc))
    
    scored.sort(key=lambda x: -x[0])
    return [doc for score, doc in scored[:top_k]]


def semantic_search(query, top_k=5):
    """Search using embeddings or fallback to keywords"""
    ensure_dirs()
    
    if not INDEX_FILE.exists():
        print("❌ Index not found. Run --index first.")
        return []
    
    with open(INDEX_FILE) as f:
        docs = json.load(f)
    
    # Try semantic search
    if EMBEDDINGS_FILE.exists():
        try:
            from sentence_transformers import SentenceTransformer
            import numpy as np
            
            with open(EMBEDDINGS_FILE) as f:
                emb_data = json.load(f)
            
            model = SentenceTransformer(emb_data['model'])
            query_emb = model.encode([query])[0]
            
            embeddings = np.array(emb_data['embeddings'])
            
            # Cosine similarity
            query_norm = query_emb / np.linalg.norm(query_emb)
            emb_norms = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)
            similarities = np.dot(emb_norms, query_norm)
            
            top_indices = np.argsort(similarities)[-top_k:][::-1]
            
            results = []
            for idx in top_indices:
                doc = docs[idx].copy()
                doc['score'] = float(similarities[idx])
                results.append(doc)
            
            return results
            
        except Exception as e:
            print(f"⚠️  Semantic search failed: {e}")
            print("   Falling back to keyword search...")
    
    # Fallback to keyword search
    return keyword_search(query, docs, top_k)


def show_status():
    """Show index status"""
    print("🔍 Semantic Search Status")
    print("━" * 50)
    
    if INDEX_FILE.exists():
        with open(INDEX_FILE) as f:
            docs = json.load(f)
        print(f"📄 Documents indexed: {len(docs)}")
        
        # Show unique files
        files = set(d['path'] for d in docs)
        print(f"📁 Unique files: {len(files)}")
    else:
        print("❌ No index found")
    
    if EMBEDDINGS_FILE.exists():
        with open(EMBEDDINGS_FILE) as f:
            emb_data = json.load(f)
        print(f"🧠 Embeddings: {emb_data['count']} vectors ({emb_data['model']})")
    else:
        print("⚠️  No embeddings (keyword search only)")
    
    print()


def main():
    if len(sys.argv) < 2:
        print("Usage: semantic_search.py [--index | --search \"query\" | --status]")
        sys.exit(1)
    
    cmd = sys.argv[1]
    
    if cmd == '--index':
        build_index()
    elif cmd == '--search' and len(sys.argv) >= 3:
        query = ' '.join(sys.argv[2:])
        results = semantic_search(query)
        
        if '--json' in sys.argv:
            print(json.dumps(results))
            return

        print(f"\n🔍 Results for: \"{query}\"\n")
        for i, r in enumerate(results, 1):
            score = r.get('score', 'N/A')
            if isinstance(score, float):
                score = f"{score:.3f}"
            print(f"{i}. [{score}] {r['path']} (chunk {r['chunk']+1}/{r['total_chunks']})")
            preview = r['content'][:200].replace('\n', ' ')
            print(f"   {preview}...")
            print()
    elif cmd == '--status':
        show_status()
    else:
        print("Invalid command. Use --index, --search, or --status")
        sys.exit(1)


if __name__ == '__main__':
    main()
