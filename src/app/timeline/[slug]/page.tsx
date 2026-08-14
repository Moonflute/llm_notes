import type { Metadata } from "next";
import Link from "next/link";
import { ContentMeta } from "@/components/content/content-meta";
import { conceptDocuments, events, getEvent, getSource, modelReleases } from "@/lib/content";
import { buildContentMetadata } from "@/lib/content-metadata";
import { notFound, redirect } from "next/navigation";

export function generateStaticParams() { return events.map(({ slug }) => ({ slug })); }

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const event = getEvent(slug);
  if (!event) notFound();

  const model = event.type === "model" ? modelReleases.find((item) => item.slug === event.slug) : undefined;
  if (model) redirect(`/models/${model.familySlug}/${model.slug}/`);

  const source = getSource(event.sourceId);
  return <main id="main-content" className="detail">
    <Link href="/#timeline" className="back">{ "\u2190 \uD0C0\uC784\uB77C\uC778\uC73C\uB85C" }</Link>
    <p className="sectionLabel">{event.date} ? {event.organization} ? {event.type}</p>
    <h1>{event.title}</h1>
    <p className="detailEn">{event.titleEn}</p>
    <p className="lead">{event.summary}</p>
    <ContentMeta metadata={buildContentMetadata({status:"draft",contentDepth:"partial",sourceIds:[event.sourceId]})}/>
    <section><h2>{"\uC694\uC57D"}</h2><p>{event.summary}</p></section>
    <section><h2>{"\uD2B9\uC9D5"}</h2><p>{"\uBC1C\uD45C \uB2F9\uC2DC \uACF5\uAC1C\uB41C \uC815\uBCF4\uC640 \uC6D0\uC790 \uC790\uB8CC\uB97C \uC911\uC2EC\uC73C\uB85C \uC815\uB9AC\uD588\uC2B5\uB2C8\uB2E4. \uC544\uB798 \uAD00\uB828 \uAC1C\uB150\uACFC \uACF5\uC2DD \uC790\uB8CC\uB97C \uD1B5\uD574 \uBC1C\uD45C \uBC94\uC704\uB97C \uD655\uC778\uD560 \uC218 \uC788\uC2B5\uB2C8\uB2E4."}</p></section>
    <section><h2>{"\uAD00\uB828 \uAC1C\uB150"}</h2><div className="tags">{event.conceptIds.map((id) => { const concept = conceptDocuments.find((item) => item.slug === id); return concept ? <Link key={id} href={`/concepts/${id}/`}>#{concept.titleKo}</Link> : null; })}</div></section>
    {source && <section><h2>{"\uACF5\uC2DD \uC790\uB8CC"}</h2><a className="source" href={source.url} target="_blank" rel="noreferrer"><span>Tier {source.tier ?? 1} · {source.publisher}</span><b>{source.title} ↗</b><small>{source.year} · {"\uCD5C\uC885 \uAC80\uC99D"} {source.verifiedAt ?? "-"}</small></a></section>}
  </main>;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = getEvent(slug);
  return { title: item?.title ?? "\uC0AC\uAC74", description: item?.summary, alternates: { canonical: `/timeline/${slug}/` } };
}
