'use client';

import { ArrowRight, Box, CheckCircle2, FileText, LayoutGrid, MapPinned, Menu, PlayCircle, Ruler, ShieldCheck, Sparkles, X } from "lucide-react";
import { useState } from "react";

const workflow = [
  ["01", "Site Intelligence", "Understand your plot with real site data.", MapPinned],
  ["02", "Feasibility", "Know what is possible before you design.", FileText],
  ["03", "2D Architecture", "Generate intelligent, editable floor plans.", LayoutGrid],
  ["04", "3D Model", "Visualize your building in real time.", Box],
  ["05", "Interior", "Design beautiful living spaces.", Sparkles],
  ["06", "Documents", "Prepare drawings and project reports.", FileText],
] as const;

const features = [
  [MapPinned, "Site Intelligence", "Understand your property with real data."],
  [ShieldCheck, "Regulation Ready", "Versioned rules with source provenance."],
  [Ruler, "Deterministic Geometry", "The AI proposes; geometry verifies."],
  [Box, "One Building Model", "One source of truth across the workflow."],
] as const;

const mobileLinks = [
  ["Workflow", "#workflow"],
  ["Platform", "#platform"],
  ["How It Works", "#how"],
  ["Get Started", "/projects/new"],
  ["Dashboard", "/dashboard"],
] as const;

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="landing">
      <header className="landingNav">
        <a className="landingBrand" href="/" aria-label="Build Ai home" onClick={() => setMenuOpen(false)}>
          <span className="houseMark" aria-hidden="true"><HouseLogo /></span>
          <span><strong>Build Ai</strong><small>Plan · Design · Approve · Build</small></span>
        </a>
        <nav className="desktopNav" aria-label="Primary navigation">
          <a href="#workflow">Workflow</a><a href="#platform">Platform</a><a href="#how">How It Works</a><a href="#start">Pricing</a><a href="#start">Resources</a>
        </nav>
        <div className="navActions"><a className="signIn" href="/dashboard">Sign In</a><a className="navGetStarted" href="/projects/new">Get Started <ArrowRight size={15}/></a></div>
        <button className="mobileMenu" aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} onClick={() => setMenuOpen((open) => !open)}>{menuOpen ? <X size={25}/> : <Menu size={25}/>}</button>
      </header>

      {menuOpen && <nav aria-label="Mobile navigation" style={{position:"absolute",top:70,right:12,left:12,zIndex:20,background:"#fff",border:"1px solid #dfe8f3",borderRadius:14,boxShadow:"0 16px 40px #173c6422",padding:10}}>
        {mobileLinks.map(([label, href]) => <a key={label} href={href} onClick={() => setMenuOpen(false)} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"13px 14px",borderRadius:9,fontSize:13,fontWeight:700,color:"#183556"}}>{label}<ArrowRight size={15}/></a>)}
      </nav>}

      <section className="landingHero" id="how">
        <div className="heroContent">
          <div className="heroEyebrow"><Sparkles size={14}/> YOUR PROPERTY. OUR INTELLIGENCE.</div>
          <h1>From Plot to <span>Possibility</span></h1>
          <p>AI-powered site analysis, design, regulatory compliance and documentation — all in one place.</p>
          <div className="landingActions"><a className="landingPrimary" href="/projects/new">Get Started Free <ArrowRight size={18}/></a><a className="landingSecondary" href="#workflow"><PlayCircle size={17}/> Watch Demo</a></div>
          <div className="benefits">
            <Benefit icon="⚡" title="Faster Decisions"/><Benefit icon="◇" title="Regulation Ready"/><Benefit icon="◒" title="Smarter Designs"/>
          </div>
        </div>
        <div className="heroVisual" aria-label="Build Ai design preview">
          <div className="skyGlow"/><div className="citySilhouette"/>
          <div className="modernHome"><div className="homeRoof"/><div className="homeGlass"><i/><i/><i/><i/></div><div className="homeWood"><b/><b/><b/></div><div className="homePlants"><span/><span/><span/></div></div>
          <div className="floatCard siteCard"><div className="cardThumb mapThumb"><MapPinned size={20}/></div><div><strong>Site Intelligence</strong><small><CheckCircle2/> Plot Analysis</small><small><CheckCircle2/> Zoning & Land Use</small><small><CheckCircle2/> Nearby Infrastructure</small><small><CheckCircle2/> Risk Assessment</small></div></div>
          <div className="floatCard designCard"><strong>3D Design Preview</strong><div className="miniHouse"/></div>
          <div className="floatCard complianceCard"><strong>Regulatory Compliance</strong><small><CheckCircle2/> DDA / UBBL</small><small><CheckCircle2/> TCP / GMDA</small><small><CheckCircle2/> Setbacks & FAR</small><small><CheckCircle2/> Parking Norms</small></div>
        </div>
      </section>

      <section className="featureStrip" id="platform">
        {features.map(([Icon, title, text]) => <div className="feature" key={title}><div className="featureIcon"><Icon size={22}/></div><div><h3>{title}</h3><p>{text}</p></div></div>)}
      </section>

      <section className="workflow landingSection" id="workflow">
        <div className="sectionLabel">COMPLETE WORKFLOW</div>
        <h2>Everything You Need to<br className="wideBreak"/> Build Smarter</h2>
        <p className="sectionIntro">From site analysis to approved documents, Build Ai simplifies the entire journey.</p>
        <div className="workflowGrid">{workflow.map(([n, title, text, Icon]) => <div className="workflowCard" key={n}><div className="workflowIcon"><Icon size={24}/></div><div className="workflowNumber">{n}</div><h3>{title}</h3><p>{text}</p><ArrowRight className="workflowArrow" size={17}/></div>)}</div>
      </section>

      <section className="proofBand"><div><strong>10x</strong><span>Faster Planning</span></div><div><strong>100%</strong><span>Regulation Aware</span></div><div><strong>Cities</strong><span>Starting with Delhi NCR</span></div><div><strong>One Platform</strong><span>From Concept to Approval</span></div></section>

      <section className="quoteSection"><blockquote>“Build Ai turns complex building rules<br className="wideBreak"/> into simple decisions.”</blockquote><p>— For Homeowners, Architects & Builders</p></section>

      <section className="betterTomorrow" id="start"><div className="blueprint"><div className="blueprintHouse"><span/><span/><span/><span/></div></div><div className="ctaCopy"><div className="sectionLabel">THE FUTURE OF BUILDING</div><h2>Build a Better Tomorrow</h2><p>Smarter Sites. Compliant Designs. Greener Cities.</p><div className="landingActions"><a className="landingPrimary light" href="/projects/new">Get Started Free <ArrowRight size={18}/></a><a className="landingSecondary lightOutline" href="#how">Book a Demo</a></div></div></section>

      <footer className="landingFooter"><div className="footerBrand"><span className="houseMark"><HouseLogo /></span><span><strong>Build Ai</strong><small>Plan · Design · Approve · Build</small></span></div><div className="footerLinks"><a href="#platform">Product</a><a href="#start">Solutions</a><a href="#start">Pricing</a><a href="#workflow">Resources</a><a href="#start">About</a><a href="#start">Contact</a></div><div className="footerSocial"><span>in</span><span>𝕏</span><span>◎</span><span>▶</span></div><p>Building a Smarter, Safer, Greener Tomorrow.</p></footer>
    </main>
  );
}

function Benefit({ icon, title }: { icon: string; title: string }) { return <div className="benefit"><b>{icon}</b><span>{title}</span></div>; }
function HouseLogo() { return <svg viewBox="0 0 48 48" fill="none" aria-hidden="true"><path d="M7 21.5 24 7l17 14.5V42H7V21.5Z" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/><path d="M17 42V26h14v16M21 20h6" stroke="currentColor" strokeWidth="4" strokeLinejoin="round"/></svg>; }
