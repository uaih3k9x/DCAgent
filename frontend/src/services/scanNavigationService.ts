import searchService from './searchService';
import { NavigateFunction } from 'react-router-dom';

export interface ScanNavigationResult {
  success: boolean;
  path?: string;
  message?: string;
}

class ScanNavigationService {
  /**
   * 根据 shortId 扫码跳转
   * @param shortIdInput 扫描的 shortId 输入（支持 E-00001 或纯数字格式）
   * @param navigate React Router 的 navigate 函数
   */
  async navigateByScan(
    shortIdInput: string,
    navigate: NavigateFunction
  ): Promise<ScanNavigationResult> {
    try {
      // 格式化输入
      const shortId = this.formatShortIdInput(shortIdInput);
      if (shortId === null) {
        return {
          success: false,
          message: `无效的 shortId 格式: ${shortIdInput}（应为 E-00001 或纯数字）`,
        };
      }

      // 查找实体
      const result = await searchService.findByShortId(shortId);

      if (!result) {
        return {
          success: false,
          message: `未找到 shortId: E-${String(shortId).padStart(5, '0')} 对应的实体`,
        };
      }

      let targetPath = '';

      switch (result.type) {
        case 'Room':
          // 机房 → 跳转到机柜列表，筛选该机房
          targetPath = `/cabinets?roomId=${result.id}`;
          break;

        case 'Cabinet':
          // 机柜 → 跳转到机柜可视化视图
          targetPath = `/cabinets?cabinetId=${result.id}&tab=visual`;
          break;

        case 'Panel':
          // 面板 → 跳转到端口管理页面的 Visual Tab
          targetPath = `/ports?panelId=${result.id}&tab=visual`;
          break;

        case 'Cable':
          // 线缆端点 → 查找连接的端口，跳转到端口管理页面
          const endpointData = await searchService.getCableEndpointsByShortId(shortId);

          if (!endpointData || !endpointData.endpoint) {
            return {
              success: false,
              message: '线缆端点信息不完整',
            };
          }

          // 检查是否已连接到端口
          if (endpointData.endpoint.portId) {
            const port = endpointData.endpoint.port;
            if (port && port.panelId) {
              targetPath = `/ports?panelId=${port.panelId}&highlightPortId=${port.id}&tab=visual`;
            } else {
              return {
                success: false,
                message: '端口未关联面板',
              };
            }
          } else {
            // 线缆未连接，跳转到线缆盘点页面
            targetPath = `/cable-manual-inventory?cableId=${endpointData.cable.id}`;
          }
          break;

        case 'Port':
        case 'Device':
        case 'DataCenter':
          // 这些实体不应该有 shortID
          return {
            success: false,
            message: `${result.type} 不支持扫码（仅支持：机房、机柜、面板、线缆端点）`,
          };

        default:
          return {
            success: false,
            message: `不支持的实体类型: ${result.type}`,
          };
      }

      // 执行跳转
      navigate(targetPath);

      return {
        success: true,
        path: targetPath,
        message: `跳转到 ${result.type}: ${result.name || result.label || result.id}`,
      };
    } catch (error: any) {
      console.error('Scan navigation error:', error);
      return {
        success: false,
        message: error.message || '扫码跳转失败',
      };
    }
  }

  /**
   * 格式化 shortId 输入（支持 E-00001 或纯数字格式）
   */
  formatShortIdInput(input: string): number | null {
    const trimmed = input.trim();

    // 匹配 E-00001 格式
    const prefixMatch = trimmed.match(/^E-(\d+)$/i);
    if (prefixMatch) {
      return parseInt(prefixMatch[1], 10);
    }

    // 匹配纯数字格式
    const numericMatch = trimmed.match(/^\d+$/);
    if (numericMatch) {
      return parseInt(trimmed, 10);
    }

    return null;
  }
}

export default new ScanNavigationService();
