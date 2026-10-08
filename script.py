import re
import sys

with open('input.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Extract header, main, footer
match = re.search(r'<header.*?</header>.*<main.*?</main>.*<footer.*?</footer>', html, re.DOTALL | re.IGNORECASE)
if match:
    body_content = match.group(0)
else:
    match = re.search(r'<body[^>]*>(.*?)</body>', html, re.DOTALL | re.IGNORECASE)
    body_content = match.group(1) if match else html

# Convert class to className
jsx = re.sub(r'\bclass=', 'className=', body_content)
# Convert inline styles
def style_replacer(m):
    style_str = m.group(1)
    props = []
    for p in style_str.split(';'):
        if ':' in p:
            k, v = p.split(':', 1)
            k = k.strip()
            # camelCase the key
            k = re.sub(r'-([a-z])', lambda m2: m2.group(1).upper(), k)
            props.append(f'"{k}": "{v.strip()}"')
    return 'style={{' + ', '.join(props) + '}}'
jsx = re.sub(r'style=\"([^\"]*)\"', style_replacer, jsx)

# Replace <br>
jsx = re.sub(r'<br\s*>', '<br/>', jsx)
# Replace <!-- comments -->
jsx = re.sub(r'<!--(.*?)-->', r'{/* \1 */}', jsx)

# Wrap in component
final_jsx = f'''"use client";
import Link from "next/link";
import './landing.css';

export default function MarketingPage() {{
  return (
    <>
{jsx}
    </>
  );
}}
'''

with open('tailwind_page.tsx', 'w', encoding='utf-8') as f:
    f.write(final_jsx)

print('Successfully converted HTML to tailwind_page.tsx')
