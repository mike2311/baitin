import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Search, Eye, Edit, Trash2 } from 'lucide-react';
import DeliveryNoteApiService, {
  DeliveryNoteSearchResponse,
  DeliveryNoteSearchQuery,
} from '@/services/api/delivery-notes';
import { useToast } from '@/hooks/use-toast';

/**
 * Delivery Note List Component
 *
 * Original Logic Reference:
 * - Legacy Form: idn (search functionality)
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - Search and filter DNs by various criteria
 *   - Display DN list with key information
 *   - Allow view/edit/delete operations
 *
 * Reference: Phase 3 - Delivery Note Module
 */
interface SearchFormData {
  dnNo: string;
  custNo: string;
  soNo: string;
  dateFrom: string;
  dateTo: string;
  loadingStatus: string;
}

const DeliveryNoteList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<DeliveryNoteSearchResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, watch, setValue } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: DeliveryNoteSearchQuery = {};
      if (data.dnNo?.trim()) query.dnNo = data.dnNo.trim();
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.soNo?.trim()) query.soNo = data.soNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;
      if (data.loadingStatus) query.loadingStatus = data.loadingStatus;

      const results = await DeliveryNoteApiService.search(query);
      setSearchResults(results);
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

  const handleView = (dnNo: string) => {
    // TODO: Navigate to DN detail view
    toast({
      title: 'View DN',
      description: `Viewing Delivery Note ${dnNo}`,
    });
  };

  const handleEdit = (dnNo: string) => {
    // TODO: Navigate to DN edit
    toast({
      title: 'Edit DN',
      description: `Editing Delivery Note ${dnNo}`,
    });
  };

  const handleDelete = async (dnNo: string) => {
    if (!confirm(`Are you sure you want to delete Delivery Note ${dnNo}?`)) {
      return;
    }

    try {
      await DeliveryNoteApiService.delete(dnNo);
      toast({
        title: 'Success',
        description: `Delivery Note ${dnNo} deleted successfully`,
      });

      // Refresh search results
      performSearch(watch());

    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete delivery note',
        variant: 'destructive',
      });
    }
  };

  const clearSearch = () => {
    reset();
    setSearchResults([]);
    setHasSearched(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'Created':
        return 'default';
      case 'Loading':
        return 'secondary';
      case 'Shipped':
        return 'outline';
      case 'Delivered':
        return 'default';
      case 'Invoiced':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Delivery Notes
          </CardTitle>
          <CardDescription>
            Search delivery notes by DN number, customer, SO, date range, or loading status
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

              <div className="space-y-2">
                <Label htmlFor="loadingStatus">Loading Status</Label>
                <Select onValueChange={(value) => setValue('loadingStatus', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Statuses</SelectItem>
                    <SelectItem value="Created">Created</SelectItem>
                    <SelectItem value="Loading">Loading</SelectItem>
                    <SelectItem value="Shipped">Shipped</SelectItem>
                    <SelectItem value="Delivered">Delivered</SelectItem>
                    <SelectItem value="Invoiced">Invoiced</SelectItem>
                  </SelectContent>
                </Select>
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

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
            <CardDescription>
              {searchResults.length === 0
                ? 'No delivery notes found matching your criteria'
                : `Found ${searchResults.length} delivery note(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
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
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((dn) => (
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
                          <Badge variant={getStatusBadgeVariant(dn.loadingStatus)}>
                            {dn.loadingStatus}
                          </Badge>
                        </TableCell>
                        <TableCell>{dn.loadingNo || '-'}</TableCell>
                        <TableCell>{dn.creUser || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(dn.dnNo)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(dn.dnNo)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(dn.dnNo)}
                              title="Delete"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <div>
                    Showing {searchResults.length} result(s)
                  </div>
                  <div>
                    Total quantity: {searchResults.reduce((sum, dn) => sum + dn.totalQty, 0).toLocaleString()}
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

export default DeliveryNoteList;