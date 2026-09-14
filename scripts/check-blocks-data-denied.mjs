import { createBlocksClient } from "@seliseblocks/client";

const project = "D8fb34a0fb75740f0b8a479a550807393";
const client = createBlocksClient({
  apiUrl: "https://blocksapi.slsblx.com",
  xBlocksKey: project,
});

let denied = false;
let evidence = "";
try {
  const response = await client.data
    .collection("AcademicPeriod", { fields: ["code"] })
    .list({ pageNo: 1, pageSize: 1 });
  const serialized = JSON.stringify(response);
  const errors =
    response && typeof response === "object" && Array.isArray(response.errors)
      ? response.errors
      : [];
  evidence = serialized;
  denied =
    errors.length > 0 &&
    /unauthor|forbidden|denied|access|policy/i.test(serialized);
} catch (error) {
  const status =
    error && typeof error === "object" && "status" in error
      ? Number(error.status)
      : 0;
  evidence = error instanceof Error ? error.message : String(error);
  denied =
    status === 401 ||
    status === 403 ||
    /unauthor|forbidden|denied|access|policy/i.test(evidence);
}

if (!denied) {
  throw new Error(
    `Anonymous AcademicPeriod read was not conclusively denied: ${evidence}`,
  );
}
console.log("PASS: anonymous AcademicPeriod read is denied by Blocks Data.");
