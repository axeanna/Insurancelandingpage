import os
import glob
import re

root_dir = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'
html_files = []
for dirpath, dirnames, filenames in os.walk(root_dir):
    for f in filenames:
        if f.endswith('.html'):
            html_files.append(os.path.join(dirpath, f))

old_footer = '''      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:annabelong6997@prupartner.com.my">annabelong6997@prupartner.com.my</a></li>
          <li><a href="tel:+60183176361">+60 18-317 6361</a></li>
          <li><a href="https://wa.me/60183176361" target="_blank" rel="noopener">WhatsApp Annabel</a></li>
        </ul>
      </div>'''

new_footer = '''      <div>
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:annabelong6997@prupartner.com.my">annabelong6997@prupartner.com.my</a></li>
          <li><a href="tel:+60183176361">+60 18-317 6361</a></li>
          <li><a href="https://wa.me/60183176361" target="_blank" rel="noopener">WhatsApp Annabel</a></li>
        </ul>
        <h4 style="margin-top:20px;">Social</h4>
        <ul style="display:flex; gap:12px; list-style:none; padding:0; font-size:1.4rem;">
          <li><a href="https://youtube.com" target="_blank" rel="noopener" aria-label="YouTube">▶️</a></li>
          <li><a href="https://tiktok.com" target="_blank" rel="noopener" aria-label="TikTok">🎵</a></li>
          <li><a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram">📸</a></li>
          <li><a href="https://linkedin.com" target="_blank" rel="noopener" aria-label="LinkedIn">💼</a></li>
        </ul>
      </div>'''

count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if old_footer in content:
        content = content.replace(old_footer, new_footer)
        with open(file, 'w', encoding='utf-8') as f:
            f.write(content)
        count += 1
    else:
        # try regex for slight spacing differences
        old_regex = r'<div>\s*<h4>Contact</h4>\s*<ul>\s*<li><a href="mailto:annabelong6997@prupartner.com.my">annabelong6997@prupartner.com.my</a></li>\s*<li><a href="tel:\+60183176361">\+60 18-317 6361</a></li>\s*<li><a href="https://wa.me/60183176361" target="_blank" rel="noopener">WhatsApp Annabel</a></li>\s*</ul>\s*</div>'
        if re.search(old_regex, content):
            content = re.sub(old_regex, new_footer, content)
            with open(file, 'w', encoding='utf-8') as f:
                f.write(content)
            count += 1

print(f"Updated {count} files with social links.")
