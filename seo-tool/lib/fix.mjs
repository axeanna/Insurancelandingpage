// Auto-fix engine.
//
// Hard rule: a fix may only rearrange, derive from, or mark up content that
// already exists on the page. Nothing here invents prose, claims, or figures —
// fabricated content on a licensed insurance site is a compliance problem, and
// search engines punish it anyway. Findings that need real writing stay in the
// report as work for a human.
//
// Every run is dry-run-able and reports the exact before/after per file.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import * as P from './parse.mjs';
import { SITE, findPages, urlPathFor, pageKind } from './audit.mjs';

const IN_HEAD = /(<head[^>]*>)/i;

function insertInHead(html, snippet) {
  if (IN_HEAD.test(html)) return html.replace(IN_HEAD, `$1\n${snippet}`);
  return snippet + '\n' + html;
}

function insertBeforeHeadClose(html, snippet) {
  if (/<\/head>/i.test(html)) return html.replace(/<\/head>/i, `${snippet}\n</head>`);
  return html + snippet;
}

function absoluteUrl(urlPath) {
  return SITE + urlPath;
}

function titleCase(slug) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((w) => (w.length <= 3 && w !== 'how' ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1)))
    .join(' ');
}

/** Derives a BreadcrumbList purely from the URL path — no guessing involved. */
function breadcrumbSchema(urlPath, pageTitle) {
  const segments = urlPath.split('/').filter(Boolean);
  const items = [{ '@type': 'ListItem', position: 1, name: 'Home', item: SITE + '/' }];
  let acc = '';
  segments.forEach((seg, i) => {
    acc += '/' + seg;
    const last = i === segments.length - 1;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: last && pageTitle ? pageTitle.split('|')[0].trim() : titleCase(seg),
      item: SITE + acc + '/',
    });
  });
  return { '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: items };
}

/**
 * Marks up genuine Q&A prose already on the page as FAQPage schema. Writes
 * nothing — the qualification rules live in parse.faqCandidates so the auditor
 * and the fixer can never disagree about what counts.
 */
function faqFromHeadings(html) {
  const found = P.faqCandidates(html);
  if (found.length < 3) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: found.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer.slice(0, 1200) },
    })),
  };
}

function ldBlock(obj) {
  return `<script type="application/ld+json">\n${JSON.stringify(obj, null, 2)}\n</script>`;
}

/** Best-effort description built from the page's own opening sentences. */
function deriveDescription(html) {
  const text = P.bodyText(html);
  if (text.length < 60) return null;
  const sentences = text.match(/[^.!?]+[.!?]/g) ?? [text];
  let out = '';
  for (const s of sentences) {
    if ((out + s).length > 155) break;
    out += s;
  }
  out = out.trim() || text.slice(0, 152);
  return out.length > 158 ? out.slice(0, 155).replace(/\s\S*$/, '') + '…' : out;
}

// ---------- per-page fixes ----------

