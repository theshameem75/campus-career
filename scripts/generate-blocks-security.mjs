import { execFileSync } from "node:child_process";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemasDirectory = path.join(root, "blocks", "data", "schemas");
const planPath = path.join(root, "blocks", "data", "security-plan.json");
const rulesPath = path.join(root, "blocks", "data", "rules.json");
const project = "D8fb34a0fb75740f0b8a479a550807393";
const account = "default";
const operations = [
  { name: "READ", value: 0 },
  { name: "WRITE", value: 1 },
  { name: "EDIT", value: 2 },
  { name: "DELETE", value: 3 },
];

const schemaNames = (await readdir(schemasDirectory))
  .filter((name) => name.endsWith(".json"))
  .map((name) => name.replace(/\.json$/, ""))
  .sort();

const plan = {
  defaultEffect: "DENY",
  accessLevel: "Custom",
  accessLevelValue: 3,
  policyType: "RLS",
  policyTypeValue: 0,
  policies: [],
  security: schemaNames.flatMap((schemaName) =>
    operations.map((operation) => ({
      schemaName,
      operation: operation.name,
      operationValue: operation.value,
      accessLevel: "Custom",
      accessLevelValue: 3,
      policyType: "RLS",
      policyTypeValue: 0,
      fieldNames: [],
    })),
  ),
};

await mkdir(path.dirname(planPath), { recursive: true });
await writeFile(planPath, `${JSON.stringify(plan, null, 2)}\n`);

if (!process.argv.includes("--resolve-live")) {
  console.log(
    `Generated deny-by-default plan for ${schemaNames.length} schemas and ${plan.security.length} operation settings.`,
  );
  process.exit(0);
}

const cliEntry = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "@seliseblocks",
  "cli-os",
  "bin",
  "run.js",
);
const raw = execFileSync(
  process.execPath,
  [
    cliEntry,
    "data",
    "schema",
    "list",
    "--page-size",
    "500",
    "--account",
    account,
    "--project",
    project,
    "--json",
  ],
  {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, BLOCKS_STRICT_FLAGS: "1" },
    maxBuffer: 10 * 1024 * 1024,
  },
);

const response = JSON.parse(raw);
function schemaRows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  return schemaRows(value.data ?? value.schemas);
}

const rows = schemaRows(response);
const onlyIndex = process.argv.indexOf("--only");
const onlySchema = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : undefined;
if (onlyIndex >= 0 && !onlySchema) {
  throw new Error("--only requires a schema name.");
}
const selectedSchemaNames = onlySchema ? [onlySchema] : schemaNames;
const byName = new Map(
  rows.map((schema) => [
    schema.schemaName,
    schema.id ?? schema.itemId ?? schema.schemaDefinitionItemId,
  ]),
);
const missing = selectedSchemaNames.filter((name) => !byName.get(name));
if (missing.length) {
  throw new Error(
    `Cannot resolve live schema IDs for: ${missing.join(", ")}. Push schema definitions first.`,
  );
}

const rules = {
  security: plan.security
    .filter((entry) => selectedSchemaNames.includes(entry.schemaName))
    .map((entry) => ({
      accessLevel: entry.accessLevelValue,
      fieldNames: entry.fieldNames,
      operation: entry.operationValue,
      policyType: entry.policyTypeValue,
      schemaId: byName.get(entry.schemaName),
    })),
  policies: [],
};
await writeFile(rulesPath, `${JSON.stringify(rules, null, 2)}\n`);
console.log(
  `Resolved ${rules.security.length} Custom security settings for ${selectedSchemaNames.length} live schemas; allow-policy count is zero.`,
);

// Confirm the written file can be parsed before a deploy command consumes it.
JSON.parse(await readFile(rulesPath, "utf8"));
