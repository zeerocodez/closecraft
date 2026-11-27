import re

with open('src/app/(marketing)/page.tsx', 'r', encoding='utf-8') as f:
    page_tsx = f.read()

with open('tailwind_page.tsx', 'r', encoding='utf-8') as f:
    tailwind = f.read()

tw_header_match = re.search(r'<header.*?</header>', tailwind, re.DOTALL)
if tw_header_match:
    tw_header = tw_header_match.group(0)
    page_tsx = re.sub(r'<header className="site-nav">.*?</header>', tw_header, page_tsx, flags=re.DOTALL)
    
logo_strip_match = re.search(r'{/\* Client Logo & Ecosystem Trust Strip \*/}.*?<div.*?</div>\s*</div>', tailwind, re.DOTALL)
logo_strip = logo_strip_match.group(0) if logo_strip_match else ""

loop_match = re.search(r'{/\* The Core Loop Visual Progression: Architectural Pipeline \*/}\s*<section.*?</section>', tailwind, re.DOTALL)
loop_section = loop_match.group(0) if loop_match else ""

bento_match = re.search(r'{/\* Signature Features Bento Grid \*/}\s*<section.*?</section>', tailwind, re.DOTALL)
bento_section = bento_match.group(0) if bento_match else ""

roi_match = re.search(r'{/\* Quantified Commercial Impact & ROI Ledger \*/}\s*<section.*?</section>', tailwind, re.DOTALL)
roi_section = roi_match.group(0) if roi_match else ""

to_insert = '\n\n' + logo_strip + '\n\n' + loop_section + '\n\n' + bento_section + '\n\n' + roi_section

hero_match = re.search(r'<section id="hero".*?</section>', page_tsx, re.DOTALL)
if hero_match:
    hero_end = hero_match.end()
    page_tsx = page_tsx[:hero_end] + to_insert + page_tsx[hero_end:]

with open('src/app/(marketing)/page.tsx', 'w', encoding='utf-8') as f:
    f.write(page_tsx)

print('Merge complete!')
