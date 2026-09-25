(function () {
  "use strict";

  var root = document.documentElement;

  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Reduced motion: the head script never adds `.js`, so nothing is hidden.
  // Native scrolling, no entrances, no magnetic buttons.
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
    function setCurrent(name) {
      Object.keys(navLinks).forEach(function (key) {
        if (key === name) navLinks[key].setAttribute("aria-current", "location");
        else navLinks[key].removeAttribute("aria-current");
      });
    }
    $$("[data-nav]").forEach(function (section) {
      ScrollTrigger.create({
        trigger: section,
        start: "top 45%",
        end: "bottom 45%",
        onToggle: function (self) { if (self.isActive) setCurrent(section.getAttribute("data-nav")); }
      });
    });
    ScrollTrigger.create({
      trigger: "#top",
      start: "top top",
      end: "bottom 45%",
      onToggle: function (self) { if (self.isActive) setCurrent(null); }
    });

    /* ---------- Hero entrance (~0.9s) ---------- */

    var heroTitle = $("[data-split-hero]");
    var heroSplit = new SplitType(heroTitle, { types: "words" });
    gsap.set(heroTitle, { opacity: 1 });

    gsap.timeline()
      .from(heroSplit.words, { opacity: 0, y: 20, duration: 0.6, stagger: 0.02 }, 0)
      .fromTo($(".eyebrow"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, 0)
      .fromTo($(".hero-text"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.55, clearProps: "transform" }, 0.28)
      .fromTo($(".hero-links"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, clearProps: "transform" }, 0.4)
      .add(function () { heroSplit.revert(); });

    /* ---------- Section reveals: one per block, once ---------- */

    $$("[data-reveal]").forEach(function (el) {
      gsap.fromTo(el, { opacity: 0, y: 16 }, {
        opacity: 1, y: 0, duration: 0.65, clearProps: "transform",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    });

    /* Rows: the divider draws while the row content rises in together */
    $$("[data-row]").forEach(function (row) {
      var tl = gsap.timeline({ scrollTrigger: { trigger: row, start: "top 85%", once: true } });
      tl.fromTo(row, { "--draw": 0 }, { "--draw": 1, duration: 0.7 }, 0)
        .fromTo(row.children, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.65, clearProps: "transform" }, 0.05);
    });

    /* Contact: accent rule draws, title words rise once */
    var rule = $(".accent-rule");
    gsap.fromTo(rule, { "--draw": 0 }, {
      "--draw": 1, duration: 0.7,
      scrollTrigger: { trigger: rule, start: "top 90%", once: true }
    });

    var contactTitle = $("[data-split-scroll]");
    var contactSplit = new SplitType(contactTitle, { types: "words" });
    gsap.from(contactSplit.words, {
      opacity: 0, y: 22, duration: 0.7, stagger: 0.03,
      scrollTrigger: { trigger: contactTitle, start: "top 85%", once: true },
      onComplete: function () { contactSplit.revert(); }
    });

    /* ---------- Magnetic buttons: mouse only, max 4px ---------- */

    if (finePointer) {
      $$("[data-magnetic]").forEach(function (btn) {
        var xTo = gsap.quickTo(btn, "x", { duration: 0.3, ease: "power3.out" });
        var yTo = gsap.quickTo(btn, "y", { duration: 0.3, ease: "power3.out" });
        var max = 4;
        btn.addEventListener("pointermove", function (e) {
          if (e.pointerType !== "mouse") return;
          var r = btn.getBoundingClientRect();
          var dx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
          var dy = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
          xTo(gsap.utils.clamp(-1, 1, dx) * max);
          yTo(gsap.utils.clamp(-1, 1, dy) * max);
        });
        btn.addEventListener("pointerleave", function () {
          gsap.to(btn, { x: 0, y: 0, duration: 0.5, ease: "power3.out", overwrite: "auto" });
        });
      });
    }

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
