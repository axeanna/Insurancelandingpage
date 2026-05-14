/**
 * calculator.js
 * Life Cover & Critical Illness Calculator logic
 */

// 1. INITIALIZATION (v4 SDK Object Syntax)
emailjs.init({
    publicKey: 'wqFxp4IHe9q_HnHIJ', // Ensure this is your actual Public Key
});

let currentResults = {};
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec";

// 2. EMAIL SENDING LOGIC
function sendResultsByEmail(userName, userEmail, results) {
    const templateParams = {
        user_name: userName,
        user_email: userEmail,
        life_cover: results.lifeCover.toLocaleString('en-MY'),
        ci_cover: results.ciCover.toLocaleString('en-MY'),
        annual_income: results.annualIncome.toLocaleString('en-MY'),
        goal: results.goal || 'Family Protection',
        years: results.years
    };

    console.log('Attempting to send email with params:', templateParams);

    // REPLACE 'prudential_service' and 'calculator_results' with your Alphanumeric IDs
    // Example: emailjs.send('service_xxxxx', 'template_xxxxx', templateParams)
    emailjs.send('prudential_service', 'calculator_results', templateParams)
        .then(function (response) {
            console.log('✅ SUCCESS! Email sent.', response.status, response.text);
        }, function (error) {
            console.error('❌ FAILED! Email did not send.', error);
        });
}

// 3. QUOTATION MODAL LOGIC
function requestQuotation() {
    const modal = document.getElementById('quote-modal');
    if (!modal) return;

    // Reset modal state
    const radios = modal.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.checked = false);

    const occInput = document.getElementById('modal_occupation');
    const busInput = document.getElementById('modal_business');
    if (occInput) occInput.value = '';
    if (busInput) busInput.value = '';

    document.getElementById('medical-desc-container').style.display = 'none';
    document.getElementById('modal_medical_desc').value = '';

    document.getElementById('coverage-amounts-container').style.display = 'none';
    document.getElementById('modal_existing_life').value = '';
    document.getElementById('modal_existing_ci').value = '';

    const cardEmail = document.getElementById('card-email-only');
    const cardConsult = document.getElementById('card-consultation');
    if (cardEmail) {
        cardEmail.classList.remove('selected', 'disabled');
        cardEmail.querySelector('input').disabled = false;
    }
    if (cardConsult) cardConsult.classList.remove('selected');

    const emailNote = document.getElementById('email-only-note');
    if (emailNote) emailNote.style.display = 'none';

    const submitBtn = document.getElementById('quote-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
    }

    const errorMsg = document.getElementById('quote-modal-error');
    if (errorMsg) {
        errorMsg.style.display = 'none';
        errorMsg.textContent = '';
    }

    modal.classList.add('active');
}

