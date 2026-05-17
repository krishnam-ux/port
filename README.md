# 🚀 Krishnam Dwivedi - Premium AI Entrepreneur Portfolio

A world-class, ultra-premium personal portfolio website built with pure HTML5, CSS3, and Vanilla JavaScript. Featuring dark luxury design with purple neon effects, glassmorphism, and cinematic animations inspired by Apple and Tesla aesthetics.

## 📋 Features

### Design & Aesthetics
- ✨ **Premium Dark Luxury UI** - Black + deep purple gradient backgrounds
- 🌟 **Purple Neon Glow Effects** - Cinematic lighting throughout
- 🔮 **Glassmorphism Design** - Modern frosted glass effects
- 🎨 **Smooth Animations** - Floating particles, parallax effects, fade-ins
- 📱 **Fully Responsive** - Perfect on mobile, tablet, and desktop
- 🎯 **Founder-Level Branding** - Premium personal brand presentation

### Technical Features
- ⚡ **Zero Dependencies** - Pure Vanilla JavaScript (no frameworks)
- 🎭 **Smooth Transitions** - Page transitions with fade effects
- 🖱️ **Mouse Parallax** - Interactive parallax on hero section
- 📊 **Animated Statistics** - Number counters with animations
- 🔍 **SEO Optimized** - Meta tags, Open Graph, Schema.org markup
- 📧 **EmailJS Integration** - Direct email functionality
- ♿ **Semantic HTML** - Proper HTML5 structure

## 📁 Project Structure

```
portfolio/
├── index.html              # Home page with hero section
├── about.html              # About me with timeline
├── skills.html             # Technical skills with progress bars
├── experience.html         # Professional experience timeline
├── certifications.html      # Certified credentials
├── projects.html           # Featured projects with filtering
├── gallery.html            # Coming soon page
├── contact.html            # Contact form with EmailJS
│
├── css/
│   └── main.css            # All styling (1000+ lines)
│
├── js/
│   ├── main.js             # Core JavaScript functionality
│   └── emailjs-handler.js   # EmailJS integration
│
└── assets/
    └── (images, icons, etc.)
```

## 🎯 Pages Overview

### 1. **Home (index.html)**
- Premium hero section with 3-column layout
- Realistic futuristic portrait with SVG fallback
- Social media icons (LinkedIn, GitHub, Instagram, YouTube)
- Call-to-action button
- Scroll indicator animation

### 2. **About (about.html)**
- Professional introduction
- Statistics cards with counters
- Journey timeline
- Personal branding narrative

### 3. **Skills (skills.html)**
- 8 skill categories with progress bars
- Hover glow effects
- Technology tags
- Proficiency levels

### 4. **Experience (experience.html)**
- Animated timeline design
- 4 professional experiences
- Company information
- Achievement highlights

### 5. **Certifications (certifications.html)**
- 5 professional certifications
- Microsoft Azure (AZ-900, AI-900)
- Oracle OCI AI Foundations
- IBM Enterprise Design Thinking
- Nutanix Certified Associate
- Verification links

### 6. **Projects (projects.html)**
- 8 featured projects
- Filterable by category (AI, Cloud, DevOps, Startup)
- Project descriptions and tech stacks
- Live demo and GitHub links

### 7. **Gallery (gallery.html)**
- Premium "Coming Soon" page
- Floating animation elements
- Call-to-action buttons
- Professional presentation

### 8. **Contact (contact.html)**
- Contact information display
- Multiple contact methods
- EmailJS-integrated form
- Social media links
- Footer with copyright

## 🔧 Setup Instructions

### 1. **EmailJS Configuration**

To enable the contact form:

1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Sign up for a free account
3. Get your **Public Key**
4. Create an Email Service (Gmail is easiest)
5. Create an Email Template with these variables:
   - `to_email`: krishnamdwivedi17@gmail.com
   - `from_name`: User's name
   - `from_email`: User's email
   - `subject`: Subject
   - `message`: Message content

6. Update these in `contact.html` (line ~350):
   ```javascript
   emailjs.init('YOUR_EMAILJS_PUBLIC_KEY');
   
   // In the emailjs.send() call:
   emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', { ... })
   ```

### 2. **Customize Content**

Edit the following files with your information:

