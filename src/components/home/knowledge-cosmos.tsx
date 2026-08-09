"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { conceptDocuments, frontierDocuments, issueDocuments, modelFamilies, modelReleases, organizationDocuments } from "@/lib/content";

type Tone = "models" | "concepts" | "organizations" | "history" | "issues" | "frontiers";
type CosmosNode = {
  id: string;
  label: string;
  kicker: string;
  summary: string;
  href?: string;
  tone: Tone;
  children?: CosmosNode[];
  utility?: boolean;
};

const preferredModels = ["gpt", "gemini", "claude", "llama", "deepseek", "mistral", "qwen", "gemma"];
const preferredConcepts = ["transformer", "attention", "pretraining", "rlhf", "retrieval-augmented-generation", "mixture-of-experts", "reasoning", "agents", "multimodality", "alignment"];
const preferredOrganizations = ["openai", "google-deepmind", "anthropic", "meta", "mistral-ai", "deepseek", "alibaba-cloud", "ai2"];

const historyNodes: CosmosNode[] = [
  { id: "foundations", label: "기반 연구", kicker: "2017—2019", summary: "Transformer와 사전학습이 기반 구조를 만든 시기입니다.", href: "/timeline/?from=2017-01&to=2019-12", tone: "history" },
  { id: "scaling", label: "스케일링", kicker: "2020—2021", summary: "규모·데이터·연산량의 관계가 모델 개발의 중심이 된 시기입니다.", href: "/timeline/?from=2020-01&to=2021-12", tone: "history" },
  { id: "chat", label: "대화형 AI", kicker: "2022", summary: "지시학습과 RLHF가 대화형 인터페이스로 이어진 시기입니다.", href: "/timeline/?from=2022-01&to=2022-12", tone: "history" },
  { id: "multimodal", label: "멀티모달", kicker: "2023—2024", summary: "텍스트·이미지·음성을 함께 다루는 모델이 확산된 시기입니다.", href: "/timeline/?from=2023-01&to=2024-12", tone: "history" },
  { id: "reasoning-agents", label: "추론·에이전트", kicker: "2024—현재", summary: "긴 추론과 도구 사용, 자율 실행이 경쟁 축으로 떠오른 시기입니다.", href: "/timeline/?from=2024-01&to=2026-12", tone: "history" },
  { id: "all-history", label: "전체 타임라인", kicker: "2017—2026", summary: "모델·연구·제품의 전체 계보를 가로형 지도에서 확인합니다.", href: "/timeline/", tone: "history", utility: true },
];

function layoutNodes(count: number) {
  if (count <= 6) return Array.from({ length: count }, (_, index) => {
    const angle = -Math.PI / 2 + index * Math.PI * 2 / count;
    return { x: 50 + Math.cos(angle) * 39, y: 50 + Math.sin(angle) * 36, ring: "outer" as const };
  });
  const outerCount = Math.min(8, Math.ceil(count * .62));
  return Array.from({ length: count }, (_, index) => {
    const outer = index < outerCount;
    const ringIndex = outer ? index : index - outerCount;
    const ringCount = outer ? outerCount : count - outerCount;
    const angle = -Math.PI / 2 + ringIndex * Math.PI * 2 / ringCount + (outer ? 0 : Math.PI / Math.max(3, ringCount));
    return { x: 50 + Math.cos(angle) * (outer ? 38 : 25), y: 50 + Math.sin(angle) * (outer ? 37 : 23), ring: outer ? "outer" as const : "inner" as const };
  });
}

