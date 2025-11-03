export interface DataCenter {
  id: string;
  name: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  floor?: string;
  dataCenterId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Cabinet {
  id: string;
  name: string;
  position?: string;
  height: number;
  roomId: string;
  createdAt: string;
  updatedAt: string;
}

export enum DeviceType {
  SERVER = 'SERVER',
  SWITCH = 'SWITCH',
  ROUTER = 'ROUTER',
  FIREWALL = 'FIREWALL',
  STORAGE = 'STORAGE',
  PDU = 'PDU',
  OTHER = 'OTHER',
}

export interface Device {
  id: string;
  name: string;
  type: DeviceType;
  model?: string;
  serialNo?: string;
  uPosition?: number;
  uHeight?: number;
  cabinetId: string;
  // 扩展字段 - 待实现
  ipAddresses?: string[];
  managementIp?: string;
  powerPhase?: string;
  powerSource?: 'MAINS' | 'UPS';
  snmpEnabled?: boolean;
  ipmiEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export enum PanelType {
  ETHERNET = 'ETHERNET',
  FIBER = 'FIBER',
  POWER = 'POWER',
  SERIAL = 'SERIAL',
  USB = 'USB',
  OTHER = 'OTHER',
}

export interface Panel {
  id: string;
  name: string;
  type: PanelType;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export enum PortStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  FAULTY = 'FAULTY',
}

export interface Port {
  id: string;
  number: string;
  label?: string;
  status: PortStatus;
  panelId: string;
  // 扩展字段 - 待实现
  ipAddress?: string;
  vlan?: string;
  speed?: string;
  createdAt: string;
  updatedAt: string;
}

export enum CableType {
  CAT5E = 'CAT5E',
  CAT6 = 'CAT6',
  CAT6A = 'CAT6A',
  CAT7 = 'CAT7',
  FIBER_SM = 'FIBER_SM',
  FIBER_MM = 'FIBER_MM',
  POWER = 'POWER',
  OTHER = 'OTHER',
}

export interface Cable {
  id: string;
  label?: string;
  type: CableType;
  length?: number;
  color?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CableConnection {
  cable: Cable;
  portA: Port;
  portB: Port;
}
