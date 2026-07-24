(() => {
  "use strict";

  document.documentElement.classList.add("js-ready");

  function setupSiteHero() {
    const intro = document.querySelector("#site-intro");
    const stage = document.querySelector("#intro-stage");
    const tearTop = document.querySelector("#intro-tear-top");
    const tearBottom = document.querySelector("#intro-tear-bottom");
    const reveal = document.querySelector("#intro-reveal");
    const finalLayer = document.querySelector("#intro-final");
    const hint = document.querySelector("#intro-scroll-hint");
    const typed = document.querySelector("#intro-typed");
    const finalContent = document.querySelector(".intro-final-content");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!intro || !stage || !tearTop || !tearBottom || !reveal || !finalLayer || !hint || !typed || !finalContent) return;

    const phrases = [
      "עם אישיות.",
      "עם לב.",
      "שמרגיש כמוכם.",
      "שנבנה בדיוק עבורכם.",
      "שעובד באמת."
    ];
    let phraseIndex = 0;
    let typingMode = "hold";
    let typingActive = false;
    let typingTimer = 0;
    let frameId = 0;
    let touchStartY = 0;
    const startComplete = reducedMotion || Boolean(window.location.hash && window.location.hash !== "#top") || window.scrollY > 2;
    let progress = startComplete ? 1 : 0;
    let targetProgress = progress;
    let unlocked = startComplete;
    const sensitivity = .0022;

    const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
    const easeInOut = (value) => value < .5
      ? 2 * value * value
      : 1 - Math.pow(-2 * value + 2, 2) / 2;

    function stopTyping(reset = false) {
      typingActive = false;
      window.clearTimeout(typingTimer);
      finalContent.classList.remove("is-editing");
      if (reset) {
        phraseIndex = 0;
        typingMode = "hold";
        typed.textContent = phrases[0];
      }
    }

    function typeStep() {
      if (!typingActive) return;

      if (typingMode === "hold") {
        typingMode = "delete";
        finalContent.classList.add("is-editing");
        typingTimer = window.setTimeout(typeStep, 1150);
        return;
      }

      if (typingMode === "delete") {
        const current = typed.textContent || "";
        if (current.length) {
          typed.textContent = current.slice(0, -1);
          typingTimer = window.setTimeout(typeStep, 48);
          return;
        }
        phraseIndex = (phraseIndex + 1) % phrases.length;
        typingMode = "type";
      }

      const target = phrases[phraseIndex];
      const current = typed.textContent || "";
      if (current.length < target.length) {
        typed.textContent = target.slice(0, current.length + 1);
        typingTimer = window.setTimeout(typeStep, 72);
        return;
      }

      typingMode = "hold";
      finalContent.classList.remove("is-editing");
      typingTimer = window.setTimeout(typeStep, 1450);
    }

    function startTyping() {
      if (typingActive || reducedMotion) return;
      typingActive = true;
      typingMode = "hold";
      typingTimer = window.setTimeout(typeStep, 900);
    }

    function render(value, heroIsVisible) {
      stage.classList.toggle("is-tearing", value > .002);

      const tearProgress = clamp(value / .42, 0, 1);
      const easedTear = easeInOut(tearProgress);
      tearTop.style.transform = `translateY(${-110 * easedTear}vh)`;
      tearBottom.style.transform = `translateY(${110 * easedTear}vh)`;

      const revealProgress = clamp(value / .65, 0, 1);
      const easedReveal = Math.pow(revealProgress, 1.5);
      const finalProgress = clamp((value - .58) / .18, 0, 1);
      reveal.style.opacity = String((1 - finalProgress) * Math.min(revealProgress * 1.5, 1));
      reveal.style.transform = `scale(${.86 + .14 * easedReveal})`;
      reveal.classList.toggle("is-visible", revealProgress > .08 && finalProgress < .92);

      finalLayer.style.opacity = String(finalProgress);
      finalLayer.style.transform = `scale(${.92 + .08 * finalProgress})`;
      hint.style.opacity = value > .02 ? "0" : ".72";
      document.body.classList.toggle("hero-opening", heroIsVisible && value < .55);

      if (heroIsVisible && finalProgress > .9) startTyping();
      else stopTyping(finalProgress < .72);
    }

    function animateIntro() {
      progress += (targetProgress - progress) * .2;
      if (Math.abs(targetProgress - progress) < .0005) progress = targetProgress;

      render(progress, window.scrollY < intro.offsetHeight);

      if (progress >= .999 && targetProgress >= 1) {
        progress = 1;
        targetProgress = 1;
        unlocked = true;
      }

      if (Math.abs(targetProgress - progress) > .0005) {
        frameId = requestAnimationFrame(animateIntro);
      } else {
        frameId = 0;
      }
    }

    function advanceIntro(delta) {
      if (unlocked && delta < 0) unlocked = false;
      const normalizedDelta = clamp(delta, -120, 120);
      targetProgress = clamp(targetProgress + normalizedDelta * sensitivity, 0, 1);
      if (targetProgress < .999) unlocked = false;
      if (!frameId) frameId = requestAnimationFrame(animateIntro);
    }

    window.addEventListener("wheel", (event) => {
      if (reducedMotion || window.scrollY > 1) return;
      if (!unlocked || event.deltaY < 0) {
        event.preventDefault();
        advanceIntro(event.deltaY);
      }
    }, { passive: false });

    window.addEventListener("touchstart", (event) => {
      touchStartY = event.touches[0].clientY;
    }, { passive: true });

    window.addEventListener("touchmove", (event) => {
      if (reducedMotion || window.scrollY > 1) return;
      const currentY = event.touches[0].clientY;
      const deltaY = touchStartY - currentY;
      touchStartY = currentY;
      if (!unlocked || deltaY < 0) {
        event.preventDefault();
        advanceIntro(deltaY * 2.2);
      }
    }, { passive: false });

    window.addEventListener("keydown", (event) => {
      if (reducedMotion || window.scrollY > 1) return;
      const forwardKeys = ["ArrowDown", "PageDown", " ", "End"];
      const backwardKeys = ["ArrowUp", "PageUp", "Home"];
      if (!forwardKeys.includes(event.key) && !backwardKeys.includes(event.key)) return;

      const delta = forwardKeys.includes(event.key)
        ? (event.key === "End" ? 1000 : 120)
        : (event.key === "Home" ? -1000 : -120);

      if (!unlocked || delta < 0) {
        event.preventDefault();
        advanceIntro(delta);
      }
    });

    const skipLink = intro.querySelector(".intro-skip");
    skipLink?.addEventListener("click", () => {
      progress = 1;
      targetProgress = 1;
      unlocked = true;
      render(1, true);
    });

    window.addEventListener("scroll", () => {
      render(progress, window.scrollY < intro.offsetHeight);
    }, { passive: true });

    window.addEventListener("resize", () => {
      render(progress, window.scrollY < intro.offsetHeight);
    });

    render(progress, true);
  }

  setupSiteHero();

  class ContactForm {
    constructor(form) {
      this.form = form;
      this.status = form.querySelector(".form-status");
      this.button = form.querySelector("button[type='submit']");
      form.addEventListener("submit", (event) => this.submit(event));
    }

    setStatus(message, error = false) {
      this.status.textContent = message;
      this.status.style.color = error ? "#9d3f23" : "#56654e";
    }

    async submit(event) {
      event.preventDefault();
      if (!this.form.reportValidity()) return;
      const endpoint = this.form.dataset.contactEndpoint || this.form.action;
      const original = this.button.innerHTML;
      this.button.disabled = true;
      this.button.textContent = "שולח...";
      this.setStatus("");

      try {
        const response = await fetch(endpoint, {
          method: "POST",
          body: new FormData(this.form),
          headers: { Accept: "application/json" }
        });
        if (!response.ok) throw new Error("request failed");
        this.form.reset();
        this.setStatus("תודה, הפרטים נשלחו. אחזור אליכם בהקדם.");
      } catch (_) {
        this.setStatus("לא הצלחתי לשלוח כרגע. אפשר לפנות אליי גם בוואטסאפ.", true);
      } finally {
        this.button.disabled = false;
        this.button.innerHTML = original;
      }
    }
  }

  document.querySelectorAll(".contact-form").forEach((form) => new ContactForm(form));

  const header = document.querySelector(".site-header");
  let previousY = window.scrollY;
  window.addEventListener("scroll", () => {
    const currentY = window.scrollY;
    header?.classList.toggle("is-hidden", currentY > previousY && currentY > 180);
    previousY = currentY;
  }, { passive: true });

  const navLinks = [...document.querySelectorAll(".site-header nav a")];
  const navTargets = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if ("IntersectionObserver" in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    }, { rootMargin: "-35% 0px -55%", threshold: 0 });
    navTargets.forEach((target) => sectionObserver.observe(target));
  }

  const revealTargets = [
    ...document.querySelectorAll(".reveal"),
    ...document.querySelectorAll(".process-list article")
  ];
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -12%", threshold: .08 });
    revealTargets.forEach((element, index) => {
      element.style.setProperty("--reveal-delay", `${(index % 3) * 70}ms`);
      revealObserver.observe(element);
    });
  }

  function setupProjectsCarousel() {
    const carousel = document.querySelector("[data-projects-carousel]");
    if (!carousel) return;

    const track = carousel.querySelector(".projects-collage");
    const slides = [...carousel.querySelectorAll(".project")];
    const previousButton = carousel.querySelector("[data-project-prev]");
    const nextButton = carousel.querySelector("[data-project-next]");
    const currentLabel = carousel.querySelector("[data-project-current]");
    const status = carousel.querySelector(".projects-status");
    if (slides.length < 2 || !track || !previousButton || !nextButton || !currentLabel || !status) return;

    let activeIndex = Math.max(0, slides.findIndex((slide) => slide.classList.contains("is-active")));
    let timerId = 0;
    let hovered = false;
    let focusWithin = false;
    let pointerStartX = null;

    const restartGif = (slide) => {
      const image = slide.querySelector(".monitor img");
      if (!image) return;
      const originalSrc = image.dataset.originalSrc || image.getAttribute("src");
      const replacement = image.cloneNode(false);
      replacement.dataset.originalSrc = originalSrc;
      replacement.src = originalSrc;
      image.replaceWith(replacement);
    };

    const scheduleNext = () => {
      window.clearTimeout(timerId);
      if (reduceMotion || hovered || focusWithin || document.hidden) return;
      const duration = Number(slides[activeIndex].dataset.duration) || 8000;
      timerId = window.setTimeout(() => showSlide(activeIndex + 1, false), duration);
    };

    const showSlide = (nextIndex, announce) => {
      activeIndex = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, index) => {
        const isActive = index === activeIndex;
        slide.classList.toggle("is-active", isActive);
        slide.setAttribute("aria-hidden", String(!isActive));
        if (isActive) slide.removeAttribute("tabindex");
        else slide.setAttribute("tabindex", "-1");
      });
      track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;
      status.setAttribute("aria-live", announce ? "polite" : "off");
      currentLabel.textContent = String(activeIndex + 1).padStart(2, "0");
      restartGif(slides[activeIndex]);
      scheduleNext();
    };

    previousButton.addEventListener("click", () => showSlide(activeIndex - 1, true));
    nextButton.addEventListener("click", () => showSlide(activeIndex + 1, true));

    carousel.addEventListener("mouseenter", () => {
      hovered = true;
      window.clearTimeout(timerId);
    });
    carousel.addEventListener("mouseleave", () => {
      hovered = false;
      scheduleNext();
    });
    carousel.addEventListener("focusin", () => {
      focusWithin = true;
      window.clearTimeout(timerId);
    });
    carousel.addEventListener("focusout", () => {
      window.setTimeout(() => {
        if (carousel.contains(document.activeElement)) return;
        focusWithin = false;
        scheduleNext();
      }, 0);
    });
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showSlide(activeIndex + 1, true);
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showSlide(activeIndex - 1, true);
      }
    });
    carousel.addEventListener("pointerdown", (event) => {
      pointerStartX = event.clientX;
    }, { passive: true });
    carousel.addEventListener("pointerup", (event) => {
      if (pointerStartX === null) return;
      const distance = event.clientX - pointerStartX;
      pointerStartX = null;
      if (Math.abs(distance) < 48) return;
      showSlide(activeIndex + (distance < 0 ? 1 : -1), true);
    }, { passive: true });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) window.clearTimeout(timerId);
      else scheduleNext();
    });

    showSlide(activeIndex, false);
  }

  setupProjectsCarousel();

  function wait(milliseconds) {
    return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
  }

  async function runEditorLoop() {
    const before = document.querySelector(".screen-before");
    const after = document.querySelector(".screen-after");
    const cursor = document.querySelector(".edit-cursor");
    const highlight = document.querySelector(".edit-highlight");
    const caret = document.querySelector(".typing-caret");
    const label = document.querySelector(".screen-state");
    if (!before || !after || !cursor || !highlight || !caret || !label) return;

    while (true) {
      label.textContent = "לפני";
      before.style.opacity = "1";
      before.style.filter = "none";
      after.style.clipPath = "inset(0 100% 0 0 round 4px)";
      cursor.style.opacity = "0";
      highlight.style.opacity = "0";
      caret.style.opacity = "0";
      await wait(850);
      await cursor.animate([{ opacity: 0, transform: "translate(26px,-14px)" }, { opacity: 1, transform: "translate(0,0)" }], { duration: 420, fill: "forwards", easing: "ease-out" }).finished;
      highlight.animate([{ opacity: 0, transform: "scaleX(.08)" }, { opacity: 1, transform: "scaleX(1)" }], { duration: 470, fill: "forwards", easing: "ease-out" });
      await wait(520);
      cursor.animate([{ transform: "translate(0,0)" }, { transform: "translate(-42px,28px)" }], { duration: 500, fill: "forwards", easing: "ease-in-out" });
      before.animate([{ opacity: 1, filter: "none" }, { opacity: .32, filter: "grayscale(.45)" }], { duration: 360, fill: "forwards" });
      await wait(400);
      highlight.style.opacity = "0";
      caret.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }, { opacity: 1 }], { duration: 560, iterations: 2 });
      await after.animate([{ clipPath: "inset(0 100% 0 0 round 4px)" }, { clipPath: "inset(0 0% 0 0 round 4px)" }], { duration: 1150, fill: "forwards", easing: "cubic-bezier(.65,0,.35,1)" }).finished;
      label.textContent = "אחרי";
      cursor.style.opacity = "0";
      caret.style.opacity = "0";
      await wait(2300);
      await after.animate([{ clipPath: "inset(0 0 0 0 round 4px)" }, { clipPath: "inset(0 0 0 100% round 4px)" }], { duration: 650, fill: "forwards", easing: "ease-in-out" }).finished;
    }
  }

  async function runWordLoop() {
    const stage = document.querySelector(".word-stage");
    const drafts = document.querySelector(".word-drafts");
    const words = document.querySelector(".word-show");
    const cursor = document.querySelector(".word-cursor");
    if (!stage || !drafts || !words || !cursor) return;

    await new Promise((resolve) => {
      const observer = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        observer.disconnect();
        resolve();
      }, { threshold: .35 });
      observer.observe(stage);
    });

    await wait(3200);
    while (true) {
      words.getAnimations().forEach((animation) => animation.cancel());
      cursor.classList.remove("is-live");
      await words.animate([{ opacity: 1 }, { opacity: 0 }], {
        duration: 350,
        fill: "forwards",
        easing: "ease-in-out"
      }).finished;
      await wait(350);

      words.getAnimations().forEach((animation) => animation.cancel());
      drafts.className = "word-drafts";
      words.className = "word-show";
      cursor.className = "word-cursor is-live";
      await wait(1100);
      drafts.classList.add("is-erasing");
      await wait(900);
      drafts.classList.add("is-gone");
      words.classList.add("is-live");
      await wait(1150);
      words.classList.add("is-settled");
      await wait(5200);
    }
  }

  if (!reduceMotion) {
    runEditorLoop();
    runWordLoop();
  } else {
    const label = document.querySelector(".screen-state");
    if (label) label.textContent = "אחרי";
    const iterationVideo = document.querySelector(".iteration-video video");
    if (iterationVideo) iterationVideo.pause();
  }
})();
