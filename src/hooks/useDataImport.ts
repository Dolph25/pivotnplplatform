import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

// Helper to detect if file is CSV
const isCSVFile = (file: File): boolean => {
  return file.name.toLowerCase().endsWith('.csv') || file.type === 'text/csv';
};

// Robust CSV parsing (handles quotes, embedded newlines, delimiter detection, BOM)
const parseCSVText = (text: string): any[][] => {
  const parsed = Papa.parse<string[]>(text, {
    skipEmptyLines: 'greedy',
    delimiter: '',
  });

  if (parsed.errors?.length) {
    throw new Error(parsed.errors[0]?.message || 'Invalid CSV file');
  }

  return (parsed.data || []) as any[][];
};

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

// All available property columns matching the database schema
const PROPERTY_COLUMNS = [
  'property_id', 'source', 'source_loan_number', 'deal_stage', 
  'address', 'city', 'state', 'zip_code', 'county',
  'property_type', 'zoning', 'num_units', 'bedrooms', 'bathrooms', 
  'square_feet', 'lot_size', 'year_built',
  'occupancy_status', 'owner_occupied', 
  'bpo', 'arv', 'latest_property_value', 'zillow_value',
  'upb', 'total_balance', 'accrued_interest', 'deferred_balance',
  'corporate_advances', 'escrow_balance', 'estimated_legal_balance',
  'estimated_full_payoff', 'current_interest_rate', 'original_interest_rate',
  'original_loan_amount', 'original_term_months', 'remaining_term_months',
  'lien_position', 'last_payment_date', 'days_since_last_payment',
  'delinquent_status', 'foreclosure_flag', 'foreclosure_status', 
  'foreclosure_start_date', 'bankruptcy_flag', 'bankruptcy_status',
  'bankruptcy_case_number', 'bankruptcy_filing_type', 'bankruptcy_filing_date',
  'reo_flag', 'strike_price', 'discount_to_upb', 'discount_to_bpo',
  'estimated_roi', 'estimated_irr', 'projected_hold_period_months',
  'risk_score', 'original_lender', 'current_servicer',
  'owner_first_name', 'owner_last_name', 'notes', 'internal_notes'
];

// Integer columns
const INTEGER_COLUMNS = [
  'num_units', 'bedrooms', 'square_feet', 'lot_size', 'year_built',
  'original_term_months', 'remaining_term_months', 'lien_position',
  'days_since_last_payment', 'projected_hold_period_months', 'risk_score'
];

// Decimal columns
const DECIMAL_COLUMNS = [
  'bathrooms', 'bpo', 'arv', 'latest_property_value', 'zillow_value',
  'upb', 'total_balance', 'accrued_interest', 'deferred_balance',
  'corporate_advances', 'escrow_balance', 'estimated_legal_balance',
  'estimated_full_payoff', 'current_interest_rate', 'original_interest_rate',
  'original_loan_amount', 'strike_price', 'discount_to_upb', 'discount_to_bpo',
  'estimated_roi', 'estimated_irr'
];

// Boolean columns
const BOOLEAN_COLUMNS = [
  'foreclosure_flag', 'bankruptcy_flag', 'owner_occupied', 'reo_flag'
];

// Date columns
const DATE_COLUMNS = [
  'last_payment_date', 'foreclosure_start_date', 'bankruptcy_filing_date',
  'loan_origination_date', 'maturity_date', 'latest_value_date'
];

