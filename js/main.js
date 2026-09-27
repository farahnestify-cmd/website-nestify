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
  $$("[data-tile]").forEach((tile) => {
    tile.addEventListener("click", () => {
      const on = !tile.classList.contains("is-on");
      tile.classList.toggle("is-on", on);
      tile.setAttribute("aria-pressed", String(on));
      const state = $(".tile-state", tile);
      state.textContent = on ? state.dataset.on : state.dataset.off;
    });
  });

  const dial = $("[data-dial]");
  const tempEl = $("[data-temp]");
  const MIN = 16;
  const MAX = 30;
  let temp = Number(tempEl.textContent);

  const renderTemp = () => {
    tempEl.textContent = temp;
    dial.style.setProperty("--p", ((temp - MIN) / (MAX - MIN)).toFixed(3));
  };
  $$("[data-temp-step]").forEach((btn) => {
    btn.addEventListener("click", () => {
      temp = Math.min(MAX, Math.max(MIN, temp + Number(btn.dataset.tempStep)));
      renderTemp();
    });
  });
  renderTemp();

  /* Contact form — composes an email to the sales team */
  const form = $("[data-contact-form]");
  const note = $("[data-form-note]");

  form.addEventListener("submit", (e) => {
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

  /* Footer year */
  const year = $("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
