# Demo Troubleshooting Guide

Use this guide when a demo does not look right.

## App Does Not Start

- Confirm dependencies are installed:

```bash
pip install -r requirements.txt
```

- Run from the repository folder:

```bash
python3 -m streamlit run app.py
```

- If the port is busy, stop the other Streamlit process or choose another port.

## Dashboard Looks Empty

- Confirm `data/chiropractor_sample_data.csv` exists.
- Use demo mode and click `Reset demo data`.
- If needed, delete `data/business_os.sqlite` and restart the app locally.

## Demo Data Looks Weak Or Stale

- Reset demo data before the call.
- Confirm the Dashboard shows 15 inquiries.
- Confirm follow-up urgency and estimated treatment value are visible.

## CSV Export Fails

- Refresh the app.
- Confirm inquiries exist before exporting.
- Confirm the local `exports/` folder exists if using generated files outside Streamlit downloads.

## Browser Shows A Streamlit Error

- Read the error message.
- Stop and restart the app.
- Run `python3 -m compileall .` to catch syntax issues.
- Avoid making live code changes during a sales demo.

## Buyer Asks About HIPAA

- Be direct: the demo uses fake data.
- Explain that real patient data requires a separate compliance, hosting, access-control, and policy plan.
- Do not claim HIPAA production readiness from the demo.
