# LLM Notes v0.9 — Current Product Audit

Audit date: 2026-08-14

## Existing product inventory

- Framework: Next.js 16.3, React 19, TypeScript, static export, GitHub Pages deployment.
- Dependencies: React/Next/Zod only. Dedicated motion library is not installed.
- Routes: home, timeline map/list and event detail, model index/family/release, concepts index/detail, organizations, issues, frontiers, learning paths, search, sources, methodology, about, changelog, privacy.
- Data: 93 canonical timeline events after duplicate repair, 108 canonical sources, 45 concepts, 16 organizations, 37 model families, 87 model profiles, 12 issues, 8 frontiers, 5 learning paths.
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

기존 98개 출처는 `linked-not-claim-verified`를 유지한다. 이번 작업에서 원문을 직접 확인해 추가한 10개 출처만 `claim-verified`로 표시했다. 링크 확인일은 문장 검증 완료로 취급하지 않는다.

## Metadata defect

The previous `ContentMeta` used ad-hoc labels and often displayed the same status regardless of real document depth. It also displayed “source date missing” independently of the source records.

The v0.9 metadata model centralizes:

- `status: verified | draft | index | needs-review`
- `lastReviewed`
- `contentDepth: full | partial | stub`
- `sourcesVerified`

Concept guides, stubs, model pages, timeline events, organizations, paths, issues, and frontiers now derive the visible metadata from this schema.

## Content depth audit

- Concept records: 45
- Full study guides after v0.9 expansion: 27
- Remaining indexed stubs: 18
- Organization summaries still in English: 12
- Model family summaries still in English: 37
- Issue 12개는 합의 사실·주장 A/B·근거·평가·한계·현재 상태·미해결 질문 구조로 확장했다.
- Frontier 8개는 정의·역사·메커니즘·2026년 상태·한계·열린 질문 구조로 확장했다.
- 주요 8개 모델 계열은 배경·세대 변화·architecture 공개 범위·단절 해설을 추가했다.
- 모델 프로필의 반복 문장 248개를 제거했다. 일부 오래된 사건·모델의 내용 깊이와 한글 편집은 후속 검토가 남아 있다.

## UX and motion audit

- Home은 기존 궤도 구조를 유지하면서 desktop pan, controlled wheel zoom, 관성, camera reset과 overview 복귀를 지원한다.
- Models index와 model family는 drag·wheel·keyboard·화살표가 같은 상태를 조작하는 공통 kinetic rail을 사용한다.
- Learning path는 기존 localStorage key를 보존한 visual rail과 이동 progress를 사용한다.
- Timeline has a scrollable map and inline detail panel, but no pointer drag, inertia, active centering primitive, or shared directional transition.
- Concept index는 8개 taxonomy cluster와 kinetic concept rail로 재구성했다.
- 상세 문서는 reading progress, 기존 TOC, section anchor와 방향성 있는 이전/다음 navigation을 제공한다.
- 공통 `KineticRail`, `DirectionalLink`와 Home camera primitive를 사용하며 reduced motion에서는 즉시 전환한다.

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

1. 기존 98개 출처의 claim-level 검증을 중요 문장부터 계속 수행한다.
2. 현재 organization 페이지에 없는 연구 그룹의 canonical 관계를 추가한다.
3. 남은 영문 요약과 오래된 모델 프로필을 원문 기반 한국어 편집으로 확장한다.
4. 남은 18개 concept index를 중요도 순으로 full guide로 확장한다.
5. 실제 기기에서 desktop/mobile, dark/light, reduced-motion, keyboard와 animation performance를 반복 점검한다.
