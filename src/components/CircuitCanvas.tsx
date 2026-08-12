import { forwardRef, useEffect, useRef } from 'react';

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

interface CircuitCanvasProps {
  components: CircuitComponent[];
  connections: Connection[];
  selectedComponent: string | null;
  onComponentSelect: (id: string) => void;
  isSimulating: boolean;
  simulationState: Record<string, any>;
}

const CircuitCanvas = forwardRef<HTMLCanvasElement, CircuitCanvasProps>(
  (
    {
      components,
      connections,
      selectedComponent,
      onComponentSelect,
      isSimulating,
      simulationState,
    },
    ref
  ) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (!canvasRef.current || !containerRef.current) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas size
      canvas.width = containerRef.current.clientWidth;
      canvas.height = containerRef.current.clientHeight;

      // Clear canvas
      ctx.fillStyle = 'hsl(215 35% 8%)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw grid
      drawGrid(ctx, canvas.width, canvas.height);

      // Draw connections
      connections.forEach((conn) => {
        const fromComp = components.find((c) => c.id === conn.fromComponentId);
        const toComp = components.find((c) => c.id === conn.toComponentId);

        if (fromComp && toComp) {
          drawConnection(ctx, fromComp, toComp, conn);
        }
      });

      // Draw components
      components.forEach((comp) => {
        const isSelected = comp.id === selectedComponent;
        drawComponent(ctx, comp, isSelected, isSimulating, simulationState[comp.id]);
      });
    }, [components, connections, selectedComponent, isSimulating, simulationState]);

    const drawGrid = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
      ctx.strokeStyle = 'hsl(215 25% 25% / 0.2)';
      ctx.lineWidth = 1;

      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
    };

    const drawComponent = (
      ctx: CanvasRenderingContext2D,
      comp: CircuitComponent,
      isSelected: boolean,
      isSimulating: boolean,
      state: any
    ) => {
      const size = 60;
      const x = comp.x;
      const y = comp.y;

      // Draw shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;

      // Draw component box
      if (isSelected) {
        ctx.fillStyle = 'hsl(190 100% 50% / 0.3)';
        ctx.strokeStyle = 'hsl(190 100% 50%)';
        ctx.lineWidth = 3;
      } else {
        ctx.fillStyle = 'hsl(215 30% 12%)';
        ctx.strokeStyle = isSimulating && state?.isActive ? 'hsl(120 100% 40%)' : 'hsl(190 100% 50% / 0.5)';
        ctx.lineWidth = 2;
      }

      ctx.fillRect(x - size / 2, y - size / 2, size, size);
      ctx.strokeRect(x - size / 2, y - size / 2, size, size);

      // Reset shadow
      ctx.shadowColor = 'transparent';

      // Draw component name
      ctx.fillStyle = 'hsl(210 40% 98%)';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(comp.name.substring(0, 8), x, y - 10);

      // Draw status indicator
      if (isSimulating && state) {
        ctx.fillStyle = state.isActive ? 'hsl(120 100% 40%)' : 'hsl(215 20% 35%)';
        ctx.beginPath();
        ctx.arc(x + 20, y - 20, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw pins
      const pins = ['A', 'B', 'C', 'D'];
      pins.forEach((pin, i) => {
        const pinX = x - 30 + (i % 2) * 60;
        const pinY = y - 25 + Math.floor(i / 2) * 50;

        ctx.fillStyle = 'hsl(190 100% 50%)';
        ctx.beginPath();
        ctx.arc(pinX, pinY, 3, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = 'hsl(210 40% 98%)';
        ctx.font = '10px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(pin, pinX, pinY + 12);
      });
    };

    const drawConnection = (
      ctx: CanvasRenderingContext2D,
      fromComp: CircuitComponent,
      toComp: CircuitComponent,
      conn: Connection
    ) => {
      ctx.strokeStyle = 'hsl(180 100% 45% / 0.6)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';

      // Draw line from component to component
      ctx.beginPath();
      ctx.moveTo(fromComp.x, fromComp.y);

      // Draw bezier curve
      const midX = (fromComp.x + toComp.x) / 2;
      const midY = (fromComp.y + toComp.y) / 2;
      ctx.quadraticCurveTo(midX + 50, midY, toComp.x, toComp.y);
      ctx.stroke();
    };

    const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      // Check if click is on a component
      for (const comp of components) {
        const distance = Math.sqrt(
          Math.pow(x - comp.x, 2) + Math.pow(y - comp.y, 2)
        );
        if (distance < 40) {
          onComponentSelect(comp.id);
          return;
        }
      }

      onComponentSelect('');
    };

    return (
      <div
        ref={containerRef}
        className="w-full h-full relative overflow-hidden bg-[hsl(var(--lab-dark))]"
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className="w-full h-full cursor-pointer"
        />
      </div>
    );
  }
);

CircuitCanvas.displayName = 'CircuitCanvas';
export default CircuitCanvas;
