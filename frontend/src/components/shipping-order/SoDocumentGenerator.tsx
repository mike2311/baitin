import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, FileText, Download, Eye } from 'lucide-react';
import ShippingOrderApiService from '@/services/api/shipping-orders';
import { useToast } from '@/hooks/use-toast';

/**
 * SO Document Generator Component
 *
 * Original Logic Reference:
 * - Legacy Form: pso (Print Shipping Order)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Generate SO documents from selected SO numbers
 *   - Apply customer-specific format
 *   - Support preview and export
 *
 * Reference: Phase 3 - SO Document Generation
 */
interface SoDocumentGeneratorProps {
  selectedSoNos: string[];
  onClose?: () => void;
}

const SoDocumentGenerator: React.FC<SoDocumentGeneratorProps> = ({
  selectedSoNos,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [formatKey, setFormatKey] = useState<string>('');
  const [outputFormat, setOutputFormat] = useState<'pdf' | 'excel' | 'html'>('pdf');
  const [addressType, setAddressType] = useState<'shipping' | 'loading'>('shipping');
  const { toast } = useToast();

  const handlePreview = async () => {
    if (selectedSoNos.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Shipping Order',
        variant: 'destructive',
      });
      return;
    }

    try {
      setPreviewLoading(true);
      const preview = await ShippingOrderApiService.previewSoDocument({
        soNos: selectedSoNos,
        formatKey: formatKey || undefined,
        addressType,
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
    if (selectedSoNos.length === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Shipping Order',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const blob = await ShippingOrderApiService.generateSoDocument({
        soNos: selectedSoNos,
        formatKey: formatKey || undefined,
        outputFormat,
        addressType,
        fileName: `SO_${selectedSoNos.join('_')}_${new Date().toISOString().split('T')[0]}.${outputFormat === 'excel' ? 'xlsx' : 'pdf'}`,
      });

      // Create download link
      const fileName = `SO_${selectedSoNos.join('_')}_${new Date().toISOString().split('T')[0]}.${outputFormat === 'excel' ? 'xlsx' : 'pdf'}`;
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
        description: `SO document generated successfully`,
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
            Generate Shipping Order Document
          </CardTitle>
          <CardDescription>
            Generate print-ready documents for selected Shipping Orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Selected SOs */}
            <div>
              <Label>Selected Shipping Orders ({selectedSoNos.length})</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {selectedSoNos.map(soNo => (
                  <Badge key={soNo} variant="outline">
                    {soNo}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Format Selection */}
            <div className="space-y-2">
              <Label htmlFor="formatKey">Format Key (Optional)</Label>
              <input
                id="formatKey"
                type="text"
                value={formatKey}
                onChange={(e) => setFormatKey(e.target.value)}
                placeholder="Leave empty for default format"
                className="w-full px-3 py-2 border rounded-md"
              />
              <p className="text-xs text-muted-foreground">
                Enter format key from zsoformat table, or leave empty for standard format
              </p>
            </div>

            {/* Output Format */}
            <div className="space-y-2">
              <Label htmlFor="outputFormat">Output Format</Label>
              <Select value={outputFormat} onValueChange={(value) => setOutputFormat(value as 'pdf' | 'excel' | 'html')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="excel">Excel</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Address Type */}
            <div className="space-y-2">
              <Label htmlFor="addressType">Address Type</Label>
              <Select value={addressType} onValueChange={(value) => setAddressType(value as 'shipping' | 'loading')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="shipping">Shipping Address</SelectItem>
                  <SelectItem value="loading">Loading Address</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={previewLoading || selectedSoNos.length === 0}
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
                disabled={loading || selectedSoNos.length === 0}
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
              {previewData.data.map((so: any, index: number) => (
                <div key={index} className="border rounded-lg p-4 space-y-2">
                  <div className="font-bold">SO Number: {so.soNo}</div>
                  <div>Date: {so.date ? new Date(so.date).toLocaleDateString() : ''}</div>
                  <div>Customer: {so.customerName || ''}</div>
                  {so.items && so.items.length > 0 && (
                    <div>
                      <div className="font-semibold mt-2">Items ({so.items.length}):</div>
                      <div className="text-sm space-y-1">
                        {so.items.map((item: any, itemIndex: number) => (
                          <div key={itemIndex} className="pl-4">
                            {item.itemNo} - {item.itemDescription || 'No description'} - Qty: {item.qty}
                            {item.ctn && ` - Cartons: ${item.ctn}`}
                          </div>
                        ))}
                      </div>
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

export default SoDocumentGenerator;