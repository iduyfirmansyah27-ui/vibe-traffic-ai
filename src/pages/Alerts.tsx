import { useState } from 'react';
import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Bell, AlertTriangle, MapPin, Clock, MessageSquare, ThumbsUp, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Alert {
  id: number;
  type: 'accident' | 'congestion' | 'roadwork' | 'weather' | 'community';
  title: string;
  location: string;
  time: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  likes: number;
  reports: number;
}

const Alerts = () => {
  const [newReport, setNewReport] = useState('');
  const [alerts] = useState<Alert[]>([
    {
      id: 1,
      type: 'accident',
      title: 'Kecelakaan Lalulintas',
      location: 'Jl. Sudirman KM 7, Jakarta',
      time: '5 menit yang lalu',
      severity: 'high',
      description: 'Tabrakan beruntun melibatkan 3 kendaraan. Jalur kiri ditutup sementara.',
      likes: 24,
      reports: 12
    },
    {
      id: 2,
      type: 'congestion',
      title: 'Kemacetan Parah',
      location: 'Jl. Gatot Subroto, Semanggi',
      time: '10 menit yang lalu',
      severity: 'high',
      description: 'Antrean panjang hingga 2 km akibat volume kendaraan tinggi.',
      likes: 45,
      reports: 28
    },
    {
      id: 3,
      type: 'roadwork',
      title: 'Perbaikan Jalan',
      location: 'Jl. Kuningan, Jakarta Selatan',
      time: '30 menit yang lalu',
      severity: 'medium',
      description: 'Pengerjaan perbaikan jalan berlubang. Lajur kanan menyempit.',
      likes: 12,
      reports: 8
    },
    {
      id: 4,
      type: 'weather',
      title: 'Hujan Deras',
      location: 'Area Thamrin - Sudirman',
      time: '1 jam yang lalu',
      severity: 'medium',
      description: 'Hujan lebat dengan jarak pandang terbatas. Harap berhati-hati.',
      likes: 67,
      reports: 43
    },
    {
      id: 5,
      type: 'community',
      title: 'Laporan Pengguna: Jalur Sepi',
      location: 'Jl. Casablanca Alt',
      time: '2 jam yang lalu',
      severity: 'low',
      description: 'Rute alternatif via Casablanca sangat lancar saat ini.',
      likes: 89,
      reports: 15
    }
  ]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-destructive/20 border-destructive text-destructive';
      case 'medium':
        return 'bg-yellow-400/20 border-yellow-400 text-yellow-400';
      case 'low':
        return 'bg-green-400/20 border-green-400 text-green-400';
      default:
        return 'bg-primary/20 border-primary text-primary';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'Tinggi';
      case 'medium':
        return 'Sedang';
      case 'low':
        return 'Rendah';
      default:
        return severity;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'accident':
        return '🚗💥';
      case 'congestion':
        return '🚦';
      case 'roadwork':
        return '🚧';
      case 'weather':
        return '🌧️';
      case 'community':
        return '👥';
      default:
        return '📍';
    }
  };

  const submitReport = () => {
    if (!newReport.trim()) {
      toast.error('Mohon isi laporan Anda');
      return;
    }

    toast.success('Laporan berhasil dikirim! Terima kasih atas kontribusi Anda.');
    setNewReport('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onToggleTheme={() => {}} 
        isDarkMode={false} 
      />
      
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-primary glow-text-cyan uppercase tracking-wider mb-2">
            Real-Time Alerts
          </h1>
          <p className="text-muted-foreground">
            Notifikasi kejadian lalu lintas terkini dari AI dan laporan komunitas
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Alerts List */}
          <div className="lg:col-span-2 space-y-4">
            {alerts.map((alert) => (
              <Card key={alert.id} className="p-6 border-glow bg-card hover:bg-secondary/30 transition-all">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      <span className="text-3xl">{getTypeIcon(alert.type)}</span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-primary mb-1">
                          {alert.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {alert.location}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {alert.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full border text-xs font-bold uppercase whitespace-nowrap ${getSeverityColor(alert.severity)}`}>
                      {getSeverityLabel(alert.severity)}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-foreground">{alert.description}</p>

                  {/* Actions */}
                  <div className="flex items-center gap-4 pt-2 border-t border-border">
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-bold">{alert.likes}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      <span className="font-bold">{alert.reports}</span>
                    </button>
                    <button className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors ml-auto">
                      <Share2 className="w-4 h-4" />
                      <span className="font-bold">Bagikan</span>
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Community Report Form */}
          <div className="space-y-6">
            <Card className="p-6 border-glow bg-card space-y-4 sticky top-24">
              <div className="flex items-center gap-2 text-primary">
                <Bell className="w-5 h-5" />
                <h3 className="text-xl font-bold uppercase tracking-wider glow-text-cyan">
                  Lapor Kejadian
                </h3>
              </div>

              <p className="text-sm text-muted-foreground">
                Bantu pengguna lain dengan melaporkan kondisi lalu lintas yang Anda temui
              </p>

              <div className="space-y-4">
                <Textarea
                  placeholder="Contoh: Ada kecelakaan di Jl. Sudirman arah Semanggi, lalu lintas padat..."
                  value={newReport}
                  onChange={(e) => setNewReport(e.target.value)}
                  className="min-h-[120px] bg-secondary border-primary/30 focus:border-primary resize-none"
                />

                <Button 
                  onClick={submitReport}
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan"
                >
                  <AlertTriangle className="w-4 h-4 mr-2" />
                  Kirim Laporan
                </Button>
              </div>

              <div className="pt-4 border-t border-border space-y-2 text-xs text-muted-foreground">
                <p>💡 Tips laporan yang baik:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Sebutkan lokasi spesifik</li>
                  <li>Jelaskan kondisi dengan jelas</li>
                  <li>Sertakan waktu kejadian</li>
                  <li>Tambahkan tingkat keparahan</li>
                </ul>
              </div>
            </Card>

            {/* Stats Card */}
            <Card className="p-6 border-glow bg-card space-y-4">
              <h3 className="text-lg font-bold text-primary uppercase tracking-wider">
                Statistik Komunitas
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Laporan Hari Ini</span>
                  <span className="text-xl font-bold text-primary">156</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pengguna Aktif</span>
                  <span className="text-xl font-bold text-primary">2,847</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Kontribusi Anda</span>
                  <span className="text-xl font-bold text-primary">0</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground pt-4 border-t border-border">
                Bergabunglah dengan ribuan pengguna yang membantu komunitas!
              </p>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Alerts;
