export type RuleStatus = "PASS" | "FAIL" | "UNKNOWN";
export type RuleType = "setback" | "coverage" | "far" | "height" | "parking";
export type SetbackSide = "front" | "rear" | "side1" | "side2";

export type Condition = {
  field: keyof DesignFacts;
  equals?: string | number | boolean;
  min?: number;
  max?: number;
};

export type RegulatoryRule = {
  id: string;
  authority: string;
  jurisdiction: string;
  ruleType: RuleType;
  value?: number;
  unit?: string;
  condition?: Condition[];
  side?: SetbackSide;
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
  side1Setback?: number;
  side2Setback?: number;
  parkingSpaces?: number;
  plotWidth?: number;
  plotDepth?: number;
  stiltParking?: boolean;
  buildingUse?: string;
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

function conditionsMatch(rule: RegulatoryRule, facts: DesignFacts): boolean {
  if (!rule.condition?.length) return true;
  return rule.condition.every(condition => {
    const value = facts[condition.field];
    if (value == null) return false;
    if (condition.equals !== undefined && value !== condition.equals) return false;
    if (condition.min !== undefined && (typeof value !== "number" || value < condition.min)) return false;
    if (condition.max !== undefined && (typeof value !== "number" || value > condition.max)) return false;
    return true;
  });
}

function setbackValue(facts: DesignFacts, side?: SetbackSide): number | undefined {
  if (side === "front") return facts.frontSetback;
  if (side === "rear") return facts.rearSetback;
  if (side === "side1") return facts.side1Setback ?? facts.sideSetback;
  if (side === "side2") return facts.side2Setback ?? facts.sideSetback;
  return facts.sideSetback;
}

export function evaluateRule(rule: RegulatoryRule, facts: DesignFacts): RuleResult {
  if (rule.verificationStatus !== "verified" || rule.value == null) {
    return { ruleId: rule.id, type: rule.ruleType, status: "UNKNOWN", message: "Applicable rule is not verified and activated.", source: source(rule) };
  }

  if (!conditionsMatch(rule, facts)) {
    return { ruleId: rule.id, type: rule.ruleType, status: "UNKNOWN", message: "Rule applicability conditions are not satisfied by the supplied site/design facts.", source: source(rule) };
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
    const supplied = setbackValue(facts, rule.side);
    if (supplied != null) {
      status = supplied >= rule.value ? "PASS" : "FAIL";
      message = `${rule.side ?? "side"} setback ${supplied} m vs minimum ${rule.value} m.`;
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
