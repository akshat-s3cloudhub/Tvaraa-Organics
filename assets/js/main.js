// ==========================================
// TVARAA ORGANICS - MAIN JAVASCRIPT
// ==========================================

document.addEventListener('DOMContentLoaded', function() {
    
    // Initialize all components
    initializeNavbar();
    initializeAOS();
    initializeGSAP();
    initializeSwiper();
    initializeCounters();
    initializeScrollEffects();
    initializeForms();
    initializeParallax();
    
});

// ==========================================
// NAVBAR FUNCTIONALITY
// ==========================================

function initializeNavbar() {
    const navbar = document.getElementById('mainNav');
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
    
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Mobile menu close after click (avoid closing when tapping dropdown toggles)
    const navbarCollapse = document.querySelector('.navbar-collapse');
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            if (window.innerWidth < 992) {
                // If this is a dropdown toggle in mobile, do NOT close the navbar
                const isDropdownToggle = link.classList.contains('dropdown-toggle') || link.getAttribute('data-bs-toggle') === 'dropdown';
                if (isDropdownToggle) {
                    return;
                }
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

    // Close navbar when a dropdown item is selected (mobile only)
    const dropdownItems = document.querySelectorAll('.dropdown-menu .dropdown-item');
    dropdownItems.forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth < 992) {
                const bsCollapse = new bootstrap.Collapse(navbarCollapse, { toggle: false });
                bsCollapse.hide();
            }
        });
    });

    // Fix for mobile dropdown menus using Bootstrap Dropdown API (tap to open Services submenu)
    const dropdownToggles = document.querySelectorAll('.dropdown-toggle');
    dropdownToggles.forEach(toggle => {
        // Ensure Bootstrap Dropdown instance exists
        const dd = bootstrap.Dropdown.getOrCreateInstance(toggle, { autoClose: false });
        
        // Handle click events for mobile dropdown
        toggle.addEventListener('click', function(e) {
            if (window.innerWidth < 992) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close any other open dropdowns within navbar
                document.querySelectorAll('.navbar .dropdown-toggle[aria-expanded="true"]').forEach(openTgl => {
                    if (openTgl !== toggle) {
                        const inst = bootstrap.Dropdown.getOrCreateInstance(openTgl, { autoClose: false });
                        inst.hide();
                    }
                });
                
                // Toggle this dropdown
                const inst = bootstrap.Dropdown.getOrCreateInstance(this, { autoClose: false });
                // If not expanded, show; else hide
                if (this.getAttribute('aria-expanded') === 'true') {
                    inst.hide();
                } else {
                    inst.show();
                }
            }
        });
        
        // Handle touch events for better mobile experience
        toggle.addEventListener('touchstart', function(e) {
            if (window.innerWidth < 992) {
                // Add touchstart handler for iOS compatibility
                this.classList.add('touched');
            }
        });
    });
    
    // Add touch support for iOS devices
    document.addEventListener('touchstart', function() {}, true);

    // Cleanup on resize: ensure dropdowns reset when switching to desktop
    window.addEventListener('resize', () => {
        if (window.innerWidth >= 992) {
            document.querySelectorAll('.navbar .dropdown-menu.show').forEach(menu => menu.classList.remove('show'));
            document.querySelectorAll('.navbar .dropdown.show').forEach(dd => dd.classList.remove('show'));
        }
    });
}

// ==========================================
// AOS (ANIMATE ON SCROLL) INITIALIZATION
// ==========================================

function initializeAOS() {
    AOS.init({
        duration: 800,
        easing: 'ease-in-out',
        once: true,
        offset: 100,
        delay: 100
    });
    
    // Custom AOS refresh on window resize
    window.addEventListener('resize', function() {
        AOS.refresh();
    });
}

// ==========================================
// GSAP ANIMATIONS
// ==========================================

