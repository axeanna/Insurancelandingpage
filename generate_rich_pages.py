import os
import ssl
import urllib.request
from html.parser import HTMLParser
import re

# Disable SSL verification for simplicity on local network
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'}

def fetch_url_data(url):
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, context=ctx, timeout=10) as response:
            html = response.read().decode('utf-8')
            
            # Extract meta description
            desc_match = re.search(r'<meta\s+(?:name|property)=["\']description["\']\s+content=["\'](.*?)["\']', html, re.IGNORECASE)
            desc = desc_match.group(1) if desc_match else "A premium protection plan tailored specifically to your individual needs."
            desc = desc.replace('&amp;', '&').replace('&quot;', '"')
            
            # Simple heuristic to grab the first few paragraphs
            paragraphs = re.findall(r'<p[^>]*>(.*?)</p>', html, re.DOTALL | re.IGNORECASE)
            
            # Clean paragraphs
            clean_p = []
            for p in paragraphs:
                p = re.sub(r'<[^>]+>', '', p).strip() # remove tags
                p = p.replace('&nbsp;', ' ').replace('&amp;', '&').replace('\n', ' ')
                if len(p) > 50 and "cookie" not in p.lower() and "rights reserved" not in p.lower():
                    clean_p.append(p)
            
            return {
                "desc": desc[:150] + "..." if len(desc) > 150 else desc,
                "paragraphs": clean_p[:3] if clean_p else ["Navigating life's uncertainties requires a solid foundation of protection. This plan is designed to provide you and your loved ones with comprehensive coverage, ensuring peace of mind no matter what happens."]
            }
    except Exception as e:
        print(f"Failed to fetch {url}: {e}")
        return {
            "desc": "Secure your future with a premium protection plan tailored specifically to your individual needs.",
            "paragraphs": ["Navigating life's uncertainties requires a solid foundation of protection. This plan is designed to provide you and your loved ones with comprehensive coverage, ensuring peace of mind no matter what happens."]
        }

products = [
    {"filename": "pruwith-you-plus", "name": "PRUWith You Plus", "category": "Life Insurance", "url": "https://www.prudential.com.my/en/products-life-insurance/pruwith-you-plus/"},
    {"filename": "prulive-well", "name": "PRULive Well", "category": "Life Insurance", "url": "https://www.prudential.com.my/en/products-life-insurance/prulive-well/"},
    {"filename": "pruterm", "name": "PRUTerm", "category": "Life Insurance", "url": "https://www.prudential.com.my/en/products-life-insurance/pruterm/"},
    {"filename": "prumy-critical-care", "name": "PRUMy Critical Care", "category": "Critical Illness Insurance", "url": "https://www.prudential.com.my/en/products-health-insurance/critical-illness-plans/prumy-critical-care/"},
    {"filename": "pruman-and-prulady", "name": "PRUMan & PRULady", "category": "Critical Illness Insurance", "url": "https://www.prudential.com.my/en/products-health-insurance/critical-illness-plans/pruman-prulady/"},
    {"filename": "prumillion-med-active-2", "name": "PRUMillion Med Active 2.0", "category": "Medical Insurance", "url": "https://www.prudential.com.my/en/products-riders/prumillion-med-active-2/"},
    {"filename": "prumillion-med-2", "name": "PRUMillion Med 2.0", "category": "Medical Insurance", "url": "https://www.prudential.com.my/en/products-riders/prumillion-med/"},
    {"filename": "pruvalue-med", "name": "PRUValue Med", "category": "Medical Insurance", "url": "https://www.prudential.com.my/en/products-riders/pruvalue-med/"},
    {"filename": "prumy-child-plus", "name": "PRUMy Child Plus", "category": "Infant & Child Insurance", "url": "https://www.prudential.com.my/en/our-company-newsroom/announcements/prumy-child-plus/"},
    {"filename": "legacy-settlement-option", "name": "Legacy Settlement Option", "category": "Wealth & Legacy Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/legacy-plans/legacy-settlement-option/"},
    {"filename": "pruwealth-enrich-2", "name": "PRUWealth Enrich 2.0", "category": "Wealth & Legacy Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/legacy-plans/pruwealth-enrich-2/"},
    {"filename": "pruelite-flex", "name": "PRUElite Flex", "category": "Wealth & Legacy Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/pruelite-flex/"},
    {"filename": "prucash-enrich", "name": "PRUCash Enrich", "category": "Wealth & Legacy Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/prucash-enrich/"},
    {"filename": "pruelite-invest", "name": "PRUElite Invest", "category": "Savings & Investment Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/pruelite-invest/"},
    {"filename": "prucash-double-reward", "name": "PRUCash Double Reward", "category": "Savings & Investment Insurance", "url": "https://www.prudential.com.my/en/products-wealth-insurance/savings-investment-plans/prucash-double-reward/"}
]

