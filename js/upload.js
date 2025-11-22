const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",

    "video/mp4",
    "video/mpeg",
    "video/quicktime",
    "video/x-matroska",

    "audio/mpeg",
    "audio/mp3",
    "audio/wav",
    "audio/ogg",

    "application/pdf"
];

async function uploadFile() {
    requireAuth();

    const file = document.getElementById("fileInput").files[0];
    const status = document.getElementById("status");

    if (!file) {
        status.innerHTML = "Please select a file.";
        status.style.color = "red";
        return;
    }

    // FRONTEND FILE TYPE VALIDATION
    if (!allowedTypes.includes(file.type)) {
        status.innerHTML = "Unsupported file type.";
        status.style.color = "red";
        return;
    }

    status.innerHTML = "Uploading...";
    status.style.color = "black";

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(API.upload + "/upload", {
            method: "POST",
            headers: {
                Authorization: "Bearer " + getToken()
            },
            body: formData
        });

        const data = await res.json();

        if (data.fileId) {
            status.innerHTML = "Upload successful!";
            status.style.color = "green";

            // Instant redirect, no timeout
            window.location.href = "dashboard.html";

        } else {
            status.innerHTML = data.error || "Upload failed.";
            status.style.color = "red";
        }

    } catch (error) {
        status.innerHTML = "Server error.";
        status.style.color = "red";
    }
}
