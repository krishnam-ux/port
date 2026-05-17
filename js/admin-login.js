// ============================================================================
// ADMIN LOGIN PAGE - JavaScript
// Handles login form, password toggle, and navigation
// ============================================================================

class AdminLoginPage {
  constructor() {
    this.form = document.getElementById('loginForm');
    this.emailInput = document.getElementById('email');
    this.passwordInput = document.getElementById('password');
    this.passwordToggle = document.getElementById('passwordToggle');
    this.rememberMe = document.getElementById('rememberMe');
    this.loginBtn = document.getElementById('loginBtn');
    this.errorMessage = document.getElementById('errorMessage');
    this.forgotPassword = document.querySelector('.forgot-password');
    
    this.isLoading = false;
    this.init();
  }

  init() {
    console.log('⏳ Login page initializing...');
    
    // Check if already logged in
    setTimeout(() => {
      if (window.authManager && window.authManager.isAuthenticated()) {
        console.log('✅ Already logged in, redirecting...');
        window.location.href = 'cms-v2.html';
        return;
      }
    }, 500);

    // Set up event listeners
    this.setupEventListeners();
    
    // Load saved email if available
    this.loadSavedEmail();
    
    // Animate page on load
    this.animateOnLoad();
    
    console.log('✅ Login page ready');
  }

  setupEventListeners() {
    // Form submission
    this.form.addEventListener('submit', (e) => this.handleLogin(e));
    
    // Password toggle
    this.passwordToggle.addEventListener('click', (e) => {
      e.preventDefault();
      this.togglePasswordVisibility();
    });
    
    // Clear error on input
    this.emailInput.addEventListener('input', () => this.clearError());
    this.passwordInput.addEventListener('input', () => this.clearError());
    
    // Forgot password
    this.forgotPassword.addEventListener('click', (e) => {
      e.preventDefault();
      this.handleForgotPassword();
    });
    
    // Enter key on password field
    this.passwordInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !this.isLoading) {
        this.form.dispatchEvent(new Event('submit'));
      }
    });
  }

  togglePasswordVisibility() {
    const isPassword = this.passwordInput.type === 'password';
    
    if (isPassword) {
      this.passwordInput.type = 'text';
      this.passwordToggle.classList.add('visible');
      this.passwordToggle.innerHTML = '<span class="toggle-icon">🙈</span>';
    } else {
      this.passwordInput.type = 'password';
      this.passwordToggle.classList.remove('visible');
      this.passwordToggle.innerHTML = '<span class="toggle-icon">👁️</span>';
    }
  }

  async handleLogin(e) {
    e.preventDefault();
    
    if (this.isLoading) return;
    
    const email = this.emailInput.value.trim();
    const password = this.passwordInput.value;
    
    // Validation
    if (!email) {
      this.showError('Please enter your email');
      this.emailInput.focus();
      return;
    }
    
    if (!password) {
      this.showError('Please enter your password');
      this.passwordInput.focus();
      return;
    }
    
    if (!this.isValidEmail(email)) {
      this.showError('Please enter a valid email');
      this.emailInput.focus();
      return;
    }
    
    // Attempt login
    this.setLoading(true);
    
    // Wait for auth manager to be ready
    while (!window.authManager) {
      await new Promise(r => setTimeout(r, 100));
    }
    
    const result = await window.authManager.login(email, password);
    
    if (result.success) {
      // Save email if remember me is checked
      if (this.rememberMe.checked) {
        localStorage.setItem('savedAdminEmail', email);
      } else {
        localStorage.removeItem('savedAdminEmail');
      }
      
      this.showSuccessAnimation();
      
      // Redirect after animation
      setTimeout(() => {
        window.location.href = 'cms-v2.html';
      }, 1500);
    } else {
      this.showError(result.error || 'Login failed');
      this.setLoading(false);
    }
  }

  showError(message) {
    this.errorMessage.textContent = message;
    this.errorMessage.classList.add('show');
    
    // Shake animation
    this.form.style.animation = 'none';
    setTimeout(() => {
      this.form.style.animation = 'shake 0.4s ease';
    }, 10);
  }

  clearError() {
    this.errorMessage.classList.remove('show');
    this.errorMessage.textContent = '';
  }

  setLoading(loading) {
    this.isLoading = loading;
    
    if (loading) {
      this.loginBtn.classList.add('loading');
      this.loginBtn.disabled = true;
      this.emailInput.disabled = true;
      this.passwordInput.disabled = true;
    } else {
      this.loginBtn.classList.remove('loading');
      this.loginBtn.disabled = false;
      this.emailInput.disabled = false;
      this.passwordInput.disabled = false;
    }
  }

  showSuccessAnimation() {
    this.loginBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    this.loginBtn.innerHTML = '<span class="button-text">✅ Welcome!</span>';
    this.loginBtn.disabled = true;
  }

  handleForgotPassword() {
    alert('Password reset functionality coming soon.\n\nFor demo: Use admin@krishnam.com / ccfcma074r@');
  }

  loadSavedEmail() {
    const savedEmail = localStorage.getItem('savedAdminEmail');
    if (savedEmail) {
      this.emailInput.value = savedEmail;
      this.rememberMe.checked = true;
      this.passwordInput.focus();
    }
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  animateOnLoad() {
    // Animate card
    gsap.from('.login-card', {
      duration: 0.6,
      opacity: 0,
      y: 40,
      ease: 'back.out'
    });
    
    // Animate form elements
    gsap.from('.form-group', {
      duration: 0.5,
      opacity: 0,
      x: -20,
      stagger: 0.1,
      ease: 'power2.out',
      delay: 0.2
    });
    
    // Animate button
    gsap.from('.login-button', {
      duration: 0.5,
      opacity: 0,
      y: 20,
      ease: 'power2.out',
      delay: 0.5
    });
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.loginPage = new AdminLoginPage();
  });
} else {
  window.loginPage = new AdminLoginPage();
}
