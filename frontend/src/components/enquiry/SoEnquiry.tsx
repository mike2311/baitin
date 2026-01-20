import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Truck } from 'lucide-react';
import EnquiryApiService, {
  SoEnquiryResponse,
  SoEnquiryQuery,
} from '@/services/api/enquiries';
import { useToast } from '@/hooks/use-toast';

/**
 * SO Enquiry Component
 *
 * Original Logic Reference:
 * - Legacy Forms: SO enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Search and view shipping orders
 *
 * Reference: Phase 3 - Enquiry Module
 */
interface SearchFormData {
  soNo: string;
  custNo: string;
  itemNo: string;
  dateFrom: string;
  dateTo: string;
}

const SoEnquiry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SoEnquiryResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: SoEnquiryQuery = {};
      if (data.soNo?.trim()) query.soNo = data.soNo.trim();
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.itemNo?.trim()) query.itemNo = data.itemNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;

      const searchResults = await EnquiryApiService.soEnquiry(query);
      setResults(searchResults);
      setHasSearched(true);

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search shipping orders',
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
            <Truck className="h-5 w-5" />
            Shipping Order Enquiry
          </CardTitle>
          <CardDescription>
            Search and view shipping orders
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(performSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soNo">SO Number</Label>
                <Input
                  id="soNo"
                  {...register('soNo')}
                  placeholder="Enter SO number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custNo">Customer No</Label>
                <Input
                  id="custNo"
                  {...register('custNo')}
                  placeholder="Enter customer number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemNo">Item No</Label>
                <Input
                  id="itemNo"
                  {...register('itemNo')}
                  placeholder="Enter item number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Ship Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  {...register('dateFrom')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Ship Date To</Label>
                <Input
                  id="dateTo"
                  type="date"
                  {...register('dateTo')}
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
            <CardTitle>SO Enquiry Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? 'No shipping orders found matching your criteria'
                : `Found ${results.length} shipping order(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No shipping orders found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>SO No</TableHead>
                      <TableHead>OC No</TableHead>
                      <TableHead>Contract No</TableHead>
                      <TableHead>Item No</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Cartons</TableHead>
                      <TableHead>Ship Date</TableHead>
                      <TableHead>Customer</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((so, index) => (
                      <TableRow key={`${so.soNo}-${so.itemNo}-${index}`}>
                        <TableCell className="font-medium">{so.soNo}</TableCell>
                        <TableCell>{so.confNo || '-'}</TableCell>
                        <TableCell>{so.contNo || '-'}</TableCell>
                        <TableCell>{so.itemNo}</TableCell>
                        <TableCell className="max-w-xs truncate" title={so.itemDescription}>
                          {so.itemDescription || 'No description'}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{so.qty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {so.ctn ? so.ctn.toLocaleString() : '-'}
                        </TableCell>
                        <TableCell>{formatDate(so.shipDate)}</TableCell>
                        <TableCell>{so.customerName || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-sm text-muted-foreground">
                  Showing {results.length} result(s)
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SoEnquiry;