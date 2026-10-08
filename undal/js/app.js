/* ==========================================================================
   UNDAL — menu portfolio interactions
   Filtering · live search · veg-only · scrollspy chips · reveal · modal · totop
   ========================================================================== */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));

  /* ---------- year ---------- */
  $('#y').textContent = new Date().getFullYear();

  /* ---------- collect dishes ---------- */
  const dishes = $$('.dish').map((el) => ({
    el,
    cat: el.dataset.cat,
    name: el.dataset.name,
    veg: !!$('.badge-veg', el)
  }));
  const sections = $$('.cat');
  const chips = $$('.chip');

  /* ---------- state ---------- */
  let filter = 'all';
  let query = '';
  let vegOnly = false;

  function apply() {
    let visible = 0;
    dishes.forEach((d) => {
      const ok =
        (filter === 'all' || d.cat === filter) &&
        (!vegOnly || d.veg) &&
        (!query || d.name.includes(query) || d.el.querySelector('.dish-desc').textContent.toLowerCase().includes(query));
      d.el.classList.toggle('hide', !ok);
      if (ok) visible++;
    });
    // hide empty sections
    sections.forEach((sec) => {
      const any = $$('.dish', sec).some((d) => !d.classList.contains('hide'));
      sec.hidden = !any;
    });
    $('#empty').hidden = visible !== 0;
    $('#empty-q').textContent = query;
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      chips.forEach((c) => { c.classList.remove('active'); c.setAttribute('aria-pressed', 'false'); });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      filter = chip.dataset.filter;
      apply();
      if (filter !== 'all') {
        const sec = $('#cat-' + filter);
        if (sec) sec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  const q = $('#q');
  q.addEventListener('input', () => { query = q.value.trim().toLowerCase(); apply(); });
  $('#clear-q').addEventListener('click', () => { q.value = ''; query = ''; apply(); q.focus(); });
  $('#vegOnly').addEventListener('change', (e) => { vegOnly = e.target.checked; apply(); });

  // "/" focuses search
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== q) { e.preventDefault(); q.focus(); }
    if (e.key === 'Escape') closeModal();
  });

  /* ---------- scrollspy for chips ---------- */
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) {
        const id = en.target.dataset.cat;
        chips.forEach((c) => c.classList.toggle('active', c.dataset.filter === id));
        const active = chips.find((c) => c.dataset.filter === id);
        if (active) active.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      }
    });
  }, { rootMargin: '-40% 0px -55% 0px' });
  sections.forEach((s) => spy.observe(s));

  /* ---------- reveal on scroll ---------- */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (!reduce && 'IntersectionObserver' in window) {
    const rev = new IntersectionObserver((ens) => {
      ens.forEach((en) => {
        if (en.isIntersecting) { en.target.classList.add('in'); rev.unobserve(en.target); }
      });
    }, { threshold: 0.08 });
    dishes.forEach((d, i) => {
      d.el.style.transitionDelay = Math.min(i % 8, 5) * 60 + 'ms';
      rev.observe(d.el);
    });
  } else {
    dishes.forEach((d) => d.el.classList.add('in'));
  }

  /* ---------- hero counters ---------- */
  $$('[data-count]').forEach((el) => {
    const target = +el.dataset.count;
    if (reduce) { el.textContent = target; return; }
    let start = null;
    function step(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / 1200, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });

  /* ---------- modal ---------- */
  const modal = $('#modal');
  let lastFocus = null;
  function openModal(d) {
    lastFocus = document.activeElement;
    $('#m-img').src = $('.dish-media img', d.el).src;
    $('#m-img').alt = $('.dish-media img', d.el).alt;
    $('#m-name').textContent = $('.dish-name', d.el).textContent;
    $('#m-desc').textContent = $('.dish-desc', d.el).textContent;
    $('#m-price').textContent = $('.now', d.el).textContent.trim();
    $('#m-was').textContent = $('.was', d.el).textContent;
    $('#m-save').textContent = $('.dish-save', d.el).textContent;
    $('#m-tags').innerHTML = $('.dish-tags', d.el) ? $('.dish-tags', d.el).innerHTML : '';
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.modal-x').focus();
  }
  function closeModal() {
    if (modal.hidden) return;
    modal.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
  }
  dishes.forEach((d) => {
    d.el.addEventListener('click', (e) => {
      if (e.target.closest('.dish-order')) return; // let order link work
      openModal(d);
    });
  });
  modal.addEventListener('click', (e) => { if (e.target.closest('[data-close]')) closeModal(); });

  /* ---------- back to top ---------- */
  const totop = $('#totop');
  addEventListener('scroll', () => totop.classList.toggle('show', scrollY > 600), { passive: true });
  totop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
})();