export function useDataImport() {
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [sourceColumns, setSourceColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

  const parseFile = useCallback(async (file: File) => {
    setParsing(true);
    try {
      let jsonData: any[][];
      
      // Handle CSV files with custom parser for better reliability
      if (isCSVFile(file)) {
        const text = await file.text();
        jsonData = parseCSVText(text);
      } else {
        // Use xlsx for Excel files
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];
      }

      if (jsonData.length < 2) {
        throw new Error('File must have at least a header row and one data row');
      }

      const headers = (jsonData[0] as string[]).map(h => String(h || '').trim());
      const rows = jsonData.slice(1)
        .filter(row => row.some(cell => cell !== null && cell !== undefined && cell !== ''))
        .map(row => {
          const obj: Record<string, any> = {};
          headers.forEach((header, i) => {
            obj[header] = row[i];
          });
          return obj;
        });

      setSourceColumns(headers);
      setParsedData(rows);

      // Auto-map columns with matching names
      const autoMappings: ColumnMapping[] = [];
      headers.forEach(header => {
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
        const matchingColumn = PROPERTY_COLUMNS.find(col => {
          const colNorm = col.toLowerCase();
          return col === normalizedHeader || 
                 colNorm === normalizedHeader ||
                 colNorm.includes(normalizedHeader) || 
                 normalizedHeader.includes(colNorm) ||
                 // Common aliases
                 (normalizedHeader === 'sqft' && col === 'square_feet') ||
                 (normalizedHeader === 'sq_ft' && col === 'square_feet') ||
                 (normalizedHeader === 'sqft_gla' && col === 'square_feet') ||
                 (normalizedHeader === 'units' && col === 'num_units') ||
                 (normalizedHeader === 'beds' && col === 'bedrooms') ||
                 (normalizedHeader === 'baths' && col === 'bathrooms') ||
                 (normalizedHeader === 'loan_number' && col === 'source_loan_number');
        });
        if (matchingColumn && !autoMappings.find(m => m.targetColumn === matchingColumn)) {
          autoMappings.push({ sourceColumn: header, targetColumn: matchingColumn });
        }
      });
      setColumnMappings(autoMappings);

      toast.success(`Parsed ${rows.length} rows from file`);
      return { headers, rows };

    } catch (error) {
      console.error('Parse error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to parse file');
      throw error;
    } finally {
      setParsing(false);
    }
  }, []);

  const updateMapping = useCallback((sourceColumn: string, targetColumn: string) => {
    setColumnMappings(prev => {
      const existing = prev.findIndex(m => m.sourceColumn === sourceColumn);
      if (existing >= 0) {
        if (!targetColumn) {
          return prev.filter((_, i) => i !== existing);
        }
        const updated = [...prev];
        updated[existing] = { sourceColumn, targetColumn };
        return updated;
      }
      if (targetColumn) {
        return [...prev, { sourceColumn, targetColumn }];
      }
      return prev;
    });
  }, []);

  const parseValue = (value: any, targetColumn: string): any => {
    if (value === null || value === undefined || value === '' || value === '-') {
      return null;
    }

    // Integer columns
    if (INTEGER_COLUMNS.includes(targetColumn)) {
      const num = parseInt(String(value).replace(/[^0-9-]/g, ''), 10);
      return isNaN(num) ? null : num;
    }

    // Decimal columns
    if (DECIMAL_COLUMNS.includes(targetColumn)) {
      const cleaned = String(value).replace(/[$,%]/g, '').replace(/,/g, '');
      const num = parseFloat(cleaned);
      return isNaN(num) ? null : num;
    }

    // Boolean columns
    if (BOOLEAN_COLUMNS.includes(targetColumn)) {
      const strVal = String(value).toLowerCase().trim();
      return strVal === 'true' || strVal === 'yes' || strVal === 'y' || strVal === '1';
    }

    // Date columns
    if (DATE_COLUMNS.includes(targetColumn)) {
      if (value instanceof Date) {
        return value.toISOString().split('T')[0];
      }
      const dateStr = String(value);
      // Try parsing various date formats
      const parsed = new Date(dateStr);
      if (!isNaN(parsed.getTime())) {
        return parsed.toISOString().split('T')[0];
      }
      return null;
    }

    // String columns - trim and return
    return String(value).trim();
  };

  const importData = useCallback(async (): Promise<ImportResult> => {
    setImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error('You must be signed in to import data.');
      }

      const rowsToImport: any[] = [];

      for (let rowIndex = 0; rowIndex < parsedData.length; rowIndex++) {
        const row = parsedData[rowIndex];

        const mappedRow: Record<string, any> = {
          created_by: user.id,
          last_modified_by: user.id,
          is_active: true,
          deal_stage: 'Active',
        };

        columnMappings.forEach((mapping) => {
          const value = row[mapping.sourceColumn];
          mappedRow[mapping.targetColumn] = parseValue(value, mapping.targetColumn);
        });

        // Ensure required fields
        if (!mappedRow.property_id) {
          mappedRow.property_id = `IMPORT-${Date.now()}-${rowIndex}`;
        }
        if (!mappedRow.source) {
          mappedRow.source = 'Data Import';
        }
        if (!mappedRow.state) {
          mappedRow.state = 'NY';
        }

        // Validate required fields
        if (!mappedRow.address || !mappedRow.city || !mappedRow.zip_code) {
          result.failed++;
          result.errors.push(`Row ${rowIndex + 1}: Missing required fields (address, city, or zip_code)`);
          continue;
        }

        rowsToImport.push(mappedRow);
      }

      if (rowsToImport.length === 0) {
        toast.error('No valid rows to import.');
        return result;
      }

      // Use backend import function (more reliable: handles larger payloads + avoids client-side permission issues)
      type ImportFnResponse = {
        success: boolean;
        inserted: number;
        total: number;
        errors?: string[];
      };

      const { data, error } = await supabase.functions.invoke<ImportFnResponse>('import-properties', {
        body: { properties: rowsToImport },
      });

      if (error) {
        throw new Error(error.message || 'Import failed');
      }

      const inserted = data?.inserted ?? 0;
      const total = data?.total ?? rowsToImport.length;

      result.success += inserted;
      const backendFailed = Math.max(0, total - inserted);
      if (backendFailed > 0) result.failed += backendFailed;

      if (data?.errors?.length) {
        result.errors.push(...data.errors);
      }

      if (result.success > 0) toast.success(`Imported ${result.success} properties`);
      if (result.failed > 0) toast.error(`Failed to import ${result.failed} rows`);

      return result;

    } catch (error) {
      console.error('Import error:', error);
      toast.error(error instanceof Error ? error.message : 'Import failed');
      throw error;
    } finally {
      setImporting(false);
    }
  }, [parsedData, columnMappings]);

  const reset = useCallback(() => {
    setParsedData([]);
    setSourceColumns([]);
    setColumnMappings([]);
  }, []);

  return {
    parseFile,
    updateMapping,
    importData,
    reset,
    parsing,
    importing,
    parsedData,
    sourceColumns,
    columnMappings,
    targetColumns: PROPERTY_COLUMNS
  };
}
