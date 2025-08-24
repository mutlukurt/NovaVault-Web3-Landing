/**
 * NovaVault Landing Page JavaScript
 * Handles interactive features, animations, and accessibility
 */

// ===== UTILITY FUNCTIONS =====
const utils = {
  // Query selectors
  qs: (selector) => document.querySelector(selector),
  qsa: (selector) => document.querySelectorAll(selector),
  
  // Throttle function for performance
  throttle: (func, limit) => {
    let inThrottle;
    return function() {
      const args = arguments;
      const context = this;
      if (!inThrottle) {
        func.apply(context, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    }
  },
  
  // Debounce function
  debounce: (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  },
  
  // Smooth scroll to element
  animateToHash: (target) => {
    const element = document.querySelector(target);
    if (element) {
      const headerHeight = utils.qs('.header').offsetHeight;
      const elementPosition = element.offsetTop - headerHeight - 20;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  },
  
  // Focus trap for modals
  focusTrap: (element) => {
    const focusableElements = element.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );
    const firstFocusableElement = focusableElements[0];
    const lastFocusableElement = focusableElements[focusableElements.length - 1];

    element.addEventListener('keydown', (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey && document.activeElement === firstFocusableElement) {
          lastFocusableElement.focus();
          e.preventDefault();
        } else if (!e.shiftKey && document.activeElement === lastFocusableElement) {
          firstFocusableElement.focus();
          e.preventDefault();
        }
      }
    });
  }
};

// ===== HEADER FUNCTIONALITY =====
class Header {
  constructor() {
    this.header = utils.qs('.header');
    this.menuToggle = utils.qs('.menu-toggle');
    this.mobileMenu = utils.qs('.mobile-menu');
    this.navLinks = utils.qsa('.nav-links a, .mobile-nav-links a');
    
    this.init();
  }
  
  init() {
    this.setupScrollEffect();
    this.setupMobileMenu();
    this.setupSmoothScrolling();
  }
  
  setupScrollEffect() {
    const handleScroll = utils.throttle(() => {
      if (window.scrollY > 50) {
        this.header.classList.add('scrolled');
      } else {
        this.header.classList.remove('scrolled');
      }
    }, 100);
    
    window.addEventListener('scroll', handleScroll);
  }
  
  setupMobileMenu() {
    if (!this.menuToggle || !this.mobileMenu) return;
    
    // Toggle mobile menu
    this.menuToggle.addEventListener('click', () => {
      const isExpanded = this.menuToggle.getAttribute('aria-expanded') === 'true';
      
      this.menuToggle.setAttribute('aria-expanded', !isExpanded);
      this.mobileMenu.setAttribute('aria-hidden', isExpanded);
      
      // Focus management
      if (!isExpanded) {
        utils.focusTrap(this.mobileMenu);
        this.mobileMenu.querySelector('a').focus();
      }
      
      // Prevent body scroll when menu is open
      document.body.style.overflow = isExpanded ? 'auto' : 'hidden';
    });
    
    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.mobileMenu.getAttribute('aria-hidden') === 'false') {
        this.closeMobileMenu();
      }
    });
    
    // Close menu when clicking outside
    this.mobileMenu.addEventListener('click', (e) => {
      if (e.target === this.mobileMenu) {
        this.closeMobileMenu();
      }
    });
  }
  
  closeMobileMenu() {
    this.menuToggle.setAttribute('aria-expanded', 'false');
    this.mobileMenu.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = 'auto';
    this.menuToggle.focus();
  }
  
  setupSmoothScrolling() {
    this.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const href = link.getAttribute('href');
        
        if (href.startsWith('#')) {
          e.preventDefault();
          utils.animateToHash(href);
          
          // Close mobile menu if open
          if (this.mobileMenu.getAttribute('aria-hidden') === 'false') {
            this.closeMobileMenu();
          }
        }
      });
    });
  }
}

// ===== PARTICLES ANIMATION =====
class ParticlesAnimation {
  constructor() {
    this.canvas = utils.qs('.particles-canvas');
    this.ctx = null;
    this.particles = [];
    this.animationId = null;
    this.isVisible = true;
    
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.init();
  }
  
  init() {
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();
    this.createParticles();
    this.startAnimation();
    
    // Handle resize
    window.addEventListener('resize', utils.debounce(() => {
      this.resizeCanvas();
      this.createParticles();
    }, 300));
    
    // Handle visibility change to pause animation when tab is hidden
    document.addEventListener('visibilitychange', () => {
      this.isVisible = !document.hidden;
      if (this.isVisible) {
        this.startAnimation();
      } else {
        this.stopAnimation();
      }
    });
  }
  
  resizeCanvas() {
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;
  }
  
