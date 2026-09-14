import type { RegulatoryRule } from "./engine";

const SOURCE_DOCUMENT = "Unified Building Bye Laws for Delhi 2016";
const SOURCE_CLAUSE = "Chapter 7, residential plotted development provisions; exact applicability must be resolved against the applicable plot category and planning context.";

/**
 * Clause-verified controls from the official UBBL 2016 notification.
 * These remain evidence-backed rule candidates; they are not a substitute
 * for plot-specific sanction review or later amendments.
 */
export const DELHI_RESIDENTIAL_RULES: RegulatoryRule[] = [
  {
    id: "delhi-residential-height-no-stilt-15m",
    authority: "DDA",
    jurisdiction: "Delhi",
    ruleType: "height",
    value: 15,
    unit: "m",
    condition: [{ field: "stiltParking", equals: false }],
    sourceDocument: SOURCE_DOCUMENT,
    sourceClause: SOURCE_CLAUSE + " Maximum height stated as 15 m for plots without stilt parking.",
    effectiveFrom: "2016-03-22",
    verificationStatus: "verified",
  },
  {
    id: "delhi-residential-height-with-stilt-17_5m",
    authority: "DDA",
    jurisdiction: "Delhi",
    ruleType: "height",
    value: 17.5,
    unit: "m",
    condition: [{ field: "stiltParking", equals: true }],
    sourceDocument: SOURCE_DOCUMENT,
    sourceClause: SOURCE_CLAUSE + " Maximum height stated as 17.5 m for plots with stilt parking.",
    effectiveFrom: "2016-03-22",
    verificationStatus: "verified",
  },
  {
    id: "delhi-residential-parking-250-300sqm-2ecs",
    authority: "DDA",
    jurisdiction: "Delhi",
    ruleType: "parking",
    value: 2,
    unit: "ECS",
    condition: [{ field: "plotArea", min: 250, max: 300 }],
    sourceDocument: SOURCE_DOCUMENT,
    sourceClause: SOURCE_CLAUSE + " Parking: 2 Equivalent Car Spaces in plots of size 250–300 sq.m.",
    effectiveFrom: "2016-03-22",
    verificationStatus: "verified",
  },
  {
    id: "delhi-residential-parking-over-300sqm-1ecs-per-100sqm",
    authority: "DDA",
    jurisdiction: "Delhi",
    ruleType: "parking",
    value: 1,
    unit: "ECS/100sqm-built-up-area",
    condition: [{ field: "plotArea", min: 300 }],
    sourceDocument: SOURCE_DOCUMENT,
    sourceClause: SOURCE_CLAUSE + " Parking: 1 ECS for every 100 sq.m. built-up area in plots exceeding 300 sq.m., subject to the stated preceding-category exception. Exact ECS calculation remains a later engine step.",
    effectiveFrom: "2016-03-22",
    verificationStatus: "verified",
  },
  {
    id: "delhi-residential-courtyard-50-100sqm-2x2m",
    authority: "DDA",
    jurisdiction: "Delhi",
    ruleType: "setback",
    value: 2,
    unit: "m-courtyard-dimension",
    condition: [{ field: "plotArea", min: 50, max: 100 }],
    sourceDocument: SOURCE_DOCUMENT,
    sourceClause: SOURCE_CLAUSE + " For future construction, a minimum 2 m x 2 m open courtyard is required in residential plots of 50–100 sq.m.; future-construction applicability remains a review condition.",
    effectiveFrom: "2016-03-22",
    verificationStatus: "verified",
  },
];
