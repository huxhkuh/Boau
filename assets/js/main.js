const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.progress span');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function loadCinematicStyles() {
  if (document.querySelector('link[data-cinematic-v2]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'assets/css/cinematic-v2.css';
  link.dataset.cinematicV2 = 'true';
  document.head.appendChild(link);
}

class PageChrome {
  init() {
    let ticking = false;
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const progress = Math.max(0, Math.min(1, scrollY / max));
      progressBar?.style.setProperty('transform', `scaleX(${progress})`);
      header?.classList.toggle('scrolled', scrollY > 32);
      ticking = false;
    };
    const request = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };
    addEventListener('scroll', request, { passive: true });
    addEventListener('resize', request, { passive: true });
    update();
  }
}

class ContactForm {
  constructor(form) {
    this.form = form;
    this.status = form?.querySelector('.form-status');
    this.button = form?.querySelector('button[type="submit"]');
    this.endpoint = form?.dataset.contactEndpoint?.trim();
  }
  init() {
    if (!this.form || !this.endpoint) return;
    this.form.addEventListener('submit', (event) => this.submit(event));
  }
  setStatus(message, error = false) {
    if (!this.status) return;
    this.status.textContent = message;
    this.status.classList.toggle('error', error);
  }
  async submit(event) {
    event.preventDefault();
    const payload = Object.fromEntries(new FormData(this.form).entries());
    payload.pageUrl = location.href;
    if (payload.company) {
      this.form.reset();
      return;
    }
    this.setStatus('שולח את הפרטים...');
    this.button.disabled = true;
    try {
      const response = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error('Request failed');
      this.setStatus('קיבלתי את הפרטים. אחזור אליכם בהקדם.');
      this.form.reset();
    } catch {
      this.setStatus('משהו בשליחה לא עבד. אפשר לנסות שוב בעוד רגע.', true);
    } finally {
      this.button.disabled = false;
    }
  }
}

class CinematicOpening {
  constructor() {
    this.gsap = window.gsap;
    this.ScrollTrigger = window.ScrollTrigger;
    this.mm = null;
  }

  init() {
    if (!this.gsap || !this.ScrollTrigger || reduceMotion) return;
    this.gsap.registerPlugin(this.ScrollTrigger);
    this.mm = this.gsap.matchMedia();
    this.mm.add('(min-width: 981px)', () => this.desktop());
    this.mm.add('(max-width: 980px)', () => this.mobile());
    document.fonts?.ready.then(() => this.ScrollTrigger.refresh());
    addEventListener('load', () => this.ScrollTrigger.refresh(), { once: true });
  }

  prepare() {
    const g = this.gsap;
    g.set('.opening-summary', { autoAlpha: 0 });
    g.set('.shot-wide', { autoAlpha: 1, scale: 1.02, xPercent: 0, yPercent: 0 });
    g.set('.shot-close', { autoAlpha: 0, scale: 1.04, xPercent: 2, yPercent: 1 });
    g.set('.shot-digital', { autoAlpha: 0, scale: 1.16, clipPath: 'circle(4% at 57% 61%)' });
    g.set('.opening-grid', { autoAlpha: .12, scale: 1.02 });
    g.set('.room-light', { autoAlpha: .24, scale: .9 });
    g.set('.wall-frame-one', { xPercent: -5 });
    g.set('.wall-frame-two', { xPercent: 7 });
  }

