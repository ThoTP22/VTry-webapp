# AWS S3 Image Upload Implementation - Setup Instructions

## 📋 Overview

Tôi đã tạo thành công chức năng upload và delete hình ảnh từ AWS S3 storage cho backend API. Hệ thống bao gồm:

## 🚀 Các tính năng đã implement:

1. **Upload đơn ảnh** - `/api/images/upload`
2. **Upload nhiều ảnh** - `/api/images/upload-multiple`
3. **Xóa ảnh bằng key** - `/api/images/delete/:key`
4. **Xóa ảnh bằng URL** - `/api/images/delete-by-url`
5. **Upload ảnh cho sản phẩm** - `/api/products/upload-image` và `/api/products/upload-images`

## 📁 Files đã tạo/chỉnh sửa:

### Các file mới:

- `src/services/s3.services.ts` - Service xử lý AWS S3
- `src/controllers/image.controllers.ts` - Controllers cho image APIs
- `src/middlewares/image.middlewares.ts` - Middleware cho file upload
- `src/routes/images.routes.ts` - Routes cho image APIs
- `src/models/requests/Images.requests.ts` - Types cho image requests
- `IMAGE_API_DOCS.md` - Tài liệu API đầy đủ
- `.env.example` - Example environment variables
- `test-s3-config.ts` - Script test cấu hình S3

### Các file đã chỉnh sửa:

- `src/index.ts` - Thêm image routes
- `src/routes/products.routes.ts` - Thêm product image upload routes
- `package.json` - Thêm dependencies

## 🛠 Setup Instructions:

### 1. Install dependencies (đã hoàn thành):

```bash
npm install @aws-sdk/client-s3 multer @types/multer
```

### 2. Cấu hình AWS S3:

1. Tạo S3 bucket trên AWS Console
2. Tạo IAM user với quyền S3 access
3. Lấy Access Key ID và Secret Access Key

### 3. Cập nhật file .env:

```env
# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

### 4. Test cấu hình S3:

```bash
npx ts-node test-s3-config.ts
```

### 5. Chạy server:

```bash
npm run dev
```

## 🔧 Cách sử dụng APIs:

### Upload đơn ảnh:

```bash
curl -X POST \
  -H "Authorization: Bearer your_access_token" \
  -F "image=@/path/to/image.jpg" \
  http://localhost:4000/api/images/upload
```

### Upload nhiều ảnh:

```bash
curl -X POST \
  -H "Authorization: Bearer your_access_token" \
  -F "images=@image1.jpg" \
  -F "images=@image2.png" \
  http://localhost:4000/api/images/upload-multiple
```

### Xóa ảnh bằng URL:

```bash
curl -X DELETE \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://bucket.s3.region.amazonaws.com/images/filename.jpg"}' \
  http://localhost:4000/api/images/delete-by-url
```

## 📄 Tài liệu chi tiết:

- Xem file `IMAGE_API_DOCS.md` để có tài liệu API đầy đủ với examples
- Các response formats, error handling, và frontend integration examples

## 🎯 Các tính năng chính:

- ✅ Authentication required (access token)
- ✅ File validation (chỉ accept image files)
- ✅ File size limit (5MB per file)
- ✅ Unique file naming (timestamp + random string)
- ✅ Public URL access cho uploaded images
- ✅ Error handling đầy đủ
- ✅ TypeScript support
- ✅ Multer integration for file handling
- ✅ Product-specific image upload routes

## 🚦 Next Steps:

1. Cấu hình AWS credentials trong `.env`
2. Test APIs với Postman hoặc frontend
3. Có thể thêm image resizing/optimization nếu cần
4. Có thể thêm image metadata storage vào database

Hệ thống đã sẵn sàng sử dụng! 🎉
