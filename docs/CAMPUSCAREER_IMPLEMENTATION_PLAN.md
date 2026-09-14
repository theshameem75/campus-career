# CampusCareer Implementation Plan

## 1. Purpose

This plan breaks `CAMPUSCAREER_REQUIREMENTS.md` into an executable backlog for
the CampusCareer development tenant:

- Blocks project: `D8fb34a0fb75740f0b8a479a550807393`
- Application domain: `https://dbfvug-elgew.slsblx.com`
- Initial product scope: university internship management

The Blocks CLI owns tenant and service configuration. The React application and
server-side worker use `@seliseblocks/client` for runtime access. No feature may
call Blocks APIs with ad hoc HTTP.

## 2. Delivery rules

1. Pass `--account default --project D8fb34a0fb75740f0b8a479a550807393
--json` to project-scoped automation.
2. Set `BLOCKS_STRICT_FLAGS=1` in scripted CLI sessions.
3. Run read-only inventory commands before editing local or cloud state.
4. For every Blocks mutation, run `--dry-run`, review the exact diff with the
   product/tenant owner, and run `--yes` only after explicit approval.
5. Pull existing schemas/rules/templates before editing to avoid overwriting
   portal or teammate changes.
6. Use stable role slugs, IAM user IDs, IAM organization IDs, and Data item IDs;
   never authorize using display names supplied by the browser.
7. Enforce access in Data policies and IAM permissions. UI feature gates are a
   usability layer, not a security boundary.
8. Make workflow transitions, scheduled jobs, notifications, and AI generation
   idempotent and auditable.
9. Do not put tokens, provider secrets, CV contents, or AI credentials in source,
   frontend environment variables, logs, fixtures, or CLI output artifacts.

## 3. Current baseline

| Area               | Current state                                                                                           | Backlog consequence                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| Frontend           | React, TypeScript, Vite, Tailwind, routing/query/form libraries, Docker and Nginx compile successfully  | Keep foundation; build the product shell and features on it            |
| Blocks CLI         | Version `0.5.0`, project selected; project refresh token is valid but cached access token needs refresh | Refresh before the first live project command                          |
| Local Blocks files | No `blocks/` directory or `blocks.json`                                                                 | Run `blocks init` before schema work                                   |
| OIDC               | Disabled; no app client or identity provider                                                            | Identity setup is a release blocker                                    |
| IAM                | Only the platform System User role; zero end users                                                      | Define application roles/permissions and seed controlled test users    |
| Data               | Data source configured; no custom schemas                                                               | Design and deploy the complete model and policies                      |
| Storage            | Default Azure configuration exists                                                                      | Validate it, then implement protected CV operations                    |
| Mail               | Default mail configuration exists                                                                       | Validate sender/config, author templates, and test delivery            |
| Notifier           | No application integration                                                                              | Configure channels if needed and implement inbox/alerts                |
| Localization       | English, German, Bengali configured; no modules                                                         | English MVP content first; localized modules are deferred              |
| Release            | Repository/build context unresolved                                                                     | Connect/resolve repository, deploy frontend and worker, add monitoring |

## 4. Workstream and milestone overview

Effort labels are relative engineering sizes, not calendar estimates: **S** is
usually one focused task, **M** spans several components, and **L** is a feature
slice needing design, implementation, and end-to-end tests.

| Milestone                           | Outcome                                                                     | Depends on           |
| ----------------------------------- | --------------------------------------------------------------------------- | -------------------- |
| M0. Delivery foundation             | Local Blocks workspace, architecture decisions, test strategy               | Existing scaffold    |
| M1. Identity and tenancy            | Hosted sign-in, verified registration, employer orgs, least-privilege roles | M0 and Entra inputs  |
| M2. Data and file foundation        | Live schemas, policies, validations, reference data, protected CV storage   | M1 role design       |
| M3. Authenticated product shell     | Role-aware routes, navigation, errors, organization context                 | M1                   |
| M4. Student experience              | Profile, experience, skills, CVs, preferences and consent                   | M2-M3                |
| M5. Employer and opportunity flow   | Employer admin, structured drafts, approval, publication and discovery      | M2-M4                |
| M6. Applications and screening      | Canonical submission, snapshots, timelines, rubric and rejection            | M4-M5                |
| M7. Employer outcomes and follow-up | Interviews/offers/hires, overdue queue, reminders and escalation            | M6                   |
| M8. Analytics and exports           | Live metrics, verified placements, CSV/PDF and immutable snapshots          | M7                   |
| M9. Governed AI                     | Match explanations, staff review, student flags and quality controls        | M6 plus AI gate      |
| M10. Privacy, audit and operations  | Rights, retention, observability, recovery and hardening                    | M4-M9                |
| M11. Release and acceptance         | Production-like deployment, demo data, security/NFR acceptance              | All prior milestones |

