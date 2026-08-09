"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react";
import { conceptDocuments, frontierDocuments, issueDocuments, modelFamilies, modelReleases, organizationDocuments } from "@/lib/content";

type Tone = "models" | "concepts" | "organizations" | "history" | "issues" | "frontiers";
type AtlasNode = {
  id: string;
  label: string;
  kicker: string;
  summary: string;
  href?: string;
  tone: Tone;
  children?: AtlasNode[];
};

type Position = { x: number; y: number; scale: number; ring: "outer" | "inner" };
type Offset = { x: number; y: number };

const preferredModels = ["gpt", "gemini", "claude", "llama", "deepseek", "mistral", "qwen", "gemma"];
const preferredConcepts = ["transformer", "attention", "pretraining", "rlhf", "retrieval-augmented-generation", "mixture-of-experts", "reasoning", "agents", "multimodality", "alignment"];
const preferredOrganizations = ["openai", "google-deepmind", "anthropic", "meta", "mistral-ai", "deepseek", "alibaba-cloud", "ai2"];

const historyNodes: AtlasNode[] = [
  { id: "foundations", label: "기반 연구", kicker: "2017—2019", summary: "Transformer와 사전학습이 오늘날 언어 모델의 기본 구조를 만든 시기입니다.", href: "/timeline/?from=2017-01&to=2019-12", tone: "history" },
  { id: "scaling", label: "스케일링", kicker: "2020—2021", summary: "규모와 데이터, 연산량의 관계가 모델 개발의 중심축이 된 시기입니다.", href: "/timeline/?from=2020-01&to=2021-12", tone: "history" },
  { id: "chat", label: "대화형 AI", kicker: "2022", summary: "지시학습과 RLHF가 대화형 인터페이스로 이어진 시기입니다.", href: "/timeline/?from=2022-01&to=2022-12", tone: "history" },
  { id: "multimodal", label: "멀티모달", kicker: "2023—2024", summary: "텍스트와 이미지, 음성을 함께 다루는 모델이 빠르게 확산된 시기입니다.", href: "/timeline/?from=2023-01&to=2024-12", tone: "history" },
  { id: "reasoning-agents", label: "추론과 에이전트", kicker: "2024—현재", summary: "긴 추론과 도구 사용, 자율 실행이 새로운 경쟁축으로 떠오른 시기입니다.", href: "/timeline/?from=2024-01&to=2026-12", tone: "history" },
  { id: "all-history", label: "전체 타임라인", kicker: "2017—2026", summary: "연구와 제품, 모델의 전체 계보를 가로형 시간 지도에서 확인합니다.", href: "/timeline/", tone: "history" },
];

function positionRing(index: number, count: number, ring: "outer" | "inner", offset: number): Position {
  const angle = offset + index * Math.PI * 2 / count;
  const radiusX = ring === "outer" ? 43 : 28;
  const radiusY = ring === "outer" ? 22 : 14;
  const rawX = Math.cos(angle) * radiusX;
  const rawY = Math.sin(angle) * radiusY;
  const tilt = -0.14;
  const x = 50 + rawX * Math.cos(tilt) - rawY * Math.sin(tilt);
  const y = 51 + rawX * Math.sin(tilt) + rawY * Math.cos(tilt);
  return { x, y, scale: .86 + y / 245, ring };
}

function layoutNodes(count: number): Position[] {
  if (count <= 7) return Array.from({ length: count }, (_, index) => positionRing(index, count, "outer", -2.72));
  const outerCount = Math.ceil(count * .62);
  return Array.from({ length: count }, (_, index) => index < outerCount
    ? positionRing(index, outerCount, "outer", -2.72)
    : positionRing(index - outerCount, count - outerCount, "inner", -2.15));
}

function layoutSequence(count: number): Position[] {
  const columns = Math.min(5, Math.max(3, Math.ceil(Math.sqrt(count * 1.8))));
  const rows = Math.ceil(count / columns);
  return Array.from({ length: count }, (_, index) => {
    const row = Math.floor(index / columns);
    const columnInRow = index % columns;
    const rowCount = Math.min(columns, count - row * columns);
    const column = row % 2 ? rowCount - 1 - columnInRow : columnInRow;
    const x = rowCount === 1 ? 50 : 13 + column * 74 / (rowCount - 1);
    const y = rows === 1 ? 52 : 28 + row * 48 / Math.max(1, rows - 1);
    return { x, y: y + Math.sin(index * 1.35) * 2.2, scale: 1, ring: "outer" as const };
  });
}

function compactLabel(label: string, limit = 17) {
  return label.length > limit ? `${label.slice(0, limit).trim()}…` : label;
}

function connectionPath(position: Position, index: number) {
  const bend = index % 2 ? 3.2 : -3.2;
  const middleX = (50 + position.x) / 2;
  const middleY = (51 + position.y) / 2 + bend;
  return `M 50 51 Q ${middleX} ${middleY} ${position.x} ${position.y}`;
}

function DriftingNode({ node, position, index, sequence, selected, onOpen }: { node: AtlasNode; position: Position; index: number; sequence: boolean; selected: boolean; onOpen: () => void }) {
  const [offset, setOffset] = useState<Offset>({ x: 0, y: 0 });
  const offsetRef = useRef<Offset>({ x: 0, y: 0 });
  const velocityRef = useRef<Offset>({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);
  const dragRef = useRef<{ pointerId: number; startX: number; startY: number; originX: number; originY: number; moved: boolean } | null>(null);

  useEffect(() => () => { if (frameRef.current !== null) cancelAnimationFrame(frameRef.current); }, []);

  const updateOffset = (next: Offset) => {
    offsetRef.current = next;
    setOffset(next);
  };

  const returnHome = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    const tick = () => {
      const current = offsetRef.current;
      const velocity = velocityRef.current;
      const nextVelocity = {
        x: (velocity.x - current.x * .028) * .9,
        y: (velocity.y - current.y * .028) * .9,
      };
      const next = { x: current.x + nextVelocity.x, y: current.y + nextVelocity.y };
      velocityRef.current = nextVelocity;
      if (Math.abs(next.x) + Math.abs(next.y) + Math.abs(nextVelocity.x) + Math.abs(nextVelocity.y) < .35) {
        velocityRef.current = { x: 0, y: 0 };
        updateOffset({ x: 0, y: 0 });
        frameRef.current = null;
        return;
      }
      updateOffset(next);
      frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
  };

  const beginPush = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    velocityRef.current = { x: 0, y: 0 };
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, originX: offsetRef.current.x, originY: offsetRef.current.y, moved: false };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const push = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const dx = event.clientX - drag.startX;
    const dy = event.clientY - drag.startY;
    if (Math.hypot(dx, dy) > 5) drag.moved = true;
    const next = { x: Math.max(-90, Math.min(90, drag.originX + dx)), y: Math.max(-70, Math.min(70, drag.originY + dy)) };
    velocityRef.current = { x: (next.x - offsetRef.current.x) * .58, y: (next.y - offsetRef.current.y) * .58 };
    updateOffset(next);
  };

  const release = (event: ReactPointerEvent<HTMLButtonElement>, cancelled = false) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    dragRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    if (!cancelled && !drag.moved) onOpen();
    else returnHome();
  };

  const nodeStyle = {
    "--x": `${position.x}%`,
    "--y": `${position.y}%`,
    "--node-scale": position.scale,
    "--push-x": `${offset.x}px`,
    "--push-y": `${offset.y}px`,
    "--drift-delay": `${index * -.47}s`,
  } as CSSProperties;

  return <button
    type="button"
    style={nodeStyle}
    title={node.label}
    data-side={sequence ? "center" : position.x > 66 ? "left" : "right"}
    className={`cosmosNode tone-${node.tone} ${position.ring} ${sequence ? "sequenceNode" : ""} ${selected ? "selected" : ""}`}
    onPointerDown={beginPush}
    onPointerMove={push}
    onPointerUp={event => release(event)}
    onPointerCancel={event => release(event, true)}
    onClick={event => { if (event.detail === 0) onOpen(); }}
  >
    <span className="cosmosNodeDrift">
      {sequence ? <span className="sequenceIndex" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span> : null}
      <span className="inkMark" aria-hidden="true"><i /></span>
      <span className="cosmosNodeBody"><small>{node.kicker}</small><b>{compactLabel(node.label)}</b>{node.children?.length ? <em>확대 · {node.children.length}</em> : <em>주석 보기</em>}</span>
    </span>
  </button>;
}

export function KnowledgeCosmos() {
  const roots = useMemo<AtlasNode[]>(() => {
    const modelNodes = preferredModels.flatMap(slug => {
      const family = modelFamilies.find(item => item.slug === slug);
      if (!family) return [];
      const releases = modelReleases.filter(item => item.familySlug === slug).sort((a, b) => a.date.localeCompare(b.date));
      return [{
        id: family.slug,
        label: family.titleKo,
        kicker: `${releases.length}개 릴리스`,
        summary: family.summary,
        href: `/models/${family.slug}/`,
        tone: "models" as const,
        children: releases.map(release => ({ id: release.slug, label: release.title, kicker: release.date, summary: release.summary, href: `/models/${family.slug}/${release.slug}/`, tone: "models" as const })),
      }];
    });
    const concepts = preferredConcepts.flatMap(slug => {
      const item = conceptDocuments.find(entry => entry.slug === slug);
      return item ? [{ id: item.slug, label: item.titleKo, kicker: item.level, summary: item.summary, href: `/concepts/${item.slug}/`, tone: "concepts" as const }] : [];
    });
    const organizations = preferredOrganizations.flatMap(slug => {
      const item = organizationDocuments.find(entry => entry.slug === slug);
      return item ? [{ id: item.slug, label: item.titleKo, kicker: `${item.founded} 설립`, summary: item.summary, href: `/organizations/${item.slug}/`, tone: "organizations" as const }] : [];
    });
    const issues = issueDocuments.slice(0, 9).map(item => ({ id: item.slug, label: item.titleKo, kicker: "ISSUE", summary: item.summary, href: `/issues/${item.slug}/`, tone: "issues" as const }));
    const frontiers = frontierDocuments.map(item => ({ id: item.slug, label: item.titleKo, kicker: "FRONTIER", summary: item.summary, href: `/frontiers/${item.slug}/`, tone: "frontiers" as const }));
    return [
      { id: "models", label: "모델", kicker: "MODEL FAMILIES", summary: "GPT, Gemini, Claude를 비롯한 주요 모델 계열과 개별 릴리스를 따라갑니다.", href: "/models/", tone: "models", children: modelNodes },
      { id: "concepts", label: "용어·개념", kicker: "CONCEPTS", summary: "구조, 학습, 추론과 배포를 이해하는 데 필요한 핵심 개념을 연결합니다.", href: "/concepts/", tone: "concepts", children: concepts },
      { id: "organizations", label: "회사·연구소", kicker: "ORGANIZATIONS", summary: "모델과 연구 흐름을 만들어 온 주요 조직을 살펴봅니다.", href: "/organizations/", tone: "organizations", children: organizations },
      { id: "history", label: "역사", kicker: "TIMELINE", summary: "기반 연구에서 추론형 모델까지, 생성형 AI의 변화를 시대별로 탐색합니다.", href: "/timeline/", tone: "history", children: historyNodes },
      { id: "issues", label: "이슈·논쟁", kicker: "ISSUES", summary: "환각, 저작권, 평가와 안전처럼 아직 합의되지 않은 질문을 검토합니다.", href: "/issues/", tone: "issues", children: issues },
      { id: "frontiers", label: "프런티어", kicker: "FRONTIERS", summary: "에이전트, 월드 모델과 AGI 논의 등 다음 연구 경계를 살펴봅니다.", href: "/frontiers/", tone: "frontiers", children: frontiers },
    ];
  }, []);

  const [path, setPath] = useState<AtlasNode[]>([]);
  const [selectedLeaf, setSelectedLeaf] = useState<AtlasNode | null>(null);
  const [motion, setMotion] = useState({ serial: 0, direction: "rest", x: 50, y: 51 });
  const current = path.at(-1);
  const nodes = current?.children ?? roots;
  const sequence = Boolean(current && (current.id === "history" || preferredModels.includes(current.id)));
  const positions = sequence ? layoutSequence(nodes.length) : layoutNodes(nodes.length);

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (selectedLeaf) setSelectedLeaf(null);
      else if (path.length) retreat(path.length - 2);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  });

  const dive = (node: AtlasNode, position: Position) => {
    if (!node.children?.length) {
      setSelectedLeaf(node);
      return;
    }
    setSelectedLeaf(null);
    setMotion(previous => ({ serial: previous.serial + 1, direction: "in", x: position.x, y: position.y }));
    setPath(previous => [...previous, node]);
  };

  const retreat = (index: number) => {
    setSelectedLeaf(null);
    setMotion(previous => ({ serial: previous.serial + 1, direction: "out", x: 50, y: 51 }));
    setPath(previous => previous.slice(0, index + 1));
  };

  const reset = () => retreat(-1);
  const sceneStyle = { "--origin-x": `${motion.x}%`, "--origin-y": `${motion.y}%` } as CSSProperties;

  return <section className="cosmosStage" aria-label="LLM 지식 지도">
    <header className="cosmosToolbar">
      <nav aria-label="현재 지도 위치">
        <button type="button" onClick={reset} aria-current={!path.length ? "page" : undefined}>전체 지도</button>
        {path.map((item, index) => <span key={item.id}><i>/</i><button type="button" onClick={() => retreat(index)} aria-current={index === path.length - 1 ? "page" : undefined}>{item.label}</button></span>)}
      </nav>
      {path.length ? <button className="cosmosBack" type="button" onClick={() => retreat(path.length - 2)}>− 축소</button> : <p>이름을 눌러 확대하세요</p>}
    </header>

    <div key={`${path.map(item => item.id).join("-")}-${motion.serial}`} className={`cosmosWorld layout-${sequence ? "sequence" : "orbit"} motion-${motion.direction}`} style={sceneStyle}>
      <div className="cosmosCaption">
        <p>{current?.kicker ?? "AN ATLAS OF GENERATIVE AI"}</p>
        <h2 title={current?.label}>{compactLabel(current?.label ?? "LLM 지식 지도", 22)}</h2>
        <span>{current?.summary ?? "모델과 개념, 조직과 사건이 어떻게 연결되는지 한 장의 지도에서 따라가 보세요."}</span>
        {current?.href ? <Link href={current.href}>이 항목 전체 읽기 ↗</Link> : null}
      </div>

      <div className="cosmosCanvas">
        <svg className="cosmosOrbits" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {sequence ? <>
            <polyline className="sequenceTrail" points={positions.map(position => `${position.x},${position.y}`).join(" ")} />
            <polyline className="sequenceTrailEcho" points={positions.map(position => `${position.x},${position.y + .7}`).join(" ")} />
          </> : <>
            <ellipse cx="50" cy="51" rx="45" ry="22" transform="rotate(-8 50 51)" />
            <ellipse className="orbitEcho" cx="50" cy="51" rx="44.4" ry="21.4" transform="rotate(-7.4 50 51)" />
            {nodes.length > 7 ? <ellipse className="orbitInner" cx="50" cy="51" rx="29" ry="14" transform="rotate(-8 50 51)" /> : null}
            {positions.map((position, index) => <path key={nodes[index].id} d={connectionPath(position, index)} />)}
          </>}
        </svg>

        {!sequence ? <div className="cosmosCenter" aria-hidden="true"><span>{path.length ? String(path.length).padStart(2, "0") : "AI"}</span><b>{compactLabel(current?.label ?? "LLM", 13)}</b><i>{nodes.length}개의 갈래</i></div> : <p className="sequenceDirection" aria-hidden="true">앞선 모델 <span>→</span> 다음 모델</p>}

        {nodes.map((node, index) => <DriftingNode key={node.id} node={node} position={positions[index]} index={index} sequence={sequence} selected={selectedLeaf?.id === node.id} onOpen={() => dive(node, positions[index])} />)}
      </div>

      {path.length ? <button className="cosmosZoomOut" type="button" onClick={() => retreat(path.length - 2)}><b>↖</b><span>이전 지도</span><small>{path.length > 1 ? compactLabel(path[path.length - 2].label, 12) : "전체 보기"}</small></button> : null}

      {selectedLeaf ? <aside className={`cosmosNote tone-${selectedLeaf.tone}`} aria-live="polite">
        <button type="button" onClick={() => setSelectedLeaf(null)} aria-label="주석 닫기">×</button>
        <p>{selectedLeaf.kicker}</p><h3 title={selectedLeaf.label}>{compactLabel(selectedLeaf.label, 28)}</h3><div>{selectedLeaf.summary}</div>
        {selectedLeaf.href ? <Link href={selectedLeaf.href}>상세 문서로 이동 ↗</Link> : null}
      </aside> : null}
    </div>
  </section>;
}
