import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  InstagramOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined 
} from '@ant-design/icons';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    company: [
      { label: 'About Us', path: '/about' },
      { label: 'Contact Us', path: '/contact' },
      { label: 'Careers', path: '/careers' },
      { label: 'News', path: '/news' },
    ],
    support: [
      { label: 'Help Center', path: '/help' },
      { label: 'Shopping Guide', path: '/guide' },
      { label: 'Return Policy', path: '/return-policy' },
      { label: 'Privacy Policy', path: '/privacy' },
    ],
    products: [
      { label: 'Men', path: '/products?category=men' },
      { label: 'Women', path: '/products?category=women' },
      { label: 'Kids', path: '/products?category=kids' },
      { label: 'Sale', path: '/products?sale=true' },
    ],
  };

  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Main footer content */}
      <div className="container-responsive py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                {/* <span className="text-white font-bold text-lg">VT</span> */}
                <img src={"/img/logo.png"} alt="Logo" className="w-8 h-8 rounded" />
              </div>
              <span className="font-bold text-xl text-white">Virtual Try-On</span>
            </div>
            <p className="text-gray-400 leading-relaxed">
              Experience shopping with advanced virtual try-on technology, 
              helping you find the perfect outfit.
            </p>
            <div className="flex space-x-4">
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Facebook"
              >
                <FacebookOutlined className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Twitter"
              >
                <TwitterOutlined className="text-xl" />
              </a>
              <a 
                href="#" 
                className="text-gray-400 hover:text-primary-500 transition-colors"
                aria-label="Instagram"
              >
                <InstagramOutlined className="text-xl" />
              </a>
            </div>
          </div>

          {/* Company links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <Link 
                    to={link.path} 
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact info */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <EnvironmentOutlined className="text-primary-500 mt-1" />
                <span className="text-gray-400">
                  Vinhomes GrandPark, Thu Duc, HCM City
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneOutlined className="text-primary-500" />
                <span className="text-gray-400">+84 83 997 3335</span>
              </div>
              <div className="flex items-center space-x-3">
                <MailOutlined className="text-primary-500" />
                <span className="text-gray-400">duynhse183995@fpt.edu.vn</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-800">
        <div className="container-responsive py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-gray-400 text-sm">
              © {currentYear} Virtual Try-On. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm">
              <Link to="/terms" className="text-gray-400 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link to="/cookies" className="text-gray-400 hover:text-white transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
