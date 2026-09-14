# CampusCareer Product Requirements

## 1. Document purpose

This document translates the source brief, `09-CampusCareer.pdf`, into an
implementation-ready product specification for a university internship and
placement hub built with SELISE Blocks services.

Requirement language:

- **Must**: explicitly required by the source brief or necessary to satisfy it.
- **Should**: derived requirement that supports the stated outcome.
- **Could**: enhancement that may be deferred.
- **Open**: requires a product, policy, or technical decision before implementation.

## 2. Product summary

CampusCareer will replace scattered forms, email forwarding, and manual
placement reporting with one controlled workflow shared by students, employers,
career-services staff, and university stakeholders.

The product must let employers publish structured opportunities, let students
apply using a reusable profile, let staff screen candidates, make employers
report outcomes, expose every application stage to the relevant student, flag
stalled employer responses, and continuously calculate placement performance.

The defining outcome is that career services can answer from one screen:

> Which employers convert, which departments place, and which students are
> stuck in silence right now?

## 3. Background and problem statement

The initial institution is a private university with CSE, BBA, and EEE
departments, approximately 1,200 graduates per year, four career-services staff,
and more than 200 employer relationships.

Current problems:

1. Applications have no canonical record; CVs and statuses are spread across
   forms, inboxes, and forwarded email.
2. Employers receive large, unscreened applicant pools and may stop posting
   after a disorganized season.
3. Students apply without knowing whether they are eligible or where they stand.
4. Career staff spend time forwarding CVs and reconstructing status rather than
   coaching students.
5. Employers do not provide a reliable structured outcome loop.
6. Placement statistics are assembled manually, late, and incompletely.
7. Poor measurement creates accreditation and ranking risk.

## 4. Goals and success outcomes

### 4.1 Product goals

- Establish one authoritative application record and history.
- Improve opportunity relevance and application quality.
- Give students transparent, timely status visibility.
- Give employers structured applicant records with visible screening status and
  a structured outcome workflow.
- Give staff a prioritized view of screening work and stalled cases.
- Produce continuous placement analytics by department and employer.
- Make AI assistance explainable, reviewable, and visible to the affected student.
- Protect student data through contextual, least-privilege access.

### 4.2 MVP success measures and targets

- At least 90% of interviewed applications receive an employer outcome within
  14 calendar days.
- At least 90% of submitted applications receive a first staff decision within
  five business days.
- Median calendar time from submission to first confirmed interview is under
  14 days.
- Application-to-shortlist, shortlist-to-interview, interview-to-offer, and
  offer-to-hire conversion are available by department and employer.
- Verified placement rate is available by department and graduating cohort.
- Employer conversion, outcome timeliness, and repeat-posting rate are visible.
- Current stalled cases and their age are available without manual reconciliation.
- At least 95% of student-raised AI explanation flags are resolved within five
  business days.
- An authorized accreditation summary can be generated in under one hour.

Targets should be reviewed after the first full placement cycle without changing
the metric definitions or historical snapshots.

## 5. Users and responsibilities

| Actor                  | Primary needs                                                                                                                        | Expected authority                                                   |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Student                | Maintain one profile/CV, discover suitable opportunities, apply, see status history and AI explanations, flag incorrect explanations | Own profile and own applications only                                |
| Employer user          | Manage their organization's opportunities, review applicants to those opportunities, report interviews/offers/hires                  | Own employer organization and all applicants to its postings only    |
| Career staff           | Review opportunities and applications, screen and shortlist, reject kindly, monitor silence, and coach students                      | Cross-department operational access as authorized                    |
| Career manager         | Supervise career operations and maintain approved reference data and communication templates                                         | Career-staff authority plus limited configuration management         |
| Department stakeholder | Monitor students and placement performance for their department                                                                      | Named students in their own department; no unrelated department data |
| University stakeholder | Accreditation and institution-level placement reporting                                                                              | Aggregate reporting by default                                       |
| University superadmin  | Verify employers, provision employer organizations/users, and administer access                                                      | Restricted administration within one university tenant               |

## 6. Scope

### 6.1 MVP scope

The MVP supports internships only. The shared `Opportunity` model must include
an extensible opportunity type so graduate jobs/placements can be added later
without redesigning applications, screening, outcomes, or analytics.

The product supports multiple universities through isolated deployments. Each
university uses a separate Blocks project/tenant with the same application
codebase and university-specific configuration.

1. Role-based sign-in and access control.
2. Student profile and CV/document management.
3. Employer and employer-user management.
4. Structured opportunity creation, publication, and closure.
5. Student opportunity discovery and application.
6. Staff screening, shortlisting, and rejection with a recorded reason.
7. Employer interview, offer, and hire outcome reporting.
8. Complete student-visible application timeline.
9. Stalled-outcome detection and staff follow-up queue.
10. Live placement and funnel analytics.
11. Plain-language AI match explanations with staff review and student flagging.
12. Email and in-app/real-time notifications for agreed workflow events.
13. Auditability of material workflow and access-sensitive changes.

### 6.2 Enhancement scope

- Graduate jobs and placement opportunities using the shared opportunity lifecycle.
- Cross-application AI coaching digest for staff.
- Advanced accreditation exports and scheduled reports.
- Employer health and retention analytics.
- Configurable screening rubrics and reusable rejection templates.
- Multilingual UI and notification content.
- Integrations with student information, alumni, or learning systems.

