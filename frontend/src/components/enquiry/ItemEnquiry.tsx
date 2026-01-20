import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Package } from 'lucide-react';
import EnquiryApiService, {
  ItemEnquiryResponse,
  ItemEnquiryQuery,
} from '@/services/api/enquiries';
import { useToast } from '@/hooks/use-toast';

/**
 * Item Enquiry Component
 *
 * Original Logic Reference:
 * - Legacy Forms: Item enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Search items and view order/invoice history
 *
 * Reference: Phase 3 - Enquiry Module
 */
interface SearchFormData {
  itemNo: string;
  itemDescription: string;
}

const ItemEnquiry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ItemEnquiryResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: ItemEnquiryQuery = {};
      if (data.itemNo?.trim()) query.itemNo = data.itemNo.trim();
      if (data.itemDescription?.trim()) query.itemDescription = data.itemDescription.trim();
      query.includeHistory = true;

      const searchResults = await EnquiryApiService.itemEnquiry(query);
      setResults(searchResults);
      setHasSearched(true);

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search items',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const clearSearch = () => {
    reset();
    setResults([]);
    setHasSearched(false);
  };

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Item Enquiry
          </CardTitle>
          <CardDescription>
            Search items and view order/invoice history
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(performSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="itemNo">Item Number</Label>
                <Input
                  id="itemNo"
                  {...register('itemNo')}
                  placeholder="Enter item number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemDescription">Item Description</Label>
                <Input
                  id="itemDescription"
                  {...register('itemDescription')}
                  placeholder="Enter item description"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>

              <Button type="button" variant="outline" onClick={clearSearch}>
                Clear
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Item Enquiry Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? 'No items found matching your criteria'
                : `Found ${results.length} item(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No items found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Item No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Std Code</TableHead>
                      <TableHead>Origin</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Ordered Qty</TableHead>
                      <TableHead className="text-right">Confirmed Qty</TableHead>
                      <TableHead className="text-right">Shipped Qty</TableHead>
                      <TableHead className="text-right">Invoiced Qty</TableHead>
                      <TableHead>Last Order</TableHead>
                      <TableHead>Last Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((item) => (
                      <TableRow key={item.itemNo}>
                        <TableCell className="font-medium">{item.itemNo}</TableCell>
                        <TableCell className="max-w-xs truncate" title={item.itemDescription}>
                          {item.itemDescription || 'No description'}
                        </TableCell>
                        <TableCell>{item.stdCode || '-'}</TableCell>
                        <TableCell>{item.origin || '-'}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.totalOrderedQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.totalConfirmedQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.totalShippedQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{item.totalInvoicedQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(item.lastOrderDate)}</TableCell>
                        <TableCell>{formatDate(item.lastInvoiceDate)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ItemEnquiry;