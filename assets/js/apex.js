/* ApexSites — progressive enhancement.
   All content renders server-side (static HTML); this only adds interactivity.
   No dependencies, no CDN, deferred. Safe if it fails: content stays visible. */
(function () {
  'use strict';
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function ready(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
  }

  // ---- Mobile nav toggle --------------------------------------------------
  function initNav() {
    var burger = document.querySelector('[data-nav-toggle]');
    var panel = document.querySelector('[data-nav-panel]');
    if (!burger || !panel) return;
    burger.addEventListener('click', function () {
      var open = panel.hasAttribute('hidden');
      if (open) { panel.removeAttribute('hidden'); burger.setAttribute('aria-expanded', 'true'); }
      else { panel.setAttribute('hidden', ''); burger.setAttribute('aria-expanded', 'false'); }
    });
  }

  // ---- FAQ accordions -----------------------------------------------------
  // Each FAQ item = a container holding a <button> (the question) and a
  // sibling [data-faq-panel] (the answer). First item starts open; the rest
  // collapse. Buttons carry [data-faq-toggle].
  function initFaq() {
    var panels = document.querySelectorAll('[data-faq-panel]');
    panels.forEach(function (panel, i) {
      var item = panel.parentElement;
      var btn = item.querySelector('[data-faq-toggle], button');
      var icon = btn ? btn.querySelector('span[aria-hidden="true"], span[style*="rotate"]') : null;
      var open = i === 0; // matches server default (first open)
      function set(state) {
        open = state;
        panel.style.display = open ? '' : 'none';
        if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
        if (icon) icon.style.transform = open ? 'rotate(45deg)' : 'rotate(0deg)';
      }
      set(open);
      if (btn) btn.addEventListener('click', function () { set(!open); });
    });
  }

  // ---- Filter tabs --------------------------------------------------------
  // A tab bar of [data-filter="Label"] buttons controls a set of [data-cat] cards.
  // Server renders all cards; we show/hide by category. Fully deterministic.
  function initFilters() {
    var bars = [];
    document.querySelectorAll('[data-filter]').forEach(function (tab) {
      var bar = tab.parentElement;
      if (bars.indexOf(bar) === -1) bars.push(bar);
    });
    bars.forEach(function (bar) {
      var tabs = Array.prototype.slice.call(bar.querySelectorAll('[data-filter]'));
      // Collect [data-cat] cards and group them by their parent container.
      // The bar controls ONE feed — the group with the most cards. This avoids
      // filtering unrelated tagged elements (featured items, galleries).
      var all = Array.prototype.slice.call(document.querySelectorAll('[data-cat]'));
      if (!all.length) return;
      var byParent = new Map();
      all.forEach(function (c) {
        var p = c.parentElement;
        if (!byParent.has(p)) byParent.set(p, []);
        byParent.get(p).push(c);
      });
      var cards = [];
      byParent.forEach(function (list) { if (list.length > cards.length) cards = list; });
      if (!cards.length) return;

      function activate(label) {
        var want = (label || 'All').toLowerCase();
        tabs.forEach(function (t) {
          styleTab(t, t.getAttribute('data-filter').toLowerCase() === want);
        });
        cards.forEach(function (c) {
          var cat = (c.getAttribute('data-cat') || '').toLowerCase();
          c.style.display = (want === 'all' || cat === want) ? '' : 'none';
        });
      }
      tabs.forEach(function (t) {
        t.addEventListener('click', function () { activate(t.getAttribute('data-filter')); });
      });
      activate('All');
    });
  }

  function styleTab(t, on) {
    if (on) {
      t.style.background = '#D7FF00'; t.style.color = '#0B0F0A';
      t.style.border = '1px solid #D7FF00';
    } else {
      t.style.background = 'rgba(255,255,255,0.04)'; t.style.color = '#C7CEC1';
      t.style.border = '1px solid rgba(255,255,255,0.1)';
    }
  }

  // ---- Examples modal -----------------------------------------------------
  function initModal() {
    var overlay = document.querySelector('[data-modal-overlay]');
    if (!overlay) return;
    var iframe = overlay.querySelector('iframe');
    var titleEl = overlay.querySelector('span');
    function open(url, title) {
      if (iframe) iframe.setAttribute('src', url);
      if (titleEl && title) titleEl.textContent = title;
      overlay.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    }
    function close() {
      overlay.setAttribute('hidden', '');
      if (iframe) iframe.setAttribute('src', 'about:blank');
      document.body.style.overflow = '';
    }
    document.querySelectorAll('[data-modal-url]').forEach(function (el) {
      el.style.cursor = 'pointer';
      el.addEventListener('click', function () {
        open(el.getAttribute('data-modal-url'), el.getAttribute('data-modal-title') || '');
      });
    });
    overlay.querySelectorAll('[data-modal-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    overlay.addEventListener('click', function (e) { if (e.target === overlay) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
  }

  // ---- Forms (demo success) ----------------------------------------------
  function initForms() {
    document.querySelectorAll('form[data-form-enhance]').forEach(function (form) {
      // The success block may be nested inside the form; move it to be a sibling
      // right after the form so hiding the form doesn't also hide the message.
      var success = form.querySelector('[data-form-success]');
      if (success && form.parentNode) {
        form.parentNode.insertBefore(success, form.nextSibling);
      } else if (!success) {
        var scope = form.closest('section') || form.parentElement;
        success = scope ? scope.querySelector('[data-form-success]') : null;
      }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (success) { success.removeAttribute('hidden'); form.style.display = 'none'; }
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'Lead', form: form.getAttribute('name') || 'form' });
        } catch (err) {}
      });
    });
  }

  // ---- CTA tracking hooks -------------------------------------------------
  function initTracking() {
    document.querySelectorAll('[data-track-cta]').forEach(function (el) {
      el.addEventListener('click', function () {
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: 'CTA_Click', cta: (el.textContent || '').trim(), location: 'nav' });
        } catch (e) {}
      });
    });
    document.querySelectorAll('[data-track]').forEach(function (el) {
      el.addEventListener('click', function () {
        try {
          window.dataLayer = window.dataLayer || [];
          window.dataLayer.push({ event: el.getAttribute('data-track') || 'CTA_Click', cta: el.getAttribute('data-track-cta') || (el.textContent || '').trim() });
        } catch (e) {}
      });
    });
  }

  // ---- Homepage generation demo -------------------------------------------
  // Server renders the demo at its first step; if motion is allowed, cycle the
  // step checklist so it feels live. Purely cosmetic — degrades to static.
  function initDemo() {
    var list = document.querySelector('[data-demo-steps]');
    if (!list || reduce) return;
    var steps = Array.prototype.slice.call(list.querySelectorAll('[data-demo-step]'));
    if (!steps.length) return;
    var i = 0;
    setInterval(function () {
      i = (i + 1) % (steps.length + 2);
      steps.forEach(function (s, idx) {
        var dot = s.querySelector('[data-demo-dot]');
        if (idx < i) { s.style.opacity = '1'; if (dot) { dot.textContent = '\u2713'; dot.style.background = '#D7FF00'; dot.style.color = '#0B0F0A'; } }
        else { s.style.opacity = idx === i ? '1' : '0.5'; }
      });
    }, 950);
  }

  // ---- Brightline testimonial carousel (standalone example) ---------------
  function initCarousel() {
    var track = document.querySelector('[data-carousel]');
    if (!track) return; // most pages don't have one
  }

  // ---- Onload promo popup --------------------------------------------------
  // A single small popup (smaller than the viewport, so it visually reads as
  // a popup and not a full takeover) that appears automatically once per page
  // load. Closable via the × button, the "Maybe later" link, clicking outside
  // the card, or Escape. No target url is embedded — it links out, since the
  // linked page (comingsoon.apexsites.ai) blocks being framed.
  function initOnloadPopup() {
    var overlay = document.querySelector('[data-onload-popup]');
    if (!overlay) return;
    var backdrop = overlay.querySelector('[data-popup-backdrop]');
    var shown = false;

    function close() {
      overlay.setAttribute('hidden', '');
      document.body.style.overflow = '';
    }
    function open() {
      if (shown) return;
      shown = true;
      overlay.removeAttribute('hidden');
      document.body.style.overflow = 'hidden';
    }

    overlay.querySelectorAll('[data-popup-close]').forEach(function (b) {
      b.addEventListener('click', close);
    });
    if (backdrop) {
      backdrop.addEventListener('click', function (e) {
        if (e.target === backdrop) close();
      });
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hasAttribute('hidden')) close();
    });

    // Fire after the page has finished loading (images etc.), with a short
    // delay so it doesn't compete with the initial paint.
    function schedule() { window.setTimeout(open, 800); }
    if (document.readyState === 'complete') schedule();
    else window.addEventListener('load', schedule);
  }

  ready(function () {
    try { initNav(); } catch (e) {}
    try { initFaq(); } catch (e) {}
    try { initFilters(); } catch (e) {}
    try { initModal(); } catch (e) {}
    try { initForms(); } catch (e) {}
    try { initTracking(); } catch (e) {}
    try { initDemo(); } catch (e) {}
    try { initCarousel(); } catch (e) {}
    try { initOnloadPopup(); } catch (e) {}
  });
})();
