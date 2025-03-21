# This script takes a list of names from a file. 
# And creates a new file, all lowercase, and with variations of the names like 's/s endings.

# Basically for this project, I created a curated list of names that appear in my messages, 
# and used this script to further process them.

# Learned these concepts during my bachelors degree.

# read curated names list
with open('path/to/curated/names/file', 'r', encoding='utf-8') as file:
    # remove whitespace and empty lines
    names = [line.strip() for line in file if line.strip()]

# deduplicate names, using a set
names_set = set(name.lower() for name in names)

# for each name, also add the possessive versions, if they dont exist
final_names = set()
for name in names_set:
    final_names.add(name)
    if not name.endswith("'s"):
        final_names.add(name + "'s")

    if not name.endswith("s"):
        final_names.add(name + "s")

# write the processed names to a new file
with open('path/to/output/names/file', 'w', encoding='utf-8') as file:
    for name in sorted(final_names):
        file.write(name + "\n")
