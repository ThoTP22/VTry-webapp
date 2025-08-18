import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_ENDPOINTS from '../../services/apiEndpoints';
import { Button, Card, Row, Col, Upload, Steps, Space, Typography, message, Spin, Radio, Image } from 'antd';
import { 
  UploadOutlined, 
  ReloadOutlined, 
  DownloadOutlined,
  StarOutlined,
  ShoppingCartOutlined,
  HeartOutlined,
  UserOutlined
} from '@ant-design/icons';
import './VirtualTryOn.css';

const { Title, Text } = Typography;
const { Step } = Steps;

const VirtualTryOn = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userPhoto, setUserPhoto] = useState(null);
  const [userPhotoFile, setUserPhotoFile] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [tryOnResult, setTryOnResult] = useState(null);
  const [tryOnResultRaw, setTryOnResultRaw] = useState(null); // Lưu URL gốc
  const [tryOnResultBlob, setTryOnResultBlob] = useState(null); // Lưu URL blob
  const [isProcessing, setIsProcessing] = useState(false);
  const [tryOnMode, setTryOnMode] = useState('balanced');
  const [numSamples, setNumSamples] = useState(1);
  const [loadError, setLoadError] = useState(false);
  const [isFetchingImage, setIsFetchingImage] = useState(false);
  

  
  // Kiểm tra xem có sản phẩm và ảnh được chọn từ trang chi tiết sản phẩm không
  useEffect(() => {
    // Kiểm tra dữ liệu thử đồ đầy đủ (sản phẩm + ảnh người dùng)
    const tryOnData = localStorage.getItem('tryOnData');
    
    if (tryOnData) {
      try {
        const data = JSON.parse(tryOnData);
        
        // Khôi phục dữ liệu
        if (data.product) setSelectedProduct(data.product);
        if (data.userPhoto) setUserPhoto(data.userPhoto);
        if (data.tryOnMode) setTryOnMode(data.tryOnMode);
        if (data.numSamples) setNumSamples(data.numSamples);
        
        // Đặc biệt xử lý file ảnh (không thể lưu trực tiếp File object trong localStorage)
        if (data.userPhoto) {
          // Người dùng đã có đủ thông tin sản phẩm và ảnh
          // Chuyển thẳng đến bước thử đồ
          setCurrentStep(3);
          // Bắt đầu thử đồ ngay lập tức
          setTimeout(() => {
            // Thực hiện xử lý thử đồ với dữ liệu từ localStorage
            if (data.product && data.userPhoto) {
              setIsProcessing(true);
              setCurrentStep(3);
              
              // Chuyển Base64 thành Blob/File
              const byteString = atob(data.userPhoto.split(',')[1]);
              const mimeType = data.userPhoto.split(',')[0].split(':')[1].split(';')[0];
              const ab = new ArrayBuffer(byteString.length);
              const ia = new Uint8Array(ab);
              
              for (let i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }
              
              const blob = new Blob([ab], { type: mimeType });
              const file = new File([blob], 'user-photo.jpg', { type: mimeType });
              
              // Chuẩn bị FormData và gửi API
              const formData = new FormData();
              formData.append('file', file); 
              formData.append('garment_image_url', data.product.imageUrl || data.product.image);
              formData.append('mode', tryOnMode);
              formData.append('num_samples', numSamples);
              formData.append('output_format', 'jpeg');
              
              const token = localStorage.getItem('access_token');
              const headers = {
                'Content-Type': 'multipart/form-data',
              };
              
              if (token) {
                headers['Authorization'] = `Bearer ${token}`;
              }
              
              axios.post(
                API_ENDPOINTS.VIRTUAL_TRYON.TRYON,
                formData,
                { headers }
              )
              .then(response => {
                const { ok, images } = response.data;
                if (ok && images && images.length > 0) {
                  const imageUrl = images[0];
                  console.log('Got S3 image URL:', imageUrl);
                  // Lưu URL gốc để debug
                  setTryOnResultRaw(imageUrl);
                  
                  // Sử dụng trực tiếp URL S3 như ProductCard
                  console.log('Got S3 image URL:', imageUrl);
                  setTryOnResult(imageUrl);
                  setTryOnResultRaw(imageUrl);
                  setIsFetchingImage(false);
                  setIsProcessing(false);
                  setLoadError(false);
                  message.success('Try-On completed!');
                } else {
                  throw new Error('No result from API');
                }
              })
              .catch(error => {
                console.error('Virtual Try-On Error:', error);
                message.error(`An error occurred: ${error.message || 'Please try again'}`);
              })
              .finally(() => {
                setIsProcessing(false);
              });
            }
          }, 500);
        }
        
        // Xóa thông tin để không tải lại lần sau
        localStorage.removeItem('tryOnData');
      } catch (error) {
        console.error('Error reading try-on data:', error);
      }
      return;
    }
    
    // Nếu không có dữ liệu đầy đủ, kiểm tra có chỉ sản phẩm không
    const savedProduct = localStorage.getItem('selectedTryOnProduct');
    if (savedProduct) {
      try {
        const product = JSON.parse(savedProduct);
        setSelectedProduct(product);
        setCurrentStep(1); // Bỏ qua bước chọn sản phẩm
        // Xóa thông tin để không tải lại lần sau
        localStorage.removeItem('selectedTryOnProduct');
      } catch (error) {
        console.error('Error reading product information:', error);
      }
    }
  }, [numSamples, tryOnMode]);

  // Lấy sản phẩm từ API
  const [luxuryProducts, setLuxuryProducts] = useState([]);

  useEffect(() => {
    async function fetchProducts() {
      try {
        console.log('🔍 Fetching products from API...');
        const products = await (await import('../../api/productsAPI')).default.getAllProducts();
        console.log('🔍 API Response:', products);
        
        // Nếu API trả về object có thuộc tính products, lấy ra mảng đó
        if (Array.isArray(products)) {
          console.log('✅ Setting products array directly:', products.length, 'items');
          setLuxuryProducts(products);
        } else if (products && Array.isArray(products.result)) {
          console.log('✅ Setting products from .result property:', products.result.length, 'items');
          setLuxuryProducts(products.result);
        } else if (products && Array.isArray(products.products)) {
          console.log('✅ Setting products from .products property:', products.products.length, 'items');
          setLuxuryProducts(products.products);
        } else if (products && Array.isArray(products.data)) {
          console.log('✅ Setting products from .data property:', products.data.length, 'items');
          setLuxuryProducts(products.data);
        } else {
          console.warn('❌ Products response format not recognized:', products);
          setLuxuryProducts([]);
        }
      } catch (error) {
        console.error('❌ Error fetching products:', error);
        setLuxuryProducts([]);
      }
    }
    fetchProducts();
  }, []);

  const handleUpload = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setUserPhoto(e.target.result);
      setUserPhotoFile(file);
      
      // Nếu đã có sản phẩm được chọn, chuyển sang bước tiếp theo
      if (selectedProduct) {
        setCurrentStep(2);
      } else {
        setCurrentStep(1);
      }
      
      message.success('Ảnh đã được tải lên thành công!');
    };
    reader.readAsDataURL(file);
    return false; // Prevent automatic upload
  };

  const selectProduct = (product) => {
    setSelectedProduct(product);
    setCurrentStep(2);
  };
  
  const startTryOn = async () => {
    if (!userPhotoFile || !selectedProduct) {
      message.error('Please upload a photo and select a product!');
      return;
    }

    setIsProcessing(true);
    setCurrentStep(3);
    
    try {
      // Chuẩn bị FormData cho API request
      const formData = new FormData();
      formData.append('file', userPhotoFile); // Phải đặt tên là 'file' theo middleware backend
      
      // Kiểm tra các thuộc tính có thể có của sản phẩm
      const garmentImageUrl = selectedProduct.imageUrl || 
                             selectedProduct.image || 
                             selectedProduct.images?.[0] || 
                             selectedProduct.productImages?.[0];
      
      if (!garmentImageUrl) {
        throw new Error('Product image URL not found');
      }
      
      console.log('Using garment image URL:', garmentImageUrl);
      
      formData.append('garment_image_url', garmentImageUrl);
      formData.append('mode', tryOnMode);
      formData.append('num_samples', numSamples);
      formData.append('output_format', 'jpeg');
      
      // Thêm header cho formData
      const token = localStorage.getItem('access_token');
      const headers = {
        'Content-Type': 'multipart/form-data',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Gọi API thử đồ
      const response = await axios.post(
        API_ENDPOINTS.VIRTUAL_TRYON.TRYON,
        formData,
        { headers }
      );
      
      console.log('API Response:', response.data);
      
      const { ok, images } = response.data;
      
      if (ok && images && images.length > 0) {
        // Lấy ảnh đầu tiên trong mảng kết quả
        const imageUrl = images[0];
        console.log('Got S3 image URL:', imageUrl);
        // Lưu URL gốc để debug
        setTryOnResultRaw(imageUrl);
        
        // Tải ảnh qua fetch API để tránh vấn đề CORS
        setIsFetchingImage(true);
        console.log('Processing try-on result, imageUrl:', imageUrl);
        
        // Sử dụng trực tiếp URL S3 như ProductCard
        console.log('Got S3 image URL:', imageUrl);
        setTryOnResult(imageUrl);
        setTryOnResultRaw(imageUrl);
        setIsFetchingImage(false);
        setIsProcessing(false);
        setLoadError(false);
        message.success('Try-On completed!');
      } else {
        throw new Error('No result from API');
      }
    } catch (error) {
      console.error('Virtual Try-On Error:', error);
      setIsProcessing(false);
      message.error(`An error occurred: ${error.message || 'Please try again'}`);
    }
  };

  const resetProcess = () => {
    setCurrentStep(0);
    setUserPhoto(null);
    setSelectedProduct(null);
    setTryOnResult(null);
    setTryOnResultRaw(null);
    
    // Giải phóng URL blob nếu có
    if (tryOnResultBlob) {
      URL.revokeObjectURL(tryOnResultBlob);
    }
    setTryOnResultBlob(null);
    
    setLoadError(false);
    setIsProcessing(false);
    setIsFetchingImage(false);
  };

  const steps = [
    {
      title: 'Upload Photo',
      description: 'Take or upload your photo'
    },
    {
      title: 'Select Product',
      description: 'Choose item to try on'
    },
    {
      title: 'Try On',
      description: 'Generate virtual result'
    },
    {
      title: 'Result',
      description: 'View your look'
    }
  ];

  return (
    <div className="min-h-screen bg-luxury-white">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-luxury-black via-luxury-darkgrey to-luxury-black text-luxury-white py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-accent-500 rounded-luxury flex items-center justify-center shadow-2xl">
                <StarOutlined className="text-3xl text-luxury-white" />
              </div>
            </div>
            <Title level={1} className="text-4xl md:text-6xl font-serif font-light !text-luxury-white !mb-0">
              Virtual Try-On Experience
            </Title>
            <Text className="text-xl text-luxury-white/80 font-light max-w-3xl mx-auto block">
              Experience the future of luxury fashion with our AI-powered virtual try-on technology. 
              See how our curated pieces look on you before making your selection.
            </Text>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Progress Steps */}
        <div className="mb-16">
          <Steps 
            current={currentStep} 
            className="luxury-steps"
            size="default"
          >
            {steps.map((step, index) => (
              <Step 
                key={index}
                title={step.title} 
                description={step.description}
              />
            ))}
          </Steps>
        </div>

        <Row gutter={[48, 48]} className="min-h-[600px]">
          {/* Left Panel - Process */}
          <Col xs={24} lg={12}>
            <Card className="luxury-card h-full" bodyStyle={{ padding: '40px' }}>
              {/* Step 0: Upload Photo */}
              {currentStep === 0 && (
                <div className="text-center space-y-8">
                  <Title level={2} className="font-serif !text-luxury-black">
                    Start Your Virtual Try-On
                  </Title>
                  <Text className="text-luxury-darkgrey text-lg block">
                    Start by uploading a photo from your device
                  </Text>
                  
                  <div className="space-y-6">
                    <Upload
                      accept="image/*"
                      showUploadList={false}
                      beforeUpload={handleUpload}
                    >
                      <Button
                        size="large"
                        icon={<UploadOutlined />}
                        className="border-luxury-darkgrey text-luxury-darkgrey hover:border-luxury-black hover:text-luxury-black h-14 px-8 rounded-luxury text-lg font-medium"
                        block
                      >
                        Upload Photo from Device
                      </Button>
                    </Upload>
                  </div>
                </div>
              )}

              {/* Step 1: Select Product */}
              {currentStep === 1 && (
                <div className="space-y-8">
                  <div className="text-center">
                    <Title level={2} className="font-serif !text-luxury-black">
                      Choose Your Style
                    </Title>
                    <Text className="text-luxury-darkgrey text-lg">
                      Select a product to try on
                    </Text>
                  </div>

                  <Row gutter={[16, 16]}>
                    {luxuryProducts.map(product => (
                      <Col xs={12} sm={6} key={product._id || product.id}>
                        <Card
                          hoverable
                          className={`luxury-product-selector ${selectedProduct?._id === product._id ? 'selected' : ''}`}
                          cover={
                            <div className="aspect-[3/4] bg-luxury-lightgrey">
                              <img
                                src={product.imageUrl || product.image || '/api/placeholder/300/400'}
                                alt={product.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.src = '/api/placeholder/300/400';
                                }}
                              />
                            </div>
                          }
                          onClick={() => selectProduct(product)}
                          bodyStyle={{ padding: '12px' }}
                        >
                          <div className="text-center">
                            <Text className="text-xs text-luxury-darkgrey/70 uppercase tracking-wide block">
                              {product.brand}
                            </Text>
                            <Text className="text-sm font-medium text-luxury-black block mt-1">
                              {product.name}
                            </Text>
                            <Text className="text-accent-500 font-semibold text-sm">
                              ${product.price.toLocaleString()}
                            </Text>
                          </div>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                </div>
              )}

              {/* Step 2: Try On */}
              {currentStep === 2 && (
                <div className="text-center space-y-8">
                  <Title level={2} className="font-serif !text-luxury-black">
                    Ready to Try On
                  </Title>
                  
                  {selectedProduct && (
                    <div className="bg-luxury-lightgrey p-6 rounded-luxury">
                      <Text className="text-luxury-darkgrey text-sm uppercase tracking-wide block mb-2">
                        Selected Item
                      </Text>
                      <Title level={4} className="!text-luxury-black !mb-2">
                        {selectedProduct.brand} {selectedProduct.name}
                      </Title>
                      <Text className="text-accent-500 text-xl font-semibold">
                        {new Intl.NumberFormat('vi-VN', {
                          style: 'currency',
                          currency: 'VND'
                        }).format(selectedProduct.price)}
                      </Text>
                    </div>
                  )}
                  
                  {/* Thêm tùy chọn chọn chế độ thử đồ */}
                  <div className="bg-luxury-lightgrey/50 p-6 rounded-luxury">
                    <Title level={5} className="text-center !mb-4 !text-luxury-black">
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
                    </div>
                  </div>

                  <Button
                    type="primary"
                    size="large"
                    onClick={startTryOn}
                    className="bg-accent-500 hover:bg-accent-600 border-0 h-14 px-12 rounded-luxury text-lg font-medium"
                    block
                  >
                    Start Virtual Try-On
                  </Button>
                </div>
              )}

              {/* Step 3: Processing */}
              {currentStep === 3 && isProcessing && (
                <div className="text-center space-y-8">
                  <div className="flex justify-center">
                    <div className="w-32 h-32 bg-accent-500/10 rounded-full flex items-center justify-center">
                      <Spin size="large" />
                    </div>
                  </div>
                  <Title level={2} className="font-serif !text-luxury-black">
                    Creating Your Look
                  </Title>
                  <Text className="text-luxury-darkgrey text-lg">
                    AI is processing the try-on. Please wait...
                  </Text>
                </div>
              )}

              {/* Step 3: Result */}
              {currentStep === 3 && !isProcessing && tryOnResult && (
                <div className="text-center space-y-8">
                  <Title level={2} className="font-serif !text-luxury-black">
                    Your Virtual Look
                  </Title>
                  
                  <div className="space-y-6">
                    <Space size="middle" wrap>
                      <Button
                        icon={<DownloadOutlined />}
                        className="border-luxury-darkgrey text-luxury-darkgrey hover:border-luxury-black hover:text-luxury-black rounded-luxury"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = tryOnResult;
                          link.download = `virtual-tryon-${Date.now()}.jpg`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                          message.success('Download started!');
                        }}
                      >
                        Download
                      </Button>
                      <Button
                        icon={<HeartOutlined />}
                        className="border-luxury-darkgrey text-luxury-darkgrey hover:border-luxury-black hover:text-luxury-black rounded-luxury"
                      >
                        Save to Wishlist
                      </Button>
                      <Button
                        type="primary"
                        icon={<ShoppingCartOutlined />}
                        className="bg-accent-500 hover:bg-accent-600 border-0 rounded-luxury"
                        onClick={() => {
                          if (selectedProduct) {
                            message.success(`${selectedProduct.name} has been added to the cart!`);
                          }
                        }}
                      >
                        Add to Cart
                      </Button>
                      <Button
                        onClick={() => window.open(tryOnResult, '_blank')}
                        className="border-blue-500 text-blue-500 hover:border-blue-600 hover:text-blue-600 rounded-luxury"
                      >
                        View Full Size
                      </Button>
                    </Space>
                    
                    <Button
                      type="text"
                      icon={<ReloadOutlined />}
                      onClick={resetProcess}
                      className="text-luxury-darkgrey hover:text-luxury-black"
                    >
                      Try Another Item
                    </Button>
                  </div>
                </div>
              )}
            </Card>
          </Col>

          {/* Right Panel - Preview */}
          <Col xs={24} lg={12}>
            <Card className="luxury-card h-full" bodyStyle={{ padding: '0', height: '600px' }}>
              <div className="h-full bg-luxury-lightgrey rounded-luxury flex items-center justify-center relative overflow-hidden" style={{ minHeight: '600px' }}>
                {/* User Photo Preview */}
                {userPhoto && currentStep >= 1 && currentStep < 3 && (
                  <div className="absolute inset-0">
                    <img
                      src={userPhoto}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Try-on Result */}
                {currentStep === 3 && (
                  <div className="absolute inset-0 w-full h-full">
                    {isFetchingImage && (
                      <div className="absolute inset-0 flex items-center justify-center bg-luxury-lightgrey/80 z-10">
                        <div className="text-center">
                          <Spin size="large" />
                          <p className="mt-3 text-luxury-darkgrey">Loading result image...</p>
                        </div>
                      </div>
                    )}
                    
                    {tryOnResult && !isProcessing && (
                      <div className="w-full h-full relative bg-white">
                        {/* Hiển thị ảnh kết quả */}
                        <img
                          alt="Try-on result"
                          src={tryOnResult}
                          className="w-full h-full object-contain"
                          onLoad={() => {
                            console.log('✅ Image loaded successfully:', tryOnResult);
                            setLoadError(false);
                          }}
                          onError={(e) => {
                            console.error('❌ Image failed to load:', e);
                            setLoadError(true);
                          }}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                            display: 'block',
                            maxWidth: '100%',
                            maxHeight: '100%'
                          }}
                        />
                      </div>
                    )}

                    {/* Show a message when no result */}
                    {!tryOnResult && !isProcessing && (
                      <div className="absolute inset-0 flex items-center justify-center bg-red-100">
                        <div className="text-center text-red-600">
                          <p className="font-bold">No Try-On Result!</p>
                          <p>Please try the virtual try-on process again.</p>
                        </div>
                      </div>
                    )}
                    
                    {loadError && (
                      <div className="absolute inset-0 bg-red-50 bg-opacity-95 flex flex-col items-center justify-center p-6 text-red-700">
                        <div className="max-w-md text-center space-y-4">
                          <div className="text-lg font-bold">🖼️ Image Display Issue</div>
                          <div className="text-sm">
                            The image was processed successfully but cannot be displayed inline.
                          </div>
                          
                          {/* Direct image test */}
                          <div className="border border-gray-300 p-2 bg-white rounded">
                            <div className="text-xs text-gray-600 mb-2">Direct URL Test:</div>
                            <img 
                              src={tryOnResultRaw} 
                              alt="Direct test"
                              className="w-32 h-32 object-cover mx-auto border"
                              onLoad={() => console.log('✅ Direct URL test successful')}
                              onError={() => console.log('❌ Direct URL test failed')}
                            />
                          </div>
                          
                          <div className="text-xs font-mono bg-gray-100 p-2 rounded break-all max-h-20 overflow-y-auto">
                            {tryOnResultRaw}
                          </div>
                          
                          <div className="grid grid-cols-1 gap-2 w-full">
                            <Button 
                              onClick={() => window.open(tryOnResultRaw, '_blank')}
                              type="primary"
                              size="small"
                              className="w-full"
                            >
                              🔗 Open in new tab
                            </Button>
                            <Button
                              onClick={() => {
                                setLoadError(false);
                                // Force reload với timestamp
                                const timestampUrl = `${tryOnResultRaw}?cache=${Date.now()}`;
                                console.log('🔄 Forcing reload with:', timestampUrl);
                                setTryOnResult(timestampUrl);
                              }}
                              size="small"
                              className="w-full"
                            >
                              🔄 Force reload
                            </Button>
                            <Button
                              onClick={async () => {
                                try {
                                  console.log('💾 Trying blob method...');
                                  // Thử với different CORS modes
                                  let response;
                                  try {
                                    response = await fetch(tryOnResultRaw, { mode: 'cors' });
                                  } catch (corsErr) {
                                    console.log('CORS failed, trying no-cors...');
                                    response = await fetch(tryOnResultRaw, { mode: 'no-cors' });
                                  }
                                  
                                  const blob = await response.blob();
                                  const objectUrl = URL.createObjectURL(blob);
                                  console.log('✅ Created blob URL:', objectUrl);
                                  setTryOnResult(objectUrl);
                                  setTryOnResultBlob(objectUrl);
                                  setLoadError(false);
                                  message.success('Image loaded via blob!');
                                } catch (err) {
                                  console.error('Blob method failed:', err);
                                  message.error('Blob method failed. Try "Open in new tab".');
                                }
                              }}
                              size="small"
                              className="w-full"
                            >
                              💾 Try blob download
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Default State */}
                {!userPhoto && (
                  <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-luxury-white/50 rounded-full flex items-center justify-center mx-auto">
                      <UserOutlined className="text-3xl text-luxury-darkgrey" />
                    </div>
                    <Text className="text-luxury-darkgrey text-lg">
                      Your photo will be displayed here
                    </Text>
                  </div>
                )}
              </div>
            </Card>
          </Col>
        </Row>
      </div>


    </div>
  );
};

export default VirtualTryOn;
