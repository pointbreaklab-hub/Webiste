import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap  from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pointbreaklab.com',
  integrations: [tailwind(), sitemap()],
  output: 'static',
  // GitHub Pages serves all our routes with a trailing slash and 301-
  // redirects the no-slash form to the slashed canonical. Telling Astro
  // to *always* emit slashed URLs (in the sitemap, in the build output,
  // and via the `trailingSlash` URL helpers) makes Google index the
  // canonical form directly instead of flagging "Page with redirect" on
  // /privacy → /privacy/. (Search Console alert 2026-05-07.)
  trailingSlash: 'always',
});
