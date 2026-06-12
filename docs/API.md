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
{"ok":true,"service":"Chiropractic Business OS API"}
```

## Configuration

### `GET /config`

Returns practice labels, status options, inquiry sources, requested services, KPI help text, and demo-mode state.

## Patient Inquiries

### `GET /inquiries`

Returns all patient inquiries, sorted newest first.

### `POST /inquiries`

Creates a staff-entered patient inquiry.

Required JSON fields:

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
  "next_follow_up_date": "2026-06-12"
}
```

### `PATCH /inquiries/:id`

Updates inquiry status, notes, and follow-up date.

JSON body:

```json
{
  "status": "Consultation Scheduled",
  "notes": "Booked consultation.",
  "next_follow_up_date": "2026-06-14"
}
```

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

### `POST /webhooks/inquiries`

Creates a patient inquiry from a no-code form tool or website builder.

Accepted field aliases:

- `name`, `patient_name`, `full_name`
- `phone`
- `email`
- `service_needed`, `requested_service`, `service`
- `source`
- `notes`, `message`, `Message`

### `POST /imports/inquiries.csv`

Imports existing inquiries from a CSV request body.

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
{"imported":1,"failed":0,"errors":[]}
```

## Reports

### `GET /kpis`

Returns dashboard KPI values.

### `GET /weekly-summary`

Returns the weekly practice summary.

## Exports

### `GET /exports/inquiries.csv`

Downloads patient inquiries as CSV.

## Demo Utilities

### `POST /demo/reset`

Resets demo data only when `BUSINESS_OS_DEMO_MODE=true`.

### `POST /seed`

Seeds demo data only when the database is empty.
