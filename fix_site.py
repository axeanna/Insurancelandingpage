import glob
import os
import re

def fix_encoding(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # The emojis got corrupted to things like "dY>,?" "? ,?" "dY?" "dY` " "dY'"
    replacements = [
        ("dY>,? Life Insurance", "🛡️ Life Insurance"),
        ("dY>,? Insurans Hayat", "🛡️ Insurans Hayat"),
        ("? ,? Critical Illness", "❤️ Critical Illness"),
        ("? ,? Penyakit Kritikal", "❤️ Penyakit Kritikal"),
        ("dY? Medical Insurance", "🏥 Medical Insurance"),
        ("dY? Insurans Perubatan", "🏥 Insurans Perubatan"),
        ("dY`  Infant & Child", "👶 Infant & Child"),
        ("dY`  Bayi & Kanak-Kanak", "👶 Bayi & Kanak-Kanak"),
        ("dY' Savings & Investment", "💰 Savings & Investment"),
        ("dY' Simpanan & Pelaburan", "💰 Simpanan & Pelaburan"),
        ("Products -_", "Products ▾"),
        ("Produk -_", "Produk ▾"),
        ("o\" Personalized advice", "✓ Personalized advice"),
        ("o\" Hassle-free claim", "✓ Hassle-free claim"),
        ("o\" Continuous portfolio", "✓ Continuous portfolio"),
        ("o\" Nasihat peribadi", "✓ Nasihat peribadi"),
        ("o\" Bantuan tuntutan", "✓ Bantuan tuntutan"),
        ("o\" Semakan portfolio", "✓ Semakan portfolio"),
    ]

    for old, new in replacements:
        content = content.replace(old, new)
        
    # Improve dropdown CSS (if it exists)
    if '.nav-dropdown:hover .dropdown-content' in content:
        old_css = '''    .dropdown-content {
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
    }'''
        new_css = '''    .dropdown-content {
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
    }
    .nav-dropdown:hover .dropdown-content {
        visibility: visible;
        opacity: 1;
        transform: translateY(0);
    }'''
        content = content.replace(old_css, new_css)
        
    # Specific fix for index.html hero
    if 'id="home" class="hero"' in content and ('index.html' in filepath or 'index-ms.html' in filepath):
        is_ms = 'index-ms.html' in filepath
        
        # We need to replace the entire hero section.
        # Find start of hero section
        start_idx = content.find('<header id="home" class="hero">')
        if start_idx == -1:
            start_idx = content.find('<!-- Hero Section -->')
            
        # Find end of hero section (before <!-- Moved Partners Section to bottom --> or <!-- About Section -->)
        end_idx = content.find('<!-- Moved Partners Section to bottom -->')
        if end_idx == -1:
            end_idx = content.find('<!-- About Section -->')
            
        if start_idx != -1 and end_idx != -1:
            before = content[:start_idx]
            after = content[end_idx:]
            
            if is_ms:
                new_hero = '''<!-- Hero Section -->
    <header id="home" class="hero" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 100px 20px; margin-top: -80px;">
        <!-- Background Image -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
            <img src="assets/hero_bg.webp?v=4" alt="Konsep Perlindungan Insurans" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.4) contrast(1.1);">
            <!-- Subtle gradient overlay -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(211,18,37,0.3) 0%, rgba(0,0,0,0.7) 100%);"></div>
        </div>
        
        <div class="container" style="position: relative; z-index: 2; width: 100%; max-width: 800px;">
            <div class="agent-intro-card fade-in active" style="padding: 50px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 30px;">
                    <img src="assets/agent_portrait.jpeg" alt="Annabel Ong" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-red); box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                    <div>
                        <h1 style="font-size: 2.8rem; margin: 0; color: var(--pure-white); font-weight: 700; letter-spacing: -1px;">Annabel Ong</h1>
                        <p style="margin: 5px 0 0; font-size: 1.2rem; font-weight: 500; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 2px;">Perancang Harta Prudential</p>
                        <span style="font-size: 0.9rem; background: var(--primary-red); color: white; padding: 6px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; font-weight: 600;">No LIAM: 00702610</span>
                    </div>
                </div>
                <p style="font-size: 1.4rem; line-height: 1.6; color: var(--pure-white); margin-bottom: 35px; font-weight: 300;">
                    "Saya mudahkan insurans untuk anda.<br>Biar saya carikan pelan yang paling sesuai."
                </p>
                <div class="hero-actions" style="margin-top: 0; justify-content: center;">
                    <a href="#quote" class="btn btn-primary" style="padding: 16px 35px; font-size: 1.1rem; border-radius: 50px;">Mari Berhubung</a>
                    <a href="products-ms.html" class="btn btn-secondary" style="padding: 16px 35px; font-size: 1.1rem; border-radius: 50px; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); color: white;">Terokai Produk</a>
                </div>
            </div>
        </div>
    </header>
    
    '''
            else:
                new_hero = '''<!-- Hero Section -->
    <header id="home" class="hero" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 100vh; padding: 100px 20px; margin-top: -80px;">
        <!-- Background Image -->
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 1;">
            <img src="assets/hero_bg.webp?v=4" alt="Insurance Protection Concept" style="width: 100%; height: 100%; object-fit: cover; filter: brightness(0.4) contrast(1.1);">
            <!-- Subtle gradient overlay -->
            <div style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: linear-gradient(135deg, rgba(211,18,37,0.3) 0%, rgba(0,0,0,0.7) 100%);"></div>
        </div>
        
        <div class="container" style="position: relative; z-index: 2; width: 100%; max-width: 800px;">
            <div class="agent-intro-card fade-in active" style="padding: 50px; border-radius: 30px; border: 1px solid rgba(255,255,255,0.2); box-shadow: 0 20px 50px rgba(0,0,0,0.5); background: rgba(255, 255, 255, 0.1); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); text-align: center;">
                <div style="display: flex; flex-direction: column; align-items: center; gap: 20px; margin-bottom: 30px;">
                    <img src="assets/agent_portrait.jpeg" alt="Annabel Ong" style="width: 120px; height: 120px; border-radius: 50%; object-fit: cover; border: 4px solid var(--primary-red); box-shadow: 0 10px 20px rgba(0,0,0,0.3);">
                    <div>
                        <h1 style="font-size: 2.8rem; margin: 0; color: var(--pure-white); font-weight: 700; letter-spacing: -1px;">Annabel Ong</h1>
                        <p style="margin: 5px 0 0; font-size: 1.2rem; font-weight: 500; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 2px;">Prudential Wealth Planner</p>
                        <span style="font-size: 0.9rem; background: var(--primary-red); color: white; padding: 6px 16px; border-radius: 20px; display: inline-block; margin-top: 15px; font-weight: 600;">LIAM No: 00702610</span>
                    </div>
                </div>
                <p style="font-size: 1.4rem; line-height: 1.6; color: var(--pure-white); margin-bottom: 35px; font-weight: 300;">
                    "I simplify insurance so you don't have to.<br>Let me find the perfect plan for you."
                </p>
                <div class="hero-actions" style="margin-top: 0; justify-content: center;">
                    <a href="#quote" class="btn btn-primary" style="padding: 16px 35px; font-size: 1.1rem; border-radius: 50px;">Let's Connect</a>
                    <a href="products.html" class="btn btn-secondary" style="padding: 16px 35px; font-size: 1.1rem; border-radius: 50px; background: rgba(255,255,255,0.1); border-color: rgba(255,255,255,0.5); color: white;">Explore Products</a>
                </div>
            </div>
        </div>
    </header>
    
    '''
            content = before + new_hero + after

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

# Apply fixes to root HTML files
for file in glob.glob(r"c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page\*.html"):
    fix_encoding(file)

print("Fixes applied successfully!")
