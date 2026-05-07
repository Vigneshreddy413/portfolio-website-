## Community Cleanliness Tracker — Product Requirements Document (PRD)

### 1. Overview
- **Product name**: Community Cleanliness Tracker (CCT)
- **Goal**: Enable citizens to report cleanliness issues; empower municipal teams/NGOs to triage, assign, resolve, and track service-level performance; build community engagement with gamification and transparency.
- **Primary users**:
  - **Citizens**: Report issues (trash, potholes, graffiti), track status, earn points/badges, view leaderboards.
  - **Staff (Municipal/NGO)**: Triage, assign tasks, set priorities, update progress, close issues.
  - **Supervisors/Admins**: Manage orgs/teams, configure SLAs, analytics & compliance.

### 2. Objectives & Success Metrics
- **Objectives**
  - Increase reporting coverage and speed to resolution.
  - Improve SLA adherence across categories and locations.
  - Foster community participation with gamified incentives.
  - Provide transparent reporting and analytics to leadership.
- **Key metrics (North Star + supporting)**
  - Time-to-first-response (TFR) and Time-to-resolution (TTR) per category/ward.
  - SLA compliance rate per category and location.
  - Weekly active citizen reporters (WACR) and report-to-resolution conversion.
  - Staff assignment throughput and re-open rate.
  - Gamification: citizen points distribution, badge attainment, leaderboard activity.

### 3. Scope (MVP → V1)
- **In scope (MVP)**
  - Citizen mobile-friendly web app for issue reporting with geo, media, category, description.
  - Issue lifecycle: New → Triaged → Assigned → In Progress → Resolved → Verified → Closed (configurable).
  - Staff console for triage/assignment, status updates, comments, media.
  - SLA policy engine per category and priority; due dates and breach tracking.
  - Geospatial storage and map visualization; ward/boundary overlays.
  - Gamification: points for valid reports, resolution confirmations; badges and basic leaderboards.
  - Notifications: email + in-app (push optional in V1) for major lifecycle events.
  - Admin: orgs, teams, users, roles/permissions; category configuration; SLA rules; location boundaries upload.
  - Analytics: basic dashboards for volume, SLA adherence, backlog, heatmaps.
- **Out of scope (MVP)**
  - Native mobile apps (iOS/Android) — consider PWA; native in later phase.
  - Payments or micro-rewards beyond points/badges.
  - Complex workforce routing optimization.

### 4. Personas & Use Cases
- **Citizen Reporter**
  - Create issue with location pin, photos/video, category, optional contact.
  - Track status and receive notifications; confirm resolution.
  - Earn points; view personal impact and community leaderboard.
- **Operations Staff**
  - View new reports, bulk triage by category/ward/priority.
  - Assign to crews; update status; add work notes; attach media.
  - See personal queue and due dates; SLA breach alerts.
- **Supervisor/Admin**
  - Manage orgs/teams/users and roles; configure categories, SLAs, geofences.
  - Monitor analytics; export data; audit logs.

### 5. Functional Requirements
- **Authentication & Authorization**
  - Email/password, OAuth (Google) optional; JWT sessions.
  - Roles: `CITIZEN`, `STAFF`, `SUPERVISOR`, `ADMIN` with RBAC policies.
  - Organization/tenant context; users belong to one org; admins can manage multiple.
- **Issue Reporting**
  - Fields: title, description, category, priority (optional), geo-point, address (reverse geocoded), photos/videos (<= 5 media, 25 MB total), consent to contact.
  - Duplicate detection (soft): same geo-radius + category within recent window.
  - Status flow with timestamps and audit trail; comments thread with mentions.
  - Attachments stored in object storage; thumbnails generated.
- **Tasks & Assignment**
  - Create tasks linked to a report; assigned to user/team; due date based on SLA.
  - Status updates; time tracking; reason codes for delays; reassignments.
  - Bulk operations (assign/close) with justification.
- **SLA Engine**
  - Rule model: by category and priority; TFR/TTR thresholds.
  - Compute due dates; mark breaches; notify responsible owners.
  - SLA calendar (business hours) configurable per org.
- **Locations & Maps**
  - Store geo-point for reports; optional polygon overlays for wards/areas.
  - Map views with clustering; heatmap; filter by category, status, date.
  - Geofencing for team responsibility areas.
- **Gamification**
  - Points: report creation (+X), valid report approved (+Y), verification of resolution (+Z), streaks.
  - Badges: first report, 10/50/100 reports, community champion, verified helper.
  - Leaderboards: weekly, monthly, all-time; per-ward and global.
- **Notifications**
  - Templates for events: report created, triaged, assigned, status changed, resolved, verified, SLA breach.
  - Channels: email, in-app; push via web push (V1 optional) and future FCM/APNs.
- **Admin & Configuration**
  - Manage orgs, teams, users, roles.
  - Category CRUD; SLA policies; location boundaries import (GeoJSON).
  - Feature flags per org (e.g., allow anonymous reports).
- **Analytics & Reporting**
  - Dashboards: volumes, SLA adherence, backlog, heatmap, leaderboards.
  - CSV export; scheduled email reports.
  - Privacy-preserving aggregations for public transparency.

