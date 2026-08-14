"use client";

import {CameraControls,ContactShadows} from "@react-three/drei";
import {Canvas} from "@react-three/fiber";
import {useRouter} from "next/navigation";
import {useCallback,useEffect,useMemo,useRef,useState,type RefObject} from "react";
import type CameraControlsImpl from "camera-controls";
import {BoxGeometry,MeshStandardMaterial,Vector3,type Vector3Tuple} from "three";
import {CityScenery,KnowledgeBuilding} from "@/components/home/knowledge-building";
import type {CameraSnapshot,CityHistoryState,CityNode,CityTone} from "@/components/home/knowledge-city-types";

const STORAGE_KEY="llm-history:knowledge-city-3d";
const DEFAULT_CAMERA:CameraSnapshot={position:[18.5,14.5,21.5],target:[0,.72,0]};
const ROOT_POSITIONS:Record<CityTone,Vector3Tuple>={concepts:[-5.8,0,-1.5],models:[5.3,0,-1.35],history:[0,0,5.15],organizations:[6.35,0,4.35],issues:[-5.8,0,4.45],frontiers:[1.8,0,-6]};
const BOX=new BoxGeometry(1,1,1);
const groundMaterial=new MeshStandardMaterial({color:"#f3f1e9",roughness:1});
const mainRoadMaterial=new MeshStandardMaterial({color:"#d5d1c7",roughness:1});
const secondaryRoadMaterial=new MeshStandardMaterial({color:"#e0ddd5",roughness:1});
const pathMaterial=new MeshStandardMaterial({color:"#e9e6df",roughness:1});
const curbMaterial=new MeshStandardMaterial({color:"#bdb9ae",roughness:1});
const railMaterial=new MeshStandardMaterial({color:"#696f6b",roughness:.84,metalness:.04});
const districtMaterials:Record<CityTone,MeshStandardMaterial>={concepts:new MeshStandardMaterial({color:"#eeedf1",roughness:1}),models:new MeshStandardMaterial({color:"#f0ebe7",roughness:1}),history:new MeshStandardMaterial({color:"#eeeade",roughness:1}),organizations:new MeshStandardMaterial({color:"#e9efed",roughness:1}),issues:new MeshStandardMaterial({color:"#f0e9ea",roughness:1}),frontiers:new MeshStandardMaterial({color:"#e8eee9",roughness:1})};

type PositionedNode={node:CityNode;position:Vector3Tuple;depth:number;key:string;parentPosition?:Vector3Tuple;ancestors?:string[]};

function childPositions(parent:Vector3Tuple,count:number,depth:number):Vector3Tuple[]{
  const near:[number,number][]=[[-3.7,-2.9],[0,-3.5],[3.7,-2.6],[-4,.5],[0,.2],[4,.8],[-2.8,3.6],[2.4,3.5],[5,3.4],[-5,3.2]];
  const close:[number,number][]=[[-2.5,-2],[-.3,-2.5],[2.1,-1.9],[-2.8,.3],[-.4,.1],[2.4,.5],[-1.9,2.5],[.6,2.7],[3,2.4],[-3.2,2.8]];
  const grid=depth===1?near:close;
  return Array.from({length:count},(_,index)=>{const [x,z]=grid[index%grid.length];const cycle=Math.floor(index/grid.length);return [parent[0]+x+cycle*.45,0,parent[2]+z+cycle*.45];});
}
function semanticChildPositions(parentNode:CityNode,parent:Vector3Tuple,count:number,depth:number):Vector3Tuple[]{
  if(parentNode.tone==="history")return Array.from({length:count},(_,index)=>[parent[0]+(index-(count-1)/2)*1.5,0,parent[2]] as Vector3Tuple);
  if(parentNode.tone==="models"&&parentNode.id!=="models")return Array.from({length:count},(_,index)=>[parent[0]+(index-(count-1)/2)*1.25,0,parent[2]+(index%2?-.28:.28)] as Vector3Tuple);
  if(parentNode.tone==="issues")return Array.from({length:count},(_,index)=>{const angle=(index/count)*Math.PI*2-.7;const radius=count>6?3.35:2.75;return [parent[0]+Math.cos(angle)*radius,0,parent[2]+Math.sin(angle)*radius] as Vector3Tuple});
  return childPositions(parent,count,depth);
}
function cameraFor(position:Vector3Tuple,depth:number):CameraSnapshot{
  if(depth===0)return DEFAULT_CAMERA;
  const offset=depth===1?[8.2,8.1,9.4]:[5.3,5.6,6.4];
  return {position:[position[0]+offset[0],position[1]+offset[1],position[2]+offset[2]],target:[position[0],position[1]+.9,position[2]]};
}
function compact(value:string,limit=24){return value.length>limit?`${value.slice(0,limit).trim()}…`:value}

function resolvePath(data:CityNode[],ids:string[]){
  const entries:PositionedNode[]=[];let options=data;let parent:Vector3Tuple|null=null;let parentNode:CityNode|null=null;
  ids.forEach((id,depth)=>{const index=options.findIndex(node=>node.id===id);if(index<0)return;const node=options[index];const position=depth===0?ROOT_POSITIONS[node.tone]:semanticChildPositions(parentNode!,parent!,options.length,depth)[index];entries.push({node,position,depth,key:ids.slice(0,depth+1).join("/")});parent=position;parentNode=node;options=node.children??[];});
  return entries;
}

