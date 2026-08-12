import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';

interface Component {
  id: string;
  name: string;
  category_id?: string;
}

interface ComponentPaletteProps {
  searchQuery: string;
  onComponentSelect: (componentId: string, componentName: string) => void;
}

export default function ComponentPalette({
  searchQuery,
  onComponentSelect,
}: ComponentPaletteProps) {
  const [components, setComponents] = useState<Component[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComponents();
  }, []);

  const loadComponents = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase
        .from('components')
        .select('id, name, category_id')
        .eq('is_active', true);
      setComponents(data || []);
    } catch (error) {
      console.error('Failed to load components:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComponents = components.filter((comp) =>
    comp.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-4 space-y-2">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-[hsl(var(--lab-cyan))]" />
          </div>
        ) : filteredComponents.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">
            No components found
          </p>
        ) : (
          filteredComponents.map((comp) => (
            <Button
              key={comp.id}
              variant="outline"
              className="w-full justify-start text-sm border-[hsl(var(--lab-cyan))]/20 hover:border-[hsl(var(--lab-cyan))]/50 hover:bg-[hsl(var(--lab-cyan))]/10"
              onClick={() => onComponentSelect(comp.id, comp.name)}
            >
              <span className="text-[hsl(var(--lab-cyan))] mr-2">+</span>
              {comp.name}
            </Button>
          ))
        )}
      </div>
    </ScrollArea>
  );
}
