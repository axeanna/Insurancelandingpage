import html
import os
import re

# Repo root = wherever this script lives, so it works from a git worktree or a
# clone anywhere on disk. It used to be an absolute path to one machine's copy,
# which meant running it from a worktree silently rewrote the *other* checkout.
root_dir = os.path.dirname(os.path.abspath(__file__))

# FAQ first: 51 Malaysia-specific Q&As, the densest answer source on the site
# and the thing answer engines are most likely to quote.
core_urls = [
    'faq/index.html',
    'blog/critical-illness-insurance-explained/index.html',
    'blog/evolution-of-critical-illness-coverage/index.html',
    'blog/how-much-life-insurance-malaysia/index.html',
    'blog/medical-card-guide-malaysia/index.html',
    'blog/mrta-vs-mlta/index.html',
    'blog/insurance-for-new-parents-malaysia/index.html',
    'products/my-critical-care/index.html',
    'products/multi-crisis-care/index.html',
    'products/critical-care-plus/index.html',
    'products/with-you-plus/index.html',
    'products/million-med/index.html',
    'products/term/index.html'
]

full_content = "# Annabel Ong - Prudential Full Knowledge Base\n\n"
full_content += (
    "Full text of the Malaysia insurance FAQ (51 questions), all guides, and core "
    "product specifications, for consumption by Large Language Models.\n"
    "Jurisdiction: Malaysia — panel/non-panel hospitals, LHDN relief, PIDM, the "
    "Financial Services Act 2013. US concepts (HMO/PPO, ACA, HSA) do not apply.\n"
    "General information, not financial advice; policy contracts govern actual terms.\n"
    "Source: Annabel Ong, Prudential Wealth Planner Malaysia (annaprudential.com)\n\n"
)

def strip_tags(markup):
    """Tags out, entities decoded. This is a plain-text file for LLM ingestion,
    so a literal "&amp;" in it is just noise the model has to see through."""
    return html.unescape(re.sub(r'\s+', ' ', re.sub('<[^<]+>', ' ', markup))).strip()


def extract_faqs(page):
    """Pull (question, answer) pairs, tracking <div> depth so answers that
    contain nested markup (the CI review timeline, for one) are captured whole
    instead of being cut at the first closing tag."""
    out = []
    for m in re.finditer(r'<button class="faq-q">(.*?)</button>', page, re.I | re.S):
        q = strip_tags(m.group(1))
        a_open = re.search(r'<div class="faq-a">', page[m.end():], re.I)
        if not a_open:
            continue
        start = m.end() + a_open.end()
        depth, i = 1, start
        for tag in re.finditer(r'<(/?)div\b', page[start:], re.I):
            depth += -1 if tag.group(1) else 1
            if depth == 0:
                i = start + tag.start()
                break
        out.append((q, strip_tags(page[start:i])))
    return out

for url in core_urls:
    filepath = os.path.join(root_dir, url.replace('/', os.sep))
    if os.path.exists(filepath):
        # Named `page`, not `html` — the stdlib `html` module is imported above
        # for entity decoding and shadowing it here would break strip_tags().
        with open(filepath, 'r', encoding='utf-8') as f:
            page = f.read()

        # Extract title
        title_match = re.search(r'<title>(.*?)</title>', page, re.IGNORECASE)
        title = html.unescape(title_match.group(1)) if title_match else url
        
        full_content += f"## {title}\n"
        full_content += f"Source URL: https://annaprudential.com/{url.replace('index.html', '')}\n\n"
        
        # Extract main content in article or section
        article_match = re.search(r'<article.*?>(.*?)</article>', page, re.IGNORECASE | re.DOTALL)
        if not article_match:
            # try to grab the first main section
            article_match = re.search(r'<section class="section.*?>(.*?)</section>', page, re.IGNORECASE | re.DOTALL)
            
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
        faqs = extract_faqs(page)
        if faqs:
            full_content += "\n### Frequently Asked Questions\n"
            for q, a in faqs:
                q_text = q
                a_text = a
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
