import collections
import re

def analyze_text(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        text = f.read().lower()

    # Tokenize (simple)
    words = re.findall(r'\b\w+\b', text)
    
    # Common stop words to exclude (expanded)
    stop_words = set(['the', 'and', 'to', 'a', 'of', 'in', 'is', 'it', 'you', 'that', 'for', 'on', 'with', 'this', 'be', 'are', 'not', 'have', 'i', 'but', 'so', 'we', 'can', 'if', 'my', 'your', 'me', 'do', 'as', 'at', 'or', 'up', 'just', 'like', 'what', 'ok', 'no', 'yes', 'yeah'])
    
    filtered_words = [w for w in words if w not in stop_words and len(w) > 2]
    
    # 2-grams (phrases)
    bigrams = zip(filtered_words, filtered_words[1:])
    bigram_counts = collections.Counter(bigrams)
    
    # Word frequency
    word_counts = collections.Counter(filtered_words)
    
    print("=== TOP 20 WORDS ===")
    for w, c in word_counts.most_common(20):
        print(f"{w}: {c}")
        
    print("\n=== TOP 20 PHRASES (Bigrams) ===")
    for b, c in bigram_counts.most_common(20):
        print(f"{b[0]} {b[1]}: {c}")

if __name__ == "__main__":
    analyze_text(".opencode/ingest/whatsapp_g_clean.txt")