## 5. Detailed implementation backlog

### M0. Delivery foundation

| ID     | Size | Task                                                                                                                                                                    | Blocks surface / output                                                                   | Depends on   | Done when                                                                              |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------ | -------------------------------------------------------------------------------------- |
| FND-01 | S    | Refresh the project session and confirm CLI/project health.                                                                                                             | `blocks auth refresh --project`, then read-only `auth status` and `doctor`                | None         | CLI is current and the intended project context is usable without exposing credentials |
| FND-02 | S    | Initialize project-local Blocks files.                                                                                                                                  | `blocks init`; commit `blocks.json`, `blocks/data/schemas/`, and `blocks/data/rules.json` | FND-01       | Local validation can run and generated files identify the CampusCareer tenant          |
| FND-03 | S    | Re-inventory Data, IAM, OIDC, organizations, storage, mail, notification, localization and Release.                                                                     | Read-only `blocks ... list/get` commands                                                  | FND-01       | Baseline evidence is recorded and no duplicate resources are planned                   |
| FND-04 | M    | Record architecture decisions for ID strategy, timestamps, soft deletion/anonymization, optimistic concurrency, event idempotency, file metadata and worker scheduling. | Architecture note and schema conventions                                                  | Requirements | All schema and API tasks use one convention                                            |
| FND-05 | M    | Establish test layers and fixtures: unit, component, Data-policy isolation, integration, browser E2E, load, accessibility and demo scenario.                            | Test configuration and fixture policy                                                     | FND-04       | CI can run a smoke test and test records are explicitly marked/excluded from analytics |
| FND-06 | S    | Add CI quality gates.                                                                                                                                                   | `npm ci`, lint, typecheck, tests and build                                                | FND-05       | Pull requests fail on a broken quality gate                                            |

### M1. Identity, registration and tenant boundaries

| ID     | Size | Task                                                                                                                                                                            | Blocks surface / output                                                                               | Depends on                 | Done when                                                                                  |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------------------------------------ |
| IAM-01 | M    | Confirm the university Entra tenant ID, verified email domains, claims, group/role mapping and recovery owner.                                                                  | Production validation gate; no mutation                                                               | FND-03                     | Inputs are approved and documented                                                         |
| IAM-02 | M    | Design stable roles: `pending-user`, `student`, `employer-user`, `career-staff`, `career-manager`, `department-stakeholder`, `university-stakeholder`, `university-superadmin`. | Role/permission matrix mapped to actual endpoint, frontend-action and data-protection permissions     | IAM-01                     | Every required action has an explicit least-privilege permission and owner                 |
| IAM-03 | M    | Create application roles and assign only the reviewed permission deltas.                                                                                                        | `blocks iam roles create` and `blocks iam roles assign-permissions`, each dry-run then approved apply | IAM-02                     | Role list and permission reads match the approved matrix; System User remains untouched    |
| IAM-04 | S    | Configure organization policy for employer organizations; disable public organization creation.                                                                                 | Read config, then `blocks iam organizations config save` if a change is needed                        | IAM-02                     | Multi-org behavior and allowed creation channels match policy                              |
| IAM-05 | M    | Configure self-registration to create only `pending-user`; allow approved SSO/email-password modes.                                                                             | Read then `blocks iam signup-settings save` with full merged settings                                 | IAM-02                     | A new account has no student/staff/employer authority before verification                  |
| IAM-06 | M    | Register the public PKCE OIDC client for every exact dev/deployed callback and logout URI.                                                                                      | `blocks auth oidc-clients list/get/save`; client type `public`, PKCE required                         | IAM-01                     | Client is active and callback URIs match byte-for-byte                                     |
| IAM-07 | L    | Configure and verify Microsoft Entra as the university identity provider.                                                                                                       | `blocks auth idp create/update/list/get`; provider endpoints taken from discovery, not guessed        | IAM-01, IAM-06             | Hosted login succeeds for an allowed university identity and rejects invalid configuration |
| IAM-08 | M    | Implement directory-backed registration verification and controlled role grant workflow.                                                                                        | Data directory records plus IAM SDK/CLI user access grant; audited staff action                       | IAM-03, M2 schemas         | Domain alone cannot elevate access; matched records can be approved once                   |
| IAM-09 | M    | Implement superadmin employer onboarding: create/verify IAM organization, create Employer profile, invite user, grant org-scoped role.                                          | IAM Organizations/Users SDK in an admin-confirmed UI; CLI usable for controlled ops                   | IAM-03, IAM-04, M2 schemas | Employer user can enter only the verified employer context                                 |
| IAM-10 | M    | Build authorization regression tests for student, department, employer, staff, manager, stakeholder and superadmin identities.                                                  | IAM and Data-policy integration tests                                                                 | IAM-08, IAM-09             | Cross-student, cross-department and cross-employer access attempts fail server-side        |

### M2. Data Gateway, reference data and protected files

| ID     | Size | Task                                                                                                                                                  | Blocks surface / output                                                                                                                                                                                            | Depends on               | Done when                                                                                                     |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ------------------------------------------------------------------------------------------------------------- |
| DAT-01 | S    | Confirm the existing Data source; keep Blocks-managed storage unless a separate decision explicitly changes it.                                       | `blocks data config get --json`                                                                                                                                                                                    | FND-03                   | Backing configuration is recorded; no unnecessary repointing occurs                                           |
| DAT-02 | L    | Finalize entity fields, indexes, unique keys, immutable fields, retention class and relationships.                                                    | Schema design for the groups below                                                                                                                                                                                 | FND-04, IAM-02           | Schema review covers every canonical entity and business rule                                                 |
| DAT-03 | L    | Author identity/reference schemas.                                                                                                                    | `TenantSettings`, `DirectoryRecord`, `Department`, `AcademicPeriod`, `Skill`, `OpportunityType`, `RejectionReason`, `ExplanationFlagCategory`, notification/template references                                    | DAT-02                   | Reference records are versionable, tenant-controlled and manager-maintained                                   |
| DAT-04 | L    | Author student/employer schemas.                                                                                                                      | `StudentProfile`, `StudentExperience`, `StudentDocument`, `Employer`, `EmployerMembership`                                                                                                                         | DAT-02                   | IAM IDs and organization IDs are authoritative foreign keys                                                   |
| DAT-05 | L    | Author opportunity/application schemas.                                                                                                               | `Opportunity`, `OpportunityDepartment`, `OpportunitySkill`, `Application`, immutable profile/opportunity snapshots, `ApplicationDocument`, `ApplicationStageEvent`, `ScreeningDecision`                            | DAT-02                   | Duplicate application and immutable history constraints are representable                                     |
| DAT-06 | L    | Author outcome/follow-up/AI/operations schemas.                                                                                                       | `EmployerOutcome`, `FollowUpFlag`, `FollowUpActivity`, `MatchExplanation`, `ExplanationFlag`, `CoachingDigest`, `NotificationPreference`, `AuditEvent`, `ScheduledJobRun`, `MetricSnapshot`, `AccreditationReport` | DAT-02                   | Required outcome, AI, job, audit and reporting state is durable                                               |
| DAT-07 | L    | Author deny-by-default Data access policies for every schema/action/field.                                                                            | `blocks/data/rules.json`                                                                                                                                                                                           | DAT-03 to DAT-06, IAM-02 | Policies enforce the authorization matrix using trusted user/org/department context                           |
| DAT-08 | M    | Add field validation for required values, enums, lengths, ranges, dates and approved patterns.                                                        | Schema validation plus `blocks data validation save` where field rules require it                                                                                                                                  | DAT-03 to DAT-06         | Invalid lifecycle/reference/input data is rejected server-side                                                |
| DAT-09 | M    | Validate, preview, approve and deploy the model atomically.                                                                                           | `blocks data validate`, then `blocks data sync --dry-run`, reviewed `--yes`                                                                                                                                        | DAT-07, DAT-08           | Push, rules deploy and reload succeed; runtime CRUD sees the new model                                        |
| DAT-10 | M    | Seed controlled reference data: CSE/BBA/EEE, Internship, lifecycle values, rubric, rejection reasons, flag categories, settings and academic periods. | Idempotent SDK seed script using Data collections                                                                                                                                                                  | DAT-09                   | Re-running seed creates no duplicates and records a seed version                                              |
| FIL-01 | S    | Read and validate the existing Azure storage configuration without rotating it.                                                                       | Storage configuration list/get via CLI                                                                                                                                                                             | FND-03                   | Provider, limits and operational owner are known                                                              |
| FIL-02 | L    | Implement protected CV upload, type/size scanning checks, listing, versioning, selection, download and delete/retention behavior.                     | Blocks Data Storage SDK and file metadata schema                                                                                                                                                                   | FIL-01, DAT-04           | Students manage their files; only context-authorized staff/employers can read an application-selected version |
| FIL-03 | M    | Enforce employer file-access expiry 90 days after close/final outcome, whichever is later.                                                            | Data policy plus worker-maintained access projection/expiry                                                                                                                                                        | FIL-02, M7               | Expired employer access fails while minimal outcome/audit history remains                                     |

### M3. Authenticated application shell

