import React, { useState, useEffect } from 'react';
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Statistic,
  Row,
  Col,
  Popconfirm,
  Typography,
  Descriptions,
} from 'antd';
import {
  PlusOutlined,
  DownloadOutlined,
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  PrinterOutlined,
  DatabaseOutlined,
} from '@ant-design/icons';
import {
  shortIdPoolService,
  EntityType,
  ShortIdPoolStatus,
  ShortIdPoolRecord,
  PrintTask,
  PoolStats,
} from '@/services/shortIdPoolService';
import { ShortIdFormatter } from "@/utils/shortIdFormatter";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const ShortIdPoolManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState('pool');
  const [loading, setLoading] = useState(false);

  // Pool records state
  const [poolRecords, setPoolRecords] = useState<ShortIdPoolRecord[]>([]);
  const [poolTotal, setPoolTotal] = useState(0);
  const [poolPage, setPoolPage] = useState(1);
  const [poolPageSize, setPoolPageSize] = useState(50);
  const [poolFilters, setPoolFilters] = useState<{
    entityType?: EntityType;
    status?: ShortIdPoolStatus;
    search?: string;
  }>({});

  // Print tasks state
  const [printTasks, setPrintTasks] = useState<PrintTask[]>([]);
  const [printTasksTotal, setPrintTasksTotal] = useState(0);
  const [printTasksPage, setPrintTasksPage] = useState(1);
  const [printTasksPageSize, setPrintTasksPageSize] = useState(50);

  // Stats state
  const [stats, setStats] = useState<PoolStats | null>(null);

  // Modal state
  const [createTaskModalVisible, setCreateTaskModalVisible] = useState(false);
  const [generateModalVisible, setGenerateModalVisible] = useState(false);
  const [cancelModalVisible, setCancelModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ShortIdPoolRecord | null>(null);

  const [form] = Form.useForm();
  const [cancelForm] = Form.useForm();

  useEffect(() => {
    loadPoolRecords();
    loadStats();
  }, [poolPage, poolPageSize, poolFilters]);

  useEffect(() => {
    if (activeTab === 'tasks') {
      loadPrintTasks();
    }
  }, [activeTab, printTasksPage, printTasksPageSize]);

  // Load pool records
  const loadPoolRecords = async () => {
    setLoading(true);
    try {
      const result = await shortIdPoolService.getPoolRecords({
        page: poolPage,
        pageSize: poolPageSize,
        ...poolFilters,
      });
      setPoolRecords(result.records);
      setPoolTotal(result.total);
    } catch (error) {
      console.error('Error loading pool records:', error);
      message.error('加载池记录失败');
    } finally {
      setLoading(false);
    }
  };

  // Load print tasks
  const loadPrintTasks = async () => {
    setLoading(true);
    try {
      const result = await shortIdPoolService.getPrintTasks({
        page: printTasksPage,
        pageSize: printTasksPageSize,
      });
      setPrintTasks(result.records);
      setPrintTasksTotal(result.total);
    } catch (error) {
      console.error('Error loading print tasks:', error);
      message.error('加载打印任务失败');
    } finally {
      setLoading(false);
    }
  };

  // Load stats
  const loadStats = async () => {
    try {
      const result = await shortIdPoolService.getPoolStats();
      setStats(result);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Create print task
  const handleCreatePrintTask = async (values: any) => {
    try {
      const result = await shortIdPoolService.createPrintTask(
        values.name,
        values.count,
        values.createdBy,
        values.notes
      );
      message.success(result.message);
      setCreateTaskModalVisible(false);
      form.resetFields();
      loadPrintTasks();
      loadStats();
    } catch (error: any) {
      console.error('Error creating print task:', error);
      message.error(error.response?.data?.error || '创建打印任务失败');
    }
  };

  // Generate shortIds directly
  const handleGenerate = async (values: any) => {
    try {
      const result = await shortIdPoolService.generateShortIds(
        values.count,
        values.batchNo
      );
      message.success(result.message);
      setGenerateModalVisible(false);
      form.resetFields();
      loadPoolRecords();
      loadStats();
    } catch (error: any) {
      console.error('Error generating shortIds:', error);
      message.error(error.response?.data?.error || '生成shortID失败');
    }
  };

  // Export print task
  const handleExportPrintTask = async (taskId: string, taskName: string) => {
    try {
      const blob = await shortIdPoolService.exportPrintTask(taskId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shortids_${taskName}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      message.success('导出成功');
    } catch (error) {
      console.error('Error exporting print task:', error);
      message.error('导出失败');
    }
  };

  // Complete print task
  const handleCompletePrintTask = async (taskId: string) => {
    try {
      await shortIdPoolService.completePrintTask(taskId);
      message.success('打印任务已标记为完成');
      loadPrintTasks();
    } catch (error) {
      console.error('Error completing print task:', error);
      message.error('操作失败');
    }
  };

  // Cancel shortId
  const handleCancelShortId = async () => {
    if (!selectedRecord) return;

    try {
      const values = await cancelForm.validateFields();
      await shortIdPoolService.cancelShortId(
        selectedRecord.shortId,
        values.reason
      );
      message.success('shortID已报废');
      setCancelModalVisible(false);
      cancelForm.resetFields();
      setSelectedRecord(null);
      loadPoolRecords();
      loadStats();
    } catch (error: any) {
      console.error('Error cancelling shortId:', error);
      message.error(error.response?.data?.error || '操作失败');
    }
  };

  // Entity type name mapping
  const entityTypeNameMap: Record<EntityType, string> = {
    DATA_CENTER: '数据中心',
    ROOM: '机房',
    CABINET: '机柜',
    DEVICE: '设备',
    PANEL: '面板',
    PORT: '端口',
    CABLE: '线缆',
  };

  // Status tag color mapping
  const statusColorMap: Record<ShortIdPoolStatus, string> = {
    GENERATED: 'default',
    PRINTED: 'processing',
    BOUND: 'success',
    CANCELLED: 'error',
  };

  // Status name mapping
  const statusNameMap: Record<ShortIdPoolStatus, string> = {
    GENERATED: '已生成',
    PRINTED: '已打印',
    BOUND: '已绑定',
    CANCELLED: '已报废',
  };

  // Pool records columns
  const poolColumns = [
    {
      title: 'shortID',
      dataIndex: 'shortId',
      key: 'shortId',
      width: 120,
      fixed: 'left' as const,
      render: (id: number) => <Text code>{ShortIdFormatter.toDisplayFormat(id)}</Text>,
    },
    {
      title: '实体类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (type: EntityType) => type ? entityTypeNameMap[type] : '-',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: ShortIdPoolStatus) => (
        <Tag color={statusColorMap[status]}>{statusNameMap[status]}</Tag>
      ),
    },
    {
      title: '批次号',
      dataIndex: 'batchNo',
      key: 'batchNo',
      width: 180,
    },
    {
      title: '打印任务',
      dataIndex: 'printTask',
      key: 'printTask',
      width: 180,
      render: (task: any) => task?.name || '-',
    },
    {
      title: '打印时间',
      dataIndex: 'printedAt',
      key: 'printedAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: '绑定实体ID',
      dataIndex: 'entityId',
      key: 'entityId',
      width: 280,
      render: (id: string) => (id ? <Text code>{id}</Text> : '-'),
    },
    {
      title: '绑定时间',
      dataIndex: 'boundAt',
      key: 'boundAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right' as const,
      render: (_: any, record: ShortIdPoolRecord) => (
        <Space>
          {record.status !== 'CANCELLED' && record.status !== 'BOUND' && (
            <Button
              type="link"
              danger
              size="small"
              onClick={() => {
                setSelectedRecord(record);
                setCancelModalVisible(true);
              }}
            >
              报废
            </Button>
          )}
        </Space>
      ),
    },
  ];

  // Print tasks columns
  const printTasksColumns = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '实体类型',
      dataIndex: 'entityType',
      key: 'entityType',
      width: 120,
      render: (type: EntityType) => type ? entityTypeNameMap[type] : '-',
    },
    {
      title: '数量',
      dataIndex: 'count',
      key: 'count',
      width: 80,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          PENDING: 'default',
          PRINTING: 'processing',
          COMPLETED: 'success',
          FAILED: 'error',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
      render: (name: string) => name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      render: (date: string) => new Date(date).toLocaleString(),
    },
    {
      title: '完成时间',
      dataIndex: 'completedAt',
      key: 'completedAt',
      width: 180,
      render: (date: string) => (date ? new Date(date).toLocaleString() : '-'),
    },
    {
      title: '备注',
      dataIndex: 'notes',
      key: 'notes',
      width: 200,
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: PrintTask) => (
        <Space>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleExportPrintTask(record.id, record.name)}
          >
            导出CSV
          </Button>
          {record.status === 'PENDING' && (
            <Popconfirm
              title="确认标记为完成？"
              onConfirm={() => handleCompletePrintTask(record.id)}
            >
              <Button type="link" icon={<CheckCircleOutlined />}>
                完成
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>shortID池管理</Title>
      <Text type="secondary">
        统一管理所有实体类型的shortID，支持批量生成、打印任务、导出CSV
      </Text>

      {/* 统计卡片 */}
      {stats && (
        <Row gutter={16} style={{ marginTop: 24, marginBottom: 24 }}>
          <Col span={4}>
            <Card>
              <Statistic
                title="总计"
                value={stats.total}
                prefix={<DatabaseOutlined />}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已生成"
                value={stats.generated}
                valueStyle={{ color: '#8c8c8c' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已打印"
                value={stats.printed}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已绑定"
                value={stats.bound}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card>
              <Statistic
                title="已报废"
                value={stats.cancelled}
                valueStyle={{ color: '#ff4d4f' }}
              />
            </Card>
          </Col>
        </Row>
      )}

      <Card>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          {/* shortID池管理 */}
          <TabPane tab="shortID池" key="pool">
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setGenerateModalVisible(true)}
              >
                直接生成
              </Button>
              <Button
                type="primary"
                icon={<PrinterOutlined />}
                onClick={() => setCreateTaskModalVisible(true)}
              >
                创建打印任务
              </Button>
              <Select
                placeholder="实体类型"
                allowClear
                style={{ width: 150 }}
                onChange={(value) =>
                  setPoolFilters({ ...poolFilters, entityType: value })
                }
              >
                {Object.entries(entityTypeNameMap).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
              <Select
                placeholder="状态"
                allowClear
                style={{ width: 120 }}
                onChange={(value) =>
                  setPoolFilters({ ...poolFilters, status: value })
                }
              >
                {Object.entries(statusNameMap).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value}
                  </Option>
                ))}
              </Select>
              <Input
                placeholder="搜索shortID"
                prefix={<SearchOutlined />}
                allowClear
                style={{ width: 200 }}
                onChange={(e) =>
                  setPoolFilters({ ...poolFilters, search: e.target.value })
                }
              />
              <Button icon={<ReloadOutlined />} onClick={loadPoolRecords}>
                刷新
              </Button>
            </Space>

            <Table
              columns={poolColumns}
              dataSource={poolRecords}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1800 }}
              pagination={{
                current: poolPage,
                pageSize: poolPageSize,
                total: poolTotal,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setPoolPage(page);
                  setPoolPageSize(pageSize);
                },
              }}
            />
          </TabPane>

          {/* 打印任务管理 */}
          <TabPane tab="打印任务" key="tasks">
            <Space style={{ marginBottom: 16 }}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setCreateTaskModalVisible(true)}
              >
                创建打印任务
              </Button>
              <Button icon={<ReloadOutlined />} onClick={loadPrintTasks}>
                刷新
              </Button>
            </Space>

            <Table
              columns={printTasksColumns}
              dataSource={printTasks}
              rowKey="id"
              loading={loading}
              scroll={{ x: 1500 }}
              pagination={{
                current: printTasksPage,
                pageSize: printTasksPageSize,
                total: printTasksTotal,
                showSizeChanger: true,
                showTotal: (total) => `共 ${total} 条`,
                onChange: (page, pageSize) => {
                  setPrintTasksPage(page);
                  setPrintTasksPageSize(pageSize);
                },
              }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* 创建打印任务模态框 */}
      <Modal
        title="创建打印任务"
        open={createTaskModalVisible}
        onCancel={() => {
          setCreateTaskModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleCreatePrintTask}>
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="如：2025年第一批标签" />
          </Form.Item>

          <Form.Item
            label="生成数量"
            name="count"
            rules={[{ required: true, message: '请输入生成数量' }]}
          >
            <InputNumber
              min={1}
              max={10000}
              placeholder="1-10000"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="创建人" name="createdBy">
            <Input placeholder="可选" />
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <Input.TextArea rows={3} placeholder="可选" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 直接生成模态框 */}
      <Modal
        title="直接生成shortID"
        open={generateModalVisible}
        onCancel={() => {
          setGenerateModalVisible(false);
          form.resetFields();
        }}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleGenerate}>
          <Form.Item
            label="生成数量"
            name="count"
            rules={[{ required: true, message: '请输入生成数量' }]}
          >
            <InputNumber
              min={1}
              max={10000}
              placeholder="1-10000"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="批次号" name="batchNo">
            <Input placeholder="可选，如：2025年第一批" />
          </Form.Item>
        </Form>
      </Modal>

      {/* 报废shortID模态框 */}
      <Modal
        title="报废shortID"
        open={cancelModalVisible}
        onCancel={() => {
          setCancelModalVisible(false);
          cancelForm.resetFields();
          setSelectedRecord(null);
        }}
        onOk={handleCancelShortId}
        okButtonProps={{ danger: true }}
        okText="确认报废"
      >
        {selectedRecord && (
          <Descriptions column={1} bordered size="small">
            <Descriptions.Item label="shortID">
              <Text code>{ShortIdFormatter.toDisplayFormat(selectedRecord.shortId)}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="实体类型">
              {selectedRecord.entityType ? entityTypeNameMap[selectedRecord.entityType] : '未绑定'}
            </Descriptions.Item>
            <Descriptions.Item label="状态">
              <Tag color={statusColorMap[selectedRecord.status]}>
                {statusNameMap[selectedRecord.status]}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="批次号">{selectedRecord.batchNo || '-'}</Descriptions.Item>
          </Descriptions>
        )}

        <Form form={cancelForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            label="报废原因"
            name="reason"
            rules={[{ required: true, message: '请输入报废原因' }]}
          >
            <Input.TextArea rows={3} placeholder="如：标签损坏、丢失等" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShortIdPoolManagement;
