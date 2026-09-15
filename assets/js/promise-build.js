(() => {
  "use strict";

  const section = document.querySelector(".promise-build");
  if (!section || !Element.prototype.animate) return;

  const track = section.querySelector(".build-scroll");
  const stage = section.querySelector(".build-stage");
  const visual = section.querySelector(".build-visual");
  const browser = section.querySelector(".build-browser");
  const steps = [...section.querySelectorAll("[data-build-step]")];
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = window.matchMedia("(min-width: 901px) and (min-height: 650px)");
  const animations = [];
  const clamp = (value) => Math.max(0, Math.min(1, value));
  let frame = 0;
  let pinned = false;
  let observing = true;
  let activeStep = -1;
  const film = section.querySelector("[data-build-film]");
  let filmReady = false;
  let filmStarted = false;
  let filmTarget = 0;

  function seekFilm(progress) {
    filmTarget = progress * 6.5;
    if (!filmReady || film.seeking) return;
    if (Math.abs(film.currentTime - filmTarget) > 1 / 30) {
      film.currentTime = filmTarget;
    } else {
      section.classList.add("has-build-film");
    }
  }

  function loadFilm() {
    if (!film || filmStarted) return;
    filmStarted = true;
    film.src = film.dataset.src;
    film.load();
  }

  if (film) {
    film.addEventListener("loadeddata", () => {
      filmReady = true;
      seekFilm(filmTarget / 6.5);
    });
    film.addEventListener("seeked", () => {
      // Coalesce scroll events while the browser decodes the latest target.
      seekFilm(filmTarget / 6.5);
    });
    film.addEventListener("error", () => {
      filmReady = false;
      section.classList.remove("has-build-film");
    });
  }

  function animatePart(name, start, end, from, to = {}) {
    const element = section.querySelector(`[data-build-part="${name}"]`);
    const animation = element.animate([
      { opacity: 0, transform: "translateY(18px)", ...from },
      { opacity: 1, transform: "none", ...to }
    ], { duration: 1000, fill: "both", easing: "cubic-bezier(.22, 1, .36, 1)" });
    animation.pause();
    animations.push({ animation, start, end });
  }

  animatePart("brand", .05, .2, { transform: "translateY(-12px)" });
  animatePart("nav", .08, .25, { transform: "scaleX(.5)", transformOrigin: "right" });
  animatePart("title", .14, .41, { transform: "translate(25px, 12px)", clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" });
  animatePart("type-sample", .18, .37, { transform: "translate(20px, -15px) rotate(16deg)" }, { transform: "rotate(7deg)" });
  animatePart("palette", .26, .48, { transform: "translate(-28px, 15px) rotate(-15deg)" }, { transform: "rotate(-6deg)" });
  animatePart("image", .35, .64, { transform: "translate(-20px, 18px) scale(.93)", clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0)" });
  animatePart("copy", .46, .67, { transform: "scaleX(.3)", transformOrigin: "right" });
  animatePart("button", .6, .81, { transform: "translateY(14px) scale(.92)" });
  animatePart("caption", .67, .85, { transform: "translateY(10px)" });
  animatePart("nav-dot", .7, .88, { transform: "scale(.4)" });
  animatePart("details", .72, .94, { transform: "translateY(15px)" });

  const selection = section.querySelector(".build-selection");
  const selectionAnimation = selection.animate([
    { opacity: 0, offset: 0 },
    { opacity: .75, offset: .25 },
    { opacity: .75, offset: .65 },
    { opacity: 0, offset: 1 }
  ], { duration: 1000, fill: "both" });
  selectionAnimation.pause();
  animations.push({ animation: selectionAnimation, start: .69, end: 1 });

  function render(progress) {
    seekFilm(progress);
    animations.forEach(({ animation, start, end }) => {
      animation.currentTime = clamp((progress - start) / (end - start)) * 1000;
    });
    section.style.setProperty("--wire-opacity", String(1 - clamp((progress - .14) / .25)));
    section.style.setProperty("--grid-opacity", String(.8 - progress * .5));
    section.style.setProperty("--meter-progress", String(progress));
    const tilt = reducedMotion.matches ? 0 : 1 - progress;
    browser.style.transform = `perspective(1200px) rotateY(${-4 * tilt}deg) rotateX(${2 * tilt}deg) rotateZ(${-1.5 * tilt}deg)`;
    const nextStep = progress < .34 ? 0 : progress < .67 ? 1 : 2;
    if (nextStep !== activeStep) {
      steps.forEach((step, index) => step.classList.toggle("is-current", index === nextStep));
      activeStep = nextStep;
    }
  }

  function update() {
    frame = 0;
    if (reducedMotion.matches) return;
    let progress;
    if (pinned) {
      const bounds = track.getBoundingClientRect();
      // Let the complete stage settle into view before assembling, then hold the result.
      const distance = bounds.height - stage.offsetHeight;
      const leadIn = stage.offsetHeight * .15;
      progress = clamp((-bounds.top - leadIn) / Math.max(1, distance * .9 - leadIn));
    } else {
      // Keep the opening frame until the illustration is well inside the viewport.
      const bounds = visual.getBoundingClientRect();
      const distance = Math.min(bounds.height * .9, window.innerHeight * .64);
      progress = clamp((window.innerHeight * .65 - bounds.top) / Math.max(1, distance));
    }
    render(progress);
  }

  function schedule() {
    if (!frame && observing && !reducedMotion.matches) frame = requestAnimationFrame(update);
  }

  function configure() {
    section.classList.remove("is-scroll-built");
    pinned = false;
    // Also fall back for text zoom or a viewport too short for the copy.
    if (desktop.matches && !reducedMotion.matches) {
      const requiredHeight = Math.max(section.querySelector(".promise-inner").offsetHeight, visual.offsetHeight, browser.offsetHeight) + 80;
      pinned = requiredHeight <= window.innerHeight;
    }
    section.classList.toggle("is-scroll-built", pinned);
    if (reducedMotion.matches) {
      render(1);
      steps.forEach((step) => step.classList.remove("is-current"));
      activeStep = -1;
    } else {
      update();
    }
  }

  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", configure, { passive: true });
  window.addEventListener("pageshow", configure);
  reducedMotion.addEventListener("change", configure);
  desktop.addEventListener("change", configure);
  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(([entry]) => {
      observing = entry.isIntersecting;
      if (observing) { loadFilm(); schedule(); }
    }, { rootMargin: "100% 0px" });
    observer.observe(track);
  } else {
    loadFilm();
  }
  document.fonts.ready.then(configure);
  configure();
})();
