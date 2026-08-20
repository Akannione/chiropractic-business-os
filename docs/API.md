# API Reference

Base URL:

```text
http://localhost:4000/api
```

## Health

### `GET /health`

Returns service health.

Response:

```json
{"ok":true,"service":"CBOS API"}
```

## Configuration

### `GET /config`

Returns practice labels, status options, inquiry sources, requested services, KPI help text, and demo-mode state.

## Authentication

Authentication is optional. When `ADMIN_PASSWORD` is configured, staff routes require a bearer token. Public intake and webhook intake remain open.

### `GET /auth/status`

Returns whether staff login is enabled.

```json
{"authEnabled":true}
```

### `POST /auth/login`

JSON body:

```json
{"password":"staff-password"}
```

Response:

```json
{"token":"admin.expiry.signature","authEnabled":true}
```

Use the token as:

```text
Authorization: Bearer admin.expiry.signature
```

## Patient Inquiries

### `GET /inquiries`

Returns one page of patient inquiries, newest first, with the total number
matching the filters. Filtering and searching run in the database; this
endpoint no longer returns the whole collection.

Query parameters, all optional:

| Parameter | Default | Notes |
|---|---|---|
| `page` | `1` | 1-based |
| `pageSize` | `25` | Capped at 100 |
| `search` | none | Case-insensitive substring across name, phone, email, requested service, and notes |
| `status` | `All` | Any configured status |
| `source` | `All` | Any configured source |
| `followUp` | `All` | `Needs Follow-Up`, `Overdue`, or `Due Today`. Every follow-up view excludes Lost inquiries, so combining one with `status=Lost` correctly matches nothing. |

```json
{
  "rows": [],
  "total": 0,
  "page": 1,
  "pageSize": 25
}
```

Note for existing integrations: this previously returned a bare array. The rows
are now under `rows`.

### `POST /inquiries`

Creates a staff-entered patient inquiry.

Example JSON body. The original inquiry fields remain required; the clinic workflow fields are optional:

```json
{
  "name": "Jordan Smith",
  "phone": "404-555-0198",
  "email": "jordan@example.com",
  "service_needed": "Spinal Adjustment",
  "source": "Website",
  "status": "New Inquiry",
  "estimated_value": 200,
  "notes": "Asked about first visit.",
  "next_follow_up_date": "2026-06-12",
  "appointment_status": "Not Scheduled",
  "patient_type": "New Patient",
  "appointment_request": "Friday around 10 AM",
  "offer_type": "None",
  "last_visit_date": null,
  "expected_visit_frequency_days": null,
  "assigned_follow_up_owner": "Front Desk",
  "follow_up_outcome": "Not Contacted"
}
```

### `PATCH /inquiries/:id`

Updates inquiry details, status, appointment context, reactivation timing, notes, and follow-up ownership.

JSON body:

```json
{
  "name": "Jordan Smith",
  "phone": "404-555-0198",
  "email": "jordan@example.com",
  "service_needed": "Spinal Adjustment",
  "source": "Website",
  "status": "Consultation Scheduled",
  "estimated_value": 250,
  "notes": "Booked consultation.",
  "next_follow_up_date": "2026-06-14"
}
```

All clinic workflow fields are optional. Existing inquiry records remain valid without them.

### `GET /duplicates`

Returns groups of inquiries that look like the same patient recorded more than
once. A group requires a shared name **and** a shared email or phone number.
People who share a contact detail but have different names are treated as a
household and are never returned here.

```json
{
  "groups": [[]],
  "total": 0
}
```

### `POST /inquiries/:id/merge`

Folds another inquiry into the one named by `:id` and deletes it. The request
body names the record to merge in:

```json
{ "sourceId": "<inquiry id>" }
```

Blank fields on the surviving record are filled from the discarded one, status
keeps whichever record got further, estimated value takes the higher figure
rather than the sum, notes from both are kept, the created date keeps the
earlier and the last visit the later. The discarded record's activity history
is repointed to the survivor and the merge is recorded in the activity log.

