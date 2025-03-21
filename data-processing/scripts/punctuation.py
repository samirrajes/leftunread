# This script just adds periods to the end of sentences in the data file when they dont end in punctuation.
# Most people dont end texts with puntuation so this was a good way to fix this.

# Learned these concepts during my bachelors degree.

import re

input_file = "/path/to/input/txt"
output_file = "/path/to/output/txt"

punctuation_marks = ('.','!','?',',',';',':')

with open(input_file, 'r', encoding='utf-8') as infile:
    lines = infile.readlines()

punctuated_lines = []
for line in lines:
    line = line.strip()
    if line and not line.endswith(punctuation_marks):
        line += '.'
    punctuated_lines.append(line)

with open(output_file, 'w', encoding='utf-8') as outfile:
    outfile.write('\n'.join(punctuated_lines))
