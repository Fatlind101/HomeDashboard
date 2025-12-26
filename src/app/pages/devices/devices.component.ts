import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device.service';
import { SmartDevice } from '../../models/device.model';
import { DeviceCardComponent } from '../../shared/device-card/device-card.component';

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, FormsModule, DeviceCardComponent],
  template: `
    <div class="devices-page">
      <div class="page-header">
        <h1>Smart Devices</h1>
        <p class="text-muted">Manage and control all your home devices</p>
      </div>

      <div class="controls-section">
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="control-card">
              <i class="fas fa-list-check"></i>
              <h5>Total Devices</h5>
              <h2>{{ devices.length }}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="control-card">
              <i class="fas fa-check-circle"></i>
              <h5>Connected</h5>
              <h2>{{ connectedCount }}</h2>
            </div>
          </div>
          <div class="col-md-4">
            <div class="control-card">
              <i class="fas fa-power-off"></i>
              <h5>Active</h5>
              <h2>{{ activeCount }}</h2>
            </div>
          </div>
        </div>
      </div>

      <div class="filter-section mb-4">
        <h3>Filter by Type</h3>
        <div class="filter-buttons">
          <button
            class="filter-btn"
            [class.active]="selectedType === ''"
            (click)="selectedType = ''"
          >
            All ({{ devices.length }})
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedType === 'light'"
            (click)="selectedType = 'light'"
          >
            Lights ({{ getDeviceCountByType('light') }})
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedType === 'thermostat'"
            (click)="selectedType = 'thermostat'"
          >
            Thermostat ({{ getDeviceCountByType('thermostat') }})
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedType === 'blind'"
            (click)="selectedType = 'blind'"
          >
            Blinds ({{ getDeviceCountByType('blind') }})
          </button>
          <button
            class="filter-btn"
            [class.active]="selectedType === 'garage'"
            (click)="selectedType = 'garage'"
          >
            Garage ({{ getDeviceCountByType('garage') }})
          </button>
        </div>
      </div>

      <div class="devices-container">
        <h3 *ngIf="filteredDevices.length === 0" class="text-center text-muted py-5">
          No devices found
        </h3>
        <div class="devices-grid">
          <app-device-card
            *ngFor="let device of filteredDevices"
            [device]="device"
            (toggle)="toggleDevice(device.id)"
            (valueChange)="onDeviceValueChange(device.id, $event)"
          ></app-device-card>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .devices-page {
        max-width: 1400px;
        margin: 0 auto;
      }

      .page-header {
        margin-bottom: 2rem;
      }

      .page-header h1 {
        color: #2c3e50;
        font-size: 2rem;
        font-weight: bold;
        margin: 0 0 0.5rem 0;
      }

      .control-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        text-align: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }

      .control-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .control-card i {
        font-size: 2rem;
        color: #3498db;
        margin-bottom: 0.5rem;
      }

      .control-card h5 {
        color: #7f8c8d;
        margin: 0.5rem 0;
        font-size: 0.9rem;
      }

      .control-card h2 {
        color: #2c3e50;
        margin: 0;
        font-size: 2rem;
        font-weight: bold;
      }

      .filter-section {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .filter-section h3 {
        margin: 0 0 1rem 0;
        color: #2c3e50;
        font-weight: 600;
      }

      .filter-buttons {
        display: flex;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .filter-btn {
        padding: 0.75rem 1.5rem;
        border: 2px solid #ddd;
        border-radius: 24px;
        background: white;
        color: #7f8c8d;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
      }

      .filter-btn:hover {
        border-color: #3498db;
        color: #3498db;
      }

      .filter-btn.active {
        background: #3498db;
        border-color: #3498db;
        color: white;
      }

      .devices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      @media (max-width: 768px) {
        .filter-buttons {
          flex-direction: column;
        }

        .filter-btn {
          width: 100%;
        }

        .devices-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class DevicesComponent implements OnInit {
  devices: SmartDevice[] = [];
  selectedType = '';
  activeCount = 0;
  connectedCount = 0;

  get filteredDevices(): SmartDevice[] {
    if (!this.selectedType) return this.devices;
    return this.devices.filter((d) => d.type === this.selectedType);
  }

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices;
      this.updateStats();
    });
  }

  updateStats(): void {
    this.activeCount = this.devices.filter((d) => d.isActive).length;
    this.connectedCount = this.devices.filter((d) => d.isConnected).length;
  }

  getDeviceCountByType(type: string): number {
    return this.devices.filter((d) => d.type === type).length;
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
}
