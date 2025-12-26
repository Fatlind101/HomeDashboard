import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { DeviceService } from '../../services/device.service';
import { SmartDevice } from '../../models/device.model';

@Component({
  selector: 'app-device-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="device-detail" *ngIf="device">
      <div class="page-header">
        <button class="btn btn-outline-secondary btn-sm" routerLink="/devices">
          <i class="fas fa-arrow-left me-2"></i> Back
        </button>
        <h1>{{ device.name }}</h1>
      </div>

      <div class="row g-4">
        <!-- Main Device Card -->
        <div class="col-lg-8">
          <div class="device-details-card">
            <div class="device-header">
              <div class="device-icon-large">
                <i [class]="getDeviceIcon()"></i>
              </div>
              <div class="device-info">
                <h2>{{ device.name }}</h2>
                <p class="device-type">{{ device.type | titlecase }}</p>
                <p class="device-location">
                  <i class="fas fa-map-marker-alt me-2"></i>{{ device.location }}
                </p>
              </div>
            </div>

            <div class="device-stats">
              <div class="stat">
                <span class="stat-label">Actual Power Consumption</span>
                <span class="stat-value">{{ getActualConsumption() }}W</span>
              </div>
              <div class="stat">
                <span class="stat-label">Max Power Consumption</span>
                <span class="stat-value">{{ device.powerConsumption }}W</span>
              </div>
              <div class="stat">
                <span class="stat-label">Status</span>
                <span
                  class="stat-value badge"
                  [class.bg-success]="device.isActive"
                  [class.bg-secondary]="!device.isActive"
                >
                  {{ device.isActive ? 'ON' : 'OFF' }}
                </span>
              </div>
              <div class="stat">
                <span class="stat-label">Connection</span>
                <span
                  class="stat-value badge"
                  [class.bg-success]="device.isConnected"
                  [class.bg-danger]="!device.isConnected"
                >
                  {{ device.isConnected ? 'Connected' : 'Disconnected' }}
                </span>
              </div>
            </div>

            <!-- Device Controls -->
            <div class="device-controls">
              <h3>Controls</h3>

              <div class="control-group">
                <label>Power</label>
                <button
                  class="btn toggle-btn"
                  [class.btn-success]="device.isActive"
                  [class.btn-outline-secondary]="!device.isActive"
                  (click)="toggleDevice()"
                  [disabled]="!device.isConnected"
                >
                  <i
                    [class]="device.isActive ? 'fas fa-power-off' : 'fas fa-toggle-off'"
                    class="me-2"
                  ></i>
                  {{ device.isActive ? 'Turn Off' : 'Turn On' }}
                </button>
              </div>

              <!-- Thermostat Control -->
              <div
                *ngIf="device.type === 'thermostat' && device.temperature !== undefined"
                class="control-group"
              >
                <label>Temperature Control</label>
                <div class="temperature-control">
                  <button
                    class="btn btn-outline-primary btn-sm"
                    (click)="decreaseTemperature()"
                    [disabled]="!device.isConnected || !device.isActive"
                  >
                    <i class="fas fa-minus"></i>
                  </button>
                  <div class="temp-display">
                    <span class="temp-value">{{ device.temperature | number: '1.0-1' }}</span>
                    <span class="temp-unit">°C</span>
                  </div>
                  <button
                    class="btn btn-outline-primary btn-sm"
                    (click)="increaseTemperature()"
                    [disabled]="!device.isConnected || !device.isActive"
                  >
                    <i class="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <!-- Dimmable Light Control -->
              <div
                *ngIf="device.type === 'light' && device.value !== undefined"
                class="control-group"
              >
                <label>Brightness: {{ device.value }}%</label>
                <input
                  type="range"
                  class="form-range"
                  min="0"
                  max="100"
                  [value]="device.value"
                  (input)="setDeviceValue($event)"
                  [disabled]="!device.isConnected || !device.isActive"
                />
              </div>

              <!-- Blind Control -->
              <div
                *ngIf="device.type === 'blind' && device.value !== undefined"
                class="control-group"
              >
                <label>Blind Position</label>
                <div class="blind-visual-container mb-3">
                  <div class="blind-frame">
                    <div class="blind-slats" [style.clip-path]="'inset(' + (100 - device.value) + '% 0 0 0)'">
                      <div class="slat slat-1"></div>
                      <div class="slat slat-2"></div>
                      <div class="slat slat-3"></div>
                      <div class="slat slat-4"></div>
                      <div class="slat slat-5"></div>
                    </div>
                  </div>
                  <div class="position-display">
                    <span class="position-value">{{ device.value }}%</span>
                    <span class="position-label">{{ device.value === 0 ? 'Closed' : device.value === 100 ? 'Open' : 'Partially Open' }}</span>
                  </div>
                </div>
                <input
                  type="range"
                  class="form-range blind-slider"
                  min="0"
                  max="100"
                  [value]="device.value"
                  (input)="setDeviceValue($event)"
                  [disabled]="!device.isConnected"
                />
              </div>

              <!-- Garage Door Control -->
              <div
                *ngIf="device.type === 'garage' && device.status !== undefined"
                class="control-group"
              >
                <label>Garage Door</label>
                <div class="garage-visual-container mb-3">
                  <div class="garage-building">
                    <div class="garage-door" [class.door-open]="device.status === 'open'" [class.door-moving]="device.isMoving">
                      <div class="door-panel"></div>
                      <div class="door-panel"></div>
                      <div class="door-handle"></div>
                    </div>
                  </div>
                  <div class="garage-status-display">
                    <span 
                      class="status-badge"
                      [class.badge-open]="device.status === 'open'"
                      [class.badge-closed]="device.status === 'closed'"
                      [class.badge-moving]="device.isMoving"
                    >
                      {{ device.isMoving ? (device.status === 'closed' ? 'Opening...' : 'Closing...') : (device.status | titlecase) }}
                    </span>
                  </div>
                </div>
                <button
                  class="btn toggle-btn"
                  [class.btn-warning]="device.isMoving"
                  [class.btn-primary]="!device.isMoving"
                  (click)="toggleGarageDoor()"
                  [disabled]="!device.isConnected || device.isMoving"
                >
                  <i [class]="device.isMoving ? 'fas fa-spinner fa-spin' : (device.status === 'closed' ? 'fas fa-door-open' : 'fas fa-door-closed')" class="me-2"></i>
                  {{ device.isMoving ? 'Operating...' : (device.status === 'closed' ? 'Open Door' : 'Close Door') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar Info -->
        <div class="col-lg-4">
          <div class="info-card">
            <h3>Device Information</h3>
            <div class="info-list">
              <div class="info-item">
                <span class="info-label">Device ID</span>
                <span class="info-value">{{ device.id }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Type</span>
                <span class="info-value">{{ device.type | titlecase }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Location</span>
                <span class="info-value">{{ device.location }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Last Updated</span>
                <span class="info-value">{{ device.lastUpdated | date: 'short' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Power Consumption</span>
                <span class="info-value">{{ device.powerConsumption }}W</span>
              </div>
              <div class="info-item">
                <span class="info-label">Status</span>
                <span class="info-value">
                  <span
                    class="badge"
                    [class.bg-success]="device.isActive"
                    [class.bg-secondary]="!device.isActive"
                  >
                    {{ device.isActive ? 'Active' : 'Inactive' }}
                  </span>
                </span>
              </div>
            </div>
          </div>

          <div class="info-card">
            <h3>Quick Actions</h3>
            <div class="action-buttons">
              <button class="btn btn-outline-primary w-100 mb-2">
                <i class="fas fa-history me-2"></i> View History
              </button>
              <button class="btn btn-outline-secondary w-100 mb-2">
                <i class="fas fa-sliders-h me-2"></i> Settings
              </button>
              <button class="btn btn-outline-warning w-100">
                <i class="fas fa-exclamation-triangle me-2"></i> Rename Device
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .device-detail {
        max-width: 1200px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-header button {
        margin-bottom: 1rem;
      }

      .page-header h1 {
        color: #2c3e50;
        font-size: 2.5rem;
        font-weight: bold;
        margin: 0;
      }

      .device-details-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .device-header {
        display: flex;
        gap: 2rem;
        margin-bottom: 2rem;
        padding-bottom: 2rem;
        border-bottom: 1px solid #eee;
      }

      .device-icon-large {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3498db, #2980b9);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 3rem;
      }

      .device-info h2 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
      }

      .device-type {
        color: #7f8c8d;
        margin: 0;
        font-size: 1.1rem;
      }

      .device-location {
        color: #95a5a6;
        margin: 0.5rem 0 0 0;
      }

      .device-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
        margin-bottom: 2rem;
      }

      .stat {
        background: #f8f9fa;
        padding: 1rem;
        border-radius: 8px;
        text-align: center;
      }

      .stat-label {
        display: block;
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }

      .stat-value {
        display: block;
        color: #2c3e50;
        font-size: 1.3rem;
        font-weight: bold;
      }

      .device-controls {
        padding: 1.5rem 0;
      }

      .device-controls h3 {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 1.5rem;
      }

      .control-group {
        margin-bottom: 2rem;
      }

      .control-group label {
        display: block;
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      .toggle-btn {
        width: 100%;
        padding: 0.75rem 1rem;
        font-weight: 600;
      }

      .temperature-control {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .temperature-control button {
        flex: 0 0 40px;
        height: 40px;
        padding: 0;
      }

      .temp-display {
        flex: 1;
        text-align: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
      }

      .temp-value {
        font-size: 2rem;
        font-weight: bold;
        color: #3498db;
      }

      .temp-unit {
        font-size: 1.2rem;
        color: #7f8c8d;
        margin-left: 0.5rem;
      }

      .form-range {
        height: 8px;
      }

      /* Blind Styles */
      .blind-visual-container {
        background: white;
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid #e0e0e0;
      }

      .blind-frame {
        width: 100%;
        height: 150px;
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border: 3px solid #888;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
        position: relative;
      }

      .blind-slats {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: clip-path 0.3s ease;
      }

      .slat {
        flex: 1;
        background: linear-gradient(90deg, #d4af37 0%, #f0e68c 50%, #d4af37 100%);
        border-bottom: 2px solid #999;
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.3);
      }

      .slat:last-child {
        border-bottom: none;
      }

      .position-display {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
      }

      .position-value {
        font-weight: bold;
        color: #2c3e50;
        font-size: 1.2rem;
      }

      .position-label {
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .blind-slider {
        height: 10px;
      }

      /* Garage Door Styles */
      .garage-visual-container {
        background: linear-gradient(135deg, #c9c9c9 0%, #f0f0f0 100%);
        padding: 2rem;
        border-radius: 12px;
        border: 2px solid #999;
      }

      .garage-building {
        width: 100%;
        height: 200px;
        background: linear-gradient(135deg, #8b7355 0%, #a0826d 100%);
        border-radius: 8px 8px 0 0;
        border: 3px solid #666;
        overflow: hidden;
        position: relative;
        margin-bottom: 1rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .garage-door {
        width: 85%;
        height: 85%;
        background: linear-gradient(90deg, #444 0%, #666 50%, #444 100%);
        border: 2px solid #222;
        border-radius: 4px;
        position: relative;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(0, 0, 0, 0.3);
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 0.5rem;
      }

      .garage-door.door-open {
        transform: translateY(-100%);
        background: linear-gradient(90deg, #555 0%, #777 50%, #555 100%);
      }

      .garage-door.door-moving {
        box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5), 0 2px 8px rgba(255, 193, 7, 0.5);
      }

      .door-panel {
        width: 100%;
        height: 20%;
        background: linear-gradient(90deg, #333 0%, #555 50%, #333 100%);
        border: 1px solid #222;
        border-radius: 2px;
        box-shadow: inset 0 1px 2px rgba(255, 255, 255, 0.1);
      }

      .door-handle {
        position: absolute;
        right: 15%;
        top: 50%;
        width: 20px;
        height: 8px;
        background: #c0c0c0;
        border: 1px solid #888;
        border-radius: 4px;
        transform: translateY(-50%);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
      }

      .garage-status-display {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .status-badge {
        padding: 0.75rem 1.5rem;
        border-radius: 50px;
        font-weight: 600;
        font-size: 1.1rem;
        transition: all 0.3s ease;
      }

      .status-badge.badge-open {
        background-color: #27ae60;
        color: white;
      }

      .status-badge.badge-closed {
        background-color: #e74c3c;
        color: white;
      }

      .status-badge.badge-moving {
        background-color: #f39c12;
        color: white;
        animation: pulse 1s infinite;
      }

      .info-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
      }

      .info-card h3 {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 1rem;
      }

      .info-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
      }

      .info-item:last-child {
        border-bottom: none;
      }

      .info-label {
        color: #7f8c8d;
        font-weight: 500;
      }

      .info-value {
        color: #2c3e50;
        font-weight: 600;
      }

      .garage-status {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
      }

      .action-buttons {
        display: flex;
        flex-direction: column;
        gap: 0.75rem;
      }

      .badge-pulse {
        animation: pulse 1s infinite;
      }

      @keyframes pulse {
        0% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
        100% {
          opacity: 1;
        }
      }

      @media (max-width: 768px) {
        .device-header {
          flex-direction: column;
          align-items: center;
          text-align: center;
        }

        .device-icon-large {
          width: 100px;
          height: 100px;
          font-size: 2.5rem;
        }
      }
    `,
  ],
})
export class DeviceDetailComponent implements OnInit {
  device: SmartDevice | undefined;

  constructor(
    private deviceService: DeviceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      const deviceId = params['id'];
      this.device = this.deviceService.getDeviceById(deviceId);

      this.deviceService.devices$.subscribe((devices) => {
        this.device = devices.find((d) => d.id === deviceId);
      });
    });
  }

  getDeviceIcon(): string {
    if (!this.device) return 'fas fa-cog';
    const iconMap: { [key: string]: string } = {
      light: 'fas fa-lightbulb',
      thermostat: 'fas fa-thermometer-half',
      blind: 'fas fa-window',
      garage: 'fas fa-door-open',
      sensor: 'fas fa-sensor',
    };
    return iconMap[this.device.type] || 'fas fa-cog';
  }

  toggleDevice(): void {
    if (this.device) {
      this.deviceService.toggleDevice(this.device.id);
    }
  }

  setDeviceValue(event: Event): void {
    if (this.device) {
      const value = parseInt((event.target as HTMLInputElement).value);
      this.deviceService.setDeviceValue(this.device.id, value);
    }
  }

  increaseTemperature(): void {
    if (this.device && this.device.temperature !== undefined) {
      this.deviceService.setTemperature(this.device.id, this.device.temperature + 1);
    }
  }

  decreaseTemperature(): void {
    if (this.device && this.device.temperature !== undefined) {
      this.deviceService.setTemperature(this.device.id, this.device.temperature - 1);
    }
  }

  toggleGarageDoor(): void {
    if (this.device && this.device.type === 'garage') {
      this.deviceService.operateGarageDoor(this.device.id);
    }
  }

  getActualConsumption(): number {
    if (!this.device) return 0;
    return this.deviceService.getActualPowerConsumption(this.device);
  }
}
