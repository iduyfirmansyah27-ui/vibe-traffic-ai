import { Triangle, Menu, Map, BarChart3, Bell, Info, Route } from 'lucide-react';
import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/', icon: Map },
  { name: 'Route Planner', href: '/route-planner', icon: Route },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Alerts', href: '/alerts', icon: Bell },
  { name: 'About', href: '/about', icon: Info },
];

interface HeaderProps {
  onToggleTheme: () => void;
  isDarkMode: boolean;
}

const Header = ({ onToggleTheme, isDarkMode }: HeaderProps) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activePath, setActivePath] = useState('/');
  const [isMounted, setIsMounted] = useState(false);

  // Only render theme toggle after mounting to avoid hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    try { 
      setActivePath(window.location.pathname);
    } catch { /* noop */ }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled 
        ? 'bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm' 
        : 'bg-background/50 backdrop-blur-sm border-b border-border/30'
    )}>
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Triangle className="w-5 h-5 rotate-180" fill="currentColor" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-[#00FFF5] bg-clip-text text-transparent">
            VibeTraffic AI
          </h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = activePath === item.href;
            const Icon = item.icon;
            
            return (
              <a
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive 
                    ? 'bg-primary/10 text-primary' 
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4" />
                {item.name}
              </a>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={() => {
                  onToggleTheme();
                  try {
                    window.dispatchEvent(new Event('vt_toggle_map_theme'));
                  } catch { /* noop */ }
                }}
                className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-accent/50 hover:bg-accent text-foreground/80 hover:text-foreground transition-colors"
                aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isMounted ? (
                  isDarkMode ? (
                    <span className="text-yellow-300">☀️</span>
                  ) : (
                    <span>🌙</span>
                  )
                ) : (
                  <span className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-accent/50 text-foreground/80 transition-colors relative z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? (
              <span className="text-xl">✕</span>
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
        
        {/* Mobile Menu */}
        {/* Mobile Menu */}
        <div 
          className={cn(
            'fixed inset-0 z-40 bg-background/95 backdrop-blur-md transition-all duration-300 ease-in-out md:hidden',
            isMobileMenuOpen 
              ? 'opacity-100 pointer-events-auto' 
              : 'opacity-0 pointer-events-none'
          )}
          style={{
            transform: isMobileMenuOpen ? 'translateY(0)' : 'translateY(-100%)',
            paddingTop: 'calc(4rem + env(safe-area-inset-top, 0px))',
          }}
        >
          <div className="absolute inset-x-0 top-full bg-background/95 backdrop-blur-md border-t border-border/50 md:hidden">
            <div className="container mx-auto px-4 py-3 space-y-1">
              {navItems.map((item) => {
                const isActive = activePath === item.href;
                const Icon = item.icon;
                
                return (
                  <a
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors',
                      isActive 
                        ? 'bg-primary/10 text-primary' 
                        : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                    )}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
