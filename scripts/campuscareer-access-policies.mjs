const OPERATIONS = {
  READ: 0,
  WRITE: 1,
  EDIT: 2,
};

const staffWriteSchemas = [
  "Application",
  "ApplicationStageEvent",
  "EmployerOutcome",
  "ExplanationFlag",
  "FollowUpActivity",
  "FollowUpFlag",
  "Opportunity",
  "ScreeningDecision",
];

const studentReferenceSchemas = [
  "AcademicPeriod",
  "Department",
  "Employer",
  "OpportunityDepartment",
  "OpportunitySkill",
  "OpportunityType",
  "Skill",
];

const studentOwnedSchemas = {
  Application: "studentUserId",
  ApplicationStageEvent: "studentUserId",
  NotificationDelivery: "recipientUserId",
  NotificationPreference: "userId",
  StudentDocument: "ownerUserId",
  StudentProfile: "userId",
};

const employerOwnedSchemas = {
  Application: "employerOrganizationId",
  ApplicationStageEvent: "employerOrganizationId",
  Employer: "organizationId",
  EmployerOutcome: "employerOrganizationId",
  Opportunity: "employerOrganizationId",
};

function staticRule(leftOperand, operator, staticValue) {
  return {
    leftSource: 0,
    leftOperand,
    operator,
    rightSource: 2,
    rightOperand: "",
    rightOperands: [],
    staticValue,
    description: null,
  };
}

function schemaRule(authOperand, schemaOperand) {
  return {
    leftSource: 0,
    leftOperand: authOperand,
    operator: 0,
    rightSource: 1,
    rightOperand: schemaOperand,
    rightOperands: [],
    staticValue: null,
    description: null,
  };
}

function group(role, extraRules = []) {
  return {
    logicalOperator: 0,
    rules: [
      staticRule("roles", 6, role),
      schemaRule("organizationId", "OrganizationId"),
      ...extraRules,
    ],
    nestedGroups: [],
  };
}

function policy(schemaName, role, operation, suffix, extraRules = []) {
  return {
    schemaName,
    policyName: `${role}-${suffix}`,
    policyDescription:
      "Allow the named CampusCareer role within the active organization.",
    policyType: 0,
    operation,
    fieldNames: [],
    ruleGroup: group(role, extraRules),
    priority: 100,
    isAllowPolicy: true,
  };
}

export function buildAccessPolicies(schemaNames) {
  const policies = [];

  for (const schemaName of schemaNames) {
    for (const [suffix, operation] of Object.entries(OPERATIONS)) {
      policies.push(
        policy(schemaName, "career-manager", operation, suffix.toLowerCase()),
      );
    }
    policies.push(policy(schemaName, "career-staff", OPERATIONS.READ, "read"));
  }

  for (const schemaName of staffWriteSchemas) {
    policies.push(
      policy(schemaName, "career-staff", OPERATIONS.WRITE, "write"),
      policy(schemaName, "career-staff", OPERATIONS.EDIT, "edit"),
    );
  }

  for (const schemaName of studentReferenceSchemas) {
    policies.push(policy(schemaName, "student", OPERATIONS.READ, "read"));
  }
  policies.push(
    policy("Opportunity", "student", OPERATIONS.READ, "read-published", [
      {
        leftSource: 1,
        leftOperand: "status",
        operator: 0,
        rightSource: 2,
        rightOperand: "",
        rightOperands: [],
        staticValue: "PUBLISHED",
        description: null,
      },
    ]),
  );
  for (const [schemaName, ownerField] of Object.entries(studentOwnedSchemas)) {
    const ownerRule = schemaRule("userId", ownerField);
    policies.push(
      policy(schemaName, "student", OPERATIONS.READ, "read-own", [ownerRule]),
      policy(schemaName, "student", OPERATIONS.WRITE, "write-own", [ownerRule]),
      policy(schemaName, "student", OPERATIONS.EDIT, "edit-own", [ownerRule]),
    );
  }

  policies.push(
    policy("EmployerMembership", "employer-user", OPERATIONS.READ, "read-own", [
      schemaRule("userId", "userId"),
    ]),
  );
  for (const [schemaName, organizationField] of Object.entries(
    employerOwnedSchemas,
  )) {
    const ownerRule = schemaRule("organizationId", organizationField);
    policies.push(
      policy(schemaName, "employer-user", OPERATIONS.READ, "read-own", [
        ownerRule,
      ]),
      policy(schemaName, "employer-user", OPERATIONS.WRITE, "write-own", [
        ownerRule,
      ]),
      policy(schemaName, "employer-user", OPERATIONS.EDIT, "edit-own", [
        ownerRule,
      ]),
    );
  }
  for (const schemaName of [
    "Department",
    "OpportunityDepartment",
    "OpportunitySkill",
    "OpportunityType",
    "Skill",
  ]) {
    policies.push(policy(schemaName, "employer-user", OPERATIONS.READ, "read"));
  }

  return policies.sort(
    (left, right) =>
      left.schemaName.localeCompare(right.schemaName) ||
      left.policyName.localeCompare(right.policyName),
  );
}
