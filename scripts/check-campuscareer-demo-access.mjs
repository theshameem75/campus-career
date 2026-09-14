import { createBlocksClient } from "@seliseblocks/client";

const PROJECT = "D8fb34a0fb75740f0b8a479a550807393";
const API_URL = "https://blocksapi.slsblx.com";
const password = process.env.CAMPUSCAREER_DEMO_PASSWORD;
if (!password) throw new Error("CAMPUSCAREER_DEMO_PASSWORD is required.");

const identities = {
  student: "student.demo@campuscareer.test",
  employer: "employer.demo@campuscareer.test",
  staff: "staff.demo@campuscareer.test",
  manager: "manager.demo@campuscareer.test",
};

function tokenFrom(value) {
  if (!value || typeof value !== "object") return "";
  for (const key of ["access_token", "accessToken"]) {
    if (typeof value[key] === "string" && value[key]) return value[key];
  }
  return tokenFrom(value.data);
}

function responseData(response) {
  if (!response || typeof response !== "object") throw new Error("Empty Blocks response.");
  if (response.isSuccess === false || response.errors?.length) {
    throw new Error(JSON.stringify(response.errors ?? response));
  }
  return response.data;
}

async function login(username) {
  const publicClient = createBlocksClient({ apiUrl: API_URL, xBlocksKey: PROJECT });
  const result = await publicClient.auth.login({ username, password, rememberMe: false });
  const accessToken = tokenFrom(result);
  if (!accessToken) throw new Error(`Login returned no token for ${username}.`);
  return createBlocksClient({ apiUrl: API_URL, xBlocksKey: PROJECT, accessToken });
}

async function list(client, schema, fields = ["ItemId"]) {
  const response = await client.data.collection(schema, { fields }).list({
    pageNo: 1,
    pageSize: 200,
  });
  const page = responseData(response)?.[`get${schema}s`];
  if (!page || !Array.isArray(page.items)) throw new Error(`No ${schema} page returned.`);
  return page.items;
}

async function expectDenied(client, schema) {
  try {
    await list(client, schema);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/unauthor|forbidden|denied|access|policy|401|403/i.test(message)) return;
    throw error;
  }
  throw new Error(`${schema} was unexpectedly readable.`);
}

const clients = Object.fromEntries(
  await Promise.all(
    Object.entries(identities).map(async ([role, username]) => [role, await login(username)]),
  ),
);

const checks = {
  student: {
    opportunities: (await list(clients.student, "Opportunity", ["status"])).length,
    applications: (await list(clients.student, "Application", ["studentUserId"])).length,
  },
  employer: {
    opportunities: (await list(clients.employer, "Opportunity", ["employerOrganizationId"])).length,
    applications: (await list(clients.employer, "Application", ["employerOrganizationId"])).length,
  },
  staff: {
    opportunities: (await list(clients.staff, "Opportunity", ["status"])).length,
    applications: (await list(clients.staff, "Application", ["status"])).length,
  },
  manager: {
    opportunities: (await list(clients.manager, "Opportunity", ["status"])).length,
    applications: (await list(clients.manager, "Application", ["status"])).length,
    studentProfiles: (await list(clients.manager, "StudentProfile", ["userId"])).length,
  },
};

const expected = {
  student: { opportunities: 3, applications: 3 },
  employer: { opportunities: 5, applications: 3 },
  staff: { opportunities: 5, applications: 3 },
  manager: { opportunities: 5, applications: 3, studentProfiles: 1 },
};
if (JSON.stringify(checks) !== JSON.stringify(expected)) {
  throw new Error(`Role-visible counts differ: ${JSON.stringify({ checks, expected })}`);
}

await expectDenied(clients.employer, "StudentProfile");
await expectDenied(clients.student, "FollowUpFlag");

const anonymous = createBlocksClient({ apiUrl: API_URL, xBlocksKey: PROJECT });
await expectDenied(anonymous, "Opportunity");

console.log(JSON.stringify({ checks, denied: [
  "employer -> StudentProfile",
  "student -> FollowUpFlag",
  "anonymous -> Opportunity",
] }, null, 2));
