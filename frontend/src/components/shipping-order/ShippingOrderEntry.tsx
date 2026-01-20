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
import { Loader2, Plus, Package } from 'lucide-react';
import ShippingOrderApiService, {
  AvailableItemsForSoResponse,
  CreateShippingOrderFromSourceDto,
} from '@/services/api/shipping-orders';
import { useToast } from '@/hooks/use-toast';

/**
 * Shipping Order Entry Component
 *
 * Original Logic Reference:
 * - Legacy Form: isetso
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Create SO from OC or Contract source
 *   - Show available vs already shipped items
 *   - Select items and quantities to ship
 *   - Validate quantities don't exceed available
 *
 * Reference: Phase 3 - Shipping Order Module
 */
interface FormData {
  soNo: string;
  sourceType: 'oc' | 'contract';
  sourceNo: string;
}

const ShippingOrderEntry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [availableItems, setAvailableItems] = useState<AvailableItemsForSoResponse[]>([]);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [itemCartons, setItemCartons] = useState<Record<string, number>>({});
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
  }, [watchedSourceType, watchedSourceNo]);

  const loadAvailableItems = async () => {
    if (!watchedSourceType || !watchedSourceNo?.trim()) return;

    try {
      setLoading(true);
      const items = await ShippingOrderApiService.getAvailableItemsForSo(
        watchedSourceType,
        watchedSourceNo.trim()
      );
      setAvailableItems(items);
      setSourceValidated(true);
      setSelectedItems(new Set());
      setItemQuantities({});
      setItemCartons({});
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
      const newQuantities = { ...itemQuantities };
      const newCartons = { ...itemCartons };
      delete newQuantities[itemNo];
      delete newCartons[itemNo];
      setItemQuantities(newQuantities);
      setItemCartons(newCartons);
    } else {
      newSelected.add(itemNo);
      // Set default quantity to remaining available
      const item = availableItems.find(i => i.itemNo === itemNo);
      if (item) {
        setItemQuantities(prev => ({ ...prev, [itemNo]: item.remainingQty }));
        setItemCartons(prev => ({ ...prev, [itemNo]: item.ctn || 0 }));
      }
    }
    setSelectedItems(newSelected);
  };

  const updateItemQuantity = (itemNo: string, qty: number) => {
    setItemQuantities(prev => ({ ...prev, [itemNo]: qty }));
  };

  const updateItemCarton = (itemNo: string, ctn: number) => {
    setItemCartons(prev => ({ ...prev, [itemNo]: ctn }));
  };

  const onSubmit = async (data: FormData) => {
    if (selectedItems.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one item to ship',
        variant: 'destructive',
      });
      return;
    }

    // Validate quantities
    for (const itemNo of selectedItems) {
      const item = availableItems.find(i => i.itemNo === itemNo);
      const qty = itemQuantities[itemNo] || 0;

      if (!item) continue;

      if (qty <= 0) {
        toast({
          title: 'Validation Error',
          description: `Quantity for item ${itemNo} must be greater than 0`,
          variant: 'destructive',
        });
        return;
      }

      if (qty > item.remainingQty) {
        toast({
          title: 'Validation Error',
          description: `Quantity for item ${itemNo} (${qty}) exceeds available quantity (${item.remainingQty})`,
          variant: 'destructive',
        });
        return;
      }
    }

    try {
      setLoading(true);

      const createData: CreateShippingOrderFromSourceDto = {
        soNo: data.soNo,
        sourceType: data.sourceType,
        sourceNo: data.sourceNo,
        selectedItems: Array.from(selectedItems).map(itemNo => ({
          itemNo,
          qty: itemQuantities[itemNo],
          ctn: itemCartons[itemNo],
          poNo: availableItems.find(i => i.itemNo === itemNo)?.poNo,
          shipDate: availableItems.find(i => i.itemNo === itemNo)?.shipDate,
        })),
      };

      const createdSOs = await ShippingOrderApiService.createFromSource(createData);

      toast({
        title: 'Success',
        description: `Created Shipping Order ${data.soNo} with ${createdSOs.length} items`,
      });

      // Reset form
      setValue('soNo', '');
      setValue('sourceNo', '');
      setAvailableItems([]);
      setSelectedItems(new Set());
      setItemQuantities({});
      setItemCartons({});
      setSourceValidated(false);

    } catch (error: any) {
      console.error('Failed to create shipping order:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to create shipping order',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedItemsData = availableItems.filter(item => selectedItems.has(item.itemNo));

  return (
    <div className="space-y-6">
      {/* SO Header Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Shipping Order Header
          </CardTitle>
          <CardDescription>
            Enter SO number and select source document (Order Confirmation or Contract)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soNo">SO Number *</Label>
                <Input
                  id="soNo"
                  {...register('soNo', { required: 'SO Number is required' })}
                  placeholder="Enter SO number"
                />
                {errors.soNo && (
                  <p className="text-sm text-red-600">{errors.soNo.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceType">Source Type *</Label>
                <Select onValueChange={(value) => setValue('sourceType', value as 'oc' | 'contract')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oc">Order Confirmation</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="sourceNo">
                  {watchedSourceType === 'oc' ? 'Order Confirmation No' : 'Contract No'} *
                </Label>
                <Input
                  id="sourceNo"
                  {...register('sourceNo', { required: 'Source number is required' })}
                  placeholder={`Enter ${watchedSourceType === 'oc' ? 'OC' : 'contract'} number`}
                />
                {errors.sourceNo && (
                  <p className="text-sm text-red-600">{errors.sourceNo.message}</p>
                )}
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
              Select items to include in this shipping order. Only items with remaining quantity are shown.
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
                <div className="grid grid-cols-12 gap-2 font-medium text-sm border-b pb-2">
                  <div className="col-span-1">Select</div>
                  <div className="col-span-2">Item No</div>
                  <div className="col-span-3">Description</div>
                  <div className="col-span-1">Available</div>
                  <div className="col-span-1">Shipped</div>
                  <div className="col-span-1">Remaining</div>
                  <div className="col-span-1">Qty to Ship</div>
                  <div className="col-span-1">Cartons</div>
                  <div className="col-span-1">PO No</div>
                </div>

                {availableItems.map((item) => (
                  <div key={item.itemNo} className="grid grid-cols-12 gap-2 items-center py-2 border-b">
                    <div className="col-span-1">
                      <input
                        type="checkbox"
                        checked={selectedItems.has(item.itemNo)}
                        onChange={() => toggleItemSelection(item.itemNo)}
                        className="w-4 h-4"
                      />
                    </div>
                    <div className="col-span-2 font-medium">{item.itemNo}</div>
                    <div className="col-span-3 text-sm truncate" title={item.itemDescription}>
                      {item.itemDescription || 'No description'}
                    </div>
                    <div className="col-span-1 text-right">{item.availableQty}</div>
                    <div className="col-span-1 text-right">{item.shippedQty}</div>
                    <div className="col-span-1">
                      <Badge variant={item.remainingQty > 0 ? 'default' : 'secondary'}>
                        {item.remainingQty}
                      </Badge>
                    </div>
                    {selectedItems.has(item.itemNo) ? (
                      <>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            min="0"
                            max={item.remainingQty}
                            value={itemQuantities[item.itemNo] || ''}
                            onChange={(e) => updateItemQuantity(item.itemNo, parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                        <div className="col-span-1">
                          <Input
                            type="number"
                            min="0"
                            value={itemCartons[item.itemNo] || ''}
                            onChange={(e) => updateItemCarton(item.itemNo, parseFloat(e.target.value) || 0)}
                            className="h-8"
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-span-1">-</div>
                        <div className="col-span-1">-</div>
                      </>
                    )}
                    <div className="col-span-1 text-sm">{item.poNo || '-'}</div>
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
              Review selected items and quantities before creating the shipping order
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-5 gap-4 font-medium">
                <div>Item No</div>
                <div>Description</div>
                <div>Quantity</div>
                <div>Cartons</div>
                <div>PO No</div>
              </div>
              <Separator />
              {selectedItemsData.map((item) => (
                <div key={item.itemNo} className="grid grid-cols-5 gap-4 text-sm">
                  <div className="font-medium">{item.itemNo}</div>
                  <div className="truncate" title={item.itemDescription}>
                    {item.itemDescription || 'No description'}
                  </div>
                  <div>{itemQuantities[item.itemNo] || 0}</div>
                  <div>{itemCartons[item.itemNo] || 0}</div>
                  <div>{item.poNo || '-'}</div>
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
                      Creating SO...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Create Shipping Order
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

export default ShippingOrderEntry;