# PointBreakLab Website — context for future sessions

The marketing/portfolio site for PointBreakLab (pointbreaklab.com). Hosts the Whispr product page and is the public face of the project.

## Stack & deploy

- **Astro 4** + **Tailwind CSS** (no client-side framework). Total client JS ~1.5 KB.
- Static output (`output: 'static'` in `astro.config.mjs`)
- Hosted on **GitHub Pages** with custom domain `pointbreaklab.com`
- Repo: `https://github.com/pointbreaklab-byte/Webiste` (yes, "Webiste" — typo in repo name, harmless)
- Deploy: pushes to `main` trigger `.github/workflows/deploy.yml` → builds → uploads to Pages
- Domain registered at **Porkbun**
- Discussion notes for context: stay with Astro. React/Svelte would ship more JS for *zero* functional benefit on a static marketing site. If a future page genuinely needs reactivity, add it as an Astro **island** — don't migrate the site framework.

## Build / deploy commands

```bash
npm install      # first time
npm run dev      # local dev at localhost:4321
npm run build    # → dist/
git push         # auto-deploys via GitHub Actions
```

## Pinned versions — DO NOT auto-upgrade

- **`@astrojs/sitemap@3.2.1`** — pinned. Versions 3.7.x crash with `Cannot read properties of undefined (reading 'reduce')` against Astro 4.16. If you bump Astro, re-test sitemap before bumping it.

## Project context (don't drift on these)

- **Goal**: portfolio project to land a software engineering job (NOT a business). Solo developer, student in Würzburg, no money to spend on infra.
- **Brand**: `PointBreakLab` — one word, no space. Matches `pointbreaklab.com`. Never write "PointBreak Lab".
- **Contact email**: `mail.roshankumargupta@gmail.com` (project-facing, not the personal one).
- **License copy on website**: `Free · Personal use` (the row was hidden from the download box recently — keep it that way unless user asks to restore).
- **Whispr is proprietary**, source closed. Do NOT propose AGPL/GPL/MIT or "open source" framing on the site.
- **No commercial-licensing copy** — the user is not selling anything; "commercial license available" framing was removed.
- **No `/imprint` page** is currently linked from the footer. The draft page was deleted because the user (a) doesn't want their dorm address public, (b) doesn't have a virtual office yet, (c) is below the §5 TMG threshold for a non-commercial portfolio site. Don't restore the Imprint link until user has a real `ladungsfähige Anschrift`.
- **No "Source code available" promises** on the site — the user might open-source later, but no public commitment yet.

## Performance rules learned the hard way

- **Never use `backdrop-filter: blur()`** on scroll-fixed elements. It's the #1 cause of scroll jank on macOS — repaints every frame. The Nav uses solid `rgba(10,10,10,0.92)` instead. (Fixed 2026-05-05 after MBP 16 scroll lag report.)
- **All scroll listeners must be `{ passive: true }`** — anything else blocks the scroll thread.
- **Toggle classes only when state changes** — don't classList.add/remove on every scroll event.
- **`prefers-reduced-motion: reduce`** is respected — single static frame, no animation loop, all transitions disabled.

## Editorial theme system (2026-05-06 redesign)

The site went through a "design-forward editorial" upgrade. **Do not
revert these patterns** — they're what differentiates the site from
the standard "dark + teal + monospace" privacy-app template.

- **Numbered chapter eyebrows.** Every top-level homepage section uses
  the `<SectionEyebrow num="0X" label="...">` component, which renders
  `0X ─── LABEL ─── ●` with hairline dividers and a trailing dot. Six
  chapters total: 01 THE LAB · 02 WHISPR · 03 ARCHITECTURE · 04 WHAT'S
  COMING · 05 GET WHISPR · 06 THE STUDIO. **Don't replace these with
  plain `<p>` eyebrows again.** This is the single most distinctive
  visual element on the site.

- **Per-section atmospheric glow.** Every section has an `aria-hidden`
  `<div>` with a subtle accent (or blue) radial gradient behind the
  content (`bg-accent/[0.05]` to `[0.10]` + `blur-3xl`). Adds
  cinematic depth at zero JS / GPU cost. Position varies per section
  for visual rhythm. Pattern:
  ```html
  <div aria-hidden="true" class="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-64 bg-accent/[0.07] blur-3xl pointer-events-none"></div>
  ```

