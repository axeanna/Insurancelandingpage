import os

def fix_footer(filepath, is_ms, prefix=''):
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Find the footer-container opening and closing
    start = None
    for i, line in enumerate(lines):
        if 'class="container footer-container"' in line:
            start = i
            break

    if start is None:
        print(f"Could not find footer-container in {filepath}")
        return

    # Find the matching closing </div> by counting depth
    depth = 0
    end = None
    for i in range(start, len(lines)):
        depth += lines[i].count('<div')
        depth -= lines[i].count('</div>')
        if depth == 0 and i > start:
            end = i
            break

    if end is None:
        print(f"Could not find footer end in {filepath}")
        return

    if is_ms:
        idx, prod, calc, part = f'{prefix}index-ms.html', f'{prefix}products-ms.html', f'{prefix}calculator-ms.html', f'{prefix}partners-ms.html'
        new_footer = f'''        <div class="container footer-container">
            <div class="footer-brand">
                <a href="{idx}" class="logo"><img src="{prefix}assets/prudential-1.png" alt="Prudential Logo" class="brand-logo"></a>
                <p class="mt-2">Menyediakan penyelesaian insurans premium dan ketenangan fikiran untuk anda dan keluarga.</p>
            </div>
            <div class="footer-links">
                <h3>Pautan Pantas</h3>
                <ul>
                    <li><a href="{idx}#home">Utama</a></li>
                    <li><a href="{idx}#about">Tentang</a></li>
                    <li><a href="{prod}">Produk</a></li>
                    <li><a href="{calc}">Kalkulator</a></li>
                    <li><a href="{part}">Rakan Kongsi</a></li>
                    <li><a href="{idx}#quote">Hubungi Saya</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>Hubungi Kami</h3>
                <p>Email: annabelong6997@prupartner.com.my</p>
                <p>Phone: +60 18-317 6361</p>
            </div>
        </div>\n'''
    else:
        idx, prod, calc, part = f'{prefix}index.html', f'{prefix}products.html', f'{prefix}calculator.html', f'{prefix}partners.html'
        new_footer = f'''        <div class="container footer-container">
            <div class="footer-brand">
                <a href="{idx}" class="logo"><img src="{prefix}assets/prudential-1.png" alt="Prudential Logo" class="brand-logo"></a>
                <p class="mt-2">Providing premium insurance solutions and peace of mind for you and your family.</p>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="{idx}#home">Home</a></li>
                    <li><a href="{idx}#about">About</a></li>
                    <li><a href="{prod}">Products</a></li>
                    <li><a href="{calc}">Calculator</a></li>
                    <li><a href="{part}">Partners</a></li>
                    <li><a href="{idx}#quote">Let\'s Connect</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>Contact</h3>
                <p>Email: annabelong6997@prupartner.com.my</p>
                <p>Phone: +60 18-317 6361</p>
            </div>
        </div>\n'''

    new_lines = lines[:start] + [new_footer] + lines[end+1:]
    with open(filepath, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)
    print(f"Fixed footer: {filepath} (lines {start+1}-{end+1})")


ROOT = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'

import glob

# Fix root HTML files
for fp in glob.glob(os.path.join(ROOT, '*.html')):
    fn = os.path.basename(fp)
    is_ms = '-ms' in fn
    fix_footer(fp, is_ms)

# Fix pages
for fp in glob.glob(os.path.join(ROOT, 'pages', '*.html')):
    fn = os.path.basename(fp)
    is_ms = '-ms' in fn
    fix_footer(fp, is_ms, prefix='../')

print("All footers fixed!")
