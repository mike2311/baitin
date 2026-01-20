import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, FileText } from 'lucide-react';
import EnquiryApiService, {
  InvoiceEnquiryResponse,
  InvoiceEnquiryQuery,
} from '@/services/api/enquiries';
import { useToast } from '@/hooks/use-toast';

/**
 * Invoice Enquiry Component
 *
 * Original Logic Reference:
 * - Legacy Form: einvoice
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Search and view invoices
 *
 * Reference: Phase 3 - Enquiry Module
 */
interface SearchFormData {
  invNo: string;
  custNo: string;
  ocNo: string;
  dateFrom: string;
  dateTo: string;
}

const InvoiceEnquiry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<InvoiceEnquiryResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: InvoiceEnquiryQuery = {};
      if (data.invNo?.trim()) query.invNo = data.invNo.trim();
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.ocNo?.trim()) query.ocNo = data.ocNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;

      const searchResults = await EnquiryApiService.invoiceEnquiry(query);
      setResults(searchResults);
      setHasSearched(true);

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search invoices',
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

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Invoice Enquiry
          </CardTitle>
          <CardDescription>
            Search and view invoices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(performSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invNo">Invoice Number</Label>
                <Input
                  id="invNo"
                  {...register('invNo')}
                  placeholder="Enter invoice number"
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
                <Label htmlFor="ocNo">Order Confirmation No</Label>
                <Input
                  id="ocNo"
                  {...register('ocNo')}
                  placeholder="Enter OC number"
                />
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
            <CardTitle>Invoice Enquiry Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? 'No invoices found matching your criteria'
                : `Found ${results.length} invoice(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No invoices found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>OC No</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>PL Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((inv) => (
                      <TableRow key={inv.invNo}>
                        <TableCell className="font-medium">{inv.invNo}</TableCell>
                        <TableCell>{formatDate(inv.date)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{inv.custNo || '-'}</div>
                            {inv.customerName && (
                              <div className="text-xs text-muted-foreground">{inv.customerName}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{inv.ocNo || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{inv.itemCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {formatCurrency(inv.totalAmount)}
                        </TableCell>
                        <TableCell>
                          <Badge variant={inv.plStatus === 'Printed' ? 'default' : 'secondary'}>
                            {inv.plStatus}
                          </Badge>
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
                    Grand Total: {formatCurrency(results.reduce((sum, inv) => sum + inv.totalAmount, 0))}
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

export default InvoiceEnquiry;