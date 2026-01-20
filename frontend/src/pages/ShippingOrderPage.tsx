import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ShippingOrderEntry from '@/components/shipping-order/ShippingOrderEntry';
import ShippingOrderList from '@/components/shipping-order/ShippingOrderList';
import SoFormatConfig from '@/components/shipping-order/SoFormatConfig';

/**
 * Shipping Order Page
 *
 * Original Logic Reference:
 * - Legacy Form: isetso
 * - Documentation: docs/source/04-forms-and-screens/shipping-order-forms.md
 * - Business Rules:
 *   - Main entry point for SO management
 *   - Tabs for different SO operations
 *   - Entry, List, and Format Configuration tabs
 *
 * Reference: Phase 3 - Shipping Order Module
 */
const ShippingOrderPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Shipping Order Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage shipping orders from order confirmations and contracts
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('list')}>
            View All SOs
          </Button>
          <Button variant="outline" onClick={() => setActiveTab('format')}>
            Format Config
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="entry">SO Entry</TabsTrigger>
          <TabsTrigger value="list">SO List</TabsTrigger>
          <TabsTrigger value="format">Format Config</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Shipping Order</CardTitle>
              <CardDescription>
                Create shipping orders from order confirmations or contracts.
                Select source document and items to ship.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingOrderEntry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Order List</CardTitle>
              <CardDescription>
                Search and view existing shipping orders.
                Click on any SO to view details or edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShippingOrderList />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="format" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SO Format Configuration</CardTitle>
              <CardDescription>
                Configure customer-specific shipping order formats.
                These formats control how SO documents are printed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SoFormatConfig />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShippingOrderPage;