/* Marina Geller Yamaguti · Portfolio
   Vanilla JS, no dependencies. Each feature is a small self-contained block. */
(function () {
  'use strict';

  var root = document.documentElement;
  var motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  function reducedMotion() { return motionQuery.matches; }

  /* ---------- 1. Theme switch (iOS-style) ---------- */
  var themeSwitch = document.getElementById('theme-switch');
  var themeColorMetas = document.querySelectorAll('meta[name="theme-color"]');

  function applyTheme(theme, persist) {
    root.setAttribute('data-theme', theme);
    themeSwitch.setAttribute('aria-checked', String(theme === 'dark'));
    themeColorMetas.forEach(function (m) { m.setAttribute('content', theme === 'dark' ? '#1B1916' : '#F2F2EA'); });
    if (persist) { try { localStorage.setItem('theme', theme); } catch (e) {} }
  }
  applyTheme(root.getAttribute('data-theme') || 'light', false);
  themeSwitch.addEventListener('click', function () {
    applyTheme(root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark', true);
  });

  /* ---------- 2. Active section in the nav ---------- */
  var navList = document.getElementById('nav-links');
  var navLinks = Array.prototype.slice.call(navList.querySelectorAll('a'));
  var sections = navLinks.map(function (a) { return document.querySelector(a.getAttribute('href')); });

  function setActive(id) {
    navLinks.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      if (on) {
        a.setAttribute('aria-current', 'true');
        // Keep the active pill visible in the scrollable mobile bar (horizontal only)
        if (navList.scrollWidth > navList.clientWidth) {
          var left = a.parentElement.offsetLeft - (navList.clientWidth - a.offsetWidth) / 2;
          navList.scrollTo({ left: left, behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
      } else {
        a.removeAttribute('aria-current');
      }
    });
  }

  function updateActive() {
    var line = window.innerHeight * 0.35;
    var current = null;
    sections.forEach(function (s) {
      if (s && s.getBoundingClientRect().top <= line) current = s.id;
    });
    // Last section: treat reaching the bottom as active
    if ((window.innerHeight + window.scrollY) >= document.body.scrollHeight - 4) current = sections[sections.length - 1].id;
    if (current !== updateActive.last) {
      updateActive.last = current;
      if (current) setActive(current); else navLinks.forEach(function (a) { a.removeAttribute('aria-current'); });
    }
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (!ticking) { ticking = true; requestAnimationFrame(function () { updateActive(); ticking = false; }); }
  }, { passive: true });
  window.addEventListener('resize', updateActive);
  updateActive();

  /* ---------- 3. Typewriter ---------- */
  (function typewriter() {
    var el = document.getElementById('typewriter');
    if (!el) return;
    var wrap = el.closest('.typewriter');
    var sizer = document.getElementById('typewriter-sizer');
    var phrases = ['a product engineer', 'an iOS developer', 'an interaction designer', 'an HCI student'];

    // The sizer holds the longest phrase so the reserved height never changes
    if (sizer) {
      sizer.textContent = phrases.reduce(function (a, b) { return b.length > a.length ? b : a; });
    }

    if (reducedMotion()) {
      el.textContent = el.getAttribute('data-final');
      wrap.classList.add('is-static');
      return;
    }

    var p = 0, i = phrases[0].length, deleting = true, timer;
    el.textContent = phrases[0];

    function tick() {
      var word = phrases[p];
      if (deleting) {
        i--;
        el.textContent = word.slice(0, i);
        if (i <= 0) { deleting = false; p = (p + 1) % phrases.length; timer = setTimeout(tick, 350); return; }
        timer = setTimeout(tick, 32);
      } else {
        word = phrases[p];
        i++;
        el.textContent = word.slice(0, i);
        if (i >= word.length) { deleting = true; timer = setTimeout(tick, 1900); return; }
        timer = setTimeout(tick, 60 + Math.random() * 50);
      }
    }
    timer = setTimeout(tick, 2200);

    // Stop if the user switches to reduced motion mid-session
    motionQuery.addEventListener && motionQuery.addEventListener('change', function (e) {
      if (e.matches) { clearTimeout(timer); el.textContent = el.getAttribute('data-final'); wrap.classList.add('is-static'); }
    });
  })();

  /* ---------- 4. Section title reveal ---------- */
  (function reveal() {
    var titles = document.querySelectorAll('.reveal');
    // Wrap each word (keeping <em> etc.) in .word > span
    titles.forEach(function (title) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (child) {
          if (child.nodeType === 3) {
            var frag = document.createDocumentFragment();
            child.textContent.split(/(\s+)/).forEach(function (part) {
              if (!part) return;
              if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
              var w = document.createElement('span'); w.className = 'word';
              var inner = document.createElement('span'); inner.textContent = part;
              inner.style.setProperty('--i', n++);
              w.appendChild(inner); frag.appendChild(w);
            });
            child.parentNode.replaceChild(frag, child);
          } else if (child.nodeType === 1) {
            walk(child);
          }
        });
      })(title);
    });

    if (!('IntersectionObserver' in window) || reducedMotion()) {
      titles.forEach(function (t) { t.classList.add('is-visible'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        // isIntersecting covers scrolling down to it; top < 0 covers landing
        // below it (a deep link, a reload mid-page) and scrolling back up
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          e.target.classList.add('is-visible');
          io.unobserve(e.target);
        }
      });
    }, { rootMargin: '0px 0px -10% 0px' });
    titles.forEach(function (t) { io.observe(t); });
  })();

  /* ---------- 4b. Timeline reveal ---------- */
  (function timelineReveal() {
    var timeline = document.querySelector('.timeline');
    if (!timeline) return;
    var items = Array.prototype.slice.call(timeline.children);
    items.forEach(function (li, i) { li.style.setProperty('--n', i); });

    if (!('IntersectionObserver' in window) || reducedMotion()) {
      timeline.classList.add('is-visible');
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting || e.boundingClientRect.top < 0) {
          timeline.classList.add('is-visible');
          io.disconnect();
        }
      });
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(timeline);
  })();

  /* ---------- 5. Flip cards (projects and education) ---------- */
  function wireFlipCards(cardSelector, frontSelector, backSelector, firstOnBack) {
    function setFlipped(card, flipped, moveFocus) {
      var front = card.querySelector(frontSelector);
      var back = card.querySelector(backSelector);
      card.classList.toggle('is-flipped', flipped);
      front.setAttribute('aria-expanded', String(flipped));
      // inert keeps the hidden face out of tab order, clicks and the accessibility tree
      if (flipped) { front.setAttribute('inert', ''); back.removeAttribute('inert'); }
      else { back.setAttribute('inert', ''); front.removeAttribute('inert'); }
      if (moveFocus) {
        var target = flipped ? (back.querySelector(firstOnBack) || back.querySelector('button, a')) : front;
        // Wait a frame so the element is focusable after inert is removed
        if (target) requestAnimationFrame(function () { target.focus({ preventScroll: true }); });
      }
    }
    document.querySelectorAll(cardSelector).forEach(function (card) {
      var front = card.querySelector(frontSelector);
      var back = card.querySelector(backSelector);
      front.addEventListener('click', function (e) {
        setFlipped(card, true, e.detail === 0); // detail 0 = keyboard activation
      });
      card.querySelector('.flip-back').addEventListener('click', function () {
        setFlipped(card, false, true);
      });
      // Tapping empty space on the back also flips it back
      back.addEventListener('click', function (e) {
        if (e.target.closest('button, a')) return;
        setFlipped(card, false, false);
      });
      back.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { setFlipped(card, false, true); }
      });
    });
  }
  wireFlipCards('.project', '.face--front', '.face--back', '[data-case]');
  wireFlipCards('.edu__card', '.edu__face--front', '.edu__face--back', '.flip-back');

  /* ---------- 5b. Case study carousel ----------
     Horizontal scroll-snap track with dots, arrows and a gentle autoplay.
     Carousels live inside the case-study <template>s, so they are built when a
     sheet opens and torn down when it closes. */
  var liveCarousels = [];

  function initCarousels(scope) {
    scope.querySelectorAll('[data-carousel]').forEach(function (root) {
      var track = root.querySelector('.carousel__track');
      var slides = Array.prototype.slice.call(track.children);
      var dotsBox = root.querySelector('.carousel__dots');
      var prev = root.querySelector('.carousel__nav[data-dir="-1"]');
      var next = root.querySelector('.carousel__nav[data-dir="1"]');
      if (slides.length < 2) { root.querySelector('.carousel__controls').hidden = true; return; }

      var index = 0;
      var timer = null;
      var paused = false;
      var delay = parseInt(root.getAttribute('data-autoplay'), 10) || 5000;

      var dots = slides.map(function (slide, i) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'carousel__dot';
        dot.setAttribute('role', 'tab');
        dot.setAttribute('aria-selected', String(i === 0));
        dot.setAttribute('aria-label', 'Screenshot ' + (i + 1) + ' of ' + slides.length);
        dot.addEventListener('click', function () { goTo(i); hold(); });
        dotsBox.appendChild(dot);
        return dot;
      });

      function sync(i) {
        index = i;
        dots.forEach(function (d, n) { d.setAttribute('aria-selected', String(n === i)); });
      }

      function goTo(i) {
        var target = slides[(i + slides.length) % slides.length];
        track.scrollTo({
          left: target.offsetLeft - slides[0].offsetLeft,
          behavior: reducedMotion() ? 'auto' : 'smooth'
        });
        sync((i + slides.length) % slides.length);
      }

      // Keep the dots honest when the track is swiped or scrolled directly
      var scrollTick = false;
      function onScroll() {
        if (scrollTick) return;
        scrollTick = true;
        requestAnimationFrame(function () {
          scrollTick = false;
          var base = slides[0].offsetLeft;
          var nearest = 0, best = Infinity;
          slides.forEach(function (slide, i) {
            var d = Math.abs((slide.offsetLeft - base) - track.scrollLeft);
            if (d < best) { best = d; nearest = i; }
          });
          if (nearest !== index) sync(nearest);
        });
      }
      track.addEventListener('scroll', onScroll, { passive: true });

      function start() {
        if (timer || paused || reducedMotion() || slides.length < 2) return;
        timer = setInterval(function () { goTo(index + 1); }, delay);
      }
      function stop() { clearInterval(timer); timer = null; }
      function hold() { stop(); clearTimeout(hold.t); hold.t = setTimeout(start, delay * 1.6); }

      // Autoplay yields to the reader
      root.addEventListener('pointerenter', function () { paused = true; stop(); });
      root.addEventListener('pointerleave', function () { paused = false; start(); });
      root.addEventListener('focusin', function () { paused = true; stop(); });
      root.addEventListener('focusout', function () {
        if (!root.contains(document.activeElement)) { paused = false; start(); }
      });
      track.addEventListener('pointerdown', hold);
      track.addEventListener('wheel', hold, { passive: true });

      prev.addEventListener('click', function () { goTo(index - 1); hold(); });
      next.addEventListener('click', function () { goTo(index + 1); hold(); });
      track.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); hold(); }
        else if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); hold(); }
      });

      start();
      liveCarousels.push({ stop: stop, hold: hold });
    });
  }

  function destroyCarousels() {
    liveCarousels.forEach(function (c) { c.stop(); clearTimeout(c.hold.t); });
    liveCarousels = [];
  }

  // Nothing animates while the tab is in the background
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) liveCarousels.forEach(function (c) { c.stop(); });
  });

  /* ---------- 6. Case study sheet ---------- */
  var sheet = document.getElementById('case-sheet');
  var sheetBody = document.getElementById('sheet-body');
  var sheetHeader = sheet.querySelector('.sheet__header');
  var lastTrigger = null;
  var closing = false;

  function openSheet(id, trigger) {
    var tpl = document.getElementById('case-' + id);
    if (!tpl) return;
    lastTrigger = trigger;
    sheetBody.innerHTML = '';
    destroyCarousels();
    sheetBody.appendChild(tpl.content.cloneNode(true));
    initCarousels(sheetBody);
    sheetBody.scrollTop = 0;
    sheet.style.removeProperty('transform');
    sheet.classList.remove('is-closing');
    sheet.classList.add('is-opening');
    root.classList.add('sheet-open');
    if (typeof sheet.showModal === 'function') sheet.showModal(); else sheet.setAttribute('open', '');
    sheet.querySelector('.sheet__close').focus();
  }

  function finishClose() {
    destroyCarousels();
    sheet.classList.remove('is-closing', 'is-opening');
    sheet.style.removeProperty('transform');
    sheet.style.removeProperty('--drag');
    if (sheet.open) { typeof sheet.close === 'function' ? sheet.close() : sheet.removeAttribute('open'); }
    root.classList.remove('sheet-open');
    closing = false;
    if (lastTrigger) lastTrigger.focus({ preventScroll: true });
  }

  function closeSheet() {
    if (closing || !sheet.open) return;
    closing = true;
    if (reducedMotion()) { finishClose(); return; }
    sheet.classList.remove('is-opening');
    sheet.classList.add('is-closing');
    var done = false;
    function end() { if (!done) { done = true; finishClose(); } }
    sheet.addEventListener('animationend', end, { once: true });
    setTimeout(end, 450); // safety net
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-case]');
    if (btn) openSheet(btn.getAttribute('data-case'), btn);
  });
  sheet.querySelector('.sheet__close').addEventListener('click', closeSheet);
  sheet.addEventListener('cancel', function (e) { e.preventDefault(); closeSheet(); }); // Esc
  sheet.addEventListener('click', function (e) {
    if (e.target !== sheet) return;
    var r = sheet.getBoundingClientRect();
    var inside = e.clientX >= r.left && e.clientX <= r.right && e.clientY >= r.top && e.clientY <= r.bottom;
    if (!inside) closeSheet(); // click on backdrop
  });
  // Unfinished placeholder links shouldn't jump to the top of the page
  sheet.addEventListener('click', function (e) {
    var a = e.target.closest('a[data-placeholder]');
    if (a && a.getAttribute('href') === '#') e.preventDefault();
  });

  // Swipe down on the grabber area to dismiss (mobile bottom sheet)
  (function dragToClose() {
    var startY = 0, dy = 0, dragging = false;
    sheetHeader.addEventListener('pointerdown', function (e) {
      if (window.innerWidth >= 768 || e.target.closest('button')) return;
      dragging = true; startY = e.clientY; dy = 0;
      sheet.classList.remove('is-opening');
      sheet.style.transition = 'none';
      sheetHeader.setPointerCapture(e.pointerId);
    });
    sheetHeader.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      dy = Math.max(0, e.clientY - startY);
      sheet.style.transform = 'translateY(' + dy + 'px)';
    });
    function up() {
      if (!dragging) return;
      dragging = false;
      sheet.style.transition = '';
      if (dy > 110) {
        sheet.style.setProperty('--drag', dy + 'px');
        sheet.style.removeProperty('transform');
        closeSheet();
      } else {
        sheet.style.transition = 'transform .45s var(--spring)';
        sheet.style.transform = 'translateY(0)';
        setTimeout(function () { sheet.style.transition = ''; sheet.style.removeProperty('transform'); }, 460);
      }
    }
    sheetHeader.addEventListener('pointerup', up);
    sheetHeader.addEventListener('pointercancel', up);
  })();

  /* ---------- 7. Segmented control (tabs) ---------- */
  (function segmented() {
    var list = document.querySelector('.segmented');
    if (!list) return;
    var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));

    function select(index, focus) {
      tabs.forEach(function (tab, i) {
        var on = i === index;
        tab.setAttribute('aria-selected', String(on));
        tab.tabIndex = on ? 0 : -1;
        document.getElementById(tab.getAttribute('aria-controls')).hidden = !on;
      });
      list.style.setProperty('--index', index);
      if (focus) tabs[index].focus();
    }
    tabs.forEach(function (tab, i) {
      tab.addEventListener('click', function () { select(i, false); });
      tab.addEventListener('keydown', function (e) {
        var next = null;
        if (e.key === 'ArrowRight') next = (i + 1) % tabs.length;
        else if (e.key === 'ArrowLeft') next = (i - 1 + tabs.length) % tabs.length;
        else if (e.key === 'Home') next = 0;
        else if (e.key === 'End') next = tabs.length - 1;
        if (next !== null) { e.preventDefault(); select(next, true); }
      });
    });
  })();

  /* ---------- 8. Footer year ---------- */
  var year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