### 6.3 Out of scope unless later approved

- Graduate jobs/placements in the first MVP release.
- A general employer-facing directory of students.
- Automated hiring decisions or opaque AI ranking.
- Payroll, stipend disbursement, attendance, or internship timesheets.
- Full applicant-tracking-system functionality after hiring.
- Public job-board syndication.

## 7. Core workflows

### 7.1 Employer posts an opportunity

1. An authorized employer user creates a draft opportunity.
2. The user supplies title, description, requirements, required/preferred skills,
   eligible departments, stipend, number of slots, deadline, and other approved fields.
3. Career staff review and approve the opportunity before publication.
4. The opportunity is published and becomes discoverable by eligible students.
5. The employer may edit or close it under defined rules, while historical
   applications retain the terms under which students applied.

### 7.2 Student applies

1. The student completes a reusable profile and uploads/selects a CV.
2. The student browses or searches published opportunities.
3. Eligibility and deadline rules are enforced.
4. The product generates or retrieves a plain-language match explanation.
5. The student reviews the opportunity and submits one application.
6. A canonical application record and initial timeline event are created.
7. The student receives confirmation and can track all later stage changes.

### 7.3 Staff screens applications

1. Staff view a structured queue rather than forwarded CVs.
2. Staff review the profile, CV, opportunity requirements, and AI explanation.
3. Staff record a screening decision and, where applicable, rubric/notes.
4. Shortlisted applications become available to the relevant employer.
5. Rejected applications receive a respectful, recorded reason visible according
   to the agreed transparency policy.
6. Every decision creates an auditable stage-history event and notification.

### 7.4 Employer reports outcomes

1. The employer reviews only applicants to its own postings.
2. The employer records interviewed, offered, hired, and any approved terminal outcomes.
3. Stage changes update the application timeline and analytics.
4. If an expected outcome is not reported within the agreed interval, the case
   becomes overdue and appears in the staff follow-up queue.
5. Staff can record follow-up attempts and escalate.
6. The overdue flag clears or resolves when an acceptable outcome is recorded.

### 7.5 Staff coaches stalled students

1. Staff see students or applications with prolonged inactivity.
2. The enhancement flow scans a student's applications and produces a short,
   explainable coaching digest.
3. The digest states which applications are stalled, likely reasons grounded in
   available data, and a suggested next action.
4. Staff review the digest before acting; it does not directly change an application.

### 7.6 Placement reporting

1. Authorized stakeholders open a live dashboard.
2. They filter by academic period, cohort, department, employer, opportunity, and
   outcome where approved.
3. The dashboard shows placements, employer and department performance, funnel
   conversion, median days to first interview, and stalled cases.
4. Reported hires update the dashboard without a manual phone-call census.

## 8. Functional requirements

### 8.1 Identity and access

- **IAM-01 Must:** Support distinct student, employer, career-staff, department,
  university, and administrator permissions.
- **IAM-02 Must:** An employer can access only its own organization, postings,
  and applicants to those postings.
- **IAM-03 Must:** A student can access only their own profile, applications,
  timeline, outcomes, and AI explanations.
- **IAM-04 Must:** Student profiles cannot be exposed as a browsable employer database.
- **IAM-05 Must:** Staff and reporting access must be explicitly permissioned,
  not inferred only from role names in the frontend.
- **IAM-06 Must:** Server-side data policies must enforce isolation; hidden
  navigation alone is not a security boundary.
- **IAM-07 Should:** Material access and role changes should be audited.
- **IAM-08 Must:** Each university is isolated in its own Blocks project/tenant;
  no university can query another university's records.
- **IAM-09 Must:** Departments are Data records within a university tenant.
- **IAM-10 Must:** A department stakeholder can see named students only within
  their own department and only the fields required for placement support.
- **IAM-11 Must:** Employer organizations are Blocks IAM organizations within
  the university tenant.
- **IAM-12 Must:** University superadmins create and verify employer
  organizations and provision or invite employer users.
- **IAM-13 Must:** Student and staff accounts support self-registration subject
  to verified university email domains and a matching student/staff directory record.
- **IAM-14 Must:** Self-registration creates only a pending/least-privilege
  account. Student, staff, department, manager, or admin authority is granted
  only after verification; a claimed email or role is not sufficient.

### 8.2 Student profile and documents

- **STU-01 Must:** A student maintains one reusable profile.
- **STU-02 Must:** The profile supports department, graduation year/cohort,
  skills, projects, experience, and approved contact fields.
- **STU-03 Must:** A student can upload and manage multiple CVs and select one
  for each application.
- **STU-04 Must:** An application retains which profile/CV version was
  submitted so later edits do not rewrite application history.
- **STU-05 Should:** Profile completeness and missing required information should
  be visible before application submission.

### 8.3 Employer and opportunities

- **EMP-01 Must:** Employer users belong to an employer organization.
- **EMP-02 Must:** Authorized users can create and manage structured opportunities.
- **EMP-03 Must:** Opportunity data includes skills, eligible departments,
  stipend, slots, deadline, and descriptive requirements.
- **EMP-04 Must:** Only staff-approved, published, open, and eligible
  opportunities accept applications.
- **EMP-05 Must:** Employers can see all applicants to their own postings, with
  each applicant's screening and shortlist state clearly identified.
