# Contact Form Worker

Small Cloudflare Worker for receiving the site contact form and sending a designed HTML email through Resend.

## Setup

1. Create a Resend account and verify a sending domain.
2. Copy `wrangler.toml.example` to `wrangler.toml`.
3. Update:
   - `CONTACT_TO_EMAIL`
   - `CONTACT_FROM_EMAIL`
   - `ALLOWED_ORIGIN` (for example `https://boau.click`; use commas for more than one domain)
4. Add the Resend API key as a secret:

```sh
wrangler secret put RESEND_API_KEY
```

5. Deploy:

```sh
wrangler deploy
```

6. Copy the deployed Worker URL and set it on the homepage form:

```html
data-contact-endpoint="https://boau-contact.your-subdomain.workers.dev"
```

Until `data-contact-endpoint` is filled in, the homepage keeps using the existing Formspree action as a safe fallback.
