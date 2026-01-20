import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Plus, Package } from 'lucide-react';
import DeliveryNoteApiService, {
  AvailableItemsForDnResponse,
  CreateDeliveryNoteFromSoDto,
} from '@/services/api/delivery-notes';
import { useToast } from '@/hooks/use-toast';

/**
 * Delivery Note Entry Component
 *
 * Original Logic Reference:
 * - Legacy Form: idn
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - Create DN from SO source
 *   - Show available vs already delivered items
 *   - Select items and quantities to deliver
 *   - Option to copy breakdowns from OE
 *
 * Reference: Phase 3 - Delivery Note Module
 */
interface FormData {
  dnNo: string;
  date: string;
  soNo: string;
  delAddr1?: string;
  delAddr2?: string;
  delAddr3?: string;
  delAddr4?: string;
  delDate?: string;
  copyBreakdowns: boolean;
}

const DeliveryNoteEntry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<AvailableItemsForDnResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [soValidated, setSoValidated] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      copyBreakdowns: true,
    },
  });
  const watchedSoNo = watch('soNo');

  // Load available items when SO changes
  useEffect(() => {
    if (watchedSoNo && watchedSoNo.trim()) {
      loadAvailableItems();
    } else {
      setAvailableItems([]);
      setSoValidated(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSoNo]);

  const loadAvailableItems = async () => {
    if (!watchedSoNo?.trim()) return;

    try {
      setLoading(true);
      const items = await DeliveryNoteApiService.getAvailableItemsForDn(watchedSoNo.trim());
      setAvailableItems(items);
      setSoValidated(true);
      setSelectedItems(new Set());
    } catch (error) {
      console.error('Failed to load available items:', error);
      toast({
        title: 'Error',
        description: `Failed to load items from SO ${watchedSoNo}`,
        variant: 'destructive',
      });
      setAvailableItems([]);
      setSoValidated(false);
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
        description: 'Please select at least one item to deliver',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const createData: CreateDeliveryNoteFromSoDto = {
        dnNo: data.dnNo,
        date: data.date,
        soNo: data.soNo,
        delAddr1: data.delAddr1,
        delAddr2: data.delAddr2,
        delAddr3: data.delAddr3,
        delAddr4: data.delAddr4,
        delDate: data.delDate,
        selectedItemNos: Array.from(selectedItems),
        copyBreakdowns: data.copyBreakdowns,
      };

      await DeliveryNoteApiService.createFromSo(createData);

      toast({
        title: 'Success',
        description: `Created Delivery Note ${data.dnNo}`,
      });

      // Reset form
      setValue('dnNo', '');
      setValue('soNo', '');
      setValue('date', '');
      setAvailableItems([]);
      setSelectedItems(new Set());
      setSoValidated(false);

    } catch (error: any) {
      console.error('Failed to create delivery note:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create delivery note',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedItemsData = availableItems.filter(item => selectedItems.has(item.itemNo));

  return (
    <div className="space-y-6">
      {/* DN Header Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Delivery Note Header
          </CardTitle>
          <CardDescription>
            Enter DN number, date, and select Shipping Order source
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dnNo">DN Number *</Label>
                <Input
                  id="dnNo"
                  {...register('dnNo', { required: 'DN Number is required' })}
                  placeholder="Enter DN number"
                />
                {errors.dnNo && (
                  <p className="text-sm text-red-600">{errors.dnNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">DN Date *</Label>
                <Input
                  id="date"
                  type="date"
                  {...register('date', { required: 'DN Date is required' })}
                />
                {errors.date && (
                  <p className="text-sm text-red-600">{errors.date.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="soNo">Shipping Order No *</Label>
                <Input
                  id="soNo"
                  {...register('soNo', { required: 'SO Number is required' })}
                  placeholder="Enter SO number"
                />
                {errors.soNo && (
                  <p className="text-sm text-red-600">{errors.soNo.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="delAddr1">Delivery Address Line 1</Label>
                <Input
                  id="delAddr1"
                  {...register('delAddr1')}
                  placeholder="Delivery address line 1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delAddr2">Delivery Address Line 2</Label>
                <Input
                  id="delAddr2"
                  {...register('delAddr2')}
                  placeholder="Delivery address line 2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delAddr3">Delivery Address Line 3</Label>
                <Input
                  id="delAddr3"
                  {...register('delAddr3')}
                  placeholder="Delivery address line 3"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delAddr4">Delivery Address Line 4</Label>
                <Input
                  id="delAddr4"
                  {...register('delAddr4')}
                  placeholder="Delivery address line 4"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="delDate">Delivery Date</Label>
                <Input
                  id="delDate"
                  type="date"
                  {...register('delDate')}
                />
              </div>

              <div className="space-y-2 flex items-end">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="copyBreakdowns"
                    {...register('copyBreakdowns')}
                    className="w-4 h-4"
                  />
                  <Label htmlFor="copyBreakdowns" className="cursor-pointer">
                    Copy breakdowns from OE
                  </Label>
                </div>
              </div>
            </div>

            {watchedSoNo && (
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
      {soValidated && (
        <Card>
          <CardHeader>
            <CardTitle>Available Items</CardTitle>
            <CardDescription>
              Select items to include in this delivery note. Only items with remaining quantity are shown.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {availableItems.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No available items found for SO {watchedSoNo}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-8 gap-2 font-medium text-sm border-b pb-2">
                  <div className="col-span-1">Select</div>
                  <div className="col-span-2">Item No</div>
                  <div className="col-span-2">Description</div>
                  <div className="col-span-1">SO Qty</div>
                  <div className="col-span-1">Delivered</div>
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
                    <div className="col-span-1 text-right">{item.soQty}</div>
                    <div className="col-span-1 text-right">{item.deliveredQty}</div>
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
              Review selected items before creating the delivery note
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-4 font-medium">
                <div>Item No</div>
                <div>Description</div>
                <div>SO Qty</div>
                <div>Remaining</div>
              </div>
              <Separator />
              {selectedItemsData.map((item) => (
                <div key={item.itemNo} className="grid grid-cols-4 gap-4 text-sm">
                  <div className="font-medium">{item.itemNo}</div>
                  <div className="truncate" title={item.itemDescription}>
                    {item.itemDescription || 'No description'}
                  </div>
                  <div>{item.soQty}</div>
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
                      Creating DN...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Delivery Note
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

export default DeliveryNoteEntry;