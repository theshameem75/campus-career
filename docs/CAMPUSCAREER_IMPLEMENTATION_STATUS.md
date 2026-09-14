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
- IAM-02: application roles and frontend-action permission matrix authored as
  source-controlled manifests; live role creation remains approval-gated.
- DAT-01: existing Blocks-managed Data source confirmed.
- FIL-01: existing `Default` Azure storage configuration confirmed.
- MSG-01: existing `Default` mail configuration confirmed; template/delivery
  validation remains outstanding.
- REL-01: linked GitHub repository, `dev` branch, deployed namespace and last
  successful deployment resolved.

## In progress

- DAT-02 through DAT-08: schema field design, portable JSON and deny-by-default
  access policies.
- WEB-01: singleton Blocks SDK client and build-time environment validation
  implemented.
- WEB-02: hosted-login redirect, callback, cookie-session bootstrap, logout and
  protected route guard implemented; live flow awaits approved OIDC activation.
- WEB-03 through WEB-04: current-user bootstrap, normalized role checks,
  permission-resource helpers, protected action gates and role-aware product
  shell are implemented; per-role browser acceptance tests remain.
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

- npm test: three manifest/model security tests pass.
- npm run lint: passes.
- npm run typecheck: passes.
- npm run build: passes.
- blocks data validate: 36 schemas, zero errors.

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
- Zero custom Data schemas.
- Mail and Azure storage defaults exist.
- No notification-channel configuration.
- English, German and Bengali exist; no localization modules.
- Release repo `theshameem75/campus-career` is linked to `dev`; last deployment
  succeeded at the time of inventory.
