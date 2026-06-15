import os
import glob
import re

root_dir = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'
html_files = glob.glob(os.path.join(root_dir, '*.html')) + glob.glob(os.path.join(root_dir, 'pages', '*.html'))

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(file)
    
    # 1. Replace script versions v=9 or v=10 with v=11
    content = content.replace('script.js?v=9', 'script.js?v=11')
    content = content.replace('script.js?v=10', 'script.js?v=11')
    content = content.replace('styles.css?v=9', 'styles.css?v=11')
    content = content.replace('styles.css?v=10', 'styles.css?v=11')
    
    # 2. Fix partners lang toggles
    if filename == 'partners.html':
        content = content.replace('<a href="index-ms.html" class="lang-btn"', '<a href="partners-ms.html" class="lang-btn"')
    elif filename == 'partners-ms.html':
        content = content.replace('<a href="index.html" class="lang-btn"', '<a href="partners.html" class="lang-btn"')
        
    # 3. Add lang toggle to request-quote.html and request-quote-ms.html
    if filename == 'request-quote.html' and 'lang-item' not in content:
        lang_html = '''<li class="lang-item">
                    <a href="request-quote-ms.html" class="lang-btn" aria-label="Toggle Language" title="Toggle Language">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="globe-icon">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path
                                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z">
                            </path>
                        </svg>
                        <span>EN | MS</span>
                    </a>
                </li>'''
        content = content.replace('<li><a href="index.html#quote" class="nav-cta">Let\'s Connect</a></li>', lang_html + '\n                <li><a href="index.html#quote" class="nav-cta">Let\'s Connect</a></li>')

    if filename == 'request-quote-ms.html' and 'lang-item' not in content:
        lang_html = '''<li class="lang-item">
                    <a href="request-quote.html" class="lang-btn" aria-label="Tukar Bahasa" title="Tukar Bahasa">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="globe-icon">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path
                                d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1 4-10z">
                            </path>
                        </svg>
                        <span>MS | EN</span>
                    </a>
                </li>'''
        content = content.replace('<li><a href="index-ms.html#quote" class="nav-cta">Hubungi Saya</a></li>', lang_html + '\n                <li><a href="index-ms.html#quote" class="nav-cta">Hubungi Saya</a></li>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

# 4. Append to sitemap.xml
sitemap_path = os.path.join(root_dir, 'sitemap.xml')
with open(sitemap_path, 'r', encoding='utf-8') as f:
    sitemap = f.read()

mrta_entry = '''    <url>
        <loc>https://annaprudential.com/calculator-mrta.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    <url>
        <loc>https://annaprudential.com/calculator-mrta-ms.html</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
'''

if 'calculator-mrta.html' not in sitemap:
    sitemap = sitemap.replace('</urlset>', mrta_entry + '</urlset>')
    with open(sitemap_path, 'w', encoding='utf-8') as f:
        f.write(sitemap)

print("Site issues fixed!")
