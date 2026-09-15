import { getBlocksClient } from "@/lib/blocks/client";
import { hasRole, type Session, type UserRole } from "@/types/auth";

type DataRecord = Record<string, unknown> & { ItemId: string; revision?: number };

export type Opportunity = DataRecord & {
  employerId?: string;
  employerOrganizationId?: string;
  title?: string;
  status?: string;
  description?: string;
  requirements?: string;
  workMode?: string;
  city?: string;
  countryCode?: string;
  durationWeeks?: number;
  stipendMinor?: number;
  currency?: string;
  slotCount?: number;
  deadlineAt?: string;
};

export type Application = DataRecord & {
  opportunityId?: string;
  studentProfileId?: string;
  studentUserId?: string;
  departmentId?: string;
  employerId?: string;
  employerOrganizationId?: string;
  status?: string;
  submittedAt?: string;
  aiProcessingStatus?: string;
};

export type StageEvent = DataRecord & {
  applicationId?: string;
  fromStage?: string;
  toStage?: string;
  occurredAt?: string;
  candidateVisibleText?: string;
};

export type RejectionReason = DataRecord & {
  code?: string;
  label?: string;
  candidateTemplate?: string;
};

export type OpportunityInput = {
  title: string;
  description: string;
  requirements: string;
  workMode: string;
  city: string;
  countryCode: string;
  durationWeeks: number;
  stipendMinor: number;
  currency: string;
  slotCount: number;
  deadlineAt: string;
};

function collection<T extends Record<string, unknown>>(
  schema: string,
  fields: string[],
) {
  return getBlocksClient().data.collection<T>(schema, { fields });
}

function pageItems<T>(response: unknown, queryName: string): T[] {
  const record = response as {
    data?: Record<string, { items?: T[] } | undefined>;
    items?: T[];
  };
  return record.data?.[queryName]?.items ?? record.items ?? [];
}

function mutationItemId(response: unknown): string | undefined {
  const record = response as {
    itemId?: string;
    data?: Record<string, { itemId?: string } | undefined>;
  };
  return (
    record.itemId ??
    Object.values(record.data ?? {}).find((value) => value?.itemId)?.itemId
  );
}

function requireRole(session: Session, allowed: UserRole[], action: string) {
  if (!allowed.some((role) => hasRole(session.roles, role))) {
    throw new Error(`Your role cannot ${action}.`);
  }
}

const opportunityFields = [
  "employerId",
  "employerOrganizationId",
  "title",
  "status",
  "description",
  "requirements",
  "workMode",
  "city",
  "countryCode",
  "durationWeeks",
  "stipendMinor",
  "currency",
  "slotCount",
  "deadlineAt",
  "revision",
];

const applicationFields = [
  "opportunityId",
  "studentProfileId",
  "studentUserId",
  "departmentId",
  "employerId",
  "employerOrganizationId",
  "status",
  "submittedAt",
  "aiProcessingStatus",
  "revision",
];

export async function listOpportunities(): Promise<Opportunity[]> {
  const response = await collection<Opportunity>(
    "Opportunity",
    opportunityFields,
  ).list({ pageNo: 1, pageSize: 100, sort: { deadlineAt: 1 } });
  return pageItems(response, "getOpportunitys");
}

export async function listApplications(): Promise<Application[]> {
  const response = await collection<Application>(
    "Application",
    applicationFields,
  ).list({ pageNo: 1, pageSize: 100, sort: { submittedAt: -1 } });
  return pageItems(response, "getApplications");
}

export async function listStageEvents(): Promise<StageEvent[]> {
  const response = await collection<StageEvent>("ApplicationStageEvent", [
    "applicationId",
    "fromStage",
    "toStage",
    "occurredAt",
    "candidateVisibleText",
  ]).list({ pageNo: 1, pageSize: 250, sort: { occurredAt: -1 } });
  return pageItems(response, "getApplicationStageEvents");
}

export async function listRejectionReasons(): Promise<RejectionReason[]> {
  const response = await collection<RejectionReason>("RejectionReason", [
    "code",
    "label",
    "candidateTemplate",
    "status",
  ]).list({ pageNo: 1, pageSize: 100 });
  return pageItems<RejectionReason>(response, "getRejectionReasons").filter(
    (reason) => reason.status === "ACTIVE",
  );
}

async function resolveEmployer(session: Session) {
  type Employer = DataRecord & {
    organizationId?: string;
    name?: string;
    verificationStatus?: string;
  };
  const response = await collection<Employer>("Employer", [
    "organizationId",
    "name",
    "verificationStatus",
  ]).list({ pageNo: 1, pageSize: 25 });
  const employers = pageItems<Employer>(response, "getEmployers");
  const employer =
    employers.find(
      (item) =>
        item.organizationId === session.organization.id &&
        item.verificationStatus === "VERIFIED",
    ) ?? employers.find((item) => item.verificationStatus === "VERIFIED");
  if (!employer) {
    throw new Error("Your organization does not have a verified employer record.");
  }
  return employer;
}

