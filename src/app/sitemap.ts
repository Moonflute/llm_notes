import type { MetadataRoute } from "next";
import {conceptDocuments,events,frontierDocuments,issueDocuments,learningPathDocuments,modelFamilies,organizationDocuments} from "@/lib/content";
export const dynamic="force-static";
const base=process.env.NEXT_PUBLIC_SITE_URL??"https://llm-history.example";
const date=new Date("2026-08-05");
const entry=(path:string)=>({url:`${base}${path}`,lastModified:date});
export default function sitemap():MetadataRoute.Sitemap{return [entry("/"),...['/timeline/','/organizations/','/models/','/concepts/','/issues/','/frontiers/','/paths/','/search/','/about/','/methodology/','/sources/','/changelog/','/privacy/'].map(entry),...events.map(item=>entry(`/timeline/${item.slug}/`)),...organizationDocuments.map(item=>entry(`/organizations/${item.slug}/`)),...modelFamilies.flatMap(family=>[entry(`/models/${family.slug}/`),...family.releaseSlugs.map(release=>entry(`/models/${family.slug}/${release}/`))]),...conceptDocuments.map(item=>entry(`/concepts/${item.slug}/`)),...issueDocuments.map(item=>entry(`/issues/${item.slug}/`)),...frontierDocuments.map(item=>entry(`/frontiers/${item.slug}/`)),...learningPathDocuments.map(item=>entry(`/paths/${item.slug}/`))]}