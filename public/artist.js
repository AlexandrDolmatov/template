const API_KEY = "96b91d7d9d3ab377398ec03076a5305e";
const API_URL = "https://ws.audioscrobbler.com/2.0/";

const getQueryParam = (param) => {
  const params = new URLSearchParams(window.location.search);
  return params.get(param);
};

const fetchArtistInfo = async (name) => {
  const url = new URL(API_URL);
  url.searchParams.set("method", "artist.getInfo");
  url.searchParams.set("artist", name);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  const res = await fetch(url);
  return await res.json();
};

const fetchTopTracks = async (name) => {
  const url = new URL(API_URL);
  url.searchParams.set("method", "artist.getTopTracks");
  url.searchParams.set("artist", name);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "10");
  const res = await fetch(url);
  return await res.json();
};

const fetchSimilarArtists = async (name) => {
  const url = new URL(API_URL);
  url.searchParams.set("method", "artist.getSimilar");
  url.searchParams.set("artist", name);
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", "8");
  const res = await fetch(url);
  return await res.json();
};

function escapeHTML(str) {
  return str.replace(/[&<>"']/g, m => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[m]);
}

async function renderArtistPage() {
  const name = getQueryParam("name");
  if (!name) return;

  // Fetch all data in parallel
  const [infoData, tracksData, similarData] = await Promise.all([
    fetchArtistInfo(name),
    fetchTopTracks(name),
    fetchSimilarArtists(name),
  ]);

  const artist = infoData?.artist;
  if (!artist) {
    document.getElementById("artist-content").innerHTML = `<p>Артист не найден</p>`;
    return;
  }

  // HEADER
  const image = artist.image?.find(img => img.size === "extralarge")?.["#text"] || "";
  const genres = (artist.tags?.tag || []).map(t => escapeHTML(t.name)).slice(0,3).join(", ");
  document.getElementById("artist-header").style.background = image
    ? `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, #121212 90%), url('${image}') center/cover`
    : "#222";

  document.getElementById("artist-cover").innerHTML = image
    ? `<img src="${image}" alt="${escapeHTML(artist.name)}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;box-shadow:0 10px 30px rgba(0,0,0,0.3)"/>`
    : "";

  document.getElementById("artist-info").innerHTML = `
    <h1 class="artist-name">${escapeHTML(artist.name)}</h1>
    <div class="artist-listeners">${Number(artist.stats?.listeners || 0).toLocaleString()} слушателей</div>
    <div class="artist-genres">${genres}</div>
  `;

  // CONTENT: tracks (default)
  renderArtistTab('tracks', tracksData?.toptracks?.track || []);
  
  // Setup tabs
  document.querySelectorAll(".tab").forEach(tab => {
    tab.onclick = (e) => {
      document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const type = tab.getAttribute("data-tab");
      if (type === "tracks") {
        renderArtistTab("tracks", tracksData?.toptracks?.track || []);
      } else if (type === "similar") {
        renderArtistTab("similar", similarData?.similarartists?.artist || []);
      } else if (type === "bio") {
        renderArtistTab("bio", artist.bio?.content || "");
      }
    };
  });

  // Модалка закрытие
  document.querySelector(".close-modal").onclick = () => {
    document.getElementById("track-modal").style.display = "none";
  };
  document.getElementById("track-modal").onclick = (e) => {
    if (e.target === document.getElementById("track-modal")) {
      document.getElementById("track-modal").style.display = "none";
    }
  };
}

function renderArtistTab(tab, data) {
  const content = document.getElementById("artist-content");
  if (tab === "tracks") {
    content.innerHTML = `
      <ul class="track-list">
        ${data.map(track => `
          <li onclick="openTrackModal('${escapeHTML(track.artist?.name || track.artist)}', '${escapeHTML(track.name)}')">
            <span style="font-weight:bold">${escapeHTML(track.name)}</span>
            <span>${escapeHTML(track.artist?.name || track.artist)}</span>
            <span style="color:#b3b3b3;font-size:0.9em">${Number(track.listeners).toLocaleString()} слушателей</span>
          </li>
        `).join("")}
      </ul>
    `;
  } else if (tab === "similar") {
    content.innerHTML = `
      <div class="artists-grid">
        ${data.map(artist => {
          const img = artist.image?.find(img => img.size === "large")?.["#text"] || "";
          return `
            <div class="related-artist" onclick="window.location.href='artist.html?name=${encodeURIComponent(artist.name)}'">
              ${img ? `<img src="${img}" alt="${escapeHTML(artist.name)}"/>` : ""}
              <div>${escapeHTML(artist.name)}</div>
            </div>
          `;
        }).join("")}
      </div>
    `;
  } else if (tab === "bio") {
    content.innerHTML = `<div style="color:#eee;line-height:1.7">${data || "Нет биографии"}</div>`;
  }
}

// Модалка по треку
window.openTrackModal = async (artist, track) => {
  const url = new URL(API_URL);
  url.searchParams.set("method", "track.getInfo");
  url.searchParams.set("api_key", API_KEY);
  url.searchParams.set("artist", artist);
  url.searchParams.set("track", track);
  url.searchParams.set("format", "json");
  const res = await fetch(url);
  const data = await res.json();
  const t = data.track;

  document.getElementById("modal-track-content").innerHTML = t
    ? `
      <h2>${escapeHTML(t.name)}</h2>
      <div><strong>Исполнитель:</strong> ${escapeHTML(t.artist?.name || artist)}</div>
      <div><strong>Альбом:</strong> ${escapeHTML(t.album?.title || "Неизвестен")}</div>
      <div style="margin-top:12px">${t.wiki?.summary || "Нет описания трека"}</div>
    `
    : `<div>Не удалось загрузить данные о треке</div>`;
  document.getElementById("track-modal").style.display = "flex";
};

window.onload = renderArtistPage;
