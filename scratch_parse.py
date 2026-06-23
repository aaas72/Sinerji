import re

with open("client/app/(main)/page.tsx", "r", encoding="utf-8") as f:
    code = f.read()

# Find the return statement of Home component
# Home component starts around line 47 and returns the JSX.
# Let's find return ( ... )
start_idx = code.find("return (")
if start_idx == -1:
    print("Could not find return (")
    exit()

# Extract from return ( to the end of the file or the end of the return statement
jsx_code = code[start_idx:]

# Find all JSX tags: <div, </div>, <section, </section, etc.
# We want to ignore self-closing tags like <img ... />, <Navbar ... />, <Fi... />
tag_pattern = re.compile(r"<([a-zA-Z0-9_-]+)(?:\s+[^>]*?)?(/?)(?<!/)>|/([a-zA-Z0-9_-]+)>")
# Wait, a simpler way is to find all opening tags and closing tags
# Let's tokenise the text and match:
# 1. Self closing tags: <tag ... /> (ignore)
# 2. Closing tags: </tag>
# 3. Opening tags: <tag ...>

pos = 0
tokens = []
# Let's clean up comments like {/* ... */}
jsx_code_clean = re.sub(r"\{\/\*.*?\*\/\}/?", "", jsx_code, flags=re.DOTALL)
# Also clean up javascript expressions like {...} by replacing content
# with simple text, but keeping tags
# To do this safely, let's scan character by character:
in_tag = False
in_comment = False
in_expr = 0
current_tag = ""
is_closing = False
is_self_closing = False

i = 0
n = len(jsx_code_clean)
stack = []
errors = []

# Simple scanner to find tag elements
while i < n:
    # Check for JSX comment
    if jsx_code_clean[i:i+3] == "{/*":
        # skip comment
        end_cmt = jsx_code_clean.find("*/}", i)
        if end_cmt != -1:
            i = end_cmt + 3
        else:
            i += 3
        continue
    
    char = jsx_code_clean[i]
    if char == '<':
        # could be start of tag
        # check if it's followed by letter or /
        if i + 1 < n and (jsx_code_clean[i+1].isalpha() or jsx_code_clean[i+1] == '/'):
            # Start of tag parsing
            in_tag = True
            tag_name = ""
            is_closing = False
            is_self_closing = False
            i += 1
            if jsx_code_clean[i] == '/':
                is_closing = True
                i += 1
            while i < n and (jsx_code_clean[i].isalnum() or jsx_code_clean[i] in "-_"):
                tag_name += jsx_code_clean[i]
                i += 1
            # now find the closing > of this tag
            while i < n and jsx_code_clean[i] != '>':
                if jsx_code_clean[i] == '/' and i + 1 < n and jsx_code_clean[i+1] == '>':
                    is_self_closing = True
                i += 1
            if i < n and jsx_code_clean[i] == '>':
                # tag complete
                if not is_self_closing:
                    if is_closing:
                        tokens.append((False, tag_name, i)) # (is_open, name, pos)
                    else:
                        tokens.append((True, tag_name, i))
            in_tag = False
    i += 1

# Print stack matching trace
print(f"Total tags found: {len(tokens)}")
line_offsets = []
for line in code.splitlines(keepends=True):
    line_offsets.append(len(line))

def get_line_no(char_pos):
    current = 0
    for idx, length in enumerate(line_offsets):
        current += length
        if current >= char_pos:
            return idx + 1
    return len(line_offsets)

# Trace matching
stack = []
for is_open, name, pos in tokens:
    line_no = get_line_no(start_idx + pos)
    if is_open:
        stack.append((name, line_no))
    else:
        if not stack:
            print(f"Error: Closing tag </{name}> at line {line_no} has no matching opening tag.")
        else:
            open_name, open_line = stack.pop()
            if open_name != name:
                print(f"Error: Mismatched tags! Opened <{open_name}> at line {open_line}, but closed </{name}> at line {line_no}.")
                # put it back to continue analysis
                stack.append((open_name, open_line))

if stack:
    print("\nRemaining open tags on stack:")
    for name, line in stack:
        print(f"<{name}> opened at line {line} was never closed.")
