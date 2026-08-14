"use client";

import {forwardRef,useEffect,useImperativeHandle,useRef,type CSSProperties,type KeyboardEvent,type PointerEvent,type ReactNode,type WheelEvent} from "react";

export type SpatialCamera={x:number;y:number;scale:number};
export type SpatialViewportHandle={getRect:()=>DOMRect|null;focus:()=>void};

type DragState={pointerId:number;startX:number;startY:number;origin:SpatialCamera;lastX:number;lastY:number;lastTime:number;velocityX:number;velocityY:number};
type PinchState={distance:number;camera:SpatialCamera;midX:number;midY:number};

const MIN_SCALE=.72;
const MAX_SCALE=2.35;
const clampScale=(value:number)=>Math.max(MIN_SCALE,Math.min(MAX_SCALE,value));
const softLimit=(value:number,limit:number)=>Math.abs(value)<=limit?value:Math.sign(value)*(limit+(Math.abs(value)-limit)*.18);

export const SpatialViewport=forwardRef<SpatialViewportHandle,{
  camera:SpatialCamera;
  onCameraChange:(camera:SpatialCamera)=>void;
  onCameraCommit:(camera:SpatialCamera)=>void;
  onEscape:()=>void;
  onOverview:()=>void;
  children:ReactNode;
}>(({camera,onCameraChange,onCameraCommit,onEscape,onOverview,children},ref)=>{
  const viewport=useRef<HTMLDivElement>(null);
  const cameraRef=useRef(camera);
  const drag=useRef<DragState|null>(null);
  const pointers=useRef(new Map<number,{x:number;y:number}>());
  const pinch=useRef<PinchState|null>(null);
  const inertiaFrame=useRef<number|null>(null);
  const wheelTimer=useRef<number|null>(null);

  useEffect(()=>{cameraRef.current=camera},[camera]);
  useEffect(()=>()=>{
    if(inertiaFrame.current!==null)cancelAnimationFrame(inertiaFrame.current);
    if(wheelTimer.current!==null)window.clearTimeout(wheelTimer.current);
  },[]);
  useImperativeHandle(ref,()=>({getRect:()=>viewport.current?.getBoundingClientRect()??null,focus:()=>viewport.current?.focus({preventScroll:true})}),[]);

  const reduced=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const bounds=()=>{
    const rect=viewport.current?.getBoundingClientRect();
    return {x:(rect?.width??1000)*.68*cameraRef.current.scale,y:(rect?.height??700)*.62*cameraRef.current.scale};
  };
  const update=(next:SpatialCamera,resist=false)=>{
    const limit=bounds();
    const bounded={x:resist?softLimit(next.x,limit.x):Math.max(-limit.x,Math.min(limit.x,next.x)),y:resist?softLimit(next.y,limit.y):Math.max(-limit.y,Math.min(limit.y,next.y)),scale:clampScale(next.scale)};
    cameraRef.current=bounded;onCameraChange(bounded);return bounded;
  };
  const zoomAt=(nextScale:number,clientX:number,clientY:number)=>{
    const rect=viewport.current?.getBoundingClientRect();if(!rect)return cameraRef.current;
    const current=cameraRef.current;const scale=clampScale(nextScale);const ratio=scale/current.scale;
    const localX=clientX-(rect.left+rect.width/2);const localY=clientY-(rect.top+rect.height/2);
    return update({x:localX-ratio*(localX-current.x),y:localY-ratio*(localY-current.y),scale});
  };
  const stopInertia=()=>{if(inertiaFrame.current!==null)cancelAnimationFrame(inertiaFrame.current);inertiaFrame.current=null};

  const pointerDown=(event:PointerEvent<HTMLDivElement>)=>{
    if(event.button!==0)return;
    const target=event.target as Element;
    if(target.closest("[data-spatial-node],a,button"))return;
    stopInertia();viewport.current?.focus({preventScroll:true});
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    event.currentTarget.setPointerCapture(event.pointerId);
    if(pointers.current.size===2){
      const pair=[...pointers.current.values()];
      pinch.current={distance:Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y),camera:cameraRef.current,midX:(pair[0].x+pair[1].x)/2,midY:(pair[0].y+pair[1].y)/2};drag.current=null;return;
    }
    drag.current={pointerId:event.pointerId,startX:event.clientX,startY:event.clientY,origin:cameraRef.current,lastX:event.clientX,lastY:event.clientY,lastTime:performance.now(),velocityX:0,velocityY:0};
  };
  const pointerMove=(event:PointerEvent<HTMLDivElement>)=>{
    if(!pointers.current.has(event.pointerId))return;
    pointers.current.set(event.pointerId,{x:event.clientX,y:event.clientY});
    if(pointers.current.size===2&&pinch.current){
      const pair=[...pointers.current.values()];const distance=Math.max(20,Math.hypot(pair[0].x-pair[1].x,pair[0].y-pair[1].y));
      const midpoint={x:(pair[0].x+pair[1].x)/2,y:(pair[0].y+pair[1].y)/2};
      cameraRef.current=pinch.current.camera;
      const zoomed=zoomAt(pinch.current.camera.scale*distance/pinch.current.distance,pinch.current.midX,pinch.current.midY);
      update({...zoomed,x:zoomed.x+midpoint.x-pinch.current.midX,y:zoomed.y+midpoint.y-pinch.current.midY},true);return;
    }
    const state=drag.current;if(!state||state.pointerId!==event.pointerId)return;
    const now=performance.now();const elapsed=Math.max(1,now-state.lastTime);
    state.velocityX=(event.clientX-state.lastX)/elapsed*16;state.velocityY=(event.clientY-state.lastY)/elapsed*16;
    state.lastX=event.clientX;state.lastY=event.clientY;state.lastTime=now;
    update({...state.origin,x:state.origin.x+event.clientX-state.startX,y:state.origin.y+event.clientY-state.startY},true);
  };
  const pointerEnd=(event:PointerEvent<HTMLDivElement>)=>{
    pointers.current.delete(event.pointerId);
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
    if(pinch.current){
      if(pointers.current.size<2){pinch.current=null;drag.current=null;onCameraCommit(cameraRef.current)}
      return;
    }
    const state=drag.current;if(!state||state.pointerId!==event.pointerId)return;drag.current=null;
    let vx=state.velocityX,vy=state.velocityY;
    if(reduced()||Math.hypot(vx,vy)<1.15){onCameraCommit(cameraRef.current);return}
    const coast=()=>{
      vx*=.88;vy*=.88;
      if(Math.hypot(vx,vy)<.32){inertiaFrame.current=null;onCameraCommit(cameraRef.current);return}
      update({...cameraRef.current,x:cameraRef.current.x+vx,y:cameraRef.current.y+vy});
      inertiaFrame.current=requestAnimationFrame(coast);
    };
    inertiaFrame.current=requestAnimationFrame(coast);
  };
  const wheel=(event:WheelEvent<HTMLDivElement>)=>{
    event.preventDefault();stopInertia();
    const intensity=event.ctrlKey?.0022:.00135;
    zoomAt(cameraRef.current.scale*Math.exp(-event.deltaY*intensity),event.clientX,event.clientY);
    if(wheelTimer.current!==null)window.clearTimeout(wheelTimer.current);
    wheelTimer.current=window.setTimeout(()=>{onCameraCommit(cameraRef.current);wheelTimer.current=null},140);
  };
  const keyboard=(event:KeyboardEvent<HTMLDivElement>)=>{
    const step=event.shiftKey?90:44;let next:SpatialCamera|undefined;
    if(event.key==="ArrowLeft")next={...cameraRef.current,x:cameraRef.current.x+step};
    if(event.key==="ArrowRight")next={...cameraRef.current,x:cameraRef.current.x-step};
    if(event.key==="ArrowUp")next={...cameraRef.current,y:cameraRef.current.y+step};
    if(event.key==="ArrowDown")next={...cameraRef.current,y:cameraRef.current.y-step};
    if(event.key==="+"||event.key==="=")next={...cameraRef.current,scale:cameraRef.current.scale+.12};
    if(event.key==="-")next={...cameraRef.current,scale:cameraRef.current.scale-.12};
    if(event.key==="Home"){event.preventDefault();onOverview();return}
    if(event.key==="Escape"){event.preventDefault();onEscape();return}
    if(next){event.preventDefault();onCameraCommit(update(next))}
  };
  const worldStyle={"--camera-x":`${camera.x}px`,"--camera-y":`${camera.y}px`,"--camera-scale":camera.scale} as CSSProperties;
  return <div ref={viewport} className="spatialViewport" tabIndex={0} aria-label="LLM 지식 공간. 빈 공간을 끌어 이동하고 휠로 확대하거나 축소할 수 있습니다." onPointerDown={pointerDown} onPointerMove={pointerMove} onPointerUp={pointerEnd} onPointerCancel={pointerEnd} onWheel={wheel} onKeyDown={keyboard}>
    <div className="spatialWorld" style={worldStyle}>{children}</div>
  </div>;
});
SpatialViewport.displayName="SpatialViewport";
