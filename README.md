# Nestify — website

Static, dependency-free redesign of [nestify.ps](https://nestify.ps/).

```
index.html        page markup (semantic sections: hero, about, solutions, experience, process, contact)
css/styles.css    design tokens + all styles (tokens → base → components → sections → motion → responsive)
js/main.js        header behaviour, mobile menu, scroll reveals, hero control panel, contact form
assets/           favicon and future imagery
```

Open `index.html` directly, or serve the folder (`npx serve .`).

## Design system
- **Palette:** ivory `#faf8f4`, cream, sand, beige, taupe, a quiet bronze accent `#8f7453`, charcoal `#1f1e1c`. All live as CSS custom properties in `:root`.
- **Type:** Manrope (light, tight tracking) for UI and headings, with Cormorant Garamond italic for accent words.
- **Motion:** one easing curve (`--ease`), staggered reveal-on-scroll via `--d`. Everything respects `prefers-reduced-motion`.
- **Breakpoints:** 1080px (tablet), 860px, 640px (mobile), 380px.

## Notes
- The contact form has no backend. It opens the visitor's email app with a pre-filled message to `sales@` (or `support@` for support requests). To collect submissions server-side, point the form at an endpoint in `js/main.js`.
- Hero and experience visuals are built in HTML/CSS, so no image assets are required. Project photography can go in `assets/` later.
