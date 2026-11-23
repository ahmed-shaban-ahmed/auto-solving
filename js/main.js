/* Auto Solving – main script (vanilla JS, no dependencies) */
(function () {
  'use strict';
  var root = document.documentElement;
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  /* ---------- i18n (Arabic is the default markup, English lives in data-en*) ---------- */
  var TITLES = {
    ar: 'Auto Solving | حلول برمجية ذكية ومؤتمتة',
    en: 'Auto Solving | Smart, Automated Software Solutions'
  };
  var textEls = document.querySelectorAll('[data-en]');
  var ariaEls = document.querySelectorAll('[data-en-aria-label]');
  var phEls = document.querySelectorAll('[data-en-placeholder]');
  textEls.forEach(function (el) { el.dataset.ar = el.innerHTML; });
  ariaEls.forEach(function (el) { el.dataset.arAriaLabel = el.getAttribute('aria-label') || ''; });
  phEls.forEach(function (el) { el.dataset.arPlaceholder = el.getAttribute('placeholder') || ''; });

  var langBtn = document.getElementById('lang-toggle');
  var currentLang = 'ar';

  function setLang(lang) {
    currentLang = lang;
    var en = lang === 'en';
    root.lang = lang;
    root.dir = en ? 'ltr' : 'rtl';
    textEls.forEach(function (el) { el.innerHTML = en ? el.dataset.en : el.dataset.ar; });
    ariaEls.forEach(function (el) { el.setAttribute('aria-label', en ? el.dataset.enAriaLabel : el.dataset.arAriaLabel); });
    phEls.forEach(function (el) { el.setAttribute('placeholder', en ? el.dataset.enPlaceholder : el.dataset.arPlaceholder); });
    langBtn.querySelector('.lang-label').textContent = en ? 'ع' : 'EN';
    document.title = TITLES[lang];
    // refresh visible validation messages
    document.querySelectorAll('.field.invalid .error').forEach(function (e) { e.textContent = e.dataset['msg' + (en ? 'En' : 'Ar')]; });
    store.set('as-lang', lang);
  }
  langBtn.addEventListener('click', function () { setLang(currentLang === 'ar' ? 'en' : 'ar'); });
  setLang(store.get('as-lang') === 'en' ? 'en' : 'ar');

  /* ---------- Theme ---------- */
  document.getElementById('theme-toggle').addEventListener('click', function () {
    var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    store.set('as-theme', next);
  });

  /* ---------- Header: scroll state + mobile menu ---------- */
  var header = document.querySelector('.site-header');
  var nav = document.getElementById('main-nav');
  var menuBtn = document.getElementById('menu-toggle');
  function onScroll() { header.classList.toggle('scrolled', window.scrollY > 10); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  function closeMenu() {
    nav.classList.remove('open');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  menuBtn.addEventListener('click', function () {
    var open = !nav.classList.contains('open');
    nav.classList.toggle('open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  nav.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeMenu); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', function () { if (window.innerWidth > 980) closeMenu(); });

  /* Active nav link */
  var links = nav.querySelectorAll('ul a');
  var sections = Array.prototype.map.call(links, function (a) { return document.querySelector(a.getAttribute('href')); });
  function updateActive() {
    var y = window.scrollY + window.innerHeight * 0.4, current = null;
    sections.forEach(function (sec) { if (sec && sec.offsetTop <= y) current = sec; });
    links.forEach(function (l) { l.classList.toggle('active', !!current && l.getAttribute('href') === '#' + current.id); });
  }
  window.addEventListener('scroll', updateActive, { passive: true });
  updateActive();

  /* ---------- Reveal on scroll + counters ---------- */
  function animateCounter(el) {
    var target = +el.dataset.target, start = null, dur = 1600;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var reveals = document.querySelectorAll('.reveal');
  var counters = document.querySelectorAll('.counter');
  if ('IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('visible');
        obs.unobserve(en.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el, i) {
      el.style.transitionDelay = ((i % 3) * 80) + 'ms';
      obs.observe(el);
    });
    var cObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        animateCounter(en.target);
        cObs.unobserve(en.target);
      });
    }, { threshold: 0.5 });
    counters.forEach(function (c) { cObs.observe(c); });
  } else {
    reveals.forEach(function (el) { el.classList.add('visible'); });
    counters.forEach(function (c) { c.textContent = c.dataset.target; });
  }

  /* ---------- Portfolio filter ---------- */
  var filterBtns = document.querySelectorAll('.filter');
  var projects = document.querySelectorAll('.project');
  filterBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.dataset.filter;
      filterBtns.forEach(function (b) {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-pressed', String(b === btn));
      });
      projects.forEach(function (p) {
        var show = f === 'all' || p.dataset.cat === f;
        p.classList.toggle('hide', !show);
        if (show) p.classList.add('visible');
      });
    });
  });

  /* ---------- Testimonials slider ---------- */
  var slides = document.querySelectorAll('.slide');
  var dotsWrap = document.getElementById('dots');
  var idx = 0, timer;
  slides.forEach(function (_, i) {
    var d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', String(i + 1));
    d.addEventListener('click', function () { go(i); restart(); });
    dotsWrap.appendChild(d);
  });
  var dots = dotsWrap.querySelectorAll('button');
  function go(i) {
    idx = (i + slides.length) % slides.length;
    slides.forEach(function (s, j) { s.classList.toggle('active', j === idx); s.setAttribute('aria-hidden', String(j !== idx)); });
    dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); d.setAttribute('aria-current', j === idx ? 'true' : 'false'); });
  }
  function restart() { clearInterval(timer); timer = setInterval(function () { go(idx + 1); }, 6000); }
  document.querySelector('.slide-next').addEventListener('click', function () { go(idx + 1); restart(); });
  document.querySelector('.slide-prev').addEventListener('click', function () { go(idx - 1); restart(); });
  var slider = document.querySelector('.slider');
  slider.addEventListener('mouseenter', function () { clearInterval(timer); });
  slider.addEventListener('mouseleave', restart);
  go(0); restart();

  /* ---------- FAQ accordion: one open at a time, smooth height via CSS grid rows ---------- */
  var faqs = document.querySelectorAll('.faq-item');
  function setFaq(item, open) {
    item.classList.toggle('open', open);
    item.querySelector('.faq-btn').setAttribute('aria-expanded', String(open));
  }
  faqs.forEach(function (item) {
    item.querySelector('.faq-btn').addEventListener('click', function () {
      var willOpen = !item.classList.contains('open');
      faqs.forEach(function (o) { if (o !== item) setFaq(o, false); });
      setFaq(item, willOpen);
    });
  });

  /* ---------- Contact form validation ---------- */
  var form = document.getElementById('contact-form');
  var success = document.getElementById('form-success');
  var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function validateField(input) {
    var field = input.closest('.field');
    var err = field.querySelector('.error');
    var v = input.value.trim();
    var ok = true;
    if (input.required && !v) ok = false;
    if (ok && input.type === 'email' && !emailRe.test(v)) ok = false;
    if (ok && input.minLength > 0 && v.length < input.minLength) ok = false;
    field.classList.toggle('invalid', !ok);
    input.setAttribute('aria-invalid', String(!ok));
    err.textContent = ok ? '' : err.dataset[currentLang === 'en' ? 'msgEn' : 'msgAr'];
    return ok;
  }
  var inputs = form.querySelectorAll('input, select, textarea');
  inputs.forEach(function (inp) {
    inp.addEventListener('blur', function () { if (inp.value) validateField(inp); });
    inp.addEventListener('input', function () { if (inp.closest('.field').classList.contains('invalid')) validateField(inp); });
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var allOk = true, firstBad = null;
    inputs.forEach(function (inp) { if (!validateField(inp)) { allOk = false; if (!firstBad) firstBad = inp; } });
    if (!allOk) { firstBad.focus(); success.hidden = true; return; }
    // NOTE: front-end only – send the data to your backend / form service here.
    success.hidden = false;
    form.reset();
  });

  document.getElementById('year').textContent = new Date().getFullYear();
})();
