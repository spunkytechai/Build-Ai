import type { RegulatoryRule } from "./regulatory-db";

export type PlotInput = {
  width: number;
  depth: number;
  frontSetback: number;
  rearSetback: number;
  leftSetback: number;
  rightSetback: number;
};

export type FeasibilityResult = {
  plotArea: number;
  buildableWidth: number;
  buildableDepth: number;
  setbackFootprint: number;
  maxCoveragePercent: number | null;
  maxFootprintByCoverage: number | null;
  maxFar: number | null;
  maxFloorAreaByFar: number | null;
  permittedFootprint: number | null;
  maxHeight: number | null;
  parkingMode: string | null;
  regulatoryRuleIds: string[];
  regulatoryStatus: "verified" | "partial" | "unresolved";
};

function finitePositive(value: number) {
  return Number.isFinite(value) && value > 0;
}

function round(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateFeasibility(plot: PlotInput, rules: RegulatoryRule[], parkingMode: string | null = null): FeasibilityResult {
  const width = Math.max(0, Number(plot.width) || 0);
  const depth = Math.max(0, Number(plot.depth) || 0);
  const area = round(width * depth);
  const buildableWidth = round(Math.max(0, width - Math.max(0, plot.leftSetback) - Math.max(0, plot.rightSetback)));
  const buildableDepth = round(Math.max(0, depth - Math.max(0, plot.frontSetback) - Math.max(0, plot.rearSetback)));
  const setbackFootprint = round(buildableWidth * buildableDepth);

  const context: Record<string, unknown> = { plot_area_m2: area };
  if (parkingMode) context.parking_mode = parkingMode;

  const applicable = rules.filter((rule) => {
    if (rule.building_type && rule.building_type !== "residential_plotted") return false;
    const conditions = rule.conditions ?? {};
    for (const [key, expected] of Object.entries(conditions)) {
      if (key === "basis") continue;
      if (key.endsWith("_min_m2")) {
        if (area < Number(expected)) return false;
      } else if (key.endsWith("_max_m2")) {
        if (area > Number(expected)) return false;
      } else if (context[key] !== expected) {
        return false;
      }
    }
    return true;
  });

  const coverageRule = applicable.find((rule) => rule.rule_key === "max_ground_coverage" && rule.value != null);
  const farRule = applicable.find((rule) => rule.rule_key === "max_far" && rule.value != null);
  const heightRule = applicable.find((rule) => rule.rule_key === "max_height" && rule.value != null);
  const maxCoveragePercent = coverageRule?.value ?? null;
  const maxFootprintByCoverage = maxCoveragePercent == null ? null : round(area * maxCoveragePercent / 100);
  const maxFar = farRule?.value ?? null;
  const maxFloorAreaByFar = maxFar == null ? null : round(area * maxFar);
  const permittedFootprint = maxFootprintByCoverage == null ? null : round(Math.min(setbackFootprint, maxFootprintByCoverage));
  const regulatoryRuleIds = applicable.map((rule) => rule.id);
  const regulatoryStatus = regulatoryRuleIds.length === 0 ? "unresolved" : (coverageRule && farRule ? "verified" : "partial");

  return {
    plotArea: area,
    buildableWidth,
    buildableDepth,
    setbackFootprint,
    maxCoveragePercent,
    maxFootprintByCoverage,
    maxFar,
    maxFloorAreaByFar,
    permittedFootprint,
    maxHeight: heightRule?.value ?? null,
    parkingMode,
    regulatoryRuleIds,
    regulatoryStatus,
  };
}

export function isValidPlot(plot: PlotInput) {
  return finitePositive(plot.width) && finitePositive(plot.depth) && [plot.frontSetback, plot.rearSetback, plot.leftSetback, plot.rightSetback].every((v) => Number.isFinite(v) && v >= 0);
}
