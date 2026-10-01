// English is the default and lives at `/`. German lives under `/de/` with the
// SAME slugs, so switching language is a prefix swap and keeps you on the page
// you were reading. Pattern taken from TUM and Posteo, see the 2026-09-29 notes.
//
// Only pages listed in TRANSLATED have a German twin. The changelogs are left
// in English on purpose (the owner's call: they are long, developer-facing, and
// would have to be written twice on every release). On an untranslated page the
// DE switch is shown but disabled, and no hreflang="de" is emitted, so nothing
// ever links a German label to English content.

export type Locale = 'en' | 'de';

export const TRANSLATED = new Set<string>([
  '/',
  '/whispr/',
  '/heart/',
  '/knot/',
  '/knot/docs/',
  '/knot-ai/',
  '/privacy/',
  '/heart/privacy/',
  '/knot/privacy/',
]);

export function localeFromPath(path: string): Locale {
  return path === '/de' || path.startsWith('/de/') ? 'de' : 'en';
}

/** The English path for any path, German or not. */
export function englishPath(path: string): string {
  if (path === '/de' || path === '/de/') return '/';
  return path.startsWith('/de/') ? path.slice(3) : path;
}

/** The German twin of a path, or null when the page is English-only. */
export function germanPath(path: string): string | null {
  const en = englishPath(path);
  return TRANSLATED.has(en) ? (en === '/' ? '/de/' : `/de${en}`) : null;
}

/**
 * Build an internal link for the given locale. `/knot/#download` on a German
 * page becomes `/de/knot/#download`; a link to an English-only page such as a
 * changelog stays English rather than pointing at a German URL that does not
 * exist.
 */
export function href(path: string, locale: Locale): string {
  if (locale === 'en') return path;
  const [base, hash] = path.split('#');
  const de = germanPath(base || '/');
  const target = de ?? base;
  return hash !== undefined ? `${target}#${hash}` : target;
}

const STRINGS = {
  en: {
    apps: 'Apps',
    about: 'About',
    download: 'Download',
    menu: 'Menu',
    language: 'Language',
    englishOnly: 'This page is only available in English',
    footerTagline: 'Built by one person in Würzburg. Whatever these apps store, they store on your device.',
    openModel: '(Open model)',
    resources: 'Resources',
    legal: 'Legal',
    security: 'Security',
    whisprChangelog: 'Whispr changelog',
    heartChangelog: 'Heart changelog',
    knotChangelog: 'Knot changelog',
    knotInstall: 'Knot install guide',
    whisprPrivacy: 'Whispr privacy',
    heartPrivacy: 'Heart privacy',
    knotPrivacy: 'Knot privacy',
    contact: 'Contact',
    rights: 'All rights reserved.',
    madeIn: 'Made in Würzburg, Germany',
    staticNote: 'Static HTML on GitHub Pages. No analytics script on any page.',
    heroPill: 'EVERY APP HERE RUNS WITHOUT A SERVER',
    heroLine1: "Apps that don't",
    heroLine2: 'watch back.',
    heroCta: 'See the apps',
    scroll: 'scroll',
    noBuildFor: 'No build for',
    downloadFor: 'Download for',
    availableOn: 'Available on',
  },
  de: {
    apps: 'Apps',
    about: 'Über mich',
    download: 'Download',
    menu: 'Menü',
    language: 'Sprache',
    englishOnly: 'Diese Seite gibt es nur auf Englisch',
    footerTagline: 'Gebaut von einer Person in Würzburg. Was diese Apps speichern, speichern sie auf deinem Gerät.',
    openModel: '(offenes Modell)',
    resources: 'Ressourcen',
    legal: 'Rechtliches',
    security: 'Sicherheit',
    whisprChangelog: 'Whispr-Changelog (EN)',
    heartChangelog: 'Heart-Changelog (EN)',
    knotChangelog: 'Knot-Changelog (EN)',
    knotInstall: 'Knot-Installationsanleitung',
    whisprPrivacy: 'Datenschutz Whispr',
    heartPrivacy: 'Datenschutz Heart',
    knotPrivacy: 'Datenschutz Knot',
    contact: 'Kontakt',
    rights: 'Alle Rechte vorbehalten.',
    madeIn: 'Gemacht in Würzburg',
    staticNote: 'Statisches HTML auf GitHub Pages. Auf keiner Seite läuft ein Analyse-Skript.',
    heroPill: 'JEDE APP HIER LÄUFT OHNE SERVER',
    heroLine1: 'Apps, die dich nicht',
    heroLine2: 'beobachten.',
    heroCta: 'Zu den Apps',
    scroll: 'scrollen',
    noBuildFor: 'Kein Build für',
    downloadFor: 'Download für',
    availableOn: 'Verfügbar für',
  },
} as const;

export type StringKey = keyof typeof STRINGS.en;

export function t(locale: Locale, key: StringKey): string {
  return STRINGS[locale][key];
}
