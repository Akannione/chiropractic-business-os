# Deployment Checklist

Use this checklist when deploying the Chiropractic Business OS for a demo or client walkthrough.

## Pre-Deployment

- [ ] Confirm latest `main` branch is pushed.
- [ ] Confirm requirements are listed in `requirements.txt`.
- [ ] Confirm README deployment instructions are current.
- [ ] Confirm `.env.example` includes relevant environment variables.
- [ ] Confirm no local SQLite database file is accidentally required for deployment.

## Streamlit Community Cloud

- [ ] Connect GitHub repository.
- [ ] Set main file path to `app.py`.
- [ ] Confirm dependencies install from `requirements.txt`.
- [ ] Optionally set `BUSINESS_OS_DB_PATH = "data/business_os.sqlite"`.
- [ ] Understand local disk persistence may reset after redeploy.
- [ ] Run deployed app and confirm Dashboard loads.

## Render

- [ ] Create Python web service from GitHub repository.
- [ ] Set build command: `pip install -r requirements.txt`.
- [ ] Set start command: `python3 -m streamlit run app.py --server.port $PORT --server.address 0.0.0.0`.
- [ ] Set `BUSINESS_OS_DB_PATH`.
- [ ] Add persistent disk before using real client data.
- [ ] Run deployed app and confirm health.

## Post-Deployment

- [ ] Confirm patient inquiry intake form works.
- [ ] Confirm KPIs render.
- [ ] Confirm Weekly Summary renders.
- [ ] Confirm CSV downloads work.
- [ ] Confirm no schema changes were introduced.