| ID     | Size | Task                                                                                                                          | Blocks surface / output                           | Depends on     | Done when                                                                           |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- | -------------- | ----------------------------------------------------------------------------------- |
| WEB-01 | M    | Add the singleton Blocks client configuration, environment validation and API-domain rules.                                   | `@seliseblocks/client`; no secrets in `VITE_*`    | IAM-06         | App refuses incomplete config and uses the correct same-site Blocks API domain      |
| WEB-02 | L    | Implement hosted login redirect, public callback, session bootstrap, logout and authenticated route guard.                    | Blocks Auth SDK                                   | IAM-06, IAM-07 | Login persists on the real HTTPS domain and protected routes cannot flash content   |
| WEB-03 | M    | Implement `useCurrentUser`, role/permission helpers, frontend action gates and unauthorized state.                            | IAM SDK reads                                     | IAM-03, WEB-02 | Navigation/actions reflect permissions without being relied upon for security       |
| WEB-04 | M    | Build role-aware app shell and route groups for student, employer, staff, department, stakeholder and superadmin experiences. | React Router and accessible navigation            | WEB-03         | Each test role lands on an appropriate dashboard and cannot route into unrelated UI |
| WEB-05 | M    | Add consistent loading, empty, validation, conflict, offline/degraded and error states.                                       | Shared UI/query conventions                       | WEB-04         | All feature screens can express required operational states                         |
| WEB-06 | S    | Complete local HTTPS setup and document the exact real-domain URL.                                                            | `npm run setup:https`; OIDC callback registration | WEB-02         | A developer can run and authenticate locally without localhost cookie failures      |

### M4. Student profile, documents, consent and preferences

| ID     | Size | Task                                                                                                                     | Blocks surface / output                   | Depends on       | Done when                                                                                    |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- | ---------------- | -------------------------------------------------------------------------------------------- |
| STU-01 | L    | Build student profile create/edit/read with department/cohort, skills, projects, experience and approved contact fields. | Data SDK CRUD                             | DAT-09, WEB-05   | Student manages only their profile and completeness is shown                                 |
| STU-02 | M    | Build normalized skill and experience editors with manager-controlled skill references.                                  | Data SDK CRUD                             | DAT-10, STU-01   | Skills use approved references and evidence can be attached                                  |
| STU-03 | L    | Build multiple-CV management and application-version selection.                                                          | Storage SDK plus `StudentDocument`        | FIL-02, STU-01   | Multiple versions are manageable and historic application references never drift             |
| STU-04 | M    | Implement versioned privacy notice, terms and separate AI consent/withdrawal.                                            | Data SDK plus audit events                | DAT-09, STU-01   | Notice/consent version and timestamp are queryable; AI opt-out does not block applications   |
| STU-05 | M    | Implement notification preferences with transactional categories locked on.                                              | Data SDK                                  | DAT-09, STU-01   | Optional digests can be disabled; mandatory workflow messages remain enabled                 |
| STU-06 | M    | Add own-profile export/correction/deletion-request workflow subject to retention/legal hold.                             | Data and Storage SDK; privacy-owner queue | STU-01 to STU-04 | Request status and handling audit are visible without deleting protected history prematurely |

### M5. Employer and opportunity lifecycle

| ID     | Size | Task                                                                                                                                                          | Blocks surface / output                               | Depends on     | Done when                                                                       |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | -------------- | ------------------------------------------------------------------------------- |
| EMP-01 | L    | Build superadmin employer organization/profile/user administration with explicit confirmation summaries.                                                      | IAM Organizations/Users SDK plus Data SDK             | IAM-09, WEB-04 | Create/update/invite actions are audited and organization-scoped                |
| EMP-02 | L    | Build structured opportunity draft/edit for title, requirements, skills, departments, stipend/currency, slots, mode/location, duration and deadline/timezone. | Data SDK                                              | DAT-10, EMP-01 | Employer can manage only its own drafts and required fields validate            |
| EMP-03 | M    | Implement submit-for-approval, staff approve/reject, publish, close and cancel transitions.                                                                   | Server-authoritative transition service over Data SDK | EMP-02         | Only allowed actors/transitions succeed; every transition emits history/audit   |
| EMP-04 | M    | Snapshot material opportunity terms when an application is submitted and constrain edits after publication.                                                   | Data SDK                                              | EMP-03         | Existing applications retain the terms under which they were submitted          |
| EMP-05 | L    | Build student opportunity browse/search/filter/detail and eligibility explanation.                                                                            | Paginated Data queries                                | EMP-03, STU-01 | Only published/open opportunities appear; eligibility and deadline are explicit |
| EMP-06 | M    | Add slot/deadline auto-close processing with tenant timezone handling.                                                                                        | Idempotent worker plus `ScheduledJobRun`              | EMP-03         | Closure runs once, stores UTC timestamps and preserves application history      |

### M6. Applications, screening and timeline

