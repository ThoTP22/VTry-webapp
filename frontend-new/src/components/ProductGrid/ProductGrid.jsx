import React, { useState, useEffect } from 'react';
import { Row, Col, Empty, Spin, Pagination, Select, Input, Button, Space, message } from 'antd';
import { SearchOutlined, FilterOutlined, SortAscendingOutlined } from '@ant-design/icons';
import ProductCard from '../ProductCard';
import { useProducts } from '../../hooks/useProducts';

const { Search } = Input;
const { Option } = Select;

const ProductGrid = ({ 
  products = [], 
  loading = false, 
  showFilters = true,
  showPagination = true,
  pageSize = 12,
  onAddToCart,
  onAddToWishlist,
  onVirtualTryOn,
  className = ''
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [priceRange, setPriceRange] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filteredProducts, setFilteredProducts] = useState(products);

  const { fetchProducts } = useProducts();

  // Fetch products on component mount
  useEffect(() => {
    if (products.length === 0) {
      fetchProducts();
    }
  }, [products.length, fetchProducts]);

  // Filter and sort products based on Product schema attributes
  useEffect(() => {
    let filtered = [...products];

    // Filter by search query (name, description, category)
    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== 'all') {
      filtered = filtered.filter(product => {
        const price = product.price || 0;
        switch (priceRange) {
          case '0-500000':
            return price >= 0 && price < 500000;
          case '500000-1000000':
            return price >= 500000 && price < 1000000;
          case '1000000-2000000':
            return price >= 1000000 && price < 2000000;
          case '2000000+':
            return price >= 2000000;
          default:
            return true;
        }
      });
    }

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created_at || 0) - new Date(a.created_at || 0);
        case 'oldest':
          return new Date(a.created_at || 0) - new Date(b.created_at || 0);
        case 'price-low':
          return (a.price || 0) - (b.price || 0);
        case 'price-high':
          return (b.price || 0) - (a.price || 0);
        case 'name-asc':
          return (a.name || '').localeCompare(b.name || '');
        case 'name-desc':
          return (b.name || '').localeCompare(a.name || '');
        case 'updated-recent':
          return new Date(b.updated_at || 0) - new Date(a.updated_at || 0);
        default:
          return 0;
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Get unique categories from products
  const categories = ['all', ...new Set(products.map(product => product.category).filter(Boolean))];

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);
  const total = filteredProducts.length;

  const handleSearch = (value) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (value) => {
    setSelectedCategory(value);
  };

  const handlePriceRangeChange = (value) => {
    setPriceRange(value);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product) => {
    if (onAddToCart) {
      onAddToCart(product);
    } else {
      message.success(`${product.name} has been added to the cart!`);
    }
  };

  const handleAddToWishlist = (product) => {
    if (onAddToWishlist) {
      onAddToWishlist(product);
    } else {
      message.success(`${product.name} has been added to the wishlist!`);
    }
  };

  const handleVirtualTryOn = (product) => {
    if (onVirtualTryOn) {
      onVirtualTryOn(product);
    } else {
      message.info(`Virtual Try-On for ${product.name} is under development!`);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('all');
    setPriceRange('all');
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Spin size="large" />
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <Empty
        description="No products found"
        className="py-20"
      />
    );
  }

  return (
    <div className={`product-grid ${className}`}>
      {/* Filters and Search */}
      {showFilters && (
        <div className="mb-8 p-6 bg-white rounded-lg shadow-sm border border-gray-100">
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} sm={12} md={6}>
              <Search
                placeholder="Search for products..."
                allowClear
                enterButton={<SearchOutlined />}
                size="large"
                onSearch={handleSearch}
                className="w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </Col>
            
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Category"
                value={selectedCategory}
                onChange={handleCategoryChange}
                size="large"
                className="w-full"
              >
                {categories.map(category => (
                  <Option key={category} value={category}>
                    {category === 'all' ? 'All' : category}
                  </Option>
                ))}
              </Select>
            </Col>

            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Price Range"
                value={priceRange}
                onChange={handlePriceRangeChange}
                size="large"
                className="w-full"
              >
                <Option value="all">All Price</Option>
                <Option value="0-500000">Below 500.000₫</Option>
                <Option value="500000-1000000">500.000₫ - 1.000.000₫</Option>
                <Option value="1000000-2000000">1.000.000₫ - 2.000.000₫</Option>
                <Option value="2000000+">Upper 2.000.000₫</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={4}>
              <Select
                placeholder="Sort"
                value={sortBy}
                onChange={handleSortChange}
                size="large"
                className="w-full"
              >
                <Option value="newest">Newest</Option>
                <Option value="oldest">Oldest</Option>
                <Option value="price-low">Price Low to High</Option>
                <Option value="price-high">Price High to Low</Option>
                <Option value="name-asc">Name A-Z</Option>
                <Option value="name-desc">Name Z-A</Option>
                <Option value="updated-recent">Updated Recently</Option>
              </Select>
            </Col>
            
            <Col xs={24} sm={12} md={6}>
              <div className="flex items-center justify-between">
                <span className="text-gray-600 text-sm">
                  Display {startIndex + 1}-{Math.min(endIndex, total)} of {total} products
                </span>
                <Button
                  icon={<FilterOutlined />}
                  onClick={clearAllFilters}
                  size="large"
                  className="ml-2"
                >
                  Clear Filters
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      )}

      {/* Products Grid */}
      <Row gutter={[24, 24]}>
        {currentProducts.map((product) => (
          <Col 
            key={product._id} 
            xs={24} 
            sm={12} 
            md={8} 
            lg={6} 
            xl={4}
          >
            <ProductCard
              product={product}
              onAddToCart={handleAddToCart}
              onAddToWishlist={handleAddToWishlist}
              onVirtualTryOn={handleVirtualTryOn}
            />
          </Col>
        ))}
      </Row>

      {/* No results message */}
      {filteredProducts.length === 0 && products.length > 0 && (
        <div className="text-center py-20">
          <Empty
            description={
              <div>
                <div className="text-lg font-medium text-gray-900 mb-2">
                  No products found
                </div>
                <div className="text-gray-600 mb-4">
                  Try changing the search keyword or filter
                </div>
                <Button
                  type="primary"
                  onClick={clearAllFilters}
                >
                  Clear Filters
                </Button>
              </div>
            }
          />
        </div>
      )}

      {/* Pagination */}
      {showPagination && total > pageSize && (
        <div className="flex justify-center mt-12">
          <Pagination
            current={currentPage}
            total={total}
            pageSize={pageSize}
            onChange={handlePageChange}
            showSizeChanger={false}
            showQuickJumper
            showTotal={(total, range) =>
              `${range[0]}-${range[1]} of ${total} products`
            }
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default ProductGrid;
