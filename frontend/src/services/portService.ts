import api from './api';
import { Port, PortStatus } from '@/types';

export const portService = {
  // 获取所有端口
  async getAll(panelId?: string, status?: PortStatus): Promise<Port[]> {
    const params: any = {};
    if (panelId) params.panelId = panelId;
    if (status) params.status = status;
    const response = await api.get('/ports', { params });
    return response.data;
  },

  // 获取端口详情
  async getById(id: string): Promise<Port> {
    const response = await api.post('/ports/get', { id });
    return response.data;
  },

  // 创建端口
  async create(data: Partial<Port>): Promise<Port> {
    const response = await api.post('/ports/create', data);
    return response.data;
  },

  // 批量创建端口
  async createBulk(panelId: string, count: number, prefix?: string, useCustomPrefix?: boolean): Promise<{ count: number }> {
    const response = await api.post('/ports/create-bulk', { panelId, count, prefix, useCustomPrefix });
    return response.data;
  },

  // 更新端口
  async update(id: string, data: Partial<Port>): Promise<Port> {
    const response = await api.post('/ports/update', { id, ...data });
    return response.data;
  },

  // 更新端口状态
  async updateStatus(id: string, status: PortStatus): Promise<Port> {
    const response = await api.post('/ports/update-status', { id, status });
    return response.data;
  },

  // 删除端口
  async delete(id: string): Promise<void> {
    await api.post('/ports/delete', { id });
  },

  // 搜索端口
  async search(query: string): Promise<Port[]> {
    const response = await api.get('/ports', { params: { search: query } });
    return response.data;
  },

  // 按面板获取端口
  async getByPanel(panelId: string): Promise<Port[]> {
    return this.getAll(panelId);
  },

  // 按状态获取端口
  async getByStatus(status: PortStatus): Promise<Port[]> {
    return this.getAll(undefined, status);
  },

  // 获取面板的可用端口
  async getAvailablePorts(panelId: string): Promise<Port[]> {
    const response = await api.post('/ports/available', { panelId });
    return response.data;
  },

  // 通过shortId获取端口
  async getByShortId(shortId: number): Promise<Port> {
    const response = await api.post('/ports/by-shortid', { shortId });
    return response.data;
  },
};
