"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {useEffect,useState} from "react";
import type {CityNode} from "@/components/home/knowledge-city-types";

function CategoryFallback({data,status}:{data:CityNode[];status:"loading"|"unsupported"}){
  return <section className="cityFallback" aria-label="LLM 지식 탐색">
    <header><p>AN ATLAS OF GENERATIVE AI</p><h1>LLM Knowledge City</h1><span>{status==="loading"?"3D 지식 도시를 준비하고 있습니다.":"이 환경에서는 3D 지도를 사용할 수 없습니다. 아래 탐색 메뉴를 이용하세요."}</span></header>
    <nav aria-label="주요 지식 영역">{data.map(node=><Link key={node.id} href={node.id==="history"?"/timeline/":`/${node.id}/`}><small>{node.kicker}</small><b>{node.label}</b></Link>)}</nav>
    {status==="loading"?<i className="cityLoadingLine" aria-hidden="true"/>:null}
  </section>;
}

const KnowledgeCityCanvas=dynamic(()=>import("@/components/home/knowledge-city-canvas"),{ssr:false,loading:()=>null});

export function KnowledgeCityShell({data}:{data:CityNode[]}){
  const [webgl,setWebgl]=useState<boolean|null>(null);const [sceneReady,setSceneReady]=useState(false);
  useEffect(()=>{try{const canvas=document.createElement("canvas");const supported=Boolean(canvas.getContext("webgl2")||canvas.getContext("webgl"));setWebgl(supported)}catch{setWebgl(false)}},[]);
  if(webgl!==true)return <CategoryFallback data={data} status={webgl===false?"unsupported":"loading"}/>;
  return <div className="cityDynamicMount">{sceneReady?null:<CategoryFallback data={data} status="loading"/>}<KnowledgeCityCanvas data={data} onReady={()=>setSceneReady(true)}/></div>;
}
