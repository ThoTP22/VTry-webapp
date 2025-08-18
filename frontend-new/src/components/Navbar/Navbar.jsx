import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Menu,
  Button,
  Avatar,
  Dropdown,
  Badge,
  Space,
  Typography,
  Divider,
  message
} from 'antd';
import {
  UserOutlined,
  ShoppingCartOutlined,
  LogoutOutlined,
  SettingOutlined,
  HeartOutlined,
  CrownOutlined,
  MenuOutlined,
  HomeOutlined,
  AppstoreOutlined,
  ExperimentOutlined,
  StarOutlined
} from '@ant-design/icons';
import { useAuth } from '../../hooks/useAuth';
import { selectCartItemCount } from '../../store/cartSlice';

const { Text } = Typography;

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout: logoutUser } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  
  // Get cart item count from Redux
  const cartItemCount = useSelector(selectCartItemCount);

  const handleLogout = () => {
    logoutUser();
    message.success('Logout successfully!');
    navigate('/');
  };

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Profile',
      onClick: () => navigate('/profile'),
    },
    {
      key: 'wishlist',
      icon: <HeartOutlined />,
      label: 'Wishlist',
      onClick: () => navigate('/wishlist'),
    },
    {
      key: 'orders',
      icon: <AppstoreOutlined />,
      label: 'My Orders',
      onClick: () => navigate('/orders'),
    },
    {
      type: 'divider',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => navigate('/settings'),
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const adminMenuItems = [
    {
      key: 'admin',
      icon: <CrownOutlined />,
      label: 'Admin',
      onClick: () => navigate('/admin'),
    },
    ...userMenuItems,
  ];

  const mainMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'HomePage',
      onClick: () => navigate('/'),
    },
    {
      key: 'products',
      icon: <AppstoreOutlined />,
      label: 'Product Catalog',
      onClick: () => navigate('/products'),
    },

    {
      key: 'virtual-tryon',
      icon: <ExperimentOutlined />,
      label: 'Virtual Try-On',
      onClick: () => navigate('/virtual-tryon'),
    },

    {
      key: 'ratings',
      icon: <StarOutlined />,
      label: 'Ratings',
      onClick: () => navigate('/ratings'),
    },
  ];

  const toggleMobileMenu = () => {
    setMobileMenuVisible(!mobileMenuVisible);
  };

  return (
    <nav className="bg-luxury-black text-luxury-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-luxury-gold rounded-full flex items-center justify-center">
                {/* <CrownOutlined className="text-luxury-black text-lg" /> */}
                <img src={"/img/logo.png"} alt="Logo" className="w-8 h-8 rounded" />
              </div>
              <span className="text-xl font-bold text-luxury-white">VTry Fashion</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              {mainMenuItems.map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  className={`  hover:font-bold transition-all duration-300 text-luxury-gold hover:text-luxury-gold ${
                    location.pathname === item.onClick ? 'text-luxury-gold bg-gray-700/20 font-bold' : ''
                  }`}
                  
                  onClick={item.onClick}
                >
                  {item.icon} {item.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Right side - Cart and User */}
          <div className="flex items-center space-x-4">
            {/* Cart Icon with Badge */}
            <div className="relative">
              <Link to="/cart" className="text-gray-700 hover:text-blue-600 transition-colors">
                <ShoppingCartOutlined className="text-xl" />
                {cartItemCount > 0 && (
                  <Badge 
                    count={cartItemCount} 
                    size="small" 
                    className="absolute -top-2 -right-2"
                    style={{ 
                      backgroundColor: '#1890ff',
                      color: 'white'
                    }}
                  />
                )}
              </Link>
            </div>

            {/* User Menu */}
            {isAuthenticated ? (
              <Dropdown
                menu={{
                  items: isAdmin ? adminMenuItems : userMenuItems,
                }}
                placement="bottomRight"
                trigger={['click']}
              >
                <Button
                  type="text"
                  className="text-luxury-white hover:text-luxury-gold hover:bg-luxury-darkgrey/20"
                >
                  <Space>
                    <Avatar
                      size="small"
                      icon={<UserOutlined />}
                      className="bg-luxury-gold text-luxury-black"
                    />
                    <span className="hidden sm:inline">{user?.name || user?.email}</span>
                    {isAdmin && (
                      <CrownOutlined className="text-luxury-gold" />
                    )}
                  </Space>
                </Button>
              </Dropdown>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button type="text" className="text-luxury-white hover:text-luxury-gold">
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button type="primary" className="bg-luxury-gold text-luxury-black hover:bg-luxury-gold/80 border-0">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Button
                type="text"
                icon={<MenuOutlined />}
                className="text-luxury-white hover:text-luxury-gold"
                onClick={toggleMobileMenu}
              />
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuVisible && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-luxury-darkgrey/10 rounded-lg mb-4">
              {mainMenuItems.map((item) => (
                <Button
                  key={item.key}
                  type="text"
                  block
                  className={`text-left text-white hover:text-yellow-400 hover:bg-gray-700/30 hover:font-bold transition-all duration-300 ${
                    location.pathname === item.onClick ? 'text-yellow-400 bg-gray-700/20 font-bold' : ''
                  }`}
                  onClick={() => {
                    item.onClick();
                    setMobileMenuVisible(false);
                  }}
                >
                  {item.icon} {item.label}
                </Button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
