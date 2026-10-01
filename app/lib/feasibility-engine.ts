export type FeasibilityInput = {
  widthM: number;
  depthM: number;
  frontSetbackM?: number | null;
  rearSetbackM?: number | null;
  leftSetbackM?: number | null;
  rightSetbackM?: number | null;
  maxCoveragePercent?: number | null;
  maxFar?: number | null;
};

export type FeasibilityEnvelope = {
  plotAreaM2: number;
  buildableWidthM: number;
  buildableDepthM: number;
  geometricFootprintM2: number;
  coverageFootprintM2: number | null;
  permittedFootprintM2: number;
  farCapacityM2: number | null;
  status: "computed" | "invalid";
  errors: string[];
};

const round = (value: number) => Math.round(value * 100) / 100;

function nonNegative(value: number | null | undefined) {
  return value == null ? 0 : Math.max(0, Number(value));
}

export function calculateFeasibility(input: FeasibilityInput): FeasibilityEnvelope {
  const errors: string[] = [];
  const width = Number(input.widthM);
  const depth = Number(input.depthM);

  if (!Number.isFinite(width) || width <= 0) errors.push("Plot width must be greater than zero.");
  if (!Number.isFinite(depth) || depth <= 0) errors.push("Plot depth must be greater than zero.");

  const safeWidth = Number.isFinite(width) && width > 0 ? width : 0;
  const safeDepth = Number.isFinite(depth) && depth > 0 ? depth : 0;
  const plotAreaM2 = safeWidth * safeDepth;
  const buildableWidthM = Math.max(0, safeWidth - nonNegative(input.leftSetbackM) - nonNegative(input.rightSetbackM));
  const buildableDepthM = Math.max(0, safeDepth - nonNegative(input.frontSetbackM) - nonNegative(input.rearSetbackM));
  const geometricFootprintM2 = buildableWidthM * buildableDepthM;

  let coverageFootprintM2: number | null = null;
  if (input.maxCoveragePercent != null) {
    const coverage = Number(input.maxCoveragePercent);
    if (!Number.isFinite(coverage) || coverage < 0 || coverage > 100) {
      errors.push("Maximum coverage must be between 0 and 100 percent.");
    } else {
      coverageFootprintM2 = plotAreaM2 * coverage / 100;
    }
  }

  let farCapacityM2: number | null = null;
  if (input.maxFar != null) {
    const far = Number(input.maxFar);
    if (!Number.isFinite(far) || far < 0) errors.push("Maximum FAR must be zero or greater.");
    else farCapacityM2 = plotAreaM2 * far;
  }

  const permittedFootprintM2 = coverageFootprintM2 == null
    ? geometricFootprintM2
    : Math.min(geometricFootprintM2, coverageFootprintM2);

  return {
    plotAreaM2: round(plotAreaM2),
    buildableWidthM: round(buildableWidthM),
    buildableDepthM: round(buildableDepthM),
    geometricFootprintM2: round(geometricFootprintM2),
    coverageFootprintM2: coverageFootprintM2 == null ? null : round(coverageFootprintM2),
    permittedFootprintM2: round(permittedFootprintM2),
    farCapacityM2: farCapacityM2 == null ? null : round(farCapacityM2),
    status: errors.length === 0 ? "computed" : "invalid",
    errors,
  };
}