  desktop() {
    const g = this.gsap;
    this.prepare();

    const tl = g.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'boau-camera-journey',
        trigger: '.opening-story',
        start: 'top top',
        end: 'bottom bottom',
        scrub: .42,
        invalidateOnRefresh: true,
      },
    });

    tl.addLabel('wide', 0)
      .to('.shot-wide', { scale: 1.11, xPercent: -1.5, yPercent: -1.2, duration: 1.2 }, 'wide')
      .to('.opening-grid', { scale: 1.08, xPercent: -1, duration: 1.2 }, 'wide')
      .to('.room-light', { scale: 1.12, xPercent: 8, duration: 1.2 }, 'wide')
      .to('.wall-frame-one', { xPercent: -18, duration: 1.2 }, 'wide')
      .to('.wall-frame-two', { xPercent: 22, duration: 1.2 }, 'wide')
      .to('.opening-intro', { yPercent: -11, scale: .97, duration: .8 }, 'wide+=.2')
      .to('.opening-intro', { autoAlpha: 0, yPercent: -28, duration: .5 }, 'wide+=.95')

      .addLabel('shoulder', 1.15)
      .to('.shot-close', { autoAlpha: 1, scale: 1.08, xPercent: 0, yPercent: 0, duration: .65 }, 'shoulder')
      .to('.shot-wide', { autoAlpha: 0, scale: 1.18, duration: .65 }, 'shoulder')
      .to('.cinematic-shots', { xPercent: -2.2, scale: 1.035, duration: .9 }, 'shoulder')
      .to('.cinema-light-leak', { xPercent: 28, autoAlpha: .55, duration: .9 }, 'shoulder')

      .addLabel('story', 1.72)
      .to('.opening-summary', { autoAlpha: 1, duration: .22 }, 'story')
      .fromTo('.summary-prompt', { x: -45, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: .35 }, 'story')
      .fromTo('.summary-result', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .28 }, 'story+=.3')
      .fromTo('.summary-pretty', { y: 28, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: .28 }, 'story+=.62')
      .fromTo('.summary-flat p', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .11, duration: .24 }, 'story+=.92')
      .to('.shot-close img', { filter: 'saturate(.18) contrast(1.14) brightness(.56)', duration: .7 }, 'story+=1.08')
      .to('.room-light', { autoAlpha: .08, duration: .6 }, 'story+=1.08')

      .addLabel('align', 3.05)
      .to('.opening-summary', { autoAlpha: 0, y: -42, duration: .32 }, 'align')
      .to('.cinematic-shots', { xPercent: 0, scale: 1.16, transformOrigin: '57% 61%', duration: .65 }, 'align')
      .to('.shot-close img', { scale: 1.2, xPercent: 1.5, yPercent: 1, duration: .65 }, 'align')
      .to('.opening-grid, .wall-frame, .room-light', { autoAlpha: 0, duration: .35 }, 'align+=.2')

      .addLabel('dive', 3.66)
      .to('.shot-digital', {
        autoAlpha: 1,
        scale: 1,
        clipPath: 'circle(78% at 57% 61%)',
        duration: .72,
      }, 'dive')
      .to('.shot-close', { scale: 1.42, autoAlpha: 0, duration: .72 }, 'dive')
      .to('.cinematic-shots', { scale: 1.04, duration: .72 }, 'dive')
      .to('.cinema-vignette', { autoAlpha: .25, duration: .5 }, 'dive+=.2')
      .to('.cinema-light-leak', { autoAlpha: 0, duration: .4 }, 'dive+=.3');

    return () => tl.kill();
  }

  mobile() {
    const g = this.gsap;
    this.prepare();

    const tl = g.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'boau-camera-mobile',
        trigger: '.opening-story',
        start: 'top top',
        end: 'bottom bottom',
        scrub: .34,
        invalidateOnRefresh: true,
      },
    });

    tl.to('.shot-wide', { scale: 1.13, xPercent: -3, duration: 1 })
      .to('.opening-intro', { autoAlpha: 0, y: -55, duration: .38 }, '<.5')
      .to('.shot-close', { autoAlpha: 1, scale: 1.08, duration: .5 }, '<.08')
      .to('.shot-wide', { autoAlpha: 0, duration: .5 }, '<')
      .to('.opening-summary', { autoAlpha: 1, duration: .2 })
      .fromTo('.opening-summary > div', { y: 22, autoAlpha: 0 }, { y: 0, autoAlpha: 1, stagger: .12, duration: .3 })
      .to('.opening-summary', { autoAlpha: 0, y: -28, duration: .25 })
      .to('.shot-digital', { autoAlpha: 1, scale: 1, clipPath: 'circle(90% at 57% 61%)', duration: .65 })
      .to('.shot-close', { autoAlpha: 0, scale: 1.35, duration: .65 }, '<');

    return () => tl.kill();
  }
}

function initEyeCatcher() {
  if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
  const words = gsap.utils.toArray('.eye-catcher span');
  if (!words.length) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'eye-catcher-only',
      trigger: '.eye-catcher',
      start: 'top 92%',
      end: 'bottom 28%',
      scrub: .38,
      invalidateOnRefresh: true,
    },
  });

  words.forEach((word, index) => {
    timeline.fromTo(
      word,
      {
        x: (index % 2 ? -1 : 1) * innerWidth * (innerWidth < 700 ? .58 : .42),
        autoAlpha: 0,
      },
      { x: 0, autoAlpha: 1, duration: 1 },
      index * .22
    );
  });
}

function initSectionReveals() {
  if (!window.gsap || !window.ScrollTrigger || reduceMotion) return;
  const sections = document.querySelectorAll('.problem, .bridge, .craft, .process, .result, .finale');
  sections.forEach((section) => {
    const targets = section.querySelectorAll('h2, h3, p, .craft-number, .visual-language, .iterations, .contact-form');
    if (!targets.length) return;
    gsap.from(targets, {
      y: 34,
      autoAlpha: 0,
      stagger: .035,
      duration: .7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        toggleActions: 'play none none none',
      },
    });
  });
}

loadCinematicStyles();
new PageChrome().init();
new ContactForm(document.querySelector('.contact-form')).init();
new CinematicOpening().init();
initEyeCatcher();
initSectionReveals();
