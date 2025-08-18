# ABDA Backend API

Backend API service for ABDA Web Application built with Express.js and TypeScript.

## 🚀 Technologies

- Node.js
- Express.js
- TypeScript
- MongoDB
- JWT Authentication
- Docker

## 📋 Prerequisites

- Node.js (v20 or higher)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)
- MongoDB (local or remote)

## 🔧 Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=your_mongodb_connection_string

# JWT Configuration
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_jwt_refresh_secret

# Email Configuration (AWS SES)
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
```

## 🛠️ Installation

### Local Development

1. Clone the repository:

```bash
git clone <repository-url>
cd Backend
```

2. Install dependencies:

```bash
npm install
```

3. Start development server:

```bash
npm run dev
```

### Docker Deployment

#### Local Development (Mac M1/M2)

1. Build and run using Docker Compose:

```bash
# Build for local development (ARM64)
docker-compose up -d
```

2. To rebuild the container after changes:

```bash
docker-compose up -d --build
```

3. To stop the container:

```bash
docker-compose down
```

#### Production Deployment (Linux AMD64)

1. Build multi-architecture image:

```bash
# Build for both ARM64 (M1/M2) and AMD64 (Linux)
docker buildx build --platform linux/amd64,linux/arm64 -t abda-backend:latest .
```

2. Push to Docker Hub (optional):

```bash
# Login to Docker Hub
docker login

# Tag your image
docker tag abda-backend:latest yourusername/abda-backend:latest

# Push to Docker Hub
docker push yourusername/abda-backend:latest
```

3. Deploy to Linux server:

```bash
# SSH into your Linux server
ssh user@your-server

# Pull the image (if using Docker Hub)
docker pull yourusername/abda-backend:latest

# Run using docker-compose
docker-compose up -d
```

#### Docker Commands

```bash
# Build and start containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Rebuild containers
docker-compose up -d --build

# Check container architecture
docker inspect abda-backend | grep Architecture
```

## 📚 API Endpoints

### Authentication

- `POST /users/register` - Register new user
- `POST /users/login` - User login
- `POST /users/logout` - User logout
- `POST /users/refresh-token` - Refresh access token
- `GET /users/me` - Get current user info

### Email Verification

- `POST /users/verify-email` - Verify email
- `POST /users/resend-verify-email` - Resend verification email

### Password Management

- `POST /users/forgot-password` - Request password reset
- `POST /users/reset-password` - Reset password

### OAuth

- `GET /users/oauth/google` - Google OAuth login

## 🏗️ Project Structure

```
src/
├── controllers/     # Route controllers
├── middlewares/     # Custom middlewares
├── models/         # Database models
├── routes/         # API routes
├── services/       # Business logic
├── utils/          # Utility functions
└── index.ts        # Application entry point
```

## 🧪 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript code
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run prettier` - Check code formatting
- `npm run prettier:fix` - Fix code formatting

## 🔐 Security Features

- JWT Authentication
- Password hashing
- CORS enabled
- Helmet security headers
- Rate limiting
- Input validation

## 📦 Docker Configuration

The project includes Docker configuration for containerized deployment:

- `Dockerfile` - Container configuration
- `docker-compose.yml` - Multi-container setup

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the ISC License.
