import os
import glob
import re

root_dir = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'
html_files = glob.glob(os.path.join(root_dir, '**', '*.html'), recursive=True)

count = 0
for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Replace js/main.js with js/main.js?v=2
    new_content = re.sub(r'(src=".*?js/main.js)(\?v=\d+)?(")', r'\g<1>?v=2\g<3>', content)
    # Replace css/site.css with css/site.css?v=2
    new_content = re.sub(r'(href=".*?css/site.css)(\?v=\d+)?(")', r'\g<1>?v=2\g<3>', new_content)
    
    if content != new_content:
        with open(file, 'w', encoding='utf-8') as f:
            f.write(new_content)
        count += 1

print(f"Updated {count} HTML files to use v=2 cache busters.")
