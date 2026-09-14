import { createBlocksClient } from "@seliseblocks/client";

const PROJECT = "D8fb34a0fb75740f0b8a479a550807393";
const API_URL = "https://blocksapi.slsblx.com";
const MANAGER_EMAIL = "manager.demo@campuscareer.test";
const USERS = {
  student: "3cacb9c9-4f9f-42c2-b71b-533c54e62da9",
  employer: "51f30225-7227-4692-b3ae-801f186e5300",
  staff: "014de4e9-b2a5-4859-9929-1de12295a08a",
  manager: "ed1897cc-ece4-4286-83db-8aa782132267",
};
const apply = process.argv.includes("--apply");
const counts = new Map();
let client;

if (apply) {
  if (process.env.CAMPUSCAREER_DEMO_DATA_APPROVED !== PROJECT) {
    throw new Error(
      "Refusing live seed without CAMPUSCAREER_DEMO_DATA_APPROVED set to the project ID.",
    );
  }
  const password = process.env.CAMPUSCAREER_DEMO_PASSWORD;
  if (!password) throw new Error("CAMPUSCAREER_DEMO_PASSWORD is required.");
  const publicClient = createBlocksClient({
    apiUrl: API_URL,
    xBlocksKey: PROJECT,
  });
  const login = await publicClient.auth.login({
    username: MANAGER_EMAIL,
    password,
    rememberMe: false,
  });
  const accessToken = tokenFrom(login);
  if (!accessToken) throw new Error("Manager login returned no access token.");
  client = createBlocksClient({
    apiUrl: API_URL,
    xBlocksKey: PROJECT,
    accessToken,
  });
  const me = await client.iam.me();
  const roles = Array.isArray(me.data?.roles) ? me.data.roles : [];
  if (!roles.includes("career-manager")) {
    throw new Error("Seed identity is not a career-manager.");
  }
}

function tokenFrom(value) {
  if (!value || typeof value !== "object") return "";
  for (const key of ["access_token", "accessToken"]) {
    if (typeof value[key] === "string" && value[key]) return value[key];
  }
  return tokenFrom(value.data);
}

function dataObject(response) {
  if (!response || typeof response !== "object") {
    throw new Error("Blocks Data returned an empty response.");
  }
  if (response.isSuccess === false || response.errors?.length) {
    throw new Error("Blocks Data rejected a seed operation.");
  }
  if (!response.data || typeof response.data !== "object") {
    throw new Error("Blocks Data response has no data object.");
  }
  return response.data;
}

function mutationId(response, mutation) {
  const result = dataObject(response)[mutation];
  if (!result || result.acknowledged !== true || !result.itemId) {
    throw new Error(`${mutation} was not acknowledged.`);
  }
  return String(result.itemId);
}

async function upsert(schema, filter, payload) {
  counts.set(schema, (counts.get(schema) ?? 0) + 1);
  if (!apply) return `demo:${schema}:${Object.values(filter).join(":")}`;
  const collection = client.data.collection(schema, {
    fields: Object.keys(filter),
  });
  const response = await collection.list({ filter, pageNo: 1, pageSize: 2 });
  const page = dataObject(response)[`get${schema}s`];
  const items = Array.isArray(page?.items) ? page.items : [];
  if (items.length > 1) {
    throw new Error(`Seed key for ${schema} matched multiple records.`);
  }
  if (items.length === 1) {
    const itemId = String(items[0].ItemId);
    const updated = await collection.update(itemId, payload);
    mutationId(updated, `update${schema}`);
    return itemId;
  }
  return mutationId(await collection.create(payload), `insert${schema}`);
}

const iso = (day, hour = 9) =>
  `2026-09-${String(day).padStart(2, "0")}T${String(hour).padStart(2, "0")}:00:00.000Z`;

const periodId = await upsert(
  "AcademicPeriod",
  { code: "2026-FALL" },
  {
    code: "2026-FALL",
    name: "Fall 2026",
    startDate: "2026-09-01",
    endDateExclusive: "2027-01-01",
    timeZone: "Asia/Dhaka",
    status: "ACTIVE",
    revision: 1,
  },
);
void periodId;

const departments = {};
for (const item of [
  ["CSE", "Computer Science and Engineering"],
  ["BBA", "Business Administration"],
  ["EEE", "Electrical and Electronic Engineering"],
]) {
  departments[item[0]] = await upsert(
    "Department",
    { code: item[0] },
    {
      code: item[0],
      name: item[1],
      description: `${item[1]} career-services demo department.`,
      status: "ACTIVE",
      revision: 1,
    },
  );
}

const skills = {};
for (const name of [
  "TypeScript",
  "React",
  "Data Analysis",
  "Communication",
  "Python",
  "Cloud Computing",
]) {
  const normalizedName = name.toLowerCase().replaceAll(" ", "-");
  skills[normalizedName] = await upsert(
    "Skill",
    { normalizedName },
    {
      normalizedName,
      displayName: name,
      description: `${name} competency used by demo opportunities.`,
      status: "ACTIVE",
      revision: 1,
    },
  );
}

await upsert(
  "OpportunityType",
  { code: "INTERNSHIP" },
  { code: "INTERNSHIP", name: "Internship", status: "ACTIVE", revision: 1 },
);
for (const item of [
  ["MISSING_SKILL", "Missing skill"],
  ["EXPERIENCE_GAP", "Experience gap"],
  ["OTHER", "Other"],
]) {
  await upsert(
    "ExplanationFlagCategory",
    { code: item[0] },
    {
      code: item[0],
      label: item[1],
      description: `${item[1]} raised against a match explanation.`,
      status: "ACTIVE",
      revision: 1,
    },
  );
}
for (const item of [
  ["NOT_ELIGIBLE", "Eligibility requirements not met"],
  ["POSITION_FILLED", "Position filled"],
  ["OTHER", "Other reason"],
]) {
  await upsert(
    "RejectionReason",
    { code: item[0] },
    {
      code: item[0],
      label: item[1],
      candidateTemplate: `Application update: ${item[1].toLowerCase()}.`,
      status: "ACTIVE",
      revision: 1,
    },
  );
}

await upsert(
  "TenantSettings",
  { singletonKey: "CAMPUS_CAREER_SETTINGS" },
  {
    singletonKey: "CAMPUS_CAREER_SETTINGS",
    universityName: "CampusCareer Demo University",
    timeZone: "Asia/Dhaka",
    defaultCurrency: "BDT",
    outcomeReminderDay1: 7,
    outcomeReminderDay2: 12,
    outcomeOverdueDay: 14,
    outcomeEscalationDay: 21,
    employerAccessRetentionDays: 90,
    metricDefinitionVersion: "2026.1",
    revision: 1,
  },
);

const employerId = await upsert(
  "Employer",
  { organizationId: "default" },
  {
    organizationId: "default",
    name: "SELISE Digital Platforms",
    industry: "Software and Technology",
    websiteUrl: "https://selisegroup.com",
    description: "Verified demo employer offering technology internships.",
    verificationStatus: "VERIFIED",
    verifiedAt: iso(10),
    verifiedByUserId: USERS.manager,
    verificationNote: "Demo employer verified for acceptance testing.",
    revision: 1,
  },
);
await upsert(
  "EmployerMembership",
  { membershipKey: `${employerId}:${USERS.employer}` },
  {
    membershipKey: `${employerId}:${USERS.employer}`,
    employerId,
    organizationId: "default",
    userId: USERS.employer,
    status: "ACTIVE",
    activatedAt: iso(10, 10),
    revision: 1,
  },
);

