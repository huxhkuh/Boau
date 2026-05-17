const words = document.querySelectorAll('.rotating-word');
let current = 0;

function rotate() {
  if (!words.length) return;

  words[current].classList.remove('active');
  words[current].classList.add('exit');

  const previous = current;
  window.setTimeout(() => words[previous].classList.remove('exit'), 600);

  current = (current + 1) % words.length;
  words[current].classList.add('active');
}

if (words.length > 1 && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  window.setInterval(rotate, 1700);
}

const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach((el, index) => {
    el.style.transitionDelay = `${(index % 4) * 0.08}s`;
    observer.observe(el);
  });
} else {
  revealEls.forEach((el) => el.classList.add('visible'));
}

document.getElementById('year').textContent = new Date().getFullYear();
