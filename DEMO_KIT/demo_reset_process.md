# Demo Reset Process

Use this process before every live demo, recorded walkthrough, or screenshot refresh.

## Preferred Reset

1. Start the app with demo mode enabled:

```bash
BUSINESS_OS_DEMO_MODE=true python3 -m streamlit run app.py
```

2. Open the app in the browser.
3. Use the sidebar `Reset demo data` button.
4. Confirm the Dashboard shows the expected sample story.

## Manual Local Reset

If the reset button is unavailable:

1. Stop the Streamlit app.
2. Delete the local SQLite database:

```bash
rm data/business_os.sqlite
```

3. Restart the app:

```bash
python3 -m streamlit run app.py
```

4. Confirm the sample data was seeded from `data/chiropractor_sample_data.csv`.

## Expected Demo Story

- 15 patient inquiries
- Estimated Treatment Value around `$3,325`
- Follow-Ups Needed visible
- Overdue Follow-Ups visible
- Active Patients visible
- Top Inquiry Source visible

## Safety

- Only reset demo or local test data.
- Do not run the reset process against a production database.
- Do not use real patient records for outreach demos.
