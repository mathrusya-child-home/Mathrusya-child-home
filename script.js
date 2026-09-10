// MATHRUSYA CHILD HOME - WEBSITE INTERACTIVITY CONTROLLER

document.addEventListener('DOMContentLoaded', () => {
    // 1. Client-Side SPA Routing
    initRouting();

    // 2. Mobile Menu Toggle
    initMobileMenu();

    // 3. Scroll Activated Counter Animation
    initCounters();

    // 4. Gallery Category Filtering & Lightbox Modal
    initGallery();

    // 5. Scroll-to-Top Button
    initScrollToTop();

    // 6. Hero Image Slideshow
    initHeroSlideshow();
});

/* ==========================================================================
   1. CLIENT-SIDE ROUTING (SPA BEHAVIOR)
   ========================================================================== */
function initRouting() {
    const navLinks = document.querySelectorAll('.nav-menu .nav-link, .footer-column-links a');
    const sections = document.querySelectorAll('.page-section');

    function handleRouting() {
        let hash = window.location.hash || '#home';
        
        // Correct anchors within pages (e.g., direct donor bank section anchor)
        if (hash === '#bank-details-anchor') {
            hash = '#donate';
        }

        const targetPageId = hash.substring(1);
        const targetSection = document.getElementById(targetPageId);

        if (targetSection) {
            // Remove active classes
            sections.forEach(sec => sec.classList.remove('active'));
            document.querySelectorAll('.nav-menu .nav-link').forEach(link => link.classList.remove('active'));

            // Add active classes
            targetSection.classList.add('active');
            
            // Sync desktop header navigation links
            const activeHeaderLink = document.querySelector(`.nav-menu .nav-link[data-page="${targetPageId}"]`);
            if (activeHeaderLink) {
                activeHeaderLink.classList.add('active');
            }

            // Scroll window to top on page switch
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Trigger counters if routing back to home
            if (targetPageId === 'home') {
                resetCounters();
                triggerCountersAnimation();
            }
        }
    }

    // Bind link clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const pageAttr = link.getAttribute('data-page') || link.getAttribute('href').substring(1);
            
            // If internal section anchor (not routing to new section)
            if (link.getAttribute('href') === '#bank-details-anchor') {
                return;
            }

            e.preventDefault();
            window.location.hash = pageAttr;
            
            // Collapse mobile menu if open
            const mobileMenu = document.getElementById('nav-menu');
            const mobileToggle = document.getElementById('mobile-toggle');
            if (mobileMenu && mobileMenu.classList.contains('active')) {
                mobileMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    });

    // Hash change event listener
    window.addEventListener('hashchange', handleRouting);

    // Initial check on load
    handleRouting();
}

// Global page navigation helper (used inline in HTML clicks)
window.navigateToPage = function(pageId) {
    const mobileMenu = document.getElementById('nav-menu');
    const mobileToggle = document.getElementById('mobile-toggle');
    if (mobileMenu && mobileMenu.classList.contains('active')) {
        mobileMenu.classList.remove('active');
        if (mobileToggle) {
            mobileToggle.classList.remove('active');
            mobileToggle.setAttribute('aria-expanded', 'false');
        }
    }
    window.location.hash = pageId;
};

// Scroll directly to element helper
window.scrollToElement = function(elementId) {
    setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 100);
};

/* ==========================================================================
   2. MOBILE NAVIGATION MENU
   ========================================================================== */
function initMobileMenu() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            const isActive = mobileToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            mobileToggle.setAttribute('aria-expanded', isActive ? 'true' : 'false');
        });

        // Close when clicking outside of navMenu and mobileToggle
        document.addEventListener('click', (e) => {
            if (navMenu.classList.contains('active')) {
                if (!navMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                    navMenu.classList.remove('active');
                    mobileToggle.classList.remove('active');
                    mobileToggle.setAttribute('aria-expanded', 'false');
                }
            }
        });

        // Close on Escape key press
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
                mobileToggle.focus();
            }
        });

        // Close mobile menu if window is resized past tablet breakpoint (768px)
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768 && navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
                mobileToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
}

/* ==========================================================================
   3. ANIMATED STATISTICS COUNTERS
   ========================================================================== */
let counterObserver;
let animatedCounters = false;

function initCounters() {
    const statsSection = document.querySelector('.stats-section');
    if (!statsSection) return;

    counterObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedCounters) {
                triggerCountersAnimation();
                animatedCounters = true;
            }
        });
    }, { threshold: 0.2 });

    counterObserver.observe(statsSection);
}