export function KnowledgeCosmos() {
  const roots = useMemo<CosmosNode[]>(() => {
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
    const conceptNodes = preferredConcepts.flatMap(slug => { const item = conceptDocuments.find(entry => entry.slug === slug); return item ? [{ id: item.slug, label: item.titleKo, kicker: item.level, summary: item.summary, href: `/concepts/${item.slug}/`, tone: "concepts" as const }] : []; });
    const organizationNodes = preferredOrganizations.flatMap(slug => { const item = organizationDocuments.find(entry => entry.slug === slug); return item ? [{ id: item.slug, label: item.titleKo, kicker: `${item.founded} 설립`, summary: item.summary, href: `/organizations/${item.slug}/`, tone: "organizations" as const }] : []; });
    const issueNodes = issueDocuments.slice(0, 9).map(item => ({ id: item.slug, label: item.titleKo, kicker: "이슈 브리핑", summary: item.summary, href: `/issues/${item.slug}/`, tone: "issues" as const }));
    const frontierNodes = frontierDocuments.map(item => ({ id: item.slug, label: item.titleKo, kicker: "프런티어", summary: item.summary, href: `/frontiers/${item.slug}/`, tone: "frontiers" as const }));
    return [
      { id: "models", label: "모델", kicker: "MODEL FAMILIES", summary: "주요 모델 계열과 각 릴리스를 탐색합니다.", href: "/models/", tone: "models", children: modelNodes },
      { id: "concepts", label: "용어·개념", kicker: "CONCEPTS", summary: "구조·학습·추론·배포에 필요한 핵심 용어입니다.", href: "/concepts/", tone: "concepts", children: conceptNodes },
      { id: "organizations", label: "회사·연구소", kicker: "ORGANIZATIONS", summary: "모델과 연구 흐름을 만든 조직을 탐색합니다.", href: "/organizations/", tone: "organizations", children: organizationNodes },
      { id: "history", label: "역사", kicker: "TIMELINE", summary: "주요 시대를 거쳐 전체 AI 계보 지도로 이동합니다.", href: "/timeline/", tone: "history", children: historyNodes },
      { id: "issues", label: "이슈·논쟁", kicker: "ISSUES", summary: "환각·저작권·평가·안전처럼 합의되지 않은 질문들입니다.", href: "/issues/", tone: "issues", children: issueNodes },
      { id: "frontiers", label: "프런티어", kicker: "FRONTIERS", summary: "에이전트·월드 모델·AGI 등 다음 연구 영역입니다.", href: "/frontiers/", tone: "frontiers", children: frontierNodes },
    ];
  }, []);

  const [path, setPath] = useState<CosmosNode[]>([]);
  const [selected, setSelected] = useState<CosmosNode | null>(null);

  useEffect(() => {
    const closePanel = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", closePanel);
    return () => window.removeEventListener("keydown", closePanel);
  }, []);

  const current = path.at(-1);
  const nodes = current?.children ?? roots;
  const positions = layoutNodes(nodes.length);
  const centerLabel = current?.label ?? "LLM History";
  const centerKicker = current?.kicker ?? "KNOWLEDGE COSMOS";

  const enter = (node: CosmosNode) => {
    if (!node.children?.length) return;
    setPath(previous => [...previous, node]);
    setSelected(null);
  };
  const moveTo = (index: number) => {
    setPath(previous => previous.slice(0, index + 1));
    setSelected(null);
  };
  const reset = () => { setPath([]); setSelected(null); };

  return <section className="cosmosStage" aria-label="LLM History 지식 우주">
    <header className="cosmosToolbar">
      <nav aria-label="지식 우주 현재 위치"><button type="button" onClick={reset} aria-current={!path.length ? "page" : undefined}>전체</button>{path.map((item, index) => <span key={item.id}><i>›</i><button type="button" onClick={() => moveTo(index)} aria-current={index === path.length - 1 ? "page" : undefined}>{item.label}</button></span>)}</nav>
      <p>{nodes.length}개 항목</p>
    </header>
    <div className={`cosmosCanvas level-${path.length}`}>
      <div className="cosmosOrbit orbitOuter" aria-hidden="true" />
      {nodes.length > 6 && <div className="cosmosOrbit orbitInner" aria-hidden="true" />}
      <svg className="cosmosConnections" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">{positions.map((position, index) => <line key={nodes[index].id} x1="50" y1="50" x2={position.x} y2={position.y} className={selected?.id === nodes[index].id ? "active" : ""} />)}</svg>
      <button className="cosmosCenter" type="button" onClick={() => current ? setSelected(current) : setSelected(null)}><span>{centerKicker}</span><b>{centerLabel}</b><i>{path.length ? "현재 영역" : "대분류"}</i></button>
      {nodes.map((node, index) => {
        const position = positions[index];
        const style = { "--x": `${position.x}%`, "--y": `${position.y}%`, "--delay": `${(index % 5) * -.7}s` } as CSSProperties;
        return <button type="button" key={`${path.map(item => item.id).join("-")}-${node.id}`} style={style} className={`cosmosNode tone-${node.tone} ${position.ring} ${node.utility ? "utility" : ""} ${selected && selected.id !== node.id ? "muted" : ""} ${selected?.id === node.id ? "selected" : ""}`} aria-pressed={selected?.id === node.id} onClick={() => setSelected(node)}><span className="cosmosNodeBody"><small>{node.kicker}</small><b>{node.label}</b>{node.children?.length ? <i>{node.children.length}</i> : null}</span></button>;
      })}
      <p className="cosmosHint">항목을 선택하세요</p>
    </div>
    {selected && <aside className={`cosmosPanel tone-${selected.tone}`} aria-live="polite">
      <button className="cosmosPanelClose" type="button" onClick={() => setSelected(null)} aria-label="설명 닫기">×</button>
      <p>{selected.kicker}</p><h2>{selected.label}</h2><div>{selected.summary}</div>
      <nav>{selected.children?.length ? <button type="button" onClick={() => enter(selected)}>안으로 들어가기 <span>→</span></button> : null}{selected.href ? <Link href={selected.href}>상세 페이지 <span>↗</span></Link> : null}</nav>
    </aside>}
  </section>;
}
