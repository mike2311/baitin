import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';

/**
 * Excel File Upload Component
 *
 * Provides drag-and-drop and file browse functionality for Excel/CSV file upload.
 *
 * Features:
 * - Drag and drop support
 * - File browse button
 * - File type validation (.xlsx, .xls, .csv)
 * - File size validation (max 10MB)
 * - Upload progress indicator
 * - File preview (filename, size)
 *
 * Reference: Task 01-01 - File Upload Component
 */

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_EXTENSIONS = ['.xlsx', '.xls', '.csv'];
const ALLOWED_MIME_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
  'application/csv', // .csv
];

export interface ExcelFileUploadProps {
  onFileSelect: (file: File) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

export function ExcelFileUpload({
  onFileSelect,
  onError,
  disabled = false,
  className,
}: ExcelFileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback(
    (file: File): string | null => {
      // Check file extension
      const fileName = file.name.toLowerCase();
      const hasValidExtension = ALLOWED_EXTENSIONS.some((ext) =>
        fileName.endsWith(ext),
      );

      if (!hasValidExtension) {
        return `Invalid file type. Please upload a file with one of these extensions: ${ALLOWED_EXTENSIONS.join(', ')}`;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        return `File size exceeds maximum allowed size of ${MAX_FILE_SIZE / 1024 / 1024}MB`;
      }

      // Check MIME type (optional, as some browsers may not set it correctly)
      if (file.type && !ALLOWED_MIME_TYPES.includes(file.type)) {
        // Don't fail on MIME type mismatch if extension is valid
        // Some browsers may not set MIME type correctly
      }

      return null;
    },
    [],
  );

  const handleFile = useCallback(
    (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setError(validationError);
        setSelectedFile(null);
        if (onError) {
          onError(validationError);
        }
        return;
      }

      setError(null);
      setSelectedFile(file);
      setUploadProgress(0);
      onFileSelect(file);
    },
    [validateFile, onFileSelect, onError],
  );

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) {
        return;
      }

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        handleFile(files[0]);
      }
    },
    [disabled, handleFile],
  );

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile],
  );

  const handleBrowseClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(2)} KB`;
    }
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  };

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>Upload Excel File</CardTitle>
        <CardDescription>
          Upload an Excel or CSV file to import Order Enquiry data
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={cn(
            'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
            isDragging && !disabled
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400',
            disabled && 'opacity-50 cursor-not-allowed',
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={ALLOWED_EXTENSIONS.join(',')}
            onChange={handleFileInputChange}
            className="hidden"
            disabled={disabled}
          />

          <div className="space-y-4">
            <div className="text-4xl">📄</div>
            <div>
              <p className="text-lg font-medium">
                {isDragging ? 'Drop file here' : 'Drag and drop your file here'}
              </p>
              <p className="text-sm text-gray-500 mt-2">or</p>
            </div>
            <Button
              onClick={handleBrowseClick}
              disabled={disabled}
              variant="outline"
            >
              Browse Files
            </Button>
            <p className="text-xs text-gray-500">
              Supported formats: {ALLOWED_EXTENSIONS.join(', ')} (max{' '}
              {MAX_FILE_SIZE / 1024 / 1024}MB)
            </p>
          </div>
        </div>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {selectedFile && !error && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setError(null);
                  setUploadProgress(0);
                  if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                  }
                }}
              >
                Remove
              </Button>
            </div>
            {uploadProgress > 0 && uploadProgress < 100 && (
              <Progress value={uploadProgress} className="h-2" />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
