// ============================================================================
// ADVANCED 3D INTERACTIVE FEATURES - PART 2
// Premium Portfolio Advanced Interactivity
// ============================================================================

// ============================================================================
// PROJECT CARDS - 3D INTERACTIVE TILT
// ============================================================================

class ProjectCard3DTilt {
  constructor() {
    this.projectCards = document.querySelectorAll('.project-card');
    if (this.projectCards.length === 0) return;

    this.init();
  }

  init() {
    this.projectCards.forEach((card) => {
      card.addEventListener('mousemove', (e) => this.handleMouseMove(e, card));
      card.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, card));
    });
  }

  handleMouseMove(e, card) {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;

    card.style.transform = `
      perspective(1200px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      scale(1.02)
      translateZ(30px)
    `;
  }

  handleMouseLeave(e, card) {
    card.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1)';
  }
}

// ============================================================================
// SKILL CARDS - INTERACTIVE REVEAL
// ============================================================================

class SkillCardInteractive {
  constructor() {
    this.skillCards = document.querySelectorAll('.skill-card');
    if (this.skillCards.length === 0) return;

    this.init();
  }

  init() {
    this.skillCards.forEach((card) => {
      const skillLevel = card.dataset.skillLevel || '80';
      const levelElement = card.querySelector('.skill-level');
      
      if (levelElement) {
        levelElement.style.setProperty('--skill-level', skillLevel + '%');
      }

      // Animate on scroll
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCard(card);
            observer.unobserve(card);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(card);
    });
  }

  animateCard(card) {
    card.style.animation = 'card-reveal 0.8s ease-out forwards';
  }
}

// ============================================================================
// CERTIFICATION CARDS - BOUNCE & FLOAT ANIMATION
// ============================================================================

class CertCardAnimation {
  constructor() {
    this.certCards = document.querySelectorAll('.cert-card');
    if (this.certCards.length === 0) return;

    this.init();
  }

  init() {
    this.certCards.forEach((card, index) => {
      // Add staggered animation
      card.style.animationDelay = (index * 0.1) + 's';

      card.addEventListener('mouseenter', () => {
        card.style.animation = 'none';
        setTimeout(() => {
          card.style.animation = 'icon-spin 0.6s ease-out';
        }, 10);
      });
    });
  }
}

// ============================================================================
// SECTION TITLE ANIMATION - GRADIENT ANIMATION
// ============================================================================

class SectionTitleAnimation {
  constructor() {
    this.titles = document.querySelectorAll('.section-title h2');
    if (this.titles.length === 0) return;

    this.init();
  }

  init() {
    this.titles.forEach((title) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateTitle(title);
            observer.unobserve(title);
          }
        });
      }, { threshold: 0.5 });

      observer.observe(title);
    });
  }

  animateTitle(title) {
    title.style.animation = 'fadeInUp 0.8s ease-out';
  }
}

// ============================================================================
// CONTACT METHOD CARDS - 3D PERSPECTIVE TILT
// ============================================================================

class ContactMethodTilt {
  constructor() {
    this.methods = document.querySelectorAll('.contact-method');
    if (this.methods.length === 0) return;

    this.init();
  }

  init() {
    this.methods.forEach((method) => {
      method.addEventListener('mousemove', (e) => this.handleMouseMove(e, method));
      method.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, method));
    });
  }

  handleMouseMove(e, method) {
    const rect = method.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = (y - centerY) / 20;
    const rotateY = (centerX - x) / 20;

    method.style.transform = `
      perspective(800px)
      rotateX(${rotateX}deg)
      rotateY(${rotateY}deg)
      translateY(-4px)
    `;
  }

  handleMouseLeave(e, method) {
    method.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
  }
}

// ============================================================================
// TIMELINE ITEMS - SEQUENTIAL REVEAL
// ============================================================================

class TimelineAnimation {
  constructor() {
    this.timelineItems = document.querySelectorAll('.timeline-item');
    if (this.timelineItems.length === 0) return;

    this.init();
  }

  init() {
    this.timelineItems.forEach((item, index) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            item.style.animationDelay = (index * 0.15) + 's';
            observer.unobserve(item);
          }
        });
      }, { threshold: 0.3 });

      observer.observe(item);
    });
  }
}

