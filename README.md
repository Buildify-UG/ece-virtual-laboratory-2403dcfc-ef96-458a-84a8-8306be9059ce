# ElectroLab - Virtual Electronics Laboratory

A professional, open-source virtual electronics laboratory for ECE students, hobbyists, and engineers. Design, simulate, and test electronic circuits before building them physically.

## Features

### 🔌 Virtual Circuit Design
- **Drag-and-drop component placement** on professional canvas
- **Wire connections** between component pins
- **Real-time editing** with instant visual feedback
- **Component properties** panel for adjusting values
- **Save/load projects** to continue later

### 🧬 Component Library
- **500+ electronic components** with real specifications
- **Full-text search** for quick component discovery
- **Component categories**: Power, Passive, Semiconductor, Microcontroller, Sensor, Display, Motor, Switch, Connector
- **Detailed component information**: pinout, datasheet, working principle, specifications
- **Real component images** and circuit symbols

### ⚡ Real-Time Circuit Simulation
- **Accurate electrical simulation** based on component models
- **Voltage and current calculation** using Kirchhoff's laws
- **Real-time component behavior** visualization
- **Validation** for common circuit errors
- **Warnings** for potential issues (unconnected pins, polarity, ratings)

### 🎓 Community Component Database
- **User submissions** for new components
- **Admin review workflow** for quality assurance
- **Shared component library** - once approved, all users can access
- **Component versioning** and updates
- **Datasheet references** and manufacturer information

### 👥 User Accounts
- **Free accounts** for all users
- **Project management** - create, save, organize projects
- **Favorites** for quick access to frequently used components
- **Project sharing** (coming soon)
- **Community contributions** tracking

### 🛠️ Professional Lab Environment
- **Dark theme** optimized for long design sessions
- **Responsive design** - works on desktop, tablet, mobile
- **Professional UI** with realistic component cards
- **Glow effects** and smooth animations
- **Accessible** with keyboard navigation support

## Getting Started

