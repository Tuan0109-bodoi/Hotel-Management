import { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, Select, InputNumber, Tag, Space, message, Popconfirm, Upload } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { roomAPI } from '../../services/api';

const roomTypeLabels = { SINGLE: 'Single', DOUBLE: 'Double', DELUXE: 'Deluxe', SUITE: 'Suite' };
const roomTypeColors = { SINGLE: 'blue', DOUBLE: 'green', DELUXE: 'orange', SUITE: 'purple' };
const statusLabels = { AVAILABLE: 'Available', OCCUPIED: 'Occupied', MAINTENANCE: 'Maintenance' };
const statusColors = { AVAILABLE: 'green', OCCUPIED: 'blue', MAINTENANCE: 'default' };

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const res = await roomAPI.getAll();
      setRooms(res.data);
    } catch (err) {
      message.error('Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingRoom(null);
    form.resetFields();
    setModalOpen(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      await roomAPI.delete(id);
      message.success('Room deleted');
      fetchRooms();
    } catch (err) {
      message.error(err.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingRoom) {
        await roomAPI.update(editingRoom.id, values);
        message.success('Room updated');
      } else {
        await roomAPI.create(values);
        message.success('Room created');
      }
      setModalOpen(false);
      fetchRooms();
    } catch (err) {
      if (err.response) {
        message.error(err.response?.data?.message || 'Failed to save room');
      }
    }
  };

  const formatPrice = (price) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: 'Name',
      dataIndex: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      render: (type) => <Tag color={roomTypeColors[type]}>{roomTypeLabels[type]}</Tag>,
    },
    {
      title: 'Price/Night',
      dataIndex: 'price',
      render: (price) => formatPrice(price),
    },
    {
      title: 'Max Guests',
      dataIndex: 'maxGuests',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      render: (status) => <Tag color={statusColors[status]}>{statusLabels[status]}</Tag>,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm title="Delete this room?" onConfirm={() => handleDelete(record.id)}>
            <Button danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h3>Room Management</h3>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Room
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingRoom ? 'Edit Room' : 'Add Room'}
        open={modalOpen}
        onOk={handleSubmit}
        onCancel={() => setModalOpen(false)}
        okText={editingRoom ? 'Update' : 'Create'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="Room Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="Room Type" rules={[{ required: true }]}>
            <Select>
              <Select.Option value="SINGLE">Single</Select.Option>
              <Select.Option value="DOUBLE">Double</Select.Option>
              <Select.Option value="DELUXE">Deluxe</Select.Option>
              <Select.Option value="SUITE">Suite</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="price" label="Price per Night (VND)" rules={[{ required: true }]}>
            <InputNumber min={0} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="maxGuests" label="Max Guests">
            <InputNumber min={1} max={20} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="description" label="Description">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="imageUrl" label="Image URL">
            <Input placeholder="https://example.com/room.jpg" />
          </Form.Item>
          {editingRoom && (
            <Form.Item name="status" label="Status">
              <Select>
                <Select.Option value="AVAILABLE">Available</Select.Option>
                <Select.Option value="OCCUPIED">Occupied</Select.Option>
                <Select.Option value="MAINTENANCE">Maintenance</Select.Option>
              </Select>
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;