Merging is not reversible.

```json
{
  "inquiry": {},
  "movedActivities": 0
}
```

### `GET /reactivations`

Returns the patient reactivation call list. A patient appears when both `last_visit_date` and `expected_visit_frequency_days` are present. Lost inquiries and dead leads are excluded.

The response groups the calculated return timing into:

- `Overdue`
- `Due Today`
- `Upcoming`

## Automated Intake

### `POST /public/inquiries`

Creates a patient inquiry from the public intake form.

The backend automatically sets:

- status: `Follow-Up Needed`
- follow-up date based on source/service rules
- estimated value based on requested service

JSON body:

```json
{
  "name": "Taylor Brooks",
  "phone": "404-555-0100",
  "email": "taylor@example.com",
  "service_needed": "Sports Injury Treatment",
  "source": "Google",
  "notes": "Submitted from website."
}
```

Public and webhook intake routes include a lightweight in-memory rate limit to reduce accidental spam.

### `POST /webhooks/inquiries`

Creates a patient inquiry from a no-code form tool or website builder.

Accepted field aliases:

- `name`, `patient_name`, `full_name`
- `phone`
- `email`
- `service_needed`, `requested_service`, `service`
- `source`
- `notes`, `message`, `Message`
- `patient_type`, `Patient Type`
- `appointment_status`, `Appointment Status`
- `appointment_request`, `requested_appointment`, `Requested Appointment`
- `offer_type`, `Offer Type`
- `last_visit_date`, `Last Visit Date`
- `expected_visit_frequency_days`, `visit_frequency_days`, `Visit Frequency Days`
- `assigned_follow_up_owner`, `follow_up_owner`, `Assigned Follow-Up Owner`
- `follow_up_outcome`, `Follow-Up Outcome`

### `POST /imports/inquiries.csv/preview`

Previews an existing inquiry CSV before import. The response flags duplicate emails or phone numbers and rows with missing required fields.
Quoted fields may contain commas, escaped double quotes, and line breaks. Blank clinic workflow fields remain optional. Nonblank `Last Visit Date` values must use `YYYY-MM-DD` and represent a real date, while nonblank `Visit Frequency Days` values must be positive whole numbers.

Header:

```text
Content-Type: text/csv
```

Response:

```json
{
  "totalRows": 1,
  "importableRows": 1,
  "duplicateRows": 0,
  "errorRows": 0,
  "rows": [
    {
      "rowNumber": 2,
      "name": "Morgan Allen",
      "phone": "404-555-0121",
      "email": "morgan@example.com",
      "service_needed": "Spinal Adjustment",
      "source": "Website",
      "estimated_value": 200,
      "duplicate": false,
      "errors": []
    }
  ]
}
```

### `POST /imports/inquiries.csv`

Imports existing inquiries from a CSV request body.
Duplicate emails or phone numbers are skipped. Rows with missing required fields are returned as errors.

Header:

```text
Content-Type: text/csv
```

Example CSV:

```csv
name,phone,email,service_needed,source,notes,estimated_value
Morgan Allen,404-555-0121,morgan@example.com,Spinal Adjustment,Website,Imported inquiry,200
```

Response:

```json
{"imported":1,"skippedDuplicates":0,"failed":0,"errors":[]}
```

## Reports

### `GET /kpis`

Returns dashboard KPI values.

### `GET /weekly-summary`

Returns the weekly practice summary.

### `GET /monthly-summary`

Returns a month-to-date owner report.

## Activity

### `GET /activities`

Returns recent activity history for inquiry creation and updates.

## Reminders

### `POST /reminders/daily-summary`

Sends an internal staff follow-up summary when SMTP is configured. If email is not configured, returns a non-crashing response explaining that notification is skipped.

## Exports

### `GET /exports/inquiries.csv`

Downloads patient inquiries as CSV.

## Demo Utilities

### `POST /demo/reset`

Resets demo data only when `BUSINESS_OS_DEMO_MODE=true`.

### `POST /seed`

Seeds demo data only when the database is empty.
