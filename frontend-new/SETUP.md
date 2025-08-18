# Frontend Setup Instructions

## 1. Cài đặt dependencies

```bash
npm install
```

## 2. Cấu hình môi trường

Copy file `env.example` thành `.env` và cập nhật các giá trị:

```bash
cp env.example .env
```

Cập nhật file `.env`:

```env
# API Configuration
REACT_APP_API_BASE_URL=http://localhost:5194/api
REACT_APP_DEBUG=true

# Backend port (adjust if different)
REACT_APP_BACKEND_PORT=5194
```

## 3. Khởi chạy ứng dụng

```bash
npm run dev
```

Ứng dụng sẽ chạy tại: http://localhost:3000

## 4. Kiểm tra kết nối backend

Trước khi chạy frontend, đảm bảo:

1. Backend đang chạy trên port 5194
2. Database MongoDB đã được kết nối
3. CORS đã được cấu hình đúng trong backend

## 5. Test Authentication

1. Truy cập `/register` để tạo tài khoản mới
2. Truy cập `/login` để đăng nhập
3. Truy cập `/profile` để xem thông tin cá nhân (cần đăng nhập)
4. Truy cập `/admin` để quản trị (cần quyền admin)

## 6. Troubleshooting

### Lỗi kết nối API:
- Kiểm tra backend có đang chạy không
- Kiểm tra port trong file `.env`
- Kiểm tra CORS configuration trong backend

### Lỗi form validation:
- Đảm bảo field names khớp với backend schema
- Kiểm tra validation rules trong form

### Lỗi authentication:
- Kiểm tra JWT tokens trong localStorage
- Kiểm tra API endpoints trong constants
