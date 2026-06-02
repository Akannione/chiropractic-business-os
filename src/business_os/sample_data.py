from __future__ import annotations

import csv
from datetime import date, datetime, timedelta
from pathlib import Path

from business_os.config import APP_CONFIG

SAMPLE_DATA_FILE = Path(__file__).resolve().parents[2] / APP_CONFIG.sample_data_file


def build_sample_leads(today: date | None = None, csv_path: Path | None = None) -> list[dict[str, object]]:
    """Load fake demo inquiries from CSV and convert relative dates."""
    today = today or date.today()
    path = csv_path or SAMPLE_DATA_FILE
    if not path.exists():
        raise FileNotFoundError(f"Sample data CSV was not found at {path}.")

    rows: list[dict[str, object]] = []
    with path.open(newline="", encoding="utf-8") as file:
        for raw in csv.DictReader(file):
            rows.append(_normalize_sample_row(raw, today))
    return rows


def _normalize_sample_row(raw: dict[str, str], today: date) -> dict[str, object]:
    created_date = today + timedelta(days=_parse_int(raw.get("created_offset_days"), default=0))
    followup_offset = raw.get("next_follow_up_offset_days", "").strip()
    followup_date = ""
    if followup_offset:
        followup_date = (today + timedelta(days=_parse_int(followup_offset, default=0))).isoformat()

    return {
        "name": raw.get("name", "").strip(),
        "phone": raw.get("phone", "").strip(),
        "email": raw.get("email", "").strip(),
        "service_needed": raw.get("service_needed", "").strip(),
        "source": raw.get("source", "").strip(),
        "status": raw.get("status", "").strip(),
        "estimated_value": _parse_float(raw.get("estimated_value")),
        "notes": raw.get("notes", "").strip(),
        "next_follow_up_date": followup_date,
        "created_at": f"{created_date.isoformat()} 09:00:00",
        "updated_at": datetime.now().replace(microsecond=0).isoformat(sep=" "),
    }


def _parse_int(value: str | None, *, default: int) -> int:
    try:
        return int(str(value or "").strip())
    except ValueError:
        return default


def _parse_float(value: str | None) -> float:
    try:
        return float(str(value or "0").strip())
    except ValueError:
        return 0.0
