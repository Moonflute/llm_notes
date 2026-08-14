import type {Metadata} from "next";
import Link from "next/link";
import {ContentMeta} from "@/components/content/content-meta";
import {conceptDocuments,events,getSource,issueDocuments} from "@/lib/content";
import {buildContentMetadata} from "@/lib/content-metadata";
import {getIssueBrief} from "@/lib/issue-briefs";
import {notFound} from "next/navigation";

export function generateStaticParams(){return issueDocuments.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{
  const {slug}=await params;
  const item=issueDocuments.find(entry=>entry.slug===slug);
  return {title:item?.titleKo??"이슈",description:item?.summary,alternates:{canonical:`/issues/${slug}/`}};
}

export default async function Issue({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const issue=issueDocuments.find(item=>item.slug===slug);
  if(!issue)notFound();
  const brief=getIssueBrief(slug);
  const relatedEvents=events.filter(event=>event.conceptIds.some(id=>issue.conceptIds.includes(id))).slice(0,8);
  const metadata=buildContentMetadata({status:"needs-review",contentDepth:brief?"full":"partial",sourceIds:issue.sourceIds});

  return <main id="main-content" className="detail issueDetail">
    <Link href="/issues/" className="back">← 이슈 목록</Link>
    <p className="sectionLabel">ISSUE BRIEFING</p>
    <h1>{issue.titleKo}</h1>
    <p className="lead">{brief?.question??issue.summary}</p>
    <ContentMeta metadata={metadata}/>

    <section><h2>무엇이 논쟁인가</h2><p>{issue.summary}</p></section>
    <section><h2>합의가 비교적 높은 사실</h2>{brief?<ul>{brief.consensus.map(item=><li key={item}>{item}</li>)}</ul>:<p>{issue.fact}</p>}</section>
    {brief?<>
      <section><h2>주요 주장과 근거</h2><div className="positionGrid">{brief.positions.map(position=><article key={position.title}><h3>{position.title}</h3><p>{position.argument}</p><p><b>근거를 읽는 법</b> {position.evidence}</p></article>)}</div></section>
      <section><h2>어떻게 평가하는가</h2><ol>{brief.evaluation.map(item=><li key={item}>{item}</li>)}</ol></section>
      <section><h2>현재 평가의 한계</h2><ul>{brief.limitations.map(item=><li key={item}>{item}</li>)}</ul></section>
      <section><h2>2026년 현재</h2><p>{brief.currentState}</p></section>
      <section><h2>아직 밝혀지지 않은 것</h2><ul>{brief.openQuestions.map(item=><li key={item}>{item}</li>)}</ul></section>
    </>:<section><h2>아직 모르는 것</h2><p>{issue.unknown}</p></section>}

    <section><h2>사이트 안의 연결</h2><div className="tags">{issue.conceptIds.map(id=>{const concept=conceptDocuments.find(item=>item.slug===id);return concept?<Link href={`/concepts/${id}/`} key={id}>#{concept.titleKo}</Link>:null})}</div></section>
    <section><h2>관련 타임라인</h2>{relatedEvents.length?relatedEvents.map(event=><p key={event.slug}><Link className="textLink" href={`/timeline/${event.slug}/`}>{event.date} · {event.title} →</Link></p>):<p>현재 직접 연결된 사건이 없습니다.</p>}</section>
    <section><h2>출처와 검증 상태</h2><p className="resourceIntro">연결된 자료가 각 문장을 직접 지지하는지는 source metadata의 검증 상태로 구분합니다. 연결만 된 자료를 검증 완료로 간주하지 않습니다.</p>{issue.sourceIds.map(id=>{const source=getSource(id);return source?<a className="source" key={id} href={source.url} target="_blank" rel="noreferrer"><span>{source.classification==="primary"?"1차":"2차"} · {source.sourceType} · {source.validationStatus}</span><b>{source.title} ↗</b><small>{source.authorOrOrganization} · {source.publicationDate} · 검토 {source.verificationDate}</small></a>:null})}</section>
  </main>;
}
