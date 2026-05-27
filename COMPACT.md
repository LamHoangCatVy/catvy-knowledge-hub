<!--
  ██████╗ ██████╗ ███╗   ███╗██████╗  █████╗  ██████╗████████╗
  ██╔════╗██╔═══██╗████╗ ████║██╔══██╗██╔══██╗██╔════╝╚══██╔══╝
  ██║     ██║   ██║██╔████╔██║██████╔╝███████║██║        ██║
  ██║     ██║   ██║██║╚██╔╝██║██╔═══╝ ██╔══██║██║        ██║
  ╚██████╗╚██████╔╝██║ ╚═╝ ██║██║     ██║  ██║╚██████╗   ██║
   ╚═════╝ ╚═════╝ ╚═╝     ╚═╝╚═╝     ╚═╝  ╚═╝ ╚═════╝   ╚═╝
  Cat Vy Knowledge Hub — Developer Handoff Document
-->

# 🧠 Cat Vy Knowledge Hub — Handoff Manifesto

> *Everything an incoming developer needs to know about this codebase.*

<br/>

| Attribute | Value |
|:----------|:------|
| **Project** | Portfolio + Knowledge Hub |
| **Author** | Lam Hoang Cat Vy — Senior AI Systems Architect |
| **Stack** | Docusaurus `3.10.1` · React `19` · TypeScript `6.0` · Tailwind `3.4` |
| **Runtime** | Node `≥20` |
| **Status** | ✅ Build passing · ✅ Type-check passing · `npx docusaurus build` · `npx tsc --noEmit` |
| **Last verified** | May 6, 2026 |
| **Domain** | `catvy.dev` (base: `/`) |

---

<br/>

## 📐 1. Architecture Overview

```
catvy-knowledge-hub/
│
├── docusaurus.config.ts          ◀── Routes · presets · headTags · navbar · footer · CSS bundle order
├── sidebars.ts                   ◀── Recursive filesystem sidebar (reads docs-manifest.json)
├── tailwind.config.js            ◀── Tailwind 3 (preflight: OFF — manual resets in custom.css)
├── postcss.config.js             ◀── PostCSS pipeline (Tailwind + autoprefixer)
├── tsconfig.json                 ◀── IDE type-check only (NOT used by Docusaurus build)
│
├── src/
│   ├── pages/
│   │   └── index.tsx             ◀── Entry point → dynamic import → AppWrapper → PortfolioApp
│   ├── css/
│   │   ├── custom.css            ◀── (1) Tailwind + global resets + dark theme vars
│   │   ├── blog-theme.css        ◀── (2) Blog components (progress bar, TOC, ring, hero)
│   │   ├── portfolio-scroll.css  ◀── (3) Portfolio homepage (726 lines)
│   │   └── themes.css            ◀── (4) 3-theme system (dark · light · vy) — MUST load last
│   ├── theme/                    ◀── Swizzled Docusaurus components
│   │   ├── BlogPostPage/
│   │   ├── BlogListPage/
│   │   └── BlogPostItem/Header/
│   ├── plugins/
│   │   └── project-pages.js      ◀── Build-time route injector (admin, projects, project/{id})
│   ├── components/
│   │   ├── blog/                 ◀── Blog3DScene, ReadingProgress, FloatingTOC, ScrollReveal, etc.
│   │   └── Portfolio/            ◀── AppWrapper, PortfolioApp, ScrollPortfolio, hooks/, data/, galaxy/
│   └── types/
│       └── three.d.ts            ◀── window.THREE type declaration
│
├── docs/                         ◀── Knowledge hub content (4 domains, ~54 topics)
├── blog/                         ◀── 8 blog posts (YYYY-MM-DD-slug/index.mdx)
├── static/
│   ├── data/                     ◀── JSON data files (projects, knowledge, certs, community, manifest)
│   └── docs-manifest.json        ◀── Sidebar visibility toggles (build-time only)
│
└── build/                        ◀── Production output
```

