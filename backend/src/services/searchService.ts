import dataCenterService from './dataCenterService';
import roomService from './roomService';
import cabinetService from './cabinetService';
import deviceService from './deviceService';
import cableService from './cableService';
import panelService from './panelService';
import portService from './portService';

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
   * 全局搜索 - 在所有实体中搜索关键词
   */
  async globalSearch(query: string): Promise<SearchResult[]> {
    const results: SearchResult[] = [];

    try {
      // 搜索数据中心
      const dataCenters = await dataCenterService.searchDataCenters(query);
      results.push(
        ...dataCenters.map((dc) => ({
          type: 'DataCenter' as const,
          id: dc.id,
          shortId: dc.shortId,
          name: dc.name,
          description: dc.location || undefined,
          metadata: { location: dc.location },
        }))
      );

      // 搜索机房
      const rooms = await roomService.searchRooms(query);
      results.push(
        ...rooms.map((room) => ({
          type: 'Room' as const,
          id: room.id,
          shortId: room.shortId,
          name: room.name,
          description: room.floor || undefined,
          metadata: { floor: room.floor, dataCenterId: room.dataCenterId },
        }))
      );

      // 搜索机柜
      const cabinets = await cabinetService.searchCabinets(query);
      results.push(
        ...cabinets.map((cabinet) => ({
          type: 'Cabinet' as const,
          id: cabinet.id,
          shortId: cabinet.shortId,
          name: cabinet.name,
          description: cabinet.position || undefined,
          metadata: {
            position: cabinet.position,
            height: cabinet.height,
            roomId: cabinet.roomId,
          },
        }))
      );

      // 搜索设备
      const devices = await deviceService.searchDevices(query);
      results.push(
        ...devices.map((device) => ({
          type: 'Device' as const,
          id: device.id,
          shortId: device.shortId,
          name: device.name,
          description: `${device.type}${device.model ? ` - ${device.model}` : ''}`,
          metadata: {
            type: device.type,
            model: device.model,
            serialNo: device.serialNo,
            cabinetId: device.cabinetId,
          },
        }))
      );

      // 搜索线缆
      const cables = await cableService.searchCables(query);
      results.push(
        ...cables.map((cable) => ({
          type: 'Cable' as const,
          id: cable.id,
          shortId: cable.shortId,
          label: cable.label || undefined,
          description: `${cable.type}${cable.color ? ` - ${cable.color}` : ''}`,
          metadata: {
            type: cable.type,
            color: cable.color,
            length: cable.length,
            notes: cable.notes,
          },
        }))
      );

      // 搜索面板
      const panels = await panelService.searchPanels(query);
      results.push(
        ...panels.map((panel) => ({
          type: 'Panel' as const,
          id: panel.id,
          shortId: panel.shortId,
          name: panel.name,
          description: panel.type,
          metadata: {
            type: panel.type,
            portCount: panel.portCount,
            deviceId: panel.deviceId,
          },
        }))
      );

      // 搜索端口
      const ports = await portService.searchPorts(query);
      results.push(
        ...ports.map((port) => ({
          type: 'Port' as const,
          id: port.id,
          shortId: port.shortId,
          name: port.name,
          description: `${port.type} - ${port.status}`,
          metadata: {
            type: port.type,
            status: port.status,
            position: port.position,
            panelId: port.panelId,
          },
        }))
      );
    } catch (error) {
      console.error('Error in global search:', error);
      throw error;
    }

    return results;
  }

  /**
   * 根据 shortId 查找实体
   * 依次在所有实体类型中查找，返回第一个匹配的结果
   */
  async findByShortId(shortId: number): Promise<SearchResult | null> {
    try {
      // 尝试在数据中心中查找
      const dataCenter = await dataCenterService.getDataCenterByShortId(shortId);
      if (dataCenter) {
        return {
          type: 'DataCenter',
          id: dataCenter.id,
          shortId: dataCenter.shortId,
          name: dataCenter.name,
          description: dataCenter.location || undefined,
          metadata: dataCenter,
        };
      }

      // 尝试在机房中查找
      const room = await roomService.getRoomByShortId(shortId);
      if (room) {
        return {
          type: 'Room',
          id: room.id,
          shortId: room.shortId,
          name: room.name,
          description: room.floor || undefined,
          metadata: room,
        };
      }

      // 尝试在机柜中查找
      const cabinet = await cabinetService.getCabinetByShortId(shortId);
      if (cabinet) {
        return {
          type: 'Cabinet',
          id: cabinet.id,
          shortId: cabinet.shortId,
          name: cabinet.name,
          description: cabinet.position || undefined,
          metadata: cabinet,
        };
      }

      // 尝试在设备中查找
      const device = await deviceService.getDeviceByShortId(shortId);
      if (device) {
        return {
          type: 'Device',
          id: device.id,
          shortId: device.shortId,
          name: device.name,
          description: `${device.type}${device.model ? ` - ${device.model}` : ''}`,
          metadata: device,
        };
      }

      // 尝试在线缆中查找
      const cable = await cableService.getCableByShortId(shortId);
      if (cable) {
        return {
          type: 'Cable',
          id: cable.id,
          shortId: cable.shortId,
          label: cable.label || undefined,
          description: `${cable.type}${cable.color ? ` - ${cable.color}` : ''}`,
          metadata: cable,
        };
      }

      // 尝试在面板中查找
      const panel = await panelService.getPanelByShortId(shortId);
      if (panel) {
        return {
          type: 'Panel',
          id: panel.id,
          shortId: panel.shortId,
          name: panel.name,
          description: panel.type,
          metadata: panel,
        };
      }

      // 尝试在端口中查找
      const port = await portService.getPortByShortId(shortId);
      if (port) {
        return {
          type: 'Port',
          id: port.id,
          shortId: port.shortId,
          name: port.name,
          description: `${port.type} - ${port.status}`,
          metadata: port,
        };
      }

      return null;
    } catch (error) {
      console.error('Error finding by shortId:', error);
      throw error;
    }
  }
}

export default new SearchService();
