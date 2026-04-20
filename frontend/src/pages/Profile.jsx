import { useEffect, useState } from 'react';
import { Tabs, Card, Descriptions, Table, Tag, Button, Typography, Popconfirm, Empty, message, Badge } from 'antd';
import { UserOutlined, ShoppingCartOutlined, FileTextOutlined, DeleteOutlined, ArrowRightOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI, cartAPI, bookingAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const statusColors = {
  PENDING: 'orange',
  CHECKED_IN: 'blue',
  CHECKED_OUT: 'green',
  CANCELLED: 'red',
};

const statusLabels = {
  PENDING: 'Pending',
  CHECKED_IN: 'Checked In',
  CHECKED_OUT: 'Checked Out',
  CANCELLED: 'Cancelled',
};

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('info');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [userRes, cartRes, bookingsRes] = await Promise.all([
        authAPI.getMe(),
        cartAPI.get(),
        bookingAPI.getMy(),
      ]);
      setUserInfo(userRes.data);
      setCartData(cartRes.data);
      setBookings(bookingsRes.data);
    } catch (err) {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveCartItem = async (id) => {
    try {
      await cartAPI.remove(id);
      message.success('Item removed');
      fetchAll();
    } catch (err) {
      message.error('Failed to remove item');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  // Tab 1: User Info
  const UserInfoTab = () => (
    <Card>
      <Descriptions column={1} bordered size="middle">
        <Descriptions.Item label="Name">{userInfo?.name}</Descriptions.Item>
        <Descriptions.Item label="Email">{userInfo?.email}</Descriptions.Item>
        <Descriptions.Item label="Phone">{userInfo?.phone || 'Not set'}</Descriptions.Item>
        <Descriptions.Item label="Role">
          <Tag color={userInfo?.role === 'ADMIN' ? 'red' : 'blue'}>{userInfo?.role}</Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Joined">{userInfo?.createdAt ? dayjs(userInfo.createdAt).format('DD/MM/YYYY') : '-'}</Descriptions.Item>
      </Descriptions>
    </Card>
  );

  // Tab 2: Cart
  const cartColumns = [
    {
      title: 'Room',
      dataIndex: ['room', 'name'],
      key: 'roomName',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          <br />
          <Text type="secondary">{record.room?.type} - Max {record.room?.maxGuests} guests</Text>
        </div>
      ),
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Nights',
      key: 'nights',
      render: (_, record) => {
        const nights = dayjs(record.checkOutDate).diff(dayjs(record.checkInDate), 'day');
        return `${nights} night${nights > 1 ? 's' : ''}`;
      },
    },
    {
      title: 'Price/Night',
      key: 'price',
      render: (_, record) => formatPrice(record.room?.price),
    },
    {
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => {
        const nights = dayjs(record.checkOutDate).diff(dayjs(record.checkInDate), 'day');
        return <Text strong>{formatPrice(record.room?.price * nights)}</Text>;
      },
    },
    {
      title: '',
      key: 'action',
      width: 60,
      render: (_, record) => (
        <Popconfirm title="Remove this item?" onConfirm={() => handleRemoveCartItem(record.id)}>
          <Button danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  const CartTab = () => (
    <>
      {cartData.items.length === 0 ? (
        <Card>
          <Empty description="Your cart is empty">
            <Button type="primary" onClick={() => navigate('/rooms')}>
              Browse Rooms
            </Button>
          </Empty>
        </Card>
      ) : (
        <>
          <Table
            columns={cartColumns}
            dataSource={cartData.items}
            rowKey="id"
            pagination={false}
            size="middle"
          />
          <Card style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Text style={{ fontSize: 15 }}>Total ({cartData.items.length} room{cartData.items.length > 1 ? 's' : ''}): </Text>
                <Text strong style={{ fontSize: 22, color: '#1890ff' }}>
                  {formatPrice(cartData.totalAmount)}
                </Text>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate('/checkout')}
              >
                Checkout
              </Button>
            </div>
          </Card>
        </>
      )}
    </>
  );

  // Tab 3: Bookings
  const bookingColumns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      render: (id) => `#${id}`,
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Rooms',
      key: 'rooms',
      render: (_, record) => `${record.bookingDetails?.length || 0} room(s)`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      render: (amount) => <Text strong>{formatPrice(amount)}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      render: (date) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
  ];

  const expandedRowRender = (record) => (
    <Table
      columns={[
        { title: 'Room', dataIndex: ['room', 'name'] },
        { title: 'Type', dataIndex: ['room', 'type'] },
        { title: 'Price/Night', render: (_, r) => formatPrice(r.priceAtBooking) },
      ]}
      dataSource={record.bookingDetails}
      rowKey="id"
      pagination={false}
      size="small"
    />
  );

  const BookingsTab = () => (
    <>
      {bookings.length === 0 ? (
        <Card>
          <Empty description="No bookings yet">
            <Button type="primary" onClick={() => navigate('/rooms')}>
              Browse Rooms
            </Button>
          </Empty>
        </Card>
      ) : (
        <Table
          columns={bookingColumns}
          dataSource={bookings}
          rowKey="id"
          expandable={{ expandedRowRender }}
          pagination={{ pageSize: 10 }}
          size="middle"
        />
      )}
    </>
  );

  const tabItems = [
    {
      key: 'info',
      label: <span><UserOutlined /> My Info</span>,
      children: <UserInfoTab />,
    },
    {
      key: 'cart',
      label: (
        <span>
          <ShoppingCartOutlined /> Cart
          {cartData.items.length > 0 && (
            <Badge count={cartData.items.length} size="small" style={{ marginLeft: 6 }} />
          )}
        </span>
      ),
      children: <CartTab />,
    },
    {
      key: 'bookings',
      label: <span><FileTextOutlined /> My Bookings</span>,
      children: <BookingsTab />,
    },
  ];

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>My Account</Title>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={tabItems}
        size="large"
      />
    </div>
  );
};

export default Profile;
