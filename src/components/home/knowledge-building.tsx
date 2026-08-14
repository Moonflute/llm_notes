"use client";

import {Edges,Html} from "@react-three/drei";
import {useFrame,useThree} from "@react-three/fiber";
import {useEffect,useLayoutEffect,useRef,useState} from "react";
import {BoxGeometry,BufferGeometry,CylinderGeometry,Float32BufferAttribute,Group,InstancedMesh,MathUtils,MeshStandardMaterial,Object3D,SphereGeometry,type Euler,type Vector3Tuple} from "three";
import type {BuildingKind,CityTone,SemanticForm} from "@/components/home/knowledge-city-types";

const BOX=new BoxGeometry(1,1,1);
const CYLINDER=new CylinderGeometry(1,1,1,12);
const DOME=new SphereGeometry(1,16,8,0,Math.PI*2,0,Math.PI/2);
const ROOF=new BufferGeometry();
ROOF.setAttribute("position",new Float32BufferAttribute([-.5,-.5,-.5,.5,-.5,-.5,0,.5,-.5,-.5,-.5,.5,.5,-.5,.5,0,.5,.5],3));
ROOF.setIndex([0,1,2,3,5,4,0,3,4,0,4,1,1,4,5,1,5,2,2,5,3,2,3,0]);ROOF.computeVertexNormals();

const palette:Record<CityTone,{face:string;selected:string;roof:string;accent:string}>={
  concepts:{face:"#ecebef",selected:"#dedbea",roof:"#d6d2df",accent:"#817b9b"},models:{face:"#eee9e4",selected:"#eadbd1",roof:"#d9cdc4",accent:"#a66c57"},history:{face:"#eeeade",selected:"#e7dcc4",roof:"#d8ceb7",accent:"#9a7545"},organizations:{face:"#e8edeb",selected:"#d8e6e4",roof:"#ccd9d7",accent:"#5f7f82"},issues:{face:"#eee8e9",selected:"#ead9dc",roof:"#d9c8cc",accent:"#97646e"},frontiers:{face:"#e7ede8",selected:"#d6e5da",roof:"#c8d8cc",accent:"#5c806b"},
};
const materials=Object.fromEntries(Object.entries(palette).map(([tone,colors])=>[tone,{
  face:new MeshStandardMaterial({color:colors.face,roughness:.94}),selected:new MeshStandardMaterial({color:colors.selected,roughness:.9}),roof:new MeshStandardMaterial({color:colors.roof,roughness:.96}),accent:new MeshStandardMaterial({color:colors.accent,roughness:.88}),
}])) as Record<CityTone,Record<"face"|"selected"|"roof"|"accent",MeshStandardMaterial>>;
const insetMaterial=new MeshStandardMaterial({color:"#59645f",roughness:.82});
const glassMaterial=new MeshStandardMaterial({color:"#718187",roughness:.5,metalness:.05});
const landscapeMaterial=new MeshStandardMaterial({color:"#cfd8cb",roughness:1});
const trunkMaterial=new MeshStandardMaterial({color:"#8e8373",roughness:1});

