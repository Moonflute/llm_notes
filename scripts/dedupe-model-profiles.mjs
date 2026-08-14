import fs from "node:fs";

const path=new URL("../content/model-profiles/index.json",import.meta.url);
const profiles=JSON.parse(fs.readFileSync(path,"utf8"));

function normalized(value){return value.replace(/\s+/g," ").replace(/[.。]$/," ").trim()}
function unique(items){const seen=new Set();return items.filter(item=>{const key=normalized(item);if(!key||seen.has(key))return false;seen.add(key);return true})}

let removed=0;
for(const profile of profiles){
  const summary=normalized(profile.summaryKo);
  const reception=normalized(profile.reception);
  const features=unique(profile.features).filter(item=>{
    const key=normalized(item);
    if(key===summary||key===reception){removed++;return false}
    return true;
  });
  profile.features=features;
  profile.announcement=unique(profile.announcement).filter(item=>{
    const key=normalized(item);
    if(key===summary||key===reception||key.includes(summary)){removed++;return false}
    return true;
  });
}

fs.writeFileSync(path,JSON.stringify(profiles,null,2)+"\n","utf8");
console.log(`Removed ${removed} duplicated model-profile sentences.`);
