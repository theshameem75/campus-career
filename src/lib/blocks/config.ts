import { env } from "@/config/env";

export const blocksConfig = env.blocks;

export function getMissingLoginConfig(): string[] {
  return [
    ["VITE_BLOCKS_API_URL", blocksConfig.apiUrl],
    ["VITE_BLOCKS_X_BLOCKS_KEY", blocksConfig.xBlocksKey],
    ["VITE_BLOCKS_OIDC_URL", blocksConfig.oidcUrl],
    ["VITE_BLOCKS_OIDC_CLIENT_ID", blocksConfig.oidcClientId],
  ]
    .filter(([, value]) => !value)
    .map(([name]) => name);
}

export function isLoginConfigured(): boolean {
  return getMissingLoginConfig().length === 0;
}
