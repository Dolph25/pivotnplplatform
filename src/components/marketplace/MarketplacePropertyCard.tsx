import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Eye, MapPin, Home, DollarSign, Loader2 } from 'lucide-react';
import { formatCurrency } from '@/lib/maps';

interface MarketplacePropertyCardProps {
  property: any;
  viewMode: 'grid' | 'list';
  onAnalyze: () => void;
  onViewDetails: () => void;
  isAnalyzing: boolean;
}

export function MarketplacePropertyCard({
  property,
  viewMode,
  onAnalyze,
  onViewDetails,
  isAnalyzing,
}: MarketplacePropertyCardProps) {
  // Parse AI analysis
  const getAnalysisData = () => {
    if (!property.ai_analysis) return null;
    try {
      return JSON.parse(property.ai_analysis);
    } catch {
      return null;
    }
  };

  const analysis = getAnalysisData();
  const qualityScore = analysis?.deal_quality_score;
  const recommendation = analysis?.recommendation;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500 bg-green-500/10';
    if (score >= 40) return 'text-amber-500 bg-amber-500/10';
    return 'text-red-500 bg-red-500/10';
  };

  const getRecommendationBadge = (rec: string) => {
    const variants: Record<string, { class: string; label: string }> = {
      BUY: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Buy' },
      WATCH: { class: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'Watch' },
      PASS: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Pass' },
    };
    const v = variants[rec] || variants['WATCH'];
    return <Badge variant="outline" className={v.class}>{v.label}</Badge>;
  };

  if (viewMode === 'list') {
    return (
      <Card className="glass-card hover:border-primary/50 transition-colors">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            {/* Property Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-secondary rounded-lg shrink-0">
                  <Home className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{property.address}</h3>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>
                      {property.city}, {property.state} {property.zip_code}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Price & Type */}
            <div className="flex items-center gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">BPO</p>
                <p className="font-semibold text-foreground">{formatCurrency(property.bpo)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Type</p>
                <p className="font-medium text-foreground">{property.property_type || 'N/A'}</p>
              </div>
            </div>

            {/* Quality Score */}
            <div className="flex items-center gap-3">
              {qualityScore !== undefined ? (
                <div className="text-center">
                  <div
                    className={`text-2xl font-bold rounded-lg px-3 py-1 ${getScoreColor(qualityScore)}`}
                  >
                    {qualityScore}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Score</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="text-lg text-muted-foreground px-3 py-1">—</div>
                  <p className="text-xs text-muted-foreground mt-1">Not analyzed</p>
                </div>
              )}
              {recommendation && getRecommendationBadge(recommendation)}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onAnalyze}
                disabled={isAnalyzing}
                className="gap-2"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {analysis ? 'Re-Analyze' : 'AI Analyze'}
              </Button>
              <Button variant="ghost" size="sm" onClick={onViewDetails}>
                <Eye className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view
  return (
    <Card className="glass-card hover:border-primary/50 transition-colors overflow-hidden group">
      <CardContent className="p-0">
        {/* Header with score */}
        <div className="p-4 border-b border-border">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate text-sm">{property.address}</h3>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                <MapPin className="w-3 h-3" />
                <span>
                  {property.city}, {property.state} {property.zip_code}
                </span>
              </div>
            </div>
            {qualityScore !== undefined ? (
              <div
                className={`text-xl font-bold rounded-lg px-2 py-0.5 ${getScoreColor(qualityScore)}`}
              >
                {qualityScore}
              </div>
            ) : (
              <div className="text-sm text-muted-foreground bg-secondary rounded-lg px-2 py-0.5">
                —
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">BPO Value</p>
              <p className="font-semibold text-foreground">{formatCurrency(property.bpo)}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Strike Price</p>
              <p className="font-semibold text-foreground">
                {formatCurrency(property.strike_price)}
              </p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Property Type</p>
              <p className="font-medium text-foreground">{property.property_type || 'N/A'}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Status</p>
              <Badge variant="secondary" className="text-xs">
                {property.deal_stage}
              </Badge>
            </div>
          </div>

          {/* Recommendation */}
          {recommendation && (
            <div className="pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">AI Verdict</span>
                {getRecommendationBadge(recommendation)}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-4 pt-0 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            disabled={isAnalyzing}
            className="flex-1 gap-2"
          >
            {isAnalyzing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {analysis ? 'Re-Analyze' : 'AI Analyze'}
          </Button>
          <Button variant="secondary" size="sm" onClick={onViewDetails} className="gap-2">
            <Eye className="w-4 h-4" />
            Details
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
