import React, { useEffect, useState } from 'react';

/**
 * Пропсы для модального окна трека.
 */
interface TrackModalProps {
  artist: string;
  track: string;
  onClose: () => void;
}

/**
 * Тип для данных о треке, получаемых из API.
 */
interface TrackInfo {
  name: string;
  artist: { name: string } | string;
  album?: { title: string };
  wiki?: { summary: string };
}

/**
 * Модальное окно для информации о треке.
 */
const TrackModal: React.FC<TrackModalProps> = ({ artist, track, onClose }) => {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);

    // Запрос к API Last.fm
    fetch(`https://ws.audioscrobbler.com/2.0/?method=track.getInfo&api_key=96b91d7d9d3ab377398ec03076a5305e&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(track)}&format=json`)
      .then(res => res.json())
      .then(data => {
        if (!isMounted) return;
        if (data.track) {
          setTrackInfo(data.track);
        } else {
          setError('Не удалось загрузить данные о треке');
        }
      })
      .catch(() => setError('Ошибка загрузки данных о треке'))
      .finally(() => isMounted && setLoading(false));
    return () => { isMounted = false; };
  }, [artist, track]);

  // Обработчик закрытия при клике вне модалки
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const modal = document.getElementById('track-modal');
      if (modal && e.target === modal) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [onClose]);

  return (
    <div className="modal" id="track-modal" style={{ display: 'flex' }}>
      <div className="modal-content">
        <span className="close-modal" onClick={onClose}>&times;</span>
        {loading && <div>Загрузка...</div>}
        {error && <div className="error">{error}</div>}
        {!loading && !error && trackInfo && (
          <>
            <h2>{trackInfo.name}</h2>
            <div><strong>Исполнитель:</strong> {typeof trackInfo.artist === 'string' ? trackInfo.artist : trackInfo.artist.name}</div>
            <div><strong>Альбом:</strong> {trackInfo.album?.title || 'Неизвестен'}</div>
            <div style={{ marginTop: 14, color: '#ccc' }}>
              {trackInfo.wiki?.summary
                ? <span dangerouslySetInnerHTML={{ __html: trackInfo.wiki.summary }} />
                : 'Нет описания трека'}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default TrackModal;
