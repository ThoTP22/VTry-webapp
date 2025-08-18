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
  Timeline,
  Steps,
  message
} from 'antd';
import {
  CheckCircleOutlined,
  ShoppingOutlined,
  TruckOutlined,
  HomeOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import paymentService from '../../services/paymentService';

const { Title, Paragraph, Text } = Typography;
const { Step } = Steps;

const PaymentSuccessPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Get order details from URL params
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id');
    const paymentId = urlParams.get('payment_id');
    
    console.log('📌 PaymentSuccessPage - URL params:', { orderId, paymentId, search: location.search });
    
    if (!orderId) {
      console.warn('⚠️ PaymentSuccessPage - No order_id in URL, redirecting to orders page');
      setError('Order ID not found - redirecting to orders page');
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
      setLoading(false);
      return;
    }

    // Fetch order details from API
    const fetchOrderDetails = async () => {
      try {
        console.log('🛒 PaymentSuccessPage - Fetching order details for:', orderId);
        
        // Kiểm tra token trước khi gọi API
        const token = localStorage.getItem('access_token');
        if (!token) {
          console.warn('⚠️ PaymentSuccessPage - No auth token found');
          message.warning('You need to login to view order details');
        }
        
        const response = await paymentService.getOrderById(orderId);
        console.log('🛒 PaymentSuccessPage - Order response:', response);
        
        if (response.result) {
          setOrderDetails(response.result);
        } else {
          console.error('❌ PaymentSuccessPage - No result in response:', response);
          setError('Cannot get order details');
        }
      } catch (error) {
        console.error('❌ PaymentSuccessPage - Error fetching order:', error);
        
        // Hiển thị thông báo lỗi chi tiết hơn
        if (error.response?.status === 401) {
          setError('Login session expired. Please login again to view order details');
        } else if (error.response?.data?.message) {
          setError(`Error: ${error.response.data.message}`);
        } else {
          setError('An error occurred while getting order details');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [location]);

  const handleContinueShopping = () => {
    navigate('/products');
  };

  const handleViewOrder = () => {
    if (orderDetails?._id) {
      navigate(`/orders/${orderDetails._id}`);
    } else {
      navigate('/orders');
    }
  };

  const handleDownloadReceipt = () => {
    if (!orderDetails) return;
    
    // Generate and download receipt
    const receipt = `
      PAYMENT RECEIPT
      
      Order ID: ${orderDetails.order_number || orderDetails._id}
      Date: ${new Date(orderDetails.created_at).toLocaleDateString('vi-VN')}
      
      PRODUCTS:
      ${orderDetails.items.map(item => 
        `${item.product_name || item.name} x${item.quantity} = ${paymentService.formatCurrency(item.total_price || (item.price * item.quantity))}`
      ).join('\n')}
      
      Subtotal: ${paymentService.formatCurrency(orderDetails.subtotal)}
      Tax: ${paymentService.formatCurrency(orderDetails.tax_amount)}
      Shipping fee: ${paymentService.formatCurrency(orderDetails.shipping_fee)}
      TOTAL: ${paymentService.formatCurrency(orderDetails.total_amount)}
      
      SHIPPING ADDRESS:
      ${orderDetails.shipping_address.fullname}
      ${orderDetails.shipping_address.phone}
      ${orderDetails.shipping_address.address_line_1}
      ${orderDetails.shipping_address.address_line_2 || ''}
      ${orderDetails.shipping_address.city}, ${orderDetails.shipping_address.state} ${orderDetails.shipping_address.postal_code}
      ${orderDetails.shipping_address.country}
    `;
    
    const blob = new Blob([receipt], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${orderDetails.order_number || orderDetails._id}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
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
                Try again
              </Button>,
              <Button 
                key="home" 
                onClick={() => navigate('/')}
              >
                Back to home
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    // Nếu không lấy được thông tin đơn hàng từ API, hiển thị thông báo thành công giả
    // để người dùng biết thanh toán đã hoàn tất
    const urlParams = new URLSearchParams(location.search);
    const orderId = urlParams.get('order_id');
    
    if (orderId) {
      // Hiển thị thông báo thành công với ID đơn hàng
      return (
        <div className="min-h-screen bg-gray-50 py-8">
          <div className="max-w-4xl mx-auto px-4">
            <Result
              status="success"
              icon={<CheckCircleOutlined className="text-6xl text-green-500" />}
              title="Payment successful!"
              subTitle={`Order #${orderId} has been processed. Thank you for shopping!`}
              extra={[
                <Button 
                  key="continue" 
                  type="primary" 
                  size="large"
                  onClick={handleContinueShopping}
                  className="bg-green-500 hover:bg-green-600 border-0"
                >
                  Continue shopping
                </Button>,
                <Button 
                  key="home" 
                  size="large"
                  onClick={() => navigate('/')}
                >
                  Back to home
                </Button>
              ]}
            />
            <Card className="mt-8">
              <div className="text-center p-6">
                <Title level={4}>Order details will be sent to your email</Title>
                <Paragraph>
                  If you don't receive an email, please check your spam folder or contact customer support.
                </Paragraph>
              </div>
            </Card>
          </div>
        </div>
      );
    }
    
    // Nếu không có orderId, hiển thị cảnh báo
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Result
            status="warning"
            title="Order not found"
            subTitle="Please check the URL or contact support"
            extra={[
              <Button 
                key="home" 
                type="primary" 
                onClick={() => navigate('/')}
              >
                Back to home
              </Button>
            ]}
          />
        </div>
      </div>
    );
  }

  // Get current step based on order status
  const getCurrentStep = () => {
    const status = orderDetails.status;
    switch (status) {
      case 'pending': return 0;
      case 'confirmed': return 1;
      case 'processing': return 2;
      case 'shipped': return 3;
      case 'delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Result */}
        <Result
          status="success"
          icon={<CheckCircleOutlined className="text-6xl text-green-500" />}
          title="Payment successful!"
          subTitle="Your order has been processed and will be delivered soon."
          extra={[
            <Button 
              key="continue" 
              type="primary" 
              size="large"
              onClick={handleContinueShopping}
              className="bg-green-500 hover:bg-green-600 border-0"
            >
              Continue shopping
            </Button>,
            <Button 
              key="order" 
              size="large"
              onClick={handleViewOrder}
            >
              View order
            </Button>
          ]}
        />

        {/* Order Details */}
        <Card className="mt-8 shadow-sm">
          <Title level={3} className="mb-6 flex items-center">
            <FileTextOutlined className="mr-2 text-blue-500" />
            Order details
          </Title>

          <Row gutter={24}>
            <Col xs={24} lg={16}>
              {/* Order Items */}
              <div className="space-y-4">
                <Title level={4}>Ordered products</Title>
                {orderDetails.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <Text strong className="text-lg">{item.product_name || item.name}</Text>
                      <div className="text-gray-600">
                        Quantity: {item.quantity} x {paymentService.formatCurrency(item.unit_price || item.price)}
                      </div>
                    </div>
                    <Text strong className="text-lg text-green-600">
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
                    <Text className="text-green-600">
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
                    <Text type="secondary">Payment method:</Text>
                    <Tag color="blue">{paymentService.getPaymentMethodName(orderDetails.payment_info?.method || orderDetails.payment_method)}</Tag>
                  </div>
                  <div className="flex justify-between">
                    <Text type="secondary">Status:</Text>
                    <Tag color={paymentService.getOrderStatusColor(orderDetails.status)}>
                      {paymentService.getOrderStatusName(orderDetails.status)}
                    </Tag>
                  </div>
                  {orderDetails.payment_info?.status && (
                    <div className="flex justify-between">
                      <Text type="secondary">Payment status:</Text>
                      <Tag color={paymentService.getPaymentStatusColor(orderDetails.payment_info.status)}>
                        {paymentService.getPaymentStatusName(orderDetails.payment_info.status)}
                      </Tag>
                    </div>
                  )}
                </div>

                <Divider />

                <Title level={4}>Shipping address</Title>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <Text strong>{orderDetails.shipping_address.fullname}</Text>
                  <br />
                  <Text>{orderDetails.shipping_address.phone}</Text>
                  <br />
                  <Text>{orderDetails.shipping_address.address_line_1}</Text>
                  <br />
                  {orderDetails.shipping_address.address_line_2 && (
                    <Text>{orderDetails.shipping_address.address_line_2}</Text>
                  )}
                  <br />
                  <Text>
                    {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.postal_code}
                  </Text>
                  <br />
                  <Text>{orderDetails.shipping_address.country}</Text>
                </div>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Order Timeline */}
        <Card className="mt-8 shadow-sm">
          <Title level={3} className="mb-6 flex items-center">
            <Timeline className="mr-2 text-blue-500" />
              Order timeline
          </Title>
          
          <Steps
            current={getCurrentStep()}
            items={[
              {
                title: 'Order',
                description: 'Order created',
                icon: <ShoppingOutlined />
              },
              {
                title: 'Confirm',
                description: 'Order confirmed',
                icon: <CheckCircleOutlined />
              },
              {
                title: 'Processing',
                description: 'Preparing products',
                icon: <FileTextOutlined />
              },
              {
                title: 'Shipping',
                description: 'Shipping products',
                icon: <TruckOutlined />
              },
              {
                title: 'Completed',
                description: 'Received products',
                icon: <HomeOutlined />
              }
            ]}
          />
        </Card>

        {/* Action Buttons */}
        <div className="mt-8 text-center space-x-4">
          <Button 
            type="primary" 
            size="large"
            onClick={handleDownloadReceipt}
            className="bg-blue-500 hover:bg-blue-600 border-0"
          >
            Download receipt
          </Button>
          <Button 
            size="large"
            onClick={handleContinueShopping}
          >
            Continue shopping
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccessPage;
