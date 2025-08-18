import React, { useState, useEffect } from "react";
import {
  Tabs,
  Card,
  Button,
  Table,
  Space,
  Modal,
  Form,
  Input,
  Select,
  Upload,
  message,
  Popconfirm,
  Tag,
  Image,
  Row,
  Col,
  Statistic,
  Divider,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
  UserOutlined,
  ShoppingOutlined,
  PictureOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useAuth } from "../../hooks/useAuth";
import { useProducts } from "../../hooks/useProducts";
import { ImagesAPI } from "../../api";
import { formatCurrency } from "../../utils/helpers";
import API_ENDPOINTS from "../../services/apiEndpoints";
import { PRODUCT_CATEGORIES } from "../../constants";
import ImageManager from "./ImageManager";
import UserManager from "./UserManager";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

const AdminPage = () => {
  const { user, isAdmin } = useAuth();
  const {
    products: rawProducts,
    loading: productsLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    fetchProducts,
  } = useProducts();

  // Ensure products is always an array
  const products = Array.isArray(rawProducts) ? rawProducts : [];

  const [activeTab, setActiveTab] = useState("dashboard");
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const [uploadedImages, setUploadedImages] = useState([]);
  const [loading, setLoading] = useState(false);

  // Debug: Log user info to console (chỉ trong development)
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("AdminPage - User info:", user);
      console.log("AdminPage - User role:", user?.role);
      console.log(
        "AdminPage - User object keys:",
        user ? Object.keys(user) : "No user"
      );
      console.log("AdminPage - isAdmin function result:", isAdmin());
    }
  }, [user, isAdmin]);

  // Debug: Log products data
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("AdminPage - Products data:", {
        rawProducts,
        products,
        productsType: typeof products,
        isArray: Array.isArray(products),
        length: products?.length || 0,
      });

      // Additional validation for Table dataSource
      if (products && products.length > 0) {
        console.log("AdminPage - First product sample:", products[0]);
        console.log(
          "AdminPage - Products keys:",
          Object.keys(products[0] || {})
        );
      }
    }
  }, [rawProducts, products]);

  // Redirect if not admin - chỉ chạy khi user thay đổi
  useEffect(() => {
    if (user === null || user === undefined) {
      // Chưa có user hoặc đang loading, chờ đợi
      return;
    }

    const adminCheck = user?.role?.toLowerCase() === "admin";

    if (!adminCheck) {
      window.location.href = "/";
    }
  }, [user]); // Chỉ dependency vào user, không phải isAdmin function

  // Welcome message for admin - chỉ hiển thị 1 lần
  useEffect(() => {
    if (user && user?.role?.toLowerCase() === "admin") {
      // Chỉ hiển thị welcome message 1 lần khi vào trang
      const hasShownWelcome = sessionStorage.getItem("admin_welcome_shown");
      if (!hasShownWelcome) {
        message.success(`Welcome Admin ${user.name || user.email}!`);
        sessionStorage.setItem("admin_welcome_shown", "true");
      }
    }
  }, [user]);

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    // Fetch products when component mounts and when products tab is active
    if (activeTab === "products" || activeTab === "dashboard") {
      fetchProducts();
    }
  }, [activeTab, fetchProducts]);

  const handleCreateProduct = async (values) => {
    try {
      setLoading(true);

      // BƯỚC 1: Kiểm tra hình ảnh đã upload
      if (uploadedImages.length === 0) {
        message.error("Please upload a product image!");
        return;
      }

      // BƯỚC 2: Chuẩn bị data product với image URL và các trường mới
      const productData = {
        ...values,
        price: parseFloat(values.price),
        stock: parseInt(values.stock) || 0,
        image: uploadedImages[0].url, // Sử dụng URL từ hình ảnh đã upload
        imageUrl: uploadedImages[0].url, // Backend có thể cần trường này
        // Xử lý arrays
        sizes: values.sizes || [],
        colors: values.colors || [],
        // Default values
        status: values.status || 'active',
        brand: values.brand || '',
      };

      // BƯỚC 3: Gọi API tạo product
      await createProduct(productData);
      message.success("Product has been created successfully!");

      // BƯỚC 4: Reset form và refresh
      setProductModalVisible(false);
      setEditingProduct(null);
      setUploadedImages([]);
      fetchProducts();
    } catch (error) {
      console.error("AdminPage - Create product error:", error.message);
      message.error("Error creating product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProduct = async (values) => {
    try {
      setLoading(true);

      // BƯỚC 1: Chuẩn bị data product với image URL và các trường mới
      const productData = {
        ...values,
        _id: editingProduct._id,
        price: parseFloat(values.price),
        stock: parseInt(values.stock) || 0,
        // Nếu có hình ảnh mới upload thì dùng URL mới, không thì giữ URL cũ
        image:
          uploadedImages.length > 0
            ? uploadedImages[0].url
            : editingProduct.image,
        imageUrl:
          uploadedImages.length > 0
            ? uploadedImages[0].url
            : editingProduct.imageUrl || editingProduct.image,
        // Xử lý arrays
        sizes: values.sizes || [],
        colors: values.colors || [],
        // Default values
        status: values.status || 'active',
        brand: values.brand || '',
      };

      // BƯỚC 2: Gọi API update product
      await updateProduct(productData);
      message.success("Product has been updated successfully!");

      // BƯỚC 3: Reset form và refresh
      setProductModalVisible(false);
      setEditingProduct(null);
      setUploadedImages([]);
      fetchProducts();
    } catch (error) {
      console.error("AdminPage - Update product error:", error.message);
      message.error("Error updating product: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await deleteProduct(productId);
      message.success("Product has been deleted successfully!");
      fetchProducts();
    } catch (error) {
      message.error("Error deleting product: " + error.message);
    }
  };

  const handleImageUpload = async (file) => {
    try {
      setLoading(true);

      // BƯỚC 1: Validate file trước khi upload
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        message.error("File size too large. Maximum size is 5MB");
        return false;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        message.error("Only JPEG, PNG, GIF, and WebP images are allowed");
        return false;
      }

      // BƯỚC 2: Tạo FormData theo đúng format backend API
      const formData = new FormData();
      formData.append('image', file); // Backend expects 'image' field name

      // BƯỚC 3: Lấy token để authentication
      const token = localStorage.getItem('access_token');
      if (!token) {
        message.error("Please login to upload images");
        return false;
      }

      // BƯỚC 4: Gọi API upload
      const response = await fetch('/api/images/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          // Không set Content-Type, để browser tự set với boundary cho multipart/form-data
        },
        body: formData
      });

      // BƯỚC 5: Xử lý response
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Upload failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Upload response:', responseData);

      // BƯỚC 6: Kiểm tra response format từ backend
      if (responseData.result && responseData.result.url) {
        const imageData = {
          url: responseData.result.url,
          key: responseData.result.key,
          size: responseData.result.size,
          contentType: responseData.result.contentType,
          originalName: file.name
        };

        setUploadedImages([imageData]);
        message.success(responseData.message || "Image uploaded successfully!");
        return false; // Prevent default upload behavior
      } else {
        throw new Error("Invalid response format from server");
      }

    } catch (error) {
      console.error("Upload error:", error);
      message.error("Error uploading image: " + error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };



  const openEditModal = (product) => {
    setEditingProduct(product);

    // BƯỚC 1: Khởi tạo uploadedImages với hình ảnh hiện tại của product
    if (product.image || product.imageUrl) {
      const imageUrl = product.image || product.imageUrl;
      const imageData = {
        url: imageUrl,
        key: product.imageKey || null, // Nếu có lưu key
        size: product.imageSize || null, // Nếu có lưu size
        contentType: product.imageContentType || null, // Nếu có lưu content type
        originalName: product.imageName || 'current-image'
      };
      setUploadedImages([imageData]);
    } else {
      setUploadedImages([]);
    }

    // BƯỚC 2: Form values sẽ được set tự động thông qua editingProduct state
    setProductModalVisible(true);
  };

  const openCreateModal = () => {
    setEditingProduct(null);
    setUploadedImages([]);
    setProductModalVisible(true);
  };

  const closeModal = () => {
    setProductModalVisible(false);
    setEditingProduct(null);
    setUploadedImages([]);
  };

  // Product columns for table
  const productColumns = [
    {
      title: "Image",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image, record) => {
        // Safety check for image data
        const imageUrl = image || record?.imageUrl || "/img/logo.png";
        return (
          <Image
            width={60}
            height={60}
            src={imageUrl}
            fallback="/img/logo.png"
            style={{ objectFit: "cover", borderRadius: "8px" }}
          />
        );
      },
    },
    {
      title: "Product Info",
      key: "productInfo",
      width: 250,
      render: (_, record) => (
        <div>
          <div className="font-semibold text-base">{record.name || "N/A"}</div>
          {record.brand && (
            <div className="text-sm text-gray-500 mb-1">{record.brand}</div>
          )}
          <div className="text-sm text-gray-600 line-clamp-2">
            {record.description || "No description"}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      width: 120,
      render: (category) => (
        <Tag color="blue" key={category || "unknown"}>
          {category || "No category"}
        </Tag>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      key: "price",
      width: 120,
      render: (price) => (
        <div className="font-semibold text-green-600">
          {formatCurrency(price || 0)}
        </div>
      ),
    },
    {
      title: "Stock",
      dataIndex: "stock",
      key: "stock",
      width: 80,
      render: (stock) => (
        <div className={`text-center ${stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
          {stock || 0}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 100,
      render: (status) => {
        const statusConfig = {
          active: { color: 'green', text: 'Active' },
          inactive: { color: 'gray', text: 'Inactive' },
          out_of_stock: { color: 'red', text: 'Out of Stock' }
        };
        const config = statusConfig[status] || statusConfig.active;
        return (
          <Tag color={config.color}>
            {config.text}
          </Tag>
        );
      },
    },
    {
      title: "Attributes",
      key: "attributes",
      width: 150,
      render: (_, record) => (
        <div className="text-xs">
          {record.sizes && record.sizes.length > 0 && (
            <div className="mb-1">
              <span className="text-gray-500">Sizes: </span>
              {record.sizes.slice(0, 3).map(size => (
                <Tag key={size} size="small" className="text-xs">{size}</Tag>
              ))}
              {record.sizes.length > 3 && <span>+{record.sizes.length - 3}</span>}
            </div>
          )}
          {record.colors && record.colors.length > 0 && (
            <div>
              <span className="text-gray-500">Colors: </span>
              {record.colors.slice(0, 3).map(color => (
                <Tag key={color} size="small" className="text-xs">{color}</Tag>
              ))}
              {record.colors.length > 3 && <span>+{record.colors.length - 3}</span>}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Created",
      dataIndex: "created_at",
      key: "created_at",
      width: 100,
      render: (date) => {
        try {
          return date ? new Date(date).toLocaleDateString("vi-VN") : "N/A";
        } catch (error) {
          return "N/A";
        }
      },
    },
    {
      title: "Actions",
      key: "actions",
      width: 100,
      fixed: 'right',
      render: (_, record) => {
        if (!record || !record._id) {
          return <span className="text-gray-400">Cannot perform actions</span>;
        }

        return (
          <Space size="small">
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => openEditModal(record)}
              size="small"
              title="Edit"
            />
            <Popconfirm
              title="Are you sure you want to delete this product?"
              onConfirm={() => handleDeleteProduct(record._id)}
              okText="Yes"
              cancelText="No"
            >
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                size="small"
                title="Delete"
              />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  // Get unique categories from existing products
  const getUniqueCategories = () => {
    if (!Array.isArray(products) || products.length === 0) {
      // Fallback to default categories if no products
      return [
        { value: PRODUCT_CATEGORIES.MEN, label: "Men's Fashion" },
        { value: PRODUCT_CATEGORIES.WOMEN, label: "Women's Fashion" },
        { value: PRODUCT_CATEGORIES.KIDS, label: "Kids' Fashion" }
      ];
    }

    // Get unique categories from products
    const uniqueCategories = [...new Set(products.map(product => product.category).filter(Boolean))];
    
    // Map to options with proper labels
    const categoryOptions = uniqueCategories.map(category => {
      // Create proper label from category value
      const label = category.charAt(0).toUpperCase() + category.slice(1).toLowerCase();
      return {
        value: category,
        label: label.includes('_') ? label.replace('_', ' ') : label
      };
    });

    // Add default categories if they don't exist
    const defaultCategories = [
      { value: PRODUCT_CATEGORIES.MEN, label: "Men's Fashion" },
      { value: PRODUCT_CATEGORIES.WOMEN, label: "Women's Fashion" },
      { value: PRODUCT_CATEGORIES.KIDS, label: "Kids' Fashion" }
    ];

    // Merge and remove duplicates
    const allCategories = [...categoryOptions];
    defaultCategories.forEach(defaultCat => {
      if (!allCategories.find(cat => cat.value === defaultCat.value)) {
        allCategories.push(defaultCat);
      }
    });

    return allCategories.sort((a, b) => a.label.localeCompare(b.label));
  };

  // Dashboard statistics
  const dashboardStats = [
    {
      title: "Total Products",
      value: Array.isArray(products) ? products.length : 0,
      icon: <ShoppingOutlined />,
      color: "#1890ff",
    },
    {
      title: "Category",
      value:
        Array.isArray(products) && products.length > 0
          ? [...new Set(products.map((p) => p.category))].length
          : 0,
      icon: <PictureOutlined />,
      color: "#52c41a",
    },
    {
      title: "Total Value",
      value:
        Array.isArray(products) && products.length > 0
          ? formatCurrency(products.reduce((sum, p) => sum + (p.price || 0), 0))
          : formatCurrency(0),
      icon: <ShoppingOutlined />,
      color: "#faad14",
    },
  ];

  // Loading state - chờ user load xong
  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Loading...
          </h2>
          <p className="text-gray-500">Please wait for a moment</p>
        </Card>
      </div>
    );
  }

  // No user - redirect to login
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Not logged in
          </h2>
          <p className="text-gray-600">
            Please login to access the admin page.
          </p>
          <Button
            type="primary"
            className="mt-4"
            onClick={() => (window.location.href = "/login")}
          >
            Login
          </Button>
        </Card>
      </div>
    );
  }

  // Not admin - access denied
  if (user?.role?.toLowerCase() !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">No access</h2>
          <p className="text-gray-600">
            You need admin access to access this page.
          </p>
          <Button
            type="default"
            className="mt-4"
            onClick={() => (window.location.href = "/")}
          >
            Back to home
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Admin System
              </h1>
              <p className="text-gray-600">Manage products, users and system</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Welcome</div>
              <div className="text-lg font-semibold text-gray-900">
                {user?.name || user?.email}
              </div>
              <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
                ADMIN
              </div>
            </div>
          </div>
        </div>

        <Tabs activeKey={activeTab} onChange={setActiveTab} size="large">
          {/* Dashboard Tab */}
          <TabPane
            tab={
              <span>
                <EyeOutlined />
                Overview
              </span>
            }
            key="dashboard"
          >
            <Row gutter={[24, 24]} className="mb-8">
              {dashboardStats.map((stat, index) => (
                <Col xs={24} sm={8} key={index}>
                  <Card>
                    <Statistic
                      title={stat.title}
                      value={stat.value}
                      prefix={
                        <span style={{ color: stat.color }}>{stat.icon}</span>
                      }
                      valueStyle={{ color: stat.color }}
                    />
                  </Card>
                </Col>
              ))}
            </Row>

            {/* Products Loading State */}
            {productsLoading && (
              <Card className="mb-6">
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product data...</p>
                </div>
              </Card>
            )}

            <Card title="Recent Products" className="mb-6">
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product data...</p>
                </div>
              ) : !Array.isArray(products) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Invalid product data</p>
                </div>
              ) : (
                <Table
                  columns={productColumns.slice(0, -1)} // Remove actions column
                  dataSource={products.slice(0, 5)}
                  pagination={false}
                  rowKey="_id"
                  size="small"
                />
              )}
            </Card>

            <Card title="Category Statistics">
              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product data...</p>
                </div>
              ) : !Array.isArray(products) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Invalid product data</p>
                </div>
              ) : (
                <Row gutter={[16, 16]}>
                  {products.length > 0 ? (
                    [...new Set(products.map((p) => p.category))].map(
                      (category) => {
                        const count = products.filter(
                          (p) => p.category === category
                        ).length;
                        return (
                          <Col xs={12} sm={6} key={category}>
                            <Card size="small" className="text-center">
                              <div className="text-2xl font-bold text-blue-600">
                                {count}
                              </div>
                              <div className="text-sm text-gray-600">
                                {category}
                              </div>
                            </Card>
                          </Col>
                        );
                      }
                    )
                  ) : (
                    <Col span={24}>
                      <div className="text-center text-gray-500 py-8">
                        No products
                      </div>
                    </Col>
                  )}
                </Row>
              )}
            </Card>
          </TabPane>

          {/* Products Tab */}
          <TabPane
            tab={
              <span>
                <ShoppingOutlined />
                Products
              </span>
            }
            key="products"
          >
            <Card>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Manage Products</h2>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={openCreateModal}
                  size="large"
                >
                  Add new product
                </Button>
              </div>

              {productsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading product data...</p>
                </div>
              ) : !Array.isArray(products) ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Invalid product data</p>
                </div>
              ) : (
                <Table
                  columns={productColumns}
                  dataSource={products}
                  rowKey="_id"
                  scroll={{ x: 1200 }}
                  pagination={{
                    pageSize: 10,
                    showSizeChanger: true,
                    showQuickJumper: true,
                    showTotal: (total, range) =>
                      `${range[0]}-${range[1]} of ${total} products`,
                  }}
                />
              )}
            </Card>
          </TabPane>

          {/* Users Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Users
              </span>
            }
            key="users"
          >
            <UserManager />
          </TabPane>

          {/* Images Tab */}
          <TabPane
            tab={
              <span>
                <PictureOutlined />
                Images
              </span>
            }
            key="images"
          >
            <ImageManager />
          </TabPane>
        </Tabs>
      </div>

      {/* Product Modal */}
      <Modal
        title={editingProduct ? "Edit Product" : "Add New Product"}
        open={productModalVisible}
        onCancel={closeModal}
        footer={null}
        width={800}
        destroyOnClose
      >
        <Form
          layout="vertical"
          onFinish={editingProduct ? handleUpdateProduct : handleCreateProduct}
          initialValues={editingProduct || {}}
        >
          <Form.Item
            name="name"
            label="Product Name"
            rules={[
              { required: true, message: "Please enter the product name!" },
            ]}
          >
            <Input placeholder="Enter product name" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[
              { required: true, message: "Please enter the description!" },
            ]}
          >
            <TextArea rows={3} placeholder="Enter product description" />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="brand"
                label="Brand"
                rules={[
                  { required: false, message: "Please enter the brand!" },
                ]}
              >
                <Input placeholder="Enter brand name" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="status"
                label="Status"
                rules={[
                  { required: false },
                ]}
                initialValue="active"
              >
                <Select placeholder="Select status">
                  <Option value="active">Active</Option>
                  <Option value="inactive">Inactive</Option>
                  <Option value="out_of_stock">Out of Stock</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={8}>
              <Form.Item
                name="price"
                label="Price"
                rules={[{ required: true, message: "Please enter the price!" }]}
              >
                <Input type="number" placeholder="0" addonAfter="VND" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="stock"
                label="Stock Quantity"
                rules={[{ required: false }]}
                initialValue={0}
              >
                <Input type="number" placeholder="0" min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item
                name="category"
                label="Category"
                rules={[
                  { required: true, message: "Please select the category!" },
                ]}
              >
                <Select placeholder="Select category">
                  {getUniqueCategories().map(category => (
                    <Option key={category.value} value={category.value}>
                      {category.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="sizes"
                label="Available Sizes"
                rules={[{ required: false }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select sizes"
                  allowClear
                >
                  <Option value="XS">XS</Option>
                  <Option value="S">S</Option>
                  <Option value="M">M</Option>
                  <Option value="L">L</Option>
                  <Option value="XL">XL</Option>
                  <Option value="XXL">XXL</Option>
                  <Option value="XXXL">XXXL</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="colors"
                label="Available Colors"
                rules={[{ required: false }]}
              >
                <Select
                  mode="multiple"
                  placeholder="Select colors"
                  allowClear
                >
                  <Option value="white">White</Option>
                  <Option value="black">Black</Option>
                  <Option value="red">Red</Option>
                  <Option value="blue">Blue</Option>
                  <Option value="green">Green</Option>
                  <Option value="yellow">Yellow</Option>
                  <Option value="purple">Purple</Option>
                  <Option value="pink">Pink</Option>
                  <Option value="brown">Brown</Option>
                  <Option value="gray">Gray</Option>
                  <Option value="navy">Navy</Option>
                  <Option value="beige">Beige</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Product Image"
            rules={[
              { required: !editingProduct, message: "Please upload the product image!" },
            ]}
          >
            <Upload
              listType="picture-card"
              fileList={uploadedImages.map((img, index) => ({
                uid: index.toString(),
                name: img.originalName || `image-${index}`,
                status: "done",
                url: img.url,
                size: img.size,
                type: img.contentType,
              }))}
              beforeUpload={handleImageUpload}
              onRemove={(file) => {
                // Remove specific image from the list
                const newImages = uploadedImages.filter((_, index) => index.toString() !== file.uid);
                setUploadedImages(newImages);
                message.success("Image removed successfully!");
              }}
              maxCount={1}
              accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
              showUploadList={{
                showPreviewIcon: true,
                showRemoveIcon: true,
                showDownloadIcon: false,
              }}
            >
              {uploadedImages.length === 0 && (
                <div>
                  <UploadOutlined />
                  <div style={{ marginTop: 8 }}>Upload Image</div>
                  <div style={{ fontSize: '12px', color: '#999', marginTop: 4 }}>
                    Max 5MB • JPEG, PNG, GIF, WebP
                  </div>
                </div>
              )}
            </Upload>

            {/* Display detailed image info for debugging/admin purposes */}
            {uploadedImages.length > 0 && (
              <div className="mt-3 space-y-2">
                {uploadedImages.map((img, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded-lg text-sm">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="font-medium text-gray-700">URL:</span>
                        <div className="text-gray-600 break-all text-xs">
                          {img.url}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">S3 Key:</span>
                        <div className="text-gray-600 break-all text-xs">
                          {img.key || 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Size:</span>
                        <div className="text-gray-600">
                          {img.size ? `${(img.size / 1024 / 1024).toFixed(2)} MB` : 'N/A'}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Type:</span>
                        <div className="text-gray-600">
                          {img.contentType || 'N/A'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Form.Item>

          <div className="flex justify-end space-x-3 pt-4">
            <Button onClick={closeModal}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              {editingProduct ? "Update" : "Create"}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminPage;
