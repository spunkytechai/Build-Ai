"use client";
import Link from "next/link";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Grid, Environment, Html } from "@react-three/drei";
import { useMemo, useState } from "react";
import { ArrowLeft, Box, Layers3, Eye, EyeOff, Rotate3D, ShieldCheck } from "lucide-react";
import * as THREE from "three";

type RoomType = "living"|"dining"|"kitchen"|"master"|"bedroom"|"bathroom"|"utility"|"stair"|"parking";
type Room = { id:string; type:RoomType; name:string; area:number; x:number; y:number; w:number; h:number; floor:number };

const colors:Record<RoomType,string> = {
  living:"#dcebe1", dining:"#e9eee9", kitchen:"#e8e5dc", master:"#e4e0ea", bedroom:"#e5eaf0",
  bathroom:"#dce9ed", utility:"#e9e9e5", stair:"#e6e2dc", parking:"#e2e5e4"
};
const names:Record<RoomType,string> = {living:"Living",dining:"Dining",kitchen:"Kitchen",master:"Master Bedroom",bedroom:"Bedroom",bathroom:"Bathroom",utility:"Utility",stair:"Stair",parking:"Parking"};

function seedRooms():Room[]{
  const specs:[RoomType,number,number,number,number][]=[
    ["living",0.04,0.04,0.40,0.27],["dining",0.46,0.04,0.23,0.20],["kitchen",0.70,0.04,0.25,0.20],
    ["master",0.04,0.34,0.32,0.27],["bedroom",0.38,0.27,0.27,0.22],["bedroom",0.68,0.27,0.27,0.22],
    ["bathroom",0.38,0.51,0.18,0.14],["bathroom",0.58,0.51,0.18,0.14],["utility",0.78,0.51,0.17,0.14],
    ["stair",0.04,0.65,0.24,0.16],["parking",0.31,0.72,0.34,0.17]
  ];
  return specs.map(([type,x,y,w,h],i)=>({id:`r-0-${i}`,type,name:i>0&&type==="bedroom"?`Bedroom ${i===5?2:1}`:names[type],area:{living:24,dining:12,kitchen:11,master:18,bedroom:14,bathroom:5,utility:5,stair:9,parking:18}[type],x,y,w,h,floor:0}));
}

function RoomMesh({room,selected,onSelect,visible}:{room:Room;selected:boolean;onSelect:()=>void;visible:boolean}){
  if(!visible)return null;
  const sx=room.w*12, sz=room.h*10, px=(room.x+room.w/2)*12-6, pz=(room.y+room.h/2)*10-5;
  return <group position={[px,1.5,pz]} onClick={(e)=>{e.stopPropagation();onSelect()}}>
    <mesh castShadow receiveShadow position={[0,1.5,0]}>
      <boxGeometry args={[sx,3,sz]}/><meshStandardMaterial color={selected?"#8fb59f":colors[room.type]} transparent opacity={0.92}/>
    </mesh>
    <lineSegments position={[0,1.5,0]}>
      <edgesGeometry args={[new THREE.BoxGeometry(sx,3,sz)]}/><lineBasicMaterial color={selected?"#164d37":"#5b6862"} linewidth={selected?2:1}/>
    </lineSegments>
    {selected&&<Html center position={[0,3.3,0]}><div style={{background:"#18231f",color:"white",padding:"5px 8px",borderRadius:6,fontSize:11,whiteSpace:"nowrap"}}>{room.name} · {room.area} m²</div></Html>}
  </group>
}

export default function ThreeDPage(){
  const rooms=useMemo(seedRooms,[]); const [selected,setSelected]=useState(rooms[0].id); const [showRooms,setShowRooms]=useState(true); const [showEnvelope,setShowEnvelope]=useState(true); const [showGround,setShowGround]=useState(true);
  const active=rooms.find(r=>r.id===selected)??rooms[0];
  return <main style={{minHeight:"100vh",background:"#f5f7f5",color:"#18231f",fontFamily:"Arial, sans-serif"}}>
    <header style={{height:62,borderBottom:"1px solid #dbe2df",background:"#fff",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"0 22px"}}>
      <Link href="/projects/new/architecture" style={{display:"flex",gap:8,alignItems:"center",color:"#3d4b46",textDecoration:"none",fontSize:13}}><ArrowLeft size={16}/> Architecture</Link>
      <div style={{fontWeight:800,letterSpacing:1}}>BUILD AI <span style={{fontSize:10,fontWeight:600,color:"#74817c",marginLeft:8}}>3D BUILDING MODEL · v0.6</span></div>
      <div style={{display:"flex",gap:8,alignItems:"center",fontSize:10,fontWeight:700,color:"#3d6652"}}><ShieldCheck size={14}/> MODEL SYNCED</div>
    </header>
    <div style={{display:"grid",gridTemplateColumns:"260px 1fr 290px",height:"calc(100vh - 62px)"}}>
      <aside style={{background:"#fff",borderRight:"1px solid #dbe2df",padding:20,overflow:"auto"}}>
        <div style={{fontSize:10,fontWeight:800,letterSpacing:1.3,color:"#718079"}}>05 / 06 · 3D</div>
        <h1 style={{fontSize:23,lineHeight:1.1,margin:"10px 0 8px"}}>One building model, multiple views.</h1>
        <p style={{fontSize:12,lineHeight:1.55,color:"#68756f"}}>The 3D scene is generated from the same structured room geometry used by the plan engine.</p>
        <div style={{marginTop:22,fontSize:10,fontWeight:800,letterSpacing:1,color:"#718079"}}>MODEL OBJECTS</div>
        {rooms.map(r=><button key={r.id} onClick={()=>setSelected(r.id)} style={{width:"100%",textAlign:"left",border:0,borderBottom:"1px solid #edf0ee",background:selected===r.id?"#edf4ef":"transparent",padding:"10px 8px",cursor:"pointer",color:"#25322e",fontSize:12,borderRadius:5}}><b>{r.name}</b><span style={{float:"right",color:"#74817c"}}>{r.area} m²</span></button>)}
        <div style={{marginTop:20,padding:12,background:"#f3f6f4",border:"1px solid #dfe6e2",borderRadius:8,fontSize:11,lineHeight:1.5}}><b>Source of truth</b><br/>Floor 01 · Model version 0.6.0<br/>Geometry IDs preserved from concept.</div>
      </aside>
      <section style={{position:"relative",background:"#e9eeeb"}}>
        <div style={{position:"absolute",zIndex:3,left:16,top:14,right:16,display:"flex",justifyContent:"space-between",pointerEvents:"none"}}>
          <div style={{background:"rgba(255,255,255,.94)",border:"1px solid #d7dfdb",borderRadius:7,padding:"8px 11px",fontSize:11,fontWeight:700}}>3D · FLOOR 01 · ORBIT / PAN / ZOOM</div>
          <div style={{background:"rgba(255,255,255,.94)",border:"1px solid #d7dfdb",borderRadius:7,padding:"8px 11px",fontSize:11}}>N ↑ · FRONTAGE ↓</div>
        </div>
        <Canvas shadows camera={{position:[15,13,16],fov:42}} onPointerMissed={()=>setSelected("")}>
          <ambientLight intensity={1.6}/><directionalLight position={[8,16,8]} intensity={2.5} castShadow/>
          <Environment preset="city"/>
          {showGround&&<mesh rotation={[-Math.PI/2,0,0]} receiveShadow position={[0,0,0]}><planeGeometry args={[26,22]}/><meshStandardMaterial color="#dfe5e1"/></mesh>}
          {showEnvelope&&<mesh position={[0,1.65,0]}><boxGeometry args={[12.2,3.3,10.2]}/><meshBasicMaterial color="#3d6b55" wireframe transparent opacity={0.22}/></mesh>}
          {showRooms&&rooms.map(r=><RoomMesh key={r.id} room={r} selected={selected===r.id} onSelect={()=>setSelected(r.id)} visible={showRooms}/>)}
          <Grid args={[24,20]} position={[0,0.02,0]} cellSize={1} cellThickness={0.5} sectionSize={5} sectionThickness={1}/>
          <OrbitControls makeDefault enableDamping dampingFactor={0.08} minDistance={8} maxDistance={30}/>
        </Canvas>
      </section>
      <aside style={{background:"#fff",borderLeft:"1px solid #dbe2df",padding:18}}>
        <div style={{display:"flex",alignItems:"center",gap:8,fontSize:11,fontWeight:800,letterSpacing:1,color:"#5e6c66"}}><Rotate3D size={15}/> VIEWER CONTROLS</div>
        <div style={{marginTop:18,display:"grid",gap:8}}>
          <button onClick={()=>setShowRooms(!showRooms)} style={control}><span>{showRooms?<Eye size={14}/>:<EyeOff size={14}/>} Rooms</span><b>{showRooms?"Visible":"Hidden"}</b></button>
          <button onClick={()=>setShowEnvelope(!showEnvelope)} style={control}><span><Box size={14}/> Envelope</span><b>{showEnvelope?"Visible":"Hidden"}</b></button>
          <button onClick={()=>setShowGround(!showGround)} style={control}><span><Layers3 size={14}/> Ground</span><b>{showGround?"Visible":"Hidden"}</b></button>
        </div>
        <div style={{marginTop:22,fontSize:10,fontWeight:800,letterSpacing:1,color:"#718079"}}>SELECTED SPACE</div>
        <div style={{marginTop:8,padding:14,border:"1px solid #dbe2df",borderRadius:8}}><div style={{fontWeight:800,fontSize:15}}>{active?.name??"None"}</div><div style={{fontSize:12,color:"#697671",marginTop:5}}>{active?.area??0} m² · Floor 01</div></div>
        <div style={{marginTop:20,padding:13,borderRadius:8,background:"#fff7e8",border:"1px solid #ead9b7",fontSize:11,lineHeight:1.5}}><b>Regulatory status: indeterminate</b><br/>3D geometry is visualized from the concept model. Verified setbacks/FAR/coverage are still required before compliance can be asserted.</div>
        <div style={{position:"absolute",bottom:18,right:18,left:"calc(100% - 280px)",fontSize:10,color:"#77837e"}}>BUILD AI · deterministic geometry + AI advisory</div>
      </aside>
    </div>
  </main>
}

const control:React.CSSProperties={width:"100%",border:"1px solid #dbe2df",background:"#fff",padding:"10px 11px",borderRadius:7,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11,cursor:"pointer",color:"#26332e"};
