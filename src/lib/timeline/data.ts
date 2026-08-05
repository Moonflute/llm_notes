import { events, modelFamilies } from "@/lib/content";
import { historicalDate, compareTimelineDates } from "./dates";
import { validateTimelineGraph } from "./validate";
import type { TimelineEra, TimelineLane, TimelineNode, TimelineRelation, TimelineSubLane } from "./types";

const organizationAliases: Record<string, string> = {
  "OpenAI": "openai", "Google": "google-deepmind", "Google Research": "google-deepmind", "Google DeepMind": "google-deepmind", "Google Brain and CMU": "google-deepmind", "DeepMind": "google-deepmind", "Anthropic": "anthropic", "Meta": "meta", "Meta AI": "meta", "Microsoft": "microsoft", "Mistral": "mistral-ai", "Mistral AI": "mistral-ai", "DeepSeek": "deepseek", "Alibaba Cloud": "alibaba-qwen", "Cohere": "cohere", "Allen Institute for AI": "ai2", "AI2": "ai2", "Baidu": "other", "Hugging Face": "other"
};
const laneOrder = ["research", "openai", "google-deepmind", "anthropic", "meta", "microsoft", "mistral-ai", "deepseek", "alibaba-qwen", "other", "product", "industry"];
const laneInfo: Record<string, Omit<TimelineLane, "id" | "order">> = {
  research: { type: "research", titleKo: "Research and concepts", titleEn: "Research & concepts", colorToken: "research", collapsible: false },
  openai: { type: "organization", titleKo: "OpenAI", colorToken: "openai", organizationId: "openai", collapsible: true },
  "google-deepmind": { type: "organization", titleKo: "Google DeepMind", colorToken: "google", organizationId: "google-deepmind", collapsible: true },
  anthropic: { type: "organization", titleKo: "Anthropic", colorToken: "anthropic", organizationId: "anthropic", collapsible: true },
  meta: { type: "organization", titleKo: "Meta AI", colorToken: "meta", organizationId: "meta", collapsible: true },
  microsoft: { type: "organization", titleKo: "Microsoft", colorToken: "microsoft", organizationId: "microsoft", collapsible: true },
  "mistral-ai": { type: "organization", titleKo: "Mistral AI", colorToken: "mistral", organizationId: "mistral-ai", collapsible: true },
  deepseek: { type: "organization", titleKo: "DeepSeek", colorToken: "deepseek", organizationId: "deepseek", collapsible: true },
  "alibaba-qwen": { type: "organization", titleKo: "Alibaba / Qwen", colorToken: "qwen", organizationId: "alibaba-cloud", collapsible: true },
  other: { type: "organization", titleKo: "Other organizations", colorToken: "other", collapsible: true },
  product: { type: "product", titleKo: "Products & interfaces", colorToken: "product", collapsible: true },
  industry: { type: "policy", titleKo: "Industry & ecosystem", colorToken: "industry", collapsible: true }
};
export const timelineLanes: TimelineLane[] = laneOrder.map((id, order) => ({ id, order, ...laneInfo[id] }));
const familyForEvent = new Map(modelFamilies.flatMap(family => family.releaseSlugs.map(slug => [slug, family.slug] as const)));
function eventLane(event: typeof events[number]) { if (event.type === "product") return "product"; if (event.type === "benchmark") return "industry"; if (event.type === "research" || event.type === "method") return "research"; const candidate = organizationAliases[event.organization]; return candidate && laneOrder.includes(candidate) ? candidate : "other"; }
function entityType(event: typeof events[number]): TimelineNode["entityType"] { return event.type === "model" ? "model_release" : event.type === "research" ? "research" : event.type === "method" ? "method" : event.type === "product" ? "product" : "benchmark"; }
export const timelineNodes: TimelineNode[] = events.map(event => {
  const familyId = familyForEvent.get(event.slug);
  const laneId = eventLane(event);
  return { id: event.slug, slug: event.slug, entityType: entityType(event), titleKo: event.title, titleEn: event.titleEn, summaryKo: event.summary, primaryDate: historicalDate(event.date, [event.sourceId], event.type === "product" ? "product_released" : event.type === "model" ? "announced" : "paper_published"), additionalDates: [], importance: event.importance, laneId, subLaneId: familyId ? `family-${familyId}` : undefined, organizationIds: [organizationAliases[event.organization] ?? "other"], modelFamilyId: familyId, conceptIds: event.conceptIds, fieldIds: event.concepts.map(value => value.toLowerCase().replaceAll(" ", "-")), releaseMode: event.type === "product" ? "product" : event.type === "model" ? "paper" : undefined, sourceIds: [event.sourceId], status: "published" };
});
export const timelineSubLanes: TimelineSubLane[] = modelFamilies.map((family, index) => ({ id: `family-${family.slug}`, laneId: family.organizationSlug === "alibaba-cloud" ? "alibaba-qwen" : family.organizationSlug === "hugging-face" || family.organizationSlug === "salesforce" || family.organizationSlug === "princeton" || family.organizationSlug === "ai21" || family.organizationSlug === "databricks" ? "other" : family.organizationSlug, titleKo: family.titleKo, order: index, modelFamilyIds: [family.slug], trackId: "model_release" }));
const nextReleaseRelations = modelFamilies.flatMap(family => { const releases = family.releaseSlugs.map(slug => timelineNodes.find(node => node.slug === slug)).filter((node): node is TimelineNode => Boolean(node)).sort((a,b) => compareTimelineDates(a.primaryDate.value,b.primaryDate.value)); return releases.slice(1).map((node, index) => ({ id: "next-" + releases[index].id + "-" + node.id, fromId: releases[index].id, toId: node.id, type: "next_release" as const, evidence: "direct" as const, sourceIds: node.sourceIds, visibleFromZoom: 1 as const })); });
const conceptRelations = timelineNodes.flatMap(node => node.conceptIds.filter(id => ["transformer", "scaling-laws", "rlhf", "retrieval-augmented-generation", "agents", "reasoning"].includes(id)).map(id => ({ id: `concept-${id}-${node.id}`, fromId: id === "transformer" ? "transformer" : id === "scaling-laws" ? "scaling-laws" : id === "rlhf" ? "instructgpt" : id === "retrieval-augmented-generation" ? "rag" : id === "agents" ? "tool-use" : "reasoning", toId: node.id, type: "influenced_by" as const, evidence: "documented" as const, sourceIds: node.sourceIds, visibleFromZoom: 2 as const })).filter(relation => relation.fromId !== relation.toId && timelineNodes.some(node => node.id === relation.fromId)));
export const timelineRelations: TimelineRelation[] = [...nextReleaseRelations, ...conceptRelations];
validateTimelineGraph(timelineNodes, timelineLanes, timelineSubLanes, timelineRelations);
export const timelineEras: TimelineEra[] = [
  { id: "background", titleKo: "Foundations", start: "2017-01", end: "2019-12", summaryKo: "Transformer and pretraining established the modern baseline.", order: 0, sourceIds: ["transformer"], editorial: true },
  { id: "scaling", titleKo: "Scaling", start: "2020-01", end: "2021-12", summaryKo: "Scaling laws and larger foundation models changed the frontier.", order: 1, sourceIds: ["gpt-3"], editorial: true },
  { id: "popularization", titleKo: "Popularization", start: "2022-01", end: "2023-05", summaryKo: "Instruction following and conversational products broadened use.", order: 2, sourceIds: ["chatgpt"], editorial: true },
  { id: "multimodal", titleKo: "Multimodal & open models", start: "2023-06", end: "2024-06", summaryKo: "Multimodality, open weights, and capable assistants diversified.", order: 3, sourceIds: ["gemini"], editorial: true },
  { id: "reasoning", titleKo: "Reasoning & agents", start: "2024-07", end: "2026-08", summaryKo: "Reasoning-oriented systems and agents became a central direction.", order: 4, sourceIds: ["deepseek-r1"], editorial: true }
];
