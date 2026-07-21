import os
import re

root_dir = r'c:\Users\User\Desktop\ANTIGRAVITY\insurance-landing-page'

core_urls = [
    'blog/how-much-life-insurance-malaysia/index.html',
    'blog/medical-card-guide-malaysia/index.html',
    'blog/mrta-vs-mlta/index.html',
    'blog/critical-illness-insurance-explained/index.html',
    'blog/insurance-for-new-parents-malaysia/index.html',
    'products/my-critical-care/index.html',
    'products/with-you-plus/index.html',
    'products/million-med/index.html',
    'products/term/index.html'
]

full_content = "# Annabel Ong - Prudential Full Knowledge Base\n\n"
full_content += "This file contains the full text of core guides and product summaries for easy consumption by Large Language Models.\n\n"

def strip_tags(html):
    return re.sub('<[^<]+>', '', html).strip()

for url in core_urls:
    filepath = os.path.join(root_dir, url.replace('/', os.sep))
    if os.path.exists(filepath):
        with open(filepath, 'r', encoding='utf-8') as f:
            html = f.read()
        
        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', html, re.IGNORECASE)
        title = title_match.group(1) if title_match else url
        
        full_content += f"## {title}\n"
        full_content += f"Source URL: https://annaprudential.com/{url.replace('index.html', '')}\n\n"
        
        # Extract main content in article or section
        article_match = re.search(r'<article.*?>(.*?)</article>', html, re.IGNORECASE | re.DOTALL)
        if not article_match:
            # try to grab the first main section
            article_match = re.search(r'<section class="section.*?>(.*?)</section>', html, re.IGNORECASE | re.DOTALL)
            
        if article_match:
            article_html = article_match.group(1)
            # Find all paragraphs and headings
            blocks = re.findall(r'<(h[1-3]|p|li|div class="faq-a")[^>]*>(.*?)</\1>', article_html, re.IGNORECASE | re.DOTALL)
            for tag, content in blocks:
                text = strip_tags(content).replace('\n', ' ').strip()
                if not text: continue
                if tag.lower() in ['h1', 'h2', 'h3']:
                    full_content += f"\n### {text}\n"
                elif tag.lower() == 'li':
                    full_content += f"- {text}\n"
                else:
                    full_content += f"{text}\n\n"
        
        # Extract FAQ
        faqs = re.findall(r'<div class="faq-item">.*?<button class="faq-q">(.*?)</button>.*?<div class="faq-a">(.*?)</div>', html, re.IGNORECASE | re.DOTALL)
        if faqs:
            full_content += "\n### Frequently Asked Questions\n"
            for q, a in faqs:
                q_text = strip_tags(q).strip()
                a_text = strip_tags(a).strip()
                full_content += f"**Q: {q_text}**\n"
                full_content += f"A: {a_text}\n\n"
        
        full_content += "---\n\n"

with open(os.path.join(root_dir, 'llms-full.txt'), 'w', encoding='utf-8') as f:
    f.write(full_content)

print("Created llms-full.txt")

# Update llms.txt
llms_path = os.path.join(root_dir, 'llms.txt')
if os.path.exists(llms_path):
    with open(llms_path, 'r', encoding='utf-8') as f:
        llms_text = f.read()
    
    append_text = "\n\n## Full Content for LLMs\n- [Full Knowledge Base](https://annaprudential.com/llms-full.txt): Contains the complete markdown text of all core guides and product specifications for deep context ingestion.\n"
    if "Full Content for LLMs" not in llms_text:
        with open(llms_path, 'a', encoding='utf-8') as f:
            f.write(append_text)
        print("Updated llms.txt")
