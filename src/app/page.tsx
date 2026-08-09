"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { conceptDocuments, events, issueDocuments, learningPathDocuments, modelReleases, sources } from "@/lib/content";

export default function Home() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const milestones = useMemo(() => events.filter(event => event.importance === 3).slice(0, 8), []);
  const latestModels = useMemo(() => [...modelReleases].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6), []);
  const primarySources = sources.filter(source => (source.tier ?? 1) === 1).length;

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const value = query.trim();
    router.push(value ? `/search/?q=${encodeURIComponent(value)}` : "/search/");
  };

  return <main id="main-content">
    <section className="hero">
      <h1>LLM History</h1>
      <div className="heroActions"><Link className="primaryButton" href="/timeline/">역사 지도 탐색하기 <span>→</span></Link><Link className="secondaryButton" href="/paths/">처음부터 학습하기</Link></div>
      <form className="search heroSearch" onSubmit={submitSearch} role="search"><span aria-hidden="true">⌕</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Transformer, RAG, GPT-4…" aria-label="전체 검색"/><kbd>⌘ K</kbd><button type="submit">검색</button></form>
      <div className="stats"><span><b>2017 — 2026</b><small>핵심 변화</small></span><span><b>{events.length}</b><small>검증된 사건</small></span><span><b>{primarySources}</b><small>1차 출처</small></span></div>
    </section>

    <section className="homeSection homeTimeline">
      <div className="sectionHead"><div><p className="sectionLabel">HISTORY MAP</p><h2>주요 사건</h2></div><Link className="textLink" href="/timeline/">전체 타임라인 →</Link></div>
      <div className="milestoneList">{milestones.map((event, index) => <Link href={`/timeline/${event.slug}/`} key={event.slug}><span>{String(index + 1).padStart(2, "0")}</span><time>{event.date}</time><div><small>{event.organization} · {event.type}</small><h3>{event.title}</h3><p>{event.summary}</p></div><b>↗</b></Link>)}</div>
    </section>

    <section className="cardsBlock homeSection">
      <div className="sectionHead"><div><p className="sectionLabel">HOW IT WORKS</p><h2>핵심 개념</h2></div><Link className="textLink" href="/concepts/">모든 개념 →</Link></div>
      <div className="conceptGrid">{conceptDocuments.slice(0, 6).map((concept, index) => <Link className="concept" href={`/concepts/${concept.slug}/`} key={concept.slug}><span className="conceptNo">{String(index + 1).padStart(2, "0")}</span><span className="level">{concept.level}</span><h3>{concept.titleKo}</h3><p>{concept.summary}</p><b>개념 이해하기 →</b></Link>)}</div>
    </section>

    <section className="homeSection latestModels">
      <div className="sectionHead"><div><p className="sectionLabel">LATEST RELEASES</p><h2>최근 모델</h2></div><Link className="textLink" href="/models/">모델 전체 보기 →</Link></div>
      <div className="modelStrip">{latestModels.map(model => <Link href={`/models/${model.familySlug}/${model.slug}/`} key={`${model.familySlug}-${model.slug}`}><time>{model.date}</time><h3>{model.title}</h3><p>{model.summary}</p><span>상세 보기 ↗</span></Link>)}</div>
    </section>

    <section className="issues homeSection">
      <div className="issuesIntro"><p className="sectionLabel">WHAT IS DEBATED</p><h2>주요 이슈</h2><Link className="secondaryButton" href="/issues/">모든 이슈 보기</Link></div>
      <div className="issueList">{issueDocuments.slice(0, 3).map((issue, index) => <article key={issue.slug}><span className={index === 0 ? "badge fact" : "badge claim"}>{index === 0 ? "확인된 사실" : "논쟁 중"}</span><h3>{issue.titleKo}</h3><p>{issue.summary}</p><Link href={`/issues/${issue.slug}/`}>근거와 관점 보기 →</Link></article>)}</div>
    </section>

    <section className="path homeSection">
      <div className="sectionHead"><div><p className="sectionLabel">LEARNING PATHS</p><h2>학습 경로</h2></div><Link className="textLink" href="/paths/">모든 경로 보기 →</Link></div>
      <div className="pathGrid">{learningPathDocuments.slice(0, 4).map((path, index) => <Link href={`/paths/${path.slug}/`} key={path.slug}><span>{String(index + 1).padStart(2, "0")}</span><small>{path.conceptIds.length}단계</small><h3>{path.titleKo}</h3><p>{path.summary}</p><b>경로 시작하기 →</b></Link>)}</div>
    </section>

    <section className="method"><p className="sectionLabel">EDITORIAL PRINCIPLES</p><h2>편집 및 출처 정책</h2><Link href="/methodology/">정책 보기 ↗</Link></section>
    <footer><span>LLM History</span><span>최종 검증 2026.08.06</span></footer>
  </main>;
}
