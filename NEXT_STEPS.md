# Next Steps

## Immediate Next Actions

1. Rotate the exposed Atlas database-user password.
2. Add the Atlas Network Access entry required by Vercel.
3. Add the replacement URI to `cbos-api` as sensitive `MONGODB_URI`.
4. Redeploy the API and confirm database-backed endpoints work.
5. Run a production intake-to-dashboard smoke test.

## Priority Order

1. Atlas credential rotation.
2. Atlas network access and Vercel `MONGODB_URI`.
3. Production workflow smoke test.
4. Portfolio proof update.

## Validation Steps

```bash
cd "/Users/tobiloba202/Documents/New project/business_os_mvp"
npm run typecheck
npm run build
npm run test
rg -n "CBOS|cbos" -g '!node_modules' -g '!dist' -g '!.git' .
curl -s http://localhost:4000/api/health
LIVE_JS_PATH=$(curl -sL https://frontend-gold-alpha-31.vercel.app | rg -o '/assets/[^" ]+\.js' | head -1)
curl -sL "https://frontend-gold-alpha-31.vercel.app${LIVE_JS_PATH}" | rg -n "https://cbos-api.vercel.app/api"
curl -i https://cbos-api.vercel.app/api/health
curl -i https://cbos-api.vercel.app/api/config
```

## Expected Outcomes

* Local validation remains green.
* Local production bundle does not point at localhost.
* Live Vercel frontend does not point at localhost.
* Vercel `VITE_API_BASE_URL` points to `https://cbos-api.vercel.app/api`.
* Vercel Function health returns `{"ok":true,"service":"CBOS API"}`.
* Vercel frontend can create and display a test public intake inquiry.
