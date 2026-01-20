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
  DnEnquiryResponse,
  DnEnquiryQuery,
} from '@/services/api/enquiries';
import { useToast } from '@/hooks/use-toast';

/**
 * DN Enquiry Component
 *
 * Original Logic Reference:
 * - Legacy Forms: DN enquiry forms
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Search and view delivery notes
 *
 * Reference: Phase 3 - Enquiry Module
 */
interface SearchFormData {
  dnNo: string;
  custNo: string;
  soNo: string;
  dateFrom: string;
  dateTo: string;
  loadingStatus: string;
}

const DnEnquiry: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<DnEnquiryResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: DnEnquiryQuery = {};
      if (data.dnNo?.trim()) query.dnNo = data.dnNo.trim();
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.soNo?.trim()) query.soNo = data.soNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;
      if (data.loadingStatus) query.loadingStatus = data.loadingStatus;

      const searchResults = await EnquiryApiService.dnEnquiry(query);
      setResults(searchResults);
      setHasSearched(true);

    } catch (error) {
      console.error('Search failed:', error);
      toast({
        title: 'Search Error',
        description: 'Failed to search delivery notes',
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
            <Package className="h-5 w-5" />
            Delivery Note Enquiry
          </CardTitle>
          <CardDescription>
            Search and view delivery notes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(performSearch)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dnNo">DN Number</Label>
                <Input
                  id="dnNo"
                  {...register('dnNo')}
                  placeholder="Enter DN number"
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
                <Label htmlFor="soNo">Shipping Order No</Label>
                <Input
                  id="soNo"
                  {...register('soNo')}
                  placeholder="Enter SO number"
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
            <CardTitle>DN Enquiry Results</CardTitle>
            <CardDescription>
              {results.length === 0
                ? 'No delivery notes found matching your criteria'
                : `Found ${results.length} delivery note(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No delivery notes found. Try adjusting your search criteria.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>DN No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>SO No</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total Qty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Loading No</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {results.map((dn) => (
                      <TableRow key={dn.dnNo}>
                        <TableCell className="font-medium">{dn.dnNo}</TableCell>
                        <TableCell>{formatDate(dn.date)}</TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{dn.custNo || '-'}</div>
                            {dn.customerName && (
                              <div className="text-xs text-muted-foreground">{dn.customerName}</div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>{dn.soNo || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{dn.itemCount}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="outline">{dn.totalQty.toLocaleString()}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{dn.loadingStatus}</Badge>
                        </TableCell>
                        <TableCell>{dn.loadingNo || '-'}</TableCell>
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

export default DnEnquiry;