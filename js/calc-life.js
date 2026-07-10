/* calc-life.js — Life coverage calculator (needs-based analysis, Malaysian household version)
 *
 * Life cover = Outstanding housing loan (computed from instalment, years left, interest rate)
 *            + Outstanding car loan (flat-rate hire purchase: instalment × months left)
 *            + Personal loan / PTPTN + credit card balances
 *            + Monthly living costs × 12 × years of family support
 *              (bills & utilities, food & groceries, transport, kids + parents' allowance)
 *            + Children's education fund
 *            + Final expenses
 *            − Existing life insurance − savings & investments
 *
 * Housing loan balance = present value of remaining instalments (reducing balance):
 *   B = M × (1 − (1+r)^−n) / r,  r = annual rate / 12, n = months remaining
 * Car loan balance (Malaysian hire purchase, flat rate): B = M × n
 */
(function () {
  'use strict';

  var capturedName = '';
  var capturedEmail = '';
  var hasCapturedLead = false;

  function housingBalance(instalment, yearsLeft, annualRate) {
    var n = Math.round(yearsLeft * 12);
    if (instalment <= 0 || n <= 0) return 0;
    var r = (annualRate / 100) / 12;
    if (r === 0) return instalment * n;
    return instalment * (1 - Math.pow(1 + r, -n)) / r;
  }

  function carBalance(instalment, yearsLeft) {
    var n = Math.round(yearsLeft * 12);
    if (instalment <= 0 || n <= 0) return 0;
    return instalment * n;
  }

  function calculate() {
    var housing = housingBalance(getNum('housing-instalment'), getNum('housing-years'), getNum('housing-rate') || 4.5);
    var car = carBalance(getNum('car-instalment'), getNum('car-years'));
    var personalLoan = getNum('personal-loan');
    var creditCard = getNum('credit-card');

    var years = parseInt(document.getElementById('years-slider').value, 10);
    var bills = getNum('bills');
    var food = getNum('food');
    var transport = getNum('transport');
    var family = getNum('family');
    var monthlyExpenses = bills + food + transport + family;
    var livingCosts = monthlyExpenses * 12 * years;

    var education = getNum('education');
    var finalExpenses = getNum('final-expenses');
    var existingCover = getNum('existing-cover');
    var savings = getNum('savings');

    var totalDebts = housing + car + personalLoan + creditCard;
    var totalNeeds = totalDebts + livingCosts + education + finalExpenses;
    var lifeCover = Math.max(0, totalNeeds - existingCover - savings);

    return {
      housing: housing, car: car, personalLoan: personalLoan, creditCard: creditCard,
      totalDebts: totalDebts, years: years, monthlyExpenses: monthlyExpenses,
      livingCosts: livingCosts, education: education, finalExpenses: finalExpenses,
      existingCover: existingCover, savings: savings,
      totalNeeds: totalNeeds, lifeCover: lifeCover
    };
  }

  /* Live outstanding-balance previews under the loan inputs */
  function updateLoanPreviews() {
    var h = housingBalance(getNum('housing-instalment'), getNum('housing-years'), getNum('housing-rate') || 4.5);
    var c = carBalance(getNum('car-instalment'), getNum('car-years'));
    var hEl = document.getElementById('housing-balance-display');
    var cEl = document.getElementById('car-balance-display');
    if (hEl) hEl.textContent = h > 0 ? 'Est. outstanding balance: ' + fmtRM(h) : '';
    if (cEl) cEl.textContent = c > 0 ? 'Est. outstanding balance: ' + fmtRM(c) : '';
  }

  function showResults(r) {
    animateValue('result-life', r.lifeCover);
    var set = function (id, v) {
      var el = document.getElementById(id);
      if (el) el.textContent = v;
    };
    set('bd-housing', fmtRM(r.housing));
    set('bd-car', fmtRM(r.car));
    set('bd-personal', fmtRM(r.personalLoan));
    set('bd-cc', fmtRM(r.creditCard));
    set('bd-expenses-note', fmtRM(r.monthlyExpenses) + '/mo × 12 × ' + r.years + ' yrs');
    set('bd-expenses', fmtRM(r.livingCosts));
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

    ['housing-instalment', 'housing-years', 'housing-rate', 'car-instalment', 'car-years'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.addEventListener('input', updateLoanPreviews);
    });

    var calcBtn = document.getElementById('calculate-btn');
    var gate = document.getElementById('gate-modal');
    var unlockBtn = document.getElementById('unlock-btn');
    var consent = document.getElementById('consent');
    var closeBtn = document.getElementById('gate-close');

    // 15-second auto-popup
    setTimeout(function () {
      if (!hasCapturedLead && gate) gate.classList.add('active');
    }, 15000);

    calcBtn.addEventListener('click', function () {
      if (!hasCapturedLead) {
        gate.classList.add('active');
        return;
      }
      var r = calculate();
      sendLead({
        name: capturedName,
        email: capturedEmail,
        life_cover: Math.round(r.lifeCover),
        housing_loan: Math.round(r.housing),
        car_loan: Math.round(r.car),
        other_debts: Math.round(r.personalLoan + r.creditCard),
        monthly_expenses: Math.round(r.monthlyExpenses),
        years: r.years,
        source: 'Life Coverage Calculator (Completed)'
      });
      showResults(r);
    });

    if (closeBtn) closeBtn.addEventListener('click', function () { gate.classList.remove('active'); });

    consent.addEventListener('change', function () {
      unlockBtn.disabled = !consent.checked;
    });

    unlockBtn.addEventListener('click', function () {
      var name = document.getElementById('gate-name');
      var email = document.getElementById('gate-email');
      var ok = true;
      [['gate-name', name], ['gate-email', email]].forEach(function (pair) {
        var err = document.getElementById(pair[0] + '-error');
        var bad = !pair[1].value.trim();
        if (pair[0] === 'gate-email' && !bad) bad = !/^\S+@\S+\.\S+$/.test(pair[1].value.trim());
        err.classList.toggle('visible', bad);
        if (bad) ok = false;
      });
      if (!ok) return;

      capturedName = name.value.trim();
      capturedEmail = email.value.trim();
      hasCapturedLead = true;

      sendLead({
        name: capturedName,
        email: capturedEmail,
        source: 'Life Coverage Calculator (Started)'
      });

      gate.classList.remove('active');
    });
  });
})();
