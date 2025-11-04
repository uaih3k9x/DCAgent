import { NavigateFunction } from 'react-router-dom';
import { SearchResult } from '../services/searchService';

/**
 * 根据搜索结果类型和数据智能跳转到对应页面
 */
export function navigateToEntity(
  result: SearchResult,
  navigate: NavigateFunction,
  options?: {
    openInNewTab?: boolean;
  }
) {
  const { type, id, metadata } = result;
  let path = '/';
  let state: any = {};

  switch (type) {
    case 'DataCenter':
      path = '/datacenters';
      state = { selectedId: id };
      break;

    case 'Room':
      path = '/rooms';
      state = { selectedId: id };
      break;

    case 'Cabinet':
      // 跳转到机柜列表页的可视化tab
      path = '/cabinets';
      state = {
        selectedId: id,
        activeTab: 'visual', // 直接跳转到可视化tab
      };
      break;

    case 'Device':
      // 跳转到设备所在机柜的可视化视图，并定位到该设备的U位
      if (metadata?.cabinetId) {
        path = '/cabinets';
        state = {
          activeTab: 'visual',
          selectedCabinetId: metadata.cabinetId,
          selectedDeviceId: id,
          showDevicePanels: true, // 显示设备的面板视图
        };
      } else {
        // 如果没有机柜信息，降级到设备列表页（仅用于直接访问URL）
        path = '/devices';
        state = { selectedId: id };
      }
      break;

    case 'Panel':
      // 跳转到面板所在设备的机柜可视化视图，并显示面板详情
      if (metadata?.deviceId && metadata?.cabinetId) {
        path = '/cabinets';
        state = {
          activeTab: 'visual',
          selectedCabinetId: metadata.cabinetId,
          selectedDeviceId: metadata.deviceId,
          selectedPanelId: id,
          showDevicePanels: true,
        };
      } else {
        // 降级方案：跳转到端口管理页
        path = '/ports';
        state = {
          activeTab: 'visual',
          selectedPanelId: id,
        };
      }
      break;

    case 'Port':
      // 端口搜索：跳转到端口详情页，显示双面板视图（本端和对端）
      path = '/port-detail';
      state = {
        portId: id,
        panelId: metadata?.panelId,
      };
      break;

    case 'Cable':
      // 线缆搜索：跳转到端口详情页，显示两端连接
      path = '/port-detail';
      state = {
        cableId: id,
      };
      break;

    default:
      console.warn('Unknown entity type:', type);
      return null;
  }

  if (options?.openInNewTab) {
    window.open(`${window.location.origin}${path}`, '_blank');
  } else {
    navigate(path, { state });
  }

  return path;
}

/**
 * 处理线缆扫码跳转
 * 扫描线缆插头后，跳转到端口所在的面板可视化页面并高亮端口
 */
export function navigateToCableEndpoint(
  endpoints: any,
  navigate: NavigateFunction,
  preferredEnd?: 'A' | 'B'
) {
  if (!endpoints) {
    return null;
  }

  // 优先选择 portA 或根据 preferredEnd 参数选择
  const targetPort = preferredEnd === 'B' && endpoints.portB
    ? endpoints.portB
    : endpoints.portA || endpoints.portB;

  if (!targetPort) {
    console.warn('No valid port endpoint found for cable');
    return null;
  }

  const panelId = targetPort.panel?.id;
  if (!panelId) {
    console.warn('No panel information found for port');
    return null;
  }

  // 跳转到端口管理页的可视化tab，并高亮显示该端口
  navigate('/ports', {
    state: {
      activeTab: 'visual',
      selectedPanelId: panelId,
      highlightPortId: targetPort.id,
      cableInfo: endpoints.cable, // 传递线缆信息用于显示
    },
  });

  return targetPort;
}

/**
 * 格式化搜索结果显示文本
 */
export function formatSearchResultLabel(result: SearchResult): string {
  const { type, name, label, description, shortId } = result;

  const displayName = name || label || `${type} #${shortId}`;
  const typeLabel = getEntityTypeLabel(type);

  if (description) {
    return `[${typeLabel}] ${displayName} - ${description}`;
  }

  return `[${typeLabel}] ${displayName}`;
}

/**
 * 获取实体类型的中文标签
 */
export function getEntityTypeLabel(type: SearchResult['type']): string {
  const labels: Record<SearchResult['type'], string> = {
    DataCenter: '数据中心',
    Room: '机房',
    Cabinet: '机柜',
    Device: '设备',
    Panel: '面板',
    Port: '端口',
    Cable: '线缆',
  };

  return labels[type] || type;
}

/**
 * 构建搜索结果的唯一key
 */
export function getSearchResultKey(result: SearchResult): string {
  return `${result.type}-${result.id}`;
}
