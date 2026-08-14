import type {Metadata} from "next";
import Link from "next/link";
import {ContentMeta} from "@/components/content/content-meta";
import {frontierDocuments,getSource} from "@/lib/content";
import {buildContentMetadata} from "@/lib/content-metadata";
import {getFrontierBrief} from "@/lib/frontier-briefs";
import {notFound} from "next/navigation";

export function generateStaticParams(){return frontierDocuments.map(({slug})=>({slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string}>}):Promise<Metadata>{const {slug}=await params;const item=frontierDocuments.find(x=>x.slug===slug);return {title:item?.titleKo??"프런티어",description:item?.summary,alternates:{canonical:`/frontiers/${slug}/`}}}

export default async function Frontier({params}:{params:Promise<{slug:string}>}){
  const {slug}=await params;
  const topic=frontierDocuments.find(x=>x.slug===slug);
  if(!topic)notFound();
  const brief=getFrontierBrief(slug);
  return <main id="main-content" className="detail frontierDetail">
    <Link href="/frontiers/" className="back">← 프런티어 목록</Link>
    <p className="sectionLabel">FRONTIER BRIEF</p><h1>{topic.titleKo}</h1><p className="lead">{brief?.definition??topic.summary}</p>
    <ContentMeta metadata={buildContentMetadata({status:"needs-review",contentDepth:brief?"full":"partial",sourceIds:topic.sourceIds})}/>
    <section><h2>어디서 시작됐는가</h2>{brief?brief.context.map(item=><p key={item}>{item}</p>):<p>{topic.summary}</p>}</section>
    <section><h2>LLM과 공유하는 것</h2><p>{topic.shared}</p></section>
    <section><h2>무엇이 다르고 어떻게 작동하는가</h2><p>{topic.different}</p>{brief?<ol>{brief.mechanisms.map(item=><li key={item}>{item}</li>)}</ol>:null}</section>
    {brief?<><section><h2>2026년 현재</h2><p>{brief.state}</p></section><section><h2>과장되기 쉬운 부분과 한계</h2><ul>{brief.limits.map(item=><li key={item}>{item}</li>)}</ul></section><section><h2>열린 질문</h2><ul>{brief.openQuestions.map(item=><li key={item}>{item}</li>)}</ul></section></>:<section><h2>과장되기 쉬운 부분</h2><p>데모의 인상과 재현 가능한 일반 능력은 구분해야 합니다.</p></section>}
    <section><h2>분야 직접 출처</h2><p className="resourceIntro">범용 LLM 논문을 대체 출처로 쓰지 않습니다. 이 주제의 정의나 사례를 직접 다루는 자료만 연결하고, 문장 검증이 끝나지 않은 자료는 그대로 표시합니다.</p>{topic.sourceIds.map(id=>{const source=getSource(id);return source?<a className="source" key={id} href={source.url} target="_blank" rel="noreferrer"><span>{source.classification==="primary"?"1차":"2차"} · {source.validationStatus}</span><b>{source.title} ↗</b><small>{source.authorOrOrganization} · {source.publicationDate} · 검토 {source.verificationDate}</small></a>:null})}</section>
  </main>;
}
