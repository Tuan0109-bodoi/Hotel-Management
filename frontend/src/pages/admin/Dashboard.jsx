import { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Typography } from 'antd';
import { HomeOutlined, UnorderedListOutlined, DollarOutlined, UserOutlined } from '@ant-design/icons';
import { roomAPI, bookingAPI } from '../../services/api';

const { Title } = Typography;

const Dashboard = () => {
  const [stats, setStats] = useState({ rooms: 0, bookings: 0, revenue: 0, available: 0 });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [roomsRes, bookingsRes] = await Promise.all([
          roomAPI.getAll(),
          bookingAPI.getAll(),
        ]);
        const rooms = roomsRes.data;
        const bookings = bookingsRes.data;
        const revenue = bookings
          .filter((b) => b.status !== 'CANCELLED')
          .reduce((sum, b) => sum + b.totalAmount, 0);
        const available = rooms.filter((r) => r.status === 'AVAILABLE').length;
        setStats({ rooms: rooms.length, bookings: bookings.length, revenue, available });
      } catch (err) {
        // ignore
      }
    };
    fetchStats();
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      <Title level={3}>Dashboard</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Rooms" value={stats.rooms} prefix={<HomeOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Available Rooms" value={stats.available} prefix={<HomeOutlined />} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Total Bookings" value={stats.bookings} prefix={<UnorderedListOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic title="Revenue" value={formatPrice(stats.revenue)} prefix={<DollarOutlined />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
