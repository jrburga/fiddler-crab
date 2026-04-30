Deck.slide({
  id: 'burst',
  title: 'Burst (One-shot)',
  style: `
    .burst-stage {
      position: relative;
      width: 500px;
      height: 500px;
      margin-top: 0.5rem;
    }
    .burst-particle {
      position: absolute;
      border-radius: 50%;
      top: 50%;
      left: 50%;
      pointer-events: none;
    }
  `,
  render(el) {
    el.innerHTML = `
      <h2>One-shot animation</h2>
      <p style="margin-bottom: 1rem;">Runs once then stops — play resets automatically</p>
      <div class="burst-stage"></div>
    `;
  },
  animation: {
    play(el, done) {
      const stage = el.querySelector('.burst-stage');
      const N = 20;
      const particleDuration = 1800;
      const stagger = 60;
      let stopped = false;
      let completed = 0;
      const timeouts = [];

      el._burstStop = () => {
        stopped = true;
        timeouts.forEach(clearTimeout);
        stage.querySelectorAll('.burst-particle').forEach(p => p.remove());
      };

      for (let i = 0; i < N; i++) {
        const tid = setTimeout(() => {
          if (stopped) return;

          const angle = (i / N) * Math.PI * 2 + Math.random() * 0.3;
          const maxDist = 170 + Math.random() * 60;
          const size = 8 + Math.random() * 12;
          const hue = 200 + (i / N) * 140;

          const p = document.createElement('div');
          p.className = 'burst-particle';
          p.style.cssText = `width:${size}px;height:${size}px;background:hsl(${hue},80%,60%);margin:-${size / 2}px 0 0 -${size / 2}px`;
          stage.appendChild(p);

          let start = null;
          function tick(now) {
            if (stopped) { p.remove(); return; }
            if (!start) start = now;
            const t = Math.min((now - start) / particleDuration, 1);
            if (t === 1) {
              p.remove();
              if (++completed === N) done();
              return;
            }
            const ease = 1 - Math.pow(1 - t, 3);
            const dist = ease * maxDist;
            p.style.transform = `translate(${dist * Math.cos(angle)}px, ${dist * Math.sin(angle)}px)`;
            p.style.opacity = 1 - t;
            requestAnimationFrame(tick);
          }
          requestAnimationFrame(tick);
        }, i * stagger);

        timeouts.push(tid);
      }
    },
    stop(el) {
      if (el._burstStop) el._burstStop();
    },
  },
});
