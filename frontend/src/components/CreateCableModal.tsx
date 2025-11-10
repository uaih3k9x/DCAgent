import { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Steps,
  Card,
  Descriptions,
  Space,
  Alert,
  Tag,
  Divider,
  Row,
  Col,
  Empty,
  Badge,
} from 'antd';
import {
  ApiOutlined,
  SwapOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  ScanOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { panelService } from '@/services/panelService';
import { portService } from '@/services/portService';
import { cableService } from '@/services/cableService';
import { deviceService } from '@/services/deviceService';
import { PanelVisualizer } from '@/components/PanelVisualizer';
import { parseShortId } from '@/utils/shortIdFormatter';
import type { Panel, Port, Device } from '@/types';

const { Option } = Select;
const { TextArea } = Input;

interface CreateCableModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialPanelAId?: string;
  initialPanelBId?: string;
}

// 线缆类型选项
const cableTypeOptions = [
  { value: 'CAT5E', label: 'CAT5E 网线', color: '#2db7f5' },
  { value: 'CAT6', label: 'CAT6 网线', color: '#108ee9' },
  { value: 'CAT6A', label: 'CAT6A 网线', color: '#0050b3' },
  { value: 'CAT7', label: 'CAT7 网线', color: '#003a8c' },
  { value: 'FIBER_SM', label: '单模光纤', color: '#f50' },
  { value: 'FIBER_MM', label: '多模光纤', color: '#fa541c' },
  { value: 'QSFP_TO_SFP', label: 'QSFP转SFP', color: '#722ed1' },
  { value: 'QSFP_TO_QSFP', label: 'QSFP直连', color: '#531dab' },
  { value: 'SFP_TO_SFP', label: 'SFP直连', color: '#9254de' },
  { value: 'POWER', label: '电源线', color: '#faad14' },
  { value: 'OTHER', label: '其他', color: '#8c8c8c' },
];