function initializeGSAP() {
    // Register ScrollTrigger plugin
    gsap.registerPlugin(ScrollTrigger);
    
    // Hero section animations
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        gsap.fromTo('.hero-title-line', 
            { 
                opacity: 0, 
                y: 50 
            },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                stagger: 0.3,
                ease: "power2.out"
            }
        );
    }

    // Layered hero visual entrance
    const layers = gsap.utils.toArray('.bottle-layer');
    if (layers.length) {
        // set initial states for a nice staged entrance
        gsap.set('.layer-1', { y: 80, rotate: -10, opacity: 0 });
        gsap.set('.layer-2', { y: 90, rotate: 10, opacity: 0 });
        gsap.set('.layer-3', { y: 100, rotate: 0, opacity: 0 });

        const tl = gsap.timeline();
        tl.to('.layer-1', { opacity: 1, y: 0, rotate: -6, duration: 0.8, ease: 'power3.out' })
          .to('.layer-2', { opacity: 1, y: 0, rotate: 6,  duration: 0.8, ease: 'power3.out' }, '-=0.6')
          .to('.layer-3', { opacity: 1, y: 0, rotate: 0,  duration: 0.8, ease: 'power3.out' }, '-=0.6');

        // Scroll parallax/tilt effect across hero viewport
        ScrollTrigger.create({
            trigger: '.hero-section',
            start: 'top top',
            end: 'bottom top',
            scrub: true,
            onUpdate: (self) => {
                const p = self.progress; // 0..1 through the hero
                gsap.to('.layer-1', { y: -60 * p, x: -20 * p, rotate: -6 - 3 * p, overwrite: 'auto' });
                gsap.to('.layer-2', { y: -80 * p, x:  30 * p, rotate:  6 + 3 * p, overwrite: 'auto' });
                gsap.to('.layer-3', { y: -100 * p, scale: 1 - 0.05 * p, overwrite: 'auto' });
            }
        });
    }
    
    // Parallax background effect
    const parallaxBg = document.querySelector('.parallax-bg');
    if (parallaxBg) {
        gsap.to(parallaxBg, {
            yPercent: -50,
            ease: "none",
            scrollTrigger: {
                trigger: ".hero-section",
                start: "top bottom",
                end: "bottom top",
                scrub: true
            }
        });
    }
    
    // Section reveal animations
    gsap.utils.toArray('.section-title').forEach(title => {
        gsap.fromTo(title, 
            { 
                opacity: 0, 
                y: 30 
            },
            {
                opacity: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: title,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // Cards animation
    gsap.utils.toArray('.stat-card, .feature-card, .category-card, .process-step').forEach((card, index) => {
        gsap.fromTo(card,
            {
                opacity: 0,
                y: 50,
                scale: 0.9
            },
            {
                opacity: 1,
                y: 0,
                scale: 1,
                duration: 0.6,
                delay: index * 0.1,
                scrollTrigger: {
                    trigger: card,
                    start: "top 85%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    });
    
    // CTA Banner animation
    const ctaBanner = document.querySelector('.cta-banner');
    if (ctaBanner) {
        gsap.fromTo(ctaBanner,
            {
                opacity: 0,
                scale: 0.95,
                y: 30
            },
            {
                opacity: 1,
                scale: 1,
                y: 0,
                duration: 0.8,
                scrollTrigger: {
                    trigger: ctaBanner,
                    start: "top 80%",
                    toggleActions: "play none none reverse"
                }
            }
        );
    }
}

// ==========================================
// SWIPER.JS INITIALIZATION
// ==========================================

function initializeSwiper() {
    // Categories Carousel Swiper
    const categoriesSwiper = document.querySelector('.categories-swiper');
    if (categoriesSwiper) {
        new Swiper('.categories-swiper', {
            slidesPerView: 1,
            spaceBetween: 30,
            loop: true,
            centeredSlides: false,
            autoplay: {
                delay: 4500,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
            },
            speed: 800,
            effect: 'slide',
            grabCursor: true,
            pagination: {
                el: '.categories-pagination',
                clickable: true,
                dynamicBullets: true,
            },
            navigation: {
                nextEl: '.categories-next',
                prevEl: '.categories-prev',
            },
            breakpoints: {
                576: {
                    slidesPerView: 2,
                    spaceBetween: 25,
                },
                768: {
                    slidesPerView: 2,
                    spaceBetween: 25,
                },
                992: {
                    slidesPerView: 3,
                    spaceBetween: 30,
                },
                1200: {
                    slidesPerView: 3,
                    spaceBetween: 35,
                },
                1400: {
                    slidesPerView: 4,
                    spaceBetween: 35,
                }
            },
            on: {
                init: function() {
                    // Add entrance animation to visible slides
                    this.slides.forEach((slide, index) => {
                        if (index < this.params.slidesPerView) {
                            slide.style.opacity = '0';
                            slide.style.transform = 'translateY(50px)';
                            setTimeout(() => {
                                slide.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                                slide.style.opacity = '1';
                                slide.style.transform = 'translateY(0)';
                            }, index * 200);
                        }
                    });
                },
                slideChange: function() {
                    // Optional: Add slide change animations
                }
            }
        });
    }
    
    // Testimonials Swiper
    const testimonialsSwiper = new Swiper('.testimonials-swiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        autoplay: {
            delay: 5000,
            disableOnInteraction: false,
        },
        pagination: {
            el: '.swiper-pagination',
            clickable: true,
        },
        navigation: {
            nextEl: '.swiper-button-next',
            prevEl: '.swiper-button-prev',
        },
        breakpoints: {
            768: {
                slidesPerView: 2,
            },
            1024: {
                slidesPerView: 3,
            }
        }
    });
    
    // Product showcase swiper (if exists)
    const productSwiper = document.querySelector('.product-swiper');
    if (productSwiper) {
        new Swiper('.product-swiper', {
            slidesPerView: 1,
            spaceBetween: 20,
            loop: true,
            autoplay: {
                delay: 4000,
                disableOnInteraction: false,
            },
            pagination: {
                el: '.swiper-pagination',
                clickable: true,
            },
            breakpoints: {
                576: {
                    slidesPerView: 2,
                },
                768: {
                    slidesPerView: 3,
                },
                1024: {
                    slidesPerView: 4,
                }
            }
        });
    }
}

// ==========================================
// ANIMATED COUNTERS
// ==========================================

function initializeCounters() {
    const counterElements = document.querySelectorAll('[data-count]');
    
    counterElements.forEach(counter => {
        const target = parseInt(counter.getAttribute('data-count'));
        
        const countUp = () => {
            const increment = target / 100;
            let current = 0;
            
            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target;
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current);
                }
            }, 20);
        };
        
        // Use Intersection Observer to trigger animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    countUp();
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        
        observer.observe(counter);
    });
}

// ==========================================
// SCROLL EFFECTS
// ==========================================

function initializeScrollEffects() {
    // Scroll indicator in hero section
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (scrollIndicator) {
        scrollIndicator.addEventListener('click', function() {
            window.scrollTo({
                top: window.innerHeight,
                behavior: 'smooth'
            });
        });
    }
    
    // Hide scroll indicator after scrolling
    window.addEventListener('scroll', function() {
        if (scrollIndicator) {
            if (window.scrollY > 100) {
                scrollIndicator.style.opacity = '0';
            } else {
                scrollIndicator.style.opacity = '1';
            }
        }
    });
    
    // Back to top functionality
    const backToTop = document.createElement('button');
    backToTop.innerHTML = '<i class="fas fa-arrow-up"></i>';
    backToTop.className = 'back-to-top';
    backToTop.style.cssText = `
        position: fixed;
        bottom: 30px;
        right: 30px;
        width: 50px;
        height: 50px;
        background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
        color: white;
        border: none;
        border-radius: 50%;
        font-size: 20px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        box-shadow: 0 4px 20px rgba(73, 77, 105, 0.3);
    `;
    
    document.body.appendChild(backToTop);
    
    // Show/hide back to top button
    window.addEventListener('scroll', function() {
        if (window.scrollY > 500) {
            backToTop.style.opacity = '1';
            backToTop.style.visibility = 'visible';
        } else {
            backToTop.style.opacity = '0';
            backToTop.style.visibility = 'hidden';
        }
    });
    
    // Back to top click event
    backToTop.addEventListener('click', function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ==========================================
// PARALLAX EFFECTS
// ==========================================

function initializeParallax() {
    // Simple parallax for background elements
    const parallaxElements = document.querySelectorAll('.parallax-element');
    
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        
        parallaxElements.forEach(element => {
            element.style.transform = `translateY(${rate}px)`;
        });
    });
}

// ==========================================
// FORM HANDLING
// ==========================================

function initializeForms() {
    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const email = this.querySelector('input[type="email"]').value;
            
            if (validateEmail(email)) {
                // Show success message
                showNotification('Thank you for subscribing to our newsletter!', 'success');
                this.reset();
            } else {
                showNotification('Please enter a valid email address.', 'error');
            }
        });
    }
    
    // Contact form (if exists)
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Basic form validation
            const formData = new FormData(this);
            let isValid = true;
            let errorMessage = '';
            
            // Validate required fields
            const requiredFields = this.querySelectorAll('[required]');
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    errorMessage = 'Please fill in all required fields.';
                    field.classList.add('is-invalid');
                } else {
                    field.classList.remove('is-invalid');
                }
            });
            
            // Validate email
            const emailField = this.querySelector('input[type="email"]');
            if (emailField && !validateEmail(emailField.value)) {
                isValid = false;
                errorMessage = 'Please enter a valid email address.';
                emailField.classList.add('is-invalid');
            }
            
            if (isValid) {
                // Show loading state
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Sending...';
                submitBtn.disabled = true;
                
                // Simulate form submission
                setTimeout(() => {
                    showNotification('Your message has been sent successfully!', 'success');
                    this.reset();
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }, 2000);
            } else {
                showNotification(errorMessage, 'error');
            }
        });
    }
    
    // Quote form (if exists)
    const quoteForm = document.querySelector('.quote-form');
    if (quoteForm) {
        quoteForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show success message
            showNotification('Quote request submitted successfully! We will contact you soon.', 'success');
            this.reset();
        });
    }
}

