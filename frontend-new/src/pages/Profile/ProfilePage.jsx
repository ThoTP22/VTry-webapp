import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  Upload, 
  message, 
  Tabs, 
  Avatar, 
  Row, 
  Col, 
  Divider,
  Tag,
  List,
  Timeline,
  Modal,
  Popconfirm,
  Space,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CameraOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  EnvironmentOutlined,
  GlobalOutlined,
  BookOutlined,
  ShoppingOutlined,
  HeartOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import API_ENDPOINTS from '../../services/apiEndpoints';

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const ProfilePage = () => {
  const { user, updateUser, logout } = useAuth();
  
  const [activeTab, setActiveTab] = useState('profile');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  // Profile data from user context
  const [profileData, setProfileData] = useState({
    fullname: user?.fullname || '',
    email: user?.email || '',
    phone: user?.phone || '',
    date_of_birth: user?.date_of_birth || '',
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || '',
    username: user?.username || '',
    avatar: user?.avatar || '',
    cover_photo: user?.cover_photo || ''
  });

  // Activity history - TODO: Implement API call
  const [activityHistory] = useState([]);

  // Orders and wishlist - TODO: Implement API calls
  const [orders] = useState([]);
  const [wishlist] = useState([]);

  useEffect(() => {
    if (user) {
      setProfileData({
        fullname: user.fullname || '',
        email: user.email || '',
        phone: user.phone || '',
        date_of_birth: user.date_of_birth ? new Date(user.date_of_birth).toISOString().split('T')[0] : '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        username: user.username || '',
        avatar: user.avatar || '',
        cover_photo: user.cover_photo || ''
      });
      form.setFieldsValue(profileData);
    }
  }, [user, form]);

  const handleSaveProfile = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      const updatedData = {
        ...profileData,
        ...values,
        updated_at: new Date()
      };
      
      setProfileData(updatedData);
      await updateUser(updatedData);
      
      message.success('Personal information updated successfully!');
      setEditing(false);
    } catch (error) {
      message.error('Error updating personal information: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values) => {
    try {
      setLoading(true);
      
      // Simulate API call
      if (values.new_password !== values.confirm_password) {
        message.error('Confirm password does not match!');
        return;
      }
      
      message.success('Password changed successfully!');
      setPasswordModalVisible(false);
      passwordForm.resetFields();
    } catch (error) {
      message.error('Error changing password: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = (file) => {
    // Simulate avatar upload
    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileData(prev => ({ ...prev, avatar: e.target.result }));
      message.success('Avatar updated successfully!');
    };
    reader.readAsDataURL(file);
    return false;
  };

  const getOrderStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'green';
      case 'processing':
        return 'blue';
      case 'shipped':
        return 'orange';
      case 'cancelled':
        return 'red';
      default:
        return 'default';
    }
  };

  const getOrderStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'processing':
        return 'Processing';
      case 'shipped':
        return 'Shipped';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'login':
        return <UserOutlined className="text-blue-500" />;
      case 'order':
        return <ShoppingOutlined className="text-green-500" />;
      case 'profile':
        return <EditOutlined className="text-purple-500" />;
      case 'wishlist':
        return <HeartOutlined className="text-red-500" />;
      default:
        return <UserOutlined />;
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Please login</h2>
          <p className="text-gray-600">You need to login to view your profile.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile Header */}
        <Card className="mb-8 relative overflow-hidden">
          {/* Cover Photo */}
          <div 
            className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg relative"
            style={{
              backgroundImage: profileData.cover_photo ? `url(${profileData.cover_photo})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }}
          >
            {!profileData.cover_photo && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-white text-center">
                  <CameraOutlined className="text-4xl mb-2" />
                  <p className="text-lg">No cover photo</p>
                </div>
              </div>
            )}
          </div>

          {/* Avatar and Basic Info */}
          <div className="relative -mt-16 ml-8 mb-6">
            <div className="relative">
              <Avatar 
                size={120} 
                src={profileData.avatar} 
                icon={<UserOutlined />}
                className="border-4 border-white shadow-lg"
              />
              <Button
                type="text"
                icon={<CameraOutlined />}
                className="absolute bottom-0 right-0 bg-white rounded-full shadow-md hover:bg-gray-50"
                onClick={() => setAvatarModalVisible(true)}
              />
            </div>
            
            <div className="mt-4">
              <h1 className="text-3xl font-bold text-gray-900">{profileData.fullname}</h1>
              <p className="text-gray-600">@{profileData.username}</p>
              {profileData.bio && (
                <p className="text-gray-700 mt-2 max-w-2xl">{profileData.bio}</p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="absolute top-4 right-4">
            <Space>
              <Button
                type="primary"
                icon={editing ? <SaveOutlined /> : <EditOutlined />}
                onClick={() => editing ? form.submit() : setEditing(true)}
                loading={loading}
              >
                {editing ? 'Save' : 'Edit'}
              </Button>
              {editing && (
                <Button onClick={() => {
                  setEditing(false);
                  form.setFieldsValue(profileData);
                }}>
                  Cancel
                </Button>
              )}
            </Space>
          </div>
        </Card>

        {/* Profile Content */}
        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Profile Tab */}
          <TabPane 
            tab={
              <span>
                <UserOutlined />
                  Personal information
              </span>
            } 
            key="profile"
          >
            <Card>
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSaveProfile}
                disabled={!editing}
              >
                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="fullname"
                      label="Full Name"
                      rules={[{ required: true, message: 'Please enter your full name!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Enter full name" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="username"
                      label="Username"
                      rules={[{ required: true, message: 'Please enter your username!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Enter username" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Please enter your email!' },
                        { type: 'email', message: 'Invalid email!' }
                      ]}
                    >
                      <Input prefix={<MailOutlined />} placeholder="Enter email" disabled />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Phone Number"
                      rules={[{ required: true, message: 'Please enter your phone number!' }]}
                    >
                      <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={[24, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="date_of_birth"
                      label="Date of Birth"
                    >
                      <Input type="date" prefix={<CalendarOutlined />} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="location"
                      label="Address"
                    >
                      <Input prefix={<EnvironmentOutlined />} placeholder="Enter address" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="website"
                  label="Website"
                >
                  <Input prefix={<GlobalOutlined />} placeholder="Enter website" />
                </Form.Item>

                <Form.Item
                  name="bio"
                  label="Bio"
                >
                  <TextArea rows={4} placeholder="Write about yourself..." />
                </Form.Item>

                <Divider />

                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">Security</h3>
                    <p className="text-gray-600">Manage password and account security</p>
                  </div>
                  <Button
                    icon={<LockOutlined />}
                    onClick={() => setPasswordModalVisible(true)}
                  >
                    Change password
                  </Button>
                </div>
              </Form>
            </Card>
          </TabPane>

          {/* Orders Tab */}
          <TabPane 
            tab={
              <span>
                <ShoppingOutlined />
                Orders
                <Badge count={orders.length} className="ml-2" />
              </span>
            } 
            key="orders"
          >
            <Card>
              <List
                dataSource={orders}
                renderItem={order => (
                  <List.Item
                    actions={[
                      <Button type="link" icon={<EyeOutlined />}>
                        View details
                      </Button>
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                          <ShoppingOutlined className="text-2xl text-gray-400" />
                        </div>
                      }
                      title={
                        <div className="flex items-center space-x-3">
                          <span className="font-semibold">#{order.id}</span>
                          <Tag color={getOrderStatusColor(order.status)}>
                            {getOrderStatusText(order.status)}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="space-y-1">
                          <div className="text-sm text-gray-600">
                            {order.products.join(', ')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(order.date)} • {order.items} products
                          </div>
                        </div>
                      }
                    />
                    <div className="text-right">
                      <div className="text-lg font-semibold text-green-600">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(order.total)}
                      </div>
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          </TabPane>

          {/* Wishlist Tab */}
          <TabPane 
            tab={
              <span>
                <HeartOutlined />
                Wishlist
                <Badge count={wishlist.length} className="ml-2" />
              </span>
            } 
            key="wishlist"
          >
            <Card>
              <Row gutter={[16, 16]}>
                {wishlist.map(item => (
                  <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                    <Card
                      hoverable
                      cover={
                        <img
                          alt={item.name}
                          src={item.image}
                          className="h-48 object-cover"
                        />
                      }
                      actions={[
                        <Button key="unfavorite" type="text" icon={<HeartOutlined />} className="text-red-500">
                          Remove from wishlist
                        </Button>,
                        <Button key="addtocart" type="text" icon={<ShoppingOutlined />}>
                          Add to cart
                        </Button>
                      ]}
                    >
                      <Card.Meta
                        title={item.name}
                        description={
                          <div className="space-y-2">
                            <div className="text-lg font-semibold text-green-600">
                              {new Intl.NumberFormat('vi-VN', {
                                style: 'currency',
                                currency: 'VND'
                              }).format(item.price)}
                            </div>
                            <div className="text-xs text-gray-500">
                              Added {formatRelativeTime(item.addedAt)}
                            </div>
                          </div>
                        }
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>
          </TabPane>

          {/* Activity Tab */}
          <TabPane 
            tab={
              <span>
                <BookOutlined />
                Activity
              </span>
            } 
            key="activity"
          >
            <Card>
              <Timeline>
                {activityHistory.map(activity => (
                  <Timeline.Item
                    key={activity.id}
                    dot={getActivityIcon(activity.type)}
                  >
                    <div className="space-y-1">
                      <div className="font-medium">{activity.description}</div>
                      <div className="text-sm text-gray-500">
                        {formatRelativeTime(activity.timestamp)}
                        {activity.ip && ` • IP: ${activity.ip}`}
                        {activity.amount && ` • ${new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(activity.amount)}`}
                      </div>
                    </div>
                  </Timeline.Item>
                ))}
              </Timeline>
            </Card>
          </TabPane>
        </Tabs>
      </div>

      {/* Password Change Modal */}
      <Modal
        title="Change password"
        open={passwordModalVisible}
        onCancel={() => setPasswordModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            name="current_password"
            label="Current password"
            rules={[{ required: true, message: 'Please enter your current password!' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>

          <Form.Item
            name="new_password"
              label="New password"
            rules={[
              { required: true, message: 'Please enter your new password!' },
              { min: 6, message: 'Password must be at least 6 characters!' }
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            label="Confirm new password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your new password!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Confirm password does not match!'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <div className="flex justify-end space-x-3">
            <Button onClick={() => setPasswordModalVisible(false)}>
              Cancel
            </Button>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
            >
              Change password
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Avatar Upload Modal */}
      <Modal
        title="Update avatar"
        open={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className="text-center space-y-4">
          <Avatar 
            size={120} 
            src={profileData.avatar} 
            icon={<UserOutlined />}
            className="mx-auto"
          />
          
          <Upload
            accept="image/*"
            showUploadList={false}
            beforeUpload={handleAvatarUpload}
          >
            <Button icon={<CameraOutlined />} size="large">
              Choose new avatar
            </Button>
          </Upload>
          
          <p className="text-sm text-gray-500">
            Supported: JPEG, PNG, GIF • Max: 5MB
          </p>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
