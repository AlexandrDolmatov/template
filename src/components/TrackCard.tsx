import React from 'react';

interface Track {
  name: string;
  artist: { name: string };
  listeners?: string;
  tags?: { tag: { name: string }[] };
}

interface TrackCardProps {
  track: Track;
  onClick: () => void;
}

/**
 * Карточка трека в чарте или поиске.
 */
const TrackCard: React.FC<TrackCardProps> = ({ track, onClick }) => {
  return (
    <li className="track-list-item" onClick={onClick} style={{ listStyle: 'none' }}>
      <strong>{track.name}</strong>
      <span>
        {track.artist.name}
        {track.tags?.tag?.length
          ? ` • ${track.tags.tag.map(t => t.name).join(' - ')}`
          : ''}
      </span>
    </li>
  );
};

export default TrackCard;