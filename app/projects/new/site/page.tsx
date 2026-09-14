"use client";
import { ArrowLeft, MapPinned, Search, Crosshair, Upload, ShieldCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Site = { address?: string | null; latitude?: number | null; longitude?: number | null; jurisdiction?: string | null; authority?: string | null; plot_width_m?: number | null; plot_depth_m?: number | null; building_type?: string | null; analysis?: Record<string, unknown> | null };

export default function SiteIntelligence() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const type = params?.get("type") || "house";
  const projectId = params?.get("projectId") || undefined;
  const backHref = projectId ? `/projects/${encodeURIComponent(projectId)}` : "/projects/new";
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [plotWidth, setPlotWidth] = useState("12");
  const [plotDepth, setPlotDepth] = useState("20");
  const [buildingType, setBuildingType] = useState(type);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hydrating, setHydrating] = useState(Boolean(projectId));
  const [saveError, setSaveError] = useState("");
  const area = useMemo(() => Number(plotWidth || 0) * Number(plotDepth || 0), [plotWidth, plotDepth]);

  useEffect(() => {
    if (!projectId) return;
    let active = true;
    fetch(`/api/projects/${encodeURIComponent(projectId)}/site`, { cache: "no-store" })
      .then(async (res) => {
        const payload = await res.json().catch(() => null);
        if (!res.ok) throw new Error(payload?.error || "Unable to load site");
        const site = payload?.site as Site | null;
        if (!active || !site) return;
        setAddress(site.address || "");
        setLat(site.latitude == null ? "" : String(site.latitude));
        setLon(site.longitude == null ? "" : String(site.longitude));
        setPlotWidth(site.plot_width_m == null ? "12" : String(site.plot_width_m));
        setPlotDepth(site.plot_depth_m == null ? "20" : String(site.plot_depth_m));
        setBuildingType(site.building_type || type);
        if (site.analysis && typeof site.analysis === "object") setResult(site.analysis);
      })
      .catch((error) => { if (active) setSaveError(error instanceof Error ? error.message : "Unable to load site"); })
      .finally(() => { if (active) setHydrating(false); });
    return () => { active = false; };
  }, [projectId, type]);

  async function analyse() {
    setLoading(true); setResult(null); setSaveError("");
    try {
      const res = await fetch("/api/site-analysis", { method: "POST", headers: {"content-type":"application/json"}, body: JSON.stringify({ address, lat: lat ? Number(lat) : undefined, lon: lon ? Number(lon) : undefined, plotWidth: Number(plotWidth), plotDepth: Number(plotDepth), buildingType }) });
      const analysis = await res.json();
      if (!res.ok) throw new Error(analysis?.error || "Unable to analyse site");
      setResult(analysis);
      if (projectId) {
        const save = await fetch(`/api/projects/${encodeURIComponent(projectId)}/site`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ address, latitude: lat ? Number(lat) : null, longitude: lon ? Number(lon) : null, plotWidthM: Number(plotWidth), plotDepthM: Number(plotDepth), buildingType, jurisdiction: analysis.jurisdiction, authority: analysis.planningSource, analysis }) });
        const saved = await save.json().catch(() => null);
        if (!save.ok) throw new Error(saved?.error || "Analysis completed but site could not be saved");
      }
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Unable to analyse site");
    } finally { setLoading(false); }
  }

  return <main className="appShell">
    <header className="workspaceTop"><Link href={backHref} className="back"><ArrowLeft size={17}/> Project</Link><span>Site Intelligence</span><span className="stepCount">02 / 05</span></header>
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
          <button className="analyse" onClick={analyse} disabled={loading || hydrating || (!address && (!lat || !lon))}>{hydrating ? "Loading site…" : loading ? "Resolving site…" : <><Search size={16}/> Analyse site</>}</button>
          {saveError && <div className="sourceNote" role="alert">{saveError}</div>}
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
