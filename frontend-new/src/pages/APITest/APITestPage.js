import React, { useState } from 'react';
import { Button, Form, Input, Card, Alert, Spin } from 'antd';
import { useAuth } from '../../hooks/useAuth';
import { useProducts } from '../../hooks/useProducts';

const APITestPage = () => {
  const { login, register, user, isAuthenticated, isLoading: authLoading, error: authError } = useAuth();
  const { products, fetchProducts, isLoading: productsLoading, error: productsError } = useProducts();
  const [testResults, setTestResults] = useState([]);

  const addTestResult = (test, success, data, error) => {
    setTestResults(prev => [
      { test, success, data, error, timestamp: new Date().toLocaleTimeString() },
      ...prev.slice(0, 9) // Keep only last 10 results
    ]);
  };

  const testRegister = async (values) => {
    try {
      const result = await register({
        ...values,
        date_of_birth: new Date().toISOString()
      });
      addTestResult('Register', result.success, result.data || result.user, result.error);
    } catch (error) {
      addTestResult('Register', false, null, error.message);
    }
  };

  const testLogin = async (values) => {
    try {
      const result = await login(values);
      addTestResult('Login', result.success, result.user, result.error);
    } catch (error) {
      addTestResult('Login', false, null, error.message);
    }
  };

  const testGetProducts = async () => {
    try {
      const result = await fetchProducts();
      addTestResult('Get Products', result.success, result.products, result.error);
    } catch (error) {
      addTestResult('Get Products', false, null, error.message);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>API Test Page</h1>
      
      {/* Auth Status */}
      <Card title="Authentication Status" style={{ marginBottom: '20px' }}>
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>User:</strong> {user ? JSON.stringify(user, null, 2) : 'None'}</p>
        <p><strong>Loading:</strong> {authLoading ? 'Yes' : 'No'}</p>
        {authError && <Alert message={authError} type="error" />}
      </Card>

      {/* Register Test */}
      <Card title="Test Registration" style={{ marginBottom: '20px' }}>
        <Form onFinish={testRegister} layout="inline">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true, min: 8 }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item name="confirm_password" rules={[{ required: true }]}>
            <Input.Password placeholder="Confirm Password" />
          </Form.Item>
          <Form.Item name="fullname" rules={[{ required: true }]}>
            <Input placeholder="Full Name" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={authLoading}>
              Test Register
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Login Test */}
      <Card title="Test Login" style={{ marginBottom: '20px' }}>
        <Form onFinish={testLogin} layout="inline">
          <Form.Item name="email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Email" />
          </Form.Item>
          <Form.Item name="password" rules={[{ required: true }]}>
            <Input.Password placeholder="Password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={authLoading}>
              Test Login
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {/* Products Test */}
      <Card title="Test Products API" style={{ marginBottom: '20px' }}>
        <Button type="primary" onClick={testGetProducts} loading={productsLoading}>
          Get All Products
        </Button>
        {productsError && <Alert message={productsError} type="error" style={{ marginTop: '10px' }} />}
        <div style={{ marginTop: '10px' }}>
          <strong>Products Count:</strong> {products.length}
        </div>
      </Card>

      {/* Test Results */}
      <Card title="Test Results">
        {testResults.length === 0 ? (
          <p>No test results yet. Try running some tests above.</p>
        ) : (
          testResults.map((result, index) => (
            <Card
              key={index}
              size="small"
              style={{ marginBottom: '10px' }}
              title={`${result.test} - ${result.timestamp}`}
            >
              <Alert
                message={result.success ? 'Success' : 'Error'}
                description={result.success ? 
                  <pre>{JSON.stringify(result.data, null, 2)}</pre> :
                  result.error
                }
                type={result.success ? 'success' : 'error'}
              />
            </Card>
          ))
        )}
      </Card>
    </div>
  );
};

export default APITestPage;
