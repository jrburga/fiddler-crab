Deck.slide({
  id: 'concepts',
  title: 'How It Works',
  style: `
    .deck-slide code {
      background: #1a2a3a;
      color: #4a9eff;
      padding: 2px 6px;
      border-radius: 3px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 0.88em;
    }
  `,
  render(el) {
    el.innerHTML = `
      <h2>How it works</h2>
      <ul>
        <li data-step="1" class="deck-hidden">Each slide is a plain <code>.js</code> file</li>
        <li data-step="2" class="deck-hidden">Steps fire arbitrary JS on each advance</li>
        <li data-step="3" class="deck-hidden">Export bundles everything into one <code>.html</code></li>
      </ul>
    `;
  },
  steps: [1, 2, 3].map(n => el =>
    el.querySelector(`[data-step="${n}"]`).classList.replace('deck-hidden', 'deck-visible')
  ),
});