template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="{desc}">
    <title>{name} | Prudential Insurance</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <style>
        :root {
            --product-theme: var(--primary-red);
        }
        
        .product-detail-hero {
            padding: 180px 0 120px;
            background: linear-gradient(135deg, rgba(20,20,20,0.95) 0%, rgba(138, 20, 36, 0.95) 100%), url('../assets/hero_bg.webp') no-repeat center center/cover;
            color: var(--pure-white);
            text-align: center;
            position: relative;
        }
        
        .product-detail-hero h1 {
            color: var(--pure-white);
            font-size: 3.5rem;
            margin-bottom: 20px;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }
        
        .product-detail-hero p.lead {
            font-size: 1.25rem;
            max-width: 700px;
            margin: 0 auto;
            color: rgba(255,255,255,0.9);
            line-height: 1.6;
        }

        .product-info-wrapper {
            margin-top: -60px;
            position: relative;
            z-index: 10;
            padding: 0 20px;
        }

        .product-card-main {
            background: var(--pure-white);
            border-radius: 20px;
            padding: 60px;
            max-width: 900px;
            margin: 0 auto;
            box-shadow: 0 20px 40px rgba(0,0,0,0.08);
            text-align: left;
        }

        .product-card-main h2 {
            font-size: 2.2rem;
            margin-bottom: 30px;
            color: var(--dark-bg);
            border-bottom: 3px solid var(--product-theme);
            padding-bottom: 15px;
            display: inline-block;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: 1fr;
            gap: 25px;
            margin: 40px 0;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            gap: 20px;
            padding: 25px;
            background: var(--off-white);
            border-radius: 12px;
            border-left: 4px solid var(--product-theme);
            transition: var(--transition);
        }
        
        .feature-item:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 20px rgba(0,0,0,0.05);
        }

        .feature-icon {
            font-size: 2rem;
            line-height: 1;
        }

        .feature-text p {
            margin: 0;
            font-size: 1.1rem;
            line-height: 1.7;
            color: var(--text-main);
        }

        .cta-container {
            margin-top: 50px;
            padding: 50px;
            background: linear-gradient(135deg, var(--off-white) 0%, var(--pure-white) 100%);
            border-radius: 15px;
            border: 1px solid var(--border-color);
            text-align: center;
        }
        
        @media (max-width: 768px) {
            .product-card-main {
                padding: 40px 20px;
            }
            .product-detail-hero h1 {
                font-size: 2.5rem;
            }
        }
    </style>
</head>
<body>

    <!-- Navigation -->
    <nav class="navbar scrolled">
        <div class="container nav-container">
            <a href="../index.html" class="logo">
                <img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo">
            </a>
            <button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
            <ul class="nav-links">
                <li><a href="../index.html#home">Home</a></li>
                <li><a href="../index.html#about">About Me</a></li>
                <li><a href="../products.html" class="text-red">Products</a></li>
                <li><a href="../index.html#partners">Partners</a></li>
                <li class="lang-item">
                    <a href="../index-ms.html" class="lang-btn" aria-label="Toggle Language" title="Toggle Language">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="globe-icon"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>
                        <span>EN | MS</span>
                    </a>
                </li>
                <li><a href="../index.html#quote" class="btn btn-primary">Get a Quote</a></li>
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
            <h2>Overview & Benefits</h2>
            
            <div class="feature-grid">
                {features_html}
            </div>
            
            <p style="font-size: 1.1rem; line-height: 1.8; color: var(--text-main); margin-top: 30px;">
                As your dedicated Wealth Planner, I am here to personally guide you through the intricacies of the <strong>{name}</strong> plan. We will assess your current situation to ensure this coverage aligns perfectly with your goals.
            </p>

            <div class="cta-container">
                <h3 style="margin-bottom: 20px; font-size: 1.8rem; color: var(--dark-bg);">Secure Your Future Today</h3>
                <p style="margin-bottom: 35px; font-size: 1.1rem; color: var(--text-muted); max-width: 600px; margin-inline: auto;">Ready to take the next step? Get a personalized review and free quotation designed specifically for you.</p>
                <div style="display: flex; gap: 15px; justify-content: center; flex-wrap: wrap;">
                    <a href="../index.html#quote" class="btn btn-primary" style="padding: 15px 35px; font-size: 1.1rem;">Request Quotation</a>
                    <a href="https://wa.me/60183176361" target="_blank" class="btn btn-secondary" style="background: #25D366; color: white; border-color: #25D366; padding: 15px 35px; font-size: 1.1rem;">WhatsApp Me</a>
                </div>
            </div>
            <div style="margin-top: 50px; text-align: center;">
                <a href="../products.html" class="btn btn-outline" style="border: none; border-bottom: 2px solid var(--primary-red); border-radius: 0; padding: 5px 0;">← Explore Other Products</a>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="footer" style="margin-top: 100px;">
        <div class="container footer-container">
            <div class="footer-brand">
                <a href="../index.html" class="logo"><img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo"></a>
                <p class="mt-2">Providing premium insurance solutions and peace of mind for you and your family.</p>
            </div>
            <div class="footer-links">
                <h3>Quick Links</h3>
                <ul>
                    <li><a href="../index.html#home">Home</a></li>
                    <li><a href="../index.html#about">About</a></li>
                    <li><a href="../products.html">Products</a></li>
                    <li><a href="../index.html#partners">Partners</a></li>
                    <li><a href="../index.html#quote">Get a Quote</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>Contact</h3>
                <p>Email: annabelong6997@prupartner.com.my</p>
                <p>Phone: +60 18-317 6361</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; 2026 Prudential. All Rights Reserved.</p>
        </div>
    </footer>

    <!-- App Scripts -->
    <script src="../js/script.js"></script>
</body>
</html>"""

import os
os.chdir(r"C:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page")

icons = ["✨", "🛡️", "🤝"]

for p in products:
    print(f"Scraping {p['name']}...")
    data = fetch_url_data(p['url'])
    
    features_html = ""
    for idx, para in enumerate(data['paragraphs']):
        icon = icons[idx % len(icons)]
        features_html += f'''
                <div class="feature-item">
                    <div class="feature-icon">{icon}</div>
                    <div class="feature-text">
                        <p>{para}</p>
                    </div>
                </div>'''
    
    content = template.replace("{name}", p["name"]) \
                      .replace("{category}", p["category"]) \
                      .replace("{desc}", data["desc"]) \
                      .replace("{features_html}", features_html)
                      
    with open(f"pages/{p['filename']}.html", "w", encoding="utf-8") as f:
        f.write(content)

print("Rich pages generated successfully!")
