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

const gallery = document.querySelector('.works-gallery');

if (gallery) {
  const track = gallery.querySelector('.works-track');
  const cards = [...gallery.querySelectorAll('.work-card')];
  const nextButton = gallery.querySelector('.gallery-arrow-next');
  const prevButton = gallery.querySelector('.gallery-arrow-prev');
  const dots = [...gallery.querySelectorAll('.gallery-dots span')];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let activeIndex = 0;
  let autoplay;

  function setActive(index) {
    activeIndex = (index + cards.length) % cards.length;
    dots.forEach((dot, dotIndex) => dot.classList.toggle('active', dotIndex === activeIndex));
  }

  function goToSlide(index) {
    if (!cards.length) return;
    setActive(index);
    cards[activeIndex].scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', inline: 'center', block: 'nearest' });
  }

  function updateActiveFromScroll() {
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    const closestIndex = cards.reduce((closest, card, index) => {
      const rect = card.getBoundingClientRect();
      const distance = Math.abs(rect.left + rect.width / 2 - trackCenter);
      return distance < closest.distance ? { index, distance } : closest;
    }, { index: activeIndex, distance: Infinity }).index;

    setActive(closestIndex);
  }

  function resetAutoplay() {
    if (autoplay) window.clearInterval(autoplay);
    if (!reducedMotion && cards.length > 1) {
      autoplay = window.setInterval(() => goToSlide(activeIndex + 1), 4200);
    }
  }

  nextButton?.addEventListener('click', () => {
    goToSlide(activeIndex + 1);
    resetAutoplay();
  });

  prevButton?.addEventListener('click', () => {
    goToSlide(activeIndex - 1);
    resetAutoplay();
  });

  track?.addEventListener('scroll', () => {
    window.requestAnimationFrame(updateActiveFromScroll);
  }, { passive: true });

  gallery.addEventListener('mouseenter', () => autoplay && window.clearInterval(autoplay));
  gallery.addEventListener('mouseleave', resetAutoplay);
  gallery.addEventListener('focusin', () => autoplay && window.clearInterval(autoplay));
  gallery.addEventListener('focusout', resetAutoplay);

  setActive(0);
  resetAutoplay();
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
