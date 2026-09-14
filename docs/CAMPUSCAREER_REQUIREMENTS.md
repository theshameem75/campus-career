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
- Give employers screened candidates and a structured outcome workflow.
- Give staff a prioritized view of screening work and stalled cases.
- Produce continuous placement analytics by department and employer.
- Make AI assistance explainable, reviewable, and visible to the affected student.
- Protect student data through contextual, least-privilege access.

### 4.2 Suggested success measures

The source does not define numeric targets. The product should nevertheless
measure:

- Employer outcome completion rate.
- Percentage of applications receiving a first decision within a defined SLA.
- Median days from submission to first interview.
- Funnel conversion from application to shortlist, interview, offer, and hire.
- Placement rate by department and graduating cohort.
- Employer conversion and repeat-posting rates.
- Count and age of applications or employer outcomes currently stalled.
- AI explanation flag rate and resolution time.
- Career-staff time required to produce accreditation reporting.

Targets for these measures are open questions.

## 5. Users and responsibilities

| Actor                  | Primary needs                                                                                                                        | Expected authority                                    |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------- |
| Student                | Maintain one profile/CV, discover suitable opportunities, apply, see status history and AI explanations, flag incorrect explanations | Own profile and own applications only                 |
| Employer user          | Manage their organization's opportunities, review applicants to those opportunities, report interviews/offers/hires                  | Own employer and its postings/applicants only         |
| Career staff           | Review opportunities and applications, screen and shortlist, reject kindly, monitor silence, coach students, manage outcomes         | Cross-department operational access as authorized     |
| Department stakeholder | Understand placement performance for their department                                                                                | Reporting access; identifiable student access is open |
| University stakeholder | Accreditation and institution-level placement reporting                                                                              | Aggregate reporting by default                        |
| Platform administrator | Configure access, reference data, templates, and operational settings                                                                | Restricted administrative access                      |

## 6. Scope

### 6.1 MVP scope

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

- Cross-application AI coaching digest for staff.
- Advanced accreditation exports and scheduled reports.
- Employer health and retention analytics.
- Configurable screening rubrics and reusable rejection templates.
- Multilingual UI and notification content.
- Integrations with student information, alumni, or learning systems.

### 6.3 Out of scope unless later approved

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
3. Any required staff review occurs.
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

### 8.2 Student profile and documents

- **STU-01 Must:** A student maintains one reusable profile.
- **STU-02 Must:** The profile supports department, graduation year/cohort,
  skills, projects, experience, and approved contact fields.
- **STU-03 Must:** A student can upload and manage a CV used in applications.
- **STU-04 Should:** An application should retain which profile/CV version was
  submitted so later edits do not rewrite application history.
- **STU-05 Should:** Profile completeness and missing required information should
  be visible before application submission.

### 8.3 Employer and opportunities

- **EMP-01 Must:** Employer users belong to an employer organization.
- **EMP-02 Must:** Authorized users can create and manage structured opportunities.
- **EMP-03 Must:** Opportunity data includes skills, eligible departments,
  stipend, slots, deadline, and descriptive requirements.
- **EMP-04 Must:** Only published, open, and eligible opportunities accept applications.
- **EMP-05 Must:** Employers can see screened/shortlisted applicants to their own postings.
- **EMP-06 Must:** Employers record structured interview, offer, and hire outcomes.
- **EMP-07 Should:** The system tracks employer response timeliness and follow-up history.

### 8.4 Applications and screening

- **APP-01 Must:** Each submission has one canonical application record.
- **APP-02 Must:** Duplicate applications by the same student to the same
  opportunity are prevented unless policy explicitly allows resubmission.
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

- **OUT-01 Must:** Missing employer outcomes become visible to staff after the
  defined silence threshold; the source proposes two weeks.
- **OUT-02 Must:** Staff can see flag age, responsible employer/opportunity,
  affected applications, and suggested follow-up action.
- **OUT-03 Must:** Staff can record follow-up attempts and resolution.
- **OUT-04 Must:** A reported hire updates the application and placement analytics.
- **OUT-05 Should:** Reminder and escalation timing should be configurable.

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
- **AI-08 Should:** Inputs, model/provider metadata, output, review state, flags,
  and resolution should be auditable with appropriate retention controls.
