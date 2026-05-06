# Lam Hoang Cat Vy — Portfolio & Knowledge Hub

**Senior AI Systems Architect** | Built with [Docusaurus](https://docusaurus.io/) + React 19 + Three.js + Tailwind CSS

## Quick Start

```bash
npm install
npm start        # Dev server at http://localhost:3000
npm run build    # Production build
npm run serve    # Serve production build
```

## Project Structure

```
catvy-knowledge-hub/
├── src/
│   ├── pages/index.tsx                    # Portfolio homepage (Three.js + React)
│   ├── components/Portfolio/              # Portfolio app (modular)
│   │   ├── PortfolioApp.tsx               # Main orchestrator
│   │   ├── AppWrapper.tsx                 # CDN script loader
│   │   ├── data/                          # Data layer
│   │   │   ├── *.ts                       # Type definitions + static data
│   │   │   └── useData.ts                 # JSON data loading hook
│   │   ├── ui/                            # Reusable UI components
│   │   │   ├── CustomCursor.tsx
│   │   │   ├── Accordion.tsx
│   │   │   ├── ViewToggle.tsx
│   │   │   └── LoadingScreen.tsx
│   │   ├── views/                         # Page views
│   │   │   ├── StoryView.tsx              # CV / Timeline view
│   │   │   ├── MatrixView.tsx             # 3D Galaxy overlay
│   │   │   └── KnowledgeView.tsx          # Knowledge base grid
│   │   └── galaxy/                        # Three.js 3D engine
│   │       ├── GalaxyCanvas.tsx
│   │       └── useGalaxyScene.ts
│   ├── css/custom.css                     # Global styles + Tailwind
│   └── types/three.d.ts                   # CDN library type declarations
├── docs/                                  # Knowledge base (6 domains)
│   ├── intro.mdx
│   ├── genai/                             # Generative AI & LLMs
│   ├── systems-analysis/                  # Systems Analysis
│   ├── product-management/                # Product Management
│   ├── cloud-architecture/                # Cloud Architecture
│   ├── cybersecurity/                     # Cybersecurity
│   └── data-analytics/                    # Data Analytics
├── blog/                                  # Blog posts (8 articles)
├── static/data/                           # JSON data files
│   ├── projects.json                      # 20 projects
│   ├── certifications.json                # 8 certifications
│   ├── community.json                     # 8 community entries
│   ├── knowledge.json                     # 6 knowledge domains
│   └── manifest.json                      # Data index
├── scripts/                               # Utility scripts
│   └── scrape-learning-blog.ts            # Content scraping template
├── .github/workflows/deploy.yml           # GitHub Pages CI/CD
└── docusaurus.config.ts                   # Site configuration
```

## Data Layer

All portfolio data is stored as JSON in `static/data/`. To edit:

| File | Description |
|------|-------------|
| `static/data/projects.json` | 20 enterprise AI projects |
| `static/data/certifications.json` | 8 professional certifications |
| `static/data/community.json` | 8 community contributions |
| `static/data/knowledge.json` | 6 knowledge domains with topics |

The data loading hook (`useData<T>(path, fallback)`) fetches JSON at runtime with
localStorage caching (1-hour TTL) and TypeScript-type fallbacks.

### Adding a New Project

```json
{
  "id": "proj_21",
  "role": "AI Architect",
  "title": "New Project Name",
  "subtitle": "Short description",
  "vision": "Project vision statement",
  "arch": "Architecture description",
  "impl": "Implementation details",
  "busCase": "Business impact",
  "tags": ["GenAI", "AWS"]
}
```

## Galaxy Features

The 3D galaxy (MATRIX view) includes:
- **Bloom post-processing** — glowing core nodes with UnrealBloomPass
- **Particle galaxy** — 12,000 particles in 4 spiral arms
- **Comet trails** — 25-particle tails behind orbiting sub-nodes
- **Energy pulses** — animated glowing orbs traveling along connection lines
- **Starfield parallax** — 700 background stars with mouse parallax
- **Constellation Discovery** — gamified node exploration with persistent progress
- **Keyboard navigation** — Arrow keys, Tab, Enter, Escape, Space, `?`
- **Procedural audio** — Web Audio API ambient drone with mute toggle

## Deployment

The site auto-deploys to GitHub Pages on push to `main` via `.github/workflows/deploy.yml`.

To deploy manually:
```bash
npm run build
# Deploy the `build/` directory to your hosting provider
```

## Tech Stack

- **Framework**: Docusaurus 3.10 (React 19, TypeScript 6.0)
- **Styling**: Tailwind CSS 3.4 + Infima (Docusaurus theme)
- **3D Engine**: Three.js r128 (CDN) + OrbitControls + EffectComposer + UnrealBloomPass
- **Animation**: GSAP 3.12 (CDN)
- **Charts**: Chart.js (CDN, radar chart on Story view)
- **Icons**: Font Awesome 6.4
- **Fonts**: Inter + JetBrains Mono (Google Fonts)
