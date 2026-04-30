(function (global) {
  'use strict';

  const registry = [];
  let currentIndex = 0;
  let currentStep = 0;
  let root = null;
  let slideStyleEl = null;

  function renderSlide(index) {
    const slide = registry[index];
    if (!slide) return;

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
  }

  function updateCounter() {
    const el = document.getElementById('deck-counter');
    if (el) el.textContent = `${currentIndex + 1} / ${registry.length}`;
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

      const counter = document.createElement('div');
      counter.id = 'deck-counter';
      document.body.appendChild(counter);

      const exportBtn = document.createElement('button');
      exportBtn.id = 'deck-export-btn';
      exportBtn.textContent = 'Export';
      exportBtn.addEventListener('click', exportStandalone);
      document.body.appendChild(exportBtn);

      const controls = document.createElement('div');
      controls.id = 'deck-controls';
      controls.innerHTML = `
        <button id="deck-prev" title="Previous slide">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </button>
        <button id="deck-next" title="Next">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"></polyline>
          </svg>
        </button>
      `;
      controls.querySelector('#deck-prev').addEventListener('click', prev);
      controls.querySelector('#deck-next').addEventListener('click', next);
      document.body.appendChild(controls);

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

      if (registry.length > 0) renderSlide(0);
    },

    next,
    prev,
    goTo,
    export: exportStandalone,

    get current() { return registry[currentIndex]; },
    get index() { return currentIndex; },
    get total() { return registry.length; },
  };

  global.Deck = Deck;
})(window);
