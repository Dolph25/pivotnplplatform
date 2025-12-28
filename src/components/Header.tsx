import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { LogOut, User, LayoutDashboard, FileText, TrendingUp, Map, Briefcase, Calculator, BarChart3, Menu, X } from 'lucide-react';
import pivotLogo from '@/assets/pivot-logo.png';

interface HeaderProps {
  user?: { email?: string } | null;
  onSignOut?: () => void;
}

export function Header({ user, onSignOut }: HeaderProps) {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
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
      <div className="container mx-auto px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 md:gap-6">
            {/* Mobile Menu Toggle */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <Menu className="w-5 h-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  {/* Mobile Menu Header */}
                  <div className="flex items-center gap-3 p-4 border-b border-border">
                    <img 
                      src={pivotLogo} 
                      alt="Pivot" 
                      className="w-10 h-10 rounded-lg object-contain"
                    />
                    <div>
                      <h2 className="font-bold text-foreground">Pivot Investments</h2>
                      <p className="text-xs text-muted-foreground">NPL AI Platform</p>
                    </div>
                  </div>

                  {/* Mobile Navigation Links */}
                  <nav className="flex-1 p-4 space-y-1">
                    {navLinks.map((link) => (
                      <Link 
                        key={link.href} 
                        to={link.href}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Button 
                          variant={location.pathname === link.href ? 'secondary' : 'ghost'} 
                          className="w-full justify-start gap-3"
                        >
                          <link.icon className="w-5 h-5" />
                          {link.label}
                        </Button>
                      </Link>
                    ))}
                  </nav>

                  {/* Mobile Menu Footer */}
                  <div className="p-4 border-t border-border space-y-3">
                    {/* Powered by badges */}
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 text-xs font-medium">
                        <span className="text-blue-400">✦</span>
                        <span className="text-muted-foreground">Gemini AI</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-primary/10 to-emerald-500/10 border border-primary/20 text-xs font-medium">
                        <Map className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">Mapbox</span>
                      </div>
                    </div>

                    {user ? (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground px-2">
                          <User className="w-4 h-4" />
                          <span className="truncate">{user.email}</span>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full gap-2"
                          onClick={() => {
                            onSignOut?.();
                            setMobileMenuOpen(false);
                          }}
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </Button>
                      </div>
                    ) : (
                      <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                        <Button className="w-full">Sign In</Button>
                      </Link>
                    )}
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <img 
                src={pivotLogo} 
                alt="Pivot Investments Logo" 
                className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg object-contain"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg sm:text-xl font-bold text-foreground">Pivot Investments</h1>
                <p className="text-xs text-muted-foreground">
                  NPL AI Platform
                </p>
              </div>
            </Link>
            
            {/* Desktop Navigation */}
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
          
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Powered by badges - Desktop only */}
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

            {/* Status badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              Online
            </div>
            
            {/* User section - Desktop */}
            <div className="hidden md:flex items-center">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="w-4 h-4" />
                    <span className="hidden lg:inline max-w-32 truncate">{user.email}</span>
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

            {/* Mobile Sign In Button (when not logged in) */}
            {!user && (
              <Link to="/auth" className="md:hidden">
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
