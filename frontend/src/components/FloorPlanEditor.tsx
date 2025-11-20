import React, { useState, useRef, useEffect } from 'react';
import { Card, Button, Space, Typography, message, Tooltip, Tag, Modal, Form, InputNumber } from 'antd';
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
  DesktopOutlined,
  DatabaseOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { FloorPlanData, WorkstationStatus } from '@/types';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

// 默认尺寸（米）
const DEFAULT_ROOM_WIDTH = 10;
const DEFAULT_ROOM_HEIGHT = 8;

// 像素与米的比例
const PIXELS_PER_METER = 50;

// 网格大小（米）
const GRID_SIZE = 1;

// 默认对象尺寸（米）
const DEFAULT_CABINET_SIZE = { width: 0.6, depth: 1.2 };
const DEFAULT_WORKSTATION_SIZE = { width: 1.2, depth: 0.6 };

// 工作站状态颜色
const WORKSTATION_STATUS_COLORS: Record<WorkstationStatus, string> = {
  ONLINE: '#52c41a',
  OFFLINE: '#d9d9d9',
  IN_USE: '#1890ff',
  IDLE: '#faad14',
  MAINTENANCE: '#fa8c16',
  FAULTY: '#f5222d',
};

interface FloorPlanEditorProps {
  data: FloorPlanData;
  onSave?: (updates: {
    roomSize?: { width: number; height: number };
    cabinets?: Array<{ id: string; position: { x: number; y: number } }>;
    workstations?: Array<{ id: string; position: { x: number; y: number } }>;
  }) => void;
  onCabinetClick?: (cabinetId: string) => void;
  onWorkstationClick?: (workstationId: string) => void;
}

