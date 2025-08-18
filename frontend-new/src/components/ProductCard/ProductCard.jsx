import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Card,
  Button,
  Modal,
  Tag,
  Space,
  Image,
  Divider,
  Row,
  Col,
  Typography,
  Badge,
  message,
  Select,
  InputNumber,
  Upload,
  Steps,
  Radio
} from 'antd';
import {
  EyeOutlined,
  HeartOutlined,
  ShoppingCartOutlined,
  StarOutlined,
  CalendarOutlined,
  TagOutlined,
  DollarOutlined,
  ExperimentOutlined,
  UserOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  LoadingOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { PRODUCT_CATEGORIES } from '../../constants';
import { addToCart } from '../../store/cartSlice';

const { Text, Title, Paragraph } = Typography;
const { Option } = Select;
const { Step } = Steps;

const ProductCard = ({ product, onAddToWishlist, onVirtualTryOn }) => {
  const dispatch = useDispatch();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  
  // Trạng thái cho Virtual Try-On trong modal
  const [tryOnStep, setTryOnStep] = useState(0);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [isTryOnModalVisible, setIsTryOnModalVisible] = useState(false);
  const [tryOnMode, setTryOnMode] = useState('balanced');
  const [numSamples, setNumSamples] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    _id,
    name,
    description,
    price,
    category,
    brand,
    sizes = [],
    colors = [],
    stock = 0,
    image,
    imageUrl, // Add support for imageUrl field
    created_at,
    updated_at
  } = product || {};

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/img/logo.png';
    
    // Debug: Log environment variables
    console.log('🔍 ProductCard - Environment variables:', {
      REACT_APP_BACKEND_URL: process.env.REACT_APP_BACKEND_URL,
      REACT_APP_API_BASE_URL: process.env.REACT_APP_API_BASE_URL,
      NODE_ENV: process.env.NODE_ENV
    });
    
    // If it's already a full URL, return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('🔍 ProductCard - Using full URL:', imageUrl);
      return imageUrl;
    }
    
    // If it's a relative path starting with /, prepend backend URL
    if (imageUrl.startsWith('/')) {
      const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5194';
      const fullUrl = `${apiUrl}${imageUrl}`;
      console.log('🔍 ProductCard - Constructed relative URL:', fullUrl);
      return fullUrl;
    }
    
    // If it's just a filename, construct the full path to backend images
    const apiUrl = process.env.REACT_APP_BACKEND_URL || 'http://localhost:5194';
    const fullUrl = `${apiUrl}/api/images/${imageUrl}`;
    console.log('🔍 ProductCard - Constructed filename URL:', fullUrl);
    return fullUrl;
  };

  // Get the actual image URL to use
  const getActualImageUrl = () => {
    // Priority: imageUrl (S3) > image (local) > placeholder
    if (imageUrl) {
      console.log('🔍 ProductCard - Using S3 imageUrl:', imageUrl);
      return imageUrl; // This is the S3 URL
    }
    if (image) {
      const localUrl = getImageUrl(image);
      console.log('🔍 ProductCard - Using local image:', localUrl);
      return localUrl; // This is local image
    }
    console.log('🔍 ProductCard - Using placeholder image');
    return '/img/logo.png';
  };

  const formatPrice = (price) => {
    if (!price || isNaN(price)) return '0₫';
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      return new Date(date).toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return 'N/A';
    }
  };

  const getCategoryColor = (category) => {
    if (!category) return 'default';
    const colors = {
      [PRODUCT_CATEGORIES.MEN]: 'blue',
      [PRODUCT_CATEGORIES.WOMEN]: 'pink',
      [PRODUCT_CATEGORIES.KIDS]: 'green',
      'men\'s': 'blue',
      'women\'s': 'pink',
      'children': 'green',
      'hoodies': 'purple',
      'shirts': 'cyan',
      'pants': 'orange',
      'shoes': 'red'
    };
    return colors[category.toLowerCase()] || 'default';
  };

  const handleImageLoad = () => {
    setIsImageLoading(false);
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setSelectedSize('');
    setSelectedColor('');
    setQuantity(1);
  };

  const showTryOnModal = () => {
    setIsTryOnModalVisible(true);
    setIsModalVisible(false);
  };
  
  const handleTryOnModalCancel = () => {
    setIsTryOnModalVisible(false);
    setTryOnStep(0);
    setUserPhoto(null);
    setUserPhotoFile(null);
  };
  
  const handleUploadUserPhoto = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserPhoto(e.target.result);
      setUserPhotoFile(file);
      setTryOnStep(1); // Chuyển sang bước tiếp theo sau khi upload ảnh
      message.success('Image uploaded successfully!');
    };
    reader.readAsDataURL(file);
    return false; // Ngăn Upload tự động gửi request
  };
  
  const startVirtualTryOn = async () => {
    if (!userPhotoFile) {
      message.error('Please upload your photo!');
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Chuẩn bị dữ liệu cho Virtual Try-On
      const tryOnData = {
        product: product,
        userPhoto: userPhoto,
        userPhotoFile: userPhotoFile,
        tryOnMode: tryOnMode,
        numSamples: numSamples
      };
      
      // Lưu vào localStorage
      localStorage.setItem('tryOnData', JSON.stringify(tryOnData));
      
      // Chuyển hướng đến trang kết quả
      window.location.href = '/virtual-tryon';
      setIsTryOnModalVisible(false);
    } catch (error) {
      console.error('Error preparing try-on data:', error);
      setIsProcessing(false);
      message.error('An error occurred. Please try again!');
    }
  };

  const handleAddToCart = () => {
    if (!selectedSize && sizes.length > 0) {
      message.warning('Please select size!');
      return;
    }
    if (!selectedColor && colors.length > 0) {
      message.warning('Please select color!');
      return;
    }
    if (stock <= 0) {
      message.error('Product is out of stock!');
      return;
    }
    if (quantity > stock) {
      message.error(`Only ${stock} products left in stock!`);
      return;
    }

    const cartProduct = {
      ...product,
      selectedSize,
      selectedColor,
      quantity
    };

    console.log('🛒 ProductCard - Adding to cart:', { product: cartProduct, quantity });
    dispatch(addToCart({ product: cartProduct, quantity }));
    message.success(`${name} has been added to the cart!`);
    
    // Save cart to localStorage after adding
    setTimeout(() => {
      // Get current cart state from Redux and save to localStorage
      const currentCart = localStorage.getItem('cart');
      if (currentCart) {
        const cartData = JSON.parse(currentCart);
        const updatedCart = {
          ...cartData,
          items: [...cartData.items, { ...cartProduct, quantity, addedAt: new Date().toISOString() }]
        };
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        console.log('🛒 ProductCard - Saved to localStorage:', updatedCart);
      } else {
        // If no cart exists, create new one
        const newCart = {
          items: [{ ...cartProduct, quantity, addedAt: new Date().toISOString() }],
          total: (product.price || 0) * quantity,
          itemCount: quantity
        };
        localStorage.setItem('cart', JSON.stringify(newCart));
        console.log('🛒 ProductCard - Created new cart in localStorage:', newCart);
      }
    }, 100);
  };

  const isInStock = stock > 0;

  return (
    <>
      <Card
        className="border-0 rounded-luxury overflow-hidden bg-luxury-white group group-hover:shadow-2xl transition-all duration-500 h-full"
        cover={
          <div className="relative overflow-hidden aspect-[3/4]">
            <Image
              alt={name}
              src={getActualImageUrl()}
              fallback="/img/logo.png"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onLoad={handleImageLoad}
              loading="lazy"
            />
            
            {/* Loading overlay */}
            {isImageLoading && (
              <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-black"></div>
              </div>
            )}

            {/* Category badge */}
            <div className="absolute top-4 left-4">
              <Tag color={getCategoryColor(category)} className="font-medium">
                {category}
              </Tag>
            </div>

            {/* Brand badge */}
            {brand && (
              <div className="absolute top-4 left-20">
                <Tag color="blue" className="font-medium">
                  {brand}
                </Tag>
              </div>
            )}

            {/* Stock status */}
            {!isInStock && (
              <div className="absolute top-4 right-4">
                <Tag color="red" className="font-medium">
                  Out of Stock
                </Tag>
              </div>
            )}

            {/* New badge */}
            {created_at && (new Date() - new Date(created_at)) < 7 * 24 * 60 * 60 * 1000 && (
              <div className="absolute top-16 right-4">
                <Badge.Ribbon text="NEW" color="red">
                  <div></div>
                </Badge.Ribbon>
              </div>
            )}

            {/* Quick Actions */}
            <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button 
                type="text" 
                icon={<HeartOutlined />}
                className="w-10 h-10 bg-luxury-white/80 backdrop-blur-sm text-luxury-black hover:text-red-500 rounded-full flex items-center justify-center"
                onClick={() => onAddToWishlist && onAddToWishlist(product)}
              />
              <Button 
                type="text" 
                icon={<EyeOutlined />}
                className="w-10 h-10 bg-luxury-white/80 backdrop-blur-sm text-luxury-black hover:text-accent-500 rounded-full flex items-center justify-center"
                onClick={showModal}
              />
            </div>
          </div>
        }
        styles={{ body: { padding: '24px' } }}
      >
        <div className="space-y-3">
          {/* Product name */}
          <h3 className="font-serif text-lg text-luxury-black group-hover:text-accent-500 transition-colors line-clamp-2">
            {name}
          </h3>
          
          {/* Price and stock info */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="text-xl font-semibold text-luxury-black">
                {formatPrice(price)}
              </div>
              {isInStock && (
                <div className="text-sm text-green-600">
                  {stock} products left in stock
                </div>
              )}
            </div>
            
            {/* Add to Cart Button */}
            {isInStock ? (
              <Button 
                type="text"
                icon={<ShoppingCartOutlined />}
                className="w-10 h-10 bg-luxury-black text-luxury-white hover:bg-accent-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300"
                onClick={showModal}
              />
            ) : (
              <Button 
                type="text"
                icon={<ShoppingCartOutlined />}
                className="w-10 h-10 bg-gray-400 text-white rounded-full flex items-center justify-center"
                disabled
              />
            )}
          </div>
        </div>
      </Card>

      {/* Product Details Modal */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <ExperimentOutlined className="text-accent-500 text-xl" />
            <span className="text-xl font-semibold">Product Details</span>
          </div>
        }
        open={isModalVisible}
        onCancel={handleCancel}
        footer={[
          <Button key="cancel" onClick={handleCancel}>
            Close
          </Button>,
          <Button
            key="virtual-tryon"
            type="primary"
            icon={<ExperimentOutlined />}
            className="bg-accent-500 hover:bg-accent-600 border-0"
            onClick={showTryOnModal}
          >
            Virtual Try-On
          </Button>
        ]}
        width={800}
        centered
      >
        <div className="space-y-6">
          {/* Product Image and Basic Info */}
          <Row gutter={24}>
            <Col span={12}>
              <Image
                alt={name}
                src={getActualImageUrl()}
                fallback="/img/logo.png"
                className="w-full rounded-lg"
                style={{ maxHeight: '400px', objectFit: 'cover' }}
              />
            </Col>
            <Col span={12}>
              <div className="space-y-4">
                <div>
                  <Title level={2} className="text-luxury-black mb-2">
                    {name}
                  </Title>
                  <div className="flex gap-2 mb-2">
                    <Tag color={getCategoryColor(category)} size="large" className="text-sm">
                      {category}
                    </Tag>
                    {brand && (
                      <Tag color="blue" size="large" className="text-sm">
                        {brand}
                      </Tag>
                    )}
                  </div>
                </div>

                <div>
                  <Text className="text-3xl font-bold text-luxury-black">
                    {formatPrice(price)}
                  </Text>
                </div>

                <Paragraph className="text-luxury-darkgrey text-base leading-relaxed">
                  {description}
                </Paragraph>

                {/* Stock info */}
                <div className="flex items-center space-x-2">
                  <CheckCircleOutlined className="text-green-500" />
                  <Text className="text-green-600 font-medium">
                      {isInStock ? `There are ${stock} products in stock` : 'Out of Stock'}
                  </Text>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <CalendarOutlined className="text-luxury-darkgrey" />
                    <Text className="text-luxury-darkgrey">
                      Created: {formatDate(created_at)}
                    </Text>
                  </div>
                  {updated_at && updated_at !== created_at && (
                    <div className="flex items-center space-x-2">
                      <CalendarOutlined className="text-luxury-darkgrey" />
                      <Text className="text-luxury-darkgrey">
                        Updated: {formatDate(updated_at)}
                      </Text>
                    </div>
                  )}
                </div>
              </div>
            </Col>
          </Row>

          <Divider />

          {/* Product Selection */}
          {isInStock && (
            <div className="space-y-4">
              <Title level={4} className="text-luxury-black">
                Select Product
              </Title>
              
              <Row gutter={16}>
                {/* Size Selection */}
                {sizes.length > 0 && (
                  <Col span={8}>
                    <div className="space-y-2">
                      <Text strong>Size:</Text>
                      <Select
                        placeholder="Select size"
                        value={selectedSize}
                        onChange={setSelectedSize}
                        className="w-full"
                      >
                        {sizes.map((size) => (
                          <Option key={size} value={size}>
                            {size}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <Col span={8}>
                    <div className="space-y-2">
                      <Text strong>Color:</Text>
                      <Select
                        placeholder="Select color"
                        value={selectedColor}
                        onChange={setSelectedColor}
                        className="w-full"
                      >
                        {colors.map((color) => (
                          <Option key={color} value={color}>
                            {color}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  </Col>
                )}

                {/* Quantity Selection */}
                <Col span={8}>
                  <div className="space-y-2">
                    <Text strong>Quantity:</Text>
                    <InputNumber
                      min={1}
                      max={stock}
                      value={quantity}
                      onChange={setQuantity}
                      className="w-full"
                    />
                  </div>
                </Col>
              </Row>
            </div>
          )}

          <Divider />

          {/* Product Actions */}
          <div className="text-center space-y-4">
            <Title level={4} className="text-luxury-black">
              Product Actions
            </Title>
            
            <Space size="large">
              {isInStock ? (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  className="bg-luxury-black hover:bg-luxury-darkgrey border-0"
                  onClick={() => {
                    handleAddToCart();
                    handleCancel();
                  }}
                  disabled={!selectedSize || !selectedColor}
                >
                  Add to Cart
                </Button>
              ) : (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  size="large"
                  className="bg-gray-400 border-0"
                  disabled
                >
                  Out of Stock
                </Button>
              )}
              
              <Button
                type="primary"
                icon={<ExperimentOutlined />}
                size="large"
                className="bg-accent-500 hover:bg-accent-600 border-0"
                onClick={showTryOnModal}
              >
                Virtual Try-On
              </Button>
            </Space>
          </div>

          {/* Additional Features */}
          <div className="bg-luxury-lightgrey/30 p-6 rounded-lg">
            <Title level={4} className="text-luxury-black mb-4">
              Special Features
            </Title>
            
            <Row gutter={[16, 16]}>
              <Col span={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <ExperimentOutlined className="text-3xl text-accent-500 mb-2" />
                  <div className="font-medium text-luxury-black">Virtual Try-On</div>
                  <Text className="text-sm text-luxury-darkgrey">
                    Virtual Try-On with AI
                  </Text>
                </div>
              </Col>
              
              <Col span={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <StarOutlined className="text-3xl text-yellow-500 mb-2" />
                  <div className="font-medium text-luxury-black">High Quality</div>
                  <Text className="text-sm text-luxury-darkgrey">
                    Premium Product
                  </Text>
                </div>
              </Col>
              
              <Col span={8}>
                <div className="text-center p-4 bg-white rounded-lg">
                  <DollarOutlined className="text-3xl text-green-500 mb-2" />
                  <div className="font-medium text-luxury-black">Good Price</div>
                  <Text className="text-sm text-luxury-darkgrey">
                    Reasonable Price
                  </Text>
                </div>
              </Col>
            </Row>
          </div>
        </div>
      </Modal>
      {/* Modal thử đồ ảo */}
      <Modal
        title={
          <div className="flex items-center space-x-3">
            <ExperimentOutlined className="text-accent-500 text-xl" />
            <span className="text-xl font-semibold">Virtual Try-On - {name}</span>
          </div>
        }
        open={isTryOnModalVisible}
        onCancel={handleTryOnModalCancel}
        footer={null}
        width={800}
        centered
      >
        <div className="space-y-6 py-4">
          {/* Hiển thị các bước */}
          <Steps current={tryOnStep} className="luxury-steps">
            <Step title="Upload Photo" description="Upload your photo" />
            <Step title="Settings" description="Customize try-on" />
          </Steps>
          
          <div className="mt-8">
            {/* Bước 0: Upload ảnh */}
            {tryOnStep === 0 && (
              <Row gutter={24}>
                <Col span={12}>
                  <div className="mb-4">
                    <Title level={4} className="text-luxury-black">
                      Upload Your Photo
                    </Title>
                    <Text className="text-luxury-darkgrey">
                      To get the best try-on results, please upload a clear, frontal photo of yourself.
                    </Text>
                  </div>
                  
                  <Upload
                    accept="image/*"
                    showUploadList={false}
                    beforeUpload={handleUploadUserPhoto}
                    className="mt-4"
                  >
                    <Button
                      size="large"
                      icon={<UploadOutlined />}
                      className="border-luxury-darkgrey text-luxury-darkgrey hover:border-luxury-black hover:text-luxury-black h-14 px-8 rounded-luxury text-lg font-medium"
                      block
                    >
                      Select Photo from Device
                    </Button>
                  </Upload>
                </Col>
                
                <Col span={12}>
                  <div className="bg-luxury-lightgrey rounded-lg p-4 h-full flex items-center justify-center">
                    {userPhoto ? (
                      <img
                        src={userPhoto}
                        alt="User Photo"
                        className="max-h-60 max-w-full rounded-lg object-contain"
                      />
                    ) : (
                      <div className="text-center space-y-2">
                        <UserOutlined className="text-5xl text-luxury-darkgrey/50" />
                        <Text className="block text-luxury-darkgrey">
                          Your photo will be displayed here
                        </Text>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            )}
            
            {/* Bước 1: Cài đặt thử đồ */}
            {tryOnStep === 1 && (
              <Row gutter={24}>
                <Col span={12}>
                  <div className="bg-luxury-lightgrey/50 p-6 rounded-luxury">
                    <Title level={5} className="text-center mb-4 text-luxury-black">
                      Try-On Settings
                    </Title>
                    
                    <div className="space-y-4">
                      <div className="text-left">
                        <Text className="block mb-2 text-luxury-darkgrey">Chất lượng xử lý:</Text>
                        <Radio.Group 
                          value={tryOnMode}
                          onChange={e => setTryOnMode(e.target.value)}
                          className="w-full"
                        >
                          <Space direction="vertical" className="w-full">
                            <Radio value="performance">Fast (Performance)</Radio>
                            <Radio value="balanced">Balanced</Radio>
                            <Radio value="quality">High Quality (Quality)</Radio>
                          </Space>
                        </Radio.Group>
                      </div>
                      
                      <div className="text-left">
                        <Text className="block mb-2 text-luxury-darkgrey">Số lượng kết quả:</Text>
                        <Radio.Group 
                          value={numSamples}
                          onChange={e => setNumSamples(e.target.value)}
                        >
                          <Radio value={1}>1 ảnh</Radio>
                          <Radio value={2}>2 ảnh</Radio>
                          <Radio value={4}>4 ảnh</Radio>
                        </Radio.Group>
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-gray-200">
                        <Button
                          type="primary"
                          size="large"
                          block
                          onClick={startVirtualTryOn}
                          disabled={isProcessing}
                          className="bg-accent-500 hover:bg-accent-600 border-0 h-12"
                          icon={isProcessing ? <LoadingOutlined /> : <ExperimentOutlined />}
                        >
                          {isProcessing ? 'Processing...' : 'Start Try-On'}
                        </Button>
                        
                        <Button 
                          className="mt-2" 
                          block
                          onClick={() => setTryOnStep(0)}
                        >
                          Back
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
                
                <Col span={12}>
                  <div className="space-y-4">
                    <div className="bg-luxury-lightgrey/30 p-4 rounded-lg">
                      <Title level={5} className="text-luxury-black mb-2">
                        Selected Product
                      </Title>
                      <div className="flex items-center space-x-4">
                        <Image
                          src={getActualImageUrl()}
                          alt={name}
                          width={80}
                          height={80}
                          className="rounded-md object-cover"
                        />
                        <div>
                          <Text strong>{name}</Text>
                          <div>
                            <Text className="text-accent-500 font-semibold">
                              {formatPrice(price)}
                            </Text>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-luxury-lightgrey/30 p-4 rounded-lg">
                      <Title level={5} className="text-luxury-black mb-2">
                        Your Photo
                      </Title>
                      {userPhoto && (
                        <div className="flex justify-center">
                          <img
                            src={userPhoto}
                            alt="User Photo"
                            className="max-h-60 rounded-lg object-contain"
                          />
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-luxury-lightgrey/30 p-4 rounded-lg">
                      <Title level={5} className="text-luxury-black mb-2">
                        Note
                      </Title>
                      <Text className="text-luxury-darkgrey block">
                        To get the best results:
                      </Text>
                      <ul className="list-disc pl-5 mt-2 space-y-1 text-luxury-darkgrey">
                        <li>Use a clear, frontal photo</li>
                        <li>Use a simple background</li>
                        <li>Stand straight, show your full body</li>
                      </ul>
                    </div>
                  </div>
                </Col>
              </Row>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ProductCard;
