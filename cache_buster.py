import glob
import os

files = glob.glob('**/*.html', recursive=True)
for f in files:
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Check if we have unversioned css link
    content = content.replace('href="css/styles.css"', 'href="css/styles.css?v=10"')
    content = content.replace('href="../css/styles.css"', 'href="../css/styles.css?v=10"')
    
    # Also replace any old version to v=10
    import re
    content = re.sub(r'href="css/styles\.css\?v=\d+"', 'href="css/styles.css?v=10"', content)
    content = re.sub(r'href="\.\./css/styles\.css\?v=\d+"', 'href="../css/styles.css?v=10"', content)
    
    with open(f, 'w', encoding='utf-8') as file:
        file.write(content)

# Update generate_all_pages_v2.py
with open('generate_all_pages_v2.py', 'r', encoding='utf-8') as file:
    content = file.read()
    content = re.sub(r'href="\.\./css/styles\.css(\?v=\d+)?"', 'href="../css/styles.css?v=10"', content)
with open('generate_all_pages_v2.py', 'w', encoding='utf-8') as file:
    file.write(content)

print("Cache buster applied to all files.")