- **EMP-06 Must:** Employers record structured interview, offer, and hire outcomes.
- **EMP-07 Should:** The system tracks employer response timeliness and follow-up history.
- **EMP-08 Must:** Opportunity type is stored as extensible reference data. The
  MVP permits only `Internship`, while later types reuse the same core workflow.

### 8.4 Applications and screening

- **APP-01 Must:** Each submission has one canonical application record.
- **APP-02 Must:** Duplicate applications by the same student to the same
  opportunity are prevented. A Career Manager may reopen the existing
  application with an audited reason; no second canonical record is created.
- **APP-03 Must:** Every stage change records the prior stage, new stage,
  timestamp, actor, and reason/notes where required.
- **APP-04 Must:** The student sees their application journey and each visible
  stage change in chronological order.
- **APP-05 Must:** Staff can shortlist using structured information.
- **APP-06 Must:** Rejection requires a respectful recorded reason.
- **APP-07 Must:** Allowed transitions and actors are enforced server-side.
- **APP-08 Should:** Staff can filter queues by department, opportunity,
  employer, stage, age, and overdue state.
- **APP-09 Should:** Concurrency controls should prevent one reviewer from
  silently overwriting another review.

### 8.5 Outcome follow-up

- **OUT-01 Must:** Missing employer outcomes become visible to staff 14 calendar
  days after the confirmed interview event.
- **OUT-02 Must:** Staff can see flag age, responsible employer/opportunity,
  affected applications, and suggested follow-up action.
- **OUT-03 Must:** Staff can record follow-up attempts and resolution.
- **OUT-04 Must:** A reported hire updates the application and placement analytics.
- **OUT-05 Must:** Reminder and escalation timing is tenant-configurable, using
  days 7, 12, 14, and 21 as the initial defaults.

### 8.6 AI match explanations

- **AI-01 Must:** Compare a student profile with one opportunity and generate a
  plain-language explanation.
- **AI-02 Must:** The explanation identifies covered requirements, missing
  requirements, the most relevant project/experience, and one concrete coaching tip.
- **AI-03 Must:** The explanation uses words rather than an opaque numeric score.
- **AI-04 Must:** Staff can review the explanation before or during shortlisting.
- **AI-05 Must:** The affected student can see what was said about them.
- **AI-06 Must:** The student can flag an explanation as inaccurate or unfair.
- **AI-07 Must:** AI output is advisory and cannot independently reject,
  shortlist, offer, or hire.
- **AI-08 Must:** Inputs, model/provider metadata, output, review state, flags,
  and resolution are audited under the approved retention controls.
- **AI-09 Could:** Generate a staff coaching digest across all of a student's
  applications, highlighting silence and suggesting next actions.

### 8.7 Notifications

- **NOT-01 Must:** Students are notified of material application stage changes.
- **NOT-02 Must:** Staff are notified or queued when employer outcomes become overdue.
- **NOT-03 Must:** Employers receive outcome reminders on days 7 and 12 and an
  overdue notice on day 14 after the confirmed interview event.
- **NOT-04 Should:** Rejection communication uses approved, respectful content.
- **NOT-05 Must:** Delivery attempts and failures are observable.
- **NOT-06 Must:** Apply the notification matrix and preference rules in the
  decision register: material decisions use email plus in-app delivery, overdue
  operations use immediate in-app alerts plus digest/escalation email, and
  transactional messages cannot be disabled.

### 8.8 Analytics and reporting

- **AN-01 Must:** Show placements by department.
- **AN-02 Must:** Show placements and conversion by employer.
- **AN-03 Must:** Show funnel counts and conversion rates across agreed stages.
- **AN-04 Must:** Show median days to first interview.
- **AN-05 Must:** Show students/applications currently stalled in silence.
- **AN-06 Must:** Metrics update from canonical workflow data without a manual census.
- **AN-07 Must:** Support filters for academic period, cohort, department,
  employer, opportunity, and outcome.
- **AN-08 Must:** Use the denominators defined in the decision register and
  exclude test records and records deleted/anonymized under policy.
- **AN-09 Must:** Export authorized detail as CSV and accreditation summaries as PDF.
- **AN-10 Must:** Submitted accreditation reports create immutable, versioned
  metric snapshots; corrections create a later version.

## 9. Lifecycle and business rules

Opportunity lifecycle:

`Draft -> PendingApproval -> Published -> Closed/Cancelled`

Application lifecycle:

`Submitted -> UnderReview -> Shortlisted -> InterviewScheduled -> Interviewed -> Offered -> Hired`

Terminal alternatives are `Rejected`, `Withdrawn`, `NotSelected`,
`OfferDeclined`, and `Expired`.

Rules:

1. Students create `Submitted` applications only for staff-approved,
   published opportunities before the configured deadline.
2. Career Staff move applications through review, shortlist, rejection, and expiry.
3. Employers manage interview, offer, hire, and not-selected outcomes for their
   own postings; Career Staff cannot overwrite those outcomes in the MVP.
4. Every transition creates an immutable history event.
5. Rejection requires an approved reason; internal and student-visible text may
   be separate if policy requires.
6. A `Hired` outcome is a reported hire until Career Staff verifies it. Only a
   verified primary placement counts in the headline placement rate.
7. Overdue status is derived rather than replacing the application stage.
8. Closing an opportunity stops new applications but does not remove existing history.

## 10. Canonical information model

These entities are the approved starting model. Detailed Blocks field types,
indexes, validation expressions, and policies will be finalized during schema design.

