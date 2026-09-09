# Experience constraints

- The primary target is Blanca's Tecno Spark 8, including the 2 GB RAM variant.
- Every new scene must use `useExperienceQuality` and honor its particle/rendering budgets, page visibility and reduced-motion preferences.
- Preserve the approved birthday art, the book's real turning pages and their perspective. Scale decorative cost, not content or readable text, for slower devices.
- Keep animations and audio suspended when the page is hidden. Pause decorative background work when a foreground world or book covers it.
- Hardware hints are approximate. Use the shared frame-rate policy, including its conservative fallback and hysteresis; do not equate a small viewport with weak hardware.
- Validate light and high profiles at mobile and desktop sizes. Tests and desktop emulation do not establish performance on a physical Spark 8.
- Do not preload long music tracks during the introduction. Keep media loading tied to the scene where it is needed.
- Reuse `ChapterPreview` and `ChapterPortal` for every book world. Add page copy and optional `previewSrc` in `src/data/bookChapters.js`, and register the scene and static preview in `chapterWorlds.js`. Never duplicate the book or its turning-page geometry.
- Only configured worlds get an active portal. Keep the invitation on the frame, the preview static, and support keyboard entry, cancellation, return focus and reduced motion.
- For a supplied standalone HTML, use the fast path in CHAPTERS.md: copy its assets, take a real screenshot, and fill one htmlChapters.js entry. Reuse HtmlWorld; do not rewrite a working scene or change the other books. Check unsupported external dependencies and renderer-specific phone costs without promising automatic optimization of arbitrary HTML.