  createParticles() {
    this.particles = [];
    const particleCount = Math.min(50, Math.floor(this.canvas.width / 20));
    
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * this.canvas.width,
        y: Math.random() * this.canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2
      });
    }
  }
  
  updateParticles() {
    this.particles.forEach(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      
      // Wrap around edges
      if (particle.x < 0) particle.x = this.canvas.width;
      if (particle.x > this.canvas.width) particle.x = 0;
      if (particle.y < 0) particle.y = this.canvas.height;
      if (particle.y > this.canvas.height) particle.y = 0;
    });
  }
  
  drawParticles() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    this.particles.forEach(particle => {
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(153, 69, 255, ${particle.opacity})`;
      this.ctx.fill();
    });
    
    // Draw connections
    this.particles.forEach((particle, i) => {
      this.particles.slice(i + 1).forEach(otherParticle => {
        const distance = Math.hypot(particle.x - otherParticle.x, particle.y - otherParticle.y);
        
        if (distance < 100) {
          this.ctx.beginPath();
          this.ctx.moveTo(particle.x, particle.y);
          this.ctx.lineTo(otherParticle.x, otherParticle.y);
          this.ctx.strokeStyle = `rgba(20, 241, 149, ${0.1 * (1 - distance / 100)})`;
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
        }
      });
    });
  }
  
  animate() {
    if (!this.isVisible) return;
    
    this.updateParticles();
    this.drawParticles();
    this.animationId = requestAnimationFrame(() => this.animate());
  }
  
  startAnimation() {
    if (this.animationId) this.stopAnimation();
    this.animate();
  }
  
  stopAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
}

// ===== SCREEN SLIDER =====
class ScreenSlider {
  constructor() {
    this.screens = utils.qsa('.screen');
    this.navButtons = utils.qsa('.screen-nav-btn');
    this.currentIndex = 0;
    this.autoplayInterval = null;
    
    this.init();
  }
  
  init() {
    if (!this.screens.length || !this.navButtons.length) return;
    
    this.setupNavigation();
    this.startAutoplay();
  }
  
  setupNavigation() {
    this.navButtons.forEach((btn, index) => {
      btn.addEventListener('click', () => {
        this.showScreen(index);
        this.pauseAutoplay();
      });
    });
  }
  
  showScreen(index) {
    // Remove active class from all screens and buttons
    this.screens.forEach(screen => screen.classList.remove('active'));
    this.navButtons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to current screen and button
    this.screens[index].classList.add('active');
    this.navButtons[index].classList.add('active');
    
    this.currentIndex = index;
  }
  
  nextScreen() {
    const nextIndex = (this.currentIndex + 1) % this.screens.length;
    this.showScreen(nextIndex);
  }
  
  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextScreen();
    }, 4000);
  }
  
  pauseAutoplay() {
    if (this.autoplayInterval) {
      clearInterval(this.autoplayInterval);
      this.autoplayInterval = null;
      
      // Resume autoplay after 10 seconds
      setTimeout(() => {
        this.startAutoplay();
      }, 10000);
    }
  }
}

// ===== TESTIMONIALS CAROUSEL =====
class TestimonialsCarousel {
  constructor() {
    this.testimonials = utils.qsa('.testimonial');
    this.currentIndex = 0;
    this.autoplayInterval = null;
    
    this.init();
  }
  
  init() {
    if (!this.testimonials.length) return;
    
    this.startAutoplay();
  }
  
  showTestimonial(index) {
    this.testimonials.forEach(testimonial => testimonial.classList.remove('active'));
    this.testimonials[index].classList.add('active');
    this.currentIndex = index;
  }
  
  nextTestimonial() {
    const nextIndex = (this.currentIndex + 1) % this.testimonials.length;
    this.showTestimonial(nextIndex);
  }
  
  startAutoplay() {
    this.autoplayInterval = setInterval(() => {
      this.nextTestimonial();
    }, 6000);
  }
}

// ===== FAQ ACCORDION =====
class FAQAccordion {
  constructor() {
    this.faqItems = utils.qsa('.faq-item');
    
    this.init();
  }
  
  init() {
    this.faqItems.forEach(item => {
      const question = item.querySelector('.faq-question');
      const answer = item.querySelector('.faq-answer');
      
      if (question && answer) {
        question.addEventListener('click', () => {
          this.toggleItem(question, answer);
        });
      }
    });
  }
  
  toggleItem(question, answer) {
    const isExpanded = question.getAttribute('aria-expanded') === 'true';
    
    // Close all other items
    this.faqItems.forEach(item => {
      const otherQuestion = item.querySelector('.faq-question');
      const otherAnswer = item.querySelector('.faq-answer');
      
      if (otherQuestion !== question) {
        otherQuestion.setAttribute('aria-expanded', 'false');
        otherAnswer.setAttribute('aria-hidden', 'true');
      }
    });
    
    // Toggle current item
    question.setAttribute('aria-expanded', !isExpanded);
    answer.setAttribute('aria-hidden', isExpanded);
  }
}

// ===== SCROLL ANIMATIONS =====
class ScrollAnimations {
  constructor() {
    this.animatedElements = utils.qsa('[data-animate]');
    this.observerOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    };
    
    this.init();
  }
  
  init() {
    // Check for reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    
    this.setupIntersectionObserver();
    this.addAnimationClasses();
  }
  
  addAnimationClasses() {
    // Add animation data attributes to elements
    const featureCards = utils.qsa('.feature-card');
    featureCards.forEach((card, index) => {
      card.setAttribute('data-animate', 'fadeInUp');
      card.style.animationDelay = `${index * 100}ms`;
    });
    
    const steps = utils.qsa('.step');
    steps.forEach((step, index) => {
      step.setAttribute('data-animate', 'fadeInUp');
      step.style.animationDelay = `${index * 200}ms`;
    });
  }
  
  setupIntersectionObserver() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-in');
          observer.unobserve(entry.target);
        }
      });
    }, this.observerOptions);
    
    this.animatedElements.forEach(element => {
      observer.observe(element);
    });
  }
}

// ===== NEWSLETTER FORM =====
class NewsletterForm {
  constructor() {
    this.form = utils.qs('.newsletter-form');
    this.input = utils.qs('.newsletter-form input');
    this.button = utils.qs('.newsletter-form button');
    
    this.init();
  }
  
  init() {
    if (!this.form) return;
    
    this.form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });
  }
  
  handleSubmit() {
    const email = this.input.value.trim();
    
    if (!this.validateEmail(email)) {
      this.showMessage('Please enter a valid email address', 'error');
      return;
    }
    
    // Simulate API call
    this.button.textContent = 'Subscribing...';
    this.button.disabled = true;
    
    setTimeout(() => {
      this.showMessage('Thanks for subscribing!', 'success');
      this.input.value = '';
      this.button.textContent = '';
      this.button.disabled = false;
      this.button.innerHTML = '<img src="/assets/arrow-right.svg" alt="" width="16" height="16">';
    }, 1000);
  }
  
  validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
  
  showMessage(message, type) {
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.textContent = message;
    messageEl.className = `form-message ${type}`;
    messageEl.style.cssText = `
      position: absolute;
      top: -40px;
      left: 0;
      right: 0;
      padding: 8px 12px;
      border-radius: 4px;
      font-size: 0.875rem;
      text-align: center;
      background: ${type === 'success' ? 'var(--accent)' : 'var(--warning)'};
      color: var(--bg);
      opacity: 0;
      transform: translateY(10px);
      transition: all 0.3s ease;
    `;
    
    // Add to form
    this.form.style.position = 'relative';
    this.form.appendChild(messageEl);
    
    // Animate in
    requestAnimationFrame(() => {
      messageEl.style.opacity = '1';
      messageEl.style.transform = 'translateY(0)';
    });
    
    // Remove after 3 seconds
    setTimeout(() => {
      messageEl.style.opacity = '0';
      messageEl.style.transform = 'translateY(-10px)';
      setTimeout(() => {
        messageEl.remove();
      }, 300);
    }, 3000);
  }
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all components
  new Header();
  new ParticlesAnimation();
  new ScreenSlider();
  new TestimonialsCarousel();
  new FAQAccordion();
  new ScrollAnimations();
  new NewsletterForm();
  
  // Add loading animation
  document.body.classList.add('loaded');
  
  // Handle CTA button clicks with shimmer effect
  const ctaButtons = utils.qsa('.btn-primary');
  ctaButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      // Add shimmer effect
      const shimmer = document.createElement('span');
      shimmer.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        animation: shimmer 0.6s ease-out;
        pointer-events: none;
      `;
      
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.appendChild(shimmer);
      
      setTimeout(() => shimmer.remove(), 600);
    });
  });
});

// ===== SHIMMER ANIMATION =====
const shimmerKeyframes = `
  @keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

// Add shimmer keyframes to document
const style = document.createElement('style');
style.textContent = shimmerKeyframes;
document.head.appendChild(style);

// ===== PERFORMANCE MONITORING =====
if ('performance' in window) {
  window.addEventListener('load', () => {
    // Log performance metrics
    const navigation = performance.getEntriesByType('navigation')[0];
    const paintMetrics = performance.getEntriesByType('paint');
    
    console.log('Performance Metrics:', {
      'DOM Content Loaded': navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      'Load Complete': navigation.loadEventEnd - navigation.loadEventStart,
      'First Paint': paintMetrics.find(entry => entry.name === 'first-paint')?.startTime,
      'First Contentful Paint': paintMetrics.find(entry => entry.name === 'first-contentful-paint')?.startTime
    });
  });
}

// ===== ERROR HANDLING =====
window.addEventListener('error', (e) => {
  console.error('JavaScript Error:', e.error);
  // In production, you might want to send errors to an analytics service
});

// ===== ACCESSIBILITY ENHANCEMENTS =====
// Focus management for keyboard navigation
document.addEventListener('keydown', (e) => {
  // Add visible focus indicator when navigating with keyboard
  if (e.key === 'Tab') {
    document.body.classList.add('keyboard-navigation');
  }
});

document.addEventListener('mousedown', () => {
  document.body.classList.remove('keyboard-navigation');
});

// Add CSS for keyboard navigation
const keyboardNavigationCSS = `
  .keyboard-navigation *:focus {
    outline: 2px solid var(--primary) !important;
    outline-offset: 2px !important;
  }
`;

const keyboardStyle = document.createElement('style');
keyboardStyle.textContent = keyboardNavigationCSS;
document.head.appendChild(keyboardStyle);