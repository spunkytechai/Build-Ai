'use client';
import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NewProject() {
 const router=useRouter();
 const [name,setName]=useState('My Building Project'); const [type,setType]=useState('Residential'); const [address,setAddress]=useState(''); const [lat,setLat]=useState(''); const [lon,setLon]=useState(''); const [width,setWidth]=useState(''); const [depth,setDepth]=useState('');
 const [result,setResult]=useState<any>(null); const [loading,setLoading]=useState(false); const [error,setError]=useState('');
 async function analyze(){
  setLoading(true); setResult(null); setError('');
  try {
   const r=await fetch('/api/site-analysis',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({address,lat:lat?Number(lat):undefined,lon:lon?Number(lon):undefined,plotWidth:Number(width),plotDepth:Number(depth),buildingType:type})});
   const data=await r.json();
   if(!r.ok) throw new Error(data?.error || 'Site analysis failed');
   const projectResponse=await fetch('/api/projects',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({name,type,address,lat:lat?Number(lat):null,lon:lon?Number(lon):null,width:Number(width),depth:Number(depth),jurisdiction:data.jurisdiction,authority:data.authority,analysis:data})});
   const projectData=await projectResponse.json();
   if(!projectResponse.ok) throw new Error(projectData?.error || 'Project creation failed');
   const id=projectData.project.id;
   localStorage.setItem('build-ai:active-project:v1',id);
   localStorage.setItem(`build-ai:site:${id}:v1`,JSON.stringify({address,lat:lat?Number(lat):null,lon:lon?Number(lon):null,width:Number(width),depth:Number(depth),analysis:data}));
   setResult(data);
   setTimeout(()=>router.push(`/projects/${id}`),350);
  } catch(e) { setError(e instanceof Error ? e.message : 'Unable to create project'); }
  finally { setLoading(false); }
 }
 return <main className="workspace"><header><a href="/" className="brand">BUILD AI</a><span>Project Setup</span><a href="/dashboard">Dashboard</a></header>
 <section className="panel"><div><p className="eyebrow">01 · PROJECT + SITE</p><h1>Start with the idea. Resolve the site.</h1><p className="muted">Create a project, provide site coordinates and plot dimensions, then continue into the evidence-aware building workflow.</p></div>
 <div className="grid"><label>Project name<input value={name} onChange={e=>setName(e.target.value)}/></label><label>Building type<select value={type} onChange={e=>setType(e.target.value)}><option>Residential</option><option>Mixed use</option><option>Commercial</option></select></label><label className="wide">Address / locality<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. Sector 44, Gurugram" /></label><label>Latitude<input value={lat} onChange={e=>setLat(e.target.value)} placeholder="28.6139" inputMode="decimal" /></label><label>Longitude<input value={lon} onChange={e=>setLon(e.target.value)} placeholder="77.2090" inputMode="decimal" /></label><label>Plot width (m)<input value={width} onChange={e=>setWidth(e.target.value)} placeholder="10" inputMode="decimal" /></label><label>Plot depth (m)<input value={depth} onChange={e=>setDepth(e.target.value)} placeholder="20" inputMode="decimal" /></label></div>
 <button onClick={analyze} disabled={loading || (!address && (!lat || !lon)) || !width || !depth}>{loading?'Resolving & saving…':'Resolve site & create project'} <ArrowRight size={16}/></button>
 {error&&<div className="result"><div className="wide"><span>Error</span><strong>{error}</strong></div></div>}
 {result&&<div className="result"><div><span>Jurisdiction</span><strong>{result.jurisdiction}</strong></div><div><span>Planning source</span><strong>{result.planningSource}</strong></div><div><span>Plot area</span><strong>{result.plotArea} m²</strong></div><div className="wide"><span>Spatial evidence</span><strong>{Object.keys(result.evidence||{}).length ? 'Resolved' : 'Context only / further evidence required'}</strong></div><div className="wide"><CheckCircle2 size={16}/><span>Project saved. Opening the project workspace…</span></div></div>}</section></main>;
}
