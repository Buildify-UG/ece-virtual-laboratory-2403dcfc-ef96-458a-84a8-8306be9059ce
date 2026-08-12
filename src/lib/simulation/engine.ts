import { CircuitState, Connection, CircuitInstance, Component, SimulationResult, InstanceSimulationResult, PinState } from '@/types';

/**
 * Circuit Simulation Engine
 * Handles the calculation of electrical behavior in circuits
 * Designed to be expandable for additional component types
 */

export class CircuitSimulationEngine {
  private circuitState: CircuitState;
  private timeStep: number = 0.001; // 1ms time step
  private maxIterations: number = 100;

  constructor(circuitState: CircuitState) {
    this.circuitState = circuitState;
  }

  /**
   * Run a single simulation step
   */
  simulate(): SimulationResult {
    const result: SimulationResult = {
      timestamp: Date.now(),
      instances: new Map(),
      isValid: true,
      warnings: [],
      errors: [],
    };

    try {
      // Step 1: Validate circuit topology
      const validation = this.validateCircuit();
      if (!validation.isValid) {
        result.isValid = false;
        result.errors = validation.errors;
        result.warnings = validation.warnings;
        return result;
      }

      // Step 2: Initialize pin states for all instances
      this.initializePinStates();

      // Step 3: Solve circuit equations iteratively
      this.solveCircuit(result);

      // Step 4: Update component states based on electrical values
      this.updateComponentStates(result);

      return result;
    } catch (error) {
      result.isValid = false;
      result.errors.push(`Simulation error: ${error instanceof Error ? error.message : String(error)}`);
      return result;
    }
  }

  /**
   * Validate circuit topology for common errors
   */
  private validateCircuit(): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unconnected components
    for (const [instanceId, instance] of this.circuitState.instances) {
      const connectedPins = new Set<string>();
      
      for (const connection of this.circuitState.connections) {
        if (connection.from_instance_id === instanceId) {
          connectedPins.add(connection.from_pin);
        }
        if (connection.to_instance_id === instanceId) {
          connectedPins.add(connection.to_pin);
        }
      }

      // Get component pins
      const component = instance.component;
      const requiredPins = component.pin_configuration.pins;

      // Check for critical unconnected pins (e.g., power pins)
      for (const pin of requiredPins) {
        if (pin.name.toLowerCase().includes('power') || pin.name.toLowerCase().includes('ground')) {
          if (!connectedPins.has(pin.id)) {
            warnings.push(`Component "${instance.instance.instance_name || component.name}" has unconnected pin: ${pin.name}`);
          }
        }
      }
    }

