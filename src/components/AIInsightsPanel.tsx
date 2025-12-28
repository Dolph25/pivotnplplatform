import React from 'react';

interface AIInsightsPanelProps {
  insights: string;
  isLoading?: boolean;
}

export function AIInsightsPanel({ insights, isLoading }: AIInsightsPanelProps) {
  return (
    <div className="ai-panel animate-fade-in">
      <div className="flex items-start gap-4">
        <div className="text-3xl flex-shrink-0">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            '🤖'
          )}
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-foreground mb-3 text-lg">AI Investment Analysis</h3>
          {isLoading ? (
            <div className="space-y-2">
              <div className="h-4 bg-muted/50 rounded animate-pulse w-full" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-5/6" />
              <div className="h-4 bg-muted/50 rounded animate-pulse w-4/6" />
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">{insights}</p>
          )}
          <p className="text-xs text-primary/70 mt-4 flex items-center gap-1">
            <span>⚡</span> Powered by Gemini 2.0 Flash
          </p>
        </div>
      </div>
    </div>
  );
}
