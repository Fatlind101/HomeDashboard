import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, interval } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  SmartDevice,
  Sensor,
  EnergyData,
  Room,
  DashboardData,
  EnergyDeviceData,
} from '../models/device.model';

@Injectable({
  providedIn: 'root',
})
export class DeviceService {
  private apiUrl = 'http://localhost:3000';
  private devices: SmartDevice[] = [];
  private sensors: Sensor[] = [];
  private rooms: Room[] = [];
  private monthlyEnergyData: EnergyData[] = [];

  private devicesSubject = new BehaviorSubject<SmartDevice[]>([]);
  private sensorsSubject = new BehaviorSubject<Sensor[]>([]);
  private roomsSubject = new BehaviorSubject<Room[]>([]);
  private energyDataSubject = new BehaviorSubject<EnergyData[]>([]);

  devices$ = this.devicesSubject.asObservable();
  sensors$ = this.sensorsSubject.asObservable();
  rooms$ = this.roomsSubject.asObservable();
  energyData$ = this.energyDataSubject.asObservable();

  constructor(private http: HttpClient) {
    this.initializeData();
    this.startSensorSimulation();
  }

  private initializeData(): void {
    // Load devices from API
    this.http.get<SmartDevice[]>(`${this.apiUrl}/devices`).subscribe((devices) => {
      this.devices = devices;
      // Initialize targetTemperature for thermostats
      this.devices.forEach((device) => {
        if (device.type === 'thermostat' && !device.targetTemperature) {
          device.targetTemperature = device.temperature || 20;
        }
      });
      this.devicesSubject.next([...this.devices]);
    });

    // Load sensors from API
    this.http.get<Sensor[]>(`${this.apiUrl}/sensors`).subscribe((sensors) => {
      this.sensors = sensors;
      this.sensorsSubject.next([...this.sensors]);
    });

    // Load rooms from API
    this.http.get<Room[]>(`${this.apiUrl}/rooms`).subscribe((rooms) => {
      this.rooms = rooms;
      this.roomsSubject.next([...this.rooms]);
    });

    // Load energy data from API
    this.http.get<EnergyData[]>(`${this.apiUrl}/energyData`).subscribe((data) => {
      this.monthlyEnergyData = data;
      this.energyDataSubject.next([...this.monthlyEnergyData]);
    });
  }

  private startSensorSimulation(): void {
    // Simulate sensor data updates every 5 seconds
    interval(5000).subscribe(() => {
      this.sensors.forEach((sensor) => {
        if (sensor.type === 'humidity') {
          sensor.value = Math.max(
            30,
            Math.min(80, sensor.value + (Math.random() - 0.5) * 5)
          );
        } else if (sensor.type === 'air_quality') {
          sensor.value = Math.max(
            0,
            Math.min(500, sensor.value + (Math.random() - 0.5) * 10)
          );
          sensor.status =
            sensor.value < 50 ? 'normal' : sensor.value < 100 ? 'warning' : 'critical';
        } else if (sensor.type === 'temperature') {
          sensor.value = Math.max(
            15,
            Math.min(30, sensor.value + (Math.random() - 0.5) * 2)
          );
        } else if (sensor.type === 'presence') {
          sensor.value = Math.random() > 0.3 ? 1 : 0;
        }
        sensor.lastUpdated = new Date();
      });

      // Update thermostat temperature based on sensor
      const thermostat = this.devices.find((d) => d.type === 'thermostat');
      const tempSensor = this.sensors.find((s) => s.type === 'temperature');
      if (thermostat && tempSensor) {
        thermostat.temperature = tempSensor.value;
        thermostat.lastUpdated = new Date();
      }

      this.sensorsSubject.next([...this.sensors]);
      this.devicesSubject.next([...this.devices]);
    });
  }

  toggleDevice(deviceId: string): void {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device) {
      // For garage doors, toggle the status instead of isActive
      if (device.type === 'garage') {
        device.status = device.status === 'closed' ? 'open' : 'closed';
      } else {
        device.isActive = !device.isActive;
      }
      device.lastUpdated = new Date();
      this.devicesSubject.next([...this.devices]);
    }
  }

  setDeviceValue(deviceId: string, value: number): void {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device && device.value !== undefined) {
      device.value = Math.max(0, Math.min(device.maxValue || 100, value));
      device.lastUpdated = new Date();
      this.devicesSubject.next([...this.devices]);
    }
  }

  setTemperature(deviceId: string, temp: number): void {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device) {
      if (device.type === 'thermostat') {
        device.targetTemperature = Math.max(15, Math.min(30, temp));
      } else if (device.type === 'ac') {
        device.value = Math.max(16, Math.min(30, temp));
      }
      device.lastUpdated = new Date();
      this.devicesSubject.next([...this.devices]);
    }
  }

  getDeviceById(id: string): SmartDevice | undefined {
    return this.devices.find((d) => d.id === id);
  }

  getDevicesByRoom(roomId: string): SmartDevice[] {
    const room = this.rooms.find((r) => r.id === roomId);
    if (!room) return [];
    return this.devices.filter((d) => room.devices.includes(d.id));
  }

  getActualPowerConsumption(device: SmartDevice): number {
    if (!device.isActive) return 0;
    
    let consumption = device.powerConsumption;
    
    // Lights: power scales with brightness
    if (device.type === 'light' && device.value !== undefined) {
      consumption = (device.powerConsumption * device.value) / 100;
    }
    // Blinds: only consume power while moving
    else if (device.type === 'blind' && device.value !== undefined) {
      consumption = 5; // 5W for motor operation
    }
    
    return consumption;
  }

  operateGarageDoor(deviceId: string): void {
    const device = this.devices.find((d) => d.id === deviceId);
    if (device && device.type === 'garage') {
      device.isMoving = true;
      this.devicesSubject.next([...this.devices]);
      
      setTimeout(() => {
        device.status = device.status === 'closed' ? 'open' : 'closed';
        device.isMoving = false;
        device.lastUpdated = new Date();
        this.devicesSubject.next([...this.devices]);
      }, 3000);
    }
  }

  getTotalPowerConsumption(): Observable<number> {
    return this.devices$.pipe(
      map((devices) =>
        devices.reduce(
          (total, device) => total + this.getActualPowerConsumption(device),
          0
        )
      )
    );
  }

  getActiveDevicesCount(): Observable<number> {
    return this.devices$.pipe(
      map((devices) => devices.filter((d) => d.isActive).length)
    );
  }

  getConnectedDevicesCount(): Observable<number> {
    return this.devices$.pipe(
      map((devices) => devices.filter((d) => d.isConnected).length)
    );
  }

  getTodayEnergyConsumption(): number {
    const today = this.monthlyEnergyData[this.monthlyEnergyData.length - 1];
    return today ? today.consumption : 0;
  }

  getMonthlyEnergyData(): EnergyData[] {
    return this.monthlyEnergyData;
  }

  getEnergyData(): Observable<EnergyData[]> {
    return this.energyDataSubject.asObservable();
  }

  getDashboardData(): Observable<DashboardData> {
    return this.devices$.pipe(
      map((devices) => ({
        devices,
        sensors: this.sensors,
        rooms: this.rooms,
        totalPowerConsumption: devices.reduce(
          (total, device) =>
            total + (device.isActive ? device.powerConsumption : 0),
          0
        ),
        monthlyEnergyData: this.monthlyEnergyData,
      }))
    );
  }
}
