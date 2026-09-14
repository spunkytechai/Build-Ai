import type { RegulatoryRule } from "./engine";

export const VERIFIED_SOURCES = {
  delhiUbbL2016: {
    authority: "DDA",
    jurisdiction: "Delhi",
    document: "Unified Building Bye Laws for Delhi 2016",
    sourceUrl: "https://www.dda.gov.in/sites/default/files/2022-01/UBBL_2016_Notified.pdf",
    status: "verified-source-pending-rule-extraction",
  },
  ddaBuildingLaws: {
    authority: "DDA",
    jurisdiction: "Delhi",
    document: "DDA Building Laws",
    sourceUrl: "https://dda.gov.in/building-laws",
    status: "verified-source",
  },
  gmdaTcp: {
    authority: "GMDA / TCP Haryana",
    jurisdiction: "Gurugram / Haryana",
    document: "TCP Haryana planning GIS FeatureServer",
    sourceUrl: "https://onemapdepts.gmda.gov.in/server/rest/services/TCP_Haryana/tcp_haryana_encroachement/FeatureServer",
    status: "verified-source-spatial",
  },
} as const;

// Intentionally empty: numeric controls are activated only after clause-level verification.
export const ACTIVE_RULES: RegulatoryRule[] = [];