---

<br/>

## 🗺️ 2. Route Map

| Route | Source | Notes |
|:------|:-------|:------|
| `/` | `src/pages/index.tsx` → dynamic import → `AppWrapper` → `PortfolioApp` → `ScrollPortfolio` | Fullscreen portfolio with dot nav, 7 sections, parallax scroll |
| `/projects` | `project-pages.js` `addRoute` → `ProjectListPage.tsx` | Grid of all projects from `projects-showcase.json` |
| `/project/{id}` | `project-pages.js` `addRoute` → `ProjectDetailPage.tsx` | Tabbed detail view, optional iframe demo |
| `/admin` | `project-pages.js` `addRoute` → `AdminPage.tsx` | Password gate: `catvy2024` |
| `/knowledge-hub/intro` | `docs/intro.mdx` | Route base path is `knowledge-hub` (not `docs`) |
| `/knowledge-hub/{domain}/…` | `docs/{domain}/…` | Recursive sidebar from `sidebars.ts` |
| `/blog` | Docusaurus blog plugin | 8 posts |
| `/blog/{slug}` | Swizzled `BlogPostPage` → `BlogPostPageWrapper` | All blog enhancements injected here |

---

<br/>

## ⚙️ 3. Critical Configuration Files

### `docusaurus.config.ts` — The Command Center
- **Routes** · **Presets** · **headTags** · **Navbar** · **Footer**
- **CSS bundle order** is sacred: `custom.css` → `blog-theme.css` → `portfolio-scroll.css` → `themes.css`
- ⚠️ **DO NOT reorder** — `themes.css` must load **last** (depends on CSS vars set by others), `custom.css` must load **first** (Tailwind + resets)
- `routeBasePath: 'knowledge-hub'` — docs map to `/knowledge-hub/`, not `/docs/`
- 3-dot theme switcher is injected via `headTags[0].innerHTML`

### `sidebars.ts` — Knowledge Hub Navigator
- Recursively discovers `docs/` filesystem at build time
- Reads `static/docs-manifest.json` for visibility toggles (`visible: false` hides from sidebar)
- ⚠️ Uses `fs.readFileSync` — crashes on missing manifest
- Output: `knowledgeSidebar` (name must match docs plugin expectation)

### `tsconfig.json` — Type Safety Guard
- **IDE type-check only** — Docusaurus build ignores this
- `exclude` blocks `galaxy/` and `MatrixView.tsx` from type analysis
- `ignoreDeprecations: "6.0"` required for TypeScript 6 compatibility

### `tailwind.config.js` — Styling Engine
- `preflight: false` — Tailwind's base reset is **intentionally disabled**
- Manual reset CSS lives in `custom.css` — this avoids conflicts with Docusaurus's built-in styles
- `content` paths define where Tailwind scans for class usage

---

<br/>

## 🎨 4. CSS Architecture — The Loading Order Pact

> *These 4 files are bundled in order. Changing the order will break the site.*

| # | File | Scope | Key Contents |
|:-:|:------|:------|:-------------|
| 1 | `custom.css` | Global · Tailwind · Dark theme | `@tailwind base/components/utilities`, dark theme CSS vars under `[data-theme='dark']`, scrollbar, navbar, code blocks, accordion. `html.portfolio-page` enables fullscreen portfolio layout |
| 2 | `blog-theme.css` | Blog posts only | Reading progress bar (fixed top), floating TOC (fixed right), reading ring (fixed bottom-right), scroll-to-top, hero image, 3D scene container, author card, scroll reveal, typography |
| 3 | `portfolio-scroll.css` | Portfolio homepage only | Mouse-gradient hero, scroll-reveal, dot navigation, chapter labels, project carousel, scroll-snap sections, timeline, parallax layers — 726 lines of cinematic magic |
| 4 | `themes.css` | 3-theme system (dark · light · vy) | CSS custom properties per `[data-theme]`, navbar theme-aware styles, `.theme-switcher` + `.theme-btn` dot styles. **Theme is set via HTML `data-theme` attribute, NOT Docusaurus `colorMode` React context** |

