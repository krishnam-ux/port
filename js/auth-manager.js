// ============================================================================
// AUTH MANAGER - Firebase Authentication with Demo Mode Fallback
// Handles login, logout, and session persistence
// ============================================================================

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isInitialized = false;
    this.demoMode = false;
    this.init();
  }

  async init() {
    console.log('⏳ Initializing Auth Manager...');
    
    try {
      // Wait for Firebase to be ready
      await this.waitForFirebase();
      
      // Set up auth state listener
      this.setupAuthListener();
      
      // Check if already logged in
      this.checkAuthState();
      
      this.isInitialized = true;
      console.log('✅ Auth Manager initialized', this.demoMode ? '(Demo Mode)' : '(Firebase Mode)');
    } catch (error) {
      console.error('❌ Auth initialization error:', error);
      this.demoMode = true;
      this.isInitialized = true;
    }
  }

  waitForFirebase() {
    return new Promise((resolve) => {
      const checkFirebase = setInterval(() => {
        if (typeof firebase !== 'undefined' && firebase.auth) {
          clearInterval(checkFirebase);
          resolve();
        }
      }, 100);
      
      // Timeout after 3 seconds - use demo mode if Firebase not available
      setTimeout(() => {
        clearInterval(checkFirebase);
        console.log('⚠️ Firebase not available, switching to demo mode');
        this.demoMode = true;
        resolve();
      }, 3000);
    });
  }

  setupAuthListener() {
    if (!this.demoMode && firebase.auth) {
      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          this.currentUser = {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || 'Admin User'
          };
          console.log('✅ User logged in:', this.currentUser.email);
          this.onAuthSuccess();
        } else {
          this.currentUser = null;
          console.log('🔓 User logged out');
          this.onAuthLogout();
        }
      });
    } else {
      // Demo mode: check localStorage
      const savedUser = localStorage.getItem('demoAdminUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        console.log('✅ Demo mode: User from localStorage');
        this.onAuthSuccess();
      }
    }
  }

  checkAuthState() {
    if (this.demoMode) {
      // Demo mode: check localStorage
      const savedUser = localStorage.getItem('demoAdminUser');
      if (savedUser) {
        this.currentUser = JSON.parse(savedUser);
        return true;
      }
      return false;
    }

    if (!firebase.auth) {
      console.warn('⚠️ Firebase Auth not available');
      return false;
    }

    const user = firebase.auth().currentUser;
    if (user) {
      this.currentUser = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || 'Admin User'
      };
      return true;
    }
    return false;
  }

  async login(email, password) {
    if (this.demoMode) {
      return this.demoLogin(email, password);
    }

    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.log('⚠️ Firebase not available, switching to demo mode');
      this.demoMode = true;
      return this.demoLogin(email, password);
    }

    try {
      console.log('🔐 Attempting login...');
      const result = await firebase.auth().signInWithEmailAndPassword(email, password);
      
      this.currentUser = {
        uid: result.user.uid,
        email: result.user.email,
        displayName: result.user.displayName || 'Admin User'
      };

      // Store auth session
      localStorage.setItem('adminAuthUser', JSON.stringify(this.currentUser));
      localStorage.setItem('adminAuthTime', new Date().getTime().toString());
      
      console.log('✅ Login successful:', this.currentUser.email);
      return { success: true, user: this.currentUser };
    } catch (error) {
      console.error('❌ Login error:', error.message);
      
      // Parse Firebase error messages
      let errorMessage = 'Login failed';
      
      if (error.code === 'auth/user-not-found') {
        errorMessage = 'Email not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address';
      } else if (error.code === 'auth/user-disabled') {
        errorMessage = 'Account disabled';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts, try again later';
      }
      
      return { success: false, error: errorMessage };
    }
  }

  demoLogin(email, password) {
    console.log('🔐 Demo Mode Login:', email);
    
    // Demo credentials
    const demoEmail = 'admin@krishnam.com';
    const demoPassword = 'ccfcma074r@';
    
    if (email !== demoEmail || password !== demoPassword) {
      return { 
        success: false, 
        error: 'Invalid credentials. Use: admin@krishnam.com / ccfcma074r@' 
      };
    }
    
    // Simulate successful login
    this.currentUser = {
      uid: 'demo-user-' + Date.now(),
      email: email,
      displayName: 'Krishnam Dwivedi'
    };
    
    // Store in localStorage
    localStorage.setItem('demoAdminUser', JSON.stringify(this.currentUser));
    localStorage.setItem('adminAuthTime', new Date().getTime().toString());
    
    console.log('✅ Demo login successful:', email);
    return { success: true, user: this.currentUser };
  }

  async logout() {
    if (this.demoMode) {
      return this.demoLogout();
    }

    if (typeof firebase === 'undefined' || !firebase.auth) {
      console.log('⚠️ Firebase not available, using demo logout');
      return this.demoLogout();
    }

    try {
      console.log('🔐 Logging out...');
      await firebase.auth().signOut();
      
      // Clear session
      this.currentUser = null;
      localStorage.removeItem('adminAuthUser');
      localStorage.removeItem('adminAuthTime');
      
      console.log('✅ Logout successful');
      return { success: true };
    } catch (error) {
      console.error('❌ Logout error:', error);
      return { success: false, error: error.message };
    }
  }

  demoLogout() {
    console.log('🔐 Demo Mode Logout');
    
    // Clear session
    this.currentUser = null;
    localStorage.removeItem('demoAdminUser');
    localStorage.removeItem('adminAuthTime');
    
    console.log('✅ Demo logout successful');
    return { success: true };
  }

  isAuthenticated() {
    return this.currentUser !== null;
  }

  getUser() {
    return this.currentUser;
  }

  getEmail() {
    return this.currentUser?.email || null;
  }

  // Redirect handlers
  onAuthSuccess() {
    // Override in specific pages if needed
    window.dispatchEvent(new CustomEvent('authSuccess', { detail: this.currentUser }));
  }

  onAuthLogout() {
    // Override in specific pages if needed
    window.dispatchEvent(new CustomEvent('authLogout'));
  }

  protectRoute() {
    if (!this.isAuthenticated()) {
      console.log('🔐 Access denied, redirecting to login...');
      window.location.href = 'admin-login.html';
      return false;
    }
    return true;
  }
}

// Initialize globally
window.authManager = null;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.authManager = new AuthManager();
  });
} else {
  window.authManager = new AuthManager();
}
