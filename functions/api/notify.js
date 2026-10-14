function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate"
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

function sleep(milliseconds) {
  return new Promise(resolve => {
    setTimeout(resolve, milliseconds);
  });
}

function readNumericValue(...values) {
  for (const value of values) {
    const number = Number(value);

    if (Number.isFinite(number) && number >= 0) {
      return number;
    }
  }

  return 0;
}

async function getNotificationStatus(
  notificationId,
  appId,
  apiKey
) {
  const endpoint =
    "https://onesignal.com/api/v1/notifications/" +
    encodeURIComponent(notificationId) +
    "?app_id=" +
    encodeURIComponent(appId);

  const response = await fetch(endpoint, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Key ${apiKey}`
    }
  });

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch {
    data = {
      raw: responseText
    };
  }

  if (!response.ok) {
    throw new Error(
      data.errors?.join?.(", ") ||
      data.error ||
      `Errore OneSignal HTTP ${response.status}`
    );
  }

  return data;
}

async function waitForRecipientCount(
  notificationId,
  appId,
  apiKey,
  initialRecipients = 0
) {
  let recipients = readNumericValue(initialRecipients);
  let successful = 0;
  let failed = 0;
  let statusData = null;

  /*
   * Il conteggio OneSignal viene elaborato in modo asincrono.
   * Eseguiamo più controlli, fino a circa 8 secondi.
   */
  const delays = [1000, 1000, 1500, 1500, 1500, 1500];

  for (const delay of delays) {
    await sleep(delay);

    try {
      statusData = await getNotificationStatus(
        notificationId,
        appId,
        apiKey
      );

      successful = readNumericValue(
        statusData.successful
      );

      failed = readNumericValue(
        statusData.failed
      );

      recipients = Math.max(
        recipients,
        readNumericValue(statusData.recipients),
        successful
      );

      /*
       * Appena OneSignal restituisce almeno un destinatario
       * possiamo terminare l'attesa.
       */
      if (recipients > 0 || successful > 0) {
        break;
      }
    } catch (error) {
      /*
       * Un errore durante il controllo dello stato non deve
       * annullare un invio già accettato da OneSignal.
       */
      console.error(
        "Errore verifica stato OneSignal:",
        error
      );
    }
  }

  return {
    recipients,
    successful,
    failed,
    statusData
  };
}

export async function onRequestPost({ request, env }) {
  try {
    if (
      !env.ADMIN_PIN ||
      !env.ONESIGNAL_APP_ID ||
      !env.ONESIGNAL_API_KEY
    ) {
      return jsonResponse(
        {
          error: "Configurazione OneSignal incompleta",
          missing: {
            ADMIN_PIN: !env.ADMIN_PIN,
            ONESIGNAL_APP_ID: !env.ONESIGNAL_APP_ID,
            ONESIGNAL_API_KEY: !env.ONESIGNAL_API_KEY
          }
        },
        500
      );
    }

    const body = await parseJsonRequest(request);

    if (!body) {
      return jsonResponse(
        {
          error: "JSON non valido"
        },
        400
      );
    }

    const {
      titolo,
      messaggio,
      url,
      pin
    } = body;

    if (pin !== env.ADMIN_PIN) {
      return jsonResponse(
        {
          error: "PIN non autorizzato"
        },
        401
      );
    }

    const title =
      String(titolo || "").trim();

    const message =
      String(messaggio || "").trim();

    if (!title || !message) {
      return jsonResponse(
        {
          error:
            "Titolo e messaggio sono obbligatori"
        },
        400
      );
    }

    if (
      title.length > 100 ||
      message.length > 500
    ) {
      return jsonResponse(
        {
          error:
            "Titolo o messaggio troppo lunghi"
        },
        400
      );
    }

    const targetUrl =
      String(url || "").trim() ||
      "https://nekton-waterpolo.pages.dev/news.html";

    let parsedTargetUrl;

    try {
      parsedTargetUrl = new URL(targetUrl);
    } catch {
      return jsonResponse(
        {
          error:
            "URL di destinazione non valido"
        },
        400
      );
    }

    if (
      parsedTargetUrl.protocol !== "https:" ||
      parsedTargetUrl.hostname !==
        "nekton-waterpolo.pages.dev"
    ) {
      return jsonResponse(
        {
          error:
            "URL di destinazione non consentito"
        },
        400
      );
    }

    const payload = {
      app_id: env.ONESIGNAL_APP_ID,
      included_segments: [
        "Total Subscriptions"
      ],
      headings: {
        it: title,
        en: title
      },
      contents: {
        it: message,
        en: message
      },
      url: parsedTargetUrl.href,
      ttl: 86400
    };

    const response = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type":
            "application/json; charset=utf-8",
          Accept: "application/json",
          Authorization:
            `Key ${env.ONESIGNAL_API_KEY}`
        },
        body: JSON.stringify(payload)
      }
    );

    const responseText =
      await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch {
      data = {
        raw: responseText
      };
    }

    if (!response.ok) {
      return jsonResponse(
        {
          error:
            "OneSignal ha rifiutato la notifica",
          details: data
        },
        response.status
      );
    }

    if (data.errors) {
      return jsonResponse(
        {
          error:
            "OneSignal ha restituito un errore",
          details: data.errors
        },
        400
      );
    }

    const notificationId =
      data.id || null;

    if (!notificationId) {
      return jsonResponse(
        {
          error:
            "OneSignal non ha restituito l'ID della notifica",
          details: data
        },
        502
      );
    }

    const initialRecipients =
      readNumericValue(
        data.recipients,
        data.successful
      );

    const status = await waitForRecipientCount(
      notificationId,
      env.ONESIGNAL_APP_ID,
      env.ONESIGNAL_API_KEY,
      initialRecipients
    );

    /*
     * Per il messaggio mostrato dalla pagina usiamo il valore
     * più alto tra recipients e successful.
     */
    const confirmedRecipients = Math.max(
      initialRecipients,
      status.recipients,
      status.successful
    );

    return jsonResponse({
      success: true,
      id: notificationId,
      recipients: confirmedRecipients,
      successful: status.successful,
      failed: status.failed,
      countConfirmed:
        confirmedRecipients > 0
    });
  } catch (error) {
    console.error(
      "Errore interno notify.js:",
      error
    );

    return jsonResponse(
      {
        error: "Errore interno",
        details:
          error instanceof Error
            ? error.message
            : String(error)
      },
      500
    );
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods":
        "POST, OPTIONS",
      "Access-Control-Allow-Headers":
        "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}