| Entity                 | Purpose                                                          | Important relationships                |
| ---------------------- | ---------------------------------------------------------------- | -------------------------------------- |
| Department             | CSE, BBA, EEE, and future academic units                         | Students, opportunities, analytics     |
| StudentProfile         | Reusable student identity and career profile                     | IAM user, department, documents        |
| StudentExperience      | Projects, employment, certifications, or portfolio evidence      | StudentProfile                         |
| Employer               | Data profile for a Blocks IAM employer organization              | IAM organization, users, opportunities |
| EmployerMembership     | Application projection of authorized IAM organization membership | Employer, IAM user                     |
| Opportunity            | Structured internship/job posting and requirements               | Employer, eligible departments         |
| OpportunitySkill       | Required/preferred skill definition                              | Opportunity, skill catalog             |
| Application            | Canonical student submission to one opportunity                  | StudentProfile, Opportunity            |
| ApplicationDocument    | Snapshot/reference to the CV used for an application             | Application, stored file               |
| ApplicationStageEvent  | Immutable journey event with actor, time, reason, and visibility | Application                            |
| ScreeningDecision      | Structured staff review, shortlist/reject decision, and reason   | Application, staff user                |
| EmployerOutcome        | Interview, offer, hire, or other agreed outcome details          | Application, employer user             |
| FollowUpFlag           | Derived or persisted overdue outcome and resolution data         | Application/Opportunity/Employer       |
| FollowUpActivity       | Staff reminder, contact, escalation, and resolution history      | FollowUpFlag                           |
| MatchExplanation       | Versioned AI explanation and its source snapshot                 | Application or Student+Opportunity     |
| ExplanationFlag        | Student concern, category, comment, review, and resolution       | MatchExplanation                       |
| CoachingDigest         | Staff-reviewed cross-application AI coaching output              | StudentProfile, applications           |
| NotificationPreference | Allowed channels and preferences where applicable                | IAM user                               |
| AuditEvent             | Sensitive administrative and workflow change record              | Actor and affected entity              |

Reference data may include skills, application stages, outcome types, rejection
reasons, flag categories, academic periods, and notification templates.

## 11. Authorization model

| Resource/action            | Student          | Employer user                       | Career staff/manager                | Department stakeholder                    | Superadmin |
| -------------------------- | ---------------- | ----------------------------------- | ----------------------------------- | ----------------------------------------- | ---------- |
| Own student profile and CV | Manage           | No                                  | Read as operationally authorized    | Read own-department approved fields       | Restricted |
| Browse student directory   | No               | No                                  | Authorized operational scope        | Own department only                       | Restricted |
| Published opportunities    | Read             | Own/manage drafts                   | Review/approve/manage               | Read                                      | Admin      |
| Submit application         | Own              | No                                  | No                                  | No                                        | No         |
| View application/profile   | Own              | All applicants to own postings only | Authorized operational scope        | Own-department approved fields only       | Restricted |
| Screening/shortlisting     | No               | Read status                         | Manage                              | No                                        | Restricted |
| Employer outcomes          | Read own         | Manage own posting                  | Read; no direct override in MVP     | Aggregate or approved own-department view | Restricted |
| AI explanation             | Read/flag own    | No by default                       | Read/review                         | No by default                             | Restricted |
| Operational analytics      | Own summary only | Own employer                        | Authorized university scope         | Own department                            | Full       |
| Reference data/templates   | No               | No                                  | Career manager manages; staff reads | No                                        | Manage     |
| Access administration      | No               | No                                  | No                                  | No                                        | Manage     |

Data Gateway policies and IAM permissions must enforce this matrix.

## 12. SELISE Blocks service mapping

| Capability                          | Blocks service/surface                                             | Intended use                                                        |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Sign-in and sessions                | IAM/OIDC                                                           | Separate authenticated experiences and hosted login                 |
| Users, roles, permissions           | IAM users and access control                                       | Role/permission assignments and server-authoritative feature access |
| University boundary                 | Separate Blocks project/tenant per university                      | Hard university isolation with one shared application codebase      |
| Employer boundary                   | IAM organizations plus an Employer Data profile                    | Employer membership and active-organization isolation               |
| Department boundary                 | Data records and access policies                                   | Department membership, filtering, and reporting within a university |
| Domain records and policies         | Data Gateway schemas, validation, and access policies              | Opportunities, applications, history, AI records, and isolation     |
| Frontend record access              | `@seliseblocks/client` Data SDK                                    | Typed CRUD/query access through one shared Blocks client            |
| CVs and documents                   | Blocks Data file/object APIs with configured Azure storage         | Upload, version/reference, download, and access control             |
| Transactional email                 | Blocks Mail                                                        | Confirmations, respectful rejection, reminders, and escalation      |
| Real-time/inbox notifications       | Blocks Notifier                                                    | Student stage updates and staff overdue alerts                      |
| Notification channel administration | Blocks Notification                                                | Configure channels where required                                   |
| Languages and UI text               | Blocks Localization                                                | Available if multilingual scope is approved                         |
| Deployment                          | Blocks Release                                                     | Build/deploy pipeline and operational visibility                    |
| Analytics                           | Data Gateway queries plus application-side/server-side aggregation | Continuous dashboards from canonical records                        |
| AI generation                       | Server-side Azure OpenAI worker plus Blocks Data                   | Minimized inference, governed storage, audit, and scheduled digests |

