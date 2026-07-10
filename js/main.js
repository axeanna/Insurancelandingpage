/* main.js — nav, animations, FAQ, modals, shared lead helpers */
(function () {
  'use strict';

  // Mobile nav
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      toggle.classList.toggle('open');
      links.classList.toggle('open');
      document.body.style.overflow = links.classList.contains('open') ? 'hidden' : '';
    });
    document.querySelectorAll('.nav-drop > a').forEach(function (a) {
      a.addEventListener('click', function (e) {
        if (window.innerWidth <= 992) {
          e.preventDefault();
          a.parentElement.classList.toggle('open');
        }
      });
    });
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

  // Modals: click backdrop or press Esc to dismiss
  document.querySelectorAll('.modal').forEach(function (modal) {
    modal.addEventListener('click', function (e) {
      if (e.target === modal) modal.classList.remove('active');
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.active').forEach(function (m) { m.classList.remove('active'); });
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

function sendLead(fields) {
  var params = new URLSearchParams();
  Object.keys(fields).forEach(function (k) { params.append(k, fields[k]); });
  return fetch(LEAD_WEBHOOK_URL, { method: 'POST', mode: 'no-cors', body: params })
    .catch(function (err) { console.error('Lead webhook error:', err); });
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
