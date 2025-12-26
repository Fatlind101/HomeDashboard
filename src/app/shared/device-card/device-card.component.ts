import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SmartDevice } from '../../models/device.model';

@Component({
  selector: 'app-device-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- LIGHT CARD -->
    <div *ngIf="device.type === 'light'" class="device-card light-card" [class.active]="device.isActive">
      <div class="light-visual">
        <div class="lightbulb" [style.opacity]="device.isActive ? (device.value || 0) / 100 : 0">
          <i class="fas fa-lightbulb"></i>
        </div>
        <div class="glow" [style.opacity]="device.isActive ? (device.value || 0) / 100 : 0"></div>
      </div>
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      <div *ngIf="device.value !== undefined" class="brightness-display">
        <span class="brightness-value">{{ device.value }}%</span>
      </div>
      <input
        type="range"
        class="form-range light-slider"
        min="0"
        max="100"
        [value]="device.value || 0"
        (input)="onValueChange($event)"
        [disabled]="!device.isConnected"
      />
      <div class="power-consumption">
        <i class="fas fa-plug"></i> {{ getActualPowerConsumption() }}W
      </div>
      <button class="btn toggle-btn light-toggle" (click)="onToggle()" [disabled]="!device.isConnected">
        {{ device.isActive ? 'ON' : 'OFF' }}
      </button>
    </div>

    <!-- THERMOSTAT CARD -->
    <div *ngIf="device.type === 'thermostat'" class="device-card thermo-card" [class.active]="device.isActive">
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      
      <div class="thermo-container">
        <div class="temperature-circle" 
             [style.background]="getTemperatureGradient()"
             (mousedown)="startDrag($event)"
             (touchstart)="startDrag($event)"
             [class.dragging]="isDragging">
          <div class="circle-inner">
            <div class="temp-display-large">{{ device.targetTemperature | number: '1.0-0' }}°C</div>
            <div class="target-range">
              <span class="target-label">Target</span>
              <div class="range-btns">
                <button class="temp-btn minus" (click)="decreaseTemp()" [disabled]="!device.isConnected || (device.targetTemperature || 0) <= 15">
                  <i class="fas fa-minus"></i>
                </button>
                <button class="temp-btn plus" (click)="increaseTemp()" [disabled]="!device.isConnected || (device.targetTemperature || 0) >= 30">
                  <i class="fas fa-plus"></i>
                </button>
              </div>
            </div>
          </div>
          <svg class="temp-dial" viewBox="0 0 200 200" [class.active]="device.isActive">
            <circle cx="100" cy="100" r="95" class="dial-background"/>
            <circle cx="100" cy="100" r="90" class="dial-ring" [style.stroke-dashoffset]="getDialOffset()"/>
            <g class="dial-ticks">
              <line *ngFor="let i of [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15]" 
                    [attr.x1]="100 + 85 * Math.cos((i * 24 - 90) * Math.PI / 180)"
                    [attr.y1]="100 + 85 * Math.sin((i * 24 - 90) * Math.PI / 180)"
                    [attr.x2]="100 + 90 * Math.cos((i * 24 - 90) * Math.PI / 180)"
                    [attr.y2]="100 + 90 * Math.sin((i * 24 - 90) * Math.PI / 180)"
                    class="tick"/>
            </g>
          </svg>
        </div>
      </div>

      <div class="current-temp">
        <span class="current-label">Current</span>
        <span class="current-value">{{ device.temperature | number: '1.0-0' }}°C</span>
      </div>

      <div class="status-badge" [class.bg-success]="device.isActive" [class.bg-secondary]="!device.isActive">
        {{ device.isActive ? 'HEATING' : 'OFF' }}
      </div>
      <button class="btn toggle-btn thermo-toggle" (click)="onToggle()" [disabled]="!device.isConnected">
        {{ device.isActive ? 'Turn Off' : 'Turn On' }}
      </button>
    </div>

    <!-- BLIND CARD -->
    <div *ngIf="device.type === 'blind'" class="device-card blind-card" [class.active]="device.isActive">
      <div class="blind-mini-visual">
        <div class="mini-blind" [style.clip-path]="'inset(' + (100 - (device.value || 0)) + '% 0 0 0)'">
          <div class="mini-slat"></div>
          <div class="mini-slat"></div>
          <div class="mini-slat"></div>
          <div class="mini-slat"></div>
        </div>
      </div>
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      <div class="position-display">
        <div class="position-badge">
          {{ device.value === 0 ? 'CLOSED' : device.value === 100 ? 'OPEN' : 'PARTIAL' }}
        </div>
        <div class="position-percent">{{ device.value || 0 }}%</div>
      </div>
      <input
        type="range"
        class="form-range blind-slider"
        min="0"
        max="100"
        [value]="device.value || 0"
        (input)="onValueChange($event)"
        [disabled]="!device.isConnected"
      />
      <div class="power-consumption">
        <i class="fas fa-plug"></i> {{ getActualPowerConsumption() }}W
      </div>
    </div>

    <!-- GARAGE CARD -->
    <div *ngIf="device.type === 'garage'" class="device-card garage-card" [class.active]="device.isActive">
      <div class="garage-mini-visual">
        <div class="garage-mini" [class.door-open]="device.status === 'open'" [class.door-moving]="device.isMoving">
          <div class="mini-door-panel"></div>
          <div class="mini-door-panel"></div>
        </div>
      </div>
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      <div class="garage-badge" [class.bg-success]="device.status === 'open'" [class.bg-danger]="device.status === 'closed'" [class.bg-warning]="device.isMoving">
        {{ device.isMoving ? 'MOVING' : (device.status | titlecase) }}
      </div>
      <div class="power-consumption">
        <i class="fas fa-plug"></i> {{ getActualPowerConsumption() }}W
      </div>
      <button class="btn toggle-btn garage-toggle" (click)="onToggle()" [disabled]="!device.isConnected || device.isMoving">
        {{ device.status === 'closed' ? 'OPEN' : 'CLOSE' }}
      </button>
    </div>

    <!-- AC/GENERIC CARD -->
    <div *ngIf="device.type !== 'light' && device.type !== 'thermostat' && device.type !== 'blind' && device.type !== 'garage' && device.type !== 'ac'" class="device-card ac-card" [class.active]="device.isActive">
      <div class="ac-visual">
        <i [class]="getDeviceIcon()"></i>
      </div>
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      <div class="status-badge" [class.bg-success]="device.isActive" [class.bg-secondary]="!device.isActive">
        {{ device.isActive ? 'ON' : 'OFF' }}
      </div>
      <div class="power-consumption">
        <i class="fas fa-plug"></i> {{ getActualPowerConsumption() }}W
      </div>
      <button class="btn toggle-btn ac-toggle" (click)="onToggle()" [disabled]="!device.isConnected">
        {{ device.isActive ? 'Turn Off' : 'Turn On' }}
      </button>
    </div>

    <!-- AC CARD -->
    <div *ngIf="device.type === 'ac'" class="device-card ac-card" [class.active]="device.isActive">
      <div class="ac-visual">
        <i class="fas fa-snowflake" [style.opacity]="device.isActive ? 1 : 0.4"></i>
      </div>
      <h5 class="device-name">{{ device.name }}</h5>
      <p class="device-location"><i class="fas fa-map-marker-alt me-1"></i>{{ device.location }}</p>
      <div class="temp-display-ac">
        <span class="temp-value">{{ device.value || 24 }}°C</span>
      </div>
      <input
        type="range"
        class="form-range ac-slider"
        min="16"
        max="30"
        [value]="device.value || 24"
        (input)="onValueChange($event)"
        [disabled]="!device.isConnected || !device.isActive"
      />
      <div class="status-badge" [class.bg-success]="device.isActive" [class.bg-secondary]="!device.isActive">
        {{ device.isActive ? 'COOLING' : 'OFF' }}
      </div>
      <div class="power-consumption">
        <i class="fas fa-plug"></i> {{ getActualPowerConsumption() }}W
      </div>
      <button class="btn toggle-btn ac-toggle" (click)="onToggle()" [disabled]="!device.isConnected">
        {{ device.isActive ? 'Turn Off' : 'Turn On' }}
      </button>
    </div>
  `,
  styles: [
    `
      .device-card {
        background: white;
        border-radius: 12px;
        padding: 1.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        transition: all 0.3s ease;
        border: 2px solid transparent;
        min-height: 480px;
        display: flex;
        flex-direction: column;
      }

      .device-card:hover {
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
        transform: translateY(-4px);
      }

      .device-name {
        font-weight: 600;
        margin: 1rem 0 0.3rem 0;
        color: #2c3e50;
      }

      .device-location {
        font-size: 0.85rem;
        color: #7f8c8d;
        margin-bottom: 1rem;
      }

      .power-consumption {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.6rem;
        background: #f5f7fa;
        border-radius: 6px;
        font-size: 0.9rem;
        font-weight: 500;
        margin: 0.75rem 0;
      }

      .toggle-btn {
        width: 100%;
        border-radius: 6px;
        font-weight: 600;
        transition: all 0.3s ease;
        margin-top: 0.75rem;
        margin-top: auto;
      }

      .toggle-btn:hover:not(:disabled) {
        transform: scale(1.02);
      }

      .toggle-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* LIGHT CARD STYLES */
      .light-card {
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-color: #bdbdbd;
      }

      .light-card.active {
        border-color: #757575;
      }

      .light-visual {
        position: relative;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .lightbulb {
        font-size: 4rem;
        color: #fdd835;
        transition: all 0.3s ease;
        text-shadow: 0 0 20px rgba(253, 216, 53, 0.3);
      }

      .light-card.active .lightbulb {
        text-shadow: 0 0 25px rgba(253, 216, 53, 0.5);
      }

      .glow {
        position: absolute;
        width: 80px;
        height: 80px;
        background: radial-gradient(circle, rgba(97, 97, 97, 0.2), transparent);
        border-radius: 50%;
        filter: blur(10px);
        transition: all 0.3s ease;
      }

      .brightness-display {
        text-align: center;
        font-size: 1.3rem;
        font-weight: bold;
        color: #616161;
        margin-bottom: 0.75rem;
      }

      .brightness-value {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: rgba(97, 97, 97, 0.1);
        border-radius: 6px;
      }

      .light-slider {
        background: linear-gradient(to right, #bdbdbd, #616161);
      }

      .light-slider::-webkit-slider-thumb {
        background: #757575;
      }

      .light-card.active .light-slider::-webkit-slider-thumb {
        background: #34495e;
      }

      .light-card.active .light-slider::-moz-range-thumb {
        background: #34495e;
      }

      .light-toggle {
        background: #757575;
        color: white;
      }

      .light-toggle:hover:not(:disabled) {
        background: #424242;
      }

      .light-card.active .light-toggle {
        background: #34495e;
      }

      .light-card.active .light-toggle:hover:not(:disabled) {
        background: #2c3e50;
      }

      /* THERMOSTAT CARD STYLES */
      .thermo-card {
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-color: #bdbdbd;
      }

      .thermo-card.active {
        border-color: #757575;
      }

      .thermo-container {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 1.5rem 0;
      }

      .temperature-circle {
        position: relative;
        width: 140px;
        height: 140px;
        cursor: grab;
        user-select: none;
        transition: transform 0.2s ease;
        border-radius: 50%;
        overflow: hidden;
        background: radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0), rgba(0, 0, 0, 0.3));
        box-shadow: inset 0 0 40px rgba(0, 0, 0, 0.25);
        filter: saturate(0.9);
      }

      .temperature-circle::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0.05), transparent 80%);
        border-radius: 50%;
        z-index: 1;
        pointer-events: none;
      }

      .temperature-circle:hover {
        transform: scale(1.05);
      }

      .temperature-circle.dragging {
        cursor: grabbing;
        transform: scale(1.08);
      }

      .circle-inner {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        text-align: center;
        z-index: 10;
      }

      .temp-display-large {
        font-size: 2.5rem;
        font-weight: 700;
        color: white;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        margin-bottom: 0.5rem;
      }

      .target-range {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        align-items: center;
      }

      .target-label {
        font-size: 0.75rem;
        color: rgba(255, 255, 255, 0.85);
        text-transform: uppercase;
        letter-spacing: 1px;
        font-weight: 600;
      }

      .range-btns {
        display: flex;
        gap: 0.5rem;
      }

      .temp-btn {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.9);
        color: #616161;
        font-size: 0.85rem;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s ease;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
      }

      .temp-btn:hover:not(:disabled) {
        background: white;
        transform: scale(1.1);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
      }

      .temp-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .temp-btn i {
        font-size: 0.6rem;
      }

      .temp-dial {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        transform: rotate(-90deg);
        filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15));
      }

      .dial-background {
        fill: none;
        stroke: rgba(255, 255, 255, 0.3);
        stroke-width: 2;
      }

      .dial-ring {
        fill: none;
        stroke-width: 8;
        stroke-linecap: round;
        transition: stroke-dashoffset 0.3s ease;
        stroke: url(#tempGradient);
        filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
      }

      .dial-ticks {
        stroke: rgba(255, 255, 255, 0.6);
        stroke-width: 2;
        stroke-linecap: round;
      }

      .tick {
        opacity: 0.7;
      }

      .thermo-toggle {
        background: #757575;
        color: white;
      }

      .thermo-toggle:hover:not(:disabled) {
        background: #424242;
      }

      .thermo-card.active .thermo-toggle {
        background: #34495e;
      }

      .thermo-card.active .thermo-toggle:hover:not(:disabled) {
        background: #2c3e50;
      }

      .current-temp {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem;
        background: rgba(97, 97, 97, 0.1);
        border-radius: 8px;
        margin: 0.75rem 0;
        font-weight: 500;
      }

      .current-label {
        color: #616161;
        font-size: 0.85rem;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .current-value {
        color: #424242;
        font-size: 1.2rem;
        font-weight: 700;
      }

      /* BLIND CARD STYLES */
      .blind-card {
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-color: #bdbdbd;
      }

      .blind-card.active {
        border-color: #757575;
      }

      .blind-mini-visual {
        width: 100%;
        height: 100px;
        background: linear-gradient(135deg, #d7ccc8 0%, #efebe9 100%);
        border: 2px solid #8d6e63;
        border-radius: 8px;
        overflow: hidden;
        margin-bottom: 1rem;
      }

      .mini-blind {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        transition: clip-path 0.3s ease;
      }

      .mini-slat {
        flex: 1;
        background: linear-gradient(90deg, #c4ab9d 0%, #d7ccc8 50%, #c4ab9d 100%);
        border-bottom: 1px solid #8d6e63;
      }

      .position-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        background: #757575;
        color: white;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      .position-display {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
      }

      .position-percent {
        font-size: 1.3rem;
        font-weight: 700;
        color: #2196f3;
        padding: 0.5rem 0.75rem;
        background: rgba(33, 150, 243, 0.1);
        border-radius: 6px;
        min-width: 50px;
        text-align: center;
      }

      .blind-slider {
        background: linear-gradient(to right, #bdbdbd, #616161);
      }

      .blind-card.active .blind-slider {
        background: linear-gradient(to right, #90caf9, #2196f3);
      }

      .blind-slider::-webkit-slider-thumb {
        background: #757575;
      }

      .blind-card.active .blind-slider::-webkit-slider-thumb {
        background: #34495e;
      }

      .blind-card.active .blind-slider::-moz-range-thumb {
        background: #34495e;
      }

      .blind-toggle {
        background: #757575;
        color: white;
      }

      .blind-toggle:hover:not(:disabled) {
        background: #424242;
      }

      .blind-card.active .blind-toggle {
        background: #34495e;
      }

      .blind-card.active .blind-toggle:hover:not(:disabled) {
        background: #2c3e50;
      }

      /* GARAGE CARD STYLES */
      .garage-card {
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-color: #bdbdbd;
      }

      .garage-card.active {
        border-color: #757575;
      }

      .garage-mini-visual {
        width: 100%;
        height: 100px;
        background: linear-gradient(135deg, #8b7355 0%, #a0826d 100%);
        border: 2px solid #5d4e37;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 1rem;
      }

      .garage-mini {
        width: 80%;
        height: 80%;
        background: linear-gradient(90deg, #333 0%, #555 50%, #333 100%);
        border: 1px solid #222;
        border-radius: 4px;
        display: flex;
        flex-direction: column;
        justify-content: space-around;
        padding: 4px;
        transition: transform 4s ease-in-out;
      }

      .garage-mini.door-open {
        transform: translateY(-90%);
      }

      .garage-mini.door-moving {
        box-shadow: 0 0 15px rgba(117, 117, 117, 0.6);
      }

      .mini-door-panel {
        width: 100%;
        height: 30%;
        background: #444;
        border: 0.5px solid #111;
        border-radius: 2px;
      }

      .garage-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        color: white;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        margin-bottom: 0.75rem;
      }

      .garage-toggle {
        background: #757575;
        color: white;
      }

      .garage-toggle:hover:not(:disabled) {
        background: #424242;
      }

      .garage-card.active .garage-toggle {
        background: #34495e;
      }

      .garage-card.active .garage-toggle:hover:not(:disabled) {
        background: #2c3e50;
      }

      /* AC/GENERIC CARD STYLES */
      .ac-card {
        background: linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%);
        border-color: #bdbdbd;
      }

      .ac-card.active {
        border-color: #757575;
      }

      .ac-visual {
        width: 100%;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 3.5rem;
        color: #616161;
        margin-bottom: 1rem;
        transition: color 0.3s ease, text-shadow 0.3s ease;
      }

      .ac-card.active .ac-visual {
        color: #3498db;
        text-shadow: 0 0 20px rgba(52, 152, 219, 0.4);
      }

      .temp-display-ac {
        text-align: center;
        margin: 1rem 0;
        font-size: 1.8rem;
        font-weight: 600;
        color: #34495e;
      }

      .ac-slider {
        cursor: pointer;
        margin-bottom: 1.5rem;
      }

      .ac-card .ac-slider::-webkit-slider-thumb {
        background: #757575;
      }

      .ac-card.active .ac-slider::-webkit-slider-thumb {
        background: #34495e;
      }

      .ac-toggle {
        background: #757575;
        color: white;
      }

      .ac-toggle:hover:not(:disabled) {
        background: #424242;
      }

      .ac-card.active .ac-toggle {
        background: #34495e;
      }

      .ac-card.active .ac-toggle:hover:not(:disabled) {
        background: #2c3e50;
      }

      .status-badge {
        display: inline-block;
        padding: 0.5rem 1rem;
        border-radius: 20px;
        font-size: 0.85rem;
        font-weight: 600;
        color: white;
        margin-bottom: 0.75rem;
      }

      .status-badge.bg-success {
        background: #27ae60;
      }

      .status-badge.bg-secondary {
        background: #95a5a6;
      }

      .status-badge.bg-warning {
        background: #f39c12;
      }

      .status-badge.bg-danger {
        background: #e74c3c;
      }

      .form-range {
        height: 6px;
        border-radius: 3px;
      }

      .form-range::-webkit-slider-thumb {
        width: 18px;
        height: 18px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        background: #757575;
        transition: background 0.3s ease;
      }

      .form-range::-moz-range-thumb {
        width: 18px;
        height: 18px;
        border: 2px solid white;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        background: #757575;
        transition: background 0.3s ease;
      }

      .device-card.active .form-range::-webkit-slider-thumb {
        background: #34495e;
      }

      .device-card.active .form-range::-moz-range-thumb {
        background: #34495e;
      }
    `,
  ],
})
export class DeviceCardComponent {
  @Input() device!: SmartDevice;
  @Output() toggle = new EventEmitter<void>();
  @Output() valueChange = new EventEmitter<number>();

  isDragging = false;
  isBlindMoving = false;
  blindMovementTimeout: any;
  Math = Math;

  getDeviceIcon(): string {
    const iconMap: { [key: string]: string } = {
      light: 'fas fa-lightbulb',
      thermostat: 'fas fa-thermometer-half',
      blind: 'fas fa-window',
      garage: 'fas fa-door-open',
      sensor: 'fas fa-snowflake',
    };
    return iconMap[this.device.type] || 'fas fa-cog';
  }

  getActualPowerConsumption(): number {
    let consumption = 0;
    
    if (this.device.type === 'light') {
      if (!this.device.isActive) return 0;
      if (this.device.value !== undefined) {
        consumption = (this.device.powerConsumption * this.device.value) / 100;
      } else {
        consumption = this.device.powerConsumption;
      }
    } else if (this.device.type === 'blind') {
      // Blinds only consume power while being actively moved
      if (this.isBlindMoving) {
        consumption = this.device.powerConsumption;
      }
    } else if (this.device.type === 'garage') {
      // Garage doors only consume power while moving
      if (this.device.isMoving) {
        consumption = this.device.powerConsumption;
      }
    } else {
      // Other devices consume power based on isActive
      if (!this.device.isActive) return 0;
      consumption = this.device.powerConsumption;
    }
    
    return Math.round(consumption);
  }

  getTemperatureGradient(): string {
    const temp = this.device.targetTemperature || 20;
    // Map temperature 15-30 to hue 240 (blue) - 0 (red)
    const hue = 240 - ((temp - 15) / 15) * 240;
    return `conic-gradient(hsl(${hue}, 100%, 50%), hsl(${Math.max(0, hue - 10)}, 100%, 50%), hsl(${Math.max(0, hue - 20)}, 100%, 50%), hsl(${Math.max(0, hue - 30)}, 100%, 50%), hsl(${hue}, 100%, 50%))`;
  }

  getDialOffset(): number {
    const temp = this.device.targetTemperature || 20;
    const circumference = 2 * Math.PI * 90;
    const progress = ((temp - 15) / 15);
    return circumference * (1 - progress);
  }

  startDrag(event: MouseEvent | TouchEvent): void {
    if (!this.device.isConnected) return;
    
    this.isDragging = true;
    const handleMove = (e: MouseEvent | TouchEvent) => this.handleDrag(e);
    const handleEnd = () => this.endDrag(handleMove, handleEnd);

    document.addEventListener('mousemove', handleMove);
    document.addEventListener('touchmove', handleMove);
    document.addEventListener('mouseup', handleEnd);
    document.addEventListener('touchend', handleEnd);
  }

  handleDrag(event: MouseEvent | TouchEvent): void {
    if (!this.isDragging) return;

    const circle = (event.target as HTMLElement).closest('.temperature-circle') as HTMLElement;
    if (!circle) return;

    const rect = circle.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let clientX: number, clientY: number;
    if (event instanceof TouchEvent) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    let angle = Math.atan2(clientY - centerY, clientX - centerX) * (180 / Math.PI) + 90;
    if (angle < 0) angle += 360;

    const temp = Math.round(15 + (angle / 360) * 15);
    const clampedTemp = Math.max(15, Math.min(30, temp));

    if (this.device.targetTemperature !== clampedTemp) {
      this.device.targetTemperature = clampedTemp;
      this.valueChange.emit(clampedTemp);
    }
  }

  endDrag(handleMove: (e: MouseEvent | TouchEvent) => void, handleEnd: () => void): void {
    this.isDragging = false;
    document.removeEventListener('mousemove', handleMove);
    document.removeEventListener('touchmove', handleMove);
    document.removeEventListener('mouseup', handleEnd);
    document.removeEventListener('touchend', handleEnd);
  }

  increaseTemp(): void {
    if (!this.device.isConnected || (this.device.targetTemperature || 0) >= 30) return;
    const newTemp = (this.device.targetTemperature || 20) + 1;
    this.device.targetTemperature = newTemp;
    this.valueChange.emit(newTemp);
  }

  decreaseTemp(): void {
    if (!this.device.isConnected || (this.device.targetTemperature || 0) <= 15) return;
    const newTemp = (this.device.targetTemperature || 20) - 1;
    this.device.targetTemperature = newTemp;
    this.valueChange.emit(newTemp);
  }

  onToggle(): void {
    // Special handling for garage doors
    if (this.device.type === 'garage') {
      this.toggleGarageDoor();
    } else {
      this.toggle.emit();
    }
  }

  toggleGarageDoor(): void {
    // Set isMoving to true and toggle status
    this.device.isMoving = true;
    
    // Toggle the status between open and closed
    const newStatus = this.device.status === 'closed' ? 'open' : 'closed';
    
    // Emit toggle to parent to update service
    this.toggle.emit();
    
    // After 4 seconds, clear the isMoving flag
    setTimeout(() => {
      this.device.isMoving = false;
    }, 4000);
  }

  onValueChange(event: Event): void {
    const value = parseInt((event.target as HTMLInputElement).value);
    
    // If it's a blind, track movement
    if (this.device.type === 'blind') {
      this.isBlindMoving = true;
      
      // Clear existing timeout
      if (this.blindMovementTimeout) {
        clearTimeout(this.blindMovementTimeout);
      }
      
      // Set timeout to stop showing movement after 500ms of inactivity
      this.blindMovementTimeout = setTimeout(() => {
        this.isBlindMoving = false;
      }, 500);
    }
    
    this.valueChange.emit(value);
  }
}
