import React from 'react';
import { Panel, Port, PortStatus } from '@/types';
import { Tooltip } from 'antd';
import './PanelVisualizer.css';

interface PanelVisualizerProps {
  panel: Panel;
  ports: Port[];
  onPortClick?: (port: Port) => void;
  scale?: number; // 缩放比例，默认 1mm = 1px
}

// 端口状态颜色映射
const portStatusColors: Record<PortStatus, string> = {
  AVAILABLE: '#52c41a',    // 绿色 - 可用
  OCCUPIED: '#f5222d',     // 红色 - 已占用
  RESERVED: '#faad14',     // 黄色 - 预留
  FAULTY: '#8c8c8c',       // 灰色 - 故障
};

// 端口状态中文
const portStatusLabels: Record<PortStatus, string> = {
  AVAILABLE: '可用',
  OCCUPIED: '已占用',
  RESERVED: '预留',
  FAULTY: '故障',
};

export const PanelVisualizer: React.FC<PanelVisualizerProps> = ({
  panel,
  ports,
  onPortClick,
  scale = 1,
}) => {
  // 默认使用标准 1U 尺寸（19 英寸机架）
  const panelWidth = panel.size?.width || 482.6;
  const panelHeight = panel.size?.height || 44.45;

  // SVG 画布尺寸（添加边距）
  const padding = 20;
  const viewBoxWidth = panelWidth + padding * 2;
  const viewBoxHeight = panelHeight + padding * 2;

  // 渲染单个端口
  const renderPort = (port: Port) => {
    if (!port.position || !port.size) {
      return null;
    }

    const { x, y } = port.position;
    const { width, height } = port.size;
    const color = portStatusColors[port.status];

    return (
      <Tooltip
        key={port.id}
        title={
          <div>
            <div><strong>{port.label || `端口 ${port.number}`}</strong></div>
            <div>编号: {port.number}</div>
            <div>状态: {portStatusLabels[port.status]}</div>
            {port.ipAddress && <div>IP: {port.ipAddress}</div>}
            {port.vlan && <div>VLAN: {port.vlan}</div>}
            {port.speed && <div>速率: {port.speed}</div>}
          </div>
        }
      >
        <g
          className="port"
          onClick={() => onPortClick?.(port)}
          style={{ cursor: onPortClick ? 'pointer' : 'default' }}
        >
          {/* 端口矩形 */}
          <rect
            x={padding + x}
            y={padding + y}
            width={width}
            height={height}
            fill={color}
            stroke="#333"
            strokeWidth="1"
            className="port-rect"
          />
          {/* 端口编号 */}
          <text
            x={padding + x + width / 2}
            y={padding + y + height / 2}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#fff"
            fontSize="12"
            fontWeight="bold"
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {port.number}
          </text>
        </g>
      </Tooltip>
    );
  };

  return (
    <div className="panel-visualizer">
      <div className="panel-header">
        <h3>{panel.name}</h3>
        <div className="panel-info">
          尺寸: {panelWidth} × {panelHeight} mm
        </div>
      </div>

      <svg
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
        width={viewBoxWidth * scale}
        height={viewBoxHeight * scale}
        className="panel-svg"
      >
        {/* 面板背景 */}
        <rect
          x={padding}
          y={padding}
          width={panelWidth}
          height={panelHeight}
          fill={panel.backgroundColor || '#f5f5f5'}
          stroke="#d9d9d9"
          strokeWidth="2"
          rx="4"
        />

        {/* 如果有 SVG 路径，渲染 SVG */}
        {panel.svgPath && (
          <g transform={`translate(${padding}, ${padding})`}>
            <image
              href={panel.svgPath}
              width={panelWidth}
              height={panelHeight}
            />
          </g>
        )}

        {/* 如果有图片，渲染图片 */}
        {panel.image && !panel.svgPath && (
          <image
            href={panel.image}
            x={padding}
            y={padding}
            width={panelWidth}
            height={panelHeight}
            preserveAspectRatio="xMidYMid meet"
          />
        )}

        {/* 渲染所有端口 */}
        {ports.map(renderPort)}

        {/* 网格线（可选，帮助对齐） */}
        {/* <defs>
          <pattern
            id="grid"
            width="50"
            height="50"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 50 0 L 0 0 0 50"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect
          x={padding}
          y={padding}
          width={panelWidth}
          height={panelHeight}
          fill="url(#grid)"
        /> */}
      </svg>

      {/* 图例 */}
      <div className="panel-legend">
        {Object.entries(portStatusColors).map(([status, color]) => (
          <div key={status} className="legend-item">
            <span
              className="legend-color"
              style={{ backgroundColor: color }}
            />
            <span className="legend-label">
              {portStatusLabels[status as PortStatus]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
