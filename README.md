# Louis Madrigal — Portfolio

Single-page portfolio. Next.js (App Router) + GSAP ScrollTrigger, terminal-mono
design system adapted from `DESIGN-opencode.ai.md` (dark-first, cream light theme
behind the nav toggle).

## Run

```bash
npm install
npm run dev   # http://localhost:3000
```

## Customize

- **All copy** lives in [`data/content.ts`](data/content.ts) — profile, work cards,
  pipeline stages, socials (GitHub/LinkedIn URLs are `#` placeholders).
- **Work card videos** are public sample clips so hover-to-play demos out of the
  box. Drop real reels into `public/work/` and point each project's `video` at them.
- **Hero background**: mount a Three.js canvas or a background `<video>` inside
  `#reel-slot` in [`components/Hero.tsx`](components/Hero.tsx).
- **Contact form** composes a `mailto:` — swap `handleSubmit` in
  [`components/Contact.tsx`](components/Contact.tsx) for an API route when you have one.

## Notes

- Theme persists in `localStorage` (`lm-theme`); a pre-paint script in
  `app/layout.tsx` prevents flash.
- Animations respect `prefers-reduced-motion`.