import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Loader2, Settings, Plus, Save } from 'lucide-react';
import ShippingOrderApiService from '@/services/api/shipping-orders';
import { useToast } from '@/hooks/use-toast';

/**
 * SO Format Configuration Component
 *
 * Original Logic Reference:
 * - Legacy Form: isoformat
 * - Documentation: docs/source/02-business-processes/shipping-process.md
 * - Business Rules:
 *   - Configure customer-specific SO formats
 *   - Define layout positioning (vpos, hpos)
 *   - Set element dimensions (height, width)
 *   - Control how SO documents are printed
 *
 * Reference: Phase 3 - Shipping Order Module
 */
interface SoFormat {
  soKey: string;
  uniqueid: string;
  vpos?: number;
  hpos?: number;
  height?: number;
  width?: number;
}

interface FormatFormData {
  soKey: string;
}

const SoFormatConfig: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState<SoFormat[]>([]);
  const [editingFormat, setEditingFormat] = useState<SoFormat | null>(null);
  const [hasLoadedFormat, setHasLoadedFormat] = useState(false);
  const { toast } = useToast();

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormatFormData>();
  const watchedSoKey = watch('soKey');

  // Load format when SO key changes
  useEffect(() => {
    if (watchedSoKey && watchedSoKey.trim()) {
      loadFormat();
    } else {
      setFormats([]);
      setHasLoadedFormat(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedSoKey]);

  const loadFormat = async () => {
    if (!watchedSoKey?.trim()) return;

    try {
      setLoading(true);
      const formatData = await ShippingOrderApiService.getSoFormat(watchedSoKey.trim());
      setFormats(formatData);
      setHasLoadedFormat(true);
    } catch (error) {
      console.error('Failed to load format:', error);
      toast({
        title: 'Error',
        description: `Failed to load format for ${watchedSoKey}`,
        variant: 'destructive',
      });
      setFormats([]);
      setHasLoadedFormat(false);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (format: SoFormat) => {
    setEditingFormat({ ...format });
  };

  const cancelEditing = () => {
    setEditingFormat(null);
  };

  const saveFormat = async () => {
    if (!editingFormat) return;

    // TODO: Implement format update API
    // For now, just show a message
    toast({
      title: 'Format Updated',
      description: `Updated format element ${editingFormat.uniqueid}`,
    });

    // Update local state
    setFormats(prev => prev.map(f =>
      f.soKey === editingFormat.soKey && f.uniqueid === editingFormat.uniqueid
        ? editingFormat
        : f
    ));

    setEditingFormat(null);
  };

  const updateEditingFormat = (field: keyof SoFormat, value: any) => {
    if (!editingFormat) return;
    setEditingFormat(prev => ({ ...prev, [field]: value }));
  };

  const addNewFormatElement = () => {
    const newElement: SoFormat = {
      soKey: watchedSoKey,
      uniqueid: `element_${Date.now()}`,
      vpos: 0,
      hpos: 0,
      height: 10,
      width: 50,
    };
    setFormats(prev => [...prev, newElement]);
    setEditingFormat(newElement);
  };

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            SO Format Configuration
          </CardTitle>
          <CardDescription>
            Configure customer-specific shipping order formats that control document layout and printing
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(loadFormat)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="soKey">SO Format Key *</Label>
                <Input
                  id="soKey"
                  {...register('soKey', { required: 'SO Format Key is required' })}
                  placeholder="Enter format key (e.g., GLOBE)"
                />
                {errors.soKey && (
                  <p className="text-sm text-red-600">{errors.soKey.message}</p>
                )}
              </div>

              <div className="flex items-end gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Loading...
                    </>
                  ) : (
                    'Load Format'
                  )}
                </Button>

                {hasLoadedFormat && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addNewFormatElement}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add Element
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Format Elements Table */}
      {hasLoadedFormat && (
        <Card>
          <CardHeader>
            <CardTitle>Format Elements</CardTitle>
            <CardDescription>
              Configure layout elements for SO format "{watchedSoKey}". Each element defines positioning and sizing for SO document sections.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {formats.length === 0 ? (
              <Alert>
                <AlertDescription>
                  No format elements found for "{watchedSoKey}". Click "Add Element" to create the first element.
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Element ID</TableHead>
                      <TableHead className="text-center">Vertical Pos</TableHead>
                      <TableHead className="text-center">Horizontal Pos</TableHead>
                      <TableHead className="text-center">Height</TableHead>
                      <TableHead className="text-center">Width</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {formats.map((format) => (
                      <TableRow key={`${format.soKey}-${format.uniqueid}`}>
                        <TableCell className="font-medium">{format.uniqueid}</TableCell>
                        {editingFormat?.soKey === format.soKey && editingFormat?.uniqueid === format.uniqueid ? (
                          <>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingFormat.vpos || 0}
                                onChange={(e) => updateEditingFormat('vpos', parseInt(e.target.value) || 0)}
                                className="w-20 h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingFormat.hpos || 0}
                                onChange={(e) => updateEditingFormat('hpos', parseInt(e.target.value) || 0)}
                                className="w-20 h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingFormat.height || 10}
                                onChange={(e) => updateEditingFormat('height', parseInt(e.target.value) || 10)}
                                className="w-20 h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <Input
                                type="number"
                                value={editingFormat.width || 50}
                                onChange={(e) => updateEditingFormat('width', parseInt(e.target.value) || 50)}
                                className="w-20 h-8"
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-1">
                                <Button size="sm" onClick={saveFormat} disabled={saving}>
                                  {saving ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <Save className="h-4 w-4" />
                                  )}
                                </Button>
                                <Button size="sm" variant="outline" onClick={cancelEditing}>
                                  Cancel
                                </Button>
                              </div>
                            </TableCell>
                          </>
                        ) : (
                          <>
                            <TableCell className="text-center">
                              <Badge variant="outline">{format.vpos || 0}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{format.hpos || 0}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{format.height || 10}</Badge>
                            </TableCell>
                            <TableCell className="text-center">
                              <Badge variant="outline">{format.width || 50}</Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => startEditing(format)}
                              >
                                Edit
                              </Button>
                            </TableCell>
                          </>
                        )}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                <div className="text-sm text-muted-foreground">
                  <p>
                    <strong>Positioning Guide:</strong> Vertical and horizontal positions are measured in report units.
                    Height and width determine the element's display area on the SO document.
                  </p>
                  <p className="mt-1">
                    <strong>Common Elements:</strong> customer_name, so_no, item_details, shipping_info, etc.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Help Information */}
      <Card>
        <CardHeader>
          <CardTitle>How SO Formats Work</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            SO formats control how shipping order documents are printed for specific customers.
            Each format key (e.g., "GLOBE") corresponds to a customer-specific layout.
          </p>
          <p>
            <strong>Positioning:</strong> vpos (vertical position) and hpos (horizontal position) determine where elements appear on the document.
          </p>
          <p>
            <strong>Sizing:</strong> height and width control the display area for each element.
          </p>
          <p>
            <strong>Usage:</strong> When printing an SO, the system looks up the customer's format key and applies the custom layout instead of the default format.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SoFormatConfig;