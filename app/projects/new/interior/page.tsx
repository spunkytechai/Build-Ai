'use client';

import { ArrowLeft, CheckCircle2, Home, Sofa, Palette, Lightbulb, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { createModel, hydrateModel, type BuildingModel, type Room } from '../model';

const spaces = [
  ['Living room','Furniture, circulation and daylight'],
  ['Kitchen','Work triangle, storage and finishes'],
  ['Bedroom','Bed placement, wardrobes and clearances'],
  ['Bathroom','Fixtures, wet-zone planning and ventilation'],
];
const presets = [
  ['Sofa','Living room',2.2,0.9],
  ['Dining table','Living room',1.6,0.9],
  ['Bed','Bedroom',2,1.8],
  ['Wardrobe','Bedroom',1.8,0.6],
  ['Kitchen run','Kitchen',2.4,0.6],
  ['Vanity','Bathroom',1.2,0.6],
];

export default function InteriorPage({searchParams}:{searchParams?:{projectId?:string}}) {
  const projectId=searchParams?.projectId;
  const [model,setModel]=useState<BuildingModel>(()=>createModel(seedRooms(1),1,projectId));
  const [selected,setSelected]=useState<string>('');
  const [notice,setNotice]=useState('');
  useEffect(()=>{let active=true; if(projectId) void hydrateModel(projectId,model).then(m=>{if(active){setModel(m);setSelected(m.rooms[0]?.id||'');}}); return()=>{active=false;};},[projectId]);
  useEffect(()=>{const onConflict=(event:Event)=>{const detail=(event as CustomEvent<{projectId?:string}>).detail;if(detail?.projectId!==projectId)return;setNotice('The architectural model changed elsewhere. Interior view reloaded from the canonical model.');if(projectId)void hydrateModel(projectId,model).then(setModel);};window.addEventListener('build-ai:model-conflict',onConflict);return()=>window.removeEventListener('build-ai:model-conflict',onConflict);},[projectId,model]);
  const rooms=useMemo(()=>model.rooms,[model]);
  const selectedRoom=rooms.find(r=>r.id===selected)||rooms[0];
  function addPreset(name:string,roomName:string,w:number,h:number){if(!selectedRoom)return;const id=`int-${Date.now()}`;const item:Room={id,name:`${name} • ${selectedRoom.name}`,floor:selectedRoom.floor,x:Math.min(model.plot.width-w,selectedRoom.x+0.25),y:Math.min(model.plot.depth-h,selectedRoom.y+0.25),w,h,area:w*h};setModel({...model,rooms:[...model.rooms,item],version:model.version+1});setNotice(`${name} added to ${selectedRoom.name}. Interior objects are stored separately from architectural geometry.`);}
  return <main className="appShell">
    <header className="workspaceTop"><Link href={projectId?`/projects/${projectId}/3d`:'/projects/new/3d'} className="back"><ArrowLeft size={17}/> 3D Model</Link><span>Interior</span><span className="stepCount">05 / 06</span></header>
    <section className="sitePage">
      <div className="sectionLabel">INTERIOR ENGINE</div><h1>Turn the building model into living space.</h1>
      <p className="siteLead">Interior objects are layered onto the canonical architectural model. Room geometry remains unchanged while furniture, fixtures and finish intent are added as design data.</p>
      {notice&&<div className="provenance" style={{marginTop:24}}><CheckCircle2 size={18}/><div><strong>Model state</strong><span>{notice}</span></div></div>}
      <div className="featureStrip" style={{marginTop:28,borderRadius:16,overflow:'hidden'}}>{[['Furniture',Sofa,'Place furniture against room geometry.'],['Materials',Palette,'Define finish and material intent.'],['Lighting',Lightbulb,'Plan fixture and lighting zones.'],['Room logic',Home,'Keep interiors linked to the building model.']].map(([title,Icon,text])=><Feature key={title as string} icon={<Icon/>} title={title as string} text={text as string}/>)}</div>
      <div className="workflowCards" style={{marginTop:24}}>{rooms.filter(r=>!r.id.startsWith('int-')).map(room=><button type="button" className="workflowCard" key={room.id} onClick={()=>setSelected(room.id)} style={{textAlign:'left',cursor:'pointer',border:selectedRoom?.id===room.id?'1px solid currentColor':undefined}}><div className="stepNo">{room.floor+1}</div><CheckCircle2 size={20}/><div><h2>{room.name}</h2><p>{room.w.toFixed(1)}m × {room.h.toFixed(1)}m · {room.area.toFixed(1)} m²</p></div></button>)}</div>
      <div className="start" style={{margin:'24px 0 0',display:'block'}}><div><div className="sectionLabel">SELECTED ROOM</div><h2 style={{fontSize:28}}>{selectedRoom?.name||'Select a room'}</h2><p>Add deterministic interior presets without altering architectural room boundaries.</p></div><div style={{display:'flex',gap:10,flexWrap:'wrap',marginTop:18}}>{presets.filter(p=>!selectedRoom||p[1]===selectedRoom.name).map(([name,room,w,h])=><button key={name as string} type="button" className="primary" onClick={()=>addPreset(name as string,room as string,w as number,h as number)}>{name}</button>)}</div></div>
      <div className="workflowCards" style={{marginTop:24}}>{rooms.filter(r=>r.id.startsWith('int-')).map(item=><div className="workflowCard" key={item.id}><div className="stepNo">+</div><CheckCircle2 size={20}/><div><h2>{item.name}</h2><p>{item.w}m × {item.h}m · linked to room {rooms.find(r=>r.id===selectedRoom?.id)?.name||'model'}</p></div></div>)}</div>
      <div className="start" style={{margin:'24px 0 0'}}><div><div className="sectionLabel">MODEL LINK</div><h2 style={{fontSize:28}}>Interior layer is ready.</h2><p>Resetting this view never changes the underlying architectural room geometry.</p></div><button type="button" className="primary" onClick={()=>setNotice('Interior layer is local to this session until persistent interior storage is enabled.')}><RotateCcw size={16}/> Check state</button><Link className="primary" href={projectId?`/projects/${projectId}/documents`:'/projects/new/documents'}>Continue to documents</Link></div>
    </section>
  </main>;
}
function seedRooms(n:number):Room[]{return Array.from({length:Math.max(1,n)},(_,i)=>({id:`room-${i+1}`,name:i===0?'Living room':`Room ${i+1}`,floor:0,x:.5,y:.5,w:5,h:4,area:20}));}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>; }