Implementation must use the Blocks CLI for platform configuration and
`@seliseblocks/client` for application access. It must not call Blocks APIs
through ad hoc raw HTTP.

## 13. Current Blocks project baseline

Inventory observed before implementation:

- Project: CampusCareer, development tenant
  `D8fb34a0fb75740f0b8a479a550807393`.
- Application domain: `https://dbfvug-elgew.slsblx.com`.
- OIDC: disabled; no public OIDC client and no identity provider.
- IAM: zero end users; only the existing `System User` role was returned.
- Data: data source configured; zero custom schemas.
- Mail: default mail configuration exists.
- Storage: default Azure storage configuration exists.
- Localization: English, German, and Bengali languages exist; no modules.
- Release repository/build context was not resolved.

Consequences:

1. Login and role design must precede an authenticated production workflow.
2. All domain schemas and policies remain to be designed and deployed.
3. Existing mail/storage foundations can be reused after configuration is validated.
4. Localization content is optional until product language scope is confirmed.

## 14. Non-functional requirements

### 14.1 Security and privacy

- Enforce least privilege and deny access by default.
- Treat profiles, CVs, application history, and AI explanations as personal data.
- Never expose credentials or secrets in frontend variables or source control.
- Encrypt data in transit and rely on approved Blocks storage mechanisms at rest.
- Record security-relevant and material workflow changes.
- Define retention, deletion, export, and legal-basis/consent policies.
- Test cross-employer and cross-student isolation explicitly.

### 14.2 Fairness and AI governance

- Do not use protected characteristics as matching factors unless a lawful,
  reviewed requirement explicitly permits them.
- Do not present an unexplained ranking or score.
- Preserve human responsibility for screening and hiring decisions.
- Let students inspect and challenge explanations about them.
- Define review and remediation for flagged output.
- Monitor output quality and bias across departments and relevant cohorts.

### 14.3 Performance and reliability

- Support at least 1,200 graduates/year, 200+ employers, four career staff, 500
  concurrent student sessions, 100 concurrent employer/staff sessions, and a
  tested seasonal submission burst of 50 requests/second.
- Paginate and filter applicant, opportunity, and reporting lists.
- Make repeated commands/events idempotent where duplicate processing is possible.
- Ensure analytics can be rebuilt from canonical application history.
- Detect and surface failed notification, AI, or scheduled follow-up processing.

### 14.4 Usability and accessibility

- Responsive student, employer, and staff workflows.
- Keyboard-accessible controls, visible focus, semantic forms, and meaningful errors.
- Target WCAG 2.1 AA unless the university specifies a newer standard.
- Empty, loading, error, unauthorized, and offline/degraded states must be explicit.
- Status and rejection language must be clear, respectful, and non-technical.

### 14.5 Audit and observability

- Correlate important workflow changes with actor and timestamp.
- Log operational failures without logging CV content, tokens, or unnecessary PII.
- Provide staff visibility into overdue jobs, notification failures, and AI flags.
- Define monitoring, backup, recovery objectives, and support ownership.

## 15. Acceptance criteria

The MVP is acceptable when:

1. A self-registered user cannot gain student, staff, department, employer, or
   administrative access until the applicable university verification completes.
2. A student can sign in, complete one profile, attach a CV, apply to an eligible
   open opportunity, and see a complete timeline.
3. A second student cannot access the first student's profile, application, or AI output.
4. One university tenant cannot access another university tenant's data.
5. Employer A can see all applicants to its own postings but cannot access
   Employer B's postings, applicants, or the general student population.
6. An opportunity cannot be published until career staff approves it.
7. Staff can review applications, shortlist candidates, and reject a candidate
   only after recording an approved respectful reason.
8. An employer can record and correct interview, offer, and hire outcomes for
   its own posting with audit history; career staff cannot overwrite them.
9. Missing outcomes cross the configured threshold and appear in a staff queue
   with age and follow-up context.
10. A hire updates department, employer, funnel, and time-based analytics.
11. The AI explanation states covered skills, gaps, relevant experience, and one
    coaching tip without an unexplained score.
12. Staff can review the explanation, the student can view it, and the student can
    flag it for correction.
13. Email/in-app notifications follow the agreed event matrix, and failures are visible.
14. Access-isolation, lifecycle-transition, analytics, and AI-transparency tests pass.

## 16. Required demo scenario

The scripted demo must show:

1. Brain Station 23 posts a three-slot React internship.
2. Three students apply.
3. Each receives a plain-language match explanation.
4. Career staff review the explanations and shortlist two students.
5. Staff reject the third with a kind, recorded reason.
6. The rejected student's timeline visibly reflects the decision.
7. The employer records interviews but then reports no outcome for the agreed period.
8. An overdue-outcome flag appears for staff.
9. Staff records escalation/follow-up.
10. The employer marks a candidate as hired.
11. The live placement dashboard updates.
12. The demo closes on department/employer analytics suitable for the previously
    manual accreditation report.

## 17. Decision register and production validation gates

### 17.1 Resolved decisions

