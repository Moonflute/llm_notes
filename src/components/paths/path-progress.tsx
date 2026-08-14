"use client";

import Link from "next/link";
import { useState } from "react";
import { KineticRail } from "@/components/motion/kinetic-rail";

type Step={slug:string;title:string;summary:string};

export function PathProgress({pathSlug,steps}:{pathSlug:string;steps:Step[]}){
  const key=`llm-history:path:${pathSlug}`;
  const [done,setDone]=useState<string[]>(()=>{
    if(typeof window==="undefined")return [];
    try{const saved=JSON.parse(window.localStorage.getItem(key)??"[]");return Array.isArray(saved)?saved.filter((id):id is string=>typeof id==="string"):[]}catch{return []}
  });
  const toggle=(slug:string)=>setDone(current=>{
    const next=current.includes(slug)?current.filter(id=>id!==slug):[...current,slug];
    window.localStorage.setItem(key,JSON.stringify(next));
    return next;
  });
  const percent=steps.length?Math.round(done.length/steps.length*100):0;

  return <section className="learningJourney">
    <div className="learningJourneyHead"><div><p className="sectionLabel">YOUR PROGRESS</p><h2>학습 경로</h2></div><p aria-live="polite"><b>{done.length}</b> / {steps.length}<span>{percent}% 완료</span></p></div>
    <div className="journeyProgress" aria-hidden="true"><i style={{width:`${percent}%`}}/></div>
    <KineticRail label="학습 단계 탐색" itemLabel="학습 단계" className="learningPathRail">
      {steps.map((step,index)=>{
        const complete=done.includes(step.slug);
        return <article className="learningStep" data-complete={complete} key={step.slug}>
          <span>{String(index+1).padStart(2,"0")}</span>
          <h3>{step.title}</h3>
          <p>{step.summary}</p>
          <div><button type="button" aria-pressed={complete} onClick={()=>toggle(step.slug)}>{complete?"완료됨":"완료 표시"}</button><Link href={`/concepts/${step.slug}/`}>학습 문서 열기 →</Link></div>
        </article>;
      })}
    </KineticRail>
    <small>진행 상태는 기존과 동일하게 이 브라우저에만 저장됩니다.</small>
  </section>;
}
