export type RegulationRule={
  id:string;
  jurisdiction:"Delhi"|"Haryana-Gurugram";
  authority:string;
  ruleType:"source_status";
  value:string;
  effectiveFrom:string;
  sourceDocument:string;
  sourceClause:string;
  verificationStatus:"verified";
};

export const VERIFIED_RULES:RegulationRule[]=[
 {id:"delhi-ubbl-2016-notified",jurisdiction:"Delhi",authority:"DDA",ruleType:"source_status",value:"UBBL 2016 notified",effectiveFrom:"2016-03-22",sourceDocument:"https://dda.gov.in/sites/default/files/2022-01/UBBL_2016_Notified.pdf",sourceClause:"1.0 Short Title, Extent and Commencement; 1.1 Jurisdiction; 1.2 Applicability",verificationStatus:"verified"},
 {id:"delhi-ubbl-2016-amend-2021",jurisdiction:"Delhi",authority:"DDA",ruleType:"source_status",value:"Latest amendment in DDA listed UBBL sequence",effectiveFrom:"2021-06-29",sourceDocument:"https://dda.gov.in/about-building-approval-department",sourceClause:"Subsequent amendments/modifications list",verificationStatus:"verified"}
];

export function getRegulationContext(jurisdiction:string){
 const rules=VERIFIED_RULES.filter(r=>r.jurisdiction===jurisdiction);
 return {jurisdiction,rules,activeDesignControls:[],status:rules.length?"source_verified_controls_pending_structuring":"no_verified_rules" as const};
}
