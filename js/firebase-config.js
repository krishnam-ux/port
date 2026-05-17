// ============================================================================
// FIREBASE CONFIGURATION
// Initialize Firebase and set up Firestore database
// ============================================================================

// Firebase Configuration (Update with your Firebase credentials)
const firebaseConfig = {
  apiKey: "AIzaSyDkKhH_xZ6f3vE9pQ2w4rT5uI8oJ7kL9m0",
  authDomain: "portfolio-admin-system.firebaseapp.com",
  projectId: "portfolio-admin-system",
  storageBucket: "portfolio-admin-system.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789"
};

// Initialize Firebase (with fallback for demo mode)
let app, auth, db, storage;
let isFirebaseReady = false;

try {
  if (typeof firebase !== 'undefined') {
    app = firebase.initializeApp(firebaseConfig);
    auth = firebase.auth();
    db = firebase.firestore();
    storage = firebase.storage();
    isFirebaseReady = true;
    console.log('✅ Firebase initialized successfully');
  } else {
    console.warn('⚠️ Firebase SDK not available - using demo mode with localStorage');
  }
} catch (error) {
  console.warn('⚠️ Firebase initialization failed - using demo mode:', error.message);
}

// ============================================================================
// FIRESTORE DATABASE STRUCTURE
// ============================================================================

/*
Database Structure:

- admin/
  - {adminUID}/
    - email: string
    - role: "admin"
    - createdAt: timestamp
    - lastLogin: timestamp

- contacts/
  - {messageID}/
    - name: string
    - email: string
    - phone: string (optional)
    - subject: string
    - message: string
    - timestamp: timestamp
    - read: boolean
    - userIP: string
    - userAgent: string

- analytics/
  - visitors/
    - {visitorID}/
      - visitorId: string
      - firstVisit: timestamp
      - lastVisit: timestamp
      - pageViews: number
      - pages: array
      - userAgent: string
      - country: string (if available)
  
  - pageViews/
    - {pageID}/
      - page: string
      - views: number
      - timestamp: timestamp

- gallery/
  - {imageID}/
    - url: string
    - title: string
    - description: string
    - uploadedAt: timestamp
    - storageRef: string

- projects/
  - {projectID}/
    - title: string
    - description: string
    - image: string
    - github: string
    - technologies: array
    - createdAt: timestamp

- certifications/
  - {certID}/
    - title: string
    - issuer: string
    - verificationLink: string
    - logo: string
    - completedDate: timestamp
    - createdAt: timestamp

- resume/
  - {resumeID}/
    - fileName: string
    - url: string
    - uploadedAt: timestamp
    - storageRef: string

- content/
  - homepage/
    - heroTitle: string
    - heroSubtitle: string
    - aboutDescription: string
    - lastUpdated: timestamp

- settings/
  - admin/
    - theme: "light" | "dark"
    - notifications: boolean
    - lastUpdated: timestamp
*/

// ============================================================================
// FIRESTORE HELPER FUNCTIONS
// ============================================================================

class FirestoreManager {
  /**
   * Check if Firebase is ready
   */
  static isFirebaseReady() {
    return isFirebaseReady && typeof db !== 'undefined';
  }

