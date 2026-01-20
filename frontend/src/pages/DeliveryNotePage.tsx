import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DeliveryNoteEntry from '@/components/delivery-note/DeliveryNoteEntry';
import DeliveryNoteList from '@/components/delivery-note/DeliveryNoteList';

/**
 * Delivery Note Page
 *
 * Original Logic Reference:
 * - Legacy Form: idn
 * - Documentation: docs/source/04-forms-and-screens/delivery-note-forms.md
 * - Business Rules:
 *   - Main entry point for DN management
 *   - Tabs for different DN operations
 *   - Entry and List tabs
 *
 * Reference: Phase 3 - Delivery Note Module
 */
const DeliveryNotePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('entry');

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Delivery Note Management</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage delivery notes from shipping orders
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab('list')}>
            View All DNs
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entry">DN Entry</TabsTrigger>
          <TabsTrigger value="list">DN List</TabsTrigger>
        </TabsList>

        <TabsContent value="entry" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create Delivery Note</CardTitle>
              <CardDescription>
                Create delivery notes from shipping orders.
                Select SO and items to deliver.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryNoteEntry />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Delivery Note List</CardTitle>
              <CardDescription>
                Search and view existing delivery notes.
                Click on any DN to view details or edit.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DeliveryNoteList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryNotePage;