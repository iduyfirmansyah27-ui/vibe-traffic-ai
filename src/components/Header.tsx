import { Triangle, Menu } from 'lucide-react';

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <Triangle className="w-6 h-6 text-primary rotate-180 glow-cyan" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-primary glow-text-cyan uppercase tracking-wider">
            VibeTraffic
          </h1>
        </div>
        
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/" className="text-foreground hover:text-primary transition-colors uppercase tracking-wide">
            Dashboard
          </a>
          <a href="/route-planner" className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">
            Route Planner
          </a>
          <a href="/analytics" className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">
            Analytics
          </a>
          <a href="/alerts" className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">
            Alerts
          </a>
          <a href="/about" className="text-muted-foreground hover:text-primary transition-colors uppercase tracking-wide">
            About
          </a>
        </nav>

        <button className="md:hidden text-primary">
          <Menu className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};

export default Header;
