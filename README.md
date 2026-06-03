# Chiropractic Business OS MVP

A simple Streamlit + SQLite operating dashboard for a chiropractic practice. It stores patient inquiries, tracks follow-ups, shows Estimated Treatment Value, generates an on-screen weekly practice summary, and exports CSV files.

Prepared for a June 15 chiropractor demo. The app is intentionally focused on practice-owner clarity, patient inquiry follow-up, and treatment revenue visibility.

## Features

- Patient inquiry intake form
- SQLite patient inquiry database
- KPI dashboard
- KPI help dialog and plain-language tooltips
- Patient inquiry details with follow-up scheduling
- Weekly practice summary with a printable Practice Performance Snapshot
- CSV export
- Chiropractic demo sample data

## Configuration

The app currently uses a chiropractic configuration in `src/business_os/config.py`. Core Business OS behavior such as inquiry tracking, follow-up tracking, KPI calculations, exports, and reporting remains reusable, while chiropractic-specific values such as statuses, sources, service examples, labels, terminology, demo data path, weekly summary wording, and export filename prefixes are centralized in configuration.

This prepares the codebase for future industry templates without changing current Chiropractic Business OS functionality or the SQLite schema.

## Project Structure

```text
business_os_mvp/
  app.py
  requirements.txt
  README.md
  .env.example
  PROJECT_OS/
    ROADMAP.md
    BACKLOG.md
    CLIENT_FEEDBACK.md
    SALES_NOTES.md
    FEATURE_REQUESTS.md
    trust_audit.md
    sales/
      qualification_scorecard.md
      proposal_template.md
      proposal_checklist.md
      proposal_workflow.md
      proposal_tracking.md
      discovery_call_playbook.md
      discovery_call_scorecard.md
      discovery_call_notes_template.md
      discovery_call_flow.md
    client_delivery/
      client_onboarding_packet.md
      client_onboarding_packet.pdf
      client_data_import_template.csv
      training_session_script.md
      client_handoff_document.md
      implementation_timeline.md
    client_success/
      client_health_score.md
      quarterly_business_review_template.md
      feedback_collection_template.md
      client_testimonial_request.md
      retention_playbook.md
      success_story_template.md
    prospect_management/
      chiropractic_prospect_tracker.xlsx
      prospect_tracker_guide.md
      qualification_scorecard.md
      targeting_framework.md
      top20_selection_framework.md
      top_20_selection_framework.md
      first_20_prospect_strategy.md
      discovery_call_data_collection.md
      prospect_acquisition_playbook.md
      prospect_research_checklist.md
      outreach_launch_readiness.md
    sales_training/
      competitive_positioning_guide.md
      discovery_call_simulation.md
      sales_call_scorecard.md
      chiropractic_objection_library.md
      top_10_demo_killers.md
      simulation_library.md
      discovery_call_evaluation_scorecard.md
      common_sales_mistakes.md
      rapid_response_guide.md
      20_call_rehearsal_tracker.md
    launch/
      outreach_readiness_audit.md
      final_pre_outreach_checklist.md
      first_client_milestones.md
      post_demo_feedback_form.md
      outreach_metrics_tracker.md
    first_client_learning/
      outreach_lessons.md
      discovery_call_lessons.md
      demo_feedback.md
      proposal_feedback.md
      onboarding_feedback.md
      first_client_retrospective.md
    deployment_rehearsal/
      deployment_rehearsal_report.md
      deployment_rehearsal_report_v2.md
      manual_deployment_steps.md
    outreach/
      outreach_tracker.csv
      outreach_status_definitions.md
      pipeline_definitions.md
      weekly_outreach_review.md
      outreach_metrics.md
  DEMO_KIT/
    demo_data.md
    demo_walkthrough_checklist.md
    screenshot_checklist.md
    demo_reset_process.md
    demo_troubleshooting_guide.md
  demo_website/
    index.html
    styles.css
    README.md
  data/
    business_os.sqlite
    chiropractor_sample_data.csv
  exports/
  deploy_sop/
    setup_checklist.md
    deployment_checklist.md
    data_import_checklist.md
    training_checklist.md
    handoff_checklist.md
    monthly_support_checklist.md
  marketing/
    one_page_offer.md
    outreach_assets.md
  portfolio/
    portfolio_case_study.md
  screenshots/
    dashboard.png
    inquiries.png
    weekly_summary.png
    export.png
  sales_assets/
    README.md
    demo_video.mp4
    one_page_offer.pdf
    faq.pdf
    pricing.pdf
    discovery_questions.pdf
    demo_script.pdf
    onboarding_checklist.pdf
    revenue_model.csv
    screenshots/
  src/
    business_os/
      __init__.py
      config.py
      db.py
      reports.py
      sample_data.py
```

