/* Amit Kumar — slider
   Progressive enhancement over native CSS scroll-snap: the track already
   scrolls and swipes without this file, so arrows and dots are the only
   things added here. Runs regardless of motion preferences. */
(function () {
  'use strict';

  /* someone who asked for less motion gets an instant jump, not a glide */
  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var BEHAVIOR = reduced ? 'auto' : 'smooth';

  function setupSlider(root) {
    var track = root.querySelector('[data-slider-track]');
    if (!track) return;

    var prev = root.querySelector('[data-slider-prev]');
    var next = root.querySelector('[data-slider-next]');
    var dotWrap = root.querySelector('[data-slider-dots]');
    var items = Array.prototype.slice.call(track.children);
    if (!items.length) return;

    var dots = [];

    /* one page = how far a click on the arrow moves the track */
    function step() {
      var first = items[0].getBoundingClientRect();
      var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap || 0) || 0;
      return Math.max(first.width + gap, 1);
    }

    function scrollable() {
      return track.scrollWidth - track.clientWidth > 4;
    }

    function go(dir) {
      track.scrollBy({ left: dir * step(), behavior: BEHAVIOR });
    }

    /* build one dot per item, but only while the track really scrolls */
    function buildDots() {
      if (!dotWrap) return;
      dotWrap.textContent = '';
      dots = [];
      if (!scrollable()) return;

      items.forEach(function (item, i) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'slider-dot';
        b.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        b.addEventListener('click', function () {
          track.scrollTo({ left: item.offsetLeft - track.offsetLeft, behavior: BEHAVIOR });
        });
        dotWrap.appendChild(b);
        dots.push(b);
      });
    }

    /* which item is nearest the centre of the viewport */
    function activeIndex() {
      var mid = track.scrollLeft + track.clientWidth / 2;
      var best = 0, bestGap = Infinity;
      items.forEach(function (item, i) {
        var c = item.offsetLeft - track.offsetLeft + item.offsetWidth / 2;
        var gap = Math.abs(c - mid);
        if (gap < bestGap) { bestGap = gap; best = i; }
      });
      return best;
    }

    var queued = false;
    function sync() {
      queued = false;
      var can = scrollable();
      root.classList.toggle('is-static', !can);

      if (prev) prev.disabled = !can || track.scrollLeft <= 2;
      if (next) next.disabled = !can || track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;

      if (dots.length) {
        var idx = activeIndex();
        dots.forEach(function (d, i) {
          d.classList.toggle('is-on', i === idx);
          d.setAttribute('aria-current', i === idx ? 'true' : 'false');
        });
      }
    }

    function requestSync() {
      if (!queued) { queued = true; requestAnimationFrame(sync); }
    }

    if (prev) prev.addEventListener('click', function () { go(-1); });
    if (next) next.addEventListener('click', function () { go(1); });

    track.addEventListener('scroll', requestSync, { passive: true });

    /* keyboard: arrows move the track once it has focus */
    track.setAttribute('tabindex', '0');
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
    });

    var resizeQueued = false;
    window.addEventListener('resize', function () {
      if (resizeQueued) return;
      resizeQueued = true;
      setTimeout(function () {
        resizeQueued = false;
        buildDots();
        sync();
      }, 150);
    });

    buildDots();
    sync();
    // images finishing later can change the scroll width
    window.addEventListener('load', function () { buildDots(); sync(); });
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-slider]'), setupSlider);
})();
