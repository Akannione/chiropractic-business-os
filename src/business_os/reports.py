from __future__ import annotations

from datetime import date

import pandas as pd


def _prepare_for_metrics(leads: pd.DataFrame) -> pd.DataFrame:
    prepared = leads.copy()
    defaults = {
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
    prepared["created_at_dt"] = pd.to_datetime(prepared["created_at_dt"], errors="coerce")
    prepared["next_follow_up_dt"] = pd.to_datetime(prepared["next_follow_up_dt"], errors="coerce")
    prepared["is_closed"] = prepared["status"].isin({"Active Patient", "Lost"})
    prepared["is_open"] = ~prepared["is_closed"]
    today = pd.Timestamp.today().normalize()
    prepared["is_overdue"] = prepared["is_open"] & prepared["next_follow_up_dt"].notna() & (
        prepared["next_follow_up_dt"] < today
    )
    return prepared


def calculate_kpis(leads: pd.DataFrame, today: date | None = None) -> dict[str, float | int]:
    today_ts = pd.Timestamp(today or date.today()).normalize()
    week_start = today_ts - pd.Timedelta(days=today_ts.weekday())

    if leads.empty:
        return {
            "total_leads": 0,
            "new_leads_this_week": 0,
            "open_leads": 0,
            "closed_leads": 0,
            "active_patients": 0,
            "overdue_followups": 0,
            "pipeline_value": 0.0,
            "estimated_treatment_value": 0.0,
        }

    leads = _prepare_for_metrics(leads)
    open_leads = leads[leads["is_open"]]
    closed_leads = leads[leads["is_closed"]]
    new_this_week = leads[leads["created_at_dt"] >= week_start]
    pipeline_value = open_leads["estimated_value"].sum()
    estimated_treatment_value = leads[~leads["status"].eq("Lost")]["estimated_value"].sum()
    active_patients = leads[leads["status"].eq("Active Patient")]

    return {
        "total_leads": int(len(leads)),
        "new_leads_this_week": int(len(new_this_week)),
        "open_leads": int(len(open_leads)),
        "closed_leads": int(len(closed_leads)),
        "active_patients": int(len(active_patients)),
        "overdue_followups": int(leads["is_overdue"].sum()),
        "pipeline_value": float(pipeline_value),
        "estimated_treatment_value": float(estimated_treatment_value),
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
            "needs_followup": 0,
            "active_patients": 0,
            "estimated_treatment_value": 0.0,
            "practice_readout": "No patient inquiries are currently stored.",
            "followup_focus": [],
        }

    open_leads = leads[leads["is_open"]].copy()
    overdue = leads[leads["is_overdue"]].copy()
    created_this_week = leads[leads["created_at_dt"] >= week_start].copy()
    followup_focus = []
    for _, row in overdue.sort_values("next_follow_up_dt").head(8).iterrows():
        followup_focus.append(
            f"{row['name']} requested {row['service_needed']} and was due {row['next_follow_up_date']}."
        )

    practice_readout = (
        f"The practice has {len(open_leads)} patient inquiries that still need action. "
        f"This week added {len(created_this_week)} new inquiry/inquiries. "
        f"The estimated treatment value shown is ${kpis['estimated_treatment_value']:,.2f}, "
        "calculated from all inquiries except those marked Lost."
    )

    return {
        "week_start": week_start.date().isoformat(),
        "week_end": week_end.date().isoformat(),
        "new_inquiries": kpis["new_leads_this_week"],
        "needs_followup": kpis["open_leads"],
        "active_patients": kpis["active_patients"],
        "estimated_treatment_value": kpis["estimated_treatment_value"],
        "practice_readout": practice_readout,
        "followup_focus": followup_focus,
    }
