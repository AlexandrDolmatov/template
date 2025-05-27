const API_KEY = "96b91d7d9d3ab377398ec03076a5305e";
const API_URL = "https://ws.audioscrobbler.com/2.0/";

const API_CACHE = new Map();

async function fetchWithCache(method, params) {
  const cacheKey = `${method}_${JSON.stringify(params)}`;
  
  if (API_CACHE.has(cacheKey)) {
    console.log('Using cached data for:', cacheKey);
    return API_CACHE.get(cacheKey);
  }

  const data = await fetchLastFM(method, params);
  API_CACHE.set(cacheKey, data);
  return data;
}

/**
 * Общая функция для запросов к Last.fm API.
 * @param {string} method - Метод API (например, 'chart.getTopArtists').
 * @param {Object} [params={}] - Дополнительные параметры.
 * @returns {Promise<Object|null>} Ответ API или null при ошибке.
 */
async function fetchLastFM(method, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set('method', method);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  Object.keys(params).forEach(key => url.searchParams.set(key, params[key]));

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('API Error:', error);
    showError('Ошибка загрузки данных. Попробуйте позже.');
    return null;
  }
}

/**
 * Загружает топ-20 исполнителей и рендерит их.
 */
async function loadTopArtists() {
    const data = await fetchWithCache('chart.getTopArtists', { limit: 20 });
    if (!data?.artists?.artist) return;
  
    // Дополнительно загружаем жанры для каждого артиста
    const artistsWithGenres = await Promise.all(
      data.artists.artist.map(async artist => {
        const details = await fetchWithCache('artist.getInfo', { artist: artist.name });
        return {
          ...artist,
          genres: details?.artist?.tags?.tag?.map(t => t.name).slice(0, 3) || []
        };
      })
    );
    renderArtists(artistsWithGenres);
  }
  
  
  /**
   * Загружает топ-10 треков и рендерит их.
   */
  async function loadTopTracks() {
    const data = await fetchWithCache('chart.getTopTracks', { limit: 10 });
    if (!data?.tracks?.track) return;
    renderTracks(data.tracks.track);
  }
  
  /**
   * Рендерит список исполнителей.
   * @param {Array} artists - Массив исполнителей.
   */
  function renderArtists(artists) {
    const container = document.querySelector('.artists');
    container.innerHTML = artists.map(artist => `
      <div class="artist" onclick="openArtistPage('${artist.name}')">
        <strong>${artist.name}</strong>
        <span>${artist.genres.join(' - ') || 'Жанры не указаны'}</span>
      </div>
    `).join('');
  }
  
  /**
   * Рендерит список треков.
   * @param {Array} tracks - Массив треков.
   */
  function renderTracks(tracks) {
    const container = document.querySelector('.tracks');
    container.innerHTML = tracks.map(track => `
      <li onclick="openTrackModal('${track.artist.name}', '${track.name}')">
        <strong>${track.name}</strong>
        <span>${track.artist.name} • ${track.tags?.tag?.map(t => t.name).join(' - ') || 'Жанры не указаны'}</span>
      </li>
    `).join('');
  }
  

  /**
 * Показывает сообщение об ошибке.
 * @param {string} message - Текст ошибки.
 */
function showError(message) {
    const errorEl = document.createElement('div');
    errorEl.className = 'error';
    errorEl.textContent = message;
    document.body.prepend(errorEl);
    setTimeout(() => errorEl.remove(), 3000);
  }

