import { defineConfig } from 'astro/config';
import tailwind from '@astrojs/tailwind';
import sitemap  from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://pointbreaklab.com',
  // German twins live under /de/ with the same slugs. The sitemap's i18n
  // option pairs each page with its twin via xhtml:link alternates. Routing
  // is plain files under src/pages/de/, and src/i18n.ts decides which pages
  // have a twin, so Astro's own i18n routing is not needed.
  integrations: [
    tailwind(),
    sitemap({ i18n: { defaultLocale: 'en', locales: { en: 'en', de: 'de' } } }),
  ],
  output: 'static',
  // GitHub Pages serves all our routes with a trailing slash and 301-
  // redirects the no-slash form to the slashed canonical. Telling Astro
  // to *always* emit slashed URLs (in the sitemap, in the build output,
  // and via the `trailingSlash` URL helpers) makes Google index the
  // canonical form directly instead of flagging "Page with redirect" on
  // /privacy → /privacy/. (Search Console alert 2026-05-07.)
  trailingSlash: 'always',
});
