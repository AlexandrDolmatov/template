const API_KEY = '96b91d7d9d3ab377398ec03076a5305e';
const API_URL = 'https://ws.audioscrobbler.com/2.0/';

/**
 * Получить топ-артистов.
 */
export async function fetchTopArtists() {
  const url = new URL(API_URL);
  url.searchParams.set('method', 'chart.getTopArtists');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '20');
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data?.artists?.artist || []).map((a: any) => ({
    name: a.name,
    listeners: a.listeners,
    genres: a.tags?.tag?.map((t: any) => t.name) || [],
  }));
}

/**
 * Получить топ-треки.
 */
export async function fetchTopTracks() {
  const url = new URL(API_URL);
  url.searchParams.set('method', 'chart.getTopTracks');
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '10');
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data?.tracks?.track || []).map((t: any) => ({
    name: t.name,
    artist: { name: t.artist.name },
    listeners: t.listeners,
    tags: t.toptags,
  }));
}

/**
 * Поиск артистов по строке.
 */
export async function searchArtists(query: string) {
  const url = new URL(API_URL);
  url.searchParams.set('method', 'artist.search');
  url.searchParams.set('artist', query);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '7');
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data?.results?.artistmatches?.artist || []).map((a: any) => ({
    name: a.name,
    listeners: a.listeners,
    genres: [],
  }));
}

/**
 * Поиск треков по строке.
 */
export async function searchTracks(query: string) {
  const url = new URL(API_URL);
  url.searchParams.set('method', 'track.search');
  url.searchParams.set('track', query);
  url.searchParams.set('api_key', API_KEY);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '7');
  const res = await fetch(url.toString());
  const data = await res.json();
  return (data?.results?.trackmatches?.track || []).map((t: any) => ({
    name: t.name,
    artist: { name: t.artist },
    listeners: t.listeners,
    tags: [],
  }));
}
