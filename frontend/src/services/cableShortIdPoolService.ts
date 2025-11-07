import api from './api';

export interface PoolStats {
  total: number;
  available: number;
  inUse: number;
  reserved: number;
  cancelled: number;
}

export interface PoolRecord {
  id: string;
  shortId: number;
  status: 'AVAILABLE' | 'IN_USE' | 'RESERVED' | 'CANCELLED';
  cableId?: string;
  cable?: {
    id: string;
    label?: string;
    type: string;
    inventoryStatus: string;
  };
  allocatedAt: string;
  usedAt?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const cableShortIdPoolService = {
  // 批量生成shortID
  async generateShortIds(count: number, notes?: string): Promise<{
    success: boolean;
    message: string;
    shortIds: number[];
  }> {
    const response = await api.post('/cable-shortid-pool/generate', { count, notes });
    return response.data;
  },

  // 检查shortID是否已存在
  async checkShortIdExists(shortId: number): Promise<{
    exists: boolean;
    usedBy: 'cable' | 'pool' | null;
    details?: any;
  }> {
    const response = await api.post('/cable-shortid-pool/check', { shortId });
    return response.data;
  },

  // 获取可用shortID列表
  async getAvailableShortIds(limit?: number): Promise<{
    success: boolean;
    count: number;
    shortIds: number[];
  }> {
    const response = await api.post('/cable-shortid-pool/available', { limit });
    return response.data;
  },

  // 作废shortID
  async cancelShortId(shortId: number, reason?: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.post('/cable-shortid-pool/cancel', { shortId, reason });
    return response.data;
  },

  // 获取池统计信息
  async getPoolStats(): Promise<PoolStats> {
    const response = await api.get('/cable-shortid-pool/stats');
    return response.data;
  },

  // 获取池记录（分页）
  async getPoolRecords(page = 1, pageSize = 50): Promise<{
    records: PoolRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  }> {
    const response = await api.post('/cable-shortid-pool/records', { page, pageSize });
    return response.data;
  },
};
