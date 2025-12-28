import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { LogOut, User, LayoutDashboard, FileText, TrendingUp, Map, Briefcase, Calculator, BarChart3 } from 'lucide-react';
import pivotLogo from '@/assets/pivot-logo.png';

interface HeaderProps {
  user?: { email?: string } | null;
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const location = useLocation();
  
  const publicLinks = [
    { href: '/', label: 'Home', icon: TrendingUp },
    { href: '/invest', label: 'Invest', icon: Calculator },
    { href: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { href: '/analyze', label: 'Analyze', icon: BarChart3 },
  ];

  const authLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/documents', label: 'Documents', icon: FileText },
  ];

  const navLinks = user ? [...publicLinks, ...authLinks] : publicLinks;

  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={pivotLogo} 
                alt="Pivot Investments Logo" 
                className="w-12 h-12 rounded-lg object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-foreground">Pivot Investments</h1>
                <p className="text-xs text-muted-foreground">
                  NPL AI Platform
                </p>
              </div>
            </Link>
            
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link key={link.href} to={link.href}>
                  <Button 
                    variant={location.pathname === link.href ? 'secondary' : 'ghost'} 
                    size="sm"
                    className="gap-2"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Powered by badges */}
            <div className="hidden lg:flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs font-medium">
                <span className="text-blue-400">✦</span>
                <span className="text-muted-foreground">Gemini AI</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-xs font-medium">
                <Map className="w-3 h-3 text-primary" />
                <span className="text-muted-foreground">Mapbox</span>
              </div>
            </div>

            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </div>
            
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <User className="w-4 h-4" />
                  <span className="hidden sm:inline max-w-32 truncate">{user.email}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onSignOut}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="default" size="sm">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
