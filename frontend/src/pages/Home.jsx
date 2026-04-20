import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col, Card, Space } from 'antd';
import { HomeOutlined, SafetyCertificateOutlined, StarOutlined } from '@ant-design/icons';
import { roomAPI } from '../services/api';
import { useEffect, useState } from 'react';

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const navigate = useNavigate();
  const [featuredRooms, setFeaturedRooms] = useState([]);

  useEffect(() => {
    roomAPI.getAll().then((res) => {
      setFeaturedRooms(res.data.slice(0, 4));
    }).catch(() => {});
  }, []);

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          padding: '80px 40px',
          textAlign: 'center',
          borderRadius: '0 0 20px 20px',
          marginBottom: 40,
        }}
      >
        <Title level={1} style={{ color: '#fff', marginBottom: 16 }}>
          Welcome to Grand Hotel
        </Title>
        <Paragraph style={{ color: '#e0e0e0', fontSize: 18, marginBottom: 32 }}>
          Experience luxury and comfort at its finest. Book your perfect room today.
        </Paragraph>
        <Space size="large">
          <Button type="primary" size="large" onClick={() => navigate('/rooms')}>
            Browse Rooms
          </Button>
          <Button size="large" ghost style={{ color: '#fff', borderColor: '#fff' }} onClick={() => navigate('/register')}>
            Book Now
          </Button>
        </Space>
      </div>

      {/* Features */}
      <Row gutter={[24, 24]} style={{ maxWidth: 1000, margin: '0 auto 60px' }}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <SafetyCertificateOutlined style={{ fontSize: 40, color: '#1890ff' }} />
            <Title level={4}>Secure Booking</Title>
            <Text type="secondary">Safe and secure reservation process</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <StarOutlined style={{ fontSize: 40, color: '#faad14' }} />
            <Title level={4}>Premium Quality</Title>
            <Text type="secondary">Top-rated rooms and services</Text>
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
            <HomeOutlined style={{ fontSize: 40, color: '#52c41a' }} />
            <Title level={4}>Comfortable Stay</Title>
            <Text type="secondary">Modern amenities for your comfort</Text>
          </Card>
        </Col>
      </Row>

      {/* Featured Rooms */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 20px' }}>
        <Title level={2} style={{ textAlign: 'center', marginBottom: 32 }}>Featured Rooms</Title>
        <Row gutter={[24, 24]}>
          {featuredRooms.map((room) => (
            <Col xs={24} sm={12} md={6} key={room.id}>
              <Card
                hoverable
                cover={
                  <div
                    style={{
                      height: 180,
                      background: `url(${room.imageUrl}) center/cover no-repeat`,
                      backgroundColor: '#f0f0f0',
                    }}
                  />
                }
                onClick={() => navigate('/rooms')}
              >
                <Card.Meta
                  title={room.name}
                  description={
                    <>
                      <Text strong style={{ color: '#1890ff' }}>{formatPrice(room.price)}/night</Text>
                      <br />
                      <Text type="secondary">{room.type} - Max {room.maxGuests} guests</Text>
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Home;
