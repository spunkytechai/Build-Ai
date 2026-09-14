export type IndiaRegion = {
  name: string;
  kind: "state" | "union-territory";
  slug: string;
  regulationSource: string;
  regulationSourceUrl: string;
};

export const INDIA_DATA_SOURCES = {
  nationalBuildingCode: {
    authority: "Bureau of Indian Standards",
    document: "National Building Code of India 2016",
    url: "https://www.bis.gov.in/standards/national-building-code/?lang=en",
    role: "national_model_code",
    status: "verified-source",
  },
  standardizedDevelopmentRegulations: {
    authority: "Bureau of Indian Standards",
    document: "Standardized Development and Building Regulations, 2023",
    url: "https://www.bis.gov.in/standardized-development-and-building-regulations-2023/?lang=en",
    role: "state_ut_model_regulations",
    status: "verified-source",
  },
  tcpo: {
    authority: "Town and Country Planning Organisation, MoHUA",
    document: "Model Building Bye-Laws / URDPFI Guidelines",
    url: "https://tcpo.gov.in/guidelines",
    role: "planning_guidance",
    status: "verified-source",
  },
  surveyOfIndia: {
    authority: "Survey of India",
    document: "Administrative Boundary Database / Pan-India topographic data",
    url: "https://surveyofindia.gov.in/pages/administrative-boundary-data-base-abdb-",
    role: "authoritative_reference_geography",
    status: "verified-source",
  },
  surveyOfIndiaMaps: {
    authority: "Survey of India",
    document: "Online Maps Portal",
    url: "https://onlinemaps.surveyofindia.gov.in/AboutPortal.aspx",
    role: "national_geospatial_reference",
    status: "verified-source",
  },
  localGovernmentDirectory: {
    authority: "Ministry of Panchayati Raj",
    document: "Local Government Directory (LGD)",
    url: "https://lgdirectory.gov.in/demo/downloadDirectory.do",
    role: "local_government_directory",
    status: "verified-source",
  },
  bhuvan: {
    authority: "NRSC / ISRO",
    document: "Bhuvan geospatial portal",
    url: "https://bhuvan-app1.nrsc.gov.in/bhuvan2d2.0/",
    role: "planning_reference_imagery_and_layers",
    status: "verified-source-reference-only",
  },
} as const;

const STANDARDIZED_REGULATIONS_URL = INDIA_DATA_SOURCES.standardizedDevelopmentRegulations.url;

const states = [
  ["Andhra Pradesh", "andhra-pradesh"], ["Arunachal Pradesh", "arunachal-pradesh"], ["Assam", "assam"],
  ["Bihar", "bihar"], ["Chhattisgarh", "chhattisgarh"], ["Goa", "goa"], ["Gujarat", "gujarat"],
  ["Haryana", "haryana"], ["Himachal Pradesh", "himachal-pradesh"], ["Jharkhand", "jharkhand"],
  ["Karnataka", "karnataka"], ["Kerala", "kerala"], ["Madhya Pradesh", "madhya-pradesh"],
  ["Maharashtra", "maharashtra"], ["Manipur", "manipur"], ["Meghalaya", "meghalaya"], ["Mizoram", "mizoram"],
  ["Nagaland", "nagaland"], ["Odisha", "odisha"], ["Punjab", "punjab"], ["Rajasthan", "rajasthan"],
  ["Sikkim", "sikkim"], ["Tamil Nadu", "tamil-nadu"], ["Telangana", "telangana"], ["Tripura", "tripura"],
  ["Uttar Pradesh", "uttar-pradesh"], ["Uttarakhand", "uttarakhand"], ["West Bengal", "west-bengal"],
] as const;

const unionTerritories = [
  ["Andaman and Nicobar Islands", "andaman-and-nicobar-islands"], ["Chandigarh", "chandigarh"],
  ["Dadra and Nagar Haveli and Daman & Diu", "dadra-and-nagar-haveli-and-daman-and-diu"], ["Delhi", "delhi"],
  ["Jammu & Kashmir", "jammu-and-kashmir"], ["Ladakh", "ladakh"], ["Lakshadweep", "lakshadweep"],
  ["Puducherry", "puducherry"],
] as const;

function makeRegions(rows: readonly (readonly [string, string])[], kind: IndiaRegion["kind"]): IndiaRegion[] {
  return rows.map(([name, slug]) => ({
    name,
    slug,
    kind,
    regulationSource: "BIS Standardized Development and Building Regulations, 2023 + applicable local authority rules",
    regulationSourceUrl: STANDARDIZED_REGULATIONS_URL,
  }));
}

export const INDIA_REGIONS: IndiaRegion[] = [
  ...makeRegions(states, "state"),
  ...makeRegions(unionTerritories, "union-territory"),
];

export const INDIA_REGION_COUNT = INDIA_REGIONS.length;

export function isPlausibleIndiaCoordinate(lat: number, lon: number) {
  return lat >= 6.0 && lat <= 37.2 && lon >= 68.0 && lon <= 97.8;
}

export function findIndiaRegionByText(value: string) {
  const text = value.toLowerCase();
  return INDIA_REGIONS.find((region) => text.includes(region.name.toLowerCase()) || text.includes(region.slug));
}