### 6. Non-Functional Requirements
- **Security**: OWASP best practices, input validation, least privilege, secure media URLs (signed URLs), audit logs.
- **Performance**: P95 API < 300 ms for primary reads; map tiles lazy-loaded; media uploads via signed URLs.
- **Scalability**: Horizontally scalable stateless API; CDN for static/media; queue for async jobs.
- **Reliability**: 99.9% uptime target; retries and idempotency for writes; durable storage.
- **Privacy & Compliance**: GDPR-like consent; data retention policies; PII minimization.
- **Accessibility**: WCAG AA for frontend.
- **Localization**: i18n-ready; date/time/number localization; English MVP.

### 7. System Architecture (High-Level)
- **Frontend**: React + TypeScript (Vite), Map SDK (Mapbox/Leaflet), Component library (MUI/Chakra) TBD, PWA.
- **Backend**: Node.js + TypeScript, Express/Nest (Express MVP), PostgreSQL with PostGIS, Redis cache, S3-compatible object storage, BullMQ/Redis for jobs.
- **APIs**: REST JSON; OpenAPI spec; shared TypeScript types.
- **Infra**: Docker containers; CI (GitHub Actions); deploy to Render/Fly/Heroku-like or Kubernetes (later phase).

### 8. Data Model (Core Entities)
- `User(id, orgId, email, name, role, phone?, locale, points, badges[])`
- `Organization(id, name, settings{featureFlags, businessHours, slaPolicies})`
- `LocationBoundary(id, orgId, name, geojson, type{ward|zone}, metadata)`
- `Report(id, orgId, reporterId?, title, description, category, priority, status, location{point,address}, createdAt, updatedAt, media[], audit[])`
- `Task(id, orgId, reportId, assigneeUserId?, assigneeTeamId?, status, dueAt, startedAt?, completedAt?, notes[])`
- `SlaPolicy(id, orgId, category, priority, tfrMins, ttrMins, calendar)`
- `Notification(id, orgId, userId?, type, channel, payload, status, error?, createdAt)`
- `GamificationLedger(id, orgId, userId, points, reason, reportId?, taskId?, createdAt)`
- `Badge(id, key, name, description, criteria)` and `UserBadge(userId, badgeId, earnedAt)`

### 9. API Surface (Selected Endpoints)
- Auth: `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`.
- Reports: `POST /reports`, `GET /reports`, `GET /reports/:id`, `PATCH /reports/:id`, `POST /reports/:id/media`, `POST /reports/:id/verify`.
- Tasks: `POST /tasks`, `GET /tasks`, `PATCH /tasks/:id`, `POST /tasks/:id/reassign`, `POST /tasks/:id/complete`.
- Admin: `GET/POST/PATCH /admin/users`, `/admin/teams`, `/admin/categories`, `/admin/sla-policies`, `/admin/boundaries`.
- Gamification: `GET /me/points`, `GET /leaderboard`, `GET /badges`, `POST /badges/claim`.
- Notifications: `GET /notifications`, `PATCH /notifications/:id/read`.

### 10. User Flows (MVP)
- **Citizen report**: open app → allow location → select category → add photo → describe → submit → see status and earn points.
- **Staff triage**: open dashboard → filter new reports → set priority → assign to team/user → task created with SLA.
- **Resolution & verification**: assignee updates progress → resolve with photo → citizen verifies → closed.

### 11. Gamification Rules (MVP Defaults)
- Report created: +5 points; validated (triaged not rejected): +10; verified resolution: +10.
- Streak (weekly active with ≥1 valid report): +20 weekly bonus.
- Badges: `first_report`, `reporter_10`, `reporter_50`, `verifier_10`, `community_champion` (curated).

### 12. SLA Defaults (MVP)
- Categories: trash (TFR 120 min, TTR 24h), pothole (TFR 240 min, TTR 72h), graffiti (TFR 240 min, TTR 72h). Business hours: 8:00–18:00, Mon–Sat.

### 13. Analytics (MVP Widgets)
- Volume by category over time; SLA adherence; map heatmap; backlog aging; top reporters; leaderboard widgets.

### 14. Constraints & Risks
- Location privacy; potential for abuse/spam reports.
- Media storage costs; need for moderation.
- Variability in municipal capacity; ensure configurability.

### 15. Release Plan
- MVP (8–10 weeks): Core flows, basic analytics, email + in-app notifications, web PWA.
- V1.1: Push notifications, improved moderation, duplicate detection, public transparency portal.
- V1.2: Native mobile apps, AI triage suggestions, routing optimization.

### 16. Acceptance Criteria (MVP)
- End-to-end flows work across roles with RBAC enforced.
- SLA timers computed and breach alerts sent.
- Map renders clusters and heatmap; reports filterable.
- Points and badges recorded; leaderboards display.
- Admin can configure categories, SLAs, boundaries.
- CI passes: tests, lint, build. Deployable container images.

### 17. Glossary
- TFR: Time to first response; TTR: Time to resolution; SLA: service-level agreement.


