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
        let thumbnail = "";
        if(file.type == "audio/mpeg" || file.type == "audio/mp3" || file.type == "audio/wav" || file.type == "audio/ogg"){
            thumbnail = "../assets/audio-placeholder.jpg";
        }else{
            thumbnail = file.thumbnail ? `${API.upload}/${file.thumbnail}` : "../assets/placeholder.jpg";
        }

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