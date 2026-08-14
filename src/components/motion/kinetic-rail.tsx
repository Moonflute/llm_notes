"use client";

import { Children, useEffect, useRef, useState, type PointerEvent, type ReactNode, type WheelEvent } from "react";

type DragState = { pointerId: number; startX: number; startScroll: number; lastX: number; lastTime: number; velocity: number; moved: boolean };

export function KineticRail({children,label,itemLabel="항목",className=""}:{children:ReactNode;label:string;itemLabel?:string;className?:string}){
  const items=Children.toArray(children);
  const viewport=useRef<HTMLDivElement>(null);
  const drag=useRef<DragState|null>(null);
  const frame=useRef<number|null>(null);
  const snapTimer=useRef<number|null>(null);
  const suppressClick=useRef(false);
  const [active,setActive]=useState(0);

  const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const itemElements=()=>viewport.current?[...viewport.current.querySelectorAll<HTMLElement>("[data-kinetic-item]")]:[];
  const nearestIndex=()=>{
    const view=viewport.current;if(!view)return 0;
    const center=view.scrollLeft+view.clientWidth/2;
    return itemElements().reduce((best,item,index)=>Math.abs(item.offsetLeft+item.offsetWidth/2-center)<Math.abs(itemElements()[best].offsetLeft+itemElements()[best].offsetWidth/2-center)?index:best,0);
  };
  const goTo=(index:number,behavior:ScrollBehavior=reducedMotion()?"auto":"smooth")=>{
    const view=viewport.current;const item=itemElements()[Math.max(0,Math.min(items.length-1,index))];if(!view||!item)return;
    view.scrollTo({left:item.offsetLeft-(view.clientWidth-item.offsetWidth)/2,behavior});
    setActive(Math.max(0,Math.min(items.length-1,index)));
  };
  const snap=()=>goTo(nearestIndex());

  useEffect(()=>()=>{if(frame.current!==null)cancelAnimationFrame(frame.current);if(snapTimer.current!==null)window.clearTimeout(snapTimer.current)},[]);
  const begin=(event:PointerEvent<HTMLDivElement>)=>{
    if(event.button!==0)return;
    if(frame.current!==null)cancelAnimationFrame(frame.current);
    const view=viewport.current;if(!view)return;
    suppressClick.current=false;
    drag.current={pointerId:event.pointerId,startX:event.clientX,startScroll:view.scrollLeft,lastX:event.clientX,lastTime:performance.now(),velocity:0,moved:false};
    event.currentTarget.setPointerCapture(event.pointerId);
  };
  const move=(event:PointerEvent<HTMLDivElement>)=>{
    const state=drag.current;const view=viewport.current;if(!state||!view||state.pointerId!==event.pointerId)return;
    const now=performance.now();const elapsed=Math.max(1,now-state.lastTime);
    if(Math.abs(event.clientX-state.startX)>5)state.moved=true;
    state.velocity=(state.lastX-event.clientX)/elapsed*16;
    state.lastX=event.clientX;state.lastTime=now;
    view.scrollLeft=state.startScroll+(state.startX-event.clientX);
  };
  const end=(event:PointerEvent<HTMLDivElement>)=>{
    const state=drag.current;const view=viewport.current;if(!state||!view||state.pointerId!==event.pointerId)return;
    drag.current=null;suppressClick.current=state.moved;if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    if(reducedMotion()){snap();return}
    let velocity=state.velocity;
    const coast=()=>{
      if(!viewport.current)return;
      velocity*=.91;viewport.current.scrollLeft+=velocity;
      if(Math.abs(velocity)<.35){frame.current=null;snap();return}
      frame.current=requestAnimationFrame(coast);
    };
    frame.current=requestAnimationFrame(coast);
  };
  const wheel=(event:WheelEvent<HTMLDivElement>)=>{
    const view=viewport.current;if(!view)return;
    const delta=Math.abs(event.deltaX)>Math.abs(event.deltaY)?event.deltaX:event.deltaY;
    if(!delta)return;
    event.preventDefault();view.focus({preventScroll:true});view.scrollLeft+=delta;setActive(nearestIndex());
    if(snapTimer.current!==null)window.clearTimeout(snapTimer.current);
    snapTimer.current=window.setTimeout(()=>{snap();snapTimer.current=null},120);
  };

  return <section className={`kineticRail ${className}`} aria-label={label} data-active-index={active}>
    <div className="kineticRailHead"><p><b>{String(active+1).padStart(2,"0")}</b><span>/ {String(items.length).padStart(2,"0")}</span></p><div><button type="button" onClick={()=>goTo(active-1)} disabled={active===0} aria-label={`이전 ${itemLabel}`}>←</button><button type="button" onClick={()=>goTo(active+1)} disabled={active===items.length-1} aria-label={`다음 ${itemLabel}`}>→</button></div></div>
    <div ref={viewport} className="kineticRailViewport" tabIndex={0} onPointerDown={begin} onPointerMove={move} onPointerUp={end} onPointerCancel={end} onWheel={wheel} onScroll={()=>{if(!drag.current)setActive(nearestIndex())}} onClickCapture={event=>{if(suppressClick.current){event.preventDefault();event.stopPropagation();suppressClick.current=false}}} onKeyDown={event=>{if(event.key==="ArrowLeft"){event.preventDefault();goTo(active-1)}if(event.key==="ArrowRight"){event.preventDefault();goTo(active+1)}}}>
      <div className="kineticRailTrack">{items.map((child,index)=><div className="kineticRailItem" data-kinetic-item data-active={active===index} key={index}>{child}</div>)}</div>
    </div>
  </section>;
}
