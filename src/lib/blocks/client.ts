import { createBlocksClient, type BlocksClient } from "@seliseblocks/client";
import { blocksConfig } from "@/lib/blocks/config";

let client: BlocksClient | undefined;

export function getBlocksClient(): BlocksClient {
  if (!blocksConfig.apiUrl || !blocksConfig.xBlocksKey) {
    throw new Error("Blocks IAM is not configured for this deployment.");
  }

  client ??= createBlocksClient({
    apiUrl: blocksConfig.apiUrl,
    xBlocksKey: blocksConfig.xBlocksKey,
    appDomain: blocksConfig.appDomain || undefined,
    oidc: {
      clientId: blocksConfig.oidcClientId,
      redirectUri: blocksConfig.redirectUri || undefined,
      scope: blocksConfig.oidcScope,
      url: blocksConfig.oidcUrl,
    },
  });

  return client;
}
