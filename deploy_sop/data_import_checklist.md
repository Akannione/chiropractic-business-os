# Data Import Checklist

Use this checklist when preparing demo or client sample data.

## Data Rules

- [ ] Use fake data for demos.
- [ ] Do not include real patient health information unless a production compliance plan exists.
- [ ] Keep the existing database schema unchanged.
- [ ] Keep CSV headers aligned with `data/chiropractor_sample_data.csv`.

## CSV Preparation

- [ ] Confirm patient names are fake.
- [ ] Confirm phone numbers and emails are fake.
- [ ] Include all supported statuses.
- [ ] Include all supported inquiry sources.
- [ ] Include overdue follow-ups.
- [ ] Include due-today follow-ups.
- [ ] Include future follow-ups.
- [ ] Include active patients and lost inquiries.

## Reseeding

- [ ] For local manual reseed, delete `data/business_os.sqlite`.
- [ ] For demo mode, set `BUSINESS_OS_DEMO_MODE=true`.
- [ ] Use sidebar `Reset demo data`.
- [ ] Confirm database has 15 sample inquiries.
- [ ] Confirm Dashboard and Weekly Summary are populated.

## Validation

- [ ] Confirm Total Patient Inquiries is greater than zero.
- [ ] Confirm Follow-Ups Needed is greater than zero.
- [ ] Confirm Overdue Follow-Ups is greater than zero.
- [ ] Confirm Active Patients is greater than zero.
- [ ] Confirm Estimated Treatment Value is meaningful.
