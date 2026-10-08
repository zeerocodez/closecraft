import urllib.request
import re
import os

screens = {
    "appointments": "https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1ZDI4YjA5NDJiYTkwNWYxMTg3NmQ5MDUzYzMwEgsSBxCo7Yqpkg4YAZIBIwoKcHJvamVjdF9pZBIVQhM2NTk0Njc4NTM4MzIyNTkxODA3&filename=&opi=89354086"
}

def to_jsx(html):
    match = re.search(r'<div class="pl-64">(.*?)</div>\s*</body>', html, re.DOTALL | re.IGNORECASE)
    if match:
        content = match.group(1)
    else:
        match2 = re.search(r'(<header.*?</main>)', html, re.DOTALL | re.IGNORECASE)
        if match2:
            content = match2.group(1)
        else:
            content = html

    content = re.sub(r'\bclass=', 'className=', content)
    content = re.sub(r'\bfor=', 'htmlFor=', content)
    content = re.sub(r'<img([^>]*[^/])>', r'<img\1 />', content)
    content = re.sub(r'<input([^>]*[^/])>', r'<input\1 />', content)
    content = re.sub(r'<br([^>]*[^/])>', r'<br\1 />', content)
    content = re.sub(r'<hr([^>]*[^/])>', r'<hr\1 />', content)
    
    return f"""import React from 'react';
import {{ auth }} from "@/lib/auth";
import {{ redirect }} from 'next/navigation';

export default async function Page() {{
  const session = await auth();
  if (!session?.user) {{
    redirect('/login');
  }}

  return (
    <>
      {content}
    </>
  );
}}
"""

for page, url in screens.items():
    print(f"Downloading {page}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    html = urllib.request.urlopen(req).read().decode('utf-8')
    jsx = to_jsx(html)
    
    out_dir = f"src/app/(saas)/{page}"
    os.makedirs(out_dir, exist_ok=True)
    with open(f"{out_dir}/page.tsx", "w", encoding="utf-8") as f:
        f.write(jsx)
    print(f"Saved to {out_dir}/page.tsx")
