'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Building2, MapPinned, Plus, Ruler, Box, FileText } from 'lucide-react';

type Project = { id: string; name: string; location: string; type: string; updated: string };
const KEY = 'build-ai:projects:v1';

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { try { setProjects(JSON.parse(localStorage.getItem(KEY) || '[]')); } catch {} }, []);
  return <main className="workspace"><header><a href="/" className="brand">BUILD AI</a><span>Project Dashboard</span><a className="navCta" href="/projects/new"><Plus size={15}/> New project</a></header>
    <section className="panel dashboardHero"><div><p className="eyebrow">BUILDING INTELLIGENCE</p><h1>Your building projects.</h1><p className="muted">Manage site intelligence, feasibility, design and the persistent building model from one workspace.</p></div><a className="primary" href="/projects/new">Create project <ArrowRight size={16}/></a></section>
    <section className="projectGrid">{projects.length ? projects.map(p => <a className="projectCard" href={`/projects/${p.id}`} key={p.id}><div className="projectIcon"><Building2/></div><div><strong>{p.name}</strong><span>{p.location || 'Location unresolved'}</span><small>{p.type || 'Residential'} · Updated {p.updated}</small></div><ArrowRight size={17}/></a>) : <div className="empty"><Building2 size={28}/><h2>No projects yet</h2><p>Create a project to begin with site and regulatory intelligence.</p><a className="primary" href="/projects/new">Start first project <ArrowRight size={16}/></a></div>}</section>
    <section className="featureStrip"><Mini icon={<MapPinned/>} title="Site"/><Mini icon={<Ruler/>} title="Feasibility"/><Mini icon={<Box/>} title="2D + 3D"/><Mini icon={<FileText/>} title="Documents"/></section>
  </main>;
}
function Mini({icon,title}:{icon:React.ReactNode;title:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><h3>{title}</h3></div>; }
