"use client";

import {CameraControls,ContactShadows,Html} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {useRouter} from "next/navigation";
import {useCallback,useEffect,useMemo,useRef,useState,type RefObject} from "react";
import type CameraControlsImpl from "camera-controls";
import {BoxGeometry,MeshStandardMaterial,Vector3,type Vector3Tuple} from "three";
import {KnowledgeBuilding} from "@/components/home/knowledge-building";
import type {CameraSnapshot,CityHistoryState,CityNode,CityTone} from "@/components/home/knowledge-city-types";

const STORAGE_KEY="llm-history:knowledge-city-3d";
const DEFAULT_CAMERA:CameraSnapshot={position:[17,17,21],target:[0,.8,0]};
const ROOT_POSITIONS:Record<CityTone,Vector3Tuple>={concepts:[-6.7,0,-2.1],models:[6.1,0,-1.6],history:[0,0,5.8],organizations:[7.5,0,5.3],issues:[-7.2,0,5.1],frontiers:[2.1,0,-7.1]};
const BOX=new BoxGeometry(1,1,1);
const groundMaterial=new MeshStandardMaterial({color:"#eeece4",roughness:1,metalness:0});
const roadMaterial=new MeshStandardMaterial({color:"#c9c7bf",roughness:1,metalness:0});
const railMaterial=new MeshStandardMaterial({color:"#6f746f",roughness:.86,metalness:.05});

type PositionedNode={node:CityNode;position:Vector3Tuple;depth:number;key:string};

function childPositions(parent:Vector3Tuple,count:number,depth:number):Vector3Tuple[]{
  const near:[number,number][]=[[-3.7,-2.9],[0,-3.5],[3.7,-2.6],[-4,.5],[0,.2],[4,.8],[-2.8,3.6],[2.4,3.5],[5,3.4],[-5,3.2]];
  const close:[number,number][]=[[-2.5,-2],[-.3,-2.5],[2.1,-1.9],[-2.8,.3],[-.4,.1],[2.4,.5],[-1.9,2.5],[.6,2.7],[3,2.4],[-3.2,2.8]];
  const grid=depth===1?near:close;
  return Array.from({length:count},(_,index)=>{const [x,z]=grid[index%grid.length];const cycle=Math.floor(index/grid.length);return [parent[0]+x+cycle*.45,0,parent[2]+z+cycle*.45];});
}
function cameraFor(position:Vector3Tuple,depth:number):CameraSnapshot{
  if(depth===0)return DEFAULT_CAMERA;
  const offset=depth===1?[8.2,8.1,9.4]:[5.3,5.6,6.4];
  return {position:[position[0]+offset[0],position[1]+offset[1],position[2]+offset[2]],target:[position[0],position[1]+.9,position[2]]};
}
function compact(value:string,limit=24){return value.length>limit?`${value.slice(0,limit).trim()}…`:value}

function resolvePath(data:CityNode[],ids:string[]){
  const entries:PositionedNode[]=[];let options=data;let parent:Vector3Tuple|null=null;
  ids.forEach((id,depth)=>{const index=options.findIndex(node=>node.id===id);if(index<0)return;const node=options[index];const position=depth===0?ROOT_POSITIONS[node.tone]:childPositions(parent!,options.length,depth)[index];entries.push({node,position,depth,key:ids.slice(0,depth+1).join("/")});parent=position;options=node.children??[];});
  return entries;
}

function CityGround(){
  return <group dispose={null}>
    <mesh geometry={BOX} position={[0,-.25,0]} scale={[29,.42,24]} material={groundMaterial}/>
    <mesh geometry={BOX} position={[0,.015,5.8]} scale={[27,.035,1.45]} material={roadMaterial}/>
    <mesh geometry={BOX} position={[-1.2,.02,.1]} rotation={[0,.35,0]} scale={[1.05,.045,22]} material={roadMaterial}/>
    <mesh geometry={BOX} position={[5,.025,1.4]} rotation={[0,-.58,0]} scale={[.7,.05,16]} material={roadMaterial}/>
    <mesh geometry={BOX} position={[-5.2,.025,1.2]} rotation={[0,.7,0]} scale={[.62,.05,14]} material={roadMaterial}/>
    <mesh geometry={BOX} position={[0,.07,5.45]} scale={[25,.06,.055]} material={railMaterial}/>
    <mesh geometry={BOX} position={[0,.07,6.15]} scale={[25,.06,.055]} material={railMaterial}/>
    {[-10,-6,-2,2,6,10].map(x=><mesh key={x} geometry={BOX} position={[x,.075,5.8]} scale={[.08,.06,.92]} material={railMaterial}/>)}
  </group>;
}

