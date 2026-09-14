export type RuleStatus = "PASS" | "FAIL" | "UNKNOWN";
export type RuleType = "setback" | "coverage" | "far" | "height" | "parking";

export type RegulatoryRule = {
  id: string;
  authority: string;
  jurisdiction: string;
  ruleType: RuleType;
  value?: number;
  unit?: string;
  condition?: Record<string, unknown>;
  sourceDocument: string;
  sourceClause: string;
  effectiveFrom?: string;
  verificationStatus: "verified" | "pending" | "superseded";
};

export type DesignFacts = {
  plotArea?: number;
  proposedBuiltUpArea?: number;
  proposedCoverageArea?: number;
  proposedHeight?: number;
  frontSetback?: number;
  rearSetback?: number;
  sideSetback?: number;
  parkingSpaces?: number;
};

export type RuleResult = {
  ruleId: string;
  type: RuleType;
  status: RuleStatus;
  message: string;
  source: Pick<RegulatoryRule, "authority" | "sourceDocument" | "sourceClause" | "effectiveFrom" | "verificationStatus">;
};

function source(rule: RegulatoryRule) {
  return {
    authority: rule.authority,
    sourceDocument: rule.sourceDocument,
    sourceClause: rule.sourceClause,
    effectiveFrom: rule.effectiveFrom,
    verificationStatus: rule.verificationStatus,
  };
}

export function evaluateRule(rule: RegulatoryRule, facts: DesignFacts): RuleResult {
  if (rule.verificationStatus !== "verified" || rule.value == null) {
    return { ruleId: rule.id, type: rule.ruleType, status: "UNKNOWN", message: "Applicable rule is not verified and activated.", source: source(rule) };
  }

  let status: RuleStatus = "UNKNOWN";
  let message = "Required design evidence is missing.";

  if (rule.ruleType === "far" && facts.plotArea != null && facts.proposedBuiltUpArea != null) {
    const far = facts.proposedBuiltUpArea / facts.plotArea;
    status = far <= rule.value ? "PASS" : "FAIL";
    message = `Calculated FAR ${far.toFixed(3)} vs maximum ${rule.value}.`;
  } else if (rule.ruleType === "coverage" && facts.plotArea != null && facts.proposedCoverageArea != null) {
    const coverage = (facts.proposedCoverageArea / facts.plotArea) * 100;
    status = coverage <= rule.value ? "PASS" : "FAIL";
    message = `Calculated coverage ${coverage.toFixed(2)}% vs maximum ${rule.value}%.`;
  } else if (rule.ruleType === "height" && facts.proposedHeight != null) {
    status = facts.proposedHeight <= rule.value ? "PASS" : "FAIL";
    message = `Proposed height ${facts.proposedHeight} m vs maximum ${rule.value} m.`;
  } else if (rule.ruleType === "setback") {
    const sides = [facts.frontSetback, facts.rearSetback, facts.sideSetback];
    if (sides.some(v => v != null)) {
      const known = sides.filter((v): v is number => v != null);
      status = known.every(v => v >= rule.value!) ? "PASS" : "FAIL";
      message = `Minimum setback ${rule.value} m evaluated against supplied setbacks.`;
    }
  } else if (rule.ruleType === "parking" && facts.parkingSpaces != null) {
    status = facts.parkingSpaces >= rule.value ? "PASS" : "FAIL";
    message = `Parking ${facts.parkingSpaces} spaces vs minimum ${rule.value}.`;
  }

  return { ruleId: rule.id, type: rule.ruleType, status, message, source: source(rule) };
}

export function evaluateRules(rules: RegulatoryRule[], facts: DesignFacts) {
  const results = rules.map(rule => evaluateRule(rule, facts));
  return {
    results,
    overall: results.some(r => r.status === "FAIL") ? "FAIL" : results.some(r => r.status === "UNKNOWN") ? "UNKNOWN" : "PASS",
  } as const;
}
