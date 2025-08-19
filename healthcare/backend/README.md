# Healthcare Backend API

Backend API cho ứng dụng Healthcare, được xây dựng với Node.js, Express và MongoDB.

## Cài đặt

1. Clone repository

```bash
git clone <repository-url>
cd healthcare/backend
```

2. Cài đặt dependencies

```bash
npm install
```

3. Cấu hình môi trường

Tạo file `.env` dựa trên file `.env.example` và cấu hình các biến môi trường cần thiết:

```
PORT=8080
MONGODB_URI=mongodb://localhost:27017/healthcare
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
FRONTEND_URL=http://localhost:5173
```

4. Chạy server

```bash
# Chế độ development với nodemon
npm run dev

# Chế độ production
npm start
```

## API Endpoints

### Xác thực

- `POST /api/auth/register` - Đăng ký tài khoản mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/logout` - Đăng xuất
- `GET /api/auth/me` - Lấy thông tin người dùng hiện tại
- `PUT /api/auth/update-profile` - Cập nhật thông tin cá nhân
- `PUT /api/auth/change-password` - Đổi mật khẩu
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `PUT /api/auth/reset-password/:resetToken` - Đặt lại mật khẩu

### Người dùng

- `GET /api/users` - Lấy danh sách người dùng (Admin)
- `GET /api/users/pending-doctors` - Lấy danh sách bác sĩ chờ duyệt (Admin)
- `GET /api/users/doctors` - Lấy danh sách bác sĩ
- `GET /api/users/patients` - Lấy danh sách bệnh nhân (Bác sĩ, Admin)
- `GET /api/users/:id` - Lấy thông tin chi tiết người dùng
- `PUT /api/users/:id` - Cập nhật thông tin người dùng (Admin)
- `PUT /api/users/:id/deactivate` - Vô hiệu hóa tài khoản (Admin)
- `PUT /api/users/:id/activate` - Kích hoạt tài khoản (Admin)

### Bản ghi sức khỏe

- `GET /api/healthLogs` - Lấy danh sách bản ghi sức khỏe của người dùng
- `POST /api/healthLogs` - Tạo bản ghi sức khỏe mới
- `GET /api/healthLogs/stats` - Lấy thống kê sức khỏe
- `GET /api/healthLogs/:id` - Lấy chi tiết bản ghi sức khỏe
- `PUT /api/healthLogs/:id` - Cập nhật bản ghi sức khỏe
- `DELETE /api/healthLogs/:id` - Xóa bản ghi sức khỏe

### Câu hỏi

- `GET /api/questions` - Lấy danh sách câu hỏi của bệnh nhân
- `POST /api/questions` - Tạo câu hỏi mới
- `GET /api/questions/doctor` - Lấy danh sách câu hỏi cho bác sĩ
- `GET /api/questions/:id` - Lấy chi tiết câu hỏi
- `PUT /api/questions/:id` - Cập nhật câu hỏi
- `DELETE /api/questions/:id` - Xóa câu hỏi
- `POST /api/questions/:id/answer` - Bác sĩ trả lời câu hỏi

### Lời khuyên

- `GET /api/advice` - Lấy danh sách lời khuyên cho bệnh nhân
- `GET /api/advice/doctor` - Lấy danh sách lời khuyên của bác sĩ
- `POST /api/advice/doctor` - Bác sĩ tạo lời khuyên mới
- `GET /api/advice/:id` - Lấy chi tiết lời khuyên
- `PUT /api/advice/:id` - Cập nhật lời khuyên
- `DELETE /api/advice/:id` - Xóa lời khuyên
- `PUT /api/advice/:id/read` - Đánh dấu lời khuyên đã đọc

### Thống kê

- `GET /api/stats/admin` - Lấy thống kê cho admin
- `GET /api/stats/doctor` - Lấy thống kê cho bác sĩ
- `GET /api/stats/patient` - Lấy thống kê cho bệnh nhân

## Cấu trúc thư mục

```
├── controllers/       # Xử lý logic nghiệp vụ
├── middleware/        # Middleware xác thực và phân quyền
├── models/            # Mô hình dữ liệu MongoDB
├── routes/            # Định nghĩa API routes
├── .env               # Biến môi trường
├── .gitignore         # Loại trừ file khi commit
├── package.json       # Dependencies và scripts
├── README.md          # Tài liệu hướng dẫn
└── server.js          # Entry point
```

## Công nghệ sử dụng

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Bcrypt.js
- Nodemailer