export async function fixPage(root, file, { dryRun = true, enabled = null } = {}) {
  const original = await readFile(file, 'utf8');
  let html = original;
  const urlPath = urlPathFor(root, file);
  const rel = path.relative(root, file).split(path.sep).join('/');
  const applied = [];
  const on = (id) => !enabled || enabled.includes(id);

  // Utility files (404, verification) and redirect stubs are not content.
  // Giving them a self-canonical or breadcrumb schema is worse than doing
  // nothing — it tells engines to index a page that should never rank.
  const kind = pageKind(rel, html);
  if (kind !== 'content') return { file: rel, url: urlPath, applied: [], changed: false };

  const b = P.basics(html);

  if (on('charset-missing') && !b.charset) {
    html = insertInHead(html, '<meta charset="UTF-8">');
    applied.push({ id: 'charset-missing', what: 'Added <meta charset="UTF-8">' });
  }

  if (on('viewport-missing') && !b.viewport) {
    html = insertInHead(html, '<meta name="viewport" content="width=device-width, initial-scale=1.0">');
    applied.push({ id: 'viewport-missing', what: 'Added responsive viewport meta (mobile-friendly is a ranking factor)' });
  }

  if (on('lang-missing') && !b.lang) {
    html = html.replace(/<html\b([^>]*)>/i, (m, attrs) => `<html${attrs} lang="en-MY">`);
    applied.push({ id: 'lang-missing', what: 'Set lang="en-MY" on <html>' });
  }

  if (on('canonical-missing') && !b.canonical) {
    html = insertBeforeHeadClose(html, `<link rel="canonical" href="${absoluteUrl(urlPath)}">`);
    applied.push({ id: 'canonical-missing', what: `Added canonical → ${absoluteUrl(urlPath)}` });
  } else if (on('canonical-relative') && b.canonical && !b.canonical.startsWith('http')) {
    html = html.replace(/(<link[^>]*rel=["']canonical["'][^>]*href=["'])([^"']*)(["'])/i, `$1${absoluteUrl(urlPath)}$3`);
    applied.push({ id: 'canonical-relative', what: `Made canonical absolute → ${absoluteUrl(urlPath)}` });
  }

  if (on('desc-missing') && !b.description) {
    const desc = deriveDescription(html);
    if (desc) {
      html = insertBeforeHeadClose(html, `<meta name="description" content="${escapeAttr(desc)}">`);
      applied.push({ id: 'desc-missing', what: 'Added meta description derived from the page\'s own opening text', review: true });
    }
  }

  // Social meta: derived strictly from the title/description already present.
  const t = b.title ?? P.basics(html).title;
  const d = b.description ?? P.basics(html).description;
  if (on('og-title-missing') && !b.ogTitle && t) {
    html = insertBeforeHeadClose(html, `<meta property="og:title" content="${escapeAttr(t)}">`);
    applied.push({ id: 'og-title-missing', what: 'Added og:title from <title>' });
  }
  if (on('og-desc-missing') && !b.ogDescription && d) {
    html = insertBeforeHeadClose(html, `<meta property="og:description" content="${escapeAttr(d)}">`);
    applied.push({ id: 'og-desc-missing', what: 'Added og:description from meta description' });
  }
  if (on('og-image-missing') && !b.ogImage) {
    html = insertBeforeHeadClose(html, `<meta property="og:image" content="${SITE}/assets/hero_bg.webp">`);
    applied.push({ id: 'og-image-missing', what: 'Added og:image fallback so shared links render a preview' });
  }
  if (on('og-url-missing') && !b.ogUrl) {
    html = insertBeforeHeadClose(html, `<meta property="og:url" content="${absoluteUrl(urlPath)}">`);
    applied.push({ id: 'og-url-missing', what: 'Added og:url' });
  }
  if (on('twitter-card-missing') && !b.twitterCard) {
    html = insertBeforeHeadClose(html, '<meta name="twitter:card" content="summary_large_image">');
    applied.push({ id: 'twitter-card-missing', what: 'Added twitter:card' });
  }
  if (on('no-author') && !b.author) {
    html = insertBeforeHeadClose(html, '<meta name="author" content="Annabel Ong">');
    applied.push({ id: 'no-author', what: 'Added author meta (E-E-A-T signal)' });
  }

  // Lazy-load below-the-fold images only.
  //
  // "All but the first image" is the tempting rule and it is wrong: on this site
  // the nav logo comes first in source order, so that rule lazy-loaded the hero
  // background — the LCP element — making the exact metric it was meant to
  // improve worse. Everything up to and including the <h1> is above the fold, so
  // only images after it are safe to defer.
  if (on('img-not-lazy')) {
    const foldEnd = html.search(/<\/h1>/i);
    const cutoff = foldEnd === -1 ? 0 : foldEnd;
    let changed = 0;
    html = html.replace(/<img\b[^>]*>/gi, (tag, offset) => {
      if (offset < cutoff) return tag;
      if (/\bloading=/i.test(tag)) return tag;
      changed += 1;
      return tag.replace(/<img\b/i, '<img loading="lazy" decoding="async"');
    });
    if (changed) applied.push({ id: 'img-not-lazy', what: `Lazy-loaded ${changed} below-fold images (images above the <h1> stay eager to protect LCP)` });
  }

  const types = P.schemaTypes(html);

  if (on('breadcrumb-missing') && !types.includes('BreadcrumbList') && urlPath !== '/') {
    html = insertBeforeHeadClose(html, ldBlock(breadcrumbSchema(urlPath, t)));
    applied.push({ id: 'breadcrumb-missing', what: 'Generated BreadcrumbList schema from the URL structure' });
  }

  if (on('faq-not-marked-up') && !types.includes('FAQPage')) {
    const faq = faqFromHeadings(html);
    if (faq) {
      html = insertBeforeHeadClose(html, ldBlock(faq));
      applied.push({ id: 'faq-not-marked-up', what: `Marked up ${faq.mainEntity.length} existing Q&A sections as FAQPage schema (AEO)` });
    }
  }

  if (!dryRun && html !== original) await writeFile(file, html, 'utf8');
  return { file: rel, url: urlPath, applied, changed: html !== original };
}

function escapeAttr(s) {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

// ---------- site-level fixes ----------

const AI_BOTS = [
  ['GPTBot', 'OpenAI — ChatGPT training corpus'],
  ['OAI-SearchBot', 'OpenAI — ChatGPT Search index'],
  ['ChatGPT-User', 'OpenAI — live browsing on user request'],
  ['ClaudeBot', 'Anthropic — Claude'],
  ['Claude-Web', 'Anthropic — Claude browsing'],
  ['anthropic-ai', 'Anthropic — legacy agent'],
  ['PerplexityBot', 'Perplexity — index'],
  ['Perplexity-User', 'Perplexity — live fetch'],
  ['Google-Extended', 'Google — Gemini grounding & AI Overviews'],
  ['Googlebot', 'Google Search'],
  ['Bingbot', 'Bing — also feeds Copilot'],
  ['Applebot', 'Apple — Siri & Spotlight'],
  ['Applebot-Extended', 'Apple Intelligence'],
  ['Amazonbot', 'Amazon — Alexa'],
  ['Meta-ExternalAgent', 'Meta AI'],
  ['CCBot', 'Common Crawl — feeds most open LLM datasets'],
  ['cohere-ai', 'Cohere'],
  ['YouBot', 'You.com'],
  ['Bytespider', 'ByteDance / Doubao'],
  ['Diffbot', 'Diffbot knowledge graph'],
  ['omgili', 'Webz.io dataset'],
];

export async function fixRobots(root, { dryRun = true } = {}) {
  const file = path.join(root, 'robots.txt');
  const original = await readFile(file, 'utf8').catch(() => '');
  const lines = [
    '# robots.txt — annaprudential.com',
    '# Managed by seo-tool. Everything is intentionally open: this is a lead-gen',
    '# site, so being read by every search and answer engine is the whole point.',
    '',
    'User-agent: *',
    'Allow: /',
    '',
    '# Search & AI answer engines, listed explicitly. An explicit Allow is a',
    '# stronger, less ambiguous signal than relying on the wildcard above.',
  ];
  for (const [bot, why] of AI_BOTS) {
    lines.push('', `# ${why}`, `User-agent: ${bot}`, 'Allow: /');
  }
  lines.push('', `Sitemap: ${SITE}/sitemap.xml`, '');
  const next = lines.join('\n');
  const changed = next.trim() !== original.trim();
  if (!dryRun && changed) await writeFile(file, next, 'utf8');
  return { file: 'robots.txt', changed, applied: changed ? [{ id: 'ai-bots-unlisted', what: `Rewrote robots.txt with explicit Allow for ${AI_BOTS.length} crawlers + sitemap reference` }] : [] };
}

const PRIORITY = (url) => {
  if (url === '/') return '1.0';
  if (/^\/(blog|calculators|products)\/$/.test(url)) return '0.9';
  if (url.startsWith('/blog/')) return '0.8';
  if (url.startsWith('/calculators/')) return '0.8';
  return '0.7';
};

export async function fixSitemap(root, { dryRun = true } = {}) {
  const files = await findPages(root);
  const urls = [];
  for (const f of files) {
    const rel = path.relative(root, f).split(path.sep).join('/');
    const html = await readFile(f, 'utf8');
    if (pageKind(rel, html) !== 'content') continue;
    if (/<meta[^>]*name=["']robots["'][^>]*noindex/i.test(html)) continue;
    const urlPath = urlPathFor(root, f);
    // Real file mtime beats a hand-edited date — engines discount lastmod they
    // can tell is fabricated.
    const { mtime } = await import('node:fs/promises').then((fs) => fs.stat(f));
    urls.push({ loc: SITE + urlPath, lastmod: mtime.toISOString().slice(0, 10), priority: PRIORITY(urlPath) });
  }
  urls.sort((a, b) => Number(b.priority) - Number(a.priority) || a.loc.localeCompare(b.loc));

  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls.map((u) =>
      ['  <url>', `    <loc>${u.loc}</loc>`, `    <lastmod>${u.lastmod}</lastmod>`, `    <priority>${u.priority}</priority>`, '  </url>'].join('\n')
    ),
    '</urlset>',
    '',
  ].join('\n');

  const file = path.join(root, 'sitemap.xml');
  const original = await readFile(file, 'utf8').catch(() => '');
  const changed = xml.trim() !== original.trim();
  if (!dryRun && changed) await writeFile(file, xml, 'utf8');
  return { file: 'sitemap.xml', changed, count: urls.length, applied: changed ? [{ id: 'sitemap-incomplete', what: `Regenerated sitemap with all ${urls.length} indexable pages and real lastmod dates` }] : [] };
}

export async function runFixes(root, { dryRun = true, enabled = null } = {}) {
  const files = await findPages(root);
  const results = [];
  for (const f of files) {
    const r = await fixPage(root, f, { dryRun, enabled });
    if (r.applied.length) results.push(r);
  }
  const robots = await fixRobots(root, { dryRun });
  if (robots.applied.length) results.push({ ...robots, url: '/robots.txt' });
  // Sitemap runs last so it picks up any files the page fixes just touched.
  const sitemap = await fixSitemap(root, { dryRun });
  if (sitemap.applied.length) results.push({ ...sitemap, url: '/sitemap.xml' });

  return {
    dryRun,
    at: new Date().toISOString(),
    fileCount: results.length,
    fixCount: results.reduce((n, r) => n + r.applied.length, 0),
    results,
  };
}
