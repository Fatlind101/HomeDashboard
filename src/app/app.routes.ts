import { Routes } from '@angular/router';

export const appRoutes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./pages/dashboard/dashboard.component').then(
        (m) => m.DashboardComponent
      ),
  },
  {
    path: 'devices',
    loadComponent: () =>
      import('./pages/devices/devices.component').then(
        (m) => m.DevicesComponent
      ),
  },
  {
    path: 'devices/:id',
    loadComponent: () =>
      import('./pages/device-detail/device-detail.component').then(
        (m) => m.DeviceDetailComponent
      ),
  },
  {
    path: 'sensors',
    loadComponent: () =>
      import('./pages/sensors/sensors.component').then(
        (m) => m.SensorsComponent
      ),
  },
  {
    path: 'energy',
    loadComponent: () =>
      import('./pages/energy/energy.component').then(
        (m) => m.EnergyComponent
      ),
  },
  {
    path: 'rooms',
    loadComponent: () =>
      import('./pages/rooms/rooms.component').then(
        (m) => m.RoomsComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./pages/settings/settings.component').then(
        (m) => m.SettingsComponent
      ),
  },
];
