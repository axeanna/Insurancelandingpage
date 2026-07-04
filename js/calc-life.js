/* calc-life.js — Life coverage calculator (needs-based analysis)
 *
 * Method: standard needs analysis (a.k.a. DIME approach)
 *   Life cover = Income replacement (annual income × years of support)
 *              + Outstanding mortgage
 *              + Other debts (car, personal, cards)
 *              + Children's education fund
 *              + Final expenses
 *              − Existing life insurance
 *              − Liquid savings & investments
 */
(function () {
  'use strict';

  function calculate() {
    var monthlyIncome = getNum('income');
    var years = parseInt(document.getElementById('years-slider').value, 10);
    var mortgage = getNum('mortgage');
    var debts = getNum('debts');
    var education = getNum('education');
    var finalExpenses = getNum('final-expenses');
    var existingCover = getNum('existing-cover');
    var savings = getNum('savings');

    var incomeReplacement = monthlyIncome * 12 * years;
    var totalNeeds = incomeReplacement + mortgage + debts + education + finalExpenses;
    var totalResources = existingCover + savings;
    var lifeCover = Math.max(0, totalNeeds - totalResources);

    return {
      monthlyIncome: monthlyIncome,
      years: years,
      incomeReplacement: incomeReplacement,
      mortgage: mortgage,
      debts: debts,
      education: education,
      finalExpenses: finalExpenses,
      existingCover: existingCover,
      savings: savings,
      totalNeeds: totalNeeds,
      lifeCover: lifeCover
    };
  }

  function showResults(r) {
    animateValue('result-life', r.lifeCover);
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('bd-income-replacement', fmtRM(r.incomeReplacement));
    set('bd-income-note', fmtRM(r.monthlyIncome * 12) + '/yr × ' + r.years + ' years');
    set('bd-mortgage', fmtRM(r.mortgage));
    set('bd-debts', fmtRM(r.debts));
    set('bd-education', fmtRM(r.education));
    set('bd-final', fmtRM(r.finalExpenses));
    set('bd-needs', fmtRM(r.totalNeeds));
    set('bd-existing', '− ' + fmtRM(r.existingCover));
    set('bd-savings', '− ' + fmtRM(r.savings));
    set('bd-total', fmtRM(r.lifeCover));

    var section = document.getElementById('results');
    section.style.display = 'block';
    setTimeout(function () {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  document.addEventListener('DOMContentLoaded', function () {
    var slider = document.getElementById('years-slider');
    var display = document.getElementById('years-display');
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
        life_cover: Math.round(r.lifeCover),
        monthly_income: Math.round(r.monthlyIncome),
        years: r.years,
        source: 'Life Coverage Calculator'
      });
      gate.classList.remove('active');
      showResults(r);
    });
  });
})();
