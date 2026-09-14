import { ArrowRight, MapPinned, Sparkles, Box, Ruler, ShieldCheck } from "lucide-react";

const steps = [
  ["01", "Idea", "Describe what you want to build."],
  ["02", "Site Intelligence", "Understand the land, jurisdiction and constraints."],
  ["03", "Feasibility", "Calculate the buildable envelope."],
  ["04", "Design", "Generate editable architectural concepts."],
  ["05", "3D + Interior", "Turn the building model into a complete visual concept."],
];

export default function Home() {
  return (
    <main>
      <header className="topbar">
        <div className="brand"><span className="brandMark">B</span><span>Build Ai</span></div>
        <nav><a href="#workflow">Workflow</a><a href="#platform">Platform</a><a href="#start" className="navCta">Start a project <ArrowRight size={15}/></a></nav>
      </header>
      <section className="hero">
        <div className="heroCopy">
          <div className="eyebrow"><Sparkles size={14}/> BUILDING INTELLIGENCE PLATFORM</div>
          <h1>From <em>idea</em> to a complete building.</h1>
          <p>Build Ai connects site intelligence, Indian regulations, architecture, 3D design, interiors and the building model into one professional workflow.</p>
          <div className="heroActions"><a className="primary" href="/projects/new">Start a project <ArrowRight size={17}/></a><a className="secondary" href="#workflow">See how it works</a></div>
        </div>
        <div className="heroCard"><div className="cardTop"><span>PROJECT PREVIEW</span><span className="status">● Feasibility ready</span></div><div className="siteVisual"><div className="road"></div><div className="plot"><div className="buildable"><span>BUILDABLE ENVELOPE</span></div></div><div className="north">N ↑</div></div><div className="metrics"><div><small>Plot</small><strong>360 m²</strong></div><div><small>Buildable</small><strong>242 m²</strong></div><div><small>FAR</small><strong>Unresolved</strong></div><div><small>Confidence</small><strong>Evidence-aware</strong></div></div></div>
      </section>
      <section id="platform" className="featureStrip"><Feature icon={<MapPinned/>} title="India-first site intelligence" text="Jurisdiction, planning and site constraints."/><Feature icon={<ShieldCheck/>} title="Regulation-aware" text="Versioned rules with source provenance."/><Feature icon={<Ruler/>} title="Deterministic geometry" text="The AI proposes; geometry verifies."/><Feature icon={<Box/>} title="One building model" text="2D, 3D, interior, exterior and BIM-ready."/></section>
      <section id="workflow" className="workflow"><div className="sectionLabel">THE WORKFLOW</div><h2>One project. One source of truth.</h2><p className="sectionIntro">Build Ai is designed as a spatial reasoning system rather than an image generator.</p><div className="steps">{steps.map(([n,t,d]) => <div className="step" key={n}><span>{n}</span><h3>{t}</h3><p>{d}</p></div>)}</div></section>
      <section id="start" className="start"><div><div className="sectionLabel">MVP v0.5</div><h2>Start with a real Indian site.</h2><p>The first production vertical is Idea → Site → Regulation → Feasibility → 2D → 3D, beginning with Delhi NCR residential projects.</p></div><a className="primary" href="/projects/new">Create project <ArrowRight size={17}/></a></section>
      <footer><span>Build Ai</span><span>India-first building intelligence</span></footer>
    </main>
  );
}
function Feature({icon,title,text}:{icon:React.ReactNode,title:string,text:string}) { return <div className="feature"><div className="featureIcon">{icon}</div><div><h3>{title}</h3><p>{text}</p></div></div>; }
