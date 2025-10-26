import { StatCard } from '@/components/ui/StatCard';

interface TrafficData {
  totalVehicles: number;
  congestion: number;
  avgSpeed: number;
  incidents: number;
}

interface TrafficStatsProps {
  data: TrafficData;
  className?: string;
}

export const TrafficStats = ({ data, className = '' }: TrafficStatsProps) => {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      <StatCard
        title="Total Kendaraan"
        value={data.totalVehicles.toLocaleString()}
        icon="🚗"
        trend={data.totalVehicles > 1000 ? 'up' : 'down'}
        trendValue={`${Math.floor(Math.random() * 10) + 1}% dari kemarin`}
      />
      <StatCard
        title="Tingkat Kemacetan"
        value={`${data.congestion}%`}
        icon="🚦"
        trend={data.congestion > 50 ? 'up' : 'down'}
        trendValue={`${data.congestion > 50 ? 'Naik' : 'Turun'} ${Math.floor(Math.random() * 10) + 1}%`}
      />
      <StatCard
        title="Kecepatan Rata-rata"
        value={`${data.avgSpeed} km/jam`}
        icon="⏱️"
        trend={data.avgSpeed > 30 ? 'up' : 'down'}
        trendValue={`${data.avgSpeed > 30 ? 'Naik' : 'Turun'} ${Math.floor(Math.random() * 5) + 1}%`}
      />
      <StatCard
        title="Insiden"
        value={data.incidents}
        icon="⚠️"
        trend={data.incidents > 5 ? 'up' : 'down'}
        trendValue={`${data.incidents > 5 ? 'Naik' : 'Turun'} ${Math.floor(Math.random() * 15) + 5}%`}
      />
    </div>
  );
};

export default TrafficStats;
