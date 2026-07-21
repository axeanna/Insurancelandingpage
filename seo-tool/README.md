# SEO / AEO / GEO Dashboard

Local control panel for annaprudential.com. No dependencies, no accounts, no cost.

## Running it

Double-click **SEO Dashboard** on your desktop. A black window opens (leave it
open) and your browser goes to <http://localhost:4321>. Closing the black window
stops the server.

From a terminal instead: `node seo-tool/server.mjs`

## What the tabs do

**Overview** — four scores plus a trend line. Scores are penalty-per-page, so
they stay comparable as the site grows.

**Findings** — every issue, grouped by type, filterable by lens and severity.
Anything tagged *auto-fixable* can be resolved by the Auto-optimise tab.

**Pages** — one row per page: word count, internal links, schema, issue counts.

**Live & Indexing** — fetches the real site. The important table is crawler
access: it sends actual Googlebot / GPTBot / ClaudeBot / PerplexityBot
user-agents and checks each one gets a real page. Hosts and CDNs often block AI
crawlers at the edge by default, which makes a site invisible to ChatGPT and
Perplexity no matter what robots.txt says. This tab also submits your URLs to
IndexNow (Bing, Yandex, Seznam, Naver — free and instant).

**Auto-optimise** — preview, then apply. Always preview first.

**Free traffic plan** — the ordered, zero-cost checklist. This is the tab that
actually matters; see below.

## What auto-optimise will and will not do

Fixes applied: missing canonicals (absolute), Open Graph and Twitter meta,
viewport, charset, `lang`, author meta, lazy-loading for below-fold images,
BreadcrumbList schema derived from the URL, FAQPage schema built from Q&A prose
already on the page, and full regeneration of `robots.txt` and `sitemap.xml`.

**It never invents content.** No fabricated descriptions, statistics, dates or
reviews. On a licensed insurance site that is a compliance problem, and search
engines penalise it regardless. Two guards exist because the naive versions
failed in testing:

- FAQ schema generation refuses anything ambiguous. An early version turned the
  blog index's article-card titles into fake "questions" with text scraped from
  neighbouring cards. Misleading structured data gets rich results revoked, so
  the rule now rejects linked headings, answers containing links, and CTA
  headings — and currently declines on every page rather than guess.
- Lazy-loading skips everything above the `<h1>`. "All but the first image" was
  the obvious rule and it was wrong: the nav logo comes first in source order, so
  that rule lazy-loaded the hero background — the LCP element — making the metric
  it was meant to improve worse.

Everything is under git. `git diff` shows exactly what changed; `git checkout .`
undoes all of it.

## The honest part

The audit engine cannot fix why the site is invisible.

The on-page work was already in good shape before this tool existed: every image
had alt text, 25 pages had FAQPage schema, structured data was rich, `llms.txt`
existed, robots.txt already welcomed AI crawlers, and all ten crawlers tested
receive the full page. The auto-fixer found 68 real but incremental
improvements — it moved the overall score from 81 to 83, not from 20 to 80.

The actual blocker is that annaprudential.com is a new domain with no inbound
links. Google will not rank a site it has barely crawled. ChatGPT, Gemini and
Perplexity can only cite pages that are indexed *and* corroborated elsewhere.
That is a distribution problem, and metadata cannot solve it.

So the Free traffic plan tab is not filler — it is the actual work. Search
Console submission, a Google Business Profile, `sameAs` entity linking, genuine
Reddit answers, and routing the existing 3.6K TikTok following to the site will
do more than every code fix in this tool combined.

## Files

```
seo-tool/
  server.mjs        HTTP server + JSON API
  lib/parse.mjs     HTML extraction (chrome-stripping lives here)
  lib/audit.mjs     check engine + scoring + page classification
  lib/fix.mjs       auto-fix engine
  lib/live.mjs      live fetches, crawler tests, IndexNow
  lib/growth.mjs    the free-traffic playbook
  public/           dashboard UI
  data/             score history, checklist state, IndexNow key (gitignored)
```

## IndexNow

The Live tab generates a key and writes `<key>.txt` to the site root. That file
must be committed and deployed before submission works — the tool checks this
and refuses to submit otherwise, because a failed batch gets rate-limited.
