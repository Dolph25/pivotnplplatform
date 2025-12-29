import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Filter, X } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface MarketplaceFiltersProps {
  qualityScoreRange: [number, number];
  onQualityScoreChange: (range: [number, number]) => void;
}

export function MarketplaceFilters({
  qualityScoreRange,
  onQualityScoreChange,
}: MarketplaceFiltersProps) {
  const [open, setOpen] = useState(false);

  const isFiltered = qualityScoreRange[0] > 0 || qualityScoreRange[1] < 100;

  const resetFilter = () => {
    onQualityScoreChange([0, 100]);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="w-4 h-4" />
          Deal Quality Score
          {isFiltered && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {qualityScoreRange[0]}-{qualityScoreRange[1]}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm">Deal Quality Score</h4>
            {isFiltered && (
              <Button variant="ghost" size="sm" onClick={resetFilter} className="h-7 px-2 text-xs">
                <X className="w-3 h-3 mr-1" />
                Reset
              </Button>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Range</span>
              <span className="font-medium text-primary">
                {qualityScoreRange[0]} - {qualityScoreRange[1]}
              </span>
            </div>
            <Slider
              value={qualityScoreRange}
              min={0}
              max={100}
              step={5}
              onValueChange={(value) => onQualityScoreChange(value as [number, number])}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0 (Poor)</span>
              <span>50 (Average)</span>
              <span>100 (Excellent)</span>
            </div>
          </div>

          {/* Quick presets */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Quick filters:</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onQualityScoreChange([70, 100])}
              >
                High Quality (70+)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onQualityScoreChange([40, 69])}
              >
                Medium (40-69)
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => onQualityScoreChange([0, 39])}
              >
                Low (&lt;40)
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
