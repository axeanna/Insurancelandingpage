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
    const rankingLists = document.querySelectorAll('.ranking-list');

    let pendingFormData = null;

    // Initialize SortableJS
    if (typeof Sortable !== 'undefined') {
        rankingLists.forEach(list => {
            new Sortable(list, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                handle: '.drag-handle' // Only allow dragging from the handle icon
            });
        });
    }

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
            // Compute rankings based on current DOM order
            // Find the active (visible) ranking list inside the modal
            const activeList = factFinderModal.querySelector('.ranking-list');
            if (activeList && pendingFormData) {
                const items = activeList.querySelectorAll('.ranking-item');
                items.forEach((item, index) => {
                    const category = item.getAttribute('data-category');
                    pendingFormData.append(category, index + 1); // 1 to 5
                });
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

                    // Reset ranking selections (not strictly necessary as page reload wipes state, but good practice)
                    // ...
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
