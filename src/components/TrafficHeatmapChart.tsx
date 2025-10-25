import { Card } from './ui/card';
import { BarChart3 } from 'lucide-react';
import { useEffect, useState } from 'react';

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

  return (
    <Card className="p-6 border-glow bg-card space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <BarChart3 className="w-5 h-5" />
        <h3 className="text-xl font-bold uppercase tracking-wider glow-text-cyan">Traffic Heatmap</h3>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((value, index) => (
          <div
            key={index}
            className="flex-1 relative group"
          >
            <div
              className="w-full bg-gradient-to-t from-primary via-accent to-primary rounded-t transition-all duration-500 hover:opacity-80 glow-cyan"
              style={{ 
                height: `${(value / maxValue) * 100}%`,
                minHeight: '10%'
              }}
            >
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-card border border-primary px-2 py-1 rounded text-xs whitespace-nowrap">
                {Math.round(value)}%
              </div>
            </div>
          </div>
        ))}
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
