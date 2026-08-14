import type {Metadata} from "next";
import Link from "next/link";
import {ContentMeta} from "@/components/content/content-meta";
import {DirectionalLink} from "@/components/motion/directional-link";
import {buildContentMetadata} from "@/lib/content-metadata";
import {conceptDocuments,getModelProfile,getSource,modelFamilies,modelReleases} from "@/lib/content";
import {notFound} from "next/navigation";

export function generateStaticParams(){return modelReleases.map(item=>({slug:item.familySlug,release:item.slug}))}
export async function generateMetadata({params}:{params:Promise<{slug:string;release:string}>}):Promise<Metadata>{
  const {slug,release}=await params;
  const item=modelReleases.find(entry=>entry.familySlug===slug&&entry.slug===release);
  return {title:item?.title??"모델",description:item?.summary,alternates:{canonical:`/models/${slug}/${release}/`}};
}

export default async function Release({params}:{params:Promise<{slug:string;release:string}>}){
  const {slug:family,release}=await params;
  const modelFamily=modelFamilies.find(item=>item.slug===family);
  const item=modelReleases.find(entry=>entry.familySlug===family&&entry.slug===release);
  const profile=getModelProfile(family,release);
  if(!modelFamily||!item||!profile)notFound();

  const releases=modelReleases.filter(entry=>entry.familySlug===family).sort((a,b)=>a.date.localeCompare(b.date));
  const index=releases.findIndex(entry=>entry.slug===release);
  const previous=releases[index-1];
  const next=releases[index+1];
  const specs:[string,string][]=[["개발사",profile.spec.developer],["최초 공개",profile.spec.released],["입력 · 출력",profile.spec.modalities],["컨텍스트",profile.spec.context],["하위 모델",profile.spec.variants],["파라미터",profile.spec.parameters],["제공 방식",profile.spec.access],["가중치 · 라이선스",profile.spec.weights]];
  const allSourceIds=[...new Set([...item.sourceIds,...profile.notableEvents.flatMap(event=>event.sourceIds)])];

  return <main id="main-content" className="detail modelDetail">
    <nav className="breadcrumb" aria-label="현재 위치"><Link href="/models/">모델</Link><span>›</span><Link href={`/models/${family}/`}>{modelFamily.titleKo}</Link><span>›</span><b>{item.title}</b></nav>
    <p className="sectionLabel">모델 릴리스 · {item.date}</p><h1>{item.title}</h1>
    <ContentMeta metadata={buildContentMetadata({status:"draft",contentDepth:"partial",sourceIds:allSourceIds,lastReviewed:profile.verifiedAt})}/>

    <section className="releaseDelta">
      <p className="sectionLabel">WHAT CHANGED</p>
      <h2>그래서 이전 모델에서 무엇이 달라졌나</h2>
      <p>{profile.summaryKo}</p>
      <div>{previous?<span><small>이전 릴리스</small><Link href={`/models/${family}/${previous.slug}/`}>{previous.title}</Link></span>:<span><small>계열의 시작</small><b>{modelFamily.titleKo} 첫 기록</b></span>}{next?<span><small>다음 릴리스</small><Link href={`/models/${family}/${next.slug}/`}>{next.title}</Link></span>:<span><small>현재 DB</small><b>계열의 최신 기록</b></span>}</div>
    </section>

    {profile.features.length?<section><h2>핵심 변화와 한계</h2><ul className="featureList">{profile.features.map(feature=><li key={feature}>{feature}</li>)}</ul></section>:null}
    <section><h2>주요 사건과 성과</h2><div className="notableEvents">{profile.notableEvents.map(event=><article key={`${event.date}-${event.title}`}><time>{event.date}</time><h3>{event.title}</h3><p>{event.description}</p><div className="eventSources">{event.sourceIds.map(id=>{const source=getSource(id);return source?<a href={source.url} key={id} target="_blank" rel="noreferrer">{source.publisher} 원문 ↗</a>:null})}</div></article>)}</div></section>
    {profile.announcement.length||profile.reception?<section><h2>공개 당시 맥락과 해석</h2>{profile.announcement.map(paragraph=><p key={paragraph}>{paragraph}</p>)}{profile.reception?<aside className="technicalCaution"><b>독립적으로 읽을 때의 주의점</b><p>{profile.reception}</p></aside>:null}</section>:null}
    <section><h2>공개 스펙</h2><table className="specTable"><tbody>{specs.map(([label,value])=><tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table><p className="specNote">공식 자료에 수치가 없으면 미공개로 표시합니다. 서로 다른 시점의 제품 한도와 논문·연구 설정은 혼용하지 않습니다.</p></section>
    <section><h2>관련 개념</h2><div className="tags">{item.conceptIds.map(id=>{const concept=conceptDocuments.find(entry=>entry.slug===id);return concept?<Link href={`/concepts/${id}/`} key={id}>#{concept.titleKo}</Link>:null})}</div></section>
    <section><h2>공식 자료와 원문</h2>{allSourceIds.map(id=>{const source=getSource(id);return source?<a className="source" href={source.url} key={id} target="_blank" rel="noreferrer"><span>{source.classification==="primary"?"1차":"2차"} · {source.sourceType} · {source.validationStatus}</span><b>{source.title} ↗</b><small>{source.authorOrOrganization} · {source.publicationDate} · 검토 {source.verificationDate}</small></a>:null})}</section>
    {profile.coverage.length?<section><h2>관련 보도</h2>{profile.coverage.map(article=><a className="source" href={article.url} key={article.url} target="_blank" rel="noreferrer"><span>{article.outlet}</span><b>{article.title} ↗</b></a>)}</section>:null}
    <nav className="articleNavigator" aria-label="이전 및 다음 모델 릴리스">{previous?<DirectionalLink direction="previous" href={`/models/${family}/${previous.slug}/`}><span>← 이전 릴리스</span><b>{previous.title}</b></DirectionalLink>:<span/>}{next?<DirectionalLink direction="next" href={`/models/${family}/${next.slug}/`}><span>다음 릴리스 →</span><b>{next.title}</b></DirectionalLink>:<span/>}</nav>
  </main>;
}
