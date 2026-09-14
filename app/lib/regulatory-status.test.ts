import { REGULATORY_STATUS } from "./regulatory-status";

if (REGULATORY_STATUS.noVerifiedRules === REGULATORY_STATUS.verifiedControlsAvailable) {
  throw new Error("Regulatory status values must remain distinct");
}
