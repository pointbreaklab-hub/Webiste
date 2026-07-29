# PointBreakLab Website — context for future sessions

The marketing/portfolio site for PointBreakLab (pointbreaklab.com). Hosts the Whispr product page and is the public face of the project.

## Stack & deploy

- **Astro 4** + **Tailwind CSS** (no client-side framework). Total client JS ~1.5 KB.
- Static output (`output: 'static'` in `astro.config.mjs`)
- Hosted on **GitHub Pages** with custom domain `pointbreaklab.com`
- Repo: `https://github.com/pointbreaklab-hub/Webiste` (yes, "Webiste" — typo in repo name, harmless)
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
- `CNAME` → `pointbreaklab-hub.github.io` (must include `.github.io` suffix or Porkbun bounces to pixie parking)

Email forwarding (Porkbun's defaults — leave alone):
- `MX` → `fwd1.porkbun.com` (10), `fwd2.porkbun.com` (20)
- `TXT` SPF, DKIM, DMARC — keep them

GitHub Pages auto-managed (don't touch):
- `_acme-challenge.pointbreaklab.com` TXT records — these are Let's Encrypt verification

## Typical pitfalls

- **Free GitHub plan + private repo = no Pages.** Repo must stay public. The website code is just marketing markup, no Whispr app source.
- **HTTPS enforce can only be enabled after the cert is issued.** API will return 404 ("certificate does not exist yet") until Let's Encrypt has issued the cert (5–30 min after DNS verifies).
- **CNAME values must be FQDN.** Just `pointbreaklab-hub` doesn't work — needs the `.github.io`.

## De-bloat campaign (2026-07-28) — READ BEFORE EDITING ANY PRODUCT PAGE

Owner directive: *"Too much content leads to a dead end."* All three
product pages were cut hard. This **overrides** any earlier instruction in
this file that says a now-removed section is load-bearing or must not be
dropped. If an older note contradicts a page's "LEAN REWRITE" block, the
LEAN REWRITE block wins.

**What triggered it.** A three-persona review of the live site (a
recruiter, a skeptical developer, and a 45-second skimmer, each actually
reading the pages) independently reported the same things: they gave up
before reaching the download, the volume read as marketing rather than
substance, and the deep technical material was buried where nobody got to
it. All three named the same worst offenders: repeated architecture
representations, big "who it's for" blocks, and long roadmaps.

**The pattern applied to every page:**

1. Say what it is, show it, say what it does, then **get to the download**.
   The download now sits at section 02 or 03, never at the bottom.
2. One representation per idea. If a diagram and a spec panel and a prose
   block all say "no server, encrypted, peer to peer", keep the one that
   lands best.
3. Four feature cards, not six or eight.
4. One static product shot instead of an auto-playing carousel.
5. Deep technical detail goes behind a `<details>` toggle, or off the page
   entirely.
6. **Never cut the honesty.** Every disclaimer, limitation and
   "not independently measured" line stays. The skeptical-developer
   review called candour about maturity the single biggest trust signal on
   the site. Trim volume, never trim honesty.

**Results:** Knot 712 → 308 lines, Whispr 383 → 324, Heart 713 → 351.

**Where the cut depth went:** into a forthcoming **Knot white paper**
(published on pointbreaklab.com), which is the right home for the full
architecture spec, the mesh topology, and the token-benchmark
methodology. Don't re-inline that material into the product page.

## Layout / sections

The site was split in two on 2026-05-07 (see "Studio + product split"
below). The homepage is now studio-framed; Whispr lives at its own
`/whispr/` page. **Don't merge them back into a single homepage** — the
split is what lets future apps slot in at `/knot/`, `/elixir/`, etc.

### `src/pages/index.astro` — homepage (studio)

Three top-level chapters:

- **Hero** — H1 is **"Apps that don't watch back."** (the brand name
  "PointBreakLab" goes in the Nav and the subhead). Beneath the
  subhead, one short mono line carries the cryptographic receipt:
  `End-to-end encrypted via the Signal Protocol · X3DH + Double
  Ratchet · see the architecture →` — the link deep-anchors to
  `/whispr/#architecture`. This gives a skeptic above-the-fold
  evidence without having to scroll. **Don't strip this line back to
  a claims-only coda.** It addresses a 2026-05-07 review that
  flagged the homepage as "claims, not receipts."

  Earlier we also shipped a second line ("Solo project from Würzburg
  · no investors · no ads · no telemetry · free forever") to defuse
  the "if it's free, you're the product" reflex. **That line was
  removed at the user's request** — Whispr is not committed to being
  free forever, so the line was an unsafe promise. Don't reintroduce
  it; if a business-model line ever lands again, it must not say
  "free forever" or otherwise commit to permanent zero-cost.

  Primary CTA "Explore Whispr" links to `/whispr/`, secondary
  "View All Apps" anchors to `#apps` on the same page.
- **01 ─ THE LAB** — four AppCards: Whispr (`LIVE`, `PRIVATE BY
  DEFAULT`, href `/whispr/`), Heart (`LIVE`, `LOCAL-FIRST WELLNESS`,
  href `/heart/`), Knot (`TESTING`, `PEER-TO-PEER VERSION CONTROL`,
  href `/knot/`), Elixir (coming later, 🧪 offline secrets vault). Each
  active card's "Explore →" is the funnel into its product page. The
  `AppCard` component now takes a `status` prop (defaults `"LIVE"`;
  Knot uses `"TESTING"`) so apps in pre-alpha don't have to lie about
  being LIVE. Don't use `"LIVE"` for anything that doesn't have a
  public binary.
- **02 ─ PROOF** — compact terminal-style `stack.txt` panel listing
  **studio-level guarantees only** (Storage · Server · Accounts ·
  Telemetry · Trust model). Each row is something that holds for
  *every* PBL app (Whispr, Heart, Knot, Elixir). Footer link
  "Per-app cryptography (Whispr's Signal Protocol stack, etc.) →"
  deep-links to `/whispr/#architecture` where the messaging-specific
  primitives (X3DH, Double Ratchet, ECIES envelope) actually belong.

  **Don't reintroduce Whispr-specific rows on this panel.** An
  earlier iteration listed Identity (Ed25519), Key Exchange (X3DH),
  Message Crypto (Double Ratchet), and Metadata (ECIES envelope) —
  all of which are messaging concerns, irrelevant to Heart (BLE
  wellness, no networking crypto), Knot (P2P version control with its
  own Ed25519 + Tor stack), and Elixir (offline vault). Listing them
  as "what PointBreakLab ships" on
  the studio homepage was a structural dishonesty for a privacy
  product. Studio-level claims belong here; per-app stacks go on
  per-app pages. (Generalised 2026-05-08.)

  **Don't strip this section back to "claims-only".** Privacy claims
  have a higher proof burden than ordinary product claims because
  the user can't verify them by using the product — only by
  inspecting the architecture. Competitors (Signal, Session, Briar,
  SimpleX) all show cryptography above the fold; we do too.
  (Originally added 2026-05-07 after a review pointed out the
  post-split homepage was claim-only.)
- **03 ─ THE STUDIO** — RG monogram + about text + Contact button.
  (User has not yet provided a real photo to replace the monogram.)

### `src/pages/whispr/index.astro` — product page (Whispr)

> **LEAN REWRITE 2026-07-28 — see "De-bloat campaign" above. 383 → 324
> lines. Download moved from section 04 to section 02. CUT: the 3-step
> HOW IT WORKS block (the architecture diagram already shows how a
> message travels) and 6 → 4 feature cards. Do NOT restore them.**

Current structure:

- **Hero** — "Your messages, only yours." + Download / Architecture CTAs.
  Keeps the Signal-Protocol receipt line (X3DH + Double Ratchet + a
  deep-link to `#architecture`); that line answers the skeptic above the
  fold, don't strip it.
- **01 ─ WHAT IT DOES** — four FeatureBlock cards (Zero servers · Signal
  Protocol · No account · Encrypted email), then the THREE TRANSPORTS
  block (LAN / Tor / BLE). The transports stay: "works with no internet"
  is Whispr's real differentiator.
- **02 ─ GET IT** — download buttons, version + SHA-256 box, hidden
  download counter, changelog link, plus the censored-region note
  pointing at the **in-app** bridges guide (Settings → Network →
  Bridges → (i) icon). Instructions live in the app so they're available
  offline; don't duplicate the steps here.
- **03 ─ ARCHITECTURE** — the `ArchitectureDiagram` (inline SVG, no JS)
  plus the terminal-style `security-architecture.txt` panel. **Both stay.**
  For a privacy messenger the crypto proof IS the pitch, not bloat: the
  diagram is the conceptual map, the panel is the primitive-by-primitive
  reference. h2 uses `font-light` for editorial contrast.
- **04 ─ ROADMAP** — status-driven cards (`building` accent, `planned`
  muted). obfs4 bridge transport leads.

The download counter script (~1 KB) lives at the bottom of this file,
not on the homepage. SHA-256 lives in this file too — update on every
release, not in `index.astro`.

### `src/pages/heart/index.astro` — product page (Heart)

> **LEAN REWRITE 2026-07-28 — see "De-bloat campaign" above. This was
> the longest page on the site: 713 → 351 lines (−51%). Download moved
> from section 04 to section 02. CUT and do NOT restore: the 5-slide
> phone carousel (now one static shot), the "THE BAND IS JUST A SENSOR"
> prose block, the 14-row Coospo-vs-Heart comparison table, the 3-step
> HOW IT WORKS panel, and 8 → 4 feature cards.**

Current structure:

- **Hero** — "Your heart, on your device." + Download / Algorithms CTAs.
- **Product shot** — one static phone frame (`flutter_01.png`).
- **01 ─ WHAT IT DOES** — four FeatureBlock cards (Live HR + HRV ·
  Sleep/recovery/strain · On-device intelligence · No account, no cloud),
  then the HARDWARE panel (Coospo HW9 / any BLE strap / wrist optical).
- **02 ─ GET IT** — download buttons, version + SHA-256 box, changelog +
  privacy links, then the chest-strap-vs-wrist accuracy card.
- **03 ─ ARCHITECTURE** — `HeartArchitectureDiagram` + the **84-test-case
  validation card**, both kept VISIBLE: "auditable maths, not an AI black
  box" is Heart's whole pitch and the validation card is the strongest
  credibility signal on the page. The deep detail (6-step pipeline, RMSSD
  math, the formula/reference table) is collapsed behind ONE `<details>`
  toggle. The diagram's "NOT IN THE PICTURE" band includes "No model
  file", which is the differentiator; keep it.
- **04 ─ ROADMAP** — status-driven cards, same pattern as Whispr.

**Don't cut the closing disclaimer** (compressed 2026-07-29 from six
sentences to three). It does two jobs: it stops the validation card from
reading as an end-to-end accuracy claim, and the "wellness application,
not a medical device … not diagnosis" sentence is the EU MDR 2017/745
safe-harbour line. Heart does rhythm-anomaly detection, which sits close
to regulated AFib-detection territory, so that sentence is load-bearing.

**Don't describe the HW9 as chest-only.** It's a versatile band
worn on the chest, upper arm, or forearm. The accuracy section
that compares chest-strap-as-a-class to wrist-optical is fine
(category claim, not HW9-specific), but anywhere the HW9
specifically is mentioned, mention all three wear positions.

### Heart's architecture diagram component

`src/components/HeartArchitectureDiagram.astro` is the SVG-only
visual for the Heart product page. Three columns mirroring
Whispr's diagram:

- **Left — HW9 BAND · CHEST OR ARM** — Heartbeat (ECG) →
  bpm + RR ms → BLE GATT 0x2A37 → device-boundary dashed line →
  BLE notify frame exits.
- **Middle — BLE channel** — single horizontal pipe with the pill
  "BLE notify · ~1 Hz", annotations "DIRECT · NO RELAY · < 10 m"
  and "ON THE WIRE · bpm + RR ms only".
- **Right — YOUR PHONE** — arrow enters from below → BLE service
  capture → on-device-boundary dashed line → JSONL log (sandboxed)
  → compute pipeline (HRV / Sleep / Rhythm + Readiness / Strain) →
  Live UI · Insights.
- **Bottom band** — "NOT IN THE PICTURE — No server · No account ·
  No cloud sync · No telemetry · No model file".

Same palette as the Whispr diagram. viewBox 800×500, SVG inlined at
build time, scales to mobile without media queries.

### `src/pages/knot/index.astro` — product page (Knot)

> **LEAN REWRITE 2026-07-28 — see "De-bloat campaign" above. 712 → 308
> lines (−57%), the campaign's template. Download moved from section 08
> to section 03. Everything below describes the CURRENT page; earlier
> descriptions of a 9–10 chapter structure are historical and wrong.**

**CUT 2026-07-28, do NOT restore:** the 6-slide desktop carousel (now one
static `dashboard.png` shot), 7 → 4 feature cards, the full PROOF /
token-benchmark section (now one line; the detail belongs in the Knot
white paper), the mid-page Knot AI cross-sell block (it has its own
`/knot-ai/` page), the three big WHO IT'S FOR cards (now three chips),
the whole STATUS & ROADMAP section, the `KnotMeshDiagram`, the
`knot-architecture.txt` terminal panel, and FAQ 7 → 4.

Earlier owner decisions still in force: the 01 THE PROBLEM section, the
02 STORYBOARD section, the raw-size "ceiling" ratio table, the "Voice
calls" roadmap card, the `IN TESTING` hero pill, and the hero's
save→commit→synced + platform mono lines were all deleted before this
and stay deleted.

Current structure:

- **Hero** — "Your code. Your machines. No middleman." + one plain
  subhead + the accent AI line ("Multiple machines, AI agents, one repo:
  they build it together over your LAN, hands-free, while you watch").
  That AI line is the killer differentiator no central host can match;
  keep it. CTAs: Download / How it works.
- **Product shot** — one static desktop-window frame.
- **01 ─ HOW IT WORKS** — three steps (the folder · the peers · the save).
- **02 ─ WHAT IT DOES** — four FeatureBlock cards (AI agents build
  together · Saves become synced commits · Real git underneath ·
  Provable, governed AI), then the three-audience chips, then a single
  line for the token benchmark.
- **03 ─ GET IT** — macOS `.dmg` + Linux `.tar.gz` buttons wired to
  `github.com/pointbreaklab-hub/knot/releases/latest/download/…`, the
  **VS Code Marketplace card** (`PointBreakLab.knot-vcs`, framed as an
  editor add-on, not a third platform), version + per-asset SHA-256, and
  the first-run/Gatekeeper steps folded into a `<details>` toggle.
- **04 ─ ARCHITECTURE** — the `KnotArchitectureDiagram` only.
- **05 ─ FAQ** — four `<details>` cards (safe · server · git · offline
  collaborator). Native `<details>`, no JS.

**Overstatement policy (binding):** claims must not exceed what is
verified. Specifically banned: org-scale numbers ("two-thousand-engineer
org"), "six interface languages" (4 of 6 are English fallback), and
marketing not-yet-designed features. The A/B benchmark is the only
efficiency number, and it now appears as a single sentence.

#### Hard rules for the Knot page

- **`TESTING` badge on the homepage AppCard, not `LIVE`.** Don't promote
  it until there's a notarized installer. The in-hero `IN TESTING` pill
  and the Footer `(Testing)` tag were removed by owner decision; don't
  re-add either. Pre-alpha honesty is carried by the download section's
  first-run steps.
- **The public download is live and free** (macOS + Linux, ad-hoc-signed,
  not notarized). The old "no public download until notarized" /
  "request early access" gate is SUPERSEDED; don't restore mailto
  early-access framing. Releases live on `pointbreaklab-hub/knot`
  (lowercase repo); SHA-256s update per release.
- **No GitHub source link.** The Knot source is private. Don't add "View
  source" buttons until the owner decides otherwise. (Open-sourcing Knot
  is under consideration as the highest-leverage trust unlock, but it is
  the owner's call, not a copy change.)
- **No `free forever` / pricing language.** Site-wide rule.
- **Three-audience framing stays** (SOLO · TEAMS · ENTERPRISE, mapping to
  knot/CLAUDE.md §14) but as compact chips now, not a full section. Keep
  all three; don't re-expand them into cards.
### Knot's architecture diagram component

`src/components/KnotArchitectureDiagram.astro` is the SVG-only
visual for the Knot product page. Three columns mirroring Whispr's
diagram (same viewBox 800×500, same palette, same `<figure>` +
`<figcaption>` accessibility wrapper):

- **Left — YOUR LAPTOP** — Hit save in editor → Daemon sees the
  change → Real git commit (signed) → DEVICE BOUNDARY (dashed) →
  Encrypted git pack exits.
- **Middle — PEER-TO-PEER · NO MIDDLEMAN** — Single horizontal
  pipe `TOR · .onion`, annotations `ED25519 MUTUAL AUTH · Both sides
  prove identity` and `ON THE WIRE · Encrypted bytes only · Relays
  carry, never read`.
- **Right — TEAMMATE'S LAPTOP** — Encrypted git pack arrives from
  below → DEVICE BOUNDARY → Verify + import pack → New commit on
  disk → Shows in `git log`.
- **Bottom band** — `NOT IN THE PICTURE — No GitHub · No central
  server · No cloud account · No git add · No git push`.

The "absences" band is the editorial heart of the diagram — it
makes the architectural choice explicit. Same role the Whispr and
Heart diagrams' bottom bands play. Don't drop or soften it.

### Other pages

- `src/pages/privacy.astro` — privacy policy. Mirrors the in-app
  version at `securechat/lib/ui/screens/privacy_policy_screen.dart`.
  Keep them in sync if either changes.
- `src/pages/whispr/add.astro` — **deep-link landing page** for invite
  links shared from the app.
- `src/pages/whispr/changelog.astro` — Whispr release log.
- `src/pages/heart/changelog.astro` — Heart release log (full
  history v1.0.0 → latest; v1.0.14 deliberately omitted).

## Studio + product split (2026-05-07, extended 2026-05-13)

Before 2026-05-07 the homepage was one long page with six chapters,
all Whispr-specific. The split moved sections 02–05 to `/whispr/`,
renumbered them as 01–04 there, and slimmed the homepage to two
chapters (THE LAB, THE STUDIO). Reason: the homepage was trying to
be both a studio portfolio and a product page at once, which
diluted both.

Heart followed the same pattern at `/heart/` (product page) and
`/heart/changelog/`. On 2026-05-13 the previously-shared top-level
`/changelog/` was moved under each product's subtree
(`/whispr/changelog/`, `/heart/changelog/`) so each app fully owns
its own subtree.

**Don't undo the split.** Knot now lives at `/knot/` following the
same pattern; Elixir will follow at `/elixir/` when it lands.
Homepage stays studio-level, each app gets its own product page —
and once it has public releases, its own changelog under that
subtree (e.g. `/knot/changelog/` once Knot ships its first public
binary; nothing to log today).

**Cross-page navigation rule.** `Nav.astro` and `Footer.astro` use
**absolute paths** for every link (`/`, `/whispr/`, `/whispr/#download`,
`/whispr/changelog/`, `/heart/`, `/heart/changelog/`, `/#about`) —
never bare `#anchors`, because those break when the user is on a page
other than the homepage. If you add a new internal link, follow this
convention.

**Nav simplification (2026-05-13, extended 2026-05-24).** The global
Nav no longer carries a top-level "Changelog" entry — with multiple
products the link became ambiguous. Current Nav items: Apps · Whispr
· Heart · Knot · About. Per-product changelogs are reached from the
product page's download box or from the Footer (which lists each
explicitly under Resources). Knot has no changelog page yet (no
public releases). Don't restore a top-level Changelog link without
first adding a landing page that disambiguates between the products
— otherwise the single link will inevitably misroute users.

## Changelog pages — split per product (2026-05-13)

Each app gets its own changelog under its product subtree. The earlier
top-level `/changelog/` (Whispr-only) was moved when Heart's download
box pointed users to a Whispr release log:

- `src/pages/whispr/changelog.astro` — Whispr release log (was
  `src/pages/changelog.astro` before the split).
- `src/pages/heart/changelog.astro` — Heart release log.

Both files share the same structural pattern: a `releases` array in
the frontmatter, one object per release with `tag`, `date`, `kind`
(`feature` / `fix` / `polish` / `note`), `title`, and `body`.
Hand-curated, NOT auto-fetched from GitHub at runtime — keeps the
site static, survives API rate limits, and lets us write
user-facing prose instead of leaking dev-facing release-note jargon.

**Per-release maintenance:** when you ship a new app version, prepend
a new `Release` object to the **right product's** array. Style notes:
- One short user-facing sentence in `body` — what got better for *them*.
- The dev-facing note on GitHub Releases stays technical; this is the
  audience-facing version.
- Skip releases that shipped briefly and got reverted within an hour
  — but include the *revert* itself as a `fix` entry naming the
  reverted version. v1.1.12 (broken) is omitted; v1.1.13 (revert) is
  listed and explains why. That transparency is a credibility signal,
  not something to hide.
- **Heart-specific.** v1.0.14 is intentionally absent: it was a
  draft release for an abandoned band-vibration experiment that never
  shipped to users. Listing it would mislead the audience.

Each release renders as a left-aligned `SectionEyebrow` with the
patch number (`13 ─── V1.1.13 · FIX ─── ●`), then a small mono
date, the user-facing title, and the body. Same editorial chapter
pattern the homepage uses, applied to every release entry.

**Don't add a top-level `/changelog/` shim.** A user landing on
`/changelog/` would be ambiguously routed; we removed the entry
entirely from `Nav.astro` and replaced the single Footer link with
two explicit ones ("Whispr changelog" / "Heart changelog"). Each
product page's download box links to its own changelog.

## APK distribution — GitHub Releases (NOT in repo)

The APK lives in **GitHub Releases**, not in `public/downloads/`.
Live download URL on the site:

```
https://github.com/pointbreaklab-hub/Whispr/releases/latest/download/whispr-android.apk
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
be updated manually in `src/pages/whispr/index.astro` (the product
page, NOT the homepage — the download section moved there in the
2026-05-07 split). The release pipeline (`github_whispr_apk.py`)
already updates this row automatically; the path inside the script
points at the new file.

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
https://github.com/pointbreaklab-hub/Whispr/releases/latest/download/whispr-android.apk
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
