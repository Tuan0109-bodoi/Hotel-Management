import { Form, Input, Button, Card, Typography, message, Checkbox } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const { Title, Text } = Typography;

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    try {
      const data = await login(values.email, values.password);
      message.success('Login successful!');
      if (data.user.role === 'ADMIN') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (err) {
      message.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: '60px auto' }}>
      <Card>
        <Title level={3} style={{ textAlign: 'center', marginBottom: 32 }}>
          Login
        </Title>
        <Form form={form} onFinish={onFinish} layout="vertical">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Please enter your email' },
              { type: 'email', message: 'Please enter a valid email' },
            ]}
          >
            <Input prefix={<UserOutlined />} placeholder="Email" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="Password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large">
              Login
            </Button>
          </Form.Item>
          <div style={{ textAlign: 'center' }}>
            <Text>Don't have an account? <Link to="/register">Register</Link></Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
