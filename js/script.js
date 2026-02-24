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
       4. Form Handling (Quotation Generation)
       ------------------------------------- */
    const quotationForm = document.getElementById('quotationForm');
    const formSuccess = document.getElementById('formSuccess');
    const resetFormBtn = document.getElementById('resetForm');

    if (quotationForm) {
        quotationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            // Basic validation check (built-in HTML5 validaton handles most of it due to 'required' attributes)
            if (quotationForm.checkValidity()) {
                // Collect form data (for potential API submission in the future)
                const formData = new FormData(quotationForm);
                const dataObj = Object.fromEntries(formData.entries());

                console.log('Quotation Request Submitted:', dataObj);

                // Send data to Google Apps Script Webhook
                fetch('https://script.google.com/macros/s/AKfycbzjFuplyMFZCEeSqB5HmUz3RQUUbFeSR_3RY4hN4EUfYleERu5YTRAYzfDMmXHb0XLp/exec', {
                    method: 'POST',
                    mode: 'no-cors',
                    body: formData
                })
                    .then(response => {
                        // Hide Form, Show Success Message
                        quotationForm.classList.add('hidden');
                        formSuccess.classList.remove('hidden');

                        // Reset button state
                        btn.textContent = originalText;
                        btn.disabled = false;
                        quotationForm.reset();
                    })
                    .catch(error => {
                        console.error('Error submitting form:', error);
                        alert('There was a problem submitting your request. Please try again.');
                        btn.textContent = originalText;
                        btn.disabled = false;
                    });
            }
        });
    }

    if (resetFormBtn) {
        resetFormBtn.addEventListener('click', () => {
            formSuccess.classList.add('hidden');
            quotationForm.classList.remove('hidden');
        });
    }

});