type Transform={position:Vector3Tuple;scale:Vector3Tuple;rotation?:Vector3Tuple};
function Instances({geometry=BOX,material,items}:{geometry?:BufferGeometry;material:MeshStandardMaterial;items:Transform[]}){
  const ref=useRef<InstancedMesh>(null);const invalidate=useThree(state=>state.invalidate);useLayoutEffect(()=>{if(!ref.current)return;const dummy=new Object3D();items.forEach((item,index)=>{dummy.position.set(...item.position);dummy.scale.set(...item.scale);dummy.rotation.set(...(item.rotation??[0,0,0]));dummy.updateMatrix();ref.current!.setMatrixAt(index,dummy.matrix)});ref.current.instanceMatrix.needsUpdate=true;invalidate()},[items,invalidate]);
  return <instancedMesh ref={ref} args={[geometry,material,items.length]} raycast={()=>null}/>;
}
function InkMesh({geometry=BOX,position=[0,0,0],scale=[1,1,1],rotation=[0,0,0],tone,active=false,surface="face",edge="medium",edges=true}:{geometry?:BufferGeometry;position?:Vector3Tuple;scale?:Vector3Tuple;rotation?:Euler|Vector3Tuple;tone:CityTone;active?:boolean;surface?:"face"|"roof"|"accent"|"inset"|"glass";edge?:"strong"|"medium"|"light";edges?:boolean}){
  const material=surface==="inset"?insetMaterial:surface==="glass"?glassMaterial:surface==="face"&&active?materials[tone].selected:materials[tone][surface];
  return <mesh geometry={geometry} position={position} scale={scale} rotation={rotation} material={material}>{edges?<Edges threshold={edge==="light"?32:18} linewidth={edge==="strong"?1.15:edge==="medium"?.72:.38} color={active?"#26352e":"#4b5550"}/>:null}</mesh>;
}
function Bands({tone,items,active=false}:{tone:CityTone;items:Transform[];active?:boolean}){return <Instances material={active?materials[tone].accent:insetMaterial} items={items}/>}
function Portal({tone,position=[0,.42,1.02],active=false}:{tone:CityTone;position?:Vector3Tuple;active?:boolean}){return <group><InkMesh tone={tone} active={active} surface="inset" edge="light" position={position} scale={[.62,.72,.08]}/><InkMesh tone={tone} active={active} surface="accent" edge="medium" position={[position[0],position[1]+.48,position[2]+.16]} scale={[1.05,.1,.5]}/></group>}

