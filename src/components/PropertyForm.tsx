import React from 'react';
import { DealData } from '@/types/deal';
import { formatCurrency, formatPercentage } from '@/utils/calculations';

interface PropertyFormProps {
  dealData: DealData;
  onChange: (data: DealData) => void;
  onAnalyze: () => void;
  onReset: () => void;
  isLoading: boolean;
  discount: number;
}

const propertyTypes = ['Single Family', '2-Family', 'Multi-Family', 'Condo', 'Commercial'];
const exitStrategies = ['Retail Sale', 'Wholesale Flip', 'Rental Hold', 'Fix & Flip'];

export function PropertyForm({ dealData, onChange, onAnalyze, onReset, isLoading, discount }: PropertyFormProps) {
  const handleChange = (field: keyof DealData, value: string | number) => {
    onChange({
      ...dealData,
      [field]: value
    });
  };

  return (
    <div className="space-y-4">
      {/* Address */}
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">
          Property Address
        </label>
        <input
          type="text"
          value={dealData.address}
          onChange={(e) => handleChange('address', e.target.value)}
          placeholder="106 S Cherry Street, Poughkeepsie, NY 12601"
          className="input-field"
        />
      </div>

      {/* Property Type & Units */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Property Type
          </label>
          <select
            value={dealData.propertyType}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="input-field"
          >
            {propertyTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Number of Units
          </label>
          <input
            type="number"
            value={dealData.units}
            onChange={(e) => handleChange('units', parseInt(e.target.value) || 1)}
            min={1}
            className="input-field"
          />
        </div>
      </div>

      {/* BPO Value & Strike Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            BPO Value
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={dealData.bpoValue}
              onChange={(e) => handleChange('bpoValue', parseInt(e.target.value) || 0)}
              className="input-field pl-8"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Strike Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={dealData.strikePrice}
              onChange={(e) => handleChange('strikePrice', parseInt(e.target.value) || 0)}
              className="input-field pl-8"
            />
          </div>
          {discount > 0 && (
            <p className="text-sm text-success mt-1 font-medium">
              {formatPercentage(discount)} discount to BPO
            </p>
          )}
        </div>
      </div>

      {/* Rehab Costs & Hold Period */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Rehab Costs
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={dealData.rehabCosts}
              onChange={(e) => handleChange('rehabCosts', parseInt(e.target.value) || 0)}
              className="input-field pl-8"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Hold Period (months)
          </label>
          <input
            type="number"
            value={dealData.holdPeriod}
            onChange={(e) => handleChange('holdPeriod', parseInt(e.target.value) || 1)}
            min={1}
            className="input-field"
          />
        </div>
      </div>

      {/* Exit Strategy & Sale Price */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Exit Strategy
          </label>
          <select
            value={dealData.exitStrategy}
            onChange={(e) => handleChange('exitStrategy', e.target.value)}
            className="input-field"
          >
            {exitStrategies.map(strategy => (
              <option key={strategy} value={strategy}>{strategy}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-muted-foreground mb-2">
            Expected Sale Price
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={dealData.salePrice}
              onChange={(e) => handleChange('salePrice', parseInt(e.target.value) || 0)}
              className="input-field pl-8"
            />
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-4">
        <button
          onClick={onAnalyze}
          disabled={isLoading}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg"
        >
          {isLoading ? (
            <>
              <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <span>🤖</span>
              Analyze Deal with AI
            </>
          )}
        </button>
        <button
          onClick={onReset}
          className="btn-secondary w-full"
        >
          New Analysis
        </button>
      </div>
    </div>
  );
}
