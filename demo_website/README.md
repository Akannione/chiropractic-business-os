# Demo Website

This folder contains a simple static marketing website for the Chiropractic Business OS.

## Open Locally

Open this file directly in a browser:

```text
demo_website/index.html
```

For a local HTTP preview with screenshots and video resolving correctly, serve from the repository root:

```bash
python3 -m http.server 8765
```

Then open:

```text
http://localhost:8765/demo_website/
```

The page uses existing repository assets:

- `screenshots/dashboard.png`
- `screenshots/inquiries.png`
- `screenshots/weekly_summary.png`
- `screenshots/export.png`
- `sales_assets/demo_video.mp4`

## Conversion Notes

The landing page is written for chiropractic practice owners who may be skeptical of another tool. It now includes:

- clearer problem and benefit language
- repeated demo walkthrough calls to action
- who the system is for
- who it is not for
- what it does not do
- a conservative ROI example
- trust language around simplicity, seeing inquiries in one place, follow-up consistency, and faster onboarding

## Scope

This is a landing page for outreach. It is not a SaaS frontend and does not add authentication, app functionality, database changes, scheduling, EHR features, or payment features.
