# LLM Notes v0.9 — Current Product Audit

Audit date: 2026-08-14

## Existing product inventory

- Framework: Next.js 16.3, React 19, TypeScript, static export, GitHub Pages deployment.
- Dependencies: React/Next/Zod only. Dedicated motion library is not installed.
- Routes: home, timeline map/list and event detail, model index/family/release, concepts index/detail, organizations, issues, frontiers, learning paths, search, sources, methodology, about, changelog, privacy.
- Data: 93 canonical timeline events after duplicate repair, 98 canonical sources after URL duplicate repair, 40 concepts, 16 organizations, 37 model families, 87 model profiles, 12 issues, 8 frontiers, 5 learning paths.
- Search: client-side cross-entity search with URL query state and Cmd/Ctrl+K shortcut.
- Theme: light/dark preference stored in `localStorage` under `theme`.
- Learning progress: device-local completion arrays stored under `llm-history:path:<slug>`.
- Timeline: lineage/list modes, organization/importance/type filters, three zoom presets, URL state, inline summary panel.
- Home: orbital hierarchy, click-to-dive, back/overview, draggable nodes with spring-like return, separate mobile placement.
- Accessibility already present in part: semantic links/buttons, focus styles, keyboard escape/search, noscript timeline, reduced-motion CSS.

## Confirmed data defects

The pre-v0.9 data contained three exact duplicate event pairs and three matching duplicate source URLs:

- Toolformer (`tool-use`, `toolformer`)
- Claude 3 (`claude-3`, `claude-3-source`)
- DeepSeek-R1 (`deepseek-r1`, `deepseek-r1-paper`)

These were duplicate records rather than distinct milestones. They have been consolidated. Timeline events now carry stable `evt-<slug>` canonical IDs in source data.

## Source model defect

The previous source model only represented URL existence, publisher, year, tier, and a URL check date. It could not distinguish “the URL was checked” from “the source supports this claim.”

The v0.9 migration now records:

- source type
- author or organization
- publication date
- verification date
- primary/secondary classification
- validation status
- the current claims linked to that source

All 98 sources are intentionally marked `linked-not-claim-verified` until claim-level review is performed. A link check date is no longer presented as proof that every linked sentence was validated.

## Metadata defect

The previous `ContentMeta` used ad-hoc labels and often displayed the same status regardless of real document depth. It also displayed “source date missing” independently of the source records.

The v0.9 metadata model centralizes:

- `status: verified | draft | index | needs-review`
- `lastReviewed`
- `contentDepth: full | partial | stub`
- `sourcesVerified`

Concept guides, stubs, model pages, timeline events, organizations, paths, issues, and frontiers now derive the visible metadata from this schema.

## Content depth audit

- Concept records: 40
- Existing full study guides: 7 (Tokenization, Attention, Transformer, Pretraining, RLHF, DPO, RAG)
- Stub/index concepts: 33
- Organization summaries still in English: 12
- Model family summaries still in English: 37
- Issue/frontier briefs are structurally too short for the requested debate/research depth.
- Model family pages are chronological text lists rather than lineage explanations.
- Many timeline event summaries and older model records remain short English summaries.

## UX and motion audit

- Home has node-level drag and zoom-state replacement but no canvas pan, controlled wheel zoom, zoom-level disclosure, or shared motion state.
- Models index is a static three-column card grid.
- Model family is a numbered paragraph list.
- Learning path is a static checklist despite preserving progress correctly.
- Timeline has a scrollable map and inline detail panel, but no pointer drag, inertia, active centering primitive, or shared directional transition.
- Concept index is a uniform card wall without taxonomy clusters.
- Detailed concept reading has useful long-form sections but lacks sticky TOC, reading progress, previous/next directional navigation, equation/table/code primitives, and centrally reusable relationships.
- Motion behavior is currently implemented independently in Home and browser smooth scrolling. There is no common kinetic design system.

## Mobile audit

- Responsive CSS exists, but desktop interactions are largely reduced by size rather than redesigned as mobile-specific rails/decks.
- Home has mobile node coordinates but free spatial navigation is absent.
- Model and concept indexes collapse to a single static card column.
- Learning progress collapses into stacked checklist rows.
- Timeline defaults to list mode on narrow screens, which is a useful accessible fallback to preserve.

## Phase A validation now enforced

- canonical event ID uniqueness
- event slug uniqueness
- same date/title duplicate detection
- chronological source ordering
- year/date consistency
- source ID and normalized URL uniqueness
- source relationship existence
- source type/author/publication/verification/classification/status/claim-link presence
- model profile/release consistency
- model profile minimum depth and notable-event source links
- mojibake/template corruption checks

## Remaining audit-driven work

1. Claim-level source verification using current primary material; only then promote individual sources to `claim-verified`.
2. Add canonical organization relationships for research groups not represented by current organization pages.
3. Replace English summaries and repetitive model prose with Korean editorial content.
4. Expand 33 concept stubs in priority order.
5. Build common motion primitives and refactor Home, Models/Family, Learning Paths before spreading motion elsewhere.
6. Rework long-form reading UX, Issues, Frontiers, and model depth.
7. Complete desktop/mobile/theme/reduced-motion/keyboard/performance QA.

