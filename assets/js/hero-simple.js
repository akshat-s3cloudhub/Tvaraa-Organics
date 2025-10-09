/**
 * Simple Hero Animations for Tvaraa Organics
 * Clean, lightweight animations that work on all screens
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize animations only if user doesn't prefer reduced motion
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        initSimpleAnimations();
    }
    
    // Initialize counter animations
    initCounters();
    
    // Initialize navbar scroll
    initNavbar();
});

/**
 * Initialize simple entrance animations
 */
function initSimpleAnimations() {
    const elements = [
        { selector: '.hero-badge', delay: 200 },
        { selector: '.hero-title', delay: 400 },
        { selector: '.hero-subtitle', delay: 600 },
        { selector: '.hero-stats', delay: 800 },
        { selector: '.hero-buttons', delay: 1000 },
        { selector: '.hero-visual', delay: 1200 }
    ];

    elements.forEach(item => {
        const element = document.querySelector(item.selector);
        if (element) {
            // Set initial state
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease-out';
            
            // Animate in
            setTimeout(() => {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, item.delay);
        }
    });
}

/**
 * Initialize counter animations
 */
function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.dataset.counted) {
                animateCounter(entry.target);
                entry.target.dataset.counted = 'true';
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => {
        observer.observe(counter);
    });
}

/**
 * Animate counter from 0 to target
 */
function animateCounter(element) {
    const text = element.textContent;
    const target = parseInt(text.replace(/[^0-9]/g, ''));
    const suffix = text.replace(/[0-9]/g, '');
    const duration = 1500;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current) + suffix;
    }, 16);
}

/**
 * Initialize navbar scroll effect
 */
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });
}

/**
 * Add required CSS styles
 */
function addStyles() {
    const styles = document.createElement('style');
    styles.textContent = `
        /* Navbar scroll effect */
        .navbar.scrolled {
            background: rgba(255, 255, 255, 0.95) !important;
            backdrop-filter: blur(10px);
            box-shadow: 0 2px 15px rgba(0, 0, 0, 0.1);
            transition: all 0.3s ease;
        }
        
        /* Button focus for accessibility */
        .hero-buttons .btn:focus {
            outline: 2px solid #bdc3c7;
            outline-offset: 2px;
        }
        
        /* Smooth button interactions */
        .hero-buttons .btn {
            transition: all 0.3s ease !important;
        }
        
        .hero-buttons .btn:hover {
            transform: translateY(-2px);
        }
        
        .hero-buttons .btn:active {
            transform: translateY(0);
        }
        
        /* Product item hover effects */
        .product-item {
            cursor: pointer;
        }
        
        .product-item:hover .product-badge {
            background: linear-gradient(135deg, #5d6d7e, #bdc3c7);
            color: #2b3d4f;
        }
        
        /* Feature badge interactions */
        .feature-badge:hover {
            transform: scale(1.05);
            background: rgba(189, 195, 199, 0.3);
        }
    `;
    document.head.appendChild(styles);
}

// Add styles when script loads
addStyles();

// Handle smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function(e) {
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

// Handle window resize
window.addEventListener('resize', function() {
    // Refresh any animations that depend on viewport size
    clearTimeout(window.resizeTimer);
    window.resizeTimer = setTimeout(function() {
        if (window.AOS) {
            AOS.refresh();
        }
    }, 250);
});

// Export functions for external use
window.TvaraaSimple = {
    initSimpleAnimations,
    initCounters,
    animateCounter
};