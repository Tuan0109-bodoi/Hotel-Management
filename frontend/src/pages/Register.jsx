import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const { confirmPassword, ...data } = values;
      await register(data);
      message.success('Registration successful!');
      navigate('/');
    } catch (err) {
      message.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Create Account
        </Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="name"
            rules={[{ required: true, message: 'Please enter your name' }]}
          >
            <Input prefix={<UserOutlined />} placeholder="Full Name" size="large" />
          </Form.Item>
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item name="phone">
            <Input prefix={<PhoneOutlined />} placeholder="Phone (optional)" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Confirm Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Register
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text>Already have an account? <Link to="/login">Login</Link></Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Register;
