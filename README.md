# Interactive Data Visualization Platform

An interactive web application for visualizing and manipulating data structures through a dynamic, draggable interface.

## Features

- **Welcome Screen**: Animated introduction with force-directed graph visualization
- **Data Input**: Simple comma-separated number input system
- **Interactive Grid**: Pannable grid system
- **Draggable Nodes**: Interactive data nodes that can be freely moved within the grid

## Getting Started

### Prerequisites

- Node.js (v14.0.0 or higher)
- npm (v6.0.0 or higher)

### Installation

1. Clone the repository
2. Navigate to the project directory:

   ```bash
   cd algo-site
   ```

3. Install dependencies:

   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

## Usage

1. When you first open the application, you'll see an animated welcome screen with a force-directed graph visualization.

2. Enter your data as comma-separated numbers when prompted (e.g., "5,2,8,1,9").

3. After submitting your data, you'll be taken to the main interface where you can:
   - Pan around the infinite grid by clicking and dragging
   - Drag individual nodes to reposition them
   - Use the button bar at the top for additional operations (coming soon)

## Technical Details

Built with:

- React.js for UI components and state management
- D3.js for data visualization and animations
