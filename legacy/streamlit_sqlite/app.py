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
    STATUSES,
    fetch_leads,
    initialize_database,
    insert_lead,
    prepare_leads_frame,
    reset_sample_data,
    seed_sample_data_if_empty,
    update_lead_followup,
)
from business_os.config import APP_CONFIG  # noqa: E402
from business_os.reports import build_weekly_summary, calculate_kpis  # noqa: E402


SOURCES = list(APP_CONFIG.sources)
EMAIL_PATTERN = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_PATTERN = re.compile(r"^\+?[0-9][0-9\s().-]{6,19}$")
KPI_LABELS = APP_CONFIG.kpi_labels
KPI_HELP = {KPI_LABELS[key]: value for key, value in APP_CONFIG.kpi_help.items()}
PATIENT_EXPORT_COLUMNS = list(APP_CONFIG.export_columns)
ENTITY_TITLE = APP_CONFIG.entity_singular.title()
ENTITY_PLURAL_TITLE = APP_CONFIG.entity_plural.title()
ENTITY_SENTENCE = APP_CONFIG.entity_singular.capitalize()


def get_db_path() -> Path:
    configured = os.environ.get("BUSINESS_OS_DB_PATH", "data/business_os.sqlite").strip()
    if not configured:
        configured = "data/business_os.sqlite"
    path = Path(configured).expanduser()
    if not path.is_absolute():
        path = APP_ROOT / path
    return path


def is_demo_mode() -> bool:
    return os.environ.get("BUSINESS_OS_DEMO_MODE", "").strip().lower() in {"1", "true", "yes", "on"}


def bootstrap() -> pd.DataFrame:
    EXPORT_DIR.mkdir(parents=True, exist_ok=True)
    db_path = get_db_path()
    initialize_database(db_path)
    if is_demo_mode() and not st.session_state.get("demo_data_ready"):
        reset_sample_data(db_path)
        st.session_state["demo_data_ready"] = True
    else:
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
        errors.append(f"{APP_CONFIG.service_label} is required.")
    return errors


def safe_dataframe(frame: pd.DataFrame, columns: list[str]) -> pd.DataFrame:
    safe = frame.copy()
    for column in columns:
        if column not in safe.columns:
            safe[column] = ""
    return safe[columns]


def display_frame(frame: pd.DataFrame) -> pd.DataFrame:
    labels = APP_CONFIG.display_labels
    return frame.rename(columns={key: value for key, value in labels.items() if key in frame.columns})


def table_height(frame: pd.DataFrame, *, min_rows: int = 4, max_rows: int = 12) -> int:
    row_count = max(min_rows, min(len(frame), max_rows))
    return 38 + (row_count * 35)


def export_csv_for_demo(frame: pd.DataFrame) -> bytes:
    try:
        return display_frame(frame).to_csv(index=False).encode("utf-8")
    except Exception as exc:
        raise ValueError("CSV export could not be prepared.") from exc


def build_snapshot_rows(summary: dict[str, object]) -> list[tuple[str, str]]:
    return [
        ("Date Generated", date.today().isoformat()),
        (KPI_LABELS["total"], str(summary["total_inquiries"])),
        (KPI_LABELS["new_this_week"], str(summary["new_inquiries"])),
        (KPI_LABELS["active"], str(summary["active_patients"])),
        (
            KPI_LABELS["followups_needed"],
            f"{summary['needs_followup']} ({percent(float(summary['followups_needed_percent']))} of inquiries)",
        ),
        (KPI_LABELS["overdue_followups"], str(summary["overdue_followups"])),
        (KPI_LABELS["value"], money(float(summary["estimated_treatment_value"]))),
        ("Inquiry-to-Patient Conversion Rate", percent(float(summary["conversion_rate"]))),
        (KPI_LABELS["top_source"], str(summary["top_source"])),
    ]


