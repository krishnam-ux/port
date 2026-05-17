// ============================================================================
// PREMIUM 3D ANIMATIONS - GSAP & Advanced Effects
// ============================================================================

// ============================================================================
// 3D PARALLAX EFFECT WITH MOUSE FOLLOW
// ============================================================================

class ThreeDParallax {
  constructor() {
    // Use the existing hero portrait container
    this.portraitCard = document.querySelector('.portrait-container');
    this.portraitImage = document.querySelector('.portrait-image');
    if (!this.portraitCard || !this.portraitImage) return;

    this.mouseX = 0;
    this.mouseY = 0;
    this.rotationX = 0;
    this.rotationY = 0;
    this.init();
  }

  init() {
    document.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    document.addEventListener('mouseleave', () => this.resetRotation());

    const heroCenterWrapper = document.querySelector('.hero-center');
    
    // Check if image already failed to load (cached, or failed before JavaScript loaded)
    if (this.portraitImage.complete) {
      if (this.portraitImage.naturalHeight === 0 || !this.portraitImage.naturalWidth) {
        // Image failed to load
        this.hideImageSection(heroCenterWrapper);
      }
    }

    // If the image fails to load, completely hide the entire hero-center section (no empty box)
    this.portraitImage.addEventListener('error', () => {
      this.portraitCard.classList.add('portrait-image-missing');
      this.hideImageSection(heroCenterWrapper);
    });

    // On success, ensure wrapper is visible
    this.portraitImage.addEventListener('load', () => {
      this.portraitCard.classList.remove('portrait-image-missing');
      if (heroCenterWrapper) {
        heroCenterWrapper.style.display = '';
      }
      // Remove the layout adjustment class
      const heroContent = document.querySelector('.hero-content');
      if (heroContent) {
        heroContent.classList.remove('image-hidden');
      }
    });
  }

  hideImageSection(heroCenterWrapper) {
    // Hide the entire hero-center section (not just portrait container)
    if (heroCenterWrapper) {
      heroCenterWrapper.style.display = 'none';
    }
    // Also hide the portrait container to be safe
    this.portraitCard.style.display = 'none';
    
    // Update the grid layout to adapt - add class to parent
    const heroContent = document.querySelector('.hero-content');
    if (heroContent) {
      heroContent.classList.add('image-hidden');
    }
  }

  handleMouseMove(e) {
    const rect = this.portraitCard.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    this.mouseX = e.clientX - centerX;
    this.mouseY = e.clientY - centerY;

    this.rotationY = (this.mouseX / rect.width) * 18;
    this.rotationX = -(this.mouseY / rect.height) * 18;

    this.portraitCard.style.transform = `
      perspective(1200px)
      rotateX(${this.rotationX}deg)
      rotateY(${this.rotationY}deg)
      scale(1.02)
      translateZ(55px)
    `;
  }

  resetRotation() {
    this.portraitCard.style.transform = 'perspective(1200px) rotateX(0) rotateY(0) scale(1) translateZ(0px)';
  }
}

// ============================================================================
// SCROLL REVEAL WITH INTERSECTION OBSERVER
// ============================================================================

class ScrollReveal {
  constructor() {
    this.elements = document.querySelectorAll('[data-reveal]');
    this.init();
  }

  init() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = entry.target.dataset.revealDelay || 0;
          setTimeout(() => {
            entry.target.classList.add('active');
          }, parseInt(delay));
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    this.elements.forEach((el) => {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }
}

// ============================================================================
// FLOATING PARTICLES BACKGROUND WITH ENHANCED ANIMATION
// ============================================================================

class EnhancedFloatingParticles {
  constructor(containerId = 'particles-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.particles = [];
    this.particleCount = window.innerWidth > 1024 ? 50 : window.innerWidth > 768 ? 30 : 15;
    this.mouseX = window.innerWidth / 2;
    this.mouseY = window.innerHeight / 2;
    this.init();
  }