- **AI-09 Could:** Generate a staff coaching digest across all of a student's
  applications, highlighting silence and suggesting next actions.

### 8.7 Notifications

- **NOT-01 Must:** Students are notified of material application stage changes.
- **NOT-02 Must:** Staff are notified or queued when employer outcomes become overdue.
- **NOT-03 Should:** Employers receive outcome reminders before and after the
  overdue threshold.
- **NOT-04 Should:** Rejection communication uses approved, respectful content.
- **NOT-05 Should:** Delivery attempts and failures are observable.
- **NOT-06 Open:** Exact channels, timing, templates, and user preferences must
  be agreed.

### 8.8 Analytics and reporting

- **AN-01 Must:** Show placements by department.
- **AN-02 Must:** Show placements and conversion by employer.
- **AN-03 Must:** Show funnel counts and conversion rates across agreed stages.
- **AN-04 Must:** Show median days to first interview.
- **AN-05 Must:** Show students/applications currently stalled in silence.
- **AN-06 Must:** Metrics update from canonical workflow data without a manual census.
- **AN-07 Should:** Support filters for academic period, cohort, department,
  employer, opportunity, and outcome.
- **AN-08 Should:** Clearly define metric denominators and exclude test/deleted
  records according to policy.
- **AN-09 Could:** Export accreditation-ready tables or reports.

## 9. Proposed lifecycle and business rules

The exact workflow is open. A starting lifecycle for discussion is:

`Draft -> Submitted -> Screening -> Shortlisted -> Interviewed -> Offered -> Hired`

Terminal alternatives may include `Rejected`, `Withdrawn`, `Expired`, and
`Not selected`.

Proposed rules:

1. Students create `Submitted` applications only while an opportunity is open.
2. Staff move applications through screening and shortlist/rejection.
3. Employers move shortlisted candidates through interview, offer, and hire
   outcomes for their own postings.
4. Every transition creates an immutable history event.
5. Rejection requires an approved reason; internal and student-visible text may
   be separate if policy requires.
6. A hire is counted once under an agreed placement definition.
7. Overdue status is derived rather than replacing the application stage.
8. Closing an opportunity stops new applications but does not remove existing history.

## 10. Proposed information model

Names are conceptual; final Blocks schema names and fields will be designed
after open questions are resolved.

| Entity                 | Purpose                                                          | Important relationships            |
| ---------------------- | ---------------------------------------------------------------- | ---------------------------------- |
| Department             | CSE, BBA, EEE, and future academic units                         | Students, opportunities, analytics |
| StudentProfile         | Reusable student identity and career profile                     | IAM user, department, documents    |
| StudentExperience      | Projects, employment, certifications, or portfolio evidence      | StudentProfile                     |
| Employer               | Organization posting opportunities                               | Employer users, opportunities      |
| EmployerMembership     | Links authorized IAM users to an employer and role               | Employer, IAM user                 |
| Opportunity            | Structured internship/job posting and requirements               | Employer, eligible departments     |
| OpportunitySkill       | Required/preferred skill definition                              | Opportunity, skill catalog         |
| Application            | Canonical student submission to one opportunity                  | StudentProfile, Opportunity        |
| ApplicationDocument    | Snapshot/reference to the CV used for an application             | Application, stored file           |
| ApplicationStageEvent  | Immutable journey event with actor, time, reason, and visibility | Application                        |
| ScreeningDecision      | Structured staff review, shortlist/reject decision, and reason   | Application, staff user            |
| EmployerOutcome        | Interview, offer, hire, or other agreed outcome details          | Application, employer user         |
| FollowUpFlag           | Derived or persisted overdue outcome and resolution data         | Application/Opportunity/Employer   |
| FollowUpActivity       | Staff reminder, contact, escalation, and resolution history      | FollowUpFlag                       |
| MatchExplanation       | Versioned AI explanation and its source snapshot                 | Application or Student+Opportunity |
| ExplanationFlag        | Student concern, category, comment, review, and resolution       | MatchExplanation                   |
| CoachingDigest         | Staff-reviewed cross-application AI coaching output              | StudentProfile, applications       |
| NotificationPreference | Allowed channels and preferences where applicable                | IAM user                           |
| AuditEvent             | Sensitive administrative and workflow change record              | Actor and affected entity          |

