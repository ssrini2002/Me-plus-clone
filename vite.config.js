import { defineConfig } from 'vite';

// GitHub Pages deploys to https://<user>.github.io/<repo>/
// In production, base must match the repo name so all asset paths are correct.
// In dev, base stays '/' for normal localhost usage.
export default defineConfig({
  base: process.env.GITHUB_ACTIONS ? '/Me-plus-clone/' : '/',
});
