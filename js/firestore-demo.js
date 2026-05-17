// ============================================================================
// FIRESTORE MANAGER - Demo Mode + Firebase Fallback
// Guaranteed to work with or without Firebase
// ============================================================================

class FirestoreManager {
  /**
   * Check if Firebase is ready
   */
  static isFirebaseReady() {
    try {
      return typeof db !== 'undefined' && db !== null;
    } catch (e) {
      return false;
    }
  }

  /**
   * Save contact message
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

      // Try Firebase first
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const docRef = await db.collection('contacts').add(data);
          console.log('✅ Message saved to Firebase:', docRef.id);
          return docRef.id;
        } catch (fError) {
          console.warn('Firebase save failed, using localStorage');
        }
      }

      // Fallback to localStorage
      const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      messages.push(data);
      localStorage.setItem('portfolio_messages', JSON.stringify(messages));
      console.log('✅ Message saved to localStorage:', data.id);
      return data.id;

    } catch (error) {
      console.error('Error saving message:', error);
      throw error;
    }
  }

  /**
   * Get all contact messages
   */
  static async getContactMessages(limit = 50) {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const snapshot = await db.collection('contacts')
            .orderBy('timestamp', 'desc')
            .limit(limit)
            .get();
          return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      // Get from localStorage
      const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      return messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, limit);
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  /**
   * Mark message as read
   */
  static async markMessageAsRead(messageId) {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('contacts').doc(messageId).update({
            read: true,
            readAt: new Date()
          });
          return true;
        } catch (fError) {
          console.warn('Firebase update failed, using localStorage');
        }
      }

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
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('contacts').doc(messageId).delete();
          return true;
        } catch (fError) {
          console.warn('Firebase delete failed, using localStorage');
        }
      }

      // Delete from localStorage
      const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      const filtered = messages.filter(m => m.id !== messageId);
      localStorage.setItem('portfolio_messages', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
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
      console.log('Could not fetch IP');
      return 'Unknown';
    }
  }

  /**
   * Track page view
   */
  static async trackPageView(pageName) {
    try {
      const visitorId = this.getOrCreateVisitorId();
      
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const timestamp = new Date();
          const visitorRef = db.collection('analytics').doc('visitors').collection('data').doc(visitorId);
          await visitorRef.set({
            visitorId: visitorId,
            lastVisit: timestamp,
            userAgent: navigator.userAgent,
            currentPage: pageName
          }, { merge: true });
          console.log('✅ Page view tracked (Firebase):', pageName);
          return;
        } catch (fError) {
          console.warn('Firebase tracking failed, using localStorage');
        }
      }

      // Save to localStorage
      let analytics = JSON.parse(localStorage.getItem('portfolio_analytics') || '{"pageViews":0,"visitors":0}');
      analytics.pageViews = (analytics.pageViews || 0) + 1;
      localStorage.setItem('portfolio_analytics', JSON.stringify(analytics));
      console.log('✅ Page view tracked (localStorage):', pageName);
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
   * Get analytics summary
   */
  static async getAnalyticsSummary() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const contactsSnapshot = await db.collection('contacts').get();
          const visitorsSnapshot = await db.collection('analytics').doc('visitors').collection('data').get();
          
          return {
            totalMessages: contactsSnapshot.size,
            totalVisitors: visitorsSnapshot.size,
            totalPageViews: 0,
            unreadMessages: contactsSnapshot.docs.filter(doc => !doc.data().read).length
          };
        } catch (fError) {
          console.warn('Firebase analytics failed, using localStorage');
        }
      }

      // Get from localStorage
      const messages = JSON.parse(localStorage.getItem('portfolio_messages') || '[]');
      const analytics = JSON.parse(localStorage.getItem('portfolio_analytics') || '{"pageViews":0,"visitors":0}');
      
      return {
        totalMessages: messages.length,
        totalVisitors: analytics.visitors || 1,
        totalPageViews: analytics.pageViews || 0,
        unreadMessages: messages.filter(m => !m.read).length
      };
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return { totalMessages: 0, totalVisitors: 0, totalPageViews: 0, unreadMessages: 0 };
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
        createdAt: new Date().toISOString()
      };

      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const docRef = await db.collection('projects').add(data);
          return docRef.id;
        } catch (fError) {
          console.warn('Firebase save failed, using localStorage');
        }
      }

      const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
      projects.push(data);
      localStorage.setItem('portfolio_projects', JSON.stringify(projects));
      return data.id;
    } catch (error) {
      console.error('Error saving project:', error);
      throw error;
    }
  }

  /**
   * Get all projects
   */
  static async getProjects() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const snapshot = await db.collection('projects').orderBy('createdAt', 'desc').get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
      return projects.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  /**
   * Delete project
   */
  static async deleteProject(projectId) {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('projects').doc(projectId).delete();
          return true;
        } catch (fError) {
          console.warn('Firebase delete failed, using localStorage');
        }
      }

      const projects = JSON.parse(localStorage.getItem('portfolio_projects') || '[]');
      const filtered = projects.filter(p => p.id !== projectId);
      localStorage.setItem('portfolio_projects', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting project:', error);
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

      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const docRef = await db.collection('certifications').add(data);
          return docRef.id;
        } catch (fError) {
          console.warn('Firebase save failed, using localStorage');
        }
      }

      const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
      certs.push(data);
      localStorage.setItem('portfolio_certifications', JSON.stringify(certs));
      return data.id;
    } catch (error) {
      console.error('Error saving certification:', error);
      throw error;
    }
  }

  /**
   * Get certifications
   */
  static async getCertifications() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const snapshot = await db.collection('certifications').orderBy('createdAt', 'desc').get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
      return certs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching certifications:', error);
      return [];
    }
  }

  /**
   * Delete certification
   */
  static async deleteCertification(certId) {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('certifications').doc(certId).delete();
          return true;
        } catch (fError) {
          console.warn('Firebase delete failed, using localStorage');
        }
      }

      const certs = JSON.parse(localStorage.getItem('portfolio_certifications') || '[]');
      const filtered = certs.filter(c => c.id !== certId);
      localStorage.setItem('portfolio_certifications', JSON.stringify(filtered));
      return true;
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

      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('content').doc('homepage').set(data, { merge: true });
          return true;
        } catch (fError) {
          console.warn('Firebase save failed, using localStorage');
        }
      }

      localStorage.setItem('portfolio_content', JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Error saving content:', error);
      throw error;
    }
  }

  /**
   * Get content
   */
  static async getContent() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const doc = await db.collection('content').doc('homepage').get();
          return doc.data() || {};
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      return JSON.parse(localStorage.getItem('portfolio_content') || '{}');
    } catch (error) {
      console.error('Error fetching content:', error);
      return {};
    }
  }

  /**
   * Get resume
   */
  static async getResume() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const snapshot = await db.collection('resume').orderBy('uploadedAt', 'desc').limit(1).get();
          if (!snapshot.empty) return snapshot.docs[0].data();
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      const resume = JSON.parse(localStorage.getItem('portfolio_resume') || 'null');
      return resume;
    } catch (error) {
      console.error('Error fetching resume:', error);
      return null;
    }
  }

  /**
   * Upload resume (Base64)
   */
  static async uploadResume(file) {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const data = {
              fileName: file.name,
              url: reader.result,
              uploadedAt: new Date().toISOString(),
              fileSize: file.size
            };

            if (this.isFirebaseReady() && typeof db !== 'undefined') {
              try {
                await db.collection('resume').add(data);
              } catch (fError) {
                console.warn('Firebase save failed, using localStorage');
              }
            }

            localStorage.setItem('portfolio_resume', JSON.stringify(data));
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading resume:', error);
      throw error;
    }
  }

  /**
   * Get gallery images
   */
  static async getGalleryImages() {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          const snapshot = await db.collection('gallery').orderBy('uploadedAt', 'desc').get();
          return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (fError) {
          console.warn('Firebase fetch failed, using localStorage');
        }
      }

      const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
      return gallery.sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));
    } catch (error) {
      console.error('Error fetching gallery:', error);
      return [];
    }
  }

  /**
   * Upload gallery image (Base64)
   */
  static async uploadGalleryImage(file) {
    try {
      const reader = new FileReader();
      return new Promise((resolve, reject) => {
        reader.onload = async () => {
          try {
            const imageData = {
              id: Date.now().toString(),
              url: reader.result,
              title: file.name,
              description: '',
              uploadedAt: new Date().toISOString()
            };

            if (this.isFirebaseReady() && typeof db !== 'undefined') {
              try {
                const docRef = await db.collection('gallery').add(imageData);
                imageData.id = docRef.id;
              } catch (fError) {
                console.warn('Firebase save failed, using localStorage');
              }
            }

            const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
            gallery.push(imageData);
            localStorage.setItem('portfolio_gallery', JSON.stringify(gallery));
            resolve(imageData);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('File read failed'));
        reader.readAsDataURL(file);
      });
    } catch (error) {
      console.error('Error uploading gallery image:', error);
      throw error;
    }
  }

  /**
   * Delete gallery image
   */
  static async deleteGalleryImage(imageId) {
    try {
      if (this.isFirebaseReady() && typeof db !== 'undefined') {
        try {
          await db.collection('gallery').doc(imageId).delete();
          return true;
        } catch (fError) {
          console.warn('Firebase delete failed, using localStorage');
        }
      }

      const gallery = JSON.parse(localStorage.getItem('portfolio_gallery') || '[]');
      const filtered = gallery.filter(img => img.id !== imageId);
      localStorage.setItem('portfolio_gallery', JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting gallery image:', error);
      return false;
    }
  }
}

console.log('✅ FirestoreManager loaded and ready for demo mode');
