# fiddler-crab
Presentation framework for interactive animations

## presentationframework.html

A self-contained, single-file HTML presentation studio built for animation-driven slides.

### Features

- **Slide manager** — sidebar panel to add, reorder, and delete slides; right-click a slide to delete it
- **Editor view** — per-slide title editing, an animation preview placeholder, and speaker notes
- **Presentation mode** — full-screen scene view with play/pause controls, previous/next slide navigation, and a notes panel
- **LocalStorage persistence** — slides (titles, notes, scene data) are saved automatically in the browser

### Usage

Open `presentationframework.html` directly in a browser — no build step or server required.

The scene/animation areas are intentional stubs. Wire up your animation renderer by populating `slide.sceneData` and hooking the play/stop button handlers in `attachEventListeners()`.

---

## framework/

A file-per-slide presentation engine without the editor UI. Suitable for authored, code-driven presentations that can be shared as a single static HTML file.

### Creating a presentation

1. Create a subdirectory under `presentations/`, e.g. `presentations/my-talk/`
2. Add an `index.html` that loads the framework and your slide files:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>My Talk</title>
  <link rel="stylesheet" href="../../framework/deck.css">
</head>
<body>
  <div id="deck-root"></div>
  <script src="../../framework/deck.js"></script>
  <script src="slides/00-intro.js"></script>
  <script>Deck.start();</script>
</body>
</html>
```

3. Create one JS file per slide in a `slides/` subdirectory:

```js
Deck.slide({
  id: 'intro',
  title: 'Introduction',   // shown in the slide menu
  render(el) {
    el.innerHTML = `<h1>Hello</h1><p class="deck-hidden">World</p>`;
  },
  steps: [
    el => el.querySelector('p').classList.replace('deck-hidden', 'deck-visible'),
  ],
});
```

Slides are authored in a fixed 1600×900 coordinate space and scaled to fit any screen.

### Slide config

| Field | Type | Description |
|---|---|---|
| `id` | string | Unique identifier, used as a data attribute |
| `title` | string | Label shown in the slide menu |
| `render(el)` | function | Called once to set up the slide's initial HTML |
| `steps` | function[] | Called in order on each advance (arrow key / next button) |
| `style` | string | CSS injected into `<head>` while this slide is active |
| `animation` | object | See below |

### Playable animations

Slides can define an `animation` object for continuous or one-shot animations controlled by the play/stop button in the toolbar:

```js
animation: {
  play(el, done) {
    const frame = requestAnimationFrame(/* ... */);
    el._stop = () => cancelAnimationFrame(frame);
    // For one-shot animations, call done() when finished:
    // done();
  },
  stop(el) {
    if (el._stop) el._stop();
  },
}
```

Calling `done()` resets the play button automatically. Omit it for looping animations.

### Navigation

| Input | Action |
|---|---|
| `→` / `Space` / `↓` | Next step or next slide |
| `←` / `↑` | Previous slide |
| Swipe left/right | Next / previous slide (mobile) |
| Hamburger button | Open slide menu |
| `Escape` | Close slide menu |

### Exporting

Click the **Export** button in the toolbar to download a single self-contained `.html` file with all CSS and JS inlined. The export button is hidden on exported pages.

> Requires serving over HTTP (e.g. `python -m http.server`). Does not work from `file://` due to fetch restrictions.

### Versioning

`framework/version.json` contains the framework version and a build identifier:

```json
{
  "version": "1.0",
  "build": "<short git hash>"
}
```

The version is displayed in the top-right of the topbar so you can confirm a deployed page has picked up the latest changes. **Update `build` to the current short git hash (`git rev-parse --short HEAD`) with each push.**
