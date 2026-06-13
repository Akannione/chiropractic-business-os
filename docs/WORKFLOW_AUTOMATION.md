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

## Website Embed

Use the snippets in `docs/INTAKE_EMBED_SNIPPETS.md` to place the intake form on a practice website or link to it from call-to-action buttons.

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

## Internal Email Notification

When SMTP environment variables are configured, the backend sends an internal email notification each time an automated inquiry is created through the public form, webhook, or CSV import.

Backend environment variables:

```bash
INTERNAL_NOTIFICATION_EMAIL=owner@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Chiropractic Business OS <no-reply@example.com>
```

If these are not configured, inquiries still save normally and email notification is skipped.

Staff can also trigger a daily internal follow-up summary from the Settings tab or:

```text
POST /api/reminders/daily-summary
```

The summary includes overdue follow-ups, due-today follow-ups, and new inquiries.

## Staff Login

Set `ADMIN_PASSWORD` in production to protect staff routes. The public intake form and webhook intake remain available so website inquiries can still enter the system.

## Source And Service Follow-Up Rules

The backend applies simple default follow-up rules:

- Google, Referral, Website, and Phone Call: follow up today
- Insurance: follow up tomorrow
- Wellness Consultation: follow up in two days
- Prenatal Chiropractic Consultation: follow up tomorrow
- Urgent services such as Sports Injury Treatment, Spinal Adjustment, Neck Pain Evaluation, and Back Pain Consultation: follow up today

The backend also applies simple service-based estimated treatment values when no explicit value is provided.

## Webhook Intake

No-code form tools can submit JSON to:

```text
POST /api/webhooks/inquiries
```

Accepted field names:

- `name`, `patient_name`, or `full_name`
- `phone`
- `email`
- `service_needed`, `requested_service`, or `service`
- `source`
- `notes`, `message`, or `Message`

Example:

```json
{
  "full_name": "Jordan Example",
  "phone": "404-555-0198",
  "email": "jordan@example.com",
  "requested_service": "Sports Injury Treatment",
  "source": "Google",
  "message": "Submitted from website form provider."
}
```

## CSV Import

Existing client inquiries can be imported with:

```text
POST /api/imports/inquiries.csv/preview
```

Then:

```text
POST /api/imports/inquiries.csv
```

Send the CSV body as `text/csv`.
The preview step flags duplicates and rows that need cleanup before the import runs. The import step skips duplicate email or phone matches instead of inserting them again.

Example file:

```text
docs/CSV_IMPORT_EXAMPLE.csv
```

## Recommended Practice Workflow

1. Patient submits the public intake form.
2. Business OS creates the inquiry automatically.
3. Dashboard updates when staff opens or refreshes the app.
4. Staff starts with Follow-Ups Needed.
5. Staff uses the dashboard workflow buttons to mark a consultation scheduled, move the inquiry to Active Patient, push the follow-up to tomorrow, or mark the inquiry Lost.
6. Staff opens Patient Inquiries when deeper notes or contact details need to be edited.
7. Owner reviews weekly performance.
8. Owner reviews the monthly report during monthly check-ins.

## Next Automation Opportunities

These are practical ways to push automation further while keeping the system simple.

### 1. Website Embed

Implemented with `docs/INTAKE_EMBED_SNIPPETS.md`.

Value:

- Removes manual copying from website forms.
- Creates a consistent inquiry record.

### 2. Google Business Profile Link

Implemented with `/intake?source=Google`.

Value:

- Google-originated inquiries are labeled automatically.
- The dashboard can show whether Google is driving patient inquiries.

### 3. Referral Partner Links

Implemented with:

```text
/intake?source=Referral
```

Value:

- Referrals become traceable.
- The practice can see which referral paths are producing inquiries.

### 4. Auto Follow-Up Due Date Rules

Implemented with source and requested-service rules.

Value:

- Better default prioritization without adding scheduling software.

### 5. Email Notification

Implemented as optional SMTP email notification.

Value:

- Staff does not need to keep refreshing the dashboard.
- Faster first response.

Boundary:

- This is notification only, not patient messaging automation.

### 6. CSV Import For Existing Leads

Implemented as `POST /api/imports/inquiries.csv`.

Value:

- Faster client onboarding.
- Less manual setup work.

Boundary:

- Keep this as a one-time import, not a complex CRM migration engine.

### 7. Lightweight Webhook Intake

Implemented as `POST /api/webhooks/inquiries`.

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
