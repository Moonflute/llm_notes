import type {Metadata} from "next";
import Link from "next/link";
import {ContentMeta} from "@/components/content/content-meta";
import {DirectionalLink} from "@/components/motion/directional-link";
import {conceptDocuments,events,getSource,issueDocuments} from "@/lib/content";
import {getConceptStudyGuide} from "@/lib/concept-study-guides";
import {buildContentMetadata} from "@/lib/content-metadata";
import {notFound} from "next/navigation";

export function generateStaticParams(){return conceptDocuments.map(({slug})=>({slug}))}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const item=conceptDocuments.find(entry=>entry.slug===slug);
  return {title:item?.titleKo??"개념",description:item?.summary,alternates:{canonical:`/concepts/${slug}/`}};
}

export default async function Concept({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const concept=conceptDocuments.find(item=>item.slug===slug);
  if(!concept)notFound();
  const guide=getConceptStudyGuide(slug);
  const relatedEvents=events.filter(event=>event.conceptIds.includes(slug)).slice(0,8);
  const relatedIssues=issueDocuments.filter(issue=>issue.conceptIds.includes(slug));
  const conceptIndex=conceptDocuments.findIndex(item=>item.slug===slug);
  const previousConcept=conceptIndex>0?conceptDocuments[conceptIndex-1]:undefined;
  const nextConcept=conceptIndex<conceptDocuments.length-1?conceptDocuments[conceptIndex+1]:undefined;

  return <main id="main-content" className="detail conceptDetail">
    <Link href="/concepts/" className="back">← 개념 목록</Link>
    <p className="sectionLabel">{concept.level} · {guide?"TECHNICAL STUDY GUIDE":"CONCEPT INDEX"}</p>
    <h1 style={{viewTransitionName:"concept-title"}}>{concept.titleKo}</h1>
    <p className="detailEn">{concept.titleEn}</p>
    <p className="lead">{concept.summary}</p>
    <ContentMeta metadata={buildContentMetadata({status:guide?"draft":"index",contentDepth:guide?"full":"stub",sourceIds:concept.sourceIds})}/>

    {guide ? <>
      <aside className="studyBrief" aria-label="학습 목표">
        <div><span>STUDY GUIDE</span><b>약 {guide.estimatedMinutes}분</b></div>
        <h2>이 문서에서 다루는 것</h2>
        <ol>{guide.objectives.map(item=><li key={item}>{item}</li>)}</ol>
      </aside>
      {guide.sections.map(section=><section className="studySection" key={section.title}>
        <h2>{section.title}</h2>
        {section.paragraphs.map(paragraph=><p key={paragraph}>{paragraph}</p>)}
        {section.formula?<figure className="formula"><figcaption>{section.formula.label}</figcaption><code>{section.formula.value}</code><p>{section.formula.note}</p></figure>:null}
        {section.bullets?<ul>{section.bullets.map(item=><li key={item}>{item}</li>)}</ul>:null}
        {section.caution?<aside className="technicalCaution"><b>주의</b><p>{section.caution}</p></aside>:null}
      </section>)}
      <section className="studySection">
        <h2>구현·실험 체크리스트</h2>
        <ol className="checklist">{guide.implementationChecklist.map(item=><li key={item}>{item}</li>)}</ol>
      </section>
      <section className="studySection">
        <h2>자주 생기는 오해</h2>
        <div className="misconceptions">{guide.misconceptions.map(({myth,correction})=><article key={myth}><p><b>오해</b> {myth}</p><p><b>정리</b> {correction}</p></article>)}</div>
      </section>
      <section className="studySection">
        <h2>외부 참고자료</h2>
        <p className="resourceIntro">원 논문을 먼저 읽고, 구현·강의 자료는 수식과 코드의 빈틈을 메우는 보조 자료로 사용하세요. 링크의 성격과 읽을 이유를 함께 표시했습니다.</p>
        <div className="studyResources">{guide.resources.map(resource=><a href={resource.url} target="_blank" rel="noreferrer" key={resource.url}><span>{resource.type}</span><b>{resource.title} ↗</b><p>{resource.note}</p></a>)}</div>
      </section>
    </> : <section className="studyPending">
      <p className="sectionLabel">EDITORIAL STATUS</p>
      <h2>기술 학습 문서 편집 중</h2>
      <p>이 항목은 현재 용어 정의·연결 구조·기본 출처만 검증된 색인입니다. 원문 기반 설명, 구현 관점, 한계와 참고자료를 갖춘 학습 문서로 확장하기 전에는 완성된 기술 문서로 취급하지 않습니다.</p>
    </section>}

    <section><h2>먼저 알면 좋은 개념</h2><div className="tags">{concept.prerequisites.length?concept.prerequisites.map(id=>{const item=conceptDocuments.find(entry=>entry.slug===id);return item?<Link href={`/concepts/${id}/`} key={id}>#{item.titleKo}</Link>:null}):<span>이 경로의 시작점입니다.</span>}</div></section>
    <section><h2>다음에 볼 개념</h2><div className="tags">{concept.next.map(id=>{const item=conceptDocuments.find(entry=>entry.slug===id);return item?<Link href={`/concepts/${id}/`} key={id}>#{item.titleKo}</Link>:null})}</div></section>
    <section><h2>관련 사건</h2>{relatedEvents.length?relatedEvents.map(event=><p key={event.slug}><Link className="textLink" href={`/timeline/${event.slug}/`}>{event.date} · {event.title} →</Link></p>):<p>현재 직접 연결된 사건이 없습니다.</p>}</section>
    <section><h2>관련 이슈</h2>{relatedIssues.length?relatedIssues.map(issue=><p key={issue.slug}><Link className="textLink" href={`/issues/${issue.slug}/`}>{issue.titleKo} →</Link></p>):<p>현재 직접 연결된 이슈가 없습니다.</p>}</section>
    <section><h2>기본 출처</h2>{concept.sourceIds.map(id=>{const source=getSource(id);return source?<a className="source" href={source.url} key={id} target="_blank" rel="noreferrer"><span>Tier {source.tier??1} · {source.publisher}</span><b>{source.title} ↗</b><small>{source.year} · 최종 검증 {source.verifiedAt??"미확인"}</small></a>:null})}</section>
    <nav className="articleNavigator" aria-label="이전 및 다음 개념">
      {previousConcept?<DirectionalLink direction="previous" href={`/concepts/${previousConcept.slug}/`}><span>← 이전 개념</span><b>{previousConcept.titleKo}</b></DirectionalLink>:<span/>}
      {nextConcept?<DirectionalLink direction="next" href={`/concepts/${nextConcept.slug}/`}><span>다음 개념 →</span><b>{nextConcept.titleKo}</b></DirectionalLink>:<span/>}
    </nav>
  </main>;
}
