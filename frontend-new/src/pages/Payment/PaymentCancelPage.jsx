import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Result,
  Button,
  Card,
  Typography,
  Space,
  Divider,
  Row,
  Col,
  Tag,
  Alert,
  List,
  Collapse,
  message
} from 'antd';
import {
  CloseCircleOutlined,
  ShoppingCartOutlined,
  ExclamationCircleOutlined,
  ReloadOutlined,
  HomeOutlined,
  CustomerServiceOutlined
} from '@ant-design/icons';
import paymentService from '../../services/paymentService';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const PaymentCancelPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get order details from URL params
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id');
    const reason = urlParams.get('reason') || 'user_cancelled';
    
    if (!orderId) {
      setError('Cannot find order ID');
      setLoading(false);
      return;
    }

    // Fetch order details from API
    const fetchOrderDetails = async () => {
      try {
        console.log('🛒 PaymentCancelPage - Fetching order details for:', orderId);
        const response = await paymentService.getOrderById(orderId);
        console.log('🛒 PaymentCancelPage - Order response:', response);
        
        if (response.result) {
          // Add cancellation reason to order details
          setOrderDetails({
            ...response.result,
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString()
          });
        } else {
          setError('Cannot get order details');
        }
      } catch (error) {
        console.error('❌ PaymentCancelPage - Error fetching order:', error);
        setError('An error occurred while fetching order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  const handleRetryPayment = () => {
    navigate('/cart');
  };

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleContactSupport = () => {
    // Open support chat or email
    window.open('mailto:support@visual-tryon.com', '_blank');
  };

  const getCancelReasonText = (reason) => {
    const reasons = {
      'user_cancelled': 'You cancelled payment',
      'payment_failed': 'Payment failed',
      'timeout': 'Payment timed out',
      'insufficient_funds': 'Insufficient funds',
      'technical_error': 'Technical error',
      'fraud_detected': 'Transaction rejected for security reasons'
    };
    return reasons[reason] || 'Payment cancelled';
  };

  const getCancelReasonColor = (reason) => {
    const colors = {
      'user_cancelled': 'orange',
      'payment_failed': 'red',
      'timeout': 'orange',
      'insufficient_funds': 'red',
      'technical_error': 'red',
      'fraud_detected': 'red'
    };
    return colors[reason] || 'orange';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <Text>Processing order details...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Result
            status="error"
            title="Cannot load order details"
            subTitle={error}
            extra={[
              <Button 
                key="retry" 
                type="primary" 
                onClick={() => window.location.reload()}
              >
                Retry
              </Button>,
              <Button 
                key="home" 
                onClick={() => navigate('/')}
              >
                Go to home
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Result
            status="warning"
            title="Cannot find order details"
            subTitle="Please check the URL or contact support"
            extra={[
              <Button 
                key="home" 
                type="primary" 
                onClick={() => navigate('/')}
              >
                Go to home
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Cancel Result */}
        <Result
          status="error"
          icon={<CloseCircleOutlined className="text-6xl text-red-500" />}
          title="Payment cancelled"
          subTitle={getCancelReasonText(orderDetails.cancellation_reason)}
          extra={[
            <Button 
              key="retry" 
              type="primary" 
              size="large"
              onClick={handleRetryPayment}
              icon={<ReloadOutlined />}
              className="bg-blue-500 hover:bg-blue-600 border-0"
            >
              Retry payment
            </Button>,
            <Button 
              key="continue" 
              size="large"
              onClick={handleContinueShopping}
              icon={<ShoppingCartOutlined />}
            >
              Continue shopping
            </Button>
          ]}
        />

        {/* Alert Message */}
        <Alert
          message="Important information"
          description="Your order is still in the cart. You can try to pay again or contact support if needed."
          type="info"
          showIcon
          className="mt-6"
        />

        {/* Order Details */}
        <Card className="mt-8 shadow-sm">
          <Title level={3} className="mb-6 flex items-center">
            <ExclamationCircleOutlined className="mr-2 text-orange-500" />
            Cancelled order details
          </Title>

          <Row gutter={24}>
            <Col xs={24} lg={16}>
              {/* Order Items */}
              <div className="space-y-4">
                <Title level={4}>Products in order</Title>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Text strong className="text-lg">{item.product_name || item.name}</Text>
                      <div className="text-gray-600">
                        Quantity: {item.quantity} x {paymentService.formatCurrency(item.unit_price || item.price)}
                      </div>
                    </div>
                    <Text strong className="text-lg text-gray-600">
                      {paymentService.formatCurrency(item.total_price || (item.price * item.quantity))}
                    </Text>
                  </div>
                ))}
                
                <Divider />
                
                {/* Order Summary */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text>Subtotal:</Text>
                    <Text>{paymentService.formatCurrency(orderDetails.subtotal)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Tax:</Text>
                    <Text>{paymentService.formatCurrency(orderDetails.tax_amount)}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text>Shipping fee:</Text>
                    <Text>{orderDetails.shipping_fee === 0 ? 'Free' : paymentService.formatCurrency(orderDetails.shipping_fee)}</Text>
                  </div>
                  <Divider />
                  <div className="flex justify-between items-center text-xl font-bold">
                    <Text>Total:</Text>
                    <Text className="text-gray-600">
                      {paymentService.formatCurrency(orderDetails.total_amount)}
                    </Text>
                  </div>
                </div>
              </div>
            </Col>

            <Col xs={24} lg={8}>
              {/* Order Info */}
              <div className="space-y-4">
                <Title level={4}>Order details</Title>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Text type="secondary">Order ID:</Text>
                    <Text strong>{orderDetails.order_number || orderDetails._id}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Order date:</Text>
                    <Text>{new Date(orderDetails.created_at).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Cancelled date:</Text>
                    <Text>{new Date(orderDetails.cancelled_at).toLocaleDateString('vi-VN')}</Text>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Cancellation reason:</Text>
                    <Tag color={getCancelReasonColor(orderDetails.cancellation_reason)}>
                      {getCancelReasonText(orderDetails.cancellation_reason)}
                    </Tag>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Payment method:</Text>
                    <Tag color="blue">{paymentService.getPaymentMethodName(orderDetails.payment_info?.method || orderDetails.payment_method)}</Tag>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Status:</Text>
                    <Tag color={paymentService.getOrderStatusColor(orderDetails.status)}>
                      {paymentService.getOrderStatusName(orderDetails.status)}
                    </Tag>
                  </div>
                </div>

                <Divider />

                <Title level={4}>Next actions</Title>
                <div className="space-y-2">
                  <Button 
                    block 
                    type="primary" 
                    onClick={handleRetryPayment}
                    icon={<ReloadOutlined />}
                    className="bg-blue-500 hover:bg-blue-600 border-0"
                  >
                    Retry payment
                  </Button>
                  <Button 
                    block 
                    onClick={handleContactSupport}
                    icon={<CustomerServiceOutlined />}
                  >
                    Contact support
                  </Button>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Common Issues & Solutions */}
        <Card className="mt-8 shadow-sm">
          <Title level={3} className="mb-6">Common issues & Solutions</Title>
          
          <Collapse defaultActiveKey={['1']} className="bg-white">
            <Panel header="Payment rejected" key="1">
              <List
                size="small"
                dataSource={[
                  'Check account balance',
                  'Ensure card information is correct',
                  'Check transaction limits',
                  'Try other payment methods'
                ]}
                renderItem={item => <List.Item>• {item}</List.Item>}
              />
            </Panel>
            
            <Panel header="Technical error" key="2">
              <List
                size="small"
                dataSource={[
                  'Refresh page and try again',
                  'Check internet connection',
                  'Clear browser cache',
                  'Try different browser'
                ]}
                renderItem={item => <List.Item>• {item}</List.Item>}
              />
            </Panel>
            
            <Panel header="Customer support" key="3">
              <div className="space-y-2">
                <Text>Email: duynhse183995@fpt.edu.vn</Text>
                <br />
                <Text>Hotline: 0839973335</Text>
                <br />
                <Text>Working hours: 8:00 - 18:00 (Monday - Friday)</Text>
              </div>
            </Panel>
          </Collapse>
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Button 
            type="primary" 
            size="large"
            onClick={handleRetryPayment}
            icon={<ReloadOutlined />}
            className="bg-blue-500 hover:bg-blue-600 border-0"
          >
            Retry payment
          </Button>
          <Button 
            size="large"
            onClick={handleContinueShopping}
            icon={<ShoppingCartOutlined />}
          >
            Continue shopping
          </Button>
          <Button 
            size="large"
            onClick={handleGoHome}
            icon={<HomeOutlined />}
          >
            Go to home
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentCancelPage;
