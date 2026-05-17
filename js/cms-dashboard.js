// ============================================================================
// CMS DASHBOARD - Authentication & Logout Handling
// ============================================================================

class CMSDashboard {
  constructor() {
    this.profileMenu = document.getElementById('profileMenu');
    this.profileToggle = document.getElementById('profileToggle');
    this.profileInfo = document.getElementById('profileInfo');
    this.logoutBtn = document.getElementById('logoutBtn');
    this.logoutModal = document.getElementById('logoutModal');
    this.modalOverlay = document.getElementById('modalOverlay');
    this.cancelLogout = document.getElementById('cancelLogout');
    this.confirmLogout = document.getElementById('confirmLogout');
    
    this.init();
  }

  init() {
    console.log('⏳ CMS Dashboard initializing...');
    
    // Wait for auth manager to be ready
    this.waitForAuth();
  }

  waitForAuth() {
    const checkAuth = setInterval(() => {
      if (window.authManager && window.authManager.isInitialized) {
        clearInterval(checkAuth);
        this.checkAuthentication();
      }
    }, 100);
    
    // Timeout after 3 seconds
    setTimeout(() => {
      clearInterval(checkAuth);
      if (!window.authManager) {
        console.error('❌ Auth manager not available, but continuing...');
        this.setupUI();
      }
    }, 3000);
  }

  checkAuthentication() {
    console.log('🔐 Checking authentication...');
    
    if (window.authManager && window.authManager.isAuthenticated()) {
      console.log('✅ User authenticated');
      this.setupUI();
      this.setupEventListeners();
    } else {
      console.log('🚫 Not authenticated, redirecting to login...');
      window.location.href = 'admin-login.html';
    }
  }

  setupUI() {
    // Update profile info
    if (window.authManager && window.authManager.getUser()) {
      const user = window.authManager.getUser();
      this.profileInfo.innerHTML = `
        <div class="profile-name">${user.displayName || 'Admin User'}</div>
        <div class="profile-email">${user.email}</div>
      `;
    }
    
    console.log('✅ Dashboard UI ready');
  }

  setupEventListeners() {
    // Profile toggle
    this.profileToggle.addEventListener('click', () => this.toggleProfileMenu());
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.profileMenu.contains(e.target)) {
        this.profileMenu.classList.remove('active');
      }
    });
    
    // Logout button
    this.logoutBtn.addEventListener('click', () => this.showLogoutConfirm());
    
    // Modal buttons
    this.cancelLogout.addEventListener('click', () => this.closeLogoutModal());
    this.confirmLogout.addEventListener('click', () => this.handleLogout());
    this.modalOverlay.addEventListener('click', () => this.closeLogoutModal());
    
    console.log('✅ Event listeners setup');
  }

  toggleProfileMenu() {
    this.profileMenu.classList.toggle('active');
  }

  showLogoutConfirm() {
    this.logoutModal.classList.add('show');
  }

  closeLogoutModal() {
    this.logoutModal.classList.remove('show');
  }

  async handleLogout() {
    this.closeLogoutModal();
    
    // Show loading state
    this.confirmLogout.disabled = true;
    this.confirmLogout.textContent = '⏳ Logging out...';
    
    // Wait for auth manager
    while (!window.authManager) {
      await new Promise(r => setTimeout(r, 100));
    }
    
    const result = await window.authManager.logout();
    
    if (result.success) {
      console.log('✅ Logout successful');
      
      // Show success animation
      this.confirmLogout.textContent = '✅ Logged out safely';
      this.confirmLogout.style.background = 'linear-gradient(135deg, #10b981, #059669)';
      
      // Redirect after delay
      setTimeout(() => {
        window.location.href = 'admin-login.html';
      }, 1500);
    } else {
      console.error('❌ Logout failed:', result.error);
      this.confirmLogout.disabled = false;
      this.confirmLogout.textContent = '🚪 Logout';
      alert('Logout failed: ' + (result.error || 'Unknown error'));
    }
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.cmsDashboard = new CMSDashboard();
  });
} else {
  window.cmsDashboard = new CMSDashboard();
}
