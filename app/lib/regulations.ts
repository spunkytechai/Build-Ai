export type RegulationRule = {
  id: string;
  jurisdiction: string;
  authority: string;
  ruleType: "database";
  value: string;
  effectiveFrom: string;
  sourceDocument: string;
  sourceClause: string;
  verificationStatus: "verified";
};

export const REGULATORY_STATUS = {
  noVerifiedRules: "no_verified_rules",
  verifiedSourcesPendingRuleActivation: "verified_sources_pending_rule_activation",
  verifiedControlsAvailable: "verified_controls_available",
} as const;
