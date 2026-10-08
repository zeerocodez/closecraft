import re

dark_colors = {
  'surface': '#051424',
  'surface-dim': '#051424',
  'surface-bright': '#2c3a4c',
  'surface-container-lowest': '#010f1f',
  'surface-container-low': '#0d1c2d',
  'surface-container': '#122131',
  'surface-container-high': '#1c2b3c',
  'surface-container-highest': '#273647',
  'on-surface': '#d4e4fa',
  'on-surface-variant': '#c6c6cd',
  'inverse-surface': '#d4e4fa',
  'inverse-on-surface': '#233143',
  'outline': '#909097',
  'outline-variant': '#45464d',
  'surface-tint': '#bec6e0',
  'primary': '#bec6e0',
  'on-primary': '#283044',
  'primary-container': '#0f172a',
  'on-primary-container': '#798098',
  'inverse-primary': '#565e74',
  'secondary': '#7bd0ff',
  'on-secondary': '#00354a',
  'secondary-container': '#00a6e0',
  'on-secondary-container': '#00374d',
  'tertiary': '#c0c1ff',
  'on-tertiary': '#1000a9',
  'tertiary-container': '#050060',
  'on-tertiary-container': '#6d70fb',
  'error': '#ffb4ab',
  'on-error': '#690005',
  'error-container': '#93000a',
  'on-error-container': '#ffdad6',
  'primary-fixed': '#dae2fd',
  'primary-fixed-dim': '#bec6e0',
  'on-primary-fixed': '#131b2e',
  'on-primary-fixed-variant': '#3f465c',
  'secondary-fixed': '#c4e7ff',
  'secondary-fixed-dim': '#7bd0ff',
  'on-secondary-fixed': '#001e2c',
  'on-secondary-fixed-variant': '#004c69',
  'tertiary-fixed': '#e1e0ff',
  'tertiary-fixed-dim': '#c0c1ff',
  'on-tertiary-fixed': '#07006c',
  'on-tertiary-fixed-variant': '#2f2ebe',
  'background': '#051424',
  'on-background': '#d4e4fa',
  'surface-variant': '#273647'
}

css_file = 'src/app/globals.css'
with open(css_file, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace all variables in @theme inline { ... }
# Example: --color-surface: #f4f6f1;
for key, val in dark_colors.items():
    pattern = r'(--color-' + key + r'):\s*#[a-fA-F0-9]+.*?;'
    replacement = f'\\1: {val};'
    content = re.sub(pattern, replacement, content)

with open(css_file, 'w', encoding='utf-8') as f:
    f.write(content)
print("Updated globals.css to dark theme.")
