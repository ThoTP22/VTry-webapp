import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button, Row, Col, Card, Badge, Spin } from 'antd';
import { 
  ShoppingCartOutlined, 
  UserOutlined, 
  StarOutlined,
  ArrowRightOutlined,
  PlayCircleOutlined,
  HeartOutlined,
  EyeOutlined,
  GiftOutlined,
  CrownOutlined
} from '@ant-design/icons';
import { useProducts } from '../../hooks/useProducts';

const HomePage = () => {
  // Get products from API
  const { products, isLoading, fetchProducts } = useProducts();

  // Fetch products when component mounts
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Get featured products (first 8 or filtered by some criteria)
  const featuredProducts = Array.isArray(products) ? products.slice(0, 8) : [];
  // Hero collections
  const heroCollections = [
    {
      id: 1,
      title: "AUTUMN ELEGANCE",
      subtitle: "Timeless sophistication for the modern woman",
      description: "Discover our curated selection of autumn essentials, crafted with the finest materials and attention to detail.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=800&h=1000&fit=crop&crop=center",
      buttonText: "Explore Collection",
      link: "/collections/autumn",
      featured: true
    },
    {
      id: 2,
      title: "VIRTUAL FITTING",
      subtitle: "Try before you buy with AI technology",
      description: "Experience the future of fashion with our revolutionary virtual try-on technology.",
      image: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&h=1000&fit=crop&crop=center",
      buttonText: "Try Virtual Fitting",
      link: "/virtual-tryon",
      featured: false
    }
  ];

  // Featured categories with luxury appeal
  const luxuryCategories = [
    {
      name: "Women's Collection",
      description: "Sophisticated elegance",
      image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=600&fit=crop&crop=center",
      count: "350+ pieces",
      link: "/collections/women"
    },
    {
      name: "Men's Essentials", 
      description: "Modern gentleman",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop&crop=center",
      count: "280+ pieces",
      link: "/collections/men"
    },
    {
      name: "Luxury Accessories",
      description: "Finishing touches",
      image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=600&fit=crop&crop=center",
      count: "120+ pieces", 
      link: "/collections/accessories"
    }
  ];

  const luxuryFeatures = [
    {
      icon: <StarOutlined className="text-3xl text-accent-500" />,
      title: 'Premium Quality',
      description: 'Handcrafted with the finest materials and meticulous attention to detail'
    },
    {
      icon: <CrownOutlined className="text-3xl text-accent-500" />,
      title: 'Exclusive Designs',
      description: 'Limited edition pieces from world-renowned designers and emerging talents'
    },
    {
      icon: <GiftOutlined className="text-3xl text-accent-500" />,
      title: 'Personalized Service',
      description: 'Dedicated styling consultants and tailored shopping experiences'
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  return (
    <div className="min-h-screen bg-luxury-white">
      {/* Luxury Hero Section */}
      <section className="relative min-h-screen flex items-center bg-luxury-black text-luxury-white overflow-hidden">
        {/* Background Image with Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1920&h=1080&fit=crop&crop=center')`
          }}
        >
          <div className="absolute inset-0 bg-luxury-black/40"></div>
        </div>
        
        {/* Content */}
        <div className="relative z-10 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <Row align="middle" className="min-h-screen">
            <Col xs={24} lg={14} xl={12}>
              <div className="space-y-8">
                <div className="space-y-6">
                  <div className="inline-flex items-center space-x-2 bg-luxury-white/10 backdrop-blur-sm rounded-full px-6 py-3">
                    {/* <StarOutlined className="text-accent-500" /> */}
                    <img src={"/img/logo.png"} alt="Logo" className="w-8 h-8 rounded" />
                    <span className="text-sm font-medium tracking-wide uppercase">Virtual Try-On Fashion</span>
                  </div>
                  
                  <h1 className="font-serif text-5xl lg:text-7xl xl:text-8xl font-light leading-none tracking-tight text-red-500">
                    Try It
                    <br />
                    <span className="text-accent-500 italic">Be4 You Own It</span>
                  </h1>
                  
                  <p className="text-xl lg:text-2xl leading-relaxed text-gray-200 max-w-2xl">
                    Discover our exclusive collection of luxury fashion with innovative virtual try-on technology. 
                    Experience sophistication like never before.
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-6">
                  <Link to="/collections">
                    <Button 
                      size="large" 
                      className="bg-luxury-white text-luxury-black hover:bg-gray-100 border-0 h-14 px-8 font-medium tracking-wide uppercase rounded-luxury transition-all duration-300 hover:scale-105"
                    >
                      Explore Collections
                    </Button>
                  </Link>
                  <Button 
                    size="large" 
                    icon={<PlayCircleOutlined />}
                    className="border-2 border-luxury-white text-luxury-white hover:bg-luxury-white hover:text-luxury-black h-14 px-8 font-medium tracking-wide uppercase rounded-luxury bg-transparent transition-all duration-300"
                  >
                    Watch Film
                  </Button>
                </div>

                {/* Stats */}
                <div className="flex items-center space-x-12 pt-12">
                  <div className="text-center">
                    <div className="text-3xl font-serif font-light">1K+</div>
                    <div className="text-sm uppercase tracking-wide text-gray-300">Happy Clients</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-serif font-light">90%</div>
                    <div className="text-sm uppercase tracking-wide text-gray-300">Satisfaction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-serif font-light">100+</div>
                    <div className="text-sm uppercase tracking-wide text-gray-300">Luxury Pieces</div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-luxury-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-luxury-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-32 bg-luxury-lightgrey">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl lg:text-6xl font-light text-luxury-black mb-6">
              Our Collections
            </h2>
            <div className="w-24 h-px bg-accent-500 mx-auto mb-6"></div>
            <p className="text-xl text-luxury-darkgrey max-w-3xl mx-auto leading-relaxed">
              Curated selections that embody timeless elegance and contemporary sophistication
            </p>
          </div>
          
          <Row gutter={[48, 48]}>
            {luxuryCategories.map((category, index) => (
              <Col xs={24} md={8} key={index}>
                <Link to={category.link} className="group block">
                  <Card 
                    className="border-0 shadow-2xl rounded-luxury overflow-hidden bg-luxury-white group-hover:shadow-3xl transition-all duration-500"
                    cover={
                      <div className="relative overflow-hidden aspect-[3/4]">
                        <img
                          src={category.image}
                          alt={category.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-luxury-black/60 via-transparent to-transparent"></div>
                        
                        {/* Overlay Content */}
                        <div className="absolute bottom-8 left-8 right-8 text-luxury-white">
                          <h3 className="font-serif text-2xl font-light mb-2">{category.name}</h3>
                          <p className="text-sm uppercase tracking-wide text-gray-200 mb-1">{category.description}</p>
                          <p className="text-xs text-gray-300">{category.count}</p>
                        </div>
                        
                        {/* Arrow */}
                        <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="w-12 h-12 bg-luxury-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <ArrowRightOutlined className="text-luxury-white group-hover:translate-x-1 transition-transform" />
                          </div>
                        </div>
                      </div>
                    }
                    bodyStyle={{ padding: 0 }}
                  />
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      Featured Products
      <section className="py-32 bg-luxury-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-20">
            <div>
              <h2 className="font-serif text-4xl lg:text-6xl font-light text-luxury-black mb-6">
                Featured Pieces
              </h2>
              <div className="w-24 h-px bg-accent-500 mb-6"></div>
              <p className="text-xl text-luxury-darkgrey max-w-2xl leading-relaxed">
                Handpicked selections from our most coveted luxury collections
              </p>
            </div>
            <Link to="/products">
              <Button 
                type="text" 
                size="large"
                icon={<ArrowRightOutlined />}
                className="hidden md:flex items-center space-x-2 text-luxury-black hover:text-accent-500 font-medium tracking-wide uppercase h-auto p-0"
              >
                <span>View All</span>
              </Button>
            </Link>
          </div>
          
          {/* Loading State */}
          {isLoading ? (
            <div className="text-center py-20">
              <Spin size="large" />
              <p className="mt-4 text-luxury-darkgrey">Loading featured products...</p>
            </div>
          ) : (
            <Row gutter={[32, 48]}>
              {featuredProducts.length > 0 ? featuredProducts.map((product) => (
                <Col xs={12} sm={8} lg={6} key={product._id || product.id}>
                  <div className="group">
                    <Card
                      className="border-0 rounded-luxury overflow-hidden bg-luxury-white group-hover:shadow-2xl transition-all duration-500"
                      cover={
                        <div className="relative overflow-hidden aspect-[3/4]">
                          <img
                            alt={product.name}
                            src={product.image || product.imageUrl || '/img/logo.png'}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.src = '/img/logo.png';
                            }}
                          />
                          
                          {/* Status Badge */}
                          {product.status && (
                            <div className="absolute top-4 left-4 space-y-2">
                              <div className={`px-3 py-1 rounded-full text-xs font-medium text-white uppercase tracking-wide ${
                                product.status === 'active' ? 'bg-green-500' :
                                product.status === 'inactive' ? 'bg-gray-500' :
                                product.status === 'out_of_stock' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`}>
                                {product.status === 'active' ? 'Available' : 
                                 product.status === 'out_of_stock' ? 'Out of Stock' : 
                                 product.status}
                              </div>
                            </div>
                          )}
                          
                          {/* Quick Actions */}
                          <div className="absolute top-4 right-4 space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <Button 
                              type="text" 
                              icon={<HeartOutlined />}
                              className="w-10 h-10 bg-luxury-white/80 backdrop-blur-sm text-luxury-black hover:text-red-500 rounded-full flex items-center justify-center"
                            />
                            <Button 
                              type="text" 
                              icon={<EyeOutlined />}
                              className="w-10 h-10 bg-luxury-white/80 backdrop-blur-sm text-luxury-black hover:text-accent-500 rounded-full flex items-center justify-center"
                            />
                          </div>
                          
                          {/* Color Options */}
                          {product.colors && product.colors.length > 0 && (
                            <div className="absolute bottom-4 left-4 flex space-x-2">
                              {product.colors.slice(0, 3).map((color, idx) => (
                                <div 
                                  key={idx}
                                  className="w-6 h-6 rounded-full border-2 border-luxury-white shadow-lg"
                                  style={{ backgroundColor: color.toLowerCase() }}
                                  title={color}
                                ></div>
                              ))}
                              {product.colors.length > 3 && (
                                <div className="w-6 h-6 rounded-full border-2 border-luxury-white shadow-lg bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                                  +{product.colors.length - 3}
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      }
                      bodyStyle={{ padding: '24px' }}
                    >
                      <div className="space-y-3">
                        <div>
                          {product.brand && (
                            <p className="text-xs uppercase tracking-wider text-gray-500 font-medium">{product.brand}</p>
                          )}
                          <h3 className="font-serif text-lg text-luxury-black group-hover:text-accent-500 transition-colors line-clamp-2">
                            {product.name}
                          </h3>
                          {product.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">{product.description}</p>
                          )}
                        </div>
                        
                        {/* Rating placeholder */}
                        <div className="flex items-center space-x-2 text-sm">
                          <div className="flex text-accent-500">
                            {'★'.repeat(5)}
                          </div>
                          <span className="text-gray-400">(New)</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="space-y-1">
                            <div className="text-xl font-semibold text-luxury-black">
                              {formatPrice(product.price || 0)}
                            </div>
                            {product.stock !== undefined && (
                              <div className={`text-xs ${product.stock > 0 ? 'text-green-600' : 'text-red-500'}`}>
                                {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                              </div>
                            )}
                          </div>
                          <Button 
                            type="text"
                            icon={<ShoppingCartOutlined />}
                            disabled={product.stock === 0}
                            className="w-10 h-10 bg-luxury-black text-luxury-white hover:bg-accent-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 disabled:bg-gray-400"
                          />
                        </div>
                      </div>
                    </Card>
                  </div>
                </Col>
              )) : (
                <Col span={24}>
                  <div className="text-center py-20">
                    <p className="text-luxury-darkgrey text-lg">No products available at the moment.</p>
                    <p className="text-gray-500 mt-2">Please check back later.</p>
                  </div>
                </Col>
              )}
            </Row>
          )}
        </div>
      </section>

      {/* Luxury Features */}
      <section className="py-32 bg-luxury-black text-luxury-white">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              The Luxury Experience
            </h2>
            <div className="w-24 h-px bg-accent-500 mx-auto mb-6"></div>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Every detail crafted to perfection, every experience tailored to exceed expectations
            </p>
          </div>
          
          <Row gutter={[64, 64]}>
            {luxuryFeatures.map((feature, index) => (
              <Col xs={24} md={8} key={index}>
                <div className="text-center group">
                  <div className="mb-8 flex justify-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-accent-500/20 to-accent-500/10 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 border border-accent-500/20">
                      {feature.icon}
                    </div>
                  </div>
                  <h3 className="font-serif text-2xl font-light mb-4 text-luxury-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed max-w-sm mx-auto">
                    {feature.description}
                  </p>
                </div>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-32 bg-accent-500 text-luxury-black">
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-serif text-4xl lg:text-6xl font-light mb-6">
              Stay Informed
            </h2>
            <p className="text-xl mb-12 leading-relaxed">
              Be the first to discover our new collections, exclusive events, and styling tips from our fashion experts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email address"
                className="flex-1 px-6 py-4 rounded-luxury text-luxury-black placeholder-luxury-darkgrey bg-luxury-white focus:outline-none focus:ring-2 focus:ring-luxury-black border-0"
              />
              <Button 
                size="large"
                className="bg-luxury-black hover:bg-luxury-darkgrey text-luxury-white border-0 font-medium h-14 px-8 rounded-luxury transition-all duration-300 uppercase tracking-wide"
              >
                Subscribe
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