| ID     | Size | Task                                                                                                                                                               | Blocks surface / output                            | Depends on     | Done when                                                                            |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------- | -------------- | ------------------------------------------------------------------------------------ |
| APP-01 | L    | Implement atomic submit: recheck eligibility/deadline, enforce student+opportunity uniqueness, capture profile/CV/opportunity snapshots, create `Submitted` event. | Server-side application command using Data SDK     | STU-03, EMP-04 | Retry is idempotent; a duplicate canonical application cannot be created             |
| APP-02 | M    | Build student application list/detail and chronological visible timeline.                                                                                          | Data SDK queries                                   | APP-01         | Student sees only their application and approved visible events/text                 |
| APP-03 | M    | Implement student withdrawal and manager-approved audited reopen without creating a second application.                                                            | Transition command                                 | APP-01         | Allowed nonterminal withdrawal/reopen paths are enforced                             |
| APP-04 | L    | Build paginated staff queue filters and application review workspace.                                                                                              | Data SDK query/GraphQL                             | APP-01         | Staff can filter by department, employer, opportunity, stage, age and overdue status |
| APP-05 | L    | Implement configurable rubric, internal notes, shortlist and respectful rejection with approved reason/template.                                                   | Data SDK transition command                        | APP-04, DAT-10 | Required reason is enforced; internal deliberation is never student-visible          |
| APP-06 | M    | Add optimistic concurrency/version checks to review and transition writes.                                                                                         | Data version field and conflict UI                 | APP-05         | Concurrent review cannot silently overwrite another decision                         |
| APP-07 | M    | Build employer applicant view restricted to its own postings and allowed profile/CV fields.                                                                        | Active IAM organization plus Data policies/queries | APP-05, FIL-02 | Employer can see all own-posting applicants and no unrelated student directory       |

### M7. Employer outcomes, follow-up and messaging

| ID     | Size | Task                                                                                                                                        | Blocks surface / output                                              | Depends on                     | Done when                                                                              |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------- |
| OUT-01 | L    | Implement employer interview scheduling, attendance confirmation, offer, hire, not-selected and correction flows.                           | Data SDK transition/outcome commands                                 | APP-07                         | Employer controls only its posting outcomes; corrections append audit history          |
| OUT-02 | M    | Implement offer decline, expiry and staff verification of reported hire; select one primary placement per student/cycle.                    | Data SDK                                                             | OUT-01                         | `Hired` remains pending until staff verification and headline counting has one primary |
| OUT-03 | L    | Implement idempotent overdue detector using confirmed interview time and configurable day 7/12/14/21 thresholds.                            | Release-deployed worker, Data job/flag records                       | OUT-01                         | Re-runs neither duplicate flags nor send the same threshold event twice                |
| OUT-04 | M    | Build staff follow-up queue, flag detail, activity log, resolution and manager escalation.                                                  | Data SDK                                                             | OUT-03                         | Staff sees age/context/action and can record an auditable resolution                   |
| MSG-01 | S    | Inventory default mail config and templates; confirm sender, provider and mailbox observability.                                            | `blocks mail config/template/mailbox list/get`                       | FND-03                         | Existing service is proven usable without exposing credentials                         |
| MSG-02 | L    | Author English templates for registration/verification, submission, approval/rejection, material stages, reminders, overdue and escalation. | `blocks mail template save`, one reviewed dry-run/apply per template | MSG-01                         | Every purpose exists and uses approved respectful content                              |
| MSG-03 | M    | Configure notification channels only where tenant defaults do not satisfy the matrix.                                                       | Blocks Notification CLI                                              | FND-03                         | Channel configuration is documented and verified                                       |
| MSG-04 | L    | Implement transactional email and in-app notifications from durable domain events/outbox records.                                           | Mail and Notifier SDK; delivery-attempt records                      | APP-01, APP-05, OUT-01, MSG-02 | Required events use both channels and retries do not duplicate user-visible messages   |
| MSG-05 | M    | Build notification inbox/unread/mark-read UI and staff daily digest.                                                                        | Notifier SDK plus worker/Mail                                        | MSG-04                         | Users can manage inbox state and staff receive one daily operational digest            |
| MSG-06 | M    | Add notification failure/retry/dead-letter operations view.                                                                                 | Data delivery log plus mail mailbox/notifier evidence                | MSG-04                         | Staff can find failed attempts without logs containing unnecessary PII                 |

### M8. Analytics, placement verification and exports

