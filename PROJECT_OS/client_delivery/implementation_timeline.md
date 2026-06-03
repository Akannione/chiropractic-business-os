# Implementation Timeline

Use this simple four-day timeline to reduce onboarding friction for the first paying client.

## Day 1: Setup

Goal: prepare the environment and confirm client scope.

Tasks:

- Confirm practice name and primary contact.
- Confirm deployment target.
- Confirm whether the first setup uses fake data or approved client data.
- Confirm `BUSINESS_OS_DB_PATH`.
- Confirm `BUSINESS_OS_DEMO_MODE` is unset for production-style setup.
- Confirm repository and requirements are ready.
- Start the app locally or on the selected host.
- Confirm Dashboard loads.

Done when:

- The app opens.
- The database path is known.
- The client understands the system boundaries.

## Day 2: Data Import

Goal: load starter inquiry data and verify the dashboard.

Tasks:

- Review `client_data_import_template.csv`.
- Confirm data is fake or approved for use.
- Confirm requested services are chiropractic-specific.
- Confirm status values are supported.
- Confirm follow-up dates are valid.
- Import or manually enter starter inquiries.
- Verify Dashboard values.
- Verify Weekly Summary.
- Verify CSV exports.

Done when:

- Data appears in the app.
- Dashboard and Weekly Summary are populated.
- Exports download correctly.

## Day 3: Training

Goal: train the owner, office manager, or front desk on the daily and weekly workflow.

Tasks:

- Use `training_session_script.md`.
- Walk through Dashboard.
- Add or review one inquiry.
- Update one follow-up.
- Review Weekly Summary.
- Download an export.
- Confirm Q&A and workflow owner.

Done when:

- The client can explain the daily follow-up habit.
- The client knows who owns updates.
- The first weekly review time is chosen.

## Day 4: Go Live

Goal: complete handoff and start the operating rhythm.

Tasks:

- Use `client_handoff_document.md`.
- Confirm access.
- Confirm support process.
- Confirm monthly review process.
- Confirm first check-in date.
- Record open questions.
- Capture any feature requests separately.

Done when:

- Client has access.
- Client understands the workflow.
- Support and review expectations are clear.
- The system is ready for real operating use within the agreed scope.
