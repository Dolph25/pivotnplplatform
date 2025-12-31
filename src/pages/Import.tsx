import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { useDataImport } from '@/hooks/useDataImport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Upload, FileSpreadsheet, ArrowLeft, CheckCircle2, XCircle, Loader2 } from 'lucide-react';

const Import = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

  const {
    parseFile,
    updateMapping,
    importData,
    reset,
    parsing,
    importing,
    parsedData,
    sourceColumns,
    columnMappings,
    targetColumns
  } = useDataImport();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setImportResult(null);

    try {
      await parseFile(selectedFile);
    } catch {
      // If parsing fails, reset state so the UI doesn't get stuck
      setFile(null);
      reset();
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleImport = async () => {
    try {
      const result = await importData();
      setImportResult(result);
    } catch {
      // importData already shows a toast; keep UI on mapping screen
    }
  };

  const handleReset = () => {
    setFile(null);
    setImportResult(null);
    reset();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getMappingForSource = (sourceCol: string) => {
    return columnMappings.find(m => m.sourceColumn === sourceCol)?.targetColumn || '';
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} onSignOut={signOut} />
      
      <main className="container mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Data Import</h1>
            <p className="text-muted-foreground mt-1">Import properties from CSV or Excel files</p>
          </div>
        </div>

        {/* File Upload */}
        {!file && (
          <Card className="bg-card border-border">
            <CardContent className="p-12">
              <div 
                className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary/50 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Upload Data File</h3>
                <p className="text-muted-foreground mb-4">
                  Drag and drop or click to select a CSV or Excel file
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported formats: .csv, .xlsx, .xls
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
            </CardContent>
          </Card>
        )}

        {/* Parsing State */}
        {parsing && (
          <Card className="bg-card border-border">
            <CardContent className="p-12 text-center">
              <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
              <h3 className="text-lg font-medium text-foreground">Parsing file...</h3>
            </CardContent>
          </Card>
        )}

        {/* Column Mapping */}
        {file && !parsing && parsedData.length > 0 && !importResult && (
          <div className="space-y-6">
            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-primary" />
                  {file.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <p className="text-muted-foreground">
                    {parsedData.length} rows found • {sourceColumns.length} columns
                  </p>
                  <Button variant="outline" size="sm" onClick={handleReset}>
                    Choose Different File
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-card border-border">
              <CardHeader>
                <CardTitle>Column Mapping</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Map your file columns to property fields. Required: address, city, zip_code
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {sourceColumns.map((sourceCol) => (
                    <div key={sourceCol} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{sourceCol}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          Sample: {parsedData[0]?.[sourceCol] ?? 'empty'}
                        </p>
                      </div>
                      <Select
                        value={getMappingForSource(sourceCol)}
                        onValueChange={(value) => updateMapping(sourceCol, value)}
                      >
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Select field..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">-- Skip --</SelectItem>
                          {targetColumns.map((col) => (
                            <SelectItem key={col} value={col}>{col}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground">
                    {columnMappings.length} columns mapped
                  </p>
                  {(() => {
                    const required = ['address', 'city', 'zip_code'];
                    const requiredMapped = required.every((r) => columnMappings.some((m) => m.targetColumn === r));

                    return (
                      <Button
                        onClick={handleImport}
                        disabled={importing || columnMappings.length === 0 || !requiredMapped}
                        title={!requiredMapped ? 'Map address, city, and zip_code to enable import' : undefined}
                      >
                        {importing ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Importing...
                          </>
                        ) : (
                          <>Import {parsedData.length} Properties</>
                        )}
                      </Button>
                    );
                  })()}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Import Results */}
        {importResult && (
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle>Import Complete</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 bg-success/10 rounded-lg">
                  <CheckCircle2 className="w-8 h-8 text-success" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{importResult.success}</p>
                    <p className="text-sm text-muted-foreground">Successfully imported</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-destructive/10 rounded-lg">
                  <XCircle className="w-8 h-8 text-destructive" />
                  <div>
                    <p className="text-2xl font-bold text-foreground">{importResult.failed}</p>
                    <p className="text-sm text-muted-foreground">Failed to import</p>
                  </div>
                </div>
              </div>

              {importResult.errors.length > 0 && (
                <div className="mb-6">
                  <h4 className="font-medium text-foreground mb-2">Errors:</h4>
                  <div className="max-h-40 overflow-y-auto bg-muted/30 rounded-lg p-3">
                    {importResult.errors.map((error, i) => (
                      <p key={i} className="text-sm text-destructive">{error}</p>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Button onClick={handleReset}>Import Another File</Button>
                <Link to="/dashboard">
                  <Button variant="outline">View Dashboard</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Import;