| Original question                 | Resolved decision                                                                                                                                                                                                      | Resolution                               |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------- |
| 1. Initial opportunity scope      | MVP supports internships only. The shared opportunity model includes a type discriminator and reusable lifecycle so graduate jobs can be added without redesign.                                                       | Confirmed                                |
| 2. University tenancy             | Multiple universities are supported. Recommended architecture adopted: one Blocks project/tenant per university, using the same codebase and per-university deployment configuration.                                  | Answer refined into a technical decision |
| 3. Department representation      | Departments are Data records inside a university tenant and are used for profile relationships, policies, filtering, and analytics.                                                                                    | Confirmed                                |
| 4. Employer representation        | Each employer is a Blocks IAM organization within one university tenant, with a linked Employer Data profile for domain fields and reporting.                                                                          | Confirmed and clarified                  |
| 5. Employer provisioning          | A university superadmin creates/verifies employer organizations and provisions or invites employer users.                                                                                                              | Confirmed                                |
| 6. Opportunity publication        | Career staff approval is mandatory before an opportunity can be published.                                                                                                                                             | Confirmed                                |
| 7. Authentication protocol        | Blocks hosted OIDC is used. Students/staff authenticate through university Microsoft Entra ID with verified-directory activation; invited employer users use Blocks-hosted email/password.                             | Resolved with recommended default        |
| 8. Student/staff provisioning     | Students and staff self-register. A university verification mechanism is required before privileged access is granted.                                                                                                 | Confirmed with required safeguard        |
| 9. Department visibility          | Department stakeholders can see named students in their own department only, limited to fields needed for placement support. Other departments remain inaccessible.                                                    | Answer narrowed for least privilege      |
| 10. Employer applicant visibility | Employer users can see all applicants to their own postings, including screening/shortlist state. They cannot browse students outside those applications.                                                              | Confirmed                                |
| 11. Outcome override              | Career staff cannot directly override employer outcomes in the MVP. Employers may correct their own outcome with audit history; staff may request correction and record follow-up.                                     | Confirmed with correction path           |
| 12. Configuration administration  | Recommended least-privilege split adopted: Career Managers manage approved reference data and communication templates; ordinary Career Staff use them operationally; university superadmins manage roles and policies. | Answer refined                           |

These resolutions have been propagated into the scope, requirements,
authorization matrix, service mapping, assumptions, and delivery sequence.

### 17.2 Identity-provider and registration defaults

| Original question              | Adopted decision                                                                                                                                                                                                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 7. Provider and sign-in method | Students and staff use university Microsoft Entra ID through Blocks hosted OIDC. Just-in-time self-registration is limited to verified university domains and must match a university student/staff record before role activation. Employer users use Blocks-hosted email/password accounts created by superadmin invitation. Additional Google/social providers are deferred. |

### 17.3 Student and opportunity data defaults

| Original question                 | Adopted decision                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 13. Student fields                | Required: IAM user, university student ID, legal/display name, institutional email, department, program, expected graduation term/year, skill selections, profile summary, and at least one CV. Optional: phone, city, portfolio, LinkedIn/GitHub, projects, experience, certifications, languages, work-mode preference, and GPA when the university permits it. Protected traits, government ID, religion, health/disability data, family status, and photographs are prohibited from matching data unless a separately approved lawful process requires them. |
| 14. Skill taxonomy                | Use a normalized Skill reference schema with aliases. Career Managers maintain it; ordinary users may suggest additions that require manager approval.                                                                                                                                                                                                                                                                                                                                                                                                           |
| 15. CV versions                   | Students may maintain multiple CVs and choose one per application. The selected version is snapshotted/referenced immutably on submission.                                                                                                                                                                                                                                                                                                                                                                                                                       |
| 16. Eligibility                   | Opportunities may restrict department/program, graduation cohort, required skills, and lawful work eligibility. GPA or completed-credit thresholds are optional, must be explicit, and require university approval. Prior placement does not automatically block a student; the university may configure a one-active-placement rule.                                                                                                                                                                                                                            |
| 17. Withdraw/edit/resubmit        | Students may withdraw any non-terminal application. Submitted applications cannot be edited; profile changes affect future applications only. Resubmission to the same opportunity is blocked unless Career Staff explicitly reopen the withdrawn/rejected application with an audited reason.                                                                                                                                                                                                                                                                   |
| 18. Deadlines                     | Each university configures one IANA timezone; the initial tenant uses `Asia/Dhaka`. Store timestamps in UTC and display in university time. Submission must finish before the deadline; an unfinished draft does not reserve eligibility after closing.                                                                                                                                                                                                                                                                                                          |
| 19. Structured opportunity fields | Store stipend currency, minimum/maximum amount, frequency, paid/unpaid status, work mode, city/location, duration, weekly hours, start date, and slot count as structured fields. BDT is the initial default currency, not a hard-coded global value.                                                                                                                                                                                                                                                                                                            |

### 17.4 Workflow and communication defaults

