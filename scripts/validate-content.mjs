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
