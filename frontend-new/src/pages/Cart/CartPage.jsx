
import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  Button,
  InputNumber,
  Typography,
  Row,
  Col,
  Image,
  Tag,
  Space,
  Divider,
  Empty,
  Modal,
  Form,
  Input,
  Select,
  message,
  Steps,
  Result
} from 'antd';
import {
  DeleteOutlined,
  ShoppingOutlined,
  HeartOutlined,
  CreditCardOutlined,
  UserOutlined,
  EnvironmentOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import {
  removeFromCart,
  updateQuantity,
  moveToWishlist,
  clearCart,
  selectCartItems,
  selectCartTotal,
  selectCartItemCount
} from '../../store/cartSlice';
import paymentService from '../../services/paymentService';

const { Title, Text } = Typography;
const { Option } = Select;
const { Step } = Steps;
const { TextArea } = Input;

const CartPage = () => {
  const cartItems = useSelector(selectCartItems);
  const cartTotal = useSelector(selectCartTotal);
  const cartItemCount = useSelector(selectCartItemCount);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [isCheckoutModalVisible, setIsCheckoutModalVisible] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState(0);
  const [checkoutForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [shippingAddressData, setShippingAddressData] = useState(null);

  // Debug logging
  useEffect(() => {
    console.log('🛒 CartPage - Redux State:', { 
      cartItems, 
      cartTotal, 
      cartItemCount, 
      itemsLength: cartItems?.length || 0 
    });
  }, [cartItems, cartTotal, cartItemCount]);

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/img/logo.png';
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    
    // If it's a relative path starting with /, prepend backend URL
    if (imageUrl.startsWith('/')) {
        const apiUrl = process.env.REACT_APP_BACKEND_URL ;
      return `${apiUrl}${imageUrl}`;
    }
    
    // If it's just a filename, construct the full path to backend images
    const apiUrl = process.env.REACT_APP_BACKEND_URL ;
    return `${apiUrl}/api/images/${imageUrl}`;
  };

  // Get the actual image URL to use
  const getActualImageUrl = (item) => {
    // Priority: imageUrl (S3) > image (local) > placeholder
    if (item.imageUrl) {
      return item.imageUrl; // This is the S3 URL
    }
    if (item.image) {
      return getImageUrl(item.image); // This is local image
    }
    return '/img/logo.png';
  };

  const handleQuantityChange = (productId, quantity) => {
    if (quantity <= 0) {
      dispatch(removeFromCart(productId));
    } else {
      dispatch(updateQuantity({ productId, quantity }));
    }

    // Save to localStorage
    setTimeout(() => {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        const cartData = JSON.parse(currentCart);
        const updatedCart = {
          ...cartData,
          items: cartData.items.map(item => 
            item._id === productId ? { ...item, quantity } : item
          )
        };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    }, 100);
  };

  const handleRemoveItem = (productId) => {
    dispatch(removeFromCart(productId));
    message.success('Product removed from cart');

    // Save to localStorage
    setTimeout(() => {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        const cartData = JSON.parse(currentCart);
        const updatedCart = {
          ...cartData,
          items: cartData.items.filter(item => item._id !== productId)
        };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    }, 100);
  };

  const handleMoveToWishlist = (productId) => {
    dispatch(moveToWishlist(productId));
    message.success('Product moved to wishlist');

    // Save to localStorage
    setTimeout(() => {
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        const cartData = JSON.parse(currentCart);
        const updatedCart = {
          ...cartData,
          items: cartData.items.filter(item => item._id !== productId)
        };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
      }
    }, 100);
  };

  const handleClearCart = () => {
    dispatch(clearCart());
    message.success('Cart cleared');

    // Save to localStorage
    setTimeout(() => {
      localStorage.removeItem('cart');
    }, 100);
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      message.warning('Cart is empty!');
      return;
    }
    
    // Reset form and state
    checkoutForm.resetFields();
    setShippingAddressData(null);
    
    // Initialize form with default values
    checkoutForm.setFieldsValue({
      shipping_address: {
        fullname: '',
        phone: '',
        address_line_1: '',
        address_line_2: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Vietnam'
      },
      payment_method: 'cash_on_delivery',
      notes: ''
    });
    
    setIsCheckoutModalVisible(true);
    setCheckoutStep(0);
  };

  const handleCheckoutNext = async () => {
    try {
      // Validate only the current visible fields
      let values;
      if (checkoutStep === 0) {
        values = await checkoutForm.validateFields(['shipping_address']);
      } else {
        values = await checkoutForm.validateFields();
      }
      
      console.log('Form values:', values);
      
      if (checkoutStep === 0) {
        // Validate shipping address
        try {
          console.log('Shipping address before validation:', values.shipping_address);
          
          // Ensure all fields are trimmed to remove any whitespace
          if (values.shipping_address) {
            Object.keys(values.shipping_address).forEach(key => {
              if (typeof values.shipping_address[key] === 'string') {
                values.shipping_address[key] = values.shipping_address[key].trim();
              }
            });
          }
          
          // Validate shipping address
          paymentService.validateShippingAddress(values.shipping_address);
          
          // Store the validated shipping address in the form and state
          const currentValues = checkoutForm.getFieldsValue();
          const validatedShippingAddress = { ...values.shipping_address };
          
          checkoutForm.setFieldsValue({
            ...currentValues,
            shipping_address: validatedShippingAddress
          });
          
          // Save shipping address to state for later use
          setShippingAddressData(validatedShippingAddress);
          
          console.log('Moving to step 1 with form values:', checkoutForm.getFieldsValue());
          console.log('Saved shipping address to state:', validatedShippingAddress);
          setCheckoutStep(1);
        } catch (error) {
          console.error('Shipping address validation error:', error);
          message.error(error.message);
          return;
        }
      } else if (checkoutStep === 1) {
        // Get all form values including shipping address from previous step
        const allValues = checkoutForm.getFieldsValue();
        console.log('Processing checkout with all form values:', allValues);
        
        // Process checkout with complete form data
        await processCheckout(allValues);
      }
    } catch (error) {
      console.error('Checkout validation error:', error);
      if (error.errorFields) {
        // Show first validation error
        message.error(error.errorFields[0].errors[0]);
      }
    }
  };

  const handleCheckoutPrev = () => {
    // Get current form values before going back
    const currentValues = checkoutForm.getFieldsValue();
    console.log('Going back to step 0 with form values:', currentValues);
    
    // Ensure shipping address data is preserved
    if (currentValues.shipping_address && !shippingAddressData) {
      setShippingAddressData(currentValues.shipping_address);
    }
    
    setCheckoutStep(checkoutStep - 1);
  };

  const processCheckout = async (formData) => {
    setLoading(true);
    try {
      console.log('🛒 Processing checkout with form data:', formData);
      
      // Use shipping address from state if not in formData
      const effectiveFormData = { ...formData };
      if (!effectiveFormData.shipping_address && shippingAddressData) {
        console.log('Using shipping address from state:', shippingAddressData);
        effectiveFormData.shipping_address = shippingAddressData;
      }
      
      // Validate form data
      if (!effectiveFormData.shipping_address) {
        throw new Error('Please enter shipping address');
      }
      
      if (!effectiveFormData.payment_method) {
        throw new Error('Please select payment method');
      }
      
      // Check if cart has items
      if (!cartItems || cartItems.length === 0) {
        throw new Error('Cart is empty');
      }
      
      // Validate each cart item has a valid ID
      cartItems.forEach(item => {
        if (!item._id) {
          throw new Error('Invalid product in cart');
        }
      });
      
      // Ensure all shipping address fields are trimmed and validate required fields
      const shippingAddress = { ...effectiveFormData.shipping_address };
      
      // Check required fields
      const requiredFields = ['fullname', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
      for (const field of requiredFields) {
        if (!shippingAddress[field]) {
          throw new Error(`Please enter ${field}`);
        }
      }
      
      // Trim all string values
      Object.keys(shippingAddress).forEach(key => {
        if (typeof shippingAddress[key] === 'string') {
          shippingAddress[key] = shippingAddress[key].trim();
        }
      });
      
      // Log shipping address for debugging
      console.log('Final shipping address for order:', shippingAddress);
      
      // Manual construction of order data to ensure all required fields
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item._id,
          quantity: item.quantity || 1
        })),
        shipping_address: {
          fullname: shippingAddress.fullname,
          phone: shippingAddress.phone,
          address_line_1: shippingAddress.address_line_1,
          address_line_2: shippingAddress.address_line_2 || '',
          city: shippingAddress.city,
          state: shippingAddress.state,
          postal_code: shippingAddress.postal_code,
          country: shippingAddress.country
        },
        payment_method: formData.payment_method,
        currency: 'VND',
        notes: formData.notes || ''
      };

      console.log('🛒 CartPage - Creating order with data:', orderData);

      // Add debug log to check if shipping_address is included
      if (!orderData.shipping_address) {
        console.error('❌ Missing shipping_address in orderData');
      } else {
        console.log('✅ shipping_address is present:', orderData.shipping_address);
      }

      // Create order
      const orderResponse = await paymentService.createOrder(orderData);
      console.log('🛒 CartPage - Order response:', orderResponse);
      
      // Extract order ID from response
      const orderId = orderResponse.result?._id || orderResponse.order_id || orderResponse._id;
      
      if (!orderId) {
        throw new Error('Cannot get order ID from response');
      }

      // Handle payment based on method
      if (formData.payment_method === 'cash_on_delivery') {
        // Cash on delivery - redirect to success
        message.success('Order created successfully!');
        setIsCheckoutModalVisible(false);
        navigate(`/payment/success?order_id=${orderId}`);
      } else if (formData.payment_method === 'payos') {
        // PayOS - create payment and redirect to payment gateway
        const paymentData = paymentService.processPaymentData(
          orderId,
          formData.payment_method,
          `${window.location.origin}/payment/success?order_id=${orderId}`,
          `${window.location.origin}/payment/cancel?order_id=${orderId}&reason=payment_failed`
        );

        console.log('💳 CartPage - Creating payment with data:', paymentData);
        const paymentResponse = await paymentService.createPayment(paymentData);
        console.log('💳 CartPage - Payment response:', paymentResponse);

        // Redirect to PayOS checkout
        if (paymentResponse.result?.checkout_url) {
          window.location.href = paymentResponse.result.checkout_url;
        } else {
          message.error('Cannot create PayOS payment link');
        }
      } else {
        // Other payment methods
        message.success('Order created! Please complete payment.');
        setIsCheckoutModalVisible(false);
        navigate(`/payment/success?order_id=${orderId}`);
      }

      // Clear cart after successful order
      dispatch(clearCart());
      localStorage.removeItem('cart');

    } catch (error) {
      console.error('❌ CartPage - Checkout error:', error);
      
      // Handle specific error messages from backend
      let errorMessage = 'An error occurred while processing the order';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderCheckoutForm = () => {
    if (checkoutStep === 0) {
      return (
        <div className="space-y-6">
          <Title level={4}>Shipping information</Title>
          
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name={['shipping_address', 'fullname']}
                label="Full name"
                rules={[{ required: true, message: 'Please enter full name!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn An" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name={['shipping_address', 'phone']}
                label="Phone number"
                rules={[{ required: true, message: 'Please enter phone number!' }]}
              >
                <Input prefix={<PhoneOutlined />} placeholder="0901234567" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['shipping_address', 'address_line_1']}
            label="Address"
            rules={[{ required: true, message: 'Please enter address!' }]}
          >
            <Input prefix={<EnvironmentOutlined />} placeholder="123 Đường Lê Lợi" />
          </Form.Item>

          <Form.Item
            name={['shipping_address', 'address_line_2']}
            label="Address line 2 (optional)"
          >
            <Input placeholder="Phường Bến Nghé, Quận 1" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name={['shipping_address', 'city']}
                label="City"
                rules={[{ required: true, message: 'Please enter city!' }]}
              >
                <Input placeholder="Thành phố Hồ Chí Minh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['shipping_address', 'state']}
                label="State/Province"
                rules={[{ required: true, message: 'Please enter state/province!' }]}
              >
                <Input placeholder="Hồ Chí Minh" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name={['shipping_address', 'postal_code']}
                label="Postal code"
                rules={[{ required: true, message: 'Please enter postal code!' }]}
              >
                <Input placeholder="70000" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name={['shipping_address', 'country']}
            label="Country"
            rules={[{ required: true, message: 'Please select country!' }]}
          >
            <Select placeholder="Select country">
              <Option value="Vietnam">Việt Nam</Option>
              <Option value="USA">Hoa Kỳ</Option>
              <Option value="UK">Anh</Option>
              <Option value="Japan">Nhật Bản</Option>
              <Option value="Korea">Hàn Quốc</Option>
            </Select>
          </Form.Item>
        </div>
      );
    }

    if (checkoutStep === 1) {
      return (
        <div className="space-y-6">
          <Title level={4}>Payment method</Title>
          
          <Form.Item
            name="payment_method"
            label="Select payment method"
            rules={[{ required: true, message: 'Please select payment method!' }]}
          >
            <Select placeholder="Select payment method">
              <Option value="cash_on_delivery">Cash on delivery</Option>
              <Option value="payos">PayOS</Option>
              <Option value="credit_card">Credit card</Option>
              <Option value="debit_card">Debit card</Option>
              <Option value="bank_transfer">Bank transfer</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="notes"
            label="Notes (optional)"
          >
            <TextArea 
              rows={3} 
              placeholder="Delivery within business hours, call before 30 minutes..."
            />
          </Form.Item>

          <div className="bg-gray-50 p-4 rounded-lg">
            <Title level={5}>Order summary</Title>
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <Text>{item.name} x{item.quantity}</Text>
                  <Text>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</Text>
                </div>
              ))}
              <Divider />
              <div className="flex justify-between font-bold text-lg">
                <Text>Total:</Text>
                <Text className="text-green-600">{cartTotal.toLocaleString('vi-VN')}₫</Text>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return null;
  };

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Cart is empty"
            className="bg-white py-16"
          >
            <Button 
              type="primary" 
              size="large"
              onClick={() => navigate('/products')}
              icon={<ShoppingOutlined />}
            >
              Continue shopping
            </Button>
          </Empty>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <Title level={2} className="mb-8">Cart ({cartItemCount} products)</Title>

        <Row gutter={24}>
          <Col xs={24} lg={16}>
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item, index) => (
                <Card key={index} className="shadow-sm">
                  <Row gutter={16} align="middle">
                    <Col span={6}>
                      <Image
                        alt={item.name}
                        src={getActualImageUrl(item)}
                        fallback={getImageUrl('/img/logo.png')}
                        width={120}
                        height={120}
                        className="rounded-lg object-cover"
                      />
                    </Col>
                    <Col span={12}>
                      <div className="space-y-2">
                        <Title level={4} className="mb-2">{item.name}</Title>
                        {item.brand && <Tag color="blue" size="small">{item.brand}</Tag>}
                        {item.selectedSize && <Tag size="small">{item.selectedSize}</Tag>}
                        {item.selectedColor && <Tag size="small">{item.selectedColor}</Tag>}
                        <div className="text-lg font-bold text-green-600">
                          {item.price.toLocaleString('vi-VN')}₫
                        </div>
                      </div>
                    </Col>
                    <Col span={6}>
                      <div className="space-y-3 text-right">
                        <div>
                          <Text>Quantity:</Text>
                          <InputNumber
                            min={1}
                            max={item.stock || 999}
                            value={item.quantity}
                            onChange={(value) => handleQuantityChange(item._id, value)}
                            size="small"
                          />
                        </div>
                        <div className="text-lg font-bold">
                          {(item.price * item.quantity).toLocaleString('vi-VN')}₫
                        </div>
                        <Space direction="vertical" size="small">
                          <Button
                            type="text"
                            size="small"
                            icon={<HeartOutlined />}
                            onClick={() => handleMoveToWishlist(item._id)}
                          >
                            Wishlist
                          </Button>
                          <Button
                            type="text"
                            size="small"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => handleRemoveItem(item._id)}
                          >
                            Delete
                          </Button>
                        </Space>
                      </div>
                    </Col>
                  </Row>
                </Card>
              ))}
            </div>

            {/* Cart Actions */}
            <div className="mt-6 flex justify-between">
              <Button 
                onClick={handleClearCart}
                danger
                icon={<DeleteOutlined />}
              >
                Clear cart
              </Button>
              <Button 
                onClick={() => navigate('/products')}
                icon={<ShoppingOutlined />}
              >
                Continue shopping
              </Button>
            </div>
          </Col>

          <Col xs={24} lg={8}>
            {/* Cart Summary */}
            <Card className="sticky top-4 shadow-sm">
              <Title level={3} className="mb-6">Order summary</Title>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  {cartItems.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <Text>{item.name} x{item.quantity}</Text>
                      <Text>{(item.price * item.quantity).toLocaleString('vi-VN')}₫</Text>
                    </div>
                  ))}
                </div>
                
                <Divider />
                
                <div className="flex justify-between text-xl font-bold">
                  <Text>Total:</Text>
                  <Text className="text-green-600">{cartTotal.toLocaleString('vi-VN')}₫</Text>
                </div>
                
                <Button
                  type="primary"
                  size="large"
                  block
                  onClick={handleCheckout}
                  icon={<CreditCardOutlined />}
                  className="bg-green-500 hover:bg-green-600 border-0"
                >
                  Checkout
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Checkout Modal */}
      <Modal
        title={
          <div className="text-center">
            <Title level={3}>Checkout</Title>
            <Steps current={checkoutStep} size="small">
              <Step title="Shipping information" />
              <Step title="Payment" />
            </Steps>
          </div>
        }
        open={isCheckoutModalVisible}
        onCancel={() => setIsCheckoutModalVisible(false)}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          form={checkoutForm}
          layout="vertical"
          initialValues={{
            shipping_address: {
              fullname: '',
              phone: '',
              address_line_1: '',
              address_line_2: '',
              city: '',
              state: '',
              postal_code: '',
              country: 'Vietnam'
            },
            payment_method: 'cash_on_delivery',
            notes: ''
          }}
        >
          {renderCheckoutForm()}
          
          <div className="mt-8 flex justify-between">
            {checkoutStep > 0 && (
              <Button onClick={handleCheckoutPrev}>
                Back
              </Button>
            )}
            <Button
              type="primary"
              onClick={handleCheckoutNext}
              loading={loading}
              className="bg-green-500 hover:bg-green-600 border-0"
            >
              {checkoutStep === 0 ? 'Next' : 'Complete order'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CartPage;
