# AGENTS.md

## Project overview

Static HTML website (Hebrew, RTL) for "בואו" (boau.click), a web design business.
No build step, no framework, no database. Pages are plain HTML with CSS, JS, fonts,
images, and videos in `assets/`.

## Running in the sandbox

`docker compose -f docker-compose.base44.yml up -d` serves the site via nginx:alpine
on host port 3000. The repo root is bind-mounted read-only into the nginx document root.

## Cloudflare Worker (contact form)

`worker/contact-worker.mjs` is a Cloudflare Worker that sends contact form emails via
Resend. It is NOT run in the sandbox — it deploys to Cloudflare's edge. The site falls
back to a Formspree action when the worker endpoint is not configured. No external
credentials are needed to preview the site.

## Verification

- `curl -s http://localhost:3000/ | head` should return the homepage HTML.
- Navigate between pages (index.html, about.html, pricing.html, etc.) to confirm
  all links and assets load.
