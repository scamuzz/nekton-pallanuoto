function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

async function parseJsonRequest(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.ADMIN_PIN || !env.ONESIGNAL_APP_ID || !env.ONESIGNAL_API_KEY) {
      return jsonResponse(
        { error: "Configurazione OneSignal incompleta" },
        500
      );
    }

    const body = await parseJsonRequest(request);

    if (!body) {
      return jsonResponse({ error: "JSON non valido" }, 400);
    }

    const { titolo, messaggio, url, pin } = body;

    if (pin !== env.ADMIN_PIN) {
      return jsonResponse({ error: "PIN non autorizzato" }, 401);
    }

    const title = String(titolo || "").trim();
    const message = String(messaggio || "").trim();

    if (!title || !message) {
      return jsonResponse(
        { error: "Titolo e messaggio sono obbligatori" },
        400
      );
    }

    if (title.length > 100 || message.length > 500) {
      return jsonResponse(
        { error: "Titolo o messaggio troppo lunghi" },
        400
      );
    }

    const targetUrl =
      String(url || "").trim() ||
      "https://nekton-waterpolo.pages.dev/news.html";

    if (!targetUrl.startsWith("https://nekton-waterpolo.pages.dev/")) {
      return jsonResponse(
        { error: "URL di destinazione non consentito" },
        400
      );
    }

    const payload = {
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: ["Total Subscriptions"],
      headings: { it: title, en: title },
      contents: { it: message, en: message },
      url: targetUrl,
      ttl: 86400
    };

    const response = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Key ${env.ONESIGNAL_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = { raw: responseText };
    }

    if (!response.ok) {
      return jsonResponse(
        {
          error: "OneSignal ha rifiutato la notifica",
          details: data
        },
        response.status
      );
    }

    if (data.errors) {
      return jsonResponse(
        {
          error: "OneSignal ha restituito un errore",
          details: data.errors
        },
        400
      );
    }

    return jsonResponse({
      success: true,
      id: data.id || null,
      recipients: data.recipients || 0
    });
  } catch (error) {
    return jsonResponse(
      { error: "Errore interno", details: error.message },
      500
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}