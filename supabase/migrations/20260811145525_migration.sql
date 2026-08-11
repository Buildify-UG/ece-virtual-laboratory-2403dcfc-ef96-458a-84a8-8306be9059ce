-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (extends Supabase auth)
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Component categories
CREATE TABLE IF NOT EXISTS component_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Global component library (approved components)
CREATE TABLE IF NOT EXISTS components (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  part_number TEXT,
  category_id UUID REFERENCES component_categories(id),
  description TEXT,
  working_principle TEXT,
  specifications JSONB,
  pin_configuration JSONB NOT NULL,
  real_image_url TEXT,
  circuit_symbol_url TEXT,
  datasheet_url TEXT,
  manufacturer TEXT,
  simulation_model JSONB,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  search_vector tsvector
);

CREATE INDEX idx_components_category ON components(category_id);
CREATE INDEX idx_components_search ON components USING GIN(search_vector);

-- Component submissions (user-submitted components pending approval)
CREATE TABLE IF NOT EXISTS component_submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  submitted_by UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  part_number TEXT,
  category_id UUID REFERENCES component_categories(id),
  description TEXT,
  working_principle TEXT,
  specifications JSONB,
  pin_configuration JSONB NOT NULL,
  real_image_url TEXT,
  circuit_symbol_url TEXT,
  datasheet_url TEXT,
  manufacturer TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'revision_requested')),
  submission_notes TEXT,
  reviewed_by UUID REFERENCES user_profiles(id),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_submissions_status ON component_submissions(status);
CREATE INDEX idx_submissions_submitted_by ON component_submissions(submitted_by);

-- Projects (user circuit designs)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  thumbnail_url TEXT,
  is_public BOOLEAN DEFAULT false,
  is_template BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_public ON projects(is_public);

-- Circuit instances (components placed in a project)
CREATE TABLE IF NOT EXISTS circuit_instances (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  component_id UUID NOT NULL REFERENCES components(id),
  instance_name TEXT,
  x_position FLOAT DEFAULT 0,
  y_position FLOAT DEFAULT 0,
  z_position FLOAT DEFAULT 0,
  rotation FLOAT DEFAULT 0,
  properties JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_circuit_instances_project ON circuit_instances(project_id);

-- Connections (wires between component pins)
CREATE TABLE IF NOT EXISTS connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  from_instance_id UUID NOT NULL REFERENCES circuit_instances(id) ON DELETE CASCADE,
  from_pin TEXT NOT NULL,
  to_instance_id UUID NOT NULL REFERENCES circuit_instances(id) ON DELETE CASCADE,
  to_pin TEXT NOT NULL,
  wire_color TEXT DEFAULT '#00ff88',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT different_instances CHECK (from_instance_id != to_instance_id)
);

CREATE INDEX idx_connections_project ON connections(project_id);

-- Seed initial component categories
INSERT INTO component_categories (name, description, icon) VALUES
  ('Power Supply', 'Voltage sources and power management', '⚡'),
  ('Passive', 'Resistors, capacitors, inductors', '〰️'),
  ('Semiconductor', 'Diodes, transistors, MOSFETs', '◆'),
  ('Integrated Circuit', 'ICs, microcontrollers, op-amps', '🔲'),
  ('Microcontroller', 'Arduino, ESP32, Raspberry Pi', '🖥️'),
  ('Sensor', 'Temperature, light, motion, pressure', '📡'),
  ('Display', 'LEDs, LCD, OLED, 7-segment', '📺'),
  ('Motor', 'DC motors, servo motors, steppers', '⚙️'),
  ('Switch', 'Switches, relays, buttons', '🔘'),
  ('Connector', 'Connectors, headers, terminals', '🔗')
ON CONFLICT DO NOTHING;

-- Seed initial components (Phase 1)
INSERT INTO components (name, part_number, category_id, description, working_principle, specifications, pin_configuration, manufacturer, simulation_model, is_active, created_at) 
SELECT 
  'Battery (DC Power Supply)',
  'BATTERY-DC-V',
  (SELECT id FROM component_categories WHERE name = 'Power Supply'),
  'A direct current (DC) voltage source that provides electrical power to circuits.',
  'A battery converts chemical energy into electrical energy through electrochemical reactions. The positive terminal has excess electrons (cathode) and the negative terminal has a deficit (anode), creating potential difference.',
  '{"voltage_range": "1.5V - 48V", "current_capacity": "Variable", "typical_voltage": "9V, 12V"}',
  '{"pins": [{"name": "Positive", "symbol": "+", "id": "pos"}, {"name": "Negative", "symbol": "-", "id": "neg"}]}',
  'Generic',
  '{"type": "voltage_source", "voltage": 12, "internal_resistance": 0.1}',
  true,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM components WHERE part_number = 'BATTERY-DC-V');

INSERT INTO components (name, part_number, category_id, description, working_principle, specifications, pin_configuration, manufacturer, simulation_model, is_active, created_at)
SELECT
  'Switch (SPST)',
  'SWITCH-SPST',
  (SELECT id FROM component_categories WHERE name = 'Switch'),
  'A single-pole single-throw switch that opens or closes a circuit.',
  'A mechanical switch that physically connects or disconnects two terminals. When ON, current flows; when OFF, the circuit is broken.',
  '{"contact_rating": "10A @ 250V", "switching_speed": "Mechanical"}',
  '{"pins": [{"name": "Terminal 1", "symbol": "T1", "id": "t1"}, {"name": "Terminal 2", "symbol": "T2", "id": "t2"}]}',
  'Generic',
  '{"type": "switch", "is_closed": false, "resistance_closed": 0.01, "resistance_open": 1000000}',
  true,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM components WHERE part_number = 'SWITCH-SPST');

