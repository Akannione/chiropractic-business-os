# CBOS Demo Walkthrough

Use this guide when showing the CBOS to a chiropractor, practice owner, office manager, or front desk lead.

## Demo Goal

Show that the system helps a chiropractic office track patient inquiries, follow up consistently, and understand weekly practice activity without replacing their existing tools.

Keep the demo simple. The point is not to show every feature. The point is to make them think:

> This would help us stop losing track of people who already showed interest.

## Opening Script

Say:

> This is a lightweight CBOS. It helps a practice track new patient inquiries, follow-ups, active patients, and weekly performance.

Then say:

> It does not replace your EHR, billing, insurance, or scheduling software. It focuses on the gap before someone becomes a fully active patient: who reached out, what they needed, who followed up, and what happened next.

## Why This Is Useful

Say:

> This is useful if your office has people calling, filling out forms, getting referred, or asking about care, and someone has to remember who followed up, who booked, who needs another call, and what happened next.

Then connect it to their real workflow:

> A lot of practices already get inquiries from Google, referrals, phone calls, websites, or insurance questions. The problem is those inquiries can end up spread across sticky notes, inboxes, spreadsheets, staff memory, or the EHR only after someone becomes a patient.

Then state the value:

> This gives the office one simple place to see every inquiry before they become a patient, what service they asked about, who needs follow-up, who is overdue, who became active, and what potential value is sitting in the pipeline.

## Demo Setup

Local app URL:

```text
http://localhost:5173/
```

Backend health check:

```text
http://localhost:4000/api/health
```

If the browser does not load, hard refresh with:

```text
Cmd + Shift + R
```

## Demo Flow

### 1. Dashboard

Start on the dashboard.

Point out:

- Estimated Treatment Value
- Follow-Ups Needed
- Active Patients
- Inquiry-to-Patient Rate
- Today's Follow-Up Workflow

Say:

> The goal is for the owner or front desk to see what needs attention today in under 30 seconds.

Then say:

> Instead of asking, "Who needs a call back?" the office can open this and see overdue follow-ups and today’s follow-ups immediately.

### 2. Patient Inquiries

Click **Patient Inquiries**.

Show:

- Patient name
- Phone and email
- Requested service
- Inquiry source
- Status
- Estimated treatment value
- Next follow-up date
- Notes

Say:

> When someone calls, fills out a website form, comes from Google, or is referred by another patient, staff can enter the inquiry here so it does not get lost.

### 3. Who Inputs The Information

If they ask who enters the information, say:

> Usually the front desk or whoever handles new patient calls inputs it. It is meant to be simple enough that staff can add an inquiry while they are on the phone or right after a website or referral message comes in.

Then explain the three input paths:

> There are three ways information can get in. First, staff can enter it manually. Second, a public intake form can be linked from the website or Google Business Profile. Third, existing spreadsheet data can be imported if the practice already has a list.

If they ask whether patients fill it out, say:

> They can, if the practice wants to use the intake link. But it can also stay internal and be used only by staff.

If they ask who owns the data, say:

> The practice owns the data. Staff use it day to day, and the owner can review the dashboard and weekly summary.

### 4. Follow-Up Workflow

Open an existing inquiry and update the status.

Good status examples:

- New Inquiry to Consultation Scheduled
- Consultation Scheduled to Active Patient
- Follow-Up Needed to Consultation Scheduled
- Follow-Up Needed to Lost

Say:

> This makes follow-up visible. The office can see who needs a call today, who is overdue, and who became an active patient.

Then say:

> The owner does not have to rely only on memory or ask staff for a manual update.

### 5. Patient Reactivations

Click **Reactivations**.

Show:

- Overdue patients first
- Due-today patients
- Last visit date
- Expected visit frequency
- Follow-up owner
- Follow-up outcome

Say:

> This is the gap the clinic described. CBOS calculates when a weekly or monthly patient was expected back and creates a call list without replacing MetaSoft or the appointment calendar.

Then select a patient and update the owner or outcome.

Say:

> The front desk can work the list and record whether they left a voicemail, spoke with the patient, or scheduled the next visit.

### 6. Public Intake

Click **Public Intake**.

Say:

> This form can be linked from the practice website, Google Business Profile, or referral partners so new inquiries come in cleaner.

Useful examples:

```text
/intake?source=Google
/intake?source=Referral
/intake?source=Website
```

Say:

> The source can be tracked automatically, so the practice can start seeing where inquiries are coming from.

### 7. Weekly Summary

Click **Weekly Summary**.

Say:

> This gives the practice owner a simple weekly view of inquiry activity, follow-ups, active patients, and estimated treatment value.

Then say:

> It is meant to support a quick weekly review, not create a complicated report.

### 8. Exports

Click **Exports**.

Say:

> The practice owns the data. They can export patient inquiries anytime as a CSV.

If they already use spreadsheets, say:

> This can also help clean up an existing inquiry list and bring it into one place.

Mention the fake import file:

```text
docs/METASOFT_REACTIVATION_DEMO.csv
```

Say:

> Before importing real information, we preview the clinic's export, confirm the field mapping, identify duplicates, and test with fake data. That directly reduces migration risk.

## What Not To Claim

Do not say:

- This guarantees more revenue.
- This replaces your EHR.
- This replaces scheduling.
- This handles insurance or billing.
- This sends automated patient messages.

Say instead:

> This improves visibility, follow-up consistency, and owner awareness around patient inquiries.

## Best Closing Question

End with:

> How do you currently track new patient inquiries and make sure follow-ups do not fall through the cracks?

If they say they use memory, paper notes, spreadsheets, inboxes, or that the front desk handles it differently each time, say:

> That is exactly where this helps. It makes those follow-ups visible so the owner and staff do not have to rely on memory.

## Quick Objection Responses

### We already have an EHR.

Say:

> That makes sense. This is not trying to replace the EHR. It is focused on the inquiry and follow-up stage before someone is fully in the system.

### We already use spreadsheets.

Say:

> Spreadsheets can work, but this gives the practice a clearer workflow, follow-up dates, dashboard view, weekly summary, and export without needing to rebuild the sheet every time.

### Who would use this?

Say:

> Usually front desk staff use it daily, and the owner or office manager reviews the dashboard and weekly summary.

### Is this for patients or staff?

Say:

> Both can be supported. Staff can enter inquiries internally, and the practice can also choose to use a public intake link for website or Google inquiries.

### Is this complicated to set up?

Say:

> The goal is a simple setup: practice details, sample or existing inquiry data, staff walkthrough, then go live.

## Demo Close

Say:

> The main value is simple: every inquiry in one place, every follow-up visible, and a weekly view of whether the practice is converting interest into active patients.
