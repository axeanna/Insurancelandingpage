import os
import glob
import re

# 1. FIX FOOTERS IN ALL HTML FILES
for filepath in glob.glob(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\*.html') + glob.glob(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\pages\*.html'):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    is_ms = '-ms.html' in filepath
    in_pages_dir = 'pages\\' in filepath or 'pages/' in filepath
    prefix = '../' if in_pages_dir else ''
    
    products_link = f'{prefix}products-ms.html' if is_ms else f'{prefix}products.html'
    calc_link = f'{prefix}calculator-ms.html' if is_ms else f'{prefix}calculator.html'
    index_link = f'{prefix}index-ms.html' if is_ms else f'{prefix}index.html'
    partners_link = f'{prefix}partners-ms.html' if is_ms else f'{prefix}partners.html'
    
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
                    <li><a href="{partners_link}">{partners_txt}</a></li>
                    <li><a href="{index_link}#quote">{contact_txt}</a></li>
                </ul>
            </div>'''
            
    content = re.sub(r'<div class="footer-links">.*?</div>', clean_footer_links, content, flags=re.DOTALL)

    # 4. UPDATE PARTNERS LINK IN NAVBAR
    # Replace <a href="#partners">Partners</a> or <a href="#partners">Rakan Kongsi</a>
    if is_ms:
        content = content.replace('<a href="#partners">Rakan Kongsi</a>', f'<a href="{partners_link}">Rakan Kongsi</a>')
        content = content.replace('<a href="../#partners">Rakan Kongsi</a>', f'<a href="{partners_link}">Rakan Kongsi</a>')
    else:
        content = content.replace('<a href="#partners">Partners</a>', f'<a href="{partners_link}">Partners</a>')
        content = content.replace('<a href="../#partners">Partners</a>', f'<a href="{partners_link}">Partners</a>')

    # 3 & 5. FIX HERO TEXT CENTERING
    if not in_pages_dir and ('index.html' in filepath or 'index-ms.html' in filepath):
        # We need to make sure the main <p> has text-align: center
        # And the <span> inside it has text-align: center
        if 'font-weight: 300; text-align: center;' not in content:
            content = content.replace('font-weight: 300;">', 'font-weight: 300; text-align: center;">')
        if 'font-weight: 400; color: rgba(255,255,255,0.85); text-align: center;' not in content:
            content = content.replace('font-weight: 400; color: rgba(255,255,255,0.85);">', 'font-weight: 400; color: rgba(255,255,255,0.85); text-align: center;">')

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

print("Footers, navbars, and hero centering fixed.")

# 2. CREATE PARTNERS PAGES
def generate_partners_page(is_ms):
    filename = "partners-ms.html" if is_ms else "partners.html"
    index_file = "index-ms.html" if is_ms else "index.html"
    
    # We will read index.html to grab the exact <head> and <nav> to guarantee exact match
    with open(os.path.join(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page", index_file), 'r', encoding='utf-8') as f:
        idx_content = f.read()
        
    head_match = re.search(r'<head>.*?</head>', idx_content, re.DOTALL)
    nav_match = re.search(r'<nav class="navbar.*?</nav>', idx_content, re.DOTALL)
    footer_match = re.search(r'<footer class="footer.*</footer>', idx_content, re.DOTALL)
    
    if not (head_match and nav_match and footer_match):
        print("Error: Could not extract base structure from index.html")
        return
        
    head_html = head_match.group(0).replace(f'<title>Prudential', f'<title>{"Rakan Kongsi" if is_ms else "Our Partners"} | Prudential')
    
    # We need to make sure the navbar is visible on the dark hero. Wait, index.html already has the CSS to make it white!
    nav_html = nav_match.group(0)
    footer_html = footer_match.group(0)
    
    hero_title = "Disokong oleh Institusi Bertaraf Dunia" if is_ms else "Backed by World-Class Institutions"
    hero_desc = "Kami bekerjasama dengan peneraju industri untuk memberikan anda penyelesaian kewangan yang selamat, inovatif, dan boleh dipercayai." if is_ms else "We partner with industry leaders to provide you with secure, innovative, and reliable financial solutions."
    
    btn_text = "Lawati Laman Web" if is_ms else "Visit Website"

    partners_data = [
        {
            "name": "Prudential Malaysia",
            "logo": "assets/prudential-1.png",
            "badge": "Insurans Hayat & Perubatan" if is_ms else "Life & Medical Insurance",
            "p1": "Prudential telah menyediakan perlindungan kewangan dan ketenangan fikiran kepada rakyat Malaysia selama lebih satu abad." if is_ms else "Prudential has been providing financial protection and peace of mind to Malaysians for over a century.",
            "p2": "Dengan fokus yang kuat terhadap penjagaan kesihatan, penciptaan kekayaan, dan inovasi digital, kami memperkasakan individu untuk menjalani kehidupan yang lebih sihat dan mendapat yang terbaik daripada kehidupan." if is_ms else "With a strong focus on healthcare, wealth creation, and digital innovation, we empower individuals to live healthier and get the most out of life.",
            "tags": ["100+ Years in Asia", "Top Insurer in Malaysia", "Millions of Lives Covered"],
            "tags_ms": ["100+ Tahun di Asia", "Syarikat Insurans Terkemuka di Malaysia", "Berjuta-juta Nyawa Dilindungi"],
            "url": "https://www.prudential.com.my/"
        },
        {
            "name": "Eastspring Investments",
            "logo": "assets/eastspring investment(1).png",
            "badge": "Pengurusan Aset" if is_ms else "Asset Management",
            "p1": "Sebagai cabang pengurusan aset bagi Prudential plc, Eastspring Investments menguruskan pelaburan untuk pelanggan runcit dan institusi di seluruh Asia." if is_ms else "As the asset management arm of Prudential plc, Eastspring Investments manages investments for retail and institutional clients across Asia.",
            "p2": "Kepakaran kami memastikan pelaburan polisi anda berkembang dengan stabil dan dilindungi melalui pengurusan portfolio pakar kami." if is_ms else "Our deep-rooted expertise ensures your policy investments grow steadily and are safeguarded through our expert portfolio management.",
            "tags": ["$220+ Billion AUM", "Asia-Focused Experts", "Award-Winning Funds"],
            "tags_ms": ["AUM Lebih $220+ Bilion", "Pakar Berfokuskan Asia", "Dana Pemenang Anugerah"],
            "url": "https://www.eastspring.com/my/"
        },
        {
            "name": "GEM Agency",
            "logo": "assets/GEM Final New.png",
            "badge": "Agensi Premier" if is_ms else "Premier Agency",
            "p1": "GEM Agency adalah salah satu kumpulan agensi utama yang mewakili Prudential, dikenali dengan perundingan profesional dan perkhidmatan pelanggan yang cemerlang." if is_ms else "GEM Agency is one of the premier agency groups representing Prudential, known for elite professional consultation and exceptional client service.",
            "p2": "Pasukan penasihat berdedikasi kami, termasuk Annabel Ong, dilatih dengan teliti untuk membimbing anda melalui kerumitan perancangan kewangan peribadi dan pengurusan risiko." if is_ms else "Our dedicated team of advisors, including Annabel Ong, are rigorously trained to guide you through the complexities of personal financial planning and risk management.",
            "tags": ["Elite Wealth Planners", "Dedicated Claims Support", "Personalized Service"],
            "tags_ms": ["Perancang Harta Elit", "Sokongan Tuntutan Khas", "Perkhidmatan Peribadi"],
            "url": "https://prugem.com/"
        }
    ]

    cards_html = ""
    for p in partners_data:
        tags = p["tags_ms"] if is_ms else p["tags"]
        tags_html = "".join([f'<span style="background: rgba(211, 18, 37, 0.1); color: var(--primary-red); padding: 5px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; white-space: nowrap;">{t}</span>' for t in tags])
        
        cards_html += f'''
            <div class="partner-card" style="display: flex; flex-wrap: wrap; background: var(--pure-white); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-lg); margin-bottom: 50px; border: 1px solid var(--border-color);">
                <div class="card-left" style="flex: 1; min-width: 300px; padding: 50px; display: flex; align-items: center; justify-content: center; background: var(--off-white); border-right: 1px solid var(--border-color);">
                    <img src="{p["logo"]}" alt="{p["name"]} Logo" style="max-width: 80%; max-height: 200px; object-fit: contain;">
                </div>
                <div class="card-right" style="flex: 2; min-width: 300px; padding: 50px;">
                    <span style="display: inline-block; padding: 6px 14px; background: var(--dark-bg); color: var(--pure-white); border-radius: 20px; font-size: 0.85rem; font-weight: 600; text-transform: uppercase; margin-bottom: 15px;">{p["badge"]}</span>
                    <h2 style="font-size: 2.2rem; color: var(--primary-red); margin-bottom: 20px;">{p["name"]}</h2>
                    <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 15px; line-height: 1.7;">{p["p1"]}</p>
                    <p style="font-size: 1.1rem; color: var(--text-muted); margin-bottom: 30px; line-height: 1.7;">{p["p2"]}</p>
                    <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 35px;">
                        {tags_html}
                    </div>
                    <a href="{p["url"]}" target="_blank" class="btn btn-secondary" style="border-radius: 50px; font-weight: 600; padding: 12px 28px;">{btn_text} ↗</a>
                </div>
            </div>
        '''

    page_html = f'''<!DOCTYPE html>
<html lang="{'ms' if is_ms else 'en'}">
{head_html}
<body>
    {nav_html}
    
    <header class="product-hero" style="background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1a1a 100%); color: var(--pure-white); padding: 180px 20px 120px; text-align: center;">
        <div class="container fade-in active" style="max-width: 800px; margin: 0 auto;">
            <h1 style="font-size: 3.5rem; margin-bottom: 20px;">{hero_title}</h1>
            <p style="font-size: 1.2rem; opacity: 0.9; line-height: 1.6;">{hero_desc}</p>
        </div>
    </header>

    <section class="bg-light" style="padding: 100px 0;">
        <div class="container" style="max-width: 1000px;">
            {cards_html}
        </div>
    </section>

    {footer_html}

    <script src="js/script.js?v=9"></script>
</body>
</html>'''

    with open(os.path.join(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page", filename), 'w', encoding='utf-8') as f:
        f.write(page_html)
        
    print(f"Generated {filename}")

generate_partners_page(False)
generate_partners_page(True)
