const header = document.querySelector('.site-header');
const progressBar = document.querySelector('.progress span');

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

function initEyeCatcher() {
  if (!window.gsap || !window.ScrollTrigger) return;

  gsap.registerPlugin(ScrollTrigger);
  const words = gsap.utils.toArray('.eye-catcher span');
  if (!words.length) return;

  const timeline = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      id: 'eye-catcher-only',
      trigger: '.eye-catcher',
      start: 'top 100%',
      end: 'top 58%',
      scrub: .4,
      invalidateOnRefresh: true,
    },
  });

  words.forEach((word, index) => {
    timeline.fromTo(
      word,
      {
        x: (index % 2 ? -1 : 1) * innerWidth * (innerWidth < 700 ? .72 : .58),
        autoAlpha: 0,
      },
      { x: 0, autoAlpha: 1, duration: 1 },
      index * .18
    );
  });

  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

new PageChrome().init();
new ContactForm(document.querySelector('.contact-form')).init();
initEyeCatcher();