function Institute({tone,active}:{tone:CityTone;active:boolean}){
  const columns=[-1.35,-.9,-.45,0,.45,.9,1.35].map(x=>({position:[x,.65,1.28] as Vector3Tuple,scale:[.07,1.2,.07] as Vector3Tuple}));
  return <group><InkMesh tone={tone} active={active} position={[0,.48,-.35]} scale={[3.2,.96,1.35]} edge="strong"/><InkMesh tone={tone} active={active} position={[-2.05,.38,.25]} scale={[.9,.76,2.55]} edge="strong"/><InkMesh tone={tone} active={active} position={[2.05,.38,.25]} scale={[.9,.76,2.55]} edge="strong"/><InkMesh tone={tone} active={active} position={[0,.13,1.35]} scale={[3.2,.26,.7]} edge="medium"/><Instances geometry={CYLINDER} material={materials[tone].accent} items={columns}/><InkMesh tone={tone} active={active} position={[0,1.25,-.35]} scale={[1.45,.58,1.05]}/><InkMesh tone={tone} active={active} surface="roof" position={[0,1.64,-.35]} scale={[1.02,.22,.75]}/><InkMesh tone={tone} active={active} surface="glass" edge="light" position={[0,1.88,-.35]} scale={[.48,.28,.48]}/><Portal tone={tone} active={active} position={[0,.42,1.72]}/><Bands tone={tone} active={active} items={[-1.05,-.52,0,.52,1.05].map(x=>({position:[x,.58,-1.04],scale:[.2,.38,.035]}))}/></group>;
}
function Towers({tone,active}:{tone:CityTone;active:boolean}){
  const bands=[.85,1.45,2.05,2.65,3.25].flatMap(y=>[-.95,.55].map(x=>({position:[x,y,.83] as Vector3Tuple,scale:[x<0?.7:.82,.055,.035] as Vector3Tuple})));
  return <group><InkMesh tone={tone} active={active} position={[0,.22,.1]} scale={[3.7,.44,2.5]} edge="strong"/><InkMesh tone={tone} active={active} position={[-.95,1.75,.15]} scale={[1.15,3.5,1.35]} edge="strong"/><InkMesh tone={tone} active={active} position={[.55,2.35,-.1]} scale={[1.35,4.7,1.25]} edge="strong"/><InkMesh tone={tone} active={active} position={[1.65,1.25,.55]} scale={[.7,2.5,.78]} edge="medium"/><InkMesh tone={tone} active={active} surface="roof" position={[.55,4.85,-.1]} scale={[.82,.3,.82]}/><InkMesh tone={tone} active={active} surface="glass" edge="light" position={[-.15,2.05,.05]} scale={[.38,.22,1.05]}/><InkMesh tone={tone} active={active} surface="accent" position={[1.07,3.15,-.1]} scale={[.18,.22,1.2]}/><Bands tone={tone} active={active} items={bands}/><Portal tone={tone} active={active} position={[0,.42,1.4]}/></group>;
}
function Station({tone,active}:{tone:CityTone;active:boolean}){
  const columns=[-1.55,-.8,0,.8,1.55].map(x=>({position:[x,.62,.78] as Vector3Tuple,scale:[.08,1.05,.08] as Vector3Tuple}));
  return <group><InkMesh tone={tone} active={active} position={[0,.13,0]} scale={[4.8,.26,2.15]} edge="strong"/><InkMesh tone={tone} active={active} position={[0,.72,-.15]} scale={[3.1,1.18,1.35]} edge="strong"/><InkMesh geometry={ROOF} tone={tone} active={active} surface="roof" position={[0,1.55,-.15]} scale={[3.45,.68,1.65]} edge="medium"/><Instances geometry={CYLINDER} material={materials[tone].accent} items={columns}/><InkMesh tone={tone} active={active} surface="glass" edge="light" position={[0,.75,.54]} scale={[1.55,.48,.04]}/><InkMesh tone={tone} active={active} surface="accent" position={[0,.25,1.28]} scale={[4.2,.08,.55]}/></group>;
}
function Organization({tone,active,variant}:{tone:CityTone;active:boolean;variant:string}){
  if(variant==="google-deepmind")return <group><InkMesh tone={tone} active={active} position={[-1.1,.65,0]} scale={[1.9,1.3,1.65]} edge="strong"/><InkMesh tone={tone} active={active} position={[1.1,.9,-.4]} scale={[1.55,1.8,1.45]} edge="strong"/><InkMesh tone={tone} active={active} surface="glass" position={[0,1.18,-.15]} scale={[1.25,.28,.38]}/><InkMesh tone={tone} active={active} surface="roof" position={[-1.1,1.42,0]} scale={[1.25,.22,1.05]}/><Portal tone={tone} active={active} position={[-1.15,.38,.86]}/></group>;
  if(variant==="anthropic")return <group><InkMesh tone={tone} active={active} position={[0,.65,0]} scale={[3.5,1.3,1.75]} edge="strong"/><InkMesh tone={tone} active={active} surface="inset" edge="light" position={[0,.7,.89]} scale={[1.8,.42,.04]}/><InkMesh tone={tone} active={active} surface="roof" position={[.85,1.43,-.1]} scale={[1.2,.26,.9]}/><Portal tone={tone} active={active} position={[-1.05,.38,.95]}/></group>;
  if(variant==="meta")return <group><InkMesh tone={tone} active={active} position={[0,.35,0]} scale={[4.2,.7,1.4]} edge="strong"/><InkMesh tone={tone} active={active} position={[-1.25,.85,-.1]} scale={[1.45,1.7,1.65]}/><InkMesh tone={tone} active={active} position={[1.25,.65,.2]} scale={[1.25,1.3,1.35]}/><InkMesh tone={tone} active={active} surface="glass" position={[0,.82,0]} scale={[1.25,.28,.4]}/><Portal tone={tone} active={active} position={[0,.34,.83]}/></group>;
  if(variant==="deepseek")return <group><InkMesh tone={tone} active={active} position={[0,.25,0]} scale={[2.5,.5,1.8]} edge="strong"/><InkMesh tone={tone} active={active} position={[0,1.65,0]} scale={[1.45,3.3,1.3]} edge="strong"/><InkMesh tone={tone} active={active} surface="accent" position={[.62,2.4,0]} scale={[.22,.45,1.35]}/><InkMesh tone={tone} active={active} surface="roof" position={[0,3.42,0]} scale={[.82,.26,.75]}/><Bands tone={tone} items={[.8,1.35,1.9,2.45].map(y=>({position:[0,y,.67],scale:[1.1,.055,.03]}))}/></group>;
  if(variant==="mistral-ai")return <group><InkMesh tone={tone} active={active} position={[0,1.25,0]} scale={[1.65,2.5,1.45]} edge="strong"/><InkMesh geometry={ROOF} tone={tone} active={active} surface="roof" position={[0,2.82,0]} scale={[1.9,.72,1.7]}/><Bands tone={tone} items={[-.48,0,.48].flatMap(x=>[.8,1.45,2.05].map(y=>({position:[x,y,.74],scale:[.2,.3,.03]})))}/><Portal tone={tone} active={active}/></group>;
  if(variant==="alibaba-cloud")return <group><InkMesh tone={tone} active={active} position={[0,.35,0]} scale={[3.8,.7,2.2]} edge="strong"/><InkMesh tone={tone} active={active} position={[-.8,1.35,-.25]} scale={[1.25,2.7,1.35]}/><InkMesh tone={tone} active={active} position={[1.05,1.05,.15]} scale={[1.2,2.1,1.25]}/><InkMesh tone={tone} active={active} surface="glass" position={[.12,1.25,0]} scale={[.4,.32,1.55]}/><Portal tone={tone} active={active} position={[0,.38,1.2]}/></group>;
  if(variant==="ai2")return <Institute tone={tone} active={active}/>;
  return <group><InkMesh tone={tone} active={active} position={[0,.24,0]} scale={[3.1,.48,2]} edge="strong"/><InkMesh tone={tone} active={active} position={[0,1.35,-.1]} scale={[2.2,2.7,1.45]} edge="strong"/><InkMesh tone={tone} active={active} position={[.35,2.95,-.1]} scale={[1.1,.5,.85]}/><InkMesh tone={tone} active={active} surface="accent" position={[-.9,1.55,-.1]} scale={[.18,.55,1.5]}/><Bands tone={tone} active={active} items={[-.65,0,.65].flatMap(x=>[.85,1.45,2.05].map(y=>({position:[x,y,.64],scale:[.2,.3,.03]})))}/><Portal tone={tone} active={active} position={[0,.4,1.02]}/></group>;
}
function Plaza({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh geometry={CYLINDER} tone={tone} active={active} position={[0,.08,.2]} scale={[2.2,.12,2.2]} edge="strong"/><InkMesh geometry={CYLINDER} tone={tone} active={active} position={[0,.17,.2]} scale={[1.55,.16,1.55]} edge="medium"/><InkMesh geometry={CYLINDER} tone={tone} active={active} surface="accent" position={[0,.27,.2]} scale={[.72,.18,.72]} edge="light"/><InkMesh tone={tone} active={active} position={[0,.65,-1.45]} scale={[3.5,1.3,.65]} edge="strong"/><Instances geometry={CYLINDER} material={materials[tone].accent} items={[-1.2,-.6,0,.6,1.2].map(x=>({position:[x,.64,-1.08],scale:[.06,1.05,.06]}))}/><InkMesh tone={tone} active={active} surface="roof" position={[0,1.38,-1.45]} scale={[3.75,.16,.9]}/></group>;
}
function Observatory({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.15,0]} scale={[3.5,.3,2.8]} edge="strong"/><InkMesh tone={tone} active={active} position={[-.45,.72,0]} scale={[2.25,1.15,1.8]} edge="strong"/><InkMesh geometry={CYLINDER} tone={tone} active={active} surface="roof" position={[-.45,1.55,0]} scale={[.95,.5,.95]}/><InkMesh geometry={DOME} tone={tone} active={active} surface="accent" position={[-.45,1.8,0]} scale={[1,1,1]}/><InkMesh tone={tone} active={active} position={[1.35,1.15,-.2]} scale={[.65,2.3,.85]} edge="strong"/><InkMesh tone={tone} active={active} surface="glass" position={[.55,1.12,-.1]} scale={[1.15,.2,.32]}/><InkMesh geometry={CYLINDER} tone={tone} active={active} surface="accent" position={[1.35,2.65,-.2]} scale={[.08,.7,.08]}/></group>;
}
function SmallBuilding({kind,tone,active}:{kind:BuildingKind;tone:CityTone;active:boolean}){
  const height=kind==="lab"?2.2:kind==="archive"?1.55:kind==="library"?1.4:1.85;
  return <group><InkMesh tone={tone} active={active} position={[0,.16,0]} scale={[2.1,.32,1.65]} edge="strong"/><InkMesh tone={tone} active={active} position={[0,.32+height/2,-.12]} scale={[1.45,height,1.15]} edge="strong"/><InkMesh geometry={kind==="library"?ROOF:BOX} tone={tone} active={active} surface="roof" position={[0,height+.42,-.12]} scale={[kind==="library"?1.7:1,.36,1.28]}/><Bands tone={tone} items={[-.42,0,.42].map(x=>({position:[x,.8,-.7],scale:[.18,.3,.03]}))}/><Portal tone={tone} active={active} position={[0,.36,.86]}/>{kind==="lab"?<InkMesh geometry={CYLINDER} tone={tone} active={active} surface="accent" position={[.38,height+1,-.2]} scale={[.08,.8,.08]}/>:null}</group>;
}

