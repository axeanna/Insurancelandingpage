import os, glob, re

ROOT = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'

# ===== FIX CSS (issues 5, 6, 7) =====
css_path = os.path.join(ROOT, 'css', 'styles.css')
with open(css_path, 'r', encoding='utf-8') as f:
    css = f.read()

# 6: Add --text-dark to :root
if '--text-dark' not in css:
    css = css.replace('--border-color: #E2E8F0;', '--border-color: #E2E8F0;\n    --text-dark: #2D3748;')

# 5: Fix label color (already done but ensure correct)
css = re.sub(r'(label\s*\{[^}]*?)color:[^;]+;', r'\1color: rgba(255, 255, 255, 0.85);', css, flags=re.DOTALL)

# 7: .nav-cta
if '.nav-cta' not in css:
    css += '''
.nav-cta {
    background: var(--primary-red);
    color: var(--pure-white) !important;
    padding: 10px 22px;
    border-radius: 50px;
    font-weight: 600;
}
.nav-cta:hover {
    background: var(--hover-red);
    transform: translateY(-2px);
    color: var(--pure-white) !important;
}
'''
with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css)
print("CSS fixed.")

# ===== HELPER: build clean footer UL =====
def footer_ul(is_ms, prefix=''):
    if is_ms:
        idx, prod, calc, part = f'{prefix}index-ms.html', f'{prefix}products-ms.html', f'{prefix}calculator-ms.html', f'{prefix}partners-ms.html'
        return f'''<ul>
                    <li><a href="{idx}#home">Utama</a></li>
                    <li><a href="{idx}#about">Tentang</a></li>
                    <li><a href="{prod}">Produk</a></li>
                    <li><a href="{calc}">Kalkulator</a></li>
                    <li><a href="{part}">Rakan Kongsi</a></li>
                    <li><a href="{idx}#quote">Hubungi Saya</a></li>
                </ul>'''
    else:
        idx, prod, calc, part = f'{prefix}index.html', f'{prefix}products.html', f'{prefix}calculator.html', f'{prefix}partners.html'
        return f'''<ul>
                    <li><a href="{idx}#home">Home</a></li>
                    <li><a href="{idx}#about">About</a></li>
                    <li><a href="{prod}">Products</a></li>
                    <li><a href="{calc}">Calculator</a></li>
                    <li><a href="{part}">Partners</a></li>
                    <li><a href="{idx}#quote">Let's Connect</a></li>
                </ul>'''

def clean_footer_links(html, is_ms, prefix=''):
    title = 'Pautan Pantas' if is_ms else 'Quick Links'
    new_block = f'''<div class="footer-links">
                <h3>{title}</h3>
                {footer_ul(is_ms, prefix)}
            </div>'''
    # Replace everything from <div class="footer-links"> to the matching </div>
    return re.sub(r'<div class="footer-links">.*?</div>', new_block, html, flags=re.DOTALL)

# ===== FIX ROOT HTML FILES (issues 1, 8, 9, 10, 11) =====
root_files = glob.glob(os.path.join(ROOT, '*.html'))
for fp in root_files:
    fn = os.path.basename(fp)
    is_ms = '-ms' in fn
    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()

    # 1: Fix footer
    html = clean_footer_links(html, is_ms)

    # 8: Remove duplicate hero comment
    html = html.replace('<!-- Hero Section -->\n    <!-- Hero Section -->', '<!-- Hero Section -->')

    # 9: Ensure hero span centered
    html = html.replace(
        'font-weight: 400; color: rgba(255,255,255,0.85);">',
        'font-weight: 400; color: rgba(255,255,255,0.85); text-align: center;">'
    )

    # 10: Fix partners navbar link
    if is_ms:
        html = html.replace('<a href="#partners">Rakan Kongsi</a>', '<a href="partners-ms.html">Rakan Kongsi</a>')
    else:
        html = html.replace('<a href="#partners">Partners</a>', '<a href="partners.html">Partners</a>')

    # 11: First accordion open by default in products pages
    if 'products' in fn and 'accordion-item' in html:
        html = html.replace('<div class="accordion-item">', '<div class="accordion-item active">', 1)

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(html)

print("Root HTML files fixed.")

# ===== FIX PAGES/*.HTML (issues 2, 3, 4, 1) =====
pages_files = glob.glob(os.path.join(ROOT, 'pages', '*.html'))

# The animated dropdown CSS snippet
animated_dd_css = '''.nav-dropdown { position: relative; }
        .dropdown-content {
            visibility: hidden; opacity: 0; transform: translateY(10px);
            position: absolute; top: 100%; left: -150px;
            background-color: var(--pure-white); min-width: 650px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15); z-index: 100;
            border-radius: 16px; padding: 25px; gap: 20px; display: flex;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid rgba(0,0,0,0.05);
        }
        .nav-dropdown:hover .dropdown-content { visibility: visible; opacity: 1; transform: translateY(0); }
        .drop-col { flex: 1; display: flex; flex-direction: column; }
        .drop-col strong { color: var(--dark-bg); margin-bottom: 10px; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }
        .drop-col a { color: var(--text-main) !important; padding: 8px 0; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }
        .drop-col a:hover { color: var(--primary-red) !important; padding-left: 5px; }
        @media (max-width: 992px) {
            .dropdown-content { position: static; display: none; min-width: 100%; box-shadow: none; padding: 10px; flex-direction: column; }
            .nav-dropdown.active .dropdown-content { display: flex; }
        }'''

mobile_toggle_btn = '''<button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>'''

for fp in pages_files:
    fn = os.path.basename(fp)
    is_ms = '-ms' in fn
    slug_base = fn.replace('-ms.html','').replace('.html','')
    other = f'../pages/{slug_base}-ms.html' if not is_ms else f'../pages/{slug_base}.html'
    lang_label = 'MS | EN' if is_ms else 'EN | MS'

    with open(fp, 'r', encoding='utf-8') as f:
        html = f.read()

    # 3: Replace old dropdown CSS with animated version
    old_css_pattern = re.compile(r'\.nav-dropdown\s*\{.*?@media.*?\}', re.DOTALL)
    html = old_css_pattern.sub(animated_dd_css, html, count=1)

    # 2: Add mobile toggle if missing
    if 'mobile-toggle' not in html:
        html = html.replace('<ul class="nav-links">', mobile_toggle_btn + '\n            <ul class="nav-links">')

    # 4: Add language toggle if missing
    if 'lang-item' not in html:
        lang_li = f'''<li class="lang-item">
                    <a href="{other}" class="lang-btn" style="display:flex;align-items:center;gap:5px;padding:6px 12px;border:1px solid var(--border-color);border-radius:20px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <span>{lang_label}</span>
                    </a>
                </li>'''
        # Insert before closing </ul>
        html = html.replace('</ul>\n        </div>\n    </nav>', lang_li + '\n            </ul>\n        </div>\n    </nav>', 1)

    # 1: Fix footer in pages (prefix ../)
    html = clean_footer_links(html, is_ms, prefix='../')

    with open(fp, 'w', encoding='utf-8') as f:
        f.write(html)

print(f"Fixed {len(pages_files)} product pages.")
print("ALL DONE!")