### 1. Sign Up
- Visit [ElectroLab](https://electrolab.buildify.dev)
- Click "Get Started"
- Enter email, password, and username
- Verify your email

### 2. Explore Components
- Go to "Component Library"
- Search for components by name, part number, or description
- Click on a component to see detailed information
- Add components to favorites

### 3. Create Your First Circuit
- Click "Virtual Lab"
- Click "New Project"
- Enter a project name
- Search for components in the left sidebar
- Drag components onto the canvas
- Click and drag between pins to create connections
- Adjust component properties in the right panel
- Click "Run Simulation" to test your circuit

### 4. Save Your Project
- Click "Save" to save your circuit
- Your project is saved to your account
- Open it anytime from your dashboard

## Component Categories

### Power Supply
- Batteries (DC sources)
- Power supplies
- Voltage regulators

### Passive Components
- Resistors
- Capacitors
- Inductors
- Transformers

### Semiconductors
- Diodes
- Transistors (BJT, FET, MOSFET)
- Thyristors

### Integrated Circuits
- Op-amps
- Timers (555, etc.)
- Logic ICs
- Microcontrollers

### Microcontrollers
- Arduino boards
- ESP32 family
- Raspberry Pi Pico
- STM32 boards

### Sensors
- Temperature sensors
- Light sensors
- Motion sensors
- Pressure sensors

### Displays
- LEDs
- LCD/OLED displays
- 7-segment displays

### Motors & Actuators
- DC motors
- Servo motors
- Stepper motors
- Relays

## Simulation Features

### Phase 1 (Current)
- ✅ DC circuit simulation
- ✅ Voltage and current calculation
- ✅ Basic component models (Battery, Switch, Resistor, LED)
- ✅ Circuit validation
- ✅ Error detection

### Phase 2 (Planned)
- 🔄 More passive components (diodes, capacitors, inductors)
- 🔄 Transistor simulation
- 🔄 Op-amp circuits
- 🔄 Digital logic
- 🔄 Virtual instruments (oscilloscope, multimeter)

### Phase 3 (Planned)
- 🔄 Arduino/ESP32 code simulation
- 🔄 GPIO pin simulation
- 🔄 Sensor simulation
- 🔄 Serial communication

### Phase 4 (Planned)
- 🔄 Advanced 3D lab visualization
- 🔄 Real-time collaboration
- 🔄 Thousands of component models
- 🔄 Community templates library

## Adding Your Own Components

If a component you need isn't in the library:

1. Go to "Component Library"
2. Search for the component
3. Click "Request/Add Component"
4. Fill out the component form:
   - Component name and part number
   - Category
   - Upload real component image
   - Upload circuit symbol image
   - Define pin configuration
   - Add specifications
   - Include working principle description
   - Optional: datasheet link
5. Submit for review
6. Our team will review and approve
7. Once approved, all users can use it!

## Example Circuits

### Simple LED Circuit
```
Battery (+) → Switch → Resistor (220Ω) → LED → Battery (-)
```
- When switch is ON, LED lights up
- Current limited by resistor to safe LED operating range

### Blinking LED with 555 Timer
```
Battery → 555 Timer → LED + Resistor → Battery
```
- 555 configured in astable mode
- LED blinks at frequency determined by capacitor and resistor values

### Voltage Divider
```
Battery → Resistor1 → Resistor2 → Battery (-)
Tap between resistors for divided voltage
```
- Output voltage = V_in × R2 / (R1 + R2)

## Tips & Tricks

- **Component Search**: Use part numbers for exact matches (e.g., "BC557" for transistor)
- **Keyboard Shortcuts**: 
  - `Delete` - Remove selected component
  - `Ctrl+S` - Save project
  - `Ctrl+Z` - Undo (coming soon)
- **Wire Colors**: Different colors help organize complex circuits
- **Simulation Speed**: Adjust simulation timestep in settings for faster/more accurate simulation
- **Export**: Save projects as JSON for sharing

## Troubleshooting

### "Component Not Found"
- Check spelling and part number
- Try searching by component type (e.g., "transistor")
- Request the component - the community will add it

### "Circuit Validation Failed"
- Check for floating nodes (unconnected pins)
- Verify power connections (battery + and -)
- Check component polarities (diodes, capacitors, LEDs)
- Look at validation messages for specific issues

### "Simulation Shows No Current"
- Verify circuit is closed (complete path from + to -)
- Check switch is ON
- Verify component values are reasonable
- Check for reverse polarity

## FAQ

**Q: Is ElectroLab free?**
A: Yes! ElectroLab is completely free to use.

**Q: Can I share my projects?**
A: Yes, you can make projects public and share links (coming soon).

**Q: Can I export my circuits?**
A: Yes, you can export projects as JSON files.

**Q: Is my data safe?**
A: Yes, we use industry-standard encryption and security practices.

**Q: Can I use this for commercial projects?**
A: Yes, ElectroLab is open-source and free for commercial use.

**Q: How accurate is the simulation?**
A: Phase 1 provides accurate DC circuit simulation. Phase 2+ will add AC, transient, and advanced analysis.

**Q: Can I simulate Arduino/ESP32 code?**
A: Yes, this is planned for Phase 3.

## Support

- **Documentation**: See [ARCHITECTURE.md](./ARCHITECTURE.md) for technical details
- **Issues**: Report bugs on GitHub
- **Suggestions**: Share feature requests in discussions
- **Community**: Join our Discord for help and discussions

## Contributing

We welcome contributions! See [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

## License

ElectroLab is open-source and available under the MIT License.

## Acknowledgments

- Built with React, Vite, Tailwind CSS, shadcn/ui
- Powered by Supabase
- Inspired by professional EDA tools
- Thanks to the electronics community

---

**Start designing your circuits today!** [Launch ElectroLab](https://electrolab.buildify.dev)
