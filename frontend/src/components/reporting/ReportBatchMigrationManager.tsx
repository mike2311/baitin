import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Play, CheckCircle, XCircle, Clock, Database, FileText, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ReportBatchMigrationApiService from '@/services/api/reportBatchMigration';

/**
 * Report Batch Migration Manager Component
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Batch migration management UI
 *   - Progress tracking and monitoring
 *   - Validation and performance reporting
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */

interface MigrationProgress {
  batchId: string;
  totalBatches: number;
  completedBatches: number;
  totalReports: number;
  completedReports: number;
  failedReports: number;
  overallProgress: number;
}

interface BatchMigrationStatus {
  batchId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  totalReports: number;
  completedReports: number;
  failedReports: number;
  startTime?: Date;
  endTime?: Date;
  reports: Array<{
    reportKey: string;
    status: string;
    errorMessage?: string;
    performanceMetrics?: {
      queryExecutionTime: number;
      dataProcessingTime: number;
      totalExecutionTime: number;
      rowCount: number;
    };
    validationResults?: {
      sqlValid: boolean;
      parametersValid: boolean;
      dataConsistency: boolean;
      performanceAcceptable: boolean;
    };
  }>;
}

const ReportBatchMigrationManager: React.FC = () => {
  const [migrating, setMigrating] = useState(false);
  const [progress, setProgress] = useState<MigrationProgress | null>(null);
  const [currentBatch, setCurrentBatch] = useState<BatchMigrationStatus | null>(null);
  const [pendingReports, setPendingReports] = useState<string[]>([]);
  const { toast } = useToast();

  // Load initial data
  useEffect(() => {
    loadProgress();
    loadPendingReports();
  }, []);

  const loadProgress = async () => {
    try {
      const data = await ReportBatchMigrationApiService.getMigrationProgress();
      setProgress(data);
    } catch (error) {
      console.error('Failed to load progress:', error);
    }
  };

  const loadPendingReports = async () => {
    try {
      const data = await ReportBatchMigrationApiService.getPendingReports(20);
      setPendingReports(data);
    } catch (error) {
      console.error('Failed to load pending reports:', error);
    }
  };

  const startNextBatch = async () => {
    if (migrating) return;

    setMigrating(true);
    try {
      // Create next batch
      const batchData = await ReportBatchMigrationApiService.createNextBatch();

      // Execute the batch
      const result = await ReportBatchMigrationApiService.migrateReportBatch(batchData);
      setCurrentBatch(result);

      toast({
        title: 'Batch Migration Completed',
        description: `Successfully migrated ${result.completedReports}/${result.totalReports} reports`,
      });

      // Refresh data
      await loadProgress();
      await loadPendingReports();

    } catch (error: any) {
      console.error('Batch migration failed:', error);
      toast({
        title: 'Migration Failed',
        description: error.message || 'Failed to migrate batch',
        variant: 'destructive',
      });
    } finally {
      setMigrating(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'validated':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'in_progress':
        return <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive'> = {
      validated: 'default',
      failed: 'destructive',
      in_progress: 'secondary',
      pending: 'secondary',
    };

    return (
      <Badge variant={variants[status] || 'secondary'}>
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.totalReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{progress?.completedReports || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(progress?.totalReports || 0) - (progress?.completedReports || 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progress?.overallProgress.toFixed(1) || 0}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      {progress && (
        <Card>
          <CardHeader>
            <CardTitle>Migration Progress</CardTitle>
            <CardDescription>
              Overall progress of report migration across all batches
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Progress value={progress.overallProgress} className="w-full" />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{progress.completedReports} of {progress.totalReports} reports completed</span>
                <span>{progress.failedReports} failed</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Batch Status */}
      {currentBatch && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {getStatusIcon(currentBatch.status)}
              Current Batch: {currentBatch.batchId}
            </CardTitle>
            <CardDescription>
              {currentBatch.status === 'completed' && `Completed in ${currentBatch.endTime && currentBatch.startTime ?
                Math.round((new Date(currentBatch.endTime).getTime() - new Date(currentBatch.startTime).getTime()) / 1000) : 0} seconds`}
              {currentBatch.status === 'in_progress' && 'Migration in progress...'}
              {currentBatch.status === 'failed' && 'Migration failed'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{currentBatch.totalReports}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentBatch.completedReports}</div>
                  <div className="text-sm text-muted-foreground">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{currentBatch.failedReports}</div>
                  <div className="text-sm text-muted-foreground">Failed</div>
                </div>
              </div>

              {/* Report Details */}
              <div className="max-h-96 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Report</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Execution Time</TableHead>
                      <TableHead>Row Count</TableHead>
                      <TableHead>Validation</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {currentBatch.reports.map((report) => (
                      <TableRow key={report.reportKey}>
                        <TableCell className="font-mono text-sm">{report.reportKey}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(report.status)}
                            {getStatusBadge(report.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          {report.performanceMetrics?.totalExecutionTime ?
                            `${report.performanceMetrics.totalExecutionTime}ms` : '-'}
                        </TableCell>
                        <TableCell>
                          {report.performanceMetrics?.rowCount || '-'}
                        </TableCell>
                        <TableCell>
                          {report.validationResults && (
                            <div className="flex gap-1">
                              {report.validationResults.sqlValid && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {!report.validationResults.sqlValid && <XCircle className="h-3 w-3 text-red-600" />}
                              {report.validationResults.dataConsistency && <CheckCircle className="h-3 w-3 text-green-600" />}
                              {!report.validationResults.dataConsistency && <XCircle className="h-3 w-3 text-red-600" />}
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Pending Reports */}
      {pendingReports.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Reports ({pendingReports.length})</CardTitle>
            <CardDescription>
              Next batch of reports ready for migration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 mb-4">
              <Button
                onClick={startNextBatch}
                disabled={migrating}
                className="flex items-center gap-2"
              >
                {migrating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Migrating Batch...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    Start Next Batch ({pendingReports.length} reports)
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={loadPendingReports}>
                Refresh
              </Button>
            </div>

            <div className="max-h-48 overflow-y-auto">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {pendingReports.map((reportKey) => (
                  <Badge key={reportKey} variant="outline" className="font-mono text-xs">
                    {reportKey}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Migration Complete */}
      {progress && progress.overallProgress >= 100 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All reports have been migrated! The reporting system is now fully operational.
          </AlertDescription>
        </Alert>
      )}

      {/* Instructions */}
      {!progress && (
        <Alert>
          <Database className="h-4 w-4" />
          <AlertDescription>
            Report migration system is ready. Use the backend command `npm run seed-reports` to seed report definitions, then use this interface to manage batch migrations.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ReportBatchMigrationManager;