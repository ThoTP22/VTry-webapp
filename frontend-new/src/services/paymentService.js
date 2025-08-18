import axios from '../api/axios';

const PAYMENT_API = {
  // Orders API endpoints
  CREATE_ORDER: '/orders/',
  GET_USER_ORDERS: '/orders/my-orders',
  GET_ORDER_BY_ID: (orderId) => `/orders/${orderId}`,
  GET_ORDER_BY_NUMBER: (orderNumber) => `/orders/order-number/${orderNumber}`,
  CANCEL_ORDER: (orderId) => `/orders/${orderId}/cancel`,
  GET_USER_ORDER_STATS: '/orders/my-stats',
  
  // Payments API endpoints
  CREATE_PAYMENT: '/payments/',
  GET_PAYMENT_STATUS: (orderCode) => `/payments/status/${orderCode}`,
  CANCEL_PAYMENT: (orderCode) => `/payments/cancel/${orderCode}`,
  GET_USER_PAYMENTS: '/payments/my-payments',
  
  // Admin endpoints
  GET_ALL_ORDERS: '/orders/admin/all',
  GET_ALL_ORDER_STATS: '/orders/admin/stats',
  UPDATE_ORDER_STATUS: (orderId) => `/orders/admin/${orderId}/status`,
  GET_USER_PAYMENTS_ADMIN: (userId) => `/payments/admin/user/${userId}/payments`
};

class PaymentService {
  // ===== ORDERS API =====
  
  // Create new order
  async createOrder(orderData) {
    try {
      // Validate order data before sending to API
      if (!orderData) {
        throw new Error('Order data is required');
      }
      
      // Check for required fields
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        throw new Error('Order must contain items');
      }
      
      if (!orderData.shipping_address) {
        throw new Error('Shipping address is required');
      }
      
      if (!orderData.payment_method) {
        throw new Error('Payment method is required');
      }
      
      // Validate shipping address
      const requiredAddressFields = ['fullname', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
      for (const field of requiredAddressFields) {
        if (!orderData.shipping_address[field]) {
          throw new Error(`Shipping address ${field} is required`);
        }
      }
      
      console.log('🛒 PaymentService - Creating order:', {
        items: orderData.items.length,
        shipping_address: orderData.shipping_address,
        payment_method: orderData.payment_method
      });
      
      const response = await axios.post(PAYMENT_API.CREATE_ORDER, orderData);
      console.log('🛒 PaymentService - Order created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error creating order:', error);
      throw error;
    }
  }

  // Get user's orders
  async getUserOrders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${PAYMENT_API.GET_USER_ORDERS}${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting user orders:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      console.log('🔍 PaymentService - Getting order by ID:', orderId);
      
      // Kiểm tra token trước khi gọi API
      const token = localStorage.getItem('access_token');
      if (!token) {
        console.warn('⚠️ PaymentService - No auth token found for getOrderById');
      }
      
      const response = await axios.get(PAYMENT_API.GET_ORDER_BY_ID(orderId));
      console.log('✅ PaymentService - Order retrieved successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting order:', error);
      // Log chi tiết lỗi để debug
      if (error.response) {
        console.error('❌ Response error:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
      } else if (error.request) {
        console.error('❌ Request error - no response received:', error.request);
      } else {
        console.error('❌ Error setting up request:', error.message);
      }
      throw error;
    }
  }