export async function createOpportunity(
  input: OpportunityInput,
  session: Session,
) {
  requireRole(session, ["employer-user"], "create opportunities");
  const employer = await resolveEmployer(session);
  return collection<Opportunity>("Opportunity", opportunityFields).create({
    employerId: employer.ItemId,
    employerOrganizationId:
      employer.organizationId || session.organization.id,
    opportunityTypeCode: "INTERNSHIP",
    status: "DRAFT",
    ...input,
    deadlineAt: new Date(input.deadlineAt).toISOString(),
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
    revision: 1,
  });
}

export async function transitionOpportunity(
  opportunity: Opportunity,
  nextStatus: "PENDING_APPROVAL" | "PUBLISHED" | "DRAFT" | "CLOSED",
  session: Session,
) {
  const current = opportunity.status || "";
  const employerTransition =
    (current === "DRAFT" && nextStatus === "PENDING_APPROVAL") ||
    (current === "PUBLISHED" && nextStatus === "CLOSED");
  const staffTransition =
    current === "PENDING_APPROVAL" &&
    (nextStatus === "PUBLISHED" || nextStatus === "DRAFT");
  if (employerTransition) {
    requireRole(session, ["employer-user"], "change this opportunity status");
  } else if (staffTransition) {
    requireRole(session, ["career-staff", "career-manager"], "review opportunities");
  } else {
    throw new Error(`The transition from ${current} to ${nextStatus} is not allowed.`);
  }
  const now = new Date().toISOString();
  const extra: Record<string, unknown> = {};
  if (nextStatus === "PENDING_APPROVAL") extra.submittedAt = now;
  if (nextStatus === "PUBLISHED") {
    extra.approvedAt = now;
    extra.approvedByUserId = session.user.id;
  }
  if (nextStatus === "CLOSED") extra.closedAt = now;
  return collection<Opportunity>("Opportunity", opportunityFields).update(
    opportunity.ItemId,
    {
      status: nextStatus,
      revision: (opportunity.revision ?? 0) + 1,
      ...extra,
    },
  );
}

type StudentProfile = DataRecord & {
  userId?: string;
  departmentId?: string;
  graduationYear?: number;
  graduationTerm?: string;
  headline?: string;
  bio?: string;
  skillIds?: string[];
  profileCompleteness?: number;
  aiConsentStatus?: string;
  status?: string;
};

async function currentStudentProfile(session: Session): Promise<StudentProfile> {
  const response = await collection<StudentProfile>("StudentProfile", [
    "userId",
    "departmentId",
    "graduationYear",
    "graduationTerm",
    "headline",
    "bio",
    "skillIds",
    "profileCompleteness",
    "aiConsentStatus",
    "status",
  ]).list({ pageNo: 1, pageSize: 10 });
  const profiles = pageItems<StudentProfile>(response, "getStudentProfiles");
  const profile =
    profiles.find((item) => item.userId === session.user.id) ?? profiles[0];
  if (!profile || profile.status !== "ACTIVE") {
    throw new Error("Complete and activate your student profile before applying.");
  }
  if ((profile.profileCompleteness ?? 0) < 80) {
    throw new Error("Your profile must be at least 80% complete before applying.");
  }
  return profile;
}

async function createStageEvent(
  application: Application,
  fromStage: string,
  toStage: string,
  session: Session,
  options: { reasonCode?: string; text: string; internalNotes?: string },
) {
  const correlationId = crypto.randomUUID();
  return collection<StageEvent>("ApplicationStageEvent", [
    "applicationId",
    "toStage",
    "occurredAt",
  ]).create({
    applicationId: application.ItemId,
    fromStage,
    toStage,
    actorUserId: session.user.id,
    actorRole: session.role,
    occurredAt: new Date().toISOString(),
    reasonCode: options.reasonCode || "WORKFLOW_TRANSITION",
    candidateVisibleText: options.text,
    internalNotes: options.internalNotes || "",
    visibility: "STUDENT",
    correlationId,
    idempotencyKey: `${application.ItemId}:${toStage}:${correlationId}`,
  });
}

