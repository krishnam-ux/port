// ============================================================================
// ADMIN PANEL - MAIN JAVASCRIPT
// Authentication, Login, and Portal Management
// Demo Mode Support (Works with or without Firebase)
// ============================================================================

class AdminPortal {
  constructor() {
    this.currentUser = null;
    this.loginModal = document.getElementById('adminLoginModal');
    this.dashboard = document.getElementById('adminDashboard');
    this.loginForm = document.getElementById('adminLoginForm');
    this.isDemoMode = true;
    this.demoUsers = {
      'admin@krishnam.com': 'ccfcma074r@'
    };
    this.init();
  }

  /**
   * Initialize admin portal
   */
  init() {
    this.setupEventListeners();
    this.checkAuthState();
    this.setupKeyboardShortcut();
    console.log('📱 Admin Portal initialized in DEMO mode (works offline)');
  }

  /**
   * Setup all event listeners
   */
  setupEventListeners() {
    // Login form
    if (this.loginForm) {
      this.loginForm.addEventListener('submit', (e) => this.handleLogin(e));
    }

    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    if (passwordToggle) {
      passwordToggle.addEventListener('click', () => this.togglePasswordVisibility());
    }

    // Logout buttons
    document.getElementById('logoutBtn')?.addEventListener('click', () => this.logout());
    document.getElementById('sidebarLogout')?.addEventListener('click', () => this.logout());

    // Sidebar navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => this.switchSection(e));
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle')?.addEventListener('click', () => this.toggleSidebar());

    // Theme toggle
    document.getElementById('themeToggle')?.addEventListener('click', () => this.toggleTheme());

    // Notification bell
    document.getElementById('notificationBell')?.addEventListener('click', () => this.toggleNotifications());

    // Profile avatar
    document.querySelector('.profile-avatar')?.addEventListener('click', () => this.toggleProfileMenu());

    // Close notifications
    document.getElementById('closeNotifications')?.addEventListener('click', () => this.closeNotifications());

    // Remember me checkbox
    const rememberMe = document.getElementById('rememberMe');
    if (rememberMe) {
      rememberMe.checked = localStorage.getItem('adminRememberMe') === 'true';
    }
  }

