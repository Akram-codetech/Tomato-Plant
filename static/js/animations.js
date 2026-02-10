/* =============================================
   TOMATO AI — GSAP + Lenis Animations
   Ultra-smooth scroll-driven experience
   ============================================= */

// ===== DEVICE DETECTION =====
const isMobile = window.innerWidth < 769;
const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ===== LENIS SMOOTH SCROLL =====
(function initLenis() {
    if (typeof Lenis === 'undefined') return;

    const lenis = new Lenis({
        duration: isMobile ? 1.6 : 1.4,
        easing: (t) => {
            // Custom silk easing — smoother than default
            return t === 1 ? 1 : 1 - Math.pow(2, -12 * t);
        },
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: isMobile ? 0.6 : 0.8,
        touchMultiplier: isMobile ? 1.2 : 1.5,
        infinite: false,
        lerp: isMobile ? 0.08 : 0.1,
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

    // Expose lenis globally
    window.__lenis = lenis;

    // Handle anchor clicks smoothly via lenis
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                lenis.scrollTo(target, {
                    offset: isMobile ? -40 : -60,
                    duration: isMobile ? 1.8 : 1.4,
                });
            }
        });
    });

    // Override smoothScrollTo to use lenis
    window.smoothScrollTo = function(selector) {
        const el = document.querySelector(selector);
        if (el && window.__lenis) {
            window.__lenis.scrollTo(el, {
                offset: isMobile ? -40 : -60,
                duration: isMobile ? 1.8 : 1.4,
            });
        }
    };
})();

