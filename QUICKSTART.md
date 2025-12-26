# Quick Start Guide

Get the Angular Smart Home Dashboard running in 3 minutes.

## Prerequisites ✓

Make sure you have installed on your PC:
- **Node.js** v18+ ([download here](https://nodejs.org/))
- **npm** v9+ (comes with Node.js)
- A modern web browser (Chrome, Edge, Firefox, Safari)

**Check your versions:**
```bash
node --version
npm --version
```

## Setup in 3 Steps

### 1. Install Dependencies
```bash
npm install
```
This downloads all required packages (may take 1-2 minutes on first run).

### 2. Start the Server
```bash
npm start
```
You should see:
```
✔ Compiled successfully
Local: http://localhost:4200/
```

### 3. Open in Browser
Click or paste: `http://localhost:4200/`

---

## Common Problems & Fixes

### ❌ npm install fails
Clear npm cache and try again:
```bash
npm cache clean --force
rm -r node_modules package-lock.json
npm install
```

### ❌ "Port 4200 already in use"
Use a different port:
```bash
ng serve --port 4201
```

### ❌ Page won't load / shows blank
Hard refresh your browser:
- **Windows/Linux:** `Ctrl + Shift + R`
- **Mac:** `Cmd + Shift + R`

### ❌ "ng: command not found"
Install Angular CLI globally:
```bash
npm install -g @angular/cli@17
```

### ❌ Changes don't appear after editing
The dev server auto-reloads. If it doesn't:
1. Stop the server (`Ctrl + C`)
2. Restart: `npm start`

---

## Verify It's Working ✓

After the app loads, check that:
- ✅ You see the Dashboard page with device cards
- ✅ Navigation menu works (try clicking Devices, Sensors, etc.)
- ✅ Device controls are clickable
- ✅ Sensor readings update every 5 seconds

---

## Available Commands

| Command | Purpose |
|---------|---------|
| `npm start` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests |

---

## Still Having Issues?

1. **Delete everything and start fresh:**
   ```bash
   npm cache clean --force
   rm -r node_modules package-lock.json
   npm install
   npm start
   ```

2. **Check for conflicting services** - Make sure no other apps are using port 4200

3. **Check Node.js version** - Your PC needs Node.js 18+. Older versions won't work.

4. **Try from a different folder** - Extract the project to a path without special characters or spaces

---

**Need more details?** See [SETUP.md](docs/SETUP.md) for advanced configuration.
