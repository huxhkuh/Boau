const root = document.documentElement;
const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.progress span');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class PageChrome {
  init() {
    const update = () => {
      const max = Math.max(document.documentElement.scrollHeight - innerHeight, 1);
      const progress = Math.max(0, Math.min(1, scrollY / max));
      progressBar?.style.setProperty('transform', `scaleX(${progress})`);
      root.style.setProperty('--journey-progress', progress.toFixed(4));
      header?.classList.toggle('scrolled', scrollY > 32);
    };
    let ticking = false;
    const request = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { update(); ticking = false; });
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
    if (payload.company) { this.form.reset(); return; }
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

class ContinuousJourney {
  constructor(gsap, ScrollTrigger) {
    this.gsap = gsap;
    this.ScrollTrigger = ScrollTrigger;
    this.mm = null;
  }
  init() {
    if (!this.gsap || !this.ScrollTrigger || reduceMotion) {
      root.classList.add('reduced-motion');
      return;
    }
    this.gsap.registerPlugin(this.ScrollTrigger);
    root.classList.add('js-ready');
    this.mm = this.gsap.matchMedia();
    this.mm.add('(min-width: 981px)', () => this.desktop());
    this.mm.add('(max-width: 980px)', () => this.mobile());
    document.fonts?.ready.then(() => this.ScrollTrigger.refresh());
    addEventListener('load', () => this.ScrollTrigger.refresh(), { once: true });
  }
  desktop() {
    const g = this.gsap;
    g.set('.opening-summary', { autoAlpha: 0, y: 42 });
    g.set('.shot-wide', { autoAlpha: 1, scale: 1.03 });

    g.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        id: 'continuous-opening', trigger: '.opening-story', start: 'top top',
        end: 'bottom bottom', scrub: 1.05, invalidateOnRefresh: true,
      },
    })
      .addLabel('title')
      .to('.opening-intro', { yPercent: -10, scale: .97, duration: .8 })
      .to('.cinema-shot img', { scale: 1.13, duration: .8 }, '<')
      .to('.opening-intro', { autoAlpha: 0, yPercent: -34, duration: .55 })
      .to('.opening-summary', { autoAlpha: 1, y: 0, duration: .55 }, '<.12')
      .from('.summary-prompt', { xPercent: 8, duration: .45 }, '<')
      .from('.summary-result', { xPercent: -14, duration: .35 }, '<.1')
      .from('.summary-pretty p', { autoAlpha: 0, y: 18, stagger: .08, duration: .25 })
      .from('.summary-flat p', { autoAlpha: 0, y: 22, stagger: .09, duration: .32 })
      .to('.opening-summary', { scale: .965, duration: .55 })
      .to('.opening-summary', { autoAlpha: 0, y: -55, duration: .45 })
      .to('.cinema-shot img', { scale: 1.22, opacity: .08, duration: .45 }, '<');

    g.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { id: 'continuous-disconnect', trigger: '.disconnect', start: 'top top', end: 'bottom bottom', scrub: 1 },
    })
      .to('.digital-interior', { clipPath: 'inset(0 0% 0 0%)', duration: .45 })
      .from('.reveal-kicker', { autoAlpha: 0, y: 70, duration: .28 }, '<.08')
      .from('.human-line', { xPercent: 80, autoAlpha: 0, duration: .48 })
      .from('.machine-line', { xPercent: -80, autoAlpha: 0, duration: .48 }, '<')
      .to('.digital-interior', { scale: 1.12, opacity: .2, duration: .35 })
      .to('.reveal-kicker, .split-sentence', { autoAlpha: 0, y: -45, duration: .25 }, '<.12');

    this.reveal('.editorial-copy > p', '.problem', { y: 70, stagger: .18 });
    this.reveal('.bridge-question, .bridge-answer, .build-fast, .manifesto, .camera-analogy', '.bridge', { y: 80, stagger: .18 });
    this.reveal('.craft h2', '.craft', { y: 70 });

    document.querySelectorAll('.craft-card').forEach((card) => {
      g.from(card.querySelectorAll('.craft-number, .craft-copy, .visual-language, .iterations'), {
        autoAlpha: 0, y: 75, stagger: .12, ease: 'none',
        scrollTrigger: { trigger: card, start: 'top 82%', end: 'center 55%', scrub: .8 },
      });
    });

    g.from('.eye-catcher span', {
      x: (index) => (index % 2 ? -1 : 1) * innerWidth * .9,
      autoAlpha: 0, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: '.eye-catcher', start: 'top 85%', end: 'bottom 20%', scrub: 1 },
    });

    g.to('.process-rail span', {
      scaleY: 1, ease: 'none',
      scrollTrigger: { trigger: '.process-grid', start: 'top 70%', end: 'bottom 40%', scrub: true },
    });
    document.querySelectorAll('.process-step').forEach((step) => {
      g.from(step, {
        autoAlpha: 0, y: 80, ease: 'none',
        scrollTrigger: { trigger: step, start: 'top 86%', end: 'center 60%', scrub: .7 },
      });
    });

    this.gallery();
    this.reveal('.result-copy > *', '.result', { y: 80, stagger: .12 });
    this.reveal('.finale-copy > *, .contact-form', '.finale', { y: 65, stagger: .1 });
    g.fromTo('.finale-mark', { xPercent: 18 }, { xPercent: -8, ease: 'none', scrollTrigger: { trigger: '.finale-mark', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  }
  reveal(targets, trigger, options = {}) {
    const { y = 60, stagger = .1 } = options;
    this.gsap.from(targets, {
      autoAlpha: 0, y, stagger, ease: 'none',
      scrollTrigger: { trigger, start: 'top 82%', end: 'center 48%', scrub: .75 },
    });
  }
  gallery() {
    const g = this.gsap;
    const track = document.querySelector('.projects-track');
    if (!track) return;
    g.to(track, {
      x: () => -(track.scrollWidth - innerWidth),
      ease: 'none',
      scrollTrigger: {
        id: 'continuous-gallery', trigger: '.projects', start: 'top top', end: 'bottom bottom',
        scrub: 1, invalidateOnRefresh: true,
        onUpdate: self => g.set('.projects-progress span', { scaleX: self.progress }),
      },
    });
  }
  mobile() {
    const g = this.gsap;
    g.set('.opening-summary', { autoAlpha: 0 });
    g.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: '.opening-story', start: 'top top', end: 'bottom bottom', scrub: .7 },
    })
      .to('.opening-intro', { autoAlpha: 0, y: -50, duration: .4 })
      .to('.opening-summary', { autoAlpha: 1, duration: .35 }, '<.12')
      .from('.opening-summary > div', { autoAlpha: 0, y: 24, stagger: .1, duration: .4 }, '<')
      .to('.opening-summary', { autoAlpha: 0, y: -30, duration: .25 });

    g.from('.reveal-kicker, .split-sentence p', {
      autoAlpha: 0, y: 45, stagger: .12, ease: 'none',
      scrollTrigger: { trigger: '.disconnect', start: 'top 75%', end: 'center 40%', scrub: .7 },
    });
    document.querySelectorAll('.editorial-copy > p, .bridge > div, .craft-card, .process-step, .result-copy > *, .finale-copy > *, .contact-form').forEach((element) => {
      g.from(element, { autoAlpha: 0, y: 45, duration: .7, scrollTrigger: { trigger: element, start: 'top 90%', toggleActions: 'play none none reverse' } });
    });
    g.from('.eye-catcher span', {
      x: index => (index % 2 ? -1 : 1) * innerWidth,
      autoAlpha: 0, stagger: .08, ease: 'none',
      scrollTrigger: { trigger: '.eye-catcher', start: 'top 90%', end: 'bottom 15%', scrub: .65 },
    });
    this.gallery();
  }
}

new PageChrome().init();
new ContactForm(document.querySelector('.contact-form')).init();
new ContinuousJourney(window.gsap, window.ScrollTrigger).init();
