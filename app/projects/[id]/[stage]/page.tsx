'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Box, CheckCircle2, Download, FileText, Home, LayoutDashboard, MapPinned, Ruler, ShieldCheck, Sparkles } from 'lucide-react';

const STAGES = {
  site: { title: 'Site Intelligence', icon: MapPinned, description: 'Review the resolved site context, coordinates, dimensions and planning evidence.', next: 'feasibility' },
  feasibility: { title: 'Feasibility', icon: Ruler, description: 'Review the regulatory evidence and buildable-envelope inputs before design.', next: 'architecture' },
  architecture: { title: '2D Architecture', icon: LayoutDashboard, description: 'Prepare the persistent floor-plan model that will become the shared source of truth.', next: '3d' },
  '3d': { title: '3D Model', icon: Box, description: 'Inspect the building model in a spatial 3D workflow.', next: 'interior' },
  interior: { title: 'Interior', icon: Home, description: 'Develop room-level interior decisions against the persistent building model.', next: 'documents' },
  documents: { title: 'Documents', icon: FileText, description: 'Generate a traceable project package from the verified project state.', next: 'site' },
} as const;

type Stage = keyof typeof STAGES;
type Site = { address?: string | null; latitude?: number | null; longitude?: number | null; jurisdiction?: string | null; authority?: string | null; plot_width_m?: number | null; plot_depth_m?: number | null; building_type?: string | null };
type Project = { id: string; name: string; description?: string | null; status?: string | null; sites?: Site[] };
type Room = { id?: string; name?: string; floor?: number; x?: number; y?: number; w?: number; h?: number; area?: number };
type Model = { version?: number; status?: string; model?: { rooms?: Room[]; plot?: { width?: number; depth?: number } } };

type Package = {
  schema: 'build-ai.project-package.v1'; generatedAt: string; project: { id: string; name: string; description: string | null; status: string | null };
  site: { address: string | null; latitude: number | null; longitude: number | null; jurisdiction: string | null; authority: string | null; plot: { widthM: number | null; depthM: number | null }; buildingType: string | null };
  design: { modelVersion: number | null; modelStatus: string | null; plot: { widthM: number | null; depthM: number | null }; rooms: Room[]; architecturalRoomCount: number };
  traceability: { verifiedInputs: string[]; unresolvedBoundaries: string[] };
};

