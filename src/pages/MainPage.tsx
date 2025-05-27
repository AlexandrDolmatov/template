import React, { useState, useEffect } from 'react';
import { fetchTopArtists, fetchTopTracks, searchArtists, searchTracks } from '../utils/api';
import ArtistCard from '../components/ArtistCard';
import TrackCard from '../components/TrackCard';
import TrackModal from '../components/TrackModal';
import SearchBar from '../components/SearchBar';

const MainPage: React.FC = () => {
  // Основные состояния
  const [artists, setArtists] = useState<any[]>([]);
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Состояния поиска и модального окна поиска
  const [searchResults, setSearchResults] = useState<{ artists: any[], tracks: any[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Состояние модалки по треку
  const [modalTrack, setModalTrack] = useState<{ artist: string; track: string } | null>(null);

  // Загружаем топ-артистов и треки при монтировании страницы
  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetchTopArtists(), 
      fetchTopTracks() 
    ])
      .then(([artistsData, tracksData]) => {
        setArtists(artistsData);
        setTracks(tracksData);
        setError(null);
      })
      .catch(() => setError('Ошибка загрузки данных, попробуйте позже.'))
      .finally(() => setLoading(false));
  }, []);

  /**
   * Обрабатывает поиск артистов и треков.
   * @param query Строка поиска
   */
  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults(null);
      setSearchQuery('');
      return;
    }
    setLoading(true);
    setSearchQuery(query);
    try {
      const [artistsData, tracksData] = await Promise.all([
        searchArtists(query),
        searchTracks(query)
      ]);
      setSearchResults({ artists: artistsData, tracks: tracksData });
      setError(null);
      setIsSearchModalOpen(true); // Открыть модалку после поиска
    } catch (e) {
      setError('Ошибка поиска. Попробуйте позже.');
      setIsSearchModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  // Закрытие модалки поиска
  const closeSearchModal = () => {
    setIsSearchModalOpen(false);
    setSearchResults(null);
    setSearchQuery('');
  };

  return (
    <div className="container">
      <SearchBar onSearch={handleSearch} />
      {error && !isSearchModalOpen && <div className="error">{error}</div>}

      {/* Модалка поиска поверх основного контента */}
      <div className={`search-modal-overlay${isSearchModalOpen ? " open" : ""}`}>
        {isSearchModalOpen && (
          <div
            className="modal search-modal"
            style={{ background: "none", boxShadow: "none", position: "fixed", zIndex: 1100 }}
            onClick={e => {
              if (e.target === e.currentTarget) closeSearchModal();
            }}
          >
            <div className="modal-content search-modal-content" style={{ maxWidth: 740 }}>
              <span className="close-modal" onClick={closeSearchModal}>&times;</span>
              <div className="search-results">
                <h2>Результаты поиска для "{searchQuery}"</h2>
                <div className="search-section">
                  <h3>Артисты</h3>
                  <div className="artists search-artists">
                    {searchResults?.artists.length
                      ? searchResults.artists.map(artist => (
                          <ArtistCard key={artist.name} artist={artist} />
                        ))
                      : <div style={{ color: '#b3b3b3', padding: '16px 0' }}>Ничего не найдено</div>
                    }
                  </div>
                </div>
                <div className="search-section">
                  <h3>Треки</h3>
                  <div className="tracks search-tracks">
                    {searchResults?.tracks.length
                      ? searchResults.tracks.map(track => (
                          <TrackCard
                            key={track.name + track.artist.name}
                            track={track}
                            onClick={() => setModalTrack({ artist: track.artist.name, track: track.name })}
                          />
                        ))
                      : <div style={{ color: '#b3b3b3', padding: '16px 0' }}>Ничего не найдено</div>
                    }
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Блоки чарта (главная страница) */}
      {!isSearchModalOpen && (
        <>
          <section>
            <h2>Популярные исполнители</h2>
            {loading ? <div>Загрузка...</div> : (
              <div className="artists">
                {artists.map(artist => (
                  <ArtistCard key={artist.name} artist={artist} />
                ))}
              </div>
            )}
          </section>
          <section>
            <h3>Популярные треки</h3>
            {loading ? <div>Загрузка...</div> : (
              <ul className="tracks">
                {tracks.map(track => (
                  <TrackCard
                    key={track.name + track.artist.name}
                    track={track}
                    onClick={() => setModalTrack({ artist: track.artist.name, track: track.name })}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      {/* Модалка трека */}
      {modalTrack && (
        <TrackModal
          artist={modalTrack.artist}
          track={modalTrack.track}
          onClose={() => setModalTrack(null)}
        />
      )}
    </div>
  );
};

export default MainPage;
