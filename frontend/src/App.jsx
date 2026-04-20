import { BrowserRouter, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Button, Typography, Avatar, Dropdown, Space } from 'antd';
import {
  HomeOutlined,
  BankOutlined,
  UserOutlined,
  LogoutOutlined,
  DashboardOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Home from './pages/Home';
import RoomList from './pages/RoomList';
import Login from './pages/Login';
import Register from './pages/Register';
import Checkout from './pages/Checkout';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/Dashboard';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

// Protected route wrapper
const ProtectedRoute = ({ children, roles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.user?.role)) return <Navigate to="/" />;
  return children;
};

// Customer Layout
const CustomerLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: 'Home' },
    { key: '/rooms', icon: <BankOutlined />, label: 'Rooms' },
    ...(user?.user?.role === 'CUSTOMER' ? [
      { key: '/profile', icon: <UserOutlined />, label: 'My Account' },
    ] : []),
  ];

  const userMenu = {
    items: [
      { key: 'profile', icon: <UserOutlined />, label: 'My Account' },
      { type: 'divider' },
      ...(user?.user?.role === 'ADMIN' ? [{ key: 'admin', icon: <DashboardOutlined />, label: 'Admin Panel' }] : []),
      { key: 'logout', icon: <LogoutOutlined />, label: 'Logout', danger: true },
    ],
    onClick: ({ key }) => {
      if (key === 'logout') { logout(); navigate('/'); }
      if (key === 'admin') navigate('/admin');
      if (key === 'profile') navigate('/profile');
    },
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Text strong style={{ color: '#fff', fontSize: 18, marginRight: 40, cursor: 'pointer' }} onClick={() => navigate('/')}>
            Grand Hotel
          </Text>
          <Menu
            theme="dark"
            mode="horizontal"
            selectedKeys={[location.pathname]}
            items={menuItems}
            onClick={({ key }) => navigate(key)}
            style={{ border: 'none' }}
          />
        </div>
        <div>
          {user ? (
            <Dropdown menu={userMenu}>
              <Space style={{ cursor: 'pointer', color: '#fff' }}>
                <Avatar icon={<UserOutlined />} />
                <Text style={{ color: '#fff' }}>{user.user?.name}</Text>
              </Space>
            </Dropdown>
          ) : (
            <Space>
              <Button type="link" style={{ color: '#fff' }} onClick={() => navigate('/login')}>Login</Button>
              <Button onClick={() => navigate('/register')}>Register</Button>
            </Space>
          )}
        </div>
      </Header>
      <Content style={{ padding: '20px', background: '#f5f5f5' }}>
        <Outlet />
      </Content>
    </Layout>
  );
};

// Admin Layout
const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { key: '/admin', icon: <DashboardOutlined />, label: 'Dashboard' },
    { key: '/admin/rooms', icon: <BankOutlined />, label: 'Rooms' },
    { key: '/admin/bookings', icon: <FileTextOutlined />, label: 'Bookings' },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={220} theme="dark">
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Text strong style={{ color: '#fff', fontSize: 16 }}>Hotel Admin</Text>
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
        <div style={{ position: 'absolute', bottom: 20, width: '100%', padding: '0 16px' }}>
          <Button
            icon={<LogoutOutlined />}
            danger
            block
            onClick={() => { logout(); navigate('/'); }}
          >
            Logout
          </Button>
        </div>
      </Sider>
      <Layout>
        <Content style={{ padding: '24px', background: '#f5f5f5', overflow: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        {/* Public + Customer routes */}
        <Route element={<CustomerLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/rooms" element={<RoomList />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/checkout" element={<ProtectedRoute roles={['CUSTOMER']}><Checkout /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute roles={['CUSTOMER']}><Profile /></ProtectedRoute>} />
        </Route>

        {/* Admin routes */}
        <Route path="/admin" element={<ProtectedRoute roles={['ADMIN']}><AdminLayout /></ProtectedRoute>}>
          <Route index element={<AdminDashboard />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="booking" element={<BookingManagement />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

export default App;