- **Headline weight contrast.** Most section h2s are `font-black`. The
  Architecture section h2 is intentionally `font-light` with tight
  tracking — editorial counterpoint. Don't normalise it back.

- **Card hover refinement.** AppCard and FeatureBlock use accent
  box-shadow + tiny lift on hover (`hover:-translate-y-1` +
  `shadow-[0_8px_32px_-8px_rgba(0,212,170,0.35)]`). Don't downgrade
  back to "border color change only".

- **Palette warmth.** `bg` is `#0b0b0d` (not `#0a0a0a`), `surface` is
  `#131316` (not `#111`), `border` is `#23232a` (not `#1f1f1f`). The
  bg/surface/border were warmed up by ~1 step on the gray scale. Don't
  cool them back to pure black.

- **WCAG AA contrast.** `hint` is `#737373` (was `#444444`). Bumped to
  clear 4.5:1 on the dark bg. Don't darken back.

## Hero animation — CSS/SVG only, NO Three.js

**Don't reintroduce Three.js or any other JS-driven hero animation.**
The hero originally used Three.js (468 KB bundle, continuous WebGL render
loop). After it was reported still laggy on a MacBook Pro 16 — even with
the loop paused-when-off-screen, capped at 30 FPS, and node count
reduced — we dropped Three.js entirely and replaced it with a CSS/SVG-
only animated network. (2026-05-06.)

How the current hero works:

- `Hero.astro` frontmatter generates **42 nodes** with deterministic
  pseudo-random positions (mulberry32 PRNG, fixed seed `424242`). Edges
  are drawn between any two nodes whose Euclidean distance is < 18% of
  the viewBox.
- The whole network is rendered as inline `<svg>` at build time — zero
  client JS.
