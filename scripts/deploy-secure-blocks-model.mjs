import { execFileSync } from "node:child_process";
import { mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const schemaDirectory = path.join(root, "blocks", "data", "schemas");
const securityGenerator = path.join(
  root,
  "scripts",
  "generate-blocks-security.mjs",
);
const project = "D8fb34a0fb75740f0b8a479a550807393";
const account = "default";
const apply = process.argv.includes("--apply");
const cliEntry = path.join(
  path.dirname(process.execPath),
  "node_modules",
  "@seliseblocks",
  "cli-os",
  "bin",
  "run.js",
);

if (
  apply &&
  process.env.CAMPUSCAREER_DATA_DEPLOY_APPROVED !==
    "D8fb34a0fb75740f0b8a479a550807393"
) {
  throw new Error(
    "Refusing live deployment without the exact CAMPUSCAREER_DATA_DEPLOY_APPROVED project value.",
  );
}

function cli(args, { quiet = false } = {}) {
  const output = execFileSync(
    process.execPath,
    [cliEntry, ...args, "--account", account, "--project", project, "--json"],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, BLOCKS_STRICT_FLAGS: "1" },
      maxBuffer: 25 * 1024 * 1024,
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (!quiet) process.stdout.write(output);
  return output.trim() ? JSON.parse(output) : {};
}

function schemaRows(value) {
  if (Array.isArray(value)) return value;
  if (!value || typeof value !== "object") return [];
  if (Array.isArray(value.items)) return value.items;
  return schemaRows(value.data ?? value.schemas);
}

function schemaId(schema) {
  return schema.id ?? schema.itemId ?? schema.schemaDefinitionItemId;
}

async function localSchemas() {
  const files = (await readdir(schemaDirectory))
    .filter((name) => name.endsWith(".json"))
    .sort();
  return Promise.all(
    files.map(async (file) => ({
      file,
      document: JSON.parse(
        await readFile(path.join(schemaDirectory, file), "utf8"),
      ),
    })),
  );
}

function liveSchemas() {
  return schemaRows(
    cli(["data", "schema", "list", "--page-size", "500"], { quiet: true }),
  );
}

execFileSync(
  process.execPath,
  [cliEntry, "auth", "refresh", "--project", "--account", account, "--json"],
  {
    cwd: root,
    encoding: "utf8",
    env: { ...process.env, BLOCKS_STRICT_FLAGS: "1" },
    stdio: ["ignore", "pipe", "pipe"],
  },
);
const schemas = await localSchemas();
const initial = new Map(
  liveSchemas().map((schema) => [schema.schemaName, schema]),
);

if (!apply) {
  const temporaryDirectory = await mkdtemp(
    path.join(os.tmpdir(), "campus-career-data-preview-"),
  );
  try {
    for (const { document } of schemas) {
      if (!initial.has(document.schemaName)) {
        cli(
          [
            "data",
            "schema",
            "info",
            "save",
            "--schema-name",
            document.schemaName,
            "--collection-name",
            document.collectionName,
            "--schema-type",
            String(document.schemaType),
            "--dry-run",
          ],
          { quiet: true },
        );
      }
      const payloadPath = path.join(
        temporaryDirectory,
        `${document.schemaName}.json`,
      );
      await writeFile(
        payloadPath,
        `${JSON.stringify(
          {
            schemaDefinitionItemId: `resolved-live-id:${document.schemaName}`,
            fields: document.fields,
          },
          null,
          2,
        )}\n`,
      );
      cli(["data", "schema", "fields", "--file", payloadPath, "--dry-run"], {
        quiet: true,
      });
    }
  } finally {
    await rm(temporaryDirectory, { recursive: true });
  }
  console.log(
    JSON.stringify(
      {
        dryRun: true,
        project,
        currentSchemas: initial.size,
        schemaMetadataCreates: schemas.filter(
          ({ document }) => !initial.has(document.schemaName),
        ).length,
        schemaFieldWrites: schemas.length,
        securitySettings: schemas.length * 4,
        accessLevel: "Custom",
        allowPolicies: 0,
        sequence:
          "For each missing schema: create empty metadata, resolve live ID, deploy four Custom settings and reload. Add fields only after every schema is locked. Then verify access levels and anonymous denial.",
      },
      null,
      2,
    ),
  );
  process.exit(0);
}

for (const { document } of schemas) {
  let live = new Map(
    liveSchemas().map((schema) => [schema.schemaName, schema]),
  );
  if (!live.has(document.schemaName)) {
    cli(
      [
        "data",
        "schema",
        "info",
        "save",
        "--schema-name",
        document.schemaName,
        "--collection-name",
        document.collectionName,
        "--schema-type",
        String(document.schemaType),
        "--yes",
      ],
      { quiet: true },
    );
    live = new Map(liveSchemas().map((schema) => [schema.schemaName, schema]));
    if (!live.has(document.schemaName)) {
      throw new Error(
        `Schema ${document.schemaName} was not readable after creation.`,
      );
    }
  }

  execFileSync(
    process.execPath,
    [securityGenerator, "--resolve-live", "--only", document.schemaName],
    {
      cwd: root,
      encoding: "utf8",
      env: { ...process.env, BLOCKS_STRICT_FLAGS: "1" },
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  cli(["data", "rules", "deploy", "--yes"], { quiet: true });
  console.log(`Locked ${document.schemaName} at Custom access.`);
}

const finalLive = new Map(
  liveSchemas().map((schema) => [schema.schemaName, schema]),
);
const temporaryDirectory = await mkdtemp(
  path.join(os.tmpdir(), "campus-career-data-fields-"),
);
try {
  for (const { document } of schemas) {
    const live = finalLive.get(document.schemaName);
    const id = live && schemaId(live);
    if (!id) {
      throw new Error(`Missing live ID for ${document.schemaName}.`);
    }
    const payloadPath = path.join(
      temporaryDirectory,
      `${document.schemaName}.json`,
    );
    await writeFile(
      payloadPath,
      `${JSON.stringify(
        { schemaDefinitionItemId: id, fields: document.fields },
        null,
        2,
      )}\n`,
    );
    cli(["data", "schema", "fields", "--file", payloadPath, "--yes"], {
      quiet: true,
    });
    console.log(`Applied fields for ${document.schemaName}.`);
  }
} finally {
  await rm(temporaryDirectory, { recursive: true });
}

execFileSync(process.execPath, [securityGenerator, "--resolve-live"], {
  cwd: root,
  encoding: "utf8",
  env: { ...process.env, BLOCKS_STRICT_FLAGS: "1" },
  stdio: ["ignore", "pipe", "pipe"],
});
console.log(
  `Secure deployment finished for ${schemas.length} schemas. Run the access-level and anonymous-denial verification before inserting records.`,
);
