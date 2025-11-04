import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api/v1';

export interface SearchResult {
  type: 'DataCenter' | 'Room' | 'Cabinet' | 'Device' | 'Cable' | 'Panel' | 'Port';
  id: string;
  shortId: number;
  name?: string;
  label?: string;
  description?: string;
  metadata?: any;
}

class SearchService {
  /**
   * 全局搜索
   */
  async globalSearch(query: string): Promise<SearchResult[]> {
    const response = await axios.post(`${API_BASE_URL}/search/global`, { query });
    return response.data;
  }

  /**
   * 根据 shortId 查找实体
   */
  async findByShortId(shortId: number): Promise<SearchResult | null> {
    try {
      const response = await axios.post(`${API_BASE_URL}/search/by-shortid`, { shortId });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * 获取线缆端点信息（用于扫描线缆插头）
   */
  async getCableEndpointsByShortId(shortId: number) {
    try {
      const response = await axios.post(`${API_BASE_URL}/cables/endpoints-by-shortid`, { shortId });
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }
}

export default new SearchService();
