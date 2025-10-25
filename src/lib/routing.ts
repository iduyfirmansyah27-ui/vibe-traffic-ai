export interface LatLng {
  lat: number;
  lon: number;
}

export interface RouteGeometry {
  coordinates: [number, number][]; // [lon, lat]
}

export interface RoutingOption {
  profile: 'driving' | 'cycling' | 'foot';
  alternatives?: boolean;
}

export interface RoutingResult {
  name: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry; // GeoJSON LineString-like
  steps: RouteStep[];
}

export interface RouteStep {
  instruction: string;
  distanceMeters: number;
  durationSeconds: number;
  location: [number, number]; // [lon, lat]
}

// Fetch routes from OSRM public demo server
// Note: Public server has rate limits. For production, host your own or use a managed provider.
export async function getRoutesOSRM(origin: LatLng, destination: LatLng, opt: RoutingOption): Promise<RoutingResult[]> {
  const profile = opt.profile ?? 'driving';
  const alternatives = opt.alternatives === false ? 'false' : 'true';
  const coords = `${origin.lon},${origin.lat};${destination.lon},${destination.lat}`;
  const url = `https://router.project-osrm.org/route/v1/${profile}/${coords}?overview=full&geometries=geojson&alternatives=${alternatives}&steps=true&annotations=false`;

  const res = await fetch(url, { headers: { 'Accept': 'application/json' } });
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`);
  const data = await res.json();
  if (data.code !== 'Ok' || !data.routes) throw new Error('Routing response invalid');

  return data.routes.map((r: OSRMRoute, idx: number) => ({
    name: r.legs?.[0]?.summary ? String(r.legs[0].summary) : `Rute ${idx + 1}`,
    distanceMeters: r.distance,
    durationSeconds: r.duration,
    geometry: { coordinates: r.geometry.coordinates },
    steps: extractSteps(r),
  }));
}

interface OSRMManeuver {
  type?: string;
  modifier?: string;
  location?: [number, number];
}

interface OSRMStep {
  distance?: number;
  duration?: number;
  name?: string;
  maneuver?: OSRMManeuver;
}

interface OSRMLeg {
  summary?: string;
  steps?: OSRMStep[];
}

interface OSRMRoute {
  distance: number;
  duration: number;
  geometry: { coordinates: [number, number][] };
  legs?: OSRMLeg[];
}

function extractSteps(route: OSRMRoute): RouteStep[] {
  const steps: RouteStep[] = [];
  if (!route?.legs) return steps;
  for (const leg of route.legs) {
    if (!leg?.steps) continue;
    for (const st of leg.steps) {
      const m: OSRMManeuver = st.maneuver ?? {};
      const type: string = m.type ?? 'continue';
      const modifier: string | undefined = m.modifier;
      const name: string = st.name || '';
      const parts: string[] = [];
      // Simple instruction synthesis
      if (type === 'depart') parts.push('Mulai');
      else if (type === 'arrive') parts.push('Tiba');
      else if (type === 'turn') parts.push('Belok');
      else if (type === 'merge') parts.push('Gabung');
      else if (type === 'roundabout') parts.push('Bundaran');
      else parts.push(type.charAt(0).toUpperCase() + type.slice(1));
      if (modifier) parts.push(modifier);
      if (name) parts.push(`ke ${name}`);
      const instruction = parts.join(' ');
      steps.push({
        instruction,
        distanceMeters: st.distance ?? 0,
        durationSeconds: st.duration ?? 0,
        location: (m.location as [number, number]) ?? [0, 0],
      });
    }
  }
  return steps;
}
