(() => {
  'use strict';

  document.documentElement.classList.remove('no-js');
  document.documentElement.classList.add('js');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const onReady = (fn) => {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  };

  /* ============================================================
     0. CONFIG
     ============================================================ */
  
  const WEB3FORMS_ACCESS_KEY = '72a13fbc-5658-4d77-97a3-7f08688a3fee';
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';

  /* ============================================================
     1. PRELOADER
     ============================================================ */
  function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    const hide = () => {
      preloader.classList.add('done');
      setTimeout(() => { preloader.style.display = 'none'; }, 650);
      document.body.classList.remove('is-loading');
    };

    document.body.classList.add('is-loading');

    let loaded = false;
    window.addEventListener('load', () => {
      loaded = true;
      setTimeout(hide, 400);
    });
    setTimeout(() => { if (!loaded) hide(); }, 2200);
  }

  /* ============================================================
     2. CUSTOM CURSOR
     ============================================================ */
  function initCursor() {
    const dot = document.getElementById('cursor-dot');
    const outline = document.getElementById('cursor-outline');
    if (!dot || !outline || !isFinePointer) return;

    let mouseX = 0, mouseY = 0;
    let outlineX = 0, outlineY = 0;
    let rafId = null;
    let visible = false;

    const show = () => {
      if (visible) return;
      visible = true;
      dot.style.opacity = '1';
      outline.style.opacity = '1';
    };

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      show();
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
      if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    window.addEventListener('mouseleave', () => {
      visible = false;
      dot.style.opacity = '0';
      outline.style.opacity = '0';
    });

    function tick() {
      outlineX += (mouseX - outlineX) * 0.18;
      outlineY += (mouseY - outlineY) * 0.18;
      outline.style.left = outlineX + 'px';
      outline.style.top = outlineY + 'px';

      if (Math.abs(mouseX - outlineX) > 0.1 || Math.abs(mouseY - outlineY) > 0.1) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
      }
    }

    const hoverTargets = 'a, button, .tab-btn, input, textarea, select, [data-cursor-hover]';
    document.addEventListener('mouseover', (e) => {
      if (e.target.closest(hoverTargets)) outline.classList.add('hovered');
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest(hoverTargets)) outline.classList.remove('hovered');
    });

    document.addEventListener('mouseover', (e) => {
      if (e.target.closest('input, textarea, select')) {
        document.body.style.cursor = 'auto';
      }
    });
    document.addEventListener('mouseout', (e) => {
      if (e.target.closest('input, textarea, select')) {
        document.body.style.cursor = 'none';
      }
    });
  }

  /* ============================================================
     3. HEADER: scroll state + active link tracking
     ============================================================ */
  function initHeader() {
    const header = document.getElementById('header');
    if (!header) return;

    const setScrolled = () => {
      if (window.scrollY > 40) header.classList.add('scrolled');
      else header.classList.remove('scrolled');
    };
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    const sections = Array.from(document.querySelectorAll('section[id]'));
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    if (!sections.length || !navLinks.length) return;

    const linkFor = (id) => navLinks.find(a => a.getAttribute('href') === '#' + id);

    const observer = new IntersectionObserver((entries) => {
      let best = null;
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) best = entry;
        }
      });
      if (best) {
        const id = best.target.id;
        navLinks.forEach(a => a.classList.remove('active'));
        const link = linkFor(id);
        if (link) link.classList.add('active');
      }
    }, { rootMargin: '-30% 0px -55% 0px', threshold: [0, 0.25, 0.5, 0.75, 1] });

    sections.forEach(sec => observer.observe(sec));
  }

  /* ============================================================
     4. MOBILE NAV (hamburger)
     ============================================================ */
  function initMobileNav() {
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('navLinks');
  if (!hamburger || !navLinks) return;

  let savedScrollY = 0;

  const closeMenu = () => {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');

    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.width = '';
    window.scrollTo(0, savedScrollY);
  };

  const openMenu = () => {
    savedScrollY = window.scrollY;

    hamburger.classList.add('open');
    navLinks.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');

    document.body.style.position = 'fixed';
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
  };

  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'navLinks');

  hamburger.addEventListener('click', () => {
    const isOpen = navLinks.classList.contains('open');
    isOpen ? closeMenu() : openMenu();
  });

  navLinks.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) closeMenu();
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768 && navLinks.classList.contains('open')) closeMenu();
  });
}

  /* ============================================================
     5. SCROLL REVEAL ANIMATIONS  [data-reveal]
     ============================================================ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;

    if (prefersReducedMotion) {
      targets.forEach(t => t.classList.add('revealed'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    targets.forEach(t => observer.observe(t));
  }

  /* ============================================================
     6. HERO STAT COUNTERS  [data-target]
     ============================================================ */
  function initStatCounters() {
    const counters = document.querySelectorAll('.stat-num[data-target]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10) || 0;
      if (prefersReducedMotion) {
        el.textContent = target.toLocaleString();
        return;
      }
      const duration = 1600;
      const start = performance.now();
      const startVal = 0;

      const easeOutExpo = (t) => (t === 1 ? 1 : 1 - Math.pow(2, -10 * t));

      function frame(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = easeOutExpo(progress);
        const value = Math.round(startVal + (target - startVal) * eased);
        el.textContent = value.toLocaleString();
        if (progress < 1) requestAnimationFrame(frame);
        else el.textContent = target.toLocaleString();
      }
      requestAnimationFrame(frame);
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(c => observer.observe(c));
  }

  /* ============================================================
     7. SERVICES TABS
     ============================================================ */
  function initServiceTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn[data-tab]');
    const tabPanels = document.querySelectorAll('.tab-content');
    if (!tabButtons.length || !tabPanels.length) return;

    const activate = (key, { focusPanel = false, updateHash = true } = {}) => {
      tabButtons.forEach(btn => {
        const isMatch = btn.getAttribute('data-tab') === key;
        btn.classList.toggle('active', isMatch);
        btn.setAttribute('aria-selected', String(isMatch));
        btn.setAttribute('tabindex', isMatch ? '0' : '-1');
      });
      tabPanels.forEach(panel => {
        const isMatch = panel.id === 'tab-' + key;
        panel.classList.toggle('active', isMatch);
        if (isMatch) {
          panel.style.animation = 'none';
          panel.offsetHeight;
          panel.style.animation = '';
          if (focusPanel) panel.setAttribute('tabindex', '-1');
        }
      });
    };

    tabButtons.forEach((btn, i) => {
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', btn.classList.contains('active') ? 'true' : 'false');
      btn.setAttribute('tabindex', btn.classList.contains('active') ? '0' : '-1');

      btn.addEventListener('click', () => activate(btn.getAttribute('data-tab')));

      // Keyboard arrow navigation between tabs (standard tab-list pattern)
      btn.addEventListener('keydown', (e) => {
        const list = Array.from(tabButtons);
        let newIndex = null;
        if (e.key === 'ArrowRight') newIndex = (i + 1) % list.length;
        else if (e.key === 'ArrowLeft') newIndex = (i - 1 + list.length) % list.length;
        else if (e.key === 'Home') newIndex = 0;
        else if (e.key === 'End') newIndex = list.length - 1;
        if (newIndex !== null) {
          e.preventDefault();
          list[newIndex].focus();
          activate(list[newIndex].getAttribute('data-tab'));
        }
      });
    });

    tabPanels.forEach(panel => panel.setAttribute('role', 'tabpanel'));

    const tabsWrap = document.querySelector('.services-tabs');
    if (tabsWrap) tabsWrap.setAttribute('role', 'tablist');
  }

  /* ============================================================
     8. CONTACT FORM — validation + real submission (Web3Forms)
     ============================================================ */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    const successMsg = document.getElementById('formSuccess');
    const submitBtn = form.querySelector('button[type="submit"]');
    const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
    const btnLoading = submitBtn ? submitBtn.querySelector('.btn-loading') : null;

    const fields = {
      name: document.getElementById('fname'),
      phone: document.getElementById('fphone'),
      email: document.getElementById('femail'),
      service: document.getElementById('fservice'),
      message: document.getElementById('fmessage'),
    };

    // Ensure each field has an inline error slot
    Object.values(fields).forEach(field => {
      if (!field) return;
      const group = field.closest('.form-group');
      if (group && !group.querySelector('.form-error')) {
        const err = document.createElement('span');
        err.className = 'form-error';
        err.setAttribute('role', 'alert');
        group.appendChild(err);
      }
    });

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Please enter your full name.',
      phone: (v) => /^[+]?[\d\s-]{7,15}$/.test(v.trim()) || 'Please enter a valid phone number.',
      email: (v) => v.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email address.',
      service: (v) => v.trim() !== '' || 'Please select a service.',
      message: (v) => v.trim().length >= 10 || 'Please tell us a bit more (10+ characters).',
    };

    function setFieldError(field, message) {
      const group = field.closest('.form-group');
      if (!group) return;
      const errEl = group.querySelector('.form-error');
      if (message) {
        group.classList.add('error');
        if (errEl) errEl.textContent = message;
        field.setAttribute('aria-invalid', 'true');
      } else {
        group.classList.remove('error');
        if (errEl) errEl.textContent = '';
        field.removeAttribute('aria-invalid');
      }
    }

    function validateField(key) {
      const field = fields[key];
      if (!field) return true;
      const result = validators[key](field.value);
      if (result === true) {
        setFieldError(field, '');
        return true;
      }
      setFieldError(field, result);
      return false;
    }

    // Live validation on blur, clear error on input
    Object.entries(fields).forEach(([key, field]) => {
      if (!field) return;
      field.addEventListener('blur', () => validateField(key));
      field.addEventListener('input', () => {
        const group = field.closest('.form-group');
        if (group && group.classList.contains('error')) validateField(key);
      });
      field.addEventListener('change', () => validateField(key));
    });

    function setLoading(isLoading) {
      if (!submitBtn) return;
      submitBtn.disabled = isLoading;
      submitBtn.setAttribute('aria-busy', String(isLoading));
      if (btnText) btnText.style.display = isLoading ? 'none' : '';
      if (btnLoading) btnLoading.style.display = isLoading ? '' : 'none';
    }

    // One shared error slot for submit-level failures (network, API key,
    // etc.) as opposed to per-field validation errors above.
    function setFormError(message) {
      let el = form.querySelector('.form-submit-error');
      if (!message) {
        if (el) el.style.display = 'none';
        return;
      }
      if (!el) {
        el = document.createElement('p');
        el.className = 'form-submit-error';
        el.setAttribute('role', 'alert');
        el.style.color = 'var(--red, #c00)';
        el.style.fontSize = '13px';
        el.style.fontWeight = '600';
        el.style.marginTop = '12px';
        form.insertBefore(el, submitBtn.nextSibling);
      }
      el.textContent = message;
      el.style.display = 'block';
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const keysToValidate = Object.keys(fields);
      const results = keysToValidate.map(validateField);
      const isValid = results.every(Boolean);

      if (!isValid) {
        // Focus first invalid field for accessibility
        const firstInvalidKey = keysToValidate[results.findIndex(r => !r)];
        const firstInvalidField = fields[firstInvalidKey];
        if (firstInvalidField) firstInvalidField.focus();
        showToast('Please fix the highlighted fields.');
        return;
      }

      if (successMsg) successMsg.style.display = 'none';
      setFormError('');
      setLoading(true);

      const payload = {
        name: fields.name.value.trim(),
        phone: fields.phone.value.trim(),
        email: fields.email.value.trim(),
        service: fields.service.options[fields.service.selectedIndex]?.text || fields.service.value,
        message: fields.message.value.trim(),
      };

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `New Enquiry — ${payload.service} (Trynet website)`,
            from_name: 'Trynet Website',
            name: payload.name,
            phone: payload.phone,
            email: payload.email || 'Not provided',
            service: payload.service,
            message: payload.message,
            // Used by Web3Forms to reply directly to the visitor if they gave one
            replyto: payload.email || undefined,
          }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
          throw new Error(result.message || 'Submission failed. Please try again.');
        }

        form.reset();
        Object.values(fields).forEach(f => f && setFieldError(f, ''));
        if (successMsg) {
          successMsg.style.display = 'block';
          successMsg.setAttribute('role', 'status');
        }
        showToast('Thanks! We will reach out shortly.');
      } catch (err) {
        setFormError(
          'Sorry, something went wrong sending your message. Please call us at 9152 72 39 81 or try again.'
        );
        showToast('Could not send your message. Please try again.');
      } finally {
        setLoading(false);
      }
    });
  }

  /* ============================================================
     9. BACK TO TOP
     ============================================================ */
  function initBackToTop() {
    const btn = document.getElementById('backTop');
    if (!btn) return;

    const toggle = () => {
      if (window.scrollY > 500) btn.classList.add('visible');
      else btn.classList.remove('visible');
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });

    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     10. FOOTER YEAR
     ============================================================ */
  function initFooterYear() {
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ============================================================
     11. TOAST NOTIFICATIONS (created dynamically, no HTML edits)
     ============================================================ */
  let toastTimer = null;
  function showToast(message, duration = 3200) {
    let toast = document.getElementById('toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'toast';
      toast.setAttribute('role', 'status');
      toast.setAttribute('aria-live', 'polite');
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
  }
  // Expose for any future inline use
  window.__trynetToast = showToast;

  /* ============================================================
     12. COPY-TO-CLIPBOARD on phone/email links (nice-to-have UX)
     ============================================================ */
  function initCopyableContacts() {
    const candidates = document.querySelectorAll(
      '.contact-block a[href^="tel:"], .footer-contact-col a[href^="tel:"], .helpline-banner a[href^="tel:"], .footer-helpline a[href^="tel:"]'
    );
    candidates.forEach(link => {
      link.addEventListener('click', (e) => {
        const number = link.getAttribute('href').replace('tel:', '');
        if (navigator.clipboard && window.isSecureContext) {
          // Don't block the actual phone dial intent; just copy silently
          navigator.clipboard.writeText(number).then(() => {
            showToast('Number copied: ' + number);
          }).catch(() => {});
        }
      });
    });
  }

  /* ============================================================
     13. SMOOTH-SCROLL OFFSET SAFETY for in-page anchor links
     (CSS already sets scroll-padding-top; this guards older browsers
     and ensures the active hamburger menu closes before scrolling)
     ============================================================ */
  function initAnchorLinks() {
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (!targetId || targetId === '#') return;
        const target = document.querySelector(targetId);
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({
          behavior: prefersReducedMotion ? 'auto' : 'smooth',
          block: 'start',
        });
        // Keep the URL hash in sync without an extra jump
        if (history.pushState) history.pushState(null, '', targetId);
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */
  onReady(() => {
    initPreloader();
    initCursor();
    initHeader();
    initMobileNav();
    initScrollReveal();
    initStatCounters();
    initServiceTabs();
    initContactForm();
    initBackToTop();
    initFooterYear();
    initCopyableContacts();
    initAnchorLinks();
  });
})();

