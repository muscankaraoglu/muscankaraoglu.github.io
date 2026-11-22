(() => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* 1. Mobile Navigation Drawer */
  const menuToggle = document.getElementById('menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-drawer-link');

  function setDrawerOpen(open) {
    if (!menuToggle || !mobileDrawer) return;
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
    mobileDrawer.classList.toggle('is-open', open);
    mobileDrawer.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  if (menuToggle && mobileDrawer) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      setDrawerOpen(!isOpen);
    });

    mobileLinks.forEach((link) => {
      link.addEventListener('click', () => setDrawerOpen(false));
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mobileDrawer.classList.contains('is-open')) {
        setDrawerOpen(false);
        menuToggle.focus();
      }
    });
  }

  /* 2. Scroll Reveals (IntersectionObserver, once only) */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* 3. Active Navigation Indicator */
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const observedSections = document.querySelectorAll('section[id]');
  if ('IntersectionObserver' in window && navLinks.length && observedSections.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              const isMatch = link.getAttribute('data-section') === id;
              link.setAttribute('aria-current', isMatch ? 'true' : 'false');
            });
          }
        });
      },
      { rootMargin: '-35% 0px -55% 0px' }
    );
    observedSections.forEach((sec) => sectionObserver.observe(sec));
  }

  /* 4. Mandatory Tagline Word-by-Word Reveal (B11) */
  const taglineEl = document.getElementById('tagline-reveal');
  if (taglineEl) {
    const rawText = taglineEl.textContent.trim();
    const words = rawText.split(/\s+/);
    taglineEl.textContent = '';

    const wordSpans = words.map((word, idx) => {
      const span = document.createElement('span');
      span.className = 'tagline-word';
      span.textContent = idx < words.length - 1 ? `${word} ` : word;
      if (prefersReducedMotion) {
        span.classList.add('is-lit');
      }
      taglineEl.appendChild(span);
      return span;
    });

    if (!prefersReducedMotion) {
      let ticking = false;
      const updateTagline = () => {
        ticking = false;
        const rect = taglineEl.getBoundingClientRect();
        const vh = window.innerHeight || 800;
        const start = vh * 0.85;
        const end = vh * 0.25;
        const progress = Math.min(1, Math.max(0, (start - rect.top) / (start - end)));
        const litCount = Math.round(progress * wordSpans.length);
        wordSpans.forEach((span, i) => {
          span.classList.toggle('is-lit', i < litCount);
        });
      };

      const onScroll = () => {
        if (!ticking) {
          ticking = true;
          window.requestAnimationFrame(updateTagline);
        }
      };

      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('resize', onScroll, { passive: true });
      updateTagline();
    }
  }

  /* 5. Native Dialog Lightbox for Game Screenshots */
  const dialog = document.getElementById('lightbox-dialog');
  const dialogImg = document.getElementById('lightbox-img');
  const dialogTitle = document.getElementById('lightbox-title');
  const dialogClose = document.getElementById('lightbox-close');
  const triggers = document.querySelectorAll('[data-lightbox-src]');

  if (dialog && dialogImg && dialogTitle) {
    triggers.forEach((btn) => {
      btn.addEventListener('click', () => {
        dialogImg.src = btn.getAttribute('data-lightbox-src') || '';
        dialogImg.alt = btn.getAttribute('data-lightbox-alt') || '';
        dialogTitle.textContent = btn.getAttribute('data-lightbox-title') || '';
        if (typeof dialog.showModal === 'function') {
          dialog.showModal();
        }
      });
    });

    if (dialogClose) {
      dialogClose.addEventListener('click', () => dialog.close());
    }

    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        dialog.close();
      }
    });
  }
})();
