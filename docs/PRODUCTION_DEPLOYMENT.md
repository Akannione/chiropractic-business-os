# Demo Deployment Checklist

This guide keeps the CBOS demo deployment costless: MongoDB Atlas M0 for data and two Vercel projects from the same GitHub repository.

## 1. MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Add your current IP address for local testing.
4. Add the network access required by Vercel. For a short-lived demo, `0.0.0.0/0` is the simplest option, but it must be paired with a strong unique password.
5. Copy the connection string and set the database name to `chiropractic_business_os`.
6. Store the connection string only as the API project's `MONGODB_URI` environment variable.

If a credential is exposed, rotate the Atlas database-user password before continuing.

## 2. Vercel Express API

Create a Vercel project with these settings:

- Project name: `cbos-api`
- Repository: `https://github.com/Akannione/chiropractic-business-os`
- Root directory: `backend`
- Framework: Express

Required environment variables:

```bash
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://frontend-gold-alpha-31.vercel.app
PRACTICE_NAME=CBOS Demo Practice
AUTH_TOKEN_SECRET=long-random-secret
BUSINESS_OS_DEMO_MODE=true
```

Optional variables:

```bash
ADMIN_PASSWORD=
INTERNAL_NOTIFICATION_EMAIL=staff@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=CBOS <no-reply@example.com>
```

Current API:

```text
https://cbos-api.vercel.app
```

Health check:

```bash
curl https://cbos-api.vercel.app/api/health
```

## 3. Vercel React Frontend

Use these settings:

- Project name: `frontend`
- Repository: `https://github.com/Akannione/chiropractic-business-os`
- Root directory: `frontend`
- Framework: Vite

Production environment variable:

```bash
VITE_API_BASE_URL=https://cbos-api.vercel.app/api
```

Current frontend:

```text
https://frontend-gold-alpha-31.vercel.app
```

## 4. Staff Login

Leave `ADMIN_PASSWORD` blank for a controlled demo, or set it before sharing staff access publicly. When it is set, staff dashboard APIs require login. The public `/intake` form remains open.

Do not reuse the demo password across clients.

## 5. Backups

Use MongoDB Atlas backups or scheduled exports. At minimum, export patient inquiries weekly from the app and keep a copy in the practice's approved storage location.

## 6. Privacy Boundary

This system is for inquiry and follow-up tracking. It is not an EHR, billing system, insurance system, or scheduling platform. Avoid storing clinical notes, diagnosis details, insurance IDs, payment details, or sensitive treatment records.

## 7. Demo Verification

1. Open the frontend.
2. Confirm the API health endpoint returns 200.
3. Submit a test `/intake?source=Website` inquiry.
4. Confirm it appears in the dashboard.
5. Update status from the dashboard workflow.
6. Export CSV.
7. Send the daily summary if SMTP is configured.
8. Delete the test record before handoff.

## 8. Paying-Client Boundary

Vercel Hobby and Atlas M0 are appropriate for demonstrations and early validation. Before deploying for a paying practice:

1. Move to commercial hosting appropriate for business use.
2. Create client-specific database and authentication credentials.
3. Review backup, privacy, monitoring, and support requirements.
4. Treat infrastructure cost as part of the client delivery package.
