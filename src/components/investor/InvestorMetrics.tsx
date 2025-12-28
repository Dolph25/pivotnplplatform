import { DollarSign, TrendingUp, Wallet, BarChart3 } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  icon: React.ReactNode;
  positive?: boolean;
}

function MetricCard({ title, value, change, icon, positive = true }: MetricCardProps) {
  return (
    <div className="metric-card group">
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20 transition-colors">
          {icon}
        </div>
        {change && (
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${
            positive ? 'bg-success/20 text-success' : 'bg-destructive/20 text-destructive'
          }`}>
            {positive ? '+' : ''}{change}
          </span>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-1">{title}</p>
      <p className="text-2xl font-bold font-display text-foreground">{value}</p>
    </div>
  );
}

interface InvestorMetricsProps {
  investment?: number;
  currentNav?: number;
  distributions?: number;
  irr?: number;
}

export function InvestorMetrics({
  investment = 500000,
  currentNav = 587450,
  distributions = 45200,
  irr = 18.7,
}: InvestorMetricsProps) {
  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(2)}M`;
    }
    return `$${(value / 1000).toFixed(0)}K`;
  };

  const navChange = (((currentNav - investment) / investment) * 100).toFixed(1);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Your Investment"
        value={formatCurrency(investment)}
        icon={<Wallet className="w-5 h-5" />}
      />
      <MetricCard
        title="Current NAV"
        value={formatCurrency(currentNav)}
        change={`${navChange}%`}
        icon={<DollarSign className="w-5 h-5" />}
        positive={Number(navChange) > 0}
      />
      <MetricCard
        title="Distributions"
        value={formatCurrency(distributions)}
        icon={<TrendingUp className="w-5 h-5" />}
      />
      <MetricCard
        title="Portfolio IRR"
        value={`${irr}%`}
        change="2.3%"
        icon={<BarChart3 className="w-5 h-5" />}
        positive
      />
    </div>
  );
}
