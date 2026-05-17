// ============================================================================
// CMS CONTENT LOADER - Syncs CMS data to website
// ============================================================================

class ContentLoader {
  constructor() {
    this.publishedData = {};
    this.init();
  }

  init() {
    // Load published content from localStorage
    this.loadPublishedContent();
    
    // Listen for CMS updates
    window.addEventListener('storage', (e) => {
      if (e.key && e.key.startsWith('cms_')) {
        console.log('📡 CMS content updated - reloading...', e.key);
        this.loadPublishedContent();
        this.syncContent();
      }
    });

    // Listen for CMS publish events
    window.addEventListener('cmsPublished', (e) => {
      console.log('🔄 CMS published - syncing content...', e.detail);
      this.loadPublishedContent();
      this.syncContent();
    });

    console.log('✅ Content Loader initialized');
  }

  loadPublishedContent() {
    // Load all published content from localStorage
    this.publishedData = {
      hero: this.getItemIfExists('cms_hero_published'),
      projects: this.getItemIfExists('cms_projects_published'),
      gallery: this.getItemIfExists('cms_gallery_published'),
      certifications: this.getItemIfExists('cms_certifications_published'),
      resume: this.getItemIfExists('cms_resume_published')
    };

    console.log('📦 Published content loaded:', this.publishedData);
  }

  getItemIfExists(key) {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }

  syncContent() {
    // Sync hero section
    if (this.publishedData.hero) {
      this.updateHeroSection(this.publishedData.hero);
    }

    // Sync projects
    if (this.publishedData.projects && Array.isArray(this.publishedData.projects)) {
      this.updateProjects(this.publishedData.projects);
    }

    // Sync gallery
    if (this.publishedData.gallery && Array.isArray(this.publishedData.gallery)) {
      this.updateGallery(this.publishedData.gallery);
    }

    // Sync certifications
    if (this.publishedData.certifications && Array.isArray(this.publishedData.certifications)) {
      this.updateCertifications(this.publishedData.certifications);
    }

    // Sync resume download link
    if (this.publishedData.resume) {
      this.updateResumeLink(this.publishedData.resume);
    }
  }

  updateHeroSection(heroData) {
    // Update hero heading
    const h1 = document.querySelector('.hero h1');
    if (h1) {
      h1.textContent = heroData.heading;
    }

    // Update subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
      subtitle.textContent = heroData.subtitle;
    }

    // Update description
    const heroDesc = document.querySelector('.hero-left > p:not(.subtitle)');
    if (heroDesc) {
      heroDesc.textContent = heroData.description;
    }

    // Update tags
    const specialization = document.querySelector('.specialization');
    if (specialization && heroData.tags) {
      specialization.innerHTML = heroData.tags.map(tag => `<span>${tag}</span>`).join('');
    }

    console.log('🎯 Hero section updated');
  }

  updateProjects(projectsData) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    // Update projects on projects page
    if (document.querySelector('.projects-section')) {
      projectsGrid.innerHTML = projectsData.map(project => `
        <div class="project-card">
          <div class="project-image">📁</div>
          <div class="project-content">
            <span class="project-category">${project.tech[0] || 'Project'}</span>
            <h3>${project.name}</h3>
            <p>${project.description}</p>
            <div class="project-tech">
              ${project.tech.map(t => `<span class="tech-tag">${t}</span>`).join('')}
            </div>
            <div class="project-links">
              <a href="${project.github}" target="_blank" rel="noopener noreferrer" class="project-link">View on GitHub</a>
            </div>
          </div>
        </div>
      `).join('');

      console.log('📁 Projects updated');
    }
  }

  updateGallery(galleryData) {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    galleryGrid.innerHTML = galleryData.map(image => `
      <div class="gallery-item">
        <img src="${image.data}" alt="${image.name}" />
      </div>
    `).join('');

    console.log('🖼️ Gallery updated');
  }

  updateCertifications(certsData) {
    const certsGrid = document.querySelector('.certs-grid');
    if (!certsGrid) return;

    certsGrid.innerHTML = certsData.map(cert => `
      <div class="cert-card">
        <span class="cert-icon">🏆</span>
        <h4>${cert.name}</h4>
        <p>${cert.issuer}</p>
        ${cert.link ? `<a href="${cert.link}" target="_blank" rel="noopener noreferrer" class="cert-badge">Verify</a>` : '<span class="cert-badge">Certified</span>'}
      </div>
    `).join('');

    console.log('🏆 Certifications updated');
  }

  updateResumeLink(resumeData) {
    // Update resume download buttons
    document.querySelectorAll('a.cta-button[download]').forEach(btn => {
      btn.href = resumeData.data;
      btn.download = resumeData.name;
    });

    console.log('📄 Resume updated');
  }
}

// Initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.contentLoader = new ContentLoader();
  });
} else {
  window.contentLoader = new ContentLoader();
}
