import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { generate } from "selfsigned";

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};
  return Object.fromEntries(
    fs
      .readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
        return match
          ? [[match[1], match[2].trim().replace(/^['"]|['"]$/g, "")]]
          : [];
      }),
  );
}

const root = process.cwd();
const fileEnv = readEnvFile(path.join(root, ".env"));
const host =
  process.argv[2] ||
  process.env.VITE_BLOCKS_DEV_HOST ||
  fileEnv.VITE_BLOCKS_DEV_HOST;

if (!host) {
  console.error(
    "No domain given. Set VITE_BLOCKS_DEV_HOST in .env or run npm run cert -- <domain>.",
  );
  process.exit(1);
}

const certDirectory = path.join(root, ".cert");
const keyPath = path.join(certDirectory, "dev-key.pem");
const certPath = path.join(certDirectory, "dev-cert.pem");
const notAfterDate = new Date();
notAfterDate.setFullYear(notAfterDate.getFullYear() + 2);

const pems = await generate([{ name: "commonName", value: host }], {
  algorithm: "sha256",
  keySize: 2048,
  notAfterDate,
  extensions: [
    { name: "basicConstraints", cA: false, critical: true },
    {
      name: "keyUsage",
      digitalSignature: true,
      keyEncipherment: true,
      critical: true,
    },
    { name: "extKeyUsage", serverAuth: true },
    {
      name: "subjectAltName",
      altNames: [
        { type: 2, value: host },
        { type: 2, value: "localhost" },
        { type: 7, ip: "127.0.0.1" },
      ],
    },
  ],
});

fs.mkdirSync(certDirectory, { recursive: true });
fs.writeFileSync(keyPath, pems.private, { mode: 0o600 });
fs.writeFileSync(certPath, pems.cert);

console.log(`Generated a development certificate for ${host}:`);
console.log(`  ${keyPath}`);
console.log(`  ${certPath}`);
if (process.platform === "win32") {
  console.log("Trust it from an elevated PowerShell prompt:");
  console.log("  certutil -addstore -f Root .cert\\dev-cert.pem");
}