INSERT INTO components (name, part_number, category_id, description, working_principle, specifications, pin_configuration, manufacturer, simulation_model, is_active, created_at)
SELECT
  'Resistor (Standard)',
  'RESISTOR-1K',
  (SELECT id FROM component_categories WHERE name = 'Passive'),
  'A passive component that opposes the flow of electric current, dissipating energy as heat.',
  'A resistor restricts current flow according to Ohm''s Law (V = I × R). Common values range from ohms to megaohms. Power rating determines heat dissipation capability.',
  '{"resistance": "1kΩ", "tolerance": "±5%", "power_rating": "0.25W, 0.5W, 1W"}',
  '{"pins": [{"name": "Terminal A", "symbol": "A", "id": "a"}, {"name": "Terminal B", "symbol": "B", "id": "b"}]}',
  'Generic',
  '{"type": "resistor", "resistance": 1000, "tolerance": 0.05, "power_rating": 0.25}',
  true,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM components WHERE part_number = 'RESISTOR-1K');

INSERT INTO components (name, part_number, category_id, description, working_principle, specifications, pin_configuration, manufacturer, simulation_model, is_active, created_at)
SELECT
  'LED (Red 5mm)',
  'LED-RED-5MM',
  (SELECT id FROM component_categories WHERE name = 'Display'),
  'A light-emitting diode that emits red light when forward-biased.',
  'When current flows through the LED in the forward direction, electrons recombine with holes, releasing energy as visible light. Requires a current-limiting resistor to prevent damage.',
  '{"forward_voltage": "1.8V - 2.2V", "max_current": "20mA", "wavelength": "620-630nm", "luminous_intensity": "~500mcd"}',
  '{"pins": [{"name": "Anode", "symbol": "+", "id": "anode"}, {"name": "Cathode", "symbol": "-", "id": "cathode"}]}',
  'Generic',
  '{"type": "led", "forward_voltage": 2.0, "max_current": 0.02, "is_on": false, "color": "#ff0000"}',
  true,
  CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM components WHERE part_number = 'LED-RED-5MM');

-- Create RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE component_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE circuit_instances ENABLE ROW LEVEL SECURITY;
ALTER TABLE connections ENABLE ROW LEVEL SECURITY;

-- User profiles policies
CREATE POLICY "Users can read all profiles" ON user_profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON user_profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON user_profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Component submissions policies
CREATE POLICY "Users can view own submissions" ON component_submissions FOR SELECT USING (
  auth.uid() = submitted_by OR 
  (SELECT role FROM user_profiles WHERE id = auth.uid()) IN ('admin', 'moderator')
);
CREATE POLICY "Users can create submissions" ON component_submissions FOR INSERT WITH CHECK (auth.uid() = submitted_by);
CREATE POLICY "Users can update own pending submissions" ON component_submissions FOR UPDATE USING (
  auth.uid() = submitted_by AND status = 'pending'
);

-- Projects policies
CREATE POLICY "Users can view own projects" ON projects FOR SELECT USING (
  auth.uid() = user_id OR is_public = true
);
CREATE POLICY "Users can create projects" ON projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON projects FOR DELETE USING (auth.uid() = user_id);

-- Circuit instances policies
CREATE POLICY "Users can view instances in own projects" ON circuit_instances FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = circuit_instances.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage instances in own projects" ON circuit_instances FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = circuit_instances.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update instances in own projects" ON circuit_instances FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = circuit_instances.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete instances in own projects" ON circuit_instances FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = circuit_instances.project_id AND projects.user_id = auth.uid())
);

-- Connections policies
CREATE POLICY "Users can view connections in own projects" ON connections FOR SELECT USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = connections.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can manage connections in own projects" ON connections FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = connections.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can update connections in own projects" ON connections FOR UPDATE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = connections.project_id AND projects.user_id = auth.uid())
);
CREATE POLICY "Users can delete connections in own projects" ON connections FOR DELETE USING (
  EXISTS (SELECT 1 FROM projects WHERE projects.id = connections.project_id AND projects.user_id = auth.uid())
);

-- Create trigger to update search_vector for components
CREATE OR REPLACE FUNCTION update_component_search_vector()
RETURNS TRIGGER AS $$
BEGIN
  NEW.search_vector := to_tsvector('english', COALESCE(NEW.name, '') || ' ' || COALESCE(NEW.part_number, '') || ' ' || COALESCE(NEW.description, ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER component_search_update
BEFORE INSERT OR UPDATE ON components
FOR EACH ROW
EXECUTE FUNCTION update_component_search_vector();

-- Create trigger to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated_at BEFORE UPDATE ON user_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER components_updated_at BEFORE UPDATE ON components
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER component_submissions_updated_at BEFORE UPDATE ON component_submissions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER projects_updated_at BEFORE UPDATE ON projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER circuit_instances_updated_at BEFORE UPDATE ON circuit_instances
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();