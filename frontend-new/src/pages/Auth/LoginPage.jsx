import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError('');
      const result = await login(values);
      
      if (result.success) {
        // Check if user is admin and redirect accordingly
        if (result.user?.role === 'admin') {
          navigate('/admin', { replace: true });
        } else {
          navigate(from, { replace: true });
        }
      }
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <Card 
        className="w-full max-w-md shadow-lg border-0"
        bodyStyle={{ padding: '2rem' }}
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={process.env.PUBLIC_URL + '/img/logo.png'} 
              alt="Visual Try-On Logo" 
              className="w-12 h-12 object-contain"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
            <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center" style={{ display: 'none' }}>
              {/* <span className="text-white font-bold text-xl">VT</span> */}
              <img src={"/img/logo.png"} alt="Logo" className="w-8 h-8 rounded" />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Login</h2>
          <p className="text-gray-600 mt-2">Welcome back!</p>
        </div>

        {error && (
          <Alert 
            message={error} 
            type="error" 
            showIcon 
            className="mb-6"
            closable
            onClose={() => setError('')}
          />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Please enter the email!' },
              { type: 'email', message: 'Invalid email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Enter your email"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter the password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter password"
              className="form-input"
            />
          </Form.Item>

          <Form.Item className="mb-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              className="btn-primary h-12 text-lg font-semibold"
            >
              Login
            </Button>
          </Form.Item>
        </Form>

        <div className="text-center">
          <Link 
            to="/forgot-password" 
            className="text-primary-600 hover:text-primary-700 text-sm"
          >
            Forgot password?
          </Link>
        </div>

        <Divider>or</Divider>

        <div className="text-center">
          <span className="text-gray-600">Don't have an account? </span>
          <Link 
            to="/register" 
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Register now
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default LoginPage;
