/*
 * Ownest — site-wide accessibility widget (Israeli Standard 5568 / WCAG 2.1 AA).
 * Loaded on every public page. Provides text resize, high-contrast, and
 * reduced-motion toggles, all keyboard-operable, with prefs persisted locally.
 */
(function () {
  'use strict';

  var STORE_KEY = 'ownest-a11y';
  var ZOOM_STEPS = [100, 115, 130, 150];
  var isHe = (document.documentElement.lang || '').toLowerCase().indexOf('he') === 0;

  var STR = isHe ? {
    toggle: 'אפשרויות נגישות',
    title: 'נגישות',
    bigger: 'הגדלת טקסט',
    smaller: 'הקטנת טקסט',
    reset: 'איפוס טקסט',
    contrast: 'ניגודיות גבוהה',
    motion: 'עצירת אנימציות',
    statement: 'הצהרת נגישות',
    close: 'סגירה'
  } : {
    toggle: 'Accessibility options',
    title: 'Accessibility',
    bigger: 'Increase text size',
    smaller: 'Decrease text size',
    reset: 'Reset text size',
    contrast: 'High contrast',
    motion: 'Stop animations',
    statement: 'Accessibility statement',
    close: 'Close'
  };

  function loadPrefs() {
    var p = { zoomIndex: 0, contrast: false, noMotion: false };
    try {
      var raw = localStorage.getItem(STORE_KEY);
      if (raw) {
        var saved = JSON.parse(raw);
        if (saved && typeof saved === 'object') {
          var zi = saved.zoomIndex;
          if (typeof zi === 'number' && zi >= 0 && zi < ZOOM_STEPS.length) p.zoomIndex = zi | 0;
          p.contrast = !!saved.contrast;
          p.noMotion = !!saved.noMotion;
        }
      }
    } catch (e) {}
    return p;
  }
  function savePrefs(p) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(p)); } catch (e) {}
  }

  var prefs = loadPrefs();

  function applyPrefs() {
    var html = document.documentElement;
    html.style.zoom = ZOOM_STEPS[prefs.zoomIndex] + '%';
    html.classList.toggle('ownest-a11y-contrast', !!prefs.contrast);
    html.classList.toggle('ownest-a11y-no-motion', !!prefs.noMotion);
  }

  function injectStyle() {
    var css = ''
      + '.ownest-a11y-contrast{filter:invert(1) hue-rotate(180deg);}'
      + '.ownest-a11y-contrast img,.ownest-a11y-contrast svg,.ownest-a11y-contrast picture{filter:invert(1) hue-rotate(180deg);}'
      + '.ownest-a11y-no-motion *,.ownest-a11y-no-motion *::before,.ownest-a11y-no-motion *::after{animation:none!important;transition:none!important;scroll-behavior:auto!important;}'
      + '#ownest-a11y-toggle{position:fixed;bottom:20px;inset-inline-end:20px;z-index:99999;width:52px;height:52px;border-radius:50%;'
      + 'background:#1e3a5f;border:2px solid #3b82f6;color:#fff;display:flex;align-items:center;justify-content:center;cursor:pointer;'
      + 'box-shadow:0 6px 20px rgba(0,0,0,.35);font-family:system-ui,sans-serif;}'
      + '#ownest-a11y-toggle svg{width:26px;height:26px;}'
      + '#ownest-a11y-toggle:hover{background:#274a75;}'
      + '#ownest-a11y-toggle:focus-visible,.ownest-a11y-panel button:focus-visible{outline:3px solid #60a5fa;outline-offset:2px;}'
      + '.ownest-a11y-panel{position:fixed;bottom:82px;inset-inline-end:20px;z-index:99999;width:250px;background:#101828;color:#f0f4ff;'
      + 'border:1px solid rgba(255,255,255,.15);border-radius:16px;padding:14px;box-shadow:0 12px 40px rgba(0,0,0,.5);font-family:system-ui,sans-serif;}'
      + '.ownest-a11y-panel h2{font-size:14px;font-weight:700;margin:0 0 10px;}'
      + '.ownest-a11y-panel button{display:flex;align-items:center;gap:8px;width:100%;text-align:inherit;background:rgba(255,255,255,.06);'
      + 'border:1px solid rgba(255,255,255,.12);color:#f0f4ff;border-radius:10px;padding:9px 12px;margin-bottom:8px;font-size:13.5px;cursor:pointer;}'
      + '.ownest-a11y-panel button:hover{background:rgba(255,255,255,.14);}'
      + '.ownest-a11y-panel button[aria-pressed="true"]{background:#3b82f6;border-color:#3b82f6;}'
      + '.ownest-a11y-panel a{display:block;text-align:center;margin-top:2px;color:#93c5fd;font-size:12.5px;text-decoration:underline;}'
      + '.ownest-a11y-panel .ownest-a11y-row{display:flex;gap:6px;margin-bottom:8px;}'
      + '.ownest-a11y-panel .ownest-a11y-row button{margin-bottom:0;justify-content:center;}';
    var style = document.createElement('style');
    style.textContent = css;
    document.head.appendChild(style);
  }

  function svgIcon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="4" r="2" fill="currentColor" stroke="none"/><path d="M4 8l8 2 8-2M12 10v11M8 21l4-6 4 6"/></svg>';
  }

  function build() {
    var dir = document.documentElement.dir || (isHe ? 'rtl' : 'ltr');

    var btn = document.createElement('button');
    btn.id = 'ownest-a11y-toggle';
    btn.type = 'button';
    btn.setAttribute('aria-haspopup', 'dialog');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'ownest-a11y-panel');
    btn.setAttribute('aria-label', STR.toggle);
    btn.innerHTML = svgIcon();

    var panel = document.createElement('div');
    panel.id = 'ownest-a11y-panel';
    panel.className = 'ownest-a11y-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', STR.title);
    panel.setAttribute('dir', dir);
    panel.hidden = true;
    panel.innerHTML =
      '<h2>' + STR.title + '</h2>' +
      '<div class="ownest-a11y-row">' +
        '<button type="button" data-act="smaller" aria-label="' + STR.smaller + '">A−</button>' +
        '<button type="button" data-act="reset" aria-label="' + STR.reset + '">A</button>' +
        '<button type="button" data-act="bigger" aria-label="' + STR.bigger + '">A+</button>' +
      '</div>' +
      '<button type="button" data-act="contrast" aria-pressed="' + (prefs.contrast ? 'true' : 'false') + '">' + STR.contrast + '</button>' +
      '<button type="button" data-act="motion" aria-pressed="' + (prefs.noMotion ? 'true' : 'false') + '">' + STR.motion + '</button>' +
      '<a href="/accessibility.html">' + STR.statement + '</a>';

    document.body.appendChild(btn);
    document.body.appendChild(panel);

    function openPanel() {
      panel.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      var first = panel.querySelector('button');
      if (first) first.focus();
    }
    function closePanel(refocus) {
      panel.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      if (refocus) btn.focus();
    }

    btn.addEventListener('click', function () {
      if (panel.hidden) openPanel(); else closePanel(false);
    });

    document.addEventListener('keydown', function (ev) {
      if (ev.key === 'Escape' && !panel.hidden) closePanel(true);
    });

    document.addEventListener('click', function (ev) {
      if (!panel.hidden && !panel.contains(ev.target) && !btn.contains(ev.target)) closePanel(false);
    });

    panel.addEventListener('click', function (ev) {
      var target = ev.target.closest('button[data-act]');
      if (!target) return;
      var act = target.getAttribute('data-act');
      if (act === 'bigger') prefs.zoomIndex = Math.min(prefs.zoomIndex + 1, ZOOM_STEPS.length - 1);
      else if (act === 'smaller') prefs.zoomIndex = Math.max(prefs.zoomIndex - 1, 0);
      else if (act === 'reset') prefs.zoomIndex = 0;
      else if (act === 'contrast') { prefs.contrast = !prefs.contrast; target.setAttribute('aria-pressed', prefs.contrast ? 'true' : 'false'); }
      else if (act === 'motion') { prefs.noMotion = !prefs.noMotion; target.setAttribute('aria-pressed', prefs.noMotion ? 'true' : 'false'); }
      applyPrefs();
      savePrefs(prefs);
    });
  }

  applyPrefs();
  injectStyle();
  if (document.body) build();
  else document.addEventListener('DOMContentLoaded', build);
})();
