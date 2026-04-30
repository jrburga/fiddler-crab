Deck.slide({
  id: 'animation-demo',
  title: 'Wave Animation',
  style: `
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 14px;
      margin-top: 1.5rem;
      width: 320px;
    }
    .demo-dot {
      aspect-ratio: 1;
      background: #4a9eff;
      border-radius: 6px;
      opacity: 0.15;
      transition: transform 0.08s linear;
    }
  `,
  render(el) {
    const dots = Array.from({ length: 25 }, (_, i) =>
      `<div class="demo-dot" data-i="${i}"></div>`
    ).join('');
    el.innerHTML = `
      <h2>Playable animations</h2>
      <p data-step="hint" class="deck-hidden">
        Press play to start — the animation loops until stopped
      </p>
      <div class="demo-grid">${dots}</div>
    `;
  },
  steps: [
    el => el.querySelector('[data-step="hint"]').classList.replace('deck-hidden', 'deck-visible'),
  ],
  animation: {
    play(el) {
      const dots = Array.from(el.querySelectorAll('.demo-dot'));
      dots.forEach(d => { d.style.opacity = '1'; });
      let t = 0;
      let frame;
      function tick() {
        t += 0.06;
        dots.forEach((dot, i) => {
          const row = Math.floor(i / 5);
          const col = i % 5;
          const phase = (col + row) * 0.5;
          const v = 0.5 + 0.5 * Math.sin(t + phase);
          dot.style.transform = `scale(${0.55 + v * 0.7})`;
          dot.style.background = `hsl(${210 + v * 80}, 80%, 60%)`;
        });
        frame = requestAnimationFrame(tick);
      }
      frame = requestAnimationFrame(tick);
      el._stopAnim = () => {
        cancelAnimationFrame(frame);
        dots.forEach(d => {
          d.style.transform = '';
          d.style.background = '#4a9eff';
          d.style.opacity = '0.15';
        });
      };
    },
    stop(el) {
      if (el._stopAnim) el._stopAnim();
    },
  },
});
