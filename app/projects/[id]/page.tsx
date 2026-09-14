'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, CheckCircle2, Circle, MapPinned, Ruler, LayoutDashboard, Box, Home, FileText } from 'lucide-react';

type Project = { id:string; name:string; location:string; type:string; updated:string };
const PROJECTS='build-ai:projects:v1';
const MODEL='build-ai:building-model:v3';
const steps = [
  ['site','Site Intelligence','Resolve jurisdiction, planning context and site evidence.',MapPinned],
  ['feasibility','Feasibility','Evaluate the buildable envelope and regulatory evidence.',Ruler],
  ['design','2D Architecture','Edit the persistent floor-plan geometry.',LayoutDashboard],
  ['3d','3D Model','Inspect the same building model in 3D.',Box],
  ['interior','Interior','Develop rooms, furniture and finishes.',Home],
  ['documents','Documents','Generate evidence-backed project documentation.',FileText],
] as const;

export default function ProjectPage({params}:{params:Promise<{id:string}>}) {
 const [id,setId]=useState(''); const [project,setProject]=useState<Project|null>(null);
 useEffect(()=>{params.then(p=>{setId(p.id);try{const all=JSON.parse(localStorage.getItem(PROJECTS)||'[]');setProject(all.find((x:Project)=>x.id===p.id)||null);}catch{}})},[params]);
 const model = typeof window!=='undefined' ? (()=>{try{return JSON.parse(localStorage.getItem(MODEL)||'null')}catch{return null}})() : null;
 return <main className="workspace"><header><a href="/dashboard" className="brand">BUILD AI</a><span>Project Workspace</span><a href="/projects/new">New project</a></header>
  <section className="panel"><p className="eyebrow">PROJECT</p><h1>{project?.name || 'Building project'}</h1><p className="muted">{project?.location || 'Location pending'} · {project?.type || 'Residential'}</p><div className="projectSummary"><div><span>Building model</span><strong>{model ? `v${model.version}` : 'Not started'}</strong></div><div><span>Rooms</span><strong>{model?.rooms?.length ?? 0}</strong></div><div><span>Regulatory status</span><strong>{model?.status === 'unresolved' ? 'Evidence required' : 'Ready'}</strong></div></div></section>
  <section className="workflowCards">{steps.map(([key,title,desc,Icon],i)=><a key={key} href={`/projects/new/${key==='design'?'architecture':key}`} className="workflowCard"><div className="stepNo">0{i+1}</div><Icon size={20}/><div><h2>{title}</h2><p>{desc}</p></div><ArrowRight size={17}/></a>)}</section>
 </main>;
}
