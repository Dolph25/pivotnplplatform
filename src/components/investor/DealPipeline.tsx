import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/maps';

interface PipelineData {
  status: string;
  deal_count: number;
  total_capital: number;
  avg_roi: number;
  avg_irr: number;
  total_projected_profit: number;
}

interface DealPipelineProps {
  data: PipelineData[];
  onStatusClick?: (status: string) => void;
}

const statusColors: Record<string, string> = {
  'Pipeline': '#8b5cf6',
  'Due Diligence': '#06b6d4',
  'Under Contract': '#3b82f6',
  'Closed': '#10b981',
  'Active': '#06b6d4',
  'Litigation': '#f59e0b',
};

export function DealPipeline({ data, onStatusClick }: DealPipelineProps) {
  const chartData = data.map((item) => ({
    name: item.status,
    deals: item.deal_count,
    capital: Number(item.total_capital) || 0,
    profit: Number(item.total_projected_profit) || 0,
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find((d) => d.status === label);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-2">{label}</p>
          <div className="space-y-1 text-sm">
            <p className="text-muted-foreground">
              Deals: <span className="text-foreground font-medium">{payload[0].value}</span>
            </p>
            {item && (
              <>
                <p className="text-muted-foreground">
                  Total Capital:{' '}
                  <span className="text-foreground font-medium">
                    {formatCurrency(item.total_capital)}
                  </span>
                </p>
                <p className="text-muted-foreground">
                  Avg ROI:{' '}
                  <span className="text-primary font-medium">
                    {item.avg_roi?.toFixed(1) || 'N/A'}%
                  </span>
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-display font-semibold mb-4">Deal Pipeline</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} layout="vertical" margin={{ left: 20 }}>
            <XAxis type="number" stroke="#64748b" fontSize={12} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              width={100}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
            <Bar
              dataKey="deals"
              radius={[0, 4, 4, 0]}
              cursor="pointer"
              onClick={(data) => onStatusClick?.(data.name)}
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={statusColors[entry.name] || '#06b6d4'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-foreground">
            {data.reduce((sum, d) => sum + (d.deal_count || 0), 0)}
          </p>
          <p className="text-xs text-muted-foreground">Total Deals</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-primary">
            {formatCurrency(data.reduce((sum, d) => sum + (Number(d.total_capital) || 0), 0))}
          </p>
          <p className="text-xs text-muted-foreground">Total Capital</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold font-display text-success">
            {formatCurrency(
              data.reduce((sum, d) => sum + (Number(d.total_projected_profit) || 0), 0)
            )}
          </p>
          <p className="text-xs text-muted-foreground">Projected Profit</p>
        </div>
      </div>
    </div>
  );
}
