export interface GeocodingResult {
  displayName: string;
  lat: number;
  lon: number;
}

// Simple geocoding via Nominatim (OpenStreetMap)
// Note: Respect usage policy. For production, add proper User-Agent and optional proxy.
export async function geocode(query: string): Promise<GeocodingResult[]> {
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('addressdetails', '1');
  url.searchParams.set('limit', '5');

  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      // Minimal UA; customize in production
      'User-Agent': 'vibe-traffic-ai/1.0 (demo)'
    },
  });
  if (!res.ok) throw new Error(`Geocoding failed: ${res.status}`);
  const data = (await res.json()) as Array<{ display_name: string; lat: string; lon: string }>;
  return data.map((d) => ({ displayName: d.display_name, lat: parseFloat(d.lat), lon: parseFloat(d.lon) }));
}

export async function reverseGeocode(lat: number, lon: number): Promise<GeocodingResult | null> {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'json');
  url.searchParams.set('zoom', '14');
  const res = await fetch(url.toString(), {
    headers: {
      'Accept': 'application/json',
      'User-Agent': 'vibe-traffic-ai/1.0 (demo)'
    },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.display_name) return null;
  return { displayName: data.display_name as string, lat, lon };
}
