import { z } from "zod";

const blankAsUndefined = (value: unknown) =>
  typeof value === "string" && value.trim() === "" ? undefined : value;

const envSchema = z.object({
  VITE_APP_NAME: z.preprocess(
    blankAsUndefined,
    z.string().trim().min(1).default("CampusCareer"),
  ),
  VITE_BLOCKS_API_URL: z.string().trim().default(""),
  VITE_BLOCKS_X_BLOCKS_KEY: z.string().trim().default(""),
  VITE_BLOCKS_OIDC_URL: z.string().trim().default(""),
  VITE_BLOCKS_OIDC_CLIENT_ID: z.string().trim().default(""),
  VITE_BLOCKS_OIDC_SCOPE: z.string().trim().default("openid profile"),
  VITE_BLOCKS_APP_DOMAIN: z.string().trim().default(""),
  VITE_BLOCKS_REDIRECT_URI: z.string().trim().default(""),
});

const parsed = envSchema.parse(import.meta.env);

export const env = {
  appName: parsed.VITE_APP_NAME,
  blocks: {
    apiUrl: parsed.VITE_BLOCKS_API_URL,
    xBlocksKey: parsed.VITE_BLOCKS_X_BLOCKS_KEY,
    oidcUrl: parsed.VITE_BLOCKS_OIDC_URL,
    oidcClientId: parsed.VITE_BLOCKS_OIDC_CLIENT_ID,
    oidcScope: parsed.VITE_BLOCKS_OIDC_SCOPE,
    appDomain: parsed.VITE_BLOCKS_APP_DOMAIN,
    redirectUri: parsed.VITE_BLOCKS_REDIRECT_URI,
  },
} as const;
