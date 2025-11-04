import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  InputNumber,
  Select,
  message,
  Space,
  Popconfirm,
  Typography,
  Tag,
  Cascader,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  InboxOutlined,
} from '@ant-design/icons';
import { Cabinet, Room, DataCenter } from '@/types';
import { cabinetService } from '@/services/cabinetService';
import { roomService } from '@/services/roomService';
import { dataCenterService } from '@/services/dataCenterService';

const { Title } = Typography;
const { Search } = Input;
const { Option } = Select;

interface CascaderOption {
  value: string;
  label: string;
  children?: CascaderOption[];
}

export default function CabinetList() {
  const [cabinets, setCabinets] = useState<Cabinet[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCabinet, setEditingCabinet] = useState<Cabinet | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string>();
  const [form] = Form.useForm();

  // 加载数据中心和机房
  const loadDataCentersAndRooms = async () => {
    try {
      const [dcData, roomData] = await Promise.all([
        dataCenterService.getAll(),
        roomService.getAll(),
      ]);
      setDataCenters(dcData);
      setRooms(roomData);
    } catch (error) {
      console.error(error);
    }
  };

  // 加载机柜列表
  const loadCabinets = async (searchQuery?: string, roomId?: string) => {
    setLoading(true);
    try {
      let data;
      if (searchQuery) {
        data = await cabinetService.search(searchQuery);
      } else if (roomId) {
        data = await cabinetService.getByRoom(roomId);
      } else {
        data = await cabinetService.getAll();
      }
      setCabinets(data);
    } catch (error) {
      message.error('加载机柜列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataCentersAndRooms();
    loadCabinets();
  }, []);

  // 构建级联选择器选项
  const getCascaderOptions = (): CascaderOption[] => {
    return dataCenters.map((dc) => ({
      value: dc.id,
      label: dc.name,
      children: rooms
        .filter((r) => r.dataCenterId === dc.id)
        .map((r) => ({
          value: r.id,
          label: r.name,
        })),
    }));
  };

  // 打开创建/编辑对话框
  const handleOpenModal = (cabinet?: Cabinet) => {
    if (cabinet) {
      setEditingCabinet(cabinet);
      form.setFieldsValue(cabinet);
    } else {
      setEditingCabinet(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭对话框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingCabinet(null);
    form.resetFields();
  };

  // 保存机柜
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingCabinet) {
        await cabinetService.update(editingCabinet.id, values);
        message.success('机柜更新成功');
      } else {
        await cabinetService.create(values);
        message.success('机柜创建成功');
      }
      handleCloseModal();
      loadCabinets(undefined, selectedRoom);
    } catch (error: any) {
      if (error.errorFields) {
        return;
      }
      message.error(editingCabinet ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除机柜
  const handleDelete = async (id: string) => {
    try {
      await cabinetService.delete(id);
      message.success('机柜删除成功');
      loadCabinets(undefined, selectedRoom);
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    loadCabinets(value);
  };

  // 按机房过滤
  const handleRoomFilter = (value: string) => {
    setSelectedRoom(value);
    loadCabinets(undefined, value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 80,
    },
    {
      title: '机柜名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'position',
      key: 'position',
      render: (text: string) => text || '-',
    },
    {
      title: 'U数',
      dataIndex: 'height',
      key: 'height',
      render: (height: number) => `${height}U`,
    },
    {
      title: '所属机房',
      dataIndex: 'roomId',
      key: 'roomId',
      render: (roomId: string) => {
        const room = rooms.find((r) => r.id === roomId);
        if (!room) return '-';
        const dc = dataCenters.find((d) => d.id === room.dataCenterId);
        return (
          <Space>
            <Tag color="blue">{dc?.name}</Tag>
            <Tag color="green">{room.name}</Tag>
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
      render: (_: any, record: Cabinet) => (
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
            title="确定要删除这个机柜吗？"
            description="删除后将同时删除其下所有设备"
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
        <InboxOutlined /> 机柜管理
      </Title>
      <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
        管理机房内的所有机柜和U位
      </p>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
              新建机柜
            </Button>
            <Select
              placeholder="选择机房"
              allowClear
              style={{ width: 200 }}
              onChange={handleRoomFilter}
              onClear={() => loadCabinets()}
            >
              {rooms.map((room) => {
                const dc = dataCenters.find((d) => d.id === room.dataCenterId);
                return (
                  <Option key={room.id} value={room.id}>
                    {dc?.name} - {room.name}
                  </Option>
                );
              })}
            </Select>
          </Space>
          <Search
            placeholder="搜索机柜名称"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={cabinets}
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
        title={editingCabinet ? '编辑机柜' : '新建机柜'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="机柜名称"
            rules={[{ required: true, message: '请输入机柜名称' }]}
          >
            <Input placeholder="例如：A-01" />
          </Form.Item>
          <Form.Item name="position" label="位置">
            <Input placeholder="例如：第一排第三列" />
          </Form.Item>
          <Form.Item
            name="height"
            label="U数"
            initialValue={42}
            rules={[{ required: true, message: '请输入U数' }]}
          >
            <InputNumber min={1} max={52} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="roomId"
            label="所属机房"
            rules={[{ required: true, message: '请选择机房' }]}
          >
            <Select placeholder="选择机房" showSearch optionFilterProp="children">
              {rooms.map((room) => {
                const dc = dataCenters.find((d) => d.id === room.dataCenterId);
                return (
                  <Option key={room.id} value={room.id}>
                    {dc?.name} - {room.name}
                  </Option>
                );
              })}
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