def build_snapshot_text(summary: dict[str, object]) -> bytes:
    lines = [APP_CONFIG.snapshot_title, f"Date generated: {date.today().isoformat()}", ""]
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
    .block-container {max-width: 1320px; padding-top: 1.1rem; padding-bottom: 2rem;}
    h1 {margin-bottom: 0.2rem;}
    h2, h3 {margin-top: 1.4rem;}
    div[data-testid="stMetric"] {
        border: 1px solid #d7dee8;
        border-radius: 8px;
        padding: 0.85rem 0.95rem;
        background: #ffffff;
        box-shadow: 0 1px 2px rgba(15, 23, 42, 0.04);
    }
    div[data-testid="stMetric"] * {color: #172033 !important;}
    div[data-testid="stMetricDelta"] * {color: #526070 !important;}
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
    @media (max-width: 760px) {
        .block-container {padding-left: 0.75rem; padding-right: 0.75rem;}
        div[data-testid="stMetric"] {padding: 0.75rem;}
        .signal-box {min-height: 96px;}
        .signal-value {font-size: 1.15rem;}
    }
</style>
""",
        unsafe_allow_html=True,
    )


def main() -> None:
    st.set_page_config(
        page_title=APP_CONFIG.app_title,
        layout="wide",
        initial_sidebar_state="collapsed",
        menu_items={
            "About": APP_CONFIG.about_text,
        },
    )
    render_style()

    st.title(APP_CONFIG.app_title)
    st.caption(APP_CONFIG.app_caption)

    try:
        leads = bootstrap()
    except Exception as exc:
        st.error(f"The app could not load the {APP_CONFIG.entity_singular} database.")
        st.caption(f"Technical detail: {exc}")
        st.stop()

    render_demo_tools()

    tabs = st.tabs(["Dashboard", ENTITY_PLURAL_TITLE, "Weekly Summary", "Export"])
    with tabs[0]:
        render_dashboard(leads)
    with tabs[1]:
        render_leads_workspace(leads)
    with tabs[2]:
        render_weekly_report(leads)
    with tabs[3]:
        render_export(leads)


def render_demo_tools() -> None:
    if not is_demo_mode():
        return

    with st.sidebar:
        st.markdown("### Demo Mode")
        st.caption("Reset the demo to fresh fake chiropractic sample data before screenshots or client walkthroughs.")
        if st.button("Reset demo data", help="Replace current records with the 15 fake sample inquiries from the CSV."):
            try:
                count = reset_sample_data(get_db_path())
                st.success(f"Demo data reset with {count} {APP_CONFIG.entity_plural}.")
                st.rerun()
            except Exception as exc:
                st.error("Demo data could not be reset.")
                st.caption(f"Technical detail: {exc}")


@st.dialog("KPI Help")
def render_kpi_help_dialog() -> None:
    st.caption("Plain-language guide to the numbers used in this demo.")
    for label, explanation in KPI_HELP.items():
        st.markdown(f"**{label}**")
        st.write(explanation)


def render_dashboard(leads: pd.DataFrame) -> None:
    st.subheader(APP_CONFIG.dashboard_title)
    st.markdown(
        f'<div class="section-note">{APP_CONFIG.dashboard_description}</div>',
        unsafe_allow_html=True,
    )

    kpis = calculate_kpis(leads)
    top_cols = st.columns([1.15, 1, 1, 0.8])
    top_cols[0].metric(
        KPI_LABELS["value"],
        money(kpis["estimated_treatment_value"]),
        help=KPI_HELP[KPI_LABELS["value"]],
    )
    top_cols[1].metric(
        KPI_LABELS["followups_needed"],
        kpis["followups_needed"],
        delta=f"{percent(kpis['followups_needed_percent'])} of inquiries",
        delta_color="off",
        help=KPI_HELP[KPI_LABELS["followups_needed"]],
    )
    top_cols[2].metric(KPI_LABELS["active"], kpis["active_patients"], help=KPI_HELP[KPI_LABELS["active"]])
    if top_cols[3].button("KPI Help", help="Open a quick explanation of each dashboard metric."):
        render_kpi_help_dialog()

    metric_cols = st.columns(5)
    metric_cols[0].metric(KPI_LABELS["total"], kpis["total_leads"], help=KPI_HELP[KPI_LABELS["total"]])
    metric_cols[1].metric(KPI_LABELS["new_this_week"], kpis["new_leads_this_week"], help=KPI_HELP[KPI_LABELS["new_this_week"]])
    metric_cols[2].metric(KPI_LABELS["overdue_followups"], kpis["overdue_followups"], help=KPI_HELP[KPI_LABELS["overdue_followups"]])
    metric_cols[3].metric(
        KPI_LABELS["conversion_rate"],
        percent(kpis["conversion_rate"]),
        help=KPI_HELP[KPI_LABELS["conversion_rate"]],
    )
    metric_cols[4].metric(KPI_LABELS["top_source"], kpis["top_source"], help=KPI_HELP[KPI_LABELS["top_source"]])

    if leads.empty:
        st.info(f"No {APP_CONFIG.entity_plural} yet. Add one from the {ENTITY_PLURAL_TITLE} tab to start the demo.")
        return

    render_priority_signals(leads, kpis)

    st.markdown(f"### Recent {ENTITY_PLURAL_TITLE}")
    st.caption("Recent records with the requested service, source, status, value, and next follow-up date.")
    st.dataframe(
        display_frame(
            leads[["id", "name", "service_needed", "source", "status", "estimated_value", "next_follow_up_date"]].head(10)
        ),
        width="stretch",
        hide_index=True,
        height=table_height(leads.head(10)),
    )

    with st.expander("Optional inquiry status chart"):
        status_counts = leads.groupby("status", as_index=False).size().rename(columns={"size": "leads"})
        px = get_plotly_express()
        if px:
            st.plotly_chart(
                px.bar(
                    status_counts,
                    x="status",
                    y="leads",
                    title="Patient Inquiries by Status",
                    text_auto=True,
                    labels={"status": APP_CONFIG.status_label, "leads": APP_CONFIG.entity_plural.title()},
                ).update_layout(showlegend=False, margin=dict(l=10, r=10, t=50, b=10)),
                width="stretch",
            )
        else:
            st.bar_chart(status_counts.set_index("status")["leads"])

    with st.expander("Optional inquiry source breakdown"):
        source_counts = leads.groupby("source", as_index=False).size().rename(columns={"size": "leads"})
        st.dataframe(
            source_counts.sort_values("leads", ascending=False).rename(
                columns={"source": APP_CONFIG.source_label, "leads": APP_CONFIG.entity_plural.title()}
            ),
            width="stretch",
            hide_index=True,
            height=table_height(source_counts),
        )


def render_priority_signals(leads: pd.DataFrame, kpis: dict[str, float | int | str]) -> None:
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
  <div class="signal-label">{APP_CONFIG.value_label}</div>
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
    st.subheader(ENTITY_PLURAL_TITLE)
    st.markdown(
        f'<div class="section-note">Add {APP_CONFIG.entity_plural}, review requested services, and schedule follow-ups in one place.</div>',
        unsafe_allow_html=True,
    )

    render_lead_intake()
    st.divider()
    render_lead_details(leads)


def render_lead_intake() -> None:
    st.markdown(f"### Add {ENTITY_TITLE}")
    st.caption("Use this form while the inquiry is fresh. Required fields help keep the follow-up list usable.")

    with st.form("lead_intake_form", clear_on_submit=True):
        col1, col2 = st.columns(2)
        name = col1.text_input("Patient name", help="The patient or prospective patient name. Required.")
        phone = col2.text_input("Phone", help="Best phone number for appointment follow-up. Required.")
        email = col1.text_input("Email", help="Best email address for appointment follow-up. Required.")
        service_needed = col2.text_input(
            APP_CONFIG.service_label,
            help=f"Example: {', '.join(APP_CONFIG.service_examples[:-1])}, or {APP_CONFIG.service_examples[-1]}. Required.",
        )
        source = col1.selectbox("Inquiry source", SOURCES, help=f"Where this {APP_CONFIG.entity_singular} came from.")
        status = col2.selectbox(APP_CONFIG.status_label, STATUSES, help=f"Current appointment or patient stage for this {APP_CONFIG.entity_singular}.")
        estimated_value = col1.number_input(
            APP_CONFIG.value_label,
            min_value=0.0,
            value=180.0,
            step=25.0,
            help=f"Estimated treatment value for this inquiry. This is used in the dashboard unless the inquiry is marked {APP_CONFIG.lost_status}.",
        )
        next_follow_up = col2.date_input(
            "Next follow-up date",
            value=date.today() + timedelta(days=2),
            help="The next date the practice should call, email, or message this inquiry.",
        )
        notes = st.text_area("Notes", height=120, help="Symptoms, insurance notes, appointment preference, or follow-up context.")
        submitted = st.form_submit_button(
            f"Save {APP_CONFIG.entity_singular}",
            type="primary",
            help=f"Save this {APP_CONFIG.entity_singular} and update the dashboard immediately.",
        )

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
            st.success(f"{ENTITY_SENTENCE} #{lead_id} saved.")
            st.rerun()
        except Exception as exc:
            st.error(f"The {APP_CONFIG.entity_singular} could not be saved. Please check the fields and try again.")
            st.caption(f"Technical detail: {exc}")


def render_lead_details(leads: pd.DataFrame) -> None:
    st.markdown("### Inquiry Details and Follow-Up")
    if leads.empty:
        st.info(f"No {APP_CONFIG.entity_plural} yet. Add the first inquiry above, then it will appear here for follow-up.")
        return
    st.caption("Review one inquiry at a time and keep the next follow-up date current.")

    mode = st.radio(
        "Inquiry view",
        ["Needs attention", "Due next 7 days", "Needs follow-up", "All inquiries"],
        horizontal=True,
        help=f"Choose which {APP_CONFIG.entity_plural} to review or update.",
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
        height=table_height(filtered),
    )

    if filtered.empty:
        if mode == "Due next 7 days":
            st.info("No follow-ups are due in the next 7 days.")
        elif mode == "Needs attention":
            st.success("No overdue follow-ups right now.")
        else:
            st.info(f"No {APP_CONFIG.entity_plural} match this view.")
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
        st.write(f"**{APP_CONFIG.service_label}:** {selected['service_needed']}")
        st.write(f"**{APP_CONFIG.source_label}:** {selected['source']}")
        st.write(f"**{APP_CONFIG.value_label}:** {money(selected['estimated_value'])}")
        st.write(f"**Created:** {selected['created_at']}")

    with action_col.form("lead_detail_update_form"):
        st.markdown("#### Update Inquiry")
        col1, col2 = st.columns(2)
        status = col1.selectbox(
            APP_CONFIG.status_label,
            STATUSES,
            index=STATUSES.index(selected["status"]) if selected["status"] in STATUSES else 0,
            help=f"Use {APP_CONFIG.active_status} when the inquiry becomes a patient, or {APP_CONFIG.lost_status} when they do not book.",
        )
        next_follow_up = col2.date_input(
            "Next follow-up date",
            value=default_followup_date,
            help="Schedule the next practice action for this inquiry.",
        )
        notes = st.text_area("Notes", value=str(selected["notes"] or ""), height=110, help="Update the latest context.")
        saved = st.form_submit_button(
            f"Update {APP_CONFIG.entity_singular}",
            type="primary",
            help="Save the selected status, notes, and next follow-up date.",
        )

    if saved:
        try:
            update_lead_followup(
                get_db_path(),
                lead_id=selected_id,
                status=status,
                next_follow_up_date="" if status in APP_CONFIG.closed_statuses else next_follow_up.isoformat(),
                notes=notes,
            )
            st.success(f"{ENTITY_SENTENCE} updated.")
            st.rerun()
        except Exception as exc:
            st.error(f"The {APP_CONFIG.entity_singular} could not be updated. Please try again.")
            st.caption(f"Technical detail: {exc}")


def render_weekly_report(leads: pd.DataFrame) -> None:
    st.subheader(APP_CONFIG.weekly_summary_title)
    summary = build_weekly_summary(leads)
    if leads.empty:
        st.info(APP_CONFIG.weekly_empty_message)
        return
    st.caption(APP_CONFIG.weekly_summary_caption)
    if st.button("Weekly KPI Help", help="Open a quick explanation of the weekly performance metrics."):
        render_kpi_help_dialog()
    st.markdown('<div class="report-box">', unsafe_allow_html=True)
    st.markdown(f"#### Week of {summary['week_start']} to {summary['week_end']}")
    metric_cols = st.columns(4)
    metric_cols[0].metric(KPI_LABELS["total"], summary["total_inquiries"], help=KPI_HELP[KPI_LABELS["total"]])
    metric_cols[1].metric(KPI_LABELS["new_this_week"], summary["new_inquiries"], help=KPI_HELP[KPI_LABELS["new_this_week"]])
    metric_cols[2].metric(KPI_LABELS["active"], summary["active_patients"], help=KPI_HELP[KPI_LABELS["active"]])
    metric_cols[3].metric(
        KPI_LABELS["followups_needed"],
        summary["needs_followup"],
        delta=f"{percent(summary['followups_needed_percent'])} of inquiries",
        delta_color="off",
        help=KPI_HELP[KPI_LABELS["followups_needed"]],
    )
    metric_cols = st.columns(4)
    metric_cols[0].metric(KPI_LABELS["overdue_followups"], summary["overdue_followups"], help=KPI_HELP[KPI_LABELS["overdue_followups"]])
    metric_cols[1].metric(
        KPI_LABELS["value"],
        money(summary["estimated_treatment_value"]),
        help=KPI_HELP[KPI_LABELS["value"]],
    )
    metric_cols[2].metric(KPI_LABELS["conversion_rate"], percent(summary["conversion_rate"]), help=KPI_HELP[KPI_LABELS["conversion_rate"]])
    metric_cols[3].metric(KPI_LABELS["top_source"], summary["top_source"], help=KPI_HELP[KPI_LABELS["top_source"]])
    st.write(summary["practice_readout"])
    if summary["followup_focus"]:
        st.markdown("#### Follow-Up Focus")
        for item in summary["followup_focus"]:
            st.write(f"- {item}")
    else:
        st.success("No overdue follow-ups right now.")
    st.markdown("</div>", unsafe_allow_html=True)

    st.markdown(f"### {APP_CONFIG.snapshot_title}")
    st.caption(f"A printable snapshot the {APP_CONFIG.owner_label} can use before a demo, check-in, or weekly review.")
    st.markdown(
        f"""
<div class="snapshot-box">
  <div class="snapshot-title">{APP_CONFIG.snapshot_title}</div>
  <div class="section-note">Date generated: {date.today().isoformat()}</div>
</div>
""",
        unsafe_allow_html=True,
    )

    snapshot_cols = st.columns(4)
    snapshot_cols[0].metric(KPI_LABELS["total"], summary["total_inquiries"], help=KPI_HELP[KPI_LABELS["total"]])
    snapshot_cols[1].metric(KPI_LABELS["new_this_week"], summary["new_inquiries"], help=KPI_HELP[KPI_LABELS["new_this_week"]])
    snapshot_cols[2].metric(KPI_LABELS["active"], summary["active_patients"], help=KPI_HELP[KPI_LABELS["active"]])
    snapshot_cols[3].metric(
        KPI_LABELS["followups_needed"],
        summary["needs_followup"],
        delta=f"{percent(summary['followups_needed_percent'])} of inquiries",
        delta_color="off",
        help=KPI_HELP[KPI_LABELS["followups_needed"]],
    )

    snapshot_cols = st.columns(4)
    snapshot_cols[0].metric(KPI_LABELS["overdue_followups"], summary["overdue_followups"], help=KPI_HELP[KPI_LABELS["overdue_followups"]])
    snapshot_cols[1].metric(
        KPI_LABELS["value"],
        money(summary["estimated_treatment_value"]),
        help=KPI_HELP[KPI_LABELS["value"]],
    )
    snapshot_cols[2].metric(KPI_LABELS["conversion_rate"], percent(summary["conversion_rate"]), help=KPI_HELP[KPI_LABELS["conversion_rate"]])
    snapshot_cols[3].metric(KPI_LABELS["top_source"], summary["top_source"], help=KPI_HELP[KPI_LABELS["top_source"]])

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
        file_name=f"{APP_CONFIG.export_filename_prefixes['snapshot']}_{date.today().isoformat()}.txt",
        mime="text/plain",
        type="primary",
        help="Download a plain-text Practice Performance Snapshot for sharing or printing.",
    )
    download_cols[1].download_button(
        "Download snapshot CSV",
        data=snapshot_csv,
        file_name=f"{APP_CONFIG.export_filename_prefixes['snapshot']}_{date.today().isoformat()}.csv",
        mime="text/csv",
        help="Download snapshot metrics in a spreadsheet-friendly CSV file.",
    )


def render_export(leads: pd.DataFrame) -> None:
    st.subheader("Export")
    st.markdown(
        '<div class="section-note">Download clean patient inquiry data for spreadsheets, follow-up, or backup.</div>',
        unsafe_allow_html=True,
    )

    export_frame = safe_dataframe(leads, PATIENT_EXPORT_COLUMNS) if not leads.empty else pd.DataFrame(columns=PATIENT_EXPORT_COLUMNS)
    open_followups = safe_dataframe(leads[leads["is_open"]], PATIENT_EXPORT_COLUMNS) if not leads.empty else export_frame

    if export_frame.empty:
        st.info(f"No export data yet. Add {APP_CONFIG.entity_plural} before downloading CSV files.")
        return

    try:
        inquiries_csv = export_csv_for_demo(export_frame)
        followups_csv = export_csv_for_demo(open_followups)
    except ValueError:
        st.error("CSV export could not be prepared. Please refresh the app and try again.")
        return

    col1, col2 = st.columns(2)
    col1.download_button(
        "Download patient inquiry CSV",
        data=inquiries_csv,
        file_name=f"{APP_CONFIG.export_filename_prefixes['inquiries']}_{date.today().isoformat()}.csv",
        mime="text/csv",
        type="primary",
        help="Download patient-friendly inquiry data with readable column names.",
    )
    col2.download_button(
        "Download follow-up CSV",
        data=followups_csv,
        file_name=f"{APP_CONFIG.export_filename_prefixes['followups']}_{date.today().isoformat()}.csv",
        mime="text/csv",
        help="Download patient inquiries that still need follow-up.",
    )

    st.markdown("### Export Preview")
    st.dataframe(display_frame(export_frame), width="stretch", hide_index=True, height=table_height(export_frame))


if __name__ == "__main__":
    main()
