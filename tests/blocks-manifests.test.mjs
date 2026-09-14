import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import test from "node:test";

const schemaDirectory = new URL("../blocks/data/schemas/", import.meta.url);

async function json(url) {
  return JSON.parse(await readFile(url, "utf8"));
}

test("the complete Blocks schema set is valid and free of system fields", async () => {
  const files = (await readdir(schemaDirectory)).filter((name) =>
    name.endsWith(".json"),
  );
  assert.equal(files.length, 36);

  const names = new Set();
  const forbidden = new Set([
    "itemId",
    "createdAt",
    "createdBy",
    "lastUpdatedAt",
    "lastUpdatedBy",
    "isDeleted",
  ]);

  for (const file of files) {
    const schema = await json(new URL(file, schemaDirectory));
    assert.equal(schema.schemaType, 1);
    assert.equal(schema.schemaName, file.replace(/\.json$/, ""));
    assert.ok(
      typeof schema.collectionName === "string" &&
        schema.collectionName.length > 0,
    );
    assert.ok(!names.has(schema.collectionName), schema.collectionName);
    names.add(schema.collectionName);
    for (const field of schema.fields) {
      assert.ok(!forbidden.has(field.name), `${file}: ${field.name}`);
      assert.equal(field.requiredOn, "None");
    }
  }
});

test("IAM role assignments only reference declared custom permissions", async () => {
  const roles = await json(
    new URL("../blocks/iam/roles.json", import.meta.url),
  );
  const permissions = await json(
    new URL("../blocks/iam/permissions.json", import.meta.url),
  );
  const roleSlugs = new Set(roles.roles.map((role) => role.slug));
  const customResources = new Set(
    permissions.permissions.map((permission) => permission.resource),
  );

  assert.equal(roleSlugs.size, 8);
  assert.deepEqual(new Set(Object.keys(permissions.assignments)), roleSlugs);
  for (const resources of Object.values(permissions.assignments)) {
    for (const resource of resources) {
      if (resource.startsWith("campus-career::")) {
        assert.ok(customResources.has(resource), resource);
      }
    }
  }
});

test("self-registration grants only the pending role", async () => {
  const config = await json(
    new URL("../blocks/iam/tenant-config.json", import.meta.url),
  );
  assert.deepEqual(config.signupPolicy.defaultRolesOnSignUp, ["pending-user"]);
  assert.deepEqual(config.signupPolicy.defaultPermissionsOnSignUp, []);
  assert.equal(config.organizationPolicy.allowOrgCreationFromSignup, false);
  assert.equal(config.organizationPolicy.allowOrgCreationFromPortal, false);
});
