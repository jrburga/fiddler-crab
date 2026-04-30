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