---

<br/>

## 🧩 5. Component Ecosystem

### 5A. Theme Swizzles — Overriding Docusaurus Internals

| Component | What It Overrides | Why |
|:----------|:------------------|:----|
| `BlogPostPage/index.tsx` | Blog post page wrapper | Injects ALL blog enhancements: `ReadingProgress`, `ReadingRing`, `FloatingTOC`, `ScrollRevealEffect`, `BlogHeroImage`, `AuthorSection`, `ScrollToTop` |
| `BlogListPage/index.tsx` | Blog listing page | Custom index styling |
| `BlogPostItem/Header/index.tsx` | Blog post header | Custom header rendering |

### 5B. Blog Components

| Component | Purpose | Edge Cases & Gotchas |
|:----------|:--------|:---------------------|
| `Blog3DScene.tsx` | Three.js canvas (particles / network / orbit) | **CDN-loaded at runtime** (r128, CDNJS). Two-phase init: load script → build scene. Dependency `threeReady` was missing — fixed May 6, 2026. Skips on mobile (`pointer: coarse`). 4 blog posts use it via MDX imports |
| `ReadingProgress.tsx` | Fixed top progress bar | Scroll listener, percentage-based width, `z-index: 300` |
| `FloatingTOC.tsx` | Collapsible right-side TOC | `setTimeout(600ms)` for DOM settle. Reads `article h2, h3`. Auto-assigns heading IDs. IntersectionObserver: `rootMargin: '-80px 0px -80% 0px'` |
| `ScrollReveal.tsx` | Fade-in-up on scroll | Targets `p, pre, blockquote, h2, h3, h4, ul, ol, img`. Staggered `transitionDelay`. IntersectionObserver `threshold: 0.08`. `setTimeout(400ms)` wait |
| `GlassCard.tsx` | Glassmorphism card wrapper | Supports `hover`, `borderColor`, `onClick` |
| `AuthorCard.tsx` | Author card component | Usage path unclear — may be rendered elsewhere |

### 5C. Portfolio Components

| Component | Role | Key Details |
|:----------|:-----|:------------|
| `AppWrapper.tsx` | Dynamic loader for `PortfolioApp` | `import('./PortfolioApp')` — dynamic import to avoid SSR issues. Shows spinner while loading |
| `PortfolioApp.tsx` | Root portfolio | Sets `html.portfolio-page` + `body overflow: hidden`. Loads Font Awesome, Google Fonts, Chart.js from CDN. Wraps `ScrollPortfolio` with `NoiseOverlay`, `CustomCursor`, `LoadingScreen` |
| **`ScrollPortfolio.tsx`** | **7-section cinematic scroll** (487 lines) | **THE MAIN PORTFOLIO.** Sections: Hero → Origin → Translator → Competency → Projects (horizontal carousel) → Timeline → Explore CTA. Dot navigation via IntersectionObserver. `PROJECT_SHOWCASE_MAP` bridges data IDs |
| `AdminPage.tsx` | CRUD admin at `/admin` | Password: `catvy2024`. Narrative templates (Problem/Solution, etc). Generates JSON for copy-paste — **does NOT write files** (static site limitation) |
| `ProjectDetailPage.tsx` | Detail at `/project/{id}` | Tabbed UI. Optional split-screen iframe for demo URLs |
| `ProjectListPage.tsx` | Listing at `/projects` | Grid of all projects from JSON |

> **Dormant Views** (excluded from TypeScript, not rendered anywhere):  
> `MatrixView.tsx` · `AdventureView.tsx` · `CareerQuestView.tsx` · `KnowledgeView.tsx` · `Quest2DView.tsx` · `StoryView.tsx` · All files in `galaxy/`

### 5D. Portfolio Custom Hooks