Reference data may include skills, application stages, outcome types, rejection
reasons, flag categories, academic periods, and notification templates.

## 11. Authorization model

| Resource/action            |          Student |                    Employer user |                     Career staff | Department/university |      Admin |
| -------------------------- | ---------------: | -------------------------------: | -------------------------------: | --------------------: | ---------: |
| Own student profile and CV |           Manage |                               No |               Read as authorized |                  Open |      Admin |
| Browse student directory   |               No |                               No |                             Open |         No by default | Restricted |
| Published opportunities    |             Read |                       Own/manage |                    Manage/review |                  Read |      Admin |
| Submit application         |              Own |                               No |                               No |                    No |         No |
| View application/profile   |              Own | Own posting after approved stage |                 Authorized scope |  Aggregate by default | Restricted |
| Screening/shortlisting     |               No |                               No |                           Manage |                    No | Restricted |
| Employer outcomes          |         Read own |               Manage own posting | Read/manage override policy open |             Aggregate | Restricted |
| AI explanation             |    Read/flag own |                             Open |                      Read/review |        Aggregate only | Restricted |
| Operational analytics      | Own summary only |                     Own employer |                 Authorized scope |  Authorized aggregate |       Full |
| Access administration      |               No |               Limited membership |                             Open |                    No |     Manage |

Every row marked **Open** needs an explicit decision. Data Gateway policies must
enforce the final matrix.

## 12. SELISE Blocks service mapping

| Capability                          | Blocks service/surface                                             | Intended use                                                        |
| ----------------------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Sign-in and sessions                | IAM/OIDC                                                           | Separate authenticated experiences and hosted login                 |
| Users, roles, permissions           | IAM users and access control                                       | Role/permission assignments and server-authoritative feature access |
| Employer or university boundaries   | IAM organizations and/or Data schemas                              | Final choice depends on the tenancy decision                        |
| Domain records and policies         | Data Gateway schemas, validation, and access policies              | Opportunities, applications, history, AI records, and isolation     |
| Frontend record access              | `@seliseblocks/client` Data SDK                                    | Typed CRUD/query access through one shared Blocks client            |
| CVs and documents                   | Blocks Data file/object APIs with configured Azure storage         | Upload, version/reference, download, and access control             |
| Transactional email                 | Blocks Mail                                                        | Confirmations, respectful rejection, reminders, and escalation      |
| Real-time/inbox notifications       | Blocks Notifier                                                    | Student stage updates and staff overdue alerts                      |
| Notification channel administration | Blocks Notification                                                | Configure channels where required                                   |
| Languages and UI text               | Blocks Localization                                                | Available if multilingual scope is approved                         |
| Deployment                          | Blocks Release                                                     | Build/deploy pipeline and operational visibility                    |
| Analytics                           | Data Gateway queries plus application-side/server-side aggregation | Continuous dashboards from canonical records                        |
| AI generation                       | External/approved AI runtime plus Blocks Data for governed storage | Provider, execution boundary, and scheduling remain open            |

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

- Support at least the stated scale of 1,200 graduates/year, 200+ employers, four
  career staff, and seasonal application spikes; exact concurrency targets are open.
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

1. A student can sign in, complete one profile, attach a CV, apply to an eligible
   open opportunity, and see a complete timeline.
2. A second student cannot access the first student's profile, application, or AI output.
3. Employer A cannot access Employer B's postings or applicants.
4. Staff can review applications, shortlist candidates, and reject a candidate
   only after recording an approved respectful reason.
5. An employer can record interview, offer, and hire outcomes for its own posting.
6. Missing outcomes cross the configured threshold and appear in a staff queue
   with age and follow-up context.
7. A hire updates department, employer, funnel, and time-based analytics.
8. The AI explanation states covered skills, gaps, relevant experience, and one
   coaching tip without an unexplained score.
9. Staff can review the explanation, the student can view it, and the student can
   flag it for correction.
10. Email/in-app notifications follow the agreed event matrix, and failures are visible.
11. Access-isolation, lifecycle-transition, analytics, and AI-transparency tests pass.

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

## 17. Open questions

### 17.1 Product and tenancy

1. Is the MVP internships only, or internships plus graduate jobs/placements?
2. Is this for one university tenant only, or must multiple universities be isolated?
3. Should departments be Data records, IAM organizations, or reporting dimensions?
4. Should each employer be an IAM organization, a Data entity with memberships,
   or a separate tenant boundary?
