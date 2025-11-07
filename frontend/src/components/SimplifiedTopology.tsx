import React, { useEffect, useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Panel, Port, Device } from '@/types';
import { cableService } from '@/services/cableService';
import { panelService } from '@/services/panelService';
import { deviceService } from '@/services/deviceService';
import { Spin, Empty, message, Modal, Tooltip } from 'antd';
import './SimplifiedTopology.css';

interface SimplifiedTopologyProps {
  panel: Panel;
  highlightedPortId?: string;
  onPortHover?: (port: Port | null) => void;
}

// 线缆类型颜色映射
const cableTypeColors: Record<string, string> = {
  CAT5E: '#52c41a',
  CAT6: '#1890ff',
  CAT6A: '#722ed1',
  CAT7: '#eb2f96',
  FIBER_SM: '#fa8c16',
  FIBER_MM: '#faad14',
  QSFP_TO_SFP: '#13c2c2',
  QSFP_TO_QSFP: '#2f54eb',
  SFP_TO_SFP: '#1890ff',
  POWER: '#f5222d',
  OTHER: '#8c8c8c',
};

// 自定义节点组件
const DeviceNode = ({ data }: any) => {
  const { panel, device, ports, isCenter, highlightedPortId } = data;

  return (
    <div
      className={`device-node ${isCenter ? 'center-node' : 'neighbor-node'}`}
      style={{
        border: isCenter ? '3px solid #1890ff' : '2px solid #d9d9d9',
        borderRadius: '8px',
        padding: '12px',
        background: '#fff',
        minWidth: '200px',
        boxShadow: isCenter
          ? '0 4px 12px rgba(24, 144, 255, 0.3)'
          : '0 2px 8px rgba(0,0,0,0.1)',
      }}
    >
      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
        {device?.name || '未知设备'}
      </div>
      <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>
        {panel.name}
      </div>
      <div style={{ fontSize: '11px', color: '#999' }}>
        {ports.length} 个端口
      </div>

      {/* 显示端口列表（简化版） */}
      {ports.length > 0 && (
        <div style={{ marginTop: '8px', maxHeight: '150px', overflowY: 'auto' }}>
          {ports.slice(0, 10).map((port: Port) => {
            const isHighlighted = highlightedPortId === port.id;
            return (
              <Tooltip key={port.id} title={`${port.label || port.number} - ${port.status}`}>
                <div
                  style={{
                    fontSize: '10px',
                    padding: '2px 4px',
                    margin: '2px 0',
                    background: isHighlighted ? '#e6f7ff' : port.status === 'OCCUPIED' ? '#fff1f0' : '#f6ffed',
                    borderRadius: '2px',
                    border: isHighlighted ? '1px solid #1890ff' : 'none',
                    fontWeight: isHighlighted ? 'bold' : 'normal',
                  }}
                >
                  {port.status === 'OCCUPIED' ? '●' : '○'} {port.number}
                </div>
              </Tooltip>
            );
          })}
          {ports.length > 10 && (
            <div style={{ fontSize: '10px', color: '#999', padding: '2px 4px' }}>
              ...还有 {ports.length - 10} 个端口
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  device: DeviceNode,
};

export const SimplifiedTopology: React.FC<SimplifiedTopologyProps> = ({
  panel,
  highlightedPortId,
  onPortHover,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [loading, setLoading] = useState(false);
  const [centerDevice, setCenterDevice] = useState<Device | null>(null);

  // 加载拓扑数据
  const loadTopology = useCallback(async () => {
    if (!panel) return;

    setLoading(true);
    try {
      // 1. 获取中心面板的设备信息
      const device = await deviceService.getById(panel.deviceId);
      setCenterDevice(device);

      // 2. 获取中心面板的所有端口
      const centerPorts = await panelService.getPorts(panel.id);

      // 3. 获取面板的连接关系
      const connections = await cableService.getPanelConnections(panel.id);

      // 4. 构建节点和边
      const newNodes: Node[] = [];
      const newEdges: Edge[] = [];
      const connectedPanelIds = new Set<string>();

      // 添加中心节点
      newNodes.push({
        id: panel.id,
        type: 'device',
        position: { x: 400, y: 200 },
        data: {
          panel,
          device,
          ports: centerPorts,
          isCenter: true,
          highlightedPortId,
        },
      });

      // 遍历连接，添加相邻面板节点和边
      for (let i = 0; i < connections.length; i++) {
        const conn = connections[i];
        const neighborPanelId = conn.panelB.id;

        if (!connectedPanelIds.has(neighborPanelId)) {
          connectedPanelIds.add(neighborPanelId);

          // 加载相邻面板的信息
          const neighborPanel = await panelService.getById(neighborPanelId);
          const neighborDevice = conn.panelB.deviceId
            ? await deviceService.getById(conn.panelB.deviceId)
            : null;
          const neighborPorts = await panelService.getPorts(neighborPanelId);

          // 计算相邻节点的位置（围绕中心节点圆形分布）
          const angle = (i / connections.length) * 2 * Math.PI;
          const radius = 350;
          const x = 400 + radius * Math.cos(angle);
          const y = 200 + radius * Math.sin(angle);

          newNodes.push({
            id: neighborPanelId,
            type: 'device',
            position: { x, y },
            data: {
              panel: neighborPanel,
              device: neighborDevice,
              ports: neighborPorts,
              isCenter: false,
            },
          });
        }

        // 添加连接边
        const cableColor = cableTypeColors[conn.cable.type] || '#8c8c8c';
        newEdges.push({
          id: conn.cable.id,
          source: panel.id,
          target: neighborPanelId,
          type: 'default',
          animated: true,
          style: {
            stroke: cableColor,
            strokeWidth: 2,
          },
          label: conn.cable.label || conn.cable.type,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: cableColor,
          },
          data: {
            cable: conn.cable,
            portA: conn.portA,
            portB: conn.portB,
          },
        });
      }

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error: any) {
      console.error('加载拓扑失败:', error);
      message.error('加载拓扑失败');
    } finally {
      setLoading(false);
    }
  }, [panel, highlightedPortId]);

  useEffect(() => {
    loadTopology();
  }, [loadTopology]);

  // 边点击事件
  const onEdgeClick = useCallback((event: any, edge: Edge) => {
    const { cable, portA, portB } = edge.data;
    Modal.info({
      title: '线缆信息',
      width: 500,
      content: (
        <div>
          <p><strong>标签:</strong> {cable.label || '无'}</p>
          <p><strong>类型:</strong> {cable.type}</p>
          <p><strong>颜色:</strong> {cable.color || '无'}</p>
          <p><strong>长度:</strong> {cable.length ? `${cable.length}m` : '未知'}</p>
          <hr />
          <p><strong>端口 A:</strong> {portA.number} ({portA.label || '无标签'})</p>
          <p><strong>端口 B:</strong> {portB.number} ({portB.label || '无标签'})</p>
        </div>
      ),
    });
  }, []);

  if (!panel) {
    return <Empty description="请先选择一个面板" />;
  }

  return (
    <div className="simplified-topology-container" style={{ height: '500px', position: 'relative' }}>
      {loading && (
        <div className="loading-overlay" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(255,255,255,0.8)',
          zIndex: 1000,
        }}>
          <Spin size="large" tip="加载拓扑中..." />
        </div>
      )}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.5}
        maxZoom={1.5}
      >
        <Background />
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            return node.data.isCenter ? '#1890ff' : '#d9d9d9';
          }}
          maskColor="rgba(0,0,0,0.1)"
        />
      </ReactFlow>
    </div>
  );
};
