import os

template = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="Discover {name} by Prudential. Comprehensive protection tailored for your needs.">
    <title>{name} | Prudential Insurance</title>
    
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- Custom CSS -->
    <link rel="stylesheet" href="../css/styles.css">
    <style>
        .product-detail-hero {
            padding: 160px 0 80px;
            background: linear-gradient(135deg, var(--dark-bg) 0%, #2A0408 100%);
            color: var(--pure-white);
            text-align: center;
        }
        
        .product-detail-hero h1 {
            color: var(--pure-white);
            font-size: 3rem;
            margin-bottom: 20px;
        }

        .product-info {
            padding: 80px 0;
            background: var(--pure-white);
        }

        .product-content {
            max-width: 800px;
            margin: 0 auto;
            text-align: center;
        }

        .product-content p {
            font-size: 1.1rem;
            color: var(--text-main);
            margin-bottom: 30px;
            line-height: 1.8;
        }

        .cta-container {
            margin-top: 40px;
            padding: 40px;
            background: var(--off-white);
            border-radius: 15px;
            border: 1px solid var(--border-color);
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

    <!-- Product Detail Hero Section -->
    <header class="product-detail-hero">
        <div class="container fade-in active">
            <span class="badge" style="background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.2); color: white; display: inline-block; padding: 6px 15px; border-radius: 20px; font-weight: 600; margin-bottom: 20px; font-size: 0.9rem;">{category}</span>
            <h1>{name}</h1>
            <p style="color: #ccc; max-width: 600px; margin: 0 auto;">Secure your future with a premium protection plan tailored specifically to your individual needs.</p>
        </div>
    </header>

    <!-- Product Info Section -->
    <section class="product-info">
        <div class="container">
            <div class="product-content fade-in active">
                <h2>Why Choose <span class="text-red">{name}</span>?</h2>
                <p>Navigating life's uncertainties requires a solid foundation of protection. The <strong>{name}</strong> plan is designed to provide you and your loved ones with comprehensive coverage, ensuring peace of mind no matter what happens.</p>
                <p>As your dedicated Wealth Planner, I am here to personally guide you through the features of this policy, helping you understand how it aligns perfectly with your current lifestyle and long-term financial goals.</p>
                
                <div class="cta-container">
                    <h3 style="margin-bottom: 15px;">Interested in {name}?</h3>
                    <p style="margin-bottom: 25px; font-size: 1rem;">Click below to get a personalized quotation or to schedule a consultation directly with me.</p>
                    <a href="../index.html#quote" class="btn btn-primary">Request a Free Quotation</a>
                </div>
                <div style="margin-top: 50px;">
                    <a href="../products.html" class="btn btn-outline">← Back to All Products</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
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

products = [
    {"filename": "pruwith-you-plus", "name": "PRUWith You Plus", "category": "Life Insurance"},
    {"filename": "prulive-well", "name": "PRULive Well", "category": "Life Insurance"},
    {"filename": "pruterm", "name": "PRUTerm", "category": "Life Insurance"},
    {"filename": "prumy-critical-care", "name": "PRUMy Critical Care", "category": "Critical Illness Insurance"},
    {"filename": "pruman-and-prulady", "name": "PRUMan & PRULady", "category": "Critical Illness Insurance"},
    {"filename": "prumillion-med-active-2", "name": "PRUMillion Med Active 2.0", "category": "Medical Insurance"},
    {"filename": "prumillion-med-2", "name": "PRUMillion Med 2.0", "category": "Medical Insurance"},
    {"filename": "pruvalue-med", "name": "PRUValue Med", "category": "Medical Insurance"},
    {"filename": "prumy-child-plus", "name": "PRUMy Child Plus", "category": "Infant & Child Insurance"},
    {"filename": "legacy-settlement-option", "name": "Legacy Settlement Option", "category": "Wealth & Legacy Insurance"},
    {"filename": "pruwealth-enrich-2", "name": "PRUWealth Enrich 2.0", "category": "Wealth & Legacy Insurance"},
    {"filename": "pruelite-flex", "name": "PRUElite Flex", "category": "Wealth & Legacy Insurance"},
    {"filename": "prucash-enrich", "name": "PRUCash Enrich", "category": "Wealth & Legacy Insurance"},
    {"filename": "pruelite-invest", "name": "PRUElite Invest", "category": "Savings & Investment Insurance"},
    {"filename": "prucash-double-reward", "name": "PRUCash Double Reward", "category": "Savings & Investment Insurance"}
]

os.chdir(r"C:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page")

if not os.path.exists("pages"):
    os.makedirs("pages")

for p in products:
    content = template.replace("{name}", p["name"]).replace("{category}", p["category"])
    with open(f"pages/{p['filename']}.html", "w", encoding="utf-8") as f:
        f.write(content)

print("Generated all 15 pages in the pages/ directory!")
