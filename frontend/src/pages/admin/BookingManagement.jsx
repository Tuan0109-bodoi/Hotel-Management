import { useEffect, useState } from 'react';
import { Table, Tag, Select, Button, Space, Typography, message } from 'antd';
import { bookingAPI } from '../../services/api';
import dayjs from 'dayjs';

const { Title } = Typography;

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

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(undefined);

  useEffect(() => {
    fetchBookings();
  }, [statusFilter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll({ status: statusFilter });
      setBookings(res.data);
    } catch (err) {
      message.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId, newStatus) => {
    try {
      await bookingAPI.updateStatus(bookingId, { status: newStatus });
      message.success('Status updated');
      fetchBookings();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to update status');
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const getNextStatuses = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING': return ['CHECKED_IN', 'CANCELLED'];
      case 'CHECKED_IN': return ['CHECKED_OUT'];
      default: return [];
    }
  };

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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
      render: (id) => `#${id}`,
    },
    {
      title: 'Customer',
      key: 'customer',
      render: (_, record) => (
        <div>
          <div>{record.user?.name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.user?.email}</div>
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
      title: 'Rooms',
      key: 'rooms',
      render: (_, record) => `${record.bookingDetails?.length || 0} room(s)`,
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      render: (amount) => <strong>{formatPrice(amount)}</strong>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => {
        const nextStatuses = getNextStatuses(record.status);
        if (nextStatuses.length === 0) return <Tag>-</Tag>;
        return (
          <Space>
            {nextStatuses.map((s) => (
              <Button
                key={s}
                size="small"
                type={s === 'CHECKED_IN' ? 'primary' : s === 'CANCELLED' ? 'danger' : 'default'}
                onClick={() => handleStatusChange(record.id, s)}
              >
                {statusLabels[s]}
              </Button>
            ))}
          </Space>
        );
      },
    },
    {
      title: 'Note',
      dataIndex: 'customerNote',
      ellipsis: true,
      width: 150,
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <Title level={3} style={{ margin: 0 }}>Booking Management</Title>
        <Select
          allowClear
          placeholder="Filter by status"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={setStatusFilter}
        >
          <Select.Option value="PENDING">Pending</Select.Option>
          <Select.Option value="CHECKED_IN">Checked In</Select.Option>
          <Select.Option value="CHECKED_OUT">Checked Out</Select.Option>
          <Select.Option value="CANCELLED">Cancelled</Select.Option>
        </Select>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        loading={loading}
        expandable={{ expandedRowRender }}
        pagination={{ pageSize: 10 }}
      />
    </div>
  );
};

export default BookingManagement;
