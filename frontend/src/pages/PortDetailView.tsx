import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, Spin, Alert, Descriptions, Tag, Button, Row, Col, Divider, Typography } from 'antd';
import { ArrowLeftOutlined, SwapOutlined } from '@ant-design/icons';
import { cableService } from '../services/cableService';
import { portService } from '../services/portService';

const { Title, Text } = Typography;

interface PortEndpoint {
  id: string;
  number: string;
  label?: string;
  status: string;
  panel: {
    id: string;
    name: string;
    type: string;
    device: {
      id: string;
      name: string;
      type: string;
      uPosition?: number;
      uHeight?: number;
      cabinet: {
        id: string;
        name: string;
        height: number;
        room: {
          id: string;
          name: string;
          floor?: string;
          dataCenter: {
            id: string;
            name: string;
            location?: string;
          };
        };
      };
    };
  };
}

interface CableEndpointsData {
  cable: {
    id: string;
    label?: string;
    type: string;
    length?: number;
    color?: string;
    notes?: string;
  };
  portA: PortEndpoint | null;
  portB: PortEndpoint | null;
}

/**
 * 端口详情页 - 双面板视图
 * 用于搜索端口或线缆后，显示本端和对端的完整层级信息
 */
export default function PortDetailView() {
  const location = useLocation();
  const navigate = useNavigate();
  const { portId, cableId } = location.state || {};

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [endpointsData, setEndpointsData] = useState<CableEndpointsData | null>(null);

  useEffect(() => {
    loadData();
  }, [portId, cableId]);

  const loadData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (cableId) {
        // 通过线缆ID查询两端端点
        const data = await cableService.getCableEndpoints(cableId);
        setEndpointsData(data);
      } else if (portId) {
        // 通过端口ID查询连接信息
        const connection = await cableService.getPortConnection(portId);
        if (connection) {
          setEndpointsData(connection);
        } else {
          // 端口未连接，只查询端口本身信息
          const portData = await portService.getById(portId);
          // 构造只有单端的数据结构
          setEndpointsData({
            cable: null as any,
            portA: portData as any,
            portB: null,
          });
        }
      } else {
        setError('缺少端口或线缆ID参数');
      }
    } catch (err: any) {
      console.error('Error loading port/cable data:', err);
      setError(err.message || '加载数据失败');
    } finally {
      setLoading(false);
    }
  };

  const renderLocationPath = (port: PortEndpoint | null) => {
    if (!port || !port.panel) return '未知位置';

    const { panel } = port;
    const device = panel.device;
    const cabinet = device?.cabinet;
    const room = cabinet?.room;
    const dataCenter = room?.dataCenter;

    const parts = [];
    if (dataCenter) parts.push(dataCenter.name);
    if (room) parts.push(room.name);
    if (cabinet) parts.push(cabinet.name);
    if (device) {
      const uInfo = device.uPosition ? `U${device.uPosition}` : '';
      parts.push(`${device.name}${uInfo ? ` (${uInfo})` : ''}`);
    }
    if (panel) parts.push(panel.name);

    return parts.join(' → ');
  };

  const renderPortCard = (port: PortEndpoint | null, title: string) => {
    if (!port) {
      return (
        <Card title={title} style={{ height: '100%' }}>
          <Alert message="该端未连接" type="info" showIcon />
        </Card>
      );
    }

    const panel = port.panel;
    const device = panel?.device;
    const cabinet = device?.cabinet;
    const room = cabinet?.room;
    const dataCenter = room?.dataCenter;

    const statusColors: Record<string, string> = {
      AVAILABLE: 'green',
      OCCUPIED: 'blue',
      RESERVED: 'orange',
      FAULTY: 'red',
    };

    const statusLabels: Record<string, string> = {
      AVAILABLE: '可用',
      OCCUPIED: '占用',
      RESERVED: '预留',
      FAULTY: '故障',
    };

    return (
      <Card
        title={title}
        style={{ height: '100%' }}
        extra={
          <Button
            type="link"
            onClick={() => {
              // 跳转到机柜可视化视图
              if (cabinet?.id && device?.id) {
                navigate('/cabinets', {
                  state: {
                    activeTab: 'visual',
                    selectedCabinetId: cabinet.id,
                    selectedDeviceId: device.id,
                    selectedPanelId: panel.id,
                    showDevicePanels: true,
                  },
                });
              }
            }}
          >
            查看机柜
          </Button>
        }
      >
        <Descriptions column={1} size="small" bordered>
          <Descriptions.Item label="端口编号">
            {port.number}
          </Descriptions.Item>
          {port.label && (
            <Descriptions.Item label="端口标签">
              {port.label}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="状态">
            <Tag color={statusColors[port.status] || 'default'}>
              {statusLabels[port.status] || port.status}
            </Tag>
          </Descriptions.Item>
        </Descriptions>

        <Divider orientation="left">位置信息</Divider>

        <Descriptions column={1} size="small">
          <Descriptions.Item label="数据中心">
            {dataCenter?.name || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="机房">
            {room?.name || '-'}
            {room?.floor && ` (${room.floor})`}
          </Descriptions.Item>
          <Descriptions.Item label="机柜">
            {cabinet?.name || '-'}
            {cabinet?.height && ` (${cabinet.height}U)`}
          </Descriptions.Item>
          <Descriptions.Item label="设备">
            {device?.name || '-'}
            {device?.type && ` (${device.type})`}
          </Descriptions.Item>
          {device?.uPosition && (
            <Descriptions.Item label="U位">
              U{device.uPosition}
              {device?.uHeight && ` (高度: ${device.uHeight}U)`}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="面板">
            {panel?.name || '-'}
            {panel?.type && ` (${panel.type})`}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Text type="secondary" style={{ fontSize: '12px' }}>
          路径: {renderLocationPath(port)}
        </Text>
      </Card>
    );
  };

  const renderCableInfo = () => {
    if (!endpointsData?.cable) return null;

    const cable = endpointsData.cable;
    const cableTypeLabels: Record<string, string> = {
      CAT5E: '超五类网线',
      CAT6: '六类网线',
      CAT6A: '超六类网线',
      CAT7: '七类网线',
      FIBER_SM: '单模光纤',
      FIBER_MM: '多模光纤',
      POWER: '电源线',
      OTHER: '其他',
    };

    return (
      <Card
        title={
          <span>
            <SwapOutlined /> 线缆连接信息
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Descriptions column={2} size="small">
          <Descriptions.Item label="线缆标签">
            {cable.label || '未命名'}
          </Descriptions.Item>
          <Descriptions.Item label="类型">
            <Tag color="blue">
              {cableTypeLabels[cable.type] || cable.type}
            </Tag>
          </Descriptions.Item>
          {cable.length && (
            <Descriptions.Item label="长度">
              {cable.length}m
            </Descriptions.Item>
          )}
          {cable.color && (
            <Descriptions.Item label="颜色">
              <Tag color={cable.color}>{cable.color}</Tag>
            </Descriptions.Item>
          )}
          {cable.notes && (
            <Descriptions.Item label="备注" span={2}>
              {cable.notes}
            </Descriptions.Item>
          )}
        </Descriptions>
      </Card>
    );
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 0' }}>
        <Spin size="large" tip="加载中..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate(-1)}
          style={{ marginBottom: 16 }}
        >
          返回
        </Button>
        <Alert message="错误" description={error} type="error" showIcon />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Title level={3}>
        {cableId ? '线缆连接详情' : '端口连接详情'}
      </Title>

      {renderCableInfo()}

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          {renderPortCard(endpointsData?.portA || null, '本端端口 (Port A)')}
        </Col>
        <Col xs={24} lg={12}>
          {renderPortCard(endpointsData?.portB || null, '对端端口 (Port B)')}
        </Col>
      </Row>
    </div>
  );
}