  /**
   * Setup Windows + K keyboard shortcut
   */
  setupKeyboardShortcut() {
    document.addEventListener('keydown', (e) => {
      // Windows + K / Ctrl + K (or Cmd + K on Mac)
      if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
        e.preventDefault();
        e.stopPropagation();
        this.toggleAdminPortal();
      }
    });
  }

  /**
   * Toggle admin portal visibility
   */
  toggleAdminPortal() {
    if (this.currentUser) {
      // User is logged in, show/hide dashboard
      this.dashboard.style.display = this.dashboard.style.display === 'none' ? 'grid' : 'none';
    } else {
      // Show login modal
      this.loginModal.classList.remove('hidden');
    }
  }

  /**
   * Check authentication state
   */
  checkAuthState() {
    // Check localStorage for demo session
    const demoSessionEmail = localStorage.getItem('admin_demo_session');
    
    if (typeof firebase !== 'undefined' && firebase.auth) {
      // Firebase mode
      auth.onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = user;
          this.loadAdminPanel();
        } else if (demoSessionEmail && this.demoUsers[demoSessionEmail]) {
          // Demo session exists
          this.currentUser = { email: demoSessionEmail, isDemo: true };
          this.loadAdminPanel();
        } else {
          this.currentUser = null;
          this.showLoginModal();
        }
      });
    } else {
      // Demo mode only
      if (demoSessionEmail && this.demoUsers[demoSessionEmail]) {
        this.currentUser = { email: demoSessionEmail, isDemo: true };
        this.loadAdminPanel();
      } else {
        this.showLoginModal();
      }
    }
  }

  /**
   * Handle login
   */
  async handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const loginButton = this.loginForm.querySelector('button[type="submit"]');
    const errorDiv = document.getElementById('loginError');

    // Reset error
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';

    // Add loading state
    loginButton.classList.add('loading');
    loginButton.disabled = true;

    try {
      // Try Firebase first if available
      if (typeof firebase !== 'undefined' && firebase.auth && typeof auth !== 'undefined') {
        try {
          await auth.signInWithEmailAndPassword(email, password);
          console.log('✅ Firebase login successful');
        } catch (firebaseError) {
          // Firebase failed, try demo mode
          console.log('Firebase not configured, trying demo mode...');
          if (this.demoUsers[email] === password) {
            console.log('✅ Demo login successful');
            localStorage.setItem('admin_demo_session', email);
            this.currentUser = { email: email, isDemo: true };
            this.loginModal.classList.add('hidden');
            this.dashboard.style.display = 'grid';
            await this.loadDashboardData();
          } else {
            throw new Error('Invalid demo credentials');
          }
        }
      } else {
        // Demo mode only
        if (this.demoUsers[email] === password) {
          console.log('✅ Demo login successful (no Firebase)');
          localStorage.setItem('admin_demo_session', email);
          this.currentUser = { email: email, isDemo: true };
          this.loginModal.classList.add('hidden');
          this.dashboard.style.display = 'grid';
          await this.loadDashboardData();
        } else {
          errorDiv.style.display = 'block';
          errorDiv.textContent = '❌ Invalid demo credentials. Try: admin@demo.com / Demo@12345';
          throw new Error('Invalid credentials');
        }
      }

      // Save remember me preference
      if (rememberMe) {
        localStorage.setItem('adminRememberMe', 'true');
      } else {
        localStorage.removeItem('adminRememberMe');
      }

    } catch (error) {
      console.error('Login error:', error);
      errorDiv.style.display = 'block';

      if (!errorDiv.textContent) {
        // Default error message
        if (error.code === 'auth/user-not-found') {
          errorDiv.textContent = '❌ Admin account not found. Try: admin@demo.com';
        } else if (error.code === 'auth/wrong-password') {
          errorDiv.textContent = '❌ Incorrect password. Try: Demo@12345';
        } else {
          errorDiv.textContent = '❌ Login failed. Try demo: admin@demo.com / Demo@12345';
        }
      }
    } finally {
      loginButton.classList.remove('loading');
      loginButton.disabled = false;
    }
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility() {
    const passwordInput = document.getElementById('adminPassword');
    const toggle = document.getElementById('passwordToggle');

    if (passwordInput.type === 'password') {
      passwordInput.type = 'text';
      toggle.textContent = '👁️‍🗨️';
    } else {
      passwordInput.type = 'password';
      toggle.textContent = '👁️';
    }
  }

  /**
   * Show login modal
   */
  showLoginModal() {
    this.loginModal.classList.remove('hidden');
    this.dashboard.style.display = 'none';
  }

  /**
   * Logout
   */
  async logout() {
    try {
      if (this.currentUser?.isDemo) {
        // Demo logout
        localStorage.removeItem('admin_demo_session');
        console.log('✅ Demo session cleared');
      } else if (typeof firebase !== 'undefined' && firebase.auth && typeof auth !== 'undefined') {
        // Firebase logout
        await auth.signOut();
        console.log('✅ Firebase logged out');
      }
      
      this.currentUser = null;
      this.showLoginModal();
      this.loginForm.reset();
      this.showNotification('You have been logged out.', 'info');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  /**
   * Load admin panel
   */
  async loadAdminPanel() {
    this.dashboard.style.display = 'grid';
    this.loginModal.classList.add('hidden');
    await this.loadDashboardData();
  }

  /**
   * Load dashboard data
   */
  async loadDashboardData() {
    try {
      // Get analytics summary
      const analytics = await FirestoreManager.getAnalyticsSummary();
      const messages = await FirestoreManager.getContactMessages(10);

      // Update stats
      document.getElementById('totalMessages').textContent = analytics.totalMessages;
      document.getElementById('totalVisitors').textContent = analytics.totalVisitors;
      document.getElementById('totalPageViews').textContent = analytics.totalPageViews;
      document.getElementById('todayActivity').textContent = analytics.unreadMessages;

      // Update message badge
      if (analytics.unreadMessages > 0) {
        const badge = document.getElementById('messageCount');
        badge.textContent = analytics.unreadMessages;
        badge.style.display = 'inline-block';
      }

      // Update recent messages
      this.displayRecentMessages(messages);

      // Update notification badge
      if (analytics.unreadMessages > 0) {
        const notifBadge = document.getElementById('notificationBadge');
        notifBadge.textContent = analytics.unreadMessages;
        notifBadge.style.display = 'flex';
      }

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  }

  /**
   * Display recent messages
   */
  displayRecentMessages(messages) {
    const container = document.getElementById('recentMessages');

    if (messages.length === 0) {
      container.innerHTML = '<p class="empty-state">No messages yet</p>';
      return;
    }

    container.innerHTML = messages.map(msg => `
      <div class="message-item ${msg.read ? '' : 'unread'}">
        <div class="message-header">
          <span class="message-sender">${this.escapeHtml(msg.name)}</span>
          <span class="message-time">${this.formatTime(msg.timestamp)}</span>
        </div>
        <p class="message-preview">${this.escapeHtml(msg.subject)}</p>
      </div>
    `).join('');
  }

  /**
   * Switch dashboard section
   */
  switchSection(e) {
    const section = e.currentTarget.dataset.section;

    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    e.currentTarget.classList.add('active');

    // Update sections
    document.querySelectorAll('.admin-section').forEach(sec => {
      sec.classList.remove('active');
    });
    document.getElementById(section + 'Section').classList.add('active');

    // Update topbar title
    document.querySelector('.topbar-title').textContent = e.currentTarget.textContent.split('\n')[0];
  }

  /**
   * Toggle sidebar
   */
  toggleSidebar() {
    document.querySelector('.admin-sidebar').classList.toggle('active');
  }

  /**
   * Toggle theme
   */
  toggleTheme() {
    const isDark = document.body.classList.contains('dark-theme');

    if (isDark) {
      document.body.classList.remove('dark-theme');
      localStorage.setItem('adminTheme', 'light');
    } else {
      document.body.classList.add('dark-theme');
      localStorage.setItem('adminTheme', 'dark');
    }
  }

  /**
   * Toggle notifications
   */
  toggleNotifications() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.toggle('active');
  }

  /**
   * Close notifications
   */
  closeNotifications() {
    document.getElementById('notificationPanel').classList.remove('active');
  }

  /**
   * Toggle profile menu
   */
  toggleProfileMenu() {
    document.querySelector('.profile-menu').classList.toggle('active');
  }

  /**
   * Show notification
   */
  showNotification(message, type = 'info') {
    const panel = document.getElementById('notificationPanel');
    const list = document.getElementById('notificationsList');

    const notifEl = document.createElement('div');
    notifEl.className = `notification-item`;
    notifEl.textContent = message;

    list.insertBefore(notifEl, list.firstChild);

    // Remove after 5 seconds
    setTimeout(() => {
      notifEl.remove();
    }, 5000);
  }

  /**
   * Escape HTML
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Format timestamp
   */
  formatTime(timestamp) {
    if (!timestamp) return '';

    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  }
}

// ============================================================================
// INITIALIZE ADMIN PORTAL
// ============================================================================

// Wait for Firebase to initialize
let adminPortalInstance = null;

document.addEventListener('DOMContentLoaded', () => {
  // Check if we're on the admin page
  if (document.getElementById('adminDashboard')) {
    adminPortalInstance = new AdminPortal();
  }
});

// Also initialize the keyboard shortcut globally
if (typeof firebase !== 'undefined') {
  document.addEventListener('keydown', (e) => {
    if (e.metaKey && (e.key === 'k' || e.key === 'K')) {
      e.preventDefault();
      e.stopPropagation();

      // If admin portal exists, toggle it
      if (adminPortalInstance) {
        adminPortalInstance.toggleAdminPortal();
      } else {
        // Open admin page in new window or navigate
        window.location.href = '/admin.html';
      }
    }
  });
}
