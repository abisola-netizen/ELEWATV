/* ELEWA TV — shared site script */
(function () {
  'use strict';

  var WHATSAPP = '254111861987';   /* 0111 861 987 in international format */
  var EMAIL = 'Info@elewatv.com';

  /* ================= GOOGLE FORM (optional) =================
     Leave actionUrl empty and enquiries open WhatsApp with the details
     filled in. To collect them in a Google Form instead:
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
     Deters casual copying of images and text; it cannot stop screenshots
     or view-source. */
  document.addEventListener('contextmenu', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
  document.addEventListener('dragstart', function (e) { if (e.target.tagName === 'IMG') e.preventDefault(); });
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
    var text = 'Hello ELEWA TV, I\'d like to enquire.\n\n' +
      'Name: ' + f.name + '\nBusiness: ' + f.business + '\nContact: ' + f.contact +
      '\nInterested in: ' + f.interest + '\nSector: ' + f.sector + '\nWebsite/Instagram: ' + f.handle +
      '\n\nWhat I\'d like to achieve:\n' + f.message;
    window.open('https://wa.me/' + WHATSAPP + '?text=' + encodeURIComponent(text), '_blank');
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
