# Workflow Automation

This document explains how patient inquiry capture is automated in the current full-stack Chiropractic Business OS and what can be automated next without turning the MVP into an EHR, scheduling system, or billing platform.

## Current Automated Intake

The app now includes a public intake page:

```text
/intake
```

Example local URL:

```text
http://localhost:5173/intake
```

The public form captures:

- Patient name
- Phone
- Email
- Requested service
- Notes
- Inquiry source

When submitted, the frontend calls:

```text
POST /api/public/inquiries
```

The backend automatically creates a MongoDB patient inquiry with:

- `status`: `Follow-Up Needed`
- `source`: `Website` by default
- `next_follow_up_date`: today
- `estimated_value`: `200`
- `notes`: patient-provided notes or a public-form note

This means staff no longer needs to manually enter every website inquiry. Staff only needs to review the dashboard, follow up, update status, and add notes.

## Source Tracking

The public form supports simple source tracking through query parameters:

```text
/intake?source=Website
/intake?source=Google
/intake?source=Referral
/intake?source=Insurance
```

This makes it possible to use different links in different places:

- Website contact button: `/intake?source=Website`
- Google Business Profile website link: `/intake?source=Google`
- Referral partner link: `/intake?source=Referral`
- Insurance inquiry link: `/intake?source=Insurance`

## Recommended Practice Workflow

1. Patient submits the public intake form.
2. Business OS creates the inquiry automatically.
3. Dashboard updates when staff opens or refreshes the app.
4. Staff starts with Follow-Ups Needed.
5. Staff contacts the patient.
6. Staff updates status to `Consultation Scheduled`, `Active Patient`, `Lost`, or keeps it as `Follow-Up Needed`.
7. Owner reviews weekly performance.

## Next Automation Opportunities

These are practical ways to push automation further while keeping the system simple.

### 1. Website Embed

Embed the public intake form link or page inside a practice website so website inquiries go directly into Business OS.

Value:

- Removes manual copying from website forms.
- Creates a consistent inquiry record.

### 2. Google Business Profile Link

Use `/intake?source=Google` as the website or appointment-request link on Google Business Profile.

Value:

- Google-originated inquiries are labeled automatically.
- The dashboard can show whether Google is driving patient inquiries.

### 3. Referral Partner Links

Give referral partners a dedicated link:

```text
/intake?source=Referral
```

Value:

- Referrals become traceable.
- The practice can see which referral paths are producing inquiries.

### 4. Auto Follow-Up Due Date Rules

The current public intake endpoint sets follow-up due today. A simple future improvement could set follow-up due date by source or service:

- Website inquiry: today
- Referral inquiry: today
- Insurance inquiry: tomorrow
- Wellness consultation: next business day

Value:

- Better default prioritization without adding scheduling software.

### 5. Email Notification

Send a simple internal email to the practice when a public inquiry arrives.

Value:

- Staff does not need to keep refreshing the dashboard.
- Faster first response.

Boundary:

- This is notification only, not patient messaging automation.

### 6. CSV Import For Existing Leads

Use a simple import path for a practice's existing inquiry list.

Value:

- Faster client onboarding.
- Less manual setup work.

Boundary:

- Keep this as a one-time import, not a complex CRM migration engine.

### 7. Lightweight Webhook Intake

Add a generic webhook endpoint for no-code form tools such as Typeform, Tally, Jotform, or website builders.

Value:

- The practice can keep its current form provider.
- Business OS still becomes the central follow-up dashboard.

Boundary:

- Validate inputs tightly.
- Do not support unlimited custom fields yet.

## What Not To Automate Yet

Avoid these until there is a paying client need:

- EHR integration
- Appointment scheduling integration
- Insurance or billing workflows
- Automated patient texting
- Payment collection
- Complex lead scoring
- AI replies to patients

The best near-term automation is simple: capture inquiries automatically, label the source, create a follow-up task, and make the next action visible.