export const FloorPlanEditor: React.FC<FloorPlanEditorProps> = ({
  data,
  onSave,
  onCabinetClick,
  onWorkstationClick,
}) => {
  const { t } = useTranslation();
  const svgRef = useRef<SVGSVGElement>(null);

  // 状态
  const [isEditing, setIsEditing] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [draggedItem, setDraggedItem] = useState<{ type: 'cabinet' | 'workstation'; id: string } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [showSettings, setShowSettings] = useState(false);

  // 本地位置状态（用于编辑时的临时存储）
  const [cabinetPositions, setCabinetPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [workstationPositions, setWorkstationPositions] = useState<Record<string, { x: number; y: number }>>({});
  const [roomSize, setRoomSize] = useState({
    width: data.room.floorPlanWidth || DEFAULT_ROOM_WIDTH,
    height: data.room.floorPlanHeight || DEFAULT_ROOM_HEIGHT,
  });

  // 初始化位置
  useEffect(() => {
    const cabPositions: Record<string, { x: number; y: number }> = {};
    data.cabinets.forEach((cabinet, index) => {
      cabPositions[cabinet.id] = cabinet.position || {
        x: 1 + (index % 5) * 1.5,
        y: 1 + Math.floor(index / 5) * 2,
      };
    });
    setCabinetPositions(cabPositions);

    const wsPositions: Record<string, { x: number; y: number }> = {};
    data.workstations.forEach((ws, index) => {
      wsPositions[ws.id] = ws.position || {
        x: 1 + (index % 6) * 1.5,
        y: 5 + Math.floor(index / 6) * 1,
      };
    });
    setWorkstationPositions(wsPositions);
  }, [data]);

  // 计算SVG尺寸
  const svgWidth = roomSize.width * PIXELS_PER_METER * zoom;
  const svgHeight = roomSize.height * PIXELS_PER_METER * zoom;

  // 坐标转换：米 -> 像素
  const toPixels = (meters: number) => meters * PIXELS_PER_METER * zoom;

  // 坐标转换：像素 -> 米
  const toMeters = (pixels: number) => pixels / (PIXELS_PER_METER * zoom);

  // 获取鼠标相对于SVG的位置
  const getMousePosition = (e: React.MouseEvent) => {
    if (!svgRef.current) return { x: 0, y: 0 };
    const rect = svgRef.current.getBoundingClientRect();
    return {
      x: toMeters(e.clientX - rect.left),
      y: toMeters(e.clientY - rect.top),
    };
  };

  // 开始拖拽
  const handleDragStart = (type: 'cabinet' | 'workstation', id: string, e: React.MouseEvent) => {
    if (!isEditing) return;
    e.stopPropagation();

    const pos = type === 'cabinet' ? cabinetPositions[id] : workstationPositions[id];
    const mousePos = getMousePosition(e);

    setDraggedItem({ type, id });
    setDragOffset({
      x: mousePos.x - (pos?.x || 0),
      y: mousePos.y - (pos?.y || 0),
    });
  };

  // 拖拽中
  const handleDrag = (e: React.MouseEvent) => {
    if (!draggedItem) return;

    const mousePos = getMousePosition(e);
    const newPos = {
      x: Math.max(0, Math.min(roomSize.width - 1, mousePos.x - dragOffset.x)),
      y: Math.max(0, Math.min(roomSize.height - 1, mousePos.y - dragOffset.y)),
    };

    // 对齐网格
    newPos.x = Math.round(newPos.x / 0.1) * 0.1;
    newPos.y = Math.round(newPos.y / 0.1) * 0.1;

    if (draggedItem.type === 'cabinet') {
      setCabinetPositions(prev => ({ ...prev, [draggedItem.id]: newPos }));
    } else {
      setWorkstationPositions(prev => ({ ...prev, [draggedItem.id]: newPos }));
    }
  };

  // 结束拖拽
  const handleDragEnd = () => {
    setDraggedItem(null);
  };

  // 保存更改
  const handleSave = () => {
    if (onSave) {
      onSave({
        roomSize,
        cabinets: Object.entries(cabinetPositions).map(([id, position]) => ({ id, position })),
        workstations: Object.entries(workstationPositions).map(([id, position]) => ({ id, position })),
      });
    }
    setIsEditing(false);
    message.success(t('common.saveSuccess', 'Save successful'));
  };

  // 取消编辑
  const handleCancel = () => {
    // 重置位置
    const cabPositions: Record<string, { x: number; y: number }> = {};
    data.cabinets.forEach((cabinet, index) => {
      cabPositions[cabinet.id] = cabinet.position || {
        x: 1 + (index % 5) * 1.5,
        y: 1 + Math.floor(index / 5) * 2,
      };
    });
    setCabinetPositions(cabPositions);

    const wsPositions: Record<string, { x: number; y: number }> = {};
    data.workstations.forEach((ws, index) => {
      wsPositions[ws.id] = ws.position || {
        x: 1 + (index % 6) * 1.5,
        y: 5 + Math.floor(index / 6) * 1,
      };
    });
    setWorkstationPositions(wsPositions);

    setIsEditing(false);
  };

  // 渲染网格
  const renderGrid = () => {
    const lines = [];

    // 垂直线
    for (let x = 0; x <= roomSize.width; x += GRID_SIZE) {
      lines.push(
        <line
          key={`v-${x}`}
          x1={toPixels(x)}
          y1={0}
          x2={toPixels(x)}
          y2={toPixels(roomSize.height)}
          stroke="#e0e0e0"
          strokeWidth={x % 5 === 0 ? 1 : 0.5}
        />
      );
    }

    // 水平线
    for (let y = 0; y <= roomSize.height; y += GRID_SIZE) {
      lines.push(
        <line
          key={`h-${y}`}
          x1={0}
          y1={toPixels(y)}
          x2={toPixels(roomSize.width)}
          y2={toPixels(y)}
          stroke="#e0e0e0"
          strokeWidth={y % 5 === 0 ? 1 : 0.5}
        />
      );
    }

    return lines;
  };

  // 渲染机柜
  const renderCabinet = (cabinet: FloorPlanData['cabinets'][0]) => {
    const pos = cabinetPositions[cabinet.id];
    if (!pos) return null;

    const size = cabinet.size || DEFAULT_CABINET_SIZE;
    const x = toPixels(pos.x);
    const y = toPixels(pos.y);
    const width = toPixels(size.width);
    const height = toPixels(size.depth);

    return (
      <g
        key={cabinet.id}
        style={{ cursor: isEditing ? 'move' : 'pointer' }}
        onMouseDown={(e) => handleDragStart('cabinet', cabinet.id, e)}
        onClick={() => !isEditing && onCabinetClick?.(cabinet.id)}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill="#1890ff"
          stroke="#096dd9"
          strokeWidth={2}
          rx={2}
        />
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={10 * zoom}
          fontWeight="bold"
        >
          {cabinet.shortId || cabinet.name.substring(0, 4)}
        </text>
        {cabinet.deviceCount > 0 && (
          <text
            x={x + width / 2}
            y={y + height - 4 * zoom}
            textAnchor="middle"
            fill="white"
            fontSize={8 * zoom}
          >
            {cabinet.deviceCount}
          </text>
        )}
      </g>
    );
  };

  // 渲染工作站
  const renderWorkstation = (ws: FloorPlanData['workstations'][0]) => {
    const pos = workstationPositions[ws.id];
    if (!pos) return null;

    const size = ws.size || DEFAULT_WORKSTATION_SIZE;
    const x = toPixels(pos.x);
    const y = toPixels(pos.y);
    const width = toPixels(size.width);
    const height = toPixels(size.depth);
    const statusColor = WORKSTATION_STATUS_COLORS[ws.status] || '#d9d9d9';

    return (
      <g
        key={ws.id}
        style={{ cursor: isEditing ? 'move' : 'pointer' }}
        onMouseDown={(e) => handleDragStart('workstation', ws.id, e)}
        onClick={() => !isEditing && onWorkstationClick?.(ws.id)}
      >
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={statusColor}
          stroke="#333"
          strokeWidth={1}
          rx={2}
        />
        <text
          x={x + width / 2}
          y={y + height / 2 - 4 * zoom}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="white"
          fontSize={9 * zoom}
          fontWeight="bold"
        >
          {ws.code || ws.name.substring(0, 6)}
        </text>
        {ws.assignedTo && (
          <text
            x={x + width / 2}
            y={y + height / 2 + 6 * zoom}
            textAnchor="middle"
            fill="white"
            fontSize={7 * zoom}
          >
            {ws.assignedTo.substring(0, 8)}
          </text>
        )}
      </g>
    );
  };

  return (
    <Card
      title={
        <Space>
          <Title level={5} style={{ margin: 0 }}>{data.room.name} - {t('floorPlan.title', 'Floor Plan')}</Title>
          <Tag>{roomSize.width}m x {roomSize.height}m</Tag>
        </Space>
      }
      extra={
        <Space>
          <Button
            icon={<ZoomOutOutlined />}
            onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
            disabled={zoom <= 0.5}
          />
          <Text>{Math.round(zoom * 100)}%</Text>
          <Button
            icon={<ZoomInOutlined />}
            onClick={() => setZoom(Math.min(2, zoom + 0.25))}
            disabled={zoom >= 2}
          />
          {isEditing ? (
            <>
              <Button icon={<SettingOutlined />} onClick={() => setShowSettings(true)}>
                {t('floorPlan.roomSize', 'Room Size')}
              </Button>
              <Button icon={<SaveOutlined />} type="primary" onClick={handleSave}>
                {t('common.save', 'Save')}
              </Button>
              <Button icon={<CloseOutlined />} onClick={handleCancel}>
                {t('common.cancel', 'Cancel')}
              </Button>
            </>
          ) : (
            <Button icon={<EditOutlined />} onClick={() => setIsEditing(true)}>
              {t('common.edit', 'Edit')}
            </Button>
          )}
        </Space>
      }
    >
      {/* 图例 */}
      <Space style={{ marginBottom: 16 }}>
        <Space>
          <DatabaseOutlined style={{ color: '#1890ff' }} />
          <Text>{t('floorPlan.cabinet', 'Cabinet')} ({data.cabinets.length})</Text>
        </Space>
        <Space>
          <DesktopOutlined style={{ color: '#52c41a' }} />
          <Text>{t('floorPlan.workstation', 'Workstation')} ({data.workstations.length})</Text>
        </Space>
      </Space>

      {/* SVG 画布 */}
      <div style={{ overflow: 'auto', border: '1px solid #d9d9d9', borderRadius: 4 }}>
        <svg
          ref={svgRef}
          width={svgWidth}
          height={svgHeight}
          style={{ background: '#fafafa' }}
          onMouseMove={handleDrag}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          {/* 网格 */}
          {renderGrid()}

          {/* 机柜 */}
          {data.cabinets.map(renderCabinet)}

          {/* 工作站 */}
          {data.workstations.map(renderWorkstation)}
        </svg>
      </div>

      {/* 机房尺寸设置弹窗 */}
      <Modal
        title={t('floorPlan.roomSize', 'Room Size')}
        open={showSettings}
        onOk={() => setShowSettings(false)}
        onCancel={() => setShowSettings(false)}
      >
        <Form layout="vertical">
          <Form.Item label={t('floorPlan.width', 'Width') + ' (m)'}>
            <InputNumber
              min={5}
              max={100}
              value={roomSize.width}
              onChange={(value) => setRoomSize(prev => ({ ...prev, width: value || DEFAULT_ROOM_WIDTH }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
          <Form.Item label={t('floorPlan.height', 'Height') + ' (m)'}>
            <InputNumber
              min={5}
              max={100}
              value={roomSize.height}
              onChange={(value) => setRoomSize(prev => ({ ...prev, height: value || DEFAULT_ROOM_HEIGHT }))}
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default FloorPlanEditor;
