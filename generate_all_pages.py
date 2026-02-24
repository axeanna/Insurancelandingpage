import os
import ssl
import urllib.request
import re

ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0'}

def clean_text(text):
    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text).strip()
    # Remove HTML entities
    text = text.replace('&nbsp;', ' ').replace('&amp;', '&').replace('\n', ' ')
    # Remove any Chinese characters
    text = re.sub(r'[\u4e00-\u9fff]+', '', text)
    # Clean up double spaces caused by removals
    text = re.sub(r'\s+', ' ', text).strip()
    return text

def fetch_url_data(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            desc_match = re.search(r'<meta\s+(?:name|property)=["\']description["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
            desc = desc_match.group(1) if desc_match else ""
            desc = clean_text(desc)
            if not desc:
                desc = "A premium protection plan tailored specifically to your individual needs."
            
            paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
            
            clean_p = []
            exclude_keywords = [
                "cookie", "rights reserved", "hak cipta", 
                "download", "leaflet", "brochure", "muat turun", "risalah", "click here"
            ]
            for p in paragraphs:
                p = clean_text(p)
                p_lower = p.lower()
                if len(p) > 50 and not any(kw in p_lower for kw in exclude_keywords):
                    clean_p.append(p)
            
            return {
                "desc": desc[:150] + ("..." if len(desc) > 150 else ""),
                "paragraphs": clean_p[:3] if clean_p else []
            }
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return {"desc": "", "paragraphs": []}

products = [
    {"filename": "pruwith-you-plus", "name": "PRUWith You Plus", "category_en": "Life Insurance", "category_ms": "Insurans Hayat", "url_en": "https://www.prudential.com.my/en/products-life-insurance/pruwith-you-plus/"},
    {"filename": "prulive-well", "name": "PRULive Well", "category_en": "Life Insurance", "category_ms": "Insurans Hayat", "url_en": "https://www.prudential.com.my/en/products-life-insurance/prulive-well/"},
    {"filename": "pruterm", "name": "PRUTerm", "category_en": "Life Insurance", "category_ms": "Insurans Hayat", "url_en": "https://www.prudential.com.my/en/products-life-insurance/pruterm/"},
    {"filename": "prumy-critical-care", "name": "PRUMy Critical Care", "category_en": "Critical Illness Insurance", "category_ms": "Insurans Penyakit Kritikal", "url_en": "https://www.prudential.com.my/en/products-health-insurance/critical-illness-plans/prumy-critical-care/"},
    {"filename": "pruman-and-prulady", "name": "PRUMan & PRULady", "category_en": "Critical Illness Insurance", "category_ms": "Insurans Penyakit Kritikal", "url_en": "https://www.prudential.com.my/en/products-health-insurance/critical-illness-plans/pruman-prulady/"},
    {"filename": "prumillion-med-active-2", "name": "PRUMillion Med Active 2.0", "category_en": "Medical Insurance", "category_ms": "Insurans Perubatan", "url_en": "https://www.prudential.com.my/en/products-riders/prumillion-med-active-2/"},
    {"filename": "prumillion-med-2", "name": "PRUMillion Med 2.0", "category_en": "Medical Insurance", "category_ms": "Insurans Perubatan", "url_en": "https://www.prudential.com.my/en/products-riders/prumillion-med/"},
    {"filename": "pruvalue-med", "name": "PRUValue Med", "category_en": "Medical Insurance", "category_ms": "Insurans Perubatan", "url_en": "https://www.prudential.com.my/en/products-riders/pruvalue-med/"},
    {"filename": "prumy-child-plus", "name": "PRUMy Child Plus", "category_en": "Infant & Child Insurance", "category_ms": "Insurans Bayi & Kanak-kanak", "url_en": "https://www.prudential.com.my/en/our-company-newsroom/announcements/prumy-child-plus/"},
    {"filename": "legacy-settlement-option", "name": "Legacy Settlement Option", "category_en": "Wealth & Legacy Insurance", "category_ms": "Insurans Harta & Legasi", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/legacy-plans/legacy-settlement-option/"},
    {"filename": "pruwealth-enrich-2", "name": "PRUWealth Enrich 2.0", "category_en": "Wealth & Legacy Insurance", "category_ms": "Insurans Harta & Legasi", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/legacy-plans/pruwealth-enrich-2/"},
    {"filename": "pruelite-flex", "name": "PRUElite Flex", "category_en": "Wealth & Legacy Insurance", "category_ms": "Insurans Harta & Legasi", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/pruelite-flex/"},
    {"filename": "prucash-enrich", "name": "PRUCash Enrich", "category_en": "Wealth & Legacy Insurance", "category_ms": "Insurans Harta & Legasi", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/prucash-enrich/"},
    {"filename": "pruelite-invest", "name": "PRUElite Invest", "category_en": "Savings & Investment Insurance", "category_ms": "Insurans Simpanan & Pelaburan", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/pruelite-invest/"},
    {"filename": "prucash-double-reward", "name": "PRUCash Double Reward", "category_en": "Savings & Investment Insurance", "category_ms": "Insurans Simpanan & Pelaburan", "url_en": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/prucash-double-reward/"}
]

# Base template
def get_template(lang, name, category, desc, features_html, toggle_link):
    if lang == "en":
        txt = {
            "home": "Home", "about": "About Me", "products": "Products", "partners": "Partners", 
            "btn_quote": "Connect With Me", "lang_lbl": "EN | MS",
            "overview_title": "Overview & Benefits",
            "guidance": f"As your dedicated Wealth Planner, I am here to personally guide you through the intricacies of the <strong>{name}</strong> plan. We will assess your current situation to ensure this coverage aligns perfectly with your goals.",
            "cta_title": "Secure Your Future Today",
            "cta_desc": "Ready to take the next step? Let's connect to discuss a personalized protection plan designed specifically for you.",
            "req_quote": "Submit Details", "whatsapp": "WhatsApp Me",
            "back_btn": "← Explore Other Products",
            "footer_desc": "Providing premium insurance solutions and peace of mind for you and your family.",
            "links": "Quick Links", "contact": "Contact", "rights": "All Rights Reserved.",
            "modal_title": "Just a Few Quick Questions",
            "modal_desc": "To help me provide the best advice, please drag and drop to rank your financial priorities from 1 (Highest) to 5 (Lowest).",
            "available_options": "Available Options:",
            "q_family": "Family Protection", "q_income": "Income Replacement", "q_accident": "Accident Coverage",
            "q_medical": "Medical Bills", "q_invest": "Investment & Savings",
            "modal_cancel": "Cancel", "modal_submit": "Complete Submission",
            "modal_error": "Please select a rank for all categories to proceed."
        }
    else:
        txt = {
            "home": "Utama", "about": "Tentang Saya", "products": "Produk", "partners": "Rakan Kongsi", 
            "btn_quote": "Hubungi Saya", "lang_lbl": "MS | EN",
            "overview_title": "Gambaran Keseluruhan & Faedah",
            "guidance": f"Sebagai Perunding Insurans anda yang berdedikasi, saya di sini untuk membimbing anda secara peribadi merasai manfaat pelan <strong>{name}</strong>. Kami akan menilai situasi semasa anda untuk memastikan perlindungan ini sejajar dengan matlamat anda.",
            "cta_title": "Lindungi Masa Depan Anda Hari Ini",
            "cta_desc": "Bersedia untuk mengorak langkah seterusnya? Mari berhubung untuk membincangkan pelan perlindungan peribadi yang direka khas untuk anda.",
            "req_quote": "Hantar Butiran", "whatsapp": "WhatsApp Saya",
            "back_btn": "← Teroka Produk Lain",
            "footer_desc": "Menyediakan penyelesaian insurans premium dan ketenangan fikiran untuk anda dan keluarga.",
            "links": "Pautan Pantas", "contact": "Hubungi Kami", "rights": "Hak Cipta Terpelihara.",
            "modal_title": "Soalan Ringkas Untuk Anda",
            "modal_desc": "Bagi membantu saya memberikan nasihat terbaik, sila seret dan lepas untuk menilai keutamaan kewangan anda dari 1 (Paling Tinggi) hingga 5 (Paling Rendah).",
            "available_options": "Pilihan Yang Ada:",
            "q_family": "Perlindungan Keluarga", "q_income": "Penggantian Pendapatan", "q_accident": "Perlindungan Kemalangan",
            "q_medical": "Bil Perubatan", "q_invest": "Pelaburan & Simpanan",
            "modal_cancel": "Batal", "modal_submit": "Hantar Butiran",
            "modal_error": "Sila nilaikannya untuk semua kategori bagi meneruskan proses."
        }
    
    return f"""<!DOCTYPE html>
<html lang="{lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{desc}">
    <title>{name} | Prudential Insurance</title>
    <link rel="icon" type="image/png" href="../assets/prudential-1.png">
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <style>
        :root {{
            --product-theme: var(--primary-red);
        }}
        
        .product-detail-hero {{
            padding: 180px 0 120px;
            background: linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(138, 20, 36, 0.95) 100%), url('../assets/hero_bg.webp?v=4') no-repeat center center/cover;
            color: var(--pure-white);
            text-align: center;
            position: relative;
        }}
        
        .product-detail-hero h1 {{
            color: var(--pure-white);
            font-size: 3.5rem;
            margin-bottom: 20px;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }}
        
        .product-detail-hero p.lead {{
            font-size: 1.25rem;
            max-width: 700px;
            margin: 0 auto;
            color: rgba(255,255,255,0.9);
            line-height: 1.6;
        }}

        .product-info-wrapper {{
            margin-top: -60px;
            position: relative;
            z-index: 10;
            padding: 0 20px;
        }}

        .product-card-main {{
            background: var(--pure-white);
            border-radius: 20px;
            padding: 60px;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: left;
        }}

        .product-card-main h2 {{
            font-size: 2.2rem;
            margin-bottom: 30px;
            color: var(--dark-bg);
            border-bottom: 3px solid var(--product-theme);
            padding-bottom: 15px;
            display: inline-block;
        }}

        .feature-grid {{
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
            margin: 40px 0;
        }}

        .feature-item {{
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 25px;
            background: var(--off-white);
            border-radius: 12px;
            border-left: 4px solid var(--product-theme);
            transition: var(--transition);
        }}
        
        .feature-item:hover {{
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }}

        .feature-icon {{
            font-size: 2rem;
            line-height: 1;
        }}

        .feature-text p {{
            margin: 0;
            font-size: 1.1rem;
            line-height: 1.7;
            color: var(--text-main);
        }}

        .cta-container {{
            margin-top: 50px;
            padding: 50px;
            background: linear-gradient(135deg, var(--off-white) 0%, var(--pure-white) 100%);
            border-radius: 15px;
            border: 1px solid var(--border-color);
            text-align: center;
        }}
        
        @media (max-width: 768px) {{
            .product-card-main {{
                padding: 40px 20px;
            }}
            .product-detail-hero h1 {{
                font-size: 2.5rem;
            }}
        }}
    </style>
</head>
<body>

    <!-- Navigation -->
    <nav class="navbar scrolled">
        <div class="container nav-container">
            <a href="../index{'-ms' if lang=='ms' else ''}.html" class="logo">
                <img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo">
            </a>
            <button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
            <ul class="nav-links">
                <li><a href="../index{'-ms' if lang=='ms' else ''}.html#home">{txt['home']}</a></li>
                <li><a href="../index{'-ms' if lang=='ms' else ''}.html#about">{txt['about']}</a></li>
                <li><a href="../products{'-ms' if lang=='ms' else ''}.html" class="text-red">{txt['products']}</a></li>
                <li><a href="../index{'-ms' if lang=='ms' else ''}.html#partners">{txt['partners']}</a></li>
                <li class="lang-item">
                    <a href="{toggle_link}" class="lang-btn" aria-label="Toggle Language" title="Toggle Language">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="globe-icon"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <span>{txt['lang_lbl']}</span>
                    </a>
                </li>
                <li><a href="../index{'-ms' if lang=='ms' else ''}.html#quote" class="btn btn-primary">{txt['btn_quote']}</a></li>
            </ul>
        </div>
    </nav>

    <!-- Product Detail Hero -->
    <header class="product-detail-hero">
        <div class="container fade-in active">
            <span class="badge" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; display: inline-block; padding: 6px 20px; border-radius: 30px; font-weight: 600; margin-bottom: 20px; font-size: 0.95rem; text-transform: uppercase; letter-spacing: 1px;">{category}</span>
            <h1>{name}</h1>
            <p class="lead">{desc}</p>
        </div>
    </header>

    <!-- Main Content Wrapper -->
    <div class="product-info-wrapper">
        <div class="product-card-main fade-in active">
            <h2>{txt['overview_title']}</h2>
            
            <div class="feature-grid">
                {features_html}
            </div>
            
            <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main); margin-top: 30px;">
                {txt['guidance']}
            </p>

            <div class="cta-container">
                <h3 style="margin-bottom: 20px; font-size: 1.8rem; color: var(--dark-bg);">{txt['cta_title']}</h3>
                <p style="margin-bottom: 35px; font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin-inline: auto;">{txt['cta_desc']}</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="../index{'-ms' if lang=='ms' else ''}.html#quote" class="btn btn-primary" style="padding: 15px 35px; font-size: 1.1rem;">{txt['req_quote']}</a>
                    <a href="https://wa.me/60183176361" target="_blank" class="btn btn-secondary" style="background: #25D366; color: white; border-color: #25D366; padding: 15px 35px; font-size: 1.1rem;">{txt['whatsapp']}</a>
                </div>
            </div>
            <div style="margin-top: 50px; text-align: center;">
                <a href="../products{'-ms' if lang=='ms' else ''}.html" class="btn btn-outline" style="border: none; border-bottom: 2px solid var(--primary-red); border-radius: 0; padding: 5px 0;">{txt['back_btn']}</a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer" style="margin-top: 100px;">
        <div class="container footer-container">
            <div class="footer-brand">
                <a href="../index{'-ms' if lang=='ms' else ''}.html" class="logo"><img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo"></a>
                <p class="mt-2">{txt['footer_desc']}</p>
            </div>
            <div class="footer-links">
                <h3>{txt['links']}</h3>
                <ul>
                    <li><a href="../index{'-ms' if lang=='ms' else ''}.html#home">{txt['home']}</a></li>
                    <li><a href="../index{'-ms' if lang=='ms' else ''}.html#about">{txt['about']}</a></li>
                    <li><a href="../products{'-ms' if lang=='ms' else ''}.html">{txt['products']}</a></li>
                    <li><a href="../index{'-ms' if lang=='ms' else ''}.html#partners">{txt['partners']}</a></li>
                    <li><a href="../index{'-ms' if lang=='ms' else ''}.html#quote">{txt['btn_quote']}</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>{txt['contact']}</h3>
                <p>Email: annabelong6997@prupartner.com.my</p>
                <p>Phone: +60 18-317 6361</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Prudential. {txt['rights']}</p>
        </div>
    </footer>

    <!-- Fact Finder Modal -->
    <div id="factFinderModal" class="modal-overlay hidden">
        <div class="modal-content glass-dark fade-in">
            <h2>{txt['modal_title']}</h2>
            <p>{txt['modal_desc']}</p>
            
            <div class="unranked-container">
                <p class="text-muted" style="margin-bottom: 10px;">{txt['available_options']}</p>
                <ul class="ranking-list unranked-list">
                    <li class="ranking-item" data-category="Family">
                        <span class="drag-handle">☰</span> {txt['q_family']}
                    </li>
                    <li class="ranking-item" data-category="Income">
                        <span class="drag-handle">☰</span> {txt['q_income']}
                    </li>
                    <li class="ranking-item" data-category="Accident">
                        <span class="drag-handle">☰</span> {txt['q_accident']}
                    </li>
                    <li class="ranking-item" data-category="Medical">
                        <span class="drag-handle">☰</span> {txt['q_medical']}
                    </li>
                    <li class="ranking-item" data-category="Investment">
                        <span class="drag-handle">☰</span> {txt['q_invest']}
                    </li>
                </ul>
            </div>

            <div class="ranking-container mt-4">
                <div class="ranking-numbers">
                    <div class="rank-num">1</div>
                    <div class="rank-num">2</div>
                    <div class="rank-num">3</div>
                    <div class="rank-num">4</div>
                    <div class="rank-num">5</div>
                </div>
                <div class="ranked-list-wrapper" style="flex: 1; position: relative;">
                    <div class="ranking-placeholders">
                         <div class="placeholder-box">{"Drop item here" if lang == "en" else "Seret item ke sini"}</div>
                         <div class="placeholder-box">{"Drop item here" if lang == "en" else "Seret item ke sini"}</div>
                         <div class="placeholder-box">{"Drop item here" if lang == "en" else "Seret item ke sini"}</div>
                         <div class="placeholder-box">{"Drop item here" if lang == "en" else "Seret item ke sini"}</div>
                         <div class="placeholder-box">{"Drop item here" if lang == "en" else "Seret item ke sini"}</div>
                    </div>
                    <ul class="ranking-list ranked-list">
                        <!-- Empty list -->
                    </ul>
                </div>
            </div>

            <div class="modal-actions">
                <button id="closeModalBtn" class="btn btn-outline" style="min-width: 120px;">{txt['modal_cancel']}</button>
                <button id="submitFinalBtn" class="btn btn-primary" style="flex: 1;">{txt['modal_submit']}</button>
            </div>
            <p id="modalError" class="text-red hidden" style="margin-top: 15px; font-size: 0.9rem;">{txt['modal_error']}</p>
        </div>
    </div>

    <!-- SortableJS for drag and drop -->
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <script src="../js/script.js?v=3"></script>
</body>
</html>"""


import os
os.chdir(r"C:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page")

icons = ["✨", "🛡️", "🤝"]

for p in products:
    # ------------- ENGLISH -------------
    print(f"Scraping English for {p['name']}...")
    data_en = fetch_url_data(p['url_en'])
    # Fallbacks if scrape fails
    if not data_en['paragraphs']:
        data_en['desc'] = "Secure your future with a premium protection plan tailored specifically to your individual needs."
        data_en['paragraphs'] = ["Navigating life's uncertainties requires a solid foundation of protection. This plan is designed to provide you and your loved ones with comprehensive coverage, ensuring peace of mind no matter what happens."]
    
    features_html_en = ""
    for idx, para in enumerate(data_en['paragraphs']):
        icon = icons[idx % len(icons)]
        features_html_en += f'''
                <div class="feature-item">
                    <div class="feature-icon">{icon}</div>
                    <div class="feature-text">
                        <p>{para}</p>
                    </div>
                </div>'''
    
    html_en = get_template("en", p["name"], p["category_en"], data_en["desc"], features_html_en, f"{p['filename']}-ms.html")
    with open(f"pages/{p['filename']}.html", "w", encoding="utf-8") as f:
        f.write(html_en)

    # ------------- MALAY -------------
    print(f"Scraping Malay for {p['name']}...")
    url_ms = p['url_en'].replace('/en/', '/ms/')
    data_ms = fetch_url_data(url_ms)
    # Fallbacks if MS scrape fails
    if not data_ms['paragraphs']:
         data_ms = fetch_url_data(p['url_en']) # Try fallback to EN content but MS static text
         if not data_ms['paragraphs']:
             data_ms['desc'] = "Lindungi masa depan anda dengan pelan perlindungan premium yang direka khusus untuk memenuhi keperluan individu anda."
             data_ms['paragraphs'] = ["Menghadapi ketidakpastian kehidupan memerlukan asas perlindungan yang kukuh. Pelan ini direka untuk memberikan liputan menyeluruh kepada anda dan keluarga, demi ketenangan fikiran."]
    
    features_html_ms = ""
    for idx, para in enumerate(data_ms['paragraphs']):
        icon = icons[idx % len(icons)]
        features_html_ms += f'''
                <div class="feature-item">
                    <div class="feature-icon">{icon}</div>
                    <div class="feature-text">
                        <p>{para}</p>
                    </div>
                </div>'''
    
    html_ms = get_template("ms", p["name"], p["category_ms"], data_ms["desc"], features_html_ms, f"{p['filename']}.html")
    with open(f"pages/{p['filename']}-ms.html", "w", encoding="utf-8") as f:
        f.write(html_ms)

print("English and Malay rich pages generated successfully (with Chinese chars removed)!")
