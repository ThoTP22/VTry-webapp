# Deployment Guide

## Environment Variables for Production

### Backend (.env)

```bash
# Database
DB_USERNAME=your_production_db_username
DB_PASSWORD=your_production_db_password
DB_NAME=your_production_db_name

# JWT Secrets
JWT_SECRET=your_production_jwt_secret
REFRESH_TOKEN_SECRET=your_production_refresh_secret

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_REGION=your_aws_region
AWS_S3_BUCKET_NAME=your_s3_bucket

# PayOS
PAYOS_CLIENT_ID=your_payos_client_id
PAYOS_API_KEY=your_payos_api_key
PAYOS_CHECKSUM_KEY=your_payos_checksum_key

# URLs (IMPORTANT: Update these for production)
FRONTEND_URL=https://yourdomain.com
PAYOS_WEBHOOK_URL=https://your-backend-domain.com/api/payments/webhook

# Port
PORT=5194
```

### Frontend (.env)

```bash
# Backend API URL (update for production)
REACT_APP_BACKEND_URL=https://your-backend-domain.com

# PayOS (if needed on frontend)
REACT_APP_PAYOS_CLIENT_ID=your_payos_client_id
```

## Deployment Steps

### 1. Backend Deployment

1. **Set Environment Variables:**
   - Update `FRONTEND_URL` to your production frontend domain
   - Update `PAYOS_WEBHOOK_URL` to your production backend domain
   - Set all database and AWS credentials

2. **Deploy Backend:**
   ```bash
   npm install
   npm run build
   npm start
   ```

### 2. Frontend Deployment

1. **Set Environment Variables:**
   - Update `REACT_APP_BACKEND_URL` to your production backend domain

2. **Build and Deploy:**
   ```bash
   npm install
   npm run build
   # Deploy build folder to your hosting service
   ```

### 3. PayOS Configuration

1. **Update PayOS Dashboard:**
   - Login to PayOS dashboard
   - Update webhook URL to: `https://your-backend-domain.com/api/payments/webhook`
   - Update return URL to: `https://yourdomain.com/payment/success`
   - Update cancel URL to: `https://yourdomain.com/payment/cancel`

### 4. Database Setup

1. **MongoDB:**
   - Create production database
   - Update connection string in environment variables
   - Run any necessary migrations

### 5. AWS S3 Setup

1. **Create S3 Bucket:**
   - Create production S3 bucket
   - Set up CORS policy for your frontend domain
   - Update bucket name in environment variables

## Important Notes

- **Never commit `.env` files to git**
- **Always use HTTPS in production**
- **Set up proper CORS policies**
- **Configure rate limiting and security middleware**
- **Set up monitoring and logging**
- **Use PM2 or similar process manager for backend**

## Common Issues

1. **PayOS redirects to localhost:** Update `FRONTEND_URL` environment variable
2. **CORS errors:** Update CORS configuration in backend
3. **Image upload fails:** Check AWS S3 credentials and bucket permissions
4. **Database connection fails:** Verify MongoDB connection string and network access

## Security Checklist

- [ ] All environment variables are set correctly
- [ ] No hardcoded URLs or credentials in code
- [ ] HTTPS is enabled
- [ ] CORS is properly configured
- [ ] JWT secrets are strong and unique
- [ ] Database access is restricted
- [ ] S3 bucket has proper permissions
- [ ] Rate limiting is enabled
- [ ] Input validation is in place
