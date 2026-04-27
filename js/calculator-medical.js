/**
 * calculator-medical.js
 * Malaysia Medical Inflation Chart
 * Historical data: Mercer Marsh Benefits / Willis Towers Watson MY Reports
 */

document.addEventListener('DOMContentLoaded', () => {

    /* =============================================
       Data: Malaysian Medical Inflation
       Source: Mercer Marsh Benefits Medical Trend Survey
       (inflation rate % per year)
       ============================================= */
    const HISTORICAL = {
        2020: 9.8,
        2021: 11.2,
        2022: 14.1,
        2023: 15.6,
        2024: 15.9
    };

    // Projection from 2025 onwards (conservative @ 15% p.a.)
    const PROJECTION_RATE = 0.15;

    // Base: cost of a standard hospitalisation in Malaysia in 2020 = RM 10,000
    const BASE_YEAR = 2020;
    const BASE_COST = 10000;

    /* =============================================
       Build projected cost from 2020 to any year
       ============================================= */
    function costForYear(year) {
        return BASE_COST * Math.pow(1 + PROJECTION_RATE, year - BASE_YEAR);
    }

    /* =============================================
       Build chart labels & datasets
       ============================================= */
    function buildChartData(endYear) {
        const histYears = Object.keys(HISTORICAL).map(Number);
        const labels    = [];
        const histData  = [];
        const projData  = [];

        // Historical segment (2020–2024) — bars
        histYears.forEach(yr => {
            labels.push(yr.toString());
            histData.push(Math.round(costForYear(yr)));
            projData.push(null);
        });

        // Projection segment (2025 → endYear) — line
        // Use points every 5 years + the endYear
        const projStops = new Set();
        for (let y = 2025; y <= endYear; y += 5) projStops.add(y);
        projStops.add(endYear);

        [...projStops].sort((a, b) => a - b).forEach(yr => {
            labels.push(yr.toString());
            histData.push(null);
            projData.push(Math.round(costForYear(yr)));
        });

        return { labels, histData, projData };
    }

    /* =============================================
       Initialize Chart
       ============================================= */
    const canvas = document.getElementById('medicalChart');
    if (!canvas) return;

    const slider      = document.getElementById('year-slider');
    const yearDisplay = document.getElementById('year-display');
    const calloutYear = document.getElementById('callout-year');
    const calloutCost = document.getElementById('callout-cost');
    const calloutMultiplier = document.getElementById('callout-multiplier');

    let selectedYear = slider ? parseInt(slider.value) : 2050;

    const initialData = buildChartData(selectedYear);

    const chart = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: initialData.labels,
            datasets: [
                {
                    label: 'Historical cost (RM)',
                    type: 'bar',
                    data: initialData.histData,
                    backgroundColor: 'rgba(211, 18, 37, 0.18)',
                    borderColor:     'rgba(211, 18, 37, 0.65)',
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    order: 2
                },
                {
                    label: 'Projected cost without coverage (RM)',
                    type: 'line',
                    data: initialData.projData,
                    borderColor:            '#D31225',
                    backgroundColor:        'rgba(211, 18, 37, 0.07)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.45,
                    pointBackgroundColor:   '#D31225',
                    pointBorderColor:       '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    spanGaps: true,
                    order: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            animation: { duration: 600, easing: 'easeInOutQuart' },
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: '#111',
                    titleColor: '#fff',
                    bodyColor: 'rgba(255,255,255,0.75)',
                    padding: 14,
                    cornerRadius: 10,
                    callbacks: {
                        title: ctx => 'Year ' + ctx[0].label,
                        label: ctx => {
                            if (ctx.raw === null) return null;
                            return ctx.dataset.label + ': RM ' + ctx.raw.toLocaleString('en-MY');
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: "'Outfit', sans-serif", size: 11 },
                        color: '#718096',
                        maxRotation: 45
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: { color: 'rgba(0,0,0,0.05)' },
                    ticks: {
                        font: { family: "'Outfit', sans-serif", size: 11 },
                        color: '#718096',
                        callback: val => 'RM ' + val.toLocaleString('en-MY')
                    }
                }
            }
        }
    });

    /* =============================================
       Update chart & callout when slider moves
       ============================================= */
    function updateAll(year) {
        selectedYear = year;
        const cost    = Math.round(costForYear(year));
        const multiplier = (cost / BASE_COST).toFixed(1);

        // Callout
        if (yearDisplay) yearDisplay.textContent = year;
        if (calloutYear) calloutYear.textContent = year;
        if (calloutCost) calloutCost.textContent = 'RM ' + cost.toLocaleString('en-MY');
        if (calloutMultiplier) calloutMultiplier.textContent = multiplier;

        // Rebuild chart
        const d = buildChartData(year);
        chart.data.labels             = d.labels;
        chart.data.datasets[0].data   = d.histData;
        chart.data.datasets[1].data   = d.projData;
        chart.update();

        // Sync slider fill
        syncSliderFill(slider);
    }

    function syncSliderFill(sl) {
        if (!sl) return;
        const pct = ((sl.value - sl.min) / (sl.max - sl.min)) * 100;
        sl.style.setProperty('--val', pct + '%');
    }

    if (slider) {
        slider.addEventListener('input', () => updateAll(parseInt(slider.value)));
        syncSliderFill(slider);
        updateAll(selectedYear); // initial
    }

    /* =============================================
       Sticky Navbar
       ============================================= */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.classList.add('scrolled');
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
    }

    /* =============================================
       Scroll Animations
       ============================================= */
    const animatedEls = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
    }, { threshold: 0.12 });
    animatedEls.forEach(el => observer.observe(el));
});
