import { getEnvVariable } from "./WhitelabelEnv";

export const domain = window.location.hostname;
export const BRAND_NAME = getEnvVariable(domain, "BRAND_NAME");
// Note: It is the main site url. Ex - apnigame.com, etc.
export const BRAND_DOMAIN = getEnvVariable(domain, "BRAND_DOMAIN");
// Note: It is the main site url. Ex - apnigame.com, etc.
export const PROVIDER = "BetFair";
export const PROVIDER_ID = "BetFair";
export const BACKEND_DOMAIN = "uvwin2024.co";
export const IS_NEW_SCORECARD_ENABLED = getEnvVariable(
    domain,
    "IS_NEW_SCORECARD_ENABLED",
);
