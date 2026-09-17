'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Box, FileText, Home, LayoutDashboard, MapPinned, Ruler, ShieldCheck, Sparkles } from 'lucide-react';

const STAGES = {
  site: { title: 'Site Intelligence', icon: MapPinned, description: 'Review the resolved site context, coordinates, dimensions and planning evidence.', next: 'feasibility' },
  feasibility: { title: 'Feasibility', icon: Ruler, description: 'Review the regulatory evidence and buildable-envelope inputs before design.', next: 'architecture' },
  architecture: { title: '2D Architecture', icon: LayoutDashboard, description: 'Prepare the persistent floor-plan model that will become the shared source of truth.', next: '3d' },
  '3d': { title: '3D Model', icon: Box, description: 'Inspect the building model in a spatial 3D workflow.', next: 'interior' },
  interior: { title: 'Interior', icon: Home, description: 'Develop room-level interior decisions against the persistent building model.', next: 'documents' },
  documents: { title: 'Documents', icon: FileText, description: 'Prepare evidence-backed project documentation from the verified project state.', next: 'site' },
} as const;

type Stage = keyof typeof STAGES;
type Site = { address?: string | null; latitude?: number | null; longitude?: number | null; jurisdiction?: string | null; authority?: string | null; plot_width_m?: number | null; plot_depth_m?: number | null; building_type?: string | null };
type Project = { id: string; name: string; description?: string | null; status?: string | null; sites?: Site[] };

type Model = { version?: number; status?: string; model?: { rooms?: unknown[]; plot?: { width?: number; depth?: number } } };

