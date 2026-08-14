import fs from "node:fs";

const jsonFiles = [
  "content/events/index.json",
  "content/sources/index.json",
  "content/concepts/index.json",
  "content/organizations/index.json",
  "content/model-families/index.json",
  "content/model-releases/index.json",
  "content/model-profiles/index.json",
  "content/issues/index.json",
  "content/frontiers/index.json",
  "content/paths/index.json",
];

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const write = (path, value) => fs.writeFileSync(path, JSON.stringify(value, null, 2) + "\n", "utf8");

const sourceAliases = {
  "tool-use": "toolformer",
  "claude-3-source": "claude",
  "deepseek-r1-paper": "deepseek",
};

function replaceSourceAliases(value) {
  if (Array.isArray(value)) return value.map(replaceSourceAliases);
  if (!value || typeof value !== "object") return value;
  return Object.fromEntries(Object.entries(value).map(([key, item]) => {
    if (key === "sourceId" && typeof item === "string" && sourceAliases[item]) return [key, sourceAliases[item]];
    if (key === "sourceIds" && Array.isArray(item)) return [key, [...new Set(item.map(id => sourceAliases[id] ?? id))]];
    return [key, replaceSourceAliases(item)];
  }));
}

for (const path of jsonFiles) {
  let data = replaceSourceAliases(read(path));
  if (path === "content/events/index.json") {
    const duplicateSlugs = new Set(["toolformer", "claude-3-source", "deepseek-r1-paper"]);
    data = data.filter(event => !duplicateSlugs.has(event.slug)).map(event => ({ id: `evt-${event.slug}`, ...event }));
  }
  if (path === "content/sources/index.json") {
    const duplicateIds = new Set(Object.keys(sourceAliases));
    data = data.filter(source => !duplicateIds.has(source.id));
  }
  write(path, data);
}

const migrated = Object.fromEntries(jsonFiles.map(path => [path, read(path)]));
const claimsBySource = new Map();
const addClaim = (sourceId, id, claim) => {
  if (!sourceId || !claim?.trim()) return;
  const claims = claimsBySource.get(sourceId) ?? [];
  if (!claims.some(item => item.id === id)) claims.push({ id, claim: claim.trim() });
  claimsBySource.set(sourceId, claims);
};
const addClaims = (sourceIds, id, claim) => (sourceIds ?? []).forEach(sourceId => addClaim(sourceId, id, claim));

for (const event of migrated["content/events/index.json"]) addClaim(event.sourceId, `${event.id}:summary`, event.summary);
for (const concept of migrated["content/concepts/index.json"]) addClaims(concept.sourceIds, `concept-${concept.slug}:summary`, concept.summary);
for (const organization of migrated["content/organizations/index.json"]) addClaims(organization.sourceIds, `organization-${organization.slug}:summary`, organization.summary);
for (const family of migrated["content/model-families/index.json"]) addClaims(family.sourceIds, `family-${family.slug}:summary`, family.summary);
for (const release of migrated["content/model-releases/index.json"]) addClaims(release.sourceIds, `release-${release.familySlug}-${release.slug}:summary`, release.summary);
for (const issue of migrated["content/issues/index.json"]) {
  addClaims(issue.sourceIds, `issue-${issue.slug}:summary`, issue.summary);
  addClaims(issue.sourceIds, `issue-${issue.slug}:fact`, issue.fact);
}
for (const frontier of migrated["content/frontiers/index.json"]) {
  addClaims(frontier.sourceIds, `frontier-${frontier.slug}:summary`, frontier.summary);
  addClaims(frontier.sourceIds, `frontier-${frontier.slug}:shared`, frontier.shared);
  addClaims(frontier.sourceIds, `frontier-${frontier.slug}:different`, frontier.different);
}
for (const path of migrated["content/paths/index.json"]) addClaims(path.sourceIds, `path-${path.slug}:summary`, path.summary);
for (const profile of migrated["content/model-profiles/index.json"]) {
  for (const event of profile.notableEvents ?? []) addClaims(event.sourceIds, `profile-${profile.familySlug}-${profile.releaseSlug}:${event.title}`, event.description);
}

function sourceType(source) {
  const value = `${source.url} ${source.title}`.toLowerCase();
  if ((source.tier ?? 1) >= 3) return "secondary-analysis";
  if (value.includes("arxiv.org") || value.includes("aclanthology.org") || value.includes("doi.org")) return "paper-or-technical-report";
  if (value.includes("huggingface.co") || value.includes("model card")) return "model-card";
  if (value.includes("docs.") || value.includes("documentation") || value.includes("developer")) return "developer-docs";
  if (/introduc|announc|news|blog/.test(value)) return "official-announcement";
  return "official-webpage";
}

const enrichedSources = migrated["content/sources/index.json"].map(source => ({
  ...source,
  sourceType: source.sourceType ?? sourceType(source),
  authorOrOrganization: source.authorOrOrganization ?? source.publisher,
  publicationDate: source.publicationDate ?? String(source.year),
  verificationDate: source.verificationDate ?? source.verifiedAt,
  classification: source.classification ?? ((source.tier ?? 1) <= 2 ? "primary" : "secondary"),
  validationStatus: source.validationStatus ?? "linked-not-claim-verified",
  supportsClaims: claimsBySource.get(source.id) ?? [],
}));
write("content/sources/index.json", enrichedSources);

console.log("v0.9 canonical data migration complete");
