const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_EXTENSIONS =
  /\.(pdf|png|jpe?g|gif|webp|svg)$/i;

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

function getGithubHeaders(token) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "User-Agent": "nekton-pallanuoto-pages",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function getGithubUrl(repository, filePath) {
  const encodedPath = filePath
    .split("/")
    .map(encodeURIComponent)
    .join("/");

  return (
    `https://api.github.com/repos/${repository}/contents/` +
    encodedPath
  );
}

function sanitizeFileName(fileName) {
  return String(fileName || "")
    .trim()
    .replace(/[^a-zA-Z0-9._-]/g, "_");
}

function isAllowedFile(fileName, mimeType) {
  const extensionIsValid =
    ALLOWED_EXTENSIONS.test(fileName);

  const mimeTypeIsValid =
    mimeType === "application/pdf" ||
    String(mimeType || "").startsWith("image/");

  return extensionIsValid && mimeTypeIsValid;
}

function isAllowedAttachmentPath(filePath) {
  return (
    filePath.startsWith("allegati/") &&
    !filePath.includes("..") &&
    filePath.length > "allegati/".length
  );
}

function getBase64Size(content) {
  const normalized = String(content || "")
    .replace(/\s/g, "");

  if (!normalized) {
    return 0;
  }

  const padding = normalized.endsWith("==")
    ? 2
    : normalized.endsWith("=")
      ? 1
      : 0;

  return Math.floor(
    (normalized.length * 3) / 4
  ) - padding;
}

async function getBody(request) {
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

async function uploadFile(body, env) {
  const {
    fileName,
    mimeType,
    contentBase64,
    pin
  } = body;

  if (pin !== env.ADMIN_PIN) {
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

  const safeName = sanitizeFileName(fileName);

  if (!safeName || !isAllowedFile(safeName, mimeType)) {
    return jsonResponse(
      { error: "Sono consentiti soltanto PDF e immagini" },
      400
    );
  }

  const normalizedContent = String(contentBase64)
    .replace(/\s/g, "");

  const fileSize = getBase64Size(normalizedContent);

  if (fileSize <= 0) {
    return jsonResponse(
      { error: "Il file è vuoto" },
      400
    );
  }

  if (fileSize > MAX_FILE_SIZE) {
    return jsonResponse(
      { error: "Il file supera il limite di 10 MB" },
      413
    );
  }

  const repository = env.GITHUB_REPOSITORY;
  const branch = env.GITHUB_BRANCH || "main";
  const filePath = `allegati/${safeName}`;
  const githubUrl = getGithubUrl(repository, filePath);
  const headers = getGithubHeaders(env.GITHUB_TOKEN);

  const existingResponse = await fetch(githubUrl, {
    method: "GET",
    headers
  });

  let sha = null;

  if (existingResponse.ok) {
    const existingFile = await existingResponse.json();
    sha = existingFile.sha || null;
  } else if (existingResponse.status !== 404) {
    return jsonResponse(
      {
        error: "Impossibile verificare il file su GitHub",
        details: await existingResponse.text()
      },
      existingResponse.status
    );
  }

  const commitBody = {
    message: sha
      ? `Aggiorna allegato ${safeName}`
      : `Aggiungi allegato ${safeName}`,
    content: normalizedContent,
    branch
  };

  if (sha) {
    commitBody.sha = sha;
  }

  const uploadResponse = await fetch(githubUrl, {
    method: "PUT",
    headers: {
      ...headers,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(commitBody)
  });

  if (!uploadResponse.ok) {
    return jsonResponse(
      {
        error: "GitHub ha rifiutato il caricamento",
        details: await uploadResponse.text()
      },
      uploadResponse.status
    );
  }

  return jsonResponse({
    success: true,
    path: filePath,
    url: `/${filePath}`
  });
}

async function deleteFiles(body, env) {
  const {
    files,
    pin
  } = body;

  if (pin !== env.ADMIN_PIN) {
    return jsonResponse(
      { error: "PIN non autorizzato" },
      401
    );
  }

  if (!Array.isArray(files)) {
    return jsonResponse(
      { error: "Elenco dei file non valido" },
      400
    );
  }

  const repository = env.GITHUB_REPOSITORY;
  const branch = env.GITHUB_BRANCH || "main";
  const headers = getGithubHeaders(env.GITHUB_TOKEN);

  const uniqueFiles = [
    ...new Set(
      files
        .map(file => String(file || "").trim())
        .map(file => file.replace(/^\/+/, ""))
        .filter(Boolean)
    )
  ];

  const deleted = [];
  const skipped = [];

  for (const filePath of uniqueFiles) {
    if (!isAllowedAttachmentPath(filePath)) {
      skipped.push({
        file: filePath,
        reason: "Percorso non consentito"
      });

      continue;
    }

    const githubUrl = getGithubUrl(repository, filePath);

    const existingResponse = await fetch(githubUrl, {
      method: "GET",
      headers
    });

    if (existingResponse.status === 404) {
      skipped.push({
        file: filePath,
        reason: "File non trovato"
      });

      continue;
    }

    if (!existingResponse.ok) {
      return jsonResponse(
        {
          error: `Impossibile leggere ${filePath} su GitHub`,
          details: await existingResponse.text()
        },
        existingResponse.status
      );
    }

    const existingFile = await existingResponse.json();

    if (!existingFile.sha) {
      return jsonResponse(
        { error: `SHA mancante per ${filePath}` },
        500
      );
    }

    const deleteResponse = await fetch(githubUrl, {
      method: "DELETE",
      headers: {
        ...headers,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: `Elimina allegato ${filePath}`,
        sha: existingFile.sha,
        branch
      })
    });

    if (!deleteResponse.ok) {
      return jsonResponse(
        {
          error: `Impossibile eliminare ${filePath}`,
          details: await deleteResponse.text()
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
}

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

    const body = await getBody(request);

    if (!body) {
      return jsonResponse(
        { error: "JSON non valido" },
        400
      );
    }

    if (body.action === "delete") {
      return deleteFiles(body, env);
    }

    return uploadFile(body, env);
  } catch (error) {
    return jsonResponse(
      {
        error: "Errore interno",
        details: error.message
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
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    }
  });
}