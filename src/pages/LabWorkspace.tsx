import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Zap, Play, Square, Save, Trash2, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase';
import CircuitCanvas from '@/components/CircuitCanvas';
import ComponentPalette from '@/components/ComponentPalette';
import PropertiesPanel from '@/components/PropertiesPanel';

interface CircuitComponent {
  id: string;
  componentId: string;
  name: string;
  x: number;
  y: number;
  properties: Record<string, any>;
}

interface Connection {
  id: string;
  fromComponentId: string;
  fromPin: string;
  toComponentId: string;
  toPin: string;
}

export default function LabWorkspace() {
  const { projectId } = useParams();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [projectName, setProjectName] = useState('Untitled Project');
  const [components, setComponents] = useState<CircuitComponent[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationState, setSimulationState] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Load project on mount
  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      if (projectId) {
        const { data: project } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();

        if (project) {
          setProjectName(project.name);

          const { data: instances } = await supabase
            .from('circuit_instances')
            .select('*')
            .eq('project_id', projectId);

          const { data: conns } = await supabase
            .from('connections')
            .select('*')
            .eq('project_id', projectId);

          if (instances) {
            setComponents(instances.map(i => ({
              id: i.id,
              componentId: i.component_id,
              name: i.instance_name || 'Component',
              x: i.x_position,
              y: i.y_position,
              properties: i.properties || {},
            })));
          }

          if (conns) {
            setConnections(conns.map(c => ({
              id: c.id,
              fromComponentId: c.from_instance_id,
              fromPin: c.from_pin,
              toComponentId: c.to_instance_id,
              toPin: c.to_pin,
            })));
          }
        }
      } else {
        // Load from localStorage for new projects
        const saved = localStorage.getItem(`project-${projectId}`);
        if (saved) {
          const data = JSON.parse(saved);
          setProjectName(data.name);
          setComponents(data.components);
          setConnections(data.connections);
        }
      }
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
    }
  };

  const saveProject = async () => {
    try {
      // Save to localStorage for now
      const projectData = {
        name: projectName,
        components,
        connections,
        timestamp: new Date().toISOString(),
      };

      localStorage.setItem(`project-${projectId}`, JSON.stringify(projectData));
      toast.success('Project saved successfully');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error('Failed to save project');
    }
  };

  const addComponent = (componentId: string, componentName: string) => {
    const newComponent: CircuitComponent = {
      id: Math.random().toString(36).substr(2, 9),
      componentId,
      name: componentName,
      x: 100 + Math.random() * 200,
      y: 100 + Math.random() * 200,
      properties: {},
    };

    setComponents([...components, newComponent]);
    toast.success(`${componentName} added to circuit`);
  };

  const removeComponent = (componentId: string) => {
    setComponents(components.filter(c => c.id !== componentId));
    setConnections(connections.filter(
      c => c.fromComponentId !== componentId && c.toComponentId !== componentId
    ));
    setSelectedComponent(null);
    toast.success('Component removed');
  };

  const toggleSimulation = () => {
    if (!isSimulating) {
      startSimulation();
    } else {
      stopSimulation();
    }
  };

  const startSimulation = () => {
    setIsSimulating(true);
    toast.success('Simulation started');
    
    // Initialize simulation state
    const newState: Record<string, any> = {};
    components.forEach(comp => {
      newState[comp.id] = {
        voltage: comp.properties.voltage || 0,
        current: 0,
        isActive: false,
      };
    });
    setSimulationState(newState);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setSimulationState({});
    toast.success('Simulation stopped');
  };

  const updateComponentProperty = (componentId: string, key: string, value: any) => {
    setComponents(components.map(c =>
      c.id === componentId
        ? { ...c, properties: { ...c.properties, [key]: value } }
        : c
    ));
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-[hsl(var(--lab-dark))] to-[hsl(var(--lab-darker))] text-foreground overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-[hsl(var(--border))] bg-background/50 backdrop-blur-md p-4 flex justify-between items-center">
        <div className="flex items-center gap-4 flex-1">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-[hsl(var(--lab-cyan))]" />
            <Input
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="text-lg font-semibold w-64 bg-transparent border-0 focus:ring-0"
              placeholder="Project name"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant={isSimulating ? 'destructive' : 'default'}
            onClick={toggleSimulation}
            className={isSimulating ? '' : 'bg-[hsl(var(--lab-cyan))] text-background hover:bg-[hsl(var(--lab-cyan))]/90'}
          >
            {isSimulating ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Stop
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run
              </>
            )}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={saveProject}
          >
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Panel - Component Palette */}
        <div className="w-64 border-r border-[hsl(var(--border))] bg-background/30 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-[hsl(var(--border))]">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search components"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </div>
          <ComponentPalette
            searchQuery={searchQuery}
            onComponentSelect={addComponent}
          />
        </div>

        {/* Center - Canvas */}
        <div className="flex-1 overflow-hidden relative bg-[hsl(var(--lab-dark))]">
          <CircuitCanvas
            ref={canvasRef}
            components={components}
            connections={connections}
            selectedComponent={selectedComponent}
            onComponentSelect={setSelectedComponent}
            isSimulating={isSimulating}
            simulationState={simulationState}
          />
        </div>

        {/* Right Panel - Properties */}
        <div className="w-80 border-l border-[hsl(var(--border))] bg-background/30 flex flex-col overflow-hidden">
          {selectedComponent ? (
            <PropertiesPanel
              component={components.find(c => c.id === selectedComponent)}
              onPropertyChange={(key, value) =>
                updateComponentProperty(selectedComponent, key, value)
              }
              onRemove={() => removeComponent(selectedComponent)}
              isSimulating={isSimulating}
              simulationState={simulationState[selectedComponent]}
            />
          ) : (
            <div className="p-4 flex flex-col items-center justify-center h-full text-center">
              <Zap className="w-8 h-8 text-muted-foreground mb-2 opacity-50" />
              <p className="text-sm text-muted-foreground">
                Select a component to view properties
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
