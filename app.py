from __future__ import annotations

import sys
import re
import os
from datetime import date, timedelta
from pathlib import Path

import pandas as pd
import streamlit as st


APP_ROOT = Path(__file__).resolve().parent
SRC_ROOT = APP_ROOT / "src"
EXPORT_DIR = APP_ROOT / "exports"

if str(SRC_ROOT) not in sys.path:
    sys.path.insert(0, str(SRC_ROOT))

from business_os.db import (  # noqa: E402
    REQUIRED_COLUMNS,
    STATUSES,
    fetch_leads,
    initialize_database,
    insert_lead,
    prepare_leads_frame,
    seed_sample_data_if_empty,
    update_lead_followup,
)
from business_os.reports import build_weekly_summary, calculate_kpis  # noqa: E402


SOURCES = [
    "Google",
    "Referral",
    "Insurance",
    "Website",
    "Phone Call",
]
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9\s().-]{6,19}$")

KPI_HELP = {
    "Total inquiries": "Every patient inquiry currently saved in the Business OS.",
    "New this week": "Patient inquiries created since Monday of the current week.",
    "Needs follow-up": "Patient inquiries marked Follow-Up Needed or with a follow-up date due today or earlier.",
    "Active patients": "Inquiries now marked Active Patient.",
    "Overdue": "Patient inquiries needing follow-up with a date before today.",
    "Estimated treatment value": "The total potential treatment revenue from patient inquiries that have not been marked Lost.",
}


def get_db_path() -> Path:
    configured = os.environ.get("BUSINESS_OS_DB_PATH", "data/business_os.sqlite").strip()
    if not configured:
        configured = "data/business_os.sqlite"
    path = Path(configured).expanduser()
    if not path.is_absolute():
        path = APP_ROOT / path
    return path


def bootstrap() -> pd.DataFrame:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    db_path = get_db_path()
    initialize_database(db_path)
    seed_sample_data_if_empty(db_path)
    return prepare_leads_frame(fetch_leads(db_path))


def money(value: float | int) -> str:
    return f"${float(value):,.0f}"


def percent(value: float | int) -> str:
    return f"{float(value):.1f}%"


def get_plotly_express():
    try:
        import plotly.express as px
    except ModuleNotFoundError:
        return None
    return px


def validate_lead_form(name: str, phone: str, email: str, service_needed: str) -> list[str]:
    errors: list[str] = []
    if not name.strip():
        errors.append("Name is required.")
    if not phone.strip():
        errors.append("Phone is required.")
    elif not PHONE_PATTERN.match(phone.strip()):
        errors.append("Enter a valid phone number, such as 404-555-0128.")
    if not email.strip():
        errors.append("Email is required.")
    elif not EMAIL_PATTERN.match(email.strip()):
        errors.append("Enter a valid email address, such as owner@example.com.")
    if not service_needed.strip():
        errors.append("Requested Service is required.")
    return errors


