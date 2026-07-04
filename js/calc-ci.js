/* calc-ci.js — Critical illness coverage calculator
 *
 * Method (industry-standard guideline):
 *   CI cover = Income replacement during recovery (annual income × recovery years, typically 3–5)
 *            + Out-of-pocket treatment & recovery buffer (default RM150,000)
 *            − Existing CI coverage
 */
(function () {
  'use strict';

  function calculate() {
    var monthlyIncome = getNum('income');
    var years = parseInt(document.getElementById('recovery-slider').value, 10);
    var buffer = getNum('treatment-buffer');
    var existingCI = getNum('existing-ci');

    var incomeReplacement = monthlyIncome * 12 * years;
    var ciCover = Math.max(0, incomeReplacement + buffer - existingCI);

    return {
      monthlyIncome: monthlyIncome,
      years: years,
      incomeReplacement: incomeReplacement,
      buffer: buffer,
      existingCI: existingCI,
      ciCover: ciCover
    };
  }

  function showResults(r) {
    animateValue('result-ci', r.ciCover);
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('bd-income-replacement', fmtRM(r.incomeReplacement));
    set('bd-income-note', fmtRM(r.monthlyIncome * 12) + '/yr × ' + r.years + ' years');
    set('bd-buffer', fmtRM(r.buffer));
    set('bd-existing', '− ' + fmtRM(r.existingCI));
    set('bd-total', fmtRM(r.ciCover));

    var multiple = r.monthlyIncome > 0 ? (r.ciCover / (r.monthlyIncome * 12)).toFixed(1) : '0';
    set('bd-multiple', multiple + '× your annual income');

    var section = document.getElementById('results');
    section.style.display = 'block';
    setTimeout(function () {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slider = document.getElementById('recovery-slider');
    var display = document.getElementById('recovery-display');
    if (slider && display) {
      slider.addEventListener('input', function () { display.textContent = slider.value + ' years'; });
    }

    var calcBtn = document.getElementById('calculate-btn');
    var gate = document.getElementById('gate-modal');
    var unlockBtn = document.getElementById('unlock-btn');
    var consent = document.getElementById('consent');
    var closeBtn = document.getElementById('gate-close');

    calcBtn.addEventListener('click', function () {
      if (getNum('income') <= 0) {
        document.getElementById('income-error').classList.add('visible');
        document.getElementById('income').focus();
        return;
      }
      document.getElementById('income-error').classList.remove('visible');
      gate.classList.add('active');
    });

    if (closeBtn) closeBtn.addEventListener('click', function () { gate.classList.remove('active'); });

    consent.addEventListener('change', function () {
      unlockBtn.disabled = !consent.checked;
    });

    unlockBtn.addEventListener('click', function () {
      var name = document.getElementById('gate-name');
      var email = document.getElementById('gate-email');
      var phone = document.getElementById('gate-phone');
      var ok = true;
      [['gate-name', name], ['gate-email', email], ['gate-phone', phone]].forEach(function (pair) {
        var err = document.getElementById(pair[0] + '-error');
        var bad = !pair[1].value.trim();
        if (pair[0] === 'gate-email' && !bad) bad = !/^\S+@\S+\.\S+$/.test(pair[1].value.trim());
        err.classList.toggle('visible', bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      var r = calculate();
      sendLead({
        name: name.value.trim(),
        email: email.value.trim(),
        phone: phone.value.trim(),
        ci_cover: Math.round(r.ciCover),
        monthly_income: Math.round(r.monthlyIncome),
        recovery_years: r.years,
        source: 'Critical Illness Calculator'
      });
      gate.classList.remove('active');
      showResults(r);
    });
  });
})();
