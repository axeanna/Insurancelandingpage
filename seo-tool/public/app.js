'use strict';

const $ = (sel) => document.querySelector(sel);
const el = (tag, cls, html) => {
  const n = document.createElement(tag);
  if (cls) n.className = cls;
  if (html != null) n.innerHTML = html;
  return n;
};
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

let audit = null;
let liveData = null;

async function api(path, body) {
  const res = await fetch(path, body ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) } : {});
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? res.statusText);
  return res.json();
}

function setStatus(msg) { $('#status').textContent = msg; }

// ---------- tabs ----------
document.querySelectorAll('[role="tab"]').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('[role="tab"]').forEach((t) => {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      $('#' + t.getAttribute('aria-controls')).hidden = !on;
    });
  });
});

// ---------- scores ----------
const band = (n) => (n >= 85 ? 'good' : n >= 60 ? 'mid' : 'bad');

function renderScores(scores) {
  const labels = { overall: 'Overall', seo: 'SEO', aeo: 'AEO', geo: 'GEO', a11y: 'Accessibility' };
  $('#scores').innerHTML = '';
  for (const [k, label] of Object.entries(labels)) {
    const v = scores[k] ?? 0;
    const b = band(v);
    const card = el('div', 'score');
    card.innerHTML = `<div class="val g-${b}">${v}</div><div class="label">${label}</div><div class="bar"><i class="b-${b}" style="width:${v}%"></i></div>`;
    $('#scores').append(card);
  }
}

// ---------- findings ----------
function renderFindings() {
  if (!audit) return;
  const cat = $('#filterCat').value;
  const sev = $('#filterSev').value;
  const fixOnly = $('#filterFixable').checked;
  const order = { critical: 0, warn: 1, info: 2 };

  const list = audit.findings
    .filter((f) => (!cat || f.cat === cat) && (!sev || f.sev === sev) && (!fixOnly || f.fixable))
    .sort((a, b) => order[a.sev] - order[b.sev] || a.id.localeCompare(b.id));

  // Group identical issues across pages so the list stays readable.
  const groups = new Map();
  for (const f of list) {
    const g = groups.get(f.id) ?? { ...f, pages: [] };
    g.pages.push(f.page);
    groups.set(f.id, g);
  }

  $('#findingCount').textContent = `${list.length} findings across ${groups.size} issue types`;
  const box = $('#findings');
  box.innerHTML = '';
  if (!groups.size) {
    box.append(el('p', 'empty', 'Nothing matches these filters.'));
    return;
  }
  for (const g of groups.values()) {
    const node = el('div', `finding ${g.sev}`);
    node.innerHTML = `
      <h3>
        <span class="tag ${g.cat}">${g.cat}</span>
        ${esc(g.title)}
        ${g.pages.length > 1 ? `<span class="muted">× ${g.pages.length} pages</span>` : ''}
        ${g.fixable ? '<span class="tag fix">auto-fixable</span>' : ''}
      </h3>
      <p>${esc(g.detail)}</p>
      <div class="where">${esc(g.pages.slice(0, 6).join('  ·  '))}${g.pages.length > 6 ? `  · +${g.pages.length - 6} more` : ''}</div>`;
    box.append(node);
  }
}
['#filterCat', '#filterSev', '#filterFixable'].forEach((s) => $(s).addEventListener('change', renderFindings));

// ---------- pages ----------
function renderPages() {
  const rows = audit.pages.filter((p) => !p.stub).map((p) => {
    const crit = p.findings.filter((f) => f.sev === 'critical').length;
    const warn = p.findings.filter((f) => f.sev === 'warn').length;
    return `<tr>
      <td class="wrap"><strong>${esc(p.url)}</strong><br><span class="muted">${esc((p.title ?? '—').slice(0, 70))}</span></td>
      <td>${p.words}</td>
      <td>${p.internalLinks}</td>
      <td class="wrap"><span class="muted">${esc(p.schemaTypes.slice(0, 5).join(', ') || 'none')}</span></td>
      <td>${crit ? `<span class="pill bad">${crit}</span>` : '<span class="pill ok">0</span>'}</td>
      <td>${warn ? `<span class="pill mid">${warn}</span>` : '<span class="pill ok">0</span>'}</td>
    </tr>`;
  });
  $('#pages').innerHTML = `<table><thead><tr><th>Page</th><th>Words</th><th>Links</th><th>Schema</th><th>Critical</th><th>Warnings</th></tr></thead><tbody>${rows.join('')}</tbody></table>`;
}

