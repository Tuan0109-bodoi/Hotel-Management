import { useEffect, useState } from 'react';
import { Card, Typography, Table, Button, Input, message, Divider, Image } from 'antd';
import { QrcodeOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { cartAPI, bookingAPI } from '../services/api';
import dayjs from 'dayjs';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const Checkout = () => {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState({ items: [], totalAmount: 0 });
  const [customerNote, setCustomerNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [bookingComplete, setBookingComplete] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await cartAPI.get();
      if (res.data.items.length === 0) {
        navigate('/cart');
      }
      setCartData(res.data);
    } catch (err) {
      message.error('Failed to load cart');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const handleConfirmBooking = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.create({ customerNote });
      setBookingComplete(res.data);
      message.success('Booking confirmed!');
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to create booking');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Room',
      dataIndex: ['room', 'name'],
      key: 'roomName',
    },
    {
      title: 'Check-in',
      dataIndex: 'checkInDate',
      key: 'checkIn',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Check-out',
      dataIndex: 'checkOutDate',
      key: 'checkOut',
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
      title: 'Subtotal',
      key: 'subtotal',
      render: (_, record) => {
        const nights = dayjs(record.checkOutDate).diff(dayjs(record.checkInDate), 'day');
        return formatPrice(record.room?.price * nights);
      },
    },
  ];

  // Booking complete screen
  if (bookingComplete) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '20px' }}>
        <Card style={{ textAlign: 'center' }}>
          <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
          <Title level={3}>Booking Confirmed!</Title>
          <Paragraph>
            Your booking has been created successfully. Booking ID: <Text strong>#{bookingComplete.id}</Text>
          </Paragraph>
          <Paragraph>
            Total Amount: <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
              {formatPrice(bookingComplete.totalAmount)}
            </Text>
          </Paragraph>

          <Divider>Payment via QR Code</Divider>

          <Paragraph type="secondary">
            Please scan the QR code below to complete your bank transfer payment.
          </Paragraph>

          <div style={{ textAlign: 'center', margin: '20px 0' }}>
            <Image
              src="/qr-payment.png"
              alt="Payment QR Code"
              width={250}
              height={250}
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
              style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 8 }}
            />
          </div>

          <Paragraph type="secondary" style={{ fontSize: 12 }}>
            After payment, your booking status will be updated by our staff.
          </Paragraph>

          <div style={{ marginTop: 24 }}>
            <Button type="primary" onClick={() => navigate('/profile')}>
              My Account
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '20px' }}>
      <Title level={2}>Checkout</Title>

      <Card title="Booking Summary" style={{ marginBottom: 16 }}>
        <Table
          columns={columns}
          dataSource={cartData.items}
          rowKey="id"
          pagination={false}
          size="small"
        />
        <Divider />
        <div style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 16 }}>Total: </Text>
          <Text strong style={{ fontSize: 24, color: '#1890ff' }}>
            {formatPrice(cartData.totalAmount)}
          </Text>
        </div>
      </Card>

      <Card title={<><QrcodeOutlined /> Payment</>} style={{ marginBottom: 16 }}>
        <Paragraph type="secondary">
          Scan the QR code below to make a bank transfer payment for your booking.
        </Paragraph>
        <div style={{ textAlign: 'center', margin: '16px 0' }}>
          <Image
            src="/qr-payment.png"
            alt="Payment QR Code"
            width={200}
            height={200}
            fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            style={{ border: '1px solid #d9d9d9', borderRadius: 8, padding: 8 }}
          />
        </div>
        <Paragraph type="secondary" style={{ textAlign: 'center', fontSize: 12 }}>
          Replace this QR image with your own bank transfer QR code.<br />
          Place your QR image at: <Text code>frontend/public/qr-payment.png</Text>
        </Paragraph>
      </Card>

      <Card title="Additional Notes" style={{ marginBottom: 16 }}>
        <TextArea
          rows={3}
          placeholder="Any special requests or notes for your booking..."
          value={customerNote}
          onChange={(e) => setCustomerNote(e.target.value)}
        />
      </Card>

      <Button
        type="primary"
        size="large"
        block
        loading={loading}
        onClick={handleConfirmBooking}
        style={{ height: 50, fontSize: 16 }}
      >
        Confirm Booking ({formatPrice(cartData.totalAmount)})
      </Button>
    </div>
  );
};

export default Checkout;
