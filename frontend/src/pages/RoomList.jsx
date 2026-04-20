import { useEffect, useState } from 'react';
import { Row, Col, Card, Select, Slider, Button, DatePicker, Typography, Tag, Space, InputNumber, message } from 'antd';
import { ShoppingCartOutlined, SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { roomAPI, cartAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const RoomList = () => {
  const navigate = useNavigate();
  const { user, isCustomer } = useAuth();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    type: undefined,
    minPrice: 0,
    maxPrice: 10000000,
  });
  const [dateRange, setDateRange] = useState(null);
  const [addingToCart, setAddingToCart] = useState(null);

  useEffect(() => {
    fetchRooms();
  }, [filters, dateRange]);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      if (dateRange && dateRange[0] && dateRange[1]) {
        const res = await roomAPI.getAvailable({
          checkIn: dateRange[0].format('YYYY-MM-DD'),
          checkOut: dateRange[1].format('YYYY-MM-DD'),
          type: filters.type,
        });
        setRooms(res.data);
      } else {
        const res = await roomAPI.getAll({
          type: filters.type,
          minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
          maxPrice: filters.maxPrice < 10000000 ? filters.maxPrice : undefined,
        });
        setRooms(res.data);
      }
    } catch (err) {
      message.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (room) => {
    if (!user) {
      message.warning('Please login to add rooms to cart');
      navigate('/login');
      return;
    }

    if (!isCustomer) {
      message.warning('Only customers can book rooms');
      return;
    }

    if (!dateRange || !dateRange[0] || !dateRange[1]) {
      message.warning('Please select check-in and check-out dates first');
      return;
    }

    setAddingToCart(room.id);
    try {
      await cartAPI.add({
        roomId: room.id,
        checkInDate: dateRange[0].format('YYYY-MM-DD'),
        checkOutDate: dateRange[1].format('YYYY-MM-DD'),
      });
      message.success(`Added "${room.name}" to cart!`);
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const roomTypeColors = {
    SINGLE: 'blue',
    DOUBLE: 'green',
    DELUXE: 'orange',
    SUITE: 'purple',
  };

  const roomTypeLabels = {
    SINGLE: 'Single',
    DOUBLE: 'Double',
    DELUXE: 'Deluxe',
    SUITE: 'Suite',
  };

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>Our Rooms</Title>

      {/* Filters */}
      <Card style={{ marginBottom: 24 }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={8}>
            <Text strong>Check-in / Check-out</Text>
            <br />
            <RangePicker
              style={{ width: '100%', marginTop: 4 }}
              value={dateRange}
              onChange={setDateRange}
              disabledDate={(current) => current && current < dayjs().startOf('day')}
              placeholder={['Check-in', 'Check-out']}
            />
          </Col>
          <Col xs={24} md={5}>
            <Text strong>Room Type</Text>
            <br />
            <Select
              style={{ width: '100%', marginTop: 4 }}
              allowClear
              placeholder="All types"
              value={filters.type}
              onChange={(type) => setFilters({ ...filters, type })}
            >
              <Select.Option value="SINGLE">Single</Select.Option>
              <Select.Option value="DOUBLE">Double</Select.Option>
              <Select.Option value="DELUXE">Deluxe</Select.Option>
              <Select.Option value="SUITE">Suite</Select.Option>
            </Select>
          </Col>
          <Col xs={24} md={9}>
            <Text strong>Price Range: {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}</Text>
            <Slider
              range
              min={0}
              max={10000000}
              step={100000}
              value={[filters.minPrice, filters.maxPrice]}
              onChange={([minPrice, maxPrice]) => setFilters({ ...filters, minPrice, maxPrice })}
            />
          </Col>
        </Row>
      </Card>

      {/* Room Grid */}
      <Row gutter={[24, 24]}>
        {rooms.map((room) => (
          <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
            <Card
              hoverable
              cover={
                <div
                  style={{
                    height: 200,
                    background: `url(${room.imageUrl}) center/cover no-repeat`,
                    backgroundColor: '#f0f0f0',
                    position: 'relative',
                  }}
                >
                  <Tag
                    color={roomTypeColors[room.type]}
                    style={{ position: 'absolute', top: 8, left: 8 }}
                  >
                    {roomTypeLabels[room.type]}
                  </Tag>
                  {room.status === 'OCCUPIED' && (
                    <Tag color="red" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Occupied
                    </Tag>
                  )}
                  {room.status === 'MAINTENANCE' && (
                    <Tag color="default" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Maintenance
                    </Tag>
                  )}
                </div>
              }
            >
              <Card.Meta
                title={room.name}
                description={
                  <>
                    <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                      {formatPrice(room.price)}<Text style={{ fontSize: 12 }}>/night</Text>
                    </Text>
                    <br />
                    <Text type="secondary">Max {room.maxGuests} guests</Text>
                    <br />
                    <Text type="secondary" ellipsis>{room.description}</Text>
                    <div style={{ marginTop: 12 }}>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        block
                        loading={addingToCart === room.id}
                        onClick={() => handleAddToCart(room)}
                        disabled={room.status === 'MAINTENANCE'}
                      >
                        Add to Cart
                      </Button>
                    </div>
                  </>
                }
              />
            </Card>
          </Col>
        ))}
      </Row>

      {rooms.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Text type="secondary" style={{ fontSize: 16 }}>No rooms found matching your criteria.</Text>
        </div>
      )}
    </div>
  );
};

export default RoomList;
