'use client';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProject() {
 const router=useRouter();
 const [name,setName]=useState('My Building Project'); const [type,setType]=useState('Residential'); const [lat,setLat]=useState(''); const [lon,setLon]=useState(''); const [width,setWidth]=useState(''); const [depth,setDepth]=useState('');
 const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 async function analyze(){
  setLoading(true); setResult(null); setError('');
  try {
   const r=await fetch('/api/site-resolve',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({lat:Number(lat),lon:Number(lon),width:Number(width),depth:Number(depth)})});
   const data=await r.json();
   if(!r.ok) throw new Error(data?.error || 'Site resolution failed');
   const id=crypto.randomUUID();
   const project={id,name:name.trim()||'My Building Project',location:data.jurisdiction?.name||data.jurisdiction?.authority||'Location unresolved',type,updated:new Date().toLocaleDateString()};
   const all=JSON.parse(localStorage.getItem('build-ai:projects:v1')||'[]');
   localStorage.setItem('build-ai:projects:v1',JSON.stringify([project,...all]));
   localStorage.setItem('build-ai:active-project:v1',id);
   localStorage.setItem(`build-ai:site:${id}:v1`,JSON.stringify({lat:Number(lat),lon:Number(lon),width:Number(width),depth:Number(depth),analysis:data}));
   setResult(data);
   setTimeout(()=>router.push(`/projects/${id}`),350);
  } catch(e) { setError(e instanceof Error ? e.message : 'Unable to resolve site'); }
  finally { setLoading(false); }
 }
 return <main className="workspace"><header><a href="/" className="brand">BUILD AI</a><span>Project Setup</span><a href="/dashboard">Dashboard</a></header>
 <section className="panel"><div><p className="eyebrow">01 · PROJECT + SITE</p><h1>Start with the idea. Resolve the site.</h1><p className="muted">Create a project, provide site coordinates and plot dimensions, then continue into the evidence-aware building workflow.</p></div>
 <div className="grid"><label>Project name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Building type<select value={type} onChange={e=>setType(e.target.value)}><option>Residential</option><option>Mixed use</option><option>Commercial</option></select></label><label>Latitude<input value={lat} onChange={e=>setLat(e.target.value)} placeholder="28.6139" inputMode="decimal" /></label><label>Longitude<input value={lon} onChange={e=>setLon(e.target.value)} placeholder="77.2090" inputMode="decimal" /></label><label>Plot width (m)<input value={width} onChange={e=>setWidth(e.target.value)} placeholder="10" inputMode="decimal" /></label><label>Plot depth (m)<input value={depth} onChange={e=>setDepth(e.target.value)} placeholder="20" inputMode="decimal" /></label></div>
 <button onClick={analyze} disabled={loading || !lat || !lon || !width || !depth}>{loading?'Resolving…':'Resolve site & create project'} <ArrowRight size={16}/></button>
 {error&&<div className="result"><div className="wide"><span>Error</span><strong>{error}</strong></div></div>}
 {result&&<div className="result"><div><span>Authority</span><strong>{result.jurisdiction?.authority||'Unresolved'}</strong></div><div><span>Confidence</span><strong>{result.jurisdiction?.confidence||'Unknown'}</strong></div><div><span>Plot area</span><strong>{result.plot?`${result.plot.area_sqm} m²`:'Not supplied'}</strong></div><div className="wide"><span>Regulatory engine</span><strong>{result.regulatory_status||'UNKNOWN'}</strong></div><div className="wide"><CheckCircle2 size={16}/><span>Project created. Opening the project workspace…</span></div></div>}</section></main>;
}
