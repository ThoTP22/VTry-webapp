import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Card,
  Table,
  Typography,
  Tag,
  Button,
  Space,
  Modal,
  Descriptions,
  Row,
  Col,
  Image,
  message,
  Spin,
  Empty,
  Select,
  DatePicker,
  Input
} from 'antd';
import {
  EyeOutlined,
  ShoppingCartOutlined,
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import API_ENDPOINTS from '../../services/apiEndpoints';
import axios from '../../api/axios';

const { Title, Text } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const OrdersPage = () => {
  const { user } = useAuth();
  const { id: orderIdFromUrl } = useParams();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    dateRange: null
  });

  // Fetch orders from API
  const fetchOrders = async (page = 1, pageSize = 10, status = '', dateRange = null) => {
    try {
      setLoading(true);
      
      const params = {
        page,
        limit: pageSize,
        sort: 'created_at',
        order: 'desc'
      };

      if (status) {
        params.status = status;
      }

      if (dateRange && dateRange.length === 2) {
        params.from_date = dateRange[0].format('YYYY-MM-DD');
        params.to_date = dateRange[1].format('YYYY-MM-DD');
      }

      console.log('🛒 OrdersPage - Fetching orders with params:', params);
      
      const response = await axios.get(API_ENDPOINTS.ORDERS.MY_ORDERS, { params });
      
      console.log('🛒 OrdersPage - Orders response:', response.data);
      
      if (response.data.result) {
        setOrders(response.data.result.orders || []);
        setPagination({
          current: response.data.result.pagination?.page || 1,
          pageSize: response.data.result.pagination?.limit || 10,
          total: response.data.result.pagination?.total || 0
        });
      }
    } catch (error) {
      console.error('❌ OrdersPage - Error fetching orders:', error);
      message.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  // Fetch order details
  const fetchOrderDetails = async (orderId) => {
    try {
      const response = await axios.get(API_ENDPOINTS.ORDERS.GET_BY_ID(orderId));
      if (response.data.result) {
        setSelectedOrder(response.data.result);
        setDetailModalVisible(true);
      }
    } catch (error) {
      console.error('❌ OrdersPage - Error fetching order details:', error);
      message.error('Failed to load order details');
    }
  };

  // Initial load
  useEffect(() => {
    fetchOrders();
  }, []);

  // Auto-open order detail if ID in URL
  useEffect(() => {
    if (orderIdFromUrl) {
      fetchOrderDetails(orderIdFromUrl);
    }
  }, [orderIdFromUrl]);

  // Handle table change (pagination, sorting, filtering)
  const handleTableChange = (paginationConfig, filters, sorter) => {
    fetchOrders(
      paginationConfig.current,
      paginationConfig.pageSize,
      filters.status,
      filters.dateRange
    );
  };

  // Handle filter change
  const handleFilterChange = () => {
    fetchOrders(1, pagination.pageSize, filters.status, filters.dateRange);
  };

  // Get order status color
  const getOrderStatusColor = (status) => {
    const statusColors = {
      pending: 'orange',
      confirmed: 'blue',
      processing: 'cyan',
      shipping: 'purple',
      delivered: 'green',
      cancelled: 'red'
    };
    return statusColors[status] || 'default';
  };

  // Get payment status color
  const getPaymentStatusColor = (status) => {
    const statusColors = {
      pending: 'orange',
      paid: 'green',
      failed: 'red',
      refunded: 'purple'
    };
    return statusColors[status] || 'default';
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount);
  };

  // Table columns
  const columns = [
    {
      title: 'Order Number',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (orderNumber) => (
        <Text strong className="text-blue-600">
          {orderNumber}
        </Text>
      )
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items) => (
        <Text>{items?.length || 0} item(s)</Text>
      )
    },
    {
      title: 'Total',
      dataIndex: 'total_amount',
      key: 'total_amount',
      render: (total_amount) => (
        <Text strong className="text-green-600">
          {formatCurrency(total_amount)}
        </Text>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getOrderStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Payment',
      dataIndex: ['payment_info', 'status'],
      key: 'payment_status',
      render: (status) => (
        <Tag color={getPaymentStatusColor(status)}>
          {status?.toUpperCase()}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => fetchOrderDetails(record._id)}
          >
            View
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Title level={2} className="flex items-center">
            <ShoppingCartOutlined className="mr-3" />
            My Orders
          </Title>
          <Text type="secondary">
            Track and manage your orders
          </Text>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={8} md={6}>
              <Text strong>Status:</Text>
              <Select
                placeholder="All statuses"
                className="w-full mt-1"
                value={filters.status}
                onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                allowClear
              >
                <Option value="pending">Pending</Option>
                <Option value="confirmed">Confirmed</Option>
                <Option value="processing">Processing</Option>
                <Option value="shipping">Shipping</Option>
                <Option value="delivered">Delivered</Option>
                <Option value="cancelled">Cancelled</Option>
              </Select>
            </Col>
            <Col xs={24} sm={8} md={6}>
              <Text strong>Date Range:</Text>
              <RangePicker
                className="w-full mt-1"
                value={filters.dateRange}
                onChange={(dates) => setFilters(prev => ({ ...prev, dateRange: dates }))}
              />
            </Col>
            <Col xs={24} sm={8} md={6}>
              <div className="pt-6">
                <Space>
                  <Button
                    type="primary"
                    icon={<SearchOutlined />}
                    onClick={handleFilterChange}
                  >
                    Filter
                  </Button>
                  <Button
                    icon={<ReloadOutlined />}
                    onClick={() => {
                      setFilters({ status: '', dateRange: null });
                      fetchOrders();
                    }}
                  >
                    Reset
                  </Button>
                </Space>
              </div>
            </Col>
          </Row>
        </Card>

        {/* Orders Table */}
        <Card>
          <Table
            columns={columns}
            dataSource={orders}
            rowKey="_id"
            loading={loading}
            pagination={{
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} orders`
            }}
            onChange={handleTableChange}
            locale={{
              emptyText: (
                <Empty
                  description="No orders found"
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                />
              )
            }}
          />
        </Card>

        {/* Order Details Modal */}
        <Modal
          title={`Order Details - ${selectedOrder?.order_number}`}
          open={detailModalVisible}
          onCancel={() => setDetailModalVisible(false)}
          footer={null}
          width={800}
        >
          {selectedOrder && (
            <div className="space-y-6">
              {/* Order Info */}
              <Descriptions title="Order Information" bordered column={2}>
                <Descriptions.Item label="Order Number">
                  {selectedOrder.order_number}
                </Descriptions.Item>
                <Descriptions.Item label="Date">
                  {new Date(selectedOrder.created_at).toLocaleString('vi-VN')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <Tag color={getOrderStatusColor(selectedOrder.status)}>
                    {selectedOrder.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Tag color={getPaymentStatusColor(selectedOrder.payment_info?.status)}>
                    {selectedOrder.payment_info?.status?.toUpperCase()}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Method">
                  {selectedOrder.payment_info?.method}
                </Descriptions.Item>
                <Descriptions.Item label="Total">
                  <Text strong className="text-green-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>

              {/* Shipping Address */}
              {selectedOrder.shipping_address && (
                <Descriptions title="Shipping Address" bordered column={1}>
                  <Descriptions.Item label="Full Name">
                    {selectedOrder.shipping_address.full_name || selectedOrder.shipping_address.fullname}
                  </Descriptions.Item>
                  <Descriptions.Item label="Phone">
                    {selectedOrder.shipping_address.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Address">
                    {[
                      selectedOrder.shipping_address.address || selectedOrder.shipping_address.address_line_1,
                      selectedOrder.shipping_address.ward,
                      selectedOrder.shipping_address.district || selectedOrder.shipping_address.city,
                      selectedOrder.shipping_address.city || selectedOrder.shipping_address.state,
                      selectedOrder.shipping_address.postal_code
                    ].filter(Boolean).join(', ')}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {/* Order Items */}
              <div>
                <Title level={4}>Order Items</Title>
                <div className="space-y-4">
                  {selectedOrder.items?.map((item, index) => (
                    <Card key={index} size="small">
                      <Row gutter={16} align="middle">
                        <Col span={4}>
                          <Image
                            width={60}
                            height={60}
                            src={item.product_image || '/img/logo.png'}
                            fallback="/img/logo.png"
                            style={{ objectFit: 'cover', borderRadius: '8px' }}
                          />
                        </Col>
                        <Col span={12}>
                          <div>
                            <Text strong>{item.product_name || 'Product'}</Text>
                            {item.size && <div><Text type="secondary">Size: {item.size}</Text></div>}
                            {item.color && <div><Text type="secondary">Color: {item.color}</Text></div>}
                          </div>
                        </Col>
                        <Col span={4}>
                          <Text>Qty: {item.quantity}</Text>
                        </Col>
                        <Col span={4}>
                          <Text strong>{formatCurrency(item.unit_price || 0)}</Text>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Notes */}
              {selectedOrder.notes && (
                <Descriptions title="Notes" bordered column={1}>
                  <Descriptions.Item label="Customer Notes">
                    {selectedOrder.notes}
                  </Descriptions.Item>
                </Descriptions>
              )}
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default OrdersPage;
