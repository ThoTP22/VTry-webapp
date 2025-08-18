import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Select, Slider, Checkbox, Space, Tag, Empty, Spin } from 'antd';
import { HeartOutlined, HeartFilled, ShoppingCartOutlined, FilterOutlined, EyeOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import { useProducts } from '../../context/ProductsContext';
import './ProductCatalog.css';

const { Option } = Select;

const ProductCatalog = ({ category = null, title = "VTry Collection" }) => {
  const { products, loading, fetchProducts } = useProducts();
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [favorites, setFavorites] = useState(new Set());
  const [filters, setFilters] = useState({
    sortBy: 'featured',
    priceRange: [0, 10000],
    brands: [],
    sizes: [],
    colors: [],
    inStock: true
  });

  // Luxury fashion brands and options
  const luxuryBrands = ['Chanel', 'Gucci', 'Louis Vuitton', 'Hermès', 'Prada', 'Dior', 'Versace', 'Saint Laurent'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Beige', 'Navy', 'Grey', 'Burgundy', 'Gold', 'Silver'];

  useEffect(() => {
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];
    
    // Category filter
    if (category) {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === category.toLowerCase()
      );
    }

    // Apply filters
    if (filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      );
    }

    // Price filter
    filtered = filtered.filter(product => 
      product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1]
    );

    // Sort
    switch (filters.sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        // Featured/default order
        break;
    }

    setFilteredProducts(filtered);
  }, [products, filters, category]);

  const toggleFavorite = (productId) => {
    const newFavorites = new Set(favorites);
    if (newFavorites.has(productId)) {
      newFavorites.delete(productId);
    } else {
      newFavorites.add(productId);
    }
    setFavorites(newFavorites);
  };

  const ProductCard = ({ product }) => (
    <Card
      className="luxury-product-card group"
      cover={
        <div className="relative overflow-hidden bg-luxury-lightgrey aspect-[3/4]">
          {product.images?.length > 0 ? (
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-luxury-lightgrey">
              <span className="text-luxury-darkgrey text-4xl font-serif">No Image</span>
            </div>
          )}
          
          {/* Overlay actions */}
          <div className="absolute inset-0 bg-luxury-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Space size="large">
              <Button
                shape="circle"
                size="large"
                className="bg-luxury-white/90 border-0 shadow-lg hover:bg-luxury-white hover:scale-110 transition-all"
                icon={<EyeOutlined className="text-luxury-black" />}
              />
              <Button
                shape="circle"
                size="large"
                className="bg-luxury-white/90 border-0 shadow-lg hover:bg-luxury-white hover:scale-110 transition-all"
                icon={<ShoppingCartOutlined className="text-luxury-black" />}
              />
            </Space>
          </div>

          {/* Wishlist button */}
          <Button
            shape="circle"
            className="absolute top-4 right-4 bg-luxury-white/80 border-0 shadow-sm hover:bg-luxury-white hover:scale-110 transition-all"
            icon={
              favorites.has(product._id) ? 
                <HeartFilled className="text-red-500" /> : 
                <HeartOutlined className="text-luxury-darkgrey" />
            }
            onClick={(e) => {
              e.preventDefault();
              toggleFavorite(product._id);
            }}
          />

          {/* Tags */}
          <div className="absolute top-4 left-4 space-y-2">
            {product.isNew && (
              <Tag className="bg-accent-500 text-luxury-white border-0 font-medium uppercase tracking-wide">
                New
              </Tag>
            )}
            {product.onSale && (
              <Tag className="bg-red-500 text-luxury-white border-0 font-medium uppercase tracking-wide">
                Sale
              </Tag>
            )}
          </div>
        </div>
      }
      bodyStyle={{ padding: '24px 20px' }}
      bordered={false}
    >
      <div className="space-y-3">
        {/* Brand */}
        <div className="text-sm uppercase tracking-wider text-luxury-darkgrey/70 font-medium">
          {product.brand || 'Luxury Brand'}
        </div>

        {/* Product name */}
        <Link to={`/product/${product._id}`}>
          <h3 className="text-lg font-serif text-luxury-black hover:text-accent-500 transition-colors cursor-pointer line-clamp-2">
            {product.name}
          </h3>
        </Link>

        {/* Description */}
        <p className="text-sm text-luxury-darkgrey/80 line-clamp-2">
          {product.description}
        </p>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="space-x-3">
            <span className="text-xl font-semibold text-luxury-black">
              ${product.price?.toLocaleString()}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-sm text-luxury-darkgrey/60 line-through">
                ${product.originalPrice.toLocaleString()}
              </span>
            )}
          </div>
          
          {/* Available sizes */}
          <div className="flex space-x-1">
            {product.sizes?.slice(0, 3).map(size => (
              <div key={size} className="w-8 h-8 border border-luxury-darkgrey/20 rounded flex items-center justify-center text-xs text-luxury-darkgrey">
                {size}
              </div>
            ))}
            {product.sizes?.length > 3 && (
              <div className="w-8 h-8 border border-luxury-darkgrey/20 rounded flex items-center justify-center text-xs text-luxury-darkgrey">
                +{product.sizes.length - 3}
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-luxury-white">
      {/* Header */}
      <div className="bg-luxury-black text-luxury-white py-20">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-6xl font-serif font-light">
              {title}
            </h1>
            <p className="text-xl text-luxury-white/80 font-light max-w-2xl mx-auto">
              Discover our curated selection of luxury fashion pieces that define elegance and sophistication
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Row gutter={[32, 32]}>
          {/* Filters Sidebar */}
          <Col xs={24} lg={6}>
            <div className="bg-luxury-lightgrey p-8 rounded-luxury sticky top-24">
              <div className="flex items-center space-x-2 mb-8">
                <FilterOutlined className="text-luxury-black" />
                <h3 className="text-xl font-serif text-luxury-black">Filters</h3>
              </div>

              <div className="space-y-8">
                {/* Sort */}
                <div>
                  <h4 className="text-sm font-medium text-luxury-black mb-4 uppercase tracking-wide">Sort By</h4>
                  <Select
                    value={filters.sortBy}
                    onChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
                    className="w-full"
                    size="large"
                  >
                    <Option value="featured">Featured</Option>
                    <Option value="newest">Newest</Option>
                    <Option value="price-low">Price: Low to High</Option>
                    <Option value="price-high">Price: High to Low</Option>
                  </Select>
                </div>

                {/* Price Range */}
                <div>
                  <h4 className="text-sm font-medium text-luxury-black mb-4 uppercase tracking-wide">Price Range</h4>
                  <Slider
                    range
                    min={0}
                    max={10000}
                    value={filters.priceRange}
                    onChange={(value) => setFilters(prev => ({ ...prev, priceRange: value }))}
                    tooltip={{ formatter: (value) => `$${value}` }}
                  />
                  <div className="flex justify-between text-sm text-luxury-darkgrey mt-2">
                    <span>${filters.priceRange[0]}</span>
                    <span>${filters.priceRange[1]}</span>
                  </div>
                </div>

                {/* Brands */}
                <div>
                  <h4 className="text-sm font-medium text-luxury-black mb-4 uppercase tracking-wide">Brands</h4>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {luxuryBrands.map(brand => (
                      <Checkbox
                        key={brand}
                        checked={filters.brands.includes(brand)}
                        onChange={(e) => {
                          const newBrands = e.target.checked 
                            ? [...filters.brands, brand]
                            : filters.brands.filter(b => b !== brand);
                          setFilters(prev => ({ ...prev, brands: newBrands }));
                        }}
                        className="text-luxury-darkgrey"
                      >
                        {brand}
                      </Checkbox>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div>
                  <h4 className="text-sm font-medium text-luxury-black mb-4 uppercase tracking-wide">Colors</h4>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map(color => (
                      <div
                        key={color}
                        className={`w-8 h-8 rounded-full border-2 cursor-pointer transition-all ${
                          filters.colors.includes(color) 
                            ? 'border-accent-500 scale-110' 
                            : 'border-luxury-darkgrey/20 hover:border-luxury-darkgrey/40'
                        }`}
                        style={{ backgroundColor: color.toLowerCase() === 'beige' ? '#F5F5DC' : color.toLowerCase() }}
                        onClick={() => {
                          const newColors = filters.colors.includes(color)
                            ? filters.colors.filter(c => c !== color)
                            : [...filters.colors, color];
                          setFilters(prev => ({ ...prev, colors: newColors }));
                        }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Col>

          {/* Products Grid */}
          <Col xs={24} lg={18}>
            {loading ? (
              <div className="flex justify-center items-center h-96">
                <Spin size="large" />
              </div>
            ) : filteredProducts.length > 0 ? (
              <>
                {/* Results header */}
                <div className="flex justify-between items-center mb-8">
                  <div className="text-luxury-darkgrey">
                    <span className="font-medium">{filteredProducts.length}</span> products found
                  </div>
                </div>

                {/* Products grid */}
                <Row gutter={[32, 48]}>
                  {filteredProducts.map(product => (
                    <Col key={product._id} xs={24} sm={12} xl={8}>
                      <ProductCard product={product} />
                    </Col>
                  ))}
                </Row>
              </>
            ) : (
              <div className="text-center py-20">
                <Empty
                  description={
                    <div className="space-y-4">
                      <h3 className="text-2xl font-serif text-luxury-black">No products found</h3>
                      <p className="text-luxury-darkgrey">Try adjusting your filters or search criteria</p>
                    </div>
                  }
                />
              </div>
            )}
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default ProductCatalog;
