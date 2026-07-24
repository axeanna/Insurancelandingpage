/* calc-mortgage.js — MRTA & MLTA simulator
 * Standard amortization: monthly payment M = P·r(1+r)^n / ((1+r)^n − 1)
 */
(function () {
  'use strict';

  var formatRM = function (n) {
    return new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(n);
  };

  function monthlyPayment(principal, years, annualRate) {
    var n = years * 12;
    var r = (annualRate / 100) / 12;
    if (r === 0) return principal / n;
    return principal * (r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  }

  /* Year-end outstanding balances, index 0..years */
  function amortBalances(principal, years, annualRate) {
    var r = (annualRate / 100) / 12;
    var payment = monthlyPayment(principal, years, annualRate);
    var balance = principal;
    var balances = [principal];
    for (var y = 1; y <= years; y++) {
      for (var m = 0; m < 12; m++) {
        balance -= (payment - balance * r);
      }
      balances.push(Math.max(0, balance));
    }
    return balances;
  }

  var chartDefaults = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      tooltip: { callbacks: { label: function (ctx) { return ctx.dataset.label + ': ' + formatRM(ctx.parsed.y); } } },
      legend: { position: 'top', labels: { font: { family: "'Outfit', sans-serif" } } }
    },
    scales: {
      y: { beginAtZero: true, ticks: { callback: function (v) { return 'RM ' + (v / 1000) + 'k'; } } }
    }
  };

  document.addEventListener('DOMContentLoaded', function () {

    /* ── MRTA ─────────────────────────────── */
    var mrtaCanvas = document.getElementById('mrtaChart');
    if (mrtaCanvas) {
      var mrtaChart = new Chart(mrtaCanvas.getContext('2d'), {
        type: 'line', data: { labels: [], datasets: [] }, options: Object.assign({}, chartDefaults)
      });

      var updateMRTA = function () {
        var principal = parseFloat(document.getElementById('principal').value);
        var tenure = parseInt(document.getElementById('tenure').value, 10);
        var baseRate = parseFloat(document.getElementById('baseRate').value);
        var actualRate = parseFloat(document.getElementById('actualRate').value);

        document.getElementById('loanVal').textContent = formatRM(principal);
        document.getElementById('tenureVal').textContent = tenure + ' Years';
        document.getElementById('baseRateVal').textContent = baseRate.toFixed(2) + '%';
        document.getElementById('actualRateVal').textContent = actualRate.toFixed(2) + '%';

        var pay = monthlyPayment(principal, tenure, actualRate);
        var totalInterest = pay * tenure * 12 - principal;
        document.getElementById('monthlyPay').textContent = formatRM(pay);
        document.getElementById('totalInterest').textContent = formatRM(totalInterest);

        var labels = Array.from({ length: tenure + 1 }, function (_, i) { return 'Year ' + i; });
        mrtaChart.data = {
          labels: labels,
          datasets: [
            { label: 'Actual Loan Balance', data: amortBalances(principal, tenure, actualRate), borderColor: '#ED1B2E', backgroundColor: 'rgba(237,27,46,0.07)', fill: '+1', tension: 0.35, pointRadius: 0, borderWidth: 2.5 },
            { label: 'MRTA Coverage', data: amortBalances(principal, tenure, baseRate), borderColor: '#2563eb', fill: false, tension: 0.35, pointRadius: 0, borderWidth: 2.5 }
          ]
        };
        mrtaChart.update();
      };

      ['principal', 'tenure', 'baseRate', 'actualRate'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', updateMRTA);
      });
      updateMRTA();
    }

    /* ── MLTA ─────────────────────────────── */
    var mltaCanvas = document.getElementById('mltaChart');
    if (mltaCanvas) {
      var mltaChart = new Chart(mltaCanvas.getContext('2d'), {
        type: 'line', data: { labels: [], datasets: [] }, options: Object.assign({}, chartDefaults)
      });

      var updateMLTA = function () {
        var principal = parseFloat(document.getElementById('mlta-principal').value);
        var tenure = parseInt(document.getElementById('mlta-tenure').value, 10);
        var rate = parseFloat(document.getElementById('mlta-rate').value);
        var yearSlider = document.getElementById('mlta-currentYear');

        yearSlider.max = tenure;
        var currentYear = Math.min(parseInt(yearSlider.value, 10), tenure);
        yearSlider.value = currentYear;

        document.getElementById('mlta-loanVal').textContent = formatRM(principal);
        document.getElementById('mlta-tenureVal').textContent = tenure + ' Years';
        document.getElementById('mlta-rateVal').textContent = rate.toFixed(2) + '%';
        document.getElementById('mlta-yearVal').textContent = 'Year ' + currentYear;

        var loanData = amortBalances(principal, tenure, rate);
        var debtNow = loanData[currentYear];
        document.getElementById('disp-mlta').textContent = formatRM(principal);
        document.getElementById('disp-debt').textContent = formatRM(debtNow);
        document.getElementById('disp-surplus').textContent = formatRM(Math.max(0, principal - debtNow));

        mltaChart.data = {
          labels: Array.from({ length: tenure + 1 }, function (_, i) { return 'Year ' + i; }),
          datasets: [
            { label: 'MLTA Sum Assured (Fixed)', data: Array(tenure + 1).fill(principal), borderColor: '#4f46e5', borderDash: [6, 4], backgroundColor: 'rgba(34,197,94,0.10)', fill: '-1', tension: 0, pointRadius: 0, borderWidth: 2.5 },
            { label: 'Outstanding Loan Balance', data: loanData, borderColor: '#ED1B2E', fill: false, tension: 0.35, pointRadius: 0, borderWidth: 2.5 }
          ]
        };
        mltaChart.update();
      };

      ['mlta-principal', 'mlta-tenure', 'mlta-rate', 'mlta-currentYear'].forEach(function (id) {
        document.getElementById(id).addEventListener('input', updateMLTA);
      });
      updateMLTA();
    }

    /* ── Lead gate ──────────────────────────
     * Opens the first time the visitor adjusts either simulator (the moment
     * of intent), not on a timer — a timed popup that cannot be dismissed
     * would trap people who are just reading the page. Demo mode skips it. */
    var gate = document.getElementById('gate-modal');
    var unlockBtn = document.getElementById('unlock-btn');
    var consent = document.getElementById('consent');
    var unlocked = false;
    if (gate && unlockBtn) {
      ['principal', 'tenure', 'baseRate', 'actualRate', 'mlta-principal', 'mlta-tenure', 'mlta-rate', 'mlta-currentYear'].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.addEventListener('input', function () {
          if (!unlocked && !isDemoMode()) gate.classList.add('active');
        });
      });

      consent.addEventListener('change', function () { unlockBtn.disabled = !consent.checked; });

      unlockBtn.addEventListener('click', function () {
        var name = document.getElementById('gate-name');
        var email = document.getElementById('gate-email');
        var phone = document.getElementById('gate-phone');
        var normalisedPhone = validMalaysianPhone(phone.value);
        var ok = true;
        [['gate-name', name], ['gate-email', email], ['gate-phone', phone]].forEach(function (pair) {
          var err = document.getElementById(pair[0] + '-error');
          var bad = !pair[1].value.trim();
          if (pair[0] === 'gate-email' && !bad) bad = !/^\S+@\S+\.\S+$/.test(pair[1].value.trim());
          if (pair[0] === 'gate-phone' && !bad) bad = !normalisedPhone;
          err.classList.toggle('visible', bad);
          if (bad) ok = false;
        });
        if (!ok) return;

        unlockBtn.textContent = 'Sending…';
        unlockBtn.disabled = true;
        sendLead({
          name: name.value.trim(),
          email: email.value.trim(),
          phone: normalisedPhone,
          loan_amount: Math.round(parseFloat(document.getElementById('principal').value) || 0),
          tenure_years: parseInt(document.getElementById('tenure').value, 10) || 0,
          source: 'MRTA/MLTA Simulator'
        }).then(function () {
          unlocked = true;
          var success = document.getElementById('gate-success');
          if (success) success.style.display = 'block';
          setTimeout(function () { gate.classList.remove('active'); }, 1500);
        });
      });
    }
  });
})();
