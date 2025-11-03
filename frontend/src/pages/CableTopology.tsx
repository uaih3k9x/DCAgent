import { Typography, Card } from 'antd';

const { Title } = Typography;

export default function CableTopology() {
  return (
    <div>
      <Title level={2}>线缆拓扑图</Title>
      <Card>
        <div
          style={{
            height: '600px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f5f5f5',
            borderRadius: '8px',
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <Title level={4} type="secondary">
              拓扑图可视化
            </Title>
            <p style={{ color: '#8c8c8c' }}>
              即将集成 React Flow 实现网状拓扑图展示
            </p>
            <p style={{ color: '#8c8c8c' }}>
              功能包括：端口连接可视化、面板关系网络、交互式查询
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