| Hook | What It Does | Technical Detail |
|:-----|:-------------|:-----------------|
| `useMouseGradient` | CSS custom properties `--mx` `--my` for hero radial gradient | `mousemove` listener → `document.documentElement.style.setProperty` |
| `useScrollReveal` | IntersectionObserver-based reveal | Configurable `threshold`, `rootMargin` |
| `useParallax` | Parallax scroll offset | `transform: translateY(${offset}px)` |
| `useTilt` | 3D tilt effect on hover | CSS transform from mouse position within element bounds |
| `useCountUp` | Animated number counter | Interpolates from 0 to target over configurable duration |

### 5E. Data Files

| File | Contents |
|:-----|:---------|
| `data/projects.ts` | `PROJECTS_DATA` — hardcoded project entries (`proj_1` … `proj_7`). IDs differ from `projects-showcase.json` |
| `data/constants.ts` | Color constants, section labels |
| `data/certifications.ts` | Certification data |
| `data/community.ts` | Community involvement data |
| `data/knowledge.ts` | Knowledge domains data |
| `data/helpers.ts` | Utility functions |
| `data/useData.ts` | Data fetching hook |
| `data/index.ts` | Re-exports |

### 5F. Static Assets

| Asset | Role |
|:------|:-----|
| `static/data/projects-showcase.json` | 7 projects with narrative templates, tech stacks, images, demo URLs. Consumed by `project-pages.js` and `ProjectDetailPage` |
| `static/data/projects.json` | Alternative schema — raw project data |
| `static/data/knowledge.json` | 12.5 KB knowledge domain data |
| `static/data/certifications.json` | Certification data |
| `static/data/community.json` | Community data |
| `static/data/manifest.json` | Version 1.0.0, references other data files |
| `static/docs-manifest.json` | Sidebar visibility — `visible: false` hides from sidebar (build-time, consumed by `sidebars.ts`) |

---

<br/>

## 📚 6. Knowledge Hub Content

| Domain | Path | Description |
|:-------|:-----|:------------|
| 🧪 LLM Engineering | `docs/llm-engineering/` | Large Language Model engineering topics |
| ☁️ Cloud Engineering | `docs/cloud-engineering/` | Cloud infrastructure & platform topics |
| 🏗️ Systems Design | `docs/systems-design/` | Distributed systems & architecture topics |
| 🔒 Security | `docs/security/` | Security engineering topics |

**Pattern:** `docs/{domain}/{subcategory}/{n-topic-title}/index.mdx`  
**Total:** ~54 topic folders with `index.mdx` contents  
**Categories:** Each level has `_category_.json` with `{ "label": "..." }` (not `.yml`)

### Blog Posts (8 total)
All 8 posts in `blog/*/index.mdx` with `image: https://images.unsplash.com/...` in frontmatter.  
**4 posts use `<Blog3DScene>` via MDX imports:**
- `ezpolicy-agentic-rag` → `type="network"`
- `genai-security-guardrails` → `type="orbit"`
- `cloud-migration-lessons` → `type="particles"`
- `open-source-yummy` → `type="orbit"`

---

<br/>

## 🔧 7. Build & Run Commands

```bash
npm start          # Dev server — hot reload on port 3000
npm run build      # Production build → build/
npm run serve      # Serve build/ locally (port 3000)
npm run clear      # Clear cache (.docusaurus/)
npm run typecheck  # tsc --noEmit — IDE type-check (NOT used by build)
npm run build-once # Single build via watch script
```

---

<br/>

## 🧬 8. Dependency Web — What Imports What

