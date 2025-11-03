import { Layout, Typography } from 'antd';
import { DatabaseOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

export default function AppHeader() {
  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        background: '#001529',
        padding: '0 24px',
      }}
    >
      <DatabaseOutlined style={{ fontSize: '24px', color: '#fff', marginRight: '12px' }} />
      <Title level={4} style={{ color: '#fff', margin: 0 }}>
        DCAgent
      </Title>
      <span style={{ color: '#8c8c8c', marginLeft: '12px', fontSize: '14px' }}>
        見えない線を、見える化へ
      </span>
    </Header>
  );
}
