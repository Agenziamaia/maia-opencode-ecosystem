import re
import os

def parse_whatsapp(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    messages = []
    # Regex for standard WhatsApp export format: [date, time] Sender: Message
    # Example: [4/16/25, 7:17:05 PM] Rahib: Hello
    pattern = re.compile(r'^\[(\d{1,2}/\d{1,2}/\d{2,4}),\s(\d{1,2}:\d{2}:\d{2}\s?[AP]M)\]\s([^:]+):\s(.*)$')

    current_msg = None

    for line in lines:
        # Remove LRM marks if present
        line = line.replace('\u200e', '')
        match = pattern.match(line)
        if match:
            if current_msg:
                messages.append(current_msg)
            date, time, sender, content = match.groups()
            current_msg = {
                'date': date,
                'time': time,
                'sender': sender.strip(),
                'content': content.strip(),
                'is_media': '<attached:' in content or 'omitted' in content
            }
        else:
            # Continuation of previous message
            if current_msg:
                current_msg['content'] += '\n' + line.strip()

    if current_msg:
        messages.append(current_msg)
    
    return messages

def analyze_g_messages(messages, target_sender="G"):
    # Filter for G
    g_msgs = [m for m in messages if m['sender'] == target_sender]
    
    # Text dump
    text_content = [m['content'] for m in g_msgs if not m['is_media']]
    
    # Print stats
    print(f"Total Messages: {len(messages)}")
    print(f"Target '{target_sender}' Messages: {len(g_msgs)}")
    print(f"Clean Text Lines: {len(text_content)}")
    
    # Save to file
    output_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ingest', 'whatsapp_g_clean.txt')
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(text_content))
    
    print(f"Dumped clean text to {output_path}")

    return text_content

if __name__ == "__main__":
    chat_file = ".opencode/ingest/whatsapp/rahib_glord_mub_maia.txt"
    if os.path.exists(chat_file):
        print(f"Processing {chat_file}...")
        msgs = parse_whatsapp(chat_file)
        # Identify the user name for G. In the chat it appears as "G".
        # We will scan senders just to be sure.
        senders = set(m['sender'] for m in msgs)
        print(f"Found senders: {senders}")
        
        if "G" in senders:
            analyze_g_messages(msgs, "G")
        else:
            print("Could not find sender 'G'. Please check the sender name.")
    else:
        print(f"File not found: {chat_file}")
