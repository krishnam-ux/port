// ============================================================================
// PREMIUM CMS REDESIGN - JAVASCRIPT
// Modern Framer/Vercel/Linear style dashboard
// ============================================================================

class CMSRedesign {
  constructor() {
    this.currentSection = 'dashboard';
    this.publishedData = {};
    this.draftData = {};
    this.editingProjectId = null;
    this.editingCertId = null;
    this.init();
  }

  init() {
    console.log('⏳ CMS Init starting...');
    this.loadPublishedData();
    this.setupEventListeners();
    
    // Make sure dashboard is visible on load
    const dashboardSection = document.getElementById('dashboard-section');
    if (dashboardSection) {
      dashboardSection.classList.add('active');
      console.log('✅ Dashboard section shown on load');
    }
    
    this.animateOnLoad();
    this.updateAnalytics();
    console.log('🚀 Premium CMS Redesign initialized');
  }

  // ============================================================================
  // EVENT LISTENERS SETUP
  // ============================================================================

  setupEventListeners() {
    // Sidebar navigation
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.addEventListener('click', () => this.switchSection(item));
    });

    // Hero section
    document.getElementById('heroHeading')?.addEventListener('input', () => this.updateHeroPreview());
    document.getElementById('heroSubtitle')?.addEventListener('input', () => this.updateHeroPreview());
    document.getElementById('heroDescription')?.addEventListener('input', () => this.updateHeroPreview());
    document.getElementById('saveDraftHero')?.addEventListener('click', () => this.saveDraftHero());
    document.getElementById('publishHero')?.addEventListener('click', () => this.publishHero());

    // Projects
    document.getElementById('saveProject')?.addEventListener('click', () => this.saveProject());
    document.getElementById('clearProject')?.addEventListener('click', () => this.clearProjectForm());

    // Gallery
    document.getElementById('galleryUpload')?.addEventListener('click', (e) => this.handleGalleryUpload(e));
    document.getElementById('publishGallery')?.addEventListener('click', () => this.publishGallery());

    // Certifications
    document.getElementById('saveCert')?.addEventListener('click', () => this.saveCert());
    document.getElementById('clearCert')?.addEventListener('click', () => this.clearCertForm());

    // Resume
    document.getElementById('resumeUpload')?.addEventListener('click', (e) => this.handleResumeUpload(e));
    document.getElementById('publishResume')?.addEventListener('click', () => this.publishResume());

    // Global publish
    document.querySelector('.navbar-btn.publish')?.addEventListener('click', () => this.publishAll());

    // Section visibility toggles
    document.querySelectorAll('.section-toggle').forEach(toggle => {
      const section = toggle.getAttribute('data-section');
      
      // Load saved state
      this.loadSectionVisibility(section);
      
      // Toggle visual on click
      const visual = document.getElementById(`toggle-${section}-visual`);
      if (visual) {
        visual.addEventListener('click', () => {
          toggle.checked = !toggle.checked;
          this.updateToggleVisual(section, toggle.checked);
        });
      }
    });

    // Save section settings
    document.getElementById('saveSectionSettings')?.addEventListener('click', () => this.saveSectionSettings());
  }

  // ============================================================================
  // SECTION VISIBILITY CONTROLS
  // ============================================================================

  loadSectionVisibility(section) {
    try {
      const visibility = localStorage.getItem(`cms_visibility_${section}`);
      const toggle = document.getElementById(`toggle-${section}`);
      const message = document.getElementById(`message-${section}`);
      
      if (visibility) {
        const data = JSON.parse(visibility);
        toggle.checked = data.visible;
        if (message) message.value = data.message || '';
        this.updateToggleVisual(section, data.visible);
      } else {
        toggle.checked = true;
        this.updateToggleVisual(section, true);
      }
    } catch (error) {
      console.log('Error loading section visibility:', section);
    }
  }

  updateToggleVisual(section, isVisible) {
    const visual = document.getElementById(`toggle-${section}-visual`);
    const status = document.getElementById(`status-${section}`);
    
    if (visual) {
      const span = visual.querySelector('span');
      if (isVisible) {
        visual.style.background = '#4ade80';
        span.style.transform = 'translateX(22px)';
        if (status) status.textContent = 'Active';
        if (status) status.style.color = '#4ade80';
      } else {
        visual.style.background = '#ef4444';
        span.style.transform = 'translateX(0)';
        if (status) status.textContent = 'Hidden';
        if (status) status.style.color = '#ef4444';
      }
    }
  }

  saveSectionSettings() {
    const sections = ['projects', 'gallery', 'certifications', 'hero', 'about', 'skills'];
    
    sections.forEach(section => {
      const toggle = document.getElementById(`toggle-${section}`);
      const message = document.getElementById(`message-${section}`);
      
      if (toggle) {
        const data = {
          visible: toggle.checked,
          message: message?.value || `This section is currently disabled. Check back soon!`
        };
        
        localStorage.setItem(`cms_visibility_${section}`, JSON.stringify(data));
      }
    });

    this.showNotification('✅ Section settings saved and synced to website!', 'success');
    
    // Sync to website
    window.dispatchEvent(new CustomEvent('sectionSettingsUpdated', {
      detail: { timestamp: new Date().toISOString() }
    }));
  }


  // ============================================================================
  // SECTION SWITCHING - Smooth Transitions
  // ============================================================================

  switchSection(navItem) {
    const sectionId = navItem.getAttribute('data-section');
    console.log('🔄 Switching to section:', sectionId);
    
    // Update active nav
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    navItem.classList.add('active');
    console.log('✅ Nav item activated:', sectionId);

    // Hide all sections with animation
    document.querySelectorAll('.cms-section-v2').forEach(section => {
      section.classList.remove('active');
    });
    console.log('🔽 All sections hidden');

    // Show new section with animation
    const newSection = document.getElementById(`${sectionId}-section`);
    console.log('🔍 Looking for section:', `${sectionId}-section`);
    
    if (newSection) {
      newSection.classList.add('active');
      console.log('✅ Section activated');
      
      // Animate in
      gsap.from(newSection, {
        duration: 0.4,
        opacity: 0,
        y: 20,
        ease: 'power2.out'
      });
    } else {
      console.warn('⚠️ Section not found:', `${sectionId}-section`);
      // Try to find by data-section-id
      const altSection = document.querySelector(`[data-section-id="${sectionId}"]`);
      if (altSection) {
        altSection.classList.add('active');
        console.log('✅ Section activated (by data-section-id)');
        gsap.from(altSection, {
          duration: 0.4,
          opacity: 0,
          y: 20,
          ease: 'power2.out'
        });
      }
    }

    this.currentSection = sectionId;
  }

  // ============================================================================
  // HERO SECTION
  // ============================================================================

  updateHeroPreview() {
    const heading = document.getElementById('heroHeading')?.value || 'Your Name';
    const subtitle = document.getElementById('heroSubtitle')?.value || 'Your subtitle';
    const description = document.getElementById('heroDescription')?.value || '';
    
    const preview = document.getElementById('heroPreview');
    if (preview) {
      preview.innerHTML = `
        <div class="preview-item">
          <strong style="color: var(--primary-light);">${heading}</strong>
        </div>
        <div class="preview-item">
          <small>${subtitle}</small>
        </div>
        <div class="preview-item">
          <small>${description.substring(0, 100)}${description.length > 100 ? '...' : ''}</small>
        </div>
      `;
    }
  }

  saveDraftHero() {
    const heroData = {
      heading: document.getElementById('heroHeading').value,
      subtitle: document.getElementById('heroSubtitle').value,
      description: document.getElementById('heroDescription').value,
      tags: document.getElementById('heroTags').value.split(',').map(t => t.trim()),
      savedAt: new Date().toLocaleTimeString()
    };

    this.draftData.hero = heroData;
    this.showNotification('💾 Hero section saved as draft', 'success');
    this.updateHeroPreview();
  }

  publishHero() {
    const heroData = {
      heading: document.getElementById('heroHeading').value,
      subtitle: document.getElementById('heroSubtitle').value,
      description: document.getElementById('heroDescription').value,
      tags: document.getElementById('heroTags').value.split(',').map(t => t.trim()),
      publishedAt: new Date().toLocaleTimeString()
    };

    this.publishedData.hero = heroData;
    localStorage.setItem('cms_hero_published', JSON.stringify(heroData));
    
    this.showNotification('🚀 Hero section published live!', 'success');
    this.updateHeroPreview();
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
      id: this.editingProjectId || Date.now()
    };

    if (!projectData.name) {
      this.showNotification('❌ Project name required', 'error');
      return;
    }

    if (!this.publishedData.projects) {
      this.publishedData.projects = [];
    }

    if (this.editingProjectId) {
      // UPDATE existing project
      const index = this.publishedData.projects.findIndex(p => p.id === this.editingProjectId);
      if (index !== -1) {
        this.publishedData.projects[index] = projectData;
        this.showNotification('✅ Project updated!', 'success');
        this.editingProjectId = null;
        const btn = document.getElementById('saveProject');
        if (btn) btn.textContent = '➕ Add Project';
      }
    } else {
      // CREATE new project
      this.publishedData.projects.push(projectData);
      this.showNotification('✅ Project added!', 'success');
    }

    localStorage.setItem('cms_projects_published', JSON.stringify(this.publishedData.projects));
    this.updateProjectsList();
    this.clearProjectForm();
  }

  clearProjectForm() {
    document.getElementById('projectName').value = '';
    document.getElementById('projectDescription').value = '';
    document.getElementById('projectTech').value = '';
    document.getElementById('projectGithub').value = '';
    this.editingProjectId = null;
    const btn = document.getElementById('saveProject');
    if (btn) btn.textContent = '➕ Add Project';
  }

  editProject(id) {
    const project = this.publishedData.projects.find(p => p.id === id);
    if (!project) return;

    document.getElementById('projectName').value = project.name;
    document.getElementById('projectDescription').value = project.description;
    document.getElementById('projectTech').value = project.tech.join(', ');
    document.getElementById('projectGithub').value = project.github;

    this.editingProjectId = id;
    const btn = document.getElementById('saveProject');
    if (btn) btn.textContent = '💾 Update Project';

    // Scroll to form
    document.getElementById('projectName').scrollIntoView({behavior: 'smooth'});
    this.showNotification('✏️ Edit mode - Update and save your changes', 'info');
  }

  updateProjectsList() {
    const projects = this.publishedData.projects || [];
    const list = document.getElementById('projectsList');

    if (projects.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No projects yet</p>';
      return;
    }

    list.innerHTML = projects.map(project => `
      <div class="preview-item">
        <strong>${project.name}</strong><br>
        <small>${project.tech.join(', ')}</small><br>
        <button class="btn-cms secondary" style="margin-top: 5px; margin-right: 5px; padding: 4px 8px; font-size: 0.8rem;" onclick="cmsInstance.editProject(${project.id})">✏️ Edit</button>
        <button class="btn-cms secondary" style="margin-top: 5px; padding: 4px 8px; font-size: 0.8rem;" onclick="cmsInstance.deleteProject(${project.id})">🗑️ Delete</button>
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
        if (file.size > 5 * 1024 * 1024) {
          this.showNotification(`❌ ${file.name} is too large`, 'error');
          return;
        }

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
      preview.innerHTML = '<p style="color: var(--text-secondary); grid-column: 1/-1;">No images uploaded</p>';
      return;
    }

    preview.innerHTML = gallery.map(image => `
      <div style="position: relative; border-radius: 8px; overflow: hidden; cursor: pointer;">
        <img src="${image.data}" style="width: 100%; aspect-ratio: 1; object-fit: cover;" />
        <button class="btn-cms danger" style="position: absolute; top: 5px; right: 5px; padding: 4px 8px;" onclick="cmsInstance.deleteGalleryImage('${image.id}')">🗑️</button>
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
      id: this.editingCertId || Date.now()
    };

    if (!certData.name) {
      this.showNotification('❌ Certification name required', 'error');
      return;
    }

    if (!this.publishedData.certifications) {
      this.publishedData.certifications = [];
    }

    if (this.editingCertId) {
      // UPDATE existing certification
      const index = this.publishedData.certifications.findIndex(c => c.id === this.editingCertId);
      if (index !== -1) {
        this.publishedData.certifications[index] = certData;
        this.showNotification('✅ Certification updated!', 'success');
        this.editingCertId = null;
        const btn = document.getElementById('saveCert');
        if (btn) btn.textContent = '➕ Add Certification';
      }
    } else {
      // CREATE new certification
      this.publishedData.certifications.push(certData);
      this.showNotification('✅ Certification added!', 'success');
    }

    localStorage.setItem('cms_certifications_published', JSON.stringify(this.publishedData.certifications));
    this.updateCertsList();
    this.clearCertForm();
  }

  clearCertForm() {
    document.getElementById('certName').value = '';
    document.getElementById('certIssuer').value = '';
    document.getElementById('certLink').value = '';
    this.editingCertId = null;
    const btn = document.getElementById('saveCert');
    if (btn) btn.textContent = '➕ Add Certification';
  }

  editCert(id) {
    const cert = this.publishedData.certifications.find(c => c.id === id);
    if (!cert) return;

    document.getElementById('certName').value = cert.name;
    document.getElementById('certIssuer').value = cert.issuer;
    document.getElementById('certLink').value = cert.link;

    this.editingCertId = id;
    const btn = document.getElementById('saveCert');
    if (btn) btn.textContent = '💾 Update Certification';

    // Scroll to form
    document.getElementById('certName').scrollIntoView({behavior: 'smooth'});
    this.showNotification('✏️ Edit mode - Update and save your changes', 'info');
  }

  updateCertsList() {
    const certs = this.publishedData.certifications || [];
    const list = document.getElementById('certsList');

    if (certs.length === 0) {
      list.innerHTML = '<p style="color: var(--text-secondary);">No certs added</p>';
      return;
    }

    list.innerHTML = certs.map(cert => `
      <div class="preview-item">
        <strong>${cert.name}</strong><br>
        <small>${cert.issuer}</small><br>
        <button class="btn-cms secondary" style="margin-top: 5px; margin-right: 5px; padding: 4px 8px; font-size: 0.8rem;" onclick="cmsInstance.editCert(${cert.id})">✏️ Edit</button>
        <button class="btn-cms secondary" style="margin-top: 5px; padding: 4px 8px; font-size: 0.8rem;" onclick="cmsInstance.deleteCert(${cert.id})">🗑️ Delete</button>
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
      if (!file) return;

      if (file.size > 10 * 1024 * 1024) {
        this.showNotification('❌ File too large (max 10MB)', 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.publishedData.resume = {
          data: e.target.result,
          name: file.name,
          size: file.size
        };
        this.showNotification('✅ Resume ready to publish', 'success');
      };
      reader.readAsDataURL(file);
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
  // ANALYTICS
  // ============================================================================

  updateAnalytics() {
    // Animate analytics values
    document.querySelectorAll('.analytics-value').forEach(el => {
      const target = parseInt(el.getAttribute('data-value')) || 0;
      this.animateCounter(el, target, 1500);
    });
  }

  animateCounter(element, target, duration = 1000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        element.textContent = target.toLocaleString();
        clearInterval(timer);
      } else {
        element.textContent = Math.floor(start).toLocaleString();
      }
    }, 16);
  }

  // ============================================================================
  // PUBLISH & SYNC
  // ============================================================================

  publishAll() {
    Object.keys(this.publishedData).forEach(key => {
      if (this.publishedData[key]) {
        localStorage.setItem(`cms_${key}_published`, JSON.stringify(this.publishedData[key]));
      }
    });

    this.showNotification('🚀 All changes published live!', 'success');
    this.syncToWebsite();
  }

  syncToWebsite() {
    // Dispatch event to notify website
    window.dispatchEvent(new CustomEvent('cmsPublished', {
      detail: { data: this.publishedData, timestamp: new Date().toISOString() }
    }));

    localStorage.setItem('cms_last_publish', new Date().toISOString());
    localStorage.setItem('cms_published_data', JSON.stringify(this.publishedData));
  }

  // ============================================================================
  // DATA MANAGEMENT
  // ============================================================================

  loadPublishedData() {
    // Load all published content
    this.publishedData = {
      hero: this.getItemIfExists('cms_hero_published'),
      projects: this.getItemIfExists('cms_projects_published'),
      gallery: this.getItemIfExists('cms_gallery_published'),
      certifications: this.getItemIfExists('cms_certifications_published'),
      resume: this.getItemIfExists('cms_resume_published')
    };

    // Update UI with loaded data
    if (this.publishedData.projects) {
      this.updateProjectsList();
    }
    if (this.publishedData.certifications) {
      this.updateCertsList();
    }
    if (this.publishedData.gallery) {
      this.updateGalleryPreview();
    }
  }

  getItemIfExists(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  // ============================================================================
  // UI HELPERS
  // ============================================================================

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const bgColor = type === 'success' ? 'linear-gradient(135deg, #10b981, #059669)' :
                    type === 'error' ? 'linear-gradient(135deg, #ef4444, #dc2626)' :
                    'linear-gradient(135deg, #3b82f6, #1d4ed8)';
    
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      padding: 16px 24px;
      border-radius: 10px;
      background: ${bgColor};
      color: white;
      font-weight: 700;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
      z-index: 300;
      animation: slideInNotification 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutNotification 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  animateOnLoad() {
    gsap.from('.cms-navbar', {
      duration: 0.4,
      opacity: 0,
      y: -20,
      ease: 'power2.out'
    });

    gsap.from('.cms-sidebar-v2', {
      duration: 0.4,
      opacity: 0,
      x: -20,
      ease: 'power2.out'
    });

    gsap.from('.cms-hero', {
      duration: 0.6,
      opacity: 0,
      y: 30,
      ease: 'power2.out',
      delay: 0.2
    });

    gsap.from('.analytics-card', {
      duration: 0.5,
      opacity: 0,
      y: 20,
      stagger: 0.05,
      ease: 'power2.out',
      delay: 0.3
    });
  }
}

// Initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initializeCMS();
  });
} else {
  // DOM already loaded
  initializeCMS();
}

function initializeCMS() {
  console.log('⏳ Initializing CMS...');
  
  // Wait a bit for all DOM elements to be ready
  setTimeout(() => {
    window.cmsInstance = new CMSRedesign();
    console.log('✅ CMS Initialized Successfully');
    
    // Log all sections found
    const sections = document.querySelectorAll('.cms-section-v2');
    console.log(`📋 Found ${sections.length} sections:`, 
      Array.from(sections).map(s => s.id || s.getAttribute('data-section-id')));
    
    // Log all nav items found
    const navItems = document.querySelectorAll('.sidebar-nav-item');
    console.log(`🧭 Found ${navItems.length} nav items`);
  }, 100);

  // Add notification styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInNotification {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    @keyframes slideOutNotification {
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
}