export async function applyToOpportunity(
  opportunity: Opportunity,
  session: Session,
) {
  requireRole(session, ["student"], "submit applications");
  if (opportunity.status !== "PUBLISHED") {
    throw new Error("Only published opportunities accept applications.");
  }
  if (!opportunity.deadlineAt || new Date(opportunity.deadlineAt) < new Date()) {
    throw new Error("The application deadline has passed.");
  }
  const [profile, existing] = await Promise.all([
    currentStudentProfile(session),
    listApplications(),
  ]);
  if (existing.some((item) => item.opportunityId === opportunity.ItemId)) {
    throw new Error("You have already applied to this opportunity.");
  }

  type StudentDocument = DataRecord & {
    fileId?: string;
    fileName?: string;
    fileVersion?: number;
    contentHash?: string;
    isDefault?: boolean;
    status?: string;
  };
  const documentsResponse = await collection<StudentDocument>(
    "StudentDocument",
    [
      "studentProfileId",
      "fileId",
      "fileName",
      "fileVersion",
      "contentHash",
      "isDefault",
      "status",
    ],
  ).list({ pageNo: 1, pageSize: 25 });
  const documents = pageItems<StudentDocument>(
    documentsResponse,
    "getStudentDocuments",
  );
  const document =
    documents.find((item) => item.isDefault && item.status === "ACTIVE") ??
    documents.find((item) => item.status === "ACTIVE");
  if (!document) throw new Error("Upload an active CV before applying.");

  const now = new Date().toISOString();
  const created = await collection<Application>(
    "Application",
    applicationFields,
  ).create({
    applicationKey: `${profile.ItemId}:${opportunity.ItemId}`,
    studentProfileId: profile.ItemId,
    studentUserId: session.user.id,
    departmentId: profile.departmentId,
    opportunityId: opportunity.ItemId,
    employerId: opportunity.employerId,
    employerOrganizationId: opportunity.employerOrganizationId,
    status: "SUBMITTED",
    submittedAt: now,
    aiProcessingStatus:
      profile.aiConsentStatus === "GRANTED" ? "PENDING" : "OPTED_OUT",
    isTestRecord: false,
    revision: 1,
  });
  const itemId = mutationItemId(created);
  if (!itemId) throw new Error("Application was created without an item id.");
  const application: Application = {
    ItemId: itemId,
    opportunityId: opportunity.ItemId,
    status: "SUBMITTED",
  };

  const snapshotKey = crypto.randomUUID();
  const [profileSnapshot, opportunitySnapshot, applicationDocument] =
    await Promise.all([
      collection<DataRecord>("ApplicationProfileSnapshot", [
        "applicationId",
        "capturedAt",
      ]).create({
        applicationId: itemId,
        studentUserId: session.user.id,
        departmentId: profile.departmentId,
        cohortCode: `${profile.graduationYear ?? ""}-${profile.graduationTerm ?? ""}`,
        skillsJson: JSON.stringify(profile.skillIds ?? []),
        experienceJson: "[]",
        profileJson: JSON.stringify({
          headline: profile.headline,
          bio: profile.bio,
        }),
        snapshotHash: `profile-${snapshotKey}`,
        capturedAt: now,
      }),
      collection<DataRecord>("OpportunitySnapshot", [
        "applicationId",
        "capturedAt",
      ]).create({
        applicationId: itemId,
        opportunityId: opportunity.ItemId,
        opportunityRevision: opportunity.revision ?? 1,
        termsJson: JSON.stringify({
          title: opportunity.title,
          description: opportunity.description,
          requirements: opportunity.requirements,
          stipendMinor: opportunity.stipendMinor,
          currency: opportunity.currency,
          deadlineAt: opportunity.deadlineAt,
        }),
        snapshotHash: `opportunity-${snapshotKey}`,
        capturedAt: now,
      }),
      collection<DataRecord>("ApplicationDocument", [
        "applicationId",
        "linkedAt",
      ]).create({
        applicationId: itemId,
        studentDocumentId: document.ItemId,
        fileId: document.fileId,
        fileVersion: document.fileVersion ?? 1,
        fileName: document.fileName,
        contentHash: document.contentHash,
        employerAccessExpiresAt: new Date(
          Date.now() + 90 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        linkedAt: now,
      }),
    ]);
  await collection<Application>("Application", applicationFields).update(
    itemId,
    {
      profileSnapshotId: mutationItemId(profileSnapshot),
      opportunitySnapshotId: mutationItemId(opportunitySnapshot),
      applicationDocumentId: mutationItemId(applicationDocument),
      revision: 2,
    },
  );
  await createStageEvent(application, "DRAFT", "SUBMITTED", session, {
    text: "Your application was submitted successfully.",
  });
}

export async function withdrawApplication(
  application: Application,
  session: Session,
) {
  requireRole(session, ["student"], "withdraw applications");
  if (application.studentUserId && application.studentUserId !== session.user.id) {
    throw new Error("You can withdraw only your own application.");
  }
  if (application.status !== "SUBMITTED") {
    throw new Error("Only a submitted application can be withdrawn.");
  }
  const now = new Date().toISOString();
  await collection<Application>("Application", applicationFields).update(
    application.ItemId,
    {
      status: "WITHDRAWN",
      withdrawnAt: now,
      finalOutcomeAt: now,
      revision: (application.revision ?? 0) + 1,
    },
  );
  await createStageEvent(
    application,
    application.status || "SUBMITTED",
    "WITHDRAWN",
    session,
    { text: "You withdrew this application." },
  );
}

export async function screenApplication(
  application: Application,
  recommendation: "SHORTLIST" | "REJECT",
  session: Session,
  reason?: RejectionReason,
  internalNotes = "",
) {
  requireRole(session, ["career-staff", "career-manager"], "screen applications");
  if (!["SUBMITTED", "NEEDS_REVIEW"].includes(application.status || "")) {
    throw new Error("Only submitted applications can be screened.");
  }
  if (recommendation === "REJECT" && !reason?.code) {
    throw new Error("Select an approved rejection reason.");
  }
  const now = new Date().toISOString();
  const nextStatus = recommendation === "SHORTLIST" ? "SHORTLISTED" : "REJECTED";
  const explanation =
    recommendation === "SHORTLIST"
      ? "Your application has been shortlisted for employer review."
      : reason?.candidateTemplate || "Your application will not progress further.";
  const decisionCollection = collection<DataRecord>("ScreeningDecision", [
    "applicationId",
    "recommendation",
    "decidedAt",
    "revision",
  ]);
  const decisionsResponse = await decisionCollection.list({
    pageNo: 1,
    pageSize: 100,
  });
  const existing = pageItems<DataRecord>(
    decisionsResponse,
    "getScreeningDecisions",
  ).find((item) => item.applicationId === application.ItemId);
  const payload = {
    applicationId: application.ItemId,
    reviewerUserId: session.user.id,
    recommendation,
    rubricVersion: "2026.1",
    rubricJson: JSON.stringify({ decision: recommendation }),
    internalNotes,
    rejectionReasonCode: reason?.code || "",
    candidateExplanation: explanation,
    decidedAt: now,
    revision: Number(existing?.revision ?? 0) + 1,
  };
  if (existing) await decisionCollection.update(existing.ItemId, payload);
  else await decisionCollection.create(payload);
  await collection<Application>("Application", applicationFields).update(
    application.ItemId,
    {
      status: nextStatus,
      ...(nextStatus === "REJECTED" ? { finalOutcomeAt: now } : {}),
      revision: (application.revision ?? 0) + 1,
    },
  );
  await createStageEvent(
    application,
    application.status || "SUBMITTED",
    nextStatus,
    session,
    {
      reasonCode: reason?.code,
      text: explanation,
      internalNotes,
    },
  );
}

export async function recordEmployerOutcome(
  application: Application,
  outcomeType:
    | "INTERVIEW_SCHEDULED"
    | "INTERVIEWED"
    | "OFFERED"
    | "HIRED"
    | "NOT_SELECTED",
  session: Session,
) {
  requireRole(session, ["employer-user"], "record employer outcomes");
  if (!["SHORTLISTED", "INTERVIEW", "INTERVIEWED", "OFFERED"].includes(application.status || "")) {
    throw new Error("This candidate is not in an employer-managed stage.");
  }
  const now = new Date().toISOString();
  await collection<DataRecord>("EmployerOutcome", [
    "applicationId",
    "outcomeType",
    "reportedAt",
  ]).create({
    applicationId: application.ItemId,
    employerOrganizationId:
      application.employerOrganizationId || session.organization.id,
    outcomeType,
    status: "ACTIVE",
    occurredAt: now,
    detailsJson: "{}",
    reportedByUserId: session.user.id,
    reportedAt: now,
    isPlacementVerified: false,
    isPrimaryPlacement: outcomeType === "HIRED",
    revision: 1,
  });
  const nextStage =
    outcomeType === "INTERVIEW_SCHEDULED" ? "INTERVIEW" : outcomeType;
  await collection<Application>("Application", applicationFields).update(
    application.ItemId,
    {
      status: nextStage,
      ...(["HIRED", "NOT_SELECTED"].includes(nextStage)
        ? { finalOutcomeAt: now }
        : {}),
      revision: (application.revision ?? 0) + 1,
    },
  );
  await createStageEvent(
    application,
    application.status || "SHORTLISTED",
    nextStage,
    session,
    { text: `Employer updated the application to ${nextStage.toLowerCase().replaceAll("_", " ")}.` },
  );
}

export async function dashboardCounts() {
  const [opportunities, applications, followUps] = await Promise.all([
    listOpportunities().catch(() => []),
    listApplications().catch(() => []),
    collection<DataRecord>("FollowUpFlag", ["status"])
      .list({ pageNo: 1, pageSize: 100 })
      .then((response) => pageItems<DataRecord>(response, "getFollowUpFlags"))
      .catch(() => []),
  ]);
  return {
    opportunities: opportunities.filter((item) => item.status === "PUBLISHED")
      .length,
    applications: applications.length,
    followUps: followUps.filter((item) => item.status === "OPEN").length,
  };
}
