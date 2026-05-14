import os

def generate_page(slug, title, badge, desc, benefits, who, ms_flag=False):
    other_lang_link = f"../pages/{slug}.html" if ms_flag else f"../pages/{slug}-ms.html"
    lang_toggle_text = "MS | EN" if ms_flag else "EN | MS"
    html_lang = "ms" if ms_flag else "en"
    
    nav_home = "Utama" if ms_flag else "Home"
    nav_products = "Produk ▾" if ms_flag else "Products ▾"
    nav_calc = "Kalkulator" if ms_flag else "Calculator"
    
    why_title = "Mengapa Pelan Ini?" if ms_flag else "Why This Plan?"
    highlight_title = "Sorotan Pelan" if ms_flag else "Plan Highlights"
    who_title = "Siapa Yang Sesuai?" if ms_flag else "Who Is This For?"
    faq_title = "Soalan Lazim (FAQ)" if ms_flag else "Frequently Asked Questions"
    btn_quote = "Dapatkan Sebut Harga" if ms_flag else "Get a Quotation"
    btn_wa = "WhatsApp Anna" if ms_flag else "WhatsApp Anna"
    
    footer_quick = "Pautan Pantas" if ms_flag else "Quick Links"
    footer_contact = "Hubungi Kami" if ms_flag else "Contact"
    footer_desc = "Menyediakan penyelesaian insurans premium dan ketenangan fikiran untuk anda dan keluarga." if ms_flag else "Providing premium insurance solutions and peace of mind for you and your family."
    footer_rights = "&copy; 2026 Prudential. Hak Cipta Terpelihara." if ms_flag else "&copy; 2026 Prudential. All Rights Reserved."

    benefits_html = ""
    for icon, b_title, b_desc in benefits:
        benefits_html += f'''
                <div class="benefit-card glass" style="background: var(--pure-white); padding: 30px; border-radius: 16px; box-shadow: var(--shadow-md); border-left: 4px solid var(--primary-red);">
                    <div style="font-size: 2.5rem; margin-bottom: 15px;">{icon}</div>
                    <h3 style="color: var(--dark-bg); font-size: 1.2rem; margin-bottom: 10px;">{b_title}</h3>
                    <p style="color: var(--text-muted); font-size: 0.95rem;">{b_desc}</p>
                </div>'''

    highlights_html = "<ul>\n"
    for h in benefits:
        highlights_html += f"                    <li style='margin-bottom: 10px; font-size: 1.05rem; display: flex; align-items: flex-start; gap: 10px;'><span style='color: var(--primary-red);'>✓</span> <span>{h[2]}</span></li>\n"
    highlights_html += "                </ul>"

    who_html = ""
    for w in who:
        who_html += f'''
                <div style="background: var(--off-white); padding: 20px; border-radius: 12px; margin-bottom: 15px; border: 1px solid var(--border-color);">
                    <h4 style="color: var(--dark-bg); margin: 0; display: flex; align-items: center; gap: 10px;"><span>👤</span> {w}</h4>
                </div>'''

    if ms_flag:
        faq_html = '''
                <div class="faq-item" style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--pure-white);">
                    <div class="faq-header" style="padding: 20px; background: var(--off-white); font-weight: 600; cursor: pointer; color: var(--dark-bg);" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                        Apakah syarat kelayakan untuk pelan ini? ▾
                    </div>
                    <div class="faq-content" style="padding: 20px; display: none; color: var(--text-muted); border-top: 1px solid var(--border-color);">
                        Kelayakan bergantung pada umur kemasukan dan status kesihatan anda. Anna boleh membantu anda menyemak kelayakan anda secara percuma.
                    </div>
                </div>
                <div class="faq-item" style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--pure-white);">
                    <div class="faq-header" style="padding: 20px; background: var(--off-white); font-weight: 600; cursor: pointer; color: var(--dark-bg);" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                        Bolehkah saya menaik taraf pelan saya pada masa hadapan? ▾
                    </div>
                    <div class="faq-content" style="padding: 20px; display: none; color: var(--text-muted); border-top: 1px solid var(--border-color);">
                        Ya, kebanyakan pelan kami membenarkan anda menambah perlindungan tambahan (riders) apabila keperluan anda berubah.
                    </div>
                </div>'''
    else:
        faq_html = '''
                <div class="faq-item" style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--pure-white);">
                    <div class="faq-header" style="padding: 20px; background: var(--off-white); font-weight: 600; cursor: pointer; color: var(--dark-bg);" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                        What are the eligibility requirements for this plan? ▾
                    </div>
                    <div class="faq-content" style="padding: 20px; display: none; color: var(--text-muted); border-top: 1px solid var(--border-color);">
                        Eligibility depends on your entry age and health status. Anna can help you check your eligibility for free.
                    </div>
                </div>
                <div class="faq-item" style="margin-bottom: 15px; border: 1px solid var(--border-color); border-radius: 12px; overflow: hidden; background: var(--pure-white);">
                    <div class="faq-header" style="padding: 20px; background: var(--off-white); font-weight: 600; cursor: pointer; color: var(--dark-bg);" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'block' ? 'none' : 'block'">
                        Can I upgrade my plan in the future? ▾
                    </div>
                    <div class="faq-content" style="padding: 20px; display: none; color: var(--text-muted); border-top: 1px solid var(--border-color);">
                        Yes, most of our plans allow you to attach additional riders or increase your coverage amount as your life needs change.
                    </div>
                </div>'''

    extra_note = ""
    if "PRUMillion" in title:
        if ms_flag:
            extra_note = '<div style="margin-top: 20px; padding: 20px; background: rgba(211, 18, 37, 0.1); border-radius: 12px; border: 1px solid var(--primary-red);"><p>Untuk butiran penuh dan harga semasa, lawati laman web rasmi Prudential.</p><a href="https://www.prudential.com.my/en/personal/products/medical/prumillion-med-2-0/" target="_blank" class="btn btn-secondary mt-2">Lihat di Laman Web Prudential</a></div>'
        else:
            extra_note = '<div style="margin-top: 20px; padding: 20px; background: rgba(211, 18, 37, 0.1); border-radius: 12px; border: 1px solid var(--primary-red);"><p>For full plan details and current pricing, visit the official Prudential website.</p><a href="https://www.prudential.com.my/en/personal/products/medical/prumillion-med-2-0/" target="_blank" class="btn btn-secondary mt-2">View on Prudential Website</a></div>'
    
    if "Care" in title or "Essential Child" in title:
        rider_text = "Ini adalah penunggang yang dilampirkan pada pelan asas seperti PRUWith You Plus. Bincang dengan Anna untuk mengetahui kombinasi yang sesuai untuk keperluan anda." if ms_flag else "This is a rider that is attached to a base plan such as PRUWith You Plus. Speak to Anna to find out the right combination for your needs."
        extra_note += f'<div style="margin-top: 20px; padding: 15px; background: var(--off-white); border-radius: 8px;"><p style="margin:0; color: var(--text-muted); font-size: 0.9rem;">ℹ️ {rider_text}</p></div>'

    html = f'''<!DOCTYPE html>
<html lang="{html_lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} | Prudential</title>
    <link rel="icon" type="image/png" href="../assets/prudential-1.png">
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../css/styles.css?v=10">
    <style>
        .product-hero {{
            background: linear-gradient(135deg, var(--dark-bg) 0%, #1a1a1a 100%);
            color: var(--pure-white);
            padding: 160px 0 100px;
            text-align: center;
        }}
        .category-badge {{
            background: var(--primary-red);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 0.85rem;
            font-weight: 600;
            display: inline-block;
            margin-bottom: 20px;
            text-transform: uppercase;
            letter-spacing: 1px;
        }}
        
        /* Dropdown CSS - UPDATED TO ANIMATED VERSION */
        .nav-dropdown {{ position: relative; }}
        .dropdown-content {{
            visibility: hidden;
            opacity: 0;
            transform: translateY(10px);
            position: absolute;
            top: 100%;
            left: -150px;
            background-color: var(--pure-white);
            min-width: 650px;
            box-shadow: 0 15px 35px rgba(0,0,0,0.15);
            z-index: 100;
            border-radius: 16px;
            padding: 25px;
            gap: 20px;
            display: flex;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            border: 1px solid rgba(0,0,0,0.05);
        }}
        .nav-dropdown:hover .dropdown-content {{
            visibility: visible;
            opacity: 1;
            transform: translateY(0);
        }}
        .drop-col {{ flex: 1; display: flex; flex-direction: column; }}
        .drop-col strong {{ color: var(--dark-bg); margin-bottom: 10px; font-size: 0.9rem; border-bottom: 1px solid var(--border-color); padding-bottom: 5px; }}
        /* FIXED --text-dark to --text-main */
        .drop-col a {{ color: var(--text-main) !important; padding: 8px 0; text-decoration: none; font-size: 0.9rem; transition: color 0.2s; }}
        .drop-col a:hover {{ color: var(--primary-red) !important; padding-left: 5px; }}
        
        @media (max-width: 992px) {{
            .dropdown-content {{
                position: static;
                display: none;
                min-width: 100%;
                box-shadow: none;
                padding: 10px;
                flex-direction: column;
            }}
            .nav-dropdown.active .dropdown-content {{
                display: flex;
            }}
        }}
    </style>
</head>
<body>
    <!-- Navbar -->
    <nav class="navbar scrolled">
        <div class="container nav-container">
            <a href="../{'index-ms.html' if ms_flag else 'index.html'}" class="logo">
                <img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo">
            </a>
            <!-- FIXED: ADDED MOBILE TOGGLE -->
            <button class="mobile-toggle" aria-label="Toggle Navigation">
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            </button>
            <ul class="nav-links">
                <li><a href="../{'index-ms.html' if ms_flag else 'index.html'}#home">{nav_home}</a></li>
                <li class="nav-dropdown">
                    <a href="../{'products-ms.html' if ms_flag else 'products.html'}" class="nav-drop-btn">{nav_products}</a>
                    <div class="dropdown-content">
                        <div class="drop-col">
                            <strong>🛡️ {'Insurans Hayat' if ms_flag else 'Life Insurance'}</strong>
                            <a href="pruwith-you-plus{'-ms' if ms_flag else ''}.html">PRUWith You Plus</a>
                            <a href="pruwealth-enrich-2{'-ms' if ms_flag else ''}.html">PRUWealth Enrich 2.0</a>
                            <a href="prulive-well{'-ms' if ms_flag else ''}.html">PRULive Well</a>
                            <a href="pruterm{'-ms' if ms_flag else ''}.html">PRUTerm</a>
                        </div>
                        <div class="drop-col">
                            <strong>❤️ {'Penyakit Kritikal' if ms_flag else 'Critical Illness'}</strong>
                            <a href="total-multi-crisis-care{'-ms' if ms_flag else ''}.html">Total Multi Crisis Care</a>
                            <a href="critical-care-plus{'-ms' if ms_flag else ''}.html">Critical Care Plus</a>
                            <a href="critical-care{'-ms' if ms_flag else ''}.html">Critical Care</a>
                            <a href="essential-child-plus{'-ms' if ms_flag else ''}.html">Essential Child Plus</a>
                        </div>
                        <div class="drop-col">
                            <strong>🏥 {'Insurans Perubatan' if ms_flag else 'Medical Insurance'}</strong>
                            <a href="prumillion-med-2{'-ms' if ms_flag else ''}.html">PRUMillion Med 2.0</a>
                            <br>
                            <strong>👶 {'Bayi & Kanak-Kanak' if ms_flag else 'Infant & Child'}</strong>
                            <a href="prumy-child-plus{'-ms' if ms_flag else ''}.html">PRUMy Child Plus</a>
                            <br>
                            <strong>💰 {'Simpanan & Pelaburan' if ms_flag else 'Wealth & Savings'}</strong>
                            <a href="prucash-enrich{'-ms' if ms_flag else ''}.html">PRUCash Enrich</a>
                            <a href="pruelite-flex{'-ms' if ms_flag else ''}.html">PRUElite Flex</a>
                        </div>
                    </div>
                </li>
                <li><a href="../{'calculator-ms.html' if ms_flag else 'calculator.html'}">{nav_calc}</a></li>
                <!-- FIXED: ADDED LANGUAGE TOGGLE -->
                <li class="lang-item">
                    <a href="{other_lang_link}" class="lang-btn" aria-label="Toggle Language" title="Toggle Language" style="display:flex; align-items:center; gap:5px; padding:6px 12px; border:1px solid var(--border-color); border-radius:20px;">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                            class="globe-icon">
                            <circle cx="12" cy="12" r="10"></circle>
                            <line x1="2" y1="12" x2="22" y2="12"></line>
                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                        </svg>
                        <span>{lang_toggle_text}</span>
                    </a>
                </li>
            </ul>
        </div>
    </nav>

    <!-- Hero Section -->
    <header class="product-hero">
        <div class="container fade-in active" style="max-width: 800px;">
            <span class="category-badge">{badge}</span>
            <h1 style="font-size: 3rem; margin-bottom: 20px;">{title}</h1>
            <p style="font-size: 1.2rem; opacity: 0.9;">{desc}</p>
        </div>
    </header>

    <!-- Main Content -->
    <section class="bg-light" style="padding: 80px 0;">
        <div class="container">
            
            <div style="margin-bottom: 60px;">
                <h2 style="color: var(--dark-bg); text-align: center; margin-bottom: 40px; font-size: 2.2rem;">{why_title}</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 30px;">
{benefits_html}
                </div>
            </div>

            <div style="display: flex; flex-wrap: wrap; gap: 40px; margin-bottom: 60px;">
                <div style="flex: 1; min-width: 250px; background: var(--pure-white); padding: 40px; border-radius: 16px; box-shadow: var(--shadow-sm);">
                    <h3 style="color: var(--dark-bg); margin-bottom: 20px; font-size: 1.5rem;">{highlight_title}</h3>
{highlights_html}
{extra_note}
                </div>
                <div style="flex: 1; min-width: 250px;">
                    <h3 style="color: var(--dark-bg); margin-bottom: 20px; font-size: 1.5rem;">{who_title}</h3>
{who_html}
                </div>
            </div>

            <!-- FAQ Section -->
            <div style="margin-bottom: 60px; max-width: 800px; margin: 0 auto;">
                <h2 style="color: var(--dark-bg); text-align: center; margin-bottom: 30px; font-size: 2rem;">{faq_title}</h2>
{faq_html}
            </div>

            <!-- CTA Section -->
            <div style="text-align: center; padding: 60px; background: var(--pure-white); border-radius: 20px; box-shadow: var(--shadow-lg); border: 1px solid var(--border-color);">
                <h2 style="color: var(--dark-bg); margin-bottom: 20px;">{'Bersedia untuk melindungi masa depan anda?' if ms_flag else 'Ready to secure your future?'}</h2>
                <p style="color: var(--text-muted); margin-bottom: 30px; font-size: 1.1rem;">{'Dapatkan sebut harga peribadi atau bercakap dengan Anna untuk mencari pelan terbaik.' if ms_flag else 'Get a personalized quotation or speak directly with Anna to find the best configuration for you.'}</p>
                <div style="display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
                    <a href="../{'calculator-ms.html' if ms_flag else 'calculator.html'}" class="btn btn-primary" style="font-size: 1.1rem; padding: 15px 30px;">{btn_quote}</a>
                    <a href="https://wa.me/60183176361" target="_blank" class="btn btn-secondary" style="font-size: 1.1rem; padding: 15px 30px;">📱 {btn_wa}</a>
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
        <div class="container footer-container">
            <div class="footer-brand">
                <a href="../{'index-ms.html' if ms_flag else 'index.html'}" class="logo"><img src="../assets/prudential-1.png" alt="Prudential Logo" class="brand-logo"></a>
                <p class="mt-2">{footer_desc}</p>
            </div>
            <div class="footer-links">
                <h3>{footer_quick}</h3>
                <ul>
                    <li><a href="../{'index-ms.html' if ms_flag else 'index.html'}#home">{nav_home}</a></li>
                    <li><a href="../{'products-ms.html' if ms_flag else 'products.html'}">{'Produk' if ms_flag else 'Products'}</a></li>
                    <li><a href="../{'calculator-ms.html' if ms_flag else 'calculator.html'}">{nav_calc}</a></li>
                </ul>
            </div>
            <div class="footer-contact">
                <h3>{footer_contact}</h3>
                <p>Email: annabelong6997@prupartner.com.my</p>
                <p>Phone: +60 18-317 6361</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>{footer_rights}</p>
        </div>
    </footer>
    <!-- Add JS script to make toggle work -->
    <script src="../js/script.js?v=9"></script>
</body>
</html>'''

    filename = f"{slug}-ms.html" if ms_flag else f"{slug}.html"
    filepath = os.path.join(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\pages", filename)
    os.makedirs(os.path.dirname(filepath), exist_ok=True)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(html)

products_data = [
    {
        "slug": "pruwith-you-plus",
        "title": "PRUWith You Plus",
        "badge": "Life Insurance",
        "badge_ms": "Insurans Hayat",
        "desc": "Life insurance and investment in a single flexible plan",
        "desc_ms": "Insurans hayat dan pelaburan dalam satu pelan yang fleksibel",
        "benefits": [
            ("📈", "Sum Assured Booster", "Grows 1% per year up to 50% BSA"),
            ("👶", "Child Benefit", "Automatic coverage for children birth to age 7 at no extra cost"),
            ("🏆", "Goal Achievement Benefit", "RM500 cash reward for life milestones")
        ],
        "benefits_ms": [
            ("📈", "Penggalak Jumlah Diinsuranskan", "Berkembang 1% setahun sehingga 50% BSA"),
            ("👶", "Manfaat Kanak-Kanak", "Perlindungan automatik untuk anak dari lahir hingga umur 7 tahun tanpa kos tambahan"),
            ("🏆", "Manfaat Pencapaian Matlamat", "Ganjaran tunai RM500 untuk pencapaian hidup")
        ],
        "who": ["Young adults starting their career", "Newlyweds", "New parents"],
        "who_ms": ["Dewasa muda yang memulakan kerjaya", "Pasangan baru berkahwin", "Ibu bapa baru"]
    },
    {
        "slug": "prulive-well",
        "title": "PRULive Well",
        "badge": "Life Insurance",
        "badge_ms": "Insurans Hayat",
        "desc": "Guaranteed income and payout upon disability and death",
        "desc_ms": "Pendapatan terjamin dan bayaran atas kecacatan dan kematian",
        "benefits": [
            ("💸", "Monthly Income Benefit", "Up to 20 years upon disability (50% for 2 ADL, 100% for 3 ADL)"),
            ("🔄", "100% Premium Refund", "Full refund at maturity (age 80/90/100)"),
            ("🛡️", "Death Benefit", "Payout of 250x MIB plus premium waiver upon disability")
        ],
        "benefits_ms": [
            ("💸", "Manfaat Pendapatan Bulanan", "Sehingga 20 tahun atas kecacatan (50% untuk 2 ADL, 100% untuk 3 ADL)"),
            ("🔄", "Bayaran Balik Premium 100%", "Bayaran balik penuh pada tempoh matang (umur 80/90/100)"),
            ("🛡️", "Manfaat Kematian", "Bayaran 250x MIB ditambah pengecualian premium atas kecacatan")
        ],
        "who": ["Working adults who rely on income", "Those with aging parents", "Anyone without disability coverage"],
        "who_ms": ["Dewasa bekerja yang bergantung pada pendapatan", "Mereka yang mempunyai ibu bapa yang semakin tua", "Sesiapa sahaja tanpa perlindungan kecacatan"]
    },
    {
        "slug": "prumy-critical-care",
        "title": "PRUMy Critical Care",
        "badge": "Critical Illness",
        "badge_ms": "Penyakit Kritikal",
        "desc": "Income protection through every stage of critical illness",
        "desc_ms": "Perlindungan pendapatan melalui setiap peringkat penyakit kritikal",
        "benefits": [
            ("🏥", "Comprehensive Coverage", "Coverage from early to late stage (up to 160 conditions)"),
            ("🔄", "Multiple Claims", "Claim up to 400% of rider sum assured"),
            ("⭐", "Assurance Upgrade Privilege", "Increase coverage at life milestones without underwriting")
        ],
        "benefits_ms": [
            ("🏥", "Perlindungan Komprehensif", "Perlindungan dari peringkat awal hingga akhir (sehingga 160 keadaan)"),
            ("🔄", "Tuntutan Berbilang", "Tuntut sehingga 400% daripada jumlah diinsuranskan penunggang"),
            ("⭐", "Keistimewaan Naik Taraf Jaminan", "Tingkatkan perlindungan pada pencapaian hidup tanpa pengunderaitan")
        ],
        "who": ["Working professionals", "Parents", "Anyone without CI coverage"],
        "who_ms": ["Profesional bekerja", "Ibu bapa", "Sesiapa sahaja tanpa perlindungan CI"]
    },
    {
        "slug": "prucash-enrich",
        "title": "PRUCash Enrich",
        "badge": "Savings & Investment",
        "badge_ms": "Simpanan & Pelaburan",
        "desc": "Guaranteed long-term savings for your family's financial future",
        "desc_ms": "Simpanan jangka panjang terjamin untuk masa depan kewangan keluarga anda",
        "benefits": [
            ("💰", "Annual Guaranteed Cash", "Guaranteed cash payments throughout the policy term"),
            ("📈", "Lump Sum Maturity Benefit", "One lump sum with potential upside at maturity"),
            ("✅", "Guaranteed Acceptance", "No underwriting required on the basic plan")
        ],
        "benefits_ms": [
            ("💰", "Tunai Terjamin Tahunan", "Bayaran tunai terjamin sepanjang tempoh polisi"),
            ("📈", "Manfaat Matang Sekaligus", "Satu jumlah sekaligus dengan potensi kenaikan pada tempoh matang"),
            ("✅", "Penerimaan Terjamin", "Tiada pengunderaitan diperlukan pada pelan asas")
        ],
        "who": ["Parents saving for children's future", "Individuals planning for retirement", "Legacy planners"],
        "who_ms": ["Ibu bapa menyimpan untuk masa depan anak-anak", "Individu merancang untuk persaraan", "Perancang legasi"]
    },
    {
        "slug": "pruelite-flex",
        "title": "PRUElite Flex",
        "badge": "Savings & Investment",
        "badge_ms": "Simpanan & Pelaburan",
        "desc": "Growing wealth across generations with flexible guaranteed lifetime income",
        "desc_ms": "Mengembangkan kekayaan merentas generasi dengan pendapatan seumur hidup terjamin yang fleksibel",
        "benefits": [
            ("💵", "FlexIncome", "Flexible guaranteed lifetime income until age 80 or 100"),
            ("👨‍👩‍👧", "Policy Split Option", "Distribute wealth across multiple beneficiaries seamlessly"),
            ("✅", "Guaranteed Issuance", "Guaranteed Issuance Offer with no health questions")
        ],
        "benefits_ms": [
            ("💵", "FlexIncome", "Pendapatan seumur hidup terjamin yang fleksibel sehingga umur 80 atau 100"),
            ("👨‍👩‍👧", "Pilihan Pemisahan Polisi", "Edarkan kekayaan kepada pelbagai benefisiari dengan lancar"),
            ("✅", "Penerbitan Terjamin", "Tawaran Penerbitan Terjamin tanpa soalan kesihatan")
        ],
        "who": ["High-income earners focused on legacy planning", "Parents wanting to distribute wealth", "Those wanting guaranteed lifetime income"],
        "who_ms": ["Golongan berpendapatan tinggi yang fokus pada perancangan legasi", "Ibu bapa yang ingin mengedarkan kekayaan", "Mereka yang mahukan pendapatan seumur hidup yang terjamin"]
    },
    {
        "slug": "pruwealth-enrich-2",
        "title": "PRUWealth Enrich 2.0",
        "badge": "Life Insurance",
        "badge_ms": "Insurans Hayat",
        "desc": "Wealth accumulation with guaranteed returns and flexible payout options",
        "desc_ms": "Pengumpulan kekayaan dengan pulangan terjamin dan pilihan bayaran yang fleksibel",
        "benefits": [
            ("📈", "Guaranteed Cash Value", "Steady cash value growth over time"),
            ("🗓️", "Flexible Premiums", "Flexible premium payment terms to suit your budget"),
            ("👨‍👩‍👧", "Wealth Transfer", "Seamlessly transfer wealth to the next generation")
        ],
        "benefits_ms": [
            ("📈", "Nilai Tunai Terjamin", "Pertumbuhan nilai tunai yang stabil dari semasa ke semasa"),
            ("🗓️", "Premium Fleksibel", "Tempoh pembayaran premium yang fleksibel untuk disesuaikan dengan bajet anda"),
            ("👨‍👩‍👧", "Pemindahan Kekayaan", "Pindahkan kekayaan dengan lancar ke generasi seterusnya")
        ],
        "who": ["Wealth builders", "Retirement planners", "Legacy-focused individuals"],
        "who_ms": ["Pembina kekayaan", "Perancang persaraan", "Individu berfokuskan legasi"]
    },
    {
        "slug": "pruterm",
        "title": "PRUTerm",
        "badge": "Life Insurance",
        "badge_ms": "Insurans Hayat",
        "desc": "Pure life protection at an affordable premium",
        "desc_ms": "Perlindungan hayat tulen pada premium yang berpatutan",
        "benefits": [
            ("💰", "High Coverage", "High coverage amount at a very low cost"),
            ("🛡️", "Straightforward Benefit", "Simple and straightforward death benefit payout"),
            ("🗓️", "Flexible Period", "Choose a coverage period that matches your liabilities")
        ],
        "benefits_ms": [
            ("💰", "Perlindungan Tinggi", "Jumlah perlindungan tinggi pada kos yang sangat rendah"),
            ("🛡️", "Manfaat Mudah", "Bayaran manfaat kematian yang ringkas dan mudah"),
            ("🗓️", "Tempoh Fleksibel", "Pilih tempoh perlindungan yang sepadan dengan liabiliti anda")
        ],
        "who": ["Young families on a budget", "Breadwinners", "Mortgage protection seekers"],
        "who_ms": ["Keluarga muda dengan bajet", "Pencari nafkah", "Pencari perlindungan gadai janji"]
    },
    {
        "slug": "total-multi-crisis-care",
        "title": "Total Multi Crisis Care",
        "badge": "Critical Illness",
        "badge_ms": "Penyakit Kritikal",
        "desc": "Comprehensive rider covering 160 conditions from early to late stages",
        "desc_ms": "Penunggang komprehensif meliputi 160 keadaan dari peringkat awal hingga akhir",
        "benefits": [
            ("🏥", "160 Conditions", "Coverage for 160 conditions from early to late stage"),
            ("🔄", "Multiple Claims", "Multiple claims allowed up to 400% of sum assured"),
            ("💸", "Lump Sum Payout", "Provides a lump sum payout upon diagnosis")
        ],
        "benefits_ms": [
            ("🏥", "160 Keadaan", "Perlindungan untuk 160 keadaan dari peringkat awal hingga akhir"),
            ("🔄", "Tuntutan Berbilang", "Tuntutan berbilang dibenarkan sehingga 400% daripada jumlah diinsuranskan"),
            ("💸", "Bayaran Sekaligus", "Menyediakan bayaran sekaligus apabila didiagnosis")
        ],
        "who": ["Working professionals", "Parents", "Anyone without CI coverage"],
        "who_ms": ["Profesional bekerja", "Ibu bapa", "Sesiapa sahaja tanpa perlindungan CI"]
    },
    {
        "slug": "critical-care-plus",
        "title": "Critical Care Plus",
        "badge": "Critical Illness",
        "badge_ms": "Penyakit Kritikal",
        "desc": "Late-stage critical illness coverage with ICU and Wellness benefits",
        "desc_ms": "Perlindungan penyakit kritikal peringkat akhir dengan manfaat ICU dan Kesejahteraan",
        "benefits": [
            ("🏥", "80 Conditions", "Coverage for 80 late-stage critical conditions"),
            ("🛡️", "ICU Shield", "ICU Shield Benefit and Reconstructive Care Benefit"),
            ("⭐", "Wellness Bonus", "Wellness Bonus included to support recovery")
        ],
        "benefits_ms": [
            ("🏥", "80 Keadaan", "Perlindungan untuk 80 keadaan kritikal peringkat akhir"),
            ("🛡️", "Perisai ICU", "Manfaat Perisai ICU dan Manfaat Penjagaan Rekonstruktif"),
            ("⭐", "Bonus Kesejahteraan", "Bonus Kesejahteraan disertakan untuk menyokong pemulihan")
        ],
        "who": ["Working professionals", "Parents", "Anyone without CI coverage"],
        "who_ms": ["Profesional bekerja", "Ibu bapa", "Sesiapa sahaja tanpa perlindungan CI"]
    },
    {
        "slug": "critical-care",
        "title": "Critical Care",
        "badge": "Critical Illness",
        "badge_ms": "Penyakit Kritikal",
        "desc": "Essential late-stage critical illness coverage",
        "desc_ms": "Perlindungan penyakit kritikal peringkat akhir yang penting",
        "benefits": [
            ("🏥", "80 Conditions", "Coverage for 80 late-stage critical conditions"),
            ("🔄", "Flexible Structure", "Choose between accelerate or additional coverage option"),
            ("💸", "Lump Sum Payout", "Provides a lump sum payout upon diagnosis")
        ],
        "benefits_ms": [
            ("🏥", "80 Keadaan", "Perlindungan untuk 80 keadaan kritikal peringkat akhir"),
            ("🔄", "Struktur Fleksibel", "Pilih antara pilihan perlindungan pecutan atau tambahan"),
            ("💸", "Bayaran Sekaligus", "Menyediakan bayaran sekaligus apabila didiagnosis")
        ],
        "who": ["Working professionals", "Parents", "Anyone without CI coverage"],
        "who_ms": ["Profesional bekerja", "Ibu bapa", "Sesiapa sahaja tanpa perlindungan CI"]
    },
    {
        "slug": "essential-child-plus",
        "title": "Essential Child Plus",
        "badge": "Critical Illness",
        "badge_ms": "Penyakit Kritikal",
        "desc": "Dedicated critical illness coverage tailored for children",
        "desc_ms": "Perlindungan penyakit kritikal khusus disesuaikan untuk kanak-kanak",
        "benefits": [
            ("👶", "Juvenile Conditions", "Covers 10 specific juvenile conditions"),
            ("🔄", "Auto-Conversion", "Automatically converts to Critical Care Plus at age 25"),
            ("🛡️", "Early Protection", "Protects your child during their most vulnerable years")
        ],
        "benefits_ms": [
            ("👶", "Keadaan Juvana", "Meliputi 10 keadaan juvana tertentu"),
            ("🔄", "Penukaran Automatik", "Bertukar secara automatik kepada Critical Care Plus pada umur 25 tahun"),
            ("🛡️", "Perlindungan Awal", "Melindungi anak anda semasa tahun-tahun mereka yang paling terdedah")
        ],
        "who": ["New parents", "Expecting parents", "Parents wanting to start early"],
        "who_ms": ["Ibu bapa baru", "Ibu bapa yang sedang mengandung", "Ibu bapa yang ingin bermula awal"]
    },
    {
        "slug": "prumillion-med-2",
        "title": "PRUMillion Med 2.0",
        "badge": "Medical Insurance",
        "badge_ms": "Insurans Perubatan",
        "desc": "Comprehensive medical coverage for hospitalisation and surgical expenses",
        "desc_ms": "Perlindungan perubatan komprehensif untuk kos penghospitalan dan pembedahan",
        "benefits": [
            ("🏥", "High Annual Limit", "High annual limit coverage with no lifetime limit"),
            ("💳", "Cashless Admission", "Cashless admission at panel hospitals nationwide"),
            ("🔄", "Pre & Post Care", "Covers pre and post hospitalisation expenses")
        ],
        "benefits_ms": [
            ("🏥", "Had Tahunan Tinggi", "Perlindungan had tahunan yang tinggi tanpa had seumur hidup"),
            ("💳", "Kemasukan Tanpa Tunai", "Kemasukan tanpa tunai di hospital panel di seluruh negara"),
            ("🔄", "Penjagaan Pra & Pasca", "Meliputi kos pra dan pasca penghospitalan")
        ],
        "who": ["Anyone without adequate medical coverage", "Those wanting to upgrade their existing plan"],
        "who_ms": ["Sesiapa sahaja tanpa perlindungan perubatan yang mencukupi", "Mereka yang ingin menaik taraf pelan sedia ada mereka"]
    },
    {
        "slug": "prumy-child-plus",
        "title": "PRUMy Child Plus",
        "badge": "Infant & Child",
        "badge_ms": "Bayi & Kanak-Kanak",
        "desc": "Comprehensive protection for your child from day one",
        "desc_ms": "Perlindungan komprehensif untuk anak anda dari hari pertama",
        "benefits": [
            ("👶", "Early Entry Age", "Start protecting your child as early as 13 weeks of pregnancy"),
            ("🎓", "Education Fund", "Built-in education fund component to secure their future"),
            ("🛡️", "Premium Waiver", "Premium waiver if parent passes away or suffers CI")
        ],
        "benefits_ms": [
            ("👶", "Umur Kemasukan Awal", "Mula melindungi anak anda seawal 13 minggu kehamilan"),
            ("🎓", "Dana Pendidikan", "Komponen dana pendidikan terbina dalam untuk menjamin masa depan mereka"),
            ("🛡️", "Pengecualian Premium", "Pengecualian premium jika ibu bapa meninggal dunia atau menghidap penyakit kritikal")
        ],
        "who": ["New parents", "Expecting parents", "Parents wanting to start early"],
        "who_ms": ["Ibu bapa baru", "Ibu bapa yang sedang mengandung", "Ibu bapa yang ingin bermula awal"]
    }
]

print(f"Regenerating {len(products_data) * 2} product pages with fixes...")
for product in products_data:
    generate_page(product["slug"], product["title"], product["badge"], product["desc"], product["benefits"], product["who"], False)
    generate_page(product["slug"], product["title"], product["badge_ms"], product["desc_ms"], product["benefits_ms"], product["who_ms"], True)
print("Finished generating pages!")