export default function CreateCableModal({
  visible,
  onClose,
  onSuccess,
  initialPanelAId,
  initialPanelBId,
}: CreateCableModalProps) {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // 数据状态
  const [panels, setPanels] = useState<Panel[]>([]);
  const [devicesMap, setDevicesMap] = useState<Map<string, Device>>(new Map());
  const [portsA, setPortsA] = useState<Port[]>([]);
  const [portsB, setPortsB] = useState<Port[]>([]);

  // 选择状态
  const [selectedPanelA, setSelectedPanelA] = useState<Panel | null>(null);
  const [selectedPanelB, setSelectedPanelB] = useState<Panel | null>(null);
  const [selectedPortA, setSelectedPortA] = useState<Port | null>(null);
  const [selectedPortB, setSelectedPortB] = useState<Port | null>(null);
  const [scanInputA, setScanInputA] = useState('');
  const [scanInputB, setScanInputB] = useState('');
  const [shortIdInputA, setShortIdInputA] = useState('');
  const [shortIdInputB, setShortIdInputB] = useState('');

  useEffect(() => {
    if (visible) {
      loadPanels();
      resetForm();
    }
  }, [visible]);

  useEffect(() => {
    if (initialPanelAId && panels.length > 0) {
      handlePanelAChange(initialPanelAId);
    }
  }, [initialPanelAId, panels]);

  useEffect(() => {
    if (initialPanelBId && panels.length > 0) {
      handlePanelBChange(initialPanelBId);
    }
  }, [initialPanelBId, panels]);

  const resetForm = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedPanelA(null);
    setSelectedPanelB(null);
    setSelectedPortA(null);
    setSelectedPortB(null);
    setPortsA([]);
    setPortsB([]);
    setScanInputA('');
    setScanInputB('');
    setShortIdInputA('');
    setShortIdInputB('');
  };

  const loadPanels = async () => {
    try {
      const data = await panelService.getAll();
      setPanels(data);

      // 预加载所有设备信息
      const deviceIds = [...new Set(data.map((p) => p.deviceId).filter(Boolean))];
      const devicesData = await Promise.all(
        deviceIds.map((id) => deviceService.getById(id!))
      );
      const devMap = new Map<string, Device>();
      devicesData.forEach((dev) => {
        if (dev) devMap.set(dev.id, dev);
      });
      setDevicesMap(devMap);
    } catch (error) {
      console.error('Failed to load panels:', error);
      message.error('加载面板列表失败');
    }
  };

  const handlePanelAChange = async (panelId: string) => {
    const panel = panels.find((p) => p.id === panelId);
    setSelectedPanelA(panel || null);
    setSelectedPortA(null);

    if (panelId) {
      try {
        const ports = await portService.getByPanel(panelId);
        setPortsA(ports);

        const availablePorts = ports.filter((p) => p.status === 'AVAILABLE');
        if (availablePorts.length === 0) {
          message.warning('该面板没有可用端口');
        }
      } catch (error) {
        console.error('Failed to load ports:', error);
        message.error('加载端口列表失败');
      }
    } else {
      setPortsA([]);
    }
  };

  const handlePanelBChange = async (panelId: string) => {
    const panel = panels.find((p) => p.id === panelId);
    setSelectedPanelB(panel || null);
    setSelectedPortB(null);

    if (panelId) {
      try {
        const ports = await portService.getByPanel(panelId);
        setPortsB(ports);

        const availablePorts = ports.filter((p) => p.status === 'AVAILABLE');
        if (availablePorts.length === 0) {
          message.warning('该面板没有可用端口');
        }
      } catch (error) {
        console.error('Failed to load ports:', error);
        message.error('加载端口列表失败');
      }
    } else {
      setPortsB([]);
    }
  };

  const handlePortAClick = (port: Port) => {
    if (port.status !== 'AVAILABLE') {
      message.warning(`端口 ${port.number} 状态为 ${port.status}，无法选择`);
      return;
    }
    setSelectedPortA(port);
  };

  const handlePortBClick = (port: Port) => {
    if (port.status !== 'AVAILABLE') {
      message.warning(`端口 ${port.number} 状态为 ${port.status}，无法选择`);
      return;
    }
    setSelectedPortB(port);
  };

  // 处理扫码输入（面板A）- 仅在 Enter 或失焦时触发
  const handleScanInputA = async (value: string) => {
    if (!value.trim()) return;

    try {
      // 支持 E-00001 格式或纯数字格式
      const shortId = parseShortId(value.trim());
      const panel = await panelService.getByShortId(shortId);
      if (panel) {
        message.success(`已加载面板：${panel.name}`);
        await handlePanelAChange(panel.id);
      }
    } catch (error: any) {
      console.error('Failed to load panel by shortId:', error);
      if (error.message?.includes('无效的shortID格式')) {
        message.error('请输入有效的ID格式（如：E-00001 或 1）');
      } else {
        message.error('未找到该ID对应的面板');
      }
    }
  };

  // 处理扫码输入（面板B）- 仅在 Enter 或失焦时触发
  const handleScanInputB = async (value: string) => {
    if (!value.trim()) return;

    try {
      // 支持 E-00001 格式或纯数字格式
      const shortId = parseShortId(value.trim());
      const panel = await panelService.getByShortId(shortId);
      if (panel) {
        message.success(`已加载面板：${panel.name}`);
        await handlePanelBChange(panel.id);
      }
    } catch (error: any) {
      console.error('Failed to load panel by shortId:', error);
      if (error.message?.includes('无效的shortID格式')) {
        message.error('请输入有效的ID格式（如：E-00001 或 1）');
      } else {
        message.error('未找到该ID对应的面板');
      }
    }
  };

  // 处理端点A的ShortID输入 - 检查是否已被线缆使用
  const handleShortIdAInput = async (value: string) => {
    if (!value.trim()) return;

    try {
      const shortId = parseShortId(value.trim());
      const result = await cableService.getCableEndpointsByShortId(shortId);

      if (result && result.cable) {
        const endpoints = result.cable.endpoints || [];

        // 检查线缆是否已有两个端点（完整线缆）
        if (endpoints.length >= 2) {
          // 完整线缆，提示将连接到对端口
          message.success(`找到已存在的完整线缆，将连接到该线缆的对端端口`);

          // 自动填充线缆信息
          form.setFieldsValue({
            shortIdA: shortId,
            label: result.cable.label || '',
            type: result.cable.type,
            length: result.cable.length,
            color: result.cable.color || '',
            notes: result.cable.notes || '',
          });
          return;
        }

        // 只有一个端点，提示将连接到该线缆
        message.success(`找到已存在的线缆端点，提交时将连接到该线缆`);

        // 填充线缆信息作为参考
        form.setFieldsValue({
          shortIdA: shortId,
          label: result.cable.label || '',
          type: result.cable.type,
          length: result.cable.length,
          color: result.cable.color || '',
          notes: result.cable.notes || '',
        });
      } else {
        // shortID未被使用，这是正常的新建流程
        form.setFieldValue('shortIdA', shortId);
      }
    } catch (error: any) {
      console.error('Failed to check shortId:', error);
      if (error.message?.includes('无效的shortID格式')) {
        message.error('请输入有效的ID格式（如：E-00001 或 1）');
      } else {
        // 404错误说明shortID未被使用，这是正常的
        try {
          const shortId = parseShortId(value.trim());
          form.setFieldValue('shortIdA', shortId);
        } catch (e) {
          // ignore
        }
      }
    }
  };

  // 处理端点B的ShortID输入
  const handleShortIdBInput = async (value: string) => {
    if (!value.trim()) return;

    try {
      const shortId = parseShortId(value.trim());
      form.setFieldValue('shortIdB', shortId);
    } catch (error: any) {
      if (error.message?.includes('无效的shortID格式')) {
        message.error('请输入有效的ID格式（如：E-00001 或 1）');
      }
    }
  };

  const handleNext = async () => {
    if (!selectedPortA || !selectedPortB) {
      message.error('请在两个面板上各选择一个端口');
      return;
    }
    setCurrentStep(1);
  };

  const handlePrev = () => {
    setCurrentStep(0);
  };

  // 格式化端口显示信息（包含设备和位置）
  const formatPortInfo = (panel: Panel | null, port: Port | null) => {
    if (!panel || !port) return '';

    const device = panel.deviceId ? devicesMap.get(panel.deviceId) : null;
    const parts: string[] = [];

    // 设备名称
    if (device) {
      parts.push(device.name);

      // 位置信息
      const locationParts: string[] = [];
      if (device.cabinet?.room?.dataCenter?.name) {
        locationParts.push(device.cabinet.room.dataCenter.name);
      }
      if (device.cabinet?.room?.name) {
        locationParts.push(device.cabinet.room.name);
      }
      if (device.cabinet?.name) {
        locationParts.push(device.cabinet.name);
      }
      if (locationParts.length > 0) {
        parts.push(`[${locationParts.join(' > ')}]`);
      }
    }

    // 面板名称
    parts.push(panel.name);

    // 端口信息
    const portInfo = port.label || `端口 ${port.number}`;
    parts.push(portInfo);

    // 端口类型
    if (port.portType) {
      parts.push(`(${port.portType})`);
    }

    return parts.join(' - ');
  };

  const handleSubmit = async () => {
    try {
      if (!selectedPortA || !selectedPortB) {
        message.error('请选择两个端口');
        return;
      }

      await form.validateFields();
      const values = form.getFieldsValue();

      // 验证shortID是否已填写
      if (!values.shortIdA || !values.shortIdB) {
        message.error('请输入两端的shortID');
        return;
      }

      setLoading(true);

      // 检查是否有已存在的线缆端点
      let existingCableEndpointA = null;
      let existingCableEndpointB = null;
      let isFullCableA = false;
      let isFullCableB = false;

      try {
        const resultA = await cableService.getCableEndpointsByShortId(values.shortIdA);
        if (resultA && resultA.cable) {
          const endpoints = resultA.cable.endpoints || [];
          if (endpoints.length >= 2) {
            // 完整线缆，标记但不阻止
            isFullCableA = true;
            existingCableEndpointA = resultA;
          } else {
            existingCableEndpointA = resultA;
          }
        }
      } catch (error) {
        // 404 说明不存在，继续
      }

      try {
        const resultB = await cableService.getCableEndpointsByShortId(values.shortIdB);
        if (resultB && resultB.cable) {
          const endpoints = resultB.cable.endpoints || [];
          if (endpoints.length >= 2) {
            // 完整线缆，标记但不阻止
            isFullCableB = true;
            existingCableEndpointB = resultB;
          } else {
            existingCableEndpointB = resultB;
          }
        }
      } catch (error) {
        // 404 说明不存在，继续
      }

      // 判断使用哪种创建方式
      if (existingCableEndpointA || existingCableEndpointB) {
        // 有已存在的端点，使用单端连接
        const existingEndpoint = existingCableEndpointA || existingCableEndpointB;
        const newPort = existingCableEndpointA ? selectedPortB : selectedPortA;
        const newShortId = existingCableEndpointA ? values.shortIdB : values.shortIdA;
        const isFullCable = isFullCableA || isFullCableB;

        if (isFullCable) {
          message.info('检测到已存在的完整线缆，将连接到该线缆的对端端口');
        } else {
          message.info('检测到已存在的线缆端点，将连接到该线缆');
        }

        await cableService.connectSinglePort({
          portId: newPort.id,
          shortId: newShortId,
          label: values.label,
          type: values.type,
          length: values.length,
          color: values.color,
          notes: values.notes,
        });

        message.success('成功连接到已存在的线缆！');
      } else {
        // 没有已存在的端点，创建新线缆
        await cableService.create({
          label: values.label,
          type: values.type,
          length: values.length,
          color: values.color,
          notes: values.notes,
          portAId: selectedPortA.id,
          portBId: selectedPortB.id,
          shortIdA: values.shortIdA,
          shortIdB: values.shortIdB,
        });

        message.success('线缆连接创建成功！');
      }

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Failed to create cable:', error);
      message.error(error.response?.data?.error || '创建线缆连接失败');
    } finally {
      setLoading(false);
    }
  };

  const renderPanelSelector = (
    title: string,
    selectedPanel: Panel | null,
    ports: Port[],
    selectedPort: Port | null,
    onPanelChange: (panelId: string) => void,
    onPortClick: (port: Port) => void,
    sideLabel: string
  ) => {
    const device = selectedPanel?.deviceId
      ? devicesMap.get(selectedPanel.deviceId)
      : null;

    return (
      <Card
        title={
          <Space>
            <Badge status={selectedPort ? 'success' : 'default'} />
            {title}
          </Space>
        }
        style={{ height: '100%' }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="large">
          <Input
            prefix={<ScanOutlined />}
            placeholder="扫描面板二维码或输入ID（如：E-00001）"
            value={sideLabel === '面板A' ? scanInputA : scanInputB}
            onChange={(e) =>
              sideLabel === '面板A'
                ? setScanInputA(e.target.value)
                : setScanInputB(e.target.value)
            }
            onPressEnter={(e) =>
              sideLabel === '面板A'
                ? handleScanInputA((e.target as HTMLInputElement).value)
                : handleScanInputB((e.target as HTMLInputElement).value)
            }
            onBlur={(e) =>
              sideLabel === '面板A'
                ? handleScanInputA(e.target.value)
                : handleScanInputB(e.target.value)
            }
            size="large"
            allowClear
          />

          <Divider plain>或</Divider>

          <Select
            showSearch
            style={{ width: '100%' }}
            placeholder={`选择${sideLabel}`}
            value={selectedPanel?.id}
            onChange={onPanelChange}
            filterOption={(input, option) => {
              const label = option?.label;
              if (typeof label === 'string') {
                return label.toLowerCase().includes(input.toLowerCase());
              }
              return false;
            }}
          >
            {panels.map((panel) => {
              const dev = panel.deviceId ? devicesMap.get(panel.deviceId) : null;
              return (
                <Option key={panel.id} value={panel.id} label={panel.name}>
                  {panel.name} ({panel.type})
                  {dev && ` - ${dev.name}`}
                </Option>
              );
            })}
          </Select>

          {selectedPanel && device && (
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="面板">{selectedPanel.name}</Descriptions.Item>
              <Descriptions.Item label="类型">{selectedPanel.type}</Descriptions.Item>
              <Descriptions.Item label="设备">{device.name}</Descriptions.Item>
              <Descriptions.Item label="设备类型">
                <Tag color="blue">{device.type}</Tag>
              </Descriptions.Item>
            </Descriptions>
          )}

          {selectedPanel && ports.length > 0 && (
            <div>
              <Alert
                message="请在面板上点击一个可用端口（绿色）"
                type="info"
                showIcon
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  border: '1px solid #d9d9d9',
                  borderRadius: '4px',
                  padding: '16px',
                  background: '#fafafa',
                  maxHeight: '400px',
                  overflow: 'auto',
                }}
              >
                <PanelVisualizer
                  panel={selectedPanel}
                  ports={ports}
                  onPortClick={onPortClick}
                  scale={0.8}
                  labelMode="always"
                  showPortNumber={true}
                  allowEdit={false}
                />
              </div>
            </div>
          )}

          {selectedPanel && ports.length === 0 && (
            <Empty description="该面板暂无端口" />
          )}

          {selectedPort && (
            <Card
              size="small"
              title="已选择端口"
              style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>端口编号：</strong>
                  {selectedPort.number}
                </div>
                {selectedPort.label && (
                  <div>
                    <strong>标签：</strong>
                    {selectedPort.label}
                  </div>
                )}
                <div>
                  <strong>端口类型：</strong>
                  <Tag>{selectedPort.portType || '未设置'}</Tag>
                </div>
                <div>
                  <strong>状态：</strong>
                  <Tag color="green">可用</Tag>
                </div>
              </Space>
            </Card>
          )}
        </Space>
      </Card>
    );
  };

  const steps = [
    {
      title: '选择端口',
      icon: <ApiOutlined />,
    },
    {
      title: '线缆信息',
      icon: <SwapOutlined />,
    },
  ];

  return (
    <Modal
      title="创建线缆连接"
      open={visible}
      onCancel={currentStep === 0 ? onClose : handlePrev}
      width={1200}
      okText={currentStep === 0 ? '下一步' : '创建连接'}
      cancelText={currentStep === 0 ? '取消' : '上一步'}
      onOk={currentStep === 0 ? handleNext : handleSubmit}
      confirmLoading={loading}
      style={{ top: 20 }}
    >
      <Steps current={currentStep} items={steps} style={{ marginBottom: 24 }} />

      {currentStep === 0 && (
        <div>
          <Alert
            message="可视化选择端口"
            description="先选择面板，然后在面板可视化图上点击可用的端口（绿色）。需要选择两个端口才能继续。"
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
            style={{ marginBottom: 16 }}
          />

          <Row gutter={16}>
            <Col span={12}>
              {renderPanelSelector(
                '端口A（起点）',
                selectedPanelA,
                portsA,
                selectedPortA,
                handlePanelAChange,
                handlePortAClick,
                '面板A'
              )}
            </Col>
            <Col span={12}>
              {renderPanelSelector(
                '端口B（终点）',
                selectedPanelB,
                portsB,
                selectedPortB,
                handlePanelBChange,
                handlePortBClick,
                '面板B'
              )}
            </Col>
          </Row>
        </div>
      )}

      {currentStep === 1 && (
        <Form form={form} layout="vertical">
          <Alert
            message="连接预览"
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: 16 }}
            description={
              <Space direction="vertical" style={{ width: '100%' }}>
                <div>
                  <strong>端口A：</strong>
                  {formatPortInfo(selectedPanelA, selectedPortA)}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <SwapOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                </div>
                <div>
                  <strong>端口B：</strong>
                  {formatPortInfo(selectedPanelB, selectedPortB)}
                </div>
              </Space>
            }
          />

          <Alert
            message="线缆标签管理"
            description="请为线缆的两个端点分别扫码或输入shortID，用于标识和管理线缆端点"
            type="warning"
            showIcon
            icon={<WarningOutlined />}
            style={{ marginBottom: 16 }}
          />

          <Form.Item
            label={
              <Space>
                <ScanOutlined />
                端点A的ShortID
              </Space>
            }
            name="shortIdA"
            rules={[
              { required: true, message: '请输入端点A的shortID' },
            ]}
            help="请扫码或手动输入端点A的shortID标签（如：E-00001 或 1），自动检测已存在线缆"
          >
            <Input
              prefix={<ScanOutlined />}
              style={{ width: '100%' }}
              placeholder="扫码或输入shortID（如：E-00001 或 1）"
              value={shortIdInputA}
              onChange={(e) => setShortIdInputA(e.target.value)}
              onPressEnter={(e) => handleShortIdAInput((e.target as HTMLInputElement).value)}
              onBlur={(e) => handleShortIdAInput(e.target.value)}
              allowClear
            />
          </Form.Item>

          <Form.Item
            label={
              <Space>
                <ScanOutlined />
                端点B的ShortID
              </Space>
            }
            name="shortIdB"
            rules={[
              { required: true, message: '请输入端点B的shortID' },
            ]}
            help="请扫码或手动输入端点B的shortID标签（如：E-00001 或 1）"
          >
            <Input
              prefix={<ScanOutlined />}
              style={{ width: '100%' }}
              placeholder="扫码或输入shortID（如：E-00001 或 1）"
              value={shortIdInputB}
              onChange={(e) => setShortIdInputB(e.target.value)}
              onPressEnter={(e) => handleShortIdBInput((e.target as HTMLInputElement).value)}
              onBlur={(e) => handleShortIdBInput(e.target.value)}
              allowClear
            />
          </Form.Item>

          <Divider />

          <Form.Item label="线缆标签" name="label">
            <Input placeholder="例如：服务器1-交换机1" />
          </Form.Item>

          <Form.Item
            label="线缆类型"
            name="type"
            rules={[{ required: true, message: '请选择线缆类型' }]}
            initialValue="CAT6"
          >
            <Select placeholder="选择线缆类型">
              {cableTypeOptions.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Tag color={opt.color}>{opt.label}</Tag>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="线缆长度（米）" name="length">
            <InputNumber
              min={0.1}
              max={1000}
              step={0.5}
              style={{ width: '100%' }}
              placeholder="例如：3.5"
            />
          </Form.Item>

          <Form.Item label="线缆颜色" name="color">
            <Input placeholder="例如：蓝色、红色" />
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <TextArea rows={3} placeholder="其他说明信息" />
          </Form.Item>
        </Form>
      )}
    </Modal>
  );
}
