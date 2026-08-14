# ElectroLab - User Guide

## Welcome to ElectroLab! 🎉

ElectroLab is a professional virtual electronics laboratory where you can design, simulate, and test electronic circuits before building them physically.

---

## Getting Started

### Step 1: Create an Account
1. Visit the home page
2. Click **"Get Started"** button
3. Enter your email and password
4. Create a username
5. Click **"Sign Up"**

### Step 2: Explore the Interface
- **Home Page**: Overview of features and statistics
- **Dashboard**: Your projects and recent work
- **Component Library**: Browse and search components
- **Virtual Lab**: Design and simulate circuits
- **Profile**: Manage your account

---

## Using the Virtual Lab

### Adding Components

1. **Open the Lab**
   - Click "Virtual Lab" from home or dashboard
   - A new blank circuit will be created

2. **Search for Components**
   - Use the search bar in the component palette
   - Type component name (e.g., "battery", "LED", "resistor")
   - Click on a component to add it

3. **Place Components**
   - Drag components from the palette onto the canvas
   - Click and drag to move components around
   - Use the properties panel to adjust values

### Connecting Components

1. **Draw Wires**
   - Click on a component pin
   - Drag to another component pin
   - Release to create connection

2. **Remove Connections**
   - Right-click on a wire
   - Select "Delete"

### Running Simulations

1. **Start Simulation**
   - Click the **"Run"** button
   - The simulation will start calculating

2. **View Results**
   - Watch LEDs light up or turn off
   - See voltage and current values
   - Check for error messages

3. **Stop Simulation**
   - Click the **"Stop"** button
   - Make adjustments and run again

### Saving Your Work

1. **Save Project**
   - Click **"Save"** button
   - Give your project a name
   - Click **"Save"**

2. **Load Project**
   - Go to Dashboard
   - Click on a saved project
   - It will open in the lab

---

## Component Library

### Searching Components

1. **Full-Text Search**
   - Type component name
   - Type part number
   - Search by description

2. **Filter by Category**
   - Power Supply
   - Passive (Resistors, Capacitors)
   - Semiconductor (Diodes, Transistors)
   - Integrated Circuit
   - Microcontroller
   - Sensor
   - Display
   - Motor
   - Switch
   - Connector

3. **View Details**
   - Click on a component card
   - See specifications
   - View pinout diagram
   - Access datasheet link

### Available Components (Phase 1)

**Battery (DC Power Supply)**
- Voltage: 1.5V - 48V
- Pins: Positive (+), Negative (-)
- Used to power circuits

**Switch (SPST)**
- Type: Single Pole Single Throw
- Pins: Terminal 1, Terminal 2
- Turn circuits on/off

**Resistor (Standard)**
- Resistance: 1kΩ (adjustable)
- Pins: Terminal A, Terminal B
- Limit current flow

**LED (Red 5mm)**
- Forward voltage: 1.8V - 2.2V
- Max current: 20mA
- Pins: Anode (+), Cathode (-)
- Lights up when current flows

---

## Submitting New Components

### When a Component Isn't Found

1. **Search Component**
   - Go to Component Library
   - Search for component
   - If not found, click **"Request/Add Component"**

2. **Fill Out Form**
   - **Component Name** (required)
   - **Part Number** (optional)
   - **Category** (required)
   - **Description** (optional)
   - **Working Principle** (optional)

3. **Upload Images**
   - **Real Component Photo** (optional)
   - **Circuit Symbol** (optional)

4. **Add Technical Info**
   - **Pin Configuration** (required)
   - **Specifications** (optional)
   - **Datasheet URL** (optional)

5. **Submit**
   - Click **"Submit for Review"**
   - Admins will review your submission
   - Once approved, it's available to all users

### Tips for Component Submissions
- Use clear, high-quality photos
- Include accurate pin configurations
- Add datasheet links if available
- Provide realistic specifications
- Be descriptive in working principle

---

## Example: Building Your First Circuit

### Simple LED Circuit

**Components Needed:**
- 1x Battery (12V)
- 1x Switch
- 1x Resistor (1kΩ)
- 1x LED (Red 5mm)

**Steps:**

1. **Add Components**
   - Search and add Battery
   - Search and add Switch
   - Search and add Resistor (1kΩ)
   - Search and add LED (Red)

2. **Connect in Series**
   ```
   Battery (+) → Switch → Resistor → LED Anode → Battery (-)
   LED Cathode → Battery (-)
   ```