const studentProfileId = await upsert(
  "StudentProfile",
  { userId: USERS.student },
  {
    userId: USERS.student,
    studentNumber: "CC-2026-001",
    departmentId: departments.CSE,
    graduationYear: 2027,
    graduationTerm: "SPRING",
    headline: "Computer science student focused on product engineering",
    bio: "Demo student with frontend, data, and cloud project experience.",
    email: "student.demo@campuscareer.test",
    phone: "+8801700000000",
    linkedInUrl: "https://www.linkedin.com/in/campuscareer-demo",
    portfolioUrl: "https://example.test/campuscareer-demo",
    skillIds: [skills.typescript, skills.react, skills.python],
    profileCompleteness: 92,
    privacyNoticeVersion: "2026.1",
    privacyAcceptedAt: iso(9),
    aiConsentStatus: "GRANTED",
    aiConsentVersion: "2026.1",
    aiConsentChangedAt: iso(9),
    status: "ACTIVE",
    revision: 1,
  },
);
for (const experience of [
  {
    title: "Campus Event Portal",
    organizationName: "Demo University",
    description: "Built a React portal used by student clubs.",
    skillIds: [skills.react, skills.typescript],
  },
  {
    title: "Placement Data Assistant",
    organizationName: "Career Services",
    description: "Prepared placement datasets and dashboards.",
    skillIds: [skills["data-analysis"], skills.python],
  },
]) {
  await upsert(
    "StudentExperience",
    { studentProfileId, title: experience.title },
    {
      studentProfileId,
      experienceType: "PROJECT",
      ...experience,
      startDate: "2026-01-01",
      endDate: "2026-08-31",
      isCurrent: false,
      revision: 1,
    },
  );
}
const studentDocumentId = await upsert(
  "StudentDocument",
  { contentHash: "demo-cv-sha256-001" },
  {
    studentProfileId,
    ownerUserId: USERS.student,
    fileId: "demo-file-cv-001",
    fileName: "Demo-Student-CV.pdf",
    mimeType: "application/pdf",
    fileVersion: 1,
    contentHash: "demo-cv-sha256-001",
    isDefault: true,
    uploadedAt: iso(9, 11),
    retentionUntil: "2028-09-09T11:00:00.000Z",
    status: "ACTIVE",
    revision: 1,
  },
);

const jobDefinitions = [
  [
    "Frontend Engineering Intern",
    "PUBLISHED",
    "HYBRID",
    "Dhaka",
    12,
    3500000,
    3,
    "2026-10-15T17:00:00.000Z",
    ["typescript", "react"],
  ],
  [
    "Data Analytics Intern",
    "PUBLISHED",
    "ONSITE",
    "Dhaka",
    16,
    3000000,
    2,
    "2026-10-25T17:00:00.000Z",
    ["data-analysis", "python"],
  ],
  [
    "Cloud Platform Intern",
    "PUBLISHED",
    "REMOTE",
    "Dhaka",
    12,
    4000000,
    2,
    "2026-11-05T17:00:00.000Z",
    ["cloud-computing", "communication"],
  ],
  [
    "Product Operations Intern",
    "PENDING_APPROVAL",
    "HYBRID",
    "Dhaka",
    10,
    2800000,
    1,
    "2026-11-12T17:00:00.000Z",
    ["communication", "data-analysis"],
  ],
  [
    "Graduate Software Trainee",
    "DRAFT",
    "ONSITE",
    "Dhaka",
    24,
    4500000,
    4,
    "2026-12-01T17:00:00.000Z",
    ["typescript", "cloud-computing"],
  ],
];
const opportunities = [];
for (const [
  title,
  status,
  workMode,
  city,
  durationWeeks,
  stipendMinor,
  slotCount,
  deadlineAt,
  skillNames,
] of jobDefinitions) {
  const opportunityId = await upsert(
    "Opportunity",
    { employerId, title },
    {
      employerId,
      employerOrganizationId: "default",
      opportunityTypeCode: "INTERNSHIP",
      status,
      title,
      description: `${title} working with a cross-functional delivery team.`,
      requirements:
        "Current student, strong communication, and relevant project experience.",
      workMode,
      city,
      countryCode: "BD",
      durationWeeks,
      stipendMinor,
      currency: "BDT",
      slotCount,
      deadlineAt,
      timeZone: "Asia/Dhaka",
      minimumCredits: 60,
      minimumGpaText: "3.00/4.00",
      submittedAt: iso(11),
      ...(status === "PUBLISHED"
        ? { approvedAt: iso(12), approvedByUserId: USERS.staff }
        : {}),
      revision: 1,
    },
  );
  opportunities.push({ id: opportunityId, title, status });
  await upsert(
    "OpportunityDepartment",
    { opportunityDepartmentKey: `${opportunityId}:${departments.CSE}` },
    {
      opportunityDepartmentKey: `${opportunityId}:${departments.CSE}`,
      opportunityId,
      departmentId: departments.CSE,
    },
  );
  for (const [index, skillName] of skillNames.entries()) {
    await upsert(
      "OpportunitySkill",
      { opportunitySkillKey: `${opportunityId}:${skills[skillName]}` },
      {
        opportunitySkillKey: `${opportunityId}:${skills[skillName]}`,
        opportunityId,
        skillId: skills[skillName],
        importance: index === 0 ? "REQUIRED" : "PREFERRED",
      },
    );
  }
}