function Workshop({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[-.8,.55,0]} scale={[1.35,1.1,2.2]} edge="strong"/><InkMesh tone={tone} active={active} position={[.85,.55,0]} scale={[1.35,1.1,2.2]} edge="strong"/><InkMesh geometry={ROOF} tone={tone} active={active} surface="roof" position={[-.8,1.35,0]} scale={[1.55,.55,2.45]}/><InkMesh geometry={ROOF} tone={tone} active={active} surface="roof" position={[.85,1.35,0]} scale={[1.55,.55,2.45]}/><InkMesh tone={tone} active={active} surface="accent" position={[0,1.05,-.55]} scale={[.3,1.7,.3]}/><Portal tone={tone} active={active} position={[0,.38,1.25]}/></group>;
}
function Refinery({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[-.75,.75,0]} scale={[1.7,1.5,1.8]} edge="strong"/><InkMesh tone={tone} active={active} position={[1.15,.48,.25]} scale={[1.2,.96,1.35]} edge="strong"/><InkMesh tone={tone} active={active} surface="glass" position={[.22,1.05,.05]} scale={[1.1,.18,.35]}/><InkMesh tone={tone} active={active} surface="accent" position={[1.15,1.15,.25]} scale={[.7,.18,.72]}/><Portal tone={tone} active={active} position={[-.75,.35,1]}/></group>;
}
function Multiwing({tone,active}:{tone:CityTone;active:boolean}){
  const wings:[Vector3Tuple,Vector3Tuple][]=[[[0,.55,-1.2],[1.25,1.1,1.65]],[[1.25,.45,.45],[1.55,.9,.9]],[[-1.25,.45,.45],[1.55,.9,.9]]];
  return <group><InkMesh geometry={CYLINDER} tone={tone} active={active} position={[0,.8,0]} scale={[.72,1.6,.72]} edge="strong"/>{wings.map(([position,scale],index)=><InkMesh key={index} tone={tone} active={active} position={position} scale={scale} edge="medium"/>)}<InkMesh geometry={DOME} tone={tone} active={active} surface="accent" position={[0,1.72,0]} scale={[.72,.45,.72]}/></group>;
}
function Checkpoint({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.12,0]} scale={[3.5,.24,1.55]} edge="strong"/><InkMesh tone={tone} active={active} position={[-1.15,.75,0]} scale={[.35,1.5,.55]}/><InkMesh tone={tone} active={active} position={[1.15,.75,0]} scale={[.35,1.5,.55]}/><InkMesh tone={tone} active={active} surface="accent" position={[0,1.38,0]} scale={[2.65,.22,.58]}/><InkMesh tone={tone} active={active} surface="inset" position={[0,.7,0]} scale={[1.75,.08,.08]}/></group>;
}
function ModularStack({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.12,0]} scale={[2.3,.24,1.7]} edge="strong"/>{[0,1,2,3].map(index=><group key={index} position={[0,.48+index*.55,0]}><InkMesh tone={tone} active={active} position={[0,0,0]} scale={[1.65,.38,1.15]} edge={index===3?"strong":"medium"}/><InkMesh tone={tone} active={active} surface="accent" position={[-.88,0,0]} scale={[.08,.28,1.16]} edges={false}/></group>)}</group>;
}
function AttentionHub({tone,active}:{tone:CityTone;active:boolean}){
  const arms:[[number,number,number],[number,number,number]][]=[[[0,.52,-1.35],[.45,.3,1.5]],[[0,.52,1.35],[.45,.3,1.5]],[[-1.35,.52,0],[1.5,.3,.45]],[[1.35,.52,0],[1.5,.3,.45]]];
  return <group><InkMesh geometry={CYLINDER} tone={tone} active={active} surface="accent" position={[0,.72,0]} scale={[.7,1.15,.7]} edge="strong"/>{arms.map(([position,scale],index)=><InkMesh key={index} tone={tone} active={active} position={position} scale={scale} edge="medium"/>)}{[[-1.85,.55,0],[1.85,.55,0],[0,.55,-1.85],[0,.55,1.85]].map(([x,y,z],index)=><InkMesh key={index} tone={tone} active={active} position={[x,y,z]} scale={[.55,1.1,.55]}/>)}</group>;
}
function RouterWings({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh geometry={CYLINDER} tone={tone} active={active} surface="accent" position={[0,.65,0]} scale={[.55,1.3,.55]} edge="strong"/>{[[-1.5,0],[1.5,0],[0,-1.45],[0,1.45]].map(([x,z],index)=><group key={index}><InkMesh tone={tone} active={active} position={[x,.62,z]} scale={[.9,1.24,.75]} edge="strong"/><InkMesh tone={tone} active={active} surface="glass" position={[x/2,.66,z/2]} scale={[Math.abs(x)>.1?.95:.18,.12,Math.abs(z)>.1?.95:.18]} edges={false}/></group>)}</group>;
}
function MemoryWarehouse({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.14,0]} scale={[3,.28,1.7]} edge="strong"/>{[.48,.9,1.32,1.74].map((y,index)=><InkMesh key={y} tone={tone} active={active} surface={index%2?"roof":"face"} position={[0,y,0]} scale={[2.4,.22,1.35]} edge="medium"/>)}<InkMesh tone={tone} active={active} surface="accent" position={[1.3,1.1,0]} scale={[.18,1.65,1.36]}/></group>;
}
function CompressionSteps({tone,active}:{tone:CityTone;active:boolean}){
  return <group>{[[0,2.6,.45],[-.15,2,.85],[-.3,1.4,1.25],[-.45,.82,1.62]].map(([x,width,y],index)=><InkMesh key={index} tone={tone} active={active} surface={index===3?"accent":"face"} position={[x,y,0]} scale={[width,.42,1.45-index*.14]} edge={index===0?"strong":"medium"}/>)}</group>;
}
function Lineage({tone,active,variant}:{tone:CityTone;active:boolean;variant:string}){
  const heights=variant==="gpt"?[.7,1.05,1.65,2.25]:variant==="gemini"?[1.2,1.75,1.25]:variant==="claude"?[.85,1.35,1.85]:variant==="llama"?[.65,.95,1.25,1.55]:[.7,1.1,1.5];
  const start=-(heights.length-1)*.52;
  return <group><InkMesh tone={tone} active={active} position={[0,.13,0]} scale={[heights.length*1.18,.26,1.7]} edge="strong"/>{heights.map((height,index)=><group key={index} position={[start+index*1.05,0,0]}><InkMesh tone={tone} active={active} position={[0,.28+height/2,0]} scale={[.72,height,.9]} edge={index===heights.length-1?"strong":"medium"}/>{index?<InkMesh tone={tone} active={active} surface="accent" position={[-.52,.46,0]} scale={[.34,.1,.18]} edges={false}/>:null}</group>)}</group>;
}
function OpenStructure({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.1,0]} scale={[3.2,.2,1.8]} edge="strong"/><Instances geometry={CYLINDER} material={materials[tone].accent} items={[-1.2,-.6,0,.6,1.2].map(x=>({position:[x,.75,-.5],scale:[.07,1.35,.07]}))}/><InkMesh tone={tone} active={active} surface="roof" position={[0,1.48,-.5]} scale={[2.8,.16,.55]}/><InkMesh tone={tone} active={active} position={[.95,.72,.45]} scale={[.9,1.4,.65]} edge="strong"/></group>;
}
function DualSystem({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[-.7,.4,-.7]} scale={[3.4,.8,.55]} edge="strong"/><InkMesh tone={tone} active={active} position={[.95,.65,.7]} scale={[1.35,1.3,1.15]} edge="strong"/><InkMesh tone={tone} active={active} surface="glass" position={[.25,.72,.05]} scale={[.18,.12,1.2]} edges={false}/></group>;
}
function BranchControl({tone,active}:{tone:CityTone;active:boolean}){
  return <group><InkMesh tone={tone} active={active} position={[0,.15,-.8]} scale={[.28,.3,2.1]} edge="strong"/><InkMesh tone={tone} active={active} position={[-.75,.15,.7]} rotation={[0,-.55,0]} scale={[.22,.3,1.7]}/><InkMesh tone={tone} active={active} position={[.75,.15,.7]} rotation={[0,.55,0]} scale={[.22,.3,1.7]}/><Checkpoint tone={tone} active={active}/></group>;
}

