import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Button, 
  Upload, 
  Image, 
  Space, 
  Modal, 
  message, 
  Popconfirm, 
  Row, 
  Col, 
  Progress,
  Tag,
  Input,
  Select,
  Divider
} from 'antd';
import { 
  UploadOutlined, 
  DeleteOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { ImagesAPI } from '../../api';
import API_ENDPOINTS from '../../services/apiEndpoints';

const { Search } = Input;
const { Option } = Select;

const ImageManager = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedImages, setSelectedImages] = useState([]);

  // Load images from API
  useEffect(() => {
    fetchImages();
  }, []);

  const fetchImages = async () => {
    try {
      setLoading(true);
      // TODO: Implement getImages API call
      // const response = await ImagesAPI.getImages();
      // setImages(response.data.result || []);
      setImages([]); // Empty for now until API is implemented
    } catch (error) {
      message.error('Lỗi khi tải danh sách ảnh: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSingleUpload = async (file) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await ImagesAPI.uploadImage(file);
      
      if (response.success) {
        const newImage = {
          id: Date.now(),
          ...response.data.result,
          uploadedAt: new Date(),
          category: 'products'
        };
        
        setImages(prev => [newImage, ...prev]);
        message.success('Hình ảnh đã được tải lên thành công!');
        setUploadProgress(100);
      }
    } catch (error) {
      message.error('Lỗi khi tải lên hình ảnh: ' + error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
    return false; // Prevent default upload
  };

  const handleMultipleUpload = async (files) => {
    try {
      setUploading(true);
      setUploadProgress(0);
      
      const totalFiles = files.length;
      let completedFiles = 0;
      
      const uploadPromises = files.map(async (file) => {
        try {
          const response = await ImagesAPI.uploadImage(file);
          completedFiles++;
          setUploadProgress((completedFiles / totalFiles) * 100);
          
          if (response.success) {
            return {
              id: Date.now() + Math.random(),
              ...response.data.result,
              uploadedAt: new Date(),
              category: 'products'
            };
          }
        } catch (error) {
          console.error('Upload error for file:', file.name, error);
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(Boolean);
      
      if (successfulUploads.length > 0) {
        setImages(prev => [...successfulUploads, ...prev]);
        message.success(`${successfulUploads.length} hình ảnh đã được tải lên thành công!`);
      }
      
    } catch (error) {
      message.error('Lỗi khi tải lên hình ảnh: ' + error.message);
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
    return false;
  };

  const handleDeleteImage = async (image) => {
    try {
      await ImagesAPI.deleteImage(image.key);
      
      setImages(prev => prev.filter(img => img.id !== image.id));
      message.success('Hình ảnh đã được xóa thành công!');
    } catch (error) {
      message.error('Lỗi khi xóa hình ảnh: ' + error.message);
    }
  };

  const handleDeleteMultiple = async () => {
    try {
      const deletePromises = selectedImages.map(imageId => {
        const image = images.find(img => img.id === imageId);
        return ImagesAPI.deleteImage(image.key);
      });
      
      await Promise.all(deletePromises);
      
      setImages(prev => prev.filter(img => !selectedImages.includes(img.id)));
      setSelectedImages([]);
      message.success(`${selectedImages.length} hình ảnh đã được xóa thành công!`);
    } catch (error) {
      message.error('Lỗi khi xóa hình ảnh: ' + error.message);
    }
  };

  const handlePreview = (image) => {
    setPreviewImage(image.url);
    setPreviewVisible(true);
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getMimeTypeColor = (mimeType) => {
    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) return 'green';
    if (mimeType.includes('png')) return 'blue';
    if (mimeType.includes('gif')) return 'purple';
    if (mimeType.includes('webp')) return 'orange';
    return 'default';
  };

  const filteredImages = images.filter(image => {
    const matchesSearch = image.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         image.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || image.category === filterType;
    return matchesSearch && matchesFilter;
  });

  const categories = [...new Set(images.map(img => img.category))];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý hình ảnh</h1>
          <p className="text-gray-600">Tải lên, quản lý và tổ chức hình ảnh trong hệ thống</p>
        </div>

        {/* Upload Section */}
        <Card className="mb-8">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-4">Tải lên hình ảnh</h3>
              
              {uploading && (
                <div className="mb-4">
                  <Progress 
                    percent={uploadProgress} 
                    status={uploadProgress === 100 ? 'success' : 'active'}
                    strokeColor="#1890ff"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Đang tải lên... {uploadProgress.toFixed(0)}%
                  </p>
                </div>
              )}

              <div className="space-y-4">
                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleSingleUpload}
                  disabled={uploading}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    size="large"
                    className="w-full"
                    disabled={uploading}
                  >
                    Tải lên một hình ảnh
                  </Button>
                </Upload>

                <Upload
                  accept="image/*"
                  showUploadList={false}
                  beforeUpload={handleMultipleUpload}
                  multiple
                  disabled={uploading}
                >
                  <Button 
                    icon={<UploadOutlined />} 
                    size="large"
                    className="w-full"
                    disabled={uploading}
                  >
                    Tải lên nhiều hình ảnh
                  </Button>
                </Upload>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                <p>• Hỗ trợ: JPEG, PNG, GIF, WebP</p>
                <p>• Kích thước tối đa: 5MB mỗi file</p>
                <p>• Tối đa 10 file mỗi lần tải lên</p>
              </div>
            </div>

            <div className="lg:w-80">
              <h3 className="text-lg font-semibold mb-4">Thống kê</h3>
              <div className="space-y-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{images.length}</div>
                  <div className="text-sm text-blue-600">Tổng hình ảnh</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {formatFileSize(images.reduce((sum, img) => sum + img.size, 0))}
                  </div>
                  <div className="text-sm text-green-600">Tổng dung lượng</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{categories.length}</div>
                  <div className="text-sm text-purple-600">Danh mục</div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <Search
                placeholder="Tìm kiếm hình ảnh..."
                allowClear
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ width: 300 }}
                prefix={<SearchOutlined />}
              />
              
              <Select
                value={filterType}
                onChange={setFilterType}
                style={{ width: 150 }}
                placeholder="Lọc theo danh mục"
              >
                <Option value="all">Tất cả</Option>
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </Option>
                ))}
              </Select>
            </div>

            {selectedImages.length > 0 && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">
                  {selectedImages.length} hình ảnh được chọn
                </span>
                <Popconfirm
                  title={`Bạn có chắc chắn muốn xóa ${selectedImages.length} hình ảnh này?`}
                  onConfirm={handleDeleteMultiple}
                  okText="Có"
                  cancelText="Không"
                >
                  <Button danger icon={<DeleteOutlined />} size="small">
                    Xóa đã chọn
                  </Button>
                </Popconfirm>
              </div>
            )}
          </div>
        </Card>

        {/* Images Grid */}
        <Card>
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500">Đang tải hình ảnh...</p>
            </div>
          ) : filteredImages.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl text-gray-300 mb-4">📷</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                {searchTerm || filterType !== 'all' ? 'Không tìm thấy hình ảnh' : 'Chưa có hình ảnh nào'}
              </h3>
              <p className="text-gray-500">
                {searchTerm || filterType !== 'all' 
                  ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                  : 'Bắt đầu bằng cách tải lên hình ảnh đầu tiên'
                }
              </p>
            </div>
          ) : (
            <Row gutter={[16, 16]}>
              {filteredImages.map(image => (
                <Col xs={24} sm={12} md={8} lg={6} xl={4} key={image.id}>
                  <Card
                    hoverable
                    className="image-card"
                    bodyStyle={{ padding: '12px' }}
                    cover={
                      <div className="relative group">
                        <Image
                          alt={image.originalName}
                          src={image.url}
                          className="w-full h-48 object-cover"
                          fallback="/img/logo.png"
                          preview={false}
                        />
                        
                        {/* Overlay actions */}
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <Space size="small">
                            <Button
                              type="text"
                              icon={<EyeOutlined />}
                              className="text-white hover:text-blue-400"
                              onClick={() => handlePreview(image)}
                              size="small"
                            />
                            <Popconfirm
                              title="Bạn có chắc chắn muốn xóa hình ảnh này?"
                              onConfirm={() => handleDeleteImage(image)}
                              okText="Có"
                              cancelText="Không"
                            >
                              <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                className="text-white hover:text-red-400"
                                size="small"
                              />
                            </Popconfirm>
                          </Space>
                        </div>

                        {/* Selection checkbox */}
                        <div className="absolute top-2 left-2">
                          <input
                            type="checkbox"
                            checked={selectedImages.includes(image.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedImages(prev => [...prev, image.id]);
                              } else {
                                setSelectedImages(prev => prev.filter(id => id !== image.id));
                              }
                            }}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    }
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Tag color="blue" className="text-xs">
                          {image.category}
                        </Tag>
                        <Tag color={getMimeTypeColor(image.mimeType)} className="text-xs">
                          {image.mimeType.split('/')[1].toUpperCase()}
                        </Tag>
                      </div>
                      
                      <div className="text-sm font-medium text-gray-900 truncate" title={image.originalName}>
                        {image.originalName}
                      </div>
                      
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>Kích thước: {formatFileSize(image.size)}</div>
                        <div>Ngày tải: {formatDate(image.uploadedAt)}</div>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          )}
        </Card>
      </div>

      {/* Image Preview Modal */}
      <Modal
        open={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        width="80%"
        centered
      >
        <div className="text-center">
          <Image
            alt="Preview"
            src={previewImage}
            style={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        </div>
      </Modal>
    </div>
  );
};

export default ImageManager;