const applications = [];
for (const [index, opportunity] of opportunities.slice(0, 3).entries()) {
  const applicationId = await upsert(
    "Application",
    { applicationKey: `${studentProfileId}:${opportunity.id}` },
    {
      applicationKey: `${studentProfileId}:${opportunity.id}`,
      studentProfileId,
      studentUserId: USERS.student,
      departmentId: departments.CSE,
      opportunityId: opportunity.id,
      employerId,
      employerOrganizationId: "default",
      status: ["INTERVIEW", "SUBMITTED", "OFFERED"][index],
      submittedAt: iso(13 + index),
      aiProcessingStatus: "SUCCEEDED",
      isTestRecord: true,
      revision: 1,
    },
  );
  applications.push({ id: applicationId, opportunity, index });
  const profileSnapshotId = await upsert(
    "ApplicationProfileSnapshot",
    { applicationId },
    {
      applicationId,
      studentUserId: USERS.student,
      departmentId: departments.CSE,
      cohortCode: "2027-SPRING",
      skillsJson: JSON.stringify(["TypeScript", "React", "Python"]),
      experienceJson: JSON.stringify(["Campus Event Portal"]),
      profileJson: JSON.stringify({ headline: "Product engineering student" }),
      snapshotHash: `demo-profile-${index + 1}`,
      capturedAt: iso(13 + index, 10),
    },
  );
  const opportunitySnapshotId = await upsert(
    "OpportunitySnapshot",
    { applicationId },
    {
      applicationId,
      opportunityId: opportunity.id,
      opportunityRevision: 1,
      termsJson: JSON.stringify({
        title: opportunity.title,
        status: opportunity.status,
      }),
      snapshotHash: `demo-opportunity-${index + 1}`,
      capturedAt: iso(13 + index, 10),
    },
  );
  const applicationDocumentId = await upsert(
    "ApplicationDocument",
    { applicationId },
    {
      applicationId,
      studentDocumentId,
      fileId: "demo-file-cv-001",
      fileVersion: 1,
      fileName: "Demo-Student-CV.pdf",
      contentHash: "demo-cv-sha256-001",
      employerAccessExpiresAt: "2026-12-31T23:59:59.000Z",
      linkedAt: iso(13 + index, 10),
    },
  );
  await upsert(
    "Application",
    { applicationKey: `${studentProfileId}:${opportunity.id}` },
    {
      applicationKey: `${studentProfileId}:${opportunity.id}`,
      studentProfileId,
      studentUserId: USERS.student,
      departmentId: departments.CSE,
      opportunityId: opportunity.id,
      employerId,
      employerOrganizationId: "default",
      status: ["INTERVIEW", "SUBMITTED", "OFFERED"][index],
      submittedAt: iso(13 + index),
      profileSnapshotId,
      opportunitySnapshotId,
      applicationDocumentId,
      aiProcessingStatus: "SUCCEEDED",
      isTestRecord: true,
      revision: 2,
    },
  );
  await upsert(
    "ApplicationStageEvent",
    { idempotencyKey: `demo-stage-${index + 1}` },
    {
      applicationId,
      fromStage: "DRAFT",
      toStage: ["INTERVIEW", "SUBMITTED", "OFFERED"][index],
      actorUserId: index === 1 ? USERS.student : USERS.staff,
      actorRole: index === 1 ? "student" : "career-staff",
      occurredAt: iso(16 + index),
      reasonCode: "DEMO_WORKFLOW",
      candidateVisibleText: "Application moved to the next demo stage.",
      internalNotes: "Synthetic acceptance-test event.",
      visibility: "CANDIDATE_VISIBLE",
      correlationId: `demo-application-${index + 1}`,
      idempotencyKey: `demo-stage-${index + 1}`,
    },
  );
}

