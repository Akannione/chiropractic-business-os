from __future__ import annotations

import sqlite3
from datetime import date, datetime
from pathlib import Path

import pandas as pd

from business_os.sample_data import build_sample_leads


STATUSES = ["New Inquiry", "Consultation Scheduled", "Active Patient", "Lost", "Follow-Up Needed"]
CLOSED_STATUSES = {"Active Patient", "Lost"}
STATUS_ALIASES = {
    "New": "New Inquiry",
    "New Lead": "New Inquiry",
    "Contacted": "Consultation Scheduled",
    "Proposal Sent": "Follow-Up Needed",
    "Estimate Sent": "Follow-Up Needed",
    "Closed Won": "Active Patient",
    "Won": "Active Patient",
    "Closed Lost": "Lost",
}
SOURCE_ALIASES = {
    "LinkedIn": "Google",
    "Facebook Group": "Website",
    "Local Networking": "Referral",
    "Cold Email": "Phone Call",
    "Walk-In": "Phone Call",
    "Other": "Phone Call",
}
REQUIRED_COLUMNS = [
    "id",
    "name",
    "phone",
    "email",
    "service_needed",
    "source",
    "status",
    "estimated_value",
    "notes",
    "next_follow_up_date",
    "created_at",
    "updated_at",
]


def connect(db_path: Path) -> sqlite3.Connection:
    resolved_path = db_path.expanduser()
    resolved_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(resolved_path, timeout=10)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    connection.execute("PRAGMA journal_mode = WAL")
    return connection


def initialize_database(db_path: Path) -> None:
    with connect(db_path) as connection:
        connection.execute(
            """
            CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT,
                email TEXT,
                service_needed TEXT NOT NULL,
                source TEXT NOT NULL,
                status TEXT NOT NULL,
                estimated_value REAL NOT NULL DEFAULT 0,
                notes TEXT,
                next_follow_up_date TEXT,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )
        migrate_existing_labels(connection)
        connection.commit()


def migrate_existing_labels(connection: sqlite3.Connection) -> None:
    for old_status, new_status in STATUS_ALIASES.items():
        connection.execute(
            "UPDATE leads SET status = ? WHERE status = ?",
            (new_status, old_status),
        )
    for old_source, new_source in SOURCE_ALIASES.items():
        connection.execute(
            "UPDATE leads SET source = ? WHERE source = ?",
            (new_source, old_source),
        )


def seed_sample_data_if_empty(db_path: Path) -> int:
    with connect(db_path) as connection:
        count = connection.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        if count:
            return 0

        rows = build_sample_leads()
        connection.executemany(
            """
            INSERT INTO leads (
                name, phone, email, service_needed, source, status,
                estimated_value, notes, next_follow_up_date, created_at, updated_at
            )
            VALUES (
                :name, :phone, :email, :service_needed, :source, :status,
                :estimated_value, :notes, :next_follow_up_date, :created_at, :updated_at
            )
            """,
            rows,
        )
        connection.commit()
        return len(rows)


def reset_sample_data(db_path: Path) -> int:
    """Replace current records with fresh fake chiropractic demo data."""
    with connect(db_path) as connection:
        connection.execute("DELETE FROM leads")
        connection.execute("DELETE FROM sqlite_sequence WHERE name = 'leads'")
        rows = build_sample_leads()
        connection.executemany(
            """
            INSERT INTO leads (
                name, phone, email, service_needed, source, status,
                estimated_value, notes, next_follow_up_date, created_at, updated_at
            )
            VALUES (
                :name, :phone, :email, :service_needed, :source, :status,
                :estimated_value, :notes, :next_follow_up_date, :created_at, :updated_at
            )
            """,
            rows,
        )
        connection.commit()
        return len(rows)


def format_date(value: date | datetime | str | None) -> str:
    if value is None:
        return ""
    if isinstance(value, datetime):
        return value.date().isoformat()
    if isinstance(value, date):
        return value.isoformat()
    parsed = pd.to_datetime(str(value).strip(), errors="coerce", format="mixed")
    if pd.isna(parsed):
        return ""
    return parsed.date().isoformat()


def insert_lead(
    db_path: Path,
    *,
    name: str,
    phone: str,
    email: str,
    service_needed: str,
    source: str,
    status: str,
    estimated_value: float,
    notes: str,
    next_follow_up_date: str,
) -> int:
    now = datetime.now().replace(microsecond=0).isoformat(sep=" ")
    follow_up = format_date(next_follow_up_date)
    with connect(db_path) as connection:
        cursor = connection.execute(
            """
            INSERT INTO leads (
                name, phone, email, service_needed, source, status,
                estimated_value, notes, next_follow_up_date, created_at, updated_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                name.strip(),
                phone.strip(),
                email.strip(),
                service_needed.strip(),
                source.strip(),
                status,
                float(estimated_value or 0),
                notes.strip(),
                follow_up,
                now,
                now,
            ),
        )
        connection.commit()
        return int(cursor.lastrowid)


def update_lead_followup(
    db_path: Path,
    *,
    lead_id: int,
    status: str,
    next_follow_up_date: str,
    notes: str,
) -> None:
    now = datetime.now().replace(microsecond=0).isoformat(sep=" ")
    follow_up = format_date(next_follow_up_date)
    with connect(db_path) as connection:
        cursor = connection.execute(
            """
            UPDATE leads
            SET status = ?, next_follow_up_date = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, follow_up, notes.strip(), now, int(lead_id)),
        )
        if cursor.rowcount == 0:
            raise ValueError(f"No patient inquiry found for id {lead_id}.")
        connection.commit()


def fetch_leads(db_path: Path) -> pd.DataFrame:
    with connect(db_path) as connection:
        frame = pd.read_sql_query(
            """
            SELECT id, name, phone, email, service_needed, source, status,
                   estimated_value, notes, next_follow_up_date, created_at, updated_at
            FROM leads
            ORDER BY datetime(created_at) DESC, id DESC
            """,
            connection,
        )

    for column in REQUIRED_COLUMNS:
        if column not in frame.columns:
            frame[column] = ""
    return frame[REQUIRED_COLUMNS]


def prepare_leads_frame(frame: pd.DataFrame) -> pd.DataFrame:
    if frame.empty:
        return frame.copy()

    prepared = frame.copy()
    for column in REQUIRED_COLUMNS:
        if column not in prepared.columns:
            prepared[column] = ""
    prepared["estimated_value"] = pd.to_numeric(prepared["estimated_value"], errors="coerce").fillna(0)
    prepared["created_at_dt"] = pd.to_datetime(prepared["created_at"], errors="coerce", format="mixed")
    prepared["updated_at_dt"] = pd.to_datetime(prepared["updated_at"], errors="coerce", format="mixed")
    prepared["next_follow_up_dt"] = pd.to_datetime(
        prepared["next_follow_up_date"].replace("", pd.NA), errors="coerce", format="mixed"
    )
    prepared["is_closed"] = prepared["status"].isin(CLOSED_STATUSES)
    prepared["is_open"] = ~prepared["is_closed"]
    today = pd.Timestamp.today().normalize()
    prepared["is_overdue"] = prepared["is_open"] & prepared["next_follow_up_dt"].notna() & (
        prepared["next_follow_up_dt"] < today
    )
    return prepared
