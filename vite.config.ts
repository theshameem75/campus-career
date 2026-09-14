import fs from "node:fs";
import path from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const host = env.VITE_BLOCKS_DEV_HOST || "localhost";
  const port = Number(env.VITE_BLOCKS_DEV_PORT || 5173);
  const keyPath = path.resolve(import.meta.dirname, ".cert/dev-key.pem");
  const certPath = path.resolve(import.meta.dirname, ".cert/dev-cert.pem");
  const hasCertificate = fs.existsSync(keyPath) && fs.existsSync(certPath);

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        "@": path.resolve(import.meta.dirname, "./src"),
      },
    },
    server: {
      host,
      port,
      strictPort: true,
      allowedHosts: [host],
      https: hasCertificate
        ? { key: fs.readFileSync(keyPath), cert: fs.readFileSync(certPath) }
        : undefined,
    },
  };
});
