# CampusCareer IAM Matrix

## Roles

| Role slug                | Scope                        | Privileged actions                                                     |
| ------------------------ | ---------------------------- | ---------------------------------------------------------------------- |
| `pending-user`           | No domain data               | Complete verification only                                             |
| `student`                | Own IAM user ID              | Profile/CVs, opportunity discovery, own applications/timeline/AI flags |
| `employer-user`          | Active employer organization | Own postings, applicants to those postings, employer outcomes          |
| `career-staff`           | University operations        | Opportunity approval, screening, follow-up, placement verification     |
| `career-manager`         | Career staff plus management | Reference data, AI flags, escalation, exceptional reopen/correction    |
| `department-stakeholder` | Assigned department          | Approved named-student fields and department analytics                 |
| `university-stakeholder` | University aggregate         | Aggregate/accreditation reporting without routine record access        |
| `university-superadmin`  | Restricted administration    | Employer orgs/users and role/access administration                     |

## Enforcement layers

| Layer                          | Responsibility                                                               |
| ------------------------------ | ---------------------------------------------------------------------------- |
| IAM endpoint permission        | Allows calling the relevant Blocks service endpoint                          |
| IAM frontend-action permission | Controls route, navigation and action visibility                             |
| Data Gateway policy            | Enforces user, department and employer-record scope server-side              |
| Storage ACL                    | Enforces file-specific view/download/edit/delete rights                      |
| Domain command                 | Enforces lifecycle actor, transition, reason, revision and idempotency rules |

The source-controlled manifests are `blocks/iam/roles.json`,
`blocks/iam/permissions.json`, `blocks/iam/tenant-config.json` and
`blocks/iam/oidc-client.json`. They are design inputs; they do not mutate the
tenant. Every CLI create/save/assignment must be dry-run and explicitly approved.

## Policy design blocker

The installed CLI documents the portable Data-policy envelope but does not
publish a complete contract for role, user-ID and department-claim operands.
Only the active `OrganizationId` equality pattern is proven locally. Therefore:

1. Schema files may be authored and locally validated.
2. Schema deployment must not occur while it would auto-publicize new schemas.
3. Data rules must be completed and dry-run using a verified operand contract
   before any schema push.

This is a security gate, not optional cleanup. A UI role check cannot substitute
for record-level policy enforcement.
