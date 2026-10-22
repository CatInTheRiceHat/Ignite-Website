# Ignite Website

Ignite's website and Sol chatbot share this repository and one Vercel project. See [Sol setup, migration and maintenance](docs/SOL.md) for server configuration and validation. Use Node 22.x, then `npm install` and `npm run dev` for the local website and chatbot. Changes to Sol now live in `src/sol/` and `server/sol/`.

Moodle customizations deploy separately to DigitalOcean over SSH. Run `npm run moodle:check` to preview and `npm run moodle:deploy` to back up and sync the managed theme settings and existing Ignite dashboard blocks. See [Moodle deployment](moodle/SYNC.md) for connection setup, scope, and restoration.

Partnership content lives in `src/data/partnerships.ts`; add only confirmed partners with approved descriptions, logos, and verified links. The partners section stays hidden while that list is empty. The Ignite Partnership Application is configured in `src/lib/links.ts` as `https://forms.gle/6Zte2NF4fbWj2Y7W9`. It opens directly because Google's embedded version returned a cookie/sign-in access screen during verification. To replace it, optionally set `VITE_PARTNERSHIP_FORM_URL` in `.env.local` and the deployment environment, then rebuild. A full `https://docs.google.com/forms/.../viewform` URL enables the responsive embed and alternative link; verify anonymous embed access first. A `https://forms.gle/...` short link provides the application link only. An explicitly empty or unsupported URL shows an availability message without an application action.

## Intro debugging

Open `/?intro=debug` on the affected browser to replay the intro even if it has already been seen in this session. A diagnostic panel stays visible after the intro and offers Replay, Download report, and Test without intro. Reduced motion preferences still bypass the animation.

Reproduce the bug, then download `ignite-intro-debug.json`. The report includes media readiness and buffering events, playback errors, rendering gaps over 250 ms, captured-frame timing, the reason the intro closed, page errors, and whether scrolling and page interaction were restored. Reports stay in browser memory until downloaded; they are not uploaded automatically. Two initial attach/cleanup sequences are expected in local development because React Strict Mode checks effect cleanup.

Open `/?intro=skip` to compare the site without loading the intro video. If the same issue happens there, investigate the page independently of the intro. Normal URLs keep the usual intro behavior without diagnostic listeners. Run the focused browser checks with `npm run test:browser -- loading-screen.spec.ts intro-debug.spec.ts --workers=2` using Node 22.x.

## React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
