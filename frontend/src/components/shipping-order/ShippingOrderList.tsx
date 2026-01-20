import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Eye, Edit, Trash2, FileText } from 'lucide-react';
import ShippingOrderApiService, {
  ShippingOrderSearchResponse,
  ShippingOrderSearchQuery,
} from '@/services/api/shipping-orders';
import { useToast } from '@/hooks/use-toast';
import SoDocumentGenerator from './SoDocumentGenerator';

/**
 * Shipping Order List Component
 *
 * Original Logic Reference:
 * - Legacy Form: isetso (search functionality)
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Search and filter SOs by various criteria
 *   - Display SO list with key information
 *   - Allow view/edit/delete operations
 *
 * Reference: Phase 3 - Shipping Order Module
 */
interface SearchFormData {
  soNo: string;
  confNo: string;
  contNo: string;
  itemNo: string;
  shipDateFrom: string;
  shipDateTo: string;
}

const ShippingOrderList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<ShippingOrderSearchResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedSoNos, setSelectedSoNos] = useState<Set<string>>(new Set());
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: ShippingOrderSearchQuery = {};
      if (data.soNo?.trim()) query.soNo = data.soNo.trim();
      if (data.confNo?.trim()) query.confNo = data.confNo.trim();
      if (data.contNo?.trim()) query.contNo = data.contNo.trim();
      if (data.itemNo?.trim()) query.itemNo = data.itemNo.trim();
      if (data.shipDateFrom) query.shipDateFrom = data.shipDateFrom;
      if (data.shipDateTo) query.shipDateTo = data.shipDateTo;

      const results = await ShippingOrderApiService.search(query);
      setSearchResults(results);
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

  const handleView = (soNo: string) => {
    // TODO: Navigate to SO detail view
    toast({
      title: 'View SO',
      description: `Viewing Shipping Order ${soNo}`,
    });
  };

  const handleEdit = (soNo: string) => {
    // TODO: Navigate to SO edit
    toast({
      title: 'Edit SO',
      description: `Editing Shipping Order ${soNo}`,
    });
  };

  const handleDelete = async (soNo: string) => {
    if (!confirm(`Are you sure you want to delete Shipping Order ${soNo}?`)) {
      return;
    }

    try {
      await ShippingOrderApiService.delete(soNo);
      toast({
        title: 'Success',
        description: `Shipping Order ${soNo} deleted successfully`,
      });

      // Refresh search results
      const formData = new FormData();
      // TODO: Get current form values and re-search

    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete shipping order',
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

  const toggleSoSelection = (soNo: string) => {
    const newSelected = new Set(selectedSoNos);
    if (newSelected.has(soNo)) {
      newSelected.delete(soNo);
    } else {
      newSelected.add(soNo);
    }
    setSelectedSoNos(newSelected);
  };

  const handleGenerateDocument = () => {
    if (selectedSoNos.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Shipping Order to generate document',
        variant: 'destructive',
      });
      return;
    }
    setShowDocumentGenerator(true);
  };

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search Shipping Orders
          </CardTitle>
          <CardDescription>
            Search shipping orders by SO number, order confirmation, contract, item, or shipping date range
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
                <Label htmlFor="confNo">Order Confirmation No</Label>
                <Input
                  id="confNo"
                  {...register('confNo')}
                  placeholder="Enter OC number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contNo">Contract No</Label>
                <Input
                  id="contNo"
                  {...register('contNo')}
                  placeholder="Enter contract number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemNo">Item Number</Label>
                <Input
                  id="itemNo"
                  {...register('itemNo')}
                  placeholder="Enter item number"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipDateFrom">Ship Date From</Label>
                <Input
                  id="shipDateFrom"
                  type="date"
                  {...register('shipDateFrom')}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="shipDateTo">Ship Date To</Label>
                <Input
                  id="shipDateTo"
                  type="date"
                  {...register('shipDateTo')}
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

      {/* Document Generator */}
      {showDocumentGenerator && (
        <Card>
          <CardContent className="pt-6">
            <SoDocumentGenerator
              selectedSoNos={Array.from(selectedSoNos)}
              onClose={() => {
                setShowDocumentGenerator(false);
                setSelectedSoNos(new Set());
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {hasSearched && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Search Results</CardTitle>
                <CardDescription>
                  {searchResults.length === 0
                    ? 'No shipping orders found matching your criteria'
                    : `Found ${searchResults.length} shipping order(s)`
                  }
                </CardDescription>
              </div>
              {selectedSoNos.size > 0 && (
                <Button onClick={handleGenerateDocument} variant="default">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Document ({selectedSoNos.size})
                </Button>
              )}
            </div>
            <CardDescription>
              {searchResults.length === 0
                ? 'No shipping orders found matching your criteria'
                : `Found ${searchResults.length} shipping order(s)`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
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
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((so) => (
                      <TableRow key={`${so.soNo}-${so.itemNo}`}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedSoNos.has(so.soNo)}
                            onChange={() => toggleSoSelection(so.soNo)}
                            className="w-4 h-4"
                          />
                        </TableCell>
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
                        <TableCell>{so.creUser || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(so.soNo)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(so.soNo)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(so.soNo)}
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
                    Total quantity: {searchResults.reduce((sum, so) => sum + so.qty, 0).toLocaleString()}
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

export default ShippingOrderList;