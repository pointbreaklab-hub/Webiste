// Release facts (version, date, SHA-256) are written ONCE, in the English page,
// which is the file the release pipeline edits. A German page reads them from
// there at build time instead of keeping its own copy, because a copy goes stale
// on the next release and a stale checksum on a download page tells people a
// genuine file is tampered with.
//
// If a row cannot be found the build FAILS. Rendering a blank or an old hash
// would be worse than no deploy.

import fs from 'node:fs';
import path from 'node:path';

function source(enPage: string): string {
  return fs.readFileSync(path.join(process.cwd(), 'src/pages', enPage), 'utf8');
}

/** The value cell of a `<span class="text-hint …">Label</span><span …>value</span>` row. */
export function releaseRow(enPage: string, label: string): string {
  const esc = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const m = source(enPage).match(
    new RegExp(`<span class="text-hint[^"]*">${esc}</span><span[^>]*>([^<]+)</span>`),
  );
  if (!m) throw new Error(`en-release: no "${label}" row in src/pages/${enPage}`);
  return m[1];
}

/** A top-level `const NAME = '…';` in the English page's frontmatter. */
export function releaseConst(enPage: string, name: string): string {
  const m = source(enPage).match(new RegExp(`^const ${name}\\s*=\\s*'([^']+)';`, 'm'));
  if (!m) throw new Error(`en-release: no const ${name} in src/pages/${enPage}`);
  return m[1];
}
