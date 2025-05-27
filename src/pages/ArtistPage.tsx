import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import TrackModal from '../components/TrackModal';

interface ArtistInfo {
  name: string;
  stats?: { listeners?: string };
  tags?: { tag: { name: string }[] };
  image?: { size: string; ['#text']: string }[];
  bio?: { content: string };
}

interface Track {
  name: string;
  artist: { name: string };
  listeners?: string;
}

interface SimilarArtist {
  name: string;
  image?: { size: string; ['#text']: string }[];
}

type Tab = 'tracks' | 'similar' | 'bio';

/**
 * Страница артиста: детали, вкладки, треки, похожие.
 */
const ArtistPage: React.FC = () => {
  const { name } = useParams<{ name: string }>();
  const navigate = useNavigate();

  const [artist, setArtist] = useState<ArtistInfo | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);
  const [similar, setSimilar] = useState<SimilarArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>('tracks');
  const [modalTrack, setModalTrack] = useState<{ artist: string; track: string } | null>(null);

  useEffect(() => {
    if (!name) return;
    setLoading(true);
    setError(null);
    Promise.all([
      // artist.getInfo
      fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getInfo&api_key=96b91d7d9d3ab377398ec03076a5305e&artist=${encodeURIComponent(name)}&format=json`)
        .then(res => res.json())
        .then(data => data.artist),
      // artist.getTopTracks
      fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getTopTracks&api_key=96b91d7d9d3ab377398ec03076a5305e&artist=${encodeURIComponent(name)}&limit=10&format=json`)
        .then(res => res.json())
        .then(data => data.toptracks?.track || []),
      // artist.getSimilar
      fetch(`https://ws.audioscrobbler.com/2.0/?method=artist.getSimilar&api_key=96b91d7d9d3ab377398ec03076a5305e&artist=${encodeURIComponent(name)}&limit=8&format=json`)
        .then(res => res.json())
        .then(data => data.similarartists?.artist || []),
    ])
      .then(([artistData, tracksData, similarData]) => {
        setArtist(artistData);
        setTracks(tracksData);
        setSimilar(similarData);
      })
      .catch(() => setError('Ошибка загрузки данных артиста'))
      .finally(() => setLoading(false));
  }, [name]);

  if (loading) return <div style={{ padding: 40 }}>Загрузка...</div>;
  if (error || !artist) return <div className="error">{error || 'Артист не найден'}</div>;

  // Данные для шапки
  const cover = artist.image?.find(img => img.size === 'extralarge')?.['#text'] || '';
  const genres = (artist.tags?.tag || []).slice(0, 3).map(t => t.name).join(', ');
  const listeners = artist.stats?.listeners
    ? Number(artist.stats.listeners).toLocaleString()
    : '';

  return (
    <div className="artist-page">
      <div className="artist-header" style={{
        background: cover
          ? `linear-gradient(180deg, rgba(0,0,0,0.7) 0%, #121212 90%), url('${cover}') center/cover`
          : "#222"
      }}>
        <button className="back-button" onClick={() => navigate(-1)}>&larr;</button>
        <div className="artist-cover">
          {cover && <img src={cover} alt={artist.name} />}
        </div>
        <div className="artist-info">
          <h1 className="artist-name">{artist.name}</h1>
          <div className="artist-listeners">{listeners} слушателей</div>
          <div className="artist-genres">{genres}</div>
        </div>
      </div>
      <div className="artist-tabs">
        <button
          className={`tab${tab === 'tracks' ? ' active' : ''}`}
          onClick={() => setTab('tracks')}
        >
          Треки
        </button>
        <button
          className={`tab${tab === 'similar' ? ' active' : ''}`}
          onClick={() => setTab('similar')}
        >
          Похожие
        </button>
        <button
          className={`tab${tab === 'bio' ? ' active' : ''}`}
          onClick={() => setTab('bio')}
        >
          Биография
        </button>
      </div>
      <div className="artist-content">
        {tab === 'tracks' && (
          <ul className="track-list">
            {tracks.map(track => (
              <li
                key={track.name}
                style={{ cursor: 'pointer' }}
                onClick={() => setModalTrack({ artist: artist.name, track: track.name })}
              >
                <span style={{ fontWeight: 'bold' }}>{track.name}</span>
                <span>{artist.name}</span>
                <span style={{ color: '#b3b3b3', fontSize: '0.9em' }}>
                  {track.listeners && Number(track.listeners).toLocaleString()} слушателей
                </span>
              </li>
            ))}
          </ul>
        )}
        {tab === 'similar' && (
          <div className="artists-grid">
            {similar.map(a => {
              const simg = a.image?.find(img => img.size === "large")?.['#text'] || "";
              return (
                <div
                  className="related-artist"
                  key={a.name}
                  onClick={() => navigate(`/artist/${encodeURIComponent(a.name)}`)}
                >
                  {simg && <img src={simg} alt={a.name} />}
                  <div>{a.name}</div>
                </div>
              );
            })}
          </div>
        )}
        {tab === 'bio' && (
          <div style={{ color: '#eee', lineHeight: 1.7 }}>
            {artist.bio?.content
              ? <span dangerouslySetInnerHTML={{ __html: artist.bio.content }} />
              : 'Нет биографии'}
          </div>
        )}
      </div>
      {/* Модалка для трека */}
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

export default ArtistPage;
