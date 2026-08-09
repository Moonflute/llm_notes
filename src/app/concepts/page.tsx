import Link from "next/link";
import {conceptDocuments} from "@/lib/content";
import {getConceptStudyGuide} from "@/lib/concept-study-guides";

export default function Concepts(){return <main id="main-content" className="directory">
  <p className="sectionLabel">TECHNICAL REFERENCE</p>
  <h1>개념</h1>
  <p className="intro">한 줄 정의가 아니라 원리·수식·구현·한계·원자료를 따라가며 공부하는 LLM 기술 레퍼런스입니다. <b>학습 가이드</b>가 표시된 문서부터 읽어보세요.</p>
  <div className="directoryGrid">{conceptDocuments.map(c=>{const guide=getConceptStudyGuide(c.slug);return <Link className="directoryCard" href={`/concepts/${c.slug}/`} key={c.slug}>
    <span>{guide?`학습 가이드 · ${guide.estimatedMinutes}분`:c.level}</span><h2>{c.titleKo}</h2><p className="en">{c.titleEn}</p><p>{c.summary}</p><small>{guide?`학습 목표 ${guide.objectives.length}개 · 외부 자료 ${guide.resources.length}개 →`:`기술 문서 편집 중 · 선수 지식 ${c.prerequisites.length}개 →`}</small>
  </Link>})}</div>
</main>}
