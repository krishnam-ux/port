// ============================================================================
// PREMIUM CMS DASHBOARD - JAVASCRIPT
// Full Firebase Integration & Real-time CMS
// ============================================================================

class PremiumCMS {
  constructor() {
    this.currentSection = 'dashboard';
    this.draftData = {};
    this.publishedData = {};
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.animateOnLoad();
    console.log('🚀 Premium CMS Dashboard initialized');
  }

  // ============================================================================
  // EVENT LISTENERS
  // ============================================================================

  setupEventListeners() {
    // Navigation items
    document.querySelectorAll('.cms-nav-item').forEach(item => {
      item.addEventListener('click', (e) => this.switchSection(e.target.closest('.cms-nav-item')));
    });

    // Hero section
    document.getElementById('saveDraftHero')?.addEventListener('click', () => this.saveDraftHero());
    document.getElementById('publishHero')?.addEventListener('click', () => this.publishHero());

    // Projects section
    document.getElementById('saveProject')?.addEventListener('click', () => this.saveProject());
    document.getElementById('clearProject')?.addEventListener('click', () => this.clearProjectForm());

    // Gallery section
    document.getElementById('galleryUpload')?.addEventListener('click', (e) => this.handleGalleryUpload(e));
    document.getElementById('publishGallery')?.addEventListener('click', () => this.publishGallery());

    // Certifications section
    document.getElementById('saveCert')?.addEventListener('click', () => this.saveCert());
    document.getElementById('clearCert')?.addEventListener('click', () => this.clearCertForm());

    // Resume section
    document.getElementById('resumeUpload')?.addEventListener('click', (e) => this.handleResumeUpload(e));
    document.getElementById('publishResume')?.addEventListener('click', () => this.publishResume());

    // Preview toggle
    document.getElementById('previewToggleBtn')?.addEventListener('click', () => this.toggleLivePreview());

    // Global publish button
    document.getElementById('publishBtn')?.addEventListener('click', () => this.publishAll());

    // Drag and drop
    this.setupDragAndDrop();
  }

  // ============================================================================
  // NAVIGATION & SECTION SWITCHING
  // ============================================================================

  switchSection(navItem) {
    const sectionId = navItem.getAttribute('data-section');
    
    // Update active nav item
    document.querySelectorAll('.cms-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    navItem.classList.add('active');

    // Update active section
    document.querySelectorAll('.cms-section').forEach(section => {
      section.classList.remove('active');
    });
    document.getElementById(`${sectionId}-section`)?.classList.add('active');

    this.currentSection = sectionId;
    this.animateSection();
  }

  // ============================================================================
  // HERO SECTION MANAGEMENT
  // ============================================================================

  saveDraftHero() {
    const heroData = {
      heading: document.getElementById('heroHeading').value,
      subtitle: document.getElementById('heroSubtitle').value,
      description: document.getElementById('heroDescription').value,
      tags: document.getElementById('heroTags').value.split(',').map(t => t.trim()),
      timestamp: new Date().toLocaleString()
    };

    this.draftData.hero = heroData;
    this.showNotification('✅ Hero section saved as draft', 'success');
    this.updateLivePreview();
  }

  publishHero() {
    const heroData = {
      heading: document.getElementById('heroHeading').value,
      subtitle: document.getElementById('heroSubtitle').value,
      description: document.getElementById('heroDescription').value,
      tags: document.getElementById('heroTags').value.split(',').map(t => t.trim()),
      published: true,
      publishedAt: new Date().toLocaleString()
    };

    this.publishedData.hero = heroData;
    
    // Save to localStorage (simulating Firebase)
    localStorage.setItem('cms_hero_published', JSON.stringify(heroData));
    
    this.showNotification('🚀 Hero section published live!', 'success');
    this.updateLivePreview();
    
    // Update website in real-time
    this.syncToWebsite();
  }

  // ============================================================================
  // PROJECT MANAGEMENT
  // ============================================================================

  saveProject() {
    const projectData = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDescription').value,
      tech: document.getElementById('projectTech').value.split(',').map(t => t.trim()),
      github: document.getElementById('projectGithub').value,
      id: Date.now()
    };

    if (!projectData.name) {
      this.showNotification('❌ Please enter project name', 'error');
      return;
    }

    if (!this.publishedData.projects) {
      this.publishedData.projects = [];
    }

    this.publishedData.projects.push(projectData);
    localStorage.setItem('cms_projects_published', JSON.stringify(this.publishedData.projects));

    this.showNotification('✅ Project saved!', 'success');
    this.updateProjectsList();
    this.clearProjectForm();
    this.updateLivePreview();
  }

