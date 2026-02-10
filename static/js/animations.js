/* =============================================
   TOMATO AI — GSAP + Lenis Animations
   Premium scroll-driven experience
   ============================================= */

// ===== LENIS SMOOTH SCROLL =====
(function initLenis() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 0.8,
        touchMultiplier: 1.5,
        infinite: false,
    });

    // Connect Lenis to GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });

        gsap.ticker.lagSmoothing(0);
    } else {
        function raf(time) {
            lenis.raf(time);
            requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
    }

    // Expose lenis globally for anchor links
    window.__lenis = lenis;

    // Handle anchor clicks smoothly via lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, { offset: -60 });
            }
        });
    });

    // Override smoothScrollTo to use lenis
    window.smoothScrollTo = function(selector) {
        const el = document.querySelector(selector);
        if (el && window.__lenis) {
            window.__lenis.scrollTo(el, { offset: -60 });
        }
    };
})();

// ===== GSAP ANIMATIONS =====
(function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // ---- Hero Section Timeline ----
    const heroTl = gsap.timeline({
        defaults: { ease: 'power3.out', duration: 1 },
        delay: 1 // Wait for page loader
    });

    heroTl
        .fromTo('.hero-badge',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 }
        )
        .fromTo('.title-line',
            { opacity: 0, y: 60, rotationX: 20 },
            { opacity: 1, y: 0, rotationX: 0, stagger: 0.12 },
            '-=0.6'
        )
        .fromTo('.hero-subtitle',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 },
            '-=0.5'
        )
        .fromTo('.hero-actions',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 },
            '-=0.4'
        )
        .fromTo('.hero-stats',
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0 },
            '-=0.3'
        )
        .fromTo('.hero-visual',
            { opacity: 0, x: 60, scale: 0.9 },
            { opacity: 1, x: 0, scale: 1, duration: 1.2 },
            '-=1'
        )
        .fromTo('.scroll-indicator',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0 },
            '-=0.4'
        );

    // ---- Section Headers ----
    gsap.utils.toArray('[data-animate="reveal"]').forEach(el => {
        gsap.fromTo(el,
            { opacity: 0, y: 50 },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ---- Cards Reveal ----
    gsap.utils.toArray('[data-animate="reveal-card"]').forEach(el => {
        const delay = parseFloat(el.dataset.delay) || 0;
        gsap.fromTo(el,
            { opacity: 0, y: 40, scale: 0.96 },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.7,
                delay: delay,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // ---- Step Cards Stagger ----
    gsap.fromTo('.step-card',
        { opacity: 0, y: 60, rotationY: 8 },
        {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: 0.8,
            stagger: 0.15,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.steps-grid',
                start: 'top 80%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Insight Cards Stagger ----
    gsap.fromTo('.insight-card',
        { opacity: 0, y: 50, scale: 0.9 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.insights-grid',
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Stats Cards ----
    gsap.fromTo('.stats-card',
        { opacity: 0, y: 40, scale: 0.92 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.6,
            stagger: 0.1,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.stats-row',
                start: 'top 82%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Disease Cards ----
    gsap.fromTo('.disease-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            stagger: 0.08,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.diseases-grid',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Upload Zone ----
    gsap.fromTo('.upload-zone',
        { opacity: 0, y: 40, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.8,
            ease: 'power3.out',
            scrollTrigger: {
                trigger: '.upload-zone',
                start: 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Parallax Background Shapes ----
    gsap.utils.toArray('.hero-shape').forEach((shape, i) => {
        gsap.to(shape, {
            y: (i + 1) * -80,
            ease: 'none',
            scrollTrigger: {
                trigger: '.hero-section',
                start: 'top top',
                end: 'bottom top',
                scrub: 1.5
            }
        });
    });

    // ---- Navbar Parallax ----
    ScrollTrigger.create({
        trigger: '.hero-section',
        start: 'top top',
        end: 'bottom top',
        onUpdate: (self) => {
            const progress = self.progress;
            const navbar = document.getElementById('navbar');
            if (navbar) {
                navbar.style.transform = `translateY(${progress > 0.1 ? 0 : -100}%)`;
            }
        }
    });

    // ---- Floating Animation for Hero Visual ----
    gsap.to('.hero-visual', {
        y: 15,
        duration: 3,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true
    });

    // ---- Footer Reveal ----
    gsap.fromTo('.footer',
        { opacity: 0 },
        {
            opacity: 1,
            duration: 0.6,
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 95%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Magnetic Button Effect ----
    document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;
            gsap.to(btn, {
                x: x * 0.15,
                y: y * 0.15,
                duration: 0.3,
                ease: 'power2.out'
            });
        });

        btn.addEventListener('mouseleave', () => {
            gsap.to(btn, {
                x: 0,
                y: 0,
                duration: 0.5,
                ease: 'elastic.out(1, 0.5)'
            });
        });
    });

    // ---- Tilt Effect on Cards ----
    document.querySelectorAll('.step-card, .insight-card, .stats-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(card, {
                rotationY: x * 8,
                rotationX: -y * 8,
                transformPerspective: 800,
                duration: 0.4,
                ease: 'power2.out'
            });
        });

        card.addEventListener('mouseleave', () => {
            gsap.to(card, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.6,
                ease: 'elastic.out(1, 0.6)'
            });
        });
    });

})();
