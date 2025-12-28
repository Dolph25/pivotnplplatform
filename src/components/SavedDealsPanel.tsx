import React from 'react';
import { Button } from '@/components/ui/button';
import { Trash2, MapPin, TrendingUp } from 'lucide-react';

interface SavedDeal {
  id: string;
  address: string;
  property_type: string;
  roi: number | null;
  verdict: string | null;
  created_at: string;
}

interface SavedDealsPanelProps {
  deals: SavedDeal[];
  onLoadDeal: (dealId: string) => void;
  onDeleteDeal: (dealId: string) => void;
  loading: boolean;
}

export function SavedDealsPanel({ deals, onLoadDeal, onDeleteDeal, loading }: SavedDealsPanelProps) {
  if (loading) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-bold text-foreground mb-3 text-sm">Saved Deals</h3>
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (deals.length === 0) {
    return (
      <div className="glass-card p-4">
        <h3 className="font-bold text-foreground mb-3 text-sm">Saved Deals</h3>
        <p className="text-sm text-muted-foreground text-center py-4">
          No saved deals yet. Analyze a property and save it to track it here.
        </p>
      </div>
    );
  }

  const getVerdictColor = (verdict: string | null) => {
    switch (verdict) {
      case 'buy': return 'text-success';
      case 'consider': return 'text-warning';
      case 'pass': return 'text-destructive';
      default: return 'text-muted-foreground';
    }
  };

  const getVerdictLabel = (verdict: string | null) => {
    switch (verdict) {
      case 'buy': return 'Strong Buy';
      case 'consider': return 'Consider';
      case 'pass': return 'Pass';
      default: return 'N/A';
    }
  };

  return (
    <div className="glass-card p-4">
      <h3 className="font-bold text-foreground mb-3 text-sm">Saved Deals ({deals.length})</h3>
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {deals.map(deal => (
          <div
            key={deal.id}
            className="bg-muted/30 rounded-lg p-3 hover:bg-muted/50 transition-colors cursor-pointer group"
            onClick={() => onLoadDeal(deal.id)}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                  <MapPin className="w-3 h-3" />
                  <span className="truncate">{deal.address.split(',')[0]}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">{deal.property_type}</span>
                  {deal.roi !== null && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <TrendingUp className="w-3 h-3" />
                      {deal.roi.toFixed(1)}% ROI
                    </span>
                  )}
                  <span className={`text-xs font-medium ${getVerdictColor(deal.verdict)}`}>
                    {getVerdictLabel(deal.verdict)}
                  </span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteDeal(deal.id);
                }}
              >
                <Trash2 className="w-3 h-3 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
