import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Artist {
  name: string;
  listeners?: string;
  genres?: string[];
}

interface ArtistCardProps {
  artist: Artist;
}

/**
 * Карточка исполнителя в списке.
 */
const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/artist/${encodeURIComponent(artist.name)}`);
  };

  return (
    <div className="artist" onClick={handleClick}>
      <strong>{artist.name}</strong>
      <span>{artist.genres && artist.genres.length
        ? artist.genres.join(' - ')
        : 'Жанры не указаны'}</span>
    </div>
  );
};

export default ArtistCard;