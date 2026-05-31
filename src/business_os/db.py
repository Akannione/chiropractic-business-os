from __future__ import annotations

import sqlite3
from datetime import datetime
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
    db_path.parent.mkdir(parents=True, exist_ok=True)
    connection = sqlite3.connect(db_path)
    connection.row_factory = sqlite3.Row
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
        connection.commit()


def seed_sample_data_if_empty(db_path: Path) -> int:
    with connect(db_path) as connection:
        count = connection.execute("SELECT COUNT(*) FROM leads").fetchone()[0]
        if count:
            refresh_demo_data_for_chiropractor(connection)
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


def refresh_demo_data_for_chiropractor(connection: sqlite3.Connection) -> int:
    rows = build_sample_leads()
    existing_ids = [
        int(row["id"])
        for row in connection.execute("SELECT id FROM leads ORDER BY id LIMIT ?", (len(rows),)).fetchall()
    ]
    if not existing_ids:
        return 0

    updated = 0
    for lead_id, row in zip(existing_ids, rows, strict=False):
        connection.execute(
            """
            UPDATE leads
            SET name = ?,
                phone = ?,
                email = ?,
                service_needed = ?,
                source = ?,
                status = ?,
                estimated_value = ?,
                notes = ?,
                next_follow_up_date = ?,
                updated_at = ?
            WHERE id = ?
            """,
            (
                row["name"],
                row["phone"],
                row["email"],
                row["service_needed"],
                row["source"],
                row["status"],
                row["estimated_value"],
                row["notes"],
                row["next_follow_up_date"],
                row["updated_at"],
                lead_id,
            ),
        )
        updated += 1
    connection.commit()
    return updated


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
                next_follow_up_date,
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
    with connect(db_path) as connection:
        connection.execute(
            """
            UPDATE leads
            SET status = ?, next_follow_up_date = ?, notes = ?, updated_at = ?
            WHERE id = ?
            """,
            (status, next_follow_up_date, notes.strip(), now, int(lead_id)),
        )
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
    prepared["created_at_dt"] = pd.to_datetime(prepared["created_at"], errors="coerce")
    prepared["updated_at_dt"] = pd.to_datetime(prepared["updated_at"], errors="coerce")
    prepared["next_follow_up_dt"] = pd.to_datetime(
        prepared["next_follow_up_date"].replace("", pd.NA), errors="coerce"
    )
    prepared["is_closed"] = prepared["status"].isin(CLOSED_STATUSES)
    prepared["is_open"] = ~prepared["is_closed"]
    today = pd.Timestamp.today().normalize()
    prepared["is_overdue"] = prepared["is_open"] & prepared["next_follow_up_dt"].notna() & (
        prepared["next_follow_up_dt"] < today
    )
    return prepared


def export_csv(frame: pd.DataFrame) -> bytes:
    return frame[REQUIRED_COLUMNS].to_csv(index=False).encode("utf-8")