// ============================================================================
// GRADIENT TEXT BACKGROUND ANIMATION
// ============================================================================

class GradientTextBackground {
  constructor() {
    this.gradientTexts = document.querySelectorAll('.gradient-text');
    if (this.gradientTexts.length === 0) return;

    this.angle = 0;
    this.init();
  }

  init() {
    this.animate();
  }

  animate() {
    this.angle += 0.5;

    this.gradientTexts.forEach((text) => {
      text.style.backgroundPosition = `${this.angle}% center`;
    });

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// SCROLL PROGRESS INDICATOR
// ============================================================================

class ScrollProgressIndicator {
  constructor() {
    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.updateProgress());
  }

  updateProgress() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = (scrollTop / docHeight) * 100;

    // You can use this for various effects
    document.documentElement.style.setProperty('--scroll-progress', scrollPercent + '%');
  }
}

// ============================================================================
// TECH TAG RIPPLE EFFECT
// ============================================================================

class TechTagRipple {
  constructor() {
    this.tags = document.querySelectorAll('.tech-tag');
    if (this.tags.length === 0) return;

    this.init();
  }

  init() {
    this.tags.forEach((tag) => {
      tag.addEventListener('click', (e) => this.createRipple(e, tag));
    });
  }

  createRipple(e, tag) {
    const ripple = document.createElement('span');
    const rect = tag.getBoundingClientRect();

    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    ripple.style.cssText = `
      position: absolute;
      width: ${size}px;
      height: ${size}px;
      background: rgba(255, 255, 255, 0.5);
      border-radius: 50%;
      left: ${x}px;
      top: ${y}px;
      animation: ripple-effect 0.6s ease-out;
      pointer-events: none;
    `;

    // Add ripple animation if not already in styles
    if (!document.querySelector('style[data-ripple]')) {
      const style = document.createElement('style');
      style.setAttribute('data-ripple', 'true');
      style.textContent = `
        @keyframes ripple-effect {
          from {
            transform: scale(1);
            opacity: 1;
          }
          to {
            transform: scale(4);
            opacity: 0;
          }
        }
      `;
      document.head.appendChild(style);
    }

    tag.style.position = 'relative';
    tag.style.overflow = 'hidden';
    tag.appendChild(ripple);

    setTimeout(() => ripple.remove(), 600);
  }
}

// ============================================================================
// CERTIFICATION BADGE ANIMATION
// ============================================================================

class CertBadgeAnimation {
  constructor() {
    this.badges = document.querySelectorAll('.cert-badge');
    if (this.badges.length === 0) return;

    this.init();
  }

  init() {
    this.badges.forEach((badge) => {
      badge.addEventListener('mouseenter', () => {
        badge.style.animation = 'badge-spin 0.6s ease-out';
      });
    });
  }
}

// Add badge-spin keyframe animation
const addBadgeAnimation = () => {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes badge-spin {
      from {
        transform: scale(1) rotateZ(0deg);
      }
      to {
        transform: scale(1.15) rotateZ(360deg);
      }
    }
  `;
  document.head.appendChild(style);
};

// ============================================================================
// PAGE LOAD SEQUENCE ANIMATION
// ============================================================================

class PageLoadSequence {
  constructor() {
    this.init();
  }

  init() {
    // Add fade-in animation to body on load
    document.body.style.animation = 'fade-in 0.6s ease-out';

    // Stagger element animations
    const staggerElements = document.querySelectorAll('[data-stagger]');
    staggerElements.forEach((el, index) => {
      el.style.animation = `fadeInUp 0.6s ease-out ${index * 0.1}s both`;
    });
  }
}

// ============================================================================
// INITIALIZATION - PART 2
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize advanced animation classes
  new ProjectCard3DTilt();
  new SkillCardInteractive();
  new CertCardAnimation();
  new SectionTitleAnimation();
  new ContactMethodTilt();
  new TimelineAnimation();
  new GradientTextBackground();
  new ScrollProgressIndicator();
  new TechTagRipple();
  new CertBadgeAnimation();
  new PageLoadSequence();

  // Add badge animation keyframes
  addBadgeAnimation();

  console.log('✨ Advanced 3D interactive features initialized!');
});
