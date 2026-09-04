/* ============================================================
   Lumière — Interaction & animation logic
   - Defensive: every null-checked
   - Respects prefers-reduced-motion (CSS handles it; JS guards it)
   ============================================================ */
(function () {
  'use strict';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Preloader ---- */
  const pl = document.getElementById('preloader');
  const heroImg = document.getElementById('heroImg');
  const heroImgTag = heroImg ? heroImg.querySelector('img') : null;

  function hidePreloader() {
    if (!pl) return;
    pl.classList.add('hidden');
    setTimeout(function () { if (pl && pl.parentNode) pl.parentNode.removeChild(pl); }, 1000);
  }

  if (heroImgTag) {
    if (heroImgTag.complete) {
      heroImg.classList.add('is-loaded');
    } else {
      heroImgTag.addEventListener('load', function () { heroImg.classList.add('is-loaded'); });
      heroImgTag.addEventListener('error', function () {
        // graceful fallback: tint the section
        heroImg.style.background = 'linear-gradient(135deg, #C8B89E, #8DA48E)';
        heroImg.style.opacity = '0.4';
      });
    }
  }

  window.addEventListener('load', function () {
    setTimeout(hidePreloader, reduce ? 0 : 1200);
  });
  // Failsafe: never block more than 3s
  setTimeout(hidePreloader, 3000);

  /* ---- Nav scrolled state ---- */
  const nav = document.getElementById('nav');
  function onScroll() {
    if (!nav) return;
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Reveal on scroll ---- */
  const reveals = document.querySelectorAll('.reveal, .reveal-img, .reveal-fade, .reveal-stagger');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.05, rootMargin: '0px 0px 120px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---- Counters ---- */
  const counters = document.querySelectorAll('[data-count]');
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    if (isNaN(target)) return;
    const duration = 1600;
    const start = performance.now();
    const unit = el.querySelector('.unit');
    const unitHTML = unit ? unit.outerHTML : '';
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      // ease-out-quart
      const eased = 1 - Math.pow(1 - t, 4);
      const v = Math.round(eased * target);
      el.innerHTML = v + unitHTML;
      if (t < 1) requestAnimationFrame(step);
      else el.innerHTML = target + unitHTML;
    }
    requestAnimationFrame(step);
  }
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          animateCount(e.target);
          co.unobserve(e.target);
        }
      });
    }, { threshold: 0.4 });
    counters.forEach(function (el) { co.observe(el); });
  } else {
    counters.forEach(function (el) {
      const u = el.querySelector('.unit');
      const uh = u ? u.outerHTML : '';
      el.innerHTML = el.getAttribute('data-count') + uh;
    });
  }

  /* ---- Smooth anchor scroll with nav offset ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      const id = a.getAttribute('href');
      if (!id || id === '#' || id.length < 2) return;
      const t = document.querySelector(id);
      if (!t) return;
      e.preventDefault();
      const y = t.getBoundingClientRect().top + window.scrollY - 70;
      window.scrollTo({ top: y, behavior: reduce ? 'auto' : 'smooth' });
    });
  });

  /* ---- Image fallback: replace broken Unsplash with neutral gradient ---- */
  document.querySelectorAll('img').forEach(function (img) {
    img.addEventListener('error', function () {
      const w = img.width || 800;
      const h = img.height || 600;
      const svg = "data:image/svg+xml;utf8," + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w + ' ' + h + '">' +
        '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
        '<stop offset="0%" stop-color="#E5DED2"/><stop offset="100%" stop-color="#C8B89E"/></linearGradient></defs>' +
        '<rect width="100%" height="100%" fill="url(#g)"/>' +
        '<g fill="none" stroke="#948D83" stroke-width="1" opacity="0.4">' +
        '<path d="M0 ' + (h*0.7) + ' L' + (w*0.3) + ' ' + (h*0.5) + ' L' + (w*0.55) + ' ' + (h*0.6) + ' L' + (w*0.8) + ' ' + (h*0.45) + ' L' + w + ' ' + (h*0.6) + '"/>' +
        '<circle cx="' + (w*0.7) + '" cy="' + (h*0.3) + '" r="' + (Math.min(w,h)*0.05) + '"/>' +
        '</g></svg>'
      );
      img.src = svg;
      img.style.objectFit = 'cover';
    }, { once: true });
  });
})();

/* ---- Booking submit ---- */
function handleBooking(form) {
  try {
    const btn = form.querySelector('.submit');
    if (btn) {
      btn.textContent = '✓ Request received — we will call within 30 minutes';
      btn.style.background = '#8DA48E';
      btn.style.color = '#1A1814';
      btn.disabled = true;
    }
  } catch (e) { /* noop */ }
}