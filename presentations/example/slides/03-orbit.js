Deck.slide({
  id: 'orbit',
  style: `
    .orbit-stage {
      width: clamp(180px, 45cqw, 380px);
      aspect-ratio: 1;
      margin-top: 1rem;
    }
    .orbit-stage svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `,
  render(el) {
    el.innerHTML = `
      <h2>Playable animation</h2>
      <p style="margin-bottom: 0.75rem;">Hit play in the toolbar — this loops until stopped</p>
      <div class="orbit-stage">
        <svg viewBox="-100 -100 200 200">
          <circle cx="0" cy="0" r="30" fill="none" stroke="#222" stroke-width="1"/>
          <circle cx="0" cy="0" r="58" fill="none" stroke="#222" stroke-width="1"/>
          <circle cx="0" cy="0" r="85" fill="none" stroke="#222" stroke-width="1"/>
          <circle cx="0" cy="0" r="9" fill="#ffa94d"/>
          <circle class="planet" data-r="30"  data-speed="2.8"  cx="30"  cy="0" r="4.5" fill="#4a9eff"/>
          <circle class="planet" data-r="58"  data-speed="1.6"  cx="58"  cy="0" r="6"   fill="#f84"/>
          <circle class="planet" data-r="85"  data-speed="0.9"  cx="85"  cy="0" r="5.5" fill="#4f8"/>
        </svg>
      </div>
    `;
  },
  animation: {
    play(el) {
      const planets = Array.from(el.querySelectorAll('.planet'));
      const angles = planets.map((_, i) => (i * Math.PI * 2) / planets.length);
      let last = null;
      let frame;

      function tick(now) {
        const dt = last ? (now - last) / 1000 : 0;
        last = now;
        planets.forEach((p, i) => {
          const r = parseFloat(p.dataset.r);
          const speed = parseFloat(p.dataset.speed);
          angles[i] += speed * dt;
          p.setAttribute('cx', (r * Math.cos(angles[i])).toFixed(3));
          p.setAttribute('cy', (r * Math.sin(angles[i])).toFixed(3));
        });
        frame = requestAnimationFrame(tick);
      }

      frame = requestAnimationFrame(tick);
      el._stopAnim = () => cancelAnimationFrame(frame);
    },
    stop(el) {
      if (el._stopAnim) el._stopAnim();
    },
  },
});
