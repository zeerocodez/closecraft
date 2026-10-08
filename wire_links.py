import re

with open('src/app/(marketing)/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace links in header
header_match = re.search(r'<header.*?<\/header>', content, re.DOTALL)
if header_match:
    header = header_match.group(0)
    
    # 1. Logo
    header = header.replace('<a className="flex items-center gap-space-sm group" data-path="home" href="#">', '<Link className="flex items-center gap-space-sm group" href="#hero">')
    header = header.replace('</span></a><nav', '</span></Link><nav')
    
    # 2. Platform
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="platform" href="#">Platform</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#how-it-works">Platform</Link>')
    
    # 3. Solutions
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="solutions" href="#">Solutions</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#who-its-for">Solutions</Link>')
    
    # 4. Revenue Engine
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="revenue-engine" href="#">Revenue Engine</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#revenue-leakage">Revenue Engine</Link>')
    
    # 5. Integrations, Pricing, Case Studies -> just change to <Link href="#">
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="integrations" href="#">Integrations</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#integrations">Integrations</Link>')
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="pricing" href="#">Pricing</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#pricing">Pricing</Link>')
    header = header.replace('<a className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="case-studies" href="#">Case Studies</a>', '<Link className="px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="#case-studies">Case Studies</Link>')
    
    # Client Sign In
    header = header.replace('<a className="hidden sm:inline-flex items-center px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" data-path="sign-in" href="/login">Client Sign In</a>', '<Link className="hidden sm:inline-flex items-center px-space-md py-space-sm text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors" href="/login">Client Sign In</Link>')
    
    # Book Executive Demo -> button
    header = header.replace('<a className="inline-flex items-center justify-center px-space-lg py-space-sm bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-label-md rounded-lg shadow-sm transition-all" data-path="book-executive-demo" href="#">Book Executive Demo</a>', '<button onClick={openAudit} className="inline-flex items-center justify-center px-space-lg py-space-sm bg-primary text-on-primary hover:bg-primary-container hover:text-on-primary-container font-label-md text-label-md rounded-lg shadow-sm transition-all">Book Executive Demo</button>')
    
    # User icon
    header = header.replace('<div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></div>', '<Link href="/dashboard" className="w-8 h-8 rounded-full bg-primary flex items-center justify-center ml-space-xs"><span className="material-symbols-outlined text-on-primary text-[18px]">person</span></Link>')
    
    content = content[:header_match.start()] + header + content[header_match.end():]
    
    with open('src/app/(marketing)/page.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    
    print('Header links updated')
else:
    print('Header not found')
