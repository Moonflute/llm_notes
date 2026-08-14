import fs from "node:fs";

const read = (path) => JSON.parse(fs.readFileSync(path, "utf8"));
const profiles = read("content/model-profiles/index.json");
const events = read("content/events/index.json");
const releases = read("content/model-releases/index.json");
const families = read("content/model-families/index.json");
const sources = read("content/sources/index.json");
const sourceIds = new Set(sources.map((source) => source.id));
const timelineKeys = families.flatMap((family) => family.releaseSlugs.map((slug) => family.slug + "/" + slug));
const releaseKeys = [...timelineKeys, ...releases.map((release) => release.familySlug + "/" + release.slug)];
const profileKeys = profiles.map((profile) => profile.familySlug + "/" + profile.releaseSlug);
const errors = [];
const fail = (condition, message) => { if (condition) errors.push(message); };
const duplicateGroups = (items, key) => [...Map.groupBy(items, key)].filter(([, group]) => group.length > 1);
const normalizedUrl = (url) => url.trim().replace(/\/$/, "").toLowerCase();

fail(duplicateGroups(events, event => event.id).length > 0, "duplicate canonical event id");
fail(duplicateGroups(events, event => event.slug).length > 0, "duplicate event slug");
fail(duplicateGroups(events, event => `${event.date}|${event.title.trim().toLowerCase()}`).length > 0, "duplicate event date/title");
fail(duplicateGroups(sources, source => source.id).length > 0, "duplicate source id");
fail(duplicateGroups(sources, source => normalizedUrl(source.url)).length > 0, "duplicate source URL");
for (let index = 1; index < events.length; index += 1) fail(events[index - 1].date > events[index].date, `timeline out of order: ${events[index - 1].slug} -> ${events[index].slug}`);
for (const event of events) {
  fail(!/^evt-[a-z0-9-]+$/.test(event.id), `invalid canonical event id: ${event.slug}`);
  fail(event.year !== Number(event.date.slice(0, 4)), `event year/date mismatch: ${event.slug}`);
  fail(!sourceIds.has(event.sourceId), `event source missing: ${event.slug}/${event.sourceId}`);
}
for (const source of sources) {
  fail(!source.sourceType, `source type missing: ${source.id}`);
  fail(!source.authorOrOrganization, `source author/organization missing: ${source.id}`);
  fail(!source.publicationDate, `source publication date missing: ${source.id}`);
  fail(!source.verificationDate, `source verification date missing: ${source.id}`);
  fail(!source.classification, `source classification missing: ${source.id}`);
  fail(!source.validationStatus, `source validation status missing: ${source.id}`);
  fail(!source.supportsClaims?.length, `source claim linkage missing: ${source.id}`);
}

fail(new Set(profileKeys).size !== profileKeys.length, "duplicate model profile key");
fail(new Set(releaseKeys).size !== releaseKeys.length, "duplicate model release key");
for (const key of releaseKeys) fail(!profileKeys.includes(key), "missing profile: " + key);
for (const key of profileKeys) fail(!releaseKeys.includes(key), "orphan profile: " + key);

for (const profile of profiles) {
  const key = profile.familySlug + "/" + profile.releaseSlug;
  fail(profile.summaryKo.length < 28, "short summary: " + key);
  fail(profile.features.length < 3, "fewer than 3 features: " + key);
  fail(profile.announcement.length < 2, "fewer than 2 interpretation paragraphs: " + key);
  fail(!profile.notableEvents?.length, "missing notable event: " + key);
  fail(!/^\d{4}-\d{2}-\d{2}$/.test(profile.verifiedAt), "invalid verification date: " + key);
  for (const event of profile.notableEvents ?? []) {
    fail(event.description.length < 20, "short notable event: " + key);
    for (const id of event.sourceIds) fail(!sourceIds.has(id), "missing notable event source " + id + ": " + key);
  }
}
const contentText = [profiles, events, releases].map(JSON.stringify).join("\n");
for (const pattern of ["\uFFFD", "??", "\uC744(\uB97C)", "\uC774 \uD398\uC774\uC9C0\uB294 \uACF5\uC2DD \uC6D0\uBB38", "\uD655\uC778\uB41C \uC218\uCE58 \uC5C6\uC74C"]) {
  fail(contentText.includes(pattern), "forbidden corruption/template pattern: " + JSON.stringify(pattern));
}
fail(/[\uF900-\uFAFF]/.test(contentText), "CJK compatibility mojibake detected");
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log("content QA passed: " + profiles.length + " model profiles, " + events.length + " timeline events, " + sources.length + " sources");
console.log("source claim QA: " + sources.filter(source => source.validationStatus === "claim-verified").length + " claim-verified, " + sources.filter(source => source.validationStatus === "linked-not-claim-verified").length + " linked pending review");
