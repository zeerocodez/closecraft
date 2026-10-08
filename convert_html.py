import re

with open('stitch_dashboard.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract body or main content
body_match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
if body_match:
    content = body_match.group(1)
else:
    content = html

# Replace class with className
content = re.sub(r'\bclass=', 'className=', content)
# Replace for with htmlFor
content = re.sub(r'\bfor=', 'htmlFor=', content)
# Close self-closing tags
content = re.sub(r'<img([^>]*[^/])>', r'<img\1 />', content)
content = re.sub(r'<input([^>]*[^/])>', r'<input\1 />', content)
content = re.sub(r'<br([^>]*[^/])>', r'<br\1 />', content)
content = re.sub(r'<hr([^>]*[^/])>', r'<hr\1 />', content)

# Write out to a component format
with open('stitch_dashboard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)
print("Conversion complete.")
