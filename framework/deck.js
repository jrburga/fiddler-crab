(function (global) {
  'use strict';

  const PLAY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  const STOP_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>`;

  const registry = [];
  let currentIndex = 0;
  let currentStep = 0;
  let isPlaying = false;
  let root = null;
  let slideStyleEl = null;

  function updateScale() {
    if (!root) return;
    const scale = Math.min(root.offsetWidth / 1600, root.offsetHeight / 900);
    const el = root.querySelector('.deck-slide');
    if (el) el.style.transform = `scale(${scale})`;
  }

  function renderSlide(index) {
    const slide = registry[index];
    if (!slide) return;

    if (isPlaying) stopAnimation();

    currentStep = 0;
    root.innerHTML = '';

    if (slideStyleEl) {
      slideStyleEl.remove();
      slideStyleEl = null;
    }
    if (slide.style) {
      slideStyleEl = document.createElement('style');
      slideStyleEl.textContent = slide.style;
      document.head.appendChild(slideStyleEl);
    }

    const el = document.createElement('div');
    el.className = 'deck-slide';
    if (slide.id) el.dataset.slideId = slide.id;
    root.appendChild(el);

    if (typeof slide.render === 'function') slide.render(el);

    updateCounter();
    updatePlayBtn();
    updateScale();
  }

  function updateCounter() {
    const el = document.getElementById('deck-counter');
    if (el) el.textContent = `${currentIndex + 1} / ${registry.length}`;
  }

  function updatePlayBtn() {
    const btn = document.getElementById('deck-play');
    if (!btn) return;
    const slide = registry[currentIndex];
    const hasAnim = slide && typeof slide.animation === 'object';
    btn.style.display = hasAnim ? 'flex' : 'none';
    btn.innerHTML = isPlaying ? STOP_SVG : PLAY_SVG;
    btn.title = isPlaying ? 'Stop' : 'Play animation';
    btn.classList.toggle('playing', isPlaying);
  }

  function playAnimation() {
    const slide = registry[currentIndex];
    if (!slide || !slide.animation) return;
    isPlaying = true;
    updatePlayBtn();
    const el = root.querySelector('.deck-slide');
    slide.animation.play(el);
  }

  function stopAnimation() {
    const slide = registry[currentIndex];
    if (!slide || !slide.animation) return;
    isPlaying = false;
    updatePlayBtn();
    const el = root.querySelector('.deck-slide');
    if (typeof slide.animation.stop === 'function') slide.animation.stop(el);
  }

  function toggleAnimation() {
    if (isPlaying) stopAnimation();
    else playAnimation();
  }

  function next() {
    const slide = registry[currentIndex];
    const steps = slide && Array.isArray(slide.steps) ? slide.steps : [];
    if (currentStep < steps.length) {
      const el = root.querySelector('.deck-slide');
      steps[currentStep](el, currentStep);
      currentStep++;
    } else if (currentIndex < registry.length - 1) {
      currentIndex++;
      renderSlide(currentIndex);
    }
  }

  function prev() {
    if (currentIndex > 0) {
      currentIndex--;
      renderSlide(currentIndex);
    }
  }

  function goTo(index) {
    if (index >= 0 && index < registry.length) {
      currentIndex = index;
      renderSlide(currentIndex);
    }
  }

  async function exportStandalone() {
    const title = document.title || 'presentation';

    const styleLinks = Array.from(document.querySelectorAll('link[rel="stylesheet"][href]'));
    const cssTexts = await Promise.all(
      styleLinks.map(l => fetch(l.href).then(r => r.text()).catch(() => ''))
    );

    const scriptTags = Array.from(document.querySelectorAll('script[src]'));
    const jsTexts = await Promise.all(
      scriptTags.map(s => fetch(s.src).then(r => r.text()).catch(() => ''))
    );

    const html = [
      '<!DOCTYPE html>',
      '<html lang="en">',
      '<head>',
      '<meta charset="UTF-8">',
      '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
      `<title>${title}</title>`,
      '<style>',
      cssTexts.join('\n'),
      '</style>',
      '</head>',
      '<body>',
      '<div id="deck-root"></div>',
      '<script>',
      jsTexts.join('\n\n'),
      'Deck.start();',
      '<\/script>',
      '</body>',
      '</html>',
    ].join('\n');

    const blob = new Blob([html], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = title.replace(/\s+/g, '-').toLowerCase() + '.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
  }

  const Deck = {
    slide(config) {
      registry.push(config);
      return Deck;
    },

    start() {
      root = document.getElementById('deck-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'deck-root';
        document.body.prepend(root);
      }

      const toolbar = document.createElement('div');
      toolbar.id = 'deck-toolbar';
      toolbar.innerHTML = `
        <button id="deck-export-btn">Export</button>
        <div id="deck-nav">
          <button id="deck-prev" title="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <span id="deck-counter"></span>
          <button id="deck-next" title="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div id="deck-toolbar-end">
          <button id="deck-play" style="display:none"></button>
        </div>
      `;
      toolbar.querySelector('#deck-export-btn').addEventListener('click', exportStandalone);
      toolbar.querySelector('#deck-prev').addEventListener('click', prev);
      toolbar.querySelector('#deck-next').addEventListener('click', next);
      toolbar.querySelector('#deck-play').addEventListener('click', toggleAnimation);
      document.body.appendChild(toolbar);

      window.addEventListener('resize', () => requestAnimationFrame(updateScale));

      // swipe support
      let touchStartX = 0;
      root.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
      root.addEventListener('touchend', e => {
        const dx = e.changedTouches[0].clientX - touchStartX;
        if (Math.abs(dx) > 50) dx < 0 ? next() : prev();
      });

      document.addEventListener('keydown', e => {
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowDown':
          case ' ':
            e.preventDefault();
            next();
            break;
          case 'ArrowLeft':
          case 'ArrowUp':
            e.preventDefault();
            prev();
            break;
        }
      });

      if (registry.length > 0) requestAnimationFrame(() => renderSlide(0));
    },

    next,
    prev,
    goTo,
    play: playAnimation,
    stop: stopAnimation,
    export: exportStandalone,

    get current() { return registry[currentIndex]; },
    get index() { return currentIndex; },
    get total() { return registry.length; },
    get playing() { return isPlaying; },
  };

  global.Deck = Deck;
})(window);
