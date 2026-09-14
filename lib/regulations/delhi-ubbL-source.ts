export type SourceRevision = {
  id: string;
  authority: string;
  jurisdiction: string;
  title: string;
  notificationDate: string;
  sourceUrl: string;
  status: "source-verified" | "needs-clause-review";
};

export const DELHI_UBBL_SOURCE_CHAIN: SourceRevision[] = [
  {
    id: "dda-ubbL-2016",
    authority: "DDA",
    jurisdiction: "Delhi",
    title: "Unified Building Bye Laws for Delhi 2016",
    notificationDate: "2016-03-22",
    sourceUrl: "https://dda.gov.in/sites/default/files/2022-01/UBBL_2016_Notified.pdf",
    status: "source-verified",
  },
  {
    id: "dda-ubbL-2017-04-05",
    authority: "DDA",
    jurisdiction: "Delhi",
    title: "Modifications in the Unified Building Bye-Laws (UBBL) for Delhi 2016",
    notificationDate: "2017-04-05",
    sourceUrl: "https://dda.gov.in/sites/default/files/gazette-notification/UBBL-2016%205th%20April%202017060417_0.pdf",
    status: "source-verified",
  },
  {
    id: "dda-ubbL-compendium-2020",
    authority: "DDA",
    jurisdiction: "Delhi",
    title: "Unified Building Bye Laws for Delhi 2016 — Compendium incorporating amendments up to 12 February 2020",
    notificationDate: "2020-02-12",
    sourceUrl: "https://dda.gov.in/sites/default/files/public-notice/COMPENDIUM_OF_UBBL_201605082020.pdf",
    status: "source-verified",
  },
  {
    id: "dda-ubbL-2021-amendment",
    authority: "DDA",
    jurisdiction: "Delhi",
    title: "UBBL 2016 amendment notified 29 June 2021",
    notificationDate: "2021-06-29",
    sourceUrl: "https://dda.gov.in/about-building-approval-department",
    status: "needs-clause-review",
  },
];

export const EXTRACTION_POLICY = {
  activateNumericRuleOnlyWhen: [
    "applicable jurisdiction is resolved",
    "source revision is identified",
    "clause/sub-clause is captured",
    "numeric value and unit are explicit in the source",
    "applicability conditions are represented",
    "supersession/amendment status is resolved",
    "human verification status is verified",
  ],
  unknownIsBlockingForCompliance: true,
} as const;
