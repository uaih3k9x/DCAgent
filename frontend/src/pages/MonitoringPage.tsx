import { useState, useEffect } from 'react';
import { Card, Badge, Tabs, Button, Row, Col, Statistic, Space } from 'antd';
import {
  DashboardOutlined,
  ThunderboltOutlined,
  FireOutlined,
  CloudServerOutlined,
  ReloadOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import AddDeviceModal from '@/components/AddDeviceModal';

const { TabPane } = Tabs;

interface MonitoringDevice {
  id: string;
  name: string;
  ip: string;
  vendor: 'lenovo' | 'dell' | 'hp';
  status: 'online' | 'offline' | 'warning';
  lastUpdate: string;
}

interface SensorData {
  name: string;
  value: string;
  status: 'normal' | 'warning' | 'critical';
}

export default function MonitoringPage() {
  const [devices, setDevices] = useState<MonitoringDevice[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<MonitoringDevice | null>(null);
  const [loading, setLoading] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);

  // 传感器数据
  const [temperatures, setTemperatures] = useState<SensorData[]>([]);
  const [fans, setFans] = useState<SensorData[]>([]);
  const [powerMetrics, setPowerMetrics] = useState<any>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  useEffect(() => {
    if (selectedDevice) {
      fetchDeviceData(selectedDevice.id);
    }
  }, [selectedDevice]);

  const fetchDevices = async () => {
    try {
      const response = await fetch('/api/v1/monitoring/devices');
      if (!response.ok) {
        console.error('API not available yet');
        return;
      }
      const data = await response.json();
      if (Array.isArray(data)) {
        setDevices(data);
        if (data.length > 0) {
          setSelectedDevice(data[0]);
        }
      }
    } catch (error) {
      console.error('Failed to fetch devices:', error);
    }
  };

  const fetchDeviceData = async (deviceId: string) => {
    setLoading(true);
    try {
      // 获取温度数据
      const tempResponse = await fetch(`/api/v1/monitoring/devices/${deviceId}/temperature`);
      const tempData = await tempResponse.json();
      setTemperatures(tempData);

      // 获取风扇数据
      const fanResponse = await fetch(`/api/v1/monitoring/devices/${deviceId}/fans`);
      const fanData = await fanResponse.json();
      setFans(fanData);

      // 获取电源数据
      const powerResponse = await fetch(`/api/v1/monitoring/devices/${deviceId}/power`);
      const powerData = await powerResponse.json();
      setPowerMetrics(powerData);
    } catch (error) {
      console.error('Failed to fetch device data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'online':
      case 'normal':
        return '#52c41a';
      case 'warning':
        return '#faad14';
      case 'offline':
      case 'critical':
        return '#f5222d';
      default:
        return '#d9d9d9';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
      case 'normal':
        return <Badge status="success" text="正常" />;
      case 'warning':
        return <Badge status="warning" text="警告" />;
      case 'offline':
      case 'critical':
        return <Badge status="error" text="异常" />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const calculateAvgTemp = () => {
    if (temperatures.length === 0) return '--';
    const validTemps = temperatures
      .map((t) => parseFloat(t.value))
      .filter((v) => v > 0);
    if (validTemps.length === 0) return '--';
    return (validTemps.reduce((a, b) => a + b, 0) / validTemps.length).toFixed(1);
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ fontSize: 24, fontWeight: 'bold', margin: 0 }}>设备监控</h1>
        <Space>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setAddModalOpen(true)}
          >
            添加设备
          </Button>
          <Button
            icon={<ReloadOutlined spin={loading} />}
            onClick={() => fetchDeviceData(selectedDevice?.id || '')}
            disabled={loading}
          >
            刷新
          </Button>
        </Space>
      </div>

      <Row gutter={24}>
        {/* 左侧设备列表 */}
        <Col span={6}>
          <Card title="监控设备" extra={<span>共 {devices.length} 台设备</span>}>
            <Space direction="vertical" style={{ width: '100%' }}>
              {devices.map((device) => (
                <Card
                  key={device.id}
                  size="small"
                  hoverable
                  onClick={() => setSelectedDevice(device)}
                  style={{
                    borderColor: selectedDevice?.id === device.id ? '#1890ff' : '#d9d9d9',
                    backgroundColor: selectedDevice?.id === device.id ? '#e6f7ff' : '#fff',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <Space>
                      <CloudServerOutlined />
                      <strong>{device.name}</strong>
                    </Space>
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        backgroundColor: getStatusColor(device.status),
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c' }}>{device.ip}</div>
                  <div style={{ fontSize: 12, color: '#bfbfbf', marginTop: 4 }}>
                    更新: {new Date(device.lastUpdate).toLocaleTimeString()}
                  </div>
                </Card>
              ))}
            </Space>
          </Card>
        </Col>

        {/* 右侧设备详情 */}
        <Col span={18}>
          {selectedDevice ? (
            <Tabs defaultActiveKey="overview">
              <TabPane
                tab={
                  <span>
                    <DashboardOutlined />
                    概览
                  </span>
                }
                key="overview"
              >
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card>
                        <Statistic title="设备状态" value="" />
                        <div style={{ marginTop: 8 }}>{getStatusBadge(selectedDevice.status)}</div>
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="平均温度"
                          value={calculateAvgTemp()}
                          suffix="°C"
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card>
                        <Statistic
                          title="当前功耗"
                          value={powerMetrics?.totalPower || '--'}
                          suffix="W"
                        />
                      </Card>
                    </Col>
                  </Row>

                  <Card title="关键传感器">
                    <Row gutter={[16, 16]}>
                      {temperatures
                        .filter((t) => parseFloat(t.value) > 0)
                        .slice(0, 6)
                        .map((temp, index) => (
                          <Col span={12} key={index}>
                            <Card size="small">
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Space>
                                  <FireOutlined style={{ color: '#8c8c8c' }} />
                                  <span>{temp.name}</span>
                                </Space>
                                <Space>
                                  <strong>{temp.value}</strong>
                                  {getStatusBadge(temp.status)}
                                </Space>
                              </div>
                            </Card>
                          </Col>
                        ))}
                    </Row>
                  </Card>
                </Space>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <FireOutlined />
                    温度
                  </span>
                }
                key="temperature"
              >
                <Card title="温度传感器" extra={<span>共 {temperatures.length} 个温度传感器</span>}>
                  <Row gutter={[12, 12]}>
                    {temperatures.map((temp, index) => {
                      const value = parseFloat(temp.value);
                      let borderColor = '#d9d9d9';
                      let backgroundColor = '#fff';
                      if (value > 80) {
                        borderColor = '#f5222d';
                        backgroundColor = '#fff1f0';
                      } else if (value > 60) {
                        borderColor = '#faad14';
                        backgroundColor = '#fffbe6';
                      }

                      return (
                        <Col span={8} key={index}>
                          <Card
                            size="small"
                            style={{ borderColor, backgroundColor }}
                          >
                            <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 4 }}>
                              {temp.name}
                            </div>
                            <div style={{ fontSize: 20, fontWeight: 'bold' }}>{temp.value}</div>
                          </Card>
                        </Col>
                      );
                    })}
                  </Row>
                </Card>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <CloudServerOutlined />
                    风扇
                  </span>
                }
                key="fans"
              >
                <Card title="风扇状态" extra={<span>共 {fans.length} 个风扇</span>}>
                  <Row gutter={[16, 16]}>
                    {fans.map((fan, index) => (
                      <Col span={12} key={index}>
                        <Card size="small">
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                            <Space>
                              <CloudServerOutlined style={{ color: '#8c8c8c' }} />
                              <strong>{fan.name}</strong>
                            </Space>
                            {getStatusBadge(fan.status)}
                          </div>
                          <div style={{ fontSize: 20, fontWeight: 'bold' }}>{fan.value}</div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </Card>
              </TabPane>

              <TabPane
                tab={
                  <span>
                    <ThunderboltOutlined />
                    电源
                  </span>
                }
                key="power"
              >
                <Card title="电源信息">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="总功耗"
                          value={powerMetrics?.totalPower || '--'}
                          suffix="W"
                        />
                      </Card>
                    </Col>
                    <Col span={12}>
                      <Card>
                        <Statistic
                          title="CPU 功耗"
                          value={powerMetrics?.cpuPower || '--'}
                          suffix="W"
                        />
                      </Card>
                    </Col>
                    <Col span={12} style={{ marginTop: 16 }}>
                      <Card>
                        <Statistic
                          title="内存功耗"
                          value={powerMetrics?.memPower || '--'}
                          suffix="W"
                        />
                      </Card>
                    </Col>
                    <Col span={12} style={{ marginTop: 16 }}>
                      <Card>
                        <Statistic
                          title="24h 平均功耗"
                          value={powerMetrics?.avgPower || '--'}
                          suffix="W"
                        />
                      </Card>
                    </Col>
                  </Row>
                </Card>
              </TabPane>
            </Tabs>
          ) : (
            <Card>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 400 }}>
                <p style={{ color: '#8c8c8c' }}>请选择一个设备查看监控数据</p>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      <AddDeviceModal
        open={addModalOpen}
        onOpenChange={setAddModalOpen}
        onSuccess={() => {
          fetchDevices();
        }}
      />
    </div>
  );
}