for (const application of applications.slice(0, 2)) {
  await upsert(
    "ScreeningDecision",
    { applicationId: application.id },
    {
      applicationId: application.id,
      reviewerUserId: USERS.staff,
      recommendation: "ADVANCE",
      rubricVersion: "2026.1",
      rubricJson: JSON.stringify({
        skills: 4,
        experience: 4,
        communication: 5,
      }),
      internalNotes: "Strong synthetic candidate profile.",
      rejectionReasonCode: "",
      candidateExplanation:
        "Your profile matches the core internship requirements.",
      decidedAt: iso(18 + application.index),
      revision: 1,
    },
  );
}

const offeredApplication = applications[2];
await upsert(
  "EmployerOutcome",
  { applicationId: offeredApplication.id, outcomeType: "OFFER" },
  {
    applicationId: offeredApplication.id,
    employerOrganizationId: "default",
    outcomeType: "OFFER",
    status: "CONFIRMED",
    scheduledStartAt: "2026-11-15T03:00:00.000Z",
    scheduledEndAt: "2027-02-15T12:00:00.000Z",
    detailsJson: JSON.stringify({
      title: offeredApplication.opportunity.title,
    }),
    reportedByUserId: USERS.employer,
    reportedAt: iso(20),
    isPlacementVerified: true,
    verifiedAt: iso(21),
    verifiedByUserId: USERS.manager,
    isPrimaryPlacement: true,
    revision: 1,
  },
);

const followUpApplication = applications[0];
const followUpFlagId = await upsert(
  "FollowUpFlag",
  { flagKey: `${followUpApplication.id}:INTERVIEW:7` },
  {
    flagKey: `${followUpApplication.id}:INTERVIEW:7`,
    applicationId: followUpApplication.id,
    opportunityId: followUpApplication.opportunity.id,
    employerId,
    employerOrganizationId: "default",
    interviewedAt: iso(17),
    nextThresholdDay: 12,
    status: "OPEN",
    revision: 1,
  },
);
await upsert(
  "FollowUpActivity",
  { idempotencyKey: "demo-follow-up-001" },
  {
    followUpFlagId,
    activityType: "EMAIL_SENT",
    actorUserId: USERS.staff,
    occurredAt: iso(24),
    note: "Requested an interview outcome from the demo employer.",
    idempotencyKey: "demo-follow-up-001",
  },
);

