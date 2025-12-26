# Home Dashboard

A professional smart home control application built with Angular 17. Manage devices, monitor sensors, track energy consumption, and control your home in real-time.

## Quick Start

```bash
npm install
npm start
```

Open `http://localhost:4200` in your browser.

Requirements: Node.js 18+ and npm 9+

## Features

- Control 8 smart devices (lights, thermostat, blinds, garage, AC)
- Monitor 4 real-time sensors (temperature, humidity, air quality, presence)
- Track energy consumption with 30-day history
- Organize devices by room
- Responsive design for mobile and desktop
- Real-time updates every 5 seconds

## Pages

- **Dashboard** - Overview with stats and quick controls
- **Devices** - Browse and manage all devices
- **Device Detail** - Full control for individual device
- **Sensors** - Real-time sensor monitoring
- **Energy** - Energy consumption analytics
- **Rooms** - Organize devices by room
- **Settings** - User preferences

## Architecture

Built with:
- Angular 17 (Standalone Components)
- TypeScript with strict mode
- RxJS for state management
- Bootstrap 5 for responsive design
- JSON Server for mock backend

## Device Types

- Light - Brightness control (0-100%)
- Thermostat - Temperature control (15-30°C) with current/target tracking
- Blind - Position control (0-100%)
- Garage Door - Status with 4-second animation
- Air Conditioner - On/off with temperature setting (16-30°C)

## Development

```bash
npm start          # Start development server
npm run build      # Build for production
npm test           # Run tests
```

API runs on `http://localhost:3000` with mock data from `db.json`.

## Project Structure

```
src/app/
├── models/          # TypeScript interfaces
├── services/        # State management
├── shared/          # Reusable components
└── pages/           # Page components (7 routes)
```

See `docs/SETUP.md` for detailed setup instructions and troubleshooting.

## Browser Support

Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

## Production Build

```bash
npm run build
# Deploy the dist/ folder to your server
```

Built with Angular 17.
