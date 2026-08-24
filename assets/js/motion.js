/* Amit Kumar — motion layer
   Spring gestures, staggered reveals and scroll-linked progress.
   No dependencies. Bails out entirely when the visitor prefers
   reduced motion, leaving the plain stylesheet in charge. */
(function () {
  'use strict';

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduce) return;

  var root = document.documentElement;
  root.classList.add('js-motion');

  var finePointer = window.matchMedia && window.matchMedia('(pointer: fine)').matches;

  /* =========================================================
     A tiny spring. One rAF ticker drives every instance, so
     ten springy elements still cost a single frame callback.
     ========================================================= */
  var springs = [];
  var ticking = false;

  function Spring(onFrame, stiffness, damping) {
    this.v = 0; this.x = 0; this.target = 0;
    this.k = stiffness || 0.12;
    this.d = damping || 0.72;
    this.onFrame = onFrame;
    springs.push(this);
  }

  Spring.prototype.to = function (t) {
    this.target = t;
    start();
  };

  Spring.prototype.step = function () {
    var force = (this.target - this.x) * this.k;
    this.v = (this.v + force) * this.d;
    this.x += this.v;
    var settled = Math.abs(this.v) < 0.002 && Math.abs(this.target - this.x) < 0.002;
    if (settled) { this.x = this.target; this.v = 0; }
    this.onFrame(this.x);
    return !settled;
  };

  function tick() {
    var alive = false;
    for (var i = 0; i < springs.length; i++) {
      if (springs[i].step()) alive = true;
    }
    if (alive) { requestAnimationFrame(tick); } else { ticking = false; }
  }

  function start() {
    if (!ticking) { ticking = true; requestAnimationFrame(tick); }
  }

  /* =========================================================
     Split headlines into words so they can rise in sequence
     ========================================================= */
  function splitWords(el) {
    var nodes = Array.prototype.slice.call(el.childNodes);
    var index = 0;
    el.textContent = '';
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/\s+/).forEach(function (word) {
          if (!word) return;
          var box = document.createElement('span');
          box.className = 'word';
          var inner = document.createElement('span');
          inner.textContent = word;
          inner.style.transitionDelay = (index * 65) + 'ms';
          box.appendChild(inner);
          el.appendChild(box);
          el.appendChild(document.createTextNode(' '));
          index++;
        });
      } else {
        el.appendChild(node);
      }
    });
  }

  var splits = Array.prototype.slice.call(document.querySelectorAll('[data-split]'));
  splits.forEach(splitWords);

  /* =========================================================
     One observer drives the split headlines and the eyebrows
     ========================================================= */
  var watch = splits.concat(Array.prototype.slice.call(document.querySelectorAll('.eyebrow')));

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -6% 0px' });
    watch.forEach(function (el) { io.observe(el); });
  } else {
    watch.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* =========================================================
     Scroll progress — only when the browser cannot do it in CSS
     ========================================================= */
  var bar = document.querySelector('.scroll-progress');
  var cssScrollTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: scroll()');

  if (bar && !cssScrollTimeline) {
    var barQueued = false;
    var updateBar = function () {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var p = max > 0 ? window.scrollY / max : 0;
      bar.style.setProperty('--p', Math.min(1, Math.max(0, p)).toFixed(4));
      barQueued = false;
    };
    window.addEventListener('scroll', function () {
      if (!barQueued) { barQueued = true; requestAnimationFrame(updateBar); }
    }, { passive: true });
    updateBar();
  }

  /* =========================================================
     Hero parallax — fallback for browsers without view timelines
     ========================================================= */
  var heroMedia = document.querySelector('.hero-bg');
  var cssViewTimeline = window.CSS && CSS.supports && CSS.supports('animation-timeline: view()');

  if (heroMedia && !cssViewTimeline) {
    var heroQueued = false;
    var moveHero = function () {
      var y = Math.min(window.scrollY, window.innerHeight) * 0.18;
      heroMedia.style.transform = 'scale(1.12) translate3d(0,' + y.toFixed(1) + 'px,0)';
      heroQueued = false;
    };
    heroMedia.style.animation = 'none';
    window.addEventListener('scroll', function () {
      if (!heroQueued) { heroQueued = true; requestAnimationFrame(moveHero); }
    }, { passive: true });
    moveHero();
  }

  /* =========================================================
     Gallery tiles wipe in one after another as the rail enters
     ========================================================= */
  var railItems = Array.prototype.slice.call(document.querySelectorAll('.rail-item'));

  if (railItems.length && 'IntersectionObserver' in window) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.style.transitionDelay = (railItems.indexOf(el) % 4) * 90 + 'ms';
        el.classList.add('is-in');
        rio.unobserve(el);
      });
    }, { threshold: 0.15 });
    railItems.forEach(function (el) { rio.observe(el); });
  } else {
    railItems.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* review cards inherit their stagger position from --i */
  Array.prototype.forEach.call(document.querySelectorAll('.review'), function (el, i) {
    el.style.setProperty('--i', i);
  });

  /* =========================================================
     The marquee leans into the direction you are scrolling and
     springs back to level when you stop
     ========================================================= */
  var marquee = document.querySelector('.marquee');

  if (marquee) {
    var skew = new Spring(function (v) {
      marquee.style.setProperty('--mq-skew', v.toFixed(2) + 'deg');
    }, 0.14, 0.76);

    var lastY = window.scrollY;
    var settle;

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      var velocity = y - lastY;
      lastY = y;

      var target = velocity * 0.22;
      if (target > 5) target = 5;
      if (target < -5) target = -5;
      skew.to(target);

      clearTimeout(settle);
      settle = setTimeout(function () { skew.to(0); }, 110);
    }, { passive: true });
  }

  /* =========================================================
     Videos play only while they are on screen. Phones stay cool
     and nothing downloads until it is actually about to be seen.
     ========================================================= */
  var clips = Array.prototype.slice.call(
    document.querySelectorAll('.hero-card-media video, .ig-tile.is-clip video')
  );

  if (clips.length && 'IntersectionObserver' in window) {
    var vio = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var v = entry.target;
        if (entry.isIntersecting) {
          if (v.preload !== 'auto') v.preload = 'auto';
          var p = v.play();
          if (p && p.catch) p.catch(function () { /* autoplay refused, poster stays */ });
        } else if (!v.paused) {
          v.pause();
        }
      });
    }, { threshold: 0.25 });
    clips.forEach(function (v) { vio.observe(v); });
  }

  /* =========================================================
     Feature clip — heavy file, so it loads only on request
     ========================================================= */
  var feat = document.getElementById('featureVideo');
  if (feat) {
    var fv = feat.querySelector('video');
    var fb = feat.querySelector('.feature-play');

    if (fv && fb) {
      fb.addEventListener('click', function () {
        fv.preload = 'auto';
        var p = fv.play();
        if (p && p.catch) p.catch(function () {});
        feat.classList.add('is-playing');
      });
      fv.addEventListener('click', function () {
        if (fv.paused) {
          fv.play();
          feat.classList.add('is-playing');
        } else {
          fv.pause();
          feat.classList.remove('is-playing');
        }
      });
      // stop it when it scrolls away
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (entry) {
            if (!entry.isIntersecting && !fv.paused) {
              fv.pause();
              feat.classList.remove('is-playing');
            }
          });
        }, { threshold: 0.1 }).observe(feat);
      }
    }
  }

  /* =========================================================
     Gallery rail — drag to scroll with a mouse, native swipe on touch
     ========================================================= */
  var rail = document.getElementById('rail');
  if (rail) {
    var dragging = false, startX = 0, startLeft = 0;

    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return;   // let the browser do its own thing
      dragging = true;
      startX = e.clientX;
      startLeft = rail.scrollLeft;
      rail.classList.add('is-dragging');
      try { rail.setPointerCapture(e.pointerId); } catch (err) {}
    });

    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      rail.scrollLeft = startLeft - (e.clientX - startX);
    });

    var stopDrag = function () {
      if (!dragging) return;
      dragging = false;
      rail.classList.remove('is-dragging');
    };
    rail.addEventListener('pointerup', stopDrag);
    rail.addEventListener('pointercancel', stopDrag);
    rail.addEventListener('pointerleave', stopDrag);
  }

  /* Pointer affordances below this line are desktop only */
  if (!finePointer) return;

  /* =========================================================
     Magnetic buttons — the button leans toward the cursor
     ========================================================= */
  Array.prototype.forEach.call(document.querySelectorAll('.btn'), function (btn) {
    var sx = new Spring(function (v) { btn.style.setProperty('--tx', v.toFixed(2) + 'px'); }, 0.16, 0.7);
    var sy = new Spring(function (v) { btn.style.setProperty('--ty', v.toFixed(2) + 'px'); }, 0.16, 0.7);

    btn.addEventListener('pointermove', function (e) {
      var r = btn.getBoundingClientRect();
      var pull = 0.28;
      sx.to((e.clientX - (r.left + r.width / 2)) * pull);
      sy.to((e.clientY - (r.top + r.height / 2)) * pull);
    });
    btn.addEventListener('pointerleave', function () { sx.to(0); sy.to(0); });
  });

  /* =========================================================
     Spring tilt + pointer spotlight on cards and reel tiles
     ========================================================= */
  function addTilt(el, maxDeg, lift) {
    var rx = new Spring(function (v) { el.style.setProperty('--rx', v.toFixed(2) + 'deg'); }, 0.1, 0.75);
    var ry = new Spring(function (v) { el.style.setProperty('--ry', v.toFixed(2) + 'deg'); }, 0.1, 0.75);
    var lf = new Spring(function (v) { el.style.setProperty('--lift', v.toFixed(2) + 'px'); }, 0.12, 0.75);

    el.addEventListener('pointermove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      ry.to((px - 0.5) * maxDeg * 2);
      rx.to((0.5 - py) * maxDeg * 2);
      lf.to(-lift);
      el.style.setProperty('--mx', (px * 100).toFixed(1) + '%');
      el.style.setProperty('--my', (py * 100).toFixed(1) + '%');
    });
    el.addEventListener('pointerleave', function () { rx.to(0); ry.to(0); lf.to(0); });
  }

  Array.prototype.forEach.call(document.querySelectorAll('.plan-card'), function (el) { addTilt(el, 3.2, 6); });
  Array.prototype.forEach.call(document.querySelectorAll('.ig-tile'), function (el) { addTilt(el, 4.5, 8); });

  /* =========================================================
     Nav indicator — one underline that springs between links
     ========================================================= */
  var nav = document.getElementById('nav');
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));

  if (nav && navLinks.length) {
    var ind = document.createElement('span');
    ind.className = 'nav-ind';
    nav.appendChild(ind);

    var sxPos = new Spring(function (v) { ind.style.setProperty('--x', v.toFixed(2) + 'px'); }, 0.18, 0.7);
    var sWide = new Spring(function (v) { ind.style.setProperty('--w', Math.max(0, v).toFixed(2) + 'px'); }, 0.18, 0.7);
    var placed = false;

    function moveTo(link) {
      if (!link) return;
      var r = link.getBoundingClientRect();
      var nr = nav.getBoundingClientRect();
      if (!placed) {
        // first placement jumps rather than sliding in from zero
        sxPos.x = r.left - nr.left; sWide.x = r.width;
        placed = true;
      }
      sxPos.to(r.left - nr.left);
      sWide.to(r.width);
      ind.classList.add('is-on');
    }

    function activeLink() {
      return document.querySelector('.nav-link.is-active') || navLinks[0];
    }

    navLinks.forEach(function (link) {
      link.addEventListener('pointerenter', function () { moveTo(link); });
    });
    nav.addEventListener('pointerleave', function () { moveTo(activeLink()); });

    window.addEventListener('load', function () { moveTo(activeLink()); });
    window.addEventListener('resize', function () { placed = false; moveTo(activeLink()); });
    // main.js retags the active link while scrolling; follow it
    window.addEventListener('scroll', function () {
      if (!nav.matches(':hover')) moveTo(activeLink());
    }, { passive: true });
    moveTo(activeLink());
  }
})();
