from __future__ import annotations

from datetime import date

import pandas as pd

from business_os.config import APP_CONFIG


def _prepare_for_metrics(leads: pd.DataFrame, today: date | None = None) -> pd.DataFrame:
    prepared = leads.copy()
    defaults = {
        "name": "",
        "service_needed": "",
        "next_follow_up_date": "",
        "status": "",
        "estimated_value": 0,
        "created_at_dt": pd.NaT,
        "next_follow_up_dt": pd.NaT,
        "is_open": False,
        "is_closed": False,
        "is_overdue": False,
    }
    for column, default in defaults.items():
        if column not in prepared.columns:
            prepared[column] = default

    prepared["estimated_value"] = pd.to_numeric(prepared["estimated_value"], errors="coerce").fillna(0)
    created_source = prepared["created_at"] if "created_at" in prepared.columns else prepared["created_at_dt"]
    followup_source = (
        prepared["next_follow_up_date"].replace("", pd.NA)
        if "next_follow_up_date" in prepared.columns
        else prepared["next_follow_up_dt"]
    )
    prepared["created_at_dt"] = pd.to_datetime(created_source, errors="coerce", format="mixed")
    prepared["next_follow_up_dt"] = pd.to_datetime(followup_source, errors="coerce", format="mixed")
    prepared["is_closed"] = prepared["status"].isin(APP_CONFIG.closed_statuses)
    prepared["is_open"] = ~prepared["is_closed"]
    today = pd.Timestamp(today or date.today()).normalize()
    prepared["is_overdue"] = prepared["is_open"] & prepared["next_follow_up_dt"].notna() & (
        prepared["next_follow_up_dt"] < today
    )
    return prepared


def calculate_kpis(leads: pd.DataFrame, today: date | None = None) -> dict[str, float | int | str]:
    today_ts = pd.Timestamp(today or date.today()).normalize()
    week_start = today_ts - pd.Timedelta(days=today_ts.weekday())

    if leads.empty:
        return {
            "total_leads": 0,
            "new_leads_this_week": 0,
            "open_leads": 0,
            "closed_leads": 0,
            "active_patients": 0,
            "conversion_rate": 0.0,
            "followups_needed": 0,
            "followups_needed_percent": 0.0,
            "overdue_followups": 0,
            "pipeline_value": 0.0,
            "estimated_treatment_value": 0.0,
            "top_source": "None",
        }

    leads = _prepare_for_metrics(leads, today)
    open_leads = leads[leads["is_open"]]
    closed_leads = leads[leads["is_closed"]]
    new_this_week = leads[leads["created_at_dt"] >= week_start]
    pipeline_value = open_leads["estimated_value"].sum()
    estimated_treatment_value = leads[~leads["status"].eq(APP_CONFIG.lost_status)]["estimated_value"].sum()
    active_patients = leads[leads["status"].eq(APP_CONFIG.active_status)]
    not_lost = ~leads["status"].eq(APP_CONFIG.lost_status)
    followups_needed = leads[
        not_lost
        & (
            leads["status"].eq(APP_CONFIG.followup_needed_status)
            | (leads["next_follow_up_dt"].notna() & (leads["next_follow_up_dt"] <= today_ts))
        )
    ]
    overdue_followups = leads[
        not_lost
        & leads["next_follow_up_dt"].notna()
        & (leads["next_follow_up_dt"] < today_ts)
    ]
    top_source = "None"
    if "source" in leads.columns and not leads["source"].dropna().empty:
        source_counts = (
            leads["source"]
            .replace("", pd.NA)
            .dropna()
            .value_counts()
            .rename_axis("source")
            .reset_index(name="count")
            .sort_values(["count", "source"], ascending=[False, True])
        )
        if not source_counts.empty:
            top_source = str(source_counts.iloc[0]["source"])
    total = len(leads)

    return {
        "total_leads": int(total),
        "new_leads_this_week": int(len(new_this_week)),
        "open_leads": int(len(open_leads)),
        "closed_leads": int(len(closed_leads)),
        "active_patients": int(len(active_patients)),
        "conversion_rate": float((len(active_patients) / total) * 100) if total else 0.0,
        "followups_needed": int(len(followups_needed)),
        "followups_needed_percent": float((len(followups_needed) / total) * 100) if total else 0.0,
        "overdue_followups": int(len(overdue_followups)),
        "pipeline_value": float(pipeline_value),
        "estimated_treatment_value": float(estimated_treatment_value),
        "top_source": top_source,
    }