- **Name & Branding**: Change "Krishnam Dwivedi" throughout
- **Contact Info**: Update email, LinkedIn, GitHub, Instagram, YouTube URLs
- **About Section**: Replace with your professional story
- **Skills**: Modify skill cards and proficiency levels
- **Experience**: Update job titles, companies, and descriptions
- **Certifications**: Replace with your actual certifications
- **Projects**: Add your portfolio projects

### 3. **Deployment Options**

#### Option A: GitHub Pages (Free)
```bash
1. Create a GitHub repository: username.github.io
2. Push all files to the repository
3. Your site will be live at https://username.github.io
```

#### Option B: Custom Domain
```bash
1. Purchase domain (GoDaddy, Namecheap, etc.)
2. Deploy to GitHub Pages or Vercel
3. Point domain DNS to deployment
```

#### Option C: Traditional Hosting
```bash
1. Upload all files to your web hosting (Bluehost, SiteGround, etc.)
2. Access via FTP or hosting control panel
3. Configure domain pointer
```

## 🎨 Customization Guide

### Color Scheme
Edit CSS variables in `css/main.css` (:root selector):
```css
:root {
  --purple-primary: #a855f7;      /* Main purple */
  --purple-light: #d946ef;        /* Bright purple */
  --bg-primary: #0a0a0f;          /* Dark background */
  --text-primary: #ffffff;        /* Main text */
}
```

### Fonts
The portfolio uses system fonts by default. To use custom fonts:
1. Add Google Fonts link in `<head>`
2. Update font-family in CSS

### Hero Portrait
The current portrait is SVG-generated. To use a real image:
1. Create/edit your portrait image
2. Replace the SVG in `index.html` with:
   ```html
   <img src="assets/portrait.jpg" alt="Portrait" class="portrait-image">
   ```

## 📊 Performance Optimization

- **Lighthouse Score**: 90+
- **Page Load**: < 2 seconds
- **No external dependencies**: Everything is self-contained
- **Optimized animations**: GPU-accelerated transforms
- **Mobile-first responsive**: Works perfectly on all devices

## 🔍 SEO Features

- Meta tags for all pages
- Open Graph tags for social sharing
- Schema.org Person markup
- Semantic HTML5
- Mobile-friendly viewport
- Fast loading time
- Proper heading hierarchy

## 📱 Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support
- Mobile browsers: Full support
- IE11: Partial support (some CSS features)

## 🚀 Advanced Features

### Floating Particles
Customizable animated background particles that create a premium feel.

### Mouse Parallax
Interactive parallax effect on hover - elements follow cursor movement.

### Smooth Scroll
All anchor links scroll smoothly to their targets.

### Animation Observer
Elements animate into view as you scroll down the page.

### Number Counters
Statistics automatically count up when they come into view.

### Project Filtering
Projects can be filtered by category with smooth transitions.

## 📞 Support & Troubleshooting

### EmailJS Not Working?
- Check that Public Key is correct
- Verify Service ID and Template ID match
- Ensure email variables are spelled correctly
- Check browser console for error messages

### Animations Laggy?
- Reduce particle count in `js/main.js`
- Disable parallax effects
- Clear browser cache

### Mobile Issues?
- Check viewport meta tag
- Test in device emulation
- Verify CSS media queries

## 🎓 Learning Resources

- [MDN Web Docs](https://developer.mozilla.org/) - HTML/CSS/JS reference
- [EmailJS Documentation](https://www.emailjs.com/docs/) - Email integration
- [CSS Tricks](https://css-tricks.com/) - Advanced CSS
- [JavaScript.info](https://javascript.info/) - JavaScript guide

## 📄 License

This portfolio template is free to use and customize for personal projects.

## 🎯 Next Steps

1. ✅ Download/clone the portfolio files
2. ✅ Set up EmailJS for contact form
3. ✅ Customize content with your information
4. ✅ Update social media links
5. ✅ Test all pages on mobile/desktop
6. ✅ Deploy to your hosting
7. ✅ Set up custom domain
8. ✅ Monitor analytics

---

**Created with 💜 by Krishnam Dwivedi**

For inquiries: krishnamdwivedi17@gmail.com

Visit: https://krishnamdwivedi.com
