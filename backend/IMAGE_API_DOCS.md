# Image Upload API Documentation

## Overview

API endpoints for uploading and managing images to AWS S3 storage.

## Prerequisites

1. AWS S3 bucket configured
2. AWS credentials with S3 access permissions
3. Environment variables set up (see `.env.example`)

## Environment Variables Required

```env
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your_s3_bucket_name
```

## API Endpoints

### 1. Upload Single Image

**POST** `/api/images/upload`

Upload a single image file to S3.

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Form Data:**

- `image`: Image file (max 5MB, images only)

**Response:**

```json
{
  "message": "Image uploaded successfully",
  "result": {
    "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abcdef.jpg",
    "key": "images/1234567890-abcdef.jpg",
    "originalName": "photo.jpg",
    "size": 1024576,
    "mimeType": "image/jpeg"
  }
}
```

### 2. Upload Multiple Images

**POST** `/api/images/upload-multiple`

Upload multiple images to S3 (max 10 files).

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Form Data:**

- `images`: Array of image files (max 5MB each, max 10 files)

**Response:**

```json
{
  "message": "Images uploaded successfully",
  "result": [
    {
      "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abcdef.jpg",
      "key": "images/1234567890-abcdef.jpg",
      "originalName": "photo1.jpg",
      "size": 1024576,
      "mimeType": "image/jpeg"
    },
    {
      "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567891-ghijkl.png",
      "key": "images/1234567891-ghijkl.png",
      "originalName": "photo2.png",
      "size": 2048576,
      "mimeType": "image/png"
    }
  ]
}
```

### 3. Delete Image by Key

**DELETE** `/api/images/delete/:key`

Delete an image from S3 using its key.

**Headers:**

- `Authorization: Bearer <access_token>`

**URL Parameters:**

- `key`: The S3 key of the image (URL encoded)

**Example:**

```
DELETE /api/images/delete/images%2F1234567890-abcdef.jpg
```

**Response:**

```json
{
  "message": "Image deleted successfully"
}
```

### 4. Delete Image by URL

**DELETE** `/api/images/delete-by-url`

Delete an image from S3 using its public URL.

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: application/json`

**Request Body:**

```json
{
  "url": "https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abcdef.jpg"
}
```

**Response:**

```json
{
  "message": "Image deleted successfully"
}
```

## Product-specific Image Endpoints

### 5. Upload Product Image

**POST** `/api/products/upload-image`

Upload a single image for a product.

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Form Data:**

- `image`: Image file

### 6. Upload Multiple Product Images

**POST** `/api/products/upload-images`

Upload multiple images for a product.

**Headers:**

- `Authorization: Bearer <access_token>`
- `Content-Type: multipart/form-data`

**Form Data:**

- `images`: Array of image files

## Error Responses

### File Size Error

```json
{
  "message": "File size too large. Maximum size is 5MB"
}
```

### File Type Error

```json
{
  "message": "Only image files are allowed"
}
```

### File Count Error

```json
{
  "message": "Too many files. Maximum is 10 files"
}
```

### No File Error

```json
{
  "message": "No file uploaded"
}
```

### S3 Upload Error

```json
{
  "message": "Failed to upload image to S3",
  "error": "Detailed error message"
}
```

## Usage Examples

### Using curl

#### Upload single image:

```bash
curl -X POST \
  -H "Authorization: Bearer your_access_token" \
  -F "image=@/path/to/your/image.jpg" \
  http://localhost:4000/api/images/upload
```

#### Upload multiple images:

```bash
curl -X POST \
  -H "Authorization: Bearer your_access_token" \
  -F "images=@/path/to/image1.jpg" \
  -F "images=@/path/to/image2.png" \
  http://localhost:4000/api/images/upload-multiple
```

#### Delete image by URL:

```bash
curl -X DELETE \
  -H "Authorization: Bearer your_access_token" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://your-bucket.s3.us-east-1.amazonaws.com/images/1234567890-abcdef.jpg"}' \
  http://localhost:4000/api/images/delete-by-url
```

### Using JavaScript/Frontend

```javascript
// Upload single image
const uploadSingleImage = async (file, accessToken) => {
  const formData = new FormData()
  formData.append('image', file)

  const response = await fetch('/api/images/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  })

  return await response.json()
}

// Upload multiple images
const uploadMultipleImages = async (files, accessToken) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append('images', file)
  })

  const response = await fetch('/api/images/upload-multiple', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: formData
  })

  return await response.json()
}

// Delete image by URL
const deleteImageByUrl = async (imageUrl, accessToken) => {
  const response = await fetch('/api/images/delete-by-url', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: imageUrl })
  })

  return await response.json()
}
```

## Notes

1. All image endpoints require authentication via access token
2. Supported image formats: JPEG, PNG, GIF, WebP, etc.
3. Maximum file size: 5MB per image
4. Maximum number of files in batch upload: 10
5. Images are stored with unique keys to prevent conflicts
6. Uploaded images are publicly accessible via their S3 URLs
7. Image keys are generated with timestamp and random string for uniqueness