3. **Run Simulation**
   - Click "Run"
   - Toggle switch ON
   - LED should light up
   - Toggle switch OFF
   - LED should turn off

4. **Verify**
   - Check voltage across LED (should be ~2V)
   - Check current (should be ~10mA)
   - No error messages should appear

5. **Save**
   - Click "Save"
   - Name it "Simple LED Circuit"
   - Click "Save"

---

## Understanding Simulation Results

### What the Simulation Shows

- **LED State**: On (lit) or Off (dark)
- **Voltage Values**: Electrical potential at each point
- **Current Flow**: Amount of current through components
- **Warnings**: Missing connections, incorrect polarity
- **Errors**: Short circuits, invalid configurations

### Common Issues

**LED not lighting up?**
- Check switch is ON
- Verify LED polarity (anode to positive)
- Check resistor value (shouldn't be too high)
- Ensure all connections are made

**Getting error messages?**
- Check all required pins are connected
- Verify power connections
- Look for short circuits
- Check component polarity

**Simulation won't start?**
- Make sure circuit has a power source
- Verify all connections are valid
- Check for unconnected components
- Review error messages

---

## Tips & Tricks

### Efficient Design
- Use keyboard shortcuts for faster work
- Group related components together
- Label your components for clarity
- Save frequently

### Learning
- Start with simple circuits
- Understand component behavior
- Experiment with different values
- Check datasheets for specifications

### Troubleshooting
- Use the properties panel to check values
- Verify connections visually
- Read error messages carefully
- Check component specifications

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|----------|
| Save | Ctrl+S / Cmd+S |
| Delete | Delete / Backspace |
| Undo | Ctrl+Z / Cmd+Z |
| Redo | Ctrl+Y / Cmd+Y |
| Select All | Ctrl+A / Cmd+A |
| Zoom In | Ctrl++ / Cmd++ |
| Zoom Out | Ctrl+- / Cmd+- |

---

## Account Management

### Profile Settings
- View your username
- Update profile information
- Change password
- View your submissions
- See your projects

### Privacy
- Control project visibility
- Make projects public or private
- Share projects with others
- Delete your data

---

## FAQ

**Q: Can I use real component values?**
A: Yes! You can adjust component values in the properties panel.

**Q: How accurate is the simulation?**
A: Phase 1 uses simplified models. Phase 2 will add more accurate simulation.

**Q: Can I export my circuit?**
A: Currently saves to cloud. Export feature coming in Phase 2.

**Q: How do I report a bug?**
A: Use the feedback button or contact support.

**Q: Can I collaborate with others?**
A: Sharing framework is ready for Phase 2.

**Q: What about 3D visualization?**
A: Coming in Phase 4. Currently using 2D canvas.

---

## Getting Help

### In-App Help
- Hover over icons for tooltips
- Read error messages carefully
- Check component details

### Documentation
- See README.md for overview
- See FEATURES.md for complete list
- See ARCHITECTURE.md for technical details

### Support
- Report issues on GitHub
- Use feedback form in app
- Contact support team

---

## Advanced Features (Coming Soon)

### Phase 2
- More component types
- Advanced simulation
- Virtual instruments
- Better visualization

### Phase 3
- Arduino/ESP32 support
- Code editor
- GPIO simulation
- Serial monitor

### Phase 4
- 3D lab environment
- Thousands of components
- Community features
- Advanced analysis

---

## Best Practices

1. **Start Simple**
   - Begin with basic circuits
   - Learn component behavior
   - Progress to complex designs

2. **Document Your Work**
   - Name projects clearly
   - Add descriptions
   - Save frequently

3. **Test Thoroughly**
   - Run simulations multiple times
   - Try different values
   - Check edge cases

4. **Learn Continuously**
   - Read datasheets
   - Understand specifications
   - Experiment with variations

---

## Troubleshooting Guide

### Problem: Can't login
**Solution**: 
- Check email is correct
- Reset password if forgotten
- Clear browser cache
- Try different browser

### Problem: Components not showing
**Solution**:
- Refresh page
- Check internet connection
- Clear cache
- Restart browser

### Problem: Simulation errors
**Solution**:
- Check all connections
- Verify component values
- Read error message
- Check component specs

### Problem: Can't save project
**Solution**:
- Check internet connection
- Verify you're logged in
- Try again after refresh
- Contact support

---

## Feedback & Suggestions

We'd love to hear from you!
- Use the feedback button in the app
- Suggest new features
- Report bugs
- Share your projects

---

**Happy Circuiting! 🔌⚡**

For more information, see the complete documentation in the project directory.