const explanationId = await upsert(
  "MatchExplanation",
  { applicationId: applications[1].id, version: 1 },
  {
    applicationId: applications[1].id,
    version: 1,
    status: "READY",
    provider: "AZURE_OPENAI",
    modelDeployment: "demo-model",
    promptVersion: "2026.1",
    inputHash: "demo-match-input-001",
    coveredRequirementsJson: JSON.stringify([
      "React project experience",
      "Communication",
    ]),
    missingRequirementsJson: JSON.stringify([
      "Production analytics experience",
    ]),
    relevantEvidence:
      "Campus Event Portal and Placement Data Assistant projects.",
    coachingTip: "Add one quantified analytics result to your CV.",
    generatedAt: iso(18),
    reviewedAt: iso(19),
    reviewedByUserId: USERS.manager,
    revision: 1,
  },
);
await upsert(
  "ExplanationFlag",
  { applicationId: applications[1].id },
  {
    matchExplanationId: explanationId,
    applicationId: applications[1].id,
    studentUserId: USERS.student,
    categoryCode: "EXPERIENCE_GAP",
    studentComment: "My placement dashboard project included analytics work.",
    status: "OPEN",
    raisedAt: iso(20, 11),
    revision: 1,
  },
);
await upsert(
  "CoachingDigest",
  { studentProfileId, version: 1 },
  {
    studentProfileId,
    version: 1,
    applicationIds: applications.map((item) => item.id),
    digestText:
      "Highlight measurable results and tailor the CV summary to each role.",
    provider: "AZURE_OPENAI",
    modelDeployment: "demo-model",
    promptVersion: "2026.1",
    status: "REVIEWED",
    generatedAt: iso(20),
    reviewedAt: iso(21),
    reviewedByUserId: USERS.manager,
  },
);

for (const userId of Object.values(USERS)) {
  await upsert(
    "NotificationPreference",
    { userId },
    {
      userId,
      optionalDigestEmail: true,
      optionalCoachingNotifications: userId === USERS.student,
      revision: 1,
    },
  );
}
for (const [index, recipientUserId] of [
  USERS.student,
  USERS.employer,
  USERS.staff,
].entries()) {
  await upsert(
    "NotificationDelivery",
    { idempotencyKey: `demo-notification-${index + 1}` },
    {
      idempotencyKey: `demo-notification-${index + 1}`,
      eventType: ["APPLICATION_UPDATED", "NEW_APPLICATION", "FOLLOW_UP_DUE"][
        index
      ],
      recipientUserId,
      channel: "IN_APP",
      templatePurpose: "DEMO",
      status: "DELIVERED",
      attemptCount: 1,
      lastAttemptAt: iso(22 + index),
      deliveredAt: iso(22 + index),
      correlationId: `demo-notification-${index + 1}`,
      revision: 1,
    },
  );
}

for (const item of [
  [
    "student.demo@campuscareer.test",
    "STUDENT",
    USERS.student,
    "CC-2026-001",
    "",
  ],
  ["employer.demo@campuscareer.test", "EMPLOYER", USERS.employer, "", ""],
  ["staff.demo@campuscareer.test", "STAFF", USERS.staff, "", "CS-STAFF-001"],
  [
    "manager.demo@campuscareer.test",
    "STAFF",
    USERS.manager,
    "",
    "CS-MANAGER-001",
  ],
]) {
  await upsert(
    "DirectoryRecord",
    { emailNormalized: item[0] },
    {
      emailNormalized: item[0],
      subjectType: item[1],
      externalDirectoryId: `demo-${item[2]}`,
      studentNumber: item[3],
      employeeNumber: item[4],
      departmentId: departments.CSE,
      expectedGraduationYear: item[1] === "STUDENT" ? 2027 : 0,
      expectedGraduationTerm: item[1] === "STUDENT" ? "SPRING" : "",
      matchedIamUserId: item[2],
      status: "VERIFIED",
      verifiedAt: iso(10),
      verifiedByUserId: USERS.manager,
      revision: 1,
    },
  );
}

