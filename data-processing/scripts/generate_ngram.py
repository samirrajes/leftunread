import json
import sys

# this script builds a word-level n-gram dictionary from a given text file.
# each n-gram maps to a list of words that follow it.

# you can use this script with this command: python3 generate_ngram.py [path/to/text/file] [n]

# code adapted from p5js implementation of n-gram from class
def build_ngram(text, n=1):
    words = text.split()
    ngram = {}
    for i in range(len(words) - n):
        gram = " ".join(words[i:i+n])
        next_word = words[i+n]
        if gram not in ngram:
            ngram[gram] = []
        ngram[gram].append(next_word)
    return ngram

if __name__ == '__main__':
    # default: "final_data.txt" & n=1
    input_filename = sys.argv[1] if len(sys.argv) > 1 else "final_data.txt"
    n = int(sys.argv[2]) if len(sys.argv) > 2 else 1

    # read the training text from file
    with open(input_filename, 'r', encoding='utf-8') as f:
        text = f.read()

    # build an n-gram dictionary.
    ngram = build_ngram(text, n)

    # save dictionary to JSON file
    output_filename = f"ngram_{n}.json"
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(ngram, f, ensure_ascii=False, indent=2)
