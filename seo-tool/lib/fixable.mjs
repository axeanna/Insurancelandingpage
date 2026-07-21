// The single source of truth for which findings the fixer can actually resolve.
//
// This lives in its own module because audit.mjs must read it and fix.mjs
// imports audit.mjs — putting it in either one creates a cycle. It exists at all
// because flagging findings as "auto-fixable" by hand drifted: the dashboard
// advertised fixes for issues no handler implemented, so the button promised 27
// fixes and delivered zero.
//
// Add an id here only when fix.mjs genuinely handles it.
export const FIXABLE = new Set([
  'charset-missing',
  'viewport-missing',
  'lang-missing',
  'canonical-missing',
  'canonical-relative',
  'desc-missing',
  'og-title-missing',
  'og-desc-missing',
  'og-image-missing',
  'og-url-missing',
  'twitter-card-missing',
  'no-author',
  'img-not-lazy',
  'breadcrumb-missing',
  'faq-not-marked-up',
  'ai-bots-unlisted',
  'robots-missing',
  'robots-no-sitemap',
  'sitemap-missing',
  'sitemap-incomplete',
  'sitemap-stale',
]);
