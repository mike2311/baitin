import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, FileText } from 'lucide-react';
import InvoiceApiService, {
  AvailableItemsForInvoiceResponse,
  CreateInvoiceFromSourceDto,
} from '@/services/api/invoices';
import { useToast } from '@/hooks/use-toast';

/**
 * Invoice Entry Component
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Create invoice from SO or DN source
 *   - Show available vs already invoiced items
 *   - Select items to invoice
 *
 * Reference: Phase 3 - Invoice Module
 */
interface FormData {
  invNo: string;
  date: string;
  sourceType: 'so' | 'dn';
  sourceNo: string;
  delDate?: string;
  ship?: string;
  loadingPort?: string;
  dest?: string;
}

const InvoiceEntry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<AvailableItemsForInvoiceResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [sourceValidated, setSourceValidated] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>();
  const watchedSourceType = watch('sourceType');
  const watchedSourceNo = watch('sourceNo');

  // Load available items when source changes
  useEffect(() => {
    if (watchedSourceType && watchedSourceNo && watchedSourceNo.trim()) {
      loadAvailableItems();
    } else {
      setAvailableItems([]);
      setSourceValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSourceType, watchedSourceNo]);

  const loadAvailableItems = async () => {
    if (!watchedSourceType || !watchedSourceNo?.trim()) return;

    try {
      setLoading(true);
      const items = await InvoiceApiService.getAvailableItemsForInvoice(
        watchedSourceType,
        watchedSourceNo.trim()
      );
      setAvailableItems(items);
      setSourceValidated(true);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to load available items:', error);
      toast({
        title: 'Error',
        description: `Failed to load items from ${watchedSourceType.toUpperCase()} ${watchedSourceNo}`,
        variant: 'destructive',
      });
      setAvailableItems([]);
      setSourceValidated(false);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemNo: string) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemNo)) {
      newSelected.delete(itemNo);
    } else {
      newSelected.add(itemNo);
    }
    setSelectedItems(newSelected);
  };

  const onSubmit = async (data: FormData) => {
    if (selectedItems.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one item to invoice',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const createData: CreateInvoiceFromSourceDto = {
        invNo: data.invNo,
        date: data.date,
        sourceType: data.sourceType,
        sourceNo: data.sourceNo,
        delDate: data.delDate,
        ship: data.ship,
        loadingPort: data.loadingPort,
        dest: data.dest,
        selectedItemNos: Array.from(selectedItems),
      };

      await InvoiceApiService.createFromSource(createData);

      toast({
        title: 'Success',
        description: `Created Invoice ${data.invNo}`,
      });

      // Reset form
      setValue('invNo', '');
      setValue('sourceNo', '');
      setValue('date', '');
      setAvailableItems([]);
      setSelectedItems(new Set());
      setSourceValidated(false);

    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create invoice',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedItemsData = availableItems.filter(item => selectedItems.has(item.itemNo));

  return (
    <div className="space-y-6">
      {/* Invoice Header Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Header
          </CardTitle>
          <CardDescription>
            Enter invoice number, date, and select source document (Shipping Order or Delivery Note)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invNo">Invoice Number *</Label>
                <Input
                  id="invNo"
                  {...register('invNo', { required: 'Invoice Number is required' })}
                  placeholder="Enter invoice number"
                />
                {errors.invNo && (
                  <p className="text-sm text-red-600">{errors.invNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Invoice Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'Invoice Date is required' })}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceType">Source Type *</Label>
                <Select onValueChange={(value) => setValue('sourceType', value as 'so' | 'dn')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="so">Shipping Order</SelectItem>
                    <SelectItem value="dn">Delivery Note</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceNo">
                  {watchedSourceType === 'so' ? 'Shipping Order No' : 'Delivery Note No'} *
                </Label>
                <Input
                  id="sourceNo"
                  {...register('sourceNo', { required: 'Source number is required' })}
                  placeholder={`Enter ${watchedSourceType === 'so' ? 'SO' : 'DN'} number`}
                />
                {errors.sourceNo && (
                  <p className="text-sm text-red-600">{errors.sourceNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="delDate">Delivery Date</Label>
                <Input
                  id="delDate"
                  type="date"
                  {...register('delDate')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ship">Shipment Info</Label>
                <Input
                  id="ship"
                  {...register('ship')}
                  placeholder="Shipment information"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="loadingPort">Loading Port</Label>
                <Input
                  id="loadingPort"
                  {...register('loadingPort')}
                  placeholder="Loading port"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dest">Destination</Label>
                <Input
                  id="dest"
                  {...register('dest')}
                  placeholder="Destination"
                />
              </div>
            </div>

            {watchedSourceType && watchedSourceNo && (
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={loadAvailableItems}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Available Items'
                  )}
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Available Items Grid */}
      {sourceValidated && (
        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
            <CardDescription>
              Select items to include in this invoice. Only items with remaining quantity are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No available items found for {watchedSourceType?.toUpperCase()} {watchedSourceNo}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2 font-medium text-sm border-b pb-2">
                  <div className="col-span-1">Select</div>
                  <div className="col-span-2">Item No</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">Source Qty</div>
                  <div className="col-span-1">Invoiced</div>
                  <div className="col-span-1">Remaining</div>
                </div>

                {availableItems.map((item) => (
                  <div key={item.itemNo} className="grid grid-cols-8 gap-2 items-center py-2 border-b">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.itemNo)}
                        onChange={() => toggleItemSelection(item.itemNo)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="col-span-2 font-medium">{item.itemNo}</div>
                    <div className="col-span-2 text-sm truncate" title={item.itemDescription}>
                      {item.itemDescription || 'No description'}
                    </div>
                    <div className="col-span-1 text-right">{item.sourceQty}</div>
                    <div className="col-span-1 text-right">{item.invoicedQty}</div>
                    <div className="col-span-1">
                      <Badge variant={item.remainingQty > 0 ? 'default' : 'secondary'}>
                        {item.remainingQty}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Selected Items Summary */}
      {selectedItemsData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Selected Items Summary</CardTitle>
            <CardDescription>
              Review selected items before creating the invoice
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium">
                <div>Item No</div>
                <div>Description</div>
                <div>Source Qty</div>
                <div>Remaining</div>
              </div>
              <Separator />
              {selectedItemsData.map((item) => (
                <div key={item.itemNo} className="grid grid-cols-4 gap-4 text-sm">
                  <div className="font-medium">{item.itemNo}</div>
                  <div className="truncate" title={item.itemDescription}>
                    {item.itemDescription || 'No description'}
                  </div>
                  <div>{item.sourceQty}</div>
                  <div>{item.remainingQty}</div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center">
                <div className="text-sm text-muted-foreground">
                  Total Items: {selectedItemsData.length}
                </div>
                <Button
                  onClick={handleSubmit(onSubmit)}
                  disabled={loading}
                  size="lg"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Invoice...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Invoice
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default InvoiceEntry;