# Production Deployment Checklist

This guide keeps the Chiropractic Business OS deployment simple: MongoDB Atlas for data, Render for the backend API, and Vercel for the React frontend.

## 1. MongoDB Atlas

1. Create a MongoDB Atlas project and cluster.
2. Create a database user with a strong password.
3. Allow access from Render or use Atlas recommended network settings for hosted apps.
4. Copy the connection string into `MONGODB_URI`.

## 2. Render Backend

Create a Render Web Service from the GitHub repository.
The repository includes a `render.yaml` Blueprint for the backend API.

Recommended path:

1. Open Render.
2. Choose **New Blueprint**.
3. Connect `https://github.com/Akannione/chiropractic-business-os`.
4. Select the `main` branch.
5. Render will read `render.yaml`.
6. Fill the secret environment variables marked `sync: false`.

Recommended settings:

- Root directory: `backend`
- Build command: `npm install && npm run build`
- Start command: `npm start`

Environment variables:

```bash
PORT=4000
MONGODB_URI=mongodb+srv://...
CORS_ORIGIN=https://your-frontend-domain.vercel.app
PRACTICE_NAME=Client Chiropractic Practice
ADMIN_PASSWORD=strong-staff-password
AUTH_TOKEN_SECRET=long-random-secret
BUSINESS_OS_DEMO_MODE=false
INTERNAL_NOTIFICATION_EMAIL=staff@example.com
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=Chiropractic Business OS <no-reply@example.com>
```

## 3. Vercel Frontend

Create a Vercel project from the GitHub repository.
The frontend includes `frontend/vercel.json` for Vite build settings and SPA fallback routing.

Current production frontend:

```text
https://frontend-gold-alpha-31.vercel.app
```

Recommended settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`

Environment variable:

```bash
VITE_API_BASE_URL=https://your-render-backend.onrender.com/api
```

After the Render backend is deployed, set `VITE_API_BASE_URL` in Vercel to the Render backend URL plus `/api`, then redeploy the frontend.

## 4. Staff Login

Set `ADMIN_PASSWORD` in production. When it is set, staff dashboard APIs require login. The public `/intake` form remains open for patient inquiries.

Do not reuse the demo password across clients.

## 5. Backups

Use MongoDB Atlas backups or scheduled exports. At minimum, export patient inquiries weekly from the app and keep a copy in the practice's approved storage location.

## 6. Privacy Boundary

This system is for inquiry and follow-up tracking. It is not an EHR, billing system, insurance system, or scheduling platform. Avoid storing clinical notes, diagnosis details, insurance IDs, payment details, or sensitive treatment records.

## 7. Go-Live Verification

1. Open the frontend.
2. Confirm staff login works.
3. Submit a test `/intake?source=Website` inquiry.
4. Confirm it appears in the dashboard.
5. Update status from the dashboard workflow.
6. Export CSV.
7. Send the daily summary if SMTP is configured.
8. Delete the test record before handoff.
