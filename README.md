# 👗 Visual Try-On Webapp

A modern, full-stack web application for virtual fashion try-on experiences, built with React.js frontend and Node.js backend.

## 🌟 Features

- **Visual Try-On Technology**: Advanced AI-powered virtual try-on for fashion items
- **Product Management**: Complete CRUD operations for products with image management
- **User Authentication**: Secure JWT-based authentication with email verification
- **Image Processing**: AWS S3 integration for high-quality image storage and processing
- **Payment Integration**: PayOS payment gateway for seamless transactions
- **Order Management**: Complete order lifecycle management
- **Admin Dashboard**: Comprehensive admin panel for product and user management
- **Responsive Design**: Mobile-first design with Tailwind CSS and Ant Design

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router v6** - Client-side routing
- **Ant Design** - Professional UI component library
- **Tailwind CSS** - Utility-first CSS framework
- **Redux Toolkit** - State management
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - NoSQL database with Mongoose ODM
- **JWT** - JSON Web Tokens for authentication
- **AWS S3** - Cloud storage for images
- **PayOS** - Payment processing
- **AWS SES** - Email service

### Development & Deployment
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **ESLint & Prettier** - Code quality and formatting
- **Swagger** - API documentation
- **Nodemon** - Development server with hot reload

## 📁 Project Structure

```
visual-tryon-webapp/
├── backend/                    # Node.js/Express backend
│   ├── src/
│   │   ├── controllers/       # Route controllers
│   │   ├── middlewares/       # Custom middlewares
│   │   ├── models/           # Database models and schemas
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic services
│   │   ├── utils/            # Utility functions
│   │   ├── config/           # Configuration files
│   │   └── docs/             # API documentation schemas
│   ├── Dockerfile
│   ├── docker-compose.yml
│   └── package.json
│
├── frontend-new/              # React.js frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # Page components
│   │   ├── context/          # React context providers
│   │   ├── hooks/            # Custom React hooks
│   │   ├── api/              # API service functions
│   │   ├── utils/            # Utility functions
│   │   └── constants/        # Application constants
│   ├── public/
│   └── package.json
│
└── README.md                  # This file
```

## 🛠️ Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas)
- **Docker** (optional, for containerized deployment)
- **AWS Account** (for S3 storage)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the backend directory:
   ```env
   # Server Configuration
   PORT=5194
   NODE_ENV=development
   
   # Database Configuration
   MONGODB_URI=mongodb://localhost:27017/visual-tryon
   
   # JWT Configuration
   JWT_SECRET=your_super_secret_jwt_key
   JWT_REFRESH_SECRET=your_refresh_token_secret
   JWT_ACCESS_TOKEN_EXPIRE_TIME=15m
   JWT_REFRESH_TOKEN_EXPIRE_TIME=7d
   
   # AWS S3 Configuration
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your_s3_bucket_name
   
   # AWS SES Configuration (for emails)
   AWS_SES_FROM_EMAIL=noreply@yourdomain.com
   
   # PayOS Configuration
   PAYOS_CLIENT_ID=your_payos_client_id
   PAYOS_API_KEY=your_payos_api_key
   PAYOS_CHECKSUM_KEY=your_payos_checksum_key
   
   # Frontend URL
   CLIENT_URL=http://localhost:3000
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

   The backend will be available at `http://localhost:5194`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend-new
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Configuration:**
   Create a `.env` file in the frontend-new directory:
   ```env
   # API Configuration
   REACT_APP_API_BASE_URL=http://localhost:5194/api
   REACT_APP_DEBUG=true
   
   # Backend port
   REACT_APP_BACKEND_PORT=5194
   ```

4. **Start development server:**
   ```bash
   npm start
   ```

   The frontend will be available at `http://localhost:3000`

## 🐳 Docker Deployment

### Development with Docker Compose

