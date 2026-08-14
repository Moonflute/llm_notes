import type { Metadata } from "next";
import Link from "next/link";
import { ContentMeta } from "@/components/content/content-meta";
import { KineticRail } from "@/components/motion/kinetic-rail";
import { buildContentMetadata } from "@/lib/content-metadata";
import { modelFamilies, modelReleases } from "@/lib/content";
import { getModelFamilyNote } from "@/lib/model-family-notes";
import { notFound } from "next/navigation";

export function generateStaticParams() { return modelFamilies.map(({ slug }) => ({ slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> { const { slug } = await params; const family = modelFamilies.find((item) => item.slug === slug); return { title: family?.titleKo ?? "모델 계열", description: family?.summary, alternates: { canonical: `/models/${slug}/` } }; }

export default async function Model({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const family = modelFamilies.find((item) => item.slug === slug);
  if (!family) notFound();
  const releases = modelReleases.filter((item) => item.familySlug === slug).sort((a, b) => a.date.localeCompare(b.date));
  const note=getModelFamilyNote(slug);
  return <main id="main-content" className="detail modelFamilyDetail"><Link href="/models/" className="back">← 모델 목록</Link><p className="sectionLabel">MODEL FAMILY</p><h1>{family.titleKo}</h1><p className="detailEn">{family.titleEn}</p><ContentMeta metadata={buildContentMetadata({status:"draft",contentDepth:note?"full":"partial",sourceIds:family.sourceIds})}/><section><h2>계열 개요</h2><p>{note?.background??family.summary}</p></section>{note?<section><h2>세대별 핵심 변화</h2><ol>{note.shifts.map(shift=><li key={shift}>{shift}</li>)}</ol></section>:null}<section className="lineageSection"><h2>릴리스 계보</h2><p>시간순으로 밀거나 화살표를 눌러 세대별 변화를 확인하세요. 선택한 릴리스가 전면으로 이동합니다.</p><KineticRail label={`${family.titleKo} 릴리스 계보`} itemLabel="릴리스" className="releaseLineageRail">{releases.map((release,index)=><Link className="releaseSlide" key={release.slug} href={`/models/${family.slug}/${release.slug}/`}><span>{String(index+1).padStart(2,"0")} · {release.date}</span><h3>{release.title}</h3><p>{release.summary}</p><small>상세 문서 열기 →</small></Link>)}</KineticRail></section>{note?<><section><h2>Architecture 공개 범위</h2><p>{note.architecture}</p></section><section><h2>중요한 단절과 갈래</h2><p>{note.discontinuity}</p></section></>:null}<section><h2>공개 정보 원칙</h2><p>각 릴리스 페이지의 스펙은 공식적으로 확인된 정보만 기록합니다. 공개되지 않은 컨텍스트 길이·파라미터·하위 모델은 미공개로 표시하며 추정하지 않습니다.</p></section></main>;
}
