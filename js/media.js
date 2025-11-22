async function loadMedia() {
    requireAuth();
    setUsername()

    const res = await fetch(API.media + "/media", {
        headers: {
            Authorization: "Bearer " + getToken()
        }
    });

    const data = await res.json();
    const grid = document.getElementById("media-grid");
    grid.innerHTML = "";

    if (!data.files.length) {
        grid.innerHTML = "<p>No media uploaded yet.</p>";
        return;
    }

    data.files.forEach(file => {
        const thumbnail = file.thumbnail
            ? `${API.upload}/${file.thumbnail}`
            : "../assets/placeholder.png";

        const item = document.createElement("div");
        item.className = "item";

        item.innerHTML = `
            <img src="${thumbnail}" class="thumb">
            <p class="file-type">${file.type}</p>
        `;

        item.onclick = () => {
            window.location.href = `media.html?id=${file.id}`;
        };

        grid.appendChild(item);
    });
}