function SemanticArchitecture({form,kind,tone,active,variant}:{form:SemanticForm;kind:BuildingKind;tone:CityTone;active:boolean;variant:string}){
  if(form==="campus"||form==="institute")return <Institute tone={tone} active={active}/>;
  if(form==="library")return <SmallBuilding kind="library" tone={tone} active={active}/>;
  if(form==="workshop")return <Workshop tone={tone} active={active}/>;
  if(form==="refinery")return <Refinery tone={tone} active={active}/>;
  if(form==="operations")return <Station tone={tone} active={active}/>;
  if(form==="archive-bridge")return <DualSystem tone={tone} active={active}/>;
  if(form==="multiwing")return <Multiwing tone={tone} active={active}/>;
  if(form==="checkpoint")return <Checkpoint tone={tone} active={active}/>;
  if(form==="modular-stack")return <ModularStack tone={tone} active={active}/>;
  if(form==="attention-hub")return <AttentionHub tone={tone} active={active}/>;
  if(form==="router-wings")return <RouterWings tone={tone} active={active}/>;
  if(form==="memory-warehouse")return <MemoryWarehouse tone={tone} active={active}/>;
  if(form==="compression-steps")return <CompressionSteps tone={tone} active={active}/>;
  if(form==="lineage")return <Lineage tone={tone} active={active} variant={variant}/>;
  if(form==="generation")return <SmallBuilding kind="block" tone={tone} active={active}/>;
  if(form==="rail-axis")return <Station tone={tone} active={active}/>;
  if(form==="forum")return <Plaza tone={tone} active={active}/>;
  if(form==="open-structure")return <OpenStructure tone={tone} active={active}/>;
  if(form==="dual-system")return <DualSystem tone={tone} active={active}/>;
  if(form==="branch-control")return <BranchControl tone={tone} active={active}/>;
  if(form==="observatory")return <Observatory tone={tone} active={active}/>;
  if(form==="headquarters")return <Organization tone={tone} active={active} variant={variant}/>;
  return kind==="towers"?<Towers tone={tone} active={active}/>:<SmallBuilding kind={kind} tone={tone} active={active}/>;
}

