import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { TrendingUp } from 'lucide-react';

const PredictionCard = () => {
  const [congestionLevel, setCongestionLevel] = useState(92);

  useEffect(() => {
    const interval = setInterval(() => {
      setCongestionLevel(prev => {
        const change = Math.random() > 0.5 ? 1 : -1;
        const newValue = prev + change;
        return Math.max(85, Math.min(95, newValue));
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 border-glow bg-card space-y-6">
      <div className="flex items-center gap-2 text-primary">
        <TrendingUp className="w-5 h-5" />
        <h3 className="text-xl font-bold uppercase tracking-wider glow-text-cyan">Prediction</h3>
      </div>

      {/* Wave Chart Visualization */}
      <div className="relative h-20 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
          <path
            d="M0,25 Q25,10 50,25 T100,25 T150,25 T200,25"
            fill="none"
            stroke="url(#waveGradient)"
            strokeWidth="2"
            className="animate-pulse-slow"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="50%" stopColor="hsl(var(--primary))" stopOpacity="1" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Congestion Level */}
      <div className="space-y-2">
        <div className="flex justify-between items-baseline">
          <span className="text-muted-foreground text-sm uppercase tracking-wide">Congestion Level</span>
          <span className="text-4xl font-bold text-primary glow-text-cyan">{congestionLevel}%</span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-primary via-accent to-primary transition-all duration-500 glow-cyan"
            style={{ width: `${congestionLevel}%` }}
          />
        </div>
      </div>

      {/* Recommended Departure Delay */}
      <div className="pt-4 border-t border-border">
        <p className="text-muted-foreground text-sm uppercase tracking-wide mb-2">
          Recommended Departure Delay
        </p>
        <p className="text-2xl font-bold text-primary">10 - 15 MIN</p>
      </div>
    </Card>
  );
};

export default PredictionCard;
