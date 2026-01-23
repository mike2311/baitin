import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, Eye, Edit, Trash2, FileText } from 'lucide-react';
import InvoiceApiService, {
  InvoiceSearchResponse,
  InvoiceSearchQuery,
} from '@/services/api/invoices';
import { useToast } from '@/hooks/use-toast';
import InvoiceDocumentGenerator from './InvoiceDocumentGenerator';

/**
 * Invoice List Component
 *
 * Original Logic Reference:
 * - Legacy Form: einvoice
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Search and filter invoices by various criteria
 *   - Display invoice list with key information
 *   - Allow view/edit/delete operations
 *
 * Reference: Phase 3 - Invoice Module
 */
interface SearchFormData {
  invNo: string;
  custNo: string;
  ocNo: string;
  dateFrom: string;
  dateTo: string;
}

const InvoiceList: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<InvoiceSearchResponse[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [selectedInvNos, setSelectedInvNos] = useState<Set<string>>(new Set());
  const [showDocumentGenerator, setShowDocumentGenerator] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, reset, getValues } = useForm<SearchFormData>();

  const performSearch = async (data: SearchFormData) => {
    try {
      setLoading(true);

      const query: InvoiceSearchQuery = {};
      if (data.invNo?.trim()) query.invNo = data.invNo.trim();
      if (data.custNo?.trim()) query.custNo = data.custNo.trim();
      if (data.ocNo?.trim()) query.ocNo = data.ocNo.trim();
      if (data.dateFrom) query.dateFrom = data.dateFrom;
      if (data.dateTo) query.dateTo = data.dateTo;

      const results = await InvoiceApiService.search(query);
      setSearchResults(results);
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

  const handleView = (invNo: string) => {
    // TODO: Navigate to invoice detail view
    toast({
      title: 'View Invoice',
      description: `Viewing Invoice ${invNo}`,
    });
  };

  const handleEdit = (invNo: string) => {
    // TODO: Navigate to invoice edit
    toast({
      title: 'Edit Invoice',
      description: `Editing Invoice ${invNo}`,
    });
  };

  const handleDelete = async (invNo: string) => {
    if (!confirm(`Are you sure you want to delete Invoice ${invNo}?`)) {
      return;
    }

    try {
      await InvoiceApiService.delete(invNo);
      toast({
        title: 'Success',
        description: `Invoice ${invNo} deleted successfully`,
      });

      // Refresh search results
      reset();
      const formData = getValues();
      performSearch(formData);

    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Delete Error',
        description: 'Failed to delete invoice',
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

  const formatCurrency = (amount?: number) => {
    if (amount === undefined) return '-';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const toggleInvSelection = (invNo: string) => {
    const newSelected = new Set(selectedInvNos);
    if (newSelected.has(invNo)) {
      newSelected.delete(invNo);
    } else {
      newSelected.add(invNo);
    }
    setSelectedInvNos(newSelected);
  };

  const handleGenerateDocument = () => {
    if (selectedInvNos.size === 0) {
      toast({
        title: 'Validation Error',
        description: 'Please select at least one Invoice to generate document',
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
            Search Invoices
          </CardTitle>
          <CardDescription>
            Search invoices by invoice number, customer, order confirmation, or date range
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

      {/* Document Generator */}
      {showDocumentGenerator && (
        <Card>
          <CardContent className="pt-6">
            <InvoiceDocumentGenerator
              selectedInvNos={Array.from(selectedInvNos)}
              onClose={() => {
                setShowDocumentGenerator(false);
                setSelectedInvNos(new Set());
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
                    ? 'No invoices found matching your criteria'
                    : `Found ${searchResults.length} invoice(s)`
                  }
                </CardDescription>
              </div>
              {selectedInvNos.size > 0 && (
                <Button onClick={handleGenerateDocument} variant="default">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Document ({selectedInvNos.size})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {searchResults.length === 0 ? (
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
                      <TableHead className="w-12">
                        <input
                          type="checkbox"
                          checked={selectedInvNos.size === searchResults.length && searchResults.length > 0}
                          onChange={(e) => {
                            if (e.target.checked) {
                              const allInvNos = new Set(searchResults.map(inv => inv.invNo));
                              setSelectedInvNos(allInvNos);
                            } else {
                              setSelectedInvNos(new Set());
                            }
                          }}
                          className="w-4 h-4"
                        />
                      </TableHead>
                      <TableHead>Invoice No</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>OC No</TableHead>
                      <TableHead className="text-right">Items</TableHead>
                      <TableHead className="text-right">Total Amount</TableHead>
                      <TableHead>PL Status</TableHead>
                      <TableHead>Created By</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {searchResults.map((inv) => (
                      <TableRow key={inv.invNo}>
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedInvNos.has(inv.invNo)}
                            onChange={() => toggleInvSelection(inv.invNo)}
                            className="w-4 h-4"
                          />
                        </TableCell>
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
                        <TableCell>{inv.creUser || '-'}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleView(inv.invNo)}
                              title="View Details"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEdit(inv.invNo)}
                              title="Edit"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(inv.invNo)}
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
                    Total amount: {formatCurrency(searchResults.reduce((sum, inv) => sum + inv.totalAmount, 0))}
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

export default InvoiceList;