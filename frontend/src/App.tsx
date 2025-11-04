import { Routes, Route } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Layout/AppHeader';
import AppSidebar from './components/Layout/AppSidebar';
import Dashboard from './pages/Dashboard';
import DataCenterList from './pages/DataCenterList';
import RoomList from './pages/RoomList';
import CabinetList from './pages/CabinetList';
import DeviceList from './pages/DeviceList';
import PanelList from './pages/PanelList';
import PortManagementPage from './pages/PortManagementPage';
import CableTopology from './pages/CableTopology';

const { Content } = Layout;

function App() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <AppHeader />
      <Layout>
        <AppSidebar />
        <Layout style={{ padding: '24px' }}>
          <Content
            style={{
              padding: 24,
              margin: 0,
              minHeight: 280,
              background: '#fff',
              borderRadius: 8,
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/datacenters" element={<DataCenterList />} />
              <Route path="/rooms" element={<RoomList />} />
              <Route path="/cabinets" element={<CabinetList />} />
              <Route path="/devices" element={<DeviceList />} />
              <Route path="/panels" element={<PanelList />} />
              <Route path="/ports" element={<PortManagementPage />} />
              <Route path="/topology" element={<CableTopology />} />
            </Routes>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
}

export default App;
