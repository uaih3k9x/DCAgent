import api from './api';
import { Workstation, WorkstationStatus } from '@/types';

export interface CreateWorkstationData {
  name: string;
  code?: string;
  roomId: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  gpu?: string;
  os?: string;
  status?: WorkstationStatus;
  assignedTo?: string;
  ipAddress?: string;
  macAddress?: string;
  floorPlanPosition?: { x: number; y: number };
  floorPlanSize?: { width: number; depth: number };
  notes?: string;
}

export interface UpdateWorkstationData {
  name?: string;
  code?: string;
  cpu?: string;
  memory?: string;
  storage?: string;
  gpu?: string;
  os?: string;
  status?: WorkstationStatus;
  assignedTo?: string;
  ipAddress?: string;
  macAddress?: string;
  floorPlanPosition?: { x: number; y: number };
  floorPlanSize?: { width: number; depth: number };
  notes?: string;
}

export const workstationService = {
  // 获取所有工作站
  async getAll(roomId?: string): Promise<Workstation[]> {
    const params = roomId ? { roomId } : {};
    const response = await api.get('/workstations', { params });
    return response.data;
  },

  // 获取工作站详情
  async getById(id: string): Promise<Workstation> {
    const response = await api.post('/workstations/get', { id });
    return response.data;
  },

  // 根据编号获取工作站
  async getByCode(code: string): Promise<Workstation> {
    const response = await api.post('/workstations/by-code', { code });
    return response.data;
  },

  // 创建工作站
  async create(data: CreateWorkstationData): Promise<Workstation> {
    const response = await api.post('/workstations/create', data);
    return response.data;
  },

  // 更新工作站
  async update(id: string, data: UpdateWorkstationData): Promise<Workstation> {
    const response = await api.post('/workstations/update', { id, ...data });
    return response.data;
  },

  // 更新工作站状态
  async updateStatus(id: string, status: WorkstationStatus): Promise<Workstation> {
    const response = await api.post('/workstations/update-status', { id, status });
    return response.data;
  },

  // 删除工作站
  async delete(id: string): Promise<void> {
    await api.post('/workstations/delete', { id });
  },

  // 搜索工作站
  async search(query: string): Promise<Workstation[]> {
    const response = await api.get('/workstations', { params: { search: query } });
    return response.data;
  },
};