// ---------- history ----------
async function renderHistory() {
  const { history } = await api('/api/history');
  const box = $('#history');
  if (history.length < 2) {
    box.innerHTML = '<p class="empty">Run the audit a few times — the trend appears here.</p>';
    return;
  }
  const recent = history.slice(-40);
  box.innerHTML = `<div class="spark">${recent.map((h) => `<i style="height:${Math.max(2, h.scores.overall)}%" title="${new Date(h.at).toLocaleString()} — ${h.scores.overall}"></i>`).join('')}</div>
    <p class="muted">Overall score, last ${recent.length} runs. Now ${recent.at(-1).scores.overall}, was ${recent[0].scores.overall}.</p>`;
}

// ---------- run audit ----------
async function runAudit() {
  setStatus('Auditing…');
  $('#runAudit').disabled = true;
  try {
    audit = await api('/api/audit');
    renderScores(audit.scores);
    renderFindings();
    renderPages();
    await renderHistory();
    setStatus(`${audit.pageCount} pages · ${audit.findings.length} findings · ${new Date(audit.at).toLocaleTimeString()}`);
  } catch (err) {
    setStatus('Audit failed: ' + err.message);
  } finally {
    $('#runAudit').disabled = false;
  }
}
$('#runAudit').addEventListener('click', runAudit);

// ---------- live ----------
$('#runLive').addEventListener('click', async () => {
  const btn = $('#runLive');
  btn.disabled = true;
  setStatus('Fetching the live site…');
  try {
    liveData = await api('/api/live');
    $('#inKey').textContent = liveData.indexNowKey + '.txt';

    $('#bots').innerHTML = `<div class="tablewrap"><table><thead><tr><th>Crawler</th><th>Powers</th><th>Status</th><th>Sees content</th><th>Time</th></tr></thead><tbody>${
      liveData.bots.map((b) => `<tr>
        <td><strong>${esc(b.name)}</strong></td>
        <td class="muted">${esc(b.engine)}</td>
        <td>${b.allowed ? '<span class="pill ok">allowed</span>' : `<span class="pill bad">blocked ${b.status || ''}</span>`}</td>
        <td>${b.allowed ? (b.contentVisible ? `<span class="pill ok">${(b.served / 1024).toFixed(0)} KB</span>` : '<span class="pill mid">thin</span>') : '—'}</td>
        <td class="muted">${b.ms ?? '—'} ms</td>
      </tr>`).join('')}</tbody></table></div>`;

    $('#files').innerHTML = `<div class="tablewrap"><table><thead><tr><th>File</th><th>Status</th><th>Time</th></tr></thead><tbody>${
      liveData.files.map((f) => `<tr><td><code>${esc(f.file)}</code></td><td>${f.ok ? '<span class="pill ok">200</span>' : `<span class="pill bad">${f.status || 'error'}</span>`}</td><td class="muted">${f.ms ?? '—'} ms</td></tr>`).join('')}</tbody></table></div>`;

    const bad = liveData.pages.filter((p) => !p.ok || p.noindex).length;
    $('#liveUrls').innerHTML = `<p class="muted">${liveData.pages.length} URLs from sitemap.xml · ${bad} with problems</p>
      <table><thead><tr><th>URL</th><th>Status</th><th>Time</th><th>Size</th><th>Indexable</th></tr></thead><tbody>${
      liveData.pages.map((p) => `<tr>
        <td class="wrap">${esc(p.url.replace(liveData.site, '') || '/')}</td>
        <td>${p.ok ? '<span class="pill ok">200</span>' : `<span class="pill bad">${p.status || 'err'}</span>`}</td>
        <td class="muted">${p.ms} ms</td>
        <td class="muted">${p.bytes ? (p.bytes / 1024).toFixed(0) + ' KB' : '—'}</td>
        <td>${p.noindex ? '<span class="pill bad">noindex</span>' : '<span class="pill ok">yes</span>'}</td>
      </tr>`).join('')}</tbody></table>`;

    setStatus(`Live check done · ${bad} URL problems`);
  } catch (err) {
    setStatus('Live check failed: ' + err.message);
  } finally {
    btn.disabled = false;
  }
});

$('#runIndexNow').addEventListener('click', async () => {
  const btn = $('#runIndexNow');
  btn.disabled = true;
  $('#indexnowResult').innerHTML = '<p class="muted">Submitting…</p>';
  try {
    const r = await api('/api/indexnow', {});
    $('#indexnowResult').innerHTML = `<p class="${r.ok ? '' : 'warnbox'}" style="margin-top:12px">${r.ok ? '✓ ' : ''}${esc(r.message)}</p>`;
  } catch (err) {
    $('#indexnowResult').innerHTML = `<p class="warnbox" style="margin-top:12px">${esc(err.message)}</p>`;
  } finally {
    btn.disabled = false;
  }
});

