export type DeviceType = 'light' | 'thermostat' | 'blind' | 'garage' | 'ac' | 'sensor';
export type SensorType = 'humidity' | 'air_quality' | 'presence' | 'dimmable' | 'temperature';

export interface SmartDevice {
  id: string;
  name: string;
  type: DeviceType;
  isActive: boolean;
  isConnected: boolean;
  powerConsumption: number; // watts
  lastUpdated: Date;
  location: string;
  temperature?: number;
  targetTemperature?: number; // For thermostat - user's desired temperature
  value?: number; // For dimmable lights (0-100)
  maxValue?: number; // For blind position
  status?: string;
  isMoving?: boolean; // For garage door animation
}

export interface Sensor {
  id: string;
  name: string;
  type: SensorType;
  value: number;
  unit: string;
  location: string;
  lastUpdated: Date;
  icon: string;
  status: 'normal' | 'warning' | 'critical';
}

export interface EnergyData {
  date: Date;
  consumption: number; // kWh
  cost: number; // in currency units
  devices: EnergyDeviceData[];
}

export interface EnergyDeviceData {
  deviceId: string;
  deviceName: string;
  consumption: number; // kWh
  cost: number;
  percentage: number;
}

export interface Room {
  id: string;
  name: string;
  devices: string[]; // Device IDs
  icon: string;
}

export interface DashboardData {
  devices: SmartDevice[];
  sensors: Sensor[];
  rooms: Room[];
  totalPowerConsumption: number;
  monthlyEnergyData: EnergyData[];
}