```
src/pages/index.tsx
  └── dynamic import → AppWrapper.tsx
      └── dynamic import → PortfolioApp.tsx
          └── ScrollPortfolio.tsx
              ├── useMouseGradient · useScrollReveal · useParallax · useTilt · useCountUp
              ├── PROJECTS_DATA (from data/projects.ts)
              └── portfolio-scroll.css

src/theme/BlogPostPage/index.tsx  ◀── Swizzled (always renders, including SSR)
  ├── <BlogPostPage> (original Docusaurus component)
  ├── ReadingProgress · ReadingRing · FloatingTOC · ScrollRevealEffect
  ├── BlogHeroImage (reads og:image meta tag)
  ├── AuthorSection (reads DOM for metadata)
  ├── ScrollToTop
  └── blog-theme.css

Blog MDX posts
  └── import Blog3DScene from @site/src/components/blog/Blog3DScene
      └── loads Three.js CDN at runtime → window.THREE

sidebars.ts
  └── reads static/docs-manifest.json
      └── discovers docs/ filesystem
          └── generates knowledgeSidebar

project-pages.js
  └── reads static/data/projects-showcase.json
      └── addRoute for /projects · /project/{id} · /admin

AdminPage → narrative templates → JSON output (manual save required)
ProjectDetailPage → reads window.__SHOWCASE__ or fetches from DOM
```

---

<br/>

## ⚠️ 9. Pain Points — Things That Will Bite You

### 9.1 🔥 SSR vs Client: The #1 Source of Bugs

> **Docusaurus is a static site generator.** Components render **twice**: once at build time (Node.js SSR) and once in browser (hydration). Browser-only APIs (`window`, `document`, `matchMedia`, `localStorage`) will **crash the build** if they run during SSR.

**Defensive patterns used throughout this project:**

| Pattern | Where Used |
|:--------|:-----------|
| Dynamic imports: `import('./Component')` inside `useEffect` | `AppWrapper.tsx` → component never renders in SSR |
| `useIsBrowser()` from Docusaurus | Guards against server renders |
| `typeof window !== 'undefined'` checks | Various components |
| `useEffect` + `useState` to delay DOM queries | `BlogHeroImage` (swizzled components always render during SSR) |

> ⚠️ **Swizzled theme components** (`BlogPostPage`, `BlogListPage`, `Header`) **ALWAYS render during SSR.** That's why blog enhancement components use `useEffect` + `useState` to delay browser API access.

**What WILL break the build** if added to a swizzled theme component:
- `useBlogPost()` from `@docusaurus/plugin-content-blog/client` — runtime-only, crashes during SSR
- `require()` within component body during SSR
- Direct `document.querySelector()` outside of `useEffect`

### 9.2 🎭 Theme System Tension — Two Systems, One DOM

There are **two independent theme systems** that **must not conflict:**

| System | Mechanism | Config |
|:-------|:----------|:-------|
| **Docusaurus `colorMode`** | Toggles `.light` / `.dark` class on `<html>` | `disableSwitch: false`, `respectPrefersColorScheme: false` |
| **Our 3-theme system** | `[data-theme='dark']` · `[data-theme='light']` · `[data-theme='vy']` via CSS custom properties | Inline head script sets `data-theme` to saved value or `'dark'` on page load |

> The inline head script sets `data-theme` to saved value OR `'dark'` on page load.  
> Docusaurus's colorMode toggle is **not hidden** (may show moon/sun icon).  
> The 3-dot theme buttons are a **separate UI** injected via headTags — they set `data-theme` attribute only, **not** Docusaurus `colorMode`.

**To add a theme:**
1. Add `[data-theme='yourtheme']` block in `themes.css` (copy existing as template)
2. Add name to `themes` array in `docusaurus.config.ts` headTags innerHTML
3. Add CSS class `.theme-btn-yourtheme` with background color

### 9.3 🖼️ BlogHeroImage Source

The component reads `meta[property="og:image"]` because Docusaurus renders this for SEO.  
**Problem:** Blog posts set `image: https://images.unsplash.com/...` in frontmatter, but Docusaurus may **not override** the site-wide `og:image` from `headTags` with the post-specific image.

**Current workaround:** Filter out `docusaurus-social-card` and `undraw` images. Hero only shows when `og:image` meta tag has been properly overridden for that post.

