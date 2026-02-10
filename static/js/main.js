/* =============================================
   TOMATO AI — Main Application Logic
   ============================================= */

// ===== GLOBAL HELPERS =====
function smoothScrollTo(selector) {
    const el = document.querySelector(selector);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// ===== PAGE LOADER =====
(function initLoader() {
    const loader = document.getElementById('page-loader');
    const fill = loader?.querySelector('.loader-bar-fill');
    let progress = 0;

    const interval = setInterval(() => {
        progress += Math.random() * 20 + 5;
        if (progress > 95) progress = 95;
        if (fill) fill.style.width = progress + '%';
    }, 200);

    window.addEventListener('load', () => {
        clearInterval(interval);
        if (fill) fill.style.width = '100%';
        setTimeout(() => {
            loader?.classList.add('loaded');
        }, 600);
    });
})();

// ===== CURSOR GLOW =====
(function initCursorGlow() {
    const glow = document.getElementById('cursor-glow');
    if (!glow || window.innerWidth < 769) return;

    let mouseX = 0, mouseY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animate() {
        glowX += (mouseX - glowX) * 0.08;
        glowY += (mouseY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(animate);
    }
    animate();
})();

// ===== NAVBAR =====
(function initNavbar() {
    const navbar = document.getElementById('navbar');
    const mobileBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const links = navLinks?.querySelectorAll('.nav-link');

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            navbar?.classList.add('scrolled');
        } else {
            navbar?.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // Mobile menu
    mobileBtn?.addEventListener('click', () => {
        mobileBtn.classList.toggle('active');
        navLinks?.classList.toggle('open');
    });

    // Close mobile menu on link click
    links?.forEach(link => {
        link.addEventListener('click', () => {
            mobileBtn?.classList.remove('active');
            navLinks?.classList.remove('open');
        });
    });

    // Active link on scroll
    const sections = document.querySelectorAll('section[id]');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            const link = navLinks?.querySelector(`a[href="#${id}"]`);

            if (scrollY >= top && scrollY < top + height) {
                links?.forEach(l => l.classList.remove('active'));
                link?.classList.add('active');
            }
        });
    });
})();

// ===== PARTICLES =====
(function initParticles() {
    if (typeof tsParticles === 'undefined') return;

    tsParticles.load('tsparticles', {
        fpsLimit: 60,
        particles: {
            number: {
                value: 40,
                density: { enable: true, area: 1000 }
            },
            color: { value: ['#ff453a', '#ff9f0a', '#bf5af2', '#0a84ff'] },
            shape: { type: 'circle' },
            opacity: {
                value: 0.15,
                random: { enable: true, minimumValue: 0.05 },
                animation: { enable: true, speed: 0.5, minimumValue: 0.05, sync: false }
            },
            size: {
                value: 2,
                random: { enable: true, minimumValue: 0.5 },
                animation: { enable: true, speed: 1, minimumValue: 0.5, sync: false }
            },
            links: {
                enable: true,
                distance: 150,
                color: '#ffffff',
                opacity: 0.03,
                width: 1
            },
            move: {
                enable: true,
                speed: 0.4,
                direction: 'none',
                random: true,
                straight: false,
                outModes: { default: 'out' }
            }
        },
        interactivity: {
            detectsOn: 'canvas',
            events: {
                onHover: { enable: true, mode: 'grab' },
                resize: true
            },
            modes: {
                grab: { distance: 140, links: { opacity: 0.08 } }
            }
        },
        detectRetina: true
    }).catch(() => {});
})();

