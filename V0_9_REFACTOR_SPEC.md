# LLM Notes v0.9 — Existing Product Refactor

이 문서는 v0.9 작업에서 누락과 방향 이탈을 막기 위한 실행 기준이다. 기존 `dev_plan_2.md`는 보존하며, 현재 배포 제품을 새 앱으로 대체하지 않는다.

## Product principle

> Motion should communicate navigation, hierarchy, continuity, and spatial relationships — not decorate static cards.

> Kinetic exploration outside, calm technical reading inside.

핵심 목표는 다음 두 가지다.

1. LLM/생성형 AI를 실제로 공부할 수 있는 수준으로 이론·모델·역사 콘텐츠의 깊이와 최신성을 높인다.
2. 목차와 탐색은 drag, scroll, slide, zoom, morph가 자연스럽게 이어지는 kinetic/spatial UI로 개선한다.

탐색 UI는 적극적으로 움직일 수 있지만 장문 문서는 안정적이어야 한다. 기존 route, search, timeline map/list, model DB, concepts, organizations, issues, frontiers, learning paths, local progress, theme, citations를 이유 없이 삭제하거나 새 prototype으로 대체하지 않는다.

## Phase A — Audit and data repair

- 전체 route, navigation, reusable component, dependency, motion, mobile, theme, local state 구조를 먼저 조사한다.
- 모든 timeline event에 canonical ID를 사용하고 duplicate, 동일 날짜·제목, chronology, organization/concept/source link, 실제 count를 자동 검증한다.
- UI count는 데이터에서 계산하며 하드코딩하지 않는다.
- source는 type, organization/author, publication date, verification date, supported claim, primary/secondary를 표현한다.
- source의 존재와 claim support를 구분한다. 변동 정보는 공식 최신 자료로 다시 검증하고 확인하지 못한 정보는 명시한다.
- metadata는 `status`, `lastReviewed`, `contentDepth`, `sourcesVerified`를 단일 schema에서 파생한다.
- broken links, 관계 누락, 언어·인코딩 불일치, 잘못된 fallback source를 검사한다.

## Content depth

모든 페이지를 억지로 같은 길이로 만들지 않는다. Core Study Guide는 약 25–60분 읽기 밀도를 허용하며 장황함이 아니라 빠진 설명을 채운다.

Core guide는 필요에 따라 다음을 포함한다.

- 정확한 정의, 필요성, 해결 문제, 선수 지식
- 역사적 배경과 이전 방식의 한계
- 충분한 직관
- 단계별 mechanism
- 변수·shape·계산 순서·직관을 포함한 formalism
- 전체 architecture/pipeline 내 위치
- training과 inference 차이
- tensor layout, memory, batching, cache, numerical stability, latency, throughput
- modern variants, trade-offs, failure cases
- 작은 concrete example
- 실질적인 common misconceptions
- 2026년 relevance
- 내부 related links
- primary sources와 further reading 분리

우선 확장 대상은 architecture, training, post-training/reasoning, inference, retrieval/agents, multimodal 계열이다. 기존 문서와 중복을 먼저 확인하고 taxonomy에 없는 핵심 개념만 추가한다.

## Model, issue, frontier content

- Model Family는 계보, 시작 배경, 세대별 변화, 공개 범위, modality/reasoning/tool/context 변화, API 관계, discontinuity를 설명한다.
- Individual Release 상단에는 “이전 모델에서 무엇이 달라졌나”가 즉시 보여야 한다.
- release date, developer, predecessor/successor, architecture/training 공개 내용, post-training, modality, context/output, tools, agent capability, claims/caveats, API, weights/license, limitations, 영향, 공식 source를 모델별 중요도에 맞게 조사한다.
- 요약·특징·사건·해석의 반복 문장을 제거하고 내용이 없는 section은 유지하지 않는다.
- Issues/Frontiers는 관련 source만 사용하며 source가 부족하면 `needs-review`로 표시한다.
- Issue brief는 논쟁, 높은 합의, 주장 A/B와 근거, 평가 방법, 한계, 2026년 상황, 미해결점을 다룬다.

## Motion foundation