function SceneContent({data,path,hovered,onHover,onSelect,controlsRef,onCameraEnd,restoreCamera,reducedMotion}:{data:CityNode[];path:string[];hovered:string|null;onHover:(key:string|null)=>void;onSelect:(item:PositionedNode)=>void;controlsRef:RefObject<CameraControlsImpl|null>;onCameraEnd:()=>void;restoreCamera:CameraSnapshot;reducedMotion:boolean}){
  const entries=useMemo(()=>resolvePath(data,path),[data,path]);
  const current=entries.at(-1);
  const layers=useMemo(()=>entries.map((entry,index)=>({entry,children:entry.node.children??[],positions:childPositions(entry.position,entry.node.children?.length??0,index+1)})),[entries]);
  useEffect(()=>{const controls=controlsRef.current;if(!controls)return;controls.setLookAt(...restoreCamera.position,...restoreCamera.target,!reducedMotion)},[controlsRef,restoreCamera,reducedMotion]);
  return <>
    <color attach="background" args={["#f7f5ef"]}/><fog attach="fog" args={["#f7f5ef",25,52]}/>
    <ambientLight intensity={1.55}/><directionalLight position={[10,18,9]} intensity={2.15}/>
    <CityGround/>
    {data.map(node=>{const position=ROOT_POSITIONS[node.tone];const key=node.id;return <KnowledgeBuilding key={key} kind={node.building} tone={node.tone} label={node.label} kicker={node.kicker} position={position} scale={node.id==="concepts"||node.id==="models"?1:.86} hovered={hovered===key} active={path[0]===node.id} onHover={value=>onHover(value?key:null)} onSelect={()=>onSelect({node,position,depth:0,key})}/>})}
    {layers.map(({entry,children,positions},layerIndex)=>children.map((node,index)=>{const key=`${entry.key}/${node.id}`;const selected=path[layerIndex+1]===node.id;const visible=layerIndex===path.length-1||selected;return visible?<KnowledgeBuilding key={key} kind={node.building} tone={node.tone} label={node.label} kicker={node.kicker} position={positions[index]} scale={layerIndex===0 ? .54 : .4} hovered={hovered===key} active={selected} onHover={value=>onHover(value?key:null)} onSelect={()=>onSelect({node,position:positions[index],depth:layerIndex+1,key})}/>:null}))}
    <ContactShadows position={[0,.02,0]} opacity={.2} scale={34} blur={2.4} far={13} frames={1} color="#59615c"/>
    <CameraControls ref={controlsRef} makeDefault minDistance={6.5} maxDistance={36} minPolarAngle={.55} maxPolarAngle={1.13} minAzimuthAngle={-1.45} maxAzimuthAngle={.88} smoothTime={reducedMotion ? .05 : .38} draggingSmoothTime={reducedMotion ? .04 : .16} dollyToCursor truckSpeed={.72} onEnd={onCameraEnd}/>
    {current?<Html position={[current.position[0],.05,current.position[2]]} style={{display:"none"}}>{current.node.label}</Html>:null}
  </>;
}

