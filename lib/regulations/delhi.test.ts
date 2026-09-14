import { evaluateRules } from "./engine";

const farRule = {
  id: "delhi-far-test",
  authority: "DDA",
  jurisdiction: "Delhi",
  ruleType: "far" as const,
  value: 2,
  unit: "ratio",
  sourceDocument: "UBBL 2016",
  sourceClause: "TEST-CLAUSE",
  effectiveFrom: "2016-03-22",
  verificationStatus: "verified" as const,
};

test("verified FAR rule passes compliant design", () => {
  const result = evaluateRules([farRule], { plotArea: 100, proposedBuiltUpArea: 180 });
  expect(result.overall).toBe("PASS");
});

test("verified FAR rule fails non-compliant design", () => {
  const result = evaluateRules([farRule], { plotArea: 100, proposedBuiltUpArea: 220 });
  expect(result.overall).toBe("FAIL");
});

test("unverified rule remains unknown", () => {
  const result = evaluateRules([{ ...farRule, verificationStatus: "pending" }], { plotArea: 100, proposedBuiltUpArea: 180 });
  expect(result.overall).toBe("UNKNOWN");
});
