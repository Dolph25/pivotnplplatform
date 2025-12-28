import React from 'react';

export function EmptyState() {
  return (
    <div className="h-full flex flex-col items-center justify-center text-center py-20">
      <div className="text-6xl mb-6 animate-pulse-glow inline-block p-6 rounded-full bg-primary/10">
        🏠
      </div>
      <h3 className="text-2xl font-bold text-foreground mb-3">
        Ready to Analyze
      </h3>
      <p className="text-muted-foreground max-w-md leading-relaxed">
        Enter property details and click <span className="text-primary font-semibold">"Analyze Deal with AI"</span> to 
        get instant investment insights powered by Gemini 2.0 Flash.
      </p>
      <div className="mt-8 flex items-center gap-6 text-sm text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-success" />
          ROI Analysis
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-primary" />
          Risk Assessment
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-warning" />
          Market Insights
        </div>
      </div>
    </div>
  );
}
