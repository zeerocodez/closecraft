import os
import re

def replace_classes_in_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    original = content
    
    # Common pairs
    content = re.sub(r'font-headline-sm\s+text-headline-sm', 'font-medium text-sm', content)
    content = re.sub(r'font-body-sm\s+text-body-sm', 'text-sm', content)
    content = re.sub(r'font-label-md\s+text-label-md', 'text-sm font-medium', content)
    content = re.sub(r'font-label-caps\s+text-label-caps', 'text-xs font-semibold uppercase', content)

    # Remaining single classes
    content = re.sub(r'\bfont-label-caps\b', 'font-semibold', content)
    content = re.sub(r'\btext-label-caps\b', 'text-xs uppercase', content)
    content = re.sub(r'\bfont-headline-sm\b', 'font-medium', content)
    content = re.sub(r'\btext-headline-sm\b', 'text-sm', content)
    content = re.sub(r'\bfont-body-sm\b', 'text-sm', content)
    content = re.sub(r'\btext-body-sm\b', 'text-sm', content)
    content = re.sub(r'\bfont-label-md\b', 'font-medium', content)
    content = re.sub(r'\btext-label-md\b', 'text-sm', content)
    
    # Cleanup multiple spaces
    content = re.sub(r' +', ' ', content)

    if original != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Updated {filepath}")

def process_dir(directory):
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                replace_classes_in_file(os.path.join(root, file))

if __name__ == '__main__':
    process_dir(r'c:\Users\USER\Desktop\closecraft\src\app')
