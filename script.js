/* =========================================================
   ITXRE — Private Tax Advisory · Design Concept
   Interactions: sticky header, mobile nav, scroll reveal,
   stat counters, testimonial carousel, form validation
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Sticky header ---------- */
  const header = document.querySelector(".site-header");
  const onScroll = () => header.classList.toggle("scrolled", window.scrollY > 40);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const navToggle = document.getElementById("navToggle");
  const mainNav = document.getElementById("mainNav");

  const setNav = (open) => {
    mainNav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    document.body.style.overflow = open ? "hidden" : "";
  };

  navToggle.addEventListener("click", () => setNav(!mainNav.classList.contains("is-open")));
  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => setNav(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setNav(false); });

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll(".reveal");

  if (prefersReducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Stagger siblings that reveal together
          const siblings = [...entry.target.parentElement.children].filter((c) => c.classList.contains("reveal"));
          const index = Math.max(0, siblings.indexOf(entry.target));
          entry.target.style.transitionDelay = `${Math.min(index * 90, 450)}ms`;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Animated stat counters ---------- */
  const counters = document.querySelectorAll("[data-count]");

  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const suffix = el.dataset.suffix || "";
    if (prefersReducedMotion) { el.textContent = target + suffix; return; }

    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if ("IntersectionObserver" in window) {
    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach((c) => countObserver.observe(c));
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- Testimonial carousel ---------- */
  const slides = [...document.querySelectorAll(".testimonial")];
  const dotsWrap = document.getElementById("tDots");
  let current = 0;
  let autoplay;

  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.className = "t-dot" + (i === 0 ? " is-active" : "");
    dot.setAttribute("aria-label", `Show testimonial ${i + 1}`);
    dot.addEventListener("click", () => { goTo(i); restart(); });
    dotsWrap.appendChild(dot);
    return dot;
  });

  const goTo = (i) => {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (i + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  };

  const restart = () => {
    clearInterval(autoplay);
    if (!prefersReducedMotion) autoplay = setInterval(() => goTo(current + 1), 7000);
  };

  document.getElementById("tPrev").addEventListener("click", () => { goTo(current - 1); restart(); });
  document.getElementById("tNext").addEventListener("click", () => { goTo(current + 1); restart(); });

  const wrap = document.querySelector(".testimonial-wrap");
  wrap.addEventListener("mouseenter", () => clearInterval(autoplay));
  wrap.addEventListener("mouseleave", restart);
  restart();

  /* ---------- Consultation form (demo only — nothing is sent) ---------- */
  const form = document.getElementById("contactForm");
  const success = document.getElementById("formSuccess");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  const validators = {
    name: (v) => (v.trim().length >= 2 ? "" : "Please enter your name."),
    email: (v) => (emailPattern.test(v.trim()) ? "" : "Please enter a valid email address."),
    interest: (v) => (v ? "" : "Please select an area of interest."),
  };

  const validateField = (field) => {
    const check = validators[field.name];
    if (!check) return true;
    const message = check(field.value);
    const wrapper = field.closest(".field");
    wrapper.classList.toggle("has-error", Boolean(message));
    wrapper.querySelector(".error").textContent = message;
    return !message;
  };

  Object.keys(validators).forEach((name) => {
    const field = form.elements[name];
    field.addEventListener("blur", () => validateField(field));
    field.addEventListener("input", () => {
      if (field.closest(".field").classList.contains("has-error")) validateField(field);
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const results = Object.keys(validators).map((name) => validateField(form.elements[name]));
    if (results.every(Boolean)) {
      const btn = form.querySelector("button[type='submit']");
      btn.textContent = "Sending…";
      btn.disabled = true;
      setTimeout(() => {
        success.hidden = false;
        form.reset();
        btn.textContent = "Submit Request";
        btn.disabled = false;
      }, 900);
    } else {
      form.querySelector(".has-error input, .has-error select")?.focus();
    }
  });

  /* ---------- Footer year ---------- */
  document.getElementById("year").textContent = new Date().getFullYear();
});
