# ECE Electronics Virtual Laboratory - Architecture Guide

## Overview

ElectroLab is a professional-grade virtual electronics laboratory for ECE students, hobbyists, and engineers. It allows users to design, simulate, and test electronic circuits before building them physically.

## System Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design tokens
- **UI Components**: shadcn/ui (Radix UI + Tailwind)
- **State Management**: React Context API + React Query
- **Routing**: React Router 7
- **Form Handling**: react-hook-form + zod
- **Database Client**: Supabase JS SDK

### Backend Stack
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Real-time**: Supabase Realtime (for future features)
- **Edge Functions**: Supabase Edge Functions (for advanced features)

### Design System
The application uses a professional dark-themed electronics laboratory environment with:
- **Primary Colors**: Cyan (#00ffff), Purple (#ba55d3), Teal (#00e5cc)
- **Accent Colors**: Gold (#ffd700)
- **Background**: Deep navy/dark blue
- **Glow Effects**: Subtle cyan/purple glows for interactive elements

## Database Schema

### Core Tables

#### `user_profiles`
Extended user profile information linked to Supabase Auth
- Fields: id, username, full_name, avatar_url, bio, role, created_at, updated_at
- Roles: user, admin, moderator

#### `component_categories`
Categories for organizing components
- Fields: id, name, description, icon, created_at
- Examples: Power Supply, Passive, Semiconductor, Microcontroller, etc.

#### `components`
Global, approved component library
- Fields: id, name, part_number, category_id, description, working_principle, specifications, pin_configuration, real_image_url, circuit_symbol_url, datasheet_url, manufacturer, simulation_model, is_active, created_by, created_at, updated_at
- Full-text search enabled on name, part_number, description

#### `component_submissions`
User-submitted components pending admin review
- Fields: Same as components, plus status (pending/approved/rejected/revision_requested), submission_notes, reviewed_by, review_notes
- Workflow: User submits → Admin reviews → Approved → Added to components table

#### `projects`
User circuit design projects
- Fields: id, user_id, name, description, thumbnail_url, is_public, is_template, created_at, updated_at

#### `circuit_instances`
Components placed in a project
- Fields: id, project_id, component_id, instance_name, x_position, y_position, z_position, rotation, properties, created_at, updated_at

#### `connections`
Wires connecting component pins
- Fields: id, project_id, from_instance_id, from_pin, to_instance_id, to_pin, wire_color, created_at

### Row-Level Security (RLS)
- Users can only view/edit their own projects
- Users can submit components but only admins can approve
- Public projects are readable by all
- Component library is readable by all authenticated users

## Application Structure

```
src/
├── pages/                    # Route pages
│   ├── Index.tsx            # Landing page
│   ├── AuthPage.tsx         # Login/signup
│   ├── Dashboard.tsx        # User dashboard
│   ├── LabWorkspace.tsx     # Main circuit editor
│   ├── ComponentLibrary.tsx # Browse components
│   ├── AdminPanel.tsx       # Admin moderation
│   └── NotFound.tsx         # 404 page
├── components/              # Reusable components
│   ├── CircuitCanvas.tsx    # Canvas for drawing circuits
│   ├── ComponentPalette.tsx # Component selection sidebar
│   ├── PropertiesPanel.tsx  # Properties editor
│   ├── AddComponentDialog.tsx # Component submission form
│   ├── ProtectedRoute.tsx   # Auth guard
│   ├── AdminRoute.tsx       # Admin guard
│   └── ui/                  # shadcn/ui components
├── contexts/                # React Context
│   └── AuthContext.tsx      # Authentication state
├── lib/                     # Utilities and services
│   ├── supabase.ts         # Supabase client and helpers
│   └── simulation/         # Circuit simulation engine
│       ├── engine.ts       # Main simulation logic
│       └── components/     # Component models
├── types/                   # TypeScript type definitions
└── styles/                  # Global styles
```

## Key Features Implementation

### 1. Authentication
- Email/password authentication via Supabase Auth
- User profiles auto-created on signup
- Protected routes for authenticated users
- Admin routes for moderation

### 2. Component Database
- Global component library with search
- User-submitted components with admin approval workflow
- Full-text search on component names, part numbers, descriptions
- Component categories for organization

### 3. Circuit Design
- Canvas-based circuit editor
- Drag-and-drop component placement
- Wire drawing between component pins
- Real-time component properties editing
- Save/load projects to Supabase

### 4. Circuit Simulation (Phase 1)
The simulation engine calculates circuit behavior based on component models:

**Supported Components:**
- Battery (DC voltage source)
- Switch (SPST)
- Resistor (ohmic element)
- LED (light-emitting diode with forward voltage)

**Simulation Process:**
1. Validate circuit topology
2. Initialize pin states
3. Solve circuit equations iteratively
4. Update component states
5. Return simulation results

**Example: Battery → Switch → Resistor → LED**
- When switch is ON: Current flows, LED illuminates
- When switch is OFF: No current, LED is off
- Voltage drops across components calculated using Kirchhoff's laws

### 5. Component Submission Workflow
1. User searches for component
2. If not found, clicks "Request/Add Component"
3. Fills out component form with:
   - Name, part number, category
   - Real-life image
   - Circuit symbol image
   - Pin configuration (JSON)
   - Specifications (JSON)
   - Working principle description
   - Datasheet link
4. Submission saved to `component_submissions` table with status "pending"
5. Admin reviews in AdminPanel
6. Admin can approve/reject/request revisions
7. Approved components added to main `components` table
8. All users can now search and use the component

## Simulation Engine Architecture

The simulation engine is designed to be extensible for future component types:

```typescript
// Component models define behavior
interface SimulationModel {
  type: 'voltage_source' | 'switch' | 'resistor' | 'led' | 'capacitor' | 'diode' | 'transistor' | 'custom';
  [key: string]: any;  // Component-specific parameters
}

// Each component implements electrical behavior
// New components can be added by:
// 1. Creating component model in database
// 2. Implementing behavior in simulation engine
// 3. No changes needed to main application code
```

### Expanding the Simulation

To add a new component type (e.g., capacitor):

1. **Add to database**: Insert component with simulation_model:
```json
{
  "type": "capacitor",
  "capacitance": 0.00001,
  "initial_voltage": 0
}
```

2. **Add behavior to engine**: Implement capacitor equations in `solveCircuit()` method

3. **Test**: Simulate circuit with capacitor and verify behavior

## Future Expansion (Phase 2-4)

### Phase 2: More Components
- Diodes, transistors, MOSFETs
- Op-amps, ICs
- Digital logic components
- Transformers, inductors

### Phase 3: Programmable Boards
- Arduino, ESP32 support
- Code editor integration
- GPIO simulation
- Sensor simulation
- Serial communication

### Phase 4: Advanced Features
- 3D lab visualization
- Virtual instruments (oscilloscope, multimeter)
- Advanced simulation models
- Community templates
- Real-time collaboration

## Development Workflow

### Adding a New Component Type

1. **Define component data in database**:
```sql
INSERT INTO components (name, part_number, category_id, simulation_model, ...)
VALUES ('Component Name', 'PART-123', category_id, '{"type": "custom", ...}', ...);
```

2. **Add simulation logic**:
```typescript
// In simulation engine
private simulateComponent(instance: CircuitInstance, model: SimulationModel) {
  if (model.type === 'new_type') {
    // Implement behavior
  }
}
```

3. **Create component UI representation**:
```typescript
// In CircuitCanvas
private drawComponent(component: CircuitInstance) {
  if (component.component.simulation_model.type === 'new_type') {
    // Draw visual representation
  }
}
```

### Adding a New Feature

1. Create feature branch
2. Update database schema if needed
3. Create frontend components/pages
4. Integrate with existing components
5. Test thoroughly
6. Update documentation

## Performance Considerations

- Component search uses full-text search for efficiency
- Circuit simulation uses iterative solver (scales with component count)
- Canvas rendering optimized for 100+ components
- Lazy loading for large projects
- Caching of frequently accessed components

## Security

- Row-level security policies on all tables
- User can only access own projects
- Admin verification for component submissions
- Input validation on all forms
- SQL injection prevention via Supabase SDK

## Deployment

The application is deployed on Buildify Cloud:
- Frontend: Vite build deployed as static site
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth
- Environment variables: `.env` file with Supabase credentials

## Testing

- Manual testing of circuit simulations
- Component database queries
- Authentication flows
- Admin approval workflow
- Project save/load functionality

## Contributing

When adding new features:
1. Follow existing code patterns
2. Use TypeScript for type safety
3. Update types in `/src/types/index.ts`
4. Document new database tables
5. Add comments to complex logic
6. Test thoroughly before committing
