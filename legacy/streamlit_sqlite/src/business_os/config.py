from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class BusinessOSConfig:
    app_title: str
    app_caption: str
    about_text: str
    entity_singular: str
    entity_plural: str
    owner_label: str
    workspace_label: str
    dashboard_title: str
    dashboard_description: str
    service_label: str
    value_label: str
    source_label: str
    status_label: str
    service_examples: tuple[str, ...]
    statuses: tuple[str, ...]
    closed_statuses: frozenset[str]
    active_status: str
    lost_status: str
    followup_needed_status: str
    sources: tuple[str, ...]
    kpi_labels: dict[str, str]
    kpi_help: dict[str, str]
    display_labels: dict[str, str]
    export_columns: tuple[str, ...]
    export_filename_prefixes: dict[str, str]
    snapshot_title: str
    weekly_summary_title: str
    weekly_summary_caption: str
    weekly_empty_message: str
    no_records_message: str
    snapshot_empty_summary: str
    sample_data_file: Path


CHIRO_CONFIG = BusinessOSConfig(
    app_title="Chiropractic Business OS",
    app_caption=(
        "Patient inquiry capture, follow-up scheduling, weekly summaries, and CSV exports "
        "for a chiropractic practice."
    ),
    about_text=(
        "A simple chiropractic practice dashboard for patient inquiries, follow-ups, "
        "and weekly performance."
    ),
    entity_singular="patient inquiry",
    entity_plural="patient inquiries",
    owner_label="practice owner",
    workspace_label="practice",
    dashboard_title="Practice Dashboard",
    dashboard_description=(
        "Start here: see the treatment value at risk, who needs follow-up, "
        "and which inquiries became active patients."
    ),
    service_label="Requested Service",
    value_label="Estimated Treatment Value",
    source_label="Inquiry Source",
    status_label="Status",
    service_examples=("Spinal Adjustment", "Sports Injury Treatment", "Wellness Consultation"),
    statuses=(
        "New Inquiry",
        "Consultation Scheduled",
        "Active Patient",
        "Lost",
        "Follow-Up Needed",
    ),
    closed_statuses=frozenset({"Active Patient", "Lost"}),
    active_status="Active Patient",
    lost_status="Lost",
    followup_needed_status="Follow-Up Needed",
    sources=("Google", "Referral", "Insurance", "Website", "Phone Call"),
    kpi_labels={
        "total": "Total Patient Inquiries",
        "new_this_week": "New This Week",
        "followups_needed": "Follow-Ups Needed",
        "overdue_followups": "Overdue Follow-Ups",
        "active": "Active Patients",
        "value": "Estimated Treatment Value",
        "conversion_rate": "Conversion Rate",
        "top_source": "Top Inquiry Source",
    },
    kpi_help={
        "total": "Every patient inquiry currently saved in the Business OS.",
        "new_this_week": "Patient inquiries created during the current week, starting Monday.",
        "followups_needed": (
            "Inquiries marked Follow-Up Needed or due for follow-up today or earlier. "
            "Lost inquiries are excluded."
        ),
        "overdue_followups": "Inquiries with a follow-up date before today. Lost inquiries are excluded.",
        "active": "Patient inquiries currently marked Active Patient.",
        "value": (
            "The total potential treatment revenue from patient inquiries that have not "
            "been marked Lost."
        ),
        "conversion_rate": "The share of all patient inquiries that became Active Patients.",
        "top_source": "The inquiry source with the highest number of patient inquiries.",
    },
    display_labels={
        "id": "ID",
        "name": "Patient Name",
        "phone": "Phone",
        "email": "Email",
        "service_needed": "Requested Service",
        "source": "Inquiry Source",
        "status": "Status",
        "estimated_value": "Estimated Treatment Value",
        "notes": "Notes",
        "next_follow_up_date": "Next Follow-Up Date",
        "created_at": "Created",
        "updated_at": "Updated",
    },
    export_columns=(
        "name",
        "phone",
        "email",
        "service_needed",
        "source",
        "status",
        "estimated_value",
        "notes",
        "next_follow_up_date",
    ),
    export_filename_prefixes={
        "inquiries": "patient_inquiries",
        "followups": "patient_followups",
        "snapshot": "practice_snapshot",
    },
    snapshot_title="Practice Performance Snapshot",
    weekly_summary_title="Weekly Practice Summary",
    weekly_summary_caption=(
        "A simple owner-ready summary of inquiry activity, active patients, "
        "follow-up pressure, and estimated treatment value."
    ),
    weekly_empty_message="No weekly data yet. Add patient inquiries to generate a practice summary.",
    no_records_message="No patient inquiries are currently stored.",
    snapshot_empty_summary=(
        "No patient inquiries are currently stored. Add a few inquiries to generate "
        "a useful practice snapshot."
    ),
    sample_data_file=Path("data/chiropractor_sample_data.csv"),
)


APP_CONFIG = CHIRO_CONFIG

