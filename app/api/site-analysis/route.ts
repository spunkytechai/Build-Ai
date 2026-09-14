import { NextResponse } from "next/server";
import { findIndiaRegionByText, isPlausibleIndiaCoordinate } from "@/lib/india/data-core";

const SOURCES = {
  dda: "https://www.dda.gov.in/gis",
  ddaPortal: "https://www.online.dda.gov.in/gis/",
  gmda: "https://onemapdepts.gmda.gov.in/server/rest/services/TCP_Haryana/tcp_haryana_encroachement/FeatureServer",
};

const GMDA_BASE = SOURCES.gmda;
const GMDA_LAYERS = {
  developmentPlan: 2,
  controlledArea: 1,
  urbanArea: 7,
  licensedColony: 13,
  hsvpharyana: 17,
};

type Feature = { attributes?: Record<string, unknown> };

async function queryGmdaLayer(layerId: number, lat: number, lon: number) {
  const params = new URLSearchParams({
    f: "json", where: "1=1",
    geometry: JSON.stringify({ x: lon, y: lat, spatialReference: { wkid: 4326 } }),
    geometryType: "esriGeometryPoint", inSR: "4326", spatialRel: "esriSpatialRelIntersects",
    outFields: "*", returnGeometry: "false",
  });
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const response = await fetch(`${GMDA_BASE}/${layerId}/query?${params}`, { signal: controller.signal, headers: { accept: "application/json" }, cache: "no-store" });
    if (!response.ok) return null;
    const json = await response.json() as { features?: Feature[] };
    return json.features?.[0]?.attributes ?? null;
  } catch { return null; } finally { clearTimeout(timeout); }
}

function isDelhi(lat: number, lon: number) { return lat >= 28.40 && lat <= 28.90 && lon >= 76.80 && lon <= 77.35; }
function isGurugram(lat: number, lon: number) { return lat >= 28.20 && lat <= 28.65 && lon >= 76.75 && lon <= 77.25; }

export async function POST(req: Request) {
  const body = await req.json();
  const address = String(body.address || "").trim();
  const width = Number(body.plotWidth || 0);
  const depth = Number(body.plotDepth || 0);
  const lat = Number(body.lat);
  const lon = Number(body.lon);
  const hasCoordinates = Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180;
  const plotArea = Math.max(0, width * depth);
  const lower = address.toLowerCase();

  let jurisdiction = "India — authority resolution pending";
  let planningSource = "National India data core";
  let ruleStatus = "Not activated — applicable local authority and source version must be verified";
  let evidence: Record<string, unknown> = {};
  const region = findIndiaRegionByText(address);
  const indiaCoordinate = hasCoordinates && isPlausibleIndiaCoordinate(lat, lon);

  if ((hasCoordinates && isGurugram(lat, lon)) || /gurugram|gurgaon|manesar/.test(lower)) {
    jurisdiction = "Haryana / Gurugram";
    planningSource = "GMDA / TCP Haryana FeatureServer";
    if (hasCoordinates) {
      const entries = await Promise.all(Object.entries(GMDA_LAYERS).map(async ([name, id]) => [name, await queryGmdaLayer(id, lat, lon)] as const));
      evidence = Object.fromEntries(entries.filter(([, value]) => value));
      ruleStatus = Object.keys(evidence).length ? "Spatial evidence resolved; regulations still require verified rule-set activation" : "GMDA layer query returned no intersecting feature";
    } else ruleStatus = "Coordinates required for authoritative spatial intersection";
  } else if ((hasCoordinates && isDelhi(lat, lon)) || /delhi|new delhi|dwarka|rohini|okhla|saket|jasola|narela|shahdara|karol bagh/.test(lower)) {
    jurisdiction = "Delhi";
    planningSource = "DDA GIS / DDA Maps Geo-Portal + concerned local body";
    ruleStatus = "DDA source identified; automated parcel/planning intersection not activated yet";
  } else if (region || indiaCoordinate || /india|bharat/.test(lower)) {
    jurisdiction = region ? `${region.name} / local planning authority` : "India — local authority pending";
    planningSource = region ? `${region.name} regulatory source catalogue + national India data core` : "National India data core";
    ruleStatus = "National source coverage available; local jurisdiction and clause-level rules require resolution before numeric controls are activated";
  }

  return NextResponse.json({
    jurisdiction, planningSource, plotArea: Number(plotArea.toFixed(2)),
    coordinates: hasCoordinates ? { lat, lon } : null,
    indiaCoverage: true, region: region?.name ?? null, ruleStatus, evidence,
    note: "Build Ai is India-wide at intake: national geospatial, planning and building-regulation source catalogs cover all states and union territories. Legal controls remain evidence-gated and are activated only after the applicable authority, source version, clause and effective date are verified.",
    sources: SOURCES,
  });
}