| ID     | Size | Task                                                                                                                                                                   | Blocks surface / output                             | Depends on | Done when                                                                   |
| ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| ANL-01 | M    | Implement canonical metric library for placement denominator, stage conversion, employer conversion, repeat posting and median submission-to-confirmed-interview time. | Pure tested server-side aggregation rules           | OUT-02     | Edge-case fixtures prove every published definition                         |
| ANL-02 | L    | Build incremental/rebuildable aggregate projections from canonical events, excluding test/anonymized records.                                                          | Data SDK/GraphQL plus worker                        | ANL-01     | Full rebuild equals incremental result                                      |
| ANL-03 | L    | Build staff/university dashboard with approved filters, funnel, departments, employers, timeliness and stalled cases.                                                  | Data queries and accessible charts/tables           | ANL-02     | Metrics update from workflow data and filters retain correct denominators   |
| ANL-04 | M    | Build employer analytics restricted to own organization and department analytics restricted to own department.                                                         | Data policies and scoped queries                    | ANL-02     | Unauthorized dimensions and drill-down records cannot be queried            |
| ANL-05 | M    | Implement authorized CSV detail export and branded PDF accreditation summary.                                                                                          | Server-side export worker with stored export record | ANL-03     | Exports match on-screen filters and access scope                            |
| ANL-06 | M    | Implement immutable submitted accreditation snapshots and correction versions.                                                                                         | `MetricSnapshot`/`AccreditationReport`              | ANL-05     | Later corrections create a new version and never rewrite a submitted report |

### M9. Governed AI explanations

| ID     | Size | Task                                                                                                                            | Blocks surface / output                                 | Depends on             | Done when                                                                                |
| ------ | ---- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ---------------------- | ---------------------------------------------------------------------------------------- |
| AIG-01 | M    | Confirm Azure OpenAI region, enterprise data terms, deployment, quota, budget, credential owner and approved evaluation set.    | Production validation gate                              | Legal gate, APP-01     | Provider use is approved and browser code receives no credential                         |
| AIG-02 | M    | Define versioned prompt/output contract containing covered requirements, gaps, relevant evidence and one coaching tip—no score. | JSON schema, prompt version and prohibited-input filter | AIG-01                 | Contract validation rejects extra/prohibited fields and unexplained scoring              |
| AIG-03 | L    | Implement consent-aware minimized snapshot extraction excluding protected/contact/GPA attributes.                               | Worker reads immutable application snapshot             | STU-04, APP-01, AIG-02 | Logged test evidence proves prohibited fields never enter model requests                 |
| AIG-04 | L    | Implement asynchronous generation, retries, timeout/failure state, audit metadata, usage budgets and p95 measurement.           | Release-deployed worker plus Data                       | AIG-03                 | Failure never changes application decisions; p95 target and budget alerts are measurable |
| AIG-05 | M    | Build immediate student explanation view with unreviewed label and manual-path state for opt-out/failure.                       | Data SDK                                                | AIG-04                 | Student sees their own version or a clear manual path, never another student's output    |
| AIG-06 | M    | Build staff review/annotate/withdraw/regenerate workflow; require review before explanation is used for shortlist.              | Data SDK                                                | AIG-04, APP-05         | Review state is enforced and every version remains immutable                             |
| AIG-07 | L    | Build student flag and manager resolution workflow with category/comment, SLA queue and student notification.                   | Data SDK plus Mail/Notifier                             | AIG-05, AIG-06, MSG-04 | Confirm/annotate/regenerate/withdraw outcomes are audited and student-visible            |
| AIG-08 | M    | Add monthly sampled quality/fairness report by department/cohort with privacy thresholds.                                       | Evaluation worker/report                                | AIG-07                 | Owner can review quality and bias without exposing small-group personal data             |
| AIG-09 | L    | Implement cross-application coaching digest only after MVP acceptance.                                                          | Optional worker and staff review UI                     | AIG-08                 | Digest is advisory, cited to available data and never mutates applications               |

### M10. Privacy, audit, reliability and accessibility

