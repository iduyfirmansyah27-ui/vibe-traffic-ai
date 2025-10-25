import { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Navigation, Car, Bike, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type VehicleType = 'car' | 'motorcycle';

interface RouteResult {
  id: number;
  name: string;
  distance: string;
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

  const calculateRoutes = () => {
    if (!origin || !destination) {
      toast.error('Mohon isi kota asal dan tujuan');
      return;
    }

    setIsCalculating(true);
    toast.success('Menghitung rute terbaik...');

    // Simulate route calculation
    setTimeout(() => {
      const mockRoutes: RouteResult[] = [
        {
          id: 1,
          name: 'Rute Tol Dalam Kota (Tercepat)',
          distance: '24.5 km',
          duration: vehicleType === 'motorcycle' ? 28 : 32,
          congestion: 0.45,
          toll: true,
          avgSpeed: 45,
          waypoints: ['Gatot Subroto', 'Semanggi', 'Kuningan']
        },
        {
          id: 2,
          name: 'Rute Sudirman (Ekonomis)',
          distance: '26.8 km',
          duration: vehicleType === 'motorcycle' ? 35 : 42,
          congestion: 0.72,
          toll: false,
          avgSpeed: 38,
          waypoints: ['Sudirman', 'Thamrin', 'Menteng']
        },
        {
          id: 3,
          name: 'Rute Alternatif Casablanca',
          distance: '22.3 km',
          duration: vehicleType === 'motorcycle' ? 30 : 38,
          congestion: 0.58,
          toll: false,
          avgSpeed: 42,
          waypoints: ['Casablanca', 'Rasuna Said', 'Satrio']
        }
      ];

      setRoutes(mockRoutes);
      setIsCalculating(false);
      toast.success('Rute berhasil dihitung!');
    }, 2000);
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary glow-text-cyan uppercase tracking-wider mb-2">
            Route Planner
          </h1>
          <p className="text-muted-foreground">
            Temukan rute terbaik dengan prediksi AI berdasarkan kondisi lalu lintas real-time
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Input Form */}
          <div className="lg:col-span-1">
            <Card className="p-6 border-glow bg-card space-y-6 sticky top-24">
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

          {/* Routes Results */}
          <div className="lg:col-span-2">
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
                  <Card key={route.id} className="p-6 border-glow bg-card hover:bg-secondary/30 transition-all group">
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
                        onClick={() => toast.success(`Navigasi dimulai: ${route.name}`)}
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Mulai Navigasi
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default RoutePlanner;