| Original question         | Adopted decision                                                                                                                                                                                                                                                                                                                                                |
| ------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 20. Lifecycle             | Opportunity: `Draft -> PendingApproval -> Published -> Closed/Cancelled`. Application: `Submitted -> UnderReview -> Shortlisted -> InterviewScheduled -> Interviewed -> Offered -> Hired`, with terminal alternatives `Rejected`, `Withdrawn`, `NotSelected`, `OfferDeclined`, and `Expired`.                                                                   |
| 21. Transition authority  | Student: submit/withdraw. Employer: draft opportunity, schedule/record interview, offer, hire, not-select, and correct its own outcomes. Career Staff: approve opportunity, begin review, shortlist, reject, expire, and record follow-up. Career Manager: exceptional reopen/correction approval. System: deadline closure, reminders, and overdue flags only. |
| 22. Screening rubric      | Use a configurable rubric with requirement fit, skill evidence, experience/project relevance, availability, and staff recommendation. Staff scores and notes are internal. Students see stage, approved rejection explanation, AI explanation, and their own submitted data—not internal deliberation.                                                          |
| 23. Rejection reasons     | Require a manager-maintained reason category plus an editable respectful template. Store internal notes separately; only approved candidate-facing text is shown/sent.                                                                                                                                                                                          |
| 24. Silence clock         | The outcome clock starts at the actual `Interviewed` timestamp, or the scheduled interview end when staff confirms attendance. It resets only when the employer records Offered, Hired, NotSelected, or a rescheduled interview.                                                                                                                                |
| 25. Reminder sequence     | Employer reminder on day 7, stronger reminder on day 12, overdue staff flag on day 14, and Career Manager escalation on day 21. All thresholds are tenant-configurable.                                                                                                                                                                                         |
| 26. Notification channels | Submission and material student stage changes: email plus in-app. Employer approval/rejection of postings and outcome reminders: email plus in-app. Staff overdue/escalation events: in-app immediately and daily email digest. Draft saves, internal notes, and analytics refreshes send no notification.                                                      |
| 27. Preferences           | Users may disable optional digests and coaching notifications. Security, account, application-decision, deadline, and employer-outcome messages are transactional and cannot be disabled, though users may choose among available delivery channels where policy permits.                                                                                       |

### 17.5 Placement analytics defaults

| Original question           | Adopted decision                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28. Placement definition    | An employer-reported `Hired` outcome becomes an official placement only after Career Staff verifies it. Until then it appears as `Reported hire - pending verification`.                                                                                                                                                                                                                             |
| 29. Multiple outcomes       | Track every offer and employer outcome. Count a student once in the headline placement rate per academic cycle; if multiple verified hires exist, Career Staff identifies one primary placement while retaining all outcomes for employer analytics.                                                                                                                                                 |
| 30. Cohort ownership        | Student cohort is the expected graduation academic year/term snapshotted at application time. Placement date also maps to a reporting period, allowing cohort and period analysis independently.                                                                                                                                                                                                     |
| 31. Denominators            | Department placement rate = unique students with a verified primary placement / eligible graduating students in that department and cohort. Stage conversion = unique applications reaching the next stage / unique applications reaching the prior stage. Employer hire conversion = verified hires / applications to that employer, with shortlist-to-hire and interview-to-hire shown separately. |
| 32. Time to first interview | Calendar duration from application `SubmittedAt` to the earliest confirmed `InterviewedAt`; cancelled/no-show interviews do not count. Also retain business-day computation for future reporting without using it in the MVP headline.                                                                                                                                                               |
| 33. Filters and exports     | Filters: university tenant, academic period, cohort, department, employer, opportunity, work mode, stage/outcome, and overdue state. Authorized drill-down follows the access matrix. Provide CSV for detail and PDF for an accreditation summary; template branding is tenant-configurable.                                                                                                         |
| 34. Historical snapshots    | Freeze versioned, timestamped metric snapshots when an accreditation report is submitted. Later corrections create a new version and never silently rewrite a submitted report.                                                                                                                                                                                                                      |

### 17.6 AI governance and operation defaults

| Original question            | Adopted decision                                                                                                                                                                                                                                                                                        |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 35. Provider/model boundary  | Use Azure OpenAI from a server-side worker in an approved region. The model deployment name is configuration, allowing upgrades without schema changes. Browser code never holds AI credentials or calls the model directly.                                                                            |
| 36. Data movement            | Send only the minimized profile/CV text and opportunity fields needed for matching to the approved Azure OpenAI endpoint under enterprise no-training/data-processing terms. Raw documents remain in Blocks storage.                                                                                    |
| 37. Consent and opt-out      | Require separate, recorded AI-processing consent. Students may opt out without losing the ability to apply; staff then use the manual screening path.                                                                                                                                                   |
| 38. Generation lifecycle     | Generate after application submission from immutable profile/CV/opportunity snapshots. Regenerate only after an audited, material correction approved by Career Staff. Preserve prior versions and mark superseded output.                                                                              |
| 39. Visibility/review        | Students may see the explanation immediately with an `AI-generated - not yet staff reviewed` label and can flag it. Staff must review it before using it in a shortlist decision.                                                                                                                       |
| 40. Flag handling            | Student selects a category and optional comment. A Career Manager reviews it, then confirms, annotates, regenerates, or withdraws the explanation. Preserve immutable history and notify the student of the resolution.                                                                                 |
| 41. Excluded attributes      | Never send or consider name, contact details, photograph, age/date of birth, gender, religion, ethnicity, disability/health, family/marital status, government ID, precise address, or unrelated socioeconomic data. GPA is excluded from AI even when it is a separately approved eligibility rule.    |
| 42. Languages                | English explanations only for MVP. Add localized prompts/output only after quality evaluation and Blocks Localization content approval.                                                                                                                                                                 |
| 43. Operational targets      | Target p95 generation under 15 seconds, no automatic decision on failure, full model/prompt/version audit metadata, zero secret/credential exposure, monthly sampled quality/fairness review, and configurable per-tenant usage budgets with alerts. Retain AI output under the retention policy below. |
| 44. Scheduled digest runtime | Run overdue detection and coaching-digest generation in a server-side worker deployed through Blocks Release. Use idempotent scheduled jobs; store job state/results in Blocks Data and send notifications through Blocks Mail/Notifier.                                                                |