export function CityScenery(){
  const trees=[[-9,-3],[-8,-5],[-4,-6],[4,-5],[8,-4],[9,1],[-9,2],[-4,7],[5,7],[9,7],[0,-8]].map(([x,z])=>({position:[x,.45,z] as Vector3Tuple,scale:[.25,.9,.25] as Vector3Tuple}));
  const canopies=trees.map(item=>({position:[item.position[0],1.15,item.position[2]] as Vector3Tuple,scale:[.58,.72,.58] as Vector3Tuple}));
  return <group dispose={null}><Instances geometry={CYLINDER} material={trunkMaterial} items={trees}/><Instances geometry={DOME} material={landscapeMaterial} items={canopies}/><Instances material={landscapeMaterial} items={[[ -8.4,.18,-1.2],[ -3.2,.18,-5.3],[3.8,.18,-5.4],[8.6,.18,2.2],[-7.7,.18,6.3],[5.8,.18,7.2]].map(([x,y,z])=>({position:[x,y,z] as Vector3Tuple,scale:[1.15,.36,.62] as Vector3Tuple}))}/></group>;
}

export function KnowledgeBuilding({kind,semanticForm,tone,label,kicker,variant,position,collapsedPosition,scale=1,level,revealed,labelVisible,interactive,hovered,active,muted=false,reducedMotion=false,onHover,onSelect}:{kind:BuildingKind;semanticForm:SemanticForm;tone:CityTone;label:string;kicker:string;variant:string;position:Vector3Tuple;collapsedPosition:Vector3Tuple;scale?:number;level:number;revealed:boolean;labelVisible:boolean;interactive:boolean;hovered:boolean;active:boolean;muted?:boolean;reducedMotion?:boolean;onHover:(hovered:boolean)=>void;onSelect:()=>void}){
  const group=useRef<Group>(null);const initialized=useRef(false);const invalidate=useThree(state=>state.invalidate);const [showDetail,setShowDetail]=useState(revealed||level===0);
  useEffect(()=>{if(revealed){setShowDetail(true);return}if(level===0)return;const timer=window.setTimeout(()=>setShowDetail(false),reducedMotion?0:360);return()=>window.clearTimeout(timer)},[level,reducedMotion,revealed]);
  useLayoutEffect(()=>{if(!group.current)return;if(!initialized.current){group.current.position.set(...(revealed?position:collapsedPosition));group.current.scale.setScalar(revealed?scale:level===1?.08:.035);initialized.current=true}invalidate()},[collapsedPosition,invalidate,level,position,revealed,scale]);
  useFrame((_,delta)=>{const node=group.current;if(!node)return;const targetPosition=revealed?position:collapsedPosition;const targetScale=revealed?scale:level===1?.08:.035;if(reducedMotion){node.position.set(...targetPosition);node.scale.setScalar(targetScale);return}const lambda=revealed?11:15;node.position.x=MathUtils.damp(node.position.x,targetPosition[0],lambda,delta);node.position.y=MathUtils.damp(node.position.y,targetPosition[1],lambda,delta);node.position.z=MathUtils.damp(node.position.z,targetPosition[2],lambda,delta);const nextScale=MathUtils.damp(node.scale.x,targetScale,lambda,delta);node.scale.setScalar(nextScale);if(Math.abs(node.position.x-targetPosition[0])>.006||Math.abs(node.position.z-targetPosition[2])>.006||Math.abs(nextScale-targetScale)>.004)invalidate()});
  const emphasized=hovered||active;const labelHeight=semanticForm==="lineage"?3.5:semanticForm==="modular-stack"?3.15:semanticForm==="observatory"?3.15:semanticForm==="campus"||semanticForm==="institute"?3.25:2.75;
  return <group ref={group} dispose={null} onPointerEnter={interactive?event=>{event.stopPropagation();onHover(true);document.body.style.cursor="pointer"}:undefined} onPointerLeave={interactive?()=>{onHover(false);document.body.style.cursor=""}:undefined} onClick={interactive?event=>{event.stopPropagation();onSelect()}:undefined}>
    {active?<InkMesh geometry={CYLINDER} tone={tone} surface="accent" edges={false} position={[0,.015,0]} scale={[2.65,.025,2.65]}/>:null}
    {showDetail?<SemanticArchitecture form={semanticForm} kind={kind} tone={tone} active={emphasized} variant={variant}/>:<InkMesh tone={tone} active={false} position={[0,.45,0]} scale={[1.2,.9,1.1]} edge="light"/>}
    {labelVisible?<><mesh geometry={CYLINDER} position={[0,labelHeight-.18,0]} scale={[.018,.45,.018]} material={insetMaterial}/><Html center position={[0,labelHeight+.3,0]} distanceFactor={15} zIndexRange={[20,0]} style={{pointerEvents:"none"}}><span className="city3dLabel" data-level={level} data-active={active} data-hovered={hovered} data-muted={muted}><b>{label}</b><small>{kicker}</small></span></Html></>:null}
  </group>;
}
