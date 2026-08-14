import type { Metadata } from "next";
import Link from "next/link";
import { ContentMeta } from "@/components/content/content-meta";
import { buildContentMetadata } from "@/lib/content-metadata";
import { modelFamilies, modelReleases } from "@/lib/content";
import { notFound } from "next/navigation";

export function generateStaticParams() { return modelFamilies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const family = modelFamilies.find((item) => item.slug === slug); return { title: family?.titleKo ?? "모델 계열", description: family?.summary, alternates: { canonical: `/models/${slug}/` } }; }

export default async function Model({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = modelFamilies.find((item) => item.slug === slug);
  if (!family) notFound();
  const releases = modelReleases.filter((item) => item.familySlug === slug).sort((a, b) => a.date.localeCompare(b.date));
  return <main id="main-content" className="detail"><Link href="/models/" className="back">← 모델 목록</Link><p className="sectionLabel">MODEL FAMILY</p><h1>{family.titleKo}</h1><p className="detailEn">{family.titleEn}</p><ContentMeta metadata={buildContentMetadata({status:"draft",contentDepth:"partial",sourceIds:family.sourceIds})}/><section><h2>요약</h2><p className="lead">{family.summary}</p></section><section><h2>모델 구성</h2>{releases.map((release, index) => <p key={release.slug}>{index + 1}. <Link className="textLink" href={`/models/${family.slug}/${release.slug}/`}>{release.date} · {release.title}</Link> — {release.summary}</p>)}</section><section><h2>공개 정보</h2><p>각 릴리스 페이지의 스펙은 공식적으로 확인된 정보만 기록합니다. 공개되지 않은 컨텍스트 길이·파라미터·하위 모델은 미공개로 표시하며 추정하지 않습니다.</p></section></main>;
}
