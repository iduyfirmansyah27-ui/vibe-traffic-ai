import { useEffect, useMemo, useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Car, Bike, Clock, TrendingUp, AlertTriangle, CornerDownLeft, CornerDownRight, Flag, MoveRight, GitMerge, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { lazy, Suspense } from 'react';
const MapContainer = lazy(() => import('react-leaflet').then((mod) => ({ default: mod.MapContainer })));
import { TileLayer, useMap, Polyline } from 'react-leaflet';
import type { TileLayerProps } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import ScaleControl from '@/components/map/ScaleControl';

declare module 'leaflet' {
  interface PathOptions {
    color?: string;
    weight?: number;
    opacity?: number;
    dashArray?: string;
    dashOffset?: string;
    fill?: boolean;
    fillColor?: string;
    fillOpacity?: number;
    fillRule?: 'nonzero' | 'evenodd' | 'inherit';
    stroke?: boolean;
    lineCap?: 'butt' | 'round' | 'square' | 'inherit';
    lineJoin?: 'miter' | 'round' | 'bevel' | 'inherit';
    clickable?: boolean;
    pointerEvents?: string;
    className?: string;
  }
}
import { geocode, reverseGeocode } from '@/lib/geocoding';
import { track } from '@/lib/analytics';
import { getRoutesOSRM } from '@/lib/routing';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';

function CircleDot({ center, radius, options }: { center: [number, number]; radius: number; options: L.PathOptions }) {
  const map = useMap();
  useEffect(() => {
    const m = L.circleMarker(L.latLng(center[0], center[1]), { ...options, radius });
    m.addTo(map);
    return () => { try { m.remove(); } catch { void 0; } };
  }, [map, center, radius, options]);
  return null;
}

function FitBounds({ geometries, originCoord, destinationCoord, selectedIndex }: { geometries: [number, number][][]; originCoord: [number, number] | null; destinationCoord: [number, number] | null; selectedIndex: number | null }) {
  const map = useMap();
  useEffect(() => {
    const points: [number, number][] = [];
    if (originCoord) points.push(originCoord);
    if (destinationCoord) points.push(destinationCoord);
    const geoms = selectedIndex !== null && geometries[selectedIndex] ? [geometries[selectedIndex]] : geometries;
    geoms.forEach((g) => {
      g.forEach((p) => points.push(p));
    });
    if (points.length > 0) {
      const bounds = L.latLngBounds(points.map(([lat, lng]) => L.latLng(lat, lng)));
      map.fitBounds(bounds, { padding: [32, 32] });
    }
  }, [geometries, originCoord, destinationCoord, selectedIndex, map]);
  return null;
}

function FollowMarker({ coord, follow }: { coord: [number, number] | null; follow: boolean }) {
  const map = useMap();
  useEffect(() => {
    if (!coord || !follow) return;
    map.panTo(L.latLng(coord[0], coord[1]));
  }, [coord, follow, map]);
  if (!coord) return null;
  return <CircleDot center={coord} radius={8} options={{ color: '#22c55e' }} />;
}

function ZoomController({ zoom }: { zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setZoom(zoom);
  }, [zoom, map]);
  return null;
}

function InvalidateSize({ deps }: { deps: unknown[] }) {
  const map = useMap();
  useEffect(() => {
    const t = setTimeout(() => {
      try { map.invalidateSize(); } catch { void 0; }
    }, 120);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  useEffect(() => {
    const onResize = () => {
      try { map.invalidateSize(); } catch { void 0; }
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [map]);
  return null;
}

function getManeuverIcon(instr: string) {
  const s = instr.toLowerCase();
  if (s.includes('tiba')) return <Flag className="w-4 h-4 text-green-400" />;
  if (s.includes('mulai')) return <MoveRight className="w-4 h-4 text-primary" />;
  if (s.includes('bundaran')) return <RefreshCcw className="w-4 h-4 text-yellow-400" />;
  if (s.includes('gabung')) return <GitMerge className="w-4 h-4 text-blue-400" />;
  if (s.includes('kiri')) return <CornerDownLeft className="w-4 h-4 text-foreground" />;
  if (s.includes('kanan')) return <CornerDownRight className="w-4 h-4 text-foreground" />;
  return <MoveRight className="w-4 h-4 text-muted-foreground" />;
}

type VehicleType = 'car' | 'motorcycle';

interface RouteResult {
  id: number;
  name: string;
  distance: string;
  distanceMeters: number;
  duration: number;
  congestion: number;
  toll: boolean;
  avgSpeed: number;
  waypoints: string[];
}

const RoutePlanner = () => {
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleType, setVehicleType] = useState<VehicleType>('car');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [originCoord, setOriginCoord] = useState<[number, number] | null>(null);
  const [destinationCoord, setDestinationCoord] = useState<[number, number] | null>(null);
  const [geometries, setGeometries] = useState<[number, number][][]>([]);
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null);
  const [routeSteps, setRouteSteps] = useState<{ instruction: string; distanceMeters: number; durationSeconds: number; location: [number, number] }[][]>([]);
  const [navRunning, setNavRunning] = useState(false);
  const [navCoord, setNavCoord] = useState<[number, number] | null>(null);
  const [navPtr, setNavPtr] = useState(0);
  const [navSpeed, setNavSpeed] = useState(2); // points per tick
  const [navTickMs, setNavTickMs] = useState(300);
  const [mapZoom, setMapZoom] = useState(12);
  const [followMap, setFollowMap] = useState(true);
  const [currentStepIdx, setCurrentStepIdx] = useState(0);
  const [fullMap, setFullMap] = useState(false);
  const [tileTheme, setTileTheme] = useState<'light' | 'dark'>('light');
  const [showAlternatives, setShowAlternatives] = useState(true);

  // Cost settings
  const [fuelPrice, setFuelPrice] = useState<number>(14000); // IDR per liter
  const [fuelType, setFuelType] = useState<'pertalite' | 'pertamax' | 'diesel'>('pertalite');
  const [efficiencyCar, setEfficiencyCar] = useState<number>(10); // km per liter
  const [efficiencyMoto, setEfficiencyMoto] = useState<number>(30); // km per liter
  const [tollRatePerKm, setTollRatePerKm] = useState<number>(1000); // IDR per km
  const [useToll, setUseToll] = useState<boolean>(true);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'cashless'>('cashless');
  const [cashlessFeeRate, setCashlessFeeRate] = useState<number>(0); // e.g., 0.01 for 1% fee if any

  // Favorites & History (component level)
  type Place = { label: string; lat: number; lon: number };
  const [favorites, setFavorites] = useState<Place[]>(() => {
    try {
      const raw = localStorage.getItem('vt_favorites');
      return raw ? (JSON.parse(raw) as Place[]) : [];
    } catch { return []; }
  });
  const [history, setHistory] = useState<Place[]>(() => {
    try {
      const raw = localStorage.getItem('vt_history');
      return raw ? (JSON.parse(raw) as Place[]) : [];
    } catch { return []; }
  });
  useEffect(() => { try { localStorage.setItem('vt_favorites', JSON.stringify(favorites)); } catch { void 0; } }, [favorites]);
  useEffect(() => { try { localStorage.setItem('vt_history', JSON.stringify(history.slice(0, 10))); } catch { void 0; } }, [history]);
  function pushHistory(p: Place) {
    setHistory((h) => [p, ...h.filter((x) => x.label !== p.label)].slice(0, 10));
  }

  // Toll dataset
  type TollSegment = { name: string; bbox: { minLat: number; minLon: number; maxLat: number; maxLon: number }; cash: number; cashless: number };
  const [tollSegments, setTollSegments] = useState<TollSegment[]>([]);
  useEffect(() => {
    fetch('/data/toll-segments.json')
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then((j) => setTollSegments(j.segments || []))
      .catch(() => setTollSegments([]));
  }, []);

  // Load/save preferences to localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('vt_prefs');
      if (raw) {
        const p = JSON.parse(raw);
        if (typeof p.fuelPrice === 'number') setFuelPrice(p.fuelPrice);
        if (typeof p.efficiencyCar === 'number') setEfficiencyCar(p.efficiencyCar);
        if (typeof p.efficiencyMoto === 'number') setEfficiencyMoto(p.efficiencyMoto);
        if (typeof p.tollRatePerKm === 'number') setTollRatePerKm(p.tollRatePerKm);
        if (typeof p.useToll === 'boolean') setUseToll(p.useToll);
        if (p.paymentMethod === 'cash' || p.paymentMethod === 'cashless') setPaymentMethod(p.paymentMethod);
        if (p.fuelType === 'pertalite' || p.fuelType === 'pertamax' || p.fuelType === 'diesel') setFuelType(p.fuelType);
        if (p.tileTheme === 'light' || p.tileTheme === 'dark') setTileTheme(p.tileTheme);
      }
    } catch { void 0; }
  }, []);
  useEffect(() => {
    try {
      const payload = { fuelPrice, efficiencyCar, efficiencyMoto, tollRatePerKm, useToll, paymentMethod, fuelType, tileTheme };
      localStorage.setItem('vt_prefs', JSON.stringify(payload));
    } catch { void 0; }
  }, [fuelPrice, efficiencyCar, efficiencyMoto, tollRatePerKm, useToll, paymentMethod, fuelType, tileTheme]);

  useEffect(() => {
    const onToggle = (_e: Event) => setTileTheme((t) => (t === 'light' ? 'dark' : 'light'));
    window.addEventListener('vt_toggle_map_theme', onToggle);
    return () => window.removeEventListener('vt_toggle_map_theme', onToggle);
  }, []);

  // Sync fuelPrice with fuelType defaults (user can still override)
  useEffect(() => {
    const defaults: Record<typeof fuelType, number> = { pertalite: 10000, pertamax: 13500, diesel: 15000 };
    setFuelPrice((prev) => (Math.abs(prev - defaults[fuelType]) < 1 ? prev : defaults[fuelType]));
  }, [fuelType]);

  // Default: set origin to user's location on mount if empty
  useEffect(() => {
    if (origin) return;
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      setOriginCoord([lat, lon]);
      try {
        const rev = await reverseGeocode(lat, lon);
        if (rev) setOrigin(rev.displayName);
      } catch { void 0; }
    });
  }, [origin]);

  const currency = useMemo(() => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }), []);

  function estimateCosts(distanceKm: number) {
    const eff = vehicleType === 'car' ? efficiencyCar : efficiencyMoto;
    const fuelLiters = eff > 0 ? distanceKm / eff : 0;
    const fuelCost = fuelLiters * fuelPrice;
    const tollCost = useToll ? distanceKm * tollRatePerKm : 0;
    const baseTotal = fuelCost + tollCost;
    const methodFee = paymentMethod === 'cashless' ? baseTotal * cashlessFeeRate : 0;
    const total = baseTotal + methodFee;
    return { fuelCost, tollCost, total };
  }

  // Debounce helper
  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');
  useEffect(() => setOriginInput(origin), [origin]);
  useEffect(() => setDestinationInput(destination), [destination]);
  const originDebounced = useDebounce(originInput, 300);
  const destinationDebounced = useDebounce(destinationInput, 300);

  const { data: originSuggestions = [] } = useQuery({
    queryKey: ['geocode', originDebounced],
    queryFn: () => geocode(originDebounced),
    enabled: originDebounced.length >= 3,
    staleTime: 60_000,
  });
  const { data: destinationSuggestions = [] } = useQuery({
    queryKey: ['geocode', destinationDebounced],
    queryFn: () => geocode(destinationDebounced),
    enabled: destinationDebounced.length >= 3,
    staleTime: 60_000,
  });

  const calculateRoutes = async () => {
    if (!origin || !destination) {
      toast.error('Mohon isi kota asal dan tujuan');
      return;
    }

    try {
      setIsCalculating(true);
      toast.success('Menghitung rute terbaik...');
      track('calculate_route', { origin, destination });

      const [og, ds] = await Promise.all([geocode(origin), geocode(destination)]);
      if (!og.length || !ds.length) {
        toast.error('Lokasi asal atau tujuan tidak ditemukan');
        setIsCalculating(false);
        return;
      }
      const og0 = og[0];
      const ds0 = ds[0];
      const ogCoord: [number, number] = [og0.lat, og0.lon];
      const dsCoord: [number, number] = [ds0.lat, ds0.lon];
      setOriginCoord(ogCoord);
      setDestinationCoord(dsCoord);

      const profile = 'driving';
      const results = await getRoutesOSRM({ lat: og0.lat, lon: og0.lon }, { lat: ds0.lat, lon: ds0.lon }, { profile, alternatives: true });

      const mappedRoutes: RouteResult[] = results.map((r, idx) => {
        const km = r.distanceMeters / 1000;
        const hours = r.durationSeconds / 3600;
        const speed = km / (hours || 1e-6);
        let congestion = 0.3;
        if (speed < 20) congestion = 0.8;
        else if (speed < 30) congestion = 0.65;
        else if (speed < 40) congestion = 0.5;
        else congestion = 0.35;
        return {
          id: idx + 1,
          name: r.name || `Rute ${idx + 1}`,
          distance: `${km.toFixed(1)} km`,
          distanceMeters: r.distanceMeters,
          duration: Math.round(r.durationSeconds / 60),
          congestion,
          toll: false,
          avgSpeed: Math.round(speed),
          waypoints: [origin, destination],
        };
      });

      const mappedGeoms: [number, number][][] = results.map((r) => r.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]));
      const mappedSteps = results.map((r) => r.steps.map((s) => ({
        instruction: s.instruction,
        distanceMeters: s.distanceMeters,
        durationSeconds: s.durationSeconds,
        location: [s.location[1], s.location[0]] as [number, number],
      })));

      setRoutes(mappedRoutes);
      setGeometries(mappedGeoms);
      setSelectedRouteIndex(0);
      setRouteSteps(mappedSteps);
      setNavCoord(mappedGeoms[0]?.[0] ?? null);
      setNavPtr(0);
      toast.success('Rute berhasil dihitung!');
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      toast.error(msg || 'Terjadi kesalahan saat menghitung rute');
    } finally {
      setIsCalculating(false);
    }
  };

  const getCongestionColor = (level: number) => {
    if (level >= 0.7) return 'text-destructive';
    if (level >= 0.5) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getCongestionLabel = (level: number) => {
    if (level >= 0.7) return 'Padat';
    if (level >= 0.5) return 'Sedang';
    return 'Lancar';
  };

  // State variables are already declared at the top of the component

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleTheme={() => setTileTheme(prev => prev === 'light' ? 'dark' : 'light')} 
        isDarkMode={tileTheme === 'dark'} 
      />
      
      <main className="container mx-auto px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary glow-text-cyan uppercase tracking-wider mb-2">
            Route Planner
          </h1>
          <p className="text-muted-foreground">
            Temukan rute terbaik dengan prediksi AI berdasarkan kondisi lalu lintas real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Form */}
          {!fullMap && (
          <div className="lg:col-span-1">
            <Card className="p-7 border-glow bg-card space-y-6 sticky top-24">
              <div>
                <h3 className="text-xl font-bold text-primary mb-4 uppercase tracking-wider">
                  Rencana Perjalanan
                </h3>
                
                {/* Origin */}
                <div className="space-y-2 mb-4">
                  <label className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-green-400" />
                    Kota Asal
                  </label>
                  <Input
                    placeholder="Contoh: Jakarta Pusat"
                    value={origin}
                    onChange={(e) => setOrigin(e.target.value)}
                    className="bg-secondary border-primary/30 focus:border-primary"
                  />
                  <div className="flex gap-2">
                    <Button variant="secondary" type="button" onClick={async () => {
                      if (!navigator.geolocation) {
                        toast.error('Geolocation tidak didukung browser');
                        return;
                      }
                      navigator.geolocation.getCurrentPosition(async (pos) => {
                        const lat = pos.coords.latitude;
                        const lon = pos.coords.longitude;
                        setOriginCoord([lat, lon]);
                        const rev = await reverseGeocode(lat, lon);
                        if (rev) setOrigin(rev.displayName);
                        else setOrigin(`${lat.toFixed(5)}, ${lon.toFixed(5)}`);
                        toast.success('Asal di-set ke lokasi Anda');
                      }, () => toast.error('Gagal mendapatkan lokasi'));
                    }}>Asal = Lokasi Saya</Button>
                  </div>
                  {originSuggestions.length > 0 && originDebounced.length >= 3 && (
                    <div className="bg-popover border border-border rounded-md max-h-48 overflow-auto">
                      {originSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                          onClick={() => {
                            setOrigin(s.displayName);
                            setOriginCoord([s.lat, s.lon]);
                          }}
                        >
                          {s.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button type="button" variant="secondary" onClick={() => {
                      if (originCoord) setFavorites((f) => [{ label: origin, lat: originCoord[0], lon: originCoord[1] }, ...f.filter(x => x.label !== origin)].slice(0, 20));
                    }}>Simpan Asal</Button>
                    <Button type="button" variant="secondary" onClick={() => {
                      if (originCoord) pushHistory({ label: origin, lat: originCoord[0], lon: originCoord[1] });
                    }}>Simpan Riwayat</Button>
                  </div>
                  {favorites.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Favorit</p>
                      <div className="flex flex-wrap gap-2">
                        {favorites.slice(0,6).map((f, i) => (
                          <Button key={i} size="sm" variant="secondary" onClick={() => { setOrigin(f.label); setOriginCoord([f.lat, f.lon]); }}> {f.label} </Button>
                        ))}
                      </div>
                    </div>
                  )}
                  {history.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs text-muted-foreground mb-1">Riwayat</p>
                      <div className="flex flex-wrap gap-2">
                        {history.slice(0,6).map((h, i) => (
                          <Button key={i} size="sm" variant="secondary" onClick={() => { setOrigin(h.label); setOriginCoord([h.lat, h.lon]); }}> {h.label} </Button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Destination */}
                <div className="space-y-2 mb-6">
                  <label className="text-sm text-muted-foreground uppercase tracking-wide flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-destructive" />
                    Kota Tujuan
                  </label>
                  <Input
                    placeholder="Contoh: Jakarta Selatan"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="bg-secondary border-primary/30 focus:border-primary"
                  />
                  {destinationSuggestions.length > 0 && destinationDebounced.length >= 3 && (
                    <div className="bg-popover border border-border rounded-md max-h-48 overflow-auto">
                      {destinationSuggestions.map((s, idx) => (
                        <button
                          key={idx}
                          type="button"
                          className="w-full text-left px-3 py-2 hover:bg-secondary text-sm"
                          onClick={() => {
                            setDestination(s.displayName);
                            setDestinationCoord([s.lat, s.lon]);
                          }}
                        >
                          {s.displayName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Vehicle Type */}
                <div className="space-y-3 mb-6">
                  <label className="text-sm text-muted-foreground uppercase tracking-wide">
                    Jenis Kendaraan
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setVehicleType('car')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        vehicleType === 'car'
                          ? 'border-primary bg-primary/20 glow-cyan'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Car className={`w-8 h-8 mx-auto mb-2 ${vehicleType === 'car' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-bold ${vehicleType === 'car' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Mobil
                      </p>
                    </button>
                    <button
                      onClick={() => setVehicleType('motorcycle')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        vehicleType === 'motorcycle'
                          ? 'border-primary bg-primary/20 glow-cyan'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Bike className={`w-8 h-8 mx-auto mb-2 ${vehicleType === 'motorcycle' ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className={`text-sm font-bold ${vehicleType === 'motorcycle' ? 'text-primary' : 'text-muted-foreground'}`}>
                        Motor
                      </p>
                    </button>
                  </div>
                </div>

                {/* Travel Cost Settings */}
                <div className="space-y-3 mb-6">
                  <label className="text-sm text-muted-foreground uppercase tracking-wide">
                    Biaya Perjalanan (Estimasi)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs text-muted-foreground">Jenis BBM</label>
                      <div className="grid grid-cols-3 gap-2">
                        <Button type="button" variant={fuelType==='pertalite'?'default':'secondary'} onClick={()=>setFuelType('pertalite')}>Pertalite</Button>
                        <Button type="button" variant={fuelType==='pertamax'?'default':'secondary'} onClick={()=>setFuelType('pertamax')}>Pertamax</Button>
                        <Button type="button" variant={fuelType==='diesel'?'default':'secondary'} onClick={()=>setFuelType('diesel')}>Diesel</Button>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Harga BBM (IDR/L)</label>
                      <Input type="number" value={fuelPrice} onChange={(e) => setFuelPrice(Number(e.target.value))} className="bg-secondary border-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Efisiensi {vehicleType === 'car' ? 'Mobil' : 'Motor'} (km/L)</label>
                      <Input type="number" value={vehicleType === 'car' ? efficiencyCar : efficiencyMoto} onChange={(e) => {
                        const v = Number(e.target.value);
                        if (vehicleType === 'car') setEfficiencyCar(v); else setEfficiencyMoto(v);
                      }} className="bg-secondary border-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Tarif Tol (IDR/km)</label>
                      <Input type="number" value={tollRatePerKm} onChange={(e) => setTollRatePerKm(Number(e.target.value))} className="bg-secondary border-primary/30 focus:border-primary" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground">Metode Bayar</label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button type="button" variant={paymentMethod === 'cash' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('cash')}>Cash</Button>
                        <Button type="button" variant={paymentMethod === 'cashless' ? 'default' : 'secondary'} onClick={() => setPaymentMethod('cashless')}>Cashless</Button>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center gap-2">
                      <input id="usetoll" type="checkbox" checked={useToll} onChange={(e) => setUseToll(e.target.checked)} />
                      <label htmlFor="usetoll" className="text-xs text-muted-foreground">Lewat Tol</label>
                    </div>
                  </div>
                </div>

                <Button
                  onClick={calculateRoutes}
                  disabled={isCalculating}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                >
                  {isCalculating ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Menghitung...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Navigation className="w-4 h-4" />
                      Hitung Rute
                    </span>
                  )}
                </Button>
              </div>

              {/* Route Summary */}
              {routes.length > 0 && (
                <div className="pt-6 border-t border-border space-y-3">
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    Hasil Pencarian
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Rute</span>
                      <span className="text-sm font-bold text-primary">{routes.length} opsi</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Kendaraan</span>
                      <span className="text-sm font-bold text-foreground capitalize">{vehicleType === 'car' ? 'Mobil' : 'Motor'}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </div>
          )}

          {/* Routes Results */}
          <div className={fullMap ? "lg:col-span-3" : "lg:col-span-2"}>
            {routes.length > 0 && selectedRouteIndex != null && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                {(() => {
                  const r = routes[selectedRouteIndex];
                  const km = r.distanceMeters / 1000;
                  const base = estimateCosts(km);
                  return (
                    <>
                      <div className="p-5 rounded-lg border border-border bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Jarak</p>
                        <p className="text-2xl font-bold text-foreground">{r.distance}</p>
                      </div>
                      <div className="p-5 rounded-lg border border-border bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Durasi</p>
                        <p className="text-2xl font-bold text-foreground">{r.duration} mnt</p>
                      </div>
                      <div className="p-5 rounded-lg border border-border bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Kecepatan</p>
                        <p className="text-2xl font-bold text-foreground">{r.avgSpeed} km/j</p>
                      </div>
                      <div className="p-5 rounded-lg border border-border bg-card">
                        <p className="text-xs text-muted-foreground uppercase tracking-wide">Estimasi Biaya</p>
                        <p className="text-2xl font-bold text-primary">{currency.format(Math.round(base.total))}</p>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
            <Card className="border-glow bg-card mb-6 overflow-hidden relative rounded-xl">
              <div className={fullMap ? "h-[calc(100vh-160px)]" : "h-[580px]"}>
                {/* Banner instruksi langkah berikutnya */}
                {selectedRouteIndex != null && routeSteps[selectedRouteIndex] && routeSteps[selectedRouteIndex][currentStepIdx] && (
                  <div className="absolute z-10 m-2 px-2 py-1 rounded-md bg-black/50 text-foreground text-xs border border-border backdrop-blur">
                    <span className="font-semibold">Arahan berikut:</span>{' '}
                    {routeSteps[selectedRouteIndex][currentStepIdx].instruction}
                  </div>
                )}
                {/* North indicator */}
                <div className="absolute right-2 top-2 z-10 px-2 py-1 rounded-md bg-black/50 text-foreground text-xs border border-border">
                  N
                </div>
                {/* Legend */}
                <div className="absolute left-2 top-2 z-10 rounded-md bg-white/90 text-foreground text-xs border border-border backdrop-blur px-2 py-2 shadow">
                  <div className="font-semibold mb-1">Legenda</div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-2 rounded-sm" style={{ backgroundColor: '#1a73e8' }} />
                    <span>Rute utama</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-4 h-2 rounded-sm border border-muted-foreground" style={{ backgroundColor: '#9aa0a6' }} />
                    <span>Alternatif</span>
                  </div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-block w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#22d3ee', borderColor: '#22d3ee' }} />
                    <span>Asal</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-3 h-3 rounded-full border-2" style={{ backgroundColor: '#ef4444', borderColor: '#ef4444' }} />
                    <span>Tujuan</span>
                  </div>
                </div>
                <div className="h-full w-full relative">
                  <div style={{ height: '100%', width: '100%' }}>
                    <div style={{ height: '100%', width: '100%' }}>
                      <div style={{ height: '100%', width: '100%' }}>
                      <MapContainer 
                        center={[ -6.2, 106.816 ] as [number, number]} 
                        zoom={mapZoom}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                        attributionControl={false}
                      >
                      <InvalidateSize deps={[fullMap, selectedRouteIndex, mapZoom]} />
                      
                      {/* Tile Layer */}
                      {tileTheme === 'light' ? (
                        <TileLayer
                          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                      ) : (
                        <TileLayer
                          url="https://cartodb-basemaps-{s}.global.ssl.fastly.net/dark_all/{z}/{x}/{y}.png"
                        />
                      )}
                      
                      {/* Scale control */}
                      <ScaleControl />
                      
                      {/* Map content */}
                      {originCoord && (
                        <>
                          <CircleDot 
                            center={originCoord} 
                            radius={14} 
                            options={{ 
                              color: '#22d3ee', 
                              fillColor: '#22d3ee', 
                              fillOpacity: 0.2, 
                              opacity: 0.2, 
                              weight: 0 
                            }} 
                          />
                          <CircleDot 
                            center={originCoord} 
                            radius={10} 
                            options={{ 
                              color: '#ffffff', 
                              fillOpacity: 0, 
                              opacity: 1, 
                              weight: 2 
                            }} 
                          />
                          <CircleDot 
                            center={originCoord} 
                            radius={8} 
                            options={{ 
                              color: '#22d3ee', 
                              fillColor: '#22d3ee', 
                              fillOpacity: 0.9, 
                              weight: 2 
                            }} 
                          />
                        </>
                      )}
                      {destinationCoord && (
                        <>
                          <CircleDot 
                            center={destinationCoord} 
                            radius={14} 
                            options={{ 
                              color: '#ef4444', 
                              fillColor: '#ef4444', 
                              fillOpacity: 0.2, 
                              opacity: 0.2, 
                              weight: 0 
                            }} 
                          />
                          <CircleDot 
                            center={destinationCoord} 
                            radius={10} 
                            options={{ 
                              color: '#ffffff', 
                              fillOpacity: 0, 
                              opacity: 1, 
                              weight: 2 
                            }} 
                          />
                          <CircleDot 
                            center={destinationCoord} 
                            radius={8} 
                            options={{ 
                              color: '#ef4444', 
                              fillColor: '#ef4444', 
                              fillOpacity: 0.9, 
                              weight: 2 
                            }} 
                          />
                        </>
                      )}
                      {/* Routes with white underlay and colored stroke */}
                      {(showAlternatives ? geometries : (selectedRouteIndex != null && geometries[selectedRouteIndex] ? [geometries[selectedRouteIndex]] : [])).map((geom, idx) => (
                        <div key={`route-${selectedRouteIndex ?? 0}-${idx}`}>
                          {/* underlay */}
                          <Polyline
                            positions={geom}
                            pathOptions={{ color: '#ffffff', weight: (selectedRouteIndex ?? 0) === idx ? 10 : 8, opacity: 0.7, lineCap: 'round' }}
                          />
                          {/* main stroke */}
                          <Polyline
                            key={`m-${selectedRouteIndex ?? 0}-${idx}`}
                            positions={geom}
                            pathOptions={{
                              color: ((selectedRouteIndex ?? 0) === idx) ? '#1a73e8' : '#9aa0a6',
                              weight: ((selectedRouteIndex ?? 0) === idx) ? 6 : 4,
                              opacity: ((selectedRouteIndex ?? 0) === idx) ? 1 : 0.9,
                              dashArray: ((selectedRouteIndex ?? 0) === idx) ? undefined : '6 8',
                              lineCap: 'round',
                            }}
                          />
                        </div>
                      ))}
                      <FitBounds geometries={geometries} originCoord={originCoord} destinationCoord={destinationCoord} selectedIndex={selectedRouteIndex} />
                      <FollowMarker coord={navCoord} follow={followMap} />
                      <ZoomController zoom={mapZoom} />
                      </MapContainer>
                    </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 border-t border-border">
                  <Button variant={fullMap ? 'default' : 'secondary'} onClick={() => { setFullMap((v) => !v); track('ui_fullscreen_toggle', { fullMap: !fullMap }); }}>
                    {fullMap ? 'Keluar Layar Penuh' : 'Peta Layar Penuh'}
                  </Button>
                  <Button variant="secondary" onClick={() => setMapZoom((z) => Math.min(z + 1, 18))}>Zoom In</Button>
                  <Button variant="secondary" onClick={() => setMapZoom((z) => Math.max(z - 1, 3))}>Zoom Out</Button>
                  <Button variant={tileTheme==='dark'?'default':'secondary'} onClick={()=>{ const next = tileTheme==='light'?'dark':'light'; setTileTheme(next); track('ui_tile_theme', { theme: next }); }}>
                    Tema: {tileTheme==='light'?'Terang':'Gelap'}
                  </Button>
                  <Button variant={showAlternatives ? 'default' : 'secondary'} onClick={() => setShowAlternatives((v) => !v)}>
                    {showAlternatives ? 'Tampilkan Alternatif: ON' : 'Tampilkan Alternatif: OFF'}
                  </Button>
                  <Button variant="secondary" onClick={() => setNavCoord(originCoord || navCoord)}>Recenter</Button>
                  <Button variant={followMap ? 'default' : 'secondary'} onClick={() => { const nv = !followMap; setFollowMap(nv); track('ui_follow_toggle', { follow: nv }); }}>
                    {followMap ? 'Ikuti Peta: ON' : 'Ikuti Peta: OFF'}
                  </Button>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Kecepatan</span>
                    <Button variant={navTickMs === 500 ? 'default' : 'secondary'} onClick={() => setNavTickMs(500)}>Lambat</Button>
                    <Button variant={navTickMs === 300 ? 'default' : 'secondary'} onClick={() => setNavTickMs(300)}>Normal</Button>
                    <Button variant={navTickMs === 100 ? 'default' : 'secondary'} onClick={() => setNavTickMs(100)}>Cepat</Button>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <Button
                      onClick={() => {
                        if (!geometries.length || selectedRouteIndex == null) return;
                        setNavRunning((r) => !r);
                        track('start_navigation', { routeIndex: selectedRouteIndex });
                      }}
                      className="bg-primary text-primary-foreground"
                    >
                      {navRunning ? 'Pause Navigasi' : 'Mulai Navigasi'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        if (!destinationCoord) return;
                        const start = navCoord || originCoord;
                        if (!start) return;
                        try {
                          track('reroute', {});
                          const results = await getRoutesOSRM({ lat: start[0], lon: start[1] }, { lat: destinationCoord[0], lon: destinationCoord[1] }, { profile: 'driving', alternatives: true });
                          const mappedGeoms: [number, number][][] = results.map((r) => r.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]));
                          const mappedSteps = results.map((r) => r.steps.map((s) => ({
                            instruction: s.instruction,
                            distanceMeters: s.distanceMeters,
                            durationSeconds: s.durationSeconds,
                            location: [s.location[1], s.location[0]] as [number, number],
                          })));
                          setGeometries(mappedGeoms);
                          setRouteSteps(mappedSteps);
                          setSelectedRouteIndex(0);
                          setNavPtr(0);
                          setNavCoord(mappedGeoms[0]?.[0] ?? start);
                          toast.success('Rute diperbarui');
                        } catch {
                          toast.error('Gagal melakukan reroute');
                        }
                      }}
                    >
                      Reroute
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setNavRunning(false);
                        setNavPtr(0);
                        setNavCoord(geometries[selectedRouteIndex ?? 0]?.[0] ?? null);
                      }}
                    >
                      Akhiri
                    </Button>
                  </div>
                </div>
              </Card>

              {routes.length === 0 ? (
                <Card className="p-12 border-glow bg-card text-center">
                  <Navigation className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-xl font-bold text-muted-foreground mb-2">
                    Belum Ada Rute
                  </h3>
                  <p className="text-muted-foreground">
                    Masukkan kota asal dan tujuan, lalu klik tombol "Hitung Rute"
                  </p>
                </Card>
              ) : (
                <div className="space-y-4">
                  {routes.map((route, index) => (
                    <Card
                      key={route.id}
                      className="p-6 border-glow bg-card hover:bg-secondary/30 transition-all group"
                      onMouseEnter={() => setSelectedRouteIndex(index)}
                      onClick={() => setSelectedRouteIndex(index)}
                    >
                      <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-sm">
                                {index + 1}
                              </span>
                              <h3 className="text-lg font-bold text-primary group-hover:glow-text-cyan transition-all">
                                {route.name}
                              </h3>
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {route.waypoints.join(' → ')}
                            </p>
                          </div>
                          {route.toll && (
                            <span className="px-3 py-1 rounded-full bg-yellow-400/20 border border-yellow-400 text-yellow-400 text-xs font-bold uppercase">
                              Tol
                            </span>
                          )}
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              Waktu
                            </p>
                            <p className="text-2xl font-bold text-primary">{route.duration}</p>
                            <p className="text-xs text-muted-foreground">menit</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <Navigation className="w-3 h-3" />
                              Jarak
                            </p>
                            <p className="text-2xl font-bold text-foreground">{route.distance}</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              Kecepatan
                            </p>
                            <p className="text-2xl font-bold text-foreground">{route.avgSpeed}</p>
                            <p className="text-xs text-muted-foreground">km/jam</p>
                          </div>

                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" />
                              Kemacetan
                            </p>
                            <p className={`text-2xl font-bold ${getCongestionColor(route.congestion)}`}>
                              {getCongestionLabel(route.congestion)}
                            </p>
                            <p className="text-xs text-muted-foreground">{(route.congestion * 100).toFixed(0)}%</p>
                          </div>
                        </div>

                        {/* Cost Estimation */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {(() => {
                            const km = route.distanceMeters / 1000;
                            // Toll override by bbox hits
                            let tollOverride = 0;
                            const geom = geometries[index] || [];
                            if (useToll && tollSegments.length && geom.length) {
                              const used = new Set<number>();
                              for (const p of geom) {
                                for (let si = 0; si < tollSegments.length; si++) {
                                  if (used.has(si)) continue;
                                  const s = tollSegments[si];
                                  if (p[0] >= s.bbox.minLat && p[0] <= s.bbox.maxLat && p[1] >= s.bbox.minLon && p[1] <= s.bbox.maxLon) {
                                    tollOverride += paymentMethod === 'cashless' ? s.cashless : s.cash;
                                    used.add(si);
                                  }
                                }
                              }
                            }
                            const base = estimateCosts(km);
                            const tollCost = tollOverride > 0 ? tollOverride : base.tollCost;
                            const total = base.fuelCost + tollCost + (paymentMethod === 'cashless' ? (base.fuelCost + tollCost) * cashlessFeeRate : 0);
                            const fuelCost = base.fuelCost;
                            return (
                              <>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Biaya BBM</p>
                                  <p className="text-lg font-bold text-foreground">{currency.format(Math.round(fuelCost))}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Biaya Tol ({paymentMethod})</p>
                                  <p className="text-lg font-bold text-foreground">{currency.format(Math.round(tollCost))}</p>
                                </div>
                                <div className="space-y-1">
                                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Estimasi</p>
                                  <p className="text-lg font-bold text-primary">{currency.format(Math.round(total))}</p>
                                </div>
                              </>
                            );
                          })()}
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2">
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>Tingkat Kepadatan</span>
                            <span>{(route.congestion * 100).toFixed(0)}%</span>
                          </div>
                          <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                            <div 
                              className={`h-full transition-all ${
                                route.congestion >= 0.7 ? 'bg-destructive' : 
                                route.congestion >= 0.5 ? 'bg-yellow-400' : 
                                'bg-green-400'
                              }`}
                              style={{ width: `${route.congestion * 100}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button 
                          className="w-full bg-secondary hover:bg-primary hover:text-primary-foreground border border-primary/30 hover:border-primary transition-all"
                          onClick={() => {
                            setSelectedRouteIndex(index);
                            setNavPtr(0);
                            setNavCoord(geometries[index]?.[0] ?? null);
                            setNavRunning(true);
                            toast.success(`Navigasi dimulai: ${route.name}`);
                          }}
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Mulai Navigasi
                        </Button>

                        {/* Directions List */}
                        {selectedRouteIndex === index && routeSteps[index] && (
                          <div className="mt-2 border-t border-border pt-3 max-h-48 overflow-auto text-sm">
                            {routeSteps[index].map((st, i) => {
                              const active = i === currentStepIdx && selectedRouteIndex === index;
                              const icon = getManeuverIcon(st.instruction);
                              return (
                                <div key={i} className={`flex items-start gap-2 py-1 ${active ? 'bg-secondary/40 rounded-md px-2' : ''}`}>
                                  <span className="text-muted-foreground w-4 text-right">{i + 1}.</span>
                                  <span className="mt-0.5">{icon}</span>
                                  <span className="flex-1">
                                    {st.instruction}
                                    <span className="text-muted-foreground ml-2">({(st.distanceMeters / 1000).toFixed(1)} km)</span>
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoutePlanner;
