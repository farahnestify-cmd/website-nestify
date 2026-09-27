/* Nestify — interactions */
(() => {
  "use strict";

  document.documentElement.classList.remove("no-js");

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Header: solid on scroll, hides on scroll down, returns on scroll up */
  const header = $("[data-header]");
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle("is-scrolled", y > 12);
    const menuOpen = document.body.classList.contains("menu-open");
    header.classList.toggle("is-hidden", !menuOpen && y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) header.classList.remove("is-hidden");
    lastY = y;
    ticking = false;
  };

  window.addEventListener("scroll", () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* Mobile menu */
  const toggle = $("[data-menu-toggle]");
  const menu = $("[data-mobile-menu]");

  const setMenu = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.classList.toggle("menu-open", open);
    header.classList.add("is-scrolled");
    if (open) {
      menu.hidden = false;
      requestAnimationFrame(() => menu.classList.add("is-open"));
    } else {
      menu.classList.remove("is-open");
      setTimeout(() => { if (!menu.classList.contains("is-open")) menu.hidden = true; }, 400);
      onScroll();
    }
  };

  toggle.addEventListener("click", () => setMenu(toggle.getAttribute("aria-expanded") !== "true"));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMenu(false);
      toggle.focus();
    }
  });
  window.matchMedia("(min-width: 1081px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* Reveal on scroll */
  const reveals = $$(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* Active nav link follows the section in view */
  const navLinks = $$(".primary-nav a");
  const sections = navLinks
    .map((a) => document.getElementById(a.getAttribute("href").slice(1)))
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    const navIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${entry.target.id}`));
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach((s) => navIO.observe(s));
  }

  /* Hero control panel — tiles and thermostat */
  const tiles = $$("[data-tile]");

  const setTile = (tile, on) => {
    tile.classList.toggle("is-on", on);
    tile.setAttribute("aria-pressed", String(on));
    const state = $(".tile-state", tile);
    state.textContent = on ? state.dataset.on : state.dataset.off;
  };

  tiles.forEach((tile) => {
    tile.addEventListener("click", () => {
      tile.dataset.touched = "true"; // the intro leaves tiles the visitor has used alone
      setTile(tile, !tile.classList.contains("is-on"));
    });
  });

  const dial = $("[data-dial]");
  const tempEl = $("[data-temp]");
  const panel = $(".panel");

  if (dial && tempEl && panel) {
    const MIN = 10;
    const MAX = 30; // 22 °C sits at 60% of the ring
    const target = Number(tempEl.textContent);
    let temp = target;

    const renderTemp = () => {
      tempEl.textContent = Math.round(temp);
      dial.style.setProperty("--p", ((temp - MIN) / (MAX - MIN)).toFixed(3));
    };
    $$("[data-temp-step]").forEach((btn) => {
      btn.addEventListener("click", () => {
        panel.dataset.touched = "true";
        temp = Math.min(MAX, Math.max(MIN, Math.round(temp) + Number(btn.dataset.tempStep)));
        renderTemp();
      });
    });

    /* Intro: the ring fills to 60% while the degrees count up, then each tile is pressed in turn */
    const playIntro = () => {
      const DIAL_MS = 1600;
      const start = performance.now();
      dial.classList.add("is-intro");

      const step = (now) => {
        if (panel.dataset.touched) { dial.classList.remove("is-intro"); return; }
        const t = Math.min(1, (now - start) / DIAL_MS);
        const eased = 1 - Math.pow(1 - t, 3);
        temp = MIN + (target - MIN) * eased;
        renderTemp();
        if (t < 1) requestAnimationFrame(step);
        else { temp = target; renderTemp(); dial.classList.remove("is-intro"); }
      };
      requestAnimationFrame(step);

      tiles.forEach((tile, i) => {
        setTimeout(() => {
          if (tile.dataset.touched) return;
          tile.classList.add("is-pressing");
          setTile(tile, true);
          tile.addEventListener("animationend", () => tile.classList.remove("is-pressing"), { once: true });
        }, DIAL_MS * 0.55 + i * 380);
      });
    };

    if (reduceMotion) {
      tiles.forEach((tile) => setTile(tile, true));
      renderTemp();
    } else {
      temp = MIN;
      renderTemp();
      // Start once the panel is on screen and its fade-in has begun
      if ("IntersectionObserver" in window) {
        const introIO = new IntersectionObserver(([entry]) => {
          if (!entry.isIntersecting) return;
          introIO.disconnect();
          setTimeout(playIntro, 500);
        }, { threshold: 0.4 });
        introIO.observe(panel);
      } else {
        playIntro();
      }
    }
  }

  /* Contact form — composes an email to the sales team */
  const form = $("[data-contact-form]");
  const note = $("[data-form-note]");

  /* Arriving from a product page (?product=…) pre-fills the request */
  const PRODUCTS = {
    "smart-switches": "Smart switches",
    "smart-door-locks": "Smart door locks",
    "smart-panels": "Smart panels",
  };
  const product = PRODUCTS[new URLSearchParams(window.location.search).get("product")];
  if (form && product && !form.elements.message.value) {
    form.elements.message.value = `I'm interested in: ${product}\n\n`;
  }

  if (form) form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = String(data.get("name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    form.elements.name.setAttribute("aria-invalid", String(!name));
    form.elements.email.setAttribute("aria-invalid", String(!emailOk));

    if (!name || !emailOk) {
      note.textContent = "Please add your name and a valid email address.";
      note.classList.add("is-error");
      (!name ? form.elements.name : form.elements.email).focus();
      return;
    }

    const type = data.get("type");
    const to = type === "Support" ? "support@nestify.ps" : "sales@nestify.ps";
    const subject = `${type} consultation request — ${name}`;
    const body = [
      `Name: ${name}`,
      `Email: ${email}`,
      `Phone: ${data.get("phone") || "—"}`,
      `Project type: ${type}`,
      "",
      String(data.get("message") || ""),
    ].join("\n");

    window.location.href = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    note.classList.remove("is-error");
    note.textContent = "Thank you — your email app should open with your request ready to send.";
  });

  /* Projects filter */
  const projectList = $("[data-projects]");
  const filterBtns = $$("[data-filter]");
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const value = btn.dataset.filter;
      filterBtns.forEach((b) => {
        const active = b === btn;
        b.classList.toggle("is-active", active);
        b.setAttribute("aria-pressed", String(active));
      });
      $$(".project", projectList).forEach((item) => {
        item.classList.toggle("is-hidden", value !== "all" && item.dataset.category !== value);
      });
    });
  });

  /* Footer year */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