## Setup

From this repository folder:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Run

```bash
streamlit run app.py
```

If the `streamlit` command is not on your PATH, use:

```bash
python3 -m streamlit run app.py
```

Or run the included launcher:

```bash
./run_app.sh
```

The app initializes `data/business_os.sqlite` automatically and seeds chiropractic sample inquiries when the database is empty.

## Environment Variables

Optional database path:

```bash
BUSINESS_OS_DB_PATH=data/business_os.sqlite
```

If this path is unset or blank, the app uses `data/business_os.sqlite`. If this path is relative, the app resolves it from the app folder. Use an absolute path only when the deployment host gives you persistent disk storage.

Copy `.env.example` if your deployment platform or local workflow needs a reference value. The app reads `BUSINESS_OS_DB_PATH` from the process environment; it does not require a `.env` package.

Optional demo mode:

```bash
BUSINESS_OS_DEMO_MODE=true
```

Demo mode shows a sidebar reset button that replaces current records with the fake chiropractic sample data. Use it for screenshots, outreach prep, and live demos only.

## Demo Workflow

1. Open the Dashboard tab to review patient inquiries, follow-ups, and estimated treatment value.
2. Use `KPI Help` if the practice owner wants plain-language definitions for each metric.
3. Add a patient inquiry from the Patient Inquiries tab.
4. Use Inquiry Details and Follow-Up to update status or next follow-up date.
5. Review the weekly practice summary and generate a Practice Performance Snapshot from the Weekly Summary tab.
6. Download the snapshot, all inquiries, or the follow-up queue as CSV/text exports.

## Demo Website

The `demo_website/` folder contains a simple static landing page for outreach:

- `demo_website/index.html`: marketing page with hero, problem, solution, features, screenshots, demo video, FAQ, and contact sections.
- `demo_website/styles.css`: lightweight responsive styling.
- `demo_website/README.md`: local opening instructions and scope notes.

The page uses the existing app screenshots and `sales_assets/demo_video.mp4`. It also includes fit, non-fit, trust, and conservative ROI language for June 15 outreach. It is a marketing website only. It is not a SaaS frontend, does not add authentication, and does not change app functionality, pricing, deployment logic, or the SQLite schema.

## KPI Definitions

These definitions are also available inside the app through the `KPI Help` and `Weekly KPI Help` buttons.

- Total Patient Inquiries: count of all patient inquiries.
- New This Week: inquiries created during the current calendar week, starting Monday.
- Active Patients: inquiries marked `Active Patient`.
- Follow-Ups Needed: inquiries marked `Follow-Up Needed` or due for follow-up today or earlier, excluding `Lost`.
- Overdue Follow-Ups: inquiries with a follow-up date before today, excluding `Lost`.
- Estimated Treatment Value: sum of `estimated_value` for all inquiries not marked `Lost`.
- Inquiry-to-Patient Conversion Rate: `Active Patient` count divided by Total Patient Inquiries.
- Top Inquiry Source: the source with the highest inquiry count, or `None` when there are no inquiries.

## Sample Data

Demo inquiries are stored in:

```text
data/chiropractor_sample_data.csv
```

When the SQLite database is empty, the app reads this CSV and inserts the sample patient inquiries into the existing `leads` table. Existing database records are never overwritten, so the CSV is only used for first-time seeding.

To replace or extend the demo data:

1. Edit `data/chiropractor_sample_data.csv`.
2. Keep the same CSV headers.
3. Use fake patient names, phone numbers, and emails only.
4. Use the supported status and source labels listed below.
5. Use `created_offset_days` and `next_follow_up_offset_days` to keep demo dates fresh relative to the day the database is seeded.

Date offset examples:

- `next_follow_up_offset_days = -2` creates an overdue follow-up.
- `next_follow_up_offset_days = 0` creates a follow-up due today.
- `next_follow_up_offset_days = 3` creates a future follow-up.
- Leave `next_follow_up_offset_days` blank for no scheduled follow-up.

To reseed from the CSV during local testing, stop the app and delete the local SQLite file:

```bash
rm data/business_os.sqlite
python3 -m streamlit run app.py
```

If `BUSINESS_OS_DEMO_MODE=true`, use the sidebar `Reset demo data` button to reseed without deleting the database manually.

## Marketing And Sales Assets

Optional outreach materials live alongside the codebase so the productized service is ready for June 15 outreach and client demos.

- `marketing/one_page_offer.md`: editable one-page offer with headline, problem, solution, deliverables, audience, exclusions, pricing tiers, support options, and call-to-action.
- `marketing/outreach_assets.md`: editable outreach copy including cold email, follow-up email, LinkedIn message, Facebook message, phone opener, discovery questions, and objection responses.
- `screenshots/`: app screenshots for quick README, portfolio, or outreach use.
- `sales_assets/`: distribution-ready PDFs, screenshot copies, and the narrated demo video.
- `sales_assets/objection_handling.md`: honest responses to common chiropractor objections during outreach.
- `sales_assets/revenue_model.csv`: simple revenue model for the $500, $1,500, and $3,000 offer tiers across 1, 5, 10, and 20 clients.
- `sales_assets/roi_calculator.md`: conservative missed-follow-up ROI calculator explanation for discovery and pricing conversations.
- `sales_assets/roi_calculator.csv`: example ROI calculator row for quick spreadsheet use.

These files are optional sales collateral. The customer-facing collateral now uses consistent trust language: who the offer is for, what it is not, a simple onboarding timeline, support options, and conservative non-guaranteed ROI framing. They are not required by the core app and do not affect the database schema or Streamlit functionality.

## Project Operating System

The repository includes a lightweight internal operator system in `PROJECT_OS/` for future client work. These files are internal planning and sales-operations documents, not customer-facing app features:

- `PROJECT_OS/ROADMAP.md`: internal near-term and deferred product direction.
- `PROJECT_OS/BACKLOG.md`: internal possible future work grouped by priority.
- `PROJECT_OS/CLIENT_FEEDBACK.md`: internal template for demo feedback, outreach reactions, and objections.
- `PROJECT_OS/SALES_NOTES.md`: internal positioning, buyer notes, objections, and pricing.
- `PROJECT_OS/FEATURE_REQUESTS.md`: internal request log and decision rules.
- `PROJECT_OS/trust_audit.md`: internal record of customer-facing trust findings, copy changes, future trust improvements, and proof assets needed after the first client.

Root-level copies of these files are kept for quick access. The `PROJECT_OS/` folder is the preferred place to use for ongoing client feedback, feature triage, and growth planning. These documents are for operating the project and should not be treated as committed feature scope.

### Sales

The `PROJECT_OS/sales/` folder supports proposal and close-stage execution:

- `PROJECT_OS/sales/qualification_scorecard.md`: quick sales qualification scorecard for prioritizing chiropractic prospects during outreach.
- `PROJECT_OS/sales/proposal_template.md`: client-facing proposal template with summary, challenges, recommended solution, deliverables, timeline, training, support, pricing, next steps, and signature section.
- `PROJECT_OS/sales/proposal_checklist.md`: pre-send checklist for discovery, qualification, demo, package selection, pricing, and onboarding packet readiness.
- `PROJECT_OS/sales/proposal_workflow.md`: proposal flow from Discovery Call to Demo to Proposal to Decision to Onboarding to Go Live.
- `PROJECT_OS/sales/proposal_tracking.md`: simple proposal tracking table for package, value, status, follow-up date, outcome, and notes.
- `PROJECT_OS/sales/discovery_call_playbook.md`: consultative discovery call framework with opening, rapport, process questions, qualification checkpoints, objections, and recommended next steps.
- `PROJECT_OS/sales/discovery_call_scorecard.md`: post-call scorecard for qualification score, pain score, urgency score, buying likelihood, objections, and next step.
- `PROJECT_OS/sales/discovery_call_notes_template.md`: structured notes template for practice overview, current workflow, inquiry process, follow-up process, reporting, pain points, objections, and next action.
- `PROJECT_OS/sales/discovery_call_flow.md`: simple call flow from Introduction to Discovery to Qualification to Pain Identification to Demo Invitation to Next Steps.

These files support sales execution only. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### Client Delivery

The `PROJECT_OS/client_delivery/` folder contains first-client onboarding and handoff materials:

- `PROJECT_OS/client_delivery/client_onboarding_packet.md`: one-page client onboarding packet to send immediately after a chiropractor signs.
- `PROJECT_OS/client_delivery/client_onboarding_packet.pdf`: PDF version of the one-page onboarding packet.
- `PROJECT_OS/client_delivery/client_data_import_template.csv`: simple starter import template with five example rows.
- `PROJECT_OS/client_delivery/training_session_script.md`: 30-minute training agenda covering dashboard, inquiry, follow-up, weekly review, export, and Q&A workflows.
- `PROJECT_OS/client_delivery/client_handoff_document.md`: client-facing handoff structure for access, exports, monthly review, support, and troubleshooting.
- `PROJECT_OS/client_delivery/implementation_timeline.md`: four-day setup, data import, training, and go-live plan.

These files support delivery speed and repeatability for the first paying client. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### Outreach Operating System

The `PROJECT_OS/outreach/` folder supports tracking 100 chiropractic prospects before June 15:

- `PROJECT_OS/outreach/outreach_tracker.csv`: prospect tracker for contact details, outreach status, pipeline stage, objections, responses, demos, proposals, wins, and notes.
- `PROJECT_OS/outreach/outreach_status_definitions.md`: status definitions for consistent outreach tracking.
- `PROJECT_OS/outreach/pipeline_definitions.md`: sales pipeline stage definitions.
- `PROJECT_OS/outreach/weekly_outreach_review.md`: weekly review template for outreach activity, objections, responses, wins, losses, and next priorities.
- `PROJECT_OS/outreach/outreach_metrics.md`: simple definitions for outreach volume, response rate, demo booking rate, proposal rate, and close rate.

These files support sales tracking, demo follow-up, and client acquisition. They do not change the app, database schema, pricing, deployment setup, or product functionality.

### Prospect Management

The `PROJECT_OS/prospect_management/` folder contains a more complete prospect management workbook for tracking up to 100 chiropractic practices before outreach begins:

- `PROJECT_OS/prospect_management/chiropractic_prospect_tracker.xlsx`: spreadsheet tracker with `Prospects` and `Metrics` sheets, dropdowns for outreach/pipeline statuses, proposal/demo tracking, objection tracking, and formula-driven metrics.
- `PROJECT_OS/prospect_management/prospect_tracker_guide.md`: operating guide for using the workbook, reviewing weekly pipeline metrics, and logging objections/follow-ups.
- `PROJECT_OS/prospect_management/qualification_scorecard.md`: detailed 1-100 qualification scorecard for scoring practice size, inquiry volume, tracking method, follow-up process, reporting maturity, and openness to technology.
- `PROJECT_OS/prospect_management/targeting_framework.md`: Tier 1, Tier 2, and Tier 3 targeting framework for outreach priority and follow-up intensity.
- `PROJECT_OS/prospect_management/top20_selection_framework.md`: workflow for selecting the highest-priority 20 practices from a pool of 100.
- `PROJECT_OS/prospect_management/top_20_selection_framework.md`: criteria-based top-20 framework with automatic Tier 1 indicators, red flags, and tie-breakers.
- `PROJECT_OS/prospect_management/first_20_prospect_strategy.md`: recommendations for selecting the first 20 outreach prospects by geography, practice size, marketing activity, website quality, and technology signals.
- `PROJECT_OS/prospect_management/discovery_call_data_collection.md`: discovery questions for improving qualification scores after calls.
- `PROJECT_OS/prospect_management/prospect_acquisition_playbook.md`: Georgia-focused playbook for building, scoring, and ranking 100 chiropractic practices.
- `PROJECT_OS/prospect_management/prospect_research_checklist.md`: per-practice research checklist for core contact details and qualification signals.
- `PROJECT_OS/prospect_management/outreach_launch_readiness.md`: readiness checklist for launching outreach after 100 prospects are researched and scored.

These files are operational sales assets only. They do not change application logic, database schema, pricing, deployment behavior, or product functionality.

### Sales Training

The `PROJECT_OS/sales_training/` folder supports chiropractor outreach practice:

- `PROJECT_OS/sales_training/competitive_positioning_guide.md`: positioning against Excel, Google Sheets, HubSpot, Salesforce, and chiropractic EHR systems.
- `PROJECT_OS/sales_training/discovery_call_simulation.md`: skeptical chiropractor scenario, difficult sales questions, strong answers, and scoring rubric.
- `PROJECT_OS/sales_training/sales_call_scorecard.md`: post-call scoring for clarity, confidence, pricing, EHR boundary, privacy, ROI, and next-step close.
- `PROJECT_OS/sales_training/chiropractic_objection_library.md`: 30 common objections with the reason behind each objection, wrong response, and better response.
- `PROJECT_OS/sales_training/top_10_demo_killers.md`: common demo mistakes, why they hurt trust, and better approaches.
- `PROJECT_OS/sales_training/simulation_library.md`: 20 simulated chiropractic prospect profiles for discovery-call rehearsal.
- `PROJECT_OS/sales_training/discovery_call_evaluation_scorecard.md`: 1-5 scorecard for rapport, discovery, qualification, objection handling, positioning, and close.
- `PROJECT_OS/sales_training/common_sales_mistakes.md`: guide to avoiding talking too much, pitching too early, feature dumping, arguing, overpromising ROI, and attacking existing software.
- `PROJECT_OS/sales_training/rapid_response_guide.md`: short responses to common questions about Excel, Google Sheets, HubSpot, EHRs, ROI, staff adoption, and support.
- `PROJECT_OS/sales_training/20_call_rehearsal_tracker.md`: tracker for 20 simulated discovery calls before outreach begins.

These files are sales training documents only. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### Launch Readiness

The `PROJECT_OS/launch/` folder supports final outreach certification and launch discipline:

- `PROJECT_OS/launch/outreach_readiness_audit.md`: readiness audit covering product, demo, website, proposal, discovery call, qualification system, deployment process, onboarding, and client success.
- `PROJECT_OS/launch/final_pre_outreach_checklist.md`: final checklist for demo, sales materials, call preparation, prospecting setup, and delivery readiness.
- `PROJECT_OS/launch/first_client_milestones.md`: milestone tracker from first reply through first testimonial, with success criteria for each step.
- `PROJECT_OS/launch/post_demo_feedback_form.md`: post-demo form for qualification score, objections, interest level, next step, and lessons learned.
- `PROJECT_OS/launch/outreach_metrics_tracker.md`: outreach KPI tracker for prospects, contacts attempted, responses, discovery calls, demos, proposals, clients, weekly targets, and conversion calculations.

These files certify execution readiness only. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### First Client Learning

The `PROJECT_OS/first_client_learning/` folder captures what real outreach, demos, proposals, onboarding, and deployment teach after launch:

