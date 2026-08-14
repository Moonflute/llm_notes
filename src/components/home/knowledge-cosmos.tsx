"use client";

import {useRouter} from "next/navigation";
import {useCallback,useEffect,useMemo,useRef,useState,type CSSProperties} from "react";
import {SpatialViewport,type SpatialCamera,type SpatialViewportHandle} from "@/components/home/spatial-viewport";
import {conceptClusters} from "@/lib/concept-taxonomy";
import {conceptDocuments,frontierDocuments,issueDocuments,modelFamilies,modelReleases,organizationDocuments} from "@/lib/content";

type Tone="models"|"concepts"|"organizations"|"history"|"issues"|"frontiers";
type Position={x:number;y:number;presence:number;mobileX?:number;mobileY?:number};
type AtlasNode={id:string;label:string;kicker:string;summary:string;tone:Tone;href?:string;children?:AtlasNode[];presence?:number};
type FocusEntry={node:AtlasNode;position:Position};
type AtlasHistoryState={path:string[];camera:SpatialCamera;previousCameraState:SpatialCamera|null};
type HoverState={key:string;parentKey:string}|null;

const ROOT_CAMERA:SpatialCamera={x:0,y:0,scale:1};
const STORAGE_KEY="llm-history:home-atlas";
const preferredModels=["gpt","gemini","claude","llama","deepseek","mistral","qwen","gemma"];
const preferredOrganizations=["openai","google-deepmind","anthropic","meta","mistral-ai","deepseek","alibaba-cloud","ai2"];
const rootPositions:Record<Tone,Position>={
  concepts:{x:31,y:51,mobileX:25,mobileY:50,presence:1.34},models:{x:66,y:42,mobileX:73,mobileY:41,presence:1.3},history:{x:53,y:73,mobileX:42,mobileY:72,presence:1.16},
  organizations:{x:79,y:66,mobileX:76,mobileY:65,presence:.88},issues:{x:19,y:31,mobileX:18,mobileY:27,presence:.84},frontiers:{x:66,y:20,mobileX:68,mobileY:18,presence:.93},
};

const historyNodes:AtlasNode[]=[
  {id:"foundations",label:"기반 연구",kicker:"2017—2019",summary:"Transformer와 사전학습이 언어 모델의 기본 구조를 만든 시기",href:"/timeline/?from=2017-01&to=2019-12",tone:"history"},
  {id:"scaling",label:"스케일링",kicker:"2020—2021",summary:"규모·데이터·연산량의 관계가 개발의 중심축이 된 시기",href:"/timeline/?from=2020-01&to=2021-12",tone:"history"},
  {id:"chat",label:"대화형 AI",kicker:"2022",summary:"지시학습과 RLHF가 대화형 제품으로 이어진 시기",href:"/timeline/?from=2022-01&to=2022-12",tone:"history"},
  {id:"multimodal-era",label:"멀티모달",kicker:"2023—2024",summary:"텍스트·이미지·음성을 함께 다루는 모델이 확산된 시기",href:"/timeline/?from=2023-01&to=2024-12",tone:"history"},
  {id:"reasoning-era",label:"추론과 에이전트",kicker:"2024—현재",summary:"추론·도구 사용·자율 실행이 새로운 경쟁축이 된 시기",href:"/timeline/?from=2024-01&to=2026-12",tone:"history"},
  {id:"timeline-all",label:"전체 타임라인",kicker:"2017—2026",summary:"연구와 제품, 모델의 전체 계보",href:"/timeline/",tone:"history"},
];

function compact(value:string,limit=22){return value.length>limit?`${value.slice(0,limit).trim()}…`:value}
function childPositions(parent:Position,count:number,depth:number):Position[]{
  const radiusX=depth===1?17:10.5;const radiusY=depth===1?14:8.7;const offset=depth===1?-2.35:-1.72;
  return Array.from({length:count},(_,index)=>{
    const angle=offset+index*2.399963229728653;const pulse=1+(index%3)*.12;
    const mobileRadiusX=depth===1?27:19;const mobileRadiusY=depth===1?13:9.5;
    return {x:parent.x+Math.cos(angle)*radiusX*pulse,y:parent.y+Math.sin(angle)*radiusY*(1+(index%2)*.1),mobileX:(parent.mobileX??parent.x)+Math.cos(angle)*mobileRadiusX*pulse,mobileY:(parent.mobileY??parent.y)+Math.sin(angle)*mobileRadiusY*(1+(index%2)*.1),presence:depth===1?1:.88};
  });
}
function focusScale(depth:number){return depth===1?1.46:Math.min(2.2,1.72+(depth-1)*.32)}
function ease(value:number){return 1-Math.pow(1-value,4)}

