import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface AddComponentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onComponentAdded?: () => void;
}

export default function AddComponentDialog({
  isOpen,
  onClose,
  onComponentAdded,
}: AddComponentDialogProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    partNumber: '',
    category: '',
    description: '',
    workingPrinciple: '',
    specifications: '',
    pins: '',
    datasheetUrl: '',
    notes: '',
  });

  const categories = [
    'Power Supply',
    'Passive',
    'Semiconductor',
    'Integrated Circuit',
    'Microcontroller',
    'Sensor',
    'Display',
    'Motor',
    'Switch',
    'Connector',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('You must be logged in to submit components');
      return;
    }

    if (!formData.name || !formData.category) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsSubmitting(true);
    try {
      // Get category ID
      const { data: categoryData } = await supabase
        .from('component_categories')
        .select('id')
        .eq('name', formData.category)
        .single();

      // Submit component
      const { error } = await supabase
        .from('component_submissions')
        .insert({
          submitted_by: user.id,
          name: formData.name,
          part_number: formData.partNumber,
          category_id: categoryData?.id,
          description: formData.description,
          working_principle: formData.workingPrinciple,
          specifications: formData.specifications ? JSON.parse(formData.specifications) : {},
          pin_configuration: formData.pins ? { pins: JSON.parse(formData.pins) } : { pins: [] },
          datasheet_url: formData.datasheetUrl,
          status: 'pending',
          submission_notes: formData.notes,
        });

      if (error) throw error;

      toast.success('Component submitted for review! Our team will verify it shortly.');
      setFormData({
        name: '',
        partNumber: '',
        category: '',
        description: '',
        workingPrinciple: '',
        specifications: '',
        pins: '',
        datasheetUrl: '',
        notes: '',
      });
      onClose();
      onComponentAdded?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Failed to submit component');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[hsl(var(--lab-cyan))]/20">
        <DialogHeader>
          <DialogTitle>Add New Component</DialogTitle>
          <DialogDescription>
            Submit a new electronic component to the shared library. Your submission will be reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="font-semibold">Basic Information</h3>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Component Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g., BC557 PNP Transistor"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="partNumber">Part Number</Label>
                <Input
                  id="partNumber"
                  placeholder="e.g., BC557"
                  value={formData.partNumber}
                  onChange={(e) => setFormData({ ...formData, partNumber: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                <SelectTrigger id="category" className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-4">
            <h3 className="font-semibold">Description</h3>

            <div>
              <Label htmlFor="description">Component Description</Label>
              <Textarea
                id="description"
                placeholder="Describe what this component does..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="working">Working Principle</Label>
              <Textarea
                id="working"
                placeholder="Explain how this component works..."
                value={formData.workingPrinciple}
                onChange={(e) => setFormData({ ...formData, workingPrinciple: e.target.value })}
                className="mt-1"
                rows={3}
              />
            </div>
          </div>

          {/* Technical Details */}
          <div className="space-y-4">
            <h3 className="font-semibold">Technical Details</h3>

            <div>
              <Label htmlFor="specs">Specifications (JSON)</Label>
              <Textarea
                id="specs"
                placeholder='{"voltage": "5V", "current": "100mA"}'
                value={formData.specifications}
                onChange={(e) => setFormData({ ...formData, specifications: e.target.value })}
                className="mt-1 font-mono text-sm"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="pins">Pin Configuration (JSON)</Label>
              <Textarea
                id="pins"
                placeholder='[{"name": "VCC", "symbol": "+", "id": "vcc"}, {"name": "GND", "symbol": "-", "id": "gnd"}]'
                value={formData.pins}
                onChange={(e) => setFormData({ ...formData, pins: e.target.value })}
                className="mt-1 font-mono text-sm"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="datasheet">Datasheet URL</Label>
              <Input
                id="datasheet"
                type="url"
                placeholder="https://example.com/datasheet.pdf"
                value={formData.datasheetUrl}
                onChange={(e) => setFormData({ ...formData, datasheetUrl: e.target.value })}
                className="mt-1"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="mt-1"
              rows={2}
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="bg-[hsl(var(--lab-purple))] text-foreground hover:bg-[hsl(var(--lab-purple))]/90"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Submit for Review
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
