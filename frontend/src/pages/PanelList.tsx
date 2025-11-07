import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApartmentOutlined,
} from '@ant-design/icons';
import { Panel, PanelType, Device } from '@/types';
import { panelService } from '@/services/panelService';
import { deviceService } from '@/services/deviceService';
import { ShortIdFormatter } from '@/utils/shortIdFormatter';

const { Title, Text } = Typography;
const { Search } = Input;
const { Option } = Select;

// 面板类型中文映射
const panelTypeMap: Record<PanelType, { label: string; color: string }> = {
  ETHERNET: { label: '网口', color: 'blue' },
  FIBER: { label: '光纤', color: 'cyan' },
  POWER: { label: '电源', color: 'red' },
  SERIAL: { label: '串口', color: 'orange' },
  USB: { label: 'USB', color: 'purple' },
  OTHER: { label: '其他', color: 'default' },
};

export default function PanelList() {
  const [panels, setPanels] = useState<Panel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPanel, setEditingPanel] = useState<Panel | null>(null);
  const [selectedDevice, setSelectedDevice] = useState<string>();
  const [selectedType, setSelectedType] = useState<PanelType>();
  const [form] = Form.useForm();

  // 加载设备列表
  const loadDevices = async () => {
    try {
      const data = await deviceService.getAll();
      setDevices(data);
    } catch (error) {
      console.error(error);
    }
  };

  // 加载面板列表
  const loadPanels = async (searchQuery?: string, deviceId?: string, type?: PanelType) => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await panelService.search(searchQuery);
      } else if (deviceId) {
        data = await panelService.getByDevice(deviceId);
      } else if (type) {
        data = await panelService.getByType(type);
      } else {
        data = await panelService.getAll();
      }
      setPanels(data);
    } catch (error) {
      message.error('加载面板列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDevices();
    loadPanels();
  }, []);

  // 打开创建/编辑对话框
  const handleOpenModal = (panel?: Panel) => {
    if (panel) {
      setEditingPanel(panel);
      form.setFieldsValue(panel);
    } else {
      setEditingPanel(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭对话框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPanel(null);
    form.resetFields();
  };

  // 保存面板
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPanel) {
        await panelService.update(editingPanel.id, values);
        message.success('面板更新成功');
      } else {
        await panelService.create(values);
        message.success('面板创建成功');
      }
      handleCloseModal();
      loadPanels(undefined, selectedDevice, selectedType);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(editingPanel ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除面板
  const handleDelete = async (id: string) => {
    try {
      await panelService.delete(id);
      message.success('面板删除成功');
      loadPanels(undefined, selectedDevice, selectedType);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    loadPanels(value);
  };

  // 按设备过滤
  const handleDeviceFilter = (value: string) => {
    setSelectedDevice(value);
    loadPanels(undefined, value);
  };

  // 按类型过滤
  const handleTypeFilter = (value: PanelType) => {
    setSelectedType(value);
    loadPanels(undefined, undefined, value);
  };

  const columns = [
    {
      title: 'shortID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 120,
      render: (shortId: number | undefined) =>
        shortId ? <Text code>{ShortIdFormatter.toDisplayFormat(shortId)}</Text> : '-',
    },
    {
      title: '面板名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: PanelType) => {
        const config = panelTypeMap[type];
        return <Tag color={config.color}>{config.label}</Tag>;
      },
    },
    {
      title: '所属设备',
      dataIndex: 'deviceId',
      key: 'deviceId',
      render: (deviceId: string) => {
        const device = devices.find((d) => d.id === deviceId);
        return device ? <Tag color="green">{device.name}</Tag> : '-';
      },
    },
    {
      title: '端口数',
      dataIndex: 'ports',
      key: 'ports',
      render: (ports: any[]) => ports?.length || 0,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text: string) => new Date(text).toLocaleString('zh-CN'),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: any, record: Panel) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个面板吗？"
            description="删除后将同时删除其下所有端口"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={2}>
        <ApartmentOutlined /> 面板管理
      </Title>
      <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
        管理设备上的各类面板 (网口、光纤、电源等)
      </p>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              新建面板
            </Button>
            <Select
              placeholder="选择设备"
              allowClear
              style={{ width: 200 }}
              onChange={handleDeviceFilter}
              onClear={() => {
                setSelectedDevice(undefined);
                loadPanels();
              }}
            >
              {devices.map((device) => (
                <Option key={device.id} value={device.id}>
                  {device.name}
                </Option>
              ))}
            </Select>
            <Select
              placeholder="选择类型"
              allowClear
              style={{ width: 120 }}
              onChange={handleTypeFilter}
              onClear={() => {
                setSelectedType(undefined);
                loadPanels();
              }}
            >
              {Object.entries(panelTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.label}
                </Option>
              ))}
            </Select>
          </Space>
          <Search
            placeholder="搜索面板名称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={panels}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      <Modal
        title={editingPanel ? '编辑面板' : '新建面板'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="面板名称"
            rules={[{ required: true, message: '请输入面板名称' }]}
          >
            <Input placeholder="例如：eth0" />
          </Form.Item>
          <Form.Item
            name="type"
            label="面板类型"
            rules={[{ required: true, message: '请选择面板类型' }]}
          >
            <Select placeholder="选择面板类型">
              {Object.entries(panelTypeMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  {value.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="deviceId"
            label="所属设备"
            rules={[{ required: true, message: '请选择设备' }]}
          >
            <Select placeholder="选择设备" showSearch optionFilterProp="children">
              {devices.map((device) => (
                <Option key={device.id} value={device.id}>
                  {device.name} ({device.type})
                </Option>
              ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
