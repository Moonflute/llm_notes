import {conceptClusters} from "@/lib/concept-taxonomy";
import {conceptDocuments,frontierDocuments,issueDocuments,modelFamilies,modelReleases,organizationDocuments} from "@/lib/content";
import type {BuildingKind,CityNode} from "@/components/home/knowledge-city-types";
import {semanticFormFor} from "@/components/home/knowledge-city-semantics";

const preferredModels=["gpt","gemini","claude","llama","deepseek","mistral","qwen","gemma"];
const preferredOrganizations=["openai","google-deepmind","anthropic","meta","mistral-ai","deepseek","alibaba-cloud","ai2"];

const conceptBuildings:Record<string,{label:string;building:BuildingKind}>={
  foundations:{label:"Foundations Library",building:"library"},architecture:{label:"Architecture Institute",building:"institute"},training:{label:"Training Lab",building:"lab"},
  "post-training":{label:"Post-training Annex",building:"block"},inference:{label:"Inference Station",building:"station"},"retrieval-agents":{label:"Retrieval & Agents Hub",building:"office"},
  multimodal:{label:"Multimodal Studio",building:"lab"},"evaluation-safety":{label:"Evaluation Archive",building:"archive"},
};

const timelineChildren:CityNode[]=[
  {id:"foundations",label:"기반 연구",kicker:"2017—2019",summary:"Transformer와 사전학습이 언어 모델의 기본 구조를 만든 시기",href:"/timeline/?from=2017-01&to=2019-12",tone:"history",building:"station"},
  {id:"scaling",label:"스케일링",kicker:"2020—2021",summary:"규모·데이터·연산량의 관계가 중심축이 된 시기",href:"/timeline/?from=2020-01&to=2021-12",tone:"history",building:"station"},
  {id:"chat",label:"대화형 AI",kicker:"2022",summary:"지시학습과 RLHF가 대화형 제품으로 이어진 시기",href:"/timeline/?from=2022-01&to=2022-12",tone:"history",building:"station"},
  {id:"multimodal",label:"멀티모달",kicker:"2023—2024",summary:"텍스트·이미지·음성을 함께 다루는 모델이 확산된 시기",href:"/timeline/?from=2023-01&to=2024-12",tone:"history",building:"station"},
  {id:"reasoning",label:"추론과 에이전트",kicker:"2024—현재",summary:"추론·도구 사용·자율 실행이 새로운 경쟁축이 된 시기",href:"/timeline/?from=2024-01&to=2026-12",tone:"history",building:"station"},
  {id:"all",label:"전체 타임라인",kicker:"2017—2026",summary:"연구와 제품, 모델의 전체 계보",href:"/timeline/",tone:"history",building:"archive"},
];

export function getKnowledgeCityData():CityNode[]{
  const concepts:CityNode[]=conceptClusters.map((cluster,index)=>({
    id:cluster.id,label:conceptBuildings[cluster.id]?.label??cluster.titleKo,kicker:cluster.label,summary:cluster.description,tone:"concepts",building:conceptBuildings[cluster.id]?.building??"block",semanticForm:semanticFormFor(cluster.id,"institute"),
    children:cluster.conceptIds.flatMap(id=>{const item=conceptDocuments.find(concept=>concept.slug===id);return item?[{id:item.slug,label:item.titleKo,kicker:item.level,summary:item.summary,tone:"concepts" as const,building:"block" as BuildingKind,semanticForm:semanticFormFor(item.slug,"institute"),href:`/concepts/${item.slug}/`}]:[];}),
  }));
  const models:CityNode[]=preferredModels.flatMap((slug,index)=>{
    const family=modelFamilies.find(item=>item.slug===slug);if(!family)return [];
    const releases=modelReleases.filter(item=>item.familySlug===slug).sort((a,b)=>a.date.localeCompare(b.date));
    return [{id:family.slug,label:family.titleEn,kicker:`${releases.length} RELEASES`,summary:family.summary,tone:"models" as const,building:(index<3?"towers":"office") as BuildingKind,semanticForm:"lineage" as const,children:releases.map(release=>({id:release.slug,label:release.title,kicker:release.date,summary:release.summary,tone:"models" as const,building:"block" as BuildingKind,semanticForm:"generation" as const,href:`/models/${family.slug}/${release.slug}/`}))}];
  });
  const organizations:CityNode[]=preferredOrganizations.flatMap((slug,index)=>{const item=organizationDocuments.find(entry=>entry.slug===slug);return item?[{id:item.slug,label:item.titleKo,kicker:item.founded,summary:item.summary,tone:"organizations" as const,building:(index%2?"office":"institute") as BuildingKind,semanticForm:"headquarters" as const,href:`/organizations/${item.slug}/`}]:[];});
  return [
    {id:"concepts",label:"Concepts",kicker:"ACADEMIC DISTRICT",summary:"기초 표현에서 추론·에이전트까지 이어지는 학술 단지",tone:"concepts",building:"institute",semanticForm:"campus",children:concepts},
    {id:"models",label:"Models",kicker:"LINEAGE DISTRICT",summary:"주요 모델 계열과 세대별 릴리스가 증축되는 계보 구역",tone:"models",building:"towers",semanticForm:"lineage",children:models},
    {id:"history",label:"Timeline",kicker:"CENTRAL BOULEVARD",summary:"연구와 제품의 변화를 시간순으로 잇는 중앙 대로",tone:"history",building:"station",semanticForm:"rail-axis",children:timelineChildren.map(item=>({...item,semanticForm:"rail-axis"}))},
    {id:"organizations",label:"Organizations",kicker:"INSTITUTIONAL QUARTER",summary:"모델과 연구 흐름을 만든 회사와 연구소 구역",tone:"organizations",building:"office",semanticForm:"headquarters",children:organizations},
    {id:"issues",label:"Issues",kicker:"CIVIC FORUM",summary:"환각·저작권·평가·안전을 검토하는 시민 광장",tone:"issues",building:"plaza",semanticForm:"forum",children:issueDocuments.slice(0,9).map(item=>({id:item.slug,label:item.titleKo,kicker:"ISSUE",summary:item.summary,tone:"issues",building:"block" as BuildingKind,semanticForm:semanticFormFor(item.slug,"forum"),href:`/issues/${item.slug}/`}))},
    {id:"frontiers",label:"Frontiers",kicker:"RESEARCH HEIGHTS",summary:"에이전트·월드 모델·AGI를 바라보는 실험 연구지",tone:"frontiers",building:"observatory",semanticForm:"observatory",children:frontierDocuments.map(item=>({id:item.slug,label:item.titleKo,kicker:"FRONTIER",summary:item.summary,tone:"frontiers",building:"observatory" as BuildingKind,semanticForm:"observatory" as const,href:`/frontiers/${item.slug}/`}))},
  ];
}
