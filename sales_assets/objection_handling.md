# Chiropractic Business OS Objection Handling

Use this during outreach and discovery calls. Keep responses honest: the current product is a focused demo and lightweight practice operating dashboard, not a full EHR, scheduler, billing platform, or HIPAA production system.

| # | Objection | Honest Response |
|---|---|---|
| 1 | We already have an EHR. | This does not replace your EHR. It focuses on patient inquiry visibility and follow-up tracking before or around the booking workflow. |
| 2 | We already have scheduling software. | Scheduling tools show appointments. This shows inquiries, follow-up urgency, source visibility, and estimated treatment value before an inquiry is lost. |
| 3 | We use spreadsheets. | That is common. This keeps spreadsheet simplicity but adds a cleaner dashboard, weekly summary, follow-up views, and patient-friendly exports. |
| 4 | We do not need another system. | The goal is not another complex system. It is a lightweight front-desk and owner view for inquiry follow-up and practice performance. |
| 5 | Is this HIPAA compliant? | The current demo uses fake data only. Production use would need proper hosting, access controls, policies, and compliance review before real patient data is entered. |
| 6 | I do not want staff entering duplicate data. | That is a valid concern. For the demo, this should be used only where inquiry tracking is currently messy or missing, not as duplicate work for mature workflows. |
| 7 | My front desk will not use it. | The workflow is intentionally simple: add inquiry, update status, set follow-up date. A paid rollout should include short staff training and a narrow daily routine. |
| 8 | It looks too simple. | That is intentional for the first version. The focus is clarity, follow-up discipline, and owner visibility without overbuilding. |
| 9 | It is not connected to our tools. | Correct. This version is a focused demo. Integrations should only be considered after the practice validates that the workflow is valuable. |
| 10 | Can it send automated texts or emails? | Not in this version. Automated messaging adds compliance and operational complexity. The current goal is to show who needs follow-up. |
| 11 | Can it book appointments? | Not in this version. It is not a scheduler. It helps the practice track inquiries and follow-up actions that lead to appointments. |
| 12 | Can it integrate with insurance systems? | Not in this version. Insurance can be tracked in notes and source, but insurance automation is outside the current scope. |
| 13 | Can it replace our CRM? | It is not designed to replace a mature CRM. It is useful for practices that need a simpler inquiry and follow-up dashboard. |
| 14 | We do not have enough inquiries to justify this. | If inquiry volume is low, the value may be weekly visibility and follow-up consistency. If there is no follow-up problem, this may not be the right fit yet. |
| 15 | We get most inquiries by phone. | Phone calls are supported as an inquiry source. The app helps capture those calls so they do not disappear after the first conversation. |
| 16 | We already know our referrals are best. | That may be true. The dashboard makes that visible and helps compare referrals against Google, website, insurance, and phone inquiries over time. |
| 17 | This will take too long to set up. | The demo is lightweight. A basic setup can start with fake data, then a small approved sample workflow if the practice wants a pilot. |
| 18 | We cannot afford a big software project. | This is intentionally scoped as a small productized setup, not a large custom software build. The pricing tiers should match the level of help needed. |
| 19 | What happens if the database is lost? | SQLite is simple and good for demos or lightweight local use. Hosted persistence needs to be planned clearly for production deployments. |
| 20 | Streamlit does not feel like enterprise software. | Correct. Streamlit is being used for fast, practical demo readiness. If the workflow proves valuable, a more production-grade interface can be considered later. |
| 21 | Can multiple staff members use it at once? | The current version is not built as a full multi-user system. That should be treated as a future requirement if a paid client needs it. |
| 22 | Can you customize it for our practice? | Yes, labels, sample data, and workflow language can be tailored. Larger workflow changes should be scoped carefully so the tool stays simple. |
| 23 | We are worried about patient privacy. | That concern is appropriate. The demo uses fake data. Real data should only be used after deciding hosting, access, retention, and compliance expectations. |
| 24 | How do we know it will improve revenue? | The app does not guarantee revenue. It helps make follow-up gaps, active patients, inquiry sources, and estimated treatment value visible so the practice can act faster. |
| 25 | Why should we trust this? | Start with the demo, fake data, screenshots, exports, and a narrow pilot. Trust should come from a clear workflow, transparent limitations, and measurable follow-up improvement. |

## How To Use This

- Log the exact objection in `PROJECT_OS/CLIENT_FEEDBACK.md`.
- Record which response was used and whether it helped.
- If the same objection appears repeatedly, update `PROJECT_OS/SALES_NOTES.md`, the FAQ, or the demo script.
- Do not promise authentication, scheduling, payments, EHR, automated messaging, or HIPAA-grade production readiness unless those are separately scoped.
