# Clinic Reactivation Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a clinic-specific reactivation queue, optional workflow fields, and preview-first MetaSoft-style CSV import while preserving existing CBOS behavior.

**Architecture:** Extend the existing Mongo inquiry document with optional operational fields, calculate reactivation urgency in a pure backend service, expose a read endpoint, and render a dedicated React page. Reuse the existing inquiry update route and CSV preview/import pipeline.

**Tech Stack:** Node.js, Express, TypeScript, MongoDB/Mongoose, React, Vite, native CSS.

---

### Task 1: Reactivation Calculation

**Files:**
- Create: `backend/src/services/reactivationService.ts`
- Modify: `backend/src/tests/service.test.ts`

- [ ] Add failing assertions for overdue, due-today, upcoming, excluded, and sorted records.
- [ ] Run `npm test --prefix backend` and verify the missing service import fails.
- [ ] Implement `buildReactivationQueue(inquiries, today)`.
- [ ] Run the backend tests and verify they pass.

### Task 2: Optional Clinic Workflow Fields

**Files:**
- Modify: `backend/src/config/constants.ts`
- Modify: `backend/src/models/Inquiry.ts`
- Modify: `backend/src/services/inquiryService.ts`
- Modify: `backend/src/validators/inquiryValidators.ts`
- Modify: `backend/src/serializers/inquirySerializer.ts`
- Modify: `backend/src/controllers/configController.ts`

- [ ] Define appointment, patient-type, offer, and follow-up-outcome options.
- [ ] Add optional Mongoose fields without changing required existing fields.
- [ ] Normalize optional dates, frequency, and text on create/update.
- [ ] Return the new options through `/api/config`.
- [ ] Run backend typecheck.

### Task 3: Reactivation API

**Files:**
- Create: `backend/src/controllers/reactivationController.ts`
- Modify: `backend/src/routes/inquiryRoutes.ts`

- [ ] Add `GET /api/reactivations`.
- [ ] Load inquiries, build the queue, and return summary counts plus rows.
- [ ] Run backend tests and typecheck.

### Task 4: MetaSoft-Style CSV Preview

**Files:**
- Modify: `backend/src/services/importService.ts`
- Modify: `backend/src/services/automationService.ts`
- Modify: `backend/src/tests/service.test.ts`
- Create: `docs/METASOFT_REACTIVATION_DEMO.csv`

- [ ] Add failing CSV mapping assertions for last visit, visit frequency, patient type, appointment outcome, appointment request, offer, owner, and follow-up outcome.
- [ ] Verify the assertions fail before implementation.
- [ ] Extend mapping, preview rows, and automated inquiry input.
- [ ] Add a fake MetaSoft-style CSV with no real patient data.
- [ ] Run backend tests.

### Task 5: React Reactivation View

**Files:**
- Create: `frontend/src/pages/ReactivationsPage.tsx`
- Modify: `frontend/src/types.ts`
- Modify: `frontend/src/services/api.ts`
- Modify: `frontend/src/hooks/useBusinessOsData.ts`
- Modify: `frontend/src/App.tsx`
- Modify: `frontend/src/components/AppShell.tsx`
- Modify: `frontend/src/styles/global.css`

- [ ] Add reactivation response types and API method.
- [ ] Load queue data with other dashboard data.
- [ ] Add navigation and the dedicated view.
- [ ] Implement count cards, search/urgency/owner filters, table, and update form.
- [ ] Add responsive styling and run frontend typecheck.

### Task 6: Clinic-Matched Inquiry And Import Forms

**Files:**
- Modify: `frontend/src/pages/InquiriesPage.tsx`
- Modify: `frontend/src/pages/ExportsPage.tsx`
- Modify: `frontend/src/types.ts`

- [ ] Add optional clinic fields to create/edit state and controls.
- [ ] Show MetaSoft fields in import preview and mapping guidance.
- [ ] Preserve existing status/KPI behavior.
- [ ] Run frontend typecheck and build.

### Task 7: Demo Data, Documentation, And Verification

**Files:**
- Modify: `backend/src/data/sampleData.ts`
- Modify: `README.md`
- Modify: `docs/DEMO_WALKTHROUGH.md`
- Modify: `PROJECT_STATUS.md`
- Modify: `CONTINUE_COMMANDS.md`

- [ ] Add fake active, overdue, due-today, and upcoming reactivation records.
- [ ] Document the MetaSoft boundary and demo workflow.
- [ ] Run `npm run typecheck`, `npm run test`, and `npm run build`.
- [ ] Run browser verification at desktop and mobile sizes.
- [ ] Update continuity, TOBI_OS, and resume synchronization.

