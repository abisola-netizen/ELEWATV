/* ELEWA TV — shared site script */
(function () {
  'use strict';

  var EMAIL = 'Info@elewatv.com';

  /* ================= GOOGLE FORM (optional) =================
     Leave actionUrl empty and enquiries open the visitor's email app with
     the details filled in, addressed to Info@elewatv.com. To collect them in a Google Form instead:
     1. Make the form, open it, 3-dot menu -> "Get pre-filled link".
     2. Fill dummy answers, "Get link"; each field shows as entry.XXXXXXXXX.
     3. Paste the form URL below with "viewform" swapped for "formResponse",
        and replace each entry ID. */
  var GOOGLE_FORMS = {
    enquiry: {
      actionUrl: '',
      entries: { name: 'entry.111111111', business: 'entry.222222222', contact: 'entry.333333333',
                 interest: 'entry.444444444', sector: 'entry.555555555', handle: 'entry.666666666', message: 'entry.777777777' }
    },
    fund: {
      actionUrl: '',
      entries: { name: 'entry.111111111', email: 'entry.222222222', projectTitle: 'entry.333333333',
                 format: 'entry.444444444', synopsis: 'entry.555555555', stage: 'entry.666666666' }
    }
  };

  /* ================= CONTENT PROTECTION =================
     Blocks right-click, text selection, copying, dragging images, saving,
     printing and view-source shortcuts. Nothing on a public website can stop
     screenshots or a determined person, but this stops casual copying. */
  function isField(el) { return el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable); }
  document.addEventListener('contextmenu', function (e) { if (!isField(e.target)) e.preventDefault(); });
  ['copy', 'cut'].forEach(function (ev) {
    document.addEventListener(ev, function (e) {
      if (isField(e.target)) return;
      e.preventDefault();
      if (e.clipboardData) e.clipboardData.setData('text/plain', '\u00a9 ELEWA TV \u2014 elewatv.com');
    });
  });
  document.addEventListener('selectstart', function (e) { if (!isField(e.target)) e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG' || e.target.tagName === 'A') e.preventDefault(); });
  document.addEventListener('keydown', function (e) {
    var k = (e.key || '').toLowerCase();
    var mod = e.ctrlKey || e.metaKey;
    if (e.key === 'F12' ||
        (mod && ['s', 'u', 'p'].indexOf(k) !== -1) ||
        (mod && e.shiftKey && ['i', 'j', 'c'].indexOf(k) !== -1) ||
        (mod && e.altKey && ['i', 'j', 'c', 'u'].indexOf(k) !== -1) ||
        (mod && ['c', 'x', 'a'].indexOf(k) !== -1 && !isField(e.target))) {
      e.preventDefault();
    }
  });
  Array.prototype.forEach.call(document.querySelectorAll('img'), function (img) { img.setAttribute('draggable', 'false'); });

  /* ================= NAV ================= */
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    Array.prototype.forEach.call(links.querySelectorAll('a'), function (a) {
      a.addEventListener('click', function () { links.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); });
    });
  }

  /* ================= TICKER (duplicated for a seamless loop) ================= */
  var track = document.querySelector('.ticker-track');
  if (track) track.innerHTML += track.innerHTML;

  /* ================= VIDEOS ================= */
  var modal = document.getElementById('videoModal');
  var frame = modal ? modal.querySelector('.frame') : null;
  function openVideo(id) {
    if (!modal || !frame) { window.open('https://www.youtube.com/watch?v=' + id, '_blank'); return; }
    frame.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + id +
      '?rel=0&modestbranding=1&autoplay=1" title="ELEWA TV video" allow="accelerometer; autoplay; clipboard-write; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    modal.classList.add('open');
  }
  function closeVideo() { if (modal) { modal.classList.remove('open'); if (frame) frame.innerHTML = ''; } }
  Array.prototype.forEach.call(document.querySelectorAll('[data-video]'), function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); openVideo(el.getAttribute('data-video')); });
  });
  if (modal) {
    modal.addEventListener('click', function (e) { if (e.target === modal) closeVideo(); });
    var vc = modal.querySelector('.video-close');
    if (vc) vc.addEventListener('click', closeVideo);
  }

  /* ================= PRIVACY ================= */
  var privacy = document.getElementById('privacyModal');
  Array.prototype.forEach.call(document.querySelectorAll('[data-open-privacy]'), function (b) {
    b.addEventListener('click', function () { if (privacy) privacy.classList.add('open'); });
  });
  if (privacy) {
    privacy.addEventListener('click', function (e) { if (e.target === privacy || e.target.classList.contains('close')) privacy.classList.remove('open'); });
  }
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeVideo(); if (privacy) privacy.classList.remove('open'); }
  });

  /* ================= PARTNER FILTERS ================= */
  var filters = document.querySelectorAll('.partner-filters button');
  Array.prototype.forEach.call(filters, function (btn) {
    btn.addEventListener('click', function () {
      var f = btn.getAttribute('data-filter');
      Array.prototype.forEach.call(filters, function (b) { b.classList.toggle('on', b === btn); });
      Array.prototype.forEach.call(document.querySelectorAll('.partner'), function (p) {
        var types = p.getAttribute('data-type') || '';
        p.style.display = (f === 'all' || types.indexOf(f) !== -1) ? '' : 'none';
      });
    });
  });

  /* ================= FORMS ================= */
  function fieldsOf(form) {
    var out = {};
    Array.prototype.forEach.call(form.elements, function (el) { if (el.name) out[el.name] = el.value.trim(); });
    return out;
  }
  function sendToGoogle(cfg, fields) {
    var url = new URL(cfg.actionUrl);
    Object.keys(fields).forEach(function (k) { if (cfg.entries[k]) url.searchParams.append(cfg.entries[k], fields[k]); });
    return fetch(url.toString(), { method: 'POST', mode: 'no-cors' });
  }
  function done(form) {
    var ok = document.getElementById(form.getAttribute('data-success'));
    form.reset();
    if (ok) { ok.style.display = 'block'; ok.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }

  var enquiry = document.getElementById('enquiryForm');
  if (enquiry) enquiry.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = fieldsOf(enquiry);
    var cfg = GOOGLE_FORMS.enquiry;
    if (cfg.actionUrl) { sendToGoogle(cfg, f).then(function () { done(enquiry); }, function () { done(enquiry); }); return; }
    var body = 'Name: ' + f.name + '\nBusiness: ' + f.business + '\nEmail: ' + f.contact +
      '\nInterested in: ' + f.interest + '\nSector: ' + f.sector + '\nWebsite/Instagram: ' + f.handle +
      '\n\nWhat I\'d like to achieve:\n' + f.message;
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Enquiry from ' + (f.business || f.name)) +
      '&body=' + encodeURIComponent(body);
    done(enquiry);
  });

  var fund = document.getElementById('fundForm');
  if (fund) fund.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = fieldsOf(fund);
    var cfg = GOOGLE_FORMS.fund;
    if (cfg.actionUrl) { sendToGoogle(cfg, f).then(function () { done(fund); }, function () { done(fund); }); return; }
    var body = 'Name: ' + f.name + '\nEmail: ' + f.email + '\nProject title: ' + f.projectTitle +
      '\nFormat: ' + f.format + '\nStage: ' + f.stage + '\n\nSynopsis:\n' + f.synopsis;
    window.location.href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent('Film submission: ' + f.projectTitle) +
      '&body=' + encodeURIComponent(body);
    done(fund);
  });
})();