- `PROJECT_OS/first_client_learning/outreach_lessons.md`: template for outreach message used, response received, lessons learned, and recommended changes.
- `PROJECT_OS/first_client_learning/discovery_call_lessons.md`: template for qualification score, objections, questions asked, confusing areas, and call lessons.
- `PROJECT_OS/first_client_learning/demo_feedback.md`: template for demo date, attendee, questions, confusing sections, strongest sections, and improvement ideas.
- `PROJECT_OS/first_client_learning/proposal_feedback.md`: template for proposal package, objections, pricing concerns, requested changes, and outcome.
- `PROJECT_OS/first_client_learning/onboarding_feedback.md`: template for onboarding issues, training issues, deployment issues, support requests, and first-week review.
- `PROJECT_OS/first_client_learning/first_client_retrospective.md`: retrospective for what went well, what went poorly, surprises, process improvements, sales improvements, product ideas, and next actions.

These files are learning and operating templates only. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### Client Success

The `PROJECT_OS/client_success/` folder supports retention, client feedback, referrals, and future testimonials after a practice starts using the system:

- `PROJECT_OS/client_success/client_health_score.md`: Green, Yellow, and Red client health framework with recommended actions.
- `PROJECT_OS/client_success/quarterly_business_review_template.md`: quarterly KPI review, trend review, wins, challenges, and next-quarter goal template.
- `PROJECT_OS/client_success/feedback_collection_template.md`: structured prompts for feature requests, frustrations, favorite functionality, ROI feedback, and testimonial opportunities.
- `PROJECT_OS/client_success/client_testimonial_request.md`: scripts for requesting testimonials, referrals, and case study participation.
- `PROJECT_OS/client_success/retention_playbook.md`: monthly check-in, quarterly review, renewal, referral, warning-sign, and recovery processes.
- `PROJECT_OS/client_success/success_story_template.md`: future client success story template for practice profile, challenge, previous workflow, solution, results, client quote, and lessons learned.

These documents are operating assets only. They do not change app code, database schema, pricing, deployment behavior, or product functionality.

### Deployment Rehearsal

The `PROJECT_OS/deployment_rehearsal/` folder documents a simulated new-client deployment:

- `PROJECT_OS/deployment_rehearsal/deployment_rehearsal_report.md`: rehearsal result, evidence, friction found, and handoff completion status.
- `PROJECT_OS/deployment_rehearsal/deployment_rehearsal_report_v2.md`: second deployment rehearsal focused on `client signs -> deploy -> train -> done`, unclear instructions, repeated actions, and improvement opportunities.
- `PROJECT_OS/deployment_rehearsal/manual_deployment_steps.md`: manual operator steps for client intake, database setup, production import, verification, exports, and handoff.

These files reduce deployment friction by documenting the manual path before client delivery. They do not change deployment logic or app behavior.

## Demo Kit

The `DEMO_KIT/` folder contains repeatable sales-demo support materials:

- `DEMO_KIT/demo_data.md`: demo data source, story, and safety notes.
- `DEMO_KIT/demo_walkthrough_checklist.md`: consistent live-demo flow.
- `DEMO_KIT/screenshot_checklist.md`: checklist for refreshing screenshots.
- `DEMO_KIT/demo_reset_process.md`: reset steps before demos and screenshots.
- `DEMO_KIT/demo_troubleshooting_guide.md`: common demo issues and fixes.

The Demo Kit is operational documentation only. It does not change the Streamlit app or SQLite schema.

## Deployment SOP

The `deploy_sop/` folder contains repeatable client deployment checklists:

- `setup_checklist.md`
- `deployment_checklist.md`
- `data_import_checklist.md`
- `training_checklist.md`
- `handoff_checklist.md`
- `monthly_support_checklist.md`

These SOP files support sales, setup, training, handoff, and support. They do not change the core app or database schema.

## Portfolio Case Study

The `portfolio/portfolio_case_study.md` file summarizes the project for portfolio marketing. It covers the problem, solution, architecture, features, technologies, business impact, lessons learned, future roadmap, and suitability.

## Demo Status Labels

- `New Inquiry`
- `Consultation Scheduled`
- `Active Patient`
- `Lost`
- `Follow-Up Needed`

## Demo Inquiry Sources

- `Google`
- `Referral`
- `Insurance`
- `Website`
- `Phone Call`

## Database Fields

The SQLite table is still named `leads` internally to preserve the original MVP schema. In the app and exports, these records are shown as patient inquiries. The help and visual polish updates did not change the database schema.

- `id`
- `name`
- `phone`
- `email`
- `service_needed`
- `source`
- `status`
- `estimated_value`
- `notes`
- `next_follow_up_date`
- `created_at`
- `updated_at`

## Deployment

### Streamlit Community Cloud

1. Push this project to GitHub.
2. In Streamlit Community Cloud, create a new app from the repository.
3. Set the main file path to:

```text
app.py
```

4. Streamlit will install dependencies from:

```text
requirements.txt
```

5. Optional environment variable in Streamlit secrets:

```toml
BUSINESS_OS_DB_PATH = "data/business_os.sqlite"
```

If `BUSINESS_OS_DB_PATH` is unset or blank, the app defaults to `data/business_os.sqlite` relative to this app folder. For a demo, the default relative SQLite path is fine. Streamlit Community Cloud storage can reset on redeploy, so treat the bundled SQLite database as demo data unless persistent storage is added later.

Streamlit Community Cloud notes:

- Main file path: `app.py`
- Dependencies: installed from `requirements.txt`
- Optional secret: `BUSINESS_OS_DB_PATH = "data/business_os.sqlite"`
- SQLite local storage can reset on app restart or redeploy.

### Render

1. Create a new Render Web Service from the GitHub repository.
2. Use Python as the runtime.
3. Set the build command:

```bash
pip install -r requirements.txt
```

4. Set the start command:

```bash
python3 -m streamlit run app.py --server.port $PORT --server.address 0.0.0.0
```

5. Optional environment variable:

```text
BUSINESS_OS_DB_PATH=data/business_os.sqlite
```

For a real hosted demo, configure a Render persistent disk and set `BUSINESS_OS_DB_PATH` to a path on that disk, such as `/var/data/business_os.sqlite`. Without persistent disk storage, SQLite data may reset when the service restarts or redeploys.

Render notes:

- Build command: `pip install -r requirements.txt`
- Start command: `python3 -m streamlit run app.py --server.port $PORT --server.address 0.0.0.0`
- For persistent data, mount a Render disk and point `BUSINESS_OS_DB_PATH` to that disk.

### SQLite Persistence Notes

- Local runs store data in `data/business_os.sqlite` by default.
- Blank or unset `BUSINESS_OS_DB_PATH` values use the same default path.
- `BUSINESS_OS_DB_PATH` can point to a different relative or absolute SQLite path.
- Streamlit Community Cloud does not guarantee persistent local disk storage across redeploys.
- Render needs a persistent disk for SQLite data to survive restarts and redeploys.
- For the June 15 demo, the bundled SQLite sample data is suitable as demo data.

## Local Run Confirmation

The app has been verified locally with:

```bash
python3 -m streamlit run app.py
```

Health check:

```text
http://localhost:8502/_stcore/health -> 200 ok
```

## Demo Walkthrough

1. Start on Dashboard and point out Total Patient Inquiries, Follow-Ups Needed, Active Patients, and Estimated Treatment Value.
2. Click `KPI Help` to show how each number is calculated in plain language.
3. Open Patient Inquiries and add a realistic fake inquiry.
4. Update one inquiry to `Consultation Scheduled` or `Active Patient`.
5. Return to Dashboard to show KPIs recalculating after the update.
6. Open Weekly Summary and review the Practice Performance Snapshot.
7. Download the snapshot or patient inquiry CSV from the relevant download buttons.

## Troubleshooting

- If `streamlit run app.py` is not available, use `python3 -m streamlit run app.py`.
- If the app opens with no demo data, confirm `data/chiropractor_sample_data.csv` exists and the SQLite database is empty.
- If old demo rows appear, delete the local SQLite file and restart the app to reseed from the CSV.
- If the app cannot write the database, check that `BUSINESS_OS_DB_PATH` points to a writable folder.
- On Streamlit Community Cloud and Render without persistent disk storage, SQLite data may reset after restart or redeploy.

## Notes

This MVP intentionally does not include authentication, payments, external APIs, or AI features. It is built to stay simple and demo-ready for a chiropractic practice owner.
