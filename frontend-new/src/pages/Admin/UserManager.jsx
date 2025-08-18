import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Table, 
  Space, 
  Modal, 
  Form, 
  Input, 
  Select, 
  message, 
  Popconfirm, 
  Tag, 
  Avatar,
  Row,
  Col,
  Statistic,
  Switch,
  Tooltip,
  Badge
} from 'antd';
import { 
  UserOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LockOutlined,
  UnlockOutlined,
  MailOutlined,
  PhoneOutlined,
  CalendarOutlined,
  SearchOutlined,
  FilterOutlined,
  PlusOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatRelativeTime } from '../../utils/helpers';
import API_ENDPOINTS from '../../services/apiEndpoints';

const { Option } = Select;
const { Search } = Input;
const { TextArea } = Input;

const UserManager = () => {
  const { user: currentUser, isAdmin } = useAuth();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Load users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      // TODO: Implement getUsers API call
      // const response = await AuthAPI.getUsers();
      // setUsers(response.data.result || []);
      setUsers([]); // Empty for now until API is implemented
    } catch (error) {
      message.error('Error loading user list: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Redirect if not admin
  useEffect(() => {
    if (currentUser && !isAdmin()) {
      window.location.href = '/';
    }
  }, [currentUser, isAdmin]);

  const handleCreateUser = async (values) => {
    try {
      // Simulate API call
      const newUser = {
        _id: Date.now().toString(),
        ...values,
        verify: 0,
        created_at: new Date(),
        updated_at: new Date(),
        avatar: '',
        cover_photo: ''
      };
      
      setUsers(prev => [newUser, ...prev]);
      message.success('User has been created successfully!');
      setUserModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      message.error('Error creating user: ' + error.message);
    }
  };

  const handleUpdateUser = async (values) => {
    try {
      const updatedUsers = users.map(u => 
        u._id === editingUser._id 
          ? { ...u, ...values, updated_at: new Date() }
          : u
      );
      
      setUsers(updatedUsers);
      message.success('User has been updated successfully!');
      setUserModalVisible(false);
      setEditingUser(null);
    } catch (error) {
      message.error('Error updating user: ' + error.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      setUsers(prev => prev.filter(u => u._id !== userId));
      message.success('User has been deleted successfully!');
    } catch (error) {
      message.error('Error deleting user: ' + error.message);
    }
  };

  const handleToggleVerification = async (userId) => {
    try {
      const updatedUsers = users.map(u => 
        u._id === userId 
          ? { ...u, verify: u.verify === 1 ? 0 : 1, updated_at: new Date() }
          : u
      );
      
      setUsers(updatedUsers);
      message.success('Verification status has been updated!');
    } catch (error) {
      message.error('Error updating verification status: ' + error.message);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const updatedUsers = users.map(u => 
        u._id === userId 
          ? { ...u, verify: u.verify === 2 ? 1 : 2, updated_at: new Date() }
          : u
      );
      
      setUsers(updatedUsers);
      message.success('Ban status has been updated!');
    } catch (error) {
      message.error('Error updating ban status: ' + error.message);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setUserModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setUserModalVisible(true);
  };

  const closeModal = () => {
    setUserModalVisible(false);
    setEditingUser(null);
  };

  const getVerificationStatus = (verify) => {
    switch (verify) {
      case 0:
        return { text: 'Unverified', color: 'orange', icon: <MailOutlined /> };
      case 1:
        return { text: 'Verified', color: 'green', icon: <MailOutlined /> };
      case 2:
        return { text: 'Banned', color: 'red', icon: <LockOutlined /> };
      default:
        return { text: 'Unspecified', color: 'default', icon: <UserOutlined /> };
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'member':
        return 'blue';
      case 'guest':
        return 'default';
      default:
        return 'default';
    }
  };

  // User columns for table
  const userColumns = [
    {
      title: 'Thông tin',
      key: 'info',
      render: (_, record) => (
        <div className="flex items-center space-x-3">
          <Avatar 
            size={48} 
            src={record.avatar} 
            icon={<UserOutlined />}
            className="border-2 border-gray-200"
          />
          <div>
            <div className="font-medium text-gray-900">{record.fullname}</div>
            <div className="text-sm text-gray-500">@{record.username}</div>
            <div className="text-xs text-gray-400">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Vai trò',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={getRoleColor(role)} className="capitalize">
          {role === 'admin' ? 'Admin' : 
           role === 'member' ? 'Member' : 'Guest'}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'verify',
      key: 'verify',
      render: (verify) => {
        const status = getVerificationStatus(verify);
        return (
          <Tag color={status.color} icon={status.icon}>
            {status.text}
          </Tag>
        );
      },
    },
    {
      title: 'Contact Information',
      key: 'contact',
      render: (_, record) => (
        <div className="space-y-1 text-sm">
          <div className="flex items-center space-x-2">
            <PhoneOutlined className="text-gray-400" />
            <span>{record.phone}</span>
          </div>
          <div className="flex items-center space-x-2">
            <CalendarOutlined className="text-gray-400" />
            <span>{formatDate(record.date_of_birth)}</span>
          </div>
          {record.location && (
            <div className="text-gray-500">{record.location}</div>
          )}
        </div>
      ),
    },
    {
      title: 'Joined Date',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => (
        <div className="text-sm">
          <div>{formatDate(date)}</div>
          <div className="text-gray-400">{formatRelativeTime(date)}</div>
        </div>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="View details">
            <Button
              type="text"
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {/* Handle view details */}}
            />
          </Tooltip>
          
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              size="small"
              onClick={() => openEditModal(record)}
            />
          </Tooltip>

          <Tooltip title={record.verify === 1 ? 'Cancel verification' : 'Verify'}>
            <Button
              type="text"
              icon={record.verify === 1 ? <UnlockOutlined /> : <MailOutlined />}
              size="small"
              onClick={() => handleToggleVerification(record._id)}
            />
          </Tooltip>

          <Tooltip title={record.verify === 2 ? 'Unban' : 'Ban'}>
            <Button
              type="text"
              danger={record.verify !== 2}
              icon={record.verify === 2 ? <UnlockOutlined /> : <LockOutlined />}
              size="small"
              onClick={() => handleToggleBan(record._id)}
            />
          </Tooltip>

          {record.role !== 'admin' && (
            <Popconfirm
              title="Are you sure you want to delete this user?"
              onConfirm={() => handleDeleteUser(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
              />
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  // Dashboard statistics
  const dashboardStats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: <UserOutlined />,
      color: '#1890ff'
    },
    {
      title: 'Verified',
      value: users.filter(u => u.verify === 1).length,
      icon: <MailOutlined />,
      color: '#52c41a'
    },
    {
      title: 'Unverified',
      value: users.filter(u => u.verify === 0).length,
      icon: <MailOutlined />,
      color: '#faad14'
    },
    {
      title: 'Banned',
      value: users.filter(u => u.verify === 2).length,
      icon: <LockOutlined />,
      color: '#ff4d4f'
    }
  ];

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.username.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    const matchesStatus = filterStatus === 'all' || user.verify.toString() === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  });

  if (!currentUser || !isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No access</h2>
          <p className="text-gray-600">You need admin access to access this page.</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">Manage user accounts and access</p>
        </div>

        {/* Dashboard Stats */}
        <Row gutter={[24, 24]} className="mb-8">
          {dashboardStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card>
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={<span style={{ color: stat.color }}>{stat.icon}</span>}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        {/* Filters and Actions */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Search
                placeholder="Search users..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              
              <Select
                value={filterRole}
                onChange={setFilterRole}
                style={{ width: 150 }}
                placeholder="Filter by role"
              >
                <Option value="all">All roles</Option>
                <Option value="admin">Admin</Option>
                <Option value="member">Member</Option>
                <Option value="guest">Guest</Option>
              </Select>

              <Select
                value={filterStatus}
                onChange={setFilterStatus}
                style={{ width: 150 }}
                placeholder="Filter by status"
              >
                <Option value="all">All status</Option>
                <Option value="0">Unverified</Option>
                <Option value="1">Verified</Option>
                <Option value="2">Banned</Option>
              </Select>
            </div>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openCreateModal}
              size="large"
            >
              Add new user
            </Button>
          </div>
        </Card>

        {/* Users Table */}
        <Card>
          <Table
            columns={userColumns}
            dataSource={filteredUsers}
            rowKey="_id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total, range) =>
                `${range[0]}-${range[1]} of ${total} users`,
            }}
            rowSelection={{
              selectedRowKeys: selectedUsers,
              onChange: setSelectedUsers,
              getCheckboxProps: (record) => ({
                disabled: record.role === 'admin',
                name: record.fullname,
              }),
            }}
          />
        </Card>
      </div>

      {/* User Modal */}
      <Modal
        title={editingUser ? 'Edit User' : 'Add New User'}
        open={userModalVisible}
        onCancel={closeModal}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={editingUser ? handleUpdateUser : handleCreateUser}
          initialValues={editingUser || {}}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="fullname"
                label="Full Name"
                rules={[{ required: true, message: 'Please enter the full name!' }]}
              >
                <Input placeholder="Enter full name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="username"
                label="Username"
                rules={[{ required: true, message: 'Please enter the username!' }]}
              >
                <Input placeholder="Enter username" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Please enter the email!' },
                  { type: 'email', message: 'Invalid email!' }
                ]}
              >
                <Input placeholder="Enter email" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: 'Please enter the phone number!' }]}
              >
                <Input placeholder="Enter phone number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="date_of_birth"
                label="Date of Birth"
                rules={[{ required: true, message: 'Please select the date of birth!' }]}
              >
                <Input type="date" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="role"
                label="Role"
                rules={[{ required: true, message: 'Please select the role!' }]}
              >
                <Select placeholder="Select role">
                  <Option value="member">Member</Option>
                  <Option value="guest">Guest</Option>
                  {editingUser?.role === 'admin' && (
                    <Option value="admin">Admin</Option>
                  )}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="location"
            label="Address"
          >
            <Input placeholder="Enter address" />
          </Form.Item>

          <Form.Item
            name="bio"
            label="Introduction"
          >
            <TextArea rows={3} placeholder="Enter introduction" />
          </Form.Item>

          <Form.Item
            name="website"
            label="Website"
          >
            <Input placeholder="Enter website" />
          </Form.Item>

          {!editingUser && (
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item
                  name="password"
                  label="Password"
                  rules={[
                    { required: true, message: 'Please enter the password!' },
                    { min: 6, message: 'Password must be at least 6 characters!' }
                  ]}
                >
                  <Input.Password placeholder="Enter password" />
                </Form.Item>
              </Col>
              <Col span={12}>
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
                  <Input.Password placeholder="Enter confirm password" />
                </Form.Item>
              </Col>
            </Row>
          )}

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={closeModal}>Cancel</Button>
            <Button 
              type="primary" 
              htmlType="submit"
            >
              {editingUser ? 'Update' : 'Create'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManager;
