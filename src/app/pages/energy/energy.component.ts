import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { EnergyData } from '../../models/device.model';

@Component({
  selector: 'app-energy',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="energy-page">
      <div class="page-header">
        <h1>Energy Consumption</h1>
        <p class="text-muted">Track your home energy usage and costs</p>
      </div>

      <!-- Summary Cards -->
      <div class="row g-3 mb-4">
        <div class="col-md-3 col-sm-6">
          <div class="energy-card">
            <div class="card-icon">
              <i class="fas fa-bolt"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Today's Usage</p>
              <h3>{{ todayConsumption | number: '1.0-1' }}kWh</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="energy-card">
            <div class="card-icon">
              <i class="fas fa-dollar-sign"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Today's Cost</p>
              <h3>{{ todayCost | number: '1.0-2' }}$</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="energy-card">
            <div class="card-icon">
              <i class="fas fa-chart-line"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Average Daily</p>
              <h3>{{ averageDailyConsumption | number: '1.0-1' }}kWh</h3>
            </div>
          </div>
        </div>

        <div class="col-md-3 col-sm-6">
          <div class="energy-card">
            <div class="card-icon">
              <i class="fas fa-calendar-month"></i>
            </div>
            <div class="card-content">
              <p class="card-label">Monthly Total</p>
              <h3>{{ monthlyConsumption | number: '1.0-1' }}kWh</h3>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="row g-4">
        <div class="col-lg-8">
          <!-- Daily Consumption Chart -->
          <div class="chart-card">
            <h2>Daily Consumption (Last 30 Days)</h2>
            <div class="chart-container">
              <svg class="consumption-chart" viewBox="0 0 1000 300">
                <!-- Grid lines -->
                <line x1="50" y1="20" x2="50" y2="260" stroke="#ddd" stroke-width="1" />
                <line x1="50" y1="260" x2="980" y2="260" stroke="#ddd" stroke-width="1" />

                <!-- Bars -->
                <g *ngFor="let data of energyData; let i = index">
                  <rect
                    [attr.x]="50 + i * 31"
                    [attr.y]="260 - (data.consumption / 27) * 240"
                    [attr.width]="28"
                    [attr.height]="(data.consumption / 27) * 240"
                    fill="#3498db"
                    rx="4"
                    class="bar-hover"
                  />
                  <text
                    [attr.x]="50 + i * 31 + 14"
                    y="280"
                    text-anchor="middle"
                    font-size="10"
                    fill="#7f8c8d"
                  >
                    {{ i + 1 }}
                  </text>
                </g>

                <!-- Axis labels -->
                <text x="25" y="140" text-anchor="middle" font-size="12" fill="#7f8c8d">kWh</text>
                <text x="515" y="295" text-anchor="middle" font-size="12" fill="#7f8c8d">
                  Days
                </text>
              </svg>
            </div>
          </div>

          <!-- Device Breakdown -->
          <div class="device-breakdown-card">
            <h2>Energy Consumption by Device (Today)</h2>
            <div class="device-list">
              <div
                *ngFor="let device of todayDeviceBreakdown"
                class="device-item"
                [style.--percentage]="device.percentage + '%'"
              >
                <div class="device-name">
                  <span>{{ device.deviceName }}</span>
                  <span class="device-consumption">{{ device.consumption | number: '1.0-2' }}kWh</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-fill" [style.width.%]="device.percentage"></div>
                </div>
                <span class="percentage">{{ device.percentage | number: '1.0-0' }}%</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Sidebar -->
        <div class="col-lg-4">
          <!-- Cost Breakdown -->
          <div class="cost-card">
            <h2>Monthly Cost</h2>
            <div class="cost-display">
              <span class="cost-value">{{ monthlyCost | number: '1.0-2' }}</span>
              <span class="cost-currency">$</span>
            </div>
            <p class="cost-note">Based on current consumption rate</p>

            <div class="price-info">
              <div class="price-item">
                <span class="label">Rate/kWh</span>
                <span class="value">$0.15</span>
              </div>
            </div>
          </div>

          <!-- Usage Trend -->
          <div class="trend-card">
            <h2>Usage Trend</h2>
            <div class="trend-item">
              <span>Peak Hour</span>
              <span class="value">{{ getPeakConsumption() | number: '1.0-1' }}kWh</span>
            </div>
            <div class="trend-item">
              <span>Low Hour</span>
              <span class="value">{{ getLowestConsumption() | number: '1.0-1' }}kWh</span>
            </div>
            <div class="trend-item">
              <span>Avg Daily</span>
              <span class="value">{{ averageDailyConsumption | number: '1.0-1' }}kWh</span>
            </div>

            <div class="trend-chart mt-3">
              <svg viewBox="0 0 200 100" class="line-chart">
                <polyline
                  [attr.points]="getTrendPoints()"
                  fill="none"
                  stroke="#3498db"
                  stroke-width="2"
                />
              </svg>
            </div>
          </div>

          <!-- Recommendations -->
          <div class="recommendations-card">
            <h2>Recommendations</h2>
            <ul class="recommendations-list">
              <li>
                <i class="fas fa-lightbulb"></i>
                <span>Switch to LED lights to save up to 75% on lighting costs</span>
              </li>
              <li>
                <i class="fas fa-snowflake"></i>
                <span>Reduce thermostat by 2°C to save ~10% on heating</span>
              </li>
              <li>
                <i class="fas fa-plug"></i>
                <span>Unplug devices when not in use to reduce phantom load</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .energy-page {
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

      .energy-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        display: flex;
        gap: 1rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
      }

      .energy-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .card-icon {
        width: 60px;
        height: 60px;
        border-radius: 12px;
        background: linear-gradient(135deg, #f39c12, #e67e22);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 1.5rem;
      }

      .card-content {
        display: flex;
        flex-direction: column;
        justify-content: center;
      }

      .card-label {
        margin: 0;
        color: #7f8c8d;
        font-size: 0.9rem;
      }

      .card-content h3 {
        margin: 0.5rem 0 0 0;
        color: #2c3e50;
        font-size: 1.6rem;
        font-weight: bold;
      }

      .chart-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
      }

      .chart-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .chart-container {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 350px;
      }

      .consumption-chart {
        width: 100%;
        height: 100%;
        max-height: 300px;
      }

      .bar-hover {
        transition: all 0.3s ease;
        cursor: pointer;
      }

      .bar-hover:hover {
        fill: #2980b9;
      }

      .device-breakdown-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .device-breakdown-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .device-list {
        display: flex;
        flex-direction: column;
        gap: 1.5rem;
      }

      .device-item {
        --percentage: 0%;
      }

      .device-name {
        display: flex;
        justify-content: space-between;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #2c3e50;
      }

      .device-consumption {
        color: #7f8c8d;
        font-weight: normal;
      }

      .progress-bar {
        height: 8px;
        background: #ecf0f1;
        border-radius: 4px;
        overflow: hidden;
        margin-bottom: 0.5rem;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #3498db, #2980b9);
        transition: width 0.3s ease;
      }

      .percentage {
        font-size: 0.85rem;
        color: #7f8c8d;
        font-weight: 600;
      }

      .cost-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
        text-align: center;
      }

      .cost-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .cost-display {
        display: flex;
        align-items: baseline;
        justify-content: center;
        margin-bottom: 0.5rem;
      }

      .cost-value {
        font-size: 3rem;
        font-weight: bold;
        color: #f39c12;
      }

      .cost-currency {
        font-size: 1.5rem;
        color: #f39c12;
        margin-left: 0.25rem;
      }

      .cost-note {
        color: #7f8c8d;
        font-size: 0.9rem;
        margin: 0.5rem 0 1.5rem 0;
      }

      .price-info {
        background: #f8f9fa;
        border-radius: 8px;
        padding: 1rem;
      }

      .price-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .price-item .label {
        color: #7f8c8d;
      }

      .price-item .value {
        font-weight: 600;
        color: #2c3e50;
      }

      .trend-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
      }

      .trend-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .trend-item {
        display: flex;
        justify-content: space-between;
        padding: 0.75rem 0;
        border-bottom: 1px solid #eee;
        color: #2c3e50;
      }

      .trend-item:last-child {
        border-bottom: none;
      }

      .trend-item .value {
        font-weight: 600;
        color: #3498db;
      }

      .trend-chart {
        height: 80px;
      }

      .line-chart {
        width: 100%;
        height: 100%;
      }

      .recommendations-card {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .recommendations-card h2 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .recommendations-list {
        list-style: none;
        padding: 0;
        margin: 0;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .recommendations-list li {
        display: flex;
        gap: 1rem;
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        align-items: flex-start;
        color: #2c3e50;
        font-size: 0.95rem;
      }

      .recommendations-list i {
        color: #f39c12;
        font-size: 1.2rem;
        flex-shrink: 0;
        margin-top: 2px;
      }

      .mt-3 {
        margin-top: 1.5rem;
      }

      @media (max-width: 768px) {
        .chart-container {
          min-height: 250px;
        }

        .consumption-chart {
          max-height: 200px;
        }
      }
    `,
  ],
})
export class EnergyComponent implements OnInit {
  energyData: EnergyData[] = [];
  todayConsumption = 0;
  todayCost = 0;
  monthlyConsumption = 0;
  monthlyCost = 0;
  averageDailyConsumption = 0;
  todayDeviceBreakdown: any[] = [];

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    // Subscribe to energy data updates
    this.deviceService.getEnergyData().subscribe((data) => {
      this.energyData = data;

      if (data.length > 0) {
        const today = data[data.length - 1];
        this.todayConsumption = today.consumption;
        this.todayCost = today.cost;
        this.todayDeviceBreakdown = today.devices || [];

        const totalConsumption = data.reduce((sum, d) => sum + d.consumption, 0);
        this.averageDailyConsumption = totalConsumption / data.length;
        this.monthlyConsumption = totalConsumption;
        this.monthlyCost = data.reduce((sum, d) => sum + d.cost, 0);
      }
    });
  }

  getPeakConsumption(): number {
    return Math.max(...this.energyData.map((d) => d.consumption));
  }

  getLowestConsumption(): number {
    return Math.min(...this.energyData.map((d) => d.consumption));
  }

  getTrendPoints(): string {
    if (this.energyData.length === 0) return '';
    const maxVal = this.getPeakConsumption();
    const minVal = this.getLowestConsumption();
    const range = maxVal - minVal || 1;

    return this.energyData
      .map((data, i) => {
        const x = (i / (this.energyData.length - 1)) * 200;
        const y = 100 - ((data.consumption - minVal) / range) * 80 - 10;
        return `${x},${y}`;
      })
      .join(' ');
  }
}
