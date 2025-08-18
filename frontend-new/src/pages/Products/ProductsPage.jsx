import React, { useState, useMemo, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Typography,
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Space,
  Empty,
  Tag,
  Divider,
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ClearOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import ProductCard from "../../components/ProductCard/ProductCard";
import { useProducts } from "../../hooks/useProducts";
import { PRODUCT_CATEGORIES } from "../../constants";

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const ProductsPage = () => {
  const { products, loading, fetchProducts, error } = useProducts();
  const cartItems = useSelector((state) => state.cart.items);

  // Local state for filtering and search
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [sortBy, setSortBy] = useState("name");

  // Fetch products when component mounts
  useEffect(() => {
    console.log("ProductsPage: Fetching products from API");
    fetchProducts();
  }, []); // Empty dependency array to run only once on mount

  // No sample products - using real data from API

  // Always use products from context
  const displayProducts = products;

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const categories = [
      ...new Set(displayProducts.map((product) => product.category)),
    ];
    return categories.sort();
  }, [displayProducts]);

  // Filter and search products
  const filteredProducts = useMemo(() => {
    let filtered = [...displayProducts];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (product) => product.category === selectedCategory
      );
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price-low":
          return a.price - b.price;
        case "price-high":
          return b.price - a.price;
        case "newest":
          return new Date(b.created_at) - new Date(a.created_at);
        case "oldest":
          return new Date(a.created_at) - new Date(b.created_at);
        default:
          return 0;
      }
    });

    return filtered;
  }, [displayProducts, searchTerm, selectedCategory, sortBy]);

  // Handle search
  const handleSearch = (value) => {
    setSearchTerm(value);
  };

  // Handle category filter
  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  // Handle sort change
  const handleSortChange = (value) => {
    setSortBy(value);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("");
    setSortBy("name");
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      hoodies: "purple",
      shirts: "cyan",
      pants: "orange",
      shoes: "red",
      men: "blue",
      women: "pink",
      kids: "green",
    };
    return colors[category.toLowerCase()] || "default";
  };

  // Helper function to get proper image URL
  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return "/img/logo.png";

    // If it's already a full URL, return as is
    if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
      return imageUrl;
    }

    // If it's a relative path starting with /, prepend backend URL
    if (imageUrl.startsWith("/")) {
      const apiUrl =
        process.env.REACT_APP_BACKEND_URL || "http://localhost:5194";
      return `${apiUrl}${imageUrl}`;
    }

    // If it's just a filename, construct the full path to backend images
    const apiUrl = process.env.REACT_APP_BACKEND_URL || "http://localhost:5194";
    return `${apiUrl}/api/images/${imageUrl}`;
  };

  // Get the actual image URL to use
  const getActualImageUrl = (product) => {
    // Priority: imageUrl (S3) > image (local) > placeholder
    if (product.imageUrl) {
      return product.imageUrl; // This is the S3 URL
    }
    if (product.image) {
      return getImageUrl(product.image); // This is local image
    }
    return "/img/logo.png";
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Title level={1} className="text-4xl font-bold text-gray-900 mb-4">
            Product Catalog
          </Title>
          <Paragraph className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explore our diverse collection of high quality products
          </Paragraph>
        </div>

        {/* Filters and Search */}
        <Card className="mb-6 shadow-sm">
          <div className="space-y-4">
            {/* Search and Category Row */}
            <Row gutter={16} align="middle">
              <Col xs={24} sm={12} md={8}>
                <Search
                  placeholder="Search for products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onSearch={handleSearch}
                  prefix={<SearchOutlined />}
                  size="large"
                  allowClear
                />
              </Col>
              <Col xs={24} sm={12} md={8}>
                <Select
                  placeholder="Select category"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  size="large"
                  className="w-full"
                  allowClear
                >
                  {availableCategories.map((category) => (
                    <Option key={category} value={category}>
                      <Tag color={getCategoryColor(category)} className="mr-2">
                        {category}
                      </Tag>
                      {category}
                    </Option>
                  ))}
                </Select>
              </Col>
              <Col xs={24} sm={24} md={8}>
                <Select
                  placeholder="Sort by"
                  value={sortBy}
                  onChange={handleSortChange}
                  size="large"
                  className="w-full"
                >
                  <Option value="name">Name A-Z</Option>
                  <Option value="price-low">Price Low to High</Option>
                  <Option value="price-high">Price High to Low</Option>
                  <Option value="newest">Newest</Option>
                  <Option value="oldest">Oldest</Option>
                </Select>
              </Col>
            </Row>

            {/* Filter Actions */}
            <Row justify="space-between" align="middle">
              <Col>
                <Space>
                  <FilterOutlined className="text-blue-500" />
                  <Text type="secondary">
                    Display {filteredProducts.length} products
                    {selectedCategory && ` in category "${selectedCategory}"`}
                    {searchTerm && ` for keyword "${searchTerm}"`}
                  </Text>
                </Space>
              </Col>
              <Col>
                <Button
                  icon={<ClearOutlined />}
                  onClick={handleClearFilters}
                  disabled={
                    !searchTerm && !selectedCategory && sortBy === "name"
                  }
                >
                  Clear Filters
                </Button>
              </Col>
            </Row>
          </div>
        </Card>

        {/* Products Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <Text type="secondary">Loading products...</Text>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <Text type="danger">{error}</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => fetchProducts()}>
                Try Again
              </Button>
            </div>
          </div>
        ) : filteredProducts.length > 0 ? (
          <>
            {/* Category-based sections */}
            {!selectedCategory && (
              <div className="space-y-8">
                {availableCategories.map((category) => {
                  const categoryProducts = filteredProducts.filter(
                    (p) => p.category === category
                  );
                  if (categoryProducts.length === 0) return null;

                  return (
                    <div key={category} className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Title level={3} className="flex items-center">
                          <Tag
                            color={getCategoryColor(category)}
                            size="large"
                            className="mr-3"
                          >
                            {category}
                          </Tag>
                          {category}
                        </Title>
                        <Button
                          type="link"
                          href={`/catalog?category=${category}`}
                        >
                          View All
                        </Button>
                      </div>

                      <div className="overflow-x-auto">
                        <Row gutter={[16, 16]} className="flex-nowrap">
                          {categoryProducts.slice(0, 4).map((product) => (
                            <Col key={product._id} flex="0 0 300px">
                              <ProductCard
                                product={product}
                                onAddToWishlist={(product) => {
                                  console.log("Added to wishlist:", product);
                                }}
                                onVirtualTryOn={(product) => {
                                  console.log("Virtual try-on:", product);
                                }}
                              />
                            </Col>
                          ))}
                        </Row>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Grid view when category is selected */}
            {selectedCategory && (
              <Row gutter={[24, 24]}>
                {filteredProducts.map((product) => (
                  <Col key={product._id} xs={24} sm={12} md={8} lg={6}>
                    <ProductCard
                      product={product}
                      onAddToWishlist={(product) => {
                        console.log("Added to wishlist:", product);
                      }}
                      onVirtualTryOn={(product) => {
                        console.log("Virtual try-on:", product);
                      }}
                    />
                  </Col>
                ))}
              </Row>
            )}
          </>
        ) : (
          <Empty
            description={
              <div className="space-y-2">
                <Text type="secondary">
                  {searchTerm || selectedCategory
                    ? `No products found for "${
                        searchTerm || selectedCategory
                      }"`
                    : "No products found"}
                </Text>
                {(searchTerm || selectedCategory) && (
                  <Button type="primary" onClick={handleClearFilters}>
                    Clear Filters
                  </Button>
                )}
              </div>
            }
            className="py-12"
          />
        )}

        {/* Cart Summary */}
      </div>
    </div>
  );
};

export default ProductsPage;
