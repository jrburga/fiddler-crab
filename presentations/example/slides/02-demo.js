Deck.slide({
  id: 'animation-demo',
  style: `
    .demo-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-top: 2rem;
      width: 300px;
    }
    .demo-dot {
      width: 44px;
      height: 44px;
      background: #4a9eff;
      border-radius: 6px;
      opacity: 0.2;
      transition: all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
  `,
  render(el) {
    const dots = Array.from({ length: 25 }, (_, i) =>
      `<div class="demo-dot" data-i="${i}"></div>`
    ).join('');
    el.innerHTML = `
      <h2>Custom animations</h2>
      <p data-step="hint" class="deck-hidden">
        Steps call arbitrary JS — CSS transitions do the rest
      </p>
      <div class="demo-grid">${dots}</div>
    `;
  },
  steps: [
    el => el.querySelector('[data-step="hint"]').classList.replace('deck-hidden', 'deck-visible'),

    // reveal all dots with a staggered cascade
    el => el.querySelectorAll('.demo-dot').forEach((dot, i) =>
      setTimeout(() => { dot.style.opacity = '1'; }, i * 25)
    ),

    // morph to circles + shift color
    el => el.querySelectorAll('.demo-dot').forEach((dot, i) =>
      setTimeout(() => {
        dot.style.borderRadius = '50%';
        dot.style.background = '#f84';
      }, i * 18)
    ),

    // radial scale burst from center
    el => el.querySelectorAll('.demo-dot').forEach((dot, i) => {
      const row = Math.floor(i / 5);
      const col = i % 5;
      const dist = Math.hypot(col - 2, row - 2);
      setTimeout(() => {
        dot.style.transform = `scale(${1 + Math.max(0, 1.8 - dist) * 0.5})`;
        dot.style.background = '#4f8';
      }, dist * 60);
    }),
  ],
});
