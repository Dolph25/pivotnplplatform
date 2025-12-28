import React from 'react';

export function Header() {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center font-bold text-primary-foreground text-lg">
              P
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Pivot Investments</h1>
              <p className="text-xs text-muted-foreground">
                AI Underwriting Tool — Powered by Gemini 2.0 Flash & Mapbox 3.2
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
              System Online
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
