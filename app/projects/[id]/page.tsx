'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Box, FileText, Home, LayoutDashboard, MapPinned, Ruler, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './page.module.css';

type Project = { id: string; name: string; description?: string | null; status?: string; created_at?: string; updated_at?: string; sites?: Array<{ address?: string | null; latitude?: number | null; longitude?: number | null; jurisdiction?: string | null; authority?: string | null }> };
type Site = { address?: string | null; latitude?: number | null; longitude?: number | null; jurisdiction?: string | null; authority?: string | null };
type ModelSummary = { version?: number; rooms?: unknown[] };

const heroImage = 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1400&q=85';
const siteImage = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=900&q=80';
const steps = [
  ['site', 'Site Intelligence', 'Resolve jurisdiction, planning context and site evidence.', MapPinned, '/projects/new/site', 'Understand your property'],
  ['feasibility', 'Feasibility', 'Evaluate the buildable envelope and regulatory evidence.', Ruler, '/projects/new/envelope', 'Know what is possible'],
  ['design', '2D Architecture', 'Edit the persistent floor-plan geometry.', LayoutDashboard, '/projects/new/architecture', 'Create intelligent plans'],
  ['3d', '3D Model', 'Inspect the same building model in 3D.', Box, '/projects/new/3d', 'Visualize your building'],
  ['interior', 'Interior', 'Develop rooms, furniture and finishes.', Home, '/projects/new/interior', 'Shape living spaces'],
  ['documents', 'Documents', 'Generate evidence-backed project documentation.', FileText, '/projects/new/documents', 'Prepare project reports'],
] as const;

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const [project, setProject] = useState<Project | null>(null);
  const [site, setSite] = useState<Site | null>(null);
  const [model, setModel] = useState<ModelSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    params.then(async ({ id }) => {
      try {
        const projectsResponse = await fetch('/api/projects', { cache: 'no-store' });
        const projectsPayload = await projectsResponse.json().catch(() => null);
        if (!projectsResponse.ok) throw new Error(projectsPayload?.error || 'Unable to load projects');
        const found = (projectsPayload?.projects as Project[] | undefined)?.find((item) => item.id === id) || null;
        if (!found) { if (active) { setProject(null); setLoading(false); } return; }
        const modelResponse = await fetch(`/api/projects/${encodeURIComponent(id)}/model`, { cache: 'no-store' });
        const modelPayload = await modelResponse.json().catch(() => null);
        if (!active) return;
        setProject(found);
        setSite(found.sites?.[0] ?? null);
        const remoteModel = modelPayload?.model;
        setModel(remoteModel ? { version: remoteModel.version, rooms: Array.isArray(remoteModel.model?.rooms) ? remoteModel.model.rooms : [] } : null);
        setError('');
      } catch (e) {
        if (active) setError(e instanceof Error ? e.message : 'Unable to load project');
      } finally { if (active) setLoading(false); }
    }).catch(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [params]);

  if (loading) return <main className={styles.loading}>Loading project workspace…</main>;
  if (error) return <main className={styles.page}><section className={styles.body}><div className={styles.empty}><h1>Unable to load project</h1><p>{error}</p><a href="/dashboard">Return to dashboard</a></div></section></main>;
  if (!project) return <main className={styles.page}><section className={styles.body}><div className={styles.empty}><h1>Project not found</h1><p>This project may not be accessible to your account.</p><a href="/dashboard">Return to dashboard</a></div></section></main>;

  const projectId = project.id;
  const siteArea = site ? null : null;
  const planningContext = site?.jurisdiction || site?.authority || 'Pending site resolution';
  const hasCoordinates = site?.latitude != null && site?.longitude != null;

  return <main className={styles.page}>
    <header className={styles.nav}>
      <a href="/dashboard" className={styles.brand} aria-label="Build Ai dashboard"><HouseLogo/><span><strong>Build Ai</strong><small>Plan · Design · Approve · Build</small></span></a>
      <nav className={styles.navLinks} aria-label="Project navigation"><a href={`/projects/${projectId}`}>Project</a><a href={`/projects/new/site?project=${projectId}`}>Site</a><a href={`/projects/new/envelope?project=${projectId}`}>Feasibility</a><a href={`/projects/new/architecture?projectId=${projectId}`}>2D</a><a href={`/projects/new/3d?projectId=${projectId}`}>3D</a><a href={`/projects/new/interior?project=${projectId}`}>Interior</a></nav>
      <div className={styles.navActions}><a className={styles.back} href="/dashboard">Dashboard</a><a className={styles.newProject} href="/projects/new">New Project</a></div>
    </header>
    <section className={styles.body}>
      <div className={styles.eyebrow}><Sparkles size={13}/> PROJECT WORKSPACE</div>
      <div className={styles.titleRow}><div><h1>{project.name}</h1><p className={styles.subtitle}>{site?.address || 'Site pending'} · {project.description || 'Building project'} · Complete building workflow</p></div><div className={styles.status}><span className={styles.statusDot}/> Workspace ready</div></div>
      <div className={styles.hero}><div className={styles.heroCard}><img className={styles.heroImage} src={heroImage} alt="Modern residential building concept" loading="eager" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}/><div className={styles.heroOverlay}><div><strong>Design Preview</strong><span>AI-ready concept workspace</span></div><Box size={20}/></div></div>
        <div className={styles.metrics}><Metric label="Building model" value={model?.version ? `v${model.version}` : 'Not started'} text="Persistent source of truth across 2D and 3D."/><Metric label="Rooms" value={String(model?.rooms?.length ?? 0)} text="Editable spaces in the current model."/><Metric label="Site area" value={siteArea !== null ? '—' : 'From site'} text={site ? 'Plot dimensions are stored with the project.' : 'Add site dimensions'}/><Metric label="Evidence" value={site?.jurisdiction || site?.authority ? 'Resolved' : 'Review'} text="Regulatory values remain evidence-gated."/><div className={styles.sitePreview}><img src={siteImage} alt="Residential site and landscape context" loading="lazy" onError={(event) => { event.currentTarget.style.visibility = 'hidden'; }}/><div className={styles.siteLabel}><MapPinned size={13}/> Site Context</div></div></div>
      </div>
      <div className={styles.summary}><Summary label="Planning context" value={planningContext}/><Summary label="Coordinates" value={hasCoordinates ? `${site!.latitude}, ${site!.longitude}` : 'Not supplied'}/><Summary label="Authority" value={site?.authority || 'Pending'}/><Summary label="Regulatory status" value="Evidence-gated"/></div>
      <section className={styles.section}><div className={styles.sectionHead}><div className={styles.sectionLabel}>COMPLETE WORKFLOW</div><h2>Everything You Need to Build Smarter</h2><p className={styles.intro}>Move from real site context to editable design and evidence-backed documentation.</p></div><div className={styles.workflow}>{steps.map(([key,title,description,Icon,href,action],index)=><a className={styles.step} key={key} href={`${href}?${href.includes('architecture') || href.includes('3d') ? 'projectId' : 'project'}=${projectId}`}><div className={styles.stepIcon}><Icon size={23}/></div><div className={styles.stepNo}>{String(index+1).padStart(2,'0')}</div><h3>{title}</h3><p>{description}</p><div className={styles.stepFoot}><span>{action}</span><ArrowRight size={14}/></div></a>)}</div><div className={styles.proof}><div><strong>1</strong><span>Persistent Building Model</span></div><div><strong>{model?.rooms?.length ?? 0}</strong><span>Editable Spaces</span></div><div><strong>{hasCoordinates ? 'GIS' : '—'}</strong><span>Site Context</span></div><div><strong>{site?.jurisdiction || site?.authority ? 'A/B' : 'Review'}</strong><span>Evidence Confidence</span></div></div></section>
      <div className={styles.evidence}><div className={styles.evidenceText}><ShieldCheck size={19}/><div><strong>Evidence-aware regulatory workflow</strong><span>Build Ai never treats address heuristics as legal conclusions. Numeric controls activate only when the applicable authority, source and rule version are verified.</span></div></div><a className={styles.openStep} href={`/projects/new/site?project=${projectId}`}>Review site evidence <ArrowRight size={14}/></a></div>
      <section className={styles.cta}><div><h2>Build from a verified foundation.</h2><p>Keep site context, geometry, compliance evidence and design decisions connected.</p></div><a href={`/projects/new/architecture?projectId=${projectId}`}>Open 2D Architecture <ArrowRight size={14}/></a></section>
    </section>
  </main>;
}
function Metric({label,value,text}:{label:string;value:string;text:string}){return <div className={styles.metric}><label>{label}</label><strong>{value}</strong><p>{text}</p></div>}
function Summary({label,value}:{label:string;value:string}){return <div className={styles.summaryItem}><span>{label}</span><strong>{value}</strong></div>}
function HouseLogo(){return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M7 21.5 24 7l17 14.5V42H7V21.5Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M17 42V26h14v16M21 20h6" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>}
