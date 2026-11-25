# Deploy to Vercel

Import `kunalmaurya-17-24/Portfolio` in Vercel and select the `feat/persona-portfolio-vercel` branch for this version (or merge it into your production branch).

- Root directory: repository root
- Framework: Vite
- Install: `npm ci`
- Build: `npm run build`
- Output: `dist`
- Node.js: 22.x
- Environment variables: none required

The tracked `vercel.json` declares the build settings. This site uses hash navigation, so no catch-all rewrite is needed. Public assets, including the sanitized resume and audio configuration, are included from `public/`. Original private documents and reference artwork are excluded from Git.

Configure the selected production branch in Vercel's project Git settings if you want to deploy this branch directly. Other branches may receive preview deployments. See [Vercel's Vite guide](https://vercel.com/docs/frameworks/frontend/vite).