// ---------- auto-optimise ----------
function renderFix(r, applied) {
  const box = $('#fixResult');
  if (!r.fixCount) {
    box.innerHTML = '<p class="empty">Nothing to auto-fix — every deterministic issue is already resolved. Remaining findings need real writing; see the Findings tab.</p>';
    $('#applyFix').disabled = true;
    return;
  }
  const scoreLine = applied && r.scoreAfter
    ? `<p><strong>Overall score ${r.scoreBefore.overall} → ${r.scoreAfter.overall}</strong> (SEO ${r.scoreBefore.seo}→${r.scoreAfter.seo} · AEO ${r.scoreBefore.aeo}→${r.scoreAfter.aeo} · GEO ${r.scoreBefore.geo}→${r.scoreAfter.geo} · A11y ${r.scoreBefore.a11y}→${r.scoreAfter.a11y})</p>`
    : '';

  box.innerHTML = `
    <h2 style="margin-top:18px">${applied ? 'Applied' : 'Preview'}: ${r.fixCount} fixes across ${r.fileCount} files</h2>
    ${scoreLine}
    ${applied ? '<p class="muted">Run <code>git diff</code> to inspect, <code>git checkout .</code> to undo everything, then commit and deploy.</p>' : '<p class="muted">Nothing has been written yet.</p>'}
    ${r.results.map((f) => `<div class="finding info">
      <h3><code>${esc(f.url ?? f.file)}</code></h3>
      ${f.applied.map((a) => `<p>• ${esc(a.what)}${a.review ? ' <span class="tag" style="color:var(--warn)">review this</span>' : ''}</p>`).join('')}
    </div>`).join('')}
    ${applied && r.git?.diff ? `<h2 style="margin-top:18px">Changed files</h2><pre class="diff">${esc(r.git.diff)}</pre>` : ''}`;
  $('#applyFix').disabled = applied;
}

$('#previewFix').addEventListener('click', async () => {
  setStatus('Previewing fixes…');
  try {
    const r = await api('/api/fix', { dryRun: true });
    renderFix(r, false);
    $('#applyFix').disabled = !r.fixCount;
    setStatus(`${r.fixCount} fixes available`);
  } catch (err) { setStatus('Preview failed: ' + err.message); }
});

$('#applyFix').addEventListener('click', async () => {
  if (!confirm('This rewrites HTML files in your project. Everything is under git, so you can undo with "git checkout .". Continue?')) return;
  setStatus('Applying fixes…');
  try {
    const r = await api('/api/fix', { dryRun: false });
    renderFix(r, true);
    audit = await api('/api/audit');
    renderScores(audit.scores);
    renderFindings();
    renderPages();
    await renderHistory();
    setStatus(`Applied ${r.fixCount} fixes`);
  } catch (err) { setStatus('Apply failed: ' + err.message); }
});

// ---------- growth playbook ----------
async function renderGrowth() {
  const { playbook, phases, done } = await api('/api/growth');
  const box = $('#growth');
  box.innerHTML = '';

  const completed = playbook.filter((t) => done[t.id]).length;
  $('#growthProgress').innerHTML = `<p class="muted" style="margin-top:12px">${completed} of ${playbook.length} done</p>
    <div class="progressbar"><i style="width:${(completed / playbook.length) * 100}%"></i></div>`;

  for (const phase of phases) {
    const tasks = playbook.filter((t) => t.phase === phase);
    if (!tasks.length) continue;
    box.append(el('div', 'phase', esc(phase)));
    for (const t of tasks) {
      const isDone = Boolean(done[t.id]);
      const card = el('div', `card task ${isDone ? 'done' : ''}`);
      card.innerHTML = `
        <input type="checkbox" id="t-${t.id}" ${isDone ? 'checked' : ''} aria-label="Mark done: ${esc(t.title)}">
        <div class="task-body">
          <h3><label for="t-${t.id}">${esc(t.title)}</label>
            <span class="impact ${t.impact}">${t.impact}</span>
            <span class="muted">~${t.minutes} min · free</span></h3>
          <p class="why">${esc(t.why)}</p>
          <p class="how"><strong>How:</strong> ${esc(t.how)}</p>
          ${t.link ? `<p class="how"><a href="${esc(t.link)}" target="_blank" rel="noopener">${esc(t.link)}</a></p>` : ''}
        </div>`;
      card.querySelector('input').addEventListener('change', async (e) => {
        await api('/api/growth', { id: t.id, done: e.target.checked });
        renderGrowth();
      });
      box.append(card);
    }
  }
}

// ---------- boot ----------
renderGrowth();
runAudit();
