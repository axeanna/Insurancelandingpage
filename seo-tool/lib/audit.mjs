// Audit engine: walks the site's HTML files and scores them across four lenses.
//
//   seo  — classic search: crawlability, metadata, structure, internal linking
//   aeo  — answer engines: can a machine lift a direct answer off this page
//   geo  — generative engines: is the page quotable, attributable, entity-clear
//   a11y — accessibility, which overlaps heavily with both of the above
//
// Every finding declares whether the auto-fixer can safely resolve it. Anything
// that would require inventing content is reported but never auto-written.

import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import * as P from './parse.mjs';
import { FIXABLE } from './fixable.mjs';

export const SITE = 'https://annaprudential.com';
export const CATEGORIES = ['seo', 'aeo', 'geo', 'a11y'];

const SEVERITY_WEIGHT = { critical: 10, warn: 4, info: 1 };

// Pages that exist purely as redirect stubs or utility files — auditing them
// as content pages produces noise, not signal.
const SKIP = [/^google[0-9a-f]+\.html$/i, /^404\.html$/i];

export async function findPages(root) {
  const out = [];
  async function walk(dir) {
    for (const entry of await readdir(dir, { withFileTypes: true })) {
      if (entry.name.startsWith('.') || entry.name === 'seo-tool' || entry.name === 'node_modules') continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) await walk(full);
      else if (entry.name.endsWith('.html')) out.push(full);
    }
  }
  await walk(root);
  return out.sort();
}

/** Maps a file path to the public URL path it will be served at. */
export function urlPathFor(root, file) {
  let rel = path.relative(root, file).split(path.sep).join('/');
  if (rel.endsWith('/index.html')) rel = rel.slice(0, -'index.html'.length);
  else if (rel === 'index.html') rel = '';
  return '/' + rel;
}

