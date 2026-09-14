'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Building2, MapPinned, Plus, Ruler, Box, FileText } from 'lucide-react';

type Project = { id: string; name: string; description?: string | null; status?: string; updated_at: string; sites?: { address?: string | null; jurisdiction?: string | null }[] };

export default function Dashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    fetch('/api/projects')
      .then(async r => { const data=await r.json(); if(!r.ok) throw new Error(data?.error || 'Unable to load projects'); return data; })
      .then(data => setProjects(data.projects || []))
      .catch(e => setError(e instanceof Error ? e.message : 'Unable to load projects'))
      .finally(() => setLoading(false));
  }, []);
  return <main className="workspace"><header><a href="/" className="brand">BUILD AI</a><span>Project Dashboard</span><a className="navCta" href="/projects/new"><Plus size={15}/> New project</a></header>
    <section className="panel dashboardHero"><div><p className="eyebrow">BUILDING INTELLIGENCE</p><h1>Your building projects.</h1><p className="muted">Manage site intelligence, feasibility, design and the persistent building model from one workspace.</p></div><a className="primary" href="/projects/new">Create project <ArrowRight size={16}/></a></section>
    <section className="projectGrid">{loading ? <div className="empty"><Building2 size={28}/><h2>Loading projects…</h2><p>Connecting to your project workspace.</p></div> : error ? <div className="empty"><Building2 size={28}/><h2>Could not load projects</h2><p>{error}</p><a className="primary" href="/auth">Sign in again</a></div> : projects.length ? projects.map(p => { const site=p.sites?.[0]; const location=site?.jurisdiction || site?.address || 'Location unresolved'; return <a className="projectCard" href={`/projects/${p.id}`} key={p.id}><div className="projectIcon"><Building2/></div><div><strong>{p.name}</strong><span>{location}</span><small>{p.description?.split(' · ')[0] || 'Residential'} · Updated {new Date(p.updated_at).toLocaleDateString()}</small></div><ArrowRight size={17}/></a>; }) : <div className="empty"><Building2 size={28}/><h2>No projects yet</h2><p>Create a project to begin with site and regulatory intelligence.</p><a className="primary" href="/projects/new">Start first project <ArrowRight size={16}/></a></div>}</section>
    <section className="featureStrip"><Mini icon={<MapPinned/>} title="Site"/><Mini icon={<Ruler/>} title="Feasibility"/><Mini icon={<Box/>} title="2D + 3D"/><Mini icon={<FileText/>} title="Documents"/></section>
  </main>;
}
function Mini({icon,title}:{icon:React.ReactNode;title:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><h3>{title}</h3></div>; }
