export const REGULATORY_STATUS = {
  noVerifiedRules: "no_verified_rules",
  verifiedSourcesPendingRuleActivation: "verified_sources_pending_rule_activation",
  verifiedControlsAvailable: "verified_controls_available",
} as const;

export type RegulatoryStatus = (typeof REGULATORY_STATUS)[keyof typeof REGULATORY_STATUS];
