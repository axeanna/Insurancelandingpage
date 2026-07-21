// Lightweight HTML extraction. No dependencies — the pages here are hand/script
// generated and well-formed, so targeted regex beats pulling in a parser.

const RX = {
  title: /<title[^>]*>([\s\S]*?)<\/title>/i,
  lang: /<html[^>]*\blang=["']([^"']+)["']/i,
  canonical: /<link[^>]*rel=["']canonical["'][^>]*>/i,
  href: /\bhref=["']([^"']*)["']/i,
  content: /\bcontent=["']([\s\S]*?)["']/i,
  jsonld: /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  img: /<img\b[^>]*>/gi,
  alt: /\balt=["']([^"']*)["']/i,
  src: /\bsrc=["']([^"']*)["']/i,
  a: /<a\b[^>]*href=["']([^"']*)["'][^>]*>([\s\S]*?)<\/a>/gi,
  scriptStyle: /<(script|style|noscript)\b[\s\S]*?<\/\1>/gi,
  tag: /<[^>]+>/g,
};

export function meta(html, name) {
  const rx = new RegExp(`<meta[^>]*\\bname=["']${name}["'][^>]*>`, 'i');
  const tag = html.match(rx);
  return tag ? (tag[0].match(RX.content)?.[1] ?? '').trim() : null;
}

export function ogMeta(html, prop) {
  const rx = new RegExp(`<meta[^>]*\\bproperty=["']${prop}["'][^>]*>`, 'i');
  const tag = html.match(rx);
  return tag ? (tag[0].match(RX.content)?.[1] ?? '').trim() : null;
}

export function headings(html) {
  const out = [];
  const rx = /<h([1-6])\b[^>]*>([\s\S]*?)<\/h\1>/gi;
  let m;
  while ((m = rx.exec(html))) {
    out.push({ level: Number(m[1]), text: stripTags(m[2]) });
  }
  return out;
}

export function images(html) {
  return (html.match(RX.img) ?? []).map((tag) => ({
    tag,
    alt: tag.match(RX.alt)?.[1] ?? null,
    src: tag.match(RX.src)?.[1] ?? null,
    lazy: /\bloading=["']lazy["']/i.test(tag),
    sized: /\bwidth=/i.test(tag) && /\bheight=/i.test(tag),
  }));
}

export function links(html) {
  const out = [];
  let m;
  RX.a.lastIndex = 0;
  while ((m = RX.a.exec(html))) {
    const href = m[1];
    out.push({
      href,
      text: stripTags(m[2]),
      external: /^https?:\/\//i.test(href) && !/annaprudential\.com/i.test(href),
      internal: !/^(https?:|mailto:|tel:|#|javascript:)/i.test(href) || /annaprudential\.com/i.test(href),
    });
  }
  return out;
}

/** All parsed JSON-LD blocks, flattened out of any @graph wrappers. */
export function jsonld(html) {
  const nodes = [];
  const errors = [];
  let m;
  RX.jsonld.lastIndex = 0;
  while ((m = RX.jsonld.exec(html))) {
    try {
      const parsed = JSON.parse(m[1]);
      for (const item of [].concat(parsed)) {
        for (const node of [].concat(item['@graph'] ?? item)) nodes.push(node);
      }
    } catch (err) {
      errors.push(err.message);
    }
  }
  return { nodes, errors };
}

export function schemaTypes(html) {
  return jsonld(html).nodes.flatMap((n) => [].concat(n['@type'] ?? []));
}

// Headings that end in "?" but are calls to action, not questions anyone
// searches for. Marking these up produces nonsense in AI answers.
const CTA_HEADING = /^(ready to|want to|need help|interested|shall we|why wait|got questions)/i;

/**
 * Finds genuine editorial Q&A pairs: a question heading followed by prose that
 * answers it.
 *
 * The bar is deliberately high, and it lives here so the auditor and the fixer
 * cannot disagree. A looser version treated the blog index's linked article-card
 * titles as questions and swept the neighbouring card's teaser in as the answer.
 * Misleading structured data gets a site's rich results revoked, so anything
 * ambiguous is dropped: linked headings are card titles, and links inside the
 * answer mean we captured a card grid or nav list rather than prose.
 */
export function faqCandidates(html) {
  const scope = mainHtml(html);
  const rx = /<h([23])\b[^>]*>([\s\S]*?)<\/h\1>([\s\S]*?)(?=<h[1-3]\b|<\/(?:section|main|body)\b)/gi;
  const out = [];
  let m;
  while ((m = rx.exec(scope))) {
    const [, , rawQ, rawA] = m;
    const q = stripTags(rawQ).trim();
    if (!q.endsWith('?') || q.length < 12) continue;
    if (CTA_HEADING.test(q)) continue;
    if (/<a\b/i.test(rawQ) || /<a\b/i.test(rawA)) continue;
    const answer = stripTags(rawA).trim();
    if (answer.length < 80 || !/[.!?]/.test(answer)) continue;
    out.push({ question: q, answer });
  }
  return out;
}

export function stripTags(s) {
  return s
    .replace(RX.scriptStyle, ' ')
    .replace(RX.tag, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&[a-z]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Visible body text only — used for word counts and answer-density checks. */
export function bodyText(html) {
  return stripTags(mainHtml(html));
}

/**
 * The page's actual content, with chrome removed.
 *
 * Site-wide nav and footer markup otherwise dominates every measurement: the
 * mega-menu alone contributes ~150 words and a stray <h4>, which made every
 * page look like it opened with a link list and had a broken heading order.
 */
export function mainHtml(html) {
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)?.[1] ?? html;
  const main = body.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i)?.[1];
  const scoped = main ?? body;
  return scoped
    // Only the site header is chrome. A <header> without a <nav> inside is an
    // in-content section header — and on this site that is where the h1 lives,
    // so stripping those made every page look like it had no h1 at all.
    // This must run before the <nav> pass, which would otherwise erase the very
    // marker used to tell the two kinds of header apart.
    .replace(/<header\b[\s\S]*?<\/header>/gi, (m) => (/<nav\b/i.test(m) ? ' ' : m))
    .replace(/<nav\b[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer\b[\s\S]*?<\/footer>/gi, ' ');
}

export function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

export function basics(html) {
  const canonicalTag = html.match(RX.canonical)?.[0] ?? null;
  return {
    title: html.match(RX.title)?.[1]?.trim() ?? null,
    lang: html.match(RX.lang)?.[1] ?? null,
    description: meta(html, 'description'),
    robots: meta(html, 'robots'),
    keywords: meta(html, 'keywords'),
    author: meta(html, 'author'),
    viewport: meta(html, 'viewport'),
    canonical: canonicalTag ? canonicalTag.match(RX.href)?.[1] ?? null : null,
    ogTitle: ogMeta(html, 'og:title'),
    ogDescription: ogMeta(html, 'og:description'),
    ogImage: ogMeta(html, 'og:image'),
    ogUrl: ogMeta(html, 'og:url'),
    twitterCard: meta(html, 'twitter:card'),
    charset: /<meta[^>]*charset=/i.test(html),
  };
}