export default function StagePage({ params }: { params: Promise<{ id: string; stage: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const stage = useMemo<Stage>(() => {
    const raw = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '').get('stage');
    return (raw && raw in STAGES ? raw : 'site') as Stage;
  }, []);
  const [pathStage, setPathStage] = useState<Stage>('site');

  useEffect(() => {
    let active = true;
    params.then(async ({ id, stage: rawStage }) => {
      const selected = rawStage in STAGES ? rawStage as Stage : stage;
      try {
        const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
        const projectsPayload = await projectsResponse.json().catch(() => null);
        if (!projectsResponse.ok) throw new Error(projectsPayload?.error || 'Unable to load project');
        const found = (projectsPayload?.projects as Project[] | undefined)?.find((item) => item.id === id) || null;
        if (!found) throw new Error('Project not found');
        const modelResponse = await fetch(`/api/projects/${encodeURIComponent(id)}/model`, { cache: 'no-store' });
        const modelPayload = await modelResponse.json().catch(() => null);
        if (!active) return;
        setProject(found);
        setModel(modelPayload?.model ?? null);
        setPathStage(selected);
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load stage');
      } finally {
        if (active) setLoading(false);
      }
    });
    return () => { active = false; };
  }, [params, stage]);

  if (loading) return <main style={shell}>Loading workflow stage…</main>;
  if (error || !project) return <main style={shell}><section style={panel}><h1>Unable to load workflow</h1><p>{error || 'Project not found.'}</p><a href="/dashboard">Return to dashboard</a></section></main>;

  const config = STAGES[pathStage];
  const Icon = config.icon;
  const site = project.sites?.[0];
  const dimensions = site?.plot_width_m && site?.plot_depth_m ? `${site.plot_width_m} × ${site.plot_depth_m} m` : 'Not resolved';
  const rooms = Array.isArray(model?.model?.rooms) ? model.model.rooms.length : 0;

  return <main style={shell}>
    <header style={header}><a href={`/projects/${project.id}`} style={brand}>Build Ai</a><nav style={{display:'flex',gap:16,flexWrap:'wrap'}}>{(Object.keys(STAGES) as Stage[]).map(key => <a key={key} href={`/projects/${project.id}/${key}`} style={{...navLink, fontWeight:key===pathStage?800:600}}>{STAGES[key].title}</a>)}</nav><a href="/dashboard" style={navLink}>Dashboard</a></header>
    <section style={content}>
      <a href={`/projects/${project.id}`} style={back}><ArrowLeft size={15}/> Project workspace</a>
      <div style={eyebrow}><Sparkles size={14}/> WORKFLOW STAGE</div>
      <div style={titleRow}><div><h1 style={{margin:'6px 0 8px'}}>{config.title}</h1><p style={muted}>{config.description}</p></div><div style={stageBadge}><Icon size={18}/><span>{project.name}</span></div></div>

      <div style={grid}>
        <article style={card}><div style={cardIcon}><Icon size={21}/></div><h2>Current foundation</h2><p>{site?.jurisdiction || site?.authority || 'Site evidence pending'} · {dimensions}</p><div style={rows}>
          <Row label="Site" value={site?.address || 'Not supplied'} />
          <Row label="Authority" value={site?.authority || 'Pending'} />
          <Row label="Coordinates" value={site?.latitude != null && site?.longitude != null ? `${site.latitude}, ${site.longitude}` : 'Not supplied'} />
          <Row label="Building type" value={site?.building_type || 'Not specified'} />
        </div></article>
        <article style={card}><div style={cardIcon}><ShieldCheck size={21}/></div><h2>Evidence state</h2><p>AI suggestions remain separate from verified regulatory controls.</p><div style={rows}><Row label="Planning context" value={site?.jurisdiction || 'Review required'} /><Row label="Regulatory controls" value="Evidence-gated" /><Row label="Model version" value={model?.version ? `v${model.version}` : 'Not started'} /><Row label="Editable spaces" value={String(rooms)} /></div></article>
      </div>

      <section style={notice}><ShieldCheck size={20}/><div><strong>Production workflow safeguard</strong><p>This stage is connected to the persistent project state, but no unsupported regulatory or design conclusion is presented as verified. Deterministic engines remain the source of truth.</p></div></section>
      <div style={actions}><a href={`/projects/${project.id}`} style={secondary}><ArrowLeft size={15}/> Back to project</a><a href={`/projects/${project.id}/${config.next}`} style={primary}>Continue to {STAGES[config.next].title} <ArrowRight size={15}/></a></div>
    </section>
  </main>;
}

function Row({ label, value }: { label: string; value: string }) { return <div style={{display:'flex',justifyContent:'space-between',gap:16,borderTop:'1px solid #e7edf4',padding:'11px 0'}}><span style={{color:'#64748b'}}>{label}</span><strong style={{color:'#183556',textAlign:'right'}}>{value}</strong></div>; }

const shell: React.CSSProperties = { minHeight:'100vh', background:'#f6f9fc', color:'#183556', fontFamily:'Arial, sans-serif' };
const header: React.CSSProperties = { minHeight:68, padding:'0 24px', background:'#fff', borderBottom:'1px solid #dfe8f3', display:'flex', alignItems:'center', gap:24, justifyContent:'space-between', position:'sticky', top:0, zIndex:10 };
const brand: React.CSSProperties = { fontWeight:850, fontSize:22, color:'#1769aa', textDecoration:'none', whiteSpace:'nowrap' };
const navLink: React.CSSProperties = { color:'#365675', textDecoration:'none', fontSize:13 };
const content: React.CSSProperties = { maxWidth:1180, margin:'0 auto', padding:'28px 20px 60px' };
const back: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:7, color:'#1769aa', fontWeight:700, fontSize:13, textDecoration:'none' };
const eyebrow: React.CSSProperties = { display:'flex', alignItems:'center', gap:7, marginTop:26, color:'#3b86c8', fontWeight:800, letterSpacing:2, fontSize:12 };
const titleRow: React.CSSProperties = { marginTop:8, display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:24, flexWrap:'wrap' };
const muted: React.CSSProperties = { maxWidth:700, color:'#64748b', lineHeight:1.6, margin:0 };
const stageBadge: React.CSSProperties = { display:'flex', alignItems:'center', gap:9, padding:'10px 13px', borderRadius:12, background:'#fff', border:'1px solid #dfe8f3', fontSize:13, fontWeight:750 };
const grid: React.CSSProperties = { marginTop:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16 };
const card: React.CSSProperties = { background:'#fff', border:'1px solid #dfe8f3', borderRadius:18, padding:22, boxShadow:'0 12px 36px #173c640d' };
const cardIcon: React.CSSProperties = { width:40, height:40, display:'grid', placeItems:'center', borderRadius:11, background:'#edf6ff', color:'#1769aa' };
const rows: React.CSSProperties = { marginTop:18 };
const notice: React.CSSProperties = { marginTop:18, display:'flex', gap:12, padding:18, background:'#eef8f2', border:'1px solid #cce8d5', borderRadius:16, color:'#24583a' };
const actions: React.CSSProperties = { display:'flex', justifyContent:'space-between', gap:12, marginTop:22, flexWrap:'wrap' };
const primary: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:10, background:'#1769aa', color:'#fff', textDecoration:'none', fontWeight:800 };
const secondary: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:10, background:'#fff', border:'1px solid #b9cce0', color:'#365675', textDecoration:'none', fontWeight:750 };
const panel: React.CSSProperties = { maxWidth:700, margin:'80px auto', background:'#fff', border:'1px solid #dfe8f3', borderRadius:18, padding:28 };