function triggerCountersAnimation() {
    const counters = document.querySelectorAll('.stat-number');
    
    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1500; // Total animation length in ms
        const stepTime = Math.max(Math.floor(duration / target), 10);
        let start = 0;
        
        const timer = setInterval(() => {
            start += Math.ceil(target / (duration / stepTime));
            if (start >= target) {
                counter.textContent = target;
                clearInterval(timer);
            } else {
                counter.textContent = start;
            }
        }, stepTime);
    });
}

function resetCounters() {
    animatedCounters = false;
    const counters = document.querySelectorAll('.stat-number');
    counters.forEach(counter => {
        counter.textContent = '0';
    });
}

/* ==========================================================================
   4. MEMORY GALLERY & LIGHTBOX
   ========================================================================== */
function initGallery() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const prevBtn = document.getElementById('lightbox-prev');
    const nextBtn = document.getElementById('lightbox-next');

    let activeFilter = 'all';
    let filteredImages = [];
    let currentImageIndex = 0;

    // A. FILTERING MECHANISM
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Manage active classes on buttons
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            activeFilter = btn.getAttribute('data-filter');

            // Show/Hide items with animation
            galleryItems.forEach(item => {
                const category = item.getAttribute('data-category');
                
                if (activeFilter === 'all' || category === activeFilter) {
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
            
            // Build the active images list for lightbox navigation
            updateFilteredImagesList();
        });
    });

    function updateFilteredImagesList() {
        filteredImages = [];
        galleryItems.forEach(item => {
            if (item.style.display !== 'none') {
                const img = item.querySelector('img');
                const title = item.querySelector('.gallery-overlay h3')?.textContent || '';
                filteredImages.push({
                    src: img.getAttribute('src'),
                    alt: img.getAttribute('alt'),
                    caption: title
                });
            }
        });
    }

    // B. LIGHTBOX MODAL NAVIGATION
    function openLightbox(index) {
        currentImageIndex = index;
        const imgData = filteredImages[currentImageIndex];
        
        if (imgData && lightbox && lightboxImg && lightboxCaption) {
            lightboxImg.setAttribute('src', imgData.src);
            lightboxImg.setAttribute('alt', imgData.alt);
            lightboxCaption.textContent = imgData.caption;
            
            lightbox.style.display = 'flex';
            document.body.style.overflow = 'hidden'; // Disable page scrolling
        }
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.style.display = 'none';
            document.body.style.overflow = ''; // Enable page scrolling
        }
    }

    function nextImage() {
        if (filteredImages.length <= 1) return;
        currentImageIndex = (currentImageIndex + 1) % filteredImages.length;
        openLightbox(currentImageIndex);
    }

    function prevImage() {
        if (filteredImages.length <= 1) return;
        currentImageIndex = (currentImageIndex - 1 + filteredImages.length) % filteredImages.length;
        openLightbox(currentImageIndex);
    }

    // Attach click events to gallery items
    galleryItems.forEach(item => {
        item.addEventListener('click', () => {
            updateFilteredImagesList();
            
            const currentSrc = item.querySelector('img').getAttribute('src');
            const index = filteredImages.findIndex(img => img.src === currentSrc);
            
            if (index !== -1) {
                openLightbox(index);
            }
        });
    });

    // Close Lightbox
    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    // Close Lightbox clicking outside the image
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Next/Prev Buttons
    if (nextBtn) nextBtn.addEventListener('click', (e) => { e.stopPropagation(); nextImage(); });
    if (prevBtn) prevBtn.addEventListener('click', (e) => { e.stopPropagation(); prevImage(); });

    // Touch Swipe Support for Mobile Lightbox
    let touchStartX = 0;
    let touchEndX = 0;

    if (lightbox) {
        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) {
                    nextImage(); // Swipe left -> Next
                } else {
                    prevImage(); // Swipe right -> Prev
                }
            }
        }, { passive: true });
    }

    // Keyboard Shortcuts for Lightbox
    document.addEventListener('keydown', (e) => {
        if (lightbox && lightbox.style.display === 'flex') {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
        }
    });

    // Initial setup of list
    updateFilteredImagesList();
}

/* ==========================================================================
   5. SCROLL TO TOP UTILITY
   ========================================================================== */
