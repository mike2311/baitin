import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SalesAnalysisEnquiry from '@/components/enquiry/SalesAnalysisEnquiry';
import ItemEnquiry from '@/components/enquiry/ItemEnquiry';
import SoEnquiry from '@/components/enquiry/SoEnquiry';
import DnEnquiry from '@/components/enquiry/DnEnquiry';
import InvoiceEnquiry from '@/components/enquiry/InvoiceEnquiry';

/**
 * Enquiry Page
 *
 * Original Logic Reference:
 * - Legacy Forms: Various enquiry forms (40+ enquiry forms)
 * - Documentation: docs/source/04-forms-and-screens/enquiry-forms.md
 * - Business Rules:
 *   - Main entry point for enquiries
 *   - Tabs for different enquiry types
 *   - Sales analysis and operational enquiries
 *
 * Reference: Phase 3 - Enquiry Module
 */
const EnquiryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('sales-analysis');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Enquiries</h1>
          <p className="text-muted-foreground mt-2">
            Search and analyze sales data, items, shipping orders, delivery notes, and invoices
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="sales-analysis">Sales Analysis</TabsTrigger>
          <TabsTrigger value="item">Item Enquiry</TabsTrigger>
          <TabsTrigger value="so">SO Enquiry</TabsTrigger>
          <TabsTrigger value="dn">DN Enquiry</TabsTrigger>
          <TabsTrigger value="invoice">Invoice Enquiry</TabsTrigger>
        </TabsList>

        <TabsContent value="sales-analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Analysis</CardTitle>
              <CardDescription>
                Analyze sales by customer, item, or date with totals and counts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SalesAnalysisEnquiry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="item" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Item Enquiry</CardTitle>
              <CardDescription>
                Search items and view order/invoice history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ItemEnquiry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="so" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Order Enquiry</CardTitle>
              <CardDescription>
                Search and view shipping orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SoEnquiry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dn" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Note Enquiry</CardTitle>
              <CardDescription>
                Search and view delivery notes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DnEnquiry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invoice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Enquiry</CardTitle>
              <CardDescription>
                Search and view invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InvoiceEnquiry />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnquiryPage;