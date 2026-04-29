/**
 * calculator.js
 * Life Cover & Critical Illness Calculator logic
 */

// ⚠️ IMPORTANT: Replace the string below with your EmailJS Public Key
// Get it from: emailjs.com → Account → General → Public Key
emailjs.init('wqFxp4IHe9q_HnHIJ');

let currentResults = {};
const WEBHOOK_URL = "https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec";

function sendResultsByEmail(userName, userEmail, results) {
    const templateParams = {
        user_name: userName,
        user_email: userEmail,
        life_cover: results.lifeCover.toLocaleString('en-MY'),
        ci_cover: results.ciCover.toLocaleString('en-MY'),
        annual_income: results.annualIncome.toLocaleString('en-MY'),
        goal: 'family',
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
    
    // Reset text inputs for occupation/business
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
    // ---- Gender Card Styles for Main Form ----
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
    
    // Close modal handlers
    const closeModal = () => modal.classList.remove('active');
    if (btnClose) btnClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    // Handle form changes to validate and enforce business logic
    modal.addEventListener('change', validateModal);
    modal.addEventListener('input', validateModal); // for text inputs

    function validateModal() {
        const occVal = document.getElementById('modal_occupation')?.value.trim();
        const busVal = document.getElementById('modal_business')?.value.trim();
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
                if (consultRadio) {
                    consultRadio.checked = true;
                    contactVal = consultRadio.value;
                }
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

    // Submit Action
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
            submitBtn.innerText = originalBtnText === 'Submit Request' || originalBtnText === 'Hantar Permintaan' || originalBtnText.includes('Sending') ? 'Sending...' : 'Menghantar...';
            
            if (errorMsg) {
                errorMsg.style.display = 'none';
                errorMsg.textContent = '';
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

            emailjs.send('prudential_service', 'quotation_request', templateParams)
                .then(function() {
                    closeModal();
                    openMedicalModal();
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

    // Setup Medical Modal
    const medModal = document.getElementById('medical-modal');
    if (medModal) {
        const medClose = document.getElementById('medical-modal-close');
        const medSubmitBtn = document.getElementById('medical-submit-btn');
        const medCardYes = document.getElementById('med-card-yes');
        const medCardNo = document.getElementById('med-card-no');
        const medOptions = document.getElementById('medical-options-container');
        
        const closeMedModal = () => medModal.classList.remove('active');
        if (medClose) medClose.addEventListener('click', closeMedModal);
        
        medModal.addEventListener('click', (e) => {
            if (e.target === medModal) closeMedModal();
        });

        // Toggle cards
        [medCardYes, medCardNo].forEach(card => {
            if (!card) return;
            card.addEventListener('click', () => {
                const isYes = card.id === 'med-card-yes';
                
                if (medCardYes) medCardYes.classList.toggle('selected', isYes);
                if (medCardNo) medCardNo.classList.toggle('selected', !isYes);
                
                const yesInput = medCardYes.querySelector('input');
                const noInput = medCardNo.querySelector('input');
                if (yesInput) yesInput.checked = isYes;
                if (noInput) noInput.checked = !isYes;
                
                if (medOptions) {
                    medOptions.style.display = isYes ? 'block' : 'none';
                }
                
                validateMedModal();
            });
        });

        medModal.addEventListener('change', validateMedModal);

        function validateMedModal() {
            const medChoiceRaw = document.querySelector('input[name="modal_medical_card"]:checked')?.value;
            const annLimit = document.getElementById('modal_annual_limit')?.value;
            const deductible = document.getElementById('modal_deductible')?.value;
            
            let isValid = false;
            if (medChoiceRaw === 'No' || medChoiceRaw === 'Tidak') {
                isValid = true;
            } else if ((medChoiceRaw === 'Yes' || medChoiceRaw === 'Ya') && annLimit && deductible) {
                isValid = true;
            }
            
            if (medSubmitBtn) {
                medSubmitBtn.disabled = !isValid;
                medSubmitBtn.style.opacity = isValid ? '1' : '0.5';
                medSubmitBtn.style.cursor = isValid ? 'pointer' : 'not-allowed';
            }
        }
        
        if (medSubmitBtn) {
            medSubmitBtn.addEventListener('click', () => {
                const medChoiceRaw = document.querySelector('input[name="modal_medical_card"]:checked')?.value;
                const isMalay = medChoiceRaw === 'Ya' || medChoiceRaw === 'Tidak';
                const medChoice = (medChoiceRaw === 'Yes' || medChoiceRaw === 'Ya') ? 'Yes' : 'No';
                
                const annLimit = (medChoice === 'Yes') ? document.getElementById('modal_annual_limit')?.value : 'N/A';
                const deductible = (medChoice === 'Yes') ? document.getElementById('modal_deductible')?.value : 'N/A';
                
                const originalBtnText = medSubmitBtn.innerText;
                medSubmitBtn.disabled = true;
                medSubmitBtn.innerText = isMalay ? 'Menghantar...' : 'Sending...';
                
                const gateName = document.getElementById('gate-name');
                const gateEmail = document.getElementById('gate-email');
                
                const templateParams = {
                    user_name: gateName ? gateName.value : '',
                    user_email: gateEmail ? gateEmail.value : '',
                    medical_card: medChoice,
                    annual_limit: annLimit,
                    deductible: deductible
                };
                
                // Webhook Stage 3
                const params = new URLSearchParams();
                params.append("name", templateParams.user_name);
                params.append("email", templateParams.user_email);
                params.append("medical_card", medChoice);
                params.append("annual_limit", annLimit);
                params.append("deductible", deductible);
                
                fetch(WEBHOOK_URL, {
                    method: 'POST',
                    mode: 'no-cors',
                    body: params
                }).catch(err => console.error("Webhook Stage 3 error:", err));
                
                emailjs.send('prudential_service', 'medical_card_request', templateParams)
                    .then(() => {
                        closeMedModal();
                        showFinalConfirmation();
                    })
                    .catch((err) => {
                        console.error('EmailJS Error:', err);
                        closeMedModal();
                        showFinalConfirmation();
                    });
            });
        }
    }
});

function openMedicalModal() {
    const medModal = document.getElementById('medical-modal');
    if (!medModal) {
        showFinalConfirmation();
        return;
    }
    
    // Reset state
    const radios = medModal.querySelectorAll('input[type="radio"]');
    radios.forEach(r => r.checked = false);
    
    const medCardYes = document.getElementById('med-card-yes');
    const medCardNo = document.getElementById('med-card-no');
    if (medCardYes) medCardYes.classList.remove('selected');
    if (medCardNo) medCardNo.classList.remove('selected');
    
    const medOptions = document.getElementById('medical-options-container');
    if (medOptions) medOptions.style.display = 'none';
    
    const limitSelect = document.getElementById('modal_annual_limit');
    const deductSelect = document.getElementById('modal_deductible');
    if (limitSelect) limitSelect.value = '';
    if (deductSelect) deductSelect.value = '';
    
    const submitBtn = document.getElementById('medical-submit-btn');
    if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.5';
        submitBtn.style.cursor = 'not-allowed';
    }
    
    medModal.classList.add('active');
}

function showFinalConfirmation() {
    const mainReqBtn = document.getElementById('request-quote-btn');
    const confirmMsg = document.getElementById('quote-confirm');
    
    if (mainReqBtn) mainReqBtn.style.display = 'none';
    if (confirmMsg) {
        const isMalay = document.documentElement.lang === 'ms' || document.title.includes('Kalkulator');
        confirmMsg.innerHTML = isMalay 
            ? "✅ Terima kasih! Anna akan mengambil kira pilihan ini dalam sebut harga anda."
            : "✅ Thanks! Anna will factor this into your quotation.";
        confirmMsg.style.display = 'block';
    }
}

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
       1. Years Slider
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
       2. Calculate Button → Gate
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
       3. Gate — Consent Checkbox Enables Button
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
       4. Gate — Unlock
       ============================================= */
    if (unlockBtn) {
        unlockBtn.addEventListener('click', () => {
            if (consentCheckbox && !consentCheckbox.checked) {
                const consentError = document.getElementById('consent-error');
                if (consentError) consentError.classList.add('visible');
                return;
            }

            const nameInput  = document.getElementById('gate-name');
            const emailInput = document.getElementById('gate-email');
            const nameError  = document.getElementById('gate-name-error');
            const emailError = document.getElementById('gate-email-error');

            const calcGender = document.querySelector('input[name="calc_gender"]:checked')?.value;

            let valid = true;

            if (nameError)  nameError.classList.remove('visible');
            if (emailError) emailError.classList.remove('visible');

            if (!calcGender) {
                const isMalay = document.documentElement.lang === 'ms' || document.title.includes('Kalkulator');
                alert(isMalay ? "Sila pilih Jantina anda dalam borang sebelum meneruskan." : "Please select your Gender in the form before proceeding.");
                valid = false;
            }

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

            if (!valid) {
                const card = document.querySelector('.gate-card');
                if (card) {
                    card.style.animation = 'none';
                    card.offsetHeight; // reflow
                    card.style.animation = 'shake 0.35s ease';
                }
                return;
            }

            const nameVal = nameInput.value.trim();
            const emailVal = emailInput.value.trim();
            try {
                localStorage.setItem('calc_lead', JSON.stringify({
                    name:  nameVal,
                    email: emailVal,
                    ts:    new Date().toISOString()
                }));
            } catch (e) { }

            sendWebhookStage1(nameVal, emailVal, calcGender);

            gateCleared = true;
            if (gateOverlay) gateOverlay.classList.remove('active');
            computeAndShowResults();
        });
    }

    if (gateOverlay) {
        gateOverlay.addEventListener('click', e => {
            if (e.target === gateOverlay) {
                gateOverlay.classList.remove('active');
            }
        });
    }

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

    function sendWebhookStage1(name, email, gender) {
        const annualIncome = getVal('income');
        const housing      = getVal('housing');
        const car          = getVal('car');
        const bills        = getVal('bills');
        const others       = getVal('others');
        const education    = getVal('education');
        const parents      = getVal('parents');
        const years        = parseInt(yearsSlider ? yearsSlider.value : 20);

        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments  = monthlyCommitments * 12;
        const lifeCover = (annualCommitments * years);
        const ciCover = 5 * monthlyCommitments * 12;

        const milestoneEl = document.getElementById('goal-milestone');
        const goalVal = (milestoneEl && milestoneEl.value) ? milestoneEl.value : 'family';

        const params = new URLSearchParams();
        params.append("name", name);
        params.append("email", email);
        params.append("gender", gender || '');
        params.append("goal", goalVal);
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

        fetch(WEBHOOK_URL, {
            method: 'POST',
            mode: 'no-cors',
            body: params
        }).catch(err => console.error("Webhook Stage 1 error:", err));
    }

    function computeAndShowResults() {
        const annualIncome = getVal('income');
        const housing      = getVal('housing');
        const car          = getVal('car');
        const bills        = getVal('bills');
        const others       = getVal('others');
        const education    = getVal('education');
        const parents      = getVal('parents');
        const years        = parseInt(yearsSlider ? yearsSlider.value : 20);

        const monthlyCommitments = housing + car + bills + others + education + parents;
        const annualCommitments  = monthlyCommitments * 12;

        const lifeCover = (annualCommitments * years);
        const ciCover = 5 * monthlyCommitments * 12;

        animateCounter('result-life', lifeCover);
        animateCounter('result-ci',   ciCover);

        setBreakdown({
            annualIncome, years, monthlyCommitments,
            annualCommitments, lifeCover, ciCover,
            education, parents, housing, car
        });

        if (resultsSection) {
            resultsSection.classList.add('visible');
            setTimeout(() => {
                resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }

        const milestoneEl = document.getElementById('goal-milestone');
        const goalVal = (milestoneEl && milestoneEl.value) ? milestoneEl.value : 'family';

        currentResults = {
            lifeCover: lifeCover,
            ciCover: ciCover,
            annualIncome: annualIncome,
            goal: goalVal,
            years: years
        };

        const gateName = document.getElementById('gate-name');
        const gateEmail = document.getElementById('gate-email');
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
       7. Sticky Navbar
       ============================================= */
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            navbar.classList.toggle('scrolled', window.scrollY > 50);
        });
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

    document.querySelectorAll('.calc-input[type="number"]').forEach(input => {
        input.addEventListener('wheel', e => e.preventDefault(), { passive: false });
    });
});
