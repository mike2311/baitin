import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Eye } from 'lucide-react';
import InvoiceApiService from '@/services/api/invoices';
import { useToast } from '@/hooks/use-toast';

/**
 * Invoice Document Generator Component
 *
 * Original Logic Reference:
 * - Legacy Forms: ppacklist_new, ppacklist_xls_spencer, pshadvice, pdebitnote
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Generate packing list, shipment advice, or debit note
 *   - Support customer-specific formats (Spencer)
 *   - Weight unit conversion
 *
 * Reference: Phase 3 - Invoice Document Generation
 */
interface InvoiceDocumentGeneratorProps {
  selectedInvNos: string[];
  onClose?: () => void;
}

const InvoiceDocumentGenerator: React.FC<InvoiceDocumentGeneratorProps> = ({
  selectedInvNos,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [documentType, setDocumentType] = useState<'packing_list' | 'packing_list_spencer' | 'shipment_advice' | 'debit_note' | 'invoice'>('packing_list');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel' | 'html'>('excel');
  const [containerNo, setContainerNo] = useState<string>('');
  const { toast } = useToast();

  const handlePreview = async () => {
    if (selectedInvNos.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Invoice',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPreviewLoading(true);
      const preview = await InvoiceApiService.previewInvoiceDocument({
        invNos: selectedInvNos,
        documentType,
        containerNo: containerNo || undefined,
      });
      setPreviewData(preview);
    } catch (error: any) {
      console.error('Preview failed:', error);
      toast({
        title: 'Preview Error',
        description: error.response?.data?.message || 'Failed to preview document',
        variant: 'destructive',
      });
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    if (selectedInvNos.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Invoice',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const blob = await InvoiceApiService.generateInvoiceDocument({
        invNos: selectedInvNos,
        documentType,
        outputFormat,
        containerNo: containerNo || undefined,
        fileName: `${documentType}_${selectedInvNos.join('_')}_${new Date().toISOString().split('T')[0]}.${outputFormat === 'excel' ? 'xlsx' : 'pdf'}`,
      });

      // Create download link
      const fileName = `${documentType}_${selectedInvNos.join('_')}_${new Date().toISOString().split('T')[0]}.${outputFormat === 'excel' ? 'xlsx' : 'pdf'}`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: `Invoice document generated successfully`,
      });

      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error('Generation failed:', error);
      toast({
        title: 'Generation Error',
        description: error.response?.data?.message || 'Failed to generate document',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Generate Invoice Document
          </CardTitle>
          <CardDescription>
            Generate packing list, shipment advice, debit note, or invoice documents
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected Invoices */}
            <div>
              <Label>Selected Invoices ({selectedInvNos.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedInvNos.map(invNo => (
                  <Badge key={invNo} variant="outline">
                    {invNo}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">Document Type *</Label>
              <Select value={documentType} onValueChange={(value) => setDocumentType(value as any)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="packing_list">Packing List (Standard)</SelectItem>
                  <SelectItem value="packing_list_spencer">Packing List (Spencer Format)</SelectItem>
                  <SelectItem value="shipment_advice">Shipment Advice</SelectItem>
                  <SelectItem value="debit_note">Debit Note</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'pdf' | 'excel' | 'html')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Container Number (for packing list) */}
            {(documentType === 'packing_list' || documentType === 'packing_list_spencer') && (
              <div className="space-y-2">
                <Label htmlFor="containerNo">Container Number (Optional)</Label>
                <input
                  id="containerNo"
                  type="text"
                  value={containerNo}
                  onChange={(e) => setContainerNo(e.target.value)}
                  placeholder="Filter by container number"
                  className="w-full px-3 py-2 border rounded-md"
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to include all containers
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={previewLoading || selectedInvNos.length === 0}
              >
                {previewLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading Preview...
                  </>
                ) : (
                  <>
                    <Eye className="mr-2 h-4 w-4" />
                    Preview
                  </>
                )}
              </Button>

              <Button
                onClick={handleGenerate}
                disabled={loading || selectedInvNos.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Generate & Download
                  </>
                )}
              </Button>

              {onClose && (
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview Section */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Document Preview</CardTitle>
            <CardDescription>
              Preview of the document that will be generated
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {previewData.data.map((inv: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="font-bold">Invoice Number: {inv.invNo}</div>
                  <div>Date: {inv.date ? new Date(inv.date).toLocaleDateString() : ''}</div>
                  <div>Customer: {inv.customerName || ''}</div>
                  {inv.items && inv.items.length > 0 && (
                    <div>
                      <div className="font-semibold mt-2">Items ({inv.items.length}):</div>
                      <div className="text-sm space-y-1">
                        {inv.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="pl-4">
                            {item.itemNo} - {item.itemName || item.itemDescription || 'No description'} - Qty: {item.qty}
                            {item.ctn && ` - Cartons: ${item.ctn}`}
                            {item.net && ` - Net Wt: ${item.net.toFixed(2)}`}
                            {item.wt && ` - Gross Wt: ${item.wt.toFixed(2)}`}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {inv.totalCartons && (
                    <div className="mt-2 text-sm">
                      <div>Total Cartons: {inv.totalCartons}</div>
                      <div>Total Qty: {inv.totalQty}</div>
                      {inv.totalNet && <div>Total Net Weight: {inv.totalNet.toFixed(2)}</div>}
                      {inv.totalWt && <div>Total Gross Weight: {inv.totalWt.toFixed(2)}</div>}
                      {inv.totalCube && <div>Total Cube: {inv.totalCube.toFixed(2)}</div>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceDocumentGenerator;