/* main.js — nav, animations, FAQ, modals, shared lead helpers */
(function () {
  'use strict';

  // Mobile nav.
  // Uses one delegated click handler on the menu container. The previous version
  // relied on the selector `.nav-links a:not(.nav-drop > a)`, whose child
  // combinator inside :not() is invalid in some mobile browsers — querySelectorAll
  // then throws, aborting the whole script (which is why the Products sub-menu,
  // and other scripted features, could silently stop working).
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    function closeMenu() {
      toggle.classList.remove('open');
      links.classList.remove('open');
      var open = links.querySelectorAll('.nav-drop.open');
      for (var i = 0; i < open.length; i++) open[i].classList.remove('open');
      document.body.style.overflow = '';
    }
    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var willOpen = !links.classList.contains('open');
      toggle.classList.toggle('open', willOpen);
      links.classList.toggle('open', willOpen);
      document.body.style.overflow = willOpen ? 'hidden' : '';
    });
    links.addEventListener('click', function (e) {
      if (window.innerWidth > 992) return;
      var link = e.target.closest ? e.target.closest('a') : null;
      if (!link) return;
      var drop = link.parentElement;
      // A section header that owns a sub-panel (Products, etc.): toggle the
      // panel open instead of navigating away.
      if (drop && drop.classList.contains('nav-drop') && link === drop.querySelector('a')) {
        e.preventDefault();
        drop.classList.toggle('open');
        return;
      }
      // Any real link: let it navigate and close the menu behind it.
      closeMenu();
    });
  }

  // Sticky mobile CTA on product detail pages (/products/<slug>/) so phone
  // visitors always have Book / WhatsApp one tap away — they often don't scroll
  // far enough to reach the in-page CTA band.
  if (/^\/products\/[^\/]+\/?$/.test(location.pathname)) {
    var mbar = document.createElement('div');
    mbar.className = 'mobile-cta-bar';
    mbar.innerHTML =
      '<a class="mcta-book" href="/#connect">Book Consultation</a>' +
      '<a class="mcta-wa" href="https://wa.me/60183176361" target="_blank" rel="noopener">WhatsApp</a>';
    document.body.appendChild(mbar);
    document.body.classList.add('has-mobile-cta');
  }

  // Scroll-in animations
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('active'); observer.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll('.fade-in').forEach(function (el) { observer.observe(el); });

  // FAQ accordions
  document.querySelectorAll('.faq-q').forEach(function (btn) {
    btn.addEventListener('click', function () {
      btn.parentElement.classList.toggle('open');
    });
  });

  // Modals: click backdrop or press Esc to dismiss.
  // Gate modals carry .modal-locked and can only be closed by completing the
  // form — do not add that class to anything informational.
  document.querySelectorAll('.modal:not(.modal-locked)').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active:not(.modal-locked)').forEach(function (m) { m.classList.remove('active'); });
    }
  });

  // Range slider fill sync
  document.querySelectorAll('input[type="range"]').forEach(function (sl) {
    function sync() {
      var pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
      sl.style.setProperty('--val', pct + '%');
    }
    sl.addEventListener('input', sync);
    sync();
  });
})();

/* Shared lead-capture helper (webhook to Google Sheets) */
var LEAD_WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec";

/* Demo mode: visit any page with ?demo=1 to disable all lead gates and show
 * results directly (for live demos); ?demo=0 turns it back off. The flag
 * persists in localStorage so it survives navigation. Demo sessions never
 * write to the lead sheet. */
(function () {
  try {
    var demo = new URLSearchParams(window.location.search).get('demo');
    if (demo === '1') localStorage.setItem('anna_demo', '1');
    if (demo === '0') localStorage.removeItem('anna_demo');
  } catch (e) { /* private mode etc. — gates simply behave normally */ }
})();

function isDemoMode() {
  try { return localStorage.getItem('anna_demo') === '1'; } catch (e) { return false; }
}

function sendLead(fields) {
  if (isDemoMode()) {
    console.log('[demo] lead suppressed:', fields);
    return Promise.resolve();
  }
  var params = new URLSearchParams();
  Object.keys(fields).forEach(function (k) { params.append(k, fields[k]); });
  // keepalive lets the request finish even if the user navigates away
  return fetch(LEAD_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', keepalive: true, body: params })
    .catch(function (err) { console.error('Lead webhook error:', err); });
}

/* Malaysian mobile number check: accepts 01X-XXXXXXX(X) with or without +60,
 * spaces or dashes. Returns the normalised 01… form, or null if invalid. */
function validMalaysianPhone(raw) {
  var d = String(raw).replace(/\D/g, '');
  if (d.indexOf('60') === 0) d = '0' + d.slice(2);
  if (d.indexOf('1') === 0) d = '0' + d;
  return /^01\d{8,9}$/.test(d) ? d : null;
}

/* Replaces a results container with the sent-confirmation. The results email is
 * sent automatically and immediately by the Google Apps Script webhook (from
 * annacakapinsurans@gmail.com via a verified alias), so "sent to your inbox" is
 * a true statement by the time this shows, not a promise. Numbers still land in
 * the lead sheet regardless. */
function showLeadConfirmation(sectionId, name, email, phone) {
  var section = document.getElementById(sectionId);
  if (!section) return;
  section.innerHTML =
    '<div class="card" style="text-align:center; padding:36px 28px;">' +
      '<div style="font-size:2.2rem;">📩</div>' +
      '<h3 style="margin:10px 0 6px;">Your results have been sent to your inbox!</h3>' +
      '<p style="margin:0 0 6px;">Thank you, ' + escapeHtml(name) + '. Your personalised results are on their way to <strong>' + escapeHtml(email) + '</strong> — take a look at your inbox now.</p>' +
      '<p class="sub" style="margin:0 0 18px;">Can’t find it? Check your spam or promotions folder, or message Annabel and she’ll resend it.</p>' +
      '<a class="btn btn-primary" target="_blank" rel="noopener" href="https://wa.me/60183176361?text=' +
        encodeURIComponent('Hi Annabel, I just used the calculator on annaprudential.com — can you send me my results?') +
      '">WhatsApp Annabel</a>' +
    '</div>';
  section.style.display = 'block';
  setTimeout(function () { section.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 80);
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
  });
}

function fmtRM(n) {
  return 'RM ' + Math.round(n).toLocaleString('en-MY');
}

function getNum(id) {
  var el = document.getElementById(id);
  if (!el) return 0;
  return parseFloat(String(el.value).replace(/,/g, '')) || 0;
}

function animateValue(id, target, prefix) {
  var el = document.getElementById(id);
  if (!el) return;
  prefix = prefix === undefined ? 'RM ' : prefix;
  var duration = 1200, start = null;
  function ease(t) { return 1 - Math.pow(1 - t, 3); }
  function frame(ts) {
    if (!start) start = ts;
    var p = Math.min((ts - start) / duration, 1);
    el.textContent = prefix + Math.round(target * ease(p)).toLocaleString('en-MY');
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

/* Timed lead-capture popup — "second opinion" offer.
 * Appears once per session, 10s after the page loads, on content pages
 * (skipped on /calculators/*, which already have their own lead gate, and in
 * demo mode). Collects name + email + explicit consent, records to the lead
 * sheet via sendLead — including the page it fired on. Fully dismissable.
 *
 * The copy offers something before asking for anything, which converts better
 * than scarcity alone. Note what it deliberately does NOT claim: not that
 * Annabel pays claims (Prudential does), and not how fast a payout arrives —
 * there is a survival period and a claims assessment, both documented on
 * /faq/. The contrast being drawn is the payout TRIGGER (late stage vs early
 * stage), which is accurate and is the actual argument. Keep it that way. */
(function () {
  if (typeof isDemoMode === 'function' && isDemoMode()) return;
  if (/^\/calculators\//.test(location.pathname)) return;
  try {
    if (localStorage.getItem('anna_lead_captured') === '1') return;
    if (sessionStorage.getItem('anna_popup_seen') === '1') return;
  } catch (e) { /* storage blocked — just proceed */ }

  setTimeout(function () {
    try { sessionStorage.setItem('anna_popup_seen', '1'); } catch (e) {}

    var modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'lead-popup';
    modal.innerHTML =
      '<div class="modal-box">' +
        '<button class="modal-close" id="lp-close" aria-label="Close">\u2715</button>' +
        '<h3>Already have critical illness cover?</h3>' +
        '<p class="sub">Most policies written before 2015 only pay once an illness reaches late stage \u2014 so you could be diagnosed and still wait years for a payout. Modern plans can pay from early stage, much closer to diagnosis. Leave your email and I\u2019ll tell you what to check in yours.</p>' +
        '<div class="field"><label for="lp-name">Full Name</label><input type="text" id="lp-name" placeholder="Your name" autocomplete="name"><p class="err" id="lp-name-err">Please enter your name.</p></div>' +
        '<div class="field"><label for="lp-email">Email</label><input type="email" id="lp-email" placeholder="you@email.com" autocomplete="email"><p class="err" id="lp-email-err">Please enter a valid email.</p></div>' +
        '<label class="consent"><input type="checkbox" id="lp-consent"><span>I consent to sharing my data with annaprudential.com.</span></label>' +
        '<button class="btn btn-primary" id="lp-submit" disabled style="width:100%;">Get my second opinion</button>' +
        '<p id="lp-success" style="display:none; color:#23A455; font-weight:600; margin-top:12px; text-align:center;">\u2713 On its way. I\u2019ll be in touch with what to look for.</p>' +
      '</div>';
    document.body.appendChild(modal);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    function close() {
      modal.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(function () { if (modal.parentNode) modal.parentNode.removeChild(modal); }, 200);
    }
    document.getElementById('lp-close').addEventListener('click', close);
    modal.addEventListener('click', function (e) { if (e.target === modal) close(); });
    document.addEventListener('keydown', function esc(e) {
      if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
    });

    var consent = document.getElementById('lp-consent');
    var submit = document.getElementById('lp-submit');
    consent.addEventListener('change', function () { submit.disabled = !consent.checked; });

    submit.addEventListener('click', function () {
      var name = document.getElementById('lp-name');
      var email = document.getElementById('lp-email');
      var nameBad = !name.value.trim();
      var emailBad = !/^\S+@\S+\.\S+$/.test(email.value.trim());
      document.getElementById('lp-name-err').classList.toggle('visible', nameBad);
      document.getElementById('lp-email-err').classList.toggle('visible', emailBad);
      if (nameBad || emailBad) return;

      sendLead({
        name: name.value.trim(),
        email: email.value.trim(),
        consent: 'Yes',
        page: window.location.href,
        // Tagged by variant so the sheet shows which popup copy actually converts.
        source: 'Timed Popup — Second Opinion'
      });
      try { localStorage.setItem('anna_lead_captured', '1'); } catch (e) {}
      document.getElementById('lp-success').style.display = 'block';
      submit.disabled = true;
      submit.textContent = 'Sent';
      setTimeout(close, 1600);
    });
  }, 10000);
})();
