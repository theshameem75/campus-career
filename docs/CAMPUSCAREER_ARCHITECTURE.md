# CampusCareer Architecture

## Boundaries

- One Blocks project is one university. Cross-university data access is impossible
  by construction; the codebase is shared, tenant configuration is not.
- Employer companies are Blocks IAM organizations inside the university project.
- Departments are CampusCareer Data records, not IAM organizations.
- The browser uses one `@seliseblocks/client` instance for IAM, permitted Data
  operations, files and the user's notification inbox.
- Privileged workflow commands, scheduled work, AI calls, exports, retention and
  durable notification dispatch run in a server-side worker deployed by Blocks
  Release. Browser code never receives provider credentials.

## Identity

- Students and university staff authenticate with Microsoft Entra through Blocks
  hosted OIDC.
- Employer users use Blocks-hosted email/password accounts and invitations.
- Self-registration always grants only `pending-user`. A verified email-domain
  and matching active `DirectoryRecord` are both required before a privileged
  application role is granted.
- The IAM user ID is the stable user key. Employer authorization also requires
  the active IAM organization ID. Department authorization uses an audited
  department assignment stored in Data.

## Data ownership

- Canonical university records live in the university/default organization.
- Employer organization IDs are explicit fields on employer-owned records. They
  are never accepted as proof of authorization from a request payload.
- Student-owned records carry the verified IAM user ID and department snapshot.
- Stage events, audit events, submitted application snapshots and accreditation
  snapshots are append-only at the domain layer.
- All mutable domain records carry an integer `revision`; updates require the
  expected revision to prevent silent concurrent overwrites.

## Workflow consistency

A UI never writes a lifecycle field directly. Named server-side commands load
trusted actor context, validate the transition, write canonical state and an
immutable event, enqueue deterministic work, and return an idempotent result.
Where Blocks Data cannot provide a multi-record transaction, commands use a
durable command/outbox state machine and repairable partial-failure status.

## Time

- Instants are ISO 8601 UTC `DateTime` values.
- Human deadlines retain an IANA timezone; the initial default is `Asia/Dhaka`.
- Calendar-only values use `YYYY-MM-DD` strings.
- The outcome clock starts only at confirmed `InterviewedAt` and uses tenant
  thresholds 7, 12, 14 and 21 days.

## Files

- CV bytes use the existing `Default` Azure Blocks storage configuration.
- File objects are private and attached to domain records by `fileId` and exact
  version. A new profile upload never rewrites an application snapshot.
- Employer access is granted only in application context and expires 90 days
  after the later of opportunity close or final application outcome.

## AI

- Azure OpenAI is called only by the worker after separate, versioned consent.
- Inputs are produced from immutable application snapshots and exclude identity,
  contact, photo, age, gender, religion, ethnicity, health/disability, family,
  government ID, precise address, socioeconomic data and GPA.
- Output is advisory prose with requirement coverage, gaps, relevant evidence and
  one coaching tip. It never contains a ranking score or changes an application.
- Prompt, model/deployment, input hash, output version, staff review, student flag
  and resolution history are retained and auditable.

## Reliability and observability

- Commands, jobs, AI requests and notifications use deterministic idempotency keys.
- Logs carry correlation IDs but no tokens, raw CV text or unnecessary PII.
- Analytics projections are rebuildable from canonical stage/outcome history.
- The operational view exposes stuck jobs, notification failures, overdue flags,
  unresolved AI flags and export failures.

## Deployment units

1. Static React SPA served by unprivileged Nginx on port 8080.
2. Server-side worker/API for domain commands, scheduling, AI and exports.
3. Blocks tenant configuration managed through reviewed CLI dry-runs.

The concrete worker hosting/scheduler mechanism must be confirmed against the
linked Release repository before worker deployment; no unsupported Release or
scheduler command is assumed.
