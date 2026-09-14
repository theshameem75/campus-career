# CampusCareer Implementation Status

Updated: 2026-09-14

## Completed

- FND-01: Blocks CLI `0.5.0` verified and the existing project session refreshed.
- FND-02: local Blocks workspace initialized and bound to the CampusCareer project.
- FND-03: live tenant inventory refreshed with sensitive values redacted.
- FND-04: core architecture, identity, data, workflow, time, file, AI and
  deployment conventions recorded.
- FND-06: GitHub Actions quality gate added for deterministic schema generation,
  manifest tests, lint, typecheck and production build.
- DAT-02 through DAT-06: all 36 schema definitions and fields are generated,
  deterministic, locally validated and deployed to Blocks Data.
- DAT-07: every schema remains locked to Custom access for READ, WRITE, EDIT and
  DELETE. A reviewed set of 201 organization-and-role-scoped allow policies is
  deployed for READ, WRITE and EDIT; DELETE remains denied for every role.
- DAT-09: an idempotent linked demo dataset is live across all 36 schemas. It
  includes five opportunities, three applications, role assignments, profile
  data, workflow history, follow-ups, AI explanations, notifications, audit
  events and reporting records.
- IAM-02: application roles and frontend-action permission matrix are
  source-controlled; the reviewed roles and assignments are live.
- DAT-01: existing Blocks-managed Data source confirmed.
- FIL-01: existing `Default` Azure storage configuration confirmed.
- MSG-01: existing `Default` mail configuration confirmed; template/delivery
  validation remains outstanding.
- REL-01: linked GitHub repository, `dev` branch, deployed namespace and last
  successful deployment resolved.

## In progress

- DAT-08: field-level value validation remains after the secure schema baseline.
- Data-backed opportunity and application views are enabled through reviewed
  scoped policies; remaining workflow CRUD screens are still in progress.
- WEB-01: singleton Blocks SDK client and build-time environment validation
  implemented.
- WEB-02: hosted-login redirect, callback, cookie-session bootstrap, logout and
  protected route guard are implemented, and the deployed OIDC client is
  configured; browser acceptance automation remains.
- WEB-03 through WEB-04: current-user bootstrap, normalized role checks,
  permission-resource helpers, protected action gates and role-aware product
  shell are implemented. Live SDK checks now cover student, employer, staff and
  manager data visibility; full browser acceptance automation remains.
- WEB-05 through WEB-06: shared operational states and end-to-end HTTPS login
  verification remain.
- IAM-03: 22 custom FrontendAction permissions and eight application roles
  created. All 53 reviewed role-permission additions were applied and verified
  by resource slug with zero mismatches.
- IAM-04: multi-organization support enabled with Cloud-only organization
  creation; signup, portal and Construct organization creation remain disabled.
- IAM-05: email/password and SSO registration enabled with only pending-user and
  no default permissions.
- IAM-06: public PKCE CampusCareer Web client created for the exact HTTPS
  development and deployed callbacks; public client ID recorded in the
  frontend environment example. The credential-shaped value returned during
  verification was rotated without printing or storing its replacement.
- IAM-07: linked Blocks OIDC provider created and its discovery endpoints
  verified. Microsoft Entra remains blocked on university-owned inputs.

## Validation evidence

- npm test: four manifest/model security tests pass.
- npm run lint: passes.
- npm run typecheck: passes.
- npm run build: passes.
- blocks data validate: 36 schemas, zero errors.
- Secure Data generation and deployment: 144 Custom operation settings plus
  201 role-and-organization-scoped allow policies across 36 schemas.
- Live Blocks aggregation: 36 schemas; READ, WRITE, EDIT and DELETE each report
  36 Custom, zero Public and zero User access; 144 total Custom permissions.
- Live role checks: student sees three published opportunities and three owned
  applications; employer sees five owned opportunities and three applications;
  staff sees five opportunities and three applications; manager sees all five
  opportunities, all three applications and the demo student profile.
- Negative checks pass: employer cannot read StudentProfile, student cannot read
  FollowUpFlag, and anonymous users cannot read Opportunity.
- The demo seed completed 90 idempotent upsert operations across all 36 schemas
  (87 distinct records because each of three applications is created and then
  updated with its linked snapshots).

## External inputs required before production

- Microsoft Entra tenant, application registration/client secret, verified
  university domains and approved claim mapping.
- University legal/privacy approval.
- Azure OpenAI region, deployment, enterprise data terms, quota and budget.
- Accreditation PDF template and authoritative graduating-student denominator.
- Contracted Blocks SLA/support validation and worker scheduling mechanism.

## Live baseline

- OIDC enabled with one public PKCE client and linked Blocks provider.
- Signup enabled for email/password and SSO; new users receive only pending-user.
- Multi-organization enabled with Cloud-only organization creation.
- Eight CampusCareer roles and 22 custom FrontendAction permissions now exist;
  all 53 reviewed role-permission additions are applied.
- 36 custom Data schemas are live with all 144 schema-operation permissions set
  to Custom, zero Public/User permissions and 201 scoped allow policies.
- DELETE has no allow policy. Anonymous access remains denied.
- A linked demo dataset spans every schema, with five opportunities and three
  applications visible according to the four demo users' assigned roles.
- Mail and Azure storage defaults exist.
- No notification-channel configuration.
- English, German and Bengali exist; no localization modules.
- Release repo `theshameem75/campus-career` is linked to `dev`; last deployment
  succeeded at the time of inventory.
