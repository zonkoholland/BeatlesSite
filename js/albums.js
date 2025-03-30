window.addEventListener("DOMContentLoaded", () => {
    fetch("http://localhost:8080/beatlesapi/disco")
        .then(res => res.json())
        .then(existingAlbums => {
            const existingTitles = new Set(existingAlbums.map(a => a.titulo.toLowerCase()));

            hardcodedAlbums.forEach(album => {
                if (!existingTitles.has(album.titulo.toLowerCase())) {
                    fetch("http://localhost:8080/beatlesapi/disco", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(album)
                    }).catch(err => console.warn("Error añadiendo disco:", err));
                }
            });
            setTimeout(loadAlbums, 300);
        })
        .catch(error => console.error("Error inicializando discos:", error));
    loadSongs();



    const form = document.getElementById("album-form");
    if (form) {
        form.addEventListener("submit", (event) => {
            event.preventDefault();

            const albumData = {
                id: 0,
                titulo: form.titulo.value,
                año: parseInt(form.year.value),
                portada: form.portada.value,
                descripcion: form.descripcion.value,
                listadoCanciones: []
            };

            fetch("http://localhost:8080/beatlesapi/disco", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(albumData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al crear el álbum");
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Álbum añadido con éxito");
                    form.reset();
                    window.location.href = "albums.html";
                })
                .catch(error => {
                    console.error("Error al crear álbum:", error);
                    alert("Error al crear el álbum");
                });
        });
    }

    const songForm = document.getElementById("song-form");
    if (songForm) {
        songForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const songData = {
                id: 0,
                titulo: songForm.tituloCancion.value,
                duracion: parseInt(songForm.duracion.value)
            };

            fetch("http://localhost:8080/beatlesapi/cancion", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(songData)
            })
                .then(response => {
                    if (!response.ok) {
                        throw new Error("Error al crear la canción");
                    }
                    return response.json();
                })
                .then(data => {
                    alert("Canción añadida con éxito");
                    songForm.reset();
                })
                .catch(error => {
                    console.error("Error al crear canción:", error);
                    alert("Error al crear la canción");
                });
        });
    }


});

//Discos existentes de la web estática, cargan al reiniciar la página de discos
const hardcodedAlbums = [
    {
        titulo: "Abbey Road",
        año: 1969,
        portada: "https://upload.wikimedia.org/wikipedia/en/4/42/Beatles_-_Abbey_Road.jpg",
        descripcion: "El último disco que grabó el grupo es considerado por muchos como su mejor (incluyendo el escritor de esta página 😉). La primera mitad es una colección de canciones muy consistente (\"Come Together\", \"Something\", \"I Want You (She's So Heavy)\", \"Here Comes the Sun\", etc.) mientras que el medley de la segunda mitad es una de las conclusiones más energéticas y emocionalmente impactantes jamás. Album altamente recomendado para gente que quiera adentrarse en su discografía o en la música en general.",
        listadoCanciones: [
            {titulo: "Come Together", duracion: 259},
            {titulo: "Something", duracion: 182}
        ]
    },
    {
        titulo: "Revolver",
        año: 1966,
        portada: "https://i.discogs.com/xynUxpiZENNE_dZraVfDy70ywbi_xHvbe-7H4bUSnPE/rs:fit/g:sm/q:40/h:300/w:300/czM6Ly9kaXNjb2dz/LWRhdGFiYXNlLWlt/YWdlcy9SLTQyODM4/OS0xNDU5MzQ2MTcz/LTk2OTYuanBlZw.jpeg",
        descripcion: "Estrenado en 1966, Revolver completa la tranformación del grupo a adoptar un sonido más experimental. Sus técnicas de producción avanzadas y la calidad de las canciones fijan a Revolver como uno de los discos más influyentes de la historia del rock. Sus mejores canciones incluyen \"Eleanor Rigby\", \"Here, There and Everywhere\", \"For No One\" y \"Tomorrow Never Knows\", entre otras.",
        listadoCanciones: [
            {titulo: "Eleanor Rigby", duracion: 138},
            {titulo: "Tomorrow Never Knows", duracion: 180}
        ]
    }
];

function loadAlbums() {
    fetch("http://localhost:8080/beatlesapi/disco")
        .then(response => response.json())
        .then(data => renderAlbums(data))
        .catch(error => console.error("Error fetching albums:", error));
}

function renderAlbums(albums) {
    const container = document.querySelector(".album-list");
    container.innerHTML = "";

    albums.forEach(album => {
        const details = document.createElement("details");
        details.className = "album";

        const summary = document.createElement("summary");
        summary.innerHTML = `
            <img src="images/${album.portada}" alt="${album.titulo}" width="60" height="60">
            <p>${album.titulo} (${album.año})</p>
        `;

        const body = document.createElement("div");
        body.innerHTML = `
            <p>${album.descripcion}</p>
            <ul>
                ${album.listadoCanciones.map(c => `
                    <li>
                        ${c.titulo} (${c.duracion}s)
                        <button class="delete-song-btn" data-album-id="${album.id}" data-song-id="${c.id}">Borrar</button>
                    </li>
                `).join("")}
            </ul>

            <form class="add-song-form" data-album-id="${album.id}">
                <h4>Añadir canción existente por ID:</h4>
                <input type="number" class="song-id-input" placeholder="ID de canción" required>
                <button type="submit">Añadir canción</button>
            </form>
        `;

        details.appendChild(summary);
        details.appendChild(body);
        container.appendChild(details);
    });

    addDeleteSongListeners();
    addAddSongFormListeners();
}

function addDeleteSongListeners() {
    document.querySelectorAll(".delete-song-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const albumId = btn.dataset.albumId;
            const songId = btn.dataset.songId;

            if (confirm("¿Seguro que quieres eliminar esta canción del álbum?")) {
                fetch(`http://localhost:8080/beatlesapi/disco/${albumId}/cancion/${songId}`, {
                    method: "DELETE"
                })
                    .then(res => {
                        if (!res.ok) throw new Error("No se pudo eliminar la canción");
                        alert("Canción eliminada del álbum");
                        location.reload();
                    })
                    .catch(err => {
                        console.error(err);
                        alert("Error eliminando la canción");
                    });
            }
        });
    });
}

function addAddSongFormListeners() {
    document.querySelectorAll(".add-song-form").forEach(form => {
        form.addEventListener("submit", e => {
            e.preventDefault();
            const albumId = form.dataset.albumId;
            const songId = form.querySelector(".song-id-input").value;

            fetch(`http://localhost:8080/beatlesapi/disco/${albumId}/addCancion`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: songId })
            })
                .then(res => {
                    if (!res.ok) throw new Error("No se pudo añadir la canción");
                    alert("Canción añadida al álbum con éxito");
                    location.reload();
                })
                .catch(err => {
                    console.error(err);
                    alert("Error al añadir canción al álbum");
                });
        });
    });
}

function loadSongs() {
    fetch("http://localhost:8080/beatlesapi/cancion")
        .then(res => res.json())
        .then(data => renderSongs(data))
        .catch(err => console.error("Error cargando canciones:", err));
}

function renderSongs(songs) {
    const container = document.getElementById("song-list");
    if (!container) return;

    container.innerHTML = songs.map(song =>
        `<li>ID: ${song.id} - ${song.titulo} (${song.duracion}s)</li>`
    ).join("");
}