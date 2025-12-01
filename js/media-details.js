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

    // -------------------------
    // IMAGE
    // -------------------------
    if (file.type.startsWith("image/")) {
        const fullPath = `${API.upload}/${file.path}`;
        preview.innerHTML = `<img src="${fullPath}">`;
        return;
    }

    // -------------------------
    // VIDEO
    // -------------------------
    if (file.type.startsWith("video/")) {
        // 1) Still processing → show message
        if (file.streamStatus === "processing") {
            preview.innerHTML = `
                <div class="processing">
                    <p>Video is processing for streaming...</p>
                </div>
            `;
            return;
        }

        // 2) Failed → show error
        if (file.streamStatus === "failed") {
            preview.innerHTML = `
                <p style="color:red;">Unable to process video.</p>
            `;
            return;
        }

        // 3) Streaming ready → use HLS
        if (file.streamStatus === "ready" && file.streamPath) {
            const hlsUrl = `${API.transcoder}/${file.streamPath}`;

            preview.innerHTML = `
                <video id="player" controls playsinline></video>
            `;

            const video = document.getElementById("player");

            if (Hls.isSupported()) {
                const hls = new Hls({
                    enableWorker: true,
                    abrEwmaDefaultEstimate: 5000000, // smoother quality switching
                });

                hls.loadSource(hlsUrl);
                hls.attachMedia(video);

                hls.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
                    const qualities = data.levels.map((lvl) => lvl.height);  // [1080, 720, 480]

                    player = new Plyr(video, {
                        quality: {
                            default: qualities[0],
                            options: qualities,
                            forced: true,
                            onChange: (newQuality) => {
                                const levelIndex = qualities.indexOf(newQuality);
                                hls.currentLevel = levelIndex; // manual switch
                            }
                        }
                    });
                });
            } else {
                // Safari supports HLS natively
                video.src = hlsUrl;
            }

            // Apply Plyr UI
            setTimeout(() => {
                new Plyr("#player");
            }, 50);

            return;
        }

        // 4) No HLS available → fallback to raw mp4
        const fallbackPath = `${API.upload}/${file.path}`;
        preview.innerHTML = `<video src="${fallbackPath}" controls></video>`;
        return;
    }

    // -------------------------
    // AUDIO
    // -------------------------
    if (file.type.startsWith("audio/")) {
        const fullPath = `${API.upload}/${file.path}`;
        preview.innerHTML = `<audio controls src="${fullPath}"></audio>`;
        return;
    }

    // -------------------------
    // PDF
    // -------------------------
    if (file.type === "application/pdf") {
        preview.innerHTML = `<p>PDF cannot be previewed fully here.</p>`;
        return;
    }

    // -------------------------
    // UNKNOWN
    // -------------------------
    preview.innerHTML = `<p>No preview available.</p>`;
}

// ----------------------------------------
// METADATA
// ----------------------------------------
async function loadMetadata(id) {
    const res = await fetch(`${API.media}/media/${id}`, {
        headers: { Authorization: "Bearer " + getToken() }
    });

    const { file } = await res.json();

    for (let key in file) {
        const element = document.getElementById(key);
        if(element){
            if(key == 'size'){
                element.innerHTML = (file[key] / (1024*1024)).toFixed(2) + "MB";
            } else if(key == 'createdAt'){
                element.innerHTML = new Date(file[key]).toLocaleString();
            } else {
                element.innerHTML = file[key];
            }
        }
    }
}

async function regenerateThumbnail(){
    const params = new URLSearchParams(window.location.search);
    let mediafileID = params.get("id");

    try {
        const res = await fetch(`${API.thumbnail}/thumbnail`, {
            method: "POST",
            headers: { Authorization: "Bearer " + getToken(), "Content-Type": "application/json" },
            
            body: JSON.stringify({mediafileID})
        });

        const data = await res.json();

        if(data.message){
            alert(data.message);
        }else{
            console.error(data.error || "Error generating thumbnail");
        }
    } catch (error) {
        console.error("Something went wrong");
    }
}

async function deleteFile() {
    const params = new URLSearchParams(window.location.search);
    let mediafileID = params.get("id");

    try {
        const res = await fetch(`${API.media}/delete-media`, {
            method: "POST",
            headers: { 
                Authorization: "Bearer " + getToken(), 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ mediafileID })
        });

        const data = await res.json();

        if (data.message) {
            showDeleteModal();
        } else {
            console.error(data.error || "Error deleting file");
        }

    } catch (error) {
        console.error("Something went wrong");
    }
}

function showDeleteModal() {
    document.getElementById("delete-modal").style.display = "flex";
}

function closeDeleteModal() {
    document.getElementById("delete-modal").style.display = "none";
    window.location.href = "dashboard.html";
}

function showErrorModal(msg="Something went wrong") {
    document.getElementById("error-modal").style.display = "flex";
    document.getElementById('modal-error-msg').innerHTML = msg || "Something went wrong";
}

function closeErrorModal() {
    document.getElementById("error-modal").style.display = "none";
}

function getFileNameOnly(filename) {
    return filename.substring(0, filename.lastIndexOf(".")) || filename;
}

function getExtension(filename) {
    return filename.substring(filename.lastIndexOf("."));
}

const editBtn = document.getElementById('editName');
const editModal = document.getElementById('edit-modal');

editBtn.addEventListener("click", () => {
    editModal.style.display = "flex";
    const fullName = document.getElementById("originalName").textContent;
    document.getElementById("editInput").value = getFileNameOnly(fullName);
});

async function saveMediaName() {
    const params = new URLSearchParams(window.location.search);
    let mediafileID = params.get("id");

    let input = document.getElementById("editInput").value.trim();
    const oldName = document.getElementById("originalName").textContent;

    const ext = getExtension(oldName);      // e.g. .jpg
    const finalName = input + ext;          // new name + extension

    if (!mediafileID) return showErrorModal("Missing ID");

    try {
        const res = await fetch(`${API.media}/edit-media`, {
            method: "POST",
            headers: { 
                Authorization: "Bearer " + getToken(), 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify({ 
                mediafileID,
                originalName: finalName
            })
        });

        const data = await res.json();

        if (data.message) {
            // showSuccessModal("Updated Successfully");

            // Update UI text
            document.getElementById("originalName").textContent = finalName;

            // Close modal
            document.getElementById("edit-modal").style.display = "none";
        } else {
            showErrorModal(data.error || "Error updating name");
        }

    } catch (error) {
        showErrorModal("Something went wrong");
    }
}
