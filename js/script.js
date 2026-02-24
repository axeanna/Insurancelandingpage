document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------
       1. Mobile Navigation Toggle
       ------------------------------------- */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
        });

        // Close menu on link click
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
            });
        });
    }

    /* -------------------------------------
       2. Sticky Header Setup
       ------------------------------------- */
    const navbar = document.querySelector('.navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    /* -------------------------------------
       3. Scroll Animations (Intersection Observer)
       ------------------------------------- */
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Stop observing once animated to keep it visible
                // observer.unobserve(entry.target); 
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

    /* -------------------------------------
       4. Form Handling & Fact-Finder Modal
       ------------------------------------- */
    const quotationForm = document.getElementById('quotationForm');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetForm');

    // Modal Elements
    const factFinderModal = document.getElementById('factFinderModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const submitFinalBtn = document.getElementById('submitFinalBtn');
    const modalError = document.getElementById('modalError');
    const rankingOptionsGroups = document.querySelectorAll('.ranking-options');

    let pendingFormData = null;
    let rankings = {
        family_rank: null,
        income_rank: null,
        accident_rank: null,
        medical_rank: null,
        investment_rank: null
    };

    // Handle Ranking Button Clicks
    rankingOptionsGroups.forEach(group => {
        const category = group.getAttribute('data-category');
        const buttons = group.querySelectorAll('.rank-btn');

        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove selected class from all buttons in this row
                buttons.forEach(b => b.classList.remove('selected'));
                // Add selected class to the clicked one
                btn.classList.add('selected');
                // Save the ranking
                rankings[category] = btn.getAttribute('data-value');
                // Hide error message if active
                if (modalError) modalError.classList.add('hidden');
            });
        });
    });

    if (quotationForm) {
        quotationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic validation check
            if (quotationForm.checkValidity()) {
                // Save the formData temporarily
                pendingFormData = new FormData(quotationForm);

                // Unhide the Fact-Finder Modal
                if (factFinderModal) {
                    factFinderModal.classList.remove('hidden');
                }
            } else {
                quotationForm.reportValidity();
            }
        });
    }

    // Modal Cancel Button
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            factFinderModal.classList.add('hidden');
        });
    }

    // Modal Final Submit Button
    if (submitFinalBtn) {
        submitFinalBtn.addEventListener('click', () => {
            // Validate all 5 questions are answered
            if (!rankings.family_rank || !rankings.income_rank || !rankings.accident_rank || !rankings.medical_rank || !rankings.investment_rank) {
                if (modalError) modalError.classList.remove('hidden');
                return;
            }

            // Append rankings to pending FormData
            for (const [key, value] of Object.entries(rankings)) {
                pendingFormData.append(key, value);
            }

            // Update button UI
            const originalText = submitFinalBtn.textContent;
            submitFinalBtn.textContent = 'Processing...';
            submitFinalBtn.disabled = true;

            // Convert FormData to URLSearchParams
            const formEncodedData = new URLSearchParams(pendingFormData);

            // Send data to Google Apps Script Webhook
            fetch('https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec', {
                method: 'POST',
                mode: 'no-cors',
                body: formEncodedData
            })
                .then(response => {
                    // Hide Modal and original Form, Show Success
                    factFinderModal.classList.add('hidden');
                    quotationForm.classList.add('hidden');
                    formSuccess.classList.remove('hidden');

                    // Reset button state
                    submitFinalBtn.textContent = originalText;
                    submitFinalBtn.disabled = false;
                    quotationForm.reset();

                    // Reset ranking selections
                    document.querySelectorAll('.rank-btn').forEach(b => b.classList.remove('selected'));
                    for (let key in rankings) rankings[key] = null;
                })
                .catch(error => {
                    console.error('Error submitting form:', error);
                    alert('There was a problem submitting your request. Please try again.');
                    submitFinalBtn.textContent = originalText;
                    submitFinalBtn.disabled = false;
                });
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            formSuccess.classList.add('hidden');
            quotationForm.classList.remove('hidden');
        });
    }

});
