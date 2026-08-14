"use client";

import {useRouter} from "next/navigation";
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from "react";
import {CityLandmark,type LandmarkKind} from "@/components/home/city-landmark";
import {SpatialViewport,type SpatialCamera,type SpatialViewportHandle} from "@/components/home/spatial-viewport";
import {conceptClusters} from "@/lib/concept-taxonomy";
import {conceptDocuments,frontierDocuments,issueDocuments,modelFamilies,modelReleases,organizationDocuments} from "@/lib/content";

type Tone="models"|"concepts"|"organizations"|"history"|"issues"|"frontiers";
type Position={x:number;y:number;presence:number;mobileX?:number;mobileY?:number};
type AtlasNode={id:string;label:string;kicker:string;summary:string;tone:Tone;landmark:LandmarkKind;href?:string;children?:AtlasNode[];presence?:number};
type FocusEntry={node:AtlasNode;position:Position};
type AtlasHistoryState={path:string[];camera:SpatialCamera;previousCameraState:SpatialCamera|null};
type HoverState={key:string;parentKey:string}|null;

const ROOT_CAMERA:SpatialCamera={x:0,y:0,scale:1};
const STORAGE_KEY="llm-history:home-atlas";
const preferredModels=["gpt","gemini","claude","llama","deepseek","mistral","qwen","gemma"];
const preferredOrganizations=["openai","google-deepmind","anthropic","meta","mistral-ai","deepseek","alibaba-cloud","ai2"];
const rootPositions:Record<Tone,Position>={
  concepts:{x:29,y:43,mobileX:27,mobileY:43,presence:1.2},models:{x:65,y:40,mobileX:72,mobileY:38,presence:1.14},history:{x:49,y:72,mobileX:46,mobileY:72,presence:1.03},
  organizations:{x:82,y:67,mobileX:76,mobileY:66,presence:.84},issues:{x:17,y:69,mobileX:18,mobileY:69,presence:.82},frontiers:{x:78,y:18,mobileX:71,mobileY:18,presence:.88},
};
const districtPlots:Record<Tone,{x:number;y:number;width:number;height:number;rotate:number}>={
  concepts:{x:27,y:42,width:31,height:34,rotate:-2},models:{x:65,y:40,width:30,height:31,rotate:1.5},history:{x:49,y:72,width:55,height:13,rotate:-1},
  organizations:{x:82,y:67,width:20,height:22,rotate:2},issues:{x:17,y:69,width:19,height:19,rotate:-2.5},frontiers:{x:78,y:18,width:23,height:21,rotate:1},
};

const historyNodes:AtlasNode[]=[
  {id:"foundations",label:"기반 연구",kicker:"2017—2019",summary:"Transformer와 사전학습이 언어 모델의 기본 구조를 만든 시기",href:"/timeline/?from=2017-01&to=2019-12",tone:"history",landmark:"station"},
  {id:"scaling",label:"스케일링",kicker:"2020—2021",summary:"규모·데이터·연산량의 관계가 개발의 중심축이 된 시기",href:"/timeline/?from=2020-01&to=2021-12",tone:"history",landmark:"station"},
  {id:"chat",label:"대화형 AI",kicker:"2022",summary:"지시학습과 RLHF가 대화형 제품으로 이어진 시기",href:"/timeline/?from=2022-01&to=2022-12",tone:"history",landmark:"station"},
  {id:"multimodal-era",label:"멀티모달",kicker:"2023—2024",summary:"텍스트·이미지·음성을 함께 다루는 모델이 확산된 시기",href:"/timeline/?from=2023-01&to=2024-12",tone:"history",landmark:"station"},
  {id:"reasoning-era",label:"추론과 에이전트",kicker:"2024—현재",summary:"추론·도구 사용·자율 실행이 새로운 경쟁축이 된 시기",href:"/timeline/?from=2024-01&to=2026-12",tone:"history",landmark:"station"},
  {id:"timeline-all",label:"전체 타임라인",kicker:"2017—2026",summary:"연구와 제품, 모델의 전체 계보",href:"/timeline/",tone:"history",landmark:"archive"},
];

