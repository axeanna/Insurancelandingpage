// ============================================================
// MRTA & MLTA Simulator Logic
// ============================================================

const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec";

const formatRM = (num) =>
    new Intl.NumberFormat('en-MY', { style: 'currency', currency: 'MYR', maximumFractionDigits: 0 }).format(num);

function calculateAmortization(principal, years, annualRate) {
    const months      = years * 12;
    const monthlyRate = (annualRate / 100) / 12;
    const payment     = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) /
                        (Math.pow(1 + monthlyRate, months) - 1);

    let balance  = principal;
    let balances = [principal];

    for (let i = 1; i <= years; i++) {
        for (let m = 0; m < 12; m++) {
            const interest      = balance * monthlyRate;
            const principalPaid = payment - interest;
            balance            -= principalPaid;
        }
        balances.push(Math.max(0, balance));
    }
    return balances;
}

// ── Chart defaults ────────────────────────────────────────────
const chartDefaults = {
    responsive: true,
    interaction: { mode: 'index', intersect: false },
    plugins: {
        tooltip: {
            callbacks: {
                label: (ctx) => ctx.dataset.label + ': ' + formatRM(ctx.parsed.y)
            }
        },
        legend: { position: 'top' }
    },
    scales: {
        y: {
            beginAtZero: true,
            ticks: { callback: (v) => 'RM ' + (v / 1000) + 'k' }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {

    // ── MRTA Chart ──────────────────────────────────────────
    const mrtaCanvas = document.getElementById('mrtaChart');
    let mrtaChart;

    if (mrtaCanvas) {
        mrtaChart = new Chart(mrtaCanvas.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { ...chartDefaults }
        });

        function updateMRTA() {
            const principal  = parseFloat(document.getElementById('principal').value);
            const tenure     = parseInt(document.getElementById('tenure').value);
            const baseRate   = parseFloat(document.getElementById('baseRate').value);
            const actualRate = parseFloat(document.getElementById('actualRate').value);

            document.getElementById('loanVal').textContent     = formatRM(principal);
            document.getElementById('tenureVal').textContent   = tenure + ' Years';
            document.getElementById('baseRateVal').textContent = baseRate.toFixed(2) + '%';
            document.getElementById('actualRateVal').textContent = actualRate.toFixed(2) + '%';

            const labels         = Array.from({ length: tenure + 1 }, (_, i) => 'Year ' + i);
            const mrtaCoverage   = calculateAmortization(principal, tenure, baseRate);
            const actualLoanBal  = calculateAmortization(principal, tenure, actualRate);

            mrtaChart.data = {
                labels,
                datasets: [
                    {
                        label: 'Actual Loan Balance',
                        data: actualLoanBal,
                        borderColor: '#dc2626',
                        backgroundColor: 'rgba(220,38,38,0.08)',
                        fill: '+1',
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2.5
                    },
                    {
                        label: 'MRTA Coverage',
                        data: mrtaCoverage,
                        borderColor: '#2563eb',
                        backgroundColor: 'rgba(37,99,235,0.06)',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2.5
                    }
                ]
            };
            mrtaChart.update();
        }

        ['principal','tenure','baseRate','actualRate'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateMRTA);
        });
        updateMRTA();
    }

    // ── MLTA Chart ──────────────────────────────────────────
    const mltaCanvas = document.getElementById('mltaChart');
    let mltaChart;

    if (mltaCanvas) {
        mltaChart = new Chart(mltaCanvas.getContext('2d'), {
            type: 'line',
            data: { labels: [], datasets: [] },
            options: { ...chartDefaults }
        });

        function updateMLTA() {
            const principal   = parseFloat(document.getElementById('mlta-principal').value);
            const tenure      = parseInt(document.getElementById('mlta-tenure').value);
            const rate        = parseFloat(document.getElementById('mlta-rate').value);
            const yearSlider  = document.getElementById('mlta-currentYear');

            // Clamp timeline max to tenure
            yearSlider.max = tenure;
            let currentYear = Math.min(parseInt(yearSlider.value), tenure);
            yearSlider.value = currentYear;

            document.getElementById('mlta-loanVal').textContent  = formatRM(principal);
            document.getElementById('mlta-tenureVal').textContent = tenure + ' Years';
            document.getElementById('mlta-rateVal').textContent   = rate.toFixed(2) + '%';
            document.getElementById('mlta-yearVal').textContent   = 'Year ' + currentYear;

            const labels   = Array.from({ length: tenure + 1 }, (_, i) => 'Year ' + i);
            const loanData = calculateAmortization(principal, tenure, rate);
            const mltaData = Array(tenure + 1).fill(principal);

            const debtNow    = loanData[currentYear];
            const surplusNow = Math.max(0, principal - debtNow);

            document.getElementById('disp-mlta').textContent    = formatRM(principal);
            document.getElementById('disp-debt').textContent    = formatRM(debtNow);
            document.getElementById('disp-surplus').textContent = formatRM(surplusNow);

            mltaChart.data = {
                labels,
                datasets: [
                    {
                        label: 'MLTA Sum Assured (Fixed)',
                        data: mltaData,
                        borderColor: '#4f46e5',
                        borderDash: [6, 4],
                        backgroundColor: 'rgba(34,197,94,0.12)',
                        fill: '-1',
                        tension: 0,
                        pointRadius: 0,
                        borderWidth: 2.5
                    },
                    {
                        label: 'Outstanding Loan Balance',
                        data: loanData,
                        borderColor: '#dc2626',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        pointRadius: 0,
                        borderWidth: 2.5
                    }
                ]
            };
            mltaChart.update();
        }

        ['mlta-principal','mlta-tenure','mlta-rate','mlta-currentYear'].forEach(id => {
            document.getElementById(id).addEventListener('input', updateMLTA);
        });
        updateMLTA();
    }

    // ── 15-Second Lead Gate ──────────────────────────────────
    const gateOverlay  = document.getElementById('mrta-gate');
    const submitBtn    = document.getElementById('mrta-submit-btn');
    const successMsg   = document.getElementById('mrta-gate-success');

    // Show gate after 15 seconds
    setTimeout(() => {
        if (gateOverlay) gateOverlay.classList.add('active');
    }, 15000);

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const nameInput  = document.getElementById('gate-name');
            const emailInput = document.getElementById('gate-email');
            const phoneInput = document.getElementById('gate-phone');
            const nameErr    = document.getElementById('gate-name-error');
            const emailErr   = document.getElementById('gate-email-error');
            const phoneErr   = document.getElementById('gate-phone-error');

            // Reset errors
            [nameErr, emailErr, phoneErr].forEach(e => e.classList.remove('visible'));

            let valid = true;
            if (!nameInput.value.trim())  { nameErr.classList.add('visible');  valid = false; }
            if (!emailInput.value.trim()) { emailErr.classList.add('visible'); valid = false; }
            if (!phoneInput.value.trim()) { phoneErr.classList.add('visible'); valid = false; }
            if (!valid) return;

            const name  = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();

            // Webhook
            const params = new URLSearchParams();
            params.append('name',   name);
            params.append('email',  email);
            params.append('phone',  phone);
            params.append('source', 'MRTA/MLTA Simulator');

            submitBtn.textContent = 'Sending…';
            submitBtn.disabled    = true;

            fetch(WEBHOOK_URL, {
                method: 'POST',
                mode:   'no-cors',
                body:   params
            })
            .then(() => {
                successMsg.style.display = 'block';
                setTimeout(() => gateOverlay.classList.remove('active'), 2000);
            })
            .catch(() => {
                // Still dismiss even on error so user isn't blocked
                gateOverlay.classList.remove('active');
            });
        });
    }
});
