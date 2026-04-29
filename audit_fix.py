import os
import glob
import re

# FIX 2 & 7: css/styles.css
css_path = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\css\styles.css'
with open(css_path, 'r', encoding='utf-8') as f:
    css_content = f.read()

# Fix 2: Invisible form labels
css_content = css_content.replace('color: var(--border-color);', 'color: var(--pure-white); /* FIXED LABEL CONTRAST */', 1)

# Fix 7: Add .nav-cta styling
if '.nav-cta' not in css_content:
    nav_cta_css = '''
.nav-cta {
    background-color: var(--primary-red);
    color: var(--pure-white) !important;
    padding: 10px 24px;
    border-radius: 50px;
    font-weight: 600;
    transition: all 0.3s ease;
}
.nav-cta:hover {
    background-color: var(--hover-red);
    transform: translateY(-2px);
    color: var(--pure-white) !important;
    box-shadow: 0 4px 15px rgba(211, 18, 37, 0.3);
}
'''
    css_content += nav_cta_css

with open(css_path, 'w', encoding='utf-8') as f:
    f.write(css_content)

print("CSS fixes applied.")

# Iterate over all HTML files
for file in glob.glob(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\*.html'):
    with open(file, 'r', encoding='utf-8') as f:
        html_content = f.read()

    # FIX 3: --text-dark to --text-main
    html_content = html_content.replace('var(--text-dark)', 'var(--text-main)')

    # FIX 4: Footer Mega-Dropdown
    # Find footer links and replace the entire products li with the simple version
    # Since the footer is standard across the files:
    if 'class="footer-links"' in html_content:
        # Regex to strip the nav-dropdown from the footer
        # We will just rewrite the footer links section entirely to be safe
        is_ms = '-ms.html' in file
        products_link = 'products-ms.html' if is_ms else 'products.html'
        calc_link = 'calculator-ms.html' if is_ms else 'calculator.html'
        index_link = 'index-ms.html' if is_ms else 'index.html'
        
        home_txt = "Utama" if is_ms else "Home"
        about_txt = "Tentang" if is_ms else "About"
        prod_txt = "Produk" if is_ms else "Products"
        calc_txt = "Kalkulator" if is_ms else "Calculator"
        partners_txt = "Rakan Kongsi" if is_ms else "Partners"
        contact_txt = "Hubungi Saya" if is_ms else "Contact Me"
        
        clean_footer_links = f'''            <div class="footer-links">
                <h3>{'Pautan Pantas' if is_ms else 'Quick Links'}</h3>
                <ul>
                    <li><a href="{index_link}#home">{home_txt}</a></li>
                    <li><a href="{index_link}#about">{about_txt}</a></li>
                    <li><a href="{products_link}">{prod_txt}</a></li>
                    <li><a href="{calc_link}">{calc_txt}</a></li>
                    <li><a href="#partners">{partners_txt}</a></li>
                    <li><a href="#quote">{contact_txt}</a></li>
                </ul>
            </div>'''
            
        html_content = re.sub(r'<div class="footer-links">.*?</div>', clean_footer_links, html_content, flags=re.DOTALL)

    # FIX 6: Double <!-- Hero Section -->
    html_content = html_content.replace('<!-- Hero Section -->\n    <!-- Hero Section -->', '<!-- Hero Section -->')
    html_content = html_content.replace('<!-- Hero Section -->\n<!-- Hero Section -->', '<!-- Hero Section -->')

    # FIX 8: Products Accordion Default State
    if 'products' in file.lower() and 'products-list' in html_content:
        # Make the first accordion item active
        html_content = html_content.replace('<div class="accordion-item">', '<div class="accordion-item active">', 1)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(html_content)

print("HTML root fixes applied.")
