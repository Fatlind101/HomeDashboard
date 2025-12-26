import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { Sensor } from '../../models/device.model';

@Component({
  selector: 'app-sensors',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="sensors-page">
      <div class="page-header">
        <h1>Sensor Monitoring</h1>
        <p class="text-muted">Real-time sensor data and environmental monitoring</p>
      </div>

      <div class="row g-4">
        <div class="col-lg-8">
          <div class="sensors-container">
            <h2>Active Sensors</h2>
            <div class="sensors-list">
              <div
                *ngFor="let sensor of sensors"
                class="sensor-item"
                [class.warning]="sensor.status === 'warning'"
                [class.critical]="sensor.status === 'critical'"
              >
                <div class="sensor-icon">
                  <i [class]="'fas fa-' + sensor.icon"></i>
                </div>

                <div class="sensor-details">
                  <h4>{{ sensor.name }}</h4>
                  <p class="location">
                    <i class="fas fa-map-marker-alt me-1"></i>{{ sensor.location }}
                  </p>
                  <div class="sensor-status-text">
                    <span class="status-badge" [class]="'status-' + sensor.status">
                      {{ sensor.status | titlecase }}
                    </span>
                  </div>
                </div>

                <div class="sensor-reading">
                  <div class="reading-value">
                    <ng-container *ngIf="sensor.type === 'presence' || sensor.unit === 'boolean'">
                      <span class="status-badge" [class]="'status-' + (sensor.value ? 'normal' : 'critical')">
                        {{ sensor.value ? 'DETECTED' : 'NOT DETECTED' }}
                      </span>
                    </ng-container>
                    <ng-container *ngIf="sensor.type !== 'presence' && sensor.unit !== 'boolean'">
                      {{ sensor.value | number: '1.0-1' }}
                      <span class="unit">{{ sensor.unit }}</span>
                    </ng-container>
                  </div>
                  <small class="last-updated">
                    Updated: {{ sensor.lastUpdated | date: 'short' }}
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="col-lg-4">
          <div class="sensor-stats-card">
            <h2>Sensor Summary</h2>
            <div class="stat-box">
              <i class="fas fa-thermometer-half"></i>
              <h5>Temperature</h5>
              <p class="stat-value">
                {{ getLatestSensorValue('temperature') | number: '1.0-1' }}°C
              </p>
            </div>

            <div class="stat-box">
              <i class="fas fa-droplet"></i>
              <h5>Humidity</h5>
              <p class="stat-value">
                {{ getLatestSensorValue('humidity') | number: '1.0-1' }}%
              </p>
            </div>

            <div class="stat-box">
              <i class="fas fa-wind"></i>
              <h5>Air Quality</h5>
              <p class="stat-value">
                {{ getLatestSensorValue('air_quality') | number: '1.0-0' }}AQI
              </p>
            </div>

            <div class="stat-box">
              <i class="fas fa-person"></i>
              <h5>Presence</h5>
              <p class="stat-value">
                {{ getLatestSensorValue('presence') === 1 ? 'Detected' : 'Not Detected' }}
              </p>
            </div>
          </div>

          <div class="alert-card">
            <h3>Alerts & Warnings</h3>
            <div *ngIf="warningCount === 0 && criticalCount === 0" class="alert-content">
              <i class="fas fa-check-circle text-success"></i>
              <p>All sensors normal</p>
            </div>
            <div *ngIf="warningCount > 0 || criticalCount > 0" class="alert-content">
              <div *ngIf="criticalCount > 0" class="alert-item critical">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ criticalCount }} Critical Alert(s)</span>
              </div>
              <div *ngIf="warningCount > 0" class="alert-item warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>{{ warningCount }} Warning(s)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .sensors-page {
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

      .sensors-container {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .sensors-container h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .sensors-list {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .sensor-item {
        display: grid;
        grid-template-columns: 80px 1fr 200px;
        align-items: center;
        gap: 1.5rem;
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 10px;
        border-left: 4px solid #27ae60;
        transition: all 0.3s ease;
      }

      .sensor-item:hover {
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        transform: translateX(4px);
      }

      .sensor-item.warning {
        border-left-color: #f39c12;
        background: #fffbf0;
      }

      .sensor-item.critical {
        border-left-color: #e74c3c;
        background: #fef5f5;
      }

      .sensor-icon {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: linear-gradient(135deg, #3498db, #2980b9);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
      }

      .sensor-details h4 {
        margin: 0 0 0.5rem 0;
        color: #2c3e50;
        font-weight: 600;
      }

      .location {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .sensor-status-text {
        margin-top: 0.5rem;
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

      .sensor-reading {
        text-align: right;
      }

      .reading-value {
        font-size: 1.8rem;
        font-weight: bold;
        color: #3498db;
        line-height: 1;
      }

      .unit {
        font-size: 0.9rem;
        color: #7f8c8d;
        margin-left: 0.5rem;
      }

      .last-updated {
        color: #95a5a6;
        display: block;
        margin-top: 0.5rem;
      }

      .sensor-stats-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 1.5rem;
      }

      .sensor-stats-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .stat-box {
        padding: 1.5rem;
        background: #f8f9fa;
        border-radius: 10px;
        text-align: center;
        margin-bottom: 1rem;
        transition: all 0.3s ease;
      }

      .stat-box:hover {
        background: #f0f1f3;
        transform: translateY(-2px);
      }

      .stat-box i {
        font-size: 2rem;
        color: #3498db;
        margin-bottom: 0.5rem;
      }

      .stat-box h5 {
        margin: 0.5rem 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .stat-value {
        font-size: 1.5rem;
        font-weight: bold;
        color: #2c3e50;
        margin: 0;
      }

      .alert-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .alert-card h3 {
        color: #2c3e50;
        margin-bottom: 1rem;
        font-weight: 600;
      }

      .alert-content {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .alert-content > i {
        font-size: 2rem;
        text-align: center;
      }

      .alert-content > p {
        text-align: center;
        color: #27ae60;
        font-weight: 600;
        margin: 0;
      }

      .alert-item {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 1rem;
        border-radius: 8px;
        font-weight: 600;
      }

      .alert-item.critical {
        background: #fef5f5;
        color: #e74c3c;
        border-left: 3px solid #e74c3c;
      }

      .alert-item.warning {
        background: #fffbf0;
        color: #f39c12;
        border-left: 3px solid #f39c12;
      }

      @media (max-width: 768px) {
        .sensor-item {
          grid-template-columns: 1fr;
          gap: 1rem;
        }

        .sensor-reading {
          text-align: left;
        }
      }
    `,
  ],
})
export class SensorsComponent implements OnInit {
  sensors: Sensor[] = [];
  warningCount = 0;
  criticalCount = 0;

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.sensors$.subscribe((sensors) => {
      this.sensors = sensors;
      this.updateAlertCounts();
    });
  }

  updateAlertCounts(): void {
    this.warningCount = this.sensors.filter((s) => s.status === 'warning').length;
    this.criticalCount = this.sensors.filter((s) => s.status === 'critical').length;
  }

  getLatestSensorValue(type: string): number {
    const sensor = this.sensors.find((s) => s.type === type);
    return sensor ? sensor.value : 0;
  }
}