// ==========================================
// UTILITY FUNCTIONS
// ==========================================

// Email validation
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        z-index: 9999;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        max-width: 300px;
    `;
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Show notification
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Hide and remove notification
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Debounce function for scroll events
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ==========================================
// PAGE-SPECIFIC FUNCTIONALITY
// ==========================================

// Product page functionality
function initializeProductPage() {
    // Product filter functionality
    const filterBtns = document.querySelectorAll('.filter-btn');
    const productItems = document.querySelectorAll('.product-item');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            
            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Filter products
            productItems.forEach(item => {
                if (filter === 'all' || item.classList.contains(filter)) {
                    item.style.display = 'block';
                    gsap.fromTo(item, 
                        { opacity: 0, scale: 0.8 }, 
                        { opacity: 1, scale: 1, duration: 0.3 }
                    );
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// FAQ page functionality
function initializeFAQPage() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        question.addEventListener('click', function() {
            const isActive = item.classList.contains('active');
            
            // Close all FAQ items
            faqItems.forEach(faqItem => {
                faqItem.classList.remove('active');
                faqItem.querySelector('.faq-answer').style.maxHeight = '0';
            });
            
            // Open clicked item if it wasn't active
            if (!isActive) {
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + 'px';
            }
        });
    });
}

// Initialize page-specific functionality based on body class or current page
function initializePageSpecific() {
    const currentPage = window.location.pathname.split('/').pop();
    
    switch(currentPage) {
        case 'products.html':
            initializeProductPage();
            break;
        case 'faq.html':
            initializeFAQPage();
            break;
        default:
            break;
    }
}

// ==========================================
// PERFORMANCE OPTIMIZATIONS
// ==========================================

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('loading');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Preload critical images
function preloadImages() {
    const criticalImages = [
        'assets/img/hero-bg.jpg',
        'assets/img/organic-manufacturing.jpg'
    ];
    
    criticalImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// ==========================================
// ACCESSIBILITY ENHANCEMENTS
// ==========================================

function initializeAccessibility() {
    // Skip to main content link
    const skipLink = document.createElement('a');
    skipLink.href = '#main';
    skipLink.textContent = 'Skip to main content';
    skipLink.className = 'skip-link';
    skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 6px;
        background: var(--primary-color);
        color: white;
        padding: 8px;
        text-decoration: none;
        border-radius: 4px;
        z-index: 9999;
        transition: top 0.3s;
    `;
    
    skipLink.addEventListener('focus', function() {
        this.style.top = '6px';
    });
    
    skipLink.addEventListener('blur', function() {
        this.style.top = '-40px';
    });
    
    document.body.insertBefore(skipLink, document.body.firstChild);
    
    // Keyboard navigation for custom elements
    document.querySelectorAll('.category-card, .process-step').forEach(element => {
        element.setAttribute('tabindex', '0');
        
        element.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.click();
            }
        });
    });
}

// ==========================================
// ERROR HANDLING
// ==========================================

window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // You could send this to an error tracking service
});

// ==========================================
// INITIALIZATION ON LOAD
// ==========================================

// Run when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    initializePageSpecific();
    initializeLazyLoading();
    initializeAccessibility();
    preloadImages();
});

// Run when everything is loaded
window.addEventListener('load', function() {
    // Remove loading states
    document.body.classList.remove('loading');
    
    // Trigger AOS refresh
    if (typeof AOS !== 'undefined') {
        AOS.refresh();
    }
});
