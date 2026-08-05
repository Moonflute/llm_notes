import type { Metadata } from "next";
import Link from "next/link";
import { ContentMeta } from "@/components/content/content-meta";
import { conceptDocuments, getModelProfile, getSource, modelFamilies, modelReleases } from "@/lib/content";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return modelReleases.map((item) => ({ family: item.familySlug, release: item.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ family: string; release: string }> }): Promise<Metadata> {
  const { family, release } = await params;
  const item = modelReleases.find((entry) => entry.familySlug === family && entry.slug === release);
  return { title: item?.title ?? "모델 릴리스", description: item?.summary, alternates: { canonical: `/models/${family}/${release}/` } };
}

export default async function Release({ params }: { params: Promise<{ family: string; release: string }> }) {
  const { family, release } = await params;
  const modelFamily = modelFamilies.find((item) => item.slug === family);
  const item = modelReleases.find((entry) => entry.familySlug === family && entry.slug === release);
  const profile = getModelProfile(family, release);
  if (!modelFamily || !item || !profile) notFound();

  const familyReleases = modelReleases.filter((entry) => entry.familySlug === family).sort((a, b) => a.date.localeCompare(b.date));
  const position = familyReleases.findIndex((entry) => entry.slug === release);
  const previous = familyReleases[position - 1];
  const next = familyReleases[position + 1];
  const specs: [string, string][] = [
    ["개발사", profile.spec.developer],
    ["최초 공개", profile.spec.released],
    ["입력 · 출력", profile.spec.modalities],
    ["컨텍스트", profile.spec.context],
    ["하위 모델", profile.spec.variants],
    ["파라미터", profile.spec.parameters],
    ["제공 방식", profile.spec.access],
    ["가중치 · 라이선스", profile.spec.weights],
  ];

  return <main id="main-content" className="detail modelDetail">
    <Link href={`/models/${family}/`} className="back">← {modelFamily.titleKo} 계열</Link>
    <p className="sectionLabel">MODEL RELEASE · {item.date}</p>
    <h1>{item.title}</h1>
    <p className="detailEn">{item.titleEn}</p>
    <ContentMeta />

    <section><h2>요약</h2><p className="lead">{item.summary}</p></section>
    <section><h2>스펙</h2><table className="specTable"><tbody>{specs.map(([label, value]) => <tr key={label}><th scope="row">{label}</th><td>{value}</td></tr>)}</tbody></table></section>
    <section><h2>특징</h2><ul className="featureList">{profile.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></section>
    <section><h2>계열 내 비교</h2><div className="releaseNav">{previous ? <Link className="textLink" href={`/models/${family}/${previous.slug}/`}>← 이전 · {previous.title}</Link> : <span>이전 릴리스 없음</span>}{next ? <Link className="textLink" href={`/models/${family}/${next.slug}/`}>다음 · {next.title} →</Link> : <span>다음 릴리스 없음</span>}</div></section>
    <section><h2>관련 개념</h2><div className="tags">{item.conceptIds.map((id) => { const concept = conceptDocuments.find((entry) => entry.slug === id); return concept ? <Link href={`/concepts/${id}/`} key={id}>#{concept.titleKo}</Link> : null; })}</div></section>
    <section><h2>공식 자료</h2>{item.sourceIds.map((id) => { const source = getSource(id); return source ? <a className="source" href={source.url} key={id} target="_blank" rel="noreferrer"><span>Tier {source.tier ?? 1} · {source.publisher}</span><b>{source.title} ↗</b><small>{source.year} · 최종 검증 {source.verifiedAt ?? "미확인"}</small></a> : null; })}</section>
    {profile.coverage.length > 0 && <section><h2>관련 보도</h2>{profile.coverage.map((article) => <a className="source" href={article.url} key={article.url} target="_blank" rel="noreferrer"><span>{article.outlet}</span><b>{article.title} ↗</b><small>공식 발표를 보완하는 외부 보도</small></a>)}</section>}
  </main>;
}