> If hero shows the wrong image or doesn't appear: check what `meta[property="og:image"]` contains in the built HTML.

### 9.4 🧪 Blog3DScene — Three.js CDN Loading Fragility

- **Network dependency:** CDN down → canvas blank (no error visible)
- **Ordering:** Scene init depends on `threeReady` becoming `true` after CDN loads
- **Container dimensions:** `clientWidth`/`clientHeight` = 0 → scene renders at 0×0
- **Resize:** Re-initializes camera/renderer but not the full scene
- **ScrollProgress:** Defined in interface but **not wired** to any scroll listener
- **Cleanup:** `renderer.dispose()` + `scene.clear()` exist but leak check needed

### 9.5 📂 Sidebar Discovery — Absolute Paths Only

`sidebars.ts` uses `process.cwd()` + hardcoded `'docs'` directory.  
Renaming `docs/` → sidebar fails silently (returns `[]`).  
`loadManifest()` reads from `static/docs-manifest.json` — same absolute path issue.

### 9.6 🔗 Project ID Mapping Hell

`ScrollPortfolio.tsx` has `PROJECT_SHOWCASE_MAP` translating `PROJECTS_DATA` IDs (`proj_1`…) to `projects-showcase.json` IDs (`ezpolicy`…).  
Adding a project to **one file but not the other** → mapping breaks.

| Context | ID Format |
|:--------|:----------|
| Portfolio carousel | `PROJECTS_DATA` IDs (`proj_1`, `proj_2`, …) |
| Project detail (`/project/{id}`) | `projects-showcase.json` IDs (`ezpolicy`, `aml-chatbot`, …) |

### 9.7 🎯 Portfolio Scroll Quirks

- **Navbar visible**: Achieved via `z-index: 500` on `.navbar` when `html.portfolio-page`. Portfolio sets `body overflow: hidden` and uses internal scroll mechanism
- **Scroll-snap**: `scroll-snap-type: y mandatory` on container. Dot nav uses `scrollIntoView({ behavior: 'smooth' })` — if snap conflicts, switch to `behavior: 'auto'`
- **Dot tracking**: IntersectionObserver per section with `threshold: [0, 0.25, 0.5, 0.75, 1]`. Active dot = most visible section

---

<br/>

## 🚧 10. Undone Work & Known Gaps

| Gap | Status | Detail |
|:----|:-------|:-------|
| **Galaxy 3D Portfolio** | On hold, files preserved | All `galaxy/` files excluded from TypeScript. Not rendered anywhere. To revive: remove from `tsconfig.json` exclude, add imports, integrate with router |
| **Alternative views** | Dormant | `AdventureView`, `CareerQuestView`, `Quest2DView`, `StoryView` — unused |
| **Mobile responsiveness** | Missing | Portfolio designed for 1920px desktop. No comprehensive mobile breakpoints. Floating TOC at `right: 16px` may overlap on narrow screens |
| **Blog3DScene mobile** | Skipped | Explicitly skips on `(pointer: coarse)` — no mobile 3D fallback |
| **Blog3DScene scrollProgress** | Not wired | Defined in interface but never passed from blog MDX posts |
| **Admin auto-save** | Cannot implement | Static site limitation — JSON must be manually copied to `static/data/projects-showcase.json` |
| **Inline tags/authors** | Warning level | `onInlineTags: 'warn'`, `onInlineAuthors: 'warn'` — may produce build warnings |

---

<br/>

## 🚑 11. Common Errors & Quick Fixes