function SpatialNode({node,nodeKey,parentKey,position,depth,active,ancestor,hovered,departing,onHover,onSelect}:{node:AtlasNode;nodeKey:string;parentKey:string;position:Position;depth:number;active:boolean;ancestor:boolean;hovered:HoverState;departing:boolean;onHover:(state:HoverState)=>void;onSelect:()=>void}){
  const related=!hovered||hovered.key===nodeKey||hovered.parentKey===parentKey;
  const style={"--node-x":`${position.x}%`,"--node-y":`${position.y}%`,"--node-mobile-x":`${position.mobileX??position.x}%`,"--node-mobile-y":`${position.mobileY??position.y}%`,"--presence":position.presence,viewTransitionName:departing?(node.href?.startsWith("/concepts/")?"concept-title":node.href?.startsWith("/models/")?"model-title":"atlas-leaf"):undefined} as CSSProperties;
  return <button type="button" className={`spatialNode tone-${node.tone}`} style={style} data-spatial-node data-depth={depth} data-active={active} data-ancestor={ancestor} data-related={related} onPointerEnter={()=>onHover({key:nodeKey,parentKey})} onPointerLeave={()=>onHover(null)} onFocus={()=>onHover({key:nodeKey,parentKey})} onBlur={()=>onHover(null)} onClick={onSelect} title={node.summary}>
    <i aria-hidden="true"/><span><small>{node.kicker}</small><b>{compact(node.label)}</b></span>
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
    const concepts:AtlasNode[]=conceptClusters.map(cluster=>({
      id:cluster.id,label:cluster.titleKo,kicker:cluster.label,summary:cluster.description,tone:"concepts",presence:cluster.id==="architecture"?1.12:1,
      children:cluster.conceptIds.flatMap(id=>{const item=conceptDocuments.find(concept=>concept.slug===id);return item?[{id:item.slug,label:item.titleKo,kicker:item.level,summary:item.summary,tone:"concepts" as const,href:`/concepts/${item.slug}/`}]:[]}),
    }));
    const models:AtlasNode[]=preferredModels.flatMap(slug=>{
      const family=modelFamilies.find(item=>item.slug===slug);if(!family)return [];
      const releases=modelReleases.filter(item=>item.familySlug===slug).sort((a,b)=>a.date.localeCompare(b.date));
      return [{id:family.slug,label:family.titleKo,kicker:`${releases.length} RELEASES`,summary:family.summary,tone:"models" as const,presence:slug==="gpt"?1.14:1,children:releases.map(release=>({id:release.slug,label:release.title,kicker:release.date,summary:release.summary,tone:"models" as const,href:`/models/${family.slug}/${release.slug}/`}))}];
    });
    const organizations:AtlasNode[]=preferredOrganizations.flatMap(slug=>{const item=organizationDocuments.find(entry=>entry.slug===slug);return item?[{id:item.slug,label:item.titleKo,kicker:item.founded,summary:item.summary,tone:"organizations" as const,href:`/organizations/${item.slug}/`}]:[]});
    return [
      {id:"concepts",label:"용어·개념",kicker:"CONCEPTS",summary:"기초 표현에서 추론·에이전트까지 이어지는 기술 구조",tone:"concepts",presence:1.34,children:concepts},
      {id:"models",label:"모델",kicker:"MODEL FAMILIES",summary:"주요 모델 계열과 세대별 릴리스",tone:"models",presence:1.3,children:models},
      {id:"history",label:"역사",kicker:"TIMELINE",summary:"연구와 제품이 이어진 시간의 흐름",tone:"history",presence:1.16,children:historyNodes},
      {id:"organizations",label:"회사·연구소",kicker:"ORGANIZATIONS",summary:"모델과 연구 흐름을 만든 조직",tone:"organizations",presence:.88,children:organizations},
      {id:"issues",label:"이슈·논쟁",kicker:"ISSUES",summary:"환각·저작권·평가·안전을 둘러싼 질문",tone:"issues",presence:.84,children:issueDocuments.slice(0,9).map(item=>({id:item.slug,label:item.titleKo,kicker:"ISSUE",summary:item.summary,tone:"issues",href:`/issues/${item.slug}/`}))},
      {id:"frontiers",label:"프런티어",kicker:"FRONTIERS",summary:"에이전트·월드 모델·AGI로 이어지는 연구 경계",tone:"frontiers",presence:.93,children:frontierDocuments.map(item=>({id:item.slug,label:item.titleKo,kicker:"FRONTIER",summary:item.summary,tone:"frontiers",href:`/frontiers/${item.slug}/`}))},
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
  const rootLines:[[Tone,Tone],string][]=[[["concepts","models"],"M 31 51 Q 49 31 66 42"],[["concepts","history"],"M 31 51 Q 35 72 53 73"],[["models","history"],"M 66 42 Q 70 64 53 73"],[["models","organizations"],"M 66 42 Q 82 45 79 66"],[["concepts","issues"],"M 31 51 Q 15 49 19 31"],[["models","frontiers"],"M 66 42 Q 61 30 66 20"]];

  const density=path.length?"focused":camera.scale>1.16?"mid":"overview";
  return <section className="atlasStage" data-depth={path.length} data-density={density} data-hovering={Boolean(hovered)} aria-label="LLM 지식 지도">
    <header className="atlasChrome">
      <nav aria-label="현재 지도 위치"><button type="button" onClick={overview}>Atlas</button>{path.map((entry,index)=><span key={`${entry.node.id}-${index}`}><i>/</i><button type="button" onClick={()=>{const steps=path.length-index-1;if(steps>0)window.history.go(-steps)}} aria-current={index===path.length-1?"page":undefined}>{compact(entry.node.label,14)}</button></span>)}</nav>
      <div><button type="button" onClick={goBack} disabled={!path.length} aria-label="이전 공간">←</button><button type="button" onClick={overview} aria-label="전체 지도">◎</button></div>
    </header>
    <SpatialViewport ref={viewport} camera={camera} onCameraChange={setCamera} onCameraCommit={commitCamera} onEscape={goBack} onOverview={overview}>
      <svg className="atlasRelations" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {rootLines.map(([[from,to],d])=><path key={`${from}-${to}`} d={d} data-related={!hovered||hovered.key===`root-${from}`||hovered.key===`root-${to}`}/>) }
        {visibleLayers.map(({entry,positions,layer})=>positions.map((position,index)=><path className="clusterRelation" key={`${entry.node.id}-${layer}-${index}`} d={`M ${entry.position.x} ${entry.position.y} Q ${(entry.position.x+position.x)/2+(index%2?1.3:-1.3)} ${(entry.position.y+position.y)/2} ${position.x} ${position.y}`} data-layer={layer} data-related={!hovered||hovered.parentKey===entry.node.id}/>))}
      </svg>
      <div className="atlasOrigin" aria-hidden="true"><small>GENERATIVE AI</small><b>LLM</b></div>
      {roots.map(root=>{
        const position=rootPositions[root.tone];const entryIndex=path.findIndex(entry=>entry.node.id===root.id);return <SpatialNode key={root.id} node={root} nodeKey={`root-${root.id}`} parentKey="root" position={{...position,presence:root.presence??position.presence}} depth={0} active={entryIndex===0} ancestor={entryIndex===0&&path.length>1} hovered={hovered} departing={false} onHover={setHovered} onSelect={()=>focusNode(root,position,true)}/>;
      })}
      {!path.length?roots.flatMap(root=>{
        const position=rootPositions[root.tone];const children=root.children??[];const positions=childPositions(position,children.length,1);
        return children.slice(0,2).map((node,index)=><span className={`atlasPreviewNode tone-${root.tone}`} style={{"--node-x":`${positions[index].x}%`,"--node-y":`${positions[index].y}%`} as CSSProperties} key={`preview-${root.id}-${node.id}`} aria-hidden="true">{compact(node.label,13)}</span>);
      }):null}
      {visibleLayers.map(({entry,children,positions,layer},layerIndex)=>children.map((node,index)=>{
        const key=`${path.slice(0,layerIndex+1).map(item=>item.node.id).join("-")}-${node.id}`;const selected=path[layerIndex+1]?.node.id===node.id;const isCurrentLayer=layerIndex===path.length-1;
        return <SpatialNode key={key} node={node} nodeKey={key} parentKey={entry.node.id} position={{...positions[index],presence:(node.presence??1)*positions[index].presence}} depth={layer} active={selected||isCurrentLayer} ancestor={selected&&layerIndex<path.length-1} hovered={hovered} departing={departingLeaf===key} onHover={setHovered} onSelect={()=>focusNode(node,positions[index])}/>;
      }))}
    </SpatialViewport>
    <aside className="atlasReadout" aria-live="polite"><p>{current?.node.kicker??"AN ATLAS OF GENERATIVE AI"}</p><h2>{current?.node.label??"LLM 지식 지도"}</h2><span>{current?.node.summary??"모델·개념·역사와 논쟁 사이를 직접 이동하며 탐색하세요."}</span></aside>
    <div className="atlasZoomControls" aria-label="지도 확대·축소"><button type="button" onClick={()=>commitCamera({...cameraRef.current,scale:Math.max(.72,cameraRef.current.scale-.18)})} aria-label="축소">−</button><button type="button" onClick={()=>commitCamera({...cameraRef.current,scale:Math.min(2.35,cameraRef.current.scale+.18)})} aria-label="확대">＋</button></div>
  </section>;
}