5. Who creates and verifies employer organizations and employer users?
6. Do opportunities require career-staff approval before publication?

### 17.2 Identity and access

7. Which identity providers will students, employers, and staff use?
8. Are student/staff accounts provisioned from an institutional directory, invited,
   or self-registered?
9. Can department users see named students or aggregate analytics only?
10. Can employers view all applicants immediately or only staff-shortlisted applicants?
11. Can staff override employer outcomes, and if so, what audit/reason is required?
12. Which administrative roles may edit reference data, templates, and policies?

### 17.3 Student and opportunity data

13. What student fields are required, optional, sensitive, or prohibited?
14. Is there a canonical skill taxonomy, and who maintains it?
15. May students maintain multiple CVs and choose one per application?
16. Are students restricted by department, cohort, GPA, credits, or prior placement?
17. Can a student withdraw, edit, or resubmit an application?
18. What timezone controls deadlines, and what happens to in-progress submissions at close?
19. Do stipend currency, range, frequency, work mode, location, and duration need
    structured fields?

### 17.4 Workflow and communication

20. What are the final stages, terminal outcomes, and allowed transitions?
21. Who may perform each transition?
22. Is there a screening rubric, and are staff notes internal or student-visible?
23. Are rejection reasons free text, templates, categories, or a combination?
24. Does the two-week silence clock start at shortlist, interview, last employer
    activity, opportunity deadline, or another event?
25. What reminder/escalation sequence occurs before and after a case is overdue?
26. Which events use email, real-time inbox, both, or no notification?
27. May users configure notification preferences?

### 17.5 Placement analytics

28. What exactly counts as a placement: accepted offer, hired outcome, start date,
    or university verification?
29. How are multiple offers or multiple hires for one student counted?
30. Which cohort/academic period owns a placement?
31. What are the denominators for department placement rate and funnel conversion?
32. Which events define time-to-first-interview?
33. What filters, drill-down access, export formats, and accreditation templates are required?
34. Should historical metric snapshots be frozen for submitted accreditation reports?

### 17.6 AI governance and operation

35. Which AI provider/model and hosting boundary are approved?
36. May CV/profile content leave Blocks-managed infrastructure for inference?
37. Is explicit student consent required, and can a student opt out?
38. When is an explanation generated, regenerated, or invalidated after profile or
    opportunity edits?
39. Must staff approve an explanation before the student can see it?
40. How does a student flag an explanation, who reviews the flag, and what remedies
    or correction history are visible?
41. Which attributes must never be sent to or considered by the model?
42. Are multilingual explanations required?
43. What latency, cost, quality, retention, and audit targets apply?
44. Where will scheduled/stalled-case AI digest generation run?

### 17.7 Privacy, compliance, and operations

45. What retention/deletion rules apply to CVs, rejected applications, audit events,
    AI output, and analytics?
46. What consent, privacy notice, data export, and correction rights are required?
47. How long may an employer access a candidate after an opportunity closes?
48. Are there university, national, or accreditation-specific compliance rules?
49. What availability, recovery, performance, browser, mobile, and accessibility
    targets are contractual?
50. Who owns operational support, employer follow-up, AI review, and data correction?

## 18. Assumptions pending confirmation

- The initial deployment serves one university and its employer network.
- Career staff have institution-wide operational visibility.
- Employers see applicants only after the staff-approved screening stage.
- The two-week overdue rule is configurable and based on a defined expected-outcome event.
- AI is advisory, human-reviewed, and never the sole decision-maker.
- English is the initial product language despite additional configured languages.
- A hired outcome is provisional until the university defines whether verification
  or acceptance is required for placement reporting.
- No source-system integration is included in the first delivery.

These assumptions must not be treated as final business decisions.

## 19. Delivery sequencing

1. Resolve tenancy, identity-provider, and role/access questions.
2. Finalize lifecycle, field catalog, privacy rules, and metric definitions.
3. Configure OIDC, IAM permissions, and test users.
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

Derived sections such as the detailed data model, lifecycle proposal,
non-functional requirements, service mapping, and acceptance tests exist to make
the brief implementable. They remain subject to the open decisions above.
