import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import InvoiceEntry from '@/components/invoice/InvoiceEntry';
import InvoiceList from '@/components/invoice/InvoiceList';

/**
 * Invoice Page
 *
 * Original Logic Reference:
 * - Legacy Form: iinvhd@
 * - Documentation: docs/source/04-forms-and-screens/invoice-forms.md
 * - Business Rules:
 *   - Main entry point for invoice management
 *   - Tabs for different invoice operations
 *   - Entry and List tabs
 *
 * Reference: Phase 3 - Invoice Module
 */
const InvoicePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Invoice Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage invoices from shipping orders and delivery notes
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('list')}>
            View All Invoices
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">Invoice Entry</TabsTrigger>
          <TabsTrigger value="list">Invoice List</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Invoice</CardTitle>
              <CardDescription>
                Create invoices from shipping orders or delivery notes.
                Select source document and items to invoice.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceEntry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice List</CardTitle>
              <CardDescription>
                Search and view existing invoices.
                Click on any invoice to view details or edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoicePage;