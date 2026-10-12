const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS = /\.(pdf|png|jpe?g|gif|webp|svg)$/i;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedFile(fileName, mimeType) {
  const validExtension = ALLOWED_EXTENSIONS.test(fileName);

  const validMimeType =
    mimeType === "application/pdf" ||
    String(mimeType || "").startsWith("image/");

  return validExtension && validMimeType;
}

function isAllowedAttachmentPath(filePath) {
  return (
    filePath.startsWith("allegati/") &&
    !filePath.includes("..") &&
    filePath.length > "allegati/".length
  );
}

function getApproximateBase64Size(base64Content) {
  const normalized = String(base64Content || "").replace(/\s/g, "");

  if (!normalized) {
    return 0;
  }

  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  return Math.floor((normalized.length * 3) / 4) - padding;
}

function getGithubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "nekton-pallanuoto-pages",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function getGithubFileUrl(repository, filePath) {
  const encodedPath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return `https://api.github.com/repos/${repository}/contents/${encodedPath}`;
}

async function parseJsonRequest(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function validateEnvironment(env) {
  if (!env.ADMIN_PIN) {
    return "ADMIN_PIN non configurato";
  }

  if (!env.GITHUB_TOKEN) {
    return "GITHUB_TOKEN non configurato";
  }

  if (!env.GITHUB_REPOSITORY) {
    return "GITHUB_REPOSITORY non configurato";
  }

  return null;
}

/**
 * POST /api/upload
 *
 * Carica o aggiorna un PDF o un'immagine nella cartella allegati/.
 */
export async function onRequestPost({ request, env }) {
  try {
    const environmentError = validateEnvironment(env);

    if (environmentError) {
      return jsonResponse(
        {
          error: "Configurazione Cloudflare incompleta",
          details: environmentError
        },
        500
      );
    }

    const body = await parseJsonRequest(request);

    if (!body) {
      return jsonResponse(
        {
          error: "Il corpo della richiesta non è un JSON valido"
        },
        400
      );
    }

    const {
      fileName,
      mimeType,
      contentBase64,
      pin
    } = body;

    if (!pin || pin !== env.ADMIN_PIN) {
      return jsonResponse(
        {
          error: "PIN non autorizzato"
        },
        401
      );
    }

    if (!fileName || !contentBase64) {
      return jsonResponse(
        {
          error: "Nome file o contenuto mancante"
        },
        400
      );
    }

    const safeFileName = sanitizeFileName(fileName);

    if (!safeFileName) {
      return jsonResponse(
        {
          error: "Nome file non valido"
        },
        400
      );
    }

    if (!isAllowedFile(safeFileName, mimeType)) {
      return jsonResponse(
        {
          error: "Sono consentiti soltanto PDF e immagini"
        },
        400
      );
    }

    const normalizedContent = String(contentBase64).replace(/\s/g, "");
    const fileSize = getApproximateBase64Size(normalizedContent);

    if (fileSize <= 0) {
      return jsonResponse(
        {
          error: "Il contenuto del file è vuoto"
        },
        400
      );
    }

    if (fileSize > MAX_FILE_SIZE) {
      return jsonResponse(
        {
          error: "Il file supera il limite massimo di 10 MB"
        },
        413
      );
    }

    const repository = env.GITHUB_REPOSITORY;
    const branch = env.GITHUB_BRANCH || "main";
    const filePath = `allegati/${safeFileName}`;

    const githubUrl = getGithubFileUrl(repository, filePath);
    const githubHeaders = getGithubHeaders(env.GITHUB_TOKEN);

    /*
     * GitHub richiede lo SHA quando si sovrascrive un file esistente.
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
      const details = await existingResponse.text();

      return jsonResponse(
        {
          error: "Impossibile verificare il file su GitHub",
          details
        },
        existingResponse.status
      );
    }

    const commitData = {
      message: existingSha
        ? `Aggiorna allegato ${safeFileName}`
        : `Aggiungi allegato ${safeFileName}`,
      content: normalizedContent,
      branch
    };

    if (existingSha) {
      commitData.sha = existingSha;
    }

    const uploadResponse = await fetch(githubUrl, {
      method: "PUT",
      headers: {
        ...githubHeaders,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(commitData)
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

/**
 * DELETE /api/upload
 *
 * Elimina uno o più file dalla cartella allegati/.
 */
export async function onRequestDelete({ request, env }) {
  try {
    const environmentError = validateEnvironment(env);

    if (environmentError) {
      return jsonResponse(
        {
          error: "Configurazione Cloudflare incompleta",
          details: environmentError
        },
        500
      );
    }

    const body = await parseJsonRequest(request);

    if (!body) {
      return jsonResponse(
        {
          error: "Il corpo della richiesta non è un JSON valido"
        },
        400
      );
    }

    const { files, pin } = body;

    if (!pin || pin !== env.ADMIN_PIN) {
      return jsonResponse(
        {
          error: "PIN non autorizzato"
        },
        401
      );
    }

    if (!Array.isArray(files)) {
      return jsonResponse(
        {
          error: "L'elenco dei file non è valido"
        },
        400
      );
    }

    const repository = env.GITHUB_REPOSITORY;
    const branch = env.GITHUB_BRANCH || "main";
    const githubHeaders = getGithubHeaders(env.GITHUB_TOKEN);

    const deleted = [];
    const skipped = [];

    const uniqueFiles = [
      ...new Set(
        files
          .map(file => String(file || "").trim())
          .filter(Boolean)
      )
    ];

    for (const filePath of uniqueFiles) {
      /*
       * Impedisce alla funzione di eliminare file
       * che non appartengono alla cartella allegati/.
       */
      if (!isAllowedAttachmentPath(filePath)) {
        skipped.push({
          file: filePath,
          reason: "Percorso non consentito"
        });

        continue;
      }

      const githubUrl = getGithubFileUrl(repository, filePath);

      const existingResponse = await fetch(githubUrl, {
        method: "GET",
        headers: githubHeaders
      });

      if (existingResponse.status === 404) {
        skipped.push({
          file: filePath,
          reason: "File non trovato"
        });

        continue;
      }

      if (!existingResponse.ok) {
        const details = await existingResponse.text();

        return jsonResponse(
          {
            error: `Impossibile verificare ${filePath} su GitHub`,
            details
          },
          existingResponse.status
        );
      }

      const existingFile = await existingResponse.json();

      if (!existingFile.sha) {
        return jsonResponse(
          {
            error: `SHA mancante per ${filePath}`
          },
          500
        );
      }

      const deleteResponse = await fetch(githubUrl, {
        method: "DELETE",
        headers: {
          ...githubHeaders,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          message: `Elimina allegato ${filePath}`,
          sha: existingFile.sha,
          branch
        })
      });

      const deleteText = await deleteResponse.text();

      if (!deleteResponse.ok) {
        return jsonResponse(
          {
            error: `Impossibile eliminare ${filePath} da GitHub`,
            details: deleteText
          },
          deleteResponse.status
        );
      }

      deleted.push(filePath);
    }

    return jsonResponse({
      success: true,
      deleted,
      skipped
    });
  } catch (error) {
    return jsonResponse(
      {
        error: "Errore interno durante la cancellazione",
        details: error.message
      },
      500
    );
  }
}

/**
 * Risposta preflight.
 */
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cache-Control": "no-store"
    }
  });
}
