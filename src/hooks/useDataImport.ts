import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

interface ColumnMapping {
  sourceColumn: string;
  targetColumn: string;
}

interface ImportResult {
  success: number;
  failed: number;
  errors: string[];
}

const PROPERTY_COLUMNS = [
  'property_id', 'source', 'deal_stage', 'address', 'city', 'state', 'zip_code', 'county',
  'property_type', 'num_units', 'bedrooms', 'bathrooms', 'square_feet', 'year_built',
  'occupancy_status', 'owner_occupied', 'bpo', 'arv', 'upb', 'total_balance',
  'current_interest_rate', 'original_loan_amount', 'last_payment_date', 'delinquent_status',
  'foreclosure_flag', 'foreclosure_status', 'bankruptcy_flag', 'strike_price',
  'owner_first_name', 'owner_last_name', 'notes'
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
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

      if (jsonData.length < 2) {
        throw new Error('File must have at least a header row and one data row');
      }

      const headers = jsonData[0] as string[];
      const rows = jsonData.slice(1).map(row => {
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
        const normalizedHeader = header.toLowerCase().replace(/[^a-z0-9]/g, '_');
        const matchingColumn = PROPERTY_COLUMNS.find(col => 
          col === normalizedHeader || 
          col.includes(normalizedHeader) || 
          normalizedHeader.includes(col)
        );
        if (matchingColumn) {
          autoMappings.push({ sourceColumn: header, targetColumn: matchingColumn });
        }
      });
      setColumnMappings(autoMappings);

      toast.success(`Parsed ${rows.length} rows from file`);
      return { headers, rows };

    } catch (error) {
      console.error('Parse error:', error);
      toast.error('Failed to parse file');
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

  const importData = useCallback(async (): Promise<ImportResult> => {
    setImporting(true);
    const result: ImportResult = { success: 0, failed: 0, errors: [] };

    try {
      const { data: { user } } = await supabase.auth.getUser();

      for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        const mappedRow: Record<string, any> = {
          created_by: user?.id
        };

        columnMappings.forEach(mapping => {
          let value = row[mapping.sourceColumn];
          
          // Type conversions
          if (['num_units', 'bedrooms', 'square_feet', 'year_built'].includes(mapping.targetColumn)) {
            value = value ? parseInt(value) : null;
          } else if (['bathrooms', 'bpo', 'arv', 'upb', 'total_balance', 'strike_price', 'original_loan_amount', 'current_interest_rate'].includes(mapping.targetColumn)) {
            value = value ? parseFloat(String(value).replace(/[$,]/g, '')) : null;
          } else if (['foreclosure_flag', 'bankruptcy_flag', 'owner_occupied'].includes(mapping.targetColumn)) {
            value = value === true || value === 'true' || value === 'Yes' || value === 'Y' || value === 1;
          }

          mappedRow[mapping.targetColumn] = value;
        });

        // Ensure required fields
        if (!mappedRow.property_id) {
          mappedRow.property_id = `IMPORT-${Date.now()}-${i}`;
        }
        if (!mappedRow.source) {
          mappedRow.source = 'Data Import';
        }
        if (!mappedRow.address || !mappedRow.city || !mappedRow.zip_code) {
          result.failed++;
          result.errors.push(`Row ${i + 1}: Missing required fields (address, city, or zip_code)`);
          continue;
        }

        const { error } = await supabase.from('properties').insert(mappedRow as any);

        if (error) {
          result.failed++;
          result.errors.push(`Row ${i + 1}: ${error.message}`);
        } else {
          result.success++;
        }
      }

      if (result.success > 0) {
        toast.success(`Imported ${result.success} properties`);
      }
      if (result.failed > 0) {
        toast.error(`Failed to import ${result.failed} rows`);
      }

      return result;

    } catch (error) {
      console.error('Import error:', error);
      toast.error('Import failed');
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
