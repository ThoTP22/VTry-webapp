import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Form, Input, Button, Card, Alert, Divider, Checkbox, DatePicker } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, CalendarOutlined } from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);
      setError('');
      
      // Chuyển đổi date_of_birth thành ISO string format
      const formData = {
        ...values,
        date_of_birth: values.date_of_birth?.toISOString() || new Date().toISOString()
      };
      
      await register(formData);
      navigate('/login', { 
        state: { message: 'Register successfully! Please login.' }
      });
    } catch (err) {
      setError(err.message || 'Register failed');
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
              <span className="text-white font-bold text-xl">VT</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold text-gray-900">Register</h2>
          <p className="text-gray-600 mt-2">Create a new account to start!</p>
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
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="fullname"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter the full name!' },
              { min: 2, message: 'Name must be at least 2 characters!' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Enter full name"
              className="form-input"
            />
          </Form.Item>

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
            name="phone"
            label="Phone Number"
            rules={[
              { required: true, message: 'Please enter the phone number!' },
              { pattern: /^[0-9]{10,11}$/, message: 'Invalid phone number!' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Enter phone number"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="date_of_birth"
            label="Date of Birth"
            rules={[
              { required: true, message: 'Please select the date of birth!' }
            ]}
          >
            <DatePicker 
              placeholder="Select date of birth"
              className="w-full form-input"
              format="DD/MM/YYYY"
              size="large"
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

          <Form.Item
            name="confirm_password"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm the password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Confirm password does not match!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter confirm password"
              className="form-input"
            />
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[
              { 
                validator: (_, value) =>
                  value ? Promise.resolve() : Promise.reject(new Error('Please agree to the terms!')),
              },
            ]}
          >
            <Checkbox>
              I agree to{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700">
                Terms of Service
              </Link>{' '}
              và{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700">
                Privacy Policy
              </Link>
            </Checkbox>
          </Form.Item>

          <Form.Item className="mb-6">
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              className="btn-primary h-12 text-lg font-semibold"
            >
              Register
            </Button>
          </Form.Item>
        </Form>

        <Divider>or</Divider>

        <div className="text-center">
          <span className="text-gray-600">Already have an account? </span>
          <Link 
            to="/login" 
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            Login now
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