function flattenWorld(data:CityNode[]){
  const items:PositionedNode[]=[];
  const visit=(nodes:CityNode[],parent:Vector3Tuple|null,parentNode:CityNode|null,depth:number,ancestors:string[])=>{const positions=parent&&parentNode?semanticChildPositions(parentNode,parent,nodes.length,depth):null;nodes.forEach((node,index)=>{const position=positions?.[index]??ROOT_POSITIONS[node.tone];const key=[...ancestors,node.id].join("/");items.push({node,position,depth,key,parentPosition:parent??position,ancestors});if(node.children?.length)visit(node.children,position,node,depth+1,[...ancestors,node.id])})};
  visit(data,null,null,0,[]);return items;
}

function fallbackSemantic(node:CityNode){if(node.building==="station")return "rail-axis" as const;if(node.building==="plaza")return "forum" as const;if(node.building==="observatory")return "observatory" as const;if(node.building==="towers")return "lineage" as const;if(node.building==="institute")return "institute" as const;if(node.building==="library")return "library" as const;return "headquarters" as const}

function RelationshipPaths({parent,children}:{parent:Vector3Tuple;children:Vector3Tuple[]}){return <group>{children.map((child,index)=>{const dx=child[0]-parent[0],dz=child[2]-parent[2],length=Math.hypot(dx,dz);return <mesh key={index} geometry={BOX} position={[(parent[0]+child[0])/2,.1,(parent[2]+child[2])/2]} rotation={[0,Math.atan2(dx,dz),0]} scale={[.055,.025,length]} material={pathMaterial}/>})}</group>}

function CityGround(){
  return <group dispose={null}>
    <mesh geometry={BOX} position={[0,-.2,0]} scale={[25.5,.36,21]} material={groundMaterial}/>
    <mesh geometry={BOX} position={[-5.8,.01,-1.5]} scale={[6.8,.08,6]} material={districtMaterials.concepts}/><mesh geometry={BOX} position={[5.3,.01,-1.35]} scale={[6.4,.08,5.8]} material={districtMaterials.models}/><mesh geometry={BOX} position={[6.35,.01,4.35]} scale={[5.1,.08,4.5]} material={districtMaterials.organizations}/><mesh geometry={BOX} position={[-5.8,.01,4.45]} scale={[5,.08,4.2]} material={districtMaterials.issues}/><mesh geometry={BOX} position={[1.8,.01,-6]} scale={[5.2,.08,4.2]} material={districtMaterials.frontiers}/>
    <mesh geometry={BOX} position={[0,.045,5.15]} scale={[24,.09,1.5]} material={mainRoadMaterial}/><mesh geometry={BOX} position={[0,.095,4.36]} scale={[24,.08,.075]} material={curbMaterial}/><mesh geometry={BOX} position={[0,.095,5.94]} scale={[24,.08,.075]} material={curbMaterial}/>
    <mesh geometry={BOX} position={[-.8,.04,-.05]} rotation={[0,.34,0]} scale={[.9,.08,19]} material={secondaryRoadMaterial}/><mesh geometry={BOX} position={[4.45,.045,1.15]} rotation={[0,-.6,0]} scale={[.62,.08,14.5]} material={secondaryRoadMaterial}/><mesh geometry={BOX} position={[-4.6,.045,1.35]} rotation={[0,.72,0]} scale={[.55,.08,12]} material={secondaryRoadMaterial}/>
    <mesh geometry={BOX} position={[0,.055,.15]} scale={[12,.05,.24]} material={pathMaterial}/><mesh geometry={BOX} position={[0,.055,-4.5]} scale={[9,.05,.22]} material={pathMaterial}/><mesh geometry={BOX} position={[-5.7,.06,4.45]} scale={[4.1,.06,3.2]} material={pathMaterial}/>
    <mesh geometry={BOX} position={[0,.105,4.85]} scale={[23,.055,.045]} material={railMaterial}/><mesh geometry={BOX} position={[0,.105,5.45]} scale={[23,.055,.045]} material={railMaterial}/>
    {[-10,-6,-2,2,6,10].map(x=><mesh key={x} geometry={BOX} position={[x,.11,5.15]} scale={[.075,.055,.78]} material={railMaterial}/>)}
  </group>;
}

