import { useState, useEffect } from 'react';
import { Table, Button, Space, Typography, Tag, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { Device, DeviceType } from '@/types';
import { deviceService } from '@/services/deviceService';

const { Title } = Typography;

export default function DeviceList() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    setLoading(true);
    try {
      const data = await deviceService.getAll();
      setDevices(data);
    } catch (error) {
      message.error('加载设备列表失败');
    } finally {
      setLoading(false);
    }
  };

  const deviceTypeColors: Record<DeviceType, string> = {
    SERVER: 'blue',
    SWITCH: 'green',
    ROUTER: 'orange',
    FIREWALL: 'red',
    STORAGE: 'purple',
    PDU: 'cyan',
    OTHER: 'default',
  };

  const columns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: DeviceType) => (
        <Tag color={deviceTypeColors[type]}>{type}</Tag>
      ),
    },
    {
      title: '型号',
      dataIndex: 'model',
      key: 'model',
    },
    {
      title: '序列号',
      dataIndex: 'serialNo',
      key: 'serialNo',
    },
    {
      title: 'U位',
      key: 'uPosition',
      render: (_: any, record: Device) =>
        record.uPosition ? `${record.uPosition}U (${record.uHeight}U)` : '-',
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: Device) => (
        <Space size="small">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => message.info('编辑功能待实现')}
          >
            编辑
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => message.info('删除功能待实现')}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={2}>设备管理</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => message.info('添加设备功能待实现')}
        >
          添加设备
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={devices}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
}
