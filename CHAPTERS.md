# Adding a chapter

All books use the same real page5/page6 surfaces, caption placement and portal.
The current active worlds are I (galaxy), II (moon), III (dinosaur forest), IV (four wishes), V (crystal lab), VI (invisible map), X (a lovely reaction), XI (paper voyage), XIII (violet door), XVII (a little warmth), XIX (day/night house), and XXI (tic-tac-toe). VII has no scene assigned. The former VI light scene and its preview are preserved in archive/chapters/la-luz-que-llevas. The native rain implementation and copy are retained pending the user's new chapter assignment.

## Fast path: user supplies an HTML

Do not rebuild the book or port a working self-contained HTML to React by default.

1. Copy the supplied HTML unchanged to `public/chapters/02/index.html` (use the requested book number). Keep its relative images/styles/scripts in that folder too.
2. Capture its actual rendered scene to `public/chapters/02/preview.jpg`. Never substitute an unrelated illustration.
3. Add just this entry to `src/data/htmlChapters.js`; it updates the shelf title, book title, page copy, preview and world together:

```js
2: {
  title: 'Pasos de luna',
  shortText: 'Una frase debajo del libro.',
  html: 'chapters/02/index.html',
  preview: 'chapters/02/preview.jpg',
  caption: 'Un fragmento corto debajo de la captura.',
  paragraphs: ['Primer parrafo de la hoja derecha.', 'Segundo parrafo corto.'],
},
```

No changes to App, BookModal, chapterWorlds or tests are needed per chapter.
Do not register a placeholder before both assets exist. Existing native I/VI
remain unchanged unless that exact book is explicitly replaced.

Scene components ship with the main bundle, avoiding failed late module imports
after a development-server restart. HTML documents and images still require a
running server or deployed hosting; a stopped localhost cannot serve chapters.
The HTML loader offers a retry without closing the book. The top toolbar is kept
outside the iframe so return and mute never cover the source's controls.

The shared HTML adapter handles full-screen entry/return, Escape from inside the
frame, focus restoration, mute, completion-based visits, loading errors and a
static preview for reduced motion. It caps requestAnimationFrame callbacks to
the hardware profile and pauses them, CSS animations and media when hidden.
The iframe is isolated with `sandbox="allow-scripts"`, without same-origin access,
popups, forms or top navigation. Relative asset URLs use the source directory.

For renderer-specific optimization, HTML scripts can read
`window.__BLANCA_WORLD__` (`tier`, `pixelRatio`, `fps`, `visible`, `muted`) and listen
for `blanca:state` events. A wrapper cannot automatically reduce particle counts,
pause worker/setInterval loops, fix frame-dependent physics, or rewrite timelines
based on performance.now. Review those only when present. External modules,
fetches, storage and canvas exports may need adaptation for the sandbox/CORS;
do not weaken the sandbox to make an unknown HTML work. Native scenes remain an
option when an imported HTML needs deeper integration.

Smoke test the requested book: open -> preview -> interact -> back, then check
light mobile and desktop. Run `pnpm test` and `pnpm build`. The isolated development
fixture `dev/html-chapter.html?quality=light` exercises a plain HTML through the
actual book/portal without adding a test chapter to the real shelf.

## Native scenes

1. Add its short caption, paragraphs, world key and accessible entryLabel to `src/data/bookChapters.js`.
2. Register its Scene and static Snapshot in `src/components/worlds/chapterWorlds.js`. A chapter can instead supply previewSrc for a real scene screenshot; the same image is used in the page and transition.
3. The scene receives onClose and managedEntry. With managedEntry it must render full-screen without its own competing zoom. Include a visible return button calling onClose, and use useExperienceQuality for animation budgets and visibility.
4. Keep the scene content separate from the shared portal. Frame invitation, touch/keyboard entry, expanding snapshot, quality-aware sparks, reverse transition, Escape and focus restoration are already shared.
5. All screens start with the full spread. The top-center zoom button opens one enlarged actual leaf at a time. Keep copy short enough for a 16px reading size; do not shrink prose to fit longer chapters.
6. Portal sounds use the existing shared mute and audio lifecycle. Completed entry calls onVisit; opening the book or cancelling entry does not mark it visited. Visits are local, versioned, validated IDs, with an in-memory fallback if browser storage is unavailable.

## Checks for each new world

- The preview is static; only its frame glows. No landscape or text is substituted for a screenshot.
- Entry starts at the actual clicked preview and does not recreate the book.
- Repeated taps, Escape during entry, return/re-entry and closing the book work.
- Light/high quality, small/large screens, reduced motion and hidden-page pause work.
- HTML entries are automatically included in chapter validation; update native assertions only for new native worlds.
- Verify on the actual Spark 8 before claiming phone performance.

## Galaxy

The engine adapts the user's actual `galaxia_mistica.html` Canvas 2D drawing code:
gathering light, expansion, five spiral arms, double stars, comets, and novae with
charging, shockwaves, debris and fading remnants. It is an artistic birthday scene,
not a scientific cosmology simulation. The full-screen white flash is replaced
by a bounded central bloom. Background and nebula textures and star-glow sprites
are cached. All visible stars, including spiral stars, can trigger a nova.

`galaxySettings.js` maps the shared quality budget to bounded particle counts,
simultaneous novae and debris. Pixel ratio and frame rate follow the shared
profile. Changes preserve time and particle positions; hidden pages pause the
clock, including nova lifetimes. Comets advance by elapsed time, not frame count.
Reduced motion shows a static formed galaxy. Canvas failure has an image fallback.
The viewport uses one pixel-space radius, without nonuniform canvas stretching.
The engine loads only when the first book is opened; the original HTML is untouched.

`dev/galaxy.html?quality=light` is the local visual test scene; append `&capture=1`
for an unobstructed, frozen capture, and optionally `&time=2.7` to inspect a birth
frame. This development fixture is not included in the
production entry point. `public/images/galaxy-preview.jpg` is an actual screenshot
of that renderer, used both in the book and as the fallback.
