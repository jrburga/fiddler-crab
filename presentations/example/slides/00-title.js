Deck.slide({
  id: 'title',
  render(el) {
    el.innerHTML = `
      <h1>fiddler-crab</h1>
      <p data-step="1" class="deck-hidden" style="font-size: 1.3rem; margin-top: 0.75rem;">
        Presentation framework for interactive animations
      </p>
      <p data-step="2" class="deck-hidden" style="font-size: 0.95rem; margin-top: 2rem; color: #4a9eff;">
        Press → to advance
      </p>
    `;
  },
  steps: [
    el => el.querySelector('[data-step="1"]').classList.replace('deck-hidden', 'deck-visible'),
    el => el.querySelector('[data-step="2"]').classList.replace('deck-hidden', 'deck-visible'),
  ],
});
