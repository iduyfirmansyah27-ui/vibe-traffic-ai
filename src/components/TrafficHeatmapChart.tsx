import { Card } from './ui/card';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const TrafficHeatmapChart = () => {
  const [data, setData] = useState([45, 65, 80, 55, 90, 75, 60, 85, 70, 50, 65, 55]);

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => prev.map(val => {
        const change = Math.random() * 20 - 10;
        return Math.max(30, Math.min(100, val + change));
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const maxValue = Math.max(...data);

  // Get color based on traffic percentage
  const getTrafficColor = (value: number) => {
    if (value < 40) return 'from-[hsl(148,75%,66%)] to-[hsl(148,75%,76%)]';
    if (value < 70) return 'from-[hsl(50,100%,52%)] to-[hsl(50,100%,62%)]';
    return 'from-[hsl(0,100%,61%)] to-[hsl(0,100%,71%)]';
  };

  // Get glow color based on traffic percentage
  const getGlowClass = (value: number) => {
    if (value < 40) return 'shadow-[0_0_15px_rgba(91,229,149,0.6)]';
    if (value < 70) return 'shadow-[0_0_15px_rgba(255,214,10,0.6)]';
    return 'shadow-[0_0_15px_rgba(255,76,76,0.6)]';
  };

  return (
    <Card className="p-6 border-glow bg-card/50 backdrop-blur-sm space-y-4 card-gradient">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary">
          <BarChart3 className="w-5 h-5" />
        </div>
        <h3 className="text-xl font-bold text-foreground/90">Traffic Heatmap</h3>
      </div>

      <div className="flex items-end justify-between gap-1.5 h-40">
        {data.map((value, index) => {
          const height = Math.max(10, (value / maxValue) * 100);
          const colorClass = getTrafficColor(value);
          const glowClass = getGlowClass(value);
          
          return (
            <div key={index} className="flex-1 relative group">
              <div
                className={cn(
                  'w-full rounded-t transition-all duration-700 hover:opacity-90',
                  `bg-gradient-to-t ${colorClass}`,
                  glowClass
                )}
                style={{
                  height: `${height}%`,
                  minHeight: '10%',
                  transition: 'height 0.7s ease-in-out, opacity 0.2s ease',
                }}
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-background/90 backdrop-blur-sm border border-border px-2 py-1 rounded-md text-xs font-medium text-foreground shadow-lg">
                  {Math.round(value)}% traffic
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>24:00</span>
      </div>
    </Card>
  );
};

export default TrafficHeatmapChart;
