import glob
import os
import re

nav_en_new = '''<li class="nav-dropdown">
                    <a href="products.html" class="nav-drop-btn">Products ▾</a>
                    <div class="dropdown-content">
                        <div class="drop-col">
                            <strong>🛡️ Life Insurance</strong>
                            <a href="pages/pruwith-you-plus.html">PRUWith You Plus</a>
                            <a href="pages/pruwealth-enrich-2.html">PRUWealth Enrich 2.0</a>
                            <a href="pages/prulive-well.html">PRULive Well</a>
                            <a href="pages/pruterm.html">PRUTerm</a>
                        </div>
                        <div class="drop-col">
                            <strong>❤️ Critical Illness</strong>
                            <a href="pages/total-multi-crisis-care.html">Total Multi Crisis Care</a>
                            <a href="pages/critical-care-plus.html">Critical Care Plus</a>
                            <a href="pages/critical-care.html">Critical Care</a>
                            <a href="pages/essential-child-plus.html">Essential Child Plus</a>
                        </div>
                        <div class="drop-col">
                            <strong>🏥 Medical Insurance</strong>
                            <a href="pages/prumillion-med-2.html">PRUMillion Med 2.0</a>
                            <br>
                            <strong>👶 Infant & Child</strong>
                            <a href="pages/prumy-child-plus.html">PRUMy Child Plus</a>
                            <br>
                            <strong>💰 Savings & Investment</strong>
                            <a href="pages/prucash-enrich.html">PRUCash Enrich</a>
                            <a href="pages/pruelite-flex.html">PRUElite Flex</a>
                        </div>
                    </div>
                </li>'''

nav_ms_new = '''<li class="nav-dropdown">
                    <a href="products-ms.html" class="nav-drop-btn">Produk ▾</a>
                    <div class="dropdown-content">
                        <div class="drop-col">
                            <strong>🛡️ Insurans Hayat</strong>
                            <a href="pages/pruwith-you-plus-ms.html">PRUWith You Plus</a>
                            <a href="pages/pruwealth-enrich-2-ms.html">PRUWealth Enrich 2.0</a>
                            <a href="pages/prulive-well-ms.html">PRULive Well</a>
                            <a href="pages/pruterm-ms.html">PRUTerm</a>
                        </div>
                        <div class="drop-col">
                            <strong>❤️ Penyakit Kritikal</strong>
                            <a href="pages/total-multi-crisis-care-ms.html">Total Multi Crisis Care</a>
                            <a href="pages/critical-care-plus-ms.html">Critical Care Plus</a>
                            <a href="pages/critical-care-ms.html">Critical Care</a>
                            <a href="pages/essential-child-plus-ms.html">Essential Child Plus</a>
                        </div>
                        <div class="drop-col">
                            <strong>🏥 Insurans Perubatan</strong>
                            <a href="pages/prumillion-med-2-ms.html">PRUMillion Med 2.0</a>
                            <br>
                            <strong>👶 Bayi & Kanak-Kanak</strong>
                            <a href="pages/prumy-child-plus-ms.html">PRUMy Child Plus</a>
                            <br>
                            <strong>💰 Simpanan & Pelaburan</strong>
                            <a href="pages/prucash-enrich-ms.html">PRUCash Enrich</a>
                            <a href="pages/pruelite-flex-ms.html">PRUElite Flex</a>
                        </div>
                    </div>
                </li>'''

for file in glob.glob(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find the whole nav-dropdown list item
    pattern = re.compile(r'<li class="nav-dropdown">.*?</li>', re.DOTALL)
    
    if '-ms' in file:
        content = pattern.sub(nav_ms_new, content)
    else:
        content = pattern.sub(nav_en_new, content)

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Navbars regex replaced!")