// 4. CORE EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {

    // Main Gender Toggles
    const genderCards = document.querySelectorAll('.gender-card');
    genderCards.forEach(card => {
        card.addEventListener('click', () => {
            genderCards.forEach(c => {
                c.style.borderColor = 'var(--border-color)';
                c.style.background = 'transparent';
            });
            card.style.borderColor = '#D31225';
            card.style.background = 'rgba(211, 18, 37, 0.05)';
            const input = card.querySelector('input[type="radio"]');
            if (input) input.checked = true;
        });
    });

    const modal = document.getElementById('quote-modal');
    if (!modal) return;

    const btnClose = document.getElementById('quote-modal-close');
    const submitBtn = document.getElementById('quote-submit-btn');
    const medicalDescContainer = document.getElementById('medical-desc-container');
    const medicalDescInput = document.getElementById('modal_medical_desc');
    const coverageAmountsContainer = document.getElementById('coverage-amounts-container');
    const cardEmail = document.getElementById('card-email-only');
    const cardConsult = document.getElementById('card-consultation');
    const emailNote = document.getElementById('email-only-note');
    const errorMsg = document.getElementById('quote-modal-error');

    const closeModal = () => modal.classList.remove('active');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });

    modal.addEventListener('change', validateModal);
    modal.addEventListener('input', validateModal);

    function validateModal() {
        const occVal = document.getElementById('modal_occupation')?.value.trim();
        const busVal = document.getElementById('modal_business')?.value.trim();
        const smokerVal = document.querySelector('input[name="modal_smoker"]:checked')?.value;
        const medicalVal = document.querySelector('input[name="modal_medical"]:checked')?.value;
        const coverageVal = document.querySelector('input[name="modal_coverage"]:checked')?.value;
        let contactVal = document.querySelector('input[name="modal_contact"]:checked')?.value;

        if (medicalVal === 'Yes' || medicalVal === 'Ya') {
            medicalDescContainer.style.display = 'block';
            if (cardEmail) {
                cardEmail.classList.add('disabled');
                cardEmail.querySelector('input').disabled = true;
            }
            if (emailNote) emailNote.style.display = 'block';
            if (contactVal && (contactVal.includes('Email') || contactVal.includes('e-mel'))) {
                const consultRadio = cardConsult.querySelector('input');
                if (consultRadio) {
                    consultRadio.checked = true;
                    contactVal = consultRadio.value;
                }
                if (cardEmail) cardEmail.classList.remove('selected');
                if (cardConsult) cardConsult.classList.add('selected');
            }
        } else {
            medicalDescContainer.style.display = 'none';
            if (cardEmail) {
                cardEmail.classList.remove('disabled');
                cardEmail.querySelector('input').disabled = false;
            }
            if (emailNote) emailNote.style.display = 'none';
        }

        if (coverageVal === 'Yes' || coverageVal === 'Ya') {
            coverageAmountsContainer.style.display = 'block';
        } else {
            coverageAmountsContainer.style.display = 'none';
        }

        if (cardEmail) cardEmail.classList.toggle('selected', cardEmail.querySelector('input').checked);
        if (cardConsult) cardConsult.classList.toggle('selected', cardConsult.querySelector('input').checked);

        let isValid = occVal && busVal && smokerVal && medicalVal && contactVal && coverageVal;
        if ((medicalVal === 'Yes' || medicalVal === 'Ya') && (!medicalDescInput || medicalDescInput.value.trim() === '')) {
            isValid = false;
        }

        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
            submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        }
    }

    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const occVal = document.getElementById('modal_occupation')?.value.trim();
            const busVal = document.getElementById('modal_business')?.value.trim();
            const smokerVal = document.querySelector('input[name="modal_smoker"]:checked')?.value;
            const medicalVal = document.querySelector('input[name="modal_medical"]:checked')?.value;
            const coverageVal = document.querySelector('input[name="modal_coverage"]:checked')?.value;
            const contactVal = document.querySelector('input[name="modal_contact"]:checked')?.value;
            const medicalDesc = medicalDescInput.value.trim();
            const existingLife = document.getElementById('modal_existing_life')?.value || '0';
            const existingCi = document.getElementById('modal_existing_ci')?.value || '0';
            const calcGender = document.querySelector('input[name="calc_gender"]:checked')?.value || '';

            const finalMedicalText = (medicalVal === 'Yes' || medicalVal === 'Ya') ? medicalDesc : medicalVal;
            const finalExistingLifeText = (coverageVal === 'Yes' || coverageVal === 'Ya') ? existingLife : 'None';
            const finalExistingCiText = (coverageVal === 'Yes' || coverageVal === 'Ya') ? existingCi : 'None';

            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = 'Sending...';

            if (errorMsg) {
                errorMsg.style.display = 'none';
            }

            const gateName = document.getElementById('gate-name');
            const gateEmail = document.getElementById('gate-email');

            const templateParams = {
                user_name: gateName ? gateName.value : '',
                user_email: gateEmail ? gateEmail.value : '',
                occupation: occVal,
                nature_of_business: busVal,
                life_cover: currentResults.lifeCover ? currentResults.lifeCover.toLocaleString('en-MY') : '0',
                ci_cover: currentResults.ciCover ? currentResults.ciCover.toLocaleString('en-MY') : '0',
                annual_income: currentResults.annualIncome ? currentResults.annualIncome.toLocaleString('en-MY') : '0',
                goal: currentResults.goal || 'family',
                years: currentResults.years || 0,
                gender: calcGender,
                smoker_status: smokerVal,
                medical_conditions: finalMedicalText,
                existing_life_cover: finalExistingLifeText,
                existing_ci_cover: finalExistingCiText,
                contact_preference: contactVal
            };

            // Webhook Stage 2
            const params = new URLSearchParams();
            params.append("name", templateParams.user_name);
            params.append("email", templateParams.user_email);
            params.append("occupation", occVal);
            params.append("nature_of_business", busVal);
            params.append("smoker_status", smokerVal);
            params.append("medical_conditions", finalMedicalText);
            params.append("contact_preference", contactVal);
            params.append("gender", calcGender);

            fetch(WEBHOOK_URL, {
                method: 'POST',
                mode: 'no-cors',
                body: params
            }).catch(err => console.error("Webhook Stage 2 error:", err));

            // REPLACE 'prudential_service' and 'quotation_request' with your Alphanumeric IDs
            emailjs.send('prudential_service', 'quotation_request', templateParams)
                .then(function () {
                    closeModal();
                    openMedicalModal();
                }, function (error) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                    if (errorMsg) {
                        errorMsg.textContent = 'Error sending request. Please try again.';
                        errorMsg.style.display = 'block';
                    }
                });
        });
    }

    // --- SETUP CALCULATOR UI ELEMENTS ---

    const dobDay = document.getElementById('dob-day');
    const dobYear = document.getElementById('dob-year');
    if (dobDay) {
        for (let i = 1; i <= 31; i++) {
            let opt = document.createElement('option');
            opt.value = i < 10 ? '0' + i : i;
            opt.textContent = i;
            dobDay.appendChild(opt);
        }
    }
    if (dobYear) {
        const currentYear = new Date().getFullYear();
        for (let i = currentYear - 18; i >= currentYear - 80; i--) {
            let opt = document.createElement('option');
            opt.value = i;
            opt.textContent = i;
            dobYear.appendChild(opt);
        }
    }

    const yearsSlider = document.getElementById('years-slider');
    const yearsDisplay = document.getElementById('years-display');

    function syncSlider(slider) {
        const min = parseFloat(slider.min) || 0;
        const max = parseFloat(slider.max) || 100;
        const val = parseFloat(slider.value);
        const pct = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--val', pct + '%');
    }

    if (yearsSlider) {
        yearsSlider.addEventListener('input', () => {
            if (yearsDisplay) yearsDisplay.textContent = yearsSlider.value;
            syncSlider(yearsSlider);
        });
        syncSlider(yearsSlider);
    }

    const calculateBtn = document.getElementById('calculate-btn');
    const gateOverlay = document.getElementById('gate-overlay');
    const unlockBtn = document.getElementById('unlock-btn');
    const resultsSection = document.getElementById('results-section');
    const consentCheckbox = document.getElementById('consent-checkbox');

    let gateCleared = false;

    if (calculateBtn) {
        calculateBtn.addEventListener('click', () => {
            if (gateCleared) {
                computeAndShowResults();
            } else {
                if (gateOverlay) gateOverlay.classList.add('active');
            }
        });
    }

    if (consentCheckbox && unlockBtn) {
        consentCheckbox.addEventListener('change', () => {
            unlockBtn.disabled = !consentCheckbox.checked;
            unlockBtn.style.opacity = consentCheckbox.checked ? '1' : '0.45';
            unlockBtn.style.cursor = consentCheckbox.checked ? 'pointer' : 'not-allowed';
        });
    }

    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            if (consentCheckbox && !consentCheckbox.checked) return;

            const nameInput = document.getElementById('gate-name');
            const emailInput = document.getElementById('gate-email');
            const nameError = document.getElementById('gate-name-error');
            const emailError = document.getElementById('gate-email-error');
            const calcGender = document.querySelector('input[name="calc_gender"]:checked')?.value;

            let valid = true;
            if (nameError) nameError.classList.remove('visible');
            if (emailError) emailError.classList.remove('visible');

            if (!calcGender) {
                alert("Please select your Gender in the form before proceeding.");
                valid = false;
            }

            if (!nameInput || nameInput.value.trim() === '') {
                if (nameError) nameError.classList.add('visible');
                valid = false;
            }

            if (!emailInput || emailInput.value.trim() === '') {
                if (emailError) emailError.classList.add('visible');
                valid = false;
            }

            if (!valid) return;

            const nameVal = nameInput.value.trim();
            const emailVal = emailInput.value.trim();

            sendWebhookStage1(nameVal, emailVal, calcGender);

            gateCleared = true;
            if (gateOverlay) gateOverlay.classList.remove('active');
            computeAndShowResults();
        });
    }

    // --- CALCULATION LOGIC ---

    function getVal(id) {
        const el = document.getElementById(id);
        return el ? (parseFloat(el.value.replace(/,/g, '')) || 0) : 0;
    }

    function sendWebhookStage1(name, email, gender) {
        const annualIncome = getVal('income');
        const housing = getVal('housing');
        const car = getVal('car');
        const bills = getVal('bills');
        const others = getVal('others');
        const education = getVal('education');
        const parents = getVal('parents');
        const years = parseInt(yearsSlider ? yearsSlider.value : 20);

        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments = monthlyCommitments * 12;
        const lifeCover = (annualCommitments * years);
        const ciCover = 5 * monthlyCommitments * 12;

        const params = new URLSearchParams();
        params.append("name", name);
        params.append("email", email);
        params.append("gender", gender || '');
        params.append("life_cover", lifeCover);
        params.append("ci_cover", ciCover);
        params.append("source", "Life Cover Calculator");

        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        }).catch(err => console.error("Webhook Stage 1 error:", err));
    }

    function computeAndShowResults() {
        const annualIncome = getVal('income');
        const housing = getVal('housing');
        const car = getVal('car');
        const bills = getVal('bills');
        const others = getVal('others');
        const education = getVal('education');
        const parents = getVal('parents');
        const years = parseInt(yearsSlider ? yearsSlider.value : 20);

        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments = monthlyCommitments * 12;
        const lifeCover = (annualCommitments * years);
        const ciCover = 5 * monthlyCommitments * 12;

        animateCounter('result-life', lifeCover);
        animateCounter('result-ci', ciCover);

        setBreakdown({
            annualIncome, years, monthlyCommitments,
            annualCommitments, lifeCover, ciCover
        });

        if (resultsSection) {
            resultsSection.classList.add('visible');
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        const milestoneEl = document.getElementById('goal-milestone');
        currentResults = {
            lifeCover: lifeCover,
            ciCover: ciCover,
            annualIncome: annualIncome,
            goal: (milestoneEl && milestoneEl.value) ? milestoneEl.value : 'family',
            years: years
        };

        const gateName = document.getElementById('gate-name');
        const gateEmail = document.getElementById('gate-email');
        if (gateName && gateEmail && gateName.value && gateEmail.value) {
            sendResultsByEmail(gateName.value, gateEmail.value, currentResults);
        }
    }

    function setBreakdown(d) {
        safeSetText('bd-income', fmt(d.annualIncome));
        safeSetText('bd-years', d.years + ' years');
        safeSetText('bd-commitments', fmt(d.annualCommitments) + ' / yr');
        safeSetText('bd-total', 'RM ' + fmt(d.lifeCover));
        safeSetText('bd-ci-base', fmt(d.monthlyCommitments) + ' / mo');
        safeSetText('bd-ci-total', 'RM ' + fmt(d.ciCover));
    }

    function safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function fmt(n) {
        return Math.round(n).toLocaleString('en-MY');
    }

    function animateCounter(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        const duration = 1400;
        const fps = 60;
        const steps = Math.round(duration / (1000 / fps));
        let step = 0;
        function easeOut(t) { return 1 - Math.pow(1 - t, 3); }
        const timer = setInterval(() => {
            step++;
            const progress = easeOut(step / steps);
            el.textContent = 'RM ' + Math.round(target * progress).toLocaleString('en-MY');
            if (step >= steps) {
                el.textContent = 'RM ' + Math.round(target).toLocaleString('en-MY');
                clearInterval(timer);
            }
        }, 1000 / fps);
    }
});

// Helper for Modal switching
function openMedicalModal() {
    const medModal = document.getElementById('medical-modal');
    if (!medModal) return;
    medModal.classList.add('active');
}