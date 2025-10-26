import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { MoveUpRight } from 'lucide-react';

interface TrafficMapProps {
  congestionLevel?: number;
  className?: string;
  showControls?: boolean;
}

const TrafficMap = ({ 
  congestionLevel = 0.65, 
  className,
  showControls = true 
}: TrafficMapProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastPos, setLastPos] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    // Draw network grid with subtle gradient
    const gridGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gridGradient.addColorStop(0, 'rgba(58, 134, 255, 0.1)');
    gridGradient.addColorStop(1, 'rgba(0, 255, 245, 0.1)');
    
    ctx.strokeStyle = gridGradient;
    ctx.lineWidth = 0.5;

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

    // Draw animated traffic flow
    const drawTrafficFlow = () => {
      const now = Date.now();
      const flowSpeed = 0.0015;
      const dotCount = 40;
      const dotSize = 1.5 * zoom;
      
      // Draw traffic flow lines (more organic paths)
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        const speed = 0.4 + Math.random() * 0.6;
        const offset = (now * flowSpeed * speed) % 1;
        
        // Create a more organic path with control points
        const startRadius = 40 + Math.random() * 30;
        const endRadius = 180 + Math.random() * 100;
        const cp1x = canvas.width / 2 + Math.cos(angle + 0.5) * (startRadius + endRadius) * 0.6;
        const cp1y = canvas.height / 2 + Math.sin(angle + 0.5) * (startRadius + endRadius) * 0.6;
        
        const startX = canvas.width / 2 + Math.cos(angle) * startRadius;
        const startY = canvas.height / 2 + Math.sin(angle) * startRadius;
        const endX = canvas.width / 2 + Math.cos(angle) * endRadius;
        const endY = canvas.height / 2 + Math.sin(angle) * endRadius;
        
        // Draw flow line with gradient
        const gradient = ctx.createLinearGradient(startX, startY, endX, endY);
        gradient.addColorStop(0, 'rgba(58, 134, 255, 0.3)');
        gradient.addColorStop(1, 'rgba(0, 255, 245, 0.1)');
        
        // Draw the curved path
        ctx.beginPath();
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 1 * zoom;
        ctx.moveTo(startX, startY);
        ctx.quadraticCurveTo(cp1x, cp1y, endX, endY);
        ctx.stroke();
        
        // Draw moving dots with varying sizes and opacities
        for (let j = 0; j < dotCount; j++) {
          const dotPos = (offset + j / dotCount) % 1;
          
          // Calculate position along the curve
          const t = dotPos;
          const t1 = 1 - t;
          const t2 = t1 * t1;
          const t3 = 2 * t * t1;
          const t4 = t * t;
          
          const dotX = t2 * startX + t3 * cp1x + t4 * endX;
          const dotY = t2 * startY + t3 * cp1y + t4 * endY;
          
          // Vary dot size and opacity for depth
          const sizeVariation = 0.8 + Math.sin(now * 0.001 + j * 0.5) * 0.5;
          const dotSizeScaled = dotSize * sizeVariation;
          const opacity = 0.2 + 0.8 * (1 - j / dotCount);
          
          // Draw dot with glow effect
          ctx.beginPath();
          const dotGradient = ctx.createRadialGradient(
            dotX, dotY, 0,
            dotX, dotY, dotSizeScaled * 2
          );
          dotGradient.addColorStop(0, `rgba(58, 134, 255, ${opacity})`);
          dotGradient.addColorStop(1, 'rgba(0, 255, 245, 0)');
          
          ctx.fillStyle = dotGradient;
          ctx.arc(dotX, dotY, dotSizeScaled * 2, 0, Math.PI * 2);
          ctx.fill();
          
          // Inner dot
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.8})`;
          ctx.arc(dotX, dotY, dotSizeScaled * 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      requestAnimationFrame(drawTrafficFlow);
    };
    
    drawTrafficFlow();

    // Draw congestion hotspot (heatmap effect)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create gradient for heatmap using the new color scheme
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 200 * zoom);
    gradient.addColorStop(0, 'rgba(255, 76, 76, 0.8)'); // Traffic Red
    gradient.addColorStop(0.4, 'rgba(255, 214, 10, 0.5)'); // Traffic Yellow
    gradient.addColorStop(0.7, 'rgba(91, 229, 149, 0.3)'); // Traffic Green
    gradient.addColorStop(0.9, 'rgba(0, 255, 245, 0.1)'); // Aqua Glow
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

  // Handle mouse down for dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    const dx = e.clientX - lastPos.x;
    const dy = e.clientY - lastPos.y;
    
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
    
    setLastPos({ x: e.clientX, y: e.clientY });
  };

  // Handle mouse up/leave for dragging
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle zoom
  const handleZoom = (delta: number) => {
    setZoom(prev => Math.min(3, Math.max(0.5, prev + delta)));
  };

  return (
    <div 
      className={cn(
        'relative w-full h-full overflow-hidden rounded-xl border border-border/50 bg-background/50',
        isDragging ? 'cursor-grabbing' : 'cursor-grab',
        className
      )}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={() => {
        handleMouseUp();
        setIsHovered(false);
      }}
      onMouseEnter={() => setIsHovered(true)}
    >
      <div 
        className="w-full h-full transition-transform duration-300 ease-out"
        style={{
          transform: `scale(${zoom}) translate(${position.x}px, ${position.y}px)`,
          background: 'radial-gradient(circle at center, hsl(223, 60%, 8%) 0%, hsl(223, 33%, 10%) 100%)',
        }}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full"
        />
      </div>

      {/* Zoom Controls */}
      {showControls && (
        <div className={`absolute right-4 top-4 flex flex-col gap-2 transition-opacity duration-200 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <button 
            onClick={() => handleZoom(0.2)}
            className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent/20 hover:border-primary/50 transition-colors"
            aria-label="Zoom in"
          >
            <MoveUpRight className="w-4 h-4" />
          </button>
          <button 
            onClick={() => handleZoom(-0.2)}
            className="p-2 rounded-lg bg-background/80 backdrop-blur-sm border border-border/50 hover:bg-accent/20 hover:border-primary/50 transition-colors"
            aria-label="Zoom out"
          >
            <MoveUpRight className="w-4 h-4 rotate-180" />
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-background/80 backdrop-blur-sm p-3 rounded-lg border border-border/50 text-xs space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(0,100%,61%)]"></div>
          <span>Heavy Traffic</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(50,100%,52%)]"></div>
          <span>Moderate</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[hsl(148,75%,66%)]"></div>
          <span>Clear</span>
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;
