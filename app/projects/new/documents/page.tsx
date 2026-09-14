'use client';

import { ArrowLeft, CheckCircle2, FileText, Download, ShieldCheck, MapPinned, Ruler } from 'lucide-react';
import Link from 'next/link';

const documents = [
  ['Site Intelligence Report','Jurisdiction, spatial evidence, source references and site inputs.',MapPinned],
  ['Feasibility Summary','Plot metrics, buildable-envelope assumptions and unresolved controls.',Ruler],
  ['Design Concept Report','2D/3D model summary, room schedule and design assumptions.',FileText],
];

export default function DocumentsPage() {
  return <main className="appShell">
    <header className="workspaceTop"><Link href="/projects/new/interior" className="back"><ArrowLeft size={17}/> Interior</Link><span>Documents</span><span className="stepCount">06 / 06</span></header>
    <section className="sitePage">
      <div className="sectionLabel">PROJECT DOCUMENTATION</div>
      <h1>Evidence-backed project documents.</h1>
      <p className="siteLead">The document layer packages the project state into professional review material. Regulatory claims remain traceable to their source and unresolved items are never presented as approved facts.</p>
      <div className="workflowCards" style={{marginTop:42}}>{documents.map(([title,desc,Icon]) => <div className="workflowCard" key={title as string}><div className="stepNo">✓</div><Icon size={20}/><div><h2>{title as string}</h2><p>{desc as string}</p></div><span className="statusPill"><span/>Ready to generate</span></div>)}</div>
      <div className="start" style={{margin:'24px 0 0'}}><div><div className="sectionLabel">TRACEABILITY</div><h2 style={{fontSize:28}}>Review before export.</h2><p>Build Ai separates verified source evidence, user-supplied inputs and unresolved AI-derived assumptions so a professional can review the package before it is used externally.</p></div><button className="primary" type="button"><Download size={16}/> Generate package</button></div>
      <div className="provenance" style={{marginTop:24}}><ShieldCheck size={18}/><div><strong>Approval boundary</strong><span>Documents generated here are concept/review material. They are not a statutory approval, permit, structural certification or construction-ready drawing set.</span></div></div>
    </section>
  </main>;
}
