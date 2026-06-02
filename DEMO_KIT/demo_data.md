# Demo Data

Use the fake chiropractic sample data for every sales demo. Do not use real patient data during outreach.

## Source File

The app demo data lives in:

```text
data/chiropractor_sample_data.csv
```

## Current Demo Story

The sample data is designed to show a strong, realistic practice workflow:

- 15 fake patient inquiries
- Mix of `New Inquiry`, `Consultation Scheduled`, `Active Patient`, `Lost`, and `Follow-Up Needed`
- Mix of `Google`, `Referral`, `Insurance`, `Website`, and `Phone Call`
- Overdue follow-ups
- Follow-ups due today
- Future follow-ups
- Active patients
- Lost inquiries
- Realistic requested chiropractic services

## Demo Positioning

Use the sample data to show that the practice owner can quickly answer:

- How many patient inquiries are in the pipeline?
- Which follow-ups need attention today?
- Which inquiries are overdue?
- Which inquiries became active patients?
- What estimated treatment value is still available?
- Which source is producing the most inquiries?

## Data Safety

- Keep all demo records fake.
- Do not paste real patient names, phone numbers, emails, or notes into the demo.
- Treat production patient data as out of scope unless a compliance and deployment plan is created separately.
