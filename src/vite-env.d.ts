/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_BLOCKS_API_URL?: string;
  readonly VITE_BLOCKS_X_BLOCKS_KEY?: string;
  readonly VITE_BLOCKS_OIDC_URL?: string;
  readonly VITE_BLOCKS_OIDC_CLIENT_ID?: string;
  readonly VITE_BLOCKS_OIDC_SCOPE?: string;
  readonly VITE_BLOCKS_APP_DOMAIN?: string;
  readonly VITE_BLOCKS_REDIRECT_URI?: string;
  readonly VITE_BLOCKS_HOSTED_LOGIN?: string;
  readonly VITE_BLOCKS_DEV_HOST?: string;
  readonly VITE_BLOCKS_DEV_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
