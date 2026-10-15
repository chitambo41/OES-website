/**
 * OPPORTUNITY DAYCARE & NURSERY SCHOOL — PERFORMANCE INTERACTION ENGINE
 * Features:
 * - Instant, zero-FOUC Dark/Light Mode with localStorage & System Preference
 * - Ultra-lightweight IntersectionObserver Scroll Reveals (auto-unobserve)
 * - Hardware-accelerated Responsive Navigation Drawer
 * - Modern Interactive Lightbox Modal with Keyboard Navigation (ESC, Arrows)
 * - Video Fullscreen Interactivity
 * - Random Showcase Banner Engine
 * - Zero Dependencies, 100% Vanilla JS, Full prefers-reduced-motion Support
 */

(function () {
  'use strict';

  /* ==========================================================================
     1. THEME ENGINE (Dark / Light Mode)
     ========================================================================== */
  const THEME_STORAGE_KEY = 'oes_theme_preference';

  function getPreferredTheme() {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'dark' || saved === 'light') {
      return saved;
    }
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(function (btn) {
      btn.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
      );
      btn.setAttribute('title', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
    });
  }

  function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.warn('localStorage not accessible:', e);
    }
    applyTheme(newTheme);
  }

  // Apply immediately on parse
  applyTheme(getPreferredTheme());

  // Listen to OS scheme changes if user hasn't set an explicit preference
  if (window.matchMedia) {
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function (e) {
      if (!localStorage.getItem(THEME_STORAGE_KEY)) {
        applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /* ==========================================================================
     2. DOM CONTENT LOADED INITIALIZATION
     ========================================================================== */
  document.addEventListener('DOMContentLoaded', function () {
    initThemeButtons();
    initMobileNav();
    initScrollReveals();
    initLightbox();
    initHeroRotation();
    initAdmissionForm();
  });

  function initAdmissionForm() {
    const form = document.getElementById('admission-form');
    const status = document.getElementById('admission-form-status');
    if (!form || !status) return;

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const formData = new FormData(form);
      const fields = Array.from(formData.entries()).filter(function (entry) {
        return !entry[0].startsWith('_');
      });

      const whatsappNumber = '255713656262';
      const messageText = fields.map(function (entry) {
        return entry[0] + ': ' + entry[1];
      }).join('\n');
      const whatsappUrl = 'https://wa.me/' + whatsappNumber + '?text=' + encodeURIComponent('New admission inquiry\n\n' + messageText);

      const fallbackLink = document.createElement('a');
      fallbackLink.href = whatsappUrl;
      fallbackLink.textContent = 'Open WhatsApp chat';
      status.hidden = false;
      status.replaceChildren(
        document.createTextNode('Opening WhatsApp so the admission details can be sent to +255713656262. If it does not open, '),
        fallbackLink,
        document.createTextNode('.')
      );

      window.open(whatsappUrl, '_blank');
    });
  }

  /* --------------------------------------------------------------------------
     Theme Buttons Binding
     -------------------------------------------------------------------------- */
  function initThemeButtons() {
    const toggles = document.querySelectorAll('.theme-toggle-btn');
    toggles.forEach(function (btn) {
      btn.addEventListener('click', toggleTheme);
    });
  }

  /* --------------------------------------------------------------------------
     Mobile Navigation Drawer
     -------------------------------------------------------------------------- */
  function initMobileNav() {
    const menuBtn = document.querySelector('.menu-toggle-btn');
    const navLinks = document.querySelector('.nav-links');

    if (!menuBtn || !navLinks) return;

    function toggleMenu() {
      const isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', !isOpen);
      navLinks.classList.toggle('is-open', !isOpen);
    }

    function closeMenu() {
      menuBtn.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('is-open');
    }

    menuBtn.addEventListener('click', toggleMenu);

    // Close on navigation link click
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });

    // Close on click outside
    document.addEventListener('click', function (e) {
      if (!menuBtn.contains(e.target) && !navLinks.contains(e.target) && navLinks.classList.contains('is-open')) {
        closeMenu();
      }
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && navLinks.classList.contains('is-open')) {
        closeMenu();
      }
    });
  }

  /* --------------------------------------------------------------------------
     Scroll Reveals via IntersectionObserver (Single-fire, 0 scroll lag)
     -------------------------------------------------------------------------- */
  function initScrollReveals() {
    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const revealElements = document.querySelectorAll('.reveal');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    const observer = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            obs.unobserve(entry.target); // Unobserve immediately to free memory
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* --------------------------------------------------------------------------
     3. LIGHTBOX MODAL (Accessible, Hardware-Accelerated, Keyboard Arrows)
     -------------------------------------------------------------------------- */
  let currentGalleryImages = [];
  let currentImageIndex = -1;

  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;

    // Collect all gallery items on this page
    const galleryImgs = document.querySelectorAll('.gallery img, .gallery-item img');
    currentGalleryImages = Array.from(galleryImgs).map(function (img) {
      return {
        src: img.getAttribute('src'),
        alt: img.getAttribute('alt') || 'School Gallery Photo'
      };
    });

    galleryImgs.forEach(function (img, idx) {
      img.style.cursor = 'pointer';
      img.addEventListener('click', function () {
        openLightboxIndex(idx);
      });
    });

    // Close button
    const closeBtn = lightbox.querySelector('.close, .lightbox-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        closeLightbox();
      });
    }

    // Prev / Next button bindings
    const prevBtn = lightbox.querySelector('.lightbox-prev-btn');
    const nextBtn = lightbox.querySelector('.lightbox-next-btn');

    if (prevBtn) {
      prevBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        navigateLightbox(-1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        navigateLightbox(1);
      });
    }

    // Click outside image closes lightbox
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop')) {
        closeLightbox();
      }
    });

    // Keyboard navigation
    document.addEventListener('keydown', function (e) {
      if (!lightbox.classList.contains('is-active') && lightbox.style.display !== 'flex' && lightbox.style.display !== 'block') {
        return;
      }
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        navigateLightbox(-1);
      } else if (e.key === 'ArrowRight') {
        navigateLightbox(1);
      }
    });
  }

  function openLightboxIndex(index) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const caption = document.getElementById('lightbox-caption');

    if (!lightbox || !lightboxImg || !currentGalleryImages[index]) return;

    currentImageIndex = index;
    const item = currentGalleryImages[index];

    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;

    if (caption) {
      caption.textContent = `${item.alt} (${index + 1} of ${currentGalleryImages.length})`;
    }

    lightbox.classList.add('is-active');
    lightbox.style.display = 'flex';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
  }

  function navigateLightbox(direction) {
    if (currentGalleryImages.length <= 1) return;
    let nextIndex = currentImageIndex + direction;
    if (nextIndex < 0) nextIndex = currentGalleryImages.length - 1;
    if (nextIndex >= currentGalleryImages.length) nextIndex = 0;
    openLightboxIndex(nextIndex);
  }

  function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox) return;
    lightbox.classList.remove('is-active');
    lightbox.style.display = 'none';
    document.body.style.overflow = '';
  }

  // Export backwards-compatible global functions
  window.openImage = function (src) {
    const index = currentGalleryImages.findIndex(function (item) {
      return item.src === src;
    });
    if (index !== -1) {
      openLightboxIndex(index);
    } else {
      const lightbox = document.getElementById('lightbox');
      const lightboxImg = document.getElementById('lightbox-img');
      if (lightbox && lightboxImg) {
        lightboxImg.src = src;
        lightbox.classList.add('is-active');
        lightbox.style.display = 'flex';
        document.body.style.overflow = 'hidden';
      }
    }
  };

  window.closeImage = closeLightbox;

  /* --------------------------------------------------------------------------
     4. VIDEO FULLSCREEN INTERACTION
     -------------------------------------------------------------------------- */
  window.openFullscreen = function (video) {
    if (!video) return;
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  };

  window.closeFullscreen = function () {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
  };

  /* --------------------------------------------------------------------------
     5. HERO BANNER ROTATION (For schoolGallery.html & Hub pages)
     -------------------------------------------------------------------------- */
  function initHeroRotation() {
    const randomChange = document.getElementById('randomChange');
    if (!randomChange) return;

    const images = [
      '../images/pic1.jpg',
      '../images/pic2.jpg',
      '../images/pic3.jpg',
      '../images/pic4.jpeg',
      '../images/pic5.jpg'
    ];

    const randomIndex = Math.floor(Math.random() * images.length);
    randomChange.style.backgroundImage = 'url("' + images[randomIndex] + '")';
  }

})();