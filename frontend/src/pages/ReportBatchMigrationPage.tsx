import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Database, FileText, TrendingUp } from 'lucide-react';
import ReportBatchMigrationManager from '@/components/reporting/ReportBatchMigrationManager';

/**
 * Report Batch Migration Page
 *
 * Original Logic Reference:
 * - Legacy Reports: 116+ .frx report files
 * - Documentation: docs/source/06-reporting/report-inventory.md
 * - Business Rules:
 *   - Batch migration management interface
 *   - Progress monitoring and reporting
 *   - Validation and performance tracking
 *
 * Reference: Phase 3 - Reporting Batch Migration
 */
const ReportBatchMigrationPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Report Batch Migration</h1>
          <p className="text-muted-foreground">
            Migrate 116+ legacy reports with automated validation and performance testing
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Database className="h-6 w-6" />
          <span className="font-medium">116+ Reports</span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <FileText className="h-5 w-5" />
              Legacy Reports
            </CardTitle>
            <CardDescription>
              116+ .frx report files from Visual FoxPro
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Transaction Reports</span>
                <span className="font-medium">50+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Analysis Reports</span>
                <span className="font-medium">20+</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Export Reports</span>
                <span className="font-medium">15+</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Migration Process
            </CardTitle>
            <CardDescription>
              Automated batch migration with validation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">SQL Validation</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Performance Testing</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Data Consistency</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Database className="h-5 w-5" />
              Modern Reports
            </CardTitle>
            <CardDescription>
              On-demand reports with PDF/Excel export
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Real-time Generation</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Multiple Formats</span>
                <span className="text-green-600">✓</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Parameter Support</span>
                <span className="text-green-600">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Migration Manager */}
      <ReportBatchMigrationManager />
    </div>
  );
};

export default ReportBatchMigrationPage;