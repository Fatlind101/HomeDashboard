# Setup Instructions

## Prerequisites

Make sure you have installed:

- Node.js v18.0.0 or higher
- npm v9.0.0 or higher
- A modern web browser

## Installation

1. Navigate to the project directory:
   ```bash
   cd AngularProject
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

The application will open at `http://localhost:4200`

## Available Commands

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests

## Verify Installation

After starting the server, you should see:
- Dashboard page with device cards
- Navigation working between pages
- Device controls responding to clicks
- Sensor data updating every 5 seconds

## Troubleshooting

**npm install fails:**
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

**Port 4200 already in use:**
```bash
ng serve --port 4201
```

**Components not loading:**
Press Ctrl+Shift+R to hard refresh your browser and clear cache.

**Angular CLI not found:**
```bash
npm install -g @angular/cli@17
```

## Project Structure

```
src/
├── app/
│   ├── models/              # TypeScript interfaces
│   ├── services/            # State management
│   ├── shared/              # Reusable components
│   └── pages/               # Page components
├── styles.scss              # Global styles
└── index.html               # Main HTML
```

## Key Features

- Real-time device control
- Live sensor monitoring
- Energy consumption tracking
- Room-based organization
- Responsive design
- Clean, modern UI