1. **Build and start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f
   ```

3. **Stop services:**
   ```bash
   docker-compose down
   ```

### Production Deployment

1. **Build production images:**
   ```bash
   # Backend
   cd backend
   docker build -t visual-tryon-backend:latest .
   
   # Frontend
   cd ../frontend-new
   docker build -t visual-tryon-frontend:latest .
   ```

2. **Deploy to your server using Docker Compose or Kubernetes**

## 🔧 API Documentation

### Authentication Endpoints
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `POST /api/users/logout` - User logout
- `GET /api/users/me` - Get current user profile
- `POST /api/users/verify-email` - Email verification
- `POST /api/users/forgot-password` - Password reset request
- `POST /api/users/reset-password` - Password reset

### Product Management
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create new product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)
- `POST /api/products/upload-image` - Upload product image

### Image Management
- `POST /api/images/upload` - Upload single image
- `POST /api/images/upload-multiple` - Upload multiple images
- `DELETE /api/images/delete/:key` - Delete image by key
- `DELETE /api/images/delete-by-url` - Delete image by URL

### Orders & Payments
- `GET /api/orders` - Get user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/:id` - Get order details
- `POST /api/payments/create` - Create payment
- `POST /api/payments/confirm` - Confirm payment

### Visual Try-On
- `POST /api/visual-tryon/process` - Process try-on request
- `GET /api/visual-tryon/history` - Get try-on history

For detailed API documentation, visit `http://localhost:5194/api-docs` when running the backend.

## 🎨 Frontend Features

### Pages
- **Home Page** - Landing page with featured products
- **Products** - Product catalog with filtering and search
- **Product Detail** - Individual product view with try-on feature
- **User Profile** - User account management
- **Admin Dashboard** - Product and user management
- **Cart & Checkout** - Shopping cart and payment flow
- **Authentication** - Login and registration forms

### Components
- **Navbar** - Responsive navigation with authentication
- **Product Grid** - Grid layout for product display
- **Product Card** - Individual product preview
- **Footer** - Site-wide footer with links
- **Protected Routes** - Authentication-protected pages
- **Layout** - Common page layout wrapper

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt password encryption
- **Input Validation** - Comprehensive request validation
- **CORS Protection** - Cross-origin request security
- **Helmet Security** - Security headers middleware
- **Rate Limiting** - API rate limiting protection
- **File Upload Security** - Secure file handling with type validation

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend-new
npm test
```

## 📊 Available Scripts

### Backend Scripts
- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript code for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint code analysis
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Fix code formatting

### Frontend Scripts
- `npm start` - Start development server
- `npm run build` - Build production bundle
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (not recommended)

## 🌐 Environment Variables

### Backend Required Variables
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `AWS_ACCESS_KEY_ID` - AWS access key
- `AWS_SECRET_ACCESS_KEY` - AWS secret key
- `AWS_S3_BUCKET_NAME` - S3 bucket name
- `PAYOS_CLIENT_ID` - PayOS client ID

### Frontend Required Variables
- `REACT_APP_API_BASE_URL` - Backend API URL
- `REACT_APP_DEBUG` - Debug mode flag

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch:**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes:**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch:**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow TypeScript/JavaScript best practices
- Use Prettier for code formatting
- Write descriptive commit messages
- Add tests for new features
- Update documentation as needed

## 🐛 Troubleshooting

### Common Issues

**Backend won't start:**
- Check MongoDB connection
- Verify environment variables
- Ensure all dependencies are installed
- Check port availability (default: 5194)

**Frontend can't connect to backend:**
- Verify backend is running
- Check CORS configuration
- Confirm API URL in frontend .env
- Check network connectivity

**Image upload fails:**
- Verify AWS S3 credentials
- Check bucket permissions
- Ensure file size limits
- Verify file type restrictions

**Payment integration issues:**
- Check PayOS credentials
- Verify webhook URLs
- Test in PayOS sandbox first
- Check transaction logs

## 📝 License

This project is licensed under the ISC License. See the LICENSE file for details.

## 👥 Team

- **Developer**: NNNguyenDuyyy
- **Project**: Visual Try-On Fashion Webapp


