import { Crown, Star, TrendingUp, Check, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InvestmentTier {
  name: string;
  minimum: string;
  pref: string;
  profit: string;
  perks: string;
  featured: boolean;
  benefits: string[];
}

const investmentTiers: InvestmentTier[] = [
  {
    name: 'VIP LP',
    minimum: '$250,000 - $500,000+',
    pref: '10%',
    profit: '70%',
    perks: 'Pivot Platform BETA Access',
    featured: true,
    benefits: [
      'Exclusive Pivot Platform Beta Access',
      'First Look at Deal Flow',
      'Priority Asset Selection',
      'Direct GP Communication',
      'Quarterly Strategy Sessions'
    ]
  },
  {
    name: 'Standard LP',
    minimum: '$100,000 - $249,999',
    pref: '8%',
    profit: '60%',
    perks: 'Priority Deal Access',
    featured: false,
    benefits: [
      'Priority Deal Access',
      'Monthly Portfolio Updates',
      'Investor Portal Access',
      'Quarterly Webinars',
      'Tax Document Support'
    ]
  },
  {
    name: 'Entry LP',
    minimum: '$50,000 - $99,999',
    pref: '6%',
    profit: '50%',
    perks: 'Standard Access',
    featured: false,
    benefits: [
      'Standard Deal Access',
      'Quarterly Reports',
      'Investor Portal Access',
      'Annual Review Calls',
      'K-1 Tax Documents'
    ]
  }
];

interface InvestmentTierCardsProps {
  onSelectTier?: (tier: InvestmentTier) => void;
  selectedTier?: string;
}

export function InvestmentTierCards({ onSelectTier, selectedTier }: InvestmentTierCardsProps) {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {investmentTiers.map((tier) => (
        <Card
          key={tier.name}
          className={cn(
            "relative overflow-hidden transition-all duration-300 hover:scale-[1.02]",
            tier.featured
              ? "border-2 border-primary bg-gradient-to-b from-primary/10 to-transparent"
              : "border-border/50 bg-card/80",
            selectedTier === tier.name && "ring-2 ring-primary"
          )}
        >
          {tier.featured && (
            <div className="absolute top-0 right-0">
              <Badge className="rounded-none rounded-bl-lg bg-primary text-primary-foreground">
                <Crown className="w-3 h-3 mr-1" />
                Most Popular
              </Badge>
            </div>
          )}
          
          <CardHeader className="pb-4">
            <div className="flex items-center gap-2">
              {tier.featured ? (
                <Crown className="w-6 h-6 text-primary" />
              ) : tier.name === 'Standard LP' ? (
                <Star className="w-6 h-6 text-muted-foreground" />
              ) : (
                <TrendingUp className="w-6 h-6 text-muted-foreground" />
              )}
              <CardTitle className="text-xl">{tier.name}</CardTitle>
            </div>
            <CardDescription className="text-lg font-semibold text-foreground">
              {tier.minimum}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{tier.pref}</p>
                <p className="text-xs text-muted-foreground">Preferred Return</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{tier.profit}</p>
                <p className="text-xs text-muted-foreground">Profit Share</p>
              </div>
            </div>

            {tier.featured && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-primary/20 border border-primary/30">
                <Zap className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-medium text-primary">{tier.perks}</span>
              </div>
            )}

            <ul className="space-y-2">
              {tier.benefits.map((benefit, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <Check className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <span className="text-muted-foreground">{benefit}</span>
                </li>
              ))}
            </ul>

            {onSelectTier && (
              <Button
                className="w-full"
                variant={tier.featured ? "default" : "outline"}
                onClick={() => onSelectTier(tier)}
              >
                {tier.featured ? 'Get Started' : 'Learn More'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