/* ================= MOTION =================
   Fades sections and cards up as they scroll into view. Skipped for
   visitors who ask their device for reduced motion. */
(function () {
  'use strict';
  var header = document.querySelector('.site-header');
  function onScroll() { if (header) header.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var root = document.documentElement;
  root.classList.add('motion');

  /* Single blocks that rise on their own */
  var singles = '.section .tag, .section .h2, .section .lead, .head-row, .strip, .community-grid, .films-band, .fund-left, .fund-right, .contact-inner > *, .cta-inner > *, .faq-inner > *, .band .h2, .band .tag, .partner-filters, .small-note';
  /* Groups whose children arrive one after another */
  var groups = '.tiles, .services, .partners, .packages, .video-grid';

  var items = [];
  Array.prototype.forEach.call(document.querySelectorAll(singles), function (el) {
    if (el.closest('.hero')) return;
    items.push(el);
  });
  Array.prototype.forEach.call(document.querySelectorAll(groups), function (g) {
    Array.prototype.forEach.call(g.children, function (child, i) {
      child.style.setProperty('--d', Math.min(i, 7) * 0.08 + 's');
      items.push(child);
    });
  });
  /* A heading's section block carries the "&" animation */
  Array.prototype.forEach.call(document.querySelectorAll('.h2'), function (h) { if (items.indexOf(h) === -1 && !h.closest('.hero')) items.push(h); });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  items.forEach(function (el) {
    el.classList.add('reveal');
    io.observe(el);
    /* Once a card has arrived, hand it back to its normal hover styles */
    if (el.parentElement && el.parentElement.matches(groups)) {
      el.addEventListener('transitionend', function done(ev) {
        if (ev.propertyName !== 'opacity' || !el.classList.contains('in')) return;
        el.removeEventListener('transitionend', done);
        el.classList.remove('reveal', 'in');
        el.style.removeProperty('--d');
      });
    }
  });

  /* Anything already on screen at load shows straight away */
  requestAnimationFrame(function () {
    items.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) el.classList.add('in');
    });
  });

  /* Partner filters hide cards with display:none; keep revealed state */
  Array.prototype.forEach.call(document.querySelectorAll('.partner-filters button'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('.partner'), function (p) { p.classList.add('in'); });
    });
  });
})();