function compact(value:string,limit=22){return value.length>limit?`${value.slice(0,limit).trim()}…`:value}
function childPositions(parent:Position,count:number,depth:number):Position[]{
  const districtGrid=[[-12,-9],[0,-11],[12,-7],[-14,2],[-1,1],[13,5],[-9,12],[7,13],[17,13],[-18,13]];
  const blockGrid=[[-8,-7],[-2,-8],[5,-6],[9,-2],[-9,1],[-3,1],[3,2],[9,5],[-7,8],[0,8],[7,9],[12,9]];
  const mobileDistrict=[[-24,-9],[0,-11],[24,-7],[-25,2],[0,1],[25,5],[-17,13],[15,14],[0,18]];
  const mobileBlock=[[-19,-7],[0,-8],[19,-6],[-20,1],[0,1],[20,3],[-16,8],[4,9],[20,10],[-2,14]];
  const desktop=depth===1?districtGrid:blockGrid;const mobile=depth===1?mobileDistrict:mobileBlock;
  return Array.from({length:count},(_,index)=>{
    const point=desktop[index%desktop.length];const mobilePoint=mobile[index%mobile.length];const cycle=Math.floor(index/desktop.length);
    return {x:parent.x+point[0]+cycle*2,y:parent.y+point[1]+cycle*3,mobileX:(parent.mobileX??parent.x)+mobilePoint[0],mobileY:(parent.mobileY??parent.y)+mobilePoint[1]+cycle*3,presence:depth===1?1:.86};
  });
}
function focusScale(depth:number){return depth===1?1.46:Math.min(2.2,1.72+(depth-1)*.32)}
function ease(value:number){return 1-Math.pow(1-value,4)}

function DistrictPlot({node,active,dimmed,highlighted}:{node:AtlasNode;active:boolean;dimmed:boolean;highlighted:boolean}){
  const plot=districtPlots[node.tone];
  const mobile=rootPositions[node.tone];
  const style={"--district-x":`${plot.x}%`,"--district-y":`${plot.y}%`,"--district-mobile-x":`${mobile.mobileX??plot.x}%`,"--district-mobile-y":`${mobile.mobileY??plot.y}%`,"--district-width":`${plot.width}%`,"--district-height":`${plot.height}%`,"--district-rotate":`${plot.rotate}deg`} as CSSProperties;
  return <div className={`cityDistrict tone-${node.tone}`} style={style} data-active={active} data-highlighted={highlighted} data-dimmed={dimmed} aria-hidden="true"><i/><i/><i/><span>{node.kicker}</span></div>;
}

function SpatialNode({node,nodeKey,parentKey,position,depth,active,ancestor,hovered,departing,onHover,onSelect}:{node:AtlasNode;nodeKey:string;parentKey:string;position:Position;depth:number;active:boolean;ancestor:boolean;hovered:HoverState;departing:boolean;onHover:(state:HoverState)=>void;onSelect:()=>void}){
  const related=!hovered||hovered.key===nodeKey||hovered.parentKey===parentKey;
  const style={"--node-x":`${position.x}%`,"--node-y":`${position.y}%`,"--node-mobile-x":`${position.mobileX??position.x}%`,"--node-mobile-y":`${position.mobileY??position.y}%`,"--presence":position.presence,viewTransitionName:departing?(node.href?.startsWith("/concepts/")?"concept-title":node.href?.startsWith("/models/")?"model-title":"atlas-leaf"):undefined} as CSSProperties;
  return <button type="button" className={`spatialNode tone-${node.tone}`} style={style} data-spatial-node data-depth={depth} data-active={active} data-ancestor={ancestor} data-related={related} onPointerEnter={()=>onHover({key:nodeKey,parentKey})} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover({key:nodeKey,parentKey})} onBlur={()=>onHover(null)} onClick={onSelect} title={node.summary}>
    <CityLandmark kind={node.landmark}/><span><small>{node.kicker}</small><b>{compact(node.label)}</b></span>
  </button>;
}

