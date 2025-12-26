import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device.service';
import { SmartDevice, Sensor } from '../../models/device.model';
import { DeviceCardComponent } from '../../shared/device-card/device-card.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DeviceCardComponent],
  template: `
    <div class="dashboard">
      <!-- Header -->
      <div class="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p class="text-muted">Welcome back! Here's your home overview.</p>
        </div>
        <div class="header-actions">
          <button class="btn btn-primary" (click)="refreshData()">
            <i class="fas fa-sync-alt me-2"></i> Refresh
          </button>
        </div>
      </div>

      <!-- Quick Stats -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-primary">
              <i class="fas fa-plug"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Power Consumption</p>
              <h3>{{ totalPowerConsumption | number: '1.0-0' }}W</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-success">
              <i class="fas fa-power-off"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Active Devices</p>
              <h3>{{ activeDevices }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-info">
              <i class="fas fa-network-wired"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Connected</p>
              <h3>{{ connectedDevices }}/{{ totalDevices }}</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="stat-card">
            <div class="stat-icon bg-warning">
              <i class="fas fa-battery-three-quarters"></i>
            </div>
            <div class="stat-content">
              <p class="stat-label">Today's Usage</p>
              <h3>{{ todayEnergyConsumption | number: '1.0-1' }}kWh</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Sensors Section -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <h2 class="section-title">
            <i class="fas fa-thermometer-half me-2"></i> Sensor Status
          </h2>
          <div class="sensors-grid">
            <div
              *ngFor="let sensor of sensors"
              class="sensor-card"
              [class.warning]="sensor.status === 'warning'"
              [class.critical]="sensor.status === 'critical'"
            >
              <div class="sensor-header">
                <i [class]="'fas fa-' + sensor.icon"></i>
                <span class="status-badge" [class]="'status-' + sensor.status">
                  {{ sensor.status }}
                </span>
              </div>
              <h4>{{ sensor.name }}</h4>
              <p class="sensor-value">
                <ng-container *ngIf="sensor.type === 'presence' || sensor.unit === 'boolean'">
                  <span [class]="'badge ' + (sensor.value ? 'bg-success' : 'bg-danger')">
                    {{ sensor.value ? 'DETECTED' : 'NOT DETECTED' }}
                  </span>
                </ng-container>
                <ng-container *ngIf="sensor.type !== 'presence' && sensor.unit !== 'boolean'">
                  {{ sensor.value | number: '1.0-1' }}{{ sensor.unit }}
                </ng-container>
              </p>
              <small class="text-muted">{{ sensor.location }}</small>
            </div>
          </div>
        </div>
      </div>

      <!-- Devices Section -->
      <div class="row g-3 mb-4">
        <div class="col-12">
          <h2 class="section-title">
            <i class="fas fa-lightbulb me-2"></i> Smart Devices
          </h2>
          <div class="devices-grid">
            <app-device-card
              *ngFor="let device of devices"
              [device]="device"
              (toggle)="toggleDevice(device.id)"
              (valueChange)="onDeviceValueChange(device.id, $event)"
            ></app-device-card>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .dashboard {
        max-width: 1400px;
        margin: 0 auto;
      }

      .dashboard-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 2rem;
      }

      .dashboard-header h1 {
        margin: 0;
        color: #2c3e50;
        font-size: 2.5rem;
        font-weight: bold;
      }

      .header-actions {
        display: flex;
        gap: 1rem;
      }

      .stat-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }

      .stat-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .stat-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
      }

      .stat-icon.bg-primary {
        background: linear-gradient(135deg, #3498db, #2980b9);
      }

      .stat-icon.bg-success {
        background: linear-gradient(135deg, #27ae60, #229954);
      }

      .stat-icon.bg-info {
        background: linear-gradient(135deg, #9b59b6, #8e44ad);
      }

      .stat-icon.bg-warning {
        background: linear-gradient(135deg, #f39c12, #e67e22);
      }

      .stat-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .stat-label {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .stat-content h3 {
        margin: 0.5rem 0 0 0;
        color: #2c3e50;
        font-size: 1.5rem;
        font-weight: bold;
      }

      .section-title {
        color: #2c3e50;
        font-weight: 600;
        font-size: 1.3rem;
        margin-bottom: 1rem;
      }

      .sensors-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1.5rem;
      }

      .sensor-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        text-align: center;
        transition: all 0.3s ease;
        border-left: 4px solid #27ae60;
      }

      .sensor-card.warning {
        border-left-color: #f39c12;
        background-color: #fffbf0;
      }

      .sensor-card.critical {
        border-left-color: #e74c3c;
        background-color: #fef5f5;
      }

      .sensor-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .sensor-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 1rem;
      }

      .sensor-header i {
        font-size: 2rem;
        color: #3498db;
      }

      .status-badge {
        padding: 4px 8px;
        border-radius: 12px;
        font-size: 0.75rem;
        font-weight: 600;
        text-transform: uppercase;
      }

      .status-normal {
        background: #d4edda;
        color: #155724;
      }

      .status-warning {
        background: #fff3cd;
        color: #856404;
      }

      .status-critical {
        background: #f8d7da;
        color: #721c24;
      }

      .sensor-card h4 {
        margin: 0.5rem 0;
        color: #2c3e50;
        font-weight: 600;
      }

      .sensor-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #3498db;
        margin: 0.5rem 0;
      }

      .devices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .filter-controls {
        display: flex;
        gap: 1rem;
      }

      .form-select-sm {
        padding: 0.5rem 0.75rem;
        font-size: 0.9rem;
      }

      @media (max-width: 768px) {
        .dashboard-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 1rem;
        }

        .devices-grid {
          grid-template-columns: 1fr;
        }

        .sensors-grid {
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        }
      }
    `,
  ],
})
export class DashboardComponent implements OnInit {
  devices: SmartDevice[] = [];
  sensors: Sensor[] = [];
  totalPowerConsumption = 0;
  activeDevices = 0;
  connectedDevices = 0;
  totalDevices = 0;
  todayEnergyConsumption = 0;
  selectedFilter = '';

  get filteredDevices(): SmartDevice[] {
    if (!this.selectedFilter) return this.devices;
    return this.devices.filter((d) => d.type === this.selectedFilter);
  }

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices;
      this.totalDevices = devices.length;
      this.connectedDevices = devices.filter((d) => d.isConnected).length;
      this.activeDevices = devices.filter((d) => d.isActive).length;
    });

    this.deviceService.sensors$.subscribe((sensors) => {
      this.sensors = sensors;
    });

    this.deviceService.getTotalPowerConsumption().subscribe((consumption) => {
      this.totalPowerConsumption = consumption;
    });

    this.todayEnergyConsumption = this.deviceService.getTodayEnergyConsumption();
  }

  toggleDevice(deviceId: string): void {
    this.deviceService.toggleDevice(deviceId);
  }

  onDeviceValueChange(deviceId: string, value: number): void {
    const device = this.devices.find(d => d.id === deviceId);
    if (device?.type === 'thermostat' || device?.type === 'ac') {
      this.deviceService.setTemperature(deviceId, value);
    } else {
      this.deviceService.setDeviceValue(deviceId, value);
    }
  }

  refreshData(): void {
    this.loadData();
  }
}
