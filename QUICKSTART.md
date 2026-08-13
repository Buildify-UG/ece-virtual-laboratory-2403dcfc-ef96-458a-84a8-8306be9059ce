# ElectroLab - Developer Quick Start Guide

## Project Setup

### Prerequisites
- Node.js 16+
- npm or yarn
- Supabase account (already configured)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:5173`

## Environment Configuration

The `.env` file contains Supabase credentials:
```
VITE_SUPABASE_URL=https://ssieyiocaeggncswmepp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

These are already configured for the project.

## Key Files to Know

### Pages
- `src/pages/Index.tsx` - Landing page
- `src/pages/AuthPage.tsx` - Login/signup
- `src/pages/Dashboard.tsx` - User dashboard
- `src/pages/LabWorkspace.tsx` - Main circuit editor
- `src/pages/ComponentLibrary.tsx` - Component browser
- `src/pages/AdminPanel.tsx` - Admin moderation

### Components
- `src/components/CircuitCanvas.tsx` - Canvas rendering
- `src/components/ComponentPalette.tsx` - Component selector
- `src/components/PropertiesPanel.tsx` - Properties editor
- `src/components/AddComponentDialog.tsx` - Component submission

### Core Services
- `src/lib/supabase.ts` - Supabase client and helpers
- `src/lib/simulation/engine.ts` - Circuit simulation
- `src/contexts/AuthContext.tsx` - Authentication state

### Types
- `src/types/index.ts` - TypeScript interfaces

## Database Access

### Query Components
```typescript
import { supabase } from '@/lib/supabase';

// Get all components
const { data: components } = await supabase
  .from('components')
  .select('*')
  .eq('is_active', true);

// Search components
const { data: results } = await supabase
  .from('components')
  .select('*')
  .ilike('name', `%${query}%`)
  .limit(20);
```

### Manage Projects
```typescript
// Create project
const { data: project } = await supabase
  .from('projects')
  .insert({
    user_id: user.id,
    name: 'My Circuit',
    description: 'LED blinker'
  })
  .select()
  .single();

// Save circuit instances
await supabase
  .from('circuit_instances')
  .insert({
    project_id: project.id,
    component_id: componentId,
    instance_name: 'LED1',
    x_position: 100,
    y_position: 150,
    properties: { color: 'red' }
  });
```

## Adding a New Component

### Step 1: Add to Database
```sql
INSERT INTO components (
  name, 
  part_number, 
  category_id, 
  description,
  pin_configuration,
  simulation_model,
  is_active
) VALUES (
  'Capacitor 10µF',
  'CAP-10UF',
  (SELECT id FROM component_categories WHERE name = 'Passive'),
  'Electrolytic capacitor',
  '{"pins": [{"name": "Positive", "id": "pos"}, {"name": "Negative", "id": "neg"}]}',
  '{"type": "capacitor", "capacitance": 0.00001}',
  true
);
```

### Step 2: Add Simulation Logic
In `src/lib/simulation/engine.ts`, add to `solveCircuit()`:
```typescript
if (model.type === 'capacitor') {
  // Implement capacitor equations
  // Q = C * V
  // I = dQ/dt
  const capacitance = model.capacitance;
  const voltage = pinStates.get(pin)?.voltage || 0;
  const charge = capacitance * voltage;
  // Update pin states with calculated values
}
```

### Step 3: Add UI Rendering
In `src/components/CircuitCanvas.tsx`, add to `drawComponent()`:
```typescript
if (component.component.simulation_model?.type === 'capacitor') {
  // Draw capacitor symbol (two parallel lines)
  ctx.drawImage(capacitorSymbol, x, y, 40, 40);
}
```

## Simulation Engine Workflow

The circuit simulation follows this process:

```
1. User clicks "Run Simulation"
2. Engine validates circuit topology
3. Initialize all pin states (voltage = 0V, current = 0A)
4. For each simulation step:
   a. Iterate through all components
   b. Calculate electrical values based on connections
   c. Update pin states
   d. Check for errors/warnings
5. Return simulation results
6. Update UI with component states (LED on/off, etc.)
```

## Common Tasks

### Add a New Page
1. Create `src/pages/NewPage.tsx`
2. Add route in `src/App.tsx`
3. Add navigation link in relevant components

### Add a New Component Type
1. Create component definition in database
2. Add simulation model implementation
3. Add UI rendering logic
4. Test with example circuit

### Modify Design System
1. Edit CSS variables in `src/index.css`
2. Update Tailwind config in `tailwind.config.ts`
3. Test changes in browser

### Debug Simulation
1. Add console.log in `src/lib/simulation/engine.ts`
2. Check browser console for simulation state
3. Use React DevTools to inspect component state

## Testing Workflow

### Manual Testing Checklist
- [ ] User can sign up and log in
- [ ] User can create new project
- [ ] User can add components to circuit
- [ ] User can connect components with wires
- [ ] User can run simulation
- [ ] Simulation correctly calculates circuit behavior
- [ ] User can save and load project
- [ ] User can search components
- [ ] User can submit new component
- [ ] Admin can approve/reject component submission

### Example Test Circuit
```
1. Create new project "Test LED"
2. Add Battery (12V)
3. Add Switch
4. Add Resistor (220Ω)
5. Add LED (Red)
6. Connect: Battery+ → Switch → Resistor → LED → Battery-
7. Run simulation
8. Toggle switch - LED should turn on/off
```

## Performance Tips

- **Component Search**: Uses full-text search for O(log n) performance
- **Canvas Rendering**: Optimized for 100+ components
- **Simulation**: Iterative solver scales with component count
- **Database Queries**: Use `.select()` with specific columns to reduce payload

## Debugging

### Enable Debug Logging
Add to any component:
```typescript
useEffect(() => {
  console.log('Component mounted', { state, props });
}, [state, props]);
```

### Check Simulation State
In `src/pages/LabWorkspace.tsx`:
```typescript
const handleSimulation = () => {
  const result = engine.simulate();
  console.log('Simulation result:', result);
  setSimulationState(result);
};
```

### Database Queries
Test queries in browser console:
```javascript
const { data } = await supabase
  .from('components')
  .select('*')
  .limit(5);
console.log(data);
```

## Useful Resources

- [React Documentation](https://react.dev)
- [Tailwind CSS](https://tailwindcss.com)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router Documentation](https://reactrouter.com)

## Next Steps

1. **Phase 2 Components**: Implement diodes, capacitors, transistors
2. **Instruments**: Add oscilloscope, multimeter simulation
3. **Programmable Boards**: Add Arduino/ESP32 support
4. **3D Visualization**: Upgrade canvas to 3D rendering
5. **Collaboration**: Add real-time project sharing

## Getting Help

- Check `ARCHITECTURE.md` for system design
- Review existing components for patterns
- Check browser console for error messages
- Test in smaller circuits first
- Ask community in discussions

---

**Happy coding! 🚀**
