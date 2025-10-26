import { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, Clock, MapPin, AlertTriangle, Users } from 'lucide-react';
import TrafficHeatmapChart from '@/components/TrafficHeatmapChart';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month'>('today');

  const topCongestionAreas = [
    { name: 'Jl. Sudirman - Jakarta Pusat', level: 94, vehicles: 1847, trend: '+12%' },
    { name: 'Jl. Gatot Subroto - Jakarta Selatan', level: 89, vehicles: 1623, trend: '+8%' },
    { name: 'Jl. Thamrin - Jakarta Pusat', level: 86, vehicles: 1534, trend: '+5%' },
    { name: 'Jl. Kuningan - Jakarta Selatan', level: 82, vehicles: 1421, trend: '+3%' },
    { name: 'Jl. Casablanca - Jakarta Selatan', level: 78, vehicles: 1298, trend: '-2%' },
  ];

  const peakHours = [
    { time: '07:00 - 09:00', label: 'Pagi', congestion: 92, color: 'bg-destructive' },
    { time: '12:00 - 13:00', label: 'Siang', congestion: 68, color: 'bg-yellow-400' },
    { time: '17:00 - 20:00', label: 'Sore', congestion: 95, color: 'bg-destructive' },
  ];

  const stats = [
    {
      icon: Users,
      label: 'Total Kendaraan Terdeteksi',
      value: '124,567',
      change: '+15.3%',
      period: 'dari kemarin'
    },
    {
      icon: Clock,
      label: 'Rata-rata Waktu Perjalanan',
      value: '42 min',
      change: '+8 min',
      period: 'dari rata-rata'
    },
    {
      icon: TrendingUp,
      label: 'Akurasi Prediksi AI',
      value: '94.7%',
      change: '+2.1%',
      period: 'bulan ini'
    },
    {
      icon: AlertTriangle,
      label: 'Titik Kemacetan Aktif',
      value: '23',
      change: '+5',
      period: 'dari jam sebelumnya'
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleTheme={() => {}} 
        isDarkMode={false} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-primary glow-text-cyan uppercase tracking-wider mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Data analitik lalu lintas berbasis AI dan machine learning
            </p>
          </div>

          {/* Time Range Selector */}
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-bold uppercase tracking-wide transition-all ${
                  timeRange === range
                    ? 'bg-primary text-primary-foreground glow-cyan'
                    : 'bg-secondary text-muted-foreground hover:text-foreground'
                }`}
              >
                {range === 'today' ? 'Hari Ini' : range === 'week' ? 'Minggu Ini' : 'Bulan Ini'}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 border-glow bg-card space-y-3">
                <div className="flex items-start justify-between">
                  <Icon className="w-8 h-8 text-primary" />
                  <span className={`text-xs font-bold ${
                    stat.change.startsWith('+') ? 'text-green-400' : 'text-yellow-400'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary glow-text-cyan mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-muted-foreground uppercase tracking-wide">
                    {stat.label}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {stat.period}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Traffic Heatmap */}
          <TrafficHeatmapChart />

          {/* Peak Hours */}
          <Card className="p-6 border-glow bg-card space-y-4">
            <div className="flex items-center gap-2 text-primary">
              <Clock className="w-5 h-5" />
              <h3 className="text-xl font-bold uppercase tracking-wider glow-text-cyan">Jam Sibuk</h3>
            </div>

            <div className="space-y-4">
              {peakHours.map((hour, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-foreground">{hour.label}</p>
                      <p className="text-sm text-muted-foreground">{hour.time}</p>
                    </div>
                    <span className="text-2xl font-bold text-primary">{hour.congestion}%</span>
                  </div>
                  <div className="w-full h-3 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${hour.color} glow-cyan transition-all`}
                      style={{ width: `${hour.congestion}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                💡 <span className="font-bold text-foreground">Tips:</span> Hindari perjalanan pada jam sibuk untuk pengalaman berkendara yang lebih baik
              </p>
            </div>
          </Card>
        </div>

        {/* Top Congestion Areas */}
        <Card className="p-6 border-glow bg-card space-y-4">
          <div className="flex items-center gap-2 text-primary">
            <BarChart3 className="w-5 h-5" />
            <h3 className="text-xl font-bold uppercase tracking-wider glow-text-cyan">
              5 Area Paling Macet
            </h3>
          </div>

          <div className="space-y-4">
            {topCongestionAreas.map((area, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <span className="w-8 h-8 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
                        <p className="font-bold text-foreground truncate">{area.name}</p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {area.vehicles.toLocaleString()} kendaraan terdeteksi
                      </p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                    <p className="text-2xl font-bold text-primary">{area.level}%</p>
                    <p className={`text-sm font-bold ${
                      area.trend.startsWith('+') ? 'text-destructive' : 'text-green-400'
                    }`}>
                      {area.trend}
                    </p>
                  </div>
                </div>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden ml-11">
                  <div 
                    className="h-full bg-gradient-to-r from-primary via-accent to-primary glow-cyan transition-all"
                    style={{ width: `${area.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
};

export default Analytics;