  // Get order by order number
  async getOrderByNumber(orderNumber) {
    try {
      const response = await axios.get(PAYMENT_API.GET_ORDER_BY_NUMBER(orderNumber));
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting order by number:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, cancellationReason = '') {
    try {
      const response = await axios.patch(PAYMENT_API.CANCEL_ORDER(orderId), {
        cancellation_reason: cancellationReason
      });
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error cancelling order:', error);
      throw error;
    }
  }

  // Get user order statistics
  async getUserOrderStats() {
    try {
      const response = await axios.get(PAYMENT_API.GET_USER_ORDER_STATS);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting order stats:', error);
      throw error;
    }
  }

  // ===== PAYMENTS API =====
  
  // Create payment for order
  async createPayment(paymentData) {
    try {
      console.log('💳 PaymentService - Creating payment:', paymentData);
      const response = await axios.post(PAYMENT_API.CREATE_PAYMENT, paymentData);
      console.log('💳 PaymentService - Payment created:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error creating payment:', error);
      throw error;
    }
  }

  // Get payment status
  async getPaymentStatus(orderCode) {
    try {
      const response = await axios.get(PAYMENT_API.GET_PAYMENT_STATUS(orderCode));
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting payment status:', error);
      throw error;
    }
  }

  // Cancel payment
  async cancelPayment(orderCode, cancellationReason = '') {
    try {
      const response = await axios.post(PAYMENT_API.CANCEL_PAYMENT(orderCode), {
        cancellation_reason: cancellationReason
      });
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error cancelling payment:', error);
      throw error;
    }
  }

  // Get user payment history
  async getUserPayments(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${PAYMENT_API.GET_USER_PAYMENTS}${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting user payments:', error);
      throw error;
    }
  }

  // ===== ADMIN API =====
  
  // Get all orders (Admin only)
  async getAllOrders(params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${PAYMENT_API.GET_ALL_ORDERS}${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting all orders:', error);
      throw error;
    }
  }

  // Get all order statistics (Admin only)
  async getAllOrderStats() {
    try {
      const response = await axios.get(PAYMENT_API.GET_ALL_ORDER_STATS);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting all order stats:', error);
      throw error;
    }
  }

  // Update order status (Admin only)
  async updateOrderStatus(orderId, statusData) {
    try {
      const response = await axios.patch(PAYMENT_API.UPDATE_ORDER_STATUS(orderId), statusData);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error updating order status:', error);
      throw error;
    }
  }

  // Get user payments (Admin only)
  async getUserPaymentsAdmin(userId, params = {}) {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = `${PAYMENT_API.GET_USER_PAYMENTS_ADMIN(userId)}${queryString ? `?${queryString}` : ''}`;
      const response = await axios.get(url);
      return response.data;
    } catch (error) {
      console.error('❌ PaymentService - Error getting user payments admin:', error);
      throw error;
    }
  }

  // ===== HELPER METHODS =====
  
  // Process cart items for order creation
  processCartForOrder(cartItems, shippingAddress, paymentMethod, notes = '') {
    console.log('🔍 Processing cart for order:', {
      cartItems: cartItems?.length || 0,
      shippingAddress,
      paymentMethod
    });
    
    // Validate product IDs
    if (!cartItems || cartItems.length === 0) {
      throw new Error('Cart is empty');
    }
    
    // Ensure each item has a valid _id
    const items = cartItems.map(item => {
      if (!item._id) {
        console.error('❌ Invalid product ID:', item);
        throw new Error('Invalid product in cart');
      }
      return {
        product_id: item._id,
        quantity: item.quantity || 1,
        selected_size: item.selectedSize || null,
        selected_color: item.selectedColor || null
      };
    });

    // Validate shipping address
    if (!shippingAddress) {
      console.error('❌ Missing shipping address');
      throw new Error('Shipping address is required');
    }
    
    // Create a clean shipping address object with trimmed values
    const cleanShippingAddress = {};
    
    // Ensure all required fields are present and trim string values
    const requiredFields = ['fullname', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
    for (const field of requiredFields) {
      if (!shippingAddress[field]) {
        console.error(`❌ Missing shipping address field: ${field}`);
        throw new Error(`Missing information: ${field}`);
      }
      
      // Trim string values
      if (typeof shippingAddress[field] === 'string') {
        cleanShippingAddress[field] = shippingAddress[field].trim();
        
        // Check if field is empty after trimming
        if (cleanShippingAddress[field] === '') {
          console.error(`❌ Empty shipping address field after trimming: ${field}`);
          throw new Error(`Information ${field} cannot be empty`);
        }
      } else {
        cleanShippingAddress[field] = shippingAddress[field];
      }
    }
    
    // Copy any additional fields
    Object.keys(shippingAddress).forEach(key => {
      if (!requiredFields.includes(key)) {
        cleanShippingAddress[key] = shippingAddress[key];
      }
    });

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    console.log('✅ Order data processed successfully');

    return {
      items,
      shipping_address: cleanShippingAddress,
      payment_method: paymentMethod,
      currency: 'VND',
      notes: notes || ''
    };
  }

  // Process payment data for PayOS
  processPaymentData(orderId, paymentMethod, returnUrl, cancelUrl) {
    return {
      order_id: orderId,
      payment_method: paymentMethod,
      return_url: returnUrl,
      cancel_url: cancelUrl
    };
  }

  // Validate shipping address
  validateShippingAddress(address) {
    console.log('🔍 Validating shipping address:', address);
    
    if (!address) {
      console.error('❌ Shipping address is null or undefined');
      throw new Error('Shipping address is required');
    }
    
    // Check required fields
    const required = ['fullname', 'phone', 'address_line_1', 'city', 'state', 'postal_code', 'country'];
    
    // Log all fields for debugging
    required.forEach(field => {
      console.log(`🔍 Field ${field}: "${address[field]}" (${typeof address[field]})`);
    });
    
    const missing = required.filter(field => {
      // Check if field is missing or empty string
      return !address[field] || (typeof address[field] === 'string' && address[field].trim() === '');
    });
    
    console.log('🔍 Missing fields:', missing);
    
    if (missing.length > 0) {
      // Create specific error messages for each missing field
      const errorMessages = {
        fullname: 'Full name cannot be empty',
        phone: 'Phone number cannot be empty',
        address_line_1: 'Address cannot be empty',
        city: 'City cannot be empty',
        state: 'State/Province cannot be empty',
        postal_code: 'Postal code cannot be empty',
        country: 'Country cannot be empty'
      };
      
      // Throw the first missing field error
      const errorMessage = errorMessages[missing[0]] || `Missing information: ${missing[0]}`;
      console.error('❌ Validation error:', errorMessage);
      throw new Error(errorMessage);
    }

    // Validate phone number (Vietnamese format) - more lenient now
    const phoneRegex = /^(0|\+84)[0-9]{9,10}$/;
    if (!phoneRegex.test(address.phone)) {
      console.warn('⚠️ Phone number format warning:', address.phone);
      // Make this a warning instead of error for now
      // throw new Error('Số điện thoại không đúng định dạng. Vui lòng sử dụng định dạng Việt Nam (vd: 0901234567 hoặc +84901234567)');
    }

    // Validate postal code - more lenient for international addresses
    if (address.country === 'Vietnam' && !/^\d{5,6}$/.test(address.postal_code)) {
      console.warn('⚠️ Postal code format warning:', address.postal_code);
      // Make this a warning instead of error for now
      // throw new Error('Mã bưu điện không đúng định dạng. Đối với Việt Nam, vui lòng sử dụng 5-6 chữ số');
    }

    console.log('✅ Shipping address validation passed');
    return true;
  }

  // Get payment method display name
  getPaymentMethodName(method) {
    const methods = {
      'cash_on_delivery': 'Cash on delivery',
      'payos': 'PayOS',
      'credit_card': 'Credit card',
      'debit_card': 'Debit card',
      'paypal': 'PayPal',
      'bank_transfer': 'Bank transfer'
    };
    return methods[method] || method;
  }

  // Get order status display name
  getOrderStatusName(status) {
    const statuses = {
      'pending': 'Pending',
      'confirmed': 'Confirmed',
      'processing': 'Processing',
      'shipped': 'Shipped',
      'delivered': 'Delivered',
      'cancelled': 'Cancelled',
      'refunded': 'Refunded'
    };
    return statuses[status] || status;
  }

  // Get order status color
  getOrderStatusColor(status) {
    const colors = {
      'pending': 'orange',
      'confirmed': 'blue',
      'processing': 'cyan',
      'shipped': 'purple',
      'delivered': 'green',
      'cancelled': 'red',
      'refunded': 'red'
    };
    return colors[status] || 'default';
  }

  // Get payment status display name
  getPaymentStatusName(status) {
    const statuses = {
      'pending': 'Pending',
      'processing': 'Processing',
      'completed': 'Completed',
      'failed': 'Failed',
      'cancelled': 'Cancelled',
      'expired': 'Expired'
    };
    return statuses[status] || status;
  }

  // Get payment status color
  getPaymentStatusColor(status) {
    const colors = {
      'pending': 'orange',
      'processing': 'blue',
      'completed': 'green',
      'failed': 'red',
      'cancelled': 'red',
      'expired': 'gray'
    };
    return colors[status] || 'default';
  }

  // Format currency
  formatCurrency(amount, currency = 'VND') {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(amount);
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  // Calculate order totals
  calculateOrderTotals(items, currency = 'VND') {
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const taxAmount = Math.round(subtotal * 0.0); // 0% tax
    const shippingFee = 0
    //const shippingFee = subtotal > 2500000 ? 0 : 30000; // Free shipping over 2.5M VND
    const totalAmount = subtotal + taxAmount + shippingFee;

    return {
      subtotal,
      taxAmount,
      shippingFee,
      totalAmount,
      currency
    };
  }
}

export default new PaymentService();