// ===== GSAP ANIMATIONS =====
(function initGSAPAnimations() {
    if (typeof gsap === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // ---- Global GSAP defaults for silky feel ----
    gsap.defaults({
        ease: 'power4.out',
        overwrite: 'auto',
    });

    // ---- Custom eases ----
    const silkEase = 'power4.out';
    const butterEase = 'expo.out';
    const springEase = 'elastic.out(0.8, 0.6)';

    // ---- Mobile-friendly durations ----
    const dur = (desktop, mobile) => isMobile ? mobile : desktop;

    // ---- Hero Section Timeline — buttery entrance ----
    const heroTl = gsap.timeline({
        defaults: { ease: butterEase, duration: dur(1.2, 1) },
        delay: 0.8
    });

    heroTl
        .fromTo('.hero-badge',
            { opacity: 0, y: 20, filter: 'blur(8px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur(0.9, 0.7) }
        )
        .fromTo('.title-line',
            { opacity: 0, y: 50, filter: 'blur(6px)' },
            {
                opacity: 1, y: 0, filter: 'blur(0px)',
                stagger: dur(0.1, 0.08),
                duration: dur(1.1, 0.9),
                ease: silkEase
            },
            '-=0.5'
        )
        .fromTo('.hero-subtitle',
            { opacity: 0, y: 24, filter: 'blur(4px)' },
            { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur(1, 0.8) },
            '-=0.6'
        )
        .fromTo('.hero-actions',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: dur(0.8, 0.7) },
            '-=0.5'
        )
        .fromTo('.hero-stats',
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: dur(0.8, 0.7) },
            '-=0.4'
        )
        .fromTo('.hero-visual',
            { opacity: 0, x: isMobile ? 0 : 40, scale: 0.92, filter: 'blur(10px)' },
            {
                opacity: 1, x: 0, scale: 1, filter: 'blur(0px)',
                duration: dur(1.4, 1),
                ease: silkEase
            },
            '-=1.2'
        )
        .fromTo('.scroll-indicator',
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.6 },
            '-=0.3'
        );

    // ---- Helper: create smooth reveal ----
    function smoothReveal(selector, fromVars, toVars, triggerOptions = {}) {
        gsap.utils.toArray(selector).forEach(el => {
            const delay = parseFloat(el.dataset?.delay) || 0;
            gsap.fromTo(el, fromVars, {
                ...toVars,
                delay: delay,
                scrollTrigger: {
                    trigger: el,
                    start: isMobile ? 'top 92%' : 'top 85%',
                    toggleActions: 'play none none none',
                    ...triggerOptions,
                }
            });
        });
    }

    // ---- Section Headers ----
    smoothReveal('[data-animate="reveal"]',
        { opacity: 0, y: 40, filter: 'blur(4px)' },
        { opacity: 1, y: 0, filter: 'blur(0px)', duration: dur(1, 0.8), ease: silkEase }
    );

    // ---- Cards Reveal ----
    smoothReveal('[data-animate="reveal-card"]',
        { opacity: 0, y: 30, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: dur(0.9, 0.7), ease: silkEase }
    );

    // ---- Step Cards Stagger ----
    gsap.fromTo('.step-card',
        { opacity: 0, y: isMobile ? 40 : 60, rotationY: isMobile ? 0 : 5 },
        {
            opacity: 1,
            y: 0,
            rotationY: 0,
            duration: dur(1, 0.8),
            stagger: dur(0.12, 0.08),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.steps-grid',
                start: isMobile ? 'top 92%' : 'top 80%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Insight Cards Stagger ----
    gsap.fromTo('.insight-card',
        { opacity: 0, y: 35, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: dur(0.8, 0.65),
            stagger: dur(0.08, 0.06),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.insights-grid',
                start: isMobile ? 'top 92%' : 'top 82%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Stats Cards ----
    gsap.fromTo('.stats-card',
        { opacity: 0, y: 30, scale: 0.95 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: dur(0.8, 0.65),
            stagger: dur(0.08, 0.06),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.stats-row',
                start: isMobile ? 'top 92%' : 'top 82%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Disease Cards ----
    gsap.fromTo('.disease-card',
        { opacity: 0, y: 25, scale: 0.97 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: dur(0.7, 0.55),
            stagger: dur(0.06, 0.05),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.diseases-grid',
                start: isMobile ? 'top 92%' : 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Upload Zone ----
    gsap.fromTo('.upload-zone',
        { opacity: 0, y: 30, scale: 0.97 },
        {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: dur(1, 0.8),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.upload-zone',
                start: isMobile ? 'top 92%' : 'top 85%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- Parallax Background Shapes (desktop only) ----
    if (!isMobile) {
        gsap.utils.toArray('.hero-shape').forEach((shape, i) => {
            gsap.to(shape, {
                y: (i + 1) * -60,
                ease: 'none',
                scrollTrigger: {
                    trigger: '.hero-section',
                    start: 'top top',
                    end: 'bottom top',
                    scrub: 2.5
                }
            });
        });
    }

    // ---- Navbar show/hide (desktop only — always visible on mobile) ----
    if (!isMobile) {
        ScrollTrigger.create({
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            onUpdate: (self) => {
                const progress = self.progress;
                const navbar = document.getElementById('navbar');
                if (navbar) {
                    gsap.to(navbar, {
                        y: progress > 0.08 ? 0 : -100,
                        duration: 0.6,
                        ease: silkEase,
                        overwrite: true
                    });
                }
            }
        });
    }

    // ---- Floating Animation for Hero Visual — ultra gentle ----
    gsap.to('.hero-visual', {
        y: isMobile ? 8 : 12,
        duration: isMobile ? 4 : 3.5,
        ease: 'sine.inOut',
        repeat: -1,
        yoyo: true,
        force3D: true,
    });

    // ---- Footer Reveal ----
    gsap.fromTo('.footer',
        { opacity: 0, y: 20 },
        {
            opacity: 1,
            y: 0,
            duration: dur(0.8, 0.6),
            ease: silkEase,
            scrollTrigger: {
                trigger: '.footer',
                start: 'top 95%',
                toggleActions: 'play none none none'
            }
        }
    );

    // ---- DESKTOP ONLY: Magnetic Button Effect ----
    if (!isTouch) {
        document.querySelectorAll('.btn-primary, .nav-cta').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                gsap.to(btn, {
                    x: x * 0.12,
                    y: y * 0.12,
                    duration: 0.5,
                    ease: 'power3.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    x: 0,
                    y: 0,
                    duration: 0.8,
                    ease: springEase
                });
            });
        });
    }

    // ---- DESKTOP ONLY: Tilt Effect on Cards ----
    if (!isTouch) {
        document.querySelectorAll('.step-card, .insight-card, .stats-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = (e.clientX - rect.left) / rect.width - 0.5;
                const y = (e.clientY - rect.top) / rect.height - 0.5;

                gsap.to(card, {
                    rotationY: x * 6,
                    rotationX: -y * 6,
                    transformPerspective: 1000,
                    duration: 0.6,
                    ease: 'power3.out',
                    force3D: true,
                });
            });

            card.addEventListener('mouseleave', () => {
                gsap.to(card, {
                    rotationY: 0,
                    rotationX: 0,
                    duration: 1,
                    ease: springEase,
                    force3D: true,
                });
            });
        });
    }

    // ---- Smooth section fade-in on scroll (mobile extra polish) ----
    if (isMobile) {
        gsap.utils.toArray('section').forEach(section => {
            gsap.fromTo(section,
                { opacity: 0.3 },
                {
                    opacity: 1,
                    duration: 0.6,
                    ease: 'power2.out',
                    scrollTrigger: {
                        trigger: section,
                        start: 'top 95%',
                        end: 'top 60%',
                        scrub: 1,
                    }
                }
            );
        });
    }

})();
