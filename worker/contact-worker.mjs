const RESEND_API_URL = 'https://api.resend.com/emails';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function jsonResponse(body, status = 200, origin = '*') {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Content-Type': 'application/json; charset=utf-8',
    },
  });
}

function getAllowedOrigins(env) {
  return String(env.ALLOWED_ORIGIN || '*')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function getCorsOrigin(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const requestOrigin = request.headers.get('Origin');

  if (allowedOrigins.includes('*')) return '*';
  if (requestOrigin && allowedOrigins.includes(requestOrigin)) return requestOrigin;

  return allowedOrigins[0] || '*';
}

function isOriginAllowed(request, env) {
  const allowedOrigins = getAllowedOrigins(env);
  const requestOrigin = request.headers.get('Origin');

  return allowedOrigins.includes('*') || !requestOrigin || allowedOrigins.includes(requestOrigin);
}

async function readPayload(request) {
  const contentType = request.headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return request.json();
  }

  const formData = await request.formData();
  return Object.fromEntries(formData.entries());
}

function buildEmailHtml({ name, phone, email, message, pageUrl }) {
  const safeName = escapeHtml(name);
  const safePhone = escapeHtml(phone);
  const safeEmail = escapeHtml(email);
  const safeMessage = escapeHtml(message || 'לא נכתב פירוט נוסף').replaceAll('\n', '<br>');
  const safePageUrl = escapeHtml(pageUrl || 'boau.co.il');

  return `<!doctype html>
<html lang="he" dir="rtl">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>פנייה חדשה מאתר בואו</title>
  </head>
  <body style="margin:0;background:#f3f7f5;font-family:Arial,'Helvetica Neue',sans-serif;color:#182b2b;direction:rtl;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f3f7f5;padding:28px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:620px;background:#ffffff;border:1px solid rgba(24,43,43,0.12);border-radius:16px;overflow:hidden;box-shadow:0 18px 42px rgba(28,55,53,0.08);">
            <tr>
              <td style="background:#14736f;color:#ffffff;padding:28px 32px;text-align:right;">
                <div style="font-size:14px;font-weight:700;opacity:.86;">בּוֹאוּ</div>
                <h1 style="margin:8px 0 0;font-size:28px;line-height:1.25;">פנייה חדשה מהאתר</h1>
                <p style="margin:10px 0 0;font-size:16px;line-height:1.6;">מישהו השאיר פרטים ורוצה לדבר על אתר.</p>
              </td>
            </tr>
            <tr>
              <td style="padding:28px 32px 12px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  ${detailRow('שם', safeName)}
                  ${detailRow('טלפון', safePhone)}
                  ${detailRow('אימייל', safeEmail)}
                  ${detailRow('מקור', safePageUrl)}
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:8px 32px 28px;">
                <div style="background:#fbfaf7;border:1px solid rgba(24,43,43,0.1);border-radius:12px;padding:18px 20px;">
                  <div style="font-size:13px;font-weight:800;color:#14736f;margin-bottom:8px;">מה נכתב בטופס</div>
                  <div style="font-size:17px;line-height:1.8;color:#334946;">${safeMessage}</div>
                </div>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px;">
                <a href="mailto:${safeEmail}?subject=${encodeURIComponent(`Re: פנייה מהאתר - ${name}`)}" style="display:inline-block;background:#e06d52;color:#ffffff;text-decoration:none;border-radius:999px;padding:13px 24px;font-size:16px;font-weight:800;">השב ללקוח</a>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function detailRow(label, value) {
  return `<tr>
    <td style="padding:0 0 14px;width:96px;vertical-align:top;color:#738886;font-size:14px;font-weight:700;">${label}</td>
    <td style="padding:0 0 14px;vertical-align:top;color:#182b2b;font-size:17px;line-height:1.5;font-weight:700;">${value || '-'}</td>
  </tr>`;
}

function buildTextEmail({ name, phone, email, message, pageUrl }) {
  return [
    'פנייה חדשה מאתר בואו',
    '',
    `שם: ${name}`,
    `טלפון: ${phone}`,
    `אימייל: ${email}`,
    `מקור: ${pageUrl || 'boau.co.il'}`,
    '',
    'מה נכתב בטופס:',
    message || 'לא נכתב פירוט נוסף',
  ].join('\n');
}

export default {
  async fetch(request, env) {
    const allowedOrigin = getCorsOrigin(request, env);

    if (request.method === 'OPTIONS') {
      if (!isOriginAllowed(request, env)) {
        return jsonResponse({ error: 'Origin not allowed' }, 403, allowedOrigin);
      }

      return jsonResponse({ ok: true }, 200, allowedOrigin);
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed' }, 405, allowedOrigin);
    }

    if (!isOriginAllowed(request, env)) {
      return jsonResponse({ error: 'Origin not allowed' }, 403, allowedOrigin);
    }

    try {
      const payload = await readPayload(request);
      const name = String(payload.name || '').trim();
      const phone = String(payload.phone || '').trim();
      const email = String(payload.email || '').trim();
      const message = String(payload.message || '').trim();
      const pageUrl = String(payload.pageUrl || payload.source || '').trim();
      const company = String(payload.company || '').trim();

      if (company) {
        return jsonResponse({ ok: true }, 200, allowedOrigin);
      }

      if (!name || !phone || !email || !email.includes('@')) {
        return jsonResponse({ error: 'Missing required fields' }, 400, allowedOrigin);
      }

      const response = await fetch(RESEND_API_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM_EMAIL,
          to: [env.CONTACT_TO_EMAIL],
          reply_to: email,
          subject: `פנייה חדשה מהאתר - ${name}`,
          html: buildEmailHtml({ name, phone, email, message, pageUrl }),
          text: buildTextEmail({ name, phone, email, message, pageUrl }),
        }),
      });

      if (!response.ok) {
        return jsonResponse({ error: 'Email provider failed' }, 502, allowedOrigin);
      }

      return jsonResponse({ ok: true }, 200, allowedOrigin);
    } catch (error) {
      return jsonResponse({ error: 'Server error' }, 500, allowedOrigin);
    }
  },
};
