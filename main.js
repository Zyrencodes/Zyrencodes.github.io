(function () {
  "use strict";

  var root = document.documentElement;

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reduced motion: the head script never adds `.js`, so nothing is hidden.
  // Native scrolling, no entrances.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  function bail() {
    clearTimeout(window.__jsFailsafe);
    root.classList.remove("js");
  }

  if (!window.gsap || !window.ScrollTrigger || !window.SplitType) {
    bail();
    return;
  }

  try {
    init();
  } catch (err) {
    console.error(err);
    bail();
    return;
  }
  clearTimeout(window.__jsFailsafe);

  function init() {
    var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
    var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
    var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    gsap.registerPlugin(ScrollTrigger);
    gsap.defaults({ ease: "power3.out" });

    /* ---------- Header: hide on scroll down, return on scroll up ---------- */

    var header = $(".site-header");
    var lastY = window.scrollY;
    var scheduled = false;

    function updateHeader() {
      scheduled = false;
      var y = window.scrollY;
      var dy = y - lastY;
      header.classList.toggle("is-stuck", y > 8);
      if (y < 120) {
        header.classList.remove("is-hidden");
      } else if (dy > 4 && !header.querySelector(":focus-visible")) {
        header.classList.add("is-hidden");
      } else if (dy < -4) {
        header.classList.remove("is-hidden");
      }
      if (Math.abs(dy) > 4) lastY = y;
    }
    window.addEventListener("scroll", function () {
      if (!scheduled) {
        scheduled = true;
        requestAnimationFrame(updateHeader);
      }
    }, { passive: true });
    header.addEventListener("focusin", function () { header.classList.remove("is-hidden"); });

    /* ---------- Current section in the nav ---------- */

    var navLinks = {};
    $$('.nav a[href^="#"]').forEach(function (a) {
      navLinks[a.getAttribute("href").slice(1)] = a;
    });
    var markers = $$("[data-nav]").map(function (section) {
      return { name: section.getAttribute("data-nav"), el: section.querySelector("h2") };
    });
    var currentName = null;
    function updateNav() {
      var line = window.innerHeight * 0.55;
      var name = null;
      markers.forEach(function (m) {
        if (m.el.getBoundingClientRect().top <= line) name = m.name;
      });
      if (name === currentName) return;
      currentName = name;
      Object.keys(navLinks).forEach(function (key) {
        if (key === name) navLinks[key].setAttribute("aria-current", "location");
        else navLinks[key].removeAttribute("aria-current");
      });
    }
    ScrollTrigger.create({ start: 0, end: "max", onUpdate: updateNav, onRefresh: updateNav });

    /* ---------- Hero entrance (~1s) ---------- */

    var heroTitle = $("[data-split-hero]");
    var heroSplit = new SplitType(heroTitle, { types: "words" });
    gsap.set(heroTitle, { opacity: 1 });

    var rise = function (sel, y, dur, at) {
      return [$(sel), { opacity: 0, y: y }, { opacity: 1, y: 0, duration: dur, clearProps: "transform" }, at];
    };
    var tl = gsap.timeline();
    tl.from(heroSplit.words, { opacity: 0, y: 20, duration: 0.6, stagger: 0.05 }, 0.05);
    [rise(".eyebrow", 10, 0.5, 0),
     rise(".hero-text", 14, 0.55, 0.32),
     rise(".hero-links", 14, 0.5, 0.44)].forEach(function (a) { tl.fromTo(a[0], a[1], a[2], a[3]); });
    tl.add(function () { heroSplit.revert(); });

    /* ---------- Section reveals: one per block, once ---------- */

    $$("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 14 }, {
        opacity: 1, y: 0, duration: 0.65, clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });

    /* Journey rows: the divider draws while the row rises in together */
    $$("[data-row]").forEach(function (row) {
      var rtl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 88%", once: true } });
      rtl.fromTo(row, { "--draw": 0 }, { "--draw": 1, duration: 0.7 }, 0)
         .fromTo(row.children, { opacity: 0, y: 14 }, {
           opacity: 1, y: 0, duration: 0.65, clearProps: "opacity,transform",
           onComplete: function () { row.classList.add("is-in"); }
         }, 0.05);
    });

    /* ---------- Lenis: light smoothing, awake only while scrolling ---------- */

    if (window.Lenis) {
      var lenis = new Lenis({ lerp: 0.14, smoothWheel: true });
      lenis.on("scroll", ScrollTrigger.update);
      gsap.ticker.lagSmoothing(0);

      var running = false;
      var lastActive = 0;
      var tick = function (time) {
        lenis.raf(time * 1000);
        if (!lenis.isScrolling && performance.now() - lastActive > 250) {
          gsap.ticker.remove(tick);
          running = false;
        }
      };
      var wake = function () {
        lastActive = performance.now();
        if (!running) {
          running = true;
          gsap.ticker.add(tick);
        }
      };
      ["wheel", "touchstart", "keydown", "pointerdown", "scroll"].forEach(function (name) {
        window.addEventListener(name, wake, { passive: true });
      });

      document.addEventListener("click", function (e) {
        var a = e.target.closest && e.target.closest('a[href^="#"]');
        if (!a || e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey) return;
        var id = a.getAttribute("href").slice(1);
        var target = id ? document.getElementById(id) : null;
        if (!target) return;
        e.preventDefault();
        wake();
        // Lenis reads the target's scroll-margin-top itself
        lenis.scrollTo(target, {
          duration: 1.1,
          easing: function (t) { return 1 - Math.pow(1 - t, 4); }
        });
        history.pushState(null, "", "#" + id);
      });
    }

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }
})();
