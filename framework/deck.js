(function (global) {
  'use strict';

  const PLAY_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"></polygon></svg>`;
  const STOP_SVG = `<svg viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"></rect></svg>`;
  const MENU_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`;

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
    updateMenuActive();
    updateScale();
  }

  function openMenu() {
    document.getElementById('deck-menu').classList.add('open');
  }

  function closeMenu() {
    document.getElementById('deck-menu').classList.remove('open');
  }

  function updateMenuActive() {
    document.querySelectorAll('.deck-menu-item').forEach((item, i) => {
      item.classList.toggle('active', i === currentIndex);
    });
  }

  function updateCounter() {
    const el = document.getElementById('deck-counter-end');
    if (el) el.textContent = `${currentIndex + 1} / ${registry.length}`;
  }

  function updatePlayBtn() {
    const btn = document.getElementById('deck-play');
    if (!btn) return;
    const slide = registry[currentIndex];
    const hasAnim = slide && typeof slide.animation === 'object';
    btn.style.visibility = hasAnim ? 'visible' : 'hidden';
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
    const capturedIndex = currentIndex;
    slide.animation.play(el, () => {
      // done() — called by the slide when animation finishes naturally
      if (currentIndex === capturedIndex && isPlaying) {
        isPlaying = false;
        updatePlayBtn();
      }
    });
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
      '<script>window.__DECK_EXPORTED__=true;<\/script>',
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
      // topbar
      const topbar = document.createElement('div');
      topbar.id = 'deck-topbar';
      topbar.innerHTML = `<button id="deck-menu-btn" title="Slides">${MENU_SVG}</button>`;
      document.body.appendChild(topbar);

      root = document.getElementById('deck-root');
      if (!root) {
        root = document.createElement('div');
        root.id = 'deck-root';
        document.body.appendChild(root);
      }

      // slide menu overlay
      const menu = document.createElement('div');
      menu.id = 'deck-menu';
      menu.innerHTML = `
        <div id="deck-menu-panel">
          <div id="deck-menu-header">Slides</div>
          <div id="deck-menu-list">
            ${registry.map((slide, i) => `
              <div class="deck-menu-item" data-index="${i}">
                <span class="deck-menu-item-num">${i + 1}</span>
                <span class="deck-menu-item-title">${slide.title || slide.id || `Slide ${i + 1}`}</span>
              </div>
            `).join('')}
          </div>
        </div>
        <div id="deck-menu-backdrop"></div>
      `;
      menu.querySelector('#deck-menu-backdrop').addEventListener('click', closeMenu);
      menu.querySelectorAll('.deck-menu-item').forEach(item => {
        item.addEventListener('click', () => {
          goTo(parseInt(item.dataset.index, 10));
          closeMenu();
        });
      });
      document.body.appendChild(menu);

      topbar.querySelector('#deck-menu-btn').addEventListener('click', openMenu);

      const toolbar = document.createElement('div');
      toolbar.id = 'deck-toolbar';
      toolbar.innerHTML = `
        ${window.__DECK_EXPORTED__ ? '' : '<button id="deck-export-btn">Export</button>'}
        <div id="deck-nav">
          <button id="deck-prev" title="Previous slide">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
          <button id="deck-play" style="visibility:hidden"></button>
          <button id="deck-next" title="Next">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
        <div id="deck-toolbar-end">
          <span id="deck-counter-end"></span>
        </div>
      `;
      const exportBtn = toolbar.querySelector('#deck-export-btn');
      if (exportBtn) exportBtn.addEventListener('click', exportStandalone);
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
          case 'Escape':
            closeMenu();
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
