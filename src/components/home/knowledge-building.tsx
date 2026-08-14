"use client";

import {Edges,Html} from "@react-three/drei";
import {BoxGeometry,CylinderGeometry,MeshStandardMaterial,SphereGeometry,type BufferGeometry,type Euler,type Vector3Tuple} from "three";
import type {BuildingKind,CityTone} from "@/components/home/knowledge-city-types";

const BOX=new BoxGeometry(1,1,1);
const CYLINDER=new CylinderGeometry(1,1,1,12);
const DOME=new SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2);
const palettes:Record<CityTone,[string,string]>={
  concepts:["#dedde3","#cac7d6"],models:["#e3d8d1","#d7c3b8"],history:["#e5dfd1","#d5c7aa"],organizations:["#d7e0df","#bfd0d0"],issues:["#e3d7d9","#d6bfc4"],frontiers:["#d6e0d9","#bdd0c3"],
};
const materials=Object.fromEntries(Object.entries(palettes).map(([tone,[base,hover]])=>[tone,{base:new MeshStandardMaterial({color:base,roughness:.91,metalness:0}),hover:new MeshStandardMaterial({color:hover,roughness:.88,metalness:0})}])) as Record<CityTone,{base:MeshStandardMaterial;hover:MeshStandardMaterial}>;

function InkMesh({geometry=BOX,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],tone,hovered=false}:{geometry?:BufferGeometry;position?:Vector3Tuple;scale?:Vector3Tuple;rotation?:Euler|Vector3Tuple;tone:CityTone;hovered?:boolean}){
  return <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} material={materials[tone][hovered?"hover":"base"]}>
    <Edges threshold={18} color={hovered?"#17231d":"#3d4842"}/>
  </mesh>;
}

function Institute({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,.55,0]} scale={[3.2,1.1,2.15]}/><InkMesh tone={tone} hovered={hovered} position={[0,1.45,-.1]} scale={[1.15,.75,1.05]}/><InkMesh tone={tone} hovered={hovered} position={[0,2.18,-.1]} scale={[.55,.72,.55]}/><InkMesh geometry={CYLINDER} tone={tone} hovered={hovered} position={[0,2.75,-.1]} scale={[.18,.55,.18]}/><InkMesh tone={tone} hovered={hovered} position={[-1.9,.32,.1]} scale={[.55,.65,1.6]}/><InkMesh tone={tone} hovered={hovered} position={[1.9,.32,.1]} scale={[.55,.65,1.6]}/></group>;
}
function Towers({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[-.9,1.7,.25]} scale={[1.05,3.4,1.05]}/><InkMesh tone={tone} hovered={hovered} position={[.55,2.25,-.2]} scale={[1.2,4.5,1.2]}/><InkMesh tone={tone} hovered={hovered} position={[1.55,1.25,.6]} scale={[.75,2.5,.75]}/><InkMesh tone={tone} hovered={hovered} position={[.55,4.68,-.2]} scale={[.62,.36,.62]}/></group>;
}
function Station({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,.35,0]} scale={[4.2,.7,1.7]}/><InkMesh tone={tone} hovered={hovered} position={[0,1.05,0]} scale={[2.5,.7,1.25]}/><InkMesh tone={tone} hovered={hovered} position={[-1.2,1.68,0]} scale={[.38,.62,.38]}/><InkMesh tone={tone} hovered={hovered} position={[1.2,1.68,0]} scale={[.38,.62,.38]}/></group>;
}
function Office({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,1.35,0]} scale={[2.7,2.7,1.8]}/><InkMesh tone={tone} hovered={hovered} position={[0,2.95,0]} scale={[1.9,.5,1.2]}/><InkMesh tone={tone} hovered={hovered} position={[-1.6,.45,.25]} scale={[.55,.9,1.4]}/></group>;
}
function Plaza({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,.12,0]} scale={[3.9,.24,3.2]}/>{[-1.25,0,1.25].map(x=><InkMesh key={x} geometry={CYLINDER} tone={tone} hovered={hovered} position={[x,.75,-.65]} scale={[.16,1.35,.16]}/>)}<InkMesh tone={tone} hovered={hovered} position={[0,1.5,-.65]} scale={[3.1,.18,.65]}/><InkMesh geometry={CYLINDER} tone={tone} hovered={hovered} position={[0,.64,.75]} scale={[.62,.2,.62]}/></group>;
}
function Observatory({tone,hovered}:{tone:CityTone;hovered:boolean}){
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,.65,0]} scale={[2.45,1.3,2.05]}/><InkMesh geometry={CYLINDER} tone={tone} hovered={hovered} position={[0,1.48,0]} scale={[.95,.4,.95]}/><InkMesh geometry={DOME} tone={tone} hovered={hovered} position={[0,1.68,0]} scale={[1,1,1]}/><InkMesh tone={tone} hovered={hovered} position={[1.45,.45,.2]} scale={[.55,.9,1.15]}/></group>;
}
function SmallBuilding({kind,tone,hovered}:{kind:BuildingKind;tone:CityTone;hovered:boolean}){
  const height=kind==="lab"?2.25:kind==="archive"?1.65:kind==="library"?1.45:1.9;
  return <group><InkMesh tone={tone} hovered={hovered} position={[0,height/2,0]} scale={[1.8,height,1.35]}/>{kind==="lab"?<InkMesh geometry={CYLINDER} tone={tone} hovered={hovered} position={[.38,height+.5,-.2]} scale={[.12,1,.12]}/>:null}{kind==="library"?<InkMesh tone={tone} hovered={hovered} position={[0,height+.18,0]} scale={[1.3,.32,.95]} rotation={[0,0,.08]}/>:null}</group>;
}

export function KnowledgeBuilding({kind,tone,label,kicker,position,scale=1,hovered,active,onHover,onSelect}:{kind:BuildingKind;tone:CityTone;label:string;kicker:string;position:Vector3Tuple;scale?:number;hovered:boolean;active:boolean;onHover:(hovered:boolean)=>void;onSelect:()=>void}){
  const building=kind==="institute"?<Institute tone={tone} hovered={hovered}/>:kind==="towers"?<Towers tone={tone} hovered={hovered}/>:kind==="station"?<Station tone={tone} hovered={hovered}/>:kind==="office"?<Office tone={tone} hovered={hovered}/>:kind==="plaza"?<Plaza tone={tone} hovered={hovered}/>:kind==="observatory"?<Observatory tone={tone} hovered={hovered}/>:<SmallBuilding kind={kind} tone={tone} hovered={hovered}/>;
  return <group dispose={null} position={position} scale={scale} onPointerEnter={event=>{event.stopPropagation();onHover(true);document.body.style.cursor="pointer"}} onPointerLeave={()=>{onHover(false);document.body.style.cursor=""}} onClick={event=>{event.stopPropagation();onSelect()}}>
    {building}
    <Html center position={[0,kind==="towers"?5.45:kind==="institute"?3.55:kind==="observatory"?3.1:2.7,0]} distanceFactor={14} zIndexRange={[20,0]} style={{pointerEvents:"none"}}>
      <span className="city3dLabel" data-active={active} data-hovered={hovered}><small>{kicker}</small><b>{label}</b></span>
    </Html>
  </group>;
}
