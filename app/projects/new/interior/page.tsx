'use client';

import { ArrowLeft, CheckCircle2, Home, Sofa, Palette, Lightbulb } from 'lucide-react';
import Link from 'next/link';

const spaces = [
  ['Living room','Furniture, circulation and daylight'],
  ['Kitchen','Work triangle, storage and finishes'],
  ['Bedroom','Bed placement, wardrobes and clearances'],
  ['Bathroom','Fixtures, wet-zone planning and ventilation'],
];

export default function InteriorPage() {
  return <main className="appShell">
    <header className="workspaceTop"><Link href="/projects/new/3d" className="back"><ArrowLeft size={17}/> 3D Model</Link><span>Interior</span><span className="stepCount">05 / 06</span></header>
    <section className="sitePage">
      <div className="sectionLabel">INTERIOR FOUNDATION</div>
      <h1>Turn the building model into living space.</h1>
      <p className="siteLead">Interior planning stays connected to the same room geometry used by 2D and 3D. This MVP establishes the design system for furniture, finishes, fixtures and lighting.</p>
      <div className="featureStrip" style={{marginTop:42,borderRadius:16,overflow:'hidden'}}>
        <Feature icon={<Sofa/>} title="Furniture" text="Place and size furniture against room geometry." />
        <Feature icon={<Palette/>} title="Materials" text="Define finishes and material intent." />
        <Feature icon={<Lightbulb/>} title="Lighting" text="Plan fixtures and lighting zones." />
        <Feature icon={<Home/>} title="Room logic" text="Keep interiors linked to the building model." />
      </div>
      <div className="workflowCards" style={{marginTop:24}}>{spaces.map(([title,desc]) => <div className="workflowCard" key={title}><div className="stepNo">•</div><CheckCircle2 size={20}/><div><h2>{title}</h2><p>{desc}</p></div></div>)}</div>
      <div className="start" style={{margin:'24px 0 0'}}><div><div className="sectionLabel">MODEL LINK</div><h2 style={{fontSize:28}}>Interior is ready for the next design layer.</h2><p>Furniture, materials and fixtures can now be attached to the persistent building model without changing the architectural geometry.</p></div><Link className="primary" href="/projects/new/documents">Continue to documents</Link></div>
    </section>
  </main>;
}
function Feature({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>; }
