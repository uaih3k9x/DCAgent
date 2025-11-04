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
  Badge,
  InputNumber,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ApiOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import { Port, PortStatus, Panel, Device } from '@/types';
import { portService } from '@/services/portService';
import { panelService } from '@/services/panelService';
import { deviceService } from '@/services/deviceService';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

// 端口状态中文映射
const portStatusMap: Record<PortStatus, { label: string; color: string }> = {
  AVAILABLE: { label: '可用', color: 'success' },
  OCCUPIED: { label: '已占用', color: 'error' },
  RESERVED: { label: '预留', color: 'warning' },
  FAULTY: { label: '故障', color: 'default' },
};

export default function PortList() {
  const [ports, setPorts] = useState<Port[]>([]);
  const [panels, setPanels] = useState<Panel[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [bulkModalVisible, setBulkModalVisible] = useState(false);
  const [editingPort, setEditingPort] = useState<Port | null>(null);
  const [selectedPanel, setSelectedPanel] = useState<string>();
  const [selectedStatus, setSelectedStatus] = useState<PortStatus>();
  const [form] = Form.useForm();
  const [bulkForm] = Form.useForm();

  // 加载面板和设备
  const loadPanelsAndDevices = async () => {
    try {
      const [panelData, deviceData] = await Promise.all([
        panelService.getAll(),
        deviceService.getAll(),
      ]);
      setPanels(panelData);
      setDevices(deviceData);
    } catch (error) {
      console.error(error);
    }
  };

  // 加载端口列表
  const loadPorts = async (searchQuery?: string, panelId?: string, status?: PortStatus) => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await portService.search(searchQuery);
      } else {
        const params = new URLSearchParams();
        if (panelId) params.append('panelId', panelId);
        if (status) params.append('status', status);
        data = await portService.getAll();
      }
      setPorts(data);
    } catch (error) {
      message.error('加载端口列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPanelsAndDevices();
    loadPorts();
  }, []);

  // 打开创建/编辑对话框
  const handleOpenModal = (port?: Port) => {
    if (port) {
      setEditingPort(port);
      form.setFieldsValue(port);
    } else {
      setEditingPort(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 打开批量创建对话框
  const handleOpenBulkModal = () => {
    bulkForm.resetFields();
    setBulkModalVisible(true);
  };

  // 关闭对话框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingPort(null);
    form.resetFields();
  };

  const handleCloseBulkModal = () => {
    setBulkModalVisible(false);
    bulkForm.resetFields();
  };

  // 保存端口
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingPort) {
        await portService.update(editingPort.id, values);
        message.success('端口更新成功');
      } else {
        await portService.create(values);
        message.success('端口创建成功');
      }
      handleCloseModal();
      loadPorts(undefined, selectedPanel, selectedStatus);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(editingPort ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 批量创建端口
  const handleBulkCreate = async () => {
    try {
      const values = await bulkForm.validateFields();
      await portService.createBulk(values.panelId, values.count, values.prefix);
      message.success(`成功创建 ${values.count} 个端口`);
      handleCloseBulkModal();
      loadPorts(undefined, selectedPanel, selectedStatus);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error('批量创建失败');
      console.error(error);
    }
  };

  // 删除端口
  const handleDelete = async (id: string) => {
    try {
      await portService.delete(id);
      message.success('端口删除成功');
      loadPorts(undefined, selectedPanel, selectedStatus);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 更新端口状态
  const handleUpdateStatus = async (id: string, status: PortStatus) => {
    try {
      await portService.updateStatus(id, status);
      message.success('状态更新成功');
      loadPorts(undefined, selectedPanel, selectedStatus);
    } catch (error) {
      message.error('状态更新失败');
      console.error(error);
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    loadPorts(value);
  };

  // 按面板过滤
  const handlePanelFilter = (value: string) => {
    setSelectedPanel(value);
    loadPorts(undefined, value);
  };

  // 按状态过滤
  const handleStatusFilter = (value: PortStatus) => {
    setSelectedStatus(value);
    loadPorts(undefined, undefined, value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 80,
    },
    {
      title: '端口号',
      dataIndex: 'number',
      key: 'number',
    },
    {
      title: '标签',
      dataIndex: 'label',
      key: 'label',
      render: (text: string) => text || '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: PortStatus, record: Port) => {
        const config = portStatusMap[status];
        return (
          <Select
            size="small"
            value={status}
            style={{ width: 100 }}
            onChange={(newStatus) => handleUpdateStatus(record.id, newStatus)}
          >
            {Object.entries(portStatusMap).map(([key, value]) => (
              <Option key={key} value={key}>
                <Badge status={value.color as any} text={value.label} />
              </Option>
            ))}
          </Select>
        );
      },
    },
    {
      title: '所属面板',
      dataIndex: 'panelId',
      key: 'panelId',
      render: (panelId: string) => {
        const panel = panels.find((p) => p.id === panelId);
        if (!panel) return '-';
        const device = devices.find((d) => d.id === panel.deviceId);
        return (
          <Space>
            <Tag color="blue">{device?.name}</Tag>
            <Tag color="green">{panel.name}</Tag>
          </Space>
        );
      },
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
      render: (_: any, record: Port) => (
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
            title="确定要删除这个端口吗？"
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
        <ApiOutlined /> 端口管理
      </Title>
      <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
        管理面板上的所有端口，支持批量创建和状态管理
      </p>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              新建端口
            </Button>
            <Button
              type="default"
              icon={<ThunderboltOutlined />}
              onClick={handleOpenBulkModal}
            >
              批量创建
            </Button>
            <Select
              placeholder="选择面板"
              allowClear
              style={{ width: 200 }}
              onChange={handlePanelFilter}
              onClear={() => {
                setSelectedPanel(undefined);
                loadPorts();
              }}
            >
              {panels.map((panel) => {
                const device = devices.find((d) => d.id === panel.deviceId);
                return (
                  <Option key={panel.id} value={panel.id}>
                    {device?.name} - {panel.name}
                  </Option>
                );
              })}
            </Select>
            <Select
              placeholder="选择状态"
              allowClear
              style={{ width: 120 }}
              onChange={handleStatusFilter}
              onClear={() => {
                setSelectedStatus(undefined);
                loadPorts();
              }}
            >
              {Object.entries(portStatusMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Badge status={value.color as any} text={value.label} />
                </Option>
              ))}
            </Select>
          </Space>
          <Search
            placeholder="搜索端口号或标签"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={ports}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 创建/编辑端口对话框 */}
      <Modal
        title={editingPort ? '编辑端口' : '新建端口'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="number"
            label="端口号"
            rules={[{ required: true, message: '请输入端口号' }]}
          >
            <Input placeholder="例如：1" />
          </Form.Item>
          <Form.Item name="label" label="标签">
            <Input placeholder="例如：eth0-1" />
          </Form.Item>
          <Form.Item
            name="status"
            label="状态"
            initialValue={PortStatus.AVAILABLE}
            rules={[{ required: true, message: '请选择状态' }]}
          >
            <Select placeholder="选择状态">
              {Object.entries(portStatusMap).map(([key, value]) => (
                <Option key={key} value={key}>
                  <Badge status={value.color as any} text={value.label} />
                </Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="panelId"
            label="所属面板"
            rules={[{ required: true, message: '请选择面板' }]}
          >
            <Select placeholder="选择面板" showSearch optionFilterProp="children">
              {panels.map((panel) => {
                const device = devices.find((d) => d.id === panel.deviceId);
                return (
                  <Option key={panel.id} value={panel.id}>
                    {device?.name} - {panel.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量创建端口对话框 */}
      <Modal
        title="批量创建端口"
        open={bulkModalVisible}
        onOk={handleBulkCreate}
        onCancel={handleCloseBulkModal}
        okText="创建"
        cancelText="取消"
      >
        <Form form={bulkForm} layout="vertical">
          <Form.Item
            name="panelId"
            label="所属面板"
            rules={[{ required: true, message: '请选择面板' }]}
          >
            <Select placeholder="选择面板" showSearch optionFilterProp="children">
              {panels.map((panel) => {
                const device = devices.find((d) => d.id === panel.deviceId);
                return (
                  <Option key={panel.id} value={panel.id}>
                    {device?.name} - {panel.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
          <Form.Item
            name="count"
            label="端口数量"
            initialValue={24}
            rules={[
              { required: true, message: '请输入端口数量' },
              { type: 'number', min: 1, max: 128, message: '端口数量必须在 1-128 之间' },
            ]}
          >
            <InputNumber min={1} max={128} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="prefix" label="标签前缀" initialValue="Port-">
            <Input placeholder="例如：Port-" />
          </Form.Item>
          <p style={{ color: '#8c8c8c', fontSize: '12px' }}>
            将创建编号为 1 到 {bulkForm.getFieldValue('count') || 24} 的端口，标签格式为 {bulkForm.getFieldValue('prefix') || 'Port-'}1, {bulkForm.getFieldValue('prefix') || 'Port-'}2, ...
          </p>
        </Form>
      </Modal>
    </div>
  );
}
