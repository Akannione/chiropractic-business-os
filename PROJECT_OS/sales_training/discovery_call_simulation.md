# Discovery Call Simulation

Use this to practice calls with skeptical chiropractic practice owners. Keep answers business-focused, not technical.

## Skeptical Opening Challenge

"We already have an EHR and a spreadsheet. I do not see why we need another dashboard. What exactly does this do that helps my practice?"

Strong answer:

"That is fair. This is not here to replace your EHR or spreadsheet. It focuses on the part many practices struggle to see quickly: which patient inquiries need follow-up, which ones are overdue, what estimated treatment value is still open, and what happened this week. If your current process already prevents missed follow-ups, you may not need it. If not, this gives the owner and front desk a simple operating view."

## 20 Difficult Sales Questions And Strong Answers

1. **Why do I need this if I already have an EHR?**
   - Your EHR should stay the clinical source of truth. This helps with inquiry follow-up visibility before or around booking.

2. **Is this HIPAA compliant?**
   - The demo uses fake data. Production use with real patient data would require separate hosting, access control, privacy, and compliance planning.

3. **Can it schedule appointments?**
   - Not in this version. It helps track who needs follow-up so your existing scheduling process gets used faster.

4. **Can it send automatic texts?**
   - Not in this version. Automated messaging adds compliance and operational complexity. The current focus is visibility and follow-up discipline.

5. **Why not just use Google Sheets?**
   - A sheet may be enough if it is working. This gives a cleaner owner dashboard, weekly summary, and follow-up urgency without manual filtering.

6. **How will this make me money?**
   - It does not guarantee revenue. It helps reduce missed inquiries and makes estimated treatment value visible so the team can act faster.

7. **Will my front desk actually use it?**
   - The workflow is intentionally simple: add inquiry, set status, set next follow-up. Training should focus on one daily review habit.

8. **What happens if we stop using it?**
   - The app can export patient inquiry data as CSV so the practice is not locked into the dashboard.

9. **Can multiple people use it?**
   - The current demo is lightweight. Multi-user production use should be scoped separately if the practice needs it.

10. **Is the data persistent online?**
    - SQLite persistence depends on hosting. Production deployment needs a clear persistence plan before real data is used.

11. **What makes this different from HubSpot?**
    - HubSpot is a broad CRM. This is narrower, chiropractic-specific, and easier to understand for inquiry follow-up.

12. **What makes this different from Salesforce?**
    - Salesforce is enterprise-grade and much heavier. This is a simple small-practice operating dashboard.

13. **Can it connect to my EHR?**
    - Not in this version. EHR integration should only be considered after a paid workflow need is proven.

14. **What if we do not have many inquiries?**
    - Then the value may be lower. The best fit is a practice that wants clearer follow-up and owner visibility.

15. **How long does setup take?**
    - A demo setup is lightweight. A production setup depends on data, hosting, and handoff requirements.

16. **Can you customize it?**
    - Labels, sample data, and workflow wording can be tailored. Larger workflow changes should be scoped carefully.

17. **What is the first thing I should look at each day?**
    - Follow-Ups Needed, Overdue Follow-Ups, and Estimated Treatment Value.

18. **How do I know if this is working?**
    - Track fewer overdue follow-ups, faster follow-up completion, clearer weekly review, and more inquiries becoming active patients.

19. **What if staff forget to update it?**
    - Then it will not help. The tool needs a simple daily habit, usually owned by the front desk.

20. **What is the next step if I am interested?**
    - Review the current workflow, confirm fit, choose the smallest useful setup, and agree on what success looks like.

## Scoring Rubric

Score each answer from 1 to 5.

| Score | Meaning |
|---|---|
| 1 | Vague, defensive, too technical, or ignores the concern. |
| 2 | Partially answers but does not connect to business outcomes. |
| 3 | Clear enough, but missing a next step or practical example. |
| 4 | Clear, honest, outcome-focused, and handles the concern directly. |
| 5 | Concise, confident, honest about limits, and moves toward a useful next step. |

## What Makes An Answer Too Technical

- Explaining Streamlit, SQLite, schemas, or deployment details before the buyer asks.
- Talking about implementation instead of missed inquiries and follow-up speed.
- Defending the technology instead of clarifying fit.
- Overpromising compliance, automation, EHR integration, or production readiness.

## Outcome Reminder

Keep answers tied to:

- Fewer missed inquiries.
- Faster follow-up.
- Weekly visibility.
- Simple setup.
- Clear EHR boundary.
- Honest privacy limitations.
