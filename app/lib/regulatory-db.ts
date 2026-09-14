import { createClient } from "@/lib/supabase/server";

export type RegulatorySource = {
  id: string;
  authority: string;
  title: string;
  source_url: string | null;
  version: string | null;
  published_at: string | null;
  effective_at: string | null;
  retrieved_at: string;
  verification_status: string;
};

export type RegulatoryRule = {
  id: string;
  source_id: string | null;
  jurisdiction: string;
  building_type: string | null;
  rule_key: string;
  operator: string;
  value: number | null;
  unit: string | null;
  clause: string | null;
  conditions: Record<string, unknown>;
  active: boolean;
};

export async function getRegulatoryContext(jurisdiction: string) {
  const supabase = await createClient();
  const normalized = jurisdiction.trim();
  const [{ data: sources, error: sourceError }, { data: rules, error: ruleError }] = await Promise.all([
    supabase
      .from("regulatory_sources")
      .select("id,authority,title,source_url,version,published_at,effective_at,retrieved_at,verification_status")
      .eq("verification_status", "verified")
      .order("effective_at", { ascending: false, nullsFirst: false }),
    supabase
      .from("regulatory_rules")
      .select("id,source_id,jurisdiction,building_type,rule_key,operator,value,unit,clause,conditions,active")
      .eq("jurisdiction", normalized)
      .eq("active", true)
      .order("rule_key"),
  ]);

  if (sourceError) throw sourceError;
  if (ruleError) throw ruleError;

  return {
    jurisdiction: normalized,
    sources: (sources ?? []) as RegulatorySource[],
    rules: (rules ?? []) as RegulatoryRule[],
    status: rules?.length ? "verified_controls_available" : "verified_sources_pending_rule_activation",
  } as const;
}
