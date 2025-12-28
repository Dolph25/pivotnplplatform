import { useState, useMemo } from 'react';
import { Calculator, TrendingUp, DollarSign, Calendar, Zap, Crown } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TierConfig {
  name: string;
  prefReturn: number;
  profitShare: number;
  minInvestment: number;
}

const tiers: Record<string, TierConfig> = {
  entry: { name: 'Entry LP', prefReturn: 0.06, profitShare: 0.50, minInvestment: 50000 },
  standard: { name: 'Standard LP', prefReturn: 0.08, profitShare: 0.60, minInvestment: 100000 },
  vip: { name: 'VIP LP', prefReturn: 0.10, profitShare: 0.70, minInvestment: 250000 }
};

export function InvestmentCalculator() {
  const [investmentAmount, setInvestmentAmount] = useState(100000);
  const [holdPeriod, setHoldPeriod] = useState(24);
  const [selectedTier, setSelectedTier] = useState('standard');
  const [expectedAppreciation, setExpectedAppreciation] = useState(15);

  const calculations = useMemo(() => {
    const tier = tiers[selectedTier];
    const years = holdPeriod / 12;
    
    // Preferred return (annual)
    const annualPref = investmentAmount * tier.prefReturn;
    const totalPref = annualPref * years;
    
    // Project appreciation and profit
    const appreciationGain = investmentAmount * (expectedAppreciation / 100) * years;
    const profitAbovePref = Math.max(0, appreciationGain - totalPref);
    const investorProfitShare = profitAbovePref * tier.profitShare;
    
    // Total returns
    const totalReturn = investmentAmount + totalPref + investorProfitShare;
    const totalProfit = totalReturn - investmentAmount;
    const roi = (totalProfit / investmentAmount) * 100;
    const annualizedROI = roi / years;
    
    // IRR approximation (simplified)
    const irr = Math.pow(totalReturn / investmentAmount, 1 / years) - 1;

    return {
      annualPref,
      totalPref,
      investorProfitShare,
      totalReturn,
      totalProfit,
      roi,
      annualizedROI,
      irr: irr * 100
    };
  }, [investmentAmount, holdPeriod, selectedTier, expectedAppreciation]);

  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const isVIPUnlocked = investmentAmount >= 250000 && selectedTier === 'vip';

  return (
    <Card className="w-full border-border/50 bg-card/80 backdrop-blur">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calculator className="w-6 h-6 text-primary" />
          <CardTitle>Investment Calculator</CardTitle>
        </div>
        <CardDescription>
          Estimate your potential returns based on investment amount and tier
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Inputs */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Investment Amount</Label>
                <span className="text-lg font-bold text-primary">{formatCurrency(investmentAmount)}</span>
              </div>
              <Slider
                value={[investmentAmount]}
                onValueChange={([value]) => setInvestmentAmount(value)}
                min={50000}
                max={1000000}
                step={25000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>$50K</span>
                <span>$1M</span>
              </div>
            </div>

            <div className="space-y-3">
              <Label>Investment Tier</Label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entry">Entry LP (6% Pref / 50% Profit)</SelectItem>
                  <SelectItem value="standard">Standard LP (8% Pref / 60% Profit)</SelectItem>
                  <SelectItem value="vip">VIP LP (10% Pref / 70% Profit)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Hold Period</Label>
                <span className="font-medium">{holdPeriod} months</span>
              </div>
              <Slider
                value={[holdPeriod]}
                onValueChange={([value]) => setHoldPeriod(value)}
                min={12}
                max={60}
                step={6}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>1 year</span>
                <span>5 years</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Expected Annual Appreciation</Label>
                <span className="font-medium">{expectedAppreciation}%</span>
              </div>
              <Slider
                value={[expectedAppreciation]}
                onValueChange={([value]) => setExpectedAppreciation(value)}
                min={5}
                max={30}
                step={1}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>5%</span>
                <span>30%</span>
              </div>
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Preferred Return</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(calculations.totalPref)}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(calculations.annualPref)}/yr</p>
              </div>

              <div className="p-4 rounded-lg bg-muted/30 border border-border/50">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Profit Share</span>
                </div>
                <p className="text-xl font-bold text-foreground">{formatCurrency(calculations.investorProfitShare)}</p>
                <p className="text-xs text-muted-foreground">{tiers[selectedTier].profitShare * 100}% of profits</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs">Total Return</span>
                </div>
                <p className="text-2xl font-bold text-primary">{formatCurrency(calculations.totalReturn)}</p>
                <p className="text-xs text-muted-foreground">+{formatCurrency(calculations.totalProfit)} profit</p>
              </div>

              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs">Projected IRR</span>
                </div>
                <p className="text-2xl font-bold text-primary">{calculations.irr.toFixed(1)}%</p>
                <p className="text-xs text-muted-foreground">{calculations.roi.toFixed(1)}% total ROI</p>
              </div>
            </div>

            {isVIPUnlocked && (
              <div className="p-4 rounded-lg bg-gradient-to-r from-purple-900/30 to-primary/20 border-2 border-purple-500">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-amber-400/20">
                    <Zap className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-400" />
                      <p className="font-bold text-purple-300">Pivot Platform Beta Unlocked!</p>
                    </div>
                    <p className="text-sm text-muted-foreground">You qualify for exclusive platform access</p>
                  </div>
                </div>
              </div>
            )}

            <p className="text-xs text-muted-foreground text-center">
              * Projections are estimates only. Actual returns may vary based on market conditions and deal performance.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
