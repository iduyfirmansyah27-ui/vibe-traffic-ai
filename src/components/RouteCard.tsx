import { Card } from './ui/card';
import { Navigation } from 'lucide-react';

interface RouteCardProps {
  routeNumber: number;
  routeName: string;
  duration: number;
  congestionScore: number;
}

const RouteCard = ({ routeNumber, routeName, duration, congestionScore }: RouteCardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 0.7) return 'text-destructive';
    if (score >= 0.4) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <Card className="p-4 border-glow bg-card hover:bg-secondary/50 transition-all cursor-pointer group">
      <div className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <h4 className="text-lg font-bold text-primary group-hover:glow-text-cyan transition-all">
              Route {routeNumber}
            </h4>
            <p className="text-sm text-muted-foreground">{routeName}</p>
          </div>
          <Navigation className="w-5 h-5 text-primary" />
        </div>
        
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-bold text-primary">{duration}</span>
          <span className="text-muted-foreground">menit</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground uppercase tracking-wide">Congestion</span>
          <span className={`font-bold ${getScoreColor(congestionScore)}`}>
            {congestionScore.toFixed(1)}
          </span>
        </div>

        <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
          <div 
            className={`h-full transition-all ${
              congestionScore >= 0.7 ? 'bg-destructive' : 
              congestionScore >= 0.4 ? 'bg-yellow-400' : 
              'bg-green-400'
            }`}
            style={{ width: `${congestionScore * 100}%` }}
          />
        </div>
      </div>
    </Card>
  );
};

export default RouteCard;