function isStub(html) {
  // The repo keeps short redirect stubs (e.g. products.html -> /products/).
  return html.length < 1200 && /http-equiv=["']refresh["']|location\.replace/i.test(html);
}

/**
 * Classifies a file so the auditor and the fixer agree on what to touch.
 *
 *   'content'  — a real page: audit it, fix it, list it in the sitemap
 *   'stub'     — a redirect shim: only its target and canonical matter
 *   'utility'  — 404 pages, verification files: never index, never rewrite
 *
 * Keeping this in one place matters: when the fixer disagreed with the auditor
 * it happily added a self-canonical and breadcrumb schema to 404.html.
 */
export function pageKind(rel, html) {
  if (SKIP.some((rx) => rx.test(rel))) return 'utility';
  if (isStub(html)) return 'stub';
  return 'content';
}

export async function auditPage(root, file) {
  const html = await readFile(file, 'utf8');
  const urlPath = urlPathFor(root, file);
  const rel = path.relative(root, file).split(path.sep).join('/');
  const findings = [];
  // fixable is derived, never asserted at the call site — see fixable.mjs.
  const add = (cat, sev, id, title, detail) =>
    findings.push({ cat, sev, id, title, detail, fixable: FIXABLE.has(id), page: urlPath, file: rel });

  const kind = pageKind(rel, html);
  if (kind === 'utility') return null;
  const stub = kind === 'stub';

  const b = P.basics(html);

  // Redirect stubs are infrastructure, not content. Auditing them for metadata
  // buries the real findings under dozens of meaningless ones — the only thing
  // that matters is that they point somewhere valid.
  if (stub) {
    const target = html.match(/url=([^"'\s>]+)/i)?.[1] ?? null;
    if (!target) add('seo', 'critical', 'stub-no-target', 'Redirect stub with no target', 'This page redirects nowhere.');
    if (!b.canonical) add('seo', 'warn', 'stub-no-canonical', 'Redirect stub without canonical', 'Should point at the destination so link equity passes through.');
    return { file: rel, url: urlPath, stub: true, words: 0, title: b.title, description: null, schemaTypes: [], headingCount: 0, imageCount: 0, internalLinks: 0, findings };
  }

  const hs = P.headings(P.mainHtml(html));
  const imgs = P.images(html);
  const ls = P.links(html);
  const { nodes: schema, errors: schemaErrors } = P.jsonld(html);
  const types = schema.flatMap((n) => [].concat(n['@type'] ?? []));
  const text = P.bodyText(html);
  const words = P.wordCount(text);

  // ---------- SEO: crawl & indexing fundamentals ----------
  if (!b.title) add('seo', 'critical', 'title-missing', 'No <title>', 'Search engines have nothing to show in results.');
  // Google truncates on pixel width, roughly 65 characters. Treat the 65-75
  // band as cosmetic and only warn once the tail is genuinely being cut.
  else if (b.title.length > 75) add('seo', 'warn', 'title-long', 'Title over 75 chars', `${b.title.length} chars — the end is cut off in results: "${b.title}"`);
  else if (b.title.length > 65) add('seo', 'info', 'title-longish', 'Title slightly over 65 chars', `${b.title.length} chars — the tail may be truncated on narrow results.`);
  else if (b.title.length < 25) add('seo', 'warn', 'title-short', 'Title under 25 chars', `Only ${b.title.length} chars — wasted ranking real estate.`);

  if (!b.description) add('seo', 'critical', 'desc-missing', 'No meta description', 'Google will invent a snippet, usually a bad one.');
  else if (b.description.length > 160) add('seo', 'warn', 'desc-long', 'Meta description over 160 chars', `${b.description.length} chars — will be cut off.`);
  else if (b.description.length < 70) add('seo', 'warn', 'desc-short', 'Meta description under 70 chars', `${b.description.length} chars — room to add a keyword and a reason to click.`);

  if (!b.canonical) add('seo', 'critical', 'canonical-missing', 'No canonical URL', 'Duplicate-content risk; consolidates ranking signals.');
  else if (!b.canonical.startsWith('http')) add('seo', 'warn', 'canonical-relative', 'Canonical is relative', `"${b.canonical}" should be an absolute https:// URL.`);

  if (!b.lang) add('seo', 'warn', 'lang-missing', 'No lang attribute on <html>', 'Hurts both accessibility and geo-targeting.');
  if (!b.viewport) add('seo', 'critical', 'viewport-missing', 'No viewport meta', 'Page fails mobile-friendly checks — a direct ranking factor.');
  if (!b.charset) add('seo', 'warn', 'charset-missing', 'No charset declaration', 'Risk of mojibake in titles and snippets.');
  if (b.robots && /noindex/i.test(b.robots)) add('seo', 'critical', 'noindex', 'Page is set to noindex', 'This page can never appear in search results.');

  if (!stub) {
    const h1s = hs.filter((h) => h.level === 1);
    if (h1s.length === 0) add('seo', 'critical', 'h1-missing', 'No <h1>', 'The single strongest on-page topic signal is absent.');
    else if (h1s.length > 1) add('seo', 'warn', 'h1-multiple', `${h1s.length} <h1> tags`, 'Dilutes the primary topic signal — keep exactly one.');

    // Skipped heading levels break both screen-reader navigation and the
    // section-extraction that answer engines rely on.
    let prev = 0;
    for (const h of hs) {
      if (prev && h.level > prev + 1) {
        add('a11y', 'info', 'heading-skip', `Heading jumps h${prev} → h${h.level}`, `At "${h.text.slice(0, 60)}" — screen readers announce a missing level. Cosmetic unless it repeats.`);
        break;
      }
      prev = h.level;
    }

    if (words < 300) add('seo', 'warn', 'thin-content', `Thin content (${words} words)`, 'Under ~300 words rarely ranks for competitive terms.');

    const internal = ls.filter((l) => l.internal && !l.href.startsWith('#'));
    if (internal.length < 4) add('seo', 'warn', 'few-internal-links', `Only ${internal.length} internal links`, 'Internal links spread crawl equity and help discovery.');
    const generic = ls.filter((l) => /^(click here|here|read more|learn more|link)$/i.test(l.text.trim()));
    if (generic.length) add('a11y', 'warn', 'generic-anchor', `${generic.length} vague link labels`, 'Anchor text like "click here" carries no keyword or context.');
  }

  // ---------- Social / sharing ----------
  if (!b.ogTitle) add('seo', 'warn', 'og-title-missing', 'No og:title', 'Shared links render without a headline.');
  if (!b.ogDescription) add('seo', 'warn', 'og-desc-missing', 'No og:description', 'Shared links render without a summary.');
  if (!b.ogImage) add('seo', 'warn', 'og-image-missing', 'No og:image', 'Shared links render as a bare grey card — kills click-through.');
  if (!b.ogUrl) add('seo', 'info', 'og-url-missing', 'No og:url', 'Helps platforms de-duplicate shares.');
  if (!b.twitterCard) add('seo', 'info', 'twitter-card-missing', 'No twitter:card', 'X/Twitter falls back to a small preview.');

  // ---------- Images ----------
  for (const img of imgs) {
    if (img.alt === null) add('a11y', 'critical', 'img-no-alt', 'Image missing alt', `${img.src ?? 'unknown src'} — invisible to screen readers and to image search.`);
  }
  // Must match the fixer's above-the-fold rule exactly, or the dashboard reports
  // findings that applying the fixes can never clear.
  const foldEnd = html.search(/<\/h1>/i);
  const notLazy = [...html.matchAll(/<img\b[^>]*>/gi)]
    .filter((m) => m.index > foldEnd)
    .filter((m) => !/\bloading=/i.test(m[0]));
  if (notLazy.length) add('seo', 'info', 'img-not-lazy', `${notLazy.length} below-fold images not lazy-loaded`, 'Eager loading below-fold images slows LCP, a ranking factor.');
  const unsized = imgs.filter((i) => !i.sized);
  if (unsized.length) add('seo', 'info', 'img-unsized', `${unsized.length} images without width/height`, 'Causes layout shift (CLS), which Google measures.');

  // ---------- Structured data ----------
  for (const err of schemaErrors) add('seo', 'critical', 'schema-invalid', 'Invalid JSON-LD', `Parse error: ${err}`);
  if (!stub && !types.length) add('geo', 'critical', 'schema-missing', 'No structured data', 'Without schema, engines must guess what this page is about.');
  // The homepage is the breadcrumb root, so it has no trail of its own.
  if (!stub && urlPath !== '/' && !types.includes('BreadcrumbList')) {
    add('seo', 'warn', 'breadcrumb-missing', 'No BreadcrumbList schema', 'Breadcrumbs appear in results and clarify site hierarchy.');
  }

  // ---------- AEO: is there a liftable answer ----------
  if (!stub) {
    const hasFaq = types.includes('FAQPage');
    const questionHeadings = hs.filter((h) => h.level >= 2 && /\?$/.test(h.text.trim()));
    // Only prose Q&A can be marked up safely, so distinguish the two cases:
    // pages with real answers are a one-click fix, pages whose "questions" are
    // card titles or CTAs need someone to actually write the answers.
    const canMarkUp = P.faqCandidates(html).length;
    if (!hasFaq && !questionHeadings.length) {
      add('aeo', 'critical', 'no-question-format', 'No questions on the page', 'Answer engines match user questions to question-shaped headings or FAQPage schema. Neither is present.');
    } else if (!hasFaq && canMarkUp >= 3) {
      add('aeo', 'warn', 'faq-not-marked-up', `${canMarkUp} answered questions not marked up`, 'Real Q&A prose is on the page but not machine-readable. Auto-optimise can mark this up.');
    } else if (!hasFaq && questionHeadings.length) {
      add('aeo', 'warn', 'faq-needs-answers', `${questionHeadings.length} question headings without answers`, 'These headings ask questions but the text under them is links or card titles, not answers. Write a direct one-sentence answer under each — that is the text AI engines quote.');
    }

    // A direct answer needs to sit in the first ~50 words after the question.
    const qAnswers = P.jsonld(html).nodes.filter((n) => n['@type'] === 'Question');
    const longAnswers = qAnswers.filter((q) => {
      const a = q.acceptedAnswer?.text ?? '';
      return P.wordCount(P.stripTags(a)) > 120;
    });
    if (longAnswers.length) add('aeo', 'info', 'answer-too-long', `${longAnswers.length} FAQ answers over 120 words`, 'Lead with a one-sentence answer, then elaborate — engines quote the first sentence.');

    const intro = text.slice(0, 400);
    if (words > 300 && !/\b(is|are|means|refers to|costs|works by)\b/i.test(intro)) {
      add('aeo', 'warn', 'no-definitional-lead', 'Opening does not define the topic', 'Start with a plain "X is …" sentence — this is the text engines quote.');
    }
  }

  // ---------- GEO: quotability and attribution ----------
  if (!stub) {
    if (!b.author && !types.includes('Person')) add('geo', 'warn', 'no-author', 'No author attribution', 'E-E-A-T: generative engines weight named, credentialed authors.');

    const hasDate = /datePublished|dateModified/.test(html);
    if (!hasDate) add('geo', 'warn', 'no-dates', 'No datePublished/dateModified', 'Engines strongly prefer content they can confirm is current.');

    // Concrete numbers are what actually gets quoted back to users.
    const stats = text.match(/\b\d+(\.\d+)?\s?%|\bRM\s?[\d,]+/g) ?? [];
    if (words > 400 && stats.length < 3) {
      add('geo', 'warn', 'few-citable-facts', `Only ${stats.length} concrete figures`, 'Pages with specific numbers (RM amounts, %) get cited far more often by AI answers.');
    }

    const cites = ls.filter((l) => l.external);
    if (words > 400 && !cites.length) {
      add('geo', 'warn', 'no-outbound-citations', 'No outbound citations', 'Linking to BNM, LIAM or Prudential sources raises trust scoring for both Google and LLMs.');
    }

    // A social link with no path goes to the platform's homepage, not a
    // profile. It sends visitors nowhere useful and gives search engines no
    // account to associate with the brand.
    const SOCIAL = /^https?:\/\/(?:www\.)?(tiktok|instagram|facebook|linkedin|youtube|threads|x|twitter)\.com\/?$/i;
    const placeholders = ls.filter((l) => SOCIAL.test(l.href.trim()));
    if (placeholders.length) {
      add('geo', 'critical', 'placeholder-social', `${placeholders.length} social links point to nothing`, `${placeholders.map((l) => l.href).join(', ')} — these go to the platform homepage, not your profile. Visitors who click are lost, and the links prove no entity connection.`);
    }

    if (!/annaprudential\.com/.test(html) && !stub) {
      add('geo', 'info', 'no-self-reference', 'No absolute self-reference', 'Naming your own domain and brand in-page reinforces entity association.');
    }
  }

  return {
    file: rel,
    url: urlPath,
    stub,
    words,
    title: b.title,
    description: b.description,
    schemaTypes: [...new Set(types)],
    headingCount: hs.length,
    imageCount: imgs.length,
    internalLinks: ls.filter((l) => l.internal).length,
    findings,
  };
}

/** Site-wide checks that only make sense once every page is known. */
export async function auditSite(root, pages) {
  const findings = [];
  const add = (cat, sev, id, title, detail) =>
    findings.push({ cat, sev, id, title, detail, fixable: FIXABLE.has(id), page: '(site)', file: '' });

  const read = async (f) => {
    try { return await readFile(path.join(root, f), 'utf8'); } catch { return null; }
  };

  const robots = await read('robots.txt');
  if (!robots) add('seo', 'critical', 'robots-missing', 'No robots.txt', 'Crawlers get a 404 on the first file they ask for.');
  else {
    if (!/Sitemap:/i.test(robots)) add('seo', 'critical', 'robots-no-sitemap', 'robots.txt does not link the sitemap', 'This is the primary way crawlers discover all your URLs.');
    const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended', 'Bingbot', 'Applebot-Extended', 'Meta-ExternalAgent', 'cohere-ai', 'YouBot', 'Amazonbot', 'Bytespider'];
    const missing = aiBots.filter((bot) => !new RegExp(`User-agent:\\s*${bot}`, 'i').test(robots));
    if (missing.length) add('geo', 'warn', 'ai-bots-unlisted', `${missing.length} AI crawlers not explicitly allowed`, `Missing: ${missing.join(', ')}. An explicit Allow is a clearer signal than relying on the wildcard.`);
  }

  const sitemap = await read('sitemap.xml');
  if (!sitemap) add('seo', 'critical', 'sitemap-missing', 'No sitemap.xml', 'Google has no map of your URLs.');
  else {
    const locs = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const sitemapPaths = new Set(locs.map((l) => l.replace(SITE, '') || '/'));
    const realPaths = pages.filter((p) => p && !p.stub).map((p) => p.url);
    const orphans = realPaths.filter((u) => !sitemapPaths.has(u));
    if (orphans.length) add('seo', 'critical', 'sitemap-incomplete', `${orphans.length} pages missing from sitemap`, `Google may never find: ${orphans.slice(0, 8).join(', ')}${orphans.length > 8 ? ' …' : ''}`);
    const dead = [...sitemapPaths].filter((u) => !realPaths.includes(u));
    if (dead.length) add('seo', 'warn', 'sitemap-stale', `${dead.length} sitemap URLs have no page`, `Wastes crawl budget: ${dead.slice(0, 5).join(', ')}`);
  }

  const llms = await read('llms.txt');
  if (!llms) add('geo', 'critical', 'llms-missing', 'No llms.txt', 'The emerging standard for telling LLMs what your site covers.');
  const llmsFull = await read('llms-full.txt');
  if (!llmsFull) add('geo', 'warn', 'llms-full-missing', 'No llms-full.txt', 'A single-file full-text dump that LLM crawlers ingest cheaply.');

  // Orphan detection: pages nothing links to are effectively invisible.
  const linked = new Set();
  for (const p of pages) {
    if (!p) continue;
    const html = await read(p.file);
    if (!html) continue;
    for (const l of P.links(html)) {
      if (!l.internal) continue;
      let href = l.href.replace(SITE, '').split('#')[0].split('?')[0];
      if (!href) continue;
      if (!href.startsWith('/')) {
        // A directory URL (/blog/) is its own base; dirname() would wrongly
        // resolve relative links against the parent, flagging linked pages
        // as orphans.
        const base = p.url.endsWith('/') ? p.url : path.posix.dirname(p.url) + '/';
        href = path.posix.normalize(path.posix.join(base, href));
      }
      href = href.replace(/index\.html$/, '');
      linked.add(href.endsWith('/') || href.includes('.') ? href : href + '/');
      linked.add(href);
    }
  }
  const orphaned = pages.filter((p) => p && !p.stub && p.url !== '/' && !linked.has(p.url) && !linked.has(p.url.replace(/\/$/, '')));
  if (orphaned.length) add('seo', 'warn', 'orphan-pages', `${orphaned.length} orphan pages`, `No internal link points here, so crawlers rank them poorly: ${orphaned.slice(0, 6).map((p) => p.url).join(', ')}`);

  // Duplicate metadata confuses which page should rank for a term.
  const dupe = (field, label) => {
    const seen = new Map();
    for (const p of pages) {
      if (!p || p.stub || !p[field]) continue;
      const list = seen.get(p[field]) ?? [];
      list.push(p.url);
      seen.set(p[field], list);
    }
    for (const [val, urls] of seen) {
      if (urls.length > 1) add('seo', 'warn', `dupe-${field}`, `Duplicate ${label} on ${urls.length} pages`, `"${String(val).slice(0, 70)}…" on ${urls.join(', ')} — they compete with each other.`);
    }
  };
  dupe('title', 'title');
  dupe('description', 'meta description');

  const home = pages.find((p) => p && p.url === '/');
  if (home && !home.schemaTypes.includes('WebSite')) add('seo', 'warn', 'no-website-schema', 'Homepage lacks WebSite schema', 'Needed for sitelinks search box and brand entity recognition.');
  if (home && !home.schemaTypes.some((t) => /Organization|InsuranceAgency|LocalBusiness/.test(t))) {
    add('geo', 'critical', 'no-org-schema', 'No Organization/LocalBusiness schema', 'This is the anchor for your entire brand entity in knowledge graphs.');
  }

  return findings;
}

/**
 * Scores are penalty-per-page, not raw issue counts.
 *
 * A 33-page site will always accumulate more findings than a 3-page one, and an
 * absolute total would punish the site for growing. Normalising means the score
 * answers "how healthy is a typical page here", which is the useful question and
 * stays comparable as pages are added.
 */
export function score(findings, pageCount = 1) {
  const pages = Math.max(1, pageCount);
  const out = {};
  for (const cat of CATEGORIES) {
    const penalty = findings
      .filter((f) => f.cat === cat)
      .reduce((sum, f) => sum + SEVERITY_WEIGHT[f.sev], 0) / pages;
    // ~1 critical per page lands near 60; a couple of info items barely register.
    out[cat] = Math.max(0, Math.min(100, Math.round(100 * Math.exp(-penalty / 14))));
  }
  out.overall = Math.round((out.seo + out.aeo + out.geo + out.a11y) / 4);
  return out;
}

export async function runAudit(root) {
  const files = await findPages(root);
  const pages = [];
  for (const f of files) pages.push(await auditPage(root, f));
  const live = pages.filter(Boolean);
  const siteFindings = await auditSite(root, live);
  const findings = [...live.flatMap((p) => p.findings), ...siteFindings];
  const pageCount = live.filter((p) => !p.stub).length;
  return {
    at: new Date().toISOString(),
    pageCount,
    pages: live,
    findings,
    scores: score(findings, pageCount),
  };
}
