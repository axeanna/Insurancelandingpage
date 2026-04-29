import os

def update_products_html(filepath, is_ms=False):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The start and end of the products grid section to replace
    start_str = '<!-- Products Grid Section -->'
    end_str = '<!-- Footer -->'

    if start_str not in content or end_str not in content:
        print(f"Could not find section in {filepath}")
        return

    before = content.split(start_str)[0]
    after = content.split(end_str)[1]

    if is_ms:
        new_section = '''<!-- Products Accordion Section -->
    <style>
        .accordion-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .accordion-item { background: var(--pure-white); border-radius: 12px; margin-bottom: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden; }
        .accordion-header { padding: 20px 25px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: var(--pure-white); transition: background 0.3s; }
        .accordion-header:hover { background: var(--off-white); }
        .accordion-title { font-size: 1.25rem; font-weight: 600; color: var(--dark-bg); display: flex; align-items: center; gap: 15px; margin: 0; }
        .accordion-icon { font-size: 1.5rem; }
        .accordion-arrow { transition: transform 0.3s; color: var(--primary-red); font-size: 1.2rem; }
        .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background: var(--off-white); }
        .accordion-content-inner { padding: 20px 25px; display: flex; flex-direction: column; gap: 10px; }
        .product-link { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--pure-white); border-radius: 8px; text-decoration: none; color: var(--text-dark); border: 1px solid var(--border-color); transition: all 0.2s; }
        .product-link:hover { border-color: var(--primary-red); transform: translateX(5px); box-shadow: var(--shadow-sm); color: var(--primary-red); }
        .product-link strong { font-size: 1.1rem; }
        .accordion-item.active .accordion-arrow { transform: rotate(180deg); }
        .accordion-item.active .accordion-content { max-height: 1000px; }
    </style>
    <section class="products-list bg-light">
        <div class="container accordion-container fade-in active">
            
            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">🛡️</span> Insurans Hayat</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/pruwith-you-plus-ms.html" class="product-link"><strong>PRUWith You Plus</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/prulive-well-ms.html" class="product-link"><strong>PRULive Well</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/pruterm-ms.html" class="product-link"><strong>PRUTerm</strong> <span>Lihat Butiran →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">❤️</span> Penyakit Kritikal</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumy-critical-care-ms.html" class="product-link"><strong>PRUMy Critical Care</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/total-multi-crisis-care-ms.html" class="product-link"><strong>Total Multi Crisis Care</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/critical-care-plus-ms.html" class="product-link"><strong>Critical Care Plus</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/critical-care-ms.html" class="product-link"><strong>Critical Care</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/essential-child-plus-ms.html" class="product-link"><strong>Essential Child Plus</strong> <span>Lihat Butiran →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">🏥</span> Insurans Perubatan</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumillion-med-2-ms.html" class="product-link"><strong>PRUMillion Med 2.0</strong> <span>Lihat Butiran →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">👶</span> Bayi & Kanak-Kanak</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumy-child-plus-ms.html" class="product-link"><strong>PRUMy Child Plus</strong> <span>Lihat Butiran →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">💰</span> Simpanan, Pelaburan & Kekayaan</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prucash-enrich-ms.html" class="product-link"><strong>PRUCash Enrich</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/pruelite-flex-ms.html" class="product-link"><strong>PRUElite Flex</strong> <span>Lihat Butiran →</span></a>
                        <a href="pages/pruwealth-enrich-2-ms.html" class="product-link"><strong>PRUWealth Enrich 2.0</strong> <span>Lihat Butiran →</span></a>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->'''
    else:
        new_section = '''<!-- Products Accordion Section -->
    <style>
        .accordion-container { max-width: 800px; margin: 0 auto; padding: 40px 20px; }
        .accordion-item { background: var(--pure-white); border-radius: 12px; margin-bottom: 20px; box-shadow: var(--shadow-sm); border: 1px solid var(--border-color); overflow: hidden; }
        .accordion-header { padding: 20px 25px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; background: var(--pure-white); transition: background 0.3s; }
        .accordion-header:hover { background: var(--off-white); }
        .accordion-title { font-size: 1.25rem; font-weight: 600; color: var(--dark-bg); display: flex; align-items: center; gap: 15px; margin: 0; }
        .accordion-icon { font-size: 1.5rem; }
        .accordion-arrow { transition: transform 0.3s; color: var(--primary-red); font-size: 1.2rem; }
        .accordion-content { max-height: 0; overflow: hidden; transition: max-height 0.4s ease-out; background: var(--off-white); }
        .accordion-content-inner { padding: 20px 25px; display: flex; flex-direction: column; gap: 10px; }
        .product-link { display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; background: var(--pure-white); border-radius: 8px; text-decoration: none; color: var(--text-dark); border: 1px solid var(--border-color); transition: all 0.2s; }
        .product-link:hover { border-color: var(--primary-red); transform: translateX(5px); box-shadow: var(--shadow-sm); color: var(--primary-red); }
        .product-link strong { font-size: 1.1rem; }
        .accordion-item.active .accordion-arrow { transform: rotate(180deg); }
        .accordion-item.active .accordion-content { max-height: 1000px; }
    </style>
    <section class="products-list bg-light">
        <div class="container accordion-container fade-in active">
            
            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">🛡️</span> Life Insurance</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/pruwith-you-plus.html" class="product-link"><strong>PRUWith You Plus</strong> <span>View Details →</span></a>
                        <a href="pages/prulive-well.html" class="product-link"><strong>PRULive Well</strong> <span>View Details →</span></a>
                        <a href="pages/pruterm.html" class="product-link"><strong>PRUTerm</strong> <span>View Details →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">❤️</span> Critical Illness</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumy-critical-care.html" class="product-link"><strong>PRUMy Critical Care</strong> <span>View Details →</span></a>
                        <a href="pages/total-multi-crisis-care.html" class="product-link"><strong>Total Multi Crisis Care</strong> <span>View Details →</span></a>
                        <a href="pages/critical-care-plus.html" class="product-link"><strong>Critical Care Plus</strong> <span>View Details →</span></a>
                        <a href="pages/critical-care.html" class="product-link"><strong>Critical Care</strong> <span>View Details →</span></a>
                        <a href="pages/essential-child-plus.html" class="product-link"><strong>Essential Child Plus</strong> <span>View Details →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">🏥</span> Medical Insurance</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumillion-med-2.html" class="product-link"><strong>PRUMillion Med 2.0</strong> <span>View Details →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">👶</span> Infant & Child</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prumy-child-plus.html" class="product-link"><strong>PRUMy Child Plus</strong> <span>View Details →</span></a>
                    </div>
                </div>
            </div>

            <div class="accordion-item">
                <div class="accordion-header" onclick="this.parentElement.classList.toggle('active')">
                    <h3 class="accordion-title"><span class="accordion-icon">💰</span> Savings, Investment & Wealth</h3>
                    <span class="accordion-arrow">▼</span>
                </div>
                <div class="accordion-content">
                    <div class="accordion-content-inner">
                        <a href="pages/prucash-enrich.html" class="product-link"><strong>PRUCash Enrich</strong> <span>View Details →</span></a>
                        <a href="pages/pruelite-flex.html" class="product-link"><strong>PRUElite Flex</strong> <span>View Details →</span></a>
                        <a href="pages/pruwealth-enrich-2.html" class="product-link"><strong>PRUWealth Enrich 2.0</strong> <span>View Details →</span></a>
                    </div>
                </div>
            </div>

        </div>
    </section>

    <!-- Footer -->'''

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(before + new_section + after)

update_products_html(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\products.html', False)
update_products_html(r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\products-ms.html', True)
print("Products pages redesigned!")
