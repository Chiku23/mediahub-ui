async function loadDetails() {
    requireAuth();

    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (!id) return;

    const res = await fetch(`${API.media}/media/${id}`, {
        headers: { Authorization: "Bearer " + getToken() }
    });

    const { file } = await res.json();

    displayPreview(file);
    loadMetadata(id);
}

// ----------------------------------------
// PREVIEW LOGIC
// ----------------------------------------
function displayPreview(file) {
    const preview = document.getElementById("preview");

    const fullPath = `${API.upload}/${file.path}`;

    if (file.type.startsWith("image/")) {
        preview.innerHTML = `<img src="${fullPath}">`;
    }
    else if (file.type.startsWith("video/")) {
        preview.innerHTML = `
            <video src="${fullPath}" controls></video>
        `;
    }
    else if (file.type.startsWith("audio/")) {
        preview.innerHTML = `
            <audio controls src="${fullPath}"></audio>
        `;
    }
    else if (file.type === "application/pdf") {
        preview.innerHTML = `<p>PDF cannot be previewed fully here.</p>`;
    }
    else {
        preview.innerHTML = `<p>No preview available.</p>`;
    }
}

// ----------------------------------------
// METADATA
// ----------------------------------------
async function loadMetadata(id) {
    const res = await fetch(`${API.media}/media/${id}`, {
        headers: { Authorization: "Bearer " + getToken() }
    });

    const { file } = await res.json();

    const metadataBox = document.getElementById("metadata");

    metadataBox.innerHTML = `
        <h3>Details</h3>
        <p><strong>ID:</strong> ${file.id}</p>
        <p><strong>Type:</strong> ${file.type}</p>
        <p><strong>Size:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        <p><strong>Status:</strong> ${file.status}</p>
        <p><strong>Created:</strong> ${new Date(file.createdAt).toLocaleString()}</p>
    `;
}
