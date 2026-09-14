export type Rule = {
  id: string;
  rule_key: string;
  operator: string;
  value: number | null;
  unit: string | null;
  clause: string | null;
};

export type Evaluation = Rule & {
  status: "pass" | "fail" | "not_evaluable";
  actualValue: number | null;
  explanation: string;
};

export function evaluateRule(rule: Rule, actualValue: number | null): Evaluation {
  if (rule.value == null || actualValue == null) {
    return { ...rule, status: "not_evaluable", actualValue, explanation: "Rule or design value is not numeric; no compliance conclusion is made." };
  }
  const required = rule.value;
  let pass = false;
  switch (rule.operator) {
    case "eq": pass = actualValue === required; break;
    case "lte": pass = actualValue <= required; break;
    case "gte": pass = actualValue >= required; break;
    case "lt": pass = actualValue < required; break;
    case "gt": pass = actualValue > required; break;
    default: return { ...rule, status: "not_evaluable", actualValue, explanation: `Unsupported operator: ${rule.operator}` };
  }
  return { ...rule, status: pass ? "pass" : "fail", actualValue, explanation: `${rule.rule_key}: actual ${actualValue}${rule.unit ? ` ${rule.unit}` : ""} ${rule.operator} required ${required}${rule.unit ? ` ${rule.unit}` : ""}.` };
}

export function evaluateRules(rules: Rule[], values: Record<string, number | null>): Evaluation[] {
  return rules.map((rule) => evaluateRule(rule, values[rule.rule_key] ?? null));
}