export default function StagePage({ params }: { params: Promise<{ id: string; stage: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [model, setModel] = useState<Model | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [packageData, setPackageData] = useState<Package | null>(null);

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
  const rooms = Array.isArray(model?.model?.rooms) ? model.model.rooms : [];

  async function generatePackage() {
    if (generating) return;
    setGenerating(true);
    const architecturalRooms = rooms.filter((room) => !room.id?.startsWith('int-'));
    const nextPackage: Package = {
      schema: 'build-ai.project-package.v1',
      generatedAt: new Date().toISOString(),
      project: { id: project.id, name: project.name, description: project.description ?? null, status: project.status ?? null },
      site: {
        address: site?.address ?? null,
        latitude: site?.latitude ?? null,
        longitude: site?.longitude ?? null,
        jurisdiction: site?.jurisdiction ?? null,
        authority: site?.authority ?? null,
        plot: { widthM: site?.plot_width_m ?? null, depthM: site?.plot_depth_m ?? null },
        buildingType: site?.building_type ?? null,
      },
      design: {
        modelVersion: model?.version ?? null,
        modelStatus: model?.status ?? null,
        plot: { widthM: model?.model?.plot?.width ?? null, depthM: model?.model?.plot?.depth ?? null },
        rooms,
        architecturalRoomCount: architecturalRooms.length,
      },
      traceability: {
        verifiedInputs: ['Project identity', 'Site inputs returned by the authenticated project API', 'Canonical building model returned by the authenticated project model API'],
        unresolvedBoundaries: ['Regulatory approval remains outside this package', 'Structural, fire, MEP and construction certification are not inferred', 'AI-derived design assumptions require professional review before external use'],
      },
    };
    setPackageData(nextPackage);
    const blob = new Blob([JSON.stringify(nextPackage, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${project.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'build-ai-project'}-package.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setGenerated(true);
    setGenerating(false);
  }

  if (pathStage === 'documents') return <DocumentsView project={project} site={site} model={model} packageData={packageData} generated={generated} generating={generating} onGenerate={generatePackage} />;

  return <main style={shell}>
    <header style={header}><a href={`/projects/${project.id}`} style={brand}>Build Ai</a><nav style={{display:'flex',gap:16,flexWrap:'wrap'}}>{(Object.keys(STAGES) as Stage[]).map(key => <a key={key} href={`/projects/${project.id}/${key}`} style={{...navLink, fontWeight:key===pathStage?800:600}}>{STAGES[key].title}</a>)}</nav><a href="/dashboard" style={navLink}>Dashboard</a></header>
    <section style={content}>
      <a href={`/projects/${project.id}`} style={back}><ArrowLeft size={15}/> Project workspace</a>
      <div style={eyebrow}><Sparkles size={14}/> WORKFLOW STAGE</div>
      <div style={titleRow}><div><h1 style={{margin:'6px 0 8px'}}>{config.title}</h1><p style={muted}>{config.description}</p></div><div style={stageBadge}><Icon size={18}/><span>{project.name}</span></div></div>
      <div style={grid}>
        <article style={card}><div style={cardIcon}><Icon size={21}/></div><h2>Current foundation</h2><p>{site?.jurisdiction || site?.authority || 'Site evidence pending'} · {dimensions}</p><div style={rows}><Row label="Site" value={site?.address || 'Not supplied'} /><Row label="Authority" value={site?.authority || 'Pending'} /><Row label="Coordinates" value={site?.latitude != null && site?.longitude != null ? `${site.latitude}, ${site.longitude}` : 'Not supplied'} /><Row label="Building type" value={site?.building_type || 'Not specified'} /></div></article>
        <article style={card}><div style={cardIcon}><ShieldCheck size={21}/></div><h2>Evidence state</h2><p>AI suggestions remain separate from verified regulatory controls.</p><div style={rows}><Row label="Planning context" value={site?.jurisdiction || 'Review required'} /><Row label="Regulatory controls" value="Evidence-gated" /><Row label="Model version" value={model?.version ? `v${model.version}` : 'Not started'} /><Row label="Editable spaces" value={String(rooms.length)} /></div></article>
      </div>
      <section style={notice}><ShieldCheck size={20}/><div><strong>Production workflow safeguard</strong><p>This stage is connected to the persistent project state, but no unsupported regulatory or design conclusion is presented as verified. Deterministic engines remain the source of truth.</p></div></section>
      <div style={actions}><a href={`/projects/${project.id}`} style={secondary}><ArrowLeft size={15}/> Back to project</a><a href={`/projects/${project.id}/${config.next}`} style={primary}>Continue to {STAGES[config.next].title} <ArrowRight size={15}/></a></div>
    </section>
  </main>;
}

function DocumentsView({ project, site, model, packageData, generated, generating, onGenerate }: { project: Project; site?: Site; model: Model | null; packageData: Package | null; generated: boolean; generating: boolean; onGenerate: () => Promise<void> }) {
  const rooms = Array.isArray(model?.model?.rooms) ? model.model.rooms : [];
  const architecturalRooms = rooms.filter((room) => !room.id?.startsWith('int-'));
  const checks = [
    ['Project identity', true, 'Project metadata is loaded from the authenticated project workspace.'],
    ['Site inputs', Boolean(site?.address || site?.plot_width_m || site?.plot_depth_m), 'Address, coordinates and plot inputs are packaged when present.'],
    ['Canonical model', Boolean(model?.model), 'The current canonical building model is included without reinterpretation.'],
    ['Regulatory boundary', true, 'Unresolved regulatory matters remain explicitly marked rather than converted into approvals.'],
  ];
  return <main style={shell}>
    <header style={header}><a href={`/projects/${project.id}`} style={brand}>Build Ai</a><nav style={{display:'flex',gap:16,flexWrap:'wrap'}}>{(Object.keys(STAGES) as Stage[]).map(key => <a key={key} href={`/projects/${project.id}/${key}`} style={{...navLink, fontWeight:key==='documents'?800:600}}>{STAGES[key].title}</a>)}</nav><a href="/dashboard" style={navLink}>Dashboard</a></header>
    <section style={content}>
      <a href={`/projects/${project.id}/interior`} style={back}><ArrowLeft size={15}/> Interior</a>
      <div style={eyebrow}><FileText size={14}/> PROJECT DOCUMENTATION</div>
      <div style={titleRow}><div><h1 style={{margin:'6px 0 8px'}}>Evidence-backed project package.</h1><p style={muted}>A deterministic JSON package assembled from the authenticated project state. It is designed as a machine-readable handoff and review manifest, not a statutory approval set.</p></div><div style={stageBadge}><FileText size={18}/><span>{project.name}</span></div></div>
      <div style={grid}>
        {checks.map(([label, ok, description]) => <article style={card} key={label as string}><div style={{...cardIcon, background:ok?'#eef8f2':'#fff7ed', color:ok?'#267347':'#a15c16'}}>{ok ? <CheckCircle2 size={21}/> : <ShieldCheck size={21}/>}</div><h2>{label as string}</h2><p>{description as string}</p><span style={statusPill}><span style={{background:ok?'#2f9d62':'#d97706'}}/>{ok ? 'Ready' : 'Review required'}</span></article>)}
      </div>
      <section style={start}><div><div style={sectionLabel}>PACKAGE CONTENT</div><h2 style={{fontSize:28,margin:'5px 0'}}>Current project snapshot</h2><p style={{margin:0,color:'#64748b'}}>Plot: {model?.model?.plot?.width ?? site?.plot_width_m ?? '—'} × {model?.model?.plot?.depth ?? site?.plot_depth_m ?? '—'} m · Model: {model?.version ? `v${model.version}` : 'not started'} · Architectural rooms: {architecturalRooms.length} · Total model objects: {rooms.length}</p></div><button className="primary" type="button" onClick={onGenerate} disabled={generating}><Download size={16}/>{generating ? 'Preparing…' : generated ? 'Generate again' : 'Generate package'}</button></section>
      {packageData && <section style={{...card, marginTop:18}}><div style={sectionLabel}>GENERATED MANIFEST</div><h2 style={{margin:'5px 0 10px'}}>Package ready</h2><p style={{color:'#64748b'}}>Generated {new Date(packageData.generatedAt).toLocaleString()} · schema {packageData.schema}</p><pre style={preview}>{JSON.stringify(packageData, null, 2)}</pre></section>}
      <div style={{...notice, marginTop:18}}><ShieldCheck size={20}/><div><strong>Approval boundary</strong><p>Documents generated here are concept/review material. They are not a statutory approval, permit, structural certification or construction-ready drawing set.</p></div></div>
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
const grid: React.CSSProperties = { marginTop:28, display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))', gap:16 };
const card: React.CSSProperties = { background:'#fff', border:'1px solid #dfe8f3', borderRadius:18, padding:22, boxShadow:'0 12px 36px #173c640d' };
const cardIcon: React.CSSProperties = { width:40, height:40, display:'grid', placeItems:'center', borderRadius:11, background:'#edf6ff', color:'#1769aa' };
const rows: React.CSSProperties = { marginTop:18 };
const notice: React.CSSProperties = { marginTop:18, display:'flex', gap:12, padding:18, background:'#eef8f2', border:'1px solid #cce8d5', borderRadius:16, color:'#24583a' };
const actions: React.CSSProperties = { display:'flex', justifyContent:'space-between', gap:12, marginTop:22, flexWrap:'wrap' };
const primary: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:10, background:'#1769aa', color:'#fff', textDecoration:'none', fontWeight:800 };
const secondary: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:8, padding:'12px 16px', borderRadius:10, background:'#fff', border:'1px solid #b9cce0', color:'#365675', textDecoration:'none', fontWeight:750 };
const panel: React.CSSProperties = { maxWidth:700, margin:'80px auto', background:'#fff', border:'1px solid #dfe8f3', borderRadius:18, padding:28 };
const sectionLabel: React.CSSProperties = { color:'#3b86c8', fontWeight:800, letterSpacing:2, fontSize:11 };
const start: React.CSSProperties = { marginTop:24, display:'flex', justifyContent:'space-between', alignItems:'center', gap:20, padding:22, background:'#fff', border:'1px solid #dfe8f3', borderRadius:18, flexWrap:'wrap' };
const statusPill: React.CSSProperties = { display:'inline-flex', alignItems:'center', gap:7, marginTop:14, padding:'6px 9px', borderRadius:999, background:'#f4f7fa', color:'#50667d', fontSize:12, fontWeight:800 };
const preview: React.CSSProperties = { maxHeight:420, overflow:'auto', margin:0, padding:16, borderRadius:12, background:'#0f1f2f', color:'#d9e9f7', fontSize:12, lineHeight:1.55 };