function SceneContent({data,path,hovered,onHover,onSelect,controlsRef,onCameraEnd,restoreCamera,reducedMotion}:{data:CityNode[];path:string[];hovered:string|null;onHover:(key:string|null)=>void;onSelect:(item:PositionedNode)=>void;controlsRef:RefObject<CameraControlsImpl|null>;onCameraEnd:()=>void;restoreCamera:CameraSnapshot;reducedMotion:boolean}){
  const entries=useMemo(()=>resolvePath(data,path),[data,path]);
  const current=entries.at(-1);
  const world=useMemo(()=>flattenWorld(data),[data]);
  const currentChildren=useMemo(()=>current?.node.children?.length?semanticChildPositions(current.node,current.position,current.node.children.length,current.depth+1):[],[current]);
  useEffect(()=>{const controls=controlsRef.current;if(!controls)return;controls.setLookAt(...restoreCamera.position,...restoreCamera.target,!reducedMotion)},[controlsRef,restoreCamera,reducedMotion]);
  return <>
    <color attach="background" args={["#faf9f5"]}/><fog attach="fog" args={["#faf9f5",48,86]}/>
    <hemisphereLight intensity={1.35} color="#fffdf6" groundColor="#c7c4ba"/><directionalLight position={[11,17,8]} intensity={1.85}/>
    <CityGround/><CityScenery/>
    {current&&currentChildren.length?<RelationshipPaths parent={current.position} children={currentChildren}/>:null}
    {world.map(item=>{const {node,key,position,depth}=item;const ancestors=item.ancestors??[];const lineageActive=ancestors.every((id,index)=>path[index]===id);const revealed=depth===0||lineageActive;const active=lineageActive&&path[depth]===node.id;const interactive=revealed&&depth===path.length;const labelVisible=depth===0?(path.length===0||active):(revealed&&depth===path.length);const scale=depth===0?(node.id==="concepts"?1:node.id==="models"?.94:node.id==="history"?.88:.9):depth===1?.5:.32;const parent=item.parentPosition??position;const collapsed:[number,number,number]=[parent[0]+(position[0]-parent[0])*.12,.04,parent[2]+(position[2]-parent[2])*.12];return <KnowledgeBuilding key={key} kind={node.building} semanticForm={node.semanticForm??fallbackSemantic(node)} tone={node.tone} label={node.label} kicker={node.kicker} variant={node.id} position={position} collapsedPosition={collapsed} scale={scale} level={depth} revealed={revealed} labelVisible={labelVisible} interactive={interactive} hovered={hovered===key} active={active} muted={Boolean(path.length&&!lineageActive)} reducedMotion={reducedMotion} onHover={value=>onHover(value?key:null)} onSelect={()=>onSelect(item)}/>})}
    <ContactShadows position={[0,.02,0]} opacity={.24} scale={31} blur={2} far={10} frames={1} color="#68706b"/>
    <CameraControls ref={controlsRef} makeDefault minDistance={6.5} maxDistance={36} minPolarAngle={.55} maxPolarAngle={1.13} minAzimuthAngle={-1.45} maxAzimuthAngle={.88} smoothTime={reducedMotion ? .05 : .38} draggingSmoothTime={reducedMotion ? .04 : .16} dollyToCursor truckSpeed={.72} onEnd={onCameraEnd}/>
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
  return <section className="knowledgeCity3d" data-ready={ready} data-departing={departing} data-depth={path.length} aria-label="3D LLM 지식 도시">
    <Canvas frameloop="demand" dpr={[1,1.45]} camera={{position:DEFAULT_CAMERA.position,fov:36,near:.1,far:100}} gl={{antialias:true,alpha:false,powerPreference:"high-performance"}} fallback={<div className="cityWebglFallback">3D renderer unavailable</div>} onCreated={()=>{setReady(true);onReady?.()}}>
      <SceneContent data={data} path={path} hovered={hovered} onHover={setHovered} onSelect={select} controlsRef={controlsRef} onCameraEnd={cameraEnd} restoreCamera={camera} reducedMotion={reducedMotion}/>
    </Canvas>
    <header className="city3dIntro"><p>{current?.kicker??"AN ATLAS OF GENERATIVE AI"}</p><h1>{current?.label??"LLM Knowledge City"}</h1><span>{current?.summary??"도시를 내려다보고, 건물 사이를 이동하며 생성형 AI의 구조를 탐색하세요."}</span></header>
    <div className="city3dChrome"><nav aria-label="현재 3D 도시 위치"><button type="button" onClick={overview}>City</button>{entries.map(entry=><span key={entry.key}><i>/</i><button type="button" aria-current={entry.node.id===current?.id?"page":undefined} onClick={()=>{const targetDepth=entry.depth;const steps=path.length-targetDepth-1;if(steps>0)window.history.go(-steps)}}>{compact(entry.node.label,15)}</button></span>)}</nav><div><button type="button" onClick={()=>window.history.back()} disabled={!path.length} aria-label="이전 시점">←</button><button type="button" onClick={overview} aria-label="도시 전체 보기">⌂</button></div></div>
    <nav className="city3dAccessibleNav" aria-label={current?`${current.label} 하위 영역`:"지식 도시 주요 구역"}>{contextual.slice(0,10).map((node,index)=>{const parent=entries.at(-1);const positions=parent?semanticChildPositions(parent.node,parent.position,contextual.length,path.length):null;const item:PositionedNode={node,position:positions?.[index]??ROOT_POSITIONS[node.tone],depth:path.length,key:[...path,node.id].join("/")};return <button type="button" key={node.id} onClick={()=>select(item)}><small>{node.kicker}</small><b>{node.label}</b></button>})}</nav>
  </section>;
}
