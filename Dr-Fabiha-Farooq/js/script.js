(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nav = document.getElementById("site-nav");
  const toggle = document.querySelector(".nav__toggle");
  const mobile = document.getElementById("mobile-menu");
  const progress = document.querySelector(".scroll-progress span");
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  requestAnimationFrame(() => document.body.classList.add("is-loaded"));

  const closeMenu = () => {
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
    mobile.hidden = true;
  };

  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    mobile.hidden = !open;
  });

  mobile.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const ratio = max > 0 ? window.scrollY / max : 0;
    progress.style.width = `${Math.min(100, ratio * 100)}%`;
    nav.classList.toggle("is-scrolled", window.scrollY > 24);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const sections = [...document.querySelectorAll("main section[id]")];
  const navLinks = [...document.querySelectorAll(".nav__links a")];
  const setActive = () => {
    const y = window.scrollY + 120;
    let current = "home";
    sections.forEach((sec) => {
      if (sec.offsetTop <= y) current = sec.id;
    });
    const map = { story: "home", approach: "home", confidence: "home", values: "about", "next-step": "contact", booking: "contact" };
    const key = map[current] || current;
    navLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === `#${key}`));
  };
  window.addEventListener("scroll", setActive, { passive: true });
  setActive();

  const reveal = document.querySelectorAll(".chapter, .treat, .about, .values article, .reviews, .cta-band, .booking, .contact, .reveal-mask");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.16, rootMargin: "0px 0px -8% 0px" });
    reveal.forEach((el) => io.observe(el));
  } else {
    reveal.forEach((el) => el.classList.add("is-in"));
  }

  const parallaxImgs = document.querySelectorAll("[data-parallax]");
  const toothStages = document.querySelectorAll("[data-tooth-stage]");
  let ticking = false;
  const parallax = () => {
    ticking = false;
    if (reduce || window.innerWidth < 800) return;
    const y = window.scrollY;
    parallaxImgs.forEach((img) => {
      const rect = img.parentElement.getBoundingClientRect();
      const shift = (rect.top - window.innerHeight * 0.4) * -0.08;
      img.style.transform = `scale(1.12) translateY(${shift}px)`;
    });
    toothStages.forEach((stage, i) => {
      const extra = Math.sin((y + i * 180) / 420) * 8;
      stage.style.setProperty("--par", `${extra}px`);
      stage.style.translate = `0 ${extra}px`;
    });
  };
  window.addEventListener("scroll", () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(parallax);
    }
  }, { passive: true });

  const reviews = [...document.querySelectorAll(".review")];
  let reviewIndex = 0;
  const showReview = (i) => {
    reviews.forEach((el, n) => el.classList.toggle("is-active", n === i));
  };
  document.querySelector(".review-next")?.addEventListener("click", () => {
    reviewIndex = (reviewIndex + 1) % reviews.length;
    showReview(reviewIndex);
  });
  document.querySelector(".review-prev")?.addEventListener("click", () => {
    reviewIndex = (reviewIndex - 1 + reviews.length) % reviews.length;
    showReview(reviewIndex);
  });
  if (!reduce && reviews.length > 1) {
    setInterval(() => {
      reviewIndex = (reviewIndex + 1) % reviews.length;
      showReview(reviewIndex);
    }, 7000);
  }

  document.querySelectorAll("[data-treat]").forEach((link) => {
    link.addEventListener("click", () => {
      const select = document.getElementById("treatment");
      if (select) select.value = link.getAttribute("data-treat");
    });
  });

  const form = document.getElementById("booking-form");
  const status = document.getElementById("form-status");
  const dateInput = document.getElementById("date");
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    dateInput.min = tomorrow.toISOString().slice(0, 10);
  }

  const setError = (id, message) => {
    const field = document.getElementById(id)?.closest(".field");
    const err = document.querySelector(`[data-error-for="${id}"]`);
    if (field) field.classList.toggle("is-invalid", Boolean(message));
    if (err) err.textContent = message || "";
  };

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    const name = document.getElementById("full-name");
    const phone = document.getElementById("phone");
    const treatment = document.getElementById("treatment");
    const date = document.getElementById("date");
    let valid = true;

    if (!name.value.trim() || name.value.trim().length < 2) {
      setError("full-name", "Please enter your full name.");
      valid = false;
    } else setError("full-name", "");

    const phoneVal = phone.value.replace(/\s/g, "");
    if (!/^\+?[0-9]{10,14}$/.test(phoneVal)) {
      setError("phone", "Enter a valid phone number, including country code if possible.");
      valid = false;
    } else setError("phone", "");

    if (!treatment.value) {
      setError("treatment", "Please choose a preferred treatment.");
      valid = false;
    } else setError("treatment", "");

    if (!date.value) {
      setError("date", "Please choose a preferred date.");
      valid = false;
    } else setError("date", "");

    if (!valid) {
      status.textContent = "Please correct the highlighted fields.";
      status.classList.remove("is-demo");
      return;
    }

    status.classList.add("is-demo");
    status.textContent = "Demo only — this enquiry was not sent and no appointment has been booked. Connect a form service before launch, or call +92 324 7629039.";
  });

})();
