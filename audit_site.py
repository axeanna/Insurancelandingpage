import os
import glob
import re

root_dir = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'
html_files = glob.glob(os.path.join(root_dir, '*.html')) + glob.glob(os.path.join(root_dir, 'pages', '*.html'))

issues = []

for file in html_files:
    with open(file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    filename = os.path.basename(file)
    is_page = 'pages' in file.replace('\\', '/')
    is_ms = '-ms.html' in filename
    
    # Check script version
    script_match = re.search(r'script\.js\?v=(\d+)', content)
    if script_match:
        ver = script_match.group(1)
        if ver != '11':
            issues.append(f'{filename}: Uses script.js?v={ver} instead of 11')
    else:
        issues.append(f'{filename}: Missing script.js version tag')
        
    # Check language toggle link
    lang_match = re.search(r'<li class="lang-item">.*?<a href="([^"]+)"', content, re.DOTALL)
    if lang_match:
        lang_href = lang_match.group(1)
        expected = ''
        if is_ms:
            expected = filename.replace('-ms.html', '.html')
        else:
            expected = filename.replace('.html', '-ms.html')
            
        if expected not in lang_href and not (lang_href == '../index.html' and filename == 'index-ms.html'):
            issues.append(f'{filename}: Lang toggle points to {lang_href}, expected {expected}')
    else:
        issues.append(f'{filename}: Missing lang toggle')

    # Check footer link consistency (just check if calculator link in footer exists and is correct)
    footer_calc_match = re.search(r'<footer.*?<a href="([^"]+)">Calculator</a>', content, re.DOTALL)
    if footer_calc_match:
        href = footer_calc_match.group(1)
        expected_href = '../calculator.html' if is_page else 'calculator.html'
        if is_ms:
            expected_href = expected_href.replace('.html', '-ms.html')
        
        # The site might not have calculator-ms.html in the footer for MS pages, let's just check if it's pointing to *calculator*
        if 'calculator' not in href:
            issues.append(f'{filename}: Footer calculator link is {href}')

print('\n'.join(issues))