| Symptom | Likely Cause | Fix |
|:--------|:-------------|:----|
| `FATAL ERROR: Cannot read properties of undefined (reading 'call')` | Swizzled component uses `useBlogPost()` or browser API during SSR | Wrap in `useEffect` + `useState`, or use dynamic import |
| BlogHeroImage shows Docusaurus social card | og:image meta not overridden by post frontmatter | Check filter includes card URL. Consider reading from JSON-LD or post metadata |
| Blog3DScene canvas is blank | CDN not loaded, `container.clientHeight = 0`, or missing `threeReady` dep | Check DevTools 404. Add `position: relative; min-height: 50vh` to container. Verify `threeReady` in useEffect deps (fixed May 6, 2026) |
| Portfolio navbar hidden | `.portfolio-page` CSS not applied or z-index too low | Verify `PortfolioApp` sets `html.classList.add('portfolio-page')`. Check `z-index: 500` in `custom.css` |
| Knowledge hub sidebar empty | `docs-manifest.json` missing/malformed, or no `.mdx` files | Verify file exists. Check directory structure. Run `npm run clear && npm run build` |
| `TypeScript build error: window.THREE does not exist` | Missing type declaration | Recreate `src/types/three.d.ts`: `declare global { interface Window { THREE: any } }` |
| Project detail page 404 | ID doesn't match `projects-showcase.json` | IDs are case-sensitive. Verify `project-pages.js` generates the route |
| Theme switcher dots missing | `navbar__items--right` class changed | Inline script appends to `.navbar__items--right`. Check if Docusaurus changed the class |
| Scroll-snap broken on portfolio | `scroll-snap-type: y mandatory` overridden | Check CSS specificity. Verify parent has explicit height |

---

<br/>

## 🗺️ 12. Quick Reference — Where to Start

| Task | Action |
|:-----|:-------|
| **Add a blog post** | Create `blog/YYYY-MM-DD-slug/index.mdx` with frontmatter (`title`, `description`, `authors`, `tags`, `image`, `slug`). Optionally import `<Blog3DScene>` in MDX. Rebuild |
| **Add a project** | Edit `static/data/projects-showcase.json` — add project with `id`, `title`, etc. Update `PROJECT_SHOWCASE_MAP` in `ScrollPortfolio.tsx`. Rebuild |
| **Add a knowledge hub topic** | Create `docs/{domain}/{subcategory}/{n-topic-title}/index.mdx`. Add `_category_.json` at subcategory level. Run `npm run clear && npm run build` |
| **Add a knowledge hub domain** | Create `docs/{new-domain}/` with subdirectories. Add entry to `static/docs-manifest.json`. Run `npm run clear && npm run build` |
| **Fix a visual bug in blog** | Edit `src/theme/BlogPostPage/index.tsx` (enhancement wrapper) and/or `src/css/blog-theme.css` |
| **Fix a visual bug on portfolio** | Edit `src/components/Portfolio/views/ScrollPortfolio.tsx` and/or `src/css/portfolio-scroll.css` |
| **Change theme colors** | Edit `src/css/themes.css` — the `[data-theme='dark']`, `[data-theme='light']`, `[data-theme='vy']` blocks |
| **Add a new theme** | Copy a `[data-theme]` block in `themes.css`, add to `themes` array in `docusaurus.config.ts` headTags, add button dot CSS |
| **Add a new page/route** | Static page: `src/pages/my-page.tsx`. Data-driven: follow `project-pages.js` pattern (`addRoute` in `contentLoaded`) |

---

<br/>

## 🌐 13. Environment & Deployment

| Setting | Value |
|:--------|:------|
| **Domain** | `catvy.dev` (configured in `docusaurus.config.ts` → `url`) |
| **Base URL** | `/` (not a sub-path deployment) |
| **Build output** | `build/` (standard Docusaurus output) |
| **CI/CD** | None configured (`.github/` may have remnants, no git remote) |
| **Environment** | `.env` file exists (contents not checked into git) |

---

<br/>

<div align="center">

```
╔══════════════════════════════════════════════════════════════╗
║  If you break something, start by reading the error stack.  ║
║  90% of bugs are SSR-related or CSS-order-related.          ║
║  May the build be ever in your favor.                       ║
╚══════════════════════════════════════════════════════════════╝
```

</div>
