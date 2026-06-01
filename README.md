# Chiropractic Business OS MVP

A simple Streamlit + SQLite operating dashboard for a chiropractic practice. It stores patient inquiries, tracks follow-ups, shows Estimated Treatment Value, generates an on-screen weekly practice summary, and exports CSV files.

Prepared for a June 15 chiropractor demo. The app is intentionally focused on practice-owner clarity, patient inquiry follow-up, and treatment revenue visibility.

## Features

- Patient inquiry intake form
- SQLite patient inquiry database
- KPI dashboard
- Patient inquiry details with follow-up scheduling
- Weekly practice summary with a printable Practice Performance Snapshot
- CSV export
- Chiropractic demo sample data

## Project Structure

```text
business_os_mvp/
  app.py
  requirements.txt
  README.md
  .env.example
  data/
    business_os.sqlite
  exports/
  src/
    business_os/
      __init__.py
      db.py
      reports.py
      sample_data.py
```

## Setup

From this repository folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
streamlit run app.py
```

If the `streamlit` command is not on your PATH, use:

```bash
python3 -m streamlit run app.py
```

Or run the included launcher:

```bash
./run_app.sh
```

The app initializes `data/business_os.sqlite` automatically and seeds chiropractic sample inquiries when the database is empty.

Optional environment variable:

```bash
BUSINESS_OS_DB_PATH=data/business_os.sqlite
```

If this path is relative, the app resolves it from the `business_os_mvp/` folder. Use an absolute path only when the deployment host gives you persistent disk storage.

## Demo Workflow

1. Open the Dashboard tab to review patient inquiries, follow-ups, and estimated treatment value.
2. Add a patient inquiry from the Patient Inquiries tab.
3. Use Inquiry Details and Follow-Up to update status or next follow-up date.
4. Review the weekly practice summary and generate a Practice Performance Snapshot from the Weekly Summary tab.
5. Download the snapshot, all inquiries, or the follow-up queue as CSV/text exports.

## Demo Status Labels

- `New Inquiry`
- `Consultation Scheduled`
- `Active Patient`
- `Lost`
- `Follow-Up Needed`

## Demo Inquiry Sources

- `Google`
- `Referral`
- `Insurance`
- `Website`
- `Phone Call`

## Database Fields

The SQLite table is still named `leads` internally to preserve the original MVP schema. In the app, these records are shown as patient inquiries.

- `id`
- `name`
- `phone`
- `email`
- `service_needed`
- `source`
- `status`
- `estimated_value`
- `notes`
- `next_follow_up_date`
- `created_at`
- `updated_at`

## Deployment

### Streamlit Community Cloud

1. Push this project to GitHub.
2. In Streamlit Community Cloud, create a new app from the repository.
3. Set the main file path to:

```text
app.py
```

4. Streamlit will install dependencies from:

```text
requirements.txt
```

5. Optional environment variable in Streamlit secrets:

```toml
BUSINESS_OS_DB_PATH = "data/business_os.sqlite"
```

For a demo, the default relative SQLite path is fine. Streamlit Community Cloud storage can reset on redeploy, so treat the bundled SQLite database as demo data unless persistent storage is added later.

### Render

1. Create a new Render Web Service from the GitHub repository.
2. Use Python as the runtime.
3. Set the build command:

```bash
pip install -r requirements.txt
```

4. Set the start command:

```bash
python3 -m streamlit run app.py --server.port $PORT --server.address 0.0.0.0
```

5. Optional environment variable:

```text
BUSINESS_OS_DB_PATH=data/business_os.sqlite
```

For a real hosted demo, configure a Render persistent disk and set `BUSINESS_OS_DB_PATH` to a path on that disk, such as `/var/data/business_os.sqlite`. Without persistent disk storage, SQLite data may reset when the service restarts or redeploys.

### SQLite Persistence Notes

- Local runs store data in `data/business_os.sqlite` by default.
- `BUSINESS_OS_DB_PATH` can point to a different relative or absolute SQLite path.
- Streamlit Community Cloud does not guarantee persistent local disk storage across redeploys.
- Render needs a persistent disk for SQLite data to survive restarts and redeploys.
- For the June 15 demo, the bundled SQLite sample data is suitable as demo data.

## Local Run Confirmation

The app has been verified locally with:

```bash
python3 -m streamlit run app.py
```

Health check:

```text
http://localhost:8502/_stcore/health -> 200 ok
```

## Notes

This MVP intentionally does not include authentication, payments, external APIs, or AI features. It is built to stay simple and demo-ready for a chiropractic practice owner.