def build_weekly_summary(leads: pd.DataFrame, today: date | None = None) -> dict[str, object]:
    today = today or date.today()
    today_ts = pd.Timestamp(today).normalize()
    week_start = today_ts - pd.Timedelta(days=today_ts.weekday())
    week_end = week_start + pd.Timedelta(days=6)
    kpis = calculate_kpis(leads, today)

    if leads.empty:
        return {
            "week_start": week_start.date().isoformat(),
            "week_end": week_end.date().isoformat(),
            "new_inquiries": 0,
            "total_inquiries": 0,
            "needs_followup": 0,
            "followups_needed_percent": 0.0,
            "overdue_followups": 0,
            "active_patients": 0,
            "conversion_rate": 0.0,
            "estimated_treatment_value": 0.0,
            "top_source": "None",
            "practice_readout": APP_CONFIG.no_records_message,
            "snapshot_summary": APP_CONFIG.snapshot_empty_summary,
            "followup_focus": [],
        }

    prepared = _prepare_for_metrics(leads, today)
    open_leads = prepared[prepared["is_open"]].copy()
    overdue = prepared[prepared["is_overdue"]].copy()
    created_this_week = prepared[prepared["created_at_dt"] >= week_start].copy()
    followup_focus = []
    for _, row in overdue.sort_values("next_follow_up_dt").head(8).iterrows():
        followup_focus.append(
            f"{row['name']} requested {row['service_needed']} and was due {row['next_follow_up_date']}."
        )

    practice_readout = build_snapshot_summary(kpis, int(len(open_leads)), int(len(created_this_week)))

    return {
        "week_start": week_start.date().isoformat(),
        "week_end": week_end.date().isoformat(),
        "total_inquiries": kpis["total_leads"],
        "new_inquiries": kpis["new_leads_this_week"],
        "needs_followup": kpis["followups_needed"],
        "followups_needed_percent": kpis["followups_needed_percent"],
        "overdue_followups": kpis["overdue_followups"],
        "active_patients": kpis["active_patients"],
        "conversion_rate": kpis["conversion_rate"],
        "estimated_treatment_value": kpis["estimated_treatment_value"],
        "top_source": kpis["top_source"],
        "practice_readout": practice_readout,
        "snapshot_summary": practice_readout,
        "followup_focus": followup_focus,
    }


def build_snapshot_summary(kpis: dict[str, object], open_count: int, weekly_new_count: int) -> str:
    total = int(kpis.get("total_leads", 0) or 0)
    active = int(kpis.get("active_patients", 0) or 0)
    followups_needed = int(kpis.get("followups_needed", 0) or 0)
    overdue = int(kpis.get("overdue_followups", 0) or 0)
    treatment_value = float(kpis.get("estimated_treatment_value", 0) or 0)
    conversion_rate = float(kpis.get("conversion_rate", 0) or 0)
    top_source = str(kpis.get("top_source", "None") or "None")

    if total == 0:
        return APP_CONFIG.snapshot_empty_summary

    urgency = (
        f"{overdue} overdue follow-up{'s' if overdue != 1 else ''} need attention first. "
        if overdue
        else "No follow-ups are overdue right now. "
    )
    inquiry_word = APP_CONFIG.entity_singular if total == 1 else APP_CONFIG.entity_plural
    active_word = APP_CONFIG.active_status.lower() if active == 1 else f"{APP_CONFIG.active_status.lower()}s"
    followup_word = "inquiry" if followups_needed == 1 else "inquiries"
    return (
        f"The {APP_CONFIG.workspace_label} has {total} {inquiry_word}, "
        f"with {weekly_new_count} added this week and {active} {active_word}. "
        f"{followups_needed} {followup_word} need follow-up, and "
        f"{urgency}"
        f"{APP_CONFIG.value_label} is ${treatment_value:,.0f} from inquiries not marked {APP_CONFIG.lost_status}. "
        f"The inquiry-to-patient conversion rate is {conversion_rate:.1f}%, and the strongest inquiry source is {top_source}. "
        f"There are {open_count} inquiries still moving through the {APP_CONFIG.workspace_label} pipeline."
    )