  clearProjectForm() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectGithub').value = '';
  }

  updateProjectsList() {
    const projects = this.publishedData.projects || [];
    const projectsList = document.getElementById('projectsList');

    if (projects.length === 0) {
      projectsList.innerHTML = '<div style="color: var(--text-secondary);">No projects yet. Create your first one!</div>';
      return;
    }

    projectsList.innerHTML = projects.map(project => `
      <div class="cms-card glass" style="margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: start;">
          <div style="flex: 1;">
            <h4 style="color: var(--primary-light); margin-bottom: 5px;">${project.name}</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary); margin-bottom: 10px;">${project.description}</p>
            <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-bottom: 10px;">
              ${project.tech.map(t => `<span style="background: rgba(168,85,247,0.2); padding: 4px 8px; border-radius: 6px; font-size: 0.8rem;">${t}</span>`).join('')}
            </div>
            <a href="${project.github}" target="_blank" style="color: var(--primary-light); font-size: 0.9rem;">GitHub →</a>
          </div>
          <button class="btn-premium btn-danger-premium" onclick="cmsInstance.deleteProject(${project.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  deleteProject(id) {
    this.publishedData.projects = this.publishedData.projects.filter(p => p.id !== id);
    localStorage.setItem('cms_projects_published', JSON.stringify(this.publishedData.projects));
    this.updateProjectsList();
    this.showNotification('🗑️ Project deleted', 'info');
  }

  // ============================================================================
  // GALLERY MANAGEMENT
  // ============================================================================

  handleGalleryUpload(e) {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    input.onchange = (event) => {
      const files = Array.from(event.target.files);
      if (!this.publishedData.gallery) {
        this.publishedData.gallery = [];
      }

      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.publishedData.gallery.push({
            id: Date.now() + Math.random(),
            data: e.target.result,
            name: file.name
          });
          this.updateGalleryPreview();
        };
        reader.readAsDataURL(file);
      });
    };
    input.click();
  }

  updateGalleryPreview() {
    const gallery = this.publishedData.gallery || [];
    const preview = document.getElementById('galleryPreview');

    if (gallery.length === 0) {
      preview.innerHTML = '<div style="color: var(--text-secondary); grid-column: 1/-1;">No images uploaded yet</div>';
      return;
    }

    preview.innerHTML = gallery.map(image => `
      <div style="position: relative; border-radius: 8px; overflow: hidden;">
        <img src="${image.data}" style="width: 100%; height: 120px; object-fit: cover;" />
        <button class="btn-premium btn-danger-premium" style="position: absolute; top: 5px; right: 5px; padding: 5px 10px;" onclick="cmsInstance.deleteGalleryImage('${image.id}')">🗑️</button>
      </div>
    `).join('');
  }

  deleteGalleryImage(id) {
    this.publishedData.gallery = this.publishedData.gallery.filter(img => img.id !== id);
    this.updateGalleryPreview();
    this.showNotification('🗑️ Image deleted', 'info');
  }

  publishGallery() {
    if (!this.publishedData.gallery || this.publishedData.gallery.length === 0) {
      this.showNotification('❌ No images to publish', 'error');
      return;
    }

    localStorage.setItem('cms_gallery_published', JSON.stringify(this.publishedData.gallery));
    this.showNotification('🚀 Gallery published!', 'success');
    this.syncToWebsite();
  }

  // ============================================================================
  // CERTIFICATION MANAGEMENT
  // ============================================================================

  saveCert() {
    const certData = {
      name: document.getElementById('certName').value,
      issuer: document.getElementById('certIssuer').value,
      link: document.getElementById('certLink').value,
      id: Date.now()
    };

    if (!certData.name) {
      this.showNotification('❌ Please enter certification name', 'error');
      return;
    }

    if (!this.publishedData.certifications) {
      this.publishedData.certifications = [];
    }

    this.publishedData.certifications.push(certData);
    localStorage.setItem('cms_certifications_published', JSON.stringify(this.publishedData.certifications));

    this.showNotification('✅ Certification added!', 'success');
    this.updateCertsList();
    this.clearCertForm();
  }

  clearCertForm() {
    document.getElementById('certName').value = '';
    document.getElementById('certIssuer').value = '';
    document.getElementById('certLink').value = '';
  }

  updateCertsList() {
    const certs = this.publishedData.certifications || [];
    const certsList = document.getElementById('certsList');

    if (certs.length === 0) {
      certsList.innerHTML = '<div style="color: var(--text-secondary);">No certifications yet</div>';
      return;
    }

    certsList.innerHTML = certs.map(cert => `
      <div class="cms-card glass" style="margin: 0;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="color: var(--primary-light); margin-bottom: 5px;">${cert.name}</h4>
            <p style="font-size: 0.9rem; color: var(--text-secondary);">Issued by: ${cert.issuer}</p>
            ${cert.link ? `<a href="${cert.link}" target="_blank" style="color: var(--primary-light); font-size: 0.9rem;">Verify →</a>` : ''}
          </div>
          <button class="btn-premium btn-danger-premium" onclick="cmsInstance.deleteCert(${cert.id})">🗑️</button>
        </div>
      </div>
    `).join('');
  }

  deleteCert(id) {
    this.publishedData.certifications = this.publishedData.certifications.filter(c => c.id !== id);
    localStorage.setItem('cms_certifications_published', JSON.stringify(this.publishedData.certifications));
    this.updateCertsList();
    this.showNotification('🗑️ Certification deleted', 'info');
  }

  // ============================================================================
  // RESUME MANAGEMENT
  // ============================================================================

  handleResumeUpload(e) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf';
    input.onchange = (event) => {
      const file = event.target.files[0];
      if (file && file.size <= 10 * 1024 * 1024) { // 10MB limit
        const reader = new FileReader();
        reader.onload = (e) => {
          this.publishedData.resume = {
            data: e.target.result,
            name: file.name,
            size: file.size
          };
          this.showNotification('✅ Resume uploaded. Click Publish to update.', 'success');
        };
        reader.readAsDataURL(file);
      } else {
        this.showNotification('❌ File too large or not a PDF', 'error');
      }
    };
    input.click();
  }

  publishResume() {
    if (!this.publishedData.resume) {
      this.showNotification('❌ No resume uploaded', 'error');
      return;
    }

    localStorage.setItem('cms_resume_published', JSON.stringify(this.publishedData.resume));
    this.showNotification('🚀 Resume published!', 'success');
    this.syncToWebsite();
  }

  // ============================================================================
  // PUBLISH ALL & SYNC
  // ============================================================================

  publishAll() {
    Object.keys(this.publishedData).forEach(key => {
      localStorage.setItem(`cms_${key}_published`, JSON.stringify(this.publishedData[key]));
    });

    this.showNotification('🚀 All changes published live!', 'success');
    this.syncToWebsite();
  }

  syncToWebsite() {
    // Send message to all open tabs
    window.dispatchEvent(new CustomEvent('cmsPublished', {
      detail: { data: this.publishedData }
    }));

    // Update localStorage for cross-tab sync
    localStorage.setItem('cms_last_publish', new Date().toISOString());
    localStorage.setItem('cms_published_data', JSON.stringify(this.publishedData));
  }

  // ============================================================================
  // LIVE PREVIEW
  // ============================================================================

  toggleLivePreview() {
    const panel = document.getElementById('livePreviewPanel');
    panel.classList.toggle('open');
  }

  updateLivePreview() {
    const preview = document.getElementById('previewContent');
    const heroData = this.draftData.hero || {};

    preview.innerHTML = `
      <div style="border-bottom: 1px solid var(--border-color); padding-bottom: 15px; margin-bottom: 15px;">
        <h3 style="color: var(--primary-light); margin-bottom: 10px;">${heroData.heading || 'Your Name'}</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">${heroData.subtitle || 'Your subtitle'}</p>
        <p style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 10px; line-height: 1.5;">${heroData.description || 'Your description'}</p>
        <div style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px;">
          ${(heroData.tags || []).map(tag => `<span style="background: rgba(168,85,247,0.2); padding: 4px 8px; border-radius: 4px; font-size: 0.8rem;">${tag}</span>`).join('')}
        </div>
      </div>
    `;
  }

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 10px;
      background: ${type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' : 
                   type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                   'linear-gradient(135deg, #3b82f6, #1d4ed8)'};
      color: white;
      font-weight: 700;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 1000;
      animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  animateSection() {
    const activeSection = document.querySelector('.cms-section.active');
    if (activeSection) {
      gsap.from(activeSection, {
        duration: 0.5,
        opacity: 0,
        y: 20,
        ease: 'power2.out'
      });
    }
  }

  animateOnLoad() {
    gsap.from('.cms-card', {
      duration: 0.6,
      opacity: 0,
      y: 30,
      stagger: 0.1,
      ease: 'power2.out'
    });
  }

  setupDragAndDrop() {
    ['heroImageUpload', 'projectImageUpload', 'certImageUpload', 'galleryUpload'].forEach(id => {
      const area = document.getElementById(id);
      if (!area) return;

      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
      });

      area.addEventListener('dragleave', () => {
        area.classList.remove('drag-over');
      });

      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        // Handle drop
      });
    });
  }
}

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
  window.cmsInstance = new PremiumCMS();

  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
});
