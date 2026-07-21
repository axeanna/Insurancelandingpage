// Live-site checks. Everything here talks to the real annaprudential.com so the
// dashboard reports what crawlers actually see, not what the local files say.

import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { SITE } from './audit.mjs';

const TIMEOUT = 15000;

async function fetchWithTimeout(url, opts = {}) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), opts.timeout ?? TIMEOUT);
  const started = Date.now();
  try {
    const res = await fetch(url, { ...opts, signal: ctrl.signal, redirect: opts.redirect ?? 'manual' });
    return { res, ms: Date.now() - started };
  } finally {
    clearTimeout(timer);
  }
}

export async function sitemapUrls(root) {
  const xml = await readFile(path.join(root, 'sitemap.xml'), 'utf8').catch(() => '');
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/** Fetches every sitemap URL and reports status, redirects and response time. */
export async function checkUrls(urls, concurrency = 6) {
  const results = [];
  const queue = [...urls];
  const workers = Array.from({ length: concurrency }, async () => {
    while (queue.length) {
      const url = queue.shift();
      try {
        const { res, ms } = await fetchWithTimeout(url);
        const body = res.status < 300 ? await res.text() : '';
        results.push({
          url,
          status: res.status,
          ms,
          redirect: res.headers.get('location'),
          bytes: body.length,
          noindex: /<meta[^>]*name=["']robots["'][^>]*noindex/i.test(body),
          // A canonical pointing somewhere else means this URL will never rank.
          canonical: body.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1] ?? null,
          ok: res.status === 200,
        });
      } catch (err) {
        results.push({ url, status: 0, ms: 0, error: String(err.message ?? err), ok: false });
      }
    }
  });
  await Promise.all(workers);
  return results.sort((a, b) => a.url.localeCompare(b.url));
}

// Hosts and CDNs increasingly block AI crawler user-agents at the edge by
// default. When that happens the site is invisible to ChatGPT/Perplexity/Claude
// no matter how permissive robots.txt is — so we test the real thing.
const BOTS = [
  { name: 'Googlebot', ua: 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)', engine: 'Google Search' },
  { name: 'Bingbot', ua: 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)', engine: 'Bing / Copilot' },
  { name: 'GPTBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; GPTBot/1.1; +https://openai.com/gptbot', engine: 'ChatGPT training' },
  { name: 'OAI-SearchBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot', engine: 'ChatGPT Search' },
  { name: 'ChatGPT-User', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ChatGPT-User/1.0; +https://openai.com/bot', engine: 'ChatGPT browsing' },
  { name: 'PerplexityBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot', engine: 'Perplexity' },
  { name: 'ClaudeBot', ua: 'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; ClaudeBot/1.0; +claudebot@anthropic.com', engine: 'Claude' },
  { name: 'Google-Extended', ua: 'Mozilla/5.0 (compatible; Google-Extended/1.0)', engine: 'Gemini grounding' },
  { name: 'Applebot', ua: 'Mozilla/5.0 (compatible; Applebot/0.1)', engine: 'Siri / Spotlight' },
  { name: 'Amazonbot', ua: 'Mozilla/5.0 (compatible; Amazonbot/0.1)', engine: 'Alexa' },
];

export async function checkBotAccess(site = SITE) {
  const out = [];
  await Promise.all(
    BOTS.map(async (bot) => {
      try {
        const { res, ms } = await fetchWithTimeout(site + '/', {
          headers: { 'User-Agent': bot.ua, Accept: 'text/html' },
          redirect: 'follow',
        });
        const body = await res.text();
        out.push({
          ...bot,
          status: res.status,
          ms,
          allowed: res.status === 200,
          // If a bot gets a near-empty shell, the content is client-rendered
          // and most crawlers will never see it.
          served: body.length,
          contentVisible: body.length > 3000,
        });
      } catch (err) {
        out.push({ ...bot, status: 0, allowed: false, error: String(err.message ?? err) });
      }
    })
  );
  return out.sort((a, b) => Number(b.allowed) - Number(a.allowed));
}

export async function checkEssentialFiles(site = SITE) {
  const files = ['/robots.txt', '/sitemap.xml', '/llms.txt', '/llms-full.txt', '/favicon.ico'];
  return Promise.all(
    files.map(async (f) => {
      try {
        const { res, ms } = await fetchWithTimeout(site + f, { redirect: 'follow' });
        return { file: f, status: res.status, ms, ok: res.status === 200 };
      } catch (err) {
        return { file: f, status: 0, ok: false, error: String(err.message ?? err) };
      }
    })
  );
}

// ---------- IndexNow ----------
// The one genuinely free, instant way to push URLs into an index. Bing, Yandex,
// Seznam and Naver all consume it; Google does not participate, but Bing feeds
// Copilot and ChatGPT's search layer, which is exactly the GEO surface we want.

export function makeIndexNowKey() {
  return [...crypto.getRandomValues(new Uint8Array(16))].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function ensureIndexNowKey(root) {
  const keyPath = path.join(root, 'seo-tool', 'data', 'indexnow-key.txt');
  let key = await readFile(keyPath, 'utf8').then((s) => s.trim()).catch(() => null);
  if (!key) {
    key = makeIndexNowKey();
    await writeFile(keyPath, key, 'utf8');
  }
  // The verification file must be reachable at the site root, so it lives in
  // the repo and ships with the next deploy.
  await writeFile(path.join(root, `${key}.txt`), key, 'utf8');
  return key;
}

export async function submitIndexNow(root, urls, site = SITE) {
  const key = await ensureIndexNowKey(root);
  const host = new URL(site).host;

  // Refuse to submit if the key file isn't actually live — IndexNow rejects the
  // whole batch and silently rate-limits repeat offenders.
  const probe = await fetchWithTimeout(`${site}/${key}.txt`, { redirect: 'follow' }).catch(() => null);
  const keyLive = probe?.res?.status === 200;
  if (!keyLive) {
    return {
      ok: false,
      key,
      keyLive: false,
      message: `Key file not live yet. Commit and deploy seo-tool's generated ${key}.txt to the site root, then submit again.`,
    };
  }

  const res = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host, key, keyLocation: `${site}/${key}.txt`, urlList: urls }),
  });
  return {
    ok: res.status === 200 || res.status === 202,
    key,
    keyLive: true,
    status: res.status,
    submitted: urls.length,
    message:
      res.status === 200 || res.status === 202
        ? `${urls.length} URLs submitted to IndexNow (Bing, Yandex, Seznam, Naver).`
        : `IndexNow returned ${res.status}. 422 usually means the key file does not match.`,
  };
}
