import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface CountyData {
  county: string;
  count: number;
  totalValue: number;
}

interface GeographicDistributionProps {
  data: CountyData[];
  onCountyClick?: (county: string) => void;
}

export function GeographicDistribution({ data, onCountyClick }: GeographicDistributionProps) {
  const sortedData = [...data].sort((a, b) => b.count - a.count).slice(0, 10);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = data.find((d) => d.county === label);
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-foreground mb-1">{label} County</p>
          <p className="text-sm text-muted-foreground">
            Properties: <span className="text-primary font-medium">{payload[0].value}</span>
          </p>
          {item && (
            <p className="text-sm text-muted-foreground">
              Total Value:{' '}
              <span className="text-foreground font-medium">
                ${(item.totalValue / 1000000).toFixed(1)}M
              </span>
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="glass-card p-6">
      <h3 className="text-lg font-display font-semibold mb-4">Properties by County</h3>
      
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ left: 20 }}>
            <XAxis
              dataKey="county"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(6, 182, 212, 0.1)' }} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
              cursor="pointer"
              onClick={(data) => onCountyClick?.(data.county)}
            >
              {sortedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? '#06b6d4' : `rgba(6, 182, 212, ${0.8 - index * 0.06})`}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
