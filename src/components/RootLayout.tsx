import { ReactNode, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useLocation } from 'react-router-dom';
import { track } from "@/lib/analytics";
import Header from './Header';

const queryClient = new QueryClient();

interface RootLayoutProps {
  children: ReactNode;
}

const PageTracker = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);
    // Track pageview
    track("pageview", { path: location.pathname });
  }, [location.pathname]);
  
  return null;
};

export const RootLayout = ({ children }: RootLayoutProps) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    document.documentElement.classList.toggle('dark', newMode);
    localStorage.setItem('darkMode', String(newMode));
  };

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const savedMode = localStorage.getItem('darkMode');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const shouldUseDarkMode = savedMode ? savedMode === 'true' : prefersDark;
    
    setIsDarkMode(shouldUseDarkMode);
    document.documentElement.classList.toggle('dark', shouldUseDarkMode);
    
    // Listen for system theme changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const shouldUseDark = e.matches;
      setIsDarkMode(shouldUseDark);
      document.documentElement.classList.toggle('dark', shouldUseDark);
      localStorage.setItem('darkMode', String(shouldUseDark));
    };
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header onToggleTheme={toggleDarkMode} isDarkMode={isDarkMode} />
          <main className="flex-1">
            <PageTracker />
            {children}
          </main>
          <Footer />
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
    </QueryClientProvider>
  );
};

const Footer = () => (
  <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm py-6">
    <div className="container mx-auto px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 flex items-center justify-center rounded-md bg-primary/10 text-primary">
            <span className="text-xs font-bold">VT</span>
          </div>
          <span className="text-sm font-medium">VibeTraffic AI</span>
        </div>
        <div className="text-xs text-muted-foreground text-center md:text-right">
          <p>© {new Date().getFullYear()} VibeTraffic AI. All rights reserved.</p>
          <p className="mt-1">Data is updated in real-time for accurate traffic monitoring.</p>
        </div>
      </div>
    </div>
  </footer>
);

export default RootLayout;
