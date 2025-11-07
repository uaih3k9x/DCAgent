import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  InputNumber,
  Button,
  Space,
  message,
  Steps,
  Descriptions,
  Alert,
  Spin,
  Typography,
} from 'antd';
import { ScanOutlined, CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';
import { cableService } from '@/services/cableService';
import { portService } from '@/services/portService';

const { Title, Text } = Typography;
const { Step } = Steps;
const { Option } = Select;

interface PortInfo {
  id: string;
  shortId: number;
  number: string;
  label?: string;
  status: string;
  panel: {
    id: string;
    name: string;
    device: {
      id: string;
      name: string;
      cabinet: {
        id: string;
        name: string;
        room: {
          id: string;
          name: string;
          dataCenter: {
            id: string;
            name: string;
          };
        };
      };
    };
  };
}

const CableManualInventory: React.FC = () => {
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [scanInputA, setScanInputA] = useState('');
  const [scanInputB, setScanInputB] = useState('');
  const [portA, setPortA] = useState<PortInfo | null>(null);
  const [portB, setPortB] = useState<PortInfo | null>(null);
  const [checkingA, setCheckingA] = useState(false);
  const [checkingB, setCheckingB] = useState(false);

  // 处理端口A的扫码输入
  const handleScanPortA = async (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const shortId = parseInt(trimmedValue, 10);
    if (isNaN(shortId)) {
      message.error('请输入有效的数字ID');
      return;
    }

    setCheckingA(true);
    try {
      const port = await portService.getByShortId(shortId);
      if (!port) {
        message.error(`未找到shortID为 ${shortId} 的端口`);
        setCheckingA(false);
        return;
      }

      if (port.status === 'OCCUPIED') {
        message.warning(`端口 ${port.label || port.number} 已被占用`);
      }

      setPortA(port);
      message.success(`已加载端口A: ${port.label || port.number}`);
      setScanInputA('');
    } catch (error) {
      console.error('Error loading port A:', error);
      message.error('加载端口A失败');
    } finally {
      setCheckingA(false);
    }
  };

  // 处理端口B的扫码输入
  const handleScanPortB = async (value: string) => {
    const trimmedValue = value.trim();
    if (!trimmedValue) return;

    const shortId = parseInt(trimmedValue, 10);
    if (isNaN(shortId)) {
      message.error('请输入有效的数字ID');
      return;
    }

    setCheckingB(true);
    try {
      const port = await portService.getByShortId(shortId);
      if (!port) {
        message.error(`未找到shortID为 ${shortId} 的端口`);
        setCheckingB(false);
        return;
      }

      if (port.status === 'OCCUPIED') {
        message.warning(`端口 ${port.label || port.number} 已被占用`);
      }

      setPortB(port);
      message.success(`已加载端口B: ${port.label || port.number}`);
      setScanInputB('');
    } catch (error) {
      console.error('Error loading port B:', error);
      message.error('加载端口B失败');
    } finally {
      setCheckingB(false);
    }
  };

  // 提交入库
  const handleSubmit = async (values: any) => {
    if (!portA || !portB) {
      message.error('请先扫描两端端口');
      return;
    }

    if (portA.shortId === portB.shortId) {
      message.error('线缆两端不能是同一个端口');
      return;
    }

    setLoading(true);
    try {
      await cableService.manualInventory({
        shortIdA: portA.shortId,
        shortIdB: portB.shortId,
        label: values.label,
        type: values.type,
        length: values.length,
        color: values.color,
        notes: values.notes,
      });

      message.success('线缆入库成功');

      // 重置表单
      form.resetFields();
      setPortA(null);
      setPortB(null);
      setScanInputA('');
      setScanInputB('');
      setCurrentStep(0);
    } catch (error: any) {
      console.error('Error creating manual inventory:', error);
      message.error(error.response?.data?.error || '线缆入库失败');
    } finally {
      setLoading(false);
    }
  };

  // 下一步
  const handleNext = () => {
    if (currentStep === 0) {
      if (!portA || !portB) {
        message.warning('请先扫描两端端口');
        return;
      }
      setCurrentStep(1);
    }
  };

  // 上一步
  const handlePrev = () => {
    setCurrentStep(0);
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    setPortA(null);
    setPortB(null);
    setScanInputA('');
    setScanInputB('');
    setCurrentStep(0);
  };

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Title level={2}>线缆手动入库</Title>
        <Text type="secondary">
          通过扫描预先贴好标签的线缆两端端口shortID来完成入库
        </Text>

        <Steps current={currentStep} style={{ marginTop: 24, marginBottom: 32 }}>
          <Step title="扫描端口" description="扫描线缆两端端口" />
          <Step title="填写信息" description="填写线缆详细信息" />
          <Step title="完成" description="确认并提交" />
        </Steps>

        {currentStep === 0 && (
          <div>
            <Alert
              message="操作说明"
              description="请使用扫码器依次扫描线缆两端的端口二维码，或手动输入端口的shortID。"
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {/* 端口A */}
              <Card title="端口A（起始端）" size="small">
                <Form.Item label="扫描端口shortID">
                  <Input
                    prefix={<ScanOutlined />}
                    placeholder="扫描端口二维码或输入shortID"
                    value={scanInputA}
                    onChange={(e) => setScanInputA(e.target.value)}
                    onPressEnter={(e) => handleScanPortA((e.target as HTMLInputElement).value)}
                    size="large"
                    allowClear
                    suffix={checkingA && <Spin size="small" />}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleScanPortA(scanInputA)}
                    style={{ marginTop: 8 }}
                    loading={checkingA}
                  >
                    确认
                  </Button>
                </Form.Item>

                {portA && (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="端口">
                      {portA.label || portA.number}
                    </Descriptions.Item>
                    <Descriptions.Item label="shortID">
                      {portA.shortId}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {portA.status === 'AVAILABLE' ? (
                        <Text type="success">
                          <CheckCircleOutlined /> 可用
                        </Text>
                      ) : (
                        <Text type="warning">
                          <WarningOutlined /> {portA.status}
                        </Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属面板">
                      {portA.panel.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属设备">
                      {portA.panel.device.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="位置">
                      {portA.panel.device.cabinet.room.dataCenter.name} / {portA.panel.device.cabinet.room.name} / {portA.panel.device.cabinet.name}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>

              {/* 端口B */}
              <Card title="端口B（终点端）" size="small">
                <Form.Item label="扫描端口shortID">
                  <Input
                    prefix={<ScanOutlined />}
                    placeholder="扫描端口二维码或输入shortID"
                    value={scanInputB}
                    onChange={(e) => setScanInputB(e.target.value)}
                    onPressEnter={(e) => handleScanPortB((e.target as HTMLInputElement).value)}
                    size="large"
                    allowClear
                    suffix={checkingB && <Spin size="small" />}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleScanPortB(scanInputB)}
                    style={{ marginTop: 8 }}
                    loading={checkingB}
                  >
                    确认
                  </Button>
                </Form.Item>

                {portB && (
                  <Descriptions bordered column={1} size="small">
                    <Descriptions.Item label="端口">
                      {portB.label || portB.number}
                    </Descriptions.Item>
                    <Descriptions.Item label="shortID">
                      {portB.shortId}
                    </Descriptions.Item>
                    <Descriptions.Item label="状态">
                      {portB.status === 'AVAILABLE' ? (
                        <Text type="success">
                          <CheckCircleOutlined /> 可用
                        </Text>
                      ) : (
                        <Text type="warning">
                          <WarningOutlined /> {portB.status}
                        </Text>
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属面板">
                      {portB.panel.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="所属设备">
                      {portB.panel.device.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="位置">
                      {portB.panel.device.cabinet.room.dataCenter.name} / {portB.panel.device.cabinet.room.name} / {portB.panel.device.cabinet.name}
                    </Descriptions.Item>
                  </Descriptions>
                )}
              </Card>
            </Space>

            <div style={{ marginTop: 24, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleReset}>重置</Button>
                <Button type="primary" onClick={handleNext} disabled={!portA || !portB}>
                  下一步
                </Button>
              </Space>
            </div>
          </div>
        )}

        {currentStep === 1 && (
          <div>
            <Alert
              message="连接信息确认"
              description={`即将连接：${portA?.label || portA?.number} → ${portB?.label || portB?.number}`}
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="线缆标签"
                name="label"
              >
                <Input placeholder="可选，如 CAB-001" />
              </Form.Item>

              <Form.Item
                label="线缆类型"
                name="type"
                rules={[{ required: true, message: '请选择线缆类型' }]}
              >
                <Select placeholder="请选择线缆类型">
                  <Option value="CAT5E">CAT5E 网线</Option>
                  <Option value="CAT6">CAT6 网线</Option>
                  <Option value="CAT6A">CAT6A 网线</Option>
                  <Option value="CAT7">CAT7 网线</Option>
                  <Option value="FIBER_SM">单模光纤</Option>
                  <Option value="FIBER_MM">多模光纤</Option>
                  <Option value="QSFP_TO_SFP">QSFP转SFP分支线缆</Option>
                  <Option value="QSFP_TO_QSFP">QSFP直连</Option>
                  <Option value="SFP_TO_SFP">SFP直连</Option>
                  <Option value="POWER">电源线</Option>
                  <Option value="OTHER">其他</Option>
                </Select>
              </Form.Item>

              <Form.Item
                label="线缆长度（米）"
                name="length"
              >
                <InputNumber
                  min={0.1}
                  step={0.5}
                  placeholder="可选，如 5"
                  style={{ width: '100%' }}
                />
              </Form.Item>

              <Form.Item
                label="线缆颜色"
                name="color"
              >
                <Input placeholder="可选，如 蓝色" />
              </Form.Item>

              <Form.Item
                label="备注"
                name="notes"
              >
                <Input.TextArea rows={3} placeholder="可选" />
              </Form.Item>

              <div style={{ textAlign: 'right' }}>
                <Space>
                  <Button onClick={handlePrev}>上一步</Button>
                  <Button onClick={handleReset}>重置</Button>
                  <Button type="primary" htmlType="submit" loading={loading}>
                    提交入库
                  </Button>
                </Space>
              </div>
            </Form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default CableManualInventory;