  /**
   * Save contact message to Firestore or localStorage
   */
  static async saveContactMessage(messageData) {
    try {
      const timestamp = new Date();
      const data = {
        id: Date.now().toString(),
        name: messageData.name,
        email: messageData.email,
        phone: messageData.phone || '',
        subject: messageData.subject,
        message: messageData.message,
        timestamp: timestamp.toISOString(),
        read: false,
        userIP: await this.getUserIP(),
        userAgent: navigator.userAgent,
        metadata: {
          language: navigator.language,
          platform: navigator.platform,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        }
      };

      if (this.isFirebaseReady()) {
        // Save to Firebase
        const docRef = await db.collection('contacts').add(data);
        console.log('✅ Message saved to Firebase:', docRef.id);
        return docRef.id;
      } else {
        // Save to localStorage
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        messages.push(data);
        localStorage.setItem('portfolio_messages', JSON.stringify(messages));
        console.log('✅ Message saved to localStorage:', data.id);
        return data.id;
      }
    } catch (error) {
      console.error('Error saving message:', error);
      // Fallback to localStorage if Firebase fails
      try {
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const data = {
          id: Date.now().toString(),
          name: messageData.name,
          email: messageData.email,
          phone: messageData.phone || '',
          subject: messageData.subject,
          message: messageData.message,
          timestamp: new Date().toISOString(),
          read: false
        };
        messages.push(data);
        localStorage.setItem('portfolio_messages', JSON.stringify(messages));
        console.log('✅ Message saved to localStorage (Firebase failed)');
        return data.id;
      } catch (localError) {
        console.error('Error saving to localStorage:', localError);
        throw localError;
      }
    }
  }

  /**
   * Get user's IP address
   */
  static async getUserIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.log('Could not fetch IP:', error);
      return 'Unknown';
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(pageName) {
    try {
      const visitorId = this.getOrCreateVisitorId();
      const timestamp = new Date();

      if (this.isFirebaseReady()) {
        // Update visitor record in Firebase
        const visitorRef = db.collection('analytics').doc('visitors').collection('data').doc(visitorId);
        await visitorRef.set({
          visitorId: visitorId,
          lastVisit: timestamp,
          userAgent: navigator.userAgent,
          currentPage: pageName,
          pages: firebase.firestore.FieldValue.arrayUnion(pageName)
        }, { merge: true });

        // Increment page view count
        const pageRef = db.collection('analytics').doc('pageViews').collection('pages').doc(pageName);
        await pageRef.set({
          page: pageName,
          views: firebase.firestore.FieldValue.increment(1),
          lastViewed: timestamp
        }, { merge: true });
      } else {
        // Save to localStorage
        let analytics = JSON.parse(localStorage.getItem('portfolio_analytics') || '{"pageViews":0,"visitors":0}');
        analytics.pageViews = (analytics.pageViews || 0) + 1;
        localStorage.setItem('portfolio_analytics', JSON.stringify(analytics));
      }

      console.log('✅ Page view tracked:', pageName);
    } catch (error) {
      console.error('Error tracking page view:', error);
    }
  }

  /**
   * Get or create visitor ID
   */
  static getOrCreateVisitorId() {
    const STORAGE_KEY = 'portfolio_visitor_id';
    let visitorId = localStorage.getItem(STORAGE_KEY);

    if (!visitorId) {
      visitorId = 'visitor_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem(STORAGE_KEY, visitorId);
    }

    return visitorId;
  }