for (const [index, action] of [
  "EMPLOYER_VERIFIED",
  "OPPORTUNITY_APPROVED",
  "APPLICATION_SCREENED",
].entries()) {
  await upsert(
    "AuditEvent",
    { idempotencyKey: `demo-audit-${index + 1}` },
    {
      actorUserId: index === 0 ? USERS.manager : USERS.staff,
      actorRole: index === 0 ? "career-manager" : "career-staff",
      action,
      entityType: ["Employer", "Opportunity", "Application"][index],
      entityId: [employerId, opportunities[0].id, applications[0].id][index],
      beforeHash: `demo-before-${index + 1}`,
      afterHash: `demo-after-${index + 1}`,
      detailJson: JSON.stringify({ synthetic: true }),
      occurredAt: iso(12 + index),
      correlationId: `demo-audit-${index + 1}`,
      idempotencyKey: `demo-audit-${index + 1}`,
    },
  );
}

const rightsRequestId = await upsert(
  "RightsRequest",
  { requesterUserId: USERS.student, requestType: "ACCESS" },
  {
    requesterUserId: USERS.student,
    requestType: "ACCESS",
    status: "OPEN",
    requestDetail: "Synthetic request to review stored profile information.",
    requestedAt: iso(25),
    revision: 1,
  },
);
await upsert(
  "LegalHold",
  { holdKey: `RightsRequest:${rightsRequestId}` },
  {
    holdKey: `RightsRequest:${rightsRequestId}`,
    entityType: "RightsRequest",
    entityId: rightsRequestId,
    status: "ACTIVE",
    reason: "Preserve demo rights-request evidence during review.",
    placedAt: iso(25, 10),
    placedByUserId: USERS.manager,
    revision: 1,
  },
);
for (const [index, jobType] of [
  "OUTCOME_FOLLOW_UP",
  "COACHING_DIGEST",
].entries()) {
  await upsert(
    "ScheduledJobRun",
    { jobKey: `demo-${jobType.toLowerCase()}` },
    {
      jobKey: `demo-${jobType.toLowerCase()}`,
      jobType,
      scheduledFor: iso(26 + index),
      status: index === 0 ? "COMPLETED" : "SCHEDULED",
      attemptCount: index === 0 ? 1 : 0,
      ...(index === 0
        ? {
            startedAt: iso(26, 9),
            completedAt: iso(26, 10),
            resultJson: JSON.stringify({ processed: 1 }),
          }
        : {}),
      revision: 1,
    },
  );
}

const metricSnapshotId = await upsert(
  "MetricSnapshot",
  { snapshotKey: "2026-FALL:2027-SPRING:UNIVERSITY:default" },
  {
    snapshotKey: "2026-FALL:2027-SPRING:UNIVERSITY:default",
    reportingPeriodCode: "2026-FALL",
    cohortCode: "2027-SPRING",
    scopeType: "UNIVERSITY",
    scopeId: "default",
    metricDefinitionVersion: "2026.1",
    contentJson: JSON.stringify({
      applications: 3,
      interviews: 1,
      offers: 1,
      placements: 1,
    }),
    contentHash: "demo-metrics-001",
    frozenAt: iso(28),
    isSubmitted: true,
  },
);
await upsert(
  "AccreditationReport",
  { reportKey: "2026-FALL:2027-SPRING:1" },
  {
    reportKey: "2026-FALL:2027-SPRING:1",
    reportingPeriodCode: "2026-FALL",
    cohortCode: "2027-SPRING",
    version: 1,
    status: "GENERATED",
    metricSnapshotId,
    pdfFileId: "demo-accreditation-report-001",
    templateVersion: "2026.1",
    generatedAt: iso(29),
    submittedAt: iso(29, 10),
    submittedByUserId: USERS.manager,
  },
);

const summary = Object.fromEntries(
  [...counts.entries()].sort(([left], [right]) => left.localeCompare(right)),
);
console.log(
  JSON.stringify(
    {
      dryRun: !apply,
      project: PROJECT,
      seedIdentity: MANAGER_EMAIL,
      schemas: counts.size,
      records: [...counts.values()].reduce((total, value) => total + value, 0),
      counts: summary,
      behavior: apply
        ? "Idempotent upsert completed."
        : "Preview only; no login and no records written.",
    },
    null,
    2,
  ),
);