export function KnowledgeCosmos(){
  const router=useRouter();
  const viewport=useRef<SpatialViewportHandle>(null);
  const animationFrame=useRef<number|null>(null);
  const cameraRef=useRef<SpatialCamera>(ROOT_CAMERA);
  const [camera,setCameraState]=useState<SpatialCamera>(ROOT_CAMERA);
  const [path,setPath]=useState<FocusEntry[]>([]);
  const [previousCameraState,setPreviousCameraState]=useState<SpatialCamera|null>(null);
  const [hovered,setHovered]=useState<HoverState>(null);
  const [departingLeaf,setDepartingLeaf]=useState<string|null>(null);

  const roots=useMemo<AtlasNode[]>(()=>{
    const conceptBuildings:Record<string,{label:string;landmark:LandmarkKind}>={
      foundations:{label:"기초 표현 도서관",landmark:"library"},architecture:{label:"아키텍처 홀",landmark:"hall"},training:{label:"트레이닝 랩",landmark:"lab"},
      "post-training":{label:"포스트트레이닝 연구동",landmark:"works"},inference:{label:"인퍼런스 역",landmark:"station"},"retrieval-agents":{label:"검색·에이전트 허브",landmark:"hub"},
      multimodal:{label:"멀티모달 스튜디오",landmark:"studio"},"evaluation-safety":{label:"평가·안전 기록원",landmark:"archive"},
    };
    const modelBuildings:Record<string,{label:string;landmark:LandmarkKind}>={gpt:{label:"GPT 타워",landmark:"tower"},gemini:{label:"Gemini 센터",landmark:"hall"},claude:{label:"Claude 하우스",landmark:"house"},llama:{label:"Llama 블록",landmark:"block"},deepseek:{label:"DeepSeek 워크스",landmark:"works"},mistral:{label:"Mistral 아틀리에",landmark:"studio"},qwen:{label:"Qwen 센터",landmark:"hall"},gemma:{label:"Gemma 하우스",landmark:"house"}};
    const concepts:AtlasNode[]=conceptClusters.map(cluster=>({
      id:cluster.id,label:conceptBuildings[cluster.id]?.label??cluster.titleKo,kicker:cluster.label,summary:cluster.description,tone:"concepts",landmark:conceptBuildings[cluster.id]?.landmark??"block",presence:cluster.id==="architecture"?1.12:1,
      children:cluster.conceptIds.flatMap((id,index)=>{const item=conceptDocuments.find(concept=>concept.slug===id);return item?[{id:item.slug,label:item.titleKo,kicker:item.level,summary:item.summary,tone:"concepts" as const,landmark:(index%3===0?"archive":index%3===1?"hall":"lab") as LandmarkKind,href:`/concepts/${item.slug}/`}]:[]}),
    }));
    const models:AtlasNode[]=preferredModels.flatMap(slug=>{
      const family=modelFamilies.find(item=>item.slug===slug);if(!family)return [];
      const releases=modelReleases.filter(item=>item.familySlug===slug).sort((a,b)=>a.date.localeCompare(b.date));
      return [{id:family.slug,label:modelBuildings[slug]?.label??family.titleKo,kicker:`${releases.length} RELEASES`,summary:family.summary,tone:"models" as const,landmark:modelBuildings[slug]?.landmark??"tower",presence:slug==="gpt"?1.14:1,children:releases.map((release,index)=>({id:release.slug,label:release.title,kicker:release.date,summary:release.summary,tone:"models" as const,landmark:(index%2?"block":"tower") as LandmarkKind,href:`/models/${family.slug}/${release.slug}/`}))}];
    });
    const organizations:AtlasNode[]=preferredOrganizations.flatMap((slug,index)=>{const item=organizationDocuments.find(entry=>entry.slug===slug);return item?[{id:item.slug,label:item.titleKo,kicker:item.founded,summary:item.summary,tone:"organizations" as const,landmark:(index%2?"house":"quarter") as LandmarkKind,href:`/organizations/${item.slug}/`}]:[]});
    return [
      {id:"concepts",label:"개념 지구",kicker:"CONCEPTS DISTRICT",summary:"기초 표현에서 추론·에이전트까지 이어지는 기술 구역",tone:"concepts",landmark:"library",presence:1.2,children:concepts},
      {id:"models",label:"모델 지구",kicker:"MODELS DISTRICT",summary:"주요 모델 계열과 세대별 릴리스가 모인 구역",tone:"models",landmark:"tower",presence:1.14,children:models},
      {id:"history",label:"타임라인 대로",kicker:"TIMELINE BOULEVARD",summary:"연구와 제품의 변화를 시간순으로 잇는 대로",tone:"history",landmark:"boulevard",presence:1.03,children:historyNodes},
      {id:"organizations",label:"조직 쿼터",kicker:"ORGANIZATIONS QUARTER",summary:"모델과 연구 흐름을 만든 회사와 연구소 구역",tone:"organizations",landmark:"quarter",presence:.84,children:organizations},
      {id:"issues",label:"이슈 광장",kicker:"ISSUES SQUARE",summary:"환각·저작권·평가·안전을 토론하는 광장",tone:"issues",landmark:"square",presence:.82,children:issueDocuments.slice(0,9).map((item,index)=>({id:item.slug,label:item.titleKo,kicker:"ISSUE",summary:item.summary,tone:"issues",landmark:(index%2?"archive":"house") as LandmarkKind,href:`/issues/${item.slug}/`}))},
      {id:"frontiers",label:"프런티어 언덕",kicker:"FRONTIERS HILL",summary:"에이전트·월드 모델·AGI를 바라보는 연구 고지",tone:"frontiers",landmark:"hill",presence:.88,children:frontierDocuments.map((item,index)=>({id:item.slug,label:item.titleKo,kicker:"FRONTIER",summary:item.summary,tone:"frontiers",landmark:(index%2?"lab":"hill") as LandmarkKind,href:`/frontiers/${item.slug}/`}))},
    ];
  },[]);

  const setCamera=(next:SpatialCamera)=>{cameraRef.current=next;setCameraState(next)};
  const cameraFor=(position:Position,depth:number)=>{
    const rect=viewport.current?.getRect();const scale=focusScale(depth);
    const mobile=window.matchMedia("(max-width: 700px)").matches;const x=mobile?(position.mobileX??position.x):position.x;const y=mobile?(position.mobileY??position.y):position.y;
    return rect?{x:(50-x)/100*rect.width*scale,y:(50-y)/100*rect.height*scale,scale}:{x:0,y:0,scale};
  };
  const animateCamera=useCallback((target:SpatialCamera,duration=520)=>{
    if(animationFrame.current!==null)cancelAnimationFrame(animationFrame.current);
    if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){setCamera(target);return}
    const start=cameraRef.current;const began=performance.now();
    const tick=(now:number)=>{const progress=Math.min(1,(now-began)/duration);const value=ease(progress);setCamera({x:start.x+(target.x-start.x)*value,y:start.y+(target.y-start.y)*value,scale:start.scale+(target.scale-start.scale)*value});if(progress<1)animationFrame.current=requestAnimationFrame(tick);else animationFrame.current=null};
    animationFrame.current=requestAnimationFrame(tick);
  },[]);
  useEffect(()=>()=>{if(animationFrame.current!==null)cancelAnimationFrame(animationFrame.current)},[]);

  const resolvePath=useCallback((ids:string[])=>{
    const resolved:FocusEntry[]=[];let options=roots;let parent:Position|null=null;
    for(let depth=0;depth<ids.length;depth+=1){
      const node=options.find(item=>item.id===ids[depth]);if(!node)break;
      const position:Position=depth===0?rootPositions[node.tone]:childPositions(parent!,options.length,depth)[options.indexOf(node)];
      resolved.push({node,position});parent=position;options=node.children??[];
    }
    return resolved;
  },[roots]);
  const writeHistory=(entries:FocusEntry[],nextCamera:SpatialCamera,previous:SpatialCamera|null,mode:"push"|"replace")=>{
    const ids=entries.map(entry=>entry.node.id);const state:AtlasHistoryState={path:ids,camera:nextCamera,previousCameraState:previous};
    const url=ids.length?`#${ids.join("/")}`:window.location.pathname+window.location.search;
    if(mode==="push")window.history.pushState({...window.history.state,llmAtlas:state},"",url);
    else window.history.replaceState({...window.history.state,llmAtlas:state},"",url);
    window.sessionStorage.setItem(STORAGE_KEY,JSON.stringify({...state,hash:ids.join("/")}));
  };
  useEffect(()=>{
    const fromState=(window.history.state as {llmAtlas?:AtlasHistoryState}|null)?.llmAtlas;
    let restored=fromState;
    if(!restored){try{const saved=JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)??"null") as (AtlasHistoryState&{hash?:string})|null;const hash=window.location.hash.slice(1);if(saved&&saved.hash===hash)restored=saved}catch{}}
    const hashIds=window.location.hash.slice(1).split("/").filter(Boolean);
    const entries=resolvePath(restored?.path??hashIds);const restoredCamera=restored?.camera??(entries.length?cameraFor(entries.at(-1)!.position,entries.length):ROOT_CAMERA);
    setPath(entries);setPreviousCameraState(restored?.previousCameraState??null);setCamera(restoredCamera);
    writeHistory(entries,restoredCamera,restored?.previousCameraState??null,"replace");
    const pop=()=>{const state=(window.history.state as {llmAtlas?:AtlasHistoryState}|null)?.llmAtlas;const ids=state?.path??window.location.hash.slice(1).split("/").filter(Boolean);const next=resolvePath(ids);const target=state?.camera??(next.length?cameraFor(next.at(-1)!.position,next.length):ROOT_CAMERA);setPath(next);setPreviousCameraState(state?.previousCameraState??null);animateCamera(target,460)};
    window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop);
  },[resolvePath]);

  const commitCamera=(next:SpatialCamera)=>{setCamera(next);writeHistory(path,next,previousCameraState,"replace")};
  const focusNode=(node:AtlasNode,position:Position,root=false)=>{
    if(node.href&&!node.children?.length){openLeaf(node,`${root?"root":path.length}-${node.id}`);return}
    const next=root?[{node,position}]:[...path,{node,position}];const target=cameraFor(position,next.length);const previous=cameraRef.current;
    setPreviousCameraState(previous);setPath(next);writeHistory(next,target,previous,"push");animateCamera(target,Math.min(640,390+Math.hypot(target.x-previous.x,target.y-previous.y)*.22));
  };
  const openLeaf=(node:AtlasNode,key:string)=>{
    if(!node.href)return;commitCamera(cameraRef.current);setDepartingLeaf(key);
    const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const go=()=>router.push(node.href!);
    if(reduced){go();return}
    requestAnimationFrame(()=>{
      const transition=(document as Document&{startViewTransition?:(callback:()=>Promise<void>)=>unknown}).startViewTransition;
      if(transition)transition.call(document,()=>new Promise<void>(resolve=>{
        const previousPath=window.location.pathname;go();const began=performance.now();
        const wait=()=>{if(window.location.pathname!==previousPath||performance.now()-began>900){requestAnimationFrame(()=>resolve());return}requestAnimationFrame(wait)};requestAnimationFrame(wait);
      }));else go();
    });
  };
  const goBack=()=>{if(path.length)window.history.back()};
  const overview=()=>{
    if(!path.length){animateCamera(ROOT_CAMERA,400);writeHistory([],ROOT_CAMERA,cameraRef.current,"replace");return}
    const previous=cameraRef.current;setPath([]);setPreviousCameraState(previous);writeHistory([],ROOT_CAMERA,previous,"push");animateCamera(ROOT_CAMERA,560);
  };

  const current=path.at(-1);
  const visibleLayers=path.map((entry,index)=>({entry,children:entry.node.children??[],positions:childPositions(entry.position,entry.node.children?.length??0,index+1),layer:index+1}));
  const cityRoads=[
    {kind:"boulevard",d:"M 4 76 C 20 69 34 70 49 72 S 78 69 96 76"},
    {kind:"street",d:"M 8 18 L 25 25 L 29 43 L 47 56 L 65 40 L 82 54 L 92 53"},
    {kind:"street",d:"M 29 43 L 15 59 L 17 78"},
    {kind:"street",d:"M 65 40 L 77 27 L 78 12"},
    {kind:"street",d:"M 65 40 L 79 55 L 84 77"},
    {kind:"lane",d:"M 25 25 L 44 21 L 58 28 L 77 27"},
  ];

  const density=path.length?"focused":camera.scale>1.16?"mid":"overview";
  return <section className="atlasStage knowledgeCity" data-depth={path.length} data-density={density} data-hovering={Boolean(hovered)} aria-label="LLM 지식 도시 지도">
    <header className="atlasChrome">
      <nav aria-label="현재 지도 위치"><button type="button" onClick={overview}>City Map</button>{path.map((entry,index)=><span key={`${entry.node.id}-${index}`}><i>/</i><button type="button" onClick={()=>{const steps=path.length-index-1;if(steps>0)window.history.go(-steps)}} aria-current={index===path.length-1?"page":undefined}>{compact(entry.node.label,14)}</button></span>)}</nav>
      <div><button type="button" onClick={goBack} disabled={!path.length} aria-label="이전 공간">←</button><button type="button" onClick={overview} aria-label="전체 지도">◎</button></div>
    </header>
    <SpatialViewport ref={viewport} camera={camera} onCameraChange={setCamera} onCameraCommit={commitCamera} onEscape={goBack} onOverview={overview}>
      <svg className="cityRoadNetwork" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {cityRoads.map((road,index)=><path key={index} className={road.kind} d={road.d}/>) }
        {visibleLayers.map(({entry,positions,layer})=>positions.map((position,index)=>{const middleX=(entry.position.x+position.x)/2;return <path className="districtLane" key={`${entry.node.id}-${layer}-${index}`} d={`M ${entry.position.x} ${entry.position.y} L ${middleX} ${entry.position.y} L ${middleX} ${position.y} L ${position.x} ${position.y}`} data-layer={layer} data-related={!hovered||hovered.parentKey===entry.node.id}/>}))}
      </svg>
      {roots.map(root=><DistrictPlot node={root} active={path[0]?.node.id===root.id} highlighted={hovered?.key===`root-${root.id}`} dimmed={Boolean(path.length&&path[0]?.node.id!==root.id)} key={`district-${root.id}`}/>) }
      {roots.map(root=>{
        const position=rootPositions[root.tone];const entryIndex=path.findIndex(entry=>entry.node.id===root.id);return <SpatialNode key={root.id} node={root} nodeKey={`root-${root.id}`} parentKey="root" position={{...position,presence:root.presence??position.presence}} depth={0} active={entryIndex===0} ancestor={entryIndex===0&&path.length>1} hovered={hovered} departing={false} onHover={setHovered} onSelect={()=>focusNode(root,position,true)}/>;
      })}
      {!path.length?roots.flatMap(root=>{
        const position=rootPositions[root.tone];const children=root.children??[];const positions=childPositions(position,children.length,1);
        return children.slice(0,2).map((node,index)=><span className={`atlasPreviewNode tone-${root.tone}`} style={{"--node-x":`${positions[index].x}%`,"--node-y":`${positions[index].y}%`} as CSSProperties} key={`preview-${root.id}-${node.id}`} aria-hidden="true"><CityLandmark kind={node.landmark}/><b>{compact(node.label,13)}</b></span>);
      }):null}
      {visibleLayers.map(({entry,children,positions,layer},layerIndex)=>children.map((node,index)=>{
        const key=`${path.slice(0,layerIndex+1).map(item=>item.node.id).join("-")}-${node.id}`;const selected=path[layerIndex+1]?.node.id===node.id;const isCurrentLayer=layerIndex===path.length-1;
        return <SpatialNode key={key} node={node} nodeKey={key} parentKey={entry.node.id} position={{...positions[index],presence:(node.presence??1)*positions[index].presence}} depth={layer} active={selected||isCurrentLayer} ancestor={selected&&layerIndex<path.length-1} hovered={hovered} departing={departingLeaf===key} onHover={setHovered} onSelect={()=>focusNode(node,positions[index])}/>;
      }))}
    </SpatialViewport>
    <aside className="atlasReadout" aria-live="polite"><p>{current?.node.kicker??"LLM KNOWLEDGE CITY"}</p><h2>{current?.node.label??"지식 도시 지도"}</h2><span>{current?.node.summary??"개념 지구와 모델 지구, 타임라인 대로를 이동하며 생성형 AI의 구조를 탐색하세요."}</span></aside>
    <div className="atlasZoomControls" aria-label="지도 확대·축소"><button type="button" onClick={()=>commitCamera({...cameraRef.current,scale:Math.max(.72,cameraRef.current.scale-.18)})} aria-label="축소">−</button><button type="button" onClick={()=>commitCamera({...cameraRef.current,scale:Math.min(2.35,cameraRef.current.scale+.18)})} aria-label="확대">＋</button></div>
  </section>;
}