  /**
   * Get all contact messages
   */
  static async getContactMessages(limit = 50) {
    try {
      if (this.isFirebaseReady()) {
        const snapshot = await db.collection('contacts')
          .orderBy('timestamp', 'desc')
          .limit(limit)
          .get();

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        // Get from localStorage
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Try localStorage fallback
      try {
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Mark message as read
   */
  static async markMessageAsRead(messageId) {
    try {
      if (this.isFirebaseReady()) {
        await db.collection('contacts').doc(messageId).update({
          read: true,
          readAt: new Date()
        });
        return true;
      } else {
        // Update in localStorage
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.read = true;
          message.readAt = new Date().toISOString();
          localStorage.setItem('portfolio_messages', JSON.stringify(messages));
          return true;
        }
        return false;
      }
    } catch (error) {
      console.error('Error marking message as read:', error);
      return false;
    }
  }

  /**
   * Delete message
   */
  static async deleteMessage(messageId) {
    try {
      if (this.isFirebaseReady()) {
        await db.collection('contacts').doc(messageId).delete();
        return true;
      } else {
        // Delete from localStorage
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const filtered = messages.filter(m => m.id !== messageId);
        localStorage.setItem('portfolio_messages', JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  /**
   * Search messages
   */
  static async searchMessages(query) {
    try {
      const snapshot = await db.collection('contacts')
        .where('name', '>=', query)
        .where('name', '<=', query + '\uf8ff')
        .orderBy('name')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error searching messages:', error);
      return [];
    }
  }

  /**
   * Get analytics summary
   */
  static async getAnalyticsSummary() {
    try {
      if (this.isFirebaseReady()) {
        const contactsSnapshot = await db.collection('contacts').get();
        const visitorsSnapshot = await db.collection('analytics')
          .doc('visitors')
          .collection('data')
          .get();
        const pageViewsSnapshot = await db.collection('analytics')
          .doc('pageViews')
          .collection('pages')
          .get();

        let totalPageViews = 0;
        pageViewsSnapshot.forEach(doc => {
          totalPageViews += doc.data().views || 0;
        });

        return {
          totalMessages: contactsSnapshot.size,
          totalVisitors: visitorsSnapshot.size,
          totalPageViews: totalPageViews,
          unreadMessages: contactsSnapshot.docs.filter(doc => !doc.data().read).length
        };
      } else {
        // Get from localStorage
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        const analytics = JSON.parse(localStorage.getItem('portfolio_analytics') || '{"pageViews":0,"visitors":0}');
        
        return {
          totalMessages: messages.length,
          totalVisitors: analytics.visitors || 1,
          totalPageViews: analytics.pageViews || 0,
          unreadMessages: messages.filter(m => !m.read).length
        };
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
      // Try localStorage fallback
      try {
        const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
        return {
          totalMessages: messages.length,
          totalVisitors: 1,
          totalPageViews: 0,
          unreadMessages: messages.filter(m => !m.read).length
        };
      } catch (e) {
        return {
          totalMessages: 0,
          totalVisitors: 0,
          totalPageViews: 0,
          unreadMessages: 0
        };
      }
    }
  }

  /**
   * Save project
   */
  static async saveProject(projectData) {
    try {
      const data = {
        id: Date.now().toString(),
        ...projectData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      if (this.isFirebaseReady()) {
        const docRef = await db.collection('projects').add(data);
        return docRef.id;
      } else {
        // Save to localStorage
        const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        projects.push(data);
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        return data.id;
      }
    } catch (error) {
      console.error('Error saving project:', error);
      // Try localStorage fallback
      try {
        const data = {
          id: Date.now().toString(),
          ...projectData,
          createdAt: new Date().toISOString()
        };
        const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        projects.push(data);
        localStorage.setItem('portfolio_projects', JSON.stringify(projects));
        return data.id;
      } catch (e) {
        throw error;
      }
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId) {
    try {
      if (this.isFirebaseReady()) {
        await db.collection('projects').doc(projectId).delete();
        return true;
      } else {
        // Delete from localStorage
        const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        const filtered = projects.filter(p => p.id !== projectId);
        localStorage.setItem('portfolio_projects', JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      return false;
    }
  }

  /**
   * Get all projects
   */
  static async getProjects() {
    try {
      if (this.isFirebaseReady()) {
        const snapshot = await db.collection('projects')
          .orderBy('createdAt', 'desc')
          .get();

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        // Get from localStorage
        const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      // Try localStorage fallback
      try {
        const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
        return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Upload resume
   */
  static async uploadResume(file) {
    try {
      const fileName = `resumes/${Date.now()}_${file.name}`;
      const storageRef = storage.ref(fileName);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();

      // Save metadata to Firestore
      await db.collection('resume').add({
        fileName: file.name,
        url: url,
        uploadedAt: new Date(),
        storageRef: fileName,
        fileSize: file.size
      });

      return { url, fileName };
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  /**
   * Get resume
   */
  static async getResume() {
    try {
      const snapshot = await db.collection('resume')
        .orderBy('uploadedAt', 'desc')
        .limit(1)
        .get();

      if (snapshot.empty) return null;
      return snapshot.docs[0].data();
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  }

  /**
   * Upload gallery image
   */
  static async uploadGalleryImage(file) {
    try {
      const fileName = `gallery/${Date.now()}_${file.name}`;
      const storageRef = storage.ref(fileName);
      await storageRef.put(file);
      const url = await storageRef.getDownloadURL();

      const docRef = await db.collection('gallery').add({
        url: url,
        title: file.name,
        description: '',
        uploadedAt: new Date(),
        storageRef: fileName
      });

      return { id: docRef.id, url };
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      throw error;
    }
  }

  /**
   * Get gallery images
   */
  static async getGalleryImages() {
    try {
      const snapshot = await db.collection('gallery')
        .orderBy('uploadedAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
  }

  /**
   * Delete gallery image
   */
  static async deleteGalleryImage(imageId, storageRef) {
    try {
      // Delete from storage
      await storage.ref(storageRef).delete();
      // Delete from Firestore
      await db.collection('gallery').doc(imageId).delete();
      return true;
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      return false;
    }
  }

  /**
   * Save certification
   */
  static async saveCertification(certData) {
    try {
      const data = {
        id: Date.now().toString(),
        ...certData,
        createdAt: new Date().toISOString()
      };

      if (this.isFirebaseReady()) {
        const docRef = await db.collection('certifications').add(data);
        return docRef.id;
      } else {
        // Save to localStorage
        const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
        certs.push(data);
        localStorage.setItem('portfolio_certifications', JSON.stringify(certs));
        return data.id;
      }
    } catch (error) {
      console.error('Error saving certification:', error);
      // Try localStorage fallback
      try {
        const data = {
          id: Date.now().toString(),
          ...certData,
          createdAt: new Date().toISOString()
        };
        const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
        certs.push(data);
        localStorage.setItem('portfolio_certifications', JSON.stringify(certs));
        return data.id;
      } catch (e) {
        throw error;
      }
    }
  }

  /**
   * Get certifications
   */
  static async getCertifications() {
    try {
      if (this.isFirebaseReady()) {
        const snapshot = await db.collection('certifications')
          .orderBy('createdAt', 'desc')
          .get();

        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      } else {
        // Get from localStorage
        const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
        return certs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
      // Try localStorage fallback
      try {
        const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
        return certs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } catch (e) {
        return [];
      }
    }
  }

  /**
   * Delete certification
   */
  static async deleteCertification(certId) {
    try {
      if (this.isFirebaseReady()) {
        await db.collection('certifications').doc(certId).delete();
        return true;
      } else {
        // Delete from localStorage
        const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
        const filtered = certs.filter(c => c.id !== certId);
        localStorage.setItem('portfolio_certifications', JSON.stringify(filtered));
        return true;
      }
    } catch (error) {
      console.error('Error deleting certification:', error);
      return false;
    }
  }

  /**
   * Save content
   */
  static async saveContent(contentData) {
    try {
      const data = {
        ...contentData,
        lastUpdated: new Date().toISOString()
      };

      if (this.isFirebaseReady()) {
        await db.collection('content').doc('homepage').set(data, { merge: true });
        return true;
      } else {
        // Save to localStorage
        localStorage.setItem('portfolio_content', JSON.stringify(data));
        return true;
      }
    } catch (error) {
      console.error('Error saving content:', error);
      // Try localStorage fallback
      try {
        const data = {
          ...contentData,
          lastUpdated: new Date().toISOString()
        };
        localStorage.setItem('portfolio_content', JSON.stringify(data));
        return true;
      } catch (e) {
        throw error;
      }
    }
  }

  /**
   * Get content
   */
  static async getContent() {
    try {
      if (this.isFirebaseReady()) {
        const doc = await db.collection('content').doc('homepage').get();
        return doc.data() || {};
      } else {
        // Get from localStorage
        return JSON.parse(localStorage.getItem('portfolio_content') || '{}');
      }
    } catch (error) {
      console.error('Error fetching content:', error);
      // Try localStorage fallback
      try {
        return JSON.parse(localStorage.getItem('portfolio_content') || '{}');
      } catch (e) {
        return {};
      }
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FirestoreManager;
}
