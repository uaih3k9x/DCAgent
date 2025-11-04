import { useState, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Input,
  message,
  Space,
  Popconfirm,
  Typography,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import { DataCenter } from '@/types';
import { dataCenterService } from '@/services/dataCenterService';

const { Title } = Typography;
const { Search } = Input;

export default function DataCenterList() {
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDataCenter, setEditingDataCenter] = useState<DataCenter | null>(null);
  const [form] = Form.useForm();

  // 加载数据中心列表
  const loadDataCenters = async (searchQuery?: string) => {
    setLoading(true);
    try {
      const data = searchQuery
        ? await dataCenterService.search(searchQuery)
        : await dataCenterService.getAll();
      setDataCenters(data);
    } catch (error) {
      message.error('加载数据中心列表失败');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDataCenters();
  }, []);

  // 打开创建/编辑对话框
  const handleOpenModal = (dataCenter?: DataCenter) => {
    if (dataCenter) {
      setEditingDataCenter(dataCenter);
      form.setFieldsValue(dataCenter);
    } else {
      setEditingDataCenter(null);
      form.resetFields();
    }
    setModalVisible(true);
  };

  // 关闭对话框
  const handleCloseModal = () => {
    setModalVisible(false);
    setEditingDataCenter(null);
    form.resetFields();
  };

  // 保存数据中心
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      if (editingDataCenter) {
        await dataCenterService.update(editingDataCenter.id, values);
        message.success('数据中心更新成功');
      } else {
        await dataCenterService.create(values);
        message.success('数据中心创建成功');
      }
      handleCloseModal();
      loadDataCenters();
    } catch (error: any) {
      if (error.errorFields) {
        // 表单验证错误
        return;
      }
      message.error(editingDataCenter ? '更新失败' : '创建失败');
      console.error(error);
    }
  };

  // 删除数据中心
  const handleDelete = async (id: string) => {
    try {
      await dataCenterService.delete(id);
      message.success('数据中心删除成功');
      loadDataCenters();
    } catch (error) {
      message.error('删除失败');
      console.error(error);
    }
  };

  // 搜索
  const handleSearch = (value: string) => {
    loadDataCenters(value);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 80,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
      render: (text: string) => text || '-',
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
      render: (_: any, record: DataCenter) => (
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
            title="确定要删除这个数据中心吗？"
            description="删除后将同时删除其下所有机房、机柜和设备"
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
        <DatabaseOutlined /> 数据中心管理
      </Title>
      <p style={{ color: '#8c8c8c', marginBottom: 24 }}>
        管理所有数据中心，每个数据中心可以包含多个机房
      </p>

      <Card>
        <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>
            新建数据中心
          </Button>
          <Search
            placeholder="搜索数据中心名称或位置"
            allowClear
            onSearch={handleSearch}
            style={{ width: 300 }}
          />
        </Space>

        <Table
          columns={columns}
          dataSource={dataCenters}
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
        title={editingDataCenter ? '编辑数据中心' : '新建数据中心'}
        open={modalVisible}
        onOk={handleSave}
        onCancel={handleCloseModal}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="数据中心名称"
            rules={[{ required: true, message: '请输入数据中心名称' }]}
          >
            <Input placeholder="例如：北京数据中心" />
          </Form.Item>
          <Form.Item name="location" label="位置">
            <Input placeholder="例如：北京市朝阳区" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