### 17.7 Privacy, compliance, and operations defaults

| Original question            | Adopted decision                                                                                                                                                                                                                                                                                                                                                          |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 45. Retention                | Active profiles/CVs: while enrolled plus two years after graduation or last activity. Applications/outcomes and AI explanations: five years after the reporting period. Audit events: seven years. Submitted accreditation snapshots and de-identified aggregates: retained indefinitely. Expired data is deleted/anonymized by scheduled policy with legal-hold support. |
| 46. Rights and notices       | Present privacy notice and terms at registration; collect separate AI consent; provide profile correction, CV replacement, consent withdrawal, and a request workflow for access/export/deletion subject to accreditation/legal retention. Record notice/consent version and timestamp.                                                                                   |
| 47. Employer access duration | Employer access to candidate profile/CV ends 90 days after the opportunity closes or the application's final outcome, whichever is later. Retain only the minimal outcome/audit record afterward.                                                                                                                                                                         |
| 48. Compliance               | Treat university policy, accreditation requirements, contractual employer terms, and applicable national privacy/cybersecurity law as mandatory. A university legal/privacy owner must validate the retention schedule, consent text, cross-border AI processing, and reporting template before production launch.                                                        |
| 49. Service targets          | MVP target: 99.5% monthly availability; RPO 24 hours; RTO 4 hours; p95 interactive reads under 2 seconds and writes under 3 seconds excluding AI/file transfer; responsive layouts from 360 px; WCAG 2.2 AA; latest two versions of Chrome, Edge, Firefox, and Safari. Load-test seasonal peaks before launch.                                                            |
| 50. Ownership                | Career Services Head: product owner. Career Staff: employer follow-up. Career Manager: AI flags, templates, and operational escalation. University Superadmin: identity/access and audited corrections. Platform Engineering: deployment, monitoring, recovery, and worker operation. University privacy/legal owner: rights requests and compliance approval.            |

### 17.8 Production validation gates

The product behavior above is resolved. These external validations remain
mandatory before production:

1. Confirm each university's Microsoft Entra tenant, verified domains, directory
   claims, and fallback account-recovery process.
2. Obtain legal/privacy approval for retention, consent, employer-access duration,
   and cross-border/AI processing.
3. Confirm Azure OpenAI region, enterprise data terms, model deployment, capacity,
   and budget.
4. Confirm the university's accreditation report template and authoritative
   graduating-student denominator.
5. Validate the proposed service targets against the contracted Blocks service
   levels and university support model.

## 18. Implementation defaults and constraints

- Each deployed Blocks project/tenant serves exactly one university and its
  employer network; multiple universities use isolated tenants and the same codebase.
- Career staff have university-wide operational visibility within their own tenant.
- Employers see all applicants to their own postings, with screening and
  shortlist state clearly identified.
- Students and staff self-register but remain pending/least-privilege until verified.
- University superadmins provision verified employer organizations and users.
- Career Managers maintain approved reference data and communication templates;
  ordinary Career Staff use them but do not administer roles or policies.
- The 14-day overdue rule starts from the confirmed interview event and remains
  tenant-configurable.
- AI is advisory, human-reviewed, and never the sole decision-maker.
- English is the initial product language despite additional configured languages.
- A hired outcome remains provisional until Career Staff verifies it; one
  verified primary placement per student/academic cycle drives the headline rate.
- No source-system integration is included in the first delivery.

Production validation gates in section 17.8 may refine provider-specific,
legal, contractual, or capacity values without reopening the core product behavior.

## 19. Delivery sequencing

1. Validate the one-university-per-Blocks-tenant architecture with the first
   university's Blocks project and Microsoft Entra tenant.
2. Finalize schema field types, privacy text, accreditation template, and
   provider-specific configuration from the approved decision register.
3. Configure hosted OIDC, verified self-registration, employer invitations,
   IAM permissions, and test users.
4. Design and deploy Data schemas, validations, and access policies.
5. Implement the shared Blocks client, authenticated application shell, and role-aware routes.
6. Build student profile/document, opportunity, application, and screening workflows.
7. Add employer outcomes, overdue processing, Mail, and Notifier flows.
8. Add analytics with verified metric definitions.
9. Add governed AI explanation and flag-resolution workflow.
10. Execute isolation, workflow, accessibility, analytics, and demo acceptance tests.
11. Configure Release deployment and operational monitoring.

## 20. Source traceability

Directly sourced themes:

- Structured opportunity requirements.
- Reusable student profile and visible application journey.
- Staff shortlisting and kind rejection reasons.
- Employer interview/offer/hire outcomes and two-week silence visibility.
- Department/employer placement analytics, funnel conversion, and median
  time-to-first-interview.
- Contextual employer access rather than a student directory.
- Plain-language, student-visible, challengeable AI match explanations.
- Cross-application coaching digest enhancement.
- Brain Station 23 three-student demo scenario.

Derived sections such as the detailed data model, lifecycle,
non-functional requirements, service mapping, and acceptance tests exist to make
the brief implementable. Provider, legal, accreditation, and capacity values
must pass the production validation gates in section 17.8.
