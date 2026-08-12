import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Search, Plus, Zap, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import AddComponentDialog from '@/components/AddComponentDialog';

interface Component {
  id: string;
  name: string;
  part_number?: string;
  category_id?: string;
  description?: string;
  real_image_url?: string;
  specifications?: Record<string, any>;
  pin_configuration?: Record<string, any>;
}

interface Category {
  id: string;
  name: string;
  icon?: string;
}

export default function ComponentLibrary() {
  const [components, setComponents] = useState<Component[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingComponent, setIsAddingComponent] = useState(false);
  const [notFoundComponent, setNotFoundComponent] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Load categories
      const { data: categoriesData } = await supabase
        .from('component_categories')
        .select('*');
      setCategories(categoriesData || []);

      // Load components
      const { data: componentsData } = await supabase
        .from('components')
        .select('*')
        .eq('is_active', true);
      setComponents(componentsData || []);
    } catch (error) {
      toast.error('Failed to load components');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredComponents = components.filter((component) => {
    const matchesSearch =
      !searchQuery ||
      component.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.part_number?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      component.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      !selectedCategory || component.category_id === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && filteredComponents.length === 0) {
      setNotFoundComponent(query);
    } else {
      setNotFoundComponent(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-[hsl(var(--lab-dark))] to-[hsl(var(--lab-darker))] text-foreground">
      {/* Header */}
      <header className="border-b border-[hsl(var(--border))] bg-background/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-[hsl(var(--lab-cyan))]" />
            <h1 className="text-2xl font-bold">Component Library</h1>
          </div>
          <Button
            onClick={() => setIsAddingComponent(true)}
            className="bg-[hsl(var(--lab-purple))] text-foreground hover:bg-[hsl(var(--lab-purple))]/90"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Component
          </Button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search components (e.g., 'LED', 'ESP32', 'transistor', 'BC557')"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 py-6 text-base border-[hsl(var(--lab-cyan))]/30"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8 flex gap-2 flex-wrap">
          <Button
            variant={selectedCategory === null ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(null)}
            className={selectedCategory === null ? 'bg-[hsl(var(--lab-cyan))] text-background' : ''}
          >
            All Categories
          </Button>
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? 'default' : 'outline'}
              onClick={() => setSelectedCategory(category.id)}
              className={selectedCategory === category.id ? 'bg-[hsl(var(--lab-cyan))] text-background' : ''}
            >
              {category.icon} {category.name}
            </Button>
          ))}
        </div>

        {/* Components Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--lab-cyan))]" />
          </div>
        ) : filteredComponents.length === 0 ? (
          <Card className="p-12 border-[hsl(var(--lab-cyan))]/20 bg-background/50 text-center">
            <div className="space-y-4">
              <p className="text-muted-foreground">
                {notFoundComponent
                  ? `No components found for "${notFoundComponent}"`
                  : 'No components in this category'}
              </p>
              {notFoundComponent && (
                <Button
                  onClick={() => {
                    setIsAddingComponent(true);
                  }}
                  className="bg-[hsl(var(--lab-purple))] text-foreground hover:bg-[hsl(var(--lab-purple))]/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Request/Add "{notFoundComponent}"
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredComponents.map((component) => (
              <Card
                key={component.id}
                className="p-6 border-[hsl(var(--lab-cyan))]/20 bg-background/50 hover:border-[hsl(var(--lab-cyan))]/50 transition-colors overflow-hidden group"
              >
                {/* Component Image */}
                <div className="mb-4 h-40 bg-[hsl(var(--lab-light))] rounded-lg flex items-center justify-center overflow-hidden border border-[hsl(var(--lab-cyan))]/20">
                  {component.real_image_url ? (
                    <img
                      src={component.real_image_url}
                      alt={component.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                  ) : (
                    <div className="text-center">
                      <Zap className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-xs text-muted-foreground">No image</p>
                    </div>
                  )}
                </div>

                {/* Component Info */}
                <h3 className="font-semibold mb-1 group-hover:text-[hsl(var(--lab-cyan))] transition-colors">
                  {component.name}
                </h3>
                {component.part_number && (
                  <p className="text-xs text-muted-foreground mb-3">
                    Part: {component.part_number}
                  </p>
                )}
                {component.description && (
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {component.description}
                  </p>
                )}

                {/* Specs */}
                {component.specifications && (
                  <div className="mb-4 text-xs space-y-1">
                    {Object.entries(component.specifications)
                      .slice(0, 2)
                      .map(([key, value]) => (
                        <div key={key} className="text-muted-foreground">
                          <span className="font-medium">{key}:</span> {String(value)}
                        </div>
                      ))}
                  </div>
                )}

                {/* Pins */}
                {component.pin_configuration?.pins && (
                  <div className="mb-4 p-2 bg-[hsl(var(--lab-light))]/50 rounded text-xs">
                    <p className="font-medium mb-1">Pins:</p>
                    <div className="space-y-1">
                      {component.pin_configuration.pins.slice(0, 3).map((pin: any) => (
                        <div key={pin.id} className="text-muted-foreground">
                          {pin.name} ({pin.symbol})
                        </div>
                      ))}
                      {component.pin_configuration.pins.length > 3 && (
                        <div className="text-muted-foreground">
                          +{component.pin_configuration.pins.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <Button
                  className="w-full bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90"
                  onClick={() => window.location.href = `/lab?component=${component.id}`}
                >
                  Use in Lab
                </Button>
              </Card>
            ))}
          </div>
        )}
      </main>

      {/* Add Component Dialog */}
      <AddComponentDialog
        isOpen={isAddingComponent}
        onClose={() => setIsAddingComponent(false)}
        onComponentAdded={() => {
          loadData();
          setIsAddingComponent(false);
        }}
      />
    </div>
  );
}
