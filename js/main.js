/* ============================================
   IGNITE - Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Navigation Toggle
  const navToggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('active');
    });

    // Close mobile nav when clicking a link
    document.querySelectorAll('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('active');
      });
    });
  }

  // Active Navigation Link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // Scroll Animation - Fade In
  const fadeElements = document.querySelectorAll('.fade-in');

  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, observerOptions);

  fadeElements.forEach(el => observer.observe(el));

  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  // Form submission handler
  const contactForm = document.querySelector('.contact-form form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Get form values
      const name = document.querySelector('#name')?.value;
      const email = document.querySelector('#email')?.value;
      const message = document.querySelector('#message')?.value;

      // Create mailto link
      const subject = encodeURIComponent(`Ignite Contact: ${name}`);
      const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
      const mailtoLink = `mailto:ignite.saratoga@gmail.com?subject=${subject}&body=${body}`;

      // Open email client
      window.location.href = mailtoLink;

      // Show success message
      alert('Thanks for reaching out! Your email client should open shortly. 🔥');
      contactForm.reset();
    });
  }

  // Add bounce effect to flame emoji on click
  const flameElements = document.querySelectorAll('.hero-flame, .nav-logo-icon');
  flameElements.forEach(flame => {
    flame.addEventListener('click', () => {
      flame.style.animation = 'none';
      flame.offsetHeight; // Trigger reflow
      flame.style.animation = 'flicker 0.5s ease-in-out 3, float 3s ease-in-out infinite';
    });
  });

  // Parallax effect for hero section (subtle)
  const hero = document.querySelector('.hero');
  if (hero) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const heroContent = hero.querySelector('.hero-content');
      if (heroContent && scrolled < window.innerHeight) {
        heroContent.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroContent.style.opacity = 1 - (scrolled / window.innerHeight);
      }
    });
  }
});

// Utility: Add stagger animation to grid items
function staggerAnimate(selector, delay = 100) {
  const elements = document.querySelectorAll(selector);
  elements.forEach((el, index) => {
    el.style.transitionDelay = `${index * delay}ms`;
    el.classList.add('fade-in');
  });
}

// Initialize stagger animations on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    staggerAnimate('.feature-card');
    staggerAnimate('.curriculum-card');
    staggerAnimate('.team-card');
    staggerAnimate('.speaker-card');
  });
} else {
  staggerAnimate('.feature-card');
  staggerAnimate('.curriculum-card');
  staggerAnimate('.team-card');
  staggerAnimate('.speaker-card');
}