| ID     | Size | Task                                                                                                                                | Blocks surface / output                   | Depends on             | Done when                                                                      |
| ------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------- | ---------------------- | ------------------------------------------------------------------------------ |
| OPS-01 | L    | Centralize immutable audit emission for role/org changes, transitions, outcome corrections, AI events, exports and rights handling. | `AuditEvent` with correlation IDs         | M1-M9                  | Every material acceptance flow has actor/time/target/before-after evidence     |
| OPS-02 | L    | Implement retention/anonymization worker with legal holds and per-record retention classes.                                         | Release worker, Data and Storage SDK      | Legal approval, OPS-01 | Dry-run report precedes deletion; retained aggregates remain de-identified     |
| OPS-03 | M    | Add operational dashboard for overdue jobs, notification failures, AI failures/flags and export failures.                           | Data projections and role-gated UI        | OUT-03, MSG-06, AIG-04 | Operations owners can identify and retry actionable failures                   |
| OPS-04 | M    | Add structured safe logging, health/readiness checks and correlation IDs without CV text, tokens or unnecessary PII.                | Frontend/worker runtime                   | M3-M9                  | Security log review finds no forbidden content                                 |
| OPS-05 | M    | Document and test backup, RPO 24h, RTO 4h, restore ownership and incident runbooks against contracted Blocks capabilities.          | Operations runbook                        | Platform validation    | Recovery exercise meets approved targets or records an accepted gap            |
| OPS-06 | L    | Complete keyboard, screen-reader, contrast, focus, responsive 360px and latest-two-browser testing.                                 | Automated and manual WCAG 2.2 AA evidence | M3-M9                  | No critical accessibility issue remains in core journeys                       |
| OPS-07 | L    | Load-test 500 student plus 100 staff/employer sessions and 50 requests/second seasonal burst.                                       | Controlled load suite and results         | Stable staging         | Pagination, p95 read/write targets and failure behavior pass or are remediated |
| OPS-08 | L    | Run penetration-style authorization tests for ID tampering, org switching, document URLs, exports and transition commands.          | Security test suite                       | M1-M9                  | All cross-boundary attempts fail and are logged appropriately                  |

### M11. Release, demo and acceptance

| ID     | Size | Task                                                                                                                               | Blocks surface / output                                              | Depends on                       | Done when                                                                      |
| ------ | ---- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------------- | ------------------------------------------------------------------------------ |
| REL-01 | S    | Resolve registered source repository, valid hosting settings, current builds and monitoring.                                       | Read-only `blocks release repos/settings/builds/monitor list`        | FND-03                           | Frontend and worker deployment targets are known                               |
| REL-02 | M    | Define separate frontend and worker build/runtime configuration, health checks and non-secret environment contract.                | Docker/Nginx plus worker Dockerfile/config                           | REL-01                           | Both images build reproducibly and run as non-root where supported             |
| REL-03 | M    | Sync server-only Release secrets from a protected dotenv source; never place them in frontend variables.                           | `blocks release secrets sync --dry-run`, then approved apply         | AIG-01, REL-01                   | Secret metadata exists, values are not logged/committed, and access is audited |
| REL-04 | M    | Perform first Release setup or deployment, register OIDC callback, wait for result and inspect logs/security reports.              | `blocks release setup` or `release deploy`, then status/logs/reports | REL-02, REL-03                   | Build and deploy succeed; deployed login callback is registered                |
| REL-05 | M    | Configure/validate monitoring and alerts for availability, failed jobs, AI usage, notifications and storage.                       | Release monitor reads plus supported platform configuration          | REL-04                           | Named owners receive actionable alerts                                         |
| DEM-01 | M    | Create idempotent demo seed: Brain Station 23, one three-slot React internship, three students, two shortlisted, one rejected.     | Data seed plus controlled IAM/org test setup                         | M7                               | Demo begins from a known, repeatable state                                     |
| DEM-02 | M    | Script the silence-to-hire demonstration: interview, day-threshold processing, follow-up, hire, verification and analytics update. | Worker clock abstraction and E2E automation                          | DEM-01, M8                       | Required narrative runs without manual database edits                          |
| ACC-01 | L    | Execute all 14 MVP acceptance criteria with traceable evidence.                                                                    | E2E, API/policy, accessibility and analytics results                 | M1-M10                           | Every criterion passes or has an approved release exception                    |
| ACC-02 | S    | Obtain product, security/privacy, AI, accreditation and operational go-live approvals.                                             | Signed release checklist                                             | ACC-01 and five validation gates | Production deployment is authorized                                            |

## 6. Blocks CLI execution playbook

These are command shapes, not authorization to mutate the tenant. Before each
phase, use `blocks help <family-or-command> --json` to confirm the installed CLI
surface. Never guess a missing flag.

### 6.1 Establish context and local files

```powershell
$env:BLOCKS_STRICT_FLAGS = '1'
blocks auth status --account default --json
blocks auth refresh --project --account default --json
blocks doctor --account default --json
blocks init --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
```

`blocks init` is local-only. Review generated project files before committing.

### 6.2 Read-before-write inventory

```powershell
blocks auth oidc-clients list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks auth idp list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks iam roles list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks iam permissions list --page-size 100 --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks iam organizations config get --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks iam signup-settings get --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks data config get --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks data schema pull --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks data rules pull --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks mail config list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks mail template list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks release repos list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks release settings list --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
```

### 6.3 Standard mutation gate

For schemas and rules, prefer the composed flow because it validates, pushes,
deploys policies and reloads the gateway:

```powershell
blocks data validate --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
blocks data sync --dry-run --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
# Review with the tenant owner. Only after explicit approval:
blocks data sync --yes --account default --project D8fb34a0fb75740f0b8a479a550807393 --json
```

