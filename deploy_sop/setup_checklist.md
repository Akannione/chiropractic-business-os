# Setup Checklist

Use this checklist before creating a client-specific Chiropractic Business OS demo or deployment.

## Client Context

- [ ] Confirm practice name.
- [ ] Confirm primary contact and role.
- [ ] Confirm whether this is demo-only or paid setup.
- [ ] Confirm target demo date.
- [ ] Confirm whether only fake data will be used.

## Local Setup

- [ ] Clone or open the repository.
- [ ] Create virtual environment.
- [ ] Install dependencies with `pip install -r requirements.txt`.
- [ ] Confirm `python3 -m streamlit run app.py` works locally.
- [ ] Confirm `run_app.sh` works if using the launcher.

## Environment

- [ ] Confirm `BUSINESS_OS_DB_PATH`.
- [ ] Use relative path for simple demos.
- [ ] Use persistent disk path only if the host provides persistent storage.
- [ ] Set `BUSINESS_OS_DEMO_MODE=true` only for demos and screenshot capture.

## Demo Data

- [ ] Confirm `data/chiropractor_sample_data.csv` exists.
- [ ] Confirm sample data is fake.
- [ ] Reset demo data before screenshots or walkthroughs.
- [ ] Confirm Dashboard has meaningful KPI values.
- [ ] Confirm Weekly Summary is populated.
