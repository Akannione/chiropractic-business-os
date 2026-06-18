# Intake Embed And Source Links

Use these snippets to route patient inquiries directly into CBOS.

Replace `https://your-business-os-domain.com` with the deployed frontend URL.

## Website Button

```html
<a href="https://your-business-os-domain.com/intake?source=Website">
  Request a Chiropractic Follow-Up
</a>
```

## Website Iframe Embed

```html
<iframe
  src="https://your-business-os-domain.com/intake?source=Website"
  title="Request a Chiropractic Follow-Up"
  style="width: 100%; min-height: 760px; border: 0;"
></iframe>
```

## Recommended Homepage CTA Copy

```text
Request a Chiropractic Follow-Up
```

Use this button copy near the top of the practice website and again near the contact section. It is clear without promising appointment scheduling or clinical advice.

## Google Business Profile Link

Use this as the website/contact link in Google Business Profile:

```text
https://your-business-os-domain.com/intake?source=Google
```

## Referral Partner Link

Give this to referral partners:

```text
https://your-business-os-domain.com/intake?source=Referral
```

## Insurance Inquiry Link

```text
https://your-business-os-domain.com/intake?source=Insurance
```

## Phone Call Backup Link

Staff can use this when entering phone calls manually through the public intake flow:

```text
https://your-business-os-domain.com/intake?source=Phone%20Call
```

## Staff Workflow After Submission

1. A submitted inquiry appears in the dashboard as `Follow-Up Needed`.
2. Staff handles it from `Today's Follow-Up Workflow`.
3. Staff can mark it `Consultation Scheduled`, `Active Patient`, `Lost`, or push the follow-up to tomorrow.