export default function KnowledgeCityCanvas({data,onReady}:{data:CityNode[];onReady?:()=>void}){
  const router=useRouter();const controlsRef=useRef<CameraControlsImpl|null>(null);
  const [path,setPath]=useState<string[]>([]);const [hovered,setHovered]=useState<string|null>(null);const [camera,setCamera]=useState<CameraSnapshot>(DEFAULT_CAMERA);const [ready,setReady]=useState(false);const [departing,setDeparting]=useState(false);
  const [reducedMotion,setReducedMotion]=useState(false);
  const entries=useMemo(()=>resolvePath(data,path),[data,path]);const current=entries.at(-1)?.node;
  const contextual=current?.children??data;
  const snapshot=useCallback(():CameraSnapshot=>{const controls=controlsRef.current;if(!controls)return camera;const position=controls.getPosition(new Vector3());const target=controls.getTarget(new Vector3());return {position:[position.x,position.y,position.z],target:[target.x,target.y,target.z]};},[camera]);
  const persist=useCallback((ids:string[],next:CameraSnapshot,mode:"push"|"replace")=>{const state:CityHistoryState={path:ids,camera:next};const url=ids.length?`#${ids.join("/")}`:window.location.pathname+window.location.search;(mode==="push"?window.history.pushState:window.history.replaceState).call(window.history,{...window.history.state,llmCity:state},"",url);window.sessionStorage.setItem(STORAGE_KEY,JSON.stringify({...state,hash:ids.join("/")}));},[]);
  useEffect(()=>{const media=window.matchMedia("(prefers-reduced-motion: reduce)");const update=()=>setReducedMotion(media.matches);update();media.addEventListener("change",update);return()=>media.removeEventListener("change",update)},[]);
  useEffect(()=>()=>{document.body.style.cursor=""},[]);
  useEffect(()=>{
    const state=(window.history.state as {llmCity?:CityHistoryState}|null)?.llmCity;let restored=state;
    if(!restored){try{const saved=JSON.parse(window.sessionStorage.getItem(STORAGE_KEY)??"null") as (CityHistoryState&{hash?:string})|null;if(saved&&saved.hash===window.location.hash.slice(1))restored=saved}catch{}}
    const ids=restored?.path??window.location.hash.slice(1).split("/").filter(Boolean);const resolved=resolvePath(data,ids);const valid=resolved.map(entry=>entry.node.id);const next=restored?.camera??cameraFor(resolved.at(-1)?.position??[0,0,0],valid.length);
    setPath(valid);setCamera(next);persist(valid,next,"replace");
    const pop=()=>{const nextState=(window.history.state as {llmCity?:CityHistoryState}|null)?.llmCity;const nextIds=nextState?.path??window.location.hash.slice(1).split("/").filter(Boolean);const nextEntries=resolvePath(data,nextIds);setPath(nextEntries.map(entry=>entry.node.id));setCamera(nextState?.camera??cameraFor(nextEntries.at(-1)?.position??[0,0,0],nextEntries.length));};
    window.addEventListener("popstate",pop);return()=>window.removeEventListener("popstate",pop);
  },[data,persist]);
  const select=useCallback((item:PositionedNode)=>{
    if(departing)return;
    if(item.node.href&&!item.node.children?.length){
      document.body.style.cursor="";const nextCamera=cameraFor(item.position,item.depth+1);setCamera(nextCamera);persist(path,nextCamera,"replace");setDeparting(true);
      const controls=controlsRef.current;const navigate=()=>router.push(item.node.href!);
      if(controls){controls.setLookAt(...nextCamera.position,...nextCamera.target,!reducedMotion).then(navigate)}else navigate();return;
    }
    const next=item.depth===0?[item.node.id]:[...path.slice(0,item.depth),item.node.id];const nextCamera=cameraFor(item.position,item.depth+1);setPath(next);setCamera(nextCamera);persist(next,nextCamera,"push");
  },[departing,path,persist,reducedMotion,router]);
  const overview=()=>{const next=DEFAULT_CAMERA;setPath([]);setCamera(next);persist([],next,"push")};
  const cameraEnd=useCallback(()=>{if(!ready)return;const next=snapshot();persist(path,next,"replace")},[path,persist,ready,snapshot]);
  return <section className="knowledgeCity3d" data-ready={ready} data-departing={departing} aria-label="3D LLM 지식 도시">
    <Canvas frameloop="demand" dpr={[1,1.45]} camera={{position:DEFAULT_CAMERA.position,fov:42,near:.1,far:100}} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} fallback={<div className="cityWebglFallback">3D renderer unavailable</div>} onCreated={()=>{setReady(true);onReady?.()}}>
      <SceneContent data={data} path={path} hovered={hovered} onHover={setHovered} onSelect={select} controlsRef={controlsRef} onCameraEnd={cameraEnd} restoreCamera={camera} reducedMotion={reducedMotion}/>
    </Canvas>
    <header className="city3dIntro"><p>{current?.kicker??"AN ATLAS OF GENERATIVE AI"}</p><h1>{current?.label??"LLM Knowledge City"}</h1><span>{current?.summary??"도시를 내려다보고, 건물 사이를 이동하며 생성형 AI의 구조를 탐색하세요."}</span></header>
    <div className="city3dChrome"><nav aria-label="현재 3D 도시 위치"><button type="button" onClick={overview}>City</button>{entries.map(entry=><span key={entry.key}><i>/</i><button type="button" aria-current={entry.node.id===current?.id?"page":undefined} onClick={()=>{const targetDepth=entry.depth;const steps=path.length-targetDepth-1;if(steps>0)window.history.go(-steps)}}>{compact(entry.node.label,15)}</button></span>)}</nav><div><button type="button" onClick={()=>window.history.back()} disabled={!path.length} aria-label="이전 시점">←</button><button type="button" onClick={overview} aria-label="도시 전체 보기">⌂</button></div></div>
    <nav className="city3dAccessibleNav" aria-label={current?`${current.label} 하위 영역`:"지식 도시 주요 구역"}>{contextual.slice(0,10).map((node,index)=>{const parent=entries.at(-1);const positions=parent?childPositions(parent.position,contextual.length,path.length):null;const item:PositionedNode={node,position:positions?.[index]??ROOT_POSITIONS[node.tone],depth:path.length,key:[...path,node.id].join("/")};return <button type="button" key={node.id} onClick={()=>select(item)}><small>{node.kicker}</small><b>{node.label}</b></button>})}</nav>
  </section>;
}
