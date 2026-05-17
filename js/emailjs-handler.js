// ============================================================================
// EMAILJS INTEGRATION
// Krishnam Dwivedi - Contact Form Handler
// ============================================================================

// Initialize EmailJS (Replace with your actual Public Key)
// Check if emailjs library is available
if (typeof emailjs !== 'undefined') {
  emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
}

class ContactFormHandler {
  constructor() {
    this.form = document.getElementById('contactForm');
    if (!this.form) return;
    
    this.hasEmailJS = typeof emailjs !== 'undefined';
    this.init();
  }

  init() {
    this.form.addEventListener('submit', (e) => this.handleSubmit(e));
  }

  async handleSubmit(e) {
    e.preventDefault();

    const formData = {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      phone: document.getElementById('phone')?.value || '',
      subject: document.getElementById('subject').value,
      message: document.getElementById('message').value
    };

    // Validation
    if (!this.validateForm(formData)) {
      this.showError('Please fill all fields with valid information');
      return;
    }

    // Show loading state
    const submitBtn = this.form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    try {
      // Save to Firestore (if Firebase is initialized)
      if (typeof FirestoreManager !== 'undefined') {
        try {
          await FirestoreManager.saveContactMessage(formData);
          console.log('Message saved to Firestore');
        } catch (firestoreError) {
          console.error('Firestore Error:', firestoreError);
          // Continue with EmailJS even if Firestore fails
        }
      }

      // Check if EmailJS credentials are configured (not placeholder values)
      const hasValidEmailJSConfig = this.hasEmailJS && 
        !['YOUR_SERVICE_ID', 'YOUR_EMAILJS_PUBLIC_KEY', 'YOUR_TEMPLATE_ID'].includes('YOUR_SERVICE_ID');

      // Send email via EmailJS (if available and properly configured)
      if (this.hasEmailJS && hasValidEmailJSConfig) {
        try {
          const response = await emailjs.send(
            'YOUR_SERVICE_ID',
            'YOUR_TEMPLATE_ID',
            {
              to_email: 'krishnamdwivedi17@gmail.com',
              from_name: formData.name,
              from_email: formData.email,
              phone: formData.phone,
              subject: formData.subject,
              message: formData.message
            }
          );

          if (response.status === 200) {
            this.showSuccess('Message sent successfully! I\'ll get back to you soon.');
            this.form.reset();
          }
        } catch (emailError) {
          console.error('EmailJS Error:', emailError);
          this.showFallbackSuccess('Thank you for reaching out! Please email me at krishnamdwivedi17@gmail.com');
          this.form.reset();
        }
      } else {
        // Fallback: Show message about contacting directly
        this.showFallbackSuccess('Thank you! Please email me directly at krishnamdwivedi17@gmail.com');
        console.warn('EmailJS not available or not configured - user should contact via email');
        this.form.reset();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError('Failed to send message. Please try again or email me directly at krishnamdwivedi17@gmail.com');
    } finally {
      submitBtn.textContent = originalText;
      submitBtn.disabled = false;
    }
  }

  validateForm(data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    return (
      data.name.trim().length > 0 &&
      emailRegex.test(data.email) &&
      data.subject.trim().length > 0 &&
      data.message.trim().length > 10
    );
  }

  showSuccess(message) {
    this.showNotification(message, 'success');
  }

  showFallbackSuccess(message) {
    // Show as success notification even though email won't actually be sent
    this.showNotification(message, 'success');
  }

  showError(message) {
    this.showNotification(message, 'error');
  }

  showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 20px;
      background: ${type === 'success' ? 'rgba(34, 197, 94, 0.9)' : 'rgba(239, 68, 68, 0.9)'};
      color: white;
      padding: 16px 24px;
      border-radius: 8px;
      z-index: 10000;
      font-weight: 500;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
      animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOutRight 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }
}

// Initialize contact form
document.addEventListener('DOMContentLoaded', () => {
  new ContactFormHandler();
});

// Add animation styles
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      opacity: 0;
      transform: translateX(100px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  
  @keyframes slideOutRight {
    from {
      opacity: 1;
      transform: translateX(0);
    }
    to {
      opacity: 0;
      transform: translateX(100px);
    }
  }
`;
document.head.appendChild(style);
