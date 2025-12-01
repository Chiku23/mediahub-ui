async function loadMedia() {
    requireAuth();
    setUsername();

    const res = await fetch(API.media + "/media", {
        headers: { Authorization: "Bearer " + getToken() }
    });

    const data = await res.json();
    window.allFiles = data.files;

    setupTabs();
    renderByType("images");
}
function setupTabs() {
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");

            const type = btn.getAttribute("data-type");
            renderByType(type);
        };
    });
}

function renderByType(type) {
    const grid = document.getElementById("media-grid");
    grid.innerHTML = "";

    let filtered = [];

    switch (type) {
        case "images":
            filtered = window.allFiles.filter(f => f.type.startsWith("image/"));
            break;

        case "videos":
            filtered = window.allFiles.filter(f => f.type.startsWith("video/"));
            break;

        case "audio":
            filtered = window.allFiles.filter(f =>
                f.type.startsWith("audio/")
            );
            break;

        case "pdf":
            filtered = window.allFiles.filter(f =>
                f.type === "application/pdf"
            );
            break;
    }

    if (!filtered.length) {
        grid.innerHTML = "<p>No media found in this category.</p>";
        return;
    }

    filtered.forEach(file => {
        let thumbnail = "";

        if (file.type.startsWith("audio/")) {
            thumbnail = "../assets/audio-placeholder.jpg";
        } else {
            thumbnail = file.thumbnail
                ? `${API.upload}/${file.thumbnail}`
                : "../assets/placeholder.jpg";
        }

        const item = document.createElement("div");
        item.className = "item";

        item.innerHTML = `
            <img src="${thumbnail}" class="thumb">
            <p class="file-name">${file.originalName || file.type}</p>
        `;

        item.onclick = () => {
            window.location.href = `media.html?id=${file.id}`;
        };

        grid.appendChild(item);
    });
}
