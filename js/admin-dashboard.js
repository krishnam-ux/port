// ============================================================================
// ADMIN DASHBOARD - FUNCTIONALITY
// Manage Messages, Gallery, Projects, Certifications, Resume
// ============================================================================

class AdminDashboard {
  constructor() {
    this.init();
  }

  init() {
    this.setupMessageManagement();
    this.setupGalleryManagement();
    this.setupProjectManagement();
    this.setupCertificationManagement();
    this.setupResumeManagement();
    this.setupContentEditor();
    this.setupAnalytics();
  }

  /**
   * MESSAGE MANAGEMENT
   */
  setupMessageManagement() {
    const messagesContainer = document.getElementById('messagesContainer');
    const messageSearch = document.getElementById('messageSearch');
    const messageFilter = document.getElementById('messageFilter');

    // Load messages on section switch
    document.querySelector('[data-section="messages"]')?.addEventListener('click', async () => {
      await this.loadMessages();
    });

    // Search functionality
    messageSearch?.addEventListener('input', (e) => this.filterMessages(e.target.value));

    // Filter functionality
    messageFilter?.addEventListener('change', (e) => this.filterMessagesByStatus(e.target.value));
  }

  async loadMessages() {
    try {
      const messages = await FirestoreManager.getContactMessages(100);
      const container = document.getElementById('messagesContainer');

      if (messages.length === 0) {
        container.innerHTML = '<p class="empty-state">No messages to display</p>';
        return;
      }

      container.innerHTML = messages.map(msg => `
        <div class="message-card ${msg.read ? '' : 'unread'}">
          <div class="message-header">
            <div>
              <h4>${this.escapeHtml(msg.name)}</h4>
              <p style="font-size: 12px; color: #a8a8b8; margin-top: 4px;">${this.escapeHtml(msg.email)}</p>
              ${msg.phone ? `<p style="font-size: 12px; color: #a8a8b8;">${this.escapeHtml(msg.phone)}</p>` : ''}
            </div>
            <span class="message-time">${this.formatFullDate(msg.timestamp)}</span>
          </div>

          <div style="margin: 12px 0; padding: 12px; background: rgba(255,255,255,0.03); border-radius: 8px;">
            <p style="font-size: 13px; font-weight: 600; margin-bottom: 8px; color: #a855f7;">📋 ${this.escapeHtml(msg.subject)}</p>
            <p style="font-size: 13px; color: #b0b0b8; line-height: 1.5;">${this.escapeHtml(msg.message)}</p>
          </div>

          <div class="message-meta">
            <span style="font-size: 11px; color: #717180;">
              ${msg.userIP ? '🌐 IP: ' + msg.userIP : ''}
            </span>
            <div class="message-status">
              <button class="message-action-btn" title="Mark as ${msg.read ? 'unread' : 'read'}" onclick="adminDashboard.toggleMessageRead('${msg.id}', ${msg.read})">
                ${msg.read ? '✓' : '○'}
              </button>
              <button class="message-action-btn" title="Delete" onclick="adminDashboard.deleteMessage('${msg.id}')">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading messages:', error);
      document.getElementById('messagesContainer').innerHTML = '<p class="empty-state">Error loading messages</p>';
    }
  }

  async toggleMessageRead(messageId, currentlyRead) {
    try {
      await FirestoreManager.markMessageAsRead(messageId);
      await this.loadMessages();
      console.log('Message read status updated');
    } catch (error) {
      console.error('Error updating message:', error);
    }
  }

  async deleteMessage(messageId) {
    if (confirm('Are you sure you want to delete this message?')) {
      try {
        await FirestoreManager.deleteMessage(messageId);
        await this.loadMessages();
        this.showNotification('Message deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting message:', error);
        this.showNotification('Error deleting message', 'error');
      }
    }
  }

  filterMessages(searchTerm) {
    const cards = document.querySelectorAll('.message-card');
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      card.style.display = text.includes(searchTerm.toLowerCase()) ? 'block' : 'none';
    });
  }

  filterMessagesByStatus(status) {
    const cards = document.querySelectorAll('.message-card');
    cards.forEach(card => {
      if (status === 'all') {
        card.style.display = 'block';
      } else if (status === 'unread' && card.classList.contains('unread')) {
        card.style.display = 'block';
      } else if (status === 'read' && !card.classList.contains('unread')) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  }

  /**
   * GALLERY MANAGEMENT
   */
  setupGalleryManagement() {
    const uploadBtn = document.getElementById('uploadGalleryBtn');

    uploadBtn?.addEventListener('click', () => this.showGalleryUploadDialog());

    // Load gallery on section switch
    document.querySelector('[data-section="gallery"]')?.addEventListener('click', async () => {
      await this.loadGallery();
    });
  }

  showGalleryUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;

    input.addEventListener('change', async (e) => {
      const files = e.target.files;
      for (let file of files) {
        await this.uploadGalleryImage(file);
      }
    });

    input.click();
  }

  async uploadGalleryImage(file) {
    try {
      this.showNotification('Uploading image...', 'info');
      const result = await FirestoreManager.uploadGalleryImage(file);
      this.showNotification('Image uploaded successfully', 'success');
      await this.loadGallery();
    } catch (error) {
      console.error('Error uploading image:', error);
      this.showNotification('Error uploading image', 'error');
    }
  }

  async loadGallery() {
    try {
      const images = await FirestoreManager.getGalleryImages();
      const grid = document.getElementById('galleryGrid');

      if (images.length === 0) {
        grid.innerHTML = '<p class="empty-state">No gallery items yet. Click "Upload Image" to add some.</p>';
        return;
      }

      grid.innerHTML = images.map(img => `
        <div class="gallery-item">
          <img src="${img.url}" alt="${this.escapeHtml(img.title)}" style="width: 100%; height: 150px; object-fit: cover;">
          <div class="gallery-info">
            <p>${this.escapeHtml(img.title)}</p>
            <button class="btn btn-danger" onclick="adminDashboard.deleteGalleryImage('${img.id}', '${img.storageRef}')">
              Delete
            </button>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading gallery:', error);
    }
  }

  async deleteGalleryImage(imageId, storageRef) {
    if (confirm('Delete this image?')) {
      try {
        await FirestoreManager.deleteGalleryImage(imageId, storageRef);
        await this.loadGallery();
        this.showNotification('Image deleted', 'success');
      } catch (error) {
        console.error('Error deleting image:', error);
      }
    }
  }

  /**
   * PROJECT MANAGEMENT
   */
  setupProjectManagement() {
    const addBtn = document.getElementById('addProjectBtn');

    addBtn?.addEventListener('click', () => this.showProjectDialog());

    document.querySelector('[data-section="projects"]')?.addEventListener('click', async () => {
      await this.loadProjects();
    });
  }

  showProjectDialog() {
    const title = prompt('Project Title:');
    if (!title) return;

    const description = prompt('Project Description:');
    if (!description) return;

    const github = prompt('GitHub URL (optional):');

    this.saveProject({
      title,
      description,
      github: github || '',
      technologies: [],
      image: '',
      featured: false
    });
  }

  async saveProject(projectData) {
    try {
      await FirestoreManager.saveProject(projectData);
      this.showNotification('Project added successfully', 'success');
      await this.loadProjects();
    } catch (error) {
      console.error('Error saving project:', error);
      this.showNotification('Error adding project', 'error');
    }
  }

  async loadProjects() {
    try {
      const projects = await FirestoreManager.getProjects();
      const list = document.getElementById('projectsList');

      if (projects.length === 0) {
        list.innerHTML = '<p class="empty-state">No projects yet. Click "Add Project" to create one.</p>';
        return;
      }

      list.innerHTML = projects.map(project => `
        <div class="dashboard-card">
          <div class="card-header">
            <h3>${this.escapeHtml(project.title)}</h3>
          </div>
          <p style="color: #b0b0b8; margin-bottom: 12px;">${this.escapeHtml(project.description)}</p>
          ${project.github ? `<p style="font-size: 12px; color: #a855f7; margin-bottom: 12px;">🔗 <a href="${project.github}" target="_blank">View on GitHub</a></p>` : ''}
          <button class="btn btn-danger" onclick="adminDashboard.deleteProject('${project.id}')">
            Delete Project
          </button>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading projects:', error);
    }
  }

  async deleteProject(projectId) {
    if (confirm('Delete this project?')) {
      try {
        await FirestoreManager.deleteProject(projectId);
        await this.loadProjects();
        this.showNotification('Project deleted', 'success');
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  }

  /**
   * CERTIFICATION MANAGEMENT
   */
  setupCertificationManagement() {
    const addBtn = document.getElementById('addCertBtn');

    addBtn?.addEventListener('click', () => this.showCertificationDialog());

    document.querySelector('[data-section="certifications"]')?.addEventListener('click', async () => {
      await this.loadCertifications();
    });
  }

  showCertificationDialog() {
    const title = prompt('Certification Title:');
    if (!title) return;

    const issuer = prompt('Issuer:');
    if (!issuer) return;

    const verificationLink = prompt('Verification Link (optional):');

    this.saveCertification({
      title,
      issuer,
      verificationLink: verificationLink || '',
      logo: '',
      completedDate: new Date()
    });
  }

  async saveCertification(certData) {
    try {
      await FirestoreManager.saveCertification(certData);
      this.showNotification('Certification added successfully', 'success');
      await this.loadCertifications();
    } catch (error) {
      console.error('Error saving certification:', error);
    }
  }

  async loadCertifications() {
    try {
      const certs = await FirestoreManager.getCertifications();
      const list = document.getElementById('certificationsList');

      if (certs.length === 0) {
        list.innerHTML = '<p class="empty-state">No certifications yet. Click "Add Certification" to add one.</p>';
        return;
      }

      list.innerHTML = certs.map(cert => `
        <div class="dashboard-card">
          <div class="card-header">
            <h3>${this.escapeHtml(cert.title)}</h3>
          </div>
          <p style="color: #a8a8b8; margin-bottom: 8px;">🏢 ${this.escapeHtml(cert.issuer)}</p>
          ${cert.verificationLink ? `<p style="font-size: 12px; margin-bottom: 12px;"><a href="${cert.verificationLink}" target="_blank" style="color: #a855f7;">Verify →</a></p>` : ''}
          <button class="btn btn-danger" onclick="adminDashboard.deleteCertification('${cert.id}')">
            Delete
          </button>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading certifications:', error);
    }
  }

  async deleteCertification(certId) {
    if (confirm('Delete this certification?')) {
      try {
        await FirestoreManager.deleteCertification(certId);
        await this.loadCertifications();
        this.showNotification('Certification deleted', 'success');
      } catch (error) {
        console.error('Error deleting certification:', error);
      }
    }
  }

  /**
   * RESUME MANAGEMENT
   */
  setupResumeManagement() {
    const uploadBtn = document.getElementById('uploadResumeBtn');

    uploadBtn?.addEventListener('click', () => this.showResumeUploadDialog());

    document.querySelector('[data-section="resume"]')?.addEventListener('click', async () => {
      await this.loadResume();
    });
  }

  showResumeUploadDialog() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx';

    input.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this.uploadResume(file);
      }
    });

    input.click();
  }

  async uploadResume(file) {
    try {
      this.showNotification('Uploading resume...', 'info');
      await FirestoreManager.uploadResume(file);
      this.showNotification('Resume uploaded successfully', 'success');
      await this.loadResume();
    } catch (error) {
      console.error('Error uploading resume:', error);
      this.showNotification('Error uploading resume', 'error');
    }
  }

  async loadResume() {
    try {
      const resume = await FirestoreManager.getResume();
      const container = document.getElementById('resumeContainer');

      if (!resume) {
        container.innerHTML = '<p class="empty-state">No resume uploaded yet. Click "Upload Resume" to add one.</p>';
        return;
      }

      container.innerHTML = `
        <div class="dashboard-card">
          <div class="card-header">
            <h3>📄 ${this.escapeHtml(resume.fileName)}</h3>
          </div>
          <p style="color: #a8a8b8; margin-bottom: 12px;">Uploaded: ${this.formatFullDate(resume.uploadedAt)}</p>
          <div style="display: flex; gap: 12px;">
            <a href="${resume.url}" target="_blank" class="btn btn-primary">Download Resume</a>
            <button class="btn btn-secondary" onclick="alert('Delete functionality for resume requires admin implementation')">
              Replace Resume
            </button>
          </div>
        </div>
      `;

    } catch (error) {
      console.error('Error loading resume:', error);
    }
  }

  /**
   * CONTENT EDITOR
   */
  setupContentEditor() {
    const saveBtn = document.getElementById('saveContentBtn');

    saveBtn?.addEventListener('click', () => this.saveContent());

    document.querySelector('[data-section="content"]')?.addEventListener('click', async () => {
      await this.loadContent();
    });
  }

  async loadContent() {
    try {
      const content = await FirestoreManager.getContent();

      document.getElementById('heroTitle').value = content.heroTitle || '';
      document.getElementById('heroSubtitle').value = content.heroSubtitle || '';
      document.getElementById('aboutDescription').value = content.aboutDescription || '';

    } catch (error) {
      console.error('Error loading content:', error);
    }
  }

  async saveContent() {
    try {
      const contentData = {
        heroTitle: document.getElementById('heroTitle').value,
        heroSubtitle: document.getElementById('heroSubtitle').value,
        aboutDescription: document.getElementById('aboutDescription').value
      };

      await FirestoreManager.saveContent(contentData);
      this.showNotification('Content updated successfully', 'success');

    } catch (error) {
      console.error('Error saving content:', error);
      this.showNotification('Error saving content', 'error');
    }
  }

  /**
   * ANALYTICS
   */
  setupAnalytics() {
    document.querySelector('[data-section="analytics"]')?.addEventListener('click', async () => {
      await this.loadAnalytics();
    });
  }

  async loadAnalytics() {
    try {
      const analytics = await FirestoreManager.getAnalyticsSummary();

      // Update stats display
      document.getElementById('pageStats').innerHTML = `
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <p>📊 Total Views: <strong>${analytics.totalPageViews}</strong></p>
          <p>👥 Total Visitors: <strong>${analytics.totalVisitors}</strong></p>
          <p>💬 Total Messages: <strong>${analytics.totalMessages}</strong></p>
          <p>📬 Unread Messages: <strong>${analytics.unreadMessages}</strong></p>
        </div>
      `;

    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  /**
   * UTILITY FUNCTIONS
   */

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  formatFullDate(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  }

  showNotification(message, type = 'info') {
    const panel = document.getElementById('notificationPanel');
    const list = document.getElementById('notificationsList');

    const notifEl = document.createElement('div');
    notifEl.className = `notification-item`;
    notifEl.textContent = message;

    list.insertBefore(notifEl, list.firstChild);

    // Limit to 5 notifications
    while (list.children.length > 5) {
      list.removeChild(list.lastChild);
    }

    // Auto remove after 5 seconds
    setTimeout(() => {
      notifEl.remove();
    }, 5000);
  }
}

// ============================================================================
// INITIALIZE ADMIN DASHBOARD
// ============================================================================

let adminDashboard = null;

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('adminDashboard')) {
    adminDashboard = new AdminDashboard();
  }
});
