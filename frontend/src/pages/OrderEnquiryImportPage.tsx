import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { ExcelFileUpload } from '../components/order-enquiry/ExcelFileUpload';
import {
  FieldMappingInterface,
  FieldMapping,
} from '../components/order-enquiry/FieldMappingInterface';
import { ImportErrorReport, ImportError } from '../components/order-enquiry/ImportErrorReport';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { useToast } from '../hooks/use-toast';
import {
  importOrderEnquiry,
  ImportOrderEnquiryDto,
  OrderEnquiryImportFormat,
} from '../services/api/orderEnquiryImport';
import { Label } from '../components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';
import { Alert, AlertDescription } from '../components/ui/alert';

/**
 * Order Enquiry Import Page
 *
 * Multi-step wizard for importing Order Enquiry data from Excel/CSV files.
 *
 * Steps:
 * 1. File Upload
 * 2. Field Mapping
 * 3. Data Preview
 * 4. Import Execution
 * 5. Error Reporting (if errors) or Success
 *
 * Reference: Task 06 - Main Import Page
 */

type ImportStep = 'upload' | 'mapping' | 'preview' | 'importing' | 'success' | 'error';

export default function OrderEnquiryImportPage() {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentStep, setCurrentStep] = useState<ImportStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<FieldMapping>({});
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);
  const [importResult, setImportResult] = useState<{
    importedOes: number;
    created: Array<{ oeNo: string; lines: number }>;
  } | null>(null);
  const [companyCode, setCompanyCode] = useState<string>('HT');
  const [format] = useState<OrderEnquiryImportFormat | undefined>(undefined);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileSelect = useCallback((file: File) => {
    setSelectedFile(file);
    setUploadProgress(0);
    setImportErrors([]);
    setImportResult(null);
    // Auto-advance to mapping step for CSV files
    if (file.name.toLowerCase().endsWith('.csv')) {
      setCurrentStep('mapping');
    }
  }, []);

  const handleMappingChange = useCallback((newMapping: FieldMapping) => {
    setMapping(newMapping);
    // For PoC, we'll skip actual preview parsing
    // The backend will handle the actual parsing during import
  }, []);

  const handleImport = useCallback(async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file first',
        variant: 'destructive',
      });
      return;
    }

    if (!companyCode) {
      toast({
        title: 'Error',
        description: 'Please select a company code',
        variant: 'destructive',
      });
      return;
    }

    setCurrentStep('importing');
    setUploadProgress(0);

    let progressInterval: ReturnType<typeof setInterval> | null = null;

    try {
      const dto: ImportOrderEnquiryDto = {
        companyCode,
        format,
      };

      // Simulate upload progress
      progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            if (progressInterval) clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const result = await importOrderEnquiry(selectedFile, dto);
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(100);

      setImportResult({
        importedOes: result.importedOes,
        created: result.created,
      });

      toast({
        title: 'Success',
        description: `Successfully imported ${result.importedOes} Order Enquiry${result.importedOes !== 1 ? 'ies' : ''}`,
      });

      setCurrentStep('success');
    } catch (error: unknown) {
      if (progressInterval) clearInterval(progressInterval);
      setUploadProgress(0);

      const err = error as {
        response?: { status?: number; data?: { message?: string } };
        message?: string;
      };

      const errorMessage =
        err?.response?.data?.message ||
        err?.message ||
        'An error occurred during import';

      // Parse error message to extract row numbers and create error objects
      const errors: ImportError[] = [];
      
      // Check for common error patterns
      if (errorMessage.includes('No OE Control record')) {
        errors.push({
          message: errorMessage,
          type: 'critical',
          field: 'oeNo',
          rowNumber: undefined,
        });
      } else if (errorMessage.includes('Invalid item(s)')) {
        errors.push({
          message: errorMessage,
          type: 'critical',
          field: 'itemNo',
          rowNumber: undefined,
        });
      } else if (errorMessage.includes('Missing customer')) {
        errors.push({
          message: errorMessage,
          type: 'critical',
          field: 'custNo',
          rowNumber: undefined,
        });
      } else {
        errors.push({
          message: errorMessage,
          type: 'critical',
          rowNumber: undefined,
        });
      }

      setImportErrors(errors);
      setCurrentStep('error');

      toast({
        title: 'Import Failed',
        description: errorMessage,
        variant: 'destructive',
      });
    }
  }, [selectedFile, companyCode, format, toast]);

  const handlePreview = useCallback(() => {
    // For PoC, we'll skip actual preview parsing
    // The backend handles parsing during import
    setCurrentStep('importing');
    handleImport();
  }, [handleImport]);

  const handleBack = useCallback(() => {
    if (currentStep === 'mapping') {
      setCurrentStep('upload');
    } else if (currentStep === 'preview') {
      setCurrentStep('mapping');
    } else if (currentStep === 'error') {
      setCurrentStep('upload');
      setImportErrors([]);
    }
  }, [currentStep]);

  const handleRetry = useCallback(() => {
    setImportErrors([]);
    setCurrentStep('upload');
    setSelectedFile(null);
    setMapping({});
    setImportResult(null);
  }, []);

  const handleFinish = useCallback(() => {
    navigate('/order-enquiry/list');
  }, [navigate]);

  const canProceedToMapping = selectedFile !== null;
  const canProceedToPreview = selectedFile !== null && Object.keys(mapping).length > 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Import Order Enquiry</h1>
            <p className="text-gray-600 mt-2">
              Import Order Enquiry data from Excel or CSV files
            </p>
          </div>

          {/* Progress Indicator */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div
                  className={`flex-1 text-center ${
                    currentStep === 'upload' ? 'font-bold' : ''
                  }`}
                >
                  1. Upload
                </div>
                <div className="flex-1 border-t-2 border-gray-300 mx-2" />
                <div
                  className={`flex-1 text-center ${
                    currentStep === 'mapping' ? 'font-bold' : ''
                  }`}
                >
                  2. Mapping
                </div>
                <div className="flex-1 border-t-2 border-gray-300 mx-2" />
                <div
                  className={`flex-1 text-center ${
                    currentStep === 'preview' || currentStep === 'importing' ? 'font-bold' : ''
                  }`}
                >
                  3. Import
                </div>
              </div>
              {currentStep === 'importing' && uploadProgress > 0 && (
                <Progress value={uploadProgress} className="h-2" />
              )}
            </CardContent>
          </Card>

          {/* Step 1: File Upload */}
          {currentStep === 'upload' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Company Code</CardTitle>
                  <CardDescription>
                    Select the company code for this import
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label>Company Code</Label>
                    <Select value={companyCode} onValueChange={setCompanyCode}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="HT">HT</SelectItem>
                        <SelectItem value="BAT">BAT</SelectItem>
                        <SelectItem value="INSP">INSP</SelectItem>
                        <SelectItem value="HFW">HFW</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <ExcelFileUpload
                onFileSelect={handleFileSelect}
                onError={(error) => {
                  toast({
                    title: 'File Error',
                    description: error,
                    variant: 'destructive',
                  });
                }}
              />

              <div className="flex justify-end">
                <Button
                  onClick={() => setCurrentStep('mapping')}
                  disabled={!canProceedToMapping}
                >
                  Next: Field Mapping
                </Button>
              </div>
            </div>
          )}

          {/* Step 2: Field Mapping */}
          {currentStep === 'mapping' && selectedFile && (
            <div className="space-y-4">
              <FieldMappingInterface
                file={selectedFile}
                onMappingChange={handleMappingChange}
                initialMapping={mapping}
              />

              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button
                  onClick={() => setCurrentStep('preview')}
                  disabled={!canProceedToPreview}
                >
                  Next: Preview & Import
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Preview & Import */}
          {currentStep === 'preview' && (
            <div className="space-y-4">
              <Alert>
                <AlertDescription>
                  For PoC, the backend will parse and validate the file during import.
                  Click "Import" to proceed.
                </AlertDescription>
              </Alert>

              <div className="flex justify-between">
                <Button onClick={handleBack} variant="outline">
                  Back
                </Button>
                <Button onClick={handlePreview}>Import</Button>
              </div>
            </div>
          )}

          {/* Step 4: Importing */}
          {currentStep === 'importing' && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <div className="text-4xl">⏳</div>
                  <div>
                    <h3 className="text-lg font-semibold">Importing...</h3>
                    <p className="text-gray-600">
                      Please wait while we process your file
                    </p>
                  </div>
                  {uploadProgress > 0 && (
                    <Progress value={uploadProgress} className="h-2" />
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 5: Success */}
          {currentStep === 'success' && importResult && (
            <Card>
              <CardHeader>
                <CardTitle>Import Successful!</CardTitle>
                <CardDescription>
                  Your Order Enquiry data has been imported successfully.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">
                    Imported {importResult.importedOes} Order Enquiry
                    {importResult.importedOes !== 1 ? 'ies' : ''}
                  </p>
                  {importResult.created.length > 0 && (
                    <ul className="list-disc list-inside mt-2 space-y-1">
                      {importResult.created.map((item) => (
                        <li key={item.oeNo}>
                          {item.oeNo}: {item.lines} line{item.lines !== 1 ? 's' : ''}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleFinish}>View Order Enquiries</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 6: Error */}
          {currentStep === 'error' && importErrors.length > 0 && (
            <div className="space-y-4">
              <ImportErrorReport errors={importErrors} />

              <div className="flex justify-between">
                <Button onClick={handleRetry} variant="outline">
                  Start Over
                </Button>
                <Button onClick={handleBack} variant="outline">
                  Back to Upload
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
