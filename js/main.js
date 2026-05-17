// ============================================================================
// PREMIUM PORTFOLIO - MAIN JAVASCRIPT
// Krishnam Dwivedi - AI Entrepreneur & Developer
// ============================================================================

// ============================================================================
// NAVBAR FUNCTIONALITY
// ============================================================================

class Navbar {
  constructor() {
    this.navbar = document.querySelector('.navbar');
    this.hamburger = document.querySelector('.hamburger');
    this.navMenu = document.querySelector('.navbar-menu');
    this.navLinks = document.querySelectorAll('.navbar-link');
    this.init();
  }

  init() {
    // Hamburger menu toggle
    if (this.hamburger) {
      this.hamburger.addEventListener('click', () => this.toggleMenu());
    }

    // Close menu on link click
    this.navLinks.forEach(link => {
      link.addEventListener('click', () => this.closeMenu());
    });

    // Scroll effect
    window.addEventListener('scroll', () => this.handleScroll());

    // Set active link based on current page
    this.setActiveLink();
  }

  toggleMenu() {
    this.hamburger.classList.toggle('active');
    this.navMenu.classList.toggle('active');
  }

  closeMenu() {
    this.hamburger.classList.remove('active');
    this.navMenu.classList.remove('active');
  }

  handleScroll() {
    if (window.scrollY > 50) {
      this.navbar.classList.add('scrolled');
    } else {
      this.navbar.classList.remove('scrolled');
    }
  }

  setActiveLink() {
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    this.navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }
}

// ============================================================================
// INTERSECTION OBSERVER FOR ANIMATIONS
// ============================================================================

class AnimationObserver {
  constructor() {
    this.options = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          this.observer.unobserve(entry.target);
        }
      });
    }, this.options);
    this.init();
  }

  init() {
    const animatedElements = document.querySelectorAll('[data-animate]');
    animatedElements.forEach(element => {
      this.observer.observe(element);
    });
  }
}

// ============================================================================
// MOUSE PARALLAX EFFECT
// ============================================================================

class ParallaxEffect {
  constructor() {
    this.parallaxElements = document.querySelectorAll('[data-parallax]');
    this.init();
  }

  init() {
    if (this.parallaxElements.length === 0) return;

    document.addEventListener('mousemove', (e) => {
      const mouseX = (e.clientX / window.innerWidth) - 0.5;
      const mouseY = (e.clientY / window.innerHeight) - 0.5;

      this.parallaxElements.forEach(element => {
        const speed = element.dataset.parallax || 10;
        const x = mouseX * speed;
        const y = mouseY * speed;
        
        element.style.transform = `translate(${x}px, ${y}px)`;
      });
    });
  }
}

// ============================================================================
// CURSOR GLOW EFFECT
// ============================================================================

class CursorGlow {
  constructor() {
    this.cursorGlow = document.querySelector('.cursor-glow');
    if (!this.cursorGlow) return;
    
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      this.cursorGlow.style.left = e.clientX + 'px';
      this.cursorGlow.style.top = e.clientY + 'px';
    });

    document.addEventListener('mouseenter', () => {
      this.cursorGlow.classList.add('active');
    });

    document.addEventListener('mouseleave', () => {
      this.cursorGlow.classList.remove('active');
    });
  }
}

// ============================================================================
// SCROLL REVEAL NUMBERS
// ============================================================================

class NumberCounter {
  constructor() {
    this.counters = document.querySelectorAll('[data-count]');
    this.init();
  }

  init() {
    this.counters.forEach(counter => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(counter);
    });
  }

  animateCounter(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        element.textContent = target;
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }
}

// ============================================================================
// FLOATING PARTICLES BACKGROUND
// ============================================================================

class FloatingParticles {
  constructor(containerId = 'particles-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.particles = [];
    this.particleCount = window.innerWidth > 768 ? 30 : 15;
    this.init();
  }

  init() {
    this.createParticles();
    this.animate();
    window.addEventListener('resize', () => this.handleResize());
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        opacity: Math.random() * 0.5 + 0.2
      };

      const element = document.createElement('div');
      element.className = 'particle';
      element.style.cssText = `
        position: fixed;
        width: ${particle.size}px;
        height: ${particle.size}px;
        background: rgba(168, 85, 247, ${particle.opacity});
        border-radius: 50%;
        left: ${particle.x}px;
        top: ${particle.y}px;
        pointer-events: none;
        box-shadow: 0 0 ${particle.size * 2}px rgba(168, 85, 247, ${particle.opacity});
        z-index: -1;
      `;

      this.container.appendChild(element);
      particle.element = element;
      this.particles.push(particle);
    }
  }

  animate() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;

      if (particle.x > window.innerWidth) particle.x = -10;
      if (particle.x < -10) particle.x = window.innerWidth;
      if (particle.y > window.innerHeight) particle.y = -10;
      if (particle.y < -10) particle.y = window.innerHeight;

      particle.element.style.left = particle.x + 'px';
      particle.element.style.top = particle.y + 'px';
    });

    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    const newCount = window.innerWidth > 768 ? 30 : 15;
    if (newCount !== this.particleCount) {
      this.particleCount = newCount;
      this.particles.forEach(p => p.element.remove());
      this.particles = [];
      this.createParticles();
    }
  }
}

// ============================================================================
// SMOOTH SCROLL TO ANCHOR
// ============================================================================

class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;
        
        const element = document.querySelector(href);
        if (element) {
          e.preventDefault();
          element.scrollIntoView({ behavior: 'smooth' });
        }
      });
    });
  }
}

// ============================================================================
// PAGE TRANSITIONS
// ============================================================================

class PageTransition {
  constructor() {
    this.init();
  }

  init() {
    // Fade in on page load
    document.body.classList.add('fade-in');

    // Handle link clicks for smooth transitions
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto')) {
        return;
      }

      e.preventDefault();
      this.fadeOut(() => {
        window.location.href = href;
      });
    });
  }

  fadeOut(callback) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.3s ease-out';
    setTimeout(callback, 300);
  }
}

// ============================================================================
// FORM VALIDATION
// ============================================================================

class FormValidator {
  constructor(formSelector) {
    this.form = document.querySelector(formSelector);
    if (!this.form) return;
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  handleSubmit(e) {
    const inputs = this.form.querySelectorAll('input, textarea');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
        this.showError(input);
      }
    });

    return isValid;
  }

  validateField(field) {
    const value = field.value.trim();
    const type = field.type;

    if (!value) return false;

    if (type === 'email') {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
    }

    return true;
  }

  showError(field) {
    field.classList.add('error');
    field.style.borderColor = '#ff6b6b';
  }
}

// ============================================================================
// ADMIN SHORTCUT - KEYBOARD NAVIGATION
// ============================================================================

class AdminShortcut {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      // Windows + K (or Cmd + K on Mac) to open admin panel
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        this.openAdminPanel();
      }
    });
  }

  openAdminPanel() {
    const currentPage = window.location.pathname;
    
    // If already on CMS page, the cms.js will handle it
    if (currentPage.includes('cms.html')) {
      return;
    }
    
    // Navigate to premium CMS
    window.location.href = 'cms.html';
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  new Navbar();
  new AnimationObserver();
  new ParallaxEffect();
  new CursorGlow();
  new NumberCounter();
  new FloatingParticles();
  new SmoothScroll();
  new PageTransition();
  new AdminShortcut();
});
