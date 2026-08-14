### Requirements

**Phase 1 - Foundation & Core**
- Professional dark-themed lab environment (navy/blue/purple/teal)
- User authentication and profiles
- Global component database with powerful search
- Community component submission with admin approval
- Virtual lab workspace with 3D canvas
- Working circuit simulation: Battery → Switch → Resistor → LED
- Component details page with specs
- Save/load projects
- Mobile-responsive design

**Future Phases**
- Phase 2: Passive/active components (diodes, transistors, MOSFETs, op-amps, ICs)
- Phase 3: Programmable boards (ESP32, Arduino) with code editor and GPIO simulation
- Phase 4: Advanced 3D lab, virtual instruments, thousands of components

### Designs

**Architecture**
- Frontend: React 18 + TypeScript + Vite
- Styling: Tailwind CSS with custom design tokens
- Database: Supabase (PostgreSQL + Auth)
- State: React Query + Context API
- Routing: React Router 7

**Database Schema**
- users, components, component_submissions, component_revisions
- projects, circuit_instances, connections
- admin_approvals (moderation workflow)

**Design System**
- Dark lab environment (navy background)
- Blue/cyan/purple/teal/golden accents
- 3D-style component cards with realistic imagery
- Glow effects, professional typography
- Mobile-first responsive design

### Tasks

1. ✓ Analyze project structure and dependencies
2. Design and implement Supabase schema
3. Build authentication system (login/signup)
4. Create professional design system and UI components
5. Implement component database and search system
6. Build component submission and admin approval system
7. Create virtual lab workspace with canvas
8. Implement circuit simulation engine (Phase 1)
9. Build home dashboard and navigation
10. Test and verify core workflows