공통 primitive를 먼저 만든다. 실제 이름은 현재 architecture에 맞추되 SpatialCanvas, KineticRail, DeckNavigator, SlideTransition, SharedTransitionLink, ZoomCluster, DragSurface, ProgressPath, ReducedMotionFallback 역할을 중앙화한다.

- micro: 120–220ms
- card/deck: 220–400ms
- large spatial focus: 400–700ms
- velocity, friction, spring, snap, overscroll resistance는 절제된 손맛으로 통일한다.
- transform/opacity 중심으로 구현하고 불필요한 dependency와 layout reflow를 피한다.
- reduced motion에서도 기능과 정보 접근성을 보존한다.

장식적 hover scale, 전 섹션 fade-in, glow, animated gradient, neon AI palette, particle, floating orb, glass 카드 도배, 무의미한 3D globe는 금지한다.

## Representative screens

### Home Knowledge Map

현재 orbital map을 spatial knowledge atlas로 발전시킨다. literal solar system 표현은 피한다.

- desktop: pan, controlled zoom, cluster focus, zoom-level disclosure, smooth overview/back
- mobile: tap focus와 swipe 우선, 안정적일 때만 pinch, browser scroll과 충돌 금지
- 기본 정보량을 줄이고 focus/hover/zoom 때 세부 정보를 노출한다.
- 카테고리 size/density/distance는 의미 구조를 반영한다.

### Models / Family

- 동일 카드 wall을 kinetic rail, deck, organization lane, lineage explorer의 자연스러운 조합으로 전환한다.
- wheel, trackpad, drag, arrow가 같은 selection state를 조작한다.
- family page의 release lineage를 drag 및 `< >`로 탐색하고 foreground/depth를 명확히 한다.

### Learning Paths

- 기존 local progress key와 완료 상태를 보존한다.
- checklist를 visual path로 만들고 chapter focus, `< >`, swipe, directional transition과 progress movement를 연결한다.

## Timeline and concepts

- Timeline의 map/list/filter 기능을 보존한다.
- map에 pan, wheel navigation, zoom, focus, inertia, year ruler, active highlight와 inline detail panel을 강화한다.
- list는 빠르고 접근 가능한 대안으로 유지한다.
- Concepts index는 Foundations, Architecture, Training, Post-training, Inference, Retrieval & Agents, Multimodal, Evaluation & Safety cluster로 구성하고 spatial/rail/deck 탐색을 제공한다.

## Calm reading UX

- 긴 concept 문서에 readable width, sticky TOC, reading progress, anchors, equations, tables, code, callouts, figures, related sidebar를 제공한다.
- 본문 전체를 흔들지 않는다.
- 문서 말미에 이전/다음 개념을 제공하고 방향성 있는 article transition을 적용한다.
- content data와 interactive presentation을 분리하고 동일 데이터를 list/map/carousel/search/path에서 재사용한다.

## Connectivity and escape hatches

- concept relationship을 중앙 모델로 관리하여 related concepts, model links, timeline, lineage, paths에서 재사용한다.
- global search, keyboard shortcut, nav, direct route를 빠른 escape hatch로 유지한다.
- motion navigation은 기존 빠른 탐색을 방해하지 않는다.

## Accessibility, mobile, performance

- keyboard, visible focus, semantic buttons/links, screen-reader alternative, touch target, prefers-reduced-motion을 지원한다.
- mobile은 desktop canvas 축소판이 아니라 swipe, rail, snap, tap focus, directional controls, bottom progress에 맞춰 별도 설계한다.
- 긴 문서는 animation canvas와 분리하고 큰 graph는 필요시 viewport rendering/virtualization을 사용한다.
- 중급 모바일에서도 눈에 띄는 frame drop과 layout shift가 없어야 한다.

## Delivery order

1. Audit / Data Repair
2. Motion Foundation
3. Home, Models/Family, Learning Path
4. Concept Reading UX
5. Core Concept Expansion
6. Models, Issues, Frontiers source/content expansion
7. Desktop/mobile/theme/reduced-motion/keyboard/performance QA

## Definition of done

Build 성공만으로 완료 처리하지 않는다. 콘텐츠 깊이·최신성·claim-source 적합성, duplicate/count/metadata/relationship 정합성, drag 손맛과 directional continuity, 30분 이상 읽기 편한 문서, mobile/reduced motion/keyboard, frame drop과 layout shift까지 검증한다.