def safe_dataframe(frame: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    safe = frame.copy()
    for column in columns:
        if column not in safe.columns:
            safe[column] = ""
    return safe[columns]


def display_frame(frame: pd.DataFrame) -> pd.DataFrame:
    labels = {
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
    }
    return frame.rename(columns={key: value for key, value in labels.items() if key in frame.columns})


def export_csv_for_demo(frame: pd.DataFrame) -> bytes:
    try:
        return display_frame(frame).to_csv(index=False).encode("utf-8")
    except Exception as exc:
        raise ValueError("CSV export could not be prepared.") from exc


def build_snapshot_rows(summary: dict[str, object]) -> list[tuple[str, str]]:
    return [
        ("Date Generated", date.today().isoformat()),
        ("Total Patient Inquiries", str(summary["total_inquiries"])),
        ("New This Week", str(summary["new_inquiries"])),
        ("Active Patients", str(summary["active_patients"])),
        ("Follow-Ups Needed", str(summary["needs_followup"])),
        ("Overdue Follow-Ups", str(summary["overdue_followups"])),
        ("Estimated Treatment Value", money(float(summary["estimated_treatment_value"]))),
        ("Inquiry-to-Patient Conversion Rate", percent(float(summary["conversion_rate"]))),
        ("Top Inquiry Source", str(summary["top_source"])),
    ]


def build_snapshot_text(summary: dict[str, object]) -> bytes:
    lines = ["Practice Performance Snapshot", f"Date generated: {date.today().isoformat()}", ""]
    for label, value in build_snapshot_rows(summary)[1:]:
        lines.append(f"{label}: {value}")
    lines.extend(["", "Plain-English Summary", str(summary["snapshot_summary"])])
    return "\n".join(lines).encode("utf-8")


def build_snapshot_csv(summary: dict[str, object]) -> bytes:
    rows = build_snapshot_rows(summary)
    rows.append(("Plain-English Summary", str(summary["snapshot_summary"])))
    return pd.DataFrame(rows, columns=["Practice Snapshot Metric", "Value"]).to_csv(index=False).encode("utf-8")


def filter_due_today(leads: pd.DataFrame) -> pd.DataFrame:
    if leads.empty or "next_follow_up_dt" not in leads.columns or "is_open" not in leads.columns:
        return pd.DataFrame()
    today = pd.Timestamp.today().normalize()
    return leads[
        leads["is_open"]
        & leads["next_follow_up_dt"].notna()
        & (leads["next_follow_up_dt"] == today)
    ].copy()


def render_style() -> None:
    st.markdown(
        """
<style>
    .block-container {max-width: 1320px; padding-top: 1.25rem; padding-bottom: 2rem;}
    div[data-testid="stMetric"] {
        border: 1px solid #d7dee8;
        border-radius: 8px;
        padding: 0.85rem 0.95rem;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    .section-note {
        color: #526070;
        font-size: 0.94rem;
        margin-bottom: 0.85rem;
    }
    .report-box {
        border: 1px solid #d7dee8;
        border-radius: 8px;
        padding: 1rem 1.15rem;
        background: #fbfcfe;
    }
    .snapshot-box {
        border: 1px solid #bdd3ff;
        border-radius: 8px;
        padding: 1.1rem 1.2rem;
        background: #f7faff;
        margin-top: 1rem;
    }
    .snapshot-title {
        font-size: 1.15rem;
        font-weight: 700;
        color: #172033;
        margin-bottom: 0.25rem;
    }
    .signal-box {
        border: 1px solid #d7dee8;
        border-radius: 8px;
        padding: 0.85rem 0.95rem;
        background: #fbfcfe;
        min-height: 108px;
    }
    .signal-label {
        color: #526070;
        font-size: 0.88rem;
        font-weight: 600;
        margin-bottom: 0.35rem;
    }
    .signal-value {
        font-size: 1.35rem;
        font-weight: 700;
        color: #172033;
    }
    .signal-danger {border-color: #efb7b7; background: #fff7f7;}
    .signal-warning {border-color: #f2d19b; background: #fffaf0;}
    .signal-success {border-color: #b9ddc2; background: #f6fff8;}
    .signal-money {border-color: #bdd3ff; background: #f7faff;}
</style>
""",
        unsafe_allow_html=True,
    )


def main() -> None:
    st.set_page_config(page_title="Chiropractic Business OS", layout="wide")
    render_style()

    st.title("Chiropractic Business OS")
    st.caption("Patient inquiry capture, follow-up scheduling, weekly summaries, and CSV exports for a chiropractic practice.")

    try:
        leads = bootstrap()
    except Exception as exc:
        st.error("The app could not load the patient inquiry database.")
        st.caption(f"Technical detail: {exc}")
        st.stop()

    tabs = st.tabs(["Dashboard", "Patient Inquiries", "Weekly Summary", "Export"])
    with tabs[0]:
        render_dashboard(leads)
    with tabs[1]:
        render_leads_workspace(leads)
    with tabs[2]:
        render_weekly_report(leads)
    with tabs[3]:
        render_export(leads)


def render_dashboard(leads: pd.DataFrame) -> None:
    st.subheader("Practice Dashboard")
    st.markdown(
        '<div class="section-note">A fast view of inquiry volume, patient conversion, treatment value, and follow-up risk.</div>',
        unsafe_allow_html=True,
    )

    kpis = calculate_kpis(leads)
    metric_cols = st.columns(6)
    metric_cols[0].metric("Total inquiries", kpis["total_leads"], help=KPI_HELP["Total inquiries"])
    metric_cols[1].metric("New this week", kpis["new_leads_this_week"], help=KPI_HELP["New this week"])
    metric_cols[2].metric("Needs follow-up", kpis["followups_needed"], help=KPI_HELP["Needs follow-up"])
    metric_cols[3].metric("Active patients", kpis["active_patients"], help=KPI_HELP["Active patients"])
    metric_cols[4].metric("Overdue", kpis["overdue_followups"], help=KPI_HELP["Overdue"])
    metric_cols[5].metric(
        "Estimated treatment value",
        money(kpis["estimated_treatment_value"]),
        help=KPI_HELP["Estimated treatment value"],
    )

    if leads.empty:
        st.info("No patient inquiries yet. Add one from the Patient Inquiries tab to start the demo.")
        return

    render_priority_signals(leads, kpis)

    status_counts = leads.groupby("status", as_index=False).size().rename(columns={"size": "leads"})
    px = get_plotly_express()

    st.markdown("### Inquiry Status")
    st.caption("Shows where patient inquiries stand today.")
    if px:
        st.plotly_chart(
            px.bar(
                status_counts,
                x="status",
                y="leads",
                title="Patient Inquiries by Status",
                text_auto=True,
                labels={"status": "Status", "leads": "Patient inquiries"},
            ).update_layout(showlegend=False, margin=dict(l=10, r=10, t=50, b=10)),
            width="stretch",
        )
    else:
        st.bar_chart(status_counts.set_index("status")["leads"])

    st.markdown("### Recent Patient Inquiries")
    st.caption("Recent records with the requested service, source, status, value, and next follow-up date.")
    st.dataframe(
        display_frame(
            leads[["id", "name", "service_needed", "source", "status", "estimated_value", "next_follow_up_date"]].head(10)
        ),
        width="stretch",
        hide_index=True,
    )

    with st.expander("Optional inquiry source breakdown"):
        source_counts = leads.groupby("source", as_index=False).size().rename(columns={"size": "leads"})
        st.dataframe(
            source_counts.sort_values("leads", ascending=False).rename(
                columns={"source": "Inquiry Source", "leads": "Patient Inquiries"}
            ),
            width="stretch",
            hide_index=True,
        )


def render_priority_signals(leads: pd.DataFrame, kpis: dict[str, float | int]) -> None:
    due_today = filter_due_today(leads)
    overdue_count = int(kpis["overdue_followups"])
    active_count = int(kpis["active_patients"])
    treatment_value = float(kpis["estimated_treatment_value"])

    st.markdown("### Today's Practice Signals")
    st.caption("Use this row to decide what needs attention before the practice loses patient momentum.")
    col1, col2, col3, col4 = st.columns(4)
    col1.markdown(
        f"""
<div class="signal-box signal-danger">
  <div class="signal-label">Overdue follow-ups</div>
  <div class="signal-value">{overdue_count}</div>
  <div class="section-note">Call these first.</div>
</div>
""",
        unsafe_allow_html=True,
    )
    col2.markdown(
        f"""
<div class="signal-box signal-warning">
  <div class="signal-label">Due today</div>
  <div class="signal-value">{len(due_today)}</div>
  <div class="section-note">Keep today's inquiry list moving.</div>
</div>
""",
        unsafe_allow_html=True,
    )
    col3.markdown(
        f"""
<div class="signal-box signal-success">
  <div class="signal-label">Active patients</div>
  <div class="signal-value">{active_count}</div>
  <div class="section-note">Inquiries converted to care.</div>
</div>
""",
        unsafe_allow_html=True,
    )
    col4.markdown(
        f"""
<div class="signal-box signal-money">
  <div class="signal-label">Estimated Treatment Value</div>
  <div class="signal-value">{money(treatment_value)}</div>
  <div class="section-note">All non-lost inquiries.</div>
</div>
""",
        unsafe_allow_html=True,
    )

    if overdue_count:
        st.warning("Overdue follow-ups need attention before new outreach.")
    elif len(due_today):
        st.info("No overdue follow-ups. Start with the inquiries due today.")
    else:
        st.success("No follow-ups are overdue or due today.")


def render_leads_workspace(leads: pd.DataFrame) -> None:
    st.subheader("Patient Inquiries")
    st.markdown(
        '<div class="section-note">Add patient inquiries, review requested services, and schedule follow-ups in one place.</div>',
        unsafe_allow_html=True,
    )

    render_lead_intake()
    st.divider()
    render_lead_details(leads)


def render_lead_intake() -> None:
    st.markdown("### Add Patient Inquiry")
    st.caption("Use this form while the inquiry is fresh. Required fields help keep the follow-up list usable.")

    with st.form("lead_intake_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        name = col1.text_input("Patient name", help="The patient or prospective patient name. Required.")
        phone = col2.text_input("Phone", help="Best phone number for appointment follow-up. Required.")
        email = col1.text_input("Email", help="Best email address for appointment follow-up. Required.")
        service_needed = col2.text_input(
            "Requested Service",
            help="Example: Spinal Adjustment, Sports Injury Treatment, or Wellness Consultation. Required.",
        )
        source = col1.selectbox("Inquiry source", SOURCES, help="Where this patient inquiry came from.")
        status = col2.selectbox("Status", STATUSES, help="Current appointment or patient stage for this inquiry.")
        estimated_value = col1.number_input(
            "Estimated Treatment Value",
            min_value=0.0,
            value=180.0,
            step=25.0,
            help="Estimated treatment value for this inquiry. This is used in the dashboard unless the inquiry is marked Lost.",
        )
        next_follow_up = col2.date_input(
            "Next follow-up date",
            value=date.today() + timedelta(days=2),
            help="The next date the practice should call, email, or message this inquiry.",
        )
        notes = st.text_area("Notes", height=120, help="Symptoms, insurance notes, appointment preference, or follow-up context.")
        submitted = st.form_submit_button("Save inquiry", type="primary")

    if submitted:
        errors = validate_lead_form(name, phone, email, service_needed)
        if errors:
            for error in errors:
                st.error(error)
            return
        try:
            lead_id = insert_lead(
                get_db_path(),
                name=name,
                phone=phone,
                email=email,
                service_needed=service_needed,
                source=source,
                status=status,
                estimated_value=estimated_value,
                notes=notes,
                next_follow_up_date=next_follow_up.isoformat(),
            )
            st.success(f"Patient inquiry #{lead_id} saved.")
            st.rerun()
        except Exception as exc:
            st.error("The patient inquiry could not be saved. Please check the fields and try again.")
            st.caption(f"Technical detail: {exc}")


def render_lead_details(leads: pd.DataFrame) -> None:
    st.markdown("### Inquiry Details and Follow-Up")
    if leads.empty:
        st.info("No patient inquiries yet. Add the first inquiry above, then it will appear here for follow-up.")
        return
    st.caption("Review one inquiry at a time and keep the next follow-up date current.")

    mode = st.radio(
        "Inquiry view",
        ["Needs attention", "Due next 7 days", "Needs follow-up", "All inquiries"],
        horizontal=True,
        help="Choose which patient inquiries to review or update.",
    )
    today = pd.Timestamp.today().normalize()
    if mode == "Needs attention":
        filtered = leads[leads["is_overdue"]].copy()
    elif mode == "Due next 7 days":
        filtered = leads[
            leads["is_open"]
            & leads["next_follow_up_dt"].notna()
            & (leads["next_follow_up_dt"] >= today)
            & (leads["next_follow_up_dt"] <= today + pd.Timedelta(days=7))
        ].copy()
    elif mode == "Needs follow-up":
        filtered = leads[leads["is_open"]].copy()
    else:
        filtered = leads.copy()

    filtered = filtered.sort_values(["next_follow_up_dt", "created_at_dt"], na_position="last")
    st.dataframe(
        display_frame(
            filtered[["id", "name", "phone", "email", "service_needed", "status", "estimated_value", "next_follow_up_date"]]
        ),
        width="stretch",
        hide_index=True,
    )

    if filtered.empty:
        if mode == "Due next 7 days":
            st.info("No follow-ups are due in the next 7 days.")
        elif mode == "Needs attention":
            st.success("No overdue follow-ups right now.")
        else:
            st.info("No patient inquiries match this view.")
        return

    lead_options = {
        f"#{int(row.id)} - {row.name} ({row.status})": int(row.id)
        for row in filtered.itertuples(index=False)
    }
    selected_label = st.selectbox(
        "Inquiry to review",
        list(lead_options),
        help="Pick an inquiry to see details and schedule the next follow-up.",
    )
    selected_id = lead_options[selected_label]
    selected = leads[leads["id"].eq(selected_id)].iloc[0]
    default_followup = selected["next_follow_up_dt"]
    if pd.isna(default_followup):
        default_followup_date = date.today() + timedelta(days=3)
    else:
        default_followup_date = default_followup.date()

    detail_col, action_col = st.columns([1.15, 1], gap="large")
    with detail_col:
        st.markdown("#### Contact Details")
        st.write(f"**Name:** {selected['name']}")
        st.write(f"**Phone:** {selected['phone']}")
        st.write(f"**Email:** {selected['email']}")
        st.write(f"**Requested Service:** {selected['service_needed']}")
        st.write(f"**Inquiry source:** {selected['source']}")
        st.write(f"**Estimated Treatment Value:** {money(selected['estimated_value'])}")
        st.write(f"**Created:** {selected['created_at']}")

    with action_col.form("lead_detail_update_form"):
        st.markdown("#### Update Inquiry")
        col1, col2 = st.columns(2)
        status = col1.selectbox(
            "Status",
            STATUSES,
            index=STATUSES.index(selected["status"]) if selected["status"] in STATUSES else 0,
            help="Use Active Patient when the inquiry becomes a patient, or Lost when they do not book.",
        )
        next_follow_up = col2.date_input(
            "Next follow-up date",
            value=default_followup_date,
            help="Schedule the next practice action for this inquiry.",
        )
        notes = st.text_area("Notes", value=str(selected["notes"] or ""), height=110, help="Update the latest context.")
        saved = st.form_submit_button("Update inquiry", type="primary")

    if saved:
        try:
            update_lead_followup(
                get_db_path(),
                lead_id=selected_id,
                status=status,
                next_follow_up_date="" if status in {"Active Patient", "Lost"} else next_follow_up.isoformat(),
                notes=notes,
            )
            st.success("Patient inquiry updated.")
            st.rerun()
        except Exception as exc:
            st.error("The patient inquiry could not be updated. Please try again.")
            st.caption(f"Technical detail: {exc}")


def render_weekly_report(leads: pd.DataFrame) -> None:
    st.subheader("Weekly Practice Summary")
    summary = build_weekly_summary(leads)
    if leads.empty:
        st.info("No weekly data yet. Add patient inquiries to generate a practice summary.")
        return
    st.caption("A simple owner-ready summary of inquiry activity, active patients, follow-up pressure, and estimated treatment value.")
    st.markdown('<div class="report-box">', unsafe_allow_html=True)
    st.markdown(f"#### Week of {summary['week_start']} to {summary['week_end']}")
    metric_cols = st.columns(4)
    metric_cols[0].metric("New inquiries", summary["new_inquiries"])
    metric_cols[1].metric("Needs follow-up", summary["needs_followup"])
    metric_cols[2].metric("Active patients", summary["active_patients"])
    metric_cols[3].metric("Estimated treatment value", money(summary["estimated_treatment_value"]))
    st.write(summary["practice_readout"])
    if summary["followup_focus"]:
        st.markdown("#### Follow-Up Focus")
        for item in summary["followup_focus"]:
            st.write(f"- {item}")
    else:
        st.success("No overdue follow-ups right now.")
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown("### Practice Performance Snapshot")
    st.caption("A printable snapshot the practice owner can use before a demo, check-in, or weekly review.")
    st.markdown(
        f"""
<div class="snapshot-box">
  <div class="snapshot-title">Practice Performance Snapshot</div>
  <div class="section-note">Date generated: {date.today().isoformat()}</div>
</div>
""",
        unsafe_allow_html=True,
    )

    snapshot_cols = st.columns(4)
    snapshot_cols[0].metric("Total Patient Inquiries", summary["total_inquiries"])
    snapshot_cols[1].metric("New This Week", summary["new_inquiries"])
    snapshot_cols[2].metric("Active Patients", summary["active_patients"])
    snapshot_cols[3].metric("Follow-Ups Needed", summary["needs_followup"])

    snapshot_cols = st.columns(4)
    snapshot_cols[0].metric("Overdue Follow-Ups", summary["overdue_followups"])
    snapshot_cols[1].metric("Estimated Treatment Value", money(summary["estimated_treatment_value"]))
    snapshot_cols[2].metric("Conversion Rate", percent(summary["conversion_rate"]))
    snapshot_cols[3].metric("Top Inquiry Source", summary["top_source"])

    st.markdown("#### What This Means")
    st.write(summary["snapshot_summary"])

    try:
        snapshot_text = build_snapshot_text(summary)
        snapshot_csv = build_snapshot_csv(summary)
    except Exception:
        st.error("Practice Snapshot export could not be prepared. Please refresh the app and try again.")
        return

    download_cols = st.columns(2)
    download_cols[0].download_button(
        "Download snapshot text",
        data=snapshot_text,
        file_name=f"practice_snapshot_{date.today().isoformat()}.txt",
        mime="text/plain",
        type="primary",
    )
    download_cols[1].download_button(
        "Download snapshot CSV",
        data=snapshot_csv,
        file_name=f"practice_snapshot_{date.today().isoformat()}.csv",
        mime="text/csv",
    )


def render_export(leads: pd.DataFrame) -> None:
    st.subheader("Export")
    st.markdown(
        '<div class="section-note">Download clean patient inquiry data for spreadsheets, follow-up, or backup.</div>',
        unsafe_allow_html=True,
    )

    export_columns = ["name", "phone", "email", "service_needed", "source", "status", "estimated_value", "notes", "next_follow_up_date"]
    export_frame = safe_dataframe(leads, export_columns) if not leads.empty else pd.DataFrame(columns=export_columns)
    open_followups = safe_dataframe(leads[leads["is_open"]], export_columns) if not leads.empty else export_frame

    if export_frame.empty:
        st.info("No export data yet. Add patient inquiries before downloading CSV files.")
        return

    try:
        inquiries_csv = export_csv_for_demo(export_frame)
        followups_csv = export_csv_for_demo(open_followups)
    except ValueError:
        st.error("CSV export could not be prepared. Please refresh the app and try again.")
        return

    col1, col2 = st.columns(2)
    col1.download_button(
        "Download patient inquiries CSV",
        data=inquiries_csv,
        file_name=f"patient_inquiries_{date.today().isoformat()}.csv",
        mime="text/csv",
        type="primary",
    )
    col2.download_button(
        "Download follow-up list CSV",
        data=followups_csv,
        file_name=f"patient_followups_{date.today().isoformat()}.csv",
        mime="text/csv",
    )

    st.markdown("### Export Preview")
    st.dataframe(display_frame(export_frame), width="stretch", hide_index=True)


if __name__ == "__main__":
    main()
