/* calc-medical.js — Malaysia medical cost inflation projection
 * Historical medical inflation rates: Mercer Marsh Benefits Medical Trends reports (Malaysia)
 * Base: standard private hospitalisation cost in 2020 ≈ RM10,000
 * Historical years compound at their actual reported rates; projections use 15% p.a.
 */
(function () {
  'use strict';

  var BASE_YEAR = 2020;
  var BASE_COST = 10000;
  var HISTORICAL_RATES = { 2021: 0.112, 2022: 0.141, 2023: 0.156, 2024: 0.159 };
  var LAST_HISTORICAL = 2024;
  var PROJECTION_RATE = 0.15;

  /* Compound actual historical rates, then the projection rate */
  function costForYear(year) {
    var cost = BASE_COST;
    for (var y = BASE_YEAR + 1; y <= year; y++) {
      cost *= 1 + (y <= LAST_HISTORICAL ? HISTORICAL_RATES[y] : PROJECTION_RATE);
    }
    return cost;
  }

  function buildChartData(endYear) {
    var labels = [], histData = [], projData = [];
    for (var y = BASE_YEAR; y <= LAST_HISTORICAL; y++) {
      labels.push(String(y));
      histData.push(Math.round(costForYear(y)));
      projData.push(null);
    }
    var stops = [];
    for (var s = LAST_HISTORICAL + 1; s < endYear; s += 5) stops.push(s);
    if (stops.indexOf(endYear) === -1) stops.push(endYear);
    stops.forEach(function (yr) {
      labels.push(String(yr));
      histData.push(null);
      projData.push(Math.round(costForYear(yr)));
    });
    // connect the line to the last historical bar
    projData[labels.indexOf(String(LAST_HISTORICAL))] = Math.round(costForYear(LAST_HISTORICAL));
    return { labels: labels, histData: histData, projData: projData };
  }

  document.addEventListener('DOMContentLoaded', function () {
    var canvas = document.getElementById('medicalChart');
    if (!canvas) return;

    var slider = document.getElementById('year-slider');
    var selectedYear = slider ? parseInt(slider.value, 10) : 2050;
    var d = buildChartData(selectedYear);

    var chart = new Chart(canvas.getContext('2d'), {
      type: 'bar',
      data: {
        labels: d.labels,
        datasets: [
          {
            label: 'Historical cost (actual inflation)',
            type: 'bar',
            data: d.histData,
            backgroundColor: 'rgba(237, 27, 46, 0.16)',
            borderColor: 'rgba(237, 27, 46, 0.6)',
            borderWidth: 2,
            borderRadius: 8,
            borderSkipped: false,
            order: 2
          },
          {
            label: 'Projected cost (15% p.a.)',
            type: 'line',
            data: d.projData,
            borderColor: '#ED1B2E',
            backgroundColor: 'rgba(237, 27, 46, 0.06)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#ED1B2E',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 5,
            spanGaps: true,
            order: 1
          }
        ]
      },
      options: {
        responsive: true,
        animation: { duration: 500 },
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true, labels: { font: { family: "'Outfit', sans-serif" } } },
          tooltip: {
            callbacks: {
              title: function (ctx) { return 'Year ' + ctx[0].label; },
              label: function (ctx) {
                if (ctx.raw === null) return null;
                return ctx.dataset.label + ': RM ' + ctx.raw.toLocaleString('en-MY');
              }
            }
          }
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: function (v) { return 'RM ' + v.toLocaleString('en-MY'); } }
          }
        }
      }
    });

    function updateAll(year) {
      var cost = Math.round(costForYear(year));
      var set = function (id, v) {
        var el = document.getElementById(id);
        if (el) el.textContent = v;
      };
      set('year-display', year);
      set('callout-year', year);
      set('callout-cost', 'RM ' + cost.toLocaleString('en-MY'));
      set('callout-multiplier', (cost / BASE_COST).toFixed(1));

      var nd = buildChartData(year);
      chart.data.labels = nd.labels;
      chart.data.datasets[0].data = nd.histData;
      chart.data.datasets[1].data = nd.projData;
      chart.update();
    }

    if (slider) {
      slider.addEventListener('input', function () { updateAll(parseInt(slider.value, 10)); });
      updateAll(selectedYear);
    }

    /* ── Lead gate ──────────────────────────
     * This projector previously captured nothing — the only calculator whose
     * visitors were never recorded. Same pattern as the others: the gate opens
     * on first interaction, closes only on valid details, demo mode skips it. */
    var gate = document.getElementById('gate-modal');
    var unlockBtn = document.getElementById('unlock-btn');
    var consent = document.getElementById('consent');
    var unlocked = false;
    if (gate && unlockBtn && slider) {
      slider.addEventListener('input', function () {
        if (!unlocked && !isDemoMode()) gate.classList.add('active');
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
          projection_year: parseInt(slider.value, 10),
          source: 'Medical Inflation Projector'
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