- ~22% of nodes have a CSS `nodePulse` keyframe (opacity + radius oscillation, 6s cycle, randomised per-node delays so they don't pulse in sync).
- The whole `.hero-network` container has a slow 24s `networkDrift`
  transform animation (translate + scale) that gives the impression of
  3D motion the old Three.js scene rotation provided. Single transform
  on a single element = GPU-cheap.
- Soft accent orbs (`bg-accent` and `bg-blue-500` blurred circles) and
  the grid overlay are kept — they're free and add depth.

Total client JS for the whole site after this change: **~1.5 KB**
(down from ~471 KB). Don't regress this without a strong reason.

If you genuinely need an interactive 3D hero in the future, do it as
an Astro **island** loaded only on the largest desktop breakpoint, and
benchmark it on a low-end Android Chrome before shipping.

## DNS records at Porkbun (don't delete these)

Apex (`pointbreaklab.com`):
- `A` records → `185.199.108.153` / `.109.153` / `.110.153` / `.111.153` (GitHub Pages)
- `AAAA` records → `2606:50c0:8000::153` through `8003::153` (GitHub Pages IPv6)

`www`:
- `CNAME` → `pointbreaklab-byte.github.io` (must include `.github.io` suffix or Porkbun bounces to pixie parking)

Email forwarding (Porkbun's defaults — leave alone):
- `MX` → `fwd1.porkbun.com` (10), `fwd2.porkbun.com` (20)
- `TXT` SPF, DKIM, DMARC — keep them

GitHub Pages auto-managed (don't touch):
- `_acme-challenge.pointbreaklab.com` TXT records — these are Let's Encrypt verification

## Typical pitfalls

- **Free GitHub plan + private repo = no Pages.** Repo must stay public. The website code is just marketing markup, no Whispr app source.
- **HTTPS enforce can only be enabled after the cert is issued.** API will return 404 ("certificate does not exist yet") until Let's Encrypt has issued the cert (5–30 min after DNS verifies).
- **CNAME values must be FQDN.** Just `pointbreaklab-byte` doesn't work — needs the `.github.io`.

## Layout / sections

`src/pages/index.astro` is one long page with six chapter-numbered top-level sections:

- **Hero** — H1 is **"Apps that don't watch back."** (NOT the brand name "PointBreakLab" — that goes in the Nav and the subhead). Subhead: studio context + apps preview. Mono coda: "Free · encrypted · never on a server." (2026-05-06 reframing after "drug lord" feedback.)
- **01 ─ THE LAB** — three AppCards: Whispr (live, `PRIVATE BY DEFAULT`), Knot (soon, encrypted notes), **Elixir (coming later, 🧪 offline secrets vault)**. The third card was previously `????` with a mystery tagline — that read as half-finished and was renamed to Elixir.
- **02 ─ WHISPR** — features, how-it-works, transport layer
- **03 ─ ARCHITECTURE** — terminal-style `security-architecture.txt` panel (full crypto stack — strongest single element; keep). h2 uses `font-light` for editorial contrast.
- **04 ─ WHAT'S COMING** — roadmap cards with status-driven visual treatment: `building` cards have accent border + glow, `soon` cards have amber border, `planned` cards stay muted.
- **05 ─ GET WHISPR** — download button + download counter (see below)
- **06 ─ THE STUDIO** — RG monogram + studio framing. (User has not yet provided a real photo to replace the monogram.)

`src/pages/privacy.astro` is the privacy policy. Mirrors the in-app version at `securechat/lib/ui/screens/privacy_policy_screen.dart` — keep them in sync if either changes.

`src/pages/whispr/add.astro` is the **deep-link landing page** for invite links shared from the app.

## APK distribution — GitHub Releases (NOT in repo)

The APK lives in **GitHub Releases**, not in `public/downloads/`.
Live download URL on the site:

```
https://github.com/pointbreaklab-byte/Webiste/releases/latest/download/whispr-android.apk
```

`releases/latest/download/<filename>` auto-resolves to the most recent
release. Filename is **always** `whispr-android.apk` (don't include
the version in the filename, it would break the auto-resolve).

To ship a new release:

```bash
# Build + sign the APK in securechat/, then:
cp securechat/build/app/outputs/flutter-apk/app-arm64-v8a-release.apk /tmp/whispr-android.apk
gh release create vX.Y.Z /tmp/whispr-android.apk \
  --title "Whispr vX.Y.Z — <theme>" \
  --notes "<changelog>"
```

The website auto-points at the latest release — no website code change
needed for new APK versions. SHA-256 in the download box still has to
be updated manually in `src/pages/index.astro` since it's static text.

**Don't add the APK back to `public/downloads/`.** The repo is
deliberately kept lean and out of git LFS territory by hosting the
binary in Releases instead.

## Download counter — fetched, soft-revealed at 1000+

The Download section has a hidden `<div id="download-count">`. An inline
script in `index.astro` fetches `api.github.com/repos/<owner>/<repo>/releases`,
sums `download_count` across all assets in all releases, and reveals
the counter only if total ≥ 1000.

Rules of the thing (don't regress):

- **No analytics scripts, no third-party trackers.** A single fetch to
  the public GitHub API is the entire telemetry surface. Aligned with
  the privacy ethos.
- **Soft-revealed.** Below 1000 the page shows nothing. Don't change
  this to "show whatever the count is" — "23 downloads" is worse than
  no number.
- **Cached 1 hour in localStorage** to be polite to the API rate limit
  (60 req/hr per IP unauthenticated).
- **Graceful degradation.** Network/rate-limit/private-mode failures
  silently leave the counter hidden. No error UI.
- The `REVEAL` constant in the script (currently `1000`) is the only
  knob — change it if needed but keep it round.

## Invite link contract — `/whispr/add`

The Whispr app's "Share invite link" button generates URLs like:

```
https://pointbreaklab.com/whispr/add?k=<keyhex64>&n=<urlencoded_name>&t=<unix_ms_expiry>
```

Behaviour, all driven by inline JS in `add.astro`:

| Condition | Page behaviour |
|---|---|
| `k` is a 64-char hex AND (`t` is missing OR `t` is in the future) | Build `whispr://add?k=...&n=...&t=...`, show "Open in Whispr" button, auto-redirect after 250 ms (browser silently no-ops if scheme isn't registered) |
| `t` exists and `now > t` | Hide install/auto-redirect CTAs. Show yellow "⏱ Link expired — ask the person who sent it for a fresh one" pill. |
| `k` missing/malformed | Show generic install CTA only. |

**Don't:**
- Add server-side state to track link redemption — there's no server, and "single-use receiver-side dedup" was deliberately rejected (see `securechat/CLAUDE.md` "Deep links & invites").
- Tighten the "no `t` = always valid" rule; older app builds don't send `t` and we accept them for backward compat.
- Strip the `t` param when building the `whispr://` URL — the app reads it too and shows its own "Invite link expired" dialog.
- Move the redirect into a server redirect (page must work as static HTML; GitHub Pages can't run server logic).

## APK distribution

- **Live download URL**: `https://pointbreaklab.com/downloads/whispr-android.apk`
- The APK file (~39 MB) is **committed to the repo** at `public/downloads/whispr-android.apk`. GitHub Pages serves it as a static asset.
- **Signing**: release keystore (`CN=Whispr, OU=Mobile, O=Whispr`), NOT debug. The keystore lives at `securechat/android/keystore.properties` (gitignored — never commit).
- **Build command**: `cd securechat && flutter build apk --release --split-per-abi`. Use the `arm64-v8a` variant for the website (covers ~98% of Android devices).
- **Verify signature** before uploading:
  ```bash
  ~/Library/Android/sdk/build-tools/35.0.0/apksigner verify --verbose --print-certs <apk>
  ```
  Should print "Verifies" and show `CN=Whispr` (not `CN=Android Debug`).
- **SHA-256** in the download box must match the live APK. Recompute on every release:
  ```bash
  shasum -a 256 public/downloads/whispr-android.apk
  ```
  Then update [src/pages/index.astro](src/pages/index.astro) (the row with `SHA-256 (APK)`).

### Migrate to GitHub Releases for v1.1+

Committing 39 MB binaries to git history is fine for v1.0 but bloats the repo over time. For v1.1 onward, switch to GitHub Releases:

```bash
gh release create v1.1.0 path/to/app-arm64-v8a-release.apk \
  --title "Whispr v1.1.0" \
  --notes "Release notes here"
```

Then change the website's download button URL to:
```
https://github.com/pointbreaklab-byte/Webiste/releases/latest/download/whispr-android.apk
```

That URL auto-redirects to whatever the latest release's asset is. Repo stays lean, releases get version tags and download counts visible on the GitHub profile.

## SEO setup (live)

Configured 2026-05-06. All foundational files are generated/served:

| Asset | Path | Source |
|---|---|---|
| `sitemap-index.xml` + `sitemap-0.xml` | served at root | `@astrojs/sitemap@3.2.1` integration in `astro.config.mjs` |
| `robots.txt` | served at root | `public/robots.txt` (committed) |
| Organization JSON-LD | embedded in every page `<head>` | `src/layouts/Base.astro` |
| SoftwareApplication JSON-LD (Whispr) | embedded in every page `<head>` | `src/layouts/Base.astro` |
| `og-image.svg` | served at root | `public/og-image.svg` (1200×630, brand-matching) |
| Canonical link tag | every page | `src/layouts/Base.astro` |
| OG / Twitter Card tags | every page | `src/layouts/Base.astro` |

### Search Console state

- **Domain ownership verified** via DNS TXT record: `google-site-verification=zy-h-Q9WbZUMKieFQ5kUbzC9YgqUB6RHxO0pIRyAQo0` (lives at Porkbun, apex). Don't delete this row.
- **Sitemap submitted**: `sitemap-index.xml`
- **Indexing requested** for `/` (manual via URL Inspection tool)

### Things that look like SEO but aren't worth touching now

- **Generating a PNG version of `og-image.svg`** — most platforms render SVG fine. Only relevant if a specific platform's preview is broken.
- **Per-page `<title>` and `<meta description>`** for `/privacy` — not implemented; privacy page falls back to default. Add only if it ever ranks for queries you care about.
- **Translating to German** for local SEO — overkill for a portfolio.

## What's intentionally *not* on the site

- Imprint page (see above)
- Terms of Service page (footer link exists but no page yet)
- GitHub link / "View source" buttons (closed-source)
- Enterprise / pricing / commercial license sections
