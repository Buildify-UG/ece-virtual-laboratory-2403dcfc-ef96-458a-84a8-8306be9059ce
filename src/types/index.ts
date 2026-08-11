// User types
export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  role: 'user' | 'admin' | 'moderator';
  created_at: string;
  updated_at: string;
}

// Component types
export interface ComponentPin {
  name: string;
  symbol: string;
  id: string;
  position?: { x: number; y: number };
}

export interface ComponentCategory {
  id: string;
  name: string;
  description?: string;
  icon?: string;
  created_at: string;
}

export interface SimulationModel {
  type: 'voltage_source' | 'switch' | 'resistor' | 'led' | 'capacitor' | 'diode' | 'transistor' | 'custom';
  [key: string]: any;
}

export interface Component {
  id: string;
  name: string;
  part_number?: string;
  category_id: string;
  description?: string;
  working_principle?: string;
  specifications?: Record<string, any>;
  pin_configuration: { pins: ComponentPin[] };
  real_image_url?: string;
  circuit_symbol_url?: string;
  datasheet_url?: string;
  manufacturer?: string;
  simulation_model?: SimulationModel;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComponentSubmission {
  id: string;
  submitted_by: string;
  name: string;
  part_number?: string;
  category_id?: string;
  description?: string;
  working_principle?: string;
  specifications?: Record<string, any>;
  pin_configuration: { pins: ComponentPin[] };
  real_image_url?: string;
  circuit_symbol_url?: string;
  datasheet_url?: string;
  manufacturer?: string;
  status: 'pending' | 'approved' | 'rejected' | 'revision_requested';
  submission_notes?: string;
  reviewed_by?: string;
  review_notes?: string;
  created_at: string;
  updated_at: string;
}

// Project types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  thumbnail_url?: string;
  is_public: boolean;
  is_template: boolean;
  created_at: string;
  updated_at: string;
}

export interface CircuitInstance {
  id: string;
  project_id: string;
  component_id: string;
  instance_name?: string;
  x_position: number;
  y_position: number;
  z_position: number;
  rotation: number;
  properties?: Record<string, any>;
  created_at: string;
  updated_at: string;
  // Runtime properties
  component?: Component;
}

export interface Connection {
  id: string;
  project_id: string;
  from_instance_id: string;
  from_pin: string;
  to_instance_id: string;
  to_pin: string;
  wire_color?: string;
  created_at: string;
}

// Circuit state types
export interface CircuitState {
  instances: Map<string, CircuitInstanceState>;
  connections: Connection[];
}

export interface CircuitInstanceState {
  instance: CircuitInstance;
  component: Component;
  pinStates: Map<string, PinState>;
  properties: Record<string, any>;
}

export interface PinState {
  pinId: string;
  voltage: number;
  current: number;
  isConnected: boolean;
}

// Simulation types
export interface SimulationResult {
  timestamp: number;
  instances: Map<string, InstanceSimulationResult>;
  isValid: boolean;
  warnings: string[];
  errors: string[];
}

export interface InstanceSimulationResult {
  instanceId: string;
  componentId: string;
  pinVoltages: Map<string, number>;
  pinCurrents: Map<string, number>;
  properties: Record<string, any>;
}

// UI types
export interface SearchResult {
  components: Component[];
  total: number;
  hasMore: boolean;
}

export interface FormErrors {
  [key: string]: string;
}
