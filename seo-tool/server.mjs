// Local dashboard server. No dependencies — Node 18+ only.
//   node seo-tool/server.mjs        (or double-click SEO-Dashboard.bat)

import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { exec } from 'node:child_process';
import { runAudit, SITE } from './lib/audit.mjs';
import { runFixes } from './lib/fix.mjs';
import { sitemapUrls, checkUrls, checkBotAccess, checkEssentialFiles, submitIndexNow, ensureIndexNowKey } from './lib/live.mjs';
import { PLAYBOOK, PHASES } from './lib/growth.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(HERE, 'data');
const PORT = Number(process.env.PORT ?? 4321);

await mkdir(DATA, { recursive: true });

// ---------- tiny persistence ----------
async function readJson(name, fallback) {
  try { return JSON.parse(await readFile(path.join(DATA, name), 'utf8')); } catch { return fallback; }
}
async function writeJson(name, value) {
  await writeFile(path.join(DATA, name), JSON.stringify(value, null, 2), 'utf8');
}

/** Keeps a rolling score history so trends are visible across runs. */
async function recordHistory(scores, findingCount) {
  const history = await readJson('history.json', []);
  history.push({ at: new Date().toISOString(), scores, findingCount });
  await writeJson('history.json', history.slice(-200));
  return history;
}

function gitInfo() {
  return new Promise((resolve) => {
    exec('git status --porcelain && echo "---" && git diff --stat', { cwd: ROOT, maxBuffer: 4 << 20 }, (err, stdout) => {
      if (err) return resolve({ available: false, output: '' });
      const [status = '', diff = ''] = stdout.split('---');
      resolve({ available: true, dirty: status.trim().split('\n').filter(Boolean), diff: diff.trim() });
    });
  });
}

// ---------- routes ----------
const routes = {
  'GET /api/audit': async () => {
    const result = await runAudit(ROOT);
    await recordHistory(result.scores, result.findings.length);
    await writeJson('last-audit.json', result);
    return result;
  },

  'GET /api/history': async () => ({ history: await readJson('history.json', []) }),

  'POST /api/fix': async (body) => {
    const before = await runAudit(ROOT);
    const result = await runFixes(ROOT, { dryRun: body.dryRun !== false, enabled: body.enabled ?? null });
    if (body.dryRun === false) {
      const after = await runAudit(ROOT);
      await recordHistory(after.scores, after.findings.length);
      result.scoreBefore = before.scores;
      result.scoreAfter = after.scores;
      result.git = await gitInfo();
    } else {
      result.scoreBefore = before.scores;
    }
    return result;
  },

  'GET /api/live': async () => {
    const urls = await sitemapUrls(ROOT);
    const [pages, bots, files] = await Promise.all([
      checkUrls(urls),
      checkBotAccess(SITE),
      checkEssentialFiles(SITE),
    ]);
    const key = await ensureIndexNowKey(ROOT);
    return { site: SITE, pages, bots, files, indexNowKey: key, checkedAt: new Date().toISOString() };
  },

  'POST /api/indexnow': async () => {
    const urls = await sitemapUrls(ROOT);
    return submitIndexNow(ROOT, urls, SITE);
  },

  'GET /api/growth': async () => ({
    playbook: PLAYBOOK,
    phases: PHASES,
    done: await readJson('growth-done.json', {}),
  }),

  'POST /api/growth': async (body) => {
    const done = await readJson('growth-done.json', {});
    done[body.id] = body.done ? new Date().toISOString() : null;
    await writeJson('growth-done.json', done);
    return { done };
  },

  'GET /api/git': async () => gitInfo(),
};

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const key = `${req.method} ${url.pathname}`;

  if (routes[key]) {
    let body = {};
    if (req.method === 'POST') {
      const chunks = [];
      for await (const c of req) chunks.push(c);
      try { body = JSON.parse(Buffer.concat(chunks).toString() || '{}'); } catch { body = {}; }
    }
    try {
      const data = await routes[key](body);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    } catch (err) {
      console.error(`[${key}]`, err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: String(err.stack ?? err) }));
    }
    return;
  }

  // Static: the dashboard itself.
  const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  const full = path.join(HERE, 'public', file);
  if (!full.startsWith(path.join(HERE, 'public'))) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  try {
    const content = await readFile(full);
    const ext = path.extname(full);
    const mime = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' }[ext] ?? 'text/plain';
    res.writeHead(200, { 'Content-Type': `${mime}; charset=utf-8`, 'Cache-Control': 'no-store' });
    res.end(content);
  } catch {
    res.writeHead(404, { 'Content-Type': 'text/plain' }).end('Not found');
  }
});

server.listen(PORT, () => {
  const url = `http://localhost:${PORT}`;
  console.log(`\n  SEO / AEO / GEO dashboard  →  ${url}`);
  console.log(`  Auditing: ${ROOT}`);
  console.log(`  Live site: ${SITE}\n  Ctrl+C to stop.\n`);
  if (!process.env.NO_OPEN) {
    const cmd = process.platform === 'win32' ? `start "" "${url}"` : process.platform === 'darwin' ? `open "${url}"` : `xdg-open "${url}"`;
    exec(cmd);
  }
});
