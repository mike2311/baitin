import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Search, TrendingUp } from 'lucide-react';
import EnquiryApiService, {
  SalesAnalysisResponse,
  SalesAnalysisQuery,
} from '@/services/api/enquiries';
import { useToast } from '@/hooks/use-toast';

/**
 * Sales Analysis Enquiry Component
 *
 * Original Logic Reference:
 * - Legacy Forms: Sales analysis enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Aggregate sales by customer, item, or date
 *   - Calculate totals and counts
 *   - Export functionality
 *
 * Reference: Phase 3 - Enquiry Module
 */
interface SearchFormData {
  custNo: string;
  itemNo: string;
  dateFrom: string;
  dateTo: string;
  groupBy: 'customer' | 'item' | 'date';
}

const SalesAnalysisEnquiry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SalesAnalysisResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, watch, setValue } = useForm<SearchFormData>({
    defaultValues: {
      groupBy: 'date',
    },
  });

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: SalesAnalysisQuery = {};
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.itemNo?.trim()) query.itemNo = data.itemNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;
      query.groupBy = data.groupBy || 'date';

      const searchResults = await EnquiryApiService.salesAnalysis(query);
      setResults(searchResults);
      setHasSearched(true);

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to perform sales analysis',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const groupBy = watch('groupBy');

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Sales Analysis
          </CardTitle>
          <CardDescription>
            Analyze sales by customer, item, or date with totals and counts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(performSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="groupBy">Group By</Label>
                <Select onValueChange={(value) => setValue('groupBy', value as 'customer' | 'item' | 'date')}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select grouping" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="item">Item</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateFrom">Date From</Label>
                <Input
                  id="dateFrom"
                  type="date"
                  {...register('dateFrom')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dateTo">Date To</Label>
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
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Analyze
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
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? 'No results found matching your criteria'
                : `Found ${results.length} result(s) grouped by ${groupBy}`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No results found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {groupBy === 'customer' && (
                        <>
                          <TableHead>Customer No</TableHead>
                          <TableHead>Customer Name</TableHead>
                        </>
                      )}
                      {groupBy === 'item' && (
                        <>
                          <TableHead>Item No</TableHead>
                          <TableHead>Description</TableHead>
                        </>
                      )}
                      {groupBy === 'date' && <TableHead>Date</TableHead>}
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead className="text-right">Invoices</TableHead>
                      <TableHead className="text-right">SOs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((result, index) => (
                      <TableRow key={index}>
                        {groupBy === 'customer' && (
                          <>
                            <TableCell className="font-medium">{result.custNo || '-'}</TableCell>
                            <TableCell>{result.customerName || '-'}</TableCell>
                          </>
                        )}
                        {groupBy === 'item' && (
                          <>
                            <TableCell className="font-medium">{result.itemNo || '-'}</TableCell>
                            <TableCell>{result.itemDescription || '-'}</TableCell>
                          </>
                        )}
                        {groupBy === 'date' && (
                          <TableCell className="font-medium">{formatDate(result.date)}</TableCell>
                        )}
                        <TableCell className="text-right">
                          <Badge variant="outline">{result.totalQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(result.totalAmount)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{result.invoiceCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="secondary">{result.soCount}</Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    Showing {results.length} result(s)
                  </div>
                  <div>
                    Grand Total: {formatCurrency(results.reduce((sum, r) => sum + r.totalAmount, 0))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SalesAnalysisEnquiry;