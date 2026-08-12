import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Zap } from 'lucide-react';

interface CircuitComponent {
  id: string;
  componentId: string;
  name: string;
  x: number;
  y: number;
  properties: Record<string, any>;
}

interface PropertiesPanelProps {
  component?: CircuitComponent;
  onPropertyChange: (key: string, value: any) => void;
  onRemove: () => void;
  isSimulating: boolean;
  simulationState?: any;
}

export default function PropertiesPanel({
  component,
  onPropertyChange,
  onRemove,
  isSimulating,
  simulationState,
}: PropertiesPanelProps) {
  if (!component) return null;

  return (
    <ScrollArea className="flex-1 flex flex-col">
      <div className="p-4 space-y-6 flex-1">
        {/* Component Info */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Component</h3>
          <div className="space-y-2">
            <div>
              <Label className="text-xs">Name</Label>
              <Input
                value={component.name}
                onChange={(e) => onPropertyChange('name', e.target.value)}
                className="text-sm"
                disabled={isSimulating}
              />
            </div>
            <div>
              <Label className="text-xs">ID</Label>
              <Input
                value={component.id}
                disabled
                className="text-sm"
              />
            </div>
          </div>
        </div>

        {/* Position */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Position</h3>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label className="text-xs">X</Label>
              <Input
                type="number"
                value={component.x}
                onChange={(e) => onPropertyChange('x', parseFloat(e.target.value))}
                className="text-sm"
                disabled={isSimulating}
              />
            </div>
            <div>
              <Label className="text-xs">Y</Label>
              <Input
                type="number"
                value={component.y}
                onChange={(e) => onPropertyChange('y', parseFloat(e.target.value))}
                className="text-sm"
                disabled={isSimulating}
              />
            </div>
          </div>
        </div>

        {/* Component-specific properties */}
        <div>
          <h3 className="font-semibold mb-3 text-sm">Properties</h3>
          <div className="space-y-2">
            {Object.entries(component.properties).map(([key, value]) => (
              <div key={key}>
                <Label className="text-xs capitalize">{key}</Label>
                <Input
                  type="text"
                  value={String(value)}
                  onChange={(e) => onPropertyChange(key, e.target.value)}
                  className="text-sm"
                  disabled={isSimulating}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Simulation State */}
        {isSimulating && simulationState && (
          <div>
            <h3 className="font-semibold mb-3 text-sm flex items-center gap-2">
              <Zap className="w-4 h-4 text-[hsl(var(--lab-cyan))]" />
              Simulation
            </h3>
            <div className="space-y-2 p-3 bg-[hsl(var(--lab-light))]/50 rounded">
              {simulationState.voltage !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Voltage</Label>
                  <p className="font-mono text-sm text-[hsl(var(--lab-cyan))]">
                    {simulationState.voltage.toFixed(2)} V
                  </p>
                </div>
              )}
              {simulationState.current !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Current</Label>
                  <p className="font-mono text-sm text-[hsl(var(--lab-cyan))]">
                    {simulationState.current.toFixed(3)} A
                  </p>
                </div>
              )}
              {simulationState.isActive !== undefined && (
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <p className={`text-sm font-semibold ${simulationState.isActive ? 'text-[hsl(var(--lab-success))]' : 'text-muted-foreground'}`}>
                    {simulationState.isActive ? 'Active' : 'Inactive'}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Delete Button */}
      <div className="p-4 border-t border-[hsl(var(--border))]">
        <Button
          variant="destructive"
          className="w-full"
          onClick={onRemove}
          disabled={isSimulating}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Remove Component
        </Button>
      </div>
    </ScrollArea>
  );
}
