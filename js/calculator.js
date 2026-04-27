/**
 * calculator.js
 * Life Cover & Critical Illness Calculator logic
 */

// ⚠️ IMPORTANT: Replace the string below with your EmailJS Public Key
// Get it from: emailjs.com → Account → General → Public Key
emailjs.init('YOUR_PUBLIC_KEY_HERE');

let currentResults = {};

function sendResultsByEmail(userName, userEmail, results) {
    const templateParams = {
        user_name: userName,
        user_email: userEmail,
        life_cover: results.lifeCover.toLocaleString('en-MY'),
        ci_cover: results.ciCover.toLocaleString('en-MY'),
        annual_income: results.annualIncome.toLocaleString('en-MY'),
        goal: results.goal,
        years: results.years
    };

    emailjs.send('prudential_service', 'calculator_results', templateParams)
        .then(function() {
            console.log('Email sent successfully');
        }, function(error) {
            console.log('Email failed:', error);
        });
}

function requestQuotation() {
    const modal = document.getElementById('quote-modal');
    if (!modal) return;
    
    // Reset modal state
    const radios = modal.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.checked = false);
    
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
    if (cardConsult) {
        cardConsult.classList.remove('selected');
    }
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

    // Show modal
    modal.classList.add('active');
}

// Modal Event Listeners (Setup once on DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
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
    
    // Close modal handlers
    const closeModal = () => modal.classList.remove('active');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle form changes to validate and enforce business logic
    modal.addEventListener('change', () => {
        const genderVal = document.querySelector('input[name="modal_gender"]:checked')?.value;
        const smokerVal = document.querySelector('input[name="modal_smoker"]:checked')?.value;
        const medicalVal = document.querySelector('input[name="modal_medical"]:checked')?.value;
        const coverageVal = document.querySelector('input[name="modal_coverage"]:checked')?.value;
        let contactVal = document.querySelector('input[name="modal_contact"]:checked')?.value;

        // Medical conditions logic
        if (medicalVal === 'Yes' || medicalVal === 'Ya') {
            medicalDescContainer.style.display = 'block';
            
            // Disable email only option
            if (cardEmail) {
                cardEmail.classList.add('disabled');
                cardEmail.querySelector('input').disabled = true;
            }
            if (emailNote) emailNote.style.display = 'block';
            
            // Auto-switch to consultation if email was selected
            if (contactVal && (contactVal.includes('Email') || contactVal.includes('e-mel'))) {
                const consultRadio = cardConsult.querySelector('input');
                consultRadio.checked = true;
                contactVal = consultRadio.value;
                if (cardEmail) cardEmail.classList.remove('selected');
                if (cardConsult) cardConsult.classList.add('selected');
            }
        } else {
            medicalDescContainer.style.display = 'none';
            // Re-enable email only option
            if (cardEmail) {
                cardEmail.classList.remove('disabled');
                cardEmail.querySelector('input').disabled = false;
            }
            if (emailNote) emailNote.style.display = 'none';
        }

        // Existing Coverage Logic
        if (coverageVal === 'Yes' || coverageVal === 'Ya') {
            coverageAmountsContainer.style.display = 'block';
        } else {
            coverageAmountsContainer.style.display = 'none';
        }

        // Update card selected styling
        if (cardEmail) cardEmail.classList.toggle('selected', cardEmail.querySelector('input').checked);
        if (cardConsult) cardConsult.classList.toggle('selected', cardConsult.querySelector('input').checked);

        // Validation logic to enable submit button
        let isValid = genderVal && smokerVal && medicalVal && contactVal && coverageVal;
        console.log({ genderVal, smokerVal, medicalVal, contactVal, coverageVal, isValid });
        
        if ((medicalVal === 'Yes' || medicalVal === 'Ya') && medicalDescInput.value.trim() === '') {
            isValid = false;
        }

        if (submitBtn) {
            submitBtn.disabled = !isValid;
            submitBtn.style.opacity = isValid ? '1' : '0.5';
            submitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
        }
    });

    // Listen to text area input for validation update
    if (medicalDescInput) {
        medicalDescInput.addEventListener('input', () => {
            const event = new Event('change', { bubbles: true });
            modal.dispatchEvent(event);
        });
    }

    // Submit Action
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            const genderVal = document.querySelector('input[name="modal_gender"]:checked')?.value;
            const smokerVal = document.querySelector('input[name="modal_smoker"]:checked')?.value;
            const medicalVal = document.querySelector('input[name="modal_medical"]:checked')?.value;
            const coverageVal = document.querySelector('input[name="modal_coverage"]:checked')?.value;
            const contactVal = document.querySelector('input[name="modal_contact"]:checked')?.value;
            const medicalDesc = medicalDescInput.value.trim();
            
            const existingLife = document.getElementById('modal_existing_life')?.value || '0';
            const existingCi = document.getElementById('modal_existing_ci')?.value || '0';

            const finalMedicalText = (medicalVal === 'Yes' || medicalVal === 'Ya') ? medicalDesc : medicalVal;
            
            const finalExistingLifeText = (coverageVal === 'Yes' || coverageVal === 'Ya') ? existingLife : 'None';
            const finalExistingCiText = (coverageVal === 'Yes' || coverageVal === 'Ya') ? existingCi : 'None';

            const originalBtnText = submitBtn.innerText;
            submitBtn.disabled = true;
            submitBtn.innerText = originalBtnText === 'Submit Request' ? 'Sending...' : 'Menghantar...';
            
            if (errorMsg) {
                errorMsg.style.display = 'none';
                errorMsg.textContent = '';
            }

            const gateName = document.getElementById('gate-name');
            const gateEmail = document.getElementById('gate-email');
            const gateOccupation = document.getElementById('gate-occupation');
            const gateBusiness = document.getElementById('gate-business');

            const templateParams = {
                user_name: gateName ? gateName.value : '',
                user_email: gateEmail ? gateEmail.value : '',
                occupation: gateOccupation ? gateOccupation.value : '',
                nature_of_business: gateBusiness ? gateBusiness.value : '',
                life_cover: currentResults.lifeCover ? currentResults.lifeCover.toLocaleString('en-MY') : '0',
                ci_cover: currentResults.ciCover ? currentResults.ciCover.toLocaleString('en-MY') : '0',
                annual_income: currentResults.annualIncome ? currentResults.annualIncome.toLocaleString('en-MY') : '0',
                goal: currentResults.goal || '',
                years: currentResults.years || 0,
                gender: genderVal,
                smoker_status: smokerVal,
                medical_conditions: finalMedicalText,
                existing_life_cover: finalExistingLifeText,
                existing_ci_cover: finalExistingCiText,
                contact_preference: contactVal
            };

            emailjs.send('prudential_service', 'quotation_request', templateParams)
                .then(function() {
                    closeModal();
                    const mainReqBtn = document.getElementById('request-quote-btn');
                    const confirmMsg = document.getElementById('quote-confirm');
                    if (mainReqBtn) mainReqBtn.style.display = 'none';
                    if (confirmMsg) confirmMsg.style.display = 'block';
                }, function(error) {
                    submitBtn.disabled = false;
                    submitBtn.innerText = originalBtnText;
                    if (errorMsg) {
                        errorMsg.textContent = 'Something went wrong. Please try again or WhatsApp Anna directly.';
                        errorMsg.style.display = 'block';
                    }
                    console.error('EmailJS Error:', error);
                });
        });
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // Populate DOB dropdowns
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

    /* =============================================
       1. Goal Tab Switching
       ============================================= */
    const goalTabs      = document.querySelectorAll('.goal-tab');
    const educationField = document.getElementById('field-education');
    const parentsField   = document.getElementById('field-parents');

    let currentGoal = 'family';

    goalTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            goalTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            currentGoal = tab.dataset.goal;
            updateConditionalFields();
        });
    });

    function updateConditionalFields() {
        // Hide all conditional fields first
        if (educationField) educationField.classList.remove('visible');
        if (parentsField)   parentsField.classList.remove('visible');

        if (currentGoal === 'education' && educationField) {
            educationField.classList.add('visible');
        } else if (currentGoal === 'parents' && parentsField) {
            parentsField.classList.add('visible');
        } else if (currentGoal === 'family') {
            // Family = kids education + supporting parents
            if (educationField) educationField.classList.add('visible');
            if (parentsField)   parentsField.classList.add('visible');
        }
    }

    // Trigger initial state
    updateConditionalFields();

    /* =============================================
       2. Years Slider
       ============================================= */
    const yearsSlider  = document.getElementById('years-slider');
    const yearsDisplay = document.getElementById('years-display');

    function syncSlider(slider) {
        const min  = parseFloat(slider.min) || 0;
        const max  = parseFloat(slider.max) || 100;
        const val  = parseFloat(slider.value);
        const pct  = ((val - min) / (max - min)) * 100;
        slider.style.setProperty('--val', pct + '%');
    }

    if (yearsSlider) {
        yearsSlider.addEventListener('input', () => {
            if (yearsDisplay) yearsDisplay.textContent = yearsSlider.value;
            syncSlider(yearsSlider);
        });
        syncSlider(yearsSlider);
    }

    /* =============================================
       3. Calculate Button → Gate
       ============================================= */
    const calculateBtn  = document.getElementById('calculate-btn');
    const gateOverlay   = document.getElementById('gate-overlay');
    const unlockBtn     = document.getElementById('unlock-btn');
    const resultsSection = document.getElementById('results-section');

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

    /* =============================================
       4. Gate — Consent Checkbox Enables Button
       ============================================= */
    const consentCheckbox = document.getElementById('consent-checkbox');
    if (consentCheckbox && unlockBtn) {
        consentCheckbox.addEventListener('change', () => {
            unlockBtn.disabled = !consentCheckbox.checked;
            unlockBtn.style.opacity  = consentCheckbox.checked ? '1'           : '0.45';
            unlockBtn.style.cursor   = consentCheckbox.checked ? 'pointer'     : 'not-allowed';
        });
    }

    /* =============================================
       5. Gate — Unlock
       ============================================= */
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            // Gate is disabled when unchecked, but double-check for safety
            if (consentCheckbox && !consentCheckbox.checked) {
                const consentError = document.getElementById('consent-error');
                if (consentError) consentError.classList.add('visible');
                return;
            }

            const nameInput  = document.getElementById('gate-name');
            const emailInput = document.getElementById('gate-email');
            const occupationInput = document.getElementById('gate-occupation');
            const businessInput = document.getElementById('gate-business');
            const nameError  = document.getElementById('gate-name-error');
            const emailError = document.getElementById('gate-email-error');
            const occupationError = document.getElementById('gate-occupation-error');
            const businessError = document.getElementById('gate-business-error');

            let valid = true;

            // Reset errors
            if (nameError)  nameError.classList.remove('visible');
            if (emailError) emailError.classList.remove('visible');
            if (occupationError) occupationError.classList.remove('visible');
            if (businessError) businessError.classList.remove('visible');

            if (!nameInput || nameInput.value.trim() === '') {
                if (nameError) nameError.classList.add('visible');
                if (nameInput) nameInput.focus();
                valid = false;
            }

            if (!emailInput || emailInput.value.trim() === '') {
                if (emailError) emailError.classList.add('visible');
                if (valid && emailInput) emailInput.focus();
                valid = false;
            } else {
                // Block disposable/fake email domains
                const disposableDomains = [
                    'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
                    'yopmail.com', 'sharklasers.com', 'grr.la', 'trashmail.com',
                    'dispostable.com', 'fakeinbox.com', 'mailnull.com', 'spam4.me',
                    'getairmail.com', 'filzmail.com', 'throwam.com', 'maildrop.cc',
                    'discard.email', '10minutemail.com', 'tempinbox.com', 'mailnesia.com',
                    'tempr.email', 'guerrillamailblock.com', 'spamgourmet.com'
                ];
                const emailDomain = emailInput.value.trim().split('@')[1]?.toLowerCase();
                if (emailDomain && disposableDomains.includes(emailDomain)) {
                    if (emailError) {
                        emailError.textContent = 'Please use a valid personal or work email.';
                        emailError.classList.add('visible');
                    }
                    if (valid) emailInput.focus();
                    valid = false;
                }
            }

            if (!occupationInput || occupationInput.value.trim() === '') {
                if (occupationError) occupationError.classList.add('visible');
                if (valid && occupationInput) occupationInput.focus();
                valid = false;
            }

            if (!businessInput || businessInput.value.trim() === '') {
                if (businessError) businessError.classList.add('visible');
                if (valid && businessInput) businessInput.focus();
                valid = false;
            }

            if (!valid) {
                const card = document.querySelector('.gate-card');
                if (card) {
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = 'shake 0.35s ease';
                }
                return;
            }

            // Store locally and send to webhook
            const nameVal = nameInput.value.trim();
            const emailVal = emailInput.value.trim();
            const occupationVal = occupationInput ? occupationInput.value.trim() : '';
            const businessVal = businessInput ? businessInput.value.trim() : '';
            try {
                localStorage.setItem('calc_lead', JSON.stringify({
                    name:  nameVal,
                    email: emailVal,
                    occupation: occupationVal,
                    nature_of_business: businessVal,
                    ts:    new Date().toISOString()
                }));
            } catch (e) { /* ignore */ }

            sendWebhook(nameVal, emailVal, occupationVal, businessVal);

            gateCleared = true;
            if (gateOverlay) gateOverlay.classList.remove('active');
            computeAndShowResults();
        });
    }

    // Close gate on backdrop click
    if (gateOverlay) {
        gateOverlay.addEventListener('click', e => {
            if (e.target === gateOverlay) {
                gateOverlay.classList.remove('active');
            }
        });
    }

    // Close gate on Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && gateOverlay && gateOverlay.classList.contains('active')) {
            gateOverlay.classList.remove('active');
        }
    });

    /* =============================================
       5. Compute Results
       ============================================= */
    function getVal(id) {
        const el = document.getElementById(id);
        return el ? (parseFloat(el.value.replace(/,/g, '')) || 0) : 0;
    }

    function sendWebhook(name, email, occupation, natureOfBusiness) {
        const dobInput     = document.getElementById('dob');
        const dob          = dobInput ? dobInput.value : '';
        const annualIncome = getVal('income');
        const housing      = getVal('housing');
        const car          = getVal('car');
        const bills        = getVal('bills');
        const others       = getVal('others');
        const education    = (currentGoal === 'education' || currentGoal === 'family') ? getVal('education') : 0;
        const parents      = (currentGoal === 'parents'   || currentGoal === 'family') ? getVal('parents')   : 0;
        const years        = parseInt(yearsSlider ? yearsSlider.value : 20);

        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments  = monthlyCommitments * 12;
        const lifeCover = (annualCommitments * years);
        const ciCover = 5 * monthlyCommitments * 12;

        const url = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec";
        
        const params = new URLSearchParams();
        params.append("name", name);
        params.append("email", email);
        params.append("occupation", occupation || '');
        params.append("nature_of_business", natureOfBusiness || '');
        params.append("dob", dob);
        params.append("goal", currentGoal);
        params.append("annual_income", annualIncome);
        params.append("housing", housing);
        params.append("car", car);
        params.append("bills", bills);
        params.append("others", others);
        params.append("education", education);
        params.append("parents", parents);
        params.append("years", years);
        params.append("life_cover", lifeCover);
        params.append("ci_cover", ciCover);
        params.append("source", "Life Cover Calculator");

        fetch(url, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        }).catch(err => console.error("Webhook error:", err));
    }

    function computeAndShowResults() {
        const annualIncome = getVal('income');
        const housing      = getVal('housing');
        const car          = getVal('car');
        const bills        = getVal('bills');
        const others       = getVal('others');  // optional
        const education    = (currentGoal === 'education' || currentGoal === 'family') ? getVal('education') : 0;
        const parents      = (currentGoal === 'parents'   || currentGoal === 'family') ? getVal('parents')   : 0;
        const years        = parseInt(yearsSlider ? yearsSlider.value : 20);

        // Total monthly commitments (including bills, necessities & optional others)
        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments  = monthlyCommitments * 12;

        // Life Cover = annual commitments × years
        const lifeCover = (annualCommitments * years);

        // Critical Illness = 5 × monthly commitments × 12
        // (covers 3–7 years of recovery, using 5x as mid-point)
        const ciCover = 5 * monthlyCommitments * 12;

        // ---- Update result cards ----
        animateCounter('result-life', lifeCover);
        animateCounter('result-ci',   ciCover);

        // ---- Update breakdown ----
        setBreakdown({
            annualIncome, years, monthlyCommitments,
            annualCommitments, lifeCover, ciCover,
            education, parents, housing, car
        });

        // ---- Show results ----
        if (resultsSection) {
            resultsSection.classList.add('visible');
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        // Store results globally for EmailJS quotation request
        currentResults = {
            lifeCover: lifeCover,
            ciCover: ciCover,
            annualIncome: annualIncome,
            goal: currentGoal,
            years: years
        };

        // Send EmailJS results automatically
        const gateName = document.getElementById('gate-name');
        const gateEmail = document.getElementById('gate-email');
        const gateOccupation = document.getElementById('gate-occupation');
        const gateBusiness = document.getElementById('gate-business');
        if (gateName && gateEmail && gateName.value && gateEmail.value) {
            sendResultsByEmail(gateName.value, gateEmail.value, currentResults);
        }
    }

    function setBreakdown(d) {
        safeSetText('bd-income',      fmt(d.annualIncome));
        safeSetText('bd-years',       d.years + ' years');
        safeSetText('bd-commitments', fmt(d.annualCommitments) + ' / yr');
        safeSetText('bd-total',       'RM ' + fmt(d.lifeCover));
        safeSetText('bd-ci-base',     fmt(d.monthlyCommitments) + ' / mo');
        safeSetText('bd-ci-total',    'RM ' + fmt(d.ciCover));
    }

    function safeSetText(id, text) {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    }

    function fmt(n) {
        return Math.round(n).toLocaleString('en-MY');
    }

    /* =============================================
       6. Animated Counter
       ============================================= */
    function animateCounter(id, target) {
        const el = document.getElementById(id);
        if (!el) return;

        const duration = 1400;
        const fps      = 60;
        const steps    = Math.round(duration / (1000 / fps));
        let   step     = 0;

        // Ease-out cubic
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

    /* =============================================
       7. Sticky Navbar (reuse from script.js pattern)
       ============================================= */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
        // Calculator pages start with scrolled style
        navbar.classList.add('scrolled');
    }

    /* =============================================
       8. Scroll Animations
       ============================================= */
    const animatedEls = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.12 });

    animatedEls.forEach(el => observer.observe(el));

    /* =============================================
       9. Format inputs as user types (optional UX)
       ============================================= */
    document.querySelectorAll('.calc-input[type="number"]').forEach(input => {
        input.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    });
});
