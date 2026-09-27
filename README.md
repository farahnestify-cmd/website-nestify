# Nestify — website

Static, dependency-free redesign of [nestify.ps](https://nestify.ps/).

```
index.html        home page (hero, about, products, solutions, experience, process, projects, contact)
products/         one page per product: smart-switches, smart-door-locks, smart-panels
css/styles.css    design tokens + all styles (tokens → base → components → sections → motion → responsive)
js/main.js        header behaviour, mobile menu, scroll reveals, hero control panel, contact form
assets/           favicon; products/ (product photos), projects/ (project photos)
```

Open `index.html` directly, or serve the folder (`npx serve .`).

## Design system
- **Palette:** monochrome — white `#ffffff`, paper `#f6f6f6`, a scale of grays, and black `#111111`. All live as CSS custom properties in `:root`.
- **Type:** Jost (light, lowercase) for headings and Inter for body text. Headings are two-tone: black plus a gray second phrase ("nestify products.").
- **Style:** architectural and gallery-like. Square corners (radius tokens are `0`), rectangular uppercase buttons, dark showroom sections (hero, experience, CTA, footer, product heroes) alternating with white and light gray.
- **Motion:** one easing curve (`--ease`), staggered reveal-on-scroll via `--d`. Everything respects `prefers-reduced-motion`.
- **Breakpoints:** 1080px (tablet), 860px, 640px (mobile), 380px.

## Notes
- The contact form has no backend. It opens the visitor's email app with a pre-filled message to `sales@` (or `support@` for support requests). To collect submissions server-side, point the form at an endpoint in `js/main.js`.
- Hero and experience visuals are built in HTML/CSS, so no image assets are required. Project photography can go in `assets/` later.
- Product photos in `assets/products/` were cropped from a design screenshot and are low resolution (~340px wide). Replace them with the original high-resolution files under the same names.
- The product pages share the home page's header and footer. If you change the nav, update it in all four HTML files.
- A link to `index.html?product=<slug>#contact` pre-fills the contact form with that product.
- **Projects:** the three projects in `index.html` are samples. Replace their titles, locations, systems and photos with real projects (see `assets/projects/README.md`).
