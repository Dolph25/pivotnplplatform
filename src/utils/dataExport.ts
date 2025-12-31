import * as XLSX from 'xlsx';

interface ExportOptions {
  filename?: string;
  sheetName?: string;
  format?: 'csv' | 'xlsx';
}

// Column configuration for property exports
const PROPERTY_EXPORT_COLUMNS = [
  { key: 'property_id', header: 'Property ID' },
  { key: 'address', header: 'Address' },
  { key: 'city', header: 'City' },
  { key: 'state', header: 'State' },
  { key: 'zip_code', header: 'ZIP Code' },
  { key: 'county', header: 'County' },
  { key: 'property_type', header: 'Property Type' },
  { key: 'deal_stage', header: 'Deal Stage' },
  { key: 'num_units', header: 'Units' },
  { key: 'bedrooms', header: 'Bedrooms' },
  { key: 'bathrooms', header: 'Bathrooms' },
  { key: 'square_feet', header: 'Square Feet' },
  { key: 'year_built', header: 'Year Built' },
  { key: 'occupancy_status', header: 'Occupancy' },
  { key: 'bpo', header: 'BPO Value' },
  { key: 'arv', header: 'ARV' },
  { key: 'upb', header: 'UPB' },
  { key: 'strike_price', header: 'Strike Price' },
  { key: 'ltv_ratio', header: 'LTV Ratio' },
  { key: 'current_interest_rate', header: 'Interest Rate' },
  { key: 'delinquent_status', header: 'Delinquent Status' },
  { key: 'foreclosure_flag', header: 'Foreclosure' },
  { key: 'bankruptcy_flag', header: 'Bankruptcy' },
  { key: 'estimated_roi', header: 'Est. ROI' },
  { key: 'estimated_irr', header: 'Est. IRR' },
  { key: 'risk_score', header: 'Risk Score' },
  { key: 'source', header: 'Source' },
  { key: 'notes', header: 'Notes' },
];

export function exportToCSV(data: any[], options: ExportOptions = {}): void {
  const {
    filename = `export-${new Date().toISOString().split('T')[0]}`,
    sheetName = 'Properties',
    format = 'csv'
  } = options;

  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Build headers and rows
  const headers = PROPERTY_EXPORT_COLUMNS.map(col => col.header);
  const rows = data.map(row => 
    PROPERTY_EXPORT_COLUMNS.map(col => {
      const value = row[col.key];
      // Format special values
      if (value === null || value === undefined) return '';
      if (typeof value === 'boolean') return value ? 'Yes' : 'No';
      if (typeof value === 'number') {
        // Format currency columns
        if (['bpo', 'arv', 'upb', 'strike_price'].includes(col.key)) {
          return value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
        }
        // Format percentage columns
        if (['ltv_ratio', 'current_interest_rate', 'estimated_roi', 'estimated_irr'].includes(col.key)) {
          return `${(value * (col.key === 'ltv_ratio' ? 100 : 1)).toFixed(2)}%`;
        }
      }
      return String(value);
    })
  );

  // Create worksheet from array of arrays
  const worksheetData = [headers, ...rows];
  const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate file
  const fileExtension = format === 'xlsx' ? 'xlsx' : 'csv';
  const bookType = format === 'xlsx' ? 'xlsx' : 'csv';
  
  XLSX.writeFile(workbook, `${filename}.${fileExtension}`, { bookType });
}

export function exportPropertiesToCSV(properties: any[], filename?: string): void {
  exportToCSV(properties, {
    filename: filename || `properties-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Properties',
    format: 'csv'
  });
}

export function exportPropertiesToExcel(properties: any[], filename?: string): void {
  exportToCSV(properties, {
    filename: filename || `properties-${new Date().toISOString().split('T')[0]}`,
    sheetName: 'Properties',
    format: 'xlsx'
  });
}
