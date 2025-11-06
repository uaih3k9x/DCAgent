import api from './api';

export interface MonitoringDevice {
  id: string;
  name: string;
  ip: string;
  community?: string;
  vendor: 'lenovo' | 'dell' | 'hp' | 'unknown';
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
}

export interface SensorData {
  index: number;
  oid: string;
  name: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
  unit?: string;
}

export interface PowerMetrics {
  totalPower: number;
  cpuPower: number;
  memPower: number;
  fanPower: number;
  avgPower: number;
  maxPower: number;
  minPower: number;
}

export interface HealthStatus {
  overall: string;
  cpu: string;
  memory: string;
  disk: string;
  fan: string;
  temperature: string;
  voltage: string;
  power: string;
}

const monitoringService = {
  // 获取所有监控设备
  async getDevices(): Promise<MonitoringDevice[]> {
    const response = await api.get('/monitoring/devices');
    return response.data;
  },

  // 添加监控设备
  async addDevice(device: {
    name: string;
    ip: string;
    community: string;
    vendor?: string;
  }): Promise<MonitoringDevice> {
    const response = await api.post('/monitoring/devices', device);
    return response.data;
  },

  // 删除监控设备
  async deleteDevice(deviceId: string): Promise<void> {
    await api.delete(`/monitoring/devices/${deviceId}`);
  },

  // 测试设备连接
  async testConnection(ip: string, community: string): Promise<{
    success: boolean;
    vendor?: string;
    message?: string;
  }> {
    const response = await api.post('/monitoring/test-connection', {
      ip,
      community,
    });
    return response.data;
  },

  // 获取设备温度数据
  async getTemperature(deviceId: string): Promise<SensorData[]> {
    const response = await api.get(`/monitoring/devices/${deviceId}/temperature`);
    return response.data;
  },

  // 获取设备风扇数据
  async getFans(deviceId: string): Promise<SensorData[]> {
    const response = await api.get(`/monitoring/devices/${deviceId}/fans`);
    return response.data;
  },

  // 获取设备电源数据
  async getPower(deviceId: string): Promise<PowerMetrics> {
    const response = await api.get(`/monitoring/devices/${deviceId}/power`);
    return response.data;
  },

  // 获取设备健康状态
  async getHealth(deviceId: string): Promise<HealthStatus> {
    const response = await api.get(`/monitoring/devices/${deviceId}/health`);
    return response.data;
  },

  // 获取所有传感器数据
  async getAllSensors(deviceId: string): Promise<SensorData[]> {
    const response = await api.get(`/monitoring/devices/${deviceId}/sensors`);
    return response.data;
  },

  // 批量导入设备
  async bulkImportDevices(devices: Array<{
    name: string;
    ip: string;
    community: string;
  }>): Promise<{
    success: number;
    failed: number;
    results: Array<{ ip: string; success: boolean; message?: string }>;
  }> {
    const response = await api.post('/monitoring/devices/bulk-import', {
      devices,
    });
    return response.data;
  },

  // 获取历史数据
  async getHistoricalData(
    deviceId: string,
    sensorName: string,
    timeRange: { start: string; end: string }
  ): Promise<Array<{ timestamp: string; value: number }>> {
    const response = await api.get(
      `/monitoring/devices/${deviceId}/history/${sensorName}`,
      {
        params: timeRange,
      }
    );
    return response.data;
  },
};

export default monitoringService;