//Инициализация
document.addEventListener('DOMContentLoaded', () => {
    loadTopArtists();
    loadTopTracks();
  
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
  
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') search(searchInput.value.trim());
    });
  
    searchButton.addEventListener('click', () => {
      search(searchInput.value.trim());
    });
});

  /**
 * Ищет артистов или треки по запросу.
 * @param {string} query - Поисковый запрос.
 */
  function showSearchModal(content) {
    const modal = document.getElementById('search-modal');
    const resultsContainer = document.getElementById('search-results');
    
    resultsContainer.innerHTML = content;
    modal.style.display = 'flex';
  
    // Закрытие при клике вне окна
    modal.addEventListener('click', (e) => {
      if (e.target === modal || e.target.classList.contains('close-modal')) {
        modal.style.display = 'none';
      }
    });
  }
  
  async function search(query) {
    if (!query.trim()) return showError('Введите запрос');
  
    const [artistsData, tracksData] = await Promise.all([
      fetchWithCache('artist.search', { artist: query, limit: 5 }),
      fetchWithCache('track.search', { track: query, limit: 5 })
    ]);
  
    const content = `
      <h3>Результаты для "${query}"</h3>
      <div class="search-section">
        <h4>Артисты</h4>
        ${artistsData?.results?.artistmatches?.artist?.length 
          ? artistsData.results.artistmatches.artist.map(artist => `
              <div class="search-item" onclick="openArtistPage('${artist.name}')">
                <strong>${artist.name}</strong>
                <span>${Number(artist.listeners).toLocaleString()} слушателей</span>
              </div>
            `).join('')
          : '<p>Ничего не найдено</p>'
        }
      </div>
      <div class="search-section">
        <h4>Треки</h4>
        ${tracksData?.results?.trackmatches?.track?.length 
          ? tracksData.results.trackmatches.track.map(track => `
              <div class="search-item" onclick="openTrackModal('${track.artist}', '${track.name}')">
                <strong>${track.name}</strong>
                <span>${track.artist} • ${Number(track.listeners).toLocaleString()} слушателей</span>
              </div>
            `).join('')
          : '<p>Ничего не найдено</p>'
        }
      </div>
    `;
  
    showSearchModal(content);
  }
  
  // Обработчик поиска
  document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.querySelector('.search-input');
    const searchButton = document.querySelector('.search-button');
  
    const handleSearch = () => {
      const query = searchInput.value.trim();
      if (query) search(query);
    };
  
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleSearch();
    });
  
    searchButton?.addEventListener('click', handleSearch);
  });

  function openArtistPage(artistName) {
    window.location.href = `artist.html?name=${encodeURIComponent(artistName)}`;
  }
  
  /**
 * Открывает модальное окно с инфой о треке.
 * @param {string} artist - Имя артиста.
 * @param {string} track - Название трека.
 */
window.openTrackModal = async function(artist, track) {
    const url = new URL(API_URL);
    url.searchParams.set("method", "track.getInfo");
    url.searchParams.set("api_key", API_KEY);
    url.searchParams.set("artist", artist);
    url.searchParams.set("track", track);
    url.searchParams.set("format", "json");
    try {
      const res = await fetch(url);
      const data = await res.json();
      const t = data.track;
  
      document.getElementById("modal-track-content").innerHTML = t
        ? `
          <h2>${t.name}</h2>
          <div><strong>Исполнитель:</strong> ${t.artist?.name || artist}</div>
          <div><strong>Альбом:</strong> ${t.album?.title || "Неизвестен"}</div>
          <div style="margin-top:14px; color:#ccc;">${t.wiki?.summary || "Нет описания трека"}</div>
        `
        : `<div>Не удалось загрузить данные о треке</div>`;
      document.getElementById("track-modal").style.display = "flex";
    } catch (e) {
      document.getElementById("modal-track-content").innerHTML = `<div>Ошибка загрузки данных о треке</div>`;
      document.getElementById("track-modal").style.display = "flex";
    }
  };
  
  // Закрытие модального окна по клику на крестик или вне модалки
  document.addEventListener("DOMContentLoaded", () => {
    const modal = document.getElementById("track-modal");
    if (!modal) return;
    modal.querySelector(".close-modal").onclick = () => {
      modal.style.display = "none";
    };
    modal.onclick = (e) => {
      if (e.target === modal) modal.style.display = "none";
    };
  });