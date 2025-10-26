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

    // Draw network grid with more subtle gradient
    const gridGradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gridGradient.addColorStop(0, 'rgba(100, 150, 255, 0.05)');
    gridGradient.addColorStop(1, 'rgba(0, 200, 255, 0.05)');
    
    ctx.strokeStyle = gridGradient;
    ctx.lineWidth = 0.3;

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
          
          // Draw dot with softer glow effect
          ctx.beginPath();
          const dotGradient = ctx.createRadialGradient(
            dotX, dotY, 0,
            dotX, dotY, dotSizeScaled * 1.5
          );
          // Use a softer blue that matches the theme
          dotGradient.addColorStop(0, `rgba(100, 180, 255, ${opacity * 0.7})`);
          dotGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
          
          ctx.fillStyle = dotGradient;
          ctx.arc(dotX, dotY, dotSizeScaled * 1.5, 0, Math.PI * 2);
          ctx.fill();
          
          // Softer inner dot
          ctx.beginPath();
          ctx.fillStyle = `rgba(255, 255, 255, ${opacity * 0.4})`;
          ctx.arc(dotX, dotY, dotSizeScaled * 0.3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      requestAnimationFrame(drawTrafficFlow);
    };
    
    drawTrafficFlow();

    // Draw congestion hotspot (heatmap effect)
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.max(canvas.width, canvas.height) * 0.6 * zoom;
    
    // Enhanced gradient for better traffic visualization
    const gradient = ctx.createRadialGradient(
      centerX, centerY, 0, 
      centerX, centerY, maxRadius
    );
    
    // Softer gradient based on congestion level
    if (congestionLevel > 0.7) {
      // Heavy traffic (softer red to orange)
      gradient.addColorStop(0, 'rgba(255, 100, 100, 0.7)');
      gradient.addColorStop(0.3, 'rgba(255, 160, 60, 0.5)');
      gradient.addColorStop(0.6, 'rgba(255, 200, 100, 0.3)');
      gradient.addColorStop(0.8, 'rgba(120, 220, 160, 0.15)');
      gradient.addColorStop(1, 'rgba(100, 200, 255, 0.05)');
    } else if (congestionLevel > 0.4) {
      // Moderate traffic (softer orange to yellow)
      gradient.addColorStop(0, 'rgba(255, 180, 60, 0.6)');
      gradient.addColorStop(0.4, 'rgba(255, 200, 100, 0.4)');
      gradient.addColorStop(0.7, 'rgba(150, 220, 150, 0.2)');
      gradient.addColorStop(1, 'rgba(100, 220, 255, 0.05)');
    } else {
      // Light traffic (softer green to blue)
      gradient.addColorStop(0, 'rgba(120, 220, 160, 0.5)');
      gradient.addColorStop(0.5, 'rgba(100, 220, 220, 0.25)');
      gradient.addColorStop(0.8, 'rgba(80, 180, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(70, 170, 255, 0)');
    }

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Softer glow effect based on traffic level
    const glowColor = congestionLevel > 0.7 
      ? 'rgba(255, 120, 100, 0.6)'  // Softer red for heavy traffic
      : congestionLevel > 0.4 
        ? 'rgba(255, 180, 80, 0.5)' // Softer orange for moderate
        : 'rgba(120, 220, 200, 0.4)'; // Softer teal for light
    
    // More subtle outer glow
    ctx.shadowBlur = 30 * (0.5 + congestionLevel * 0.5);
    ctx.shadowColor = glowColor;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 50 + congestionLevel * 30, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.fill();
    
    // Softer inner glow
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20 + congestionLevel * 20, 0, Math.PI * 2);
    ctx.fillStyle = glowColor.replace('0.6', '0.2').replace('0.5', '0.15').replace('0.4', '0.1');
    ctx.fill();
    
    // Clear shadow after use to prevent affecting other elements
    ctx.shadowBlur = 0;
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
          background: 'radial-gradient(circle at center, hsl(220, 50%, 10%) 0%, hsl(220, 40%, 12%) 100%)',
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

      {/* Enhanced Legend */}
      <div className="absolute bottom-4 left-4 bg-background/90 backdrop-blur-sm p-3 rounded-xl border border-border/50 text-xs space-y-2 shadow-lg">
        <h4 className="font-semibold text-sm mb-1 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 8V12L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Traffic Status
        </h4>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FF4C4C] animate-pulse"></div>
          <span className="font-medium">Heavy Traffic</span>
          <span className="ml-auto text-muted-foreground">Slow</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#FFB800]"></div>
          <span className="font-medium">Moderate</span>
          <span className="ml-auto text-muted-foreground">Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-[#5BE595]"></div>
          <span className="font-medium">Clear</span>
          <span className="ml-auto text-muted-foreground">Fast</span>
        </div>
        <div className="pt-2 mt-2 border-t border-border/50 text-xs text-muted-foreground">
          Updated: Just now
        </div>
      </div>
    </div>
  );
};

export default TrafficMap;
