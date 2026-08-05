import {conceptDocuments,events,frontierDocuments,issueDocuments,learningPathDocuments,modelFamilies,organizationDocuments,sources} from "../src/lib/content";
const now=new Date("2026-08-05");const problems:string[]=[];
const duplicate=(name:string,values:string[])=>{const seen=new Set<string>();for(const value of values){if(seen.has(value))problems.push(`Duplicate ${name}: ${value}`);seen.add(value)}};
duplicate("source id",sources.map(x=>x.id));
duplicate("event slug",events.map(x=>x.slug));
duplicate("concept slug",conceptDocuments.map(x=>x.slug));
duplicate("model slug",modelFamilies.map(x=>x.slug));
duplicate("organization slug",organizationDocuments.map(x=>x.slug));
duplicate("issue slug",issueDocuments.map(x=>x.slug));
duplicate("frontier slug",frontierDocuments.map(x=>x.slug));
duplicate("learning-path slug",learningPathDocuments.map(x=>x.slug));
for(const source of sources){if(!source.verifiedAt)problems.push(`Missing verifiedAt: ${source.id}`);else if((now.getTime()-new Date(source.verifiedAt).getTime())/86400000>365)problems.push(`Stale source: ${source.id}`)}
const records=[...events.map(x=>({slug:x.slug,sourceIds:[x.sourceId]})),...organizationDocuments,...modelFamilies,...conceptDocuments,...issueDocuments,...frontierDocuments,...learningPathDocuments];
for(const record of records)if(!record.sourceIds.length)problems.push(`Missing source: ${record.slug}`);
if(problems.length){console.error(problems.join("\n"));process.exit(1)}
console.log("Content QA passed: unique IDs/slugs, source coverage, verified dates, and source freshness.");