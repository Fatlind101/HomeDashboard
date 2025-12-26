import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DeviceService } from '../../services/device.service';
import { Room, SmartDevice } from '../../models/device.model';
import { DeviceCardComponent } from '../../shared/device-card/device-card.component';

@Component({
  selector: 'app-rooms',
  standalone: true,
  imports: [CommonModule, DeviceCardComponent],
  template: `
    <div class="rooms-page">
      <div class="page-header">
        <h1>Rooms</h1>
        <p class="text-muted">Control and monitor devices by room</p>
      </div>

      <div class="tabs-container">
        <button
          *ngFor="let room of rooms"
          class="tab-btn"
          [class.active]="selectedRoom?.id === room.id"
          (click)="selectRoom(room)"
        >
          <i [class]="'fas fa-' + room.icon"></i>
          {{ room.name }}
          <span class="device-count">{{ getRoomDeviceCount(room.id) }}</span>
        </button>
      </div>

      <div *ngIf="selectedRoom" class="room-content">
        <div class="room-header">
          <h2>
            <i [class]="'fas fa-' + selectedRoom.icon"></i>
            {{ selectedRoom.name }}
          </h2>
          <div class="room-stats">
            <div class="stat">
              <span class="label">Devices</span>
              <span class="value">{{ getRoomDeviceCount(selectedRoom.id) }}</span>
            </div>
            <div class="stat">
              <span class="label">Active</span>
              <span class="value">{{ getRoomActiveDeviceCount(selectedRoom.id) }}</span>
            </div>
            <div class="stat">
              <span class="label">Power</span>
              <span class="value">{{ getRoomPowerConsumption(selectedRoom.id) }}W</span>
            </div>
          </div>
        </div>

        <div class="room-devices">
          <h3>Devices in {{ selectedRoom.name }}</h3>
          <div class="devices-grid">
            <app-device-card
              *ngFor="let device of getRoomDevices(selectedRoom.id)"
              [device]="device"
              (toggle)="toggleDevice(device.id)"
              (valueChange)="onDeviceValueChange(device.id, $event)"
            ></app-device-card>
          </div>
          <div *ngIf="getRoomDevices(selectedRoom.id).length === 0" class="empty-state">
            <i class="fas fa-inbox"></i>
            <p>No devices in this room yet</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .rooms-page {
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

      .tabs-container {
        display: flex;
        gap: 1rem;
        margin-bottom: 2rem;
        flex-wrap: wrap;
      }

      .tab-btn {
        padding: 0.75rem 1.5rem;
        border: 2px solid #ddd;
        border-radius: 24px;
        background: white;
        color: #7f8c8d;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .tab-btn:hover {
        border-color: #3498db;
        color: #3498db;
      }

      .tab-btn.active {
        background: linear-gradient(135deg, #3498db, #2980b9);
        border-color: #2980b9;
        color: white;
        box-shadow: 0 4px 12px rgba(52, 152, 219, 0.3);
      }

      .device-count {
        background: rgba(0, 0, 0, 0.1);
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 0.85rem;
      }

      .room-content {
        animation: fadeIn 0.3s ease;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .room-header {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        margin-bottom: 2rem;
      }

      .room-header h2 {
        margin: 0 0 1.5rem 0;
        color: #2c3e50;
        font-size: 1.8rem;
        font-weight: bold;
      }

      .room-header i {
        color: #3498db;
        margin-right: 0.5rem;
      }

      .room-stats {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1rem;
      }

      .stat {
        padding: 1rem;
        background: #f8f9fa;
        border-radius: 8px;
        text-align: center;
      }

      .stat .label {
        display: block;
        color: #7f8c8d;
        font-size: 0.9rem;
        margin-bottom: 0.5rem;
      }

      .stat .value {
        display: block;
        font-size: 1.5rem;
        font-weight: bold;
        color: #3498db;
      }

      .room-devices {
        background: white;
        border-radius: 12px;
        padding: 2rem;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
      }

      .room-devices h3 {
        color: #2c3e50;
        margin-bottom: 1.5rem;
        font-weight: 600;
      }

      .devices-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 1.5rem;
      }

      .empty-state {
        text-align: center;
        padding: 3rem 1rem;
        color: #7f8c8d;
      }

      .empty-state i {
        font-size: 3rem;
        margin-bottom: 1rem;
        opacity: 0.5;
      }

      .empty-state p {
        margin: 0;
        font-size: 1.1rem;
      }

      @media (max-width: 768px) {
        .tabs-container {
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }

        .devices-grid {
          grid-template-columns: 1fr;
        }

        .room-stats {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class RoomsComponent implements OnInit {
  rooms: Room[] = [];
  devices: SmartDevice[] = [];
  selectedRoom: Room | null = null;

  constructor(private deviceService: DeviceService) {}

  ngOnInit(): void {
    this.deviceService.rooms$.subscribe((rooms) => {
      this.rooms = rooms;
      if (!this.selectedRoom && rooms.length > 0) {
        this.selectRoom(rooms[0]);
      }
    });

    this.deviceService.devices$.subscribe((devices) => {
      this.devices = devices;
    });
  }

  selectRoom(room: Room): void {
    this.selectedRoom = room;
  }

  getRoomDevices(roomId: string): SmartDevice[] {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) return [];
    return this.devices.filter((d) => room.devices.includes(d.id));
  }

  getRoomDeviceCount(roomId: string): number {
    const room = this.rooms.find((r) => r.id === roomId);
    return room ? room.devices.length : 0;
  }

  getRoomActiveDeviceCount(roomId: string): number {
    return this.getRoomDevices(roomId).filter((d) => d.isActive).length;
  }

  getRoomPowerConsumption(roomId: string): number {
    return this.getRoomDevices(roomId).reduce(
      (total, device) => total + (device.isActive ? device.powerConsumption : 0),
      0
    );
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
