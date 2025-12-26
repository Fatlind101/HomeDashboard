import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DeviceService } from '../../services/device.service';

interface SettingOption {
  id: string;
  label: string;
  description: string;
  type: 'toggle' | 'select' | 'text';
  value: boolean | string;
  options?: { label: string; value: string }[];
}

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="settings-page">
      <div class="page-header">
        <h1>Settings</h1>
        <p class="text-muted">Manage your home preferences and configurations</p>
      </div>

      <div class="row g-4">
        <!-- Settings Sidebar -->
        <div class="col-lg-3">
          <div class="settings-sidebar">
            <button
              *ngFor="let section of settingsSections"
              class="setting-section-btn"
              [class.active]="selectedSection === section.id"
              (click)="selectSection(section.id)"
            >
              <i [class]="'fas ' + section.icon"></i>
              {{ section.label }}
            </button>
          </div>
        </div>

        <!-- Settings Content -->
        <div class="col-lg-9">
          <!-- General Settings -->
          <div
            *ngIf="selectedSection === 'general'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-cog"></i> General Settings
            </h2>
            <div class="settings-form">
              <div class="form-group">
                <label>Home Name</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter your home name"
                  [(ngModel)]="generalSettings.homeName"
                />
                <small class="form-text text-muted">The name displayed in your dashboard</small>
              </div>

              <div class="form-group">
                <label>Location</label>
                <input
                  type="text"
                  class="form-control"
                  placeholder="Enter location"
                  [(ngModel)]="generalSettings.location"
                />
              </div>

              <div class="form-group">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="generalSettings.darkMode"
                  />
                  Enable Dark Mode
                </label>
              </div>

              <div class="form-group">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="generalSettings.notifications"
                  />
                  Enable Notifications
                </label>
              </div>

              <button class="btn btn-primary">Save Changes</button>
            </div>
          </div>

          <!-- Energy Settings -->
          <div
            *ngIf="selectedSection === 'energy'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-bolt"></i> Energy Settings
            </h2>
            <div class="settings-form">
              <div class="form-group">
                <label>Electricity Rate ($/kWh)</label>
                <input
                  type="number"
                  class="form-control"
                  placeholder="0.15"
                  [(ngModel)]="energySettings.electricityRate"
                  step="0.01"
                />
              </div>

              <div class="form-group">
                <label>Billing Cycle</label>
                <select class="form-select" [(ngModel)]="energySettings.billingCycle">
                  <option value="monthly">Monthly</option>
                  <option value="weekly">Weekly</option>
                  <option value="daily">Daily</option>
                </select>
              </div>

              <div class="form-group">
                <label>
                  <input
                    type="checkbox"
                    [(ngModel)]="energySettings.enableAlerts"
                  />
                  Enable Consumption Alerts
                </label>
              </div>

              <div class="form-group">
                <label>Alert Threshold (kWh)</label>
                <input
                  type="number"
                  class="form-control"
                  [(ngModel)]="energySettings.alertThreshold"
                  [disabled]="!energySettings.enableAlerts"
                />
              </div>

              <button class="btn btn-primary">Save Changes</button>
            </div>
          </div>

          <!-- Automation Settings -->
          <div
            *ngIf="selectedSection === 'automation'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-robot"></i> Automation & Schedules
            </h2>
            <div class="automation-section">
              <h3>Active Automations</h3>
              <div class="automation-list">
                <div *ngFor="let automation of automations" class="automation-item">
                  <div class="automation-info">
                    <h4>{{ automation.name }}</h4>
                    <p>{{ automation.description }}</p>
                  </div>
                  <div class="automation-control">
                    <label class="toggle-switch">
                      <input type="checkbox" [checked]="automation.enabled" />
                      <span class="slider"></span>
                    </label>
                  </div>
                </div>
              </div>

              <button class="btn btn-outline-primary mt-3">
                <i class="fas fa-plus me-2"></i> Create New Automation
              </button>
            </div>
          </div>

          <!-- Device Settings -->
          <div
            *ngIf="selectedSection === 'devices'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-lightbulb"></i> Device Management
            </h2>
            <div class="device-settings">
              <h3>Connected Devices</h3>
              <div class="device-management-list">
                <div *ngFor="let device of allDevices" class="device-management-item">
                  <div class="device-info">
                    <h5>{{ device.name }}</h5>
                    <small>{{ device.type | titlecase }} • {{ device.location }}</small>
                  </div>
                  <div class="device-actions">
                    <span
                      class="status-badge"
                      [class.bg-success]="device.isConnected"
                      [class.bg-danger]="!device.isConnected"
                    >
                      {{ device.isConnected ? 'Connected' : 'Disconnected' }}
                    </span>
                    <button class="btn btn-sm btn-outline-danger">Remove</button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Notification Settings -->
          <div
            *ngIf="selectedSection === 'notifications'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-bell"></i> Notification Preferences
            </h2>
            <div class="notification-settings">
              <div class="notification-group">
                <h3>Alert Types</h3>
                <div class="notification-list">
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" checked />
                      Device Offline Alerts
                    </label>
                  </div>
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" checked />
                      High Energy Consumption Alerts
                    </label>
                  </div>
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" checked />
                    Sensor Anomaly Alerts
                    </label>
                  </div>
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" />
                      Schedule Completion Notifications
                    </label>
                  </div>
                </div>
              </div>

              <div class="notification-group">
                <h3>Notification Channels</h3>
                <div class="notification-list">
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" checked />
                      In-App Notifications
                    </label>
                  </div>
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" />
                      Email Notifications
                    </label>
                  </div>
                  <div class="notification-item">
                    <label>
                      <input type="checkbox" />
                      Push Notifications
                    </label>
                  </div>
                </div>
              </div>

              <button class="btn btn-primary">Save Preferences</button>
            </div>
          </div>

          <!-- About & Support -->
          <div
            *ngIf="selectedSection === 'about'"
            class="settings-panel"
            [@fadeIn]
          >
            <h2>
              <i class="fas fa-info-circle"></i> About & Support
            </h2>
            <div class="about-section">
              <div class="info-box">
                <h3>Home Dashboard</h3>
                <p><strong>Version:</strong> 1.0.0</p>
                <p><strong>Build Date:</strong> {{ buildDate | date: 'long' }}</p>
                <p><strong>Platform:</strong> Angular 17</p>
              </div>

              <div class="info-box">
                <h3>System Information</h3>
                <p><strong>Total Devices:</strong> {{ allDevices.length }}</p>
                <p><strong>Connected Devices:</strong> {{ getConnectedCount() }}</p>
                <p><strong>Last System Check:</strong> Just now</p>
              </div>

              <div class="help-section">
                <h3>Need Help?</h3>
                <button class="btn btn-outline-primary btn-block mb-2">
                  <i class="fas fa-question-circle me-2"></i> View Documentation
                </button>
                <button class="btn btn-outline-primary btn-block mb-2">
                  <i class="fas fa-envelope me-2"></i> Contact Support
                </button>
                <button class="btn btn-outline-primary btn-block">
                  <i class="fas fa-bug me-2"></i> Report Bug
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .settings-page {
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

      .settings-sidebar {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        background: white;
        border-radius: 12px;
        padding: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        height: fit-content;
        position: sticky;
        top: 100px;
      }

      .setting-section-btn {
        padding: 1rem;
        border: 2px solid transparent;
        border-radius: 8px;
        background: transparent;
        color: #7f8c8d;
        cursor: pointer;
        text-align: left;
        transition: all 0.3s ease;
        display: flex;
        align-items: center;
        gap: 0.75rem;
        font-weight: 500;
      }

      .setting-section-btn:hover {
        background: #f8f9fa;
        color: #3498db;
      }

      .setting-section-btn.active {
        background: #3498db;
        color: white;
        border-color: #2980b9;
      }

      .settings-panel {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .settings-panel h2 {
        color: #2c3e50;
        margin-bottom: 2rem;
        font-weight: 600;
        font-size: 1.5rem;
      }

      .settings-panel h2 i {
        color: #3498db;
        margin-right: 0.5rem;
      }

      .settings-form {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .form-group {
        display: flex;
        flex-direction: column;
      }

      .form-group label {
        color: #2c3e50;
        font-weight: 600;
        margin-bottom: 0.5rem;
      }

      .form-group input[type='checkbox'],
      .form-group input[type='radio'] {
        margin-right: 0.5rem;
        cursor: pointer;
      }

      .form-group label:has(input[type='checkbox']),
      .form-group label:has(input[type='radio']) {
        display: flex;
        align-items: center;
        cursor: pointer;
      }

      .form-control,
      .form-select {
        padding: 0.75rem;
        border: 1px solid #ddd;
        border-radius: 6px;
        font-size: 0.95rem;
        transition: all 0.3s ease;
      }

      .form-control:focus,
      .form-select:focus {
        border-color: #3498db;
        box-shadow: 0 0 0 0.2rem rgba(52, 152, 219, 0.25);
      }

      .form-control:disabled,
      .form-select:disabled {
        background-color: #f5f5f5;
        opacity: 0.6;
      }

      .form-text {
        font-size: 0.85rem;
        margin-top: 0.25rem;
      }

      .btn {
        padding: 0.75rem 1.5rem;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .btn-primary {
        background: #3498db;
        color: white;
        border: none;
      }

      .btn-primary:hover {
        background: #2980b9;
      }

      .automation-item,
      .device-management-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1rem;
      }

      .automation-info h4,
      .device-info h5 {
        margin: 0 0 0.25rem 0;
        color: #2c3e50;
      }

      .automation-info p,
      .device-info small {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .toggle-switch {
        display: inline-flex;
        align-items: center;
        cursor: pointer;
      }

      .toggle-switch input {
        display: none;
      }

      .slider {
        width: 50px;
        height: 24px;
        background: #ccc;
        border-radius: 12px;
        display: inline-block;
        position: relative;
        transition: background 0.3s;
      }

      .slider::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        background: white;
        border-radius: 50%;
        top: 2px;
        left: 2px;
        transition: left 0.3s;
      }

      .toggle-switch input:checked + .slider {
        background: #27ae60;
      }

      .toggle-switch input:checked + .slider::after {
        left: 28px;
      }

      .notification-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .notification-item label {
        display: flex;
        align-items: center;
        cursor: pointer;
        color: #2c3e50;
      }

      .notification-item input[type='checkbox'] {
        margin-right: 0.75rem;
      }

      .info-box {
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 8px;
        margin-bottom: 1.5rem;
      }

      .info-box h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .info-box p {
        margin: 0.5rem 0;
        color: #7f8c8d;
      }

      .help-section {
        margin-top: 2rem;
        padding-top: 2rem;
        border-top: 1px solid #eee;
      }

      .help-section h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
      }

      .btn-block {
        width: 100%;
      }

      .device-actions {
        display: flex;
        align-items: center;
        gap: 1rem;
      }

      .mt-3 {
        margin-top: 1.5rem;
      }

      .mb-2 {
        margin-bottom: 0.5rem;
      }

      @media (max-width: 768px) {
        .settings-sidebar {
          position: static;
          flex-direction: row;
          overflow-x: auto;
          padding: 0.5rem;
        }

        .setting-section-btn {
          white-space: nowrap;
          flex-shrink: 0;
        }
      }
    `,
  ],
})
export class SettingsComponent implements OnInit {
  selectedSection = 'general';
  allDevices: any[] = [];
  buildDate = new Date();

  generalSettings = {
    homeName: 'My Home',
    location: 'Living Room',
    darkMode: false,
    notifications: true,
  };

  energySettings = {
    electricityRate: 0.15,
    billingCycle: 'monthly',
    enableAlerts: true,
    alertThreshold: 25,
  };

  automations = [
    {
      id: 1,
      name: 'Morning Routine',
      description: 'Turn on lights at 7:00 AM and set thermostat to 22°C',
      enabled: true,
    },
    {
      id: 2,
      name: 'Evening Dimming',
      description: 'Dim lights to 50% at 8:00 PM',
      enabled: true,
    },
    {
      id: 3,
      name: 'Away Mode',
      description: 'Turn off all lights and devices when away',
      enabled: false,
    },
  ];

  settingsSections = [
    { id: 'general', label: 'General', icon: 'fa-cog' },
    { id: 'energy', label: 'Energy', icon: 'fa-bolt' },
    { id: 'automation', label: 'Automation', icon: 'fa-robot' },
    { id: 'devices', label: 'Devices', icon: 'fa-lightbulb' },
    { id: 'notifications', label: 'Notifications', icon: 'fa-bell' },
    { id: 'about', label: 'About', icon: 'fa-info-circle' },
  ];

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.devices$.subscribe((devices) => {
      this.allDevices = devices;
    });
  }

  selectSection(sectionId: string): void {
    this.selectedSection = sectionId;
  }

  getConnectedCount(): number {
    return this.allDevices.filter((d) => d.isConnected).length;
  }
}
