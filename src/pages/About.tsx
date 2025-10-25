import Header from '@/components/Header';
import { Card } from '@/components/ui/card';
import { Brain, Camera, LineChart, Shield, Zap, Users } from 'lucide-react';

const About = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI & Machine Learning',
      description: 'Prediksi akurat menggunakan teknologi YOLOv8 untuk deteksi kendaraan dan LSTM untuk prediksi kemacetan'
    },
    {
      icon: Camera,
      title: 'CCTV Integration',
      description: 'Analisis real-time dari data CCTV publik untuk monitoring kondisi lalu lintas 24/7'
    },
    {
      icon: LineChart,
      title: 'Data Analytics',
      description: 'Dashboard komprehensif dengan visualisasi heatmap, tren waktu, dan statistik detail'
    },
    {
      icon: Shield,
      title: 'Reliable & Accurate',
      description: 'Tingkat akurasi prediksi 94.7% dengan model yang terus diperbarui'
    },
    {
      icon: Zap,
      title: 'Real-Time Updates',
      description: 'Update kondisi lalu lintas setiap 5 detik dengan notifikasi instant'
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Platform kolaboratif dengan kontribusi laporan dari ribuan pengguna aktif'
    }
  ];

  const techStack = [
    { name: 'Computer Vision', tech: 'YOLOv8, OpenCV' },
    { name: 'Prediction Model', tech: 'LSTM, Prophet, TensorFlow' },
    { name: 'Frontend', tech: 'React, TypeScript, TailwindCSS' },
    { name: 'Backend', tech: 'FastAPI, Python' },
    { name: 'Database', tech: 'PostgreSQL, Supabase' },
    { name: 'Maps', tech: 'Mapbox, Leaflet.js' }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-5xl font-bold text-primary glow-text-cyan uppercase tracking-wider mb-4">
            About VibeTraffic
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Platform AI-powered untuk prediksi dan monitoring lalu lintas Indonesia secara real-time
          </p>
        </div>

        {/* Mission Section */}
        <Card className="p-8 border-glow bg-card mb-12">
          <div className="max-w-4xl mx-auto space-y-6">
            <h2 className="text-3xl font-bold text-primary uppercase tracking-wider text-center mb-6">
              Misi Kami
            </h2>
            <p className="text-foreground text-lg leading-relaxed">
              VibeTraffic hadir untuk mengatasi permasalahan kemacetan lalu lintas yang menjadi tantangan besar di Indonesia. 
              Dengan memanfaatkan teknologi Computer Vision dan Machine Learning, kami menganalisis data dari CCTV publik 
              untuk memberikan prediksi kemacetan yang akurat dan rekomendasi rute yang optimal.
            </p>
            <p className="text-foreground text-lg leading-relaxed">
              Kami percaya bahwa dengan informasi yang tepat, masyarakat dapat membuat keputusan perjalanan yang lebih cerdas, 
              menghemat waktu, dan mengurangi stres di jalan raya.
            </p>
          </div>
        </Card>

        {/* Features Grid */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-primary uppercase tracking-wider text-center mb-8 glow-text-cyan">
            Fitur Unggulan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="p-6 border-glow bg-card hover:bg-secondary/30 transition-all group">
                  <div className="space-y-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/20 border border-primary flex items-center justify-center group-hover:glow-cyan transition-all">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-primary group-hover:glow-text-cyan transition-all">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Tech Stack */}
        <Card className="p-8 border-glow bg-card mb-12">
          <h2 className="text-3xl font-bold text-primary uppercase tracking-wider text-center mb-8 glow-text-cyan">
            Technology Stack
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {techStack.map((item, index) => (
              <div key={index} className="space-y-2">
                <p className="text-sm text-muted-foreground uppercase tracking-wide">
                  {item.name}
                </p>
                <p className="text-lg font-bold text-primary">
                  {item.tech}
                </p>
              </div>
            ))}
          </div>
        </Card>

        {/* How It Works */}
        <Card className="p-8 border-glow bg-card mb-12">
          <h2 className="text-3xl font-bold text-primary uppercase tracking-wider text-center mb-8 glow-text-cyan">
            Cara Kerja
          </h2>
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Data Collection</h3>
                <p className="text-muted-foreground">
                  Sistem mengambil frame dari CCTV publik setiap 5 detik untuk analisis real-time
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Vehicle Detection</h3>
                <p className="text-muted-foreground">
                  Model YOLOv8 mendeteksi dan menghitung jumlah kendaraan di setiap frame dengan akurasi tinggi
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">AI Prediction</h3>
                <p className="text-muted-foreground">
                  Model LSTM memprediksi tingkat kemacetan berdasarkan data historis dan kondisi real-time
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/20 border border-primary text-primary flex items-center justify-center font-bold flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Route Recommendation</h3>
                <p className="text-muted-foreground">
                  Sistem merekomendasikan rute optimal dengan mempertimbangkan prediksi kemacetan dan jarak
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Impact */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 border-glow bg-card text-center space-y-2">
            <p className="text-4xl font-bold text-primary glow-text-cyan">2,847</p>
            <p className="text-muted-foreground uppercase tracking-wide">Pengguna Aktif</p>
          </Card>
          <Card className="p-6 border-glow bg-card text-center space-y-2">
            <p className="text-4xl font-bold text-primary glow-text-cyan">124K+</p>
            <p className="text-muted-foreground uppercase tracking-wide">Kendaraan Terdeteksi</p>
          </Card>
          <Card className="p-6 border-glow bg-card text-center space-y-2">
            <p className="text-4xl font-bold text-primary glow-text-cyan">94.7%</p>
            <p className="text-muted-foreground uppercase tracking-wide">Akurasi AI</p>
          </Card>
        </div>

        {/* Contact */}
        <Card className="p-8 border-glow bg-card text-center">
          <h2 className="text-3xl font-bold text-primary uppercase tracking-wider mb-4 glow-text-cyan">
            Tertarik Bekerja Sama?
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Kami terbuka untuk kolaborasi dengan Dinas Perhubungan, startup mobilitas, dan organisasi yang peduli 
            dengan solusi lalu lintas Indonesia
          </p>
          <a 
            href="mailto:contact@vibetraffic.id" 
            className="inline-block px-8 py-3 bg-primary text-primary-foreground font-bold rounded-lg hover:bg-primary/90 transition-all glow-cyan uppercase tracking-wide"
          >
            Hubungi Kami
          </a>
        </Card>
      </main>
    </div>
  );
};

export default About;
