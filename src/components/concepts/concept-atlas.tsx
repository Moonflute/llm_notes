"use client";

import Link from "next/link";
import {useMemo,useState} from "react";
import {KineticRail} from "@/components/motion/kinetic-rail";
import {conceptClusters} from "@/lib/concept-taxonomy";

type Concept={slug:string;titleKo:string;titleEn:string;summary:string;level:string;contentDepth:"full"|"stub";guideMinutes?:number;objectives?:number;resources?:number};

export function ConceptAtlas({concepts}:{concepts:Concept[]}){
  const [clusterId,setClusterId]=useState(conceptClusters[0].id);
  const cluster=conceptClusters.find(item=>item.id===clusterId)??conceptClusters[0];
  const items=useMemo(()=>cluster.conceptIds.flatMap(id=>{const concept=concepts.find(item=>item.slug===id);return concept?[concept]:[]}),[cluster,concepts]);
  return <section className="conceptAtlas" aria-label="개념 영역 탐색">
    <div className="conceptClusterNav" role="tablist" aria-label="개념 영역">{conceptClusters.map(item=><button type="button" role="tab" aria-selected={item.id===cluster.id} onClick={()=>setClusterId(item.id)} key={item.id}><span>{item.label}</span><b>{item.titleKo}</b></button>)}</div>
    <div className="conceptClusterIntro"><p>{cluster.label}</p><h2>{cluster.titleKo}</h2><span>{cluster.description}</span></div>
    <KineticRail key={cluster.id} label={`${cluster.titleKo} 개념 탐색`} itemLabel="개념" className="conceptRail">
      {items.map(concept=><Link className="conceptSlide" href={`/concepts/${concept.slug}/`} key={concept.slug}>
        <span>{concept.contentDepth==="full"?`FULL STUDY GUIDE · ${concept.guideMinutes}분`:concept.level+" · INDEX"}</span>
        <h3>{concept.titleKo}</h3><p className="en">{concept.titleEn}</p><p>{concept.summary}</p>
        <small>{concept.contentDepth==="full"?`학습 목표 ${concept.objectives} · 참고자료 ${concept.resources}`:"학습 문서 확장 예정"} →</small>
      </Link>)}
    </KineticRail>
  </section>;
}
