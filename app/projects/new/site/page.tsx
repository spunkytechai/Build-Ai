"use client";
import { ArrowLeft, MapPinned, Search, Crosshair, Upload, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";

export default function SiteIntelligence() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const type = params?.get("type") || "house";
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [plotWidth, setPlotWidth] = useState("12");
  const [plotDepth, setPlotDepth] = useState("20");
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const area = useMemo(() => Number(plotWidth || 0) * Number(plotDepth || 0), [plotWidth, plotDepth]);

  async function analyse() {
    setLoading(true); setResult(null);
    try {
      const res = await fetch("/api/site-analysis", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ address, lat: lat ? Number(lat) : undefined, lon: lon ? Number(lon) : undefined, plotWidth: Number(plotWidth), plotDepth: Number(plotDepth), buildingType: type }) });
      setResult(await res.json());
    } finally { setLoading(false); }
  }

  return <main className="appShell">
    <header className="workspaceTop"><Link href="/projects/new" className="back"><ArrowLeft size={17}/> Project</Link><span>Site Intelligence</span><span className="stepCount">02 / 05</span></header>
    <section className="sitePage">
      <div className="sectionLabel">INDIA SITE INTELLIGENCE</div>
      <h1>Tell us where the building sits.</h1>
      <p className="siteLead">Use coordinates for live spatial intersections. Address text is contextual only and never becomes a regulatory fact by itself.</p>
      <div className="siteGrid">
        <div className="siteForm">
          <label>Address / locality<input value={address} onChange={e=>setAddress(e.target.value)} placeholder="e.g. Sector 44, Gurugram" /></label>
          <div className="two"><label>Latitude<input value={lat} onChange={e=>setLat(e.target.value)} placeholder="28.4595" inputMode="decimal" /></label><label>Longitude<input value={lon} onChange={e=>setLon(e.target.value)} placeholder="77.0266" inputMode="decimal" /></label></div>
          <div className="two"><label>Plot width (m)<input value={plotWidth} onChange={e=>setPlotWidth(e.target.value)} inputMode="decimal" /></label><label>Plot depth (m)<input value={plotDepth} onChange={e=>setPlotDepth(e.target.value)} inputMode="decimal" /></label></div>
          <div className="areaReadout"><span>Entered plot area</span><strong>{area.toFixed(1)} m²</strong></div>
          <div className="uploadBox"><Upload size={18}/><div><strong>Survey / CAD / GIS</strong><small>Optional. User-supplied geometry remains separate from government reference layers.</small></div></div>
          <button className="analyse" onClick={analyse} disabled={loading || (!address && (!lat || !lon))}>{loading ? "Resolving site…" : <><Search size={16}/> Analyse site</>}</button>
        </div>
        <div className="sitePreview">
          <div className="mapHeader"><span><MapPinned size={15}/> Spatial context</span><span className="confidence">Evidence-aware</span></div>
          <div className="mapCanvas"><div className="gridLines"/><div className="road r1"/><div className="road r2"/><div className="sitePlot"><div className="siteDot"><Crosshair size={16}/></div></div><span className="mapNorth">N ↑</span></div>
          {result ? <div className="analysisResult">
            <div className="resultTitle"><ShieldCheck size={17}/> Site profile generated</div>
            <div className="resultRows"><Row k="Jurisdiction" v={result.jurisdiction} /><Row k="Planning source" v={result.planningSource} /><Row k="Plot" v={`${result.plotArea} m²`} /><Row k="Rule status" v={result.ruleStatus} /></div>
            {result.coordinates && <div className="sourceNote">Coordinates: {result.coordinates.lat}, {result.coordinates.lon}</div>}
            {result.evidence && Object.keys(result.evidence).length > 0 && <div className="sourceNote">Live GMDA spatial layers intersected: {Object.keys(result.evidence).join(", ")}</div>}
            <div className="sourceNote">{result.note}</div>
            <div className="sources"><a href={result.sources.dda} target="_blank" rel="noreferrer">DDA GIS <ExternalLink size={12}/></a><a href={result.sources.ddaPortal} target="_blank" rel="noreferrer">DDA Geo Portal <ExternalLink size={12}/></a><a href={result.sources.gmda} target="_blank" rel="noreferrer">GMDA GIS <ExternalLink size={12}/></a></div>
          </div> : <div className="emptyResult"><strong>Awaiting site</strong><span>Enter an address or coordinates to create an evidence-backed site profile.</span></div>}
        </div>
      </div>
    </section>
  </main>
}
function Row({k,v}:{k:string,v:string}) { return <div><span>{k}</span><strong>{v}</strong></div> }
