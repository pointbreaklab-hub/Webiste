# PointBreakLab Website — context for future sessions

The marketing/portfolio site for PointBreakLab (pointbreaklab.com). Hosts the Whispr product page and is the public face of the project.

## Stack & deploy

- **Astro 4** + **Tailwind CSS** + **Three.js** (lazy-loaded for the hero)
- Static output (`output: 'static'` in `astro.config.mjs`)
- Hosted on **GitHub Pages** with custom domain `pointbreaklab.com`
- Repo: `https://github.com/pointbreaklab-byte/Webiste` (yes, "Webiste" — typo in repo name, harmless)
- Deploy: pushes to `main` trigger `.github/workflows/deploy.yml` → builds → uploads to Pages
- Domain registered at **Porkbun**

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

`src/pages/index.astro` is one long page with these sections:
- Hero (Three.js canvas) — copy is **"Your messages, only yours" + "Built right, by default"**, NOT "cannot be surveilled / adversarial conditions" (toned down 2026-05-06 after user feedback that the original framing read as "drug lord app")
- Apps (Whispr + Knot + ?? cards) — Whispr tagline is `PRIVATE BY DEFAULT`
- Whispr (features, how-it-works, transports)
- Security (architecture details — full crypto stack panel kept; this is competence proof for recruiters)
- Updates (roadmap cards)
- Download (APK button + download box with SHA-256)
- About (RG monogram + studio framing)

`src/pages/privacy.astro` is the privacy policy. Mirrors the in-app version at `securechat/lib/ui/screens/privacy_policy_screen.dart` — keep them in sync if either changes.

`src/pages/whispr/add.astro` is the **deep-link landing page** for invite links shared from the app.

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
