(() => {
  "use strict";

  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

  // Year
  const year = $("#year");
  if (year) year.textContent = String(new Date().getFullYear());

  // Theme toggle
  const themeBtn = $("#themeBtn");
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
  themeBtn?.addEventListener("click", () => {
    const curr = document.documentElement.getAttribute("data-theme") || "dark";
    const next = curr === "light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  });

  // Mobile nav
  const menuBtn = $("#menuBtn");
  const mobileNav = $("#mobileNav");
  const DESKTOP_NAV_BREAKPOINT = 768;
  const setMobile = (open) => {
    if (!menuBtn || !mobileNav) return;
    menuBtn.setAttribute("aria-expanded", String(open));
    mobileNav.hidden = !open;
  };
  menuBtn?.addEventListener("click", () => setMobile(menuBtn.getAttribute("aria-expanded") !== "true"));
  $$(".nav-mobile__link").forEach((a) => a.addEventListener("click", () => setMobile(false)));
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setMobile(false);
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth >= DESKTOP_NAV_BREAKPOINT) setMobile(false);
  });
  if (window.innerWidth >= DESKTOP_NAV_BREAKPOINT) setMobile(false);

  // Smooth scroll with offset
  const navWrap = $(".nav-wrap");
  const navOffset = () => (navWrap ? navWrap.getBoundingClientRect().height + 10 : 80);

  document.addEventListener("click", (e) => {
    const a = e.target.closest?.('a[href^="#"]');
    if (!a) return;
    const href = a.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.getElementById(href.slice(1));
    if (!target) return;
    e.preventDefault();
    const top = window.scrollY + target.getBoundingClientRect().top - navOffset();
    window.scrollTo({ top, behavior: reduceMotion ? "auto" : "smooth" });
    history.replaceState(null, "", href);
  });

  // Reveal animations
  const revealEls = $$("[data-reveal]");
  const reveal = (el) => {
    const delay = Number(el.getAttribute("data-reveal-delay") || 0);
    if (delay) el.style.transitionDelay = `${delay}ms`;
    el.classList.add("is-visible");
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(reveal);
  } else {
    const io = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          reveal(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.14 }
    );
    revealEls.forEach((el) => io.observe(el));
  }

  // Active nav
  const navLinks = $$("[data-nav]");
  const sections = $$("[data-section]");
  const setActive = (id) => {
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("data-nav") === id));
  };
  if ("IntersectionObserver" in window) {
    const secIO = new IntersectionObserver(
      (entries) => {
        const best = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (best) setActive(best.target.id);
      },
      { threshold: [0.25, 0.4, 0.55], rootMargin: `-${Math.round(navOffset())}px 0px -50% 0px` }
    );
    sections.forEach((s) => secIO.observe(s));
  }

  // Typing animation
  const typing = $("#typing");
  const phrases = [
    "Building intelligent systems",
    "Crafting premium web experiences",
    "Exploring AI-powered products",
  ];
  const sleep = (ms) => new Promise((res) => window.setTimeout(res, ms));
  const runTyping = async () => {
    if (!typing) return;
    if (reduceMotion) {
      typing.textContent = phrases[0];
      return;
    }
    let idx = 0;
    while (true) {
      const phrase = phrases[idx % phrases.length];
      for (let i = 0; i <= phrase.length; i++) {
        typing.textContent = phrase.slice(0, i);
        await sleep(42);
      }
      await sleep(900);
      for (let i = phrase.length; i >= 0; i--) {
        typing.textContent = phrase.slice(0, i);
        await sleep(26);
      }
      await sleep(220);
      idx += 1;
    }
  };
  void runTyping();

  // Progress bars
  const bars = $$(".bar[data-progress]");
  const fillBar = (bar) => {
    const pct = clamp(Number(bar.getAttribute("data-progress") || 0), 0, 100);
    const fill = $(".bar__fill", bar);
    const val = $(".bar__value", bar);
    if (fill) fill.style.width = `${pct}%`;
    if (val) val.textContent = `${pct}%`;
  };
  if (reduceMotion || !("IntersectionObserver" in window)) {
    bars.forEach(fillBar);
  } else {
    const barIO = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          fillBar(entry.target);
          obs.unobserve(entry.target);
        });
      },
      { threshold: 0.26 }
    );
    bars.forEach((b) => barIO.observe(b));
  }

  // Cursor glow
  const cursorGlow = $("#cursorGlow");
  if (cursorGlow && !reduceMotion) {
    window.addEventListener(
      "mousemove",
      (e) => {
        cursorGlow.style.left = `${e.clientX}px`;
        cursorGlow.style.top = `${e.clientY}px`;
      },
      { passive: true }
    );
  } else if (cursorGlow) {
    cursorGlow.style.display = "none";
  }

  // 3D tilt on profile card
  const tiltCard = $("#tiltCard");
  if (tiltCard && !reduceMotion) {
    const max = 8;
    tiltCard.addEventListener("mousemove", (e) => {
      const r = tiltCard.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      const rx = (0.5 - y) * max;
      const ry = (x - 0.5) * max;
      tiltCard.style.transform = `rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-2px)`;
    });
    tiltCard.addEventListener("mouseleave", () => {
      tiltCard.style.transform = "";
    });
  }

  // Button ripple interaction
  const addRipple = (e) => {
    const btn = e.currentTarget;
    const rect = btn.getBoundingClientRect();
    const ink = document.createElement("span");
    ink.className = "ripple__ink";
    const size = Math.max(rect.width, rect.height);
    ink.style.width = `${size}px`;
    ink.style.height = `${size}px`;
    ink.style.left = `${e.clientX - rect.left - size / 2}px`;
    ink.style.top = `${e.clientY - rect.top - size / 2}px`;
    btn.appendChild(ink);
    window.setTimeout(() => ink.remove(), 560);
  };
  $$(".ripple").forEach((el) => el.addEventListener("click", addRipple));

  // Contact toast
  const toast = $("#toast");
  const toastText = $("#toastText");
  const form = $("#contactForm");
  let toastTimer = 0;
  const showToast = (text) => {
    if (!toast || !toastText) return;
    toastText.textContent = text;
    toast.hidden = false;
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.hidden = true;
    }, 2600);
  };
  form?.addEventListener("submit", (e) => {
    e.preventDefault();
    const name = String(new FormData(form).get("name") || "").trim();
    showToast(name ? `Thanks ${name}, message received.` : "Message received.");
    form.reset();
  });

  // Floating particles background (lightweight)
  const canvas = $("#particles");
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      let w = 0;
      let h = 0;
      let particles = [];
      const count = 44;

      const resize = () => {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
      };

      const seed = () => {
        particles = Array.from({ length: count }, () => ({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 0.6,
        }));
      };

      const draw = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.fillStyle = "rgba(132,190,255,0.35)";
        for (const p of particles) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        requestAnimationFrame(draw);
      };

      resize();
      seed();
      draw();
      window.addEventListener("resize", () => {
        resize();
        seed();
      });
    }
  }
})();

