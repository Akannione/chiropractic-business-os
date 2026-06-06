# Legacy Streamlit + SQLite Version

This folder contains the previous Python Streamlit MVP.

It is kept for reference only. The current primary application is the full-stack version in:

- `backend/` for the Node.js + TypeScript API
- `frontend/` for the React + TypeScript UI
- MongoDB for the active database

## What This Legacy Version Uses

- Python
- Streamlit
- SQLite
- Pandas
- Plotly

## Run The Legacy App

From this folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 -m streamlit run app.py
```

Or:

```bash
./run_app.sh
```

## Legacy Data

The legacy app stores SQLite data under this folder by default:

```text
legacy/streamlit_sqlite/data/business_os.sqlite
```

The tracked demo CSV is:

```text
legacy/streamlit_sqlite/data/chiropractor_sample_data.csv
```

## Do Not Confuse This With The Main App

Use this folder only when you need to compare against the original MVP behavior. New development should happen in the full-stack app unless a task explicitly says to update the legacy Streamlit version.
