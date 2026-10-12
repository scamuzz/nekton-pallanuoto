<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8">

  <link rel="icon" href="nekton-img.jpg" type="image/jpeg">

  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  >

  <title>📰 News · Nekton</title>

  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    html,
    body {
      width: 100%;
      overflow-x: hidden;
    }

    body {
      min-height: 100vh;
      font-family: "Segoe UI", sans-serif;
      background: #e8f4fd;
    }

    button,
    input,
    textarea {
      font-family: inherit;
    }

    .header {
      position: relative;
      overflow: hidden;
      padding: 36px 20px 24px;
      color: white;
      text-align: center;
      background:
        linear-gradient(
          160deg,
          #012afe 0%,
          #0055cc 40%,
          #00b4d8 100%
        );
    }

    .header::before {
      position: absolute;
      inset: 0;
      content: "";
      background:
        radial-gradient(
          ellipse 60% 40% at 20% 30%,
          rgba(255, 255, 255, 0.10),
          transparent
        );
    }

    .back-link {
      position: absolute;
      top: 14px;
      left: 14px;
      z-index: 2;
      padding: 7px 15px;
      color: white;
      font-size: 0.76rem;
      font-weight: 700;
      text-decoration: none;
      background: rgba(255, 255, 255, 0.25);
      border-radius: 20px;
    }

    .pin-btn {
      position: absolute;
      top: 14px;
      right: 14px;
      z-index: 2;
      width: 40px;
      height: 40px;
      color: white;
      font-size: 1.3rem;
      cursor: pointer;
      background: rgba(255, 255, 255, 0.25);
      border: 0;
      border-radius: 50%;
    }

    .header .icons {
      position: relative;
      display: block;
      margin-bottom: 10px;
      font-size: 3rem;
    }

    .header .icons img {
      display: inline-block;
      width: auto;
      height: 2em;
      vertical-align: -0.15em;
    }

    .header h1 {
      position: relative;
      font-size: 1.6rem;
      font-weight: 800;
    }

    .header .subtitle {
      position: relative;
      margin-top: 6px;
      font-size: 0.82rem;
      opacity: 0.9;
    }

    .sync-status {
      position: relative;
      display: flex;
      gap: 6px;
      align-items: center;
      justify-content: center;
      margin-top: 10px;
      font-size: 0.7rem;
    }

    .sync-dot {
      width: 8px;
      height: 8px;
      background: white;
      border-radius: 50%;
      animation: blink 1.5s infinite;
    }

    .sync-dot.connected {
      background: #69f0ae;
      animation: none;
    }

    .sync-dot.error {
      background: #ff5252;
      animation: none;
    }

    @keyframes blink {
      0%,
      100% {
        opacity: 1;
      }

      50% {
        opacity: 0.25;
      }
    }

    .wave-divider {
      line-height: 0;
      overflow: hidden;
      background:
        linear-gradient(
          160deg,
          #012afe 0%,
          #0055cc 40%,
          #00b4d8 100%
        );
    }

    .wave-divider svg {
      display: block;
      width: 100%;
    }

    .container {
      max-width: 540px;
      margin: 0 auto;
      padding: 16px 12px 64px;
    }

    .manager-panel {
      display: none;
      padding: 18px;
      margin-bottom: 18px;
      background: #fff8e1;
      border: 2px solid #ffe082;
      border-radius: 18px;
    }

    .manager-panel.visible {
      display: block;
    }

    .manager-panel h3 {
      margin-bottom: 12px;
      color: #f57f17;
      font-size: 0.76rem;
      text-transform: uppercase;
    }

    .form-group {
      margin-bottom: 12px;
    }

    .form-group label {
      display: block;
      margin-bottom: 4px;
      color: #555;
      font-size: 0.75rem;
      font-weight: 700;
    }

    .form-input {
      width: 100%;
      padding: 9px 12px;
      color: #333;
      font-size: 0.88rem;
      background: white;
      border: 1.5px solid #ffe082;
      border-radius: 10px;
      outline: none;
    }

    .form-input:focus {
      border-color: #ffb300;
    }

    textarea.form-input {
      min-height: 90px;
      resize: vertical;
    }

    .form-hint {
      margin-top: 6px;
      color: #777;
      font-size: 0.7rem;
      line-height: 1.4;
    }

    .selected-files {
      display: grid;
      gap: 5px;
      margin-top: 8px;
    }

    .selected-file {
      padding: 7px 9px;
      color: #546e7a;
      font-size: 0.72rem;
      background: white;
      border: 1px solid #ffe082;
      border-radius: 8px;
      word-break: break-word;
    }

    .existing-attachments {
      display: none;
      padding: 10px;
      margin-bottom: 12px;
      color: #546e7a;
      font-size: 0.75rem;
      line-height: 1.5;
      background: white;
      border: 1px solid #ffe082;
      border-radius: 10px;
    }

    .existing-attachments.visible {
      display: block;
    }

    .existing-attachments ul {
      padding-left: 20px;
      margin: 5px 0;
    }

    .pub-btn,
    .cancel-edit-btn {
      width: 100%;
      padding: 11px;
      border: 0;
      border-radius: 10px;
      font-weight: 700;
      cursor: pointer;
    }

    .pub-btn {
      color: white;
      background: linear-gradient(135deg, #006994, #00b4d8);
    }

    .pub-btn:disabled {
      cursor: wait;
      opacity: 0.6;
    }

    .cancel-edit-btn {
      display: none;
      margin-top: 8px;
      color: #607d8b;
      background: #eceff1;
    }

    .cancel-edit-btn.visible {
      display: block;
    }

    .section-title {
      margin: 20px 0 14px 2px;
      color: #006994;
      font-size: 0.78rem;
      font-weight: 800;
      text-transform: uppercase;
    }

    .news-card {
      position: relative;
      padding: 18px;
      margin-bottom: 14px;
      background: white;
      border: 2px solid #ddeeff;
      border-left: 5px solid #006994;
      border-radius: 18px;
      box-shadow: 0 4px 18px rgba(0, 105, 148, 0.08);
    }

    .news-meta {
      margin-bottom: 6px;
      color: #006994;
      font-size: 0.68rem;
      font-weight: 700;
    }

    .news-title {
      padding-right: 60px;
      margin-bottom: 8px;
      color: #1a3a5c;
      font-size: 1rem;
      font-weight: 800;
    }

    .news-text {
      color: #455a64;
      font-size: 0.85rem;
      line-height: 1.65;
      white-space: pre-line;
    }

    .news-actions {
      position: absolute;
      top: 14px;
      right: 14px;
      display: flex;
      gap: 8px;
    }

    .news-actions button {
      color: #b3d9f7;
      font-size: 1rem;
      cursor: pointer;
      background: none;
      border: 0;
    }

    .news-edit-btn:hover {
      color: #006994;
    }

    .news-del-btn:hover {
      color: #e53935;
    }

    .news-attachments {
      display: grid;
      gap: 10px;
      margin-top: 12px;
    }

    .attachment-link {
      display: inline-flex;
      gap: 8px;
      align-items: center;
      width: fit-content;
      max-width: 100%;
      padding: 9px 12px;
      color: #006994;
      font-size: 0.82rem;
      font-weight: 700;
      text-decoration: none;
      word-break: break-word;
      background: #f3f9ff;
      border: 1px solid #d9ecff;
      border-radius: 10px;
    }

    .attachment-preview {
      width: 100%;
      overflow: hidden;
      background: #f8fcff;
      border: 1px solid #d9ecff;
      border-radius: 10px;
    }

    .attachment-preview img {
      display: block;
      width: 100%;
      max-height: 360px;
      object-fit: contain;
    }

    .no-news {
      padding: 30px 10px;
      color: #90a4ae;
      font-size: 0.88rem;
      font-style: italic;
      text-align: center;
      background: white;
      border: 2px dashed #ddeeff;
      border-radius: 16px;
    }

    .modal-overlay {
      position: fixed;
      inset: 0;
      z-index: 100;
      display: none;
      align-items: center;
      justify-content: center;
      background: rgba(0, 0, 0, 0.5);
    }

    .modal-overlay.open {
      display: flex;
    }

    .modal {
      width: 90%;
      max-width: 300px;
      padding: 28px 24px;
      text-align: center;
      background: white;
      border-radius: 20px;
    }

    .modal h3 {
      margin-bottom: 8px;
      color: #006994;
      font-size: 1rem;
    }

    .modal p {
      margin-bottom: 16px;
      color: #607d8b;
      font-size: 0.78rem;
    }

    .pin-input-wrap {
      position: relative;
    }

    .modal input {
      width: 100%;
      padding: 11px 40px 11px 14px;
      font-size: 1rem;
      text-align: center;
      border: 2px solid #b3d9f7;
      border-radius: 10px;
    }

    .pin-toggle {
      position: absolute;
      top: 50%;
      right: 10px;
      border: 0;
      background: none;
      cursor: pointer;
      transform: translateY(-50%);
    }

    .modal-error {
      min-height: 18px;
      margin-top: 8px;
      color: #e53935;
      font-size: 0.75rem;
    }

    .modal-btns {
      display: flex;
      gap: 10px;
      margin-top: 14px;
    }

    .modal-btn {
      flex: 1;
      padding: 11px;
      border: 0;
      border-radius: 10px;
      cursor: pointer;
      font-weight: 700;
    }

    .modal-btn.primary {
      color: white;
      background: #006994;
    }

    .modal-btn.secondary {
      color: #607d8b;
      background: #eceff1;
    }

    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      z-index: 999;
      max-width: calc(100% - 30px);
      padding: 10px 22px;
      color: white;
      text-align: center;
      background: #006994;
      border-radius: 24px;
      transform: translate(-50%, 120px);
      transition: transform 0.3s ease;
    }

    .toast.show {
      transform: translate(-50%, 0);
    }

    .page-footer {
      padding: 20px 0;
      color: #aabbc8;
      font-size: 0.7rem;
      text-align: center;
    }
  </style>