    // Check for short circuits (direct connections between different voltage sources)
    const shortCircuits = this.detectShortCircuits();
    if (shortCircuits.length > 0) {
      errors.push(`Potential short circuit detected between: ${shortCircuits.join(', ')}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Detect potential short circuits
   */
  private detectShortCircuits(): string[] {
    const shortCircuits: string[] = [];
    const voltageSources = Array.from(this.circuitState.instances.values()).filter(
      (inst) => inst.component.simulation_model?.type === 'voltage_source'
    );

    // Check if multiple voltage sources are directly connected
    for (let i = 0; i < voltageSources.length; i++) {
      for (let j = i + 1; j < voltageSources.length; j++) {
        const source1 = voltageSources[i];
        const source2 = voltageSources[j];

        // Check if they share connected pins
        for (const conn of this.circuitState.connections) {
          if (
            (conn.from_instance_id === source1.instance.id && conn.to_instance_id === source2.instance.id) ||
            (conn.from_instance_id === source2.instance.id && conn.to_instance_id === source1.instance.id)
          ) {
            shortCircuits.push(`${source1.instance.instance_name} to ${source2.instance.instance_name}`);
          }
        }
      }
    }

    return shortCircuits;
  }

  /**
   * Initialize pin states for all instances
   */
  private initializePinStates(): void {
    for (const [, instance] of this.circuitState.instances) {
      instance.pinStates = new Map();
      for (const pin of instance.component.pin_configuration.pins) {
        instance.pinStates.set(pin.id, {
          pinId: pin.id,
          voltage: 0,
          current: 0,
          isConnected: false,
        });
      }
    }

    // Mark connected pins
    for (const connection of this.circuitState.connections) {
      const fromInstance = this.circuitState.instances.get(connection.from_instance_id);
      const toInstance = this.circuitState.instances.get(connection.to_instance_id);

      if (fromInstance && toInstance) {
        const fromPin = fromInstance.pinStates.get(connection.from_pin);
        const toPin = toInstance.pinStates.get(connection.to_pin);

        if (fromPin) fromPin.isConnected = true;
        if (toPin) toPin.isConnected = true;
      }
    }
  }

  /**
   * Solve the circuit using iterative approach
   */
  private solveCircuit(result: SimulationResult): void {
    let iteration = 0;
    let converged = false;

    while (iteration < this.maxIterations && !converged) {
      converged = true;

      // Calculate voltages and currents for each component
      for (const [instanceId, instance] of this.circuitState.instances) {
        const prevState = new Map(instance.pinStates);

        this.calculateComponentBehavior(instance);

        // Check for convergence
        for (const [pinId, pinState] of instance.pinStates) {
          const prevPin = prevState.get(pinId);
          if (prevPin && Math.abs(pinState.voltage - prevPin.voltage) > 0.001) {
            converged = false;
          }
        }
      }

      iteration++;
    }

    if (!converged && iteration >= this.maxIterations) {
      result.warnings.push('Circuit did not converge - results may be inaccurate');
    }
  }

  /**
   * Calculate electrical behavior for a specific component
   */
  private calculateComponentBehavior(instance: any): void {
    const model = instance.component.simulation_model;
    if (!model) return;

    switch (model.type) {
      case 'voltage_source':
        this.calculateVoltageSource(instance, model);
        break;
      case 'switch':
        this.calculateSwitch(instance, model);
        break;
      case 'resistor':
        this.calculateResistor(instance, model);
        break;
      case 'led':
        this.calculateLED(instance, model);
        break;
      case 'capacitor':
        this.calculateCapacitor(instance, model);
        break;
      case 'diode':
        this.calculateDiode(instance, model);
        break;
      default:
        // Unknown component type
        break;
    }
  }

  /**
   * Voltage source behavior
   */
  private calculateVoltageSource(instance: any, model: any): void {
    const voltage = model.voltage || 12;
    const pins = instance.component.pin_configuration.pins;

    // Typically: first pin is positive, second is negative
    if (pins.length >= 2) {
      const posPin = instance.pinStates.get(pins[0].id);
      const negPin = instance.pinStates.get(pins[1].id);

      if (posPin && negPin) {
        posPin.voltage = voltage;
        negPin.voltage = 0;
      }
    }
  }

  /**
   * Switch behavior
   */
  private calculateSwitch(instance: any, model: any): void {
    const isClosed = instance.properties?.is_closed || model.is_closed || false;
    const pins = instance.component.pin_configuration.pins;

    if (pins.length >= 2) {
      const pin1 = instance.pinStates.get(pins[0].id);
      const pin2 = instance.pinStates.get(pins[1].id);

      if (pin1 && pin2) {
        if (isClosed) {
          // When closed, pins are at same voltage
          const avgVoltage = (pin1.voltage + pin2.voltage) / 2;
          pin1.voltage = avgVoltage;
          pin2.voltage = avgVoltage;
        }
        // When open, no current flows (handled by resistance)
      }
    }
  }

  /**
   * Resistor behavior (Ohm's Law: V = I * R)
   */
  private calculateResistor(instance: any, model: any): void {
    const resistance = model.resistance || 1000;
    const pins = instance.component.pin_configuration.pins;

    if (pins.length >= 2) {
      const pin1 = instance.pinStates.get(pins[0].id);
      const pin2 = instance.pinStates.get(pins[1].id);

      if (pin1 && pin2) {
        const voltageDrop = pin1.voltage - pin2.voltage;
        const current = voltageDrop / resistance;
        pin1.current = current;
        pin2.current = -current;
      }
    }
  }

  /**
   * LED behavior
   */
  private calculateLED(instance: any, model: any): void {
    const forwardVoltage = model.forward_voltage || 2.0;
    const maxCurrent = model.max_current || 0.02;
    const pins = instance.component.pin_configuration.pins;

    if (pins.length >= 2) {
      const anodePin = instance.pinStates.get(pins[0].id); // Anode
      const cathodePin = instance.pinStates.get(pins[1].id); // Cathode

      if (anodePin && cathodePin) {
        const voltageDrop = anodePin.voltage - cathodePin.voltage;

        if (voltageDrop >= forwardVoltage) {
          // LED is on
          instance.properties.is_on = true;
          const current = Math.min((voltageDrop - forwardVoltage) / 100, maxCurrent);
          anodePin.current = current;
          cathodePin.current = -current;
        } else {
          // LED is off
          instance.properties.is_on = false;
          anodePin.current = 0;
          cathodePin.current = 0;
        }
      }
    }
  }

  /**
   * Capacitor behavior (simplified)
   */
  private calculateCapacitor(instance: any, model: any): void {
    const capacitance = model.capacitance || 0.000001; // 1µF default
    const pins = instance.component.pin_configuration.pins;

    if (pins.length >= 2) {
      const pin1 = instance.pinStates.get(pins[0].id);
      const pin2 = instance.pinStates.get(pins[1].id);

      if (pin1 && pin2) {
        const voltageDrop = pin1.voltage - pin2.voltage;
        const charge = capacitance * voltageDrop;
        instance.properties.charge = charge;
      }
    }
  }

  /**
   * Diode behavior (simplified ideal diode)
   */
  private calculateDiode(instance: any, model: any): void {
    const forwardVoltage = model.forward_voltage || 0.7;
    const pins = instance.component.pin_configuration.pins;

    if (pins.length >= 2) {
      const anodePin = instance.pinStates.get(pins[0].id);
      const cathodePin = instance.pinStates.get(pins[1].id);

      if (anodePin && cathodePin) {
        const voltageDrop = anodePin.voltage - cathodePin.voltage;

        if (voltageDrop > forwardVoltage) {
          // Diode conducts
          anodePin.current = (voltageDrop - forwardVoltage) / 100;
          cathodePin.current = -anodePin.current;
        } else {
          // Diode blocks
          anodePin.current = 0;
          cathodePin.current = 0;
        }
      }
    }
  }

  /**
   * Update component states based on simulation results
   */
  private updateComponentStates(result: SimulationResult): void {
    for (const [instanceId, instance] of this.circuitState.instances) {
      const simResult: InstanceSimulationResult = {
        instanceId,
        componentId: instance.instance.component_id,
        pinVoltages: new Map(),
        pinCurrents: new Map(),
        properties: { ...instance.properties },
      };

      for (const [pinId, pinState] of instance.pinStates) {
        simResult.pinVoltages.set(pinId, pinState.voltage);
        simResult.pinCurrents.set(pinId, pinState.current);
      }

      result.instances.set(instanceId, simResult);
    }
  }

  /**
   * Get current simulation state
   */
  getState(): CircuitState {
    return this.circuitState;
  }

  /**
   * Set switch state (helper for interactive simulation)
   */
  setSwitchState(instanceId: string, isClosed: boolean): void {
    const instance = this.circuitState.instances.get(instanceId);
    if (instance) {
      instance.properties.is_closed = isClosed;
    }
  }

  /**
   * Get switch state
   */
  getSwitchState(instanceId: string): boolean {
    const instance = this.circuitState.instances.get(instanceId);
    return instance?.properties?.is_closed ?? false;
  }

  /**
   * Check if an LED is on
   */
  isLEDOn(instanceId: string): boolean {
    const instance = this.circuitState.instances.get(instanceId);
    return instance?.properties?.is_on ?? false;
  }
}
