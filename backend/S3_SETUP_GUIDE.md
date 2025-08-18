# S3 Image Upload Setup Guide

## Vấn đề Permission Access và Cách Giải Quyết

### Các Nguyên Nhân Chính

1. **Bucket chưa được cấu hình public read access**
2. **Block Public Access được bật**
3. **Bucket Policy chưa được thiết lập**
4. **ACL permissions không đúng**

### Giải Pháp Đã Được Cập Nhật

#### 1. Cải thiện Logic Upload

- **Fallback mechanism**: Thử upload với ACL public-read, nếu thất bại sẽ upload private và tạo presigned URL
- **Auto-detection**: Kiểm tra URL có thể truy cập công khai không
- **Presigned URLs**: Tạo URL có thời hạn cho các file private

#### 2. New API Endpoints

```bash
# Upload single image (improved)
POST /api/images/upload

# Upload multiple images (improved)
POST /api/images/upload-multiple

# Get presigned URL for existing image
GET /api/images/presigned/:key?expiresIn=3600

# Get bucket policy template
GET /api/images/bucket-policy
```

#### 3. Response Format Cải Tiến

```json
{
  "message": "Image uploaded successfully",
  "result": {
    "url": "https://bucket.s3.region.amazonaws.com/images/123-abc.jpg",
    "key": "images/123-abc.jpg",
    "originalName": "photo.jpg",
    "size": 102400,
    "mimeType": "image/jpeg",
    "isPublic": true // hoặc false nếu dùng presigned URL
  }
}
```

### Cấu Hình S3 Bucket Để Fix Permission

#### Bước 1: Tắt Block Public Access

1. Vào S3 Console → Chọn bucket
2. Permissions tab → Block public access
3. Edit → Uncheck tất cả options → Save

#### Bước 2: Thiết Lập Bucket Policy

1. Permissions tab → Bucket policy
2. Edit → Paste policy sau:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": ["s3:GetObject"],
      "Resource": ["arn:aws:s3:::YOUR_BUCKET_NAME/*"]
    }
  ]
}
```

_Thay `YOUR_BUCKET_NAME` bằng tên bucket thực tế_

#### Bước 3: Kiểm Tra IAM Permissions

Đảm bảo AWS credentials có quyền:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl", "s3:GetObject", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

### Environment Variables Required

```bash
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_bucket_name
```

### Testing the Fixed Upload

#### Test Upload API:

```bash
curl -X POST http://localhost:4000/api/images/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "image=@path/to/your/image.jpg"
```

#### Expected Success Response:

```json
{
  "message": "Image uploaded successfully",
  "result": {
    "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abc123.jpg",
    "key": "images/1234567890-abc123.jpg",
    "originalName": "image.jpg",
    "size": 102400,
    "mimeType": "image/jpeg",
    "isPublic": true
  }
}
```

#### If Public Access Fails (Fallback):

```json
{
  "message": "Image uploaded successfully (presigned URL)",
  "result": {
    "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abc123.jpg?X-Amz-Algorithm=...",
    "directUrl": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abc123.jpg",
    "key": "images/1234567890-abc123.jpg",
    "isPublic": false,
    "note": "Using presigned URL due to bucket permissions. Consider updating bucket policy for public access."
  }
}
```

### Troubleshooting

1. **AccessDenied errors**: Kiểm tra IAM permissions và bucket policy
2. **NoSuchBucket**: Kiểm tra tên bucket và region
3. **SignatureDoesNotMatch**: Kiểm tra AWS credentials
4. **URL không accessible**: Kiểm tra bucket public access settings

### Utility Endpoints

- `GET /api/images/bucket-policy` - Lấy template bucket policy
- `GET /api/images/presigned/:key` - Tạo presigned URL cho ảnh đã tồn tại

Với các cải tiến này, hệ thống sẽ tự động handle permission issues và fallback sang presigned URLs khi cần thiết.
