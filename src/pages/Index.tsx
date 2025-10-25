import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import TrafficMap from '@/components/TrafficMap';
import PredictionCard from '@/components/PredictionCard';
import RouteCard from '@/components/RouteCard';
import TrafficHeatmapChart from '@/components/TrafficHeatmapChart';
import { Activity, MapPin } from 'lucide-react';

const Index = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const routes = [
    { number: 1, name: 'Via Jalan Sudirman', duration: 32, congestionScore: 0.8 },
    { number: 2, name: 'Via Jalan Kuningan', duration: 29, congestionScore: 0.4 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Status Bar */}
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg border-glow bg-card">
          <div className="flex items-center gap-3">
            <Activity className="w-5 h-5 text-primary animate-pulse" />
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">System Status</p>
              <p className="text-primary font-bold">AI Model Active</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide">Location</p>
              <p className="text-foreground font-bold">Jakarta Sudirman</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Local Time</p>
            <p className="text-foreground font-bold font-mono">
              {currentTime.toLocaleTimeString('id-ID')}
            </p>
          </div>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Map */}
          <div className="lg:col-span-2 space-y-6">
            <div className="h-[400px]">
              <TrafficMap />
            </div>

            {/* Recommended Routes */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold text-primary uppercase tracking-wider glow-text-cyan">
                Recommended Routes
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {routes.map(route => (
                  <RouteCard
                    key={route.number}
                    routeNumber={route.number}
                    routeName={route.name}
                    duration={route.duration}
                    congestionScore={route.congestionScore}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Prediction & Analytics */}
          <div className="space-y-6">
            <PredictionCard />
            <TrafficHeatmapChart />
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-lg border-glow bg-card text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Vehicles Detected</p>
            <p className="text-4xl font-bold text-primary glow-text-cyan">1,247</p>
            <p className="text-xs text-muted-foreground">Last 5 minutes</p>
          </div>

          <div className="p-6 rounded-lg border-glow bg-card text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Average Speed</p>
            <p className="text-4xl font-bold text-primary glow-text-cyan">23 km/h</p>
            <p className="text-xs text-muted-foreground">Current average</p>
          </div>

          <div className="p-6 rounded-lg border-glow bg-card text-center space-y-2">
            <p className="text-sm text-muted-foreground uppercase tracking-wide">Prediction Accuracy</p>
            <p className="text-4xl font-bold text-primary glow-text-cyan">94.7%</p>
            <p className="text-xs text-muted-foreground">Model confidence</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p className="uppercase tracking-wider">
            VibeTraffic AI • Real-time Traffic Intelligence System
          </p>
          <p className="mt-2 text-xs">
            Powered by Computer Vision & Machine Learning
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
