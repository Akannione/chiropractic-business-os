# Client Handoff Document

Use this after setup and training so the first paying client has a clear operating reference.

## Client Details

```text
Practice:
Primary contact:
Role:
Deployment date:
Deployment URL or local path:
Database path:
Support contact:
Next review date:
```

## What Was Delivered

- Chiropractic Business OS practice dashboard.
- Patient inquiry tracking workflow.
- Follow-up tracking workflow.
- Weekly Practice Summary workflow.
- Patient-friendly CSV export workflow.
- Training session for owner, office manager, or front desk.
- Basic handoff documentation.

## How To Access The System

Hosted deployment:

```text
Open:
[deployment URL]
```

Local deployment:

```bash
python3 -m streamlit run app.py
```

If using the launcher:

```bash
./run_app.sh
```

## How To Use The System

Daily:

- Add new patient inquiries.
- Update inquiry status.
- Set next follow-up dates.
- Review overdue and due-today follow-ups.

Weekly:

- Open the Dashboard.
- Review Follow-Ups Needed.
- Review Active Patients.
- Review Estimated Treatment Value.
- Open Weekly Summary.
- Decide what needs attention before next week.

## How To Export Data

1. Open the Export tab.
2. Download the patient inquiry CSV.
3. Download the follow-up CSV if needed.
4. Store exports according to the practice's internal privacy and data-handling rules.

Export reminder:

```text
Exports are useful for review and backup. Do not share files containing real patient information unless the practice has approved the privacy process.
```

## Monthly Review Process

During the monthly review:

- Confirm the app still opens correctly.
- Confirm inquiry count looks expected.
- Review overdue follow-ups.
- Review Active Patients.
- Review Estimated Treatment Value.
- Review which inquiry sources are most active.
- Capture staff confusion or workflow friction.
- Capture feature requests separately before agreeing to build anything.

## Support Process

Use this support flow:

1. Client reports issue or question.
2. Confirm whether the issue is access, data, export, dashboard, or workflow.
3. Ask for a screenshot if helpful.
4. Check whether the database path is writable.
5. Check whether the issue affects all users or one workflow.
6. Resolve, document, or schedule follow-up.

Support boundaries:

- No EHR functionality is included.
- No scheduling functionality is included.
- No billing or insurance functionality is included.
- No production compliance guarantee is included without separate scope.

## Common Troubleshooting Steps

### App Does Not Open

- Confirm the deployment URL is correct.
- For local runs, confirm the virtual environment is active.
- Run `python3 -m streamlit run app.py`.
- Confirm dependencies were installed with `pip install -r requirements.txt`.

### Demo Data Appears In Production Setup

- Confirm `BUSINESS_OS_DEMO_MODE` is unset.
- Confirm the correct `BUSINESS_OS_DB_PATH` is being used.
- Recreate the client database only with client approval.

### Dashboard Looks Empty

- Confirm patient inquiries were imported.
- Confirm the database path points to the expected SQLite file.
- Add one test inquiry with fake data to confirm the workflow.

### Exports Do Not Download

- Refresh the app.
- Confirm there is data to export.
- Try exporting all inquiries first, then follow-ups.

### Follow-Ups Look Wrong

- Confirm `next_follow_up_date` is entered in a valid date format.
- Confirm Lost inquiries are not expected to appear in active follow-up queues.
- Confirm the staff member updated status after the last call or message.

## Final Handoff Confirmation

```text
Access confirmed:
Dashboard reviewed:
Inquiry workflow reviewed:
Follow-up workflow reviewed:
Weekly Summary reviewed:
Export workflow reviewed:
Monthly review date confirmed:
Support process confirmed:
```