  init() {
    this.createParticles();
    this.animate();
    
    window.addEventListener('resize', () => this.handleResize());
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
    });
  }

  createParticles() {
    for (let i = 0; i < this.particleCount; i++) {
      const particle = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        size: Math.random() * 4 + 1,
        opacity: Math.random() * 0.6 + 0.2,
        attract: Math.random() > 0.7,
        attraction: Math.random() * 0.002 + 0.001
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
        box-shadow: 
          0 0 ${particle.size * 3}px rgba(168, 85, 247, ${particle.opacity}),
          0 0 ${particle.size * 6}px rgba(217, 70, 239, ${particle.opacity * 0.5});
        z-index: -1;
        filter: blur(0.5px);
      `;

      this.container.appendChild(element);
      particle.element = element;
      this.particles.push(particle);
    }
  }

  animate() {
    this.particles.forEach((particle) => {
      // Base movement
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Mouse attraction
      if (particle.attract) {
        const dx = this.mouseX - particle.x;
        const dy = this.mouseY - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 300) {
          particle.vx += (dx / distance) * particle.attraction;
          particle.vy += (dy / distance) * particle.attraction;
        }
      }

      // Repel from edges and wrap
      if (particle.x > window.innerWidth + 50) particle.x = -50;
      if (particle.x < -50) particle.x = window.innerWidth + 50;
      if (particle.y > window.innerHeight + 50) particle.y = -50;
      if (particle.y < -50) particle.y = window.innerHeight + 50;

      // Speed limit
      const speed = Math.sqrt(particle.vx ** 2 + particle.vy ** 2);
      if (speed > 2) {
        particle.vx = (particle.vx / speed) * 2;
        particle.vy = (particle.vy / speed) * 2;
      }

      // Friction
      particle.vx *= 0.995;
      particle.vy *= 0.995;

      particle.element.style.left = particle.x + 'px';
      particle.element.style.top = particle.y + 'px';
    });

    requestAnimationFrame(() => this.animate());
  }

  handleResize() {
    const newCount = window.innerWidth > 1024 ? 50 : window.innerWidth > 768 ? 30 : 15;
    if (newCount !== this.particleCount) {
      this.particleCount = newCount;
      this.particles.forEach((p) => p.element.remove());
      this.particles = [];
      this.createParticles();
    }
  }
}

// ============================================================================
// MAGNETIC BUTTON EFFECT
// ============================================================================

class MagneticButton {
  constructor() {
    this.buttons = document.querySelectorAll('.btn-glow');
    this.init();
  }

  init() {
    this.buttons.forEach((btn) => {
      btn.addEventListener('mousemove', (e) => this.handleMouseMove(e, btn));
      btn.addEventListener('mouseleave', (e) => this.handleMouseLeave(e, btn));
    });
  }

  handleMouseMove(e, btn) {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;

    const distance = Math.sqrt(x * x + y * y);
    const maxDistance = Math.sqrt(
      rect.width * rect.width + rect.height * rect.height
    ) / 2;

    if (distance < maxDistance) {
      const moveX = (x / maxDistance) * 8;
      const moveY = (y / maxDistance) * 8;
      btn.style.transform = `translate(${moveX}px, ${moveY}px)`;
    }
  }

  handleMouseLeave(e, btn) {
    btn.style.transform = 'translate(0, 0)';
  }
}

// ============================================================================
// ANIMATED GRADIENT BACKGROUND
// ============================================================================

class AnimatedGradientMesh {
  constructor() {
    this.mesh = document.querySelector('.gradient-mesh');
    if (!this.mesh) return;

    this.angle = 0;
    this.animate();
  }

  animate() {
    this.angle += 0.2;
    this.mesh.style.transform = `
      translate(${Math.sin(this.angle * 0.01) * 30}px, ${Math.cos(this.angle * 0.015) * 30}px)
      rotate(${this.angle * 0.1}deg)
    `;

    requestAnimationFrame(() => this.animate());
  }
}

// ============================================================================
// FLOATING STARS GENERATOR
// ============================================================================

class FloatingStars {
  constructor() {
    this.container = document.querySelector('.floating-stars');
    if (!this.container) return;

    this.starCount = window.innerWidth > 1024 ? 80 : window.innerWidth > 768 ? 50 : 30;
    this.init();
  }

  init() {
    for (let i = 0; i < this.starCount; i++) {
      const star = document.createElement('div');
      star.className = 'star';
      star.style.left = Math.random() * 100 + '%';
      star.style.top = Math.random() * 100 + '%';
      star.style.animationDelay = Math.random() * 3 + 's';
      this.container.appendChild(star);
    }
  }
}

// ============================================================================
// SMOOTH SCROLL PARALLAX
// ============================================================================

class SmoothScrollParallax {
  constructor() {
    this.parallaxElements = document.querySelectorAll('[data-parallax-scroll]');
    if (this.parallaxElements.length === 0) return;

    this.init();
  }

  init() {
    window.addEventListener('scroll', () => this.handleScroll());
  }

  handleScroll() {
    const scrolled = window.scrollY;

    this.parallaxElements.forEach((el) => {
      const speed = el.dataset.parallaxScroll || 0.5;
      el.style.transform = `translateY(${scrolled * speed}px)`;
    });
  }
}

// ============================================================================
// GLOW TEXT ANIMATION
// ============================================================================

class GlowText {
  constructor() {
    this.glowTexts = document.querySelectorAll('.glow-text');
    if (this.glowTexts.length === 0) return;

    this.init();
  }

  init() {
    this.glowTexts.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        el.style.animation = 'none';
        setTimeout(() => {
          el.style.animation = '';
        }, 10);
      });
    });
  }
}

// ============================================================================
// TECH TAG ANIMATION
// ============================================================================

class TechTagAnimation {
  constructor() {
    this.tags = document.querySelectorAll('.tech-tag');
    if (this.tags.length === 0) return;

    this.init();
  }

  init() {
    this.tags.forEach((tag, index) => {
      tag.style.animationDelay = (index * 0.1) + 's';
      
      tag.addEventListener('mouseenter', () => {
        tag.style.boxShadow = `
          0 4px 16px rgba(168, 85, 247, 0.3),
          0 0 30px rgba(217, 70, 239, 0.4)
        `;
      });

      tag.addEventListener('mouseleave', () => {
        tag.style.boxShadow = '0 4px 16px rgba(168, 85, 247, 0.3)';
      });
    });
  }
}

// ============================================================================
// FLOATING INPUT ANIMATION
// ============================================================================

class FloatingInputAnimation {
  constructor() {
    this.inputs = document.querySelectorAll('.floating-input input, .floating-input textarea');
    if (this.inputs.length === 0) return;

    this.init();
  }

  init() {
    this.inputs.forEach((input) => {
      input.addEventListener('focus', (e) => {
        e.target.parentElement.classList.add('focused');
      });

      input.addEventListener('blur', (e) => {
        if (!e.target.value) {
          e.target.parentElement.classList.remove('focused');
        }
      });
    });
  }
}

// ============================================================================
// HERO TEXT ANIMATION ON LOAD
// ============================================================================

class HeroTextAnimation {
  constructor() {
    this.heroTitle = document.querySelector('.hero-left h1');
    if (!this.heroTitle) return;

    this.init();
  }

  init() {
    const text = this.heroTitle.textContent;
    this.heroTitle.textContent = '';

    const letters = text.split('');
    letters.forEach((letter, index) => {
      const span = document.createElement('span');
      span.textContent = letter;
      span.style.opacity = '0';
      span.style.animation = `fadeInUp 0.6s ease-out ${index * 0.05}s forwards`;
      this.heroTitle.appendChild(span);
    });
  }
}

// ============================================================================
// CURSOR GLOW EFFECT
// ============================================================================

class CursorGlowEffect {
  constructor() {
    this.cursorGlow = document.querySelector('.cursor-glow');
    if (!this.cursorGlow) {
      this.createCursorGlow();
    }

    this.init();
  }

  createCursorGlow() {
    const glow = document.createElement('div');
    glow.className = 'cursor-glow';
    glow.style.cssText = `
      position: fixed;
      width: 80px;
      height: 80px;
      background: radial-gradient(circle, rgba(168, 85, 247, 0.3), transparent);
      border-radius: 50%;
      pointer-events: none;
      z-index: 9999;
      display: none;
      box-shadow: 0 0 40px rgba(168, 85, 247, 0.4);
    `;
    document.body.appendChild(glow);
    this.cursorGlow = glow;
  }

  init() {
    document.addEventListener('mousemove', (e) => {
      this.cursorGlow.style.left = (e.clientX - 40) + 'px';
      this.cursorGlow.style.top = (e.clientY - 40) + 'px';
    });

    document.addEventListener('mouseenter', () => {
      this.cursorGlow.style.display = 'block';
    });

    document.addEventListener('mouseleave', () => {
      this.cursorGlow.style.display = 'none';
    });
  }
}

// ============================================================================
// NUMBER COUNTER WITH ANIMATION
// ============================================================================

class AnimatedCounter {
  constructor() {
    this.counters = document.querySelectorAll('[data-count]');
    if (this.counters.length === 0) return;

    this.init();
  }

  init() {
    this.counters.forEach((counter) => {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
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
// INIT ANIMATIONS
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Initialize all animation classes
  new ThreeDParallax();
  new ScrollReveal();
  new EnhancedFloatingParticles();
  new MagneticButton();
  new AnimatedGradientMesh();
  new FloatingStars();
  new SmoothScrollParallax();
  new GlowText();
  new TechTagAnimation();
  new FloatingInputAnimation();
  new HeroTextAnimation();
  new CursorGlowEffect();
  new AnimatedCounter();

  console.log('🎬 Premium 3D animations initialized!');
});
