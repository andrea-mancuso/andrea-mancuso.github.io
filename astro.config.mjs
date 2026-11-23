// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// SITE_URL / BASE_PATH are set by the GitHub Pages workflow.
// With a repository named "<username>.github.io" the base path is "/".
// The site is served at the custom domain andreamancuso.eu (Settings → Pages → Custom domain).
// GitHub reports the address as http:// until its certificate is issued; the site is always
// served over HTTPS, so canonical links, sitemap and previews use https://.
const site = (process.env.SITE_URL || 'https://andreamancuso.eu').replace(/^http:\/\/(?!localhost)/, 'https://');
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  // The stylesheet is written inside every page instead of a separate file. A browser that still
  // has an older page in its cache (GitHub Pages lets it keep pages for up to 10 minutes) would
  // otherwise ask for a stylesheet that no longer exists after a new deploy, and show the page
  // without styles.
  build: { inlineStylesheets: 'always' },
  integrations: [sitemap()],
});
