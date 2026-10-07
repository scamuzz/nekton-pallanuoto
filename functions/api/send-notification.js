const APP_ID = '95c7aa7c-69a1-4b0e-ac93-ea45a595d0c0';
const DEFAULT_URL = 'https://nekton-waterpolo.pages.dev/';

export async function onRequestPost({ request, env }) {
  let data;
  try { data = await request.json(); } catch { return json({ error: 'Richiesta non valida.' }, 400); }

  const password = String(data.password || '');
  if (!env.ADMIN_PASSWORD) return json({ error: 'ADMIN_PASSWORD non configurata su Cloudflare.' }, 500);
  if (password !== env.ADMIN_PASSWORD) return json({ error: 'Password non valida.' }, 401);

  const title = String(data.title || '').trim();
  const body = String(data.body || '').trim();
  const url = String(data.url || DEFAULT_URL).trim() || DEFAULT_URL;
  if (!title || !body) return json({ error: 'Titolo e messaggio sono obbligatori.' }, 400);
  if (title.length > 100 || body.length > 500) return json({ error: 'Titolo o messaggio troppo lungo.' }, 400);
  if (!/^https:\/\//i.test(url)) return json({ error: 'Il link deve usare HTTPS.' }, 400);
  if (!env.ONESIGNAL_REST_API_KEY) return json({ error: 'ONESIGNAL_REST_API_KEY non configurata su Cloudflare.' }, 500);

  const response = await fetch('https://api.onesignal.com/notifications', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Key ${env.ONESIGNAL_REST_API_KEY}` },
    body: JSON.stringify({
      app_id: env.ONESIGNAL_APP_ID || APP_ID,
      included_segments: ['All'],
      headings: { it: title, en: title },
      contents: { it: body, en: body },
      url,
      ttl: 86400
    })
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: result.errors?.join?.(', ') || 'OneSignal ha rifiutato la richiesta.' }, response.status);
  return json({ ok: true, id: result.id, recipients: result.recipients });
}

function json(value, status = 200) {
  return new Response(JSON.stringify(value), { status, headers: { 'Content-Type': 'application/json' } });
}