Use the same two-step gate for OIDC clients/providers, roles/permissions,
organization/signup policy, users, validation rules, mail templates,
notification configuration, Release secrets and deployments. Store reviewed
payloads as non-secret repo files where the command supports `--file`; do not
store credentials in those files.

### 6.4 Post-change verification

After each applied phase:

1. Re-run the corresponding `list/get` command and compare actual state to the
   approved preview.
2. For Data changes, confirm reload completed and execute SDK CRUD smoke tests.
3. For IAM changes, test both allowed and denied calls with representative users.
4. For Mail/Notifier changes, send only to approved test recipients and inspect
   delivery/inbox evidence.
5. For Release changes, wait for the build verdict, inspect logs and security
   reports, then test the deployed callback and health endpoints.

## 7. Cross-cutting implementation conventions

### 7.1 Workflow commands

Do not let UI forms directly patch lifecycle fields. Implement named application
commands such as `submitApplication`, `approveOpportunity`, `shortlistApplication`,
`recordInterview`, `recordHire`, `verifyPlacement` and `resolveExplanationFlag`.
Each command must:

1. Load the current record and trusted actor context.
2. Validate actor, organization/department scope and allowed transition.
3. Validate required reason/data and optimistic version.
4. Write the canonical state and immutable event/audit record consistently.
5. Enqueue a deterministic notification/job key.
6. Return an idempotent response for a repeated command key.

If Blocks Data cannot provide the required multi-record atomicity for a command,
the worker must use an explicit command/outbox state machine with compensating
and retry behavior; silent partial success is unacceptable.

### 7.2 Time and scheduling

- Store instants in UTC and retain the event timezone where user interpretation
  depends on it.
- Start the silence clock only from confirmed `InterviewedAt`.
- Use tenant-configured day 7, 12, 14 and 21 thresholds.
- Inject a clock into worker code so acceptance tests can advance time without
  editing production timestamps.
- Use deterministic keys such as `<applicationId>:outcome-reminder:day-7`.

### 7.3 Query and analytics safety

- Paginate every list and bound all exports.
- Apply authorization before aggregation and before drill-down/export.
- Keep metric functions pure and versioned; store the metric-definition version
  on submitted accreditation snapshots.
- Suppress or aggregate small groups where privacy policy requires it.
- Make projections rebuildable from canonical stage/outcome events.

### 7.4 Definition of done for every feature

A task is complete only when it has:

- server-side authorization and validation;
- accessible loading, empty, error, unauthorized and conflict states;
- unit/integration tests for the happy path and denied/invalid paths;
- audit/observability appropriate to its risk;
- no sensitive content in logs or client configuration;
- requirement IDs linked in tests or delivery notes;
- lint, typecheck, tests and production build passing.

## 8. Requirements traceability

| Requirement group       | Primary tasks                                                  |
| ----------------------- | -------------------------------------------------------------- |
| IAM-01 to IAM-14        | IAM-01 to IAM-10, DAT-07, WEB-02 to WEB-04, OPS-08             |
| STU-01 to STU-05        | STU-01 to STU-05, FIL-02                                       |
| EMP-01 to EMP-08        | IAM-09, EMP-01 to EMP-06, DAT-10                               |
| APP-01 to APP-09        | APP-01 to APP-07, DAT-05, DAT-07                               |
| OUT-01 to OUT-05        | OUT-01 to OUT-04, MSG-04 to MSG-06                             |
| AI-01 to AI-09          | AIG-01 to AIG-09, OPS-01                                       |
| NOT-01 to NOT-06        | MSG-01 to MSG-06, STU-05                                       |
| AN-01 to AN-10          | ANL-01 to ANL-06, OUT-02                                       |
| Security/privacy        | DAT-07, FIL-03, STU-04, STU-06, OPS-01, OPS-02, OPS-04, OPS-08 |
| Performance/reliability | FND-05, APP-06, OPS-03 to OPS-05, OPS-07                       |
| Accessibility/usability | WEB-05, OPS-06                                                 |
| Required demo           | DEM-01, DEM-02                                                 |

## 9. Recommended first execution batch

The first implementation batch should stop before any unapproved cloud mutation:

1. Complete FND-01 through FND-06.
2. Produce the reviewed IAM role/permission matrix (IAM-01 and IAM-02).
3. Produce the reviewed schema/index/policy design (DAT-01 and DAT-02).
4. Author local schema/rule files and test them with `blocks data validate`.
5. Run dry-runs for IAM, OIDC, organization/signup and Data changes.
6. Present the exact dry-run diffs for approval.
7. Apply approved changes, verify reads, and begin the authenticated shell.

This ordering exposes identity, authorization and model risks before feature UI
work accumulates on top of an unstable backend contract.
