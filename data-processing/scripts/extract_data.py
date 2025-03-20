# this script takes all text files within a folder, and compiles only the text messages sent by me

import os
import re
import glob

YOUR_NAME = "samir"
input_folder = "./path/to/exported/chatlogs"
output_folder = "./output/path"
os.makedirs(output_folder, exist_ok=True)

# regex patterns
chat_line_pattern = re.compile(r'^\[\d{2}/\d{2}/\d{4},.*?\] (.*?): (.+)$')
emoji_pattern = re.compile("["
    "\U0001F600-\U0001F64F"
    "\U0001F300-\U0001F5FF"
    "\U0001F680-\U0001F6FF"
    "\U0001F1E0-\U0001F1FF"
    "\U00002700-\U000027BF"
    "\U000024C2-\U0001F251"
"]+", flags=re.UNICODE)

all_messages = []

for file_path in glob.glob(os.path.join(input_folder, "*.txt")):
    with open(file_path, "r", encoding="utf-8") as f:
        lines = f.readlines()

    chat_name = os.path.splitext(os.path.basename(file_path))[0]
    my_messages = []

    for line in lines:
        match = chat_line_pattern.match(line.strip())
        if match:
            sender, message = match.groups()
            if sender.lower() == YOUR_NAME.lower() and "omitted" not in message.lower():
                # remove emojis from the message
                clean_message = emoji_pattern.sub(r'', message).strip()
                if clean_message:
                    my_messages.append(clean_message)

    # save each individual conversation log
    out_file = os.path.join(output_folder, f"exported_chatlog_{chat_name}.txt")
    with open(out_file, "w", encoding="utf-8") as f_out:
        f_out.write("\n".join(my_messages))

    all_messages.extend(my_messages)

# save combined corpus
with open("/output/file/name", "w", encoding="utf-8") as f_combined:
    f_combined.write("\n".join(all_messages))
