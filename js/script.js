document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------------
       1. Mobile Navigation Toggle (Hamburger)
       ------------------------------------- */
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle && navLinks) {
        mobileToggle.addEventListener('click', () => {
            mobileToggle.classList.toggle('active');
            navLinks.classList.toggle('active');
            // Close any open product dropdowns when hamburger is toggled closed
            if (!navLinks.classList.contains('active')) {
                document.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('active'));
            }
        });

        // Close menu on regular link click (not the dropdown button)
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (link.classList.contains('nav-drop-btn') && window.innerWidth <= 992) {
                    return; // Let the dropdown handler take over
                }
                mobileToggle.classList.remove('active');
                navLinks.classList.remove('active');
                document.querySelectorAll('.nav-dropdown').forEach(dd => dd.classList.remove('active'));
            });
        });
    }

    /* -------------------------------------
       2. Mobile Dropdown Tap Toggle
          Toggles .active on .nav-dropdown when
          "Products ▾" is tapped on mobile.
          On desktop, CSS :hover handles it.
       ------------------------------------- */
    document.querySelectorAll('.nav-drop-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (window.innerWidth <= 992) {
                e.preventDefault();
                const parentDropdown = btn.closest('.nav-dropdown');
                if (parentDropdown) {
                    parentDropdown.classList.toggle('active');
                }
            }
        });
    });

    /* -------------------------------------
       3. Sticky Header Setup
       ------------------------------------- */
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
    }

    /* -------------------------------------
       4. Scroll Animations (Intersection Observer)
       ------------------------------------- */
    const animatedElements = document.querySelectorAll('.fade-in, .slide-in-left, .slide-in-right');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.15
    };

    const scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        scrollObserver.observe(el);
    });

});
