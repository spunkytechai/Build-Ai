'use client';

import { ArrowLeft, CheckCircle2, Home, Sofa, Palette, Lightbulb, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createModel, hydrateModel, type BuildingModel, type Room } from '../model';

const presets = [
  ['Sofa','Living room',2.2,0.9],
  ['Dining table','Living room',1.6,0.9],
  ['Bed','Bedroom',2,1.8],
  ['Wardrobe','Bedroom',1.8,0.6],
  ['Kitchen run','Kitchen',2.4,0.6],
  ['Vanity','Bathroom',1.2,0.6],
];

type InteriorObject = {
  id: string;
  name: string;
  roomId: string;
  roomName: string;
  floor: number;
  x: number;
  y: number;
  w: number;
  h: number;
  area: number;
};

export default function InteriorPage({searchParams}:{searchParams?:{projectId?:string}}) {
  const projectId=searchParams?.projectId;
  const [model,setModel]=useState<BuildingModel>(()=>createModel(seedRooms(1),1,projectId));
  const [selected,setSelected]=useState<string>('');
  const [interiorObjects,setInteriorObjects]=useState<InteriorObject[]>([]);
  const [notice,setNotice]=useState('');

  useEffect(()=>{
    let active=true;
    if(projectId) void hydrateModel(projectId,model).then(m=>{
      if(active){setModel(m);setSelected(m.rooms[0]?.id||'');setInteriorObjects([]);}
    });
    return()=>{active=false;};
  },[projectId]);

  useEffect(()=>{
    const onConflict=(event:Event)=>{
      const detail=(event as CustomEvent<{projectId?:string}>).detail;
      if(detail?.projectId!==projectId)return;
      setNotice('The architectural model changed elsewhere. Interior view reloaded from the canonical model.');
      if(projectId) void hydrateModel(projectId,model).then(m=>{setModel(m);setSelected(m.rooms[0]?.id||'');setInteriorObjects([]);});
    };
    window.addEventListener('build-ai:model-conflict',onConflict);
    return()=>window.removeEventListener('build-ai:model-conflict',onConflict);
  },[projectId,model]);

  const rooms=useMemo(()=>model.rooms,[model]);
  const selectedRoom=rooms.find(r=>r.id===selected)||rooms[0];

  function addPreset(name:string,_roomName:string,w:number,h:number){
    if(!selectedRoom)return;
    const id=`int-${Date.now()}-${Math.random().toString(36).slice(2,7)}`;
    const item:InteriorObject={
      id,
      name:`${name} • ${selectedRoom.name}`,
      roomId:selectedRoom.id,
      roomName:selectedRoom.name,
      floor:selectedRoom.floor,
      x:Math.min(Math.max(0,model.plot.width-w),selectedRoom.x+0.25),
      y:Math.min(Math.max(0,model.plot.depth-h),selectedRoom.y+0.25),
      w,h,area:w*h,
    };
    setInteriorObjects(current=>[...current,item]);
    setNotice(`${name} added to ${selectedRoom.name}. Architectural room geometry was not modified.`);
  }

  return <main className="appShell">
    <header className="workspaceTop"><Link href={projectId?`/projects/${projectId}/3d`:'/projects/new/3d'} className="back"><ArrowLeft size={17}/> 3D Model</Link><span>Interior</span><span className="stepCount">05 / 06</span></header>
    <section className="sitePage">
      <div className="sectionLabel">INTERIOR ENGINE</div><h1>Turn the building model into living space.</h1>
      <p className="siteLead">Interior objects are a separate design layer anchored to the canonical architectural rooms. Furniture and fixtures cannot mutate architectural geometry.</p>
      {notice&&<div className="provenance" style={{marginTop:24}}><CheckCircle2 size={18}/><div><strong>Model state</strong><span>{notice}</span></div></div>}
      <div className="featureStrip" style={{marginTop:28,borderRadius:16,overflow:'hidden'}}>{[['Furniture',Sofa,'Place furniture against room geometry.'],['Materials',Palette,'Define finish and material intent.'],['Lighting',Lightbulb,'Plan fixture and lighting zones.'],['Room logic',Home,'Keep interiors linked to architectural rooms.']].map(([title,Icon,text])=><Feature key={title as string} icon={<Icon/>} title={title as string} text={text as string}/>)}</div>
      <div className="workflowCards" style={{marginTop:24}}>{rooms.map(room=><button type="button" className="workflowCard" key={room.id} onClick={()=>setSelected(room.id)} style={{textAlign:'left',cursor:'pointer',border:selectedRoom?.id===room.id?'1px solid currentColor':undefined}}><div className="stepNo">{room.floor+1}</div><CheckCircle2 size={20}/><div><h2>{room.name}</h2><p>{room.w.toFixed(1)}m × {room.h.toFixed(1)}m · {room.area.toFixed(1)} m²</p></div></button>)}</div>
      <div className="start" style={{margin:'24px 0 0',display:'block'}}><div><div className="sectionLabel">SELECTED ROOM</div><h2 style={{fontSize:28}}>{selectedRoom?.name||'Select a room'}</h2><p>Add deterministic interior presets without altering architectural room boundaries.</p></div><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}>{presets.filter(p=>!selectedRoom||p[1]===selectedRoom.name).map(([name,room,w,h])=><button key={name as string} type="button" className="primary" onClick={()=>addPreset(name as string,room as string,w as number,h as number)}>{name}</button>)}</div></div>
      <div className="workflowCards" style={{marginTop:24}}>{interiorObjects.map(item=><div className="workflowCard" key={item.id}><div className="stepNo">+</div><CheckCircle2 size={20}/><div><h2>{item.name}</h2><p>{item.w}m × {item.h}m · linked to {item.roomName}</p></div></div>)}</div>
      <div className="start" style={{margin:'24px 0 0'}}><div><div className="sectionLabel">MODEL LINK</div><h2 style={{fontSize:28}}>Interior layer is isolated.</h2><p>{interiorObjects.length} interior object{interiorObjects.length===1?'':'s'} in this session. Architectural model version remains {model.version}.</p></div><button type="button" className="primary" onClick={()=>setNotice('Interior objects are session-local until persistent interior storage is enabled.')}><RotateCcw size={16}/> Check state</button><Link className="primary" href={projectId?`/projects/${projectId}/documents`:'/projects/new/documents'}>Continue to documents</Link></div>
    </section>
  </main>;
}

function seedRooms(n:number):Room[]{return Array.from({length:Math.max(1,n)},(_,i)=>({id:`room-${i+1}`,name:i===0?'Living room':`Room ${i+1}`,floor:0,x:.5,y:.5,w:5,h:4,area:20}));}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>; }
