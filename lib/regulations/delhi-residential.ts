import type { RegulatoryRule } from "./engine";

const sourceDocument = "Unified Building Bye-Laws for Delhi 2016";
const sourceClause = "Table 17.1 — Minimum Setbacks (other than Residential Plotted Development)";

// Keep this table separate from the active catalog until applicability to the
// specific residential-plotted use is confirmed. It is retained as a verified
// source extraction, not as a universal residential rule.
export const DELHI_EXTRACTED_SETBACK_RULES: RegulatoryRule[] = [
  { id: "delhi-ubbL-t17-1-upto60-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 0, unit: "m", condition: [{ field: "plotArea", max: 60 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-60-150-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 3, unit: "m", condition: [{ field: "plotArea", min: 60.000001, max: 150 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-150-300-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 4, unit: "m", condition: [{ field: "plotArea", min: 150.000001, max: 300 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-300-500-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 4, unit: "m", condition: [{ field: "plotArea", min: 300.000001, max: 500 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-500-2000-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 6, unit: "m", condition: [{ field: "plotArea", min: 500.000001, max: 2000 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-2000-10000-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 9, unit: "m", condition: [{ field: "plotArea", min: 2000.000001, max: 10000 }], sourceDocument, sourceClause, verificationStatus: "verified" },
  { id: "delhi-ubbL-t17-1-over10000-front", authority: "DDA", jurisdiction: "Delhi", ruleType: "setback", side: "front", value: 15, unit: "m", condition: [{ field: "plotArea", min: 10000.000001 }], sourceDocument, sourceClause, verificationStatus: "verified" },
];
