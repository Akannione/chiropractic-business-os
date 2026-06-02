# Chiropractic Business OS Portfolio Case Study

## Problem

Small chiropractic practices often receive patient inquiries from Google, referrals, insurance questions, website forms, and phone calls. Without a simple follow-up system, inquiries can be missed, overdue follow-ups can pile up, and the practice owner may not know how much estimated treatment value is sitting in the pipeline.

The goal was to create a focused, demo-ready tool that helps a chiropractic practice owner understand patient inquiry flow without replacing an EHR, scheduling system, billing platform, or payment workflow.

## Solution

The Chiropractic Business OS is a lightweight Streamlit application that tracks patient inquiries, follow-up dates, statuses, estimated treatment value, and weekly performance. It includes realistic fake demo data, a dashboard, patient inquiry workspace, weekly practice summary, practice snapshot, and patient-friendly exports.

The app was also packaged with outreach materials, screenshots, a silent demo video, deployment SOPs, and a revenue model so it can support consulting conversations and client demos.

## Architecture

- Streamlit frontend
- SQLite database
- Pandas-based KPI and report calculations
- CSV-backed fake sample data
- Environment-aware database path handling
- Optional demo mode for resetting fake demo data

The internal SQLite table is still named `leads` to preserve the original MVP schema, while the user-facing terminology presents records as patient inquiries.

## Features

- Patient inquiry intake form
- Required field and contact validation
- Patient inquiry details and follow-up update workflow
- KPI dashboard
- KPI help dialog
- Weekly Practice Summary
- Practice Performance Snapshot
- CSV exports with patient-friendly headers
- Demo reset mode
- Sales and deployment documentation

## Technologies

- Python
- Streamlit
- SQLite
- Pandas
- Plotly when available
- ReportLab for generated sales PDFs
- Playwright/Chrome for screenshot capture during packaging

## Business Impact

The app gives a small chiropractic practice a simple way to see:

- Total patient inquiries
- New inquiries this week
- Active patients
- Follow-ups needed
- Overdue follow-ups
- Estimated treatment value
- Inquiry-to-patient conversion rate
- Top inquiry source

For a practice owner, this turns scattered inquiry activity into a clearer operational view. For a consultant, it creates a productized service that can be demoed, deployed, and refined through paid client feedback.

## Lessons Learned

- A narrow vertical demo is more credible than a generic CRM.
- Fake but realistic sample data makes screenshots and sales conversations stronger.
- Simple KPI definitions matter for non-technical practice owners.
- CSV exports are still valuable for small businesses.
- Deployment documentation and handoff checklists are part of the product, not an afterthought.
- Avoiding EHR, scheduling, payments, and AI kept the MVP focused.

## Future Roadmap

- Collect chiropractor feedback from live outreach.
- Refine messaging based on objections.
- Improve onboarding and support SOPs after first paid client.
- Consider hosted persistence only when a client needs it.
- Consider authentication only when real users or sensitive data require it.
- Keep EHR, scheduling, payments, and AI features deferred until paid demand exists.

## Suitability

This project is suitable as a portfolio case study for:

- Python application development
- Streamlit dashboards
- SQLite MVPs
- Small-business workflow tools
- Vertical SaaS prototyping
- Productized consulting assets
- Client demo packaging

It is not positioned as a HIPAA-ready production EHR or patient management platform. Production use with real patient data would require proper compliance review, hosting, access control, policies, and security hardening.
