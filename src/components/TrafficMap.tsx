import { useEffect, useRef } from 'react';

interface TrafficMapProps {
  congestionLevel?: number;
}

const TrafficMap = ({ congestionLevel = 0.92 }: TrafficMapProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw network grid
    ctx.strokeStyle = 'rgba(0, 200, 255, 0.2)';
    ctx.lineWidth = 1;

    // Vertical lines
    for (let i = 0; i < canvas.width; i += 30) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }

    // Horizontal lines
    for (let i = 0; i < canvas.height; i += 30) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // Draw congestion hotspot (heatmap effect)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create gradient for heatmap
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 150);
    gradient.addColorStop(0, 'rgba(255, 0, 0, 0.8)');
    gradient.addColorStop(0.3, 'rgba(255, 150, 0, 0.6)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 0, 0.4)');
    gradient.addColorStop(0.8, 'rgba(0, 255, 100, 0.2)');
    gradient.addColorStop(1, 'rgba(0, 200, 255, 0)');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw glow effect
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0, 200, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 80, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 200, 255, 0.1)';
    ctx.fill();
  }, [congestionLevel]);

  return (
    <div className="relative w-full h-full rounded-lg overflow-hidden border-glow bg-card">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ minHeight: '300px' }}
      />
      <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/20 border border-primary text-primary text-sm font-mono">
        LIVE FEED
      </div>
    </div>
  );
};

export default TrafficMap;