// ===== FILE UPLOAD & PREDICTION =====
(function initUploadPredict() {
    const uploadZone = document.getElementById('upload-zone');
    const fileInput = document.getElementById('file-input');
    const previewArea = document.getElementById('preview-area');
    const previewImage = document.getElementById('preview-image');
    const previewFilename = document.getElementById('preview-filename');
    const previewRemove = document.getElementById('preview-remove');
    const analyzeBtn = document.getElementById('analyze-btn');
    const resultArea = document.getElementById('result-area');
    const resetBtn = document.getElementById('reset-btn');

    let selectedFile = null;

    // Click to upload
    uploadZone?.addEventListener('click', () => fileInput?.click());

    // Drag and drop
    uploadZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });

    uploadZone?.addEventListener('dragleave', () => {
        uploadZone.classList.remove('drag-over');
    });

    uploadZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        const files = e.dataTransfer?.files;
        if (files?.length > 0) {
            handleFile(files[0]);
        }
    });

    // File input change
    fileInput?.addEventListener('change', (e) => {
        if (e.target.files?.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    function handleFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('Please select an image file (JPG, PNG, WebP)');
            return;
        }

        if (file.size > 16 * 1024 * 1024) {
            showError('File too large. Maximum size is 16MB.');
            return;
        }

        selectedFile = file;

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            if (previewImage) previewImage.src = e.target.result;
            if (previewFilename) previewFilename.textContent = file.name;
            if (uploadZone) uploadZone.style.display = 'none';
            if (previewArea) previewArea.style.display = 'block';

            // Animate preview
            if (previewArea) {
                previewArea.style.opacity = '0';
                previewArea.style.transform = 'translateY(20px)';
                requestAnimationFrame(() => {
                    previewArea.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
                    previewArea.style.opacity = '1';
                    previewArea.style.transform = 'translateY(0)';
                });
            }
        };
        reader.readAsDataURL(file);

        // Hide result when new file uploaded
        if (resultArea) resultArea.style.display = 'none';
    }

    // Remove preview
    previewRemove?.addEventListener('click', (e) => {
        e.stopPropagation();
        resetUpload();
    });

    function resetUpload() {
        selectedFile = null;
        if (uploadZone) uploadZone.style.display = 'block';
        if (previewArea) previewArea.style.display = 'none';
        if (fileInput) fileInput.value = '';
    }

    // Analyze
    analyzeBtn?.addEventListener('click', async () => {
        if (!selectedFile) return;

        const btnText = analyzeBtn.querySelector('.btn-text');
        const btnLoader = analyzeBtn.querySelector('.btn-loader');

        // Loading state
        if (btnText) btnText.style.display = 'none';
        if (btnLoader) btnLoader.style.display = 'inline-flex';
        analyzeBtn.disabled = true;
        analyzeBtn.style.opacity = '0.7';

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch('/predict', {
                method: 'POST',
                body: formData
            });

            const data = await response.json();

            if (!response.ok) {
                showError(data.error || 'Prediction failed. Please try again.');
                return;
            }

            displayResult(data);

        } catch (err) {
            showError('Network error. Please check your connection and try again.');
            console.error('Prediction error:', err);
        } finally {
            if (btnText) btnText.style.display = 'inline';
            if (btnLoader) btnLoader.style.display = 'none';
            analyzeBtn.disabled = false;
            analyzeBtn.style.opacity = '1';
        }
    });

    function displayResult(data) {
        const resultCard = document.getElementById('result-card');
        const resultStatusIcon = document.getElementById('result-status-icon');
        const resultDisease = document.getElementById('result-disease');
        const resultSeverity = document.getElementById('result-severity');
        const confidenceValue = document.getElementById('confidence-value');
        const confidenceBarFill = document.getElementById('confidence-bar-fill');
        const predictionsList = document.getElementById('predictions-list');
        const preventionList = document.getElementById('prevention-list');
        const preventionTitle = document.getElementById('prevention-title');

        if (!resultArea || !resultCard) return;

        // Set status
        const isHealthy = data.is_healthy;
        if (resultStatusIcon) {
            resultStatusIcon.textContent = isHealthy ? '✅' : '⚠️';
        }
        if (resultDisease) {
            resultDisease.textContent = data.disease_display;
            resultDisease.style.color = isHealthy ? 'var(--accent-green)' : 'var(--accent-red)';
        }

        // Severity
        if (resultSeverity) {
            resultSeverity.textContent = `Severity: ${data.severity.level}`;
            resultSeverity.className = `result-severity severity-${data.severity.color}`;
        }

        // Confidence
        if (confidenceValue) {
            confidenceValue.textContent = data.confidence + '%';
        }
        if (confidenceBarFill) {
            confidenceBarFill.style.width = '0%';
            confidenceBarFill.className = 'confidence-bar-fill' + (isHealthy ? ' healthy' : '');
            requestAnimationFrame(() => {
                setTimeout(() => {
                    confidenceBarFill.style.width = data.confidence + '%';
                }, 100);
            });
        }

        // All predictions
        if (predictionsList) {
            predictionsList.innerHTML = '';
            const sorted = Object.entries(data.all_predictions)
                .sort((a, b) => b[1] - a[1]);

            sorted.forEach(([name, value]) => {
                const isActive = name === data.disease_display;
                const item = document.createElement('div');
                item.className = 'prediction-item' + (isActive ? ' active' : '');
                item.innerHTML = `
                    <span class="prediction-name">${name}</span>
                    <span class="prediction-value">${value}%</span>
                    <div class="prediction-bar">
                        <div class="prediction-bar-fill" style="width: 0%"></div>
                    </div>
                `;
                predictionsList.appendChild(item);

                // Animate bars
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        const bar = item.querySelector('.prediction-bar-fill');
                        if (bar) bar.style.width = value + '%';
                    }, 200);
                });
            });
        }

        // Prevention
        if (preventionTitle) {
            preventionTitle.textContent = isHealthy ? 'Maintenance Tips' : 'Prevention Measures';
        }
        if (preventionList) {
            preventionList.innerHTML = '';
            data.prevention.forEach(tip => {
                const li = document.createElement('li');
                li.textContent = tip;
                preventionList.appendChild(li);
            });
        }

        // Add color-coded result card border
        if (resultCard) {
            if (isHealthy) {
                resultCard.style.borderColor = 'rgba(48, 209, 88, 0.3)';
                resultCard.style.boxShadow = '0 0 40px rgba(48, 209, 88, 0.1)';
            } else {
                resultCard.style.borderColor = 'rgba(255, 69, 58, 0.3)';
                resultCard.style.boxShadow = '0 0 40px rgba(255, 69, 58, 0.1)';
            }
        }

        // Show result
        resultArea.style.display = 'block';
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function showError(message) {
        // Create error toast
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 100px;
            left: 50%;
            transform: translateX(-50%) translateY(-20px);
            background: rgba(255, 69, 58, 0.95);
            color: #fff;
            padding: 16px 32px;
            border-radius: 100px;
            font-size: 14px;
            font-weight: 600;
            z-index: 10000;
            backdrop-filter: blur(20px);
            box-shadow: 0 10px 40px rgba(255, 69, 58, 0.4);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
            max-width: 90vw;
            text-align: center;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        requestAnimationFrame(() => {
            toast.style.opacity = '1';
            toast.style.transform = 'translateX(-50%) translateY(0)';
        });

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(-50%) translateY(-20px)';
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    }

    // Reset
    resetBtn?.addEventListener('click', () => {
        resetUpload();
        if (resultArea) resultArea.style.display = 'none';
    });

})();

// ===== ANIMATED COUNTERS =====
(function initCounters() {
    const counters = document.querySelectorAll('[data-count]');
    const observed = new Set();

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !observed.has(entry.target)) {
                observed.add(entry.target);
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));

    function animateCounter(el) {
        const target = parseInt(el.getAttribute('data-count'));
        const duration = 2000;
        const start = performance.now();

        function update(now) {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            // Ease out cubic
            const ease = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(ease * target);

            if (target >= 1000) {
                el.textContent = current.toLocaleString();
            } else {
                el.textContent = current;
            }

            if (progress < 1) {
                requestAnimationFrame(update);
            }
        }
        requestAnimationFrame(update);
    }
})();
