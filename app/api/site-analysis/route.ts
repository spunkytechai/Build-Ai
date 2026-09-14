import { NextResponse } from "next/server";

const SOURCES = {
  dda: "https://dda.gov.in/building-laws",
  gmda: "https://onemapdepts.gmda.gov.in/server/rest/services/TCP_Haryana/tcp_haryana_encroachement/FeatureServer",
};

export async function POST(req: Request) {
  const body = await req.json();
  const address = String(body.address || "").trim();
  const width = Number(body.plotWidth || 0);
  const depth = Number(body.plotDepth || 0);
  const plotArea = Math.max(0, width * depth);
  const lower = address.toLowerCase();
  let jurisdiction = "Needs spatial resolution";
  let planningSource = "No authoritative planning layer resolved yet";
  if (/delhi|new delhi|dwarka|rohini|okhla|saket|jasola|narela|shahdara|karol bagh/.test(lower)) {
    jurisdiction = "Delhi — authority resolution required at parcel/ULB level";
    planningSource = "DDA planning / GIS + concerned local body";
  } else if (/gurugram|gurgaon|manesar|haryana/.test(lower)) {
    jurisdiction = "Haryana / Gurugram — authority resolution required at parcel level";
    planningSource = "GMDA / TCP Haryana FeatureServer";
  }
  return NextResponse.json({
    jurisdiction,
    planningSource,
    plotArea: Number(plotArea.toFixed(2)),
    ruleStatus: "Not activated — source verification required",
    note: "This engine deliberately does not invent FAR, setbacks, coverage or height values. Production rules are activated only after the applicable authority, document version, clause and effective date are resolved.",
    sources: SOURCES,
  });
}