</head>

<body>
  <header class="header">
    <a class="back-link" href="index.html">
      &#8592; Home
    </a>

    <button
      class="pin-btn"
      id="pin-btn"
      type="button"
      title="Accesso gestore"
    >
      🔒
    </button>

    <span class="icons">
      <img
        src="news-pallanuoto.png"
        alt="News"
      >
    </span>

    <h1>News Generali</h1>

    <div class="subtitle">
      Comunicazioni per tutta la squadra
    </div>

    <div class="sync-status">
      <div
        class="sync-dot"
        id="sync-dot"
      ></div>

      <span id="sync-label">
        Connessione in corso…
      </span>
    </div>
  </header>

  <div class="wave-divider">
    <svg
      viewBox="0 0 1440 72"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M0,36 C180,72 360,0 540,36 C720,72 900,0 1080,36 C1260,72 1380,12 1440,36 L1440,72 L0,72 Z"
        fill="#e8f4fd"
      />
    </svg>
  </div>

  <main class="container">
    <section
      class="manager-panel"
      id="manager-panel"
    >
      <h3 id="manager-panel-title">
        ✏️ Pubblica una comunicazione
      </h3>

      <div class="form-group">
        <label for="news-title">Titolo</label>

        <input
          type="text"
          class="form-input"
          id="news-title"
          maxlength="100"
          placeholder="Titolo della comunicazione…"
        >
      </div>

      <div class="form-group">
        <label for="news-text">Testo</label>

        <textarea
          class="form-input"
          id="news-text"
          placeholder="Scrivi il messaggio…"
        ></textarea>
      </div>

      <div
        class="existing-attachments"
        id="existing-attachments"
      ></div>

      <div class="form-group">
        <label for="news-files">
          PDF / immagini da allegare
        </label>

        <input
          type="file"
          class="form-input"
          id="news-files"
          accept="application/pdf,image/*"
          multiple
        >

        <div class="form-hint">
          Sono consentiti PDF e immagini fino a 10 MB per file.
          I file vengono salvati nella cartella
          <strong>allegati/</strong>.
        </div>

        <div
          class="selected-files"
          id="selected-files"
        ></div>
      </div>

      <div class="form-group">
        <label for="news-attachments-titles">
          Titoli allegati
        </label>

        <textarea
          class="form-input"
          id="news-attachments-titles"
          placeholder="Un titolo per riga, nello stesso ordine dei file"
        ></textarea>

        <div class="form-hint">
          Campo opzionale. Se vuoto viene usato il nome del file.
        </div>
      </div>

      <button
        class="pub-btn"
        id="pub-btn"
        type="button"
      >
        📤 Pubblica comunicazione
      </button>

      <button
        class="cancel-edit-btn"
        id="cancel-edit-btn"
        type="button"
      >
        ❌ Annulla modifica
      </button>
    </section>

    <div class="section-title">
      📢 Comunicazioni e avvisi
    </div>

    <div id="news-container"></div>
  </main>

  <footer class="page-footer">
    📰 News · Nekton Pallanuoto
  </footer>

  <div
    class="toast"
    id="toast"
  ></div>

  <div
    class="modal-overlay"
    id="modal-overlay"
  >
    <div class="modal">
      <h3>🔑 Accesso Gestore</h3>

      <p>
        Inserisci il PIN per pubblicare comunicazioni
      </p>

      <div class="pin-input-wrap">
        <input
          type="password"
          id="pin-input"
          maxlength="50"
          autocomplete="off"
          placeholder="••••••••"
        >

        <button
          class="pin-toggle"
          id="pin-toggle"
          type="button"
          title="Mostra o nascondi il PIN"
        >
          👁️
        </button>
      </div>

      <div
        class="modal-error"
        id="modal-error"
      ></div>

      <div class="modal-btns">
        <button
          class="modal-btn secondary"
          id="modal-cancel"
          type="button"
        >
          Annulla
        </button>

        <button
          class="modal-btn primary"
          id="modal-confirm"
          type="button"
        >
          Accedi
        </button>
      </div>
    </div>
  </div>

  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js"></script>
  <script src="https://www.gstatic.com/firebasejs/9.23.0/firebase-database-compat.js"></script>

  <script>
    firebase.initializeApp({
      apiKey: "AIzaSyAfOMeAkXUIandLUhCR8nfyELOPVRyD3WU",
      authDomain: "lista-spesa-b9eb1.firebaseapp.com",
      databaseURL:
        "https://lista-spesa-b9eb1-default-rtdb.europe-west1.firebasedatabase.app",
      projectId: "lista-spesa-b9eb1",
      storageBucket: "lista-spesa-b9eb1.firebasestorage.app",
      messagingSenderId: "468690890938",
      appId: "1:468690890938:web:048be7f27779d8862d9283"
    });

    const db = firebase.database();
    const newsRef = db.ref("nekton/news/generale");
    const MAX_FILE_SIZE = 10 * 1024 * 1024;

    let allNews = {};
    let editingNewsId = null;
    let currentManagerPin = "";

    function getElement(id) {
      return document.getElementById(id);
    }

    function isManager() {
      return sessionStorage.getItem("nektonManager") === "1";
    }

    function setManager(value) {
      if (value) {
        sessionStorage.setItem("nektonManager", "1");
      } else {
        sessionStorage.removeItem("nektonManager");
      }
    }

    function escapeHtml(value) {
      return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    function showToast(message) {
      const toast = getElement("toast");

      toast.textContent = message;
      toast.classList.add("show");

      window.setTimeout(() => {
        toast.classList.remove("show");
      }, 3500);
    }

    function normalizeAttachments(rawAttachments) {
      if (!rawAttachments) {
        return [];
      }

      if (Array.isArray(rawAttachments)) {
        return rawAttachments.filter(Boolean);
      }

      if (typeof rawAttachments === "object") {
        return Object.values(rawAttachments).filter(Boolean);
      }

      return [];
    }

    function inferAttachmentType(filePath = "") {
      const path = String(filePath).toLowerCase();

      if (/\.(png|jpe?g|gif|webp|svg)$/.test(path)) {
        return "img";
      }

      if (/\.pdf$/.test(path)) {
        return "pdf";
      }

      return "file";
    }

    function getAttachmentFile(attachment) {
      if (typeof attachment === "string") {
        return attachment;
      }

      return attachment && attachment.file
        ? attachment.file
        : "";
    }

    function renderAttachments(rawAttachments) {
      const attachments = normalizeAttachments(rawAttachments);

      if (attachments.length === 0) {
        return "";
      }

      const rows = attachments
        .map(attachment => {
          const item =
            typeof attachment === "string"
              ? { file: attachment }
              : attachment;

          const file = String(item.file || "").trim();

          if (!file) {
            return "";
          }

          const type = String(
            item.tipo || inferAttachmentType(file)
          ).toLowerCase();

          const title = escapeHtml(
            item.titolo ||
            file.split("/").pop() ||
            "Allegato"
          );

          const safeFile = escapeHtml(file);

          if (type === "img") {
            return `
              <a
                class="attachment-link"
                href="${safeFile}"
                target="_blank"
                rel="noopener"
              >
                🖼️ ${title}
              </a>

              <div class="attachment-preview">
                <img
                  src="${safeFile}"
                  alt="${title}"
                  loading="lazy"
                >
              </div>
            `;
          }

          if (type === "pdf") {
            return `
              <a
                class="attachment-link"
                href="${safeFile}"
                target="_blank"
                rel="noopener"
              >
                📄 ${title}
              </a>
            `;
          }

          return `
            <a
              class="attachment-link"
              href="${safeFile}"
              target="_blank"
              rel="noopener"
            >
              📎 ${title}
            </a>
          `;
        })
        .filter(Boolean)
        .join("");

      return rows
        ? `<div class="news-attachments">${rows}</div>`
        : "";
    }

    function formatDate(value) {
      if (!value) {
        return "";
      }

      const date = new Date(value);

      if (Number.isNaN(date.getTime())) {
        return String(value);
      }

      return date.toLocaleDateString("it-IT", {
        day: "2-digit",
        month: "long",
        year: "numeric"
      });
    }

    function renderNews() {
      const container = getElement("news-container");

      const entries = Object
        .entries(allNews)
        .map(([id, item]) => ({ id, item }))
        .sort((first, second) => {
          return String(second.item.data || "").localeCompare(
            String(first.item.data || "")
          );
        });

      if (entries.length === 0) {
        container.innerHTML = `
          <div class="no-news">
            Nessuna comunicazione al momento. 💤
          </div>
        `;

        return;
      }

      container.innerHTML = "";

      entries.forEach(({ id, item }) => {
        const card = document.createElement("article");

        card.className = "news-card";
        card.dataset.id = id;

        card.innerHTML = `
          <div class="news-meta">
            📅 ${escapeHtml(formatDate(item.data))}
          </div>

          <div class="news-title">
            ${escapeHtml(item.titolo)}
          </div>

          <div class="news-text">
            ${escapeHtml(item.testo)}
          </div>

          ${renderAttachments(item.allegati)}

          ${
            isManager()
              ? `
                <div class="news-actions">
                  <button
                    class="news-edit-btn"
                    type="button"
                    title="Modifica"
                  >
                    ✏️
                  </button>

                  <button
                    class="news-del-btn"
                    type="button"
                    title="Elimina"
                  >
                    🗑️
                  </button>
                </div>
              `
              : ""
          }
        `;

        container.appendChild(card);
      });

      bindNewsButtons();
    }

    function bindNewsButtons() {
      if (!isManager()) {
        return;
      }

      document
        .querySelectorAll(".news-edit-btn")
        .forEach(button => {
          button.addEventListener("click", () => {
            const card = button.closest(".news-card");
            const newsId = card.dataset.id;

            startEditingNews(newsId, allNews[newsId]);
          });
        });

      document
        .querySelectorAll(".news-del-btn")
        .forEach(button => {
          button.addEventListener("click", () => {
            deleteNews(button);
          });
        });
    }

    function showExistingAttachments(rawAttachments) {
      const container = getElement("existing-attachments");
      const attachments = normalizeAttachments(rawAttachments);

      if (attachments.length === 0) {
        container.innerHTML = "";
        container.classList.remove("visible");
        return;
      }

      const list = attachments
        .map(attachment => {
          const file = getAttachmentFile(attachment);
          const title =
            typeof attachment === "object" && attachment.titolo
              ? attachment.titolo
              : file.split("/").pop();

          return `<li>${escapeHtml(title || file)}</li>`;
        })
        .join("");

      container.innerHTML = `
        <strong>Allegati già presenti:</strong>
        <ul>${list}</ul>
        <div>
          I nuovi allegati verranno aggiunti a quelli esistenti.
        </div>
      `;

      container.classList.add("visible");
    }

    function startEditingNews(newsId, news) {
      if (!news) {
        return;
      }

      editingNewsId = newsId;

      getElement("news-title").value = news.titolo || "";
      getElement("news-text").value = news.testo || "";

      showExistingAttachments(news.allegati);

      getElement("manager-panel-title").textContent =
        "✏️ Modifica comunicazione";

      getElement("pub-btn").textContent =
        "💾 Salva modifiche";

      getElement("cancel-edit-btn").classList.add("visible");
      getElement("manager-panel").classList.add("visible");

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });
    }

    function resetNewsForm() {
      editingNewsId = null;

      getElement("news-title").value = "";
      getElement("news-text").value = "";
      getElement("news-files").value = "";
      getElement("news-attachments-titles").value = "";
      getElement("selected-files").innerHTML = "";

      getElement("existing-attachments").innerHTML = "";
      getElement("existing-attachments").classList.remove("visible");

      getElement("pub-btn").disabled = false;
      getElement("pub-btn").textContent =
        "📤 Pubblica comunicazione";

      getElement("manager-panel-title").textContent =
        "✏️ Pubblica una comunicazione";

      getElement("cancel-edit-btn").classList.remove("visible");
    }

    function validateFile(file) {
      const validExtension =
        /\.(pdf|png|jpe?g|gif|webp|svg)$/i.test(file.name);

      const validMimeType =
        file.type === "application/pdf" ||
        String(file.type).startsWith("image/");

      if (!validExtension || !validMimeType) {
        throw new Error(
          `${file.name}: sono consentiti solo PDF e immagini`
        );
      }

      if (file.size > MAX_FILE_SIZE) {
        throw new Error(
          `${file.name}: il file supera il limite di 10 MB`
        );
      }
    }

    function fileToBase64(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
          const result = String(reader.result || "");
          const separator = result.indexOf(",");

          if (separator === -1) {
            reject(
              new Error(`Impossibile leggere ${file.name}`)
            );

            return;
          }

          resolve(result.slice(separator + 1));
        };

        reader.onerror = () => {
          reject(
            new Error(`Errore nella lettura di ${file.name}`)
          );
        };

        reader.readAsDataURL(file);
      });
    }

    async function uploadAttachment(file) {
      validateFile(file);

      if (!currentManagerPin) {
        throw new Error(
          "Sessione gestore non valida. Effettua nuovamente l'accesso."
        );
      }

      const contentBase64 = await fileToBase64(file);

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fileName: file.name,
          mimeType: file.type,
          contentBase64,
          pin: currentManagerPin
        })
      });

      const responseText = await response.text();

      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {
          error: responseText || "Risposta non valida dal server"
        };
      }

      if (!response.ok) {
        throw new Error(
          responseData.error ||
          `Errore durante il caricamento (${response.status})`
        );
      }

      if (!responseData.path) {
        throw new Error(
          "Il server non ha restituito il percorso del file"
        );
      }

      return responseData.path;
    }

    async function deleteAttachmentsFromRepository(files) {
      if (!files.length) {
        return;
      }

      if (!currentManagerPin) {
        throw new Error(
          "Sessione gestore non valida. Effettua nuovamente l'accesso."
        );
      }

      const response = await fetch("/api/upload", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          files,
          pin: currentManagerPin
        })
      });

      const responseText = await response.text();

      let responseData;

      try {
        responseData = JSON.parse(responseText);
      } catch {
        responseData = {
          error: responseText || "Risposta non valida dal server"
        };
      }

      if (!response.ok) {
        throw new Error(
          responseData.error ||
          `Errore durante la cancellazione (${response.status})`
        );
      }

      return responseData;
    }

    function getFilesUsedByOtherNews(newsId) {
      const filesUsedElsewhere = new Set();

      Object.entries(allNews).forEach(([otherId, news]) => {
        if (otherId === newsId) {
          return;
        }

        normalizeAttachments(news.allegati)
          .map(getAttachmentFile)
          .filter(Boolean)
          .forEach(file => {
            filesUsedElsewhere.add(file);
          });
      });

      return filesUsedElsewhere;
    }

    async function deleteNews(button) {
      const card = button.closest(".news-card");
      const newsId = card.dataset.id;
      const news = allNews[newsId];

      if (!news) {
        return;
      }

      const confirmed = window.confirm(
        "Eliminare questa comunicazione e i relativi allegati?"
      );

      if (!confirmed) {
        return;
      }

      const attachments = normalizeAttachments(news.allegati);

      const files = attachments
        .map(getAttachmentFile)
        .filter(file => file.startsWith("allegati/"));

      const filesUsedElsewhere =
        getFilesUsedByOtherNews(newsId);

      const filesToDelete = [
        ...new Set(
          files.filter(file => !filesUsedElsewhere.has(file))
        )
      ];

      button.disabled = true;

      try {
        /*
         * Gli allegati vengono eliminati prima da GitHub.
         * Se la cancellazione fallisce, la comunicazione rimane
         * presente in Firebase.
         */
        if (filesToDelete.length > 0) {
          showToast("⏳ Eliminazione degli allegati…");

          await deleteAttachmentsFromRepository(filesToDelete);
        }

        await newsRef.child(newsId).remove();

        if (editingNewsId === newsId) {
          resetNewsForm();
        }

        showToast(
          "✅ Comunicazione e allegati eliminati"
        );
      } catch (error) {
        console.error("Errore durante la cancellazione:", error);

        showToast(
          `❌ ${error.message || "Errore durante la cancellazione"}`
        );
      } finally {
        button.disabled = false;
      }
    }

    async function publishNews() {
      const title = getElement("news-title").value.trim();
      const text = getElement("news-text").value.trim();
      const files = Array.from(
        getElement("news-files").files || []
      );

      const titles = getElement("news-attachments-titles")
        .value
        .split("\n")
        .map(value => value.trim());

      if (!title) {
        showToast("⚠️ Inserisci un titolo!");
        return;
      }

      if (!text) {
        showToast("⚠️ Inserisci il testo!");
        return;
      }

      const button = getElement("pub-btn");

      button.disabled = true;
      button.textContent = "⏳ Pubblicazione…";

      try {
        const newAttachments = [];

        for (let index = 0; index < files.length; index++) {
          const file = files[index];

          showToast(
            `⏳ Caricamento ${index + 1}/${files.length}: ${file.name}`
          );

          const path = await uploadAttachment(file);

          newAttachments.push({
            file: path,
            titolo: titles[index] || file.name,
            tipo: inferAttachmentType(path)
          });
        }

        const oldNews = editingNewsId
          ? allNews[editingNewsId] || {}
          : {};

        const oldAttachments = normalizeAttachments(
          oldNews.allegati
        );

        const allAttachments = [
          ...oldAttachments,
          ...newAttachments
        ];

        const payload = {
          titolo: title,
          testo: text,
          data:
            oldNews.data ||
            new Date().toISOString().slice(0, 10)
        };

        if (allAttachments.length > 0) {
          payload.allegati = allAttachments;
        }

        if (editingNewsId) {
          await newsRef
            .child(editingNewsId)
            .set(payload);

          showToast("✅ Comunicazione modificata!");
        } else {
          await newsRef.push(payload);

          showToast("✅ Comunicazione pubblicata!");
        }

        resetNewsForm();
      } catch (error) {
        console.error("Errore durante la pubblicazione:", error);

        showToast(
          `❌ ${error.message || "Errore durante la pubblicazione"}`
        );
      } finally {
        button.disabled = false;

        button.textContent = editingNewsId
          ? "💾 Salva modifiche"
          : "📤 Pubblica comunicazione";
      }
    }

    function updateSelectedFiles() {
      const files = Array.from(
        getElement("news-files").files || []
      );

      const container = getElement("selected-files");

      if (files.length === 0) {
        container.innerHTML = "";
        return;
      }

      container.innerHTML = files
        .map(file => {
          const size = (
            file.size /
            1024 /
            1024
          ).toFixed(2);

          const icon =
            inferAttachmentType(file.name) === "pdf"
              ? "📄"
              : "🖼️";

          return `
            <div class="selected-file">
              ${icon}
              ${escapeHtml(file.name)}
              — ${size} MB
            </div>
          `;
        })
        .join("");
    }

    function updatePinButton() {
      getElement("pin-btn").textContent =
        isManager() ? "🔐" : "🔒";
    }

    function openManagerModal() {
      getElement("modal-error").textContent = "";
      getElement("pin-input").value = "";
      getElement("pin-input").type = "password";
      getElement("pin-toggle").textContent = "👁️";
      getElement("modal-overlay").classList.add("open");

      window.setTimeout(() => {
        getElement("pin-input").focus();
      }, 100);
    }

    function closeManagerModal() {
      getElement("modal-overlay").classList.remove("open");
    }

    function checkPin() {
      const pin = getElement("pin-input").value;

      if (pin === "nekton2026") {
        currentManagerPin = pin;
        setManager(true);
        closeManagerModal();

        getElement("manager-panel").classList.add("visible");

        updatePinButton();
        resetNewsForm();
        renderNews();

        showToast("✅ Modalità gestore attiva");
        return;
      }

      getElement("modal-error").textContent =
        "❌ PIN non corretto";
    }

    db.ref(".info/connected").on("value", snapshot => {
      const dot = getElement("sync-dot");
      const label = getElement("sync-label");

      if (snapshot.val()) {
        dot.className = "sync-dot connected";
        label.textContent =
          "✅ Sincronizzato in tempo reale";
      } else {
        dot.className = "sync-dot error";
        label.textContent =
          "❌ Offline – riconnessione…";
      }
    });

    newsRef
      .orderByChild("data")
      .on("value", snapshot => {
        allNews = snapshot.val() || {};
        renderNews();
      });

    getElement("pub-btn").addEventListener(
      "click",
      publishNews
    );

    getElement("cancel-edit-btn").addEventListener(
      "click",
      resetNewsForm
    );

    getElement("news-files").addEventListener(
      "change",
      updateSelectedFiles
    );

    getElement("pin-btn").addEventListener(
      "click",
      () => {
        if (isManager()) {
          setManager(false);
          currentManagerPin = "";

          getElement("manager-panel")
            .classList.remove("visible");

          resetNewsForm();
          updatePinButton();
          renderNews();

          showToast("👋 Logout gestore effettuato");
          return;
        }

        openManagerModal();
      }
    );

    getElement("modal-cancel").addEventListener(
      "click",
      closeManagerModal
    );

    getElement("modal-confirm").addEventListener(
      "click",
      checkPin
    );

    getElement("modal-overlay").addEventListener(
      "click",
      event => {
        if (event.target === getElement("modal-overlay")) {
          closeManagerModal();
        }
      }
    );

    getElement("pin-input").addEventListener(
      "keydown",
      event => {
        if (event.key === "Enter") {
          checkPin();
        }
      }
    );

    getElement("pin-toggle").addEventListener(
      "click",
      () => {
        const input = getElement("pin-input");
        const toggle = getElement("pin-toggle");

        if (input.type === "password") {
          input.type = "text";
          toggle.textContent = "🙈";
        } else {
          input.type = "password";
          toggle.textContent = "👁️";
        }
      }
    );

    /*
     * Per sicurezza il PIN non viene recuperato dopo un refresh.
     * L'amministratore deve effettuare nuovamente il login.
     */
    setManager(false);
    currentManagerPin = "";
    updatePinButton();
  </script>
</body>
</html>