function initScrollToTop() {
    const scrollBtn = document.getElementById('scroll-to-top');
    if (!scrollBtn) return;

    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollBtn.classList.add('show');
        } else {
            scrollBtn.classList.remove('show');
        }
    });

    scrollBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ==========================================================================
   6. COPY-TO-CLIPBOARD FUNCTIONALITY
   ========================================================================== */
window.copyText = function(elementId, buttonElement) {
    const copyTarget = document.getElementById(elementId);
    if (!copyTarget) return;

    const textToCopy = copyTarget.textContent.trim();

    navigator.clipboard.writeText(textToCopy)
        .then(() => {
            // Visual success feedback
            buttonElement.classList.add('copied');
            const originalIcon = buttonElement.querySelector('.copy-icon');
            if (originalIcon) {
                originalIcon.textContent = '✔️';
            }

            setTimeout(() => {
                buttonElement.classList.remove('copied');
                if (originalIcon) {
                    originalIcon.textContent = '📋';
                }
            }, 2000);
        })
        .catch(err => {
            console.error('Failed to copy text: ', err);
            alert('Unable to copy details. Please copy them manually.');
        });
};

/* ==========================================================================
   7. CONTACT FORM SUBMISSION & VALIDATION
   ========================================================================== */
window.handleFormSubmit = function(e) {
    e.preventDefault();

    const form = document.getElementById('contact-form');
    const formStatus = document.getElementById('form-status');
    const submitBtn = form.querySelector('button[type="submit"]');

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const message = document.getElementById('contact-message').value.trim();

    if (!name || !email || !message) {
        showStatus('Please fill in all required fields.', 'error');
        return;
    }

    // Set loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending Message...';
    formStatus.style.display = 'none';

    // Mock API Delay
    setTimeout(() => {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Send Message';
        
        // Show success alert
        showStatus('Thank you! Your message has been sent successfully. We will get back to you shortly.', 'success');
        form.reset();
    }, 1500);

    function showStatus(text, className) {
        formStatus.className = `form-status ${className}`;
        formStatus.textContent = text;
        formStatus.style.display = 'block';
    }
};

/* ==========================================================================
   8. HERO IMAGE SLIDESHOW CONTROLLER
   ========================================================================== */
function initHeroSlideshow() {
    const slideshow = document.getElementById('hero-slideshow');
    if (!slideshow) return;

    const slides = slideshow.querySelectorAll('.slide');
    const dots = document.querySelectorAll('#hero-slideshow-dots .dot');
    const prevBtn = document.getElementById('hero-prev-btn');
    const nextBtn = document.getElementById('hero-next-btn');

    if (slides.length === 0) return;

    let currentIndex = 0;
    let autoSlideTimer = null;
    const slideInterval = 4000; // 4 seconds interval

    function showSlide(index) {
        if (index < 0) {
            currentIndex = slides.length - 1;
        } else if (index >= slides.length) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }

        slides.forEach((slide, i) => {
            if (i === currentIndex) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });

        dots.forEach((dot, i) => {
            if (i === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    function startTimer() {
        stopTimer();
        autoSlideTimer = setInterval(() => {
            showSlide(currentIndex + 1);
        }, slideInterval);
    }

    function stopTimer() {
        if (autoSlideTimer) {
            clearInterval(autoSlideTimer);
            autoSlideTimer = null;
        }
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            showSlide(currentIndex + 1);
            startTimer();
        });
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            showSlide(currentIndex - 1);
            startTimer();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            showSlide(index);
            startTimer();
        });
    });

    const container = slideshow.closest('.hero-slideshow-container');
    if (container) {
        container.addEventListener('mouseenter', stopTimer);
        container.addEventListener('mouseleave', startTimer);

        // Touch Swipe Support for Mobile & Tablets
        let touchStartX = 0;
        let touchEndX = 0;

        container.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        container.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const diff = touchEndX - touchStartX;
            if (Math.abs(diff) > 40) {
                if (diff < 0) {
                    showSlide(currentIndex + 1); // Swipe left -> Next
                } else {
                    showSlide(currentIndex - 1); // Swipe right -> Prev
                }
                startTimer();
            }
        }
    }

    // Keyboard Arrow Keys Support
    document.addEventListener('keydown', (e) => {
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom >= 0;
        if (!isVisible) return;

        if (e.key === 'ArrowLeft') {
            showSlide(currentIndex - 1);
            startTimer();
        } else if (e.key === 'ArrowRight') {
            showSlide(currentIndex + 1);
            startTimer();
        }
    });

    startTimer();
}

