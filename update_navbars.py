import glob
import os

nav_en_old = '<li><a href="products.html">Products</a></li>'
nav_en_new = '''                <li class="nav-dropdown">
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

nav_ms_old = '<li><a href="products-ms.html">Produk</a></li>'
nav_ms_new = '''                <li class="nav-dropdown">
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

css_to_add = '''
    /* Dropdown CSS */
    .nav-dropdown {
        position: relative;
    }
    .dropdown-content {
        display: none;
        position: absolute;
        top: 100%;
        left: -150px;
        background-color: var(--pure-white);
        min-width: 650px;
        box-shadow: 0px 8px 16px 0px rgba(0,0,0,0.1);
        z-index: 100;
        border-radius: 12px;
        padding: 20px;
        gap: 20px;
    }
    .nav-dropdown:hover .dropdown-content {
        display: flex;
    }
    .drop-col {
        flex: 1;
        display: flex;
        flex-direction: column;
    }
    .drop-col strong {
        color: var(--dark-bg);
        margin-bottom: 10px;
        font-size: 0.9rem;
        border-bottom: 1px solid var(--border-color);
        padding-bottom: 5px;
    }
    .drop-col a {
        color: var(--text-dark) !important;
        padding: 8px 0;
        text-decoration: none;
        font-size: 0.9rem;
        transition: color 0.2s;
    }
    .drop-col a:hover {
        color: var(--primary-red) !important;
        padding-left: 5px;
    }
    
    @media (max-width: 992px) {
        .dropdown-content {
            position: static;
            display: none;
            min-width: 100%;
            box-shadow: none;
            padding: 10px;
            flex-direction: column;
        }
        .nav-dropdown.active .dropdown-content {
            display: flex;
        }
        .drop-col {
            margin-bottom: 15px;
        }
    }
'''

for file in glob.glob(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\*.html"):
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if '-ms' in file:
        content = content.replace(nav_ms_old, nav_ms_new)
        content = content.replace('<li><a href="products-ms.html" class="text-red">Produk</a></li>', nav_ms_new)
    else:
        content = content.replace(nav_en_old, nav_en_new)
        content = content.replace('<li><a href="products.html" class="text-red">Products</a></li>', nav_en_new)
        
    if "/* Dropdown CSS */" not in content:
        content = content.replace('</style>', css_to_add + '\n</style>')
        if '</style>' not in content and '/* Dropdown CSS */' not in content:
            content = content.replace('</head>', '<style>' + css_to_add + '</style>\n</head>')

    with open(file, 'w', encoding='utf-8') as f:
        f.write(content)

print("Navbars updated!")
