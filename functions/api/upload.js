const MAX_FILE_SIZE = 10 * 1024 * 1024;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8"
    }
  });
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedFile(fileName, mimeType) {
  const extensionAllowed = /\.(pdf|png|jpe?g|gif|webp|svg)$/i.test(fileName);
  const mimeTypeAllowed =
    mimeType === "application/pdf" ||
    String(mimeType || "").startsWith("image/");

  return extensionAllowed && mimeTypeAllowed;
}

export async function onRequestPost({ request, env }) {
  try {
    if (request.method !== "POST") {
      return jsonResponse(
        { error: "Metodo non consentito" },
        405
      );
    }

    const body = await request.json();

    const {
      fileName,
      mimeType,
      contentBase64,
      pin
    } = body || {};

    if (!pin || pin !== env.ADMIN_PIN) {
      return jsonResponse(
        { error: "PIN non autorizzato" },
        401
      );
    }

    if (!fileName || !contentBase64) {
      return jsonResponse(
        { error: "Nome file o contenuto mancante" },
        400
      );
    }

    const safeFileName = sanitizeFileName(fileName);

    if (!safeFileName) {
      return jsonResponse(
        { error: "Nome file non valido" },
        400
      );
    }

    if (!isAllowedFile(safeFileName, mimeType)) {
      return jsonResponse(
        { error: "Sono consentiti solo PDF e immagini" },
        400
      );
    }

    const approximateFileSize =
      Math.floor((contentBase64.length * 3) / 4);

    if (approximateFileSize > MAX_FILE_SIZE) {
      return jsonResponse(
        { error: "Il file supera il limite di 10 MB" },
        413
      );
    }

    const repository = env.GITHUB_REPOSITORY;
    const branch = env.GITHUB_BRANCH || "main";
    const githubToken = env.GITHUB_TOKEN;

    if (!repository || !githubToken) {
      return jsonResponse(
        { error: "Configurazione GitHub mancante" },
        500
      );
    }

    const filePath = `allegati/${safeFileName}`;
    const encodedPath = filePath
      .split("/")
      .map(encodeURIComponent)
      .join("/");

    const githubUrl =
      `https://api.github.com/repos/${repository}/contents/${encodedPath}`;

    const githubHeaders = {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${githubToken}`,
      "User-Agent": "nekton-pallanuoto-pages",
      "X-GitHub-Api-Version": "2022-11-28"
    };

    /*
     * Se il file esiste già, GitHub richiede il relativo SHA
     * per poterlo aggiornare.
     */
    const existingResponse = await fetch(githubUrl, {
      method: "GET",
      headers: githubHeaders
    });

    let existingSha = null;

    if (existingResponse.ok) {
      const existingFile = await existingResponse.json();
      existingSha = existingFile.sha || null;
    } else if (existingResponse.status !== 404) {
      const errorText = await existingResponse.text();

      return jsonResponse(
        {
          error: "Errore nella verifica del file su GitHub",
          details: errorText
        },
        existingResponse.status
      );
    }

    const commitBody = {
      message: `Aggiungi allegato ${safeFileName}`,
      content: contentBase64,
      branch
    };

    if (existingSha) {
      commitBody.sha = existingSha;
      commitBody.message = `Aggiorna allegato ${safeFileName}`;
    }

    const uploadResponse = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        ...githubHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commitBody)
    });

    const uploadText = await uploadResponse.text();

    if (!uploadResponse.ok) {
      return jsonResponse(
        {
          error: "GitHub ha rifiutato il caricamento",
          details: uploadText
        },
        uploadResponse.status
      );
    }

    return jsonResponse({
      success: true,
      path: filePath,
      url: `/${filePath}`
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Errore interno durante il caricamento",
        details: error.message
      },
      500
    );
  }
}
