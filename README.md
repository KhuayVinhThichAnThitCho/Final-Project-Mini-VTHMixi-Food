# 🛵 GrabFood Mini — Nền Tảng Đặt Đồ Ăn Trực Tuyến Đa Nhà Hàng

[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![MySQL](https://img.shields.io/badge/MySQL-00000F?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

**GrabFood Mini** là nền tảng đặt đồ ăn trực tuyến đa nhà hàng (Multi-vendor) hiện đại, được thiết kế và xây dựng theo kiến trúc Client-Server mạnh mẽ. Hệ thống tối ưu hóa quy trình từ khâu duyệt món, đặt hàng, thanh toán trực tuyến qua mã VietQR, quản lý ví điện tử, cho đến tích hợp **AI Co-pilot** thông minh hỗ trợ phân tích kinh doanh (dành cho Nhà hàng) và gợi ý thực đơn, tự động lên giỏ hàng (dành cho Khách hàng).

---

## 🚀 Tính Năng Nổi Bật & Công Nghệ Đột Phá

### 1. 🤖 Hệ Thống Trợ Lý AI Song Hành (Dual AI Agents)
Tích hợp trực tiếp các mô hình ngôn ngữ lớn (Gemini 1.5 Flash / Llama-3.1 qua Groq) để mang lại trải nghiệm thông minh vượt trội:
*   **Vendor Strategy Co-pilot (Trợ lý Chủ quán):** Phân tích dữ liệu kinh doanh real-time (doanh thu, hiệu suất món ăn, feedback khách hàng). AI tự động gọi các tool hệ thống để truy vấn dữ liệu, đưa ra báo cáo chi tiết đi kèm các **đề xuất chiến lược** và **vẽ biểu đồ trực quan (Line/Bar/Pie chart)** trực tiếp trên Dashboard.
*   **Smart Cart & Nutritional Planner (Trợ lý Khách hàng):** Tư vấn món ăn theo nhu cầu dinh dưỡng, số lượng người ăn hoặc giới hạn ngân sách. AI tự tạo ra các combo phù hợp, tự động liên kết và **thêm trực tiếp các món ăn hợp lệ vào giỏ hàng** của người dùng. Có cơ chế validation đối chiếu database tránh AI đề xuất món ảo (hallucination).

### 2. 💳 Thanh Toán VietQR Tự Động (Tích hợp PayOS)
*   Thanh toán không tiền mặt hiện đại. Hệ thống tự động sinh mã VietQR động theo đơn hàng qua PayOS.
*   Trạng thái thanh toán được cập nhật đồng bộ và tức thì thông qua Webhook, đảm bảo tính nhất quán của luồng đơn hàng.

### 3. 🌐 Kiến Trúc Cơ Sở Dữ Liệu Chuyên Nghiệp
*   **MySQL Master-Slave Replication:** Thiết lập mô hình phân tách Đọc/Ghi dữ liệu (Read/Write Splitting), tăng khả năng chịu tải và tính an toàn dữ liệu cho dự án.
*   **Sequelize ORM & Transactions:** Quản lý dữ liệu quan hệ chặt chẽ bằng TypeScript. Sử dụng Database Transactions cho các luồng thanh toán, trừ ví, hoàn tiền để đảm bảo tính toàn vẹn (ACID).
*   **Redis Caching:** Caching dữ liệu lịch sử hội thoại AI và thông tin cấu hình hệ thống, giảm tải cho MySQL và tăng tốc độ phản hồi API đáng kể.

### 4. 🔒 Bảo Mật Hệ Thống & Phân Quyền Sâu (RBAC)
*   **Mã hóa & Xác thực:** Đăng nhập an toàn với JWT (Access Token hạn ngắn + Refresh Token lưu trong HttpOnly Cookie bảo mật cao). Mã hóa mật khẩu bằng `bcrypt` (salt rounds = 12).
*   **Phân quyền (RBAC):** Middleware kiểm tra quyền hạn nghiêm ngặt cho 5 vai trò hệ thống (`Guest`, `User`, `Vendor`, `Manager`, `Admin`).
*   **Xác thực OTP & OAuth 2.0:** Gửi mã OTP kích hoạt tài khoản qua Email (Nodemailer). Hỗ trợ đăng nhập nhanh bằng Google và Facebook.
*   **Rate Limiting:** Phòng chống tấn công Brute Force và Spam API (tối đa 5 lần đăng nhập/phút, 3 lần OTP/5 phút) bằng `express-rate-limit`.

---

## 🛠️ Tech Stack Chi Tiết

| Thành phần | Công nghệ sử dụng | Vai trò / Chi tiết |
| :--- | :--- | :--- |
| **Frontend** | ReactJS + TypeScript + Vite | Khởi tạo nhanh, biên dịch tối ưu, kiểu dữ liệu an toàn. |
| **Styling** | Tailwind CSS + Lucide Icons | Giao diện hiện đại, tối ưu responsive trên mọi thiết bị. |
| **State Management**| Zustand + React Query (TanStack) | Quản lý global state và đồng bộ cache dữ liệu server mượt mà. |
| **Backend** | Node.js + ExpressJS + TypeScript | Xây dựng RESTful API chuyên nghiệp, cấu trúc dạng Layered. |
| **Database** | MySQL (Sequelize ORM) | Lưu trữ quan hệ, quản lý giao dịch tài chính chặt chẽ. |
| **Caching & Queue** | Redis | Caching lịch sử chat AI và tối ưu hóa hiệu năng API. |
| **AI Integration** | Google GenAI SDK / Groq SDK | Triển khai các AI Agents xử lý hội thoại dạng JSON Output. |
| **Payment Gateway**| PayOS SDK | Thanh toán tự động qua mã VietQR. |
| **Realtime** | Socket.io | Thông báo trạng thái đơn hàng và chat thời gian thực. |
| **Media Cloud** | Multer + Cloudinary | Upload và tối ưu hóa hình ảnh món ăn, logo nhà hàng. |

---

## 📁 Cấu Trúc Dự Án

Hệ thống được tổ chức theo cấu trúc Modular và Layered rõ ràng, giúp dễ dàng phát triển và bảo trì:

```text
GrabFood-Mini/
├── backend/                  # MÃ NGUỒN BACKEND (API SERVER)
│   ├── db_setup/             # Cấu hình Master/Slave cho MySQL Replication
│   │   ├── master/           # File cấu hình cnf và SQL khởi tạo cho Master DB
│   │   └── slave/            # File cấu hình cnf cho Slave DB
│   ├── src/
│   │   ├── config/           # Cấu hình DB, Mailer, Redis, Cloudinary, Socket
│   │   ├── controllers/      # Nhận request, định dạng response và gọi service
│   │   ├── middlewares/      # Auth, RBAC, Rate-limit, xử lý lỗi tập trung
│   │   ├── models/           # Định nghĩa các Class Entity (Sequelize-TypeScript)
│   │   ├── repositories/     # Tương tác trực tiếp với Database
│   │   ├── routes/           # Định nghĩa các Route API phân nhóm theo tài nguyên
│   │   ├── services/         # Chứa toàn bộ Business Logic (gồm cả AI Services & Tools)
│   │   ├── utils/            # Các hàm helper: JWT, OTP generator, response format
│   │   ├── validators/       # Schema validate dữ liệu đầu vào bằng Zod
│   │   └── app.ts            # Điểm khởi chạy ứng dụng Express
│   ├── .env.examples         # Mẫu cấu hình môi trường backend
│   ├── Dockerfile            # Cấu hình đóng gói container cho Backend
│   └── package.json
│
├── frontend/                 # MÃ NGUỒN FRONTEND (SPA CLIENT)
│   ├── src/
│   │   ├── assets/           # Hình ảnh tĩnh, logo, icon
│   │   ├── components/       # Các UI Component dùng chung (buttons, inputs, cards...)
│   │   ├── pages/            # Các trang giao diện phân nhóm cụ thể theo vai trò:
│   │   │   ├── guest/        # Trang chủ, Chi tiết nhà hàng, Tìm kiếm
│   │   │   ├── user/         # Giỏ hàng, Đơn hàng, Ví, Trang cá nhân, Chat AI
│   │   │   ├── vendor/       # Dashboard, Quản lý món ăn, Đơn hàng, Ví, Chat AI Copilot
│   │   │   ├── manager/      # Duyệt nhà hàng, Duyệt yêu cầu rút tiền
│   │   │   └── admin/        # Quản trị hệ thống, Quản lý phân quyền, Thống kê doanh thu
│   │   ├── hooks/            # Các Custom Hooks xử lý logic tái sử dụng
│   │   ├── services/         # Các hàm call API sử dụng Axios client
│   │   ├── store/            # Quản lý Global State bằng Zustand
│   │   ├── types/            # Khai báo các Type/Interface TypeScript
│   │   └── routes/           # Cấu hình React Router & Private Routes bảo vệ
│   ├── Dockerfile            # Cấu hình đóng gói container cho Frontend
│   └── package.json
│
└── docker-compose.yml        # Kịch bản chạy toàn bộ hệ thống bằng Docker
```

---

## ⚙️ Hướng Dẫn Cài Đặt & Khởi Chạy

### Cách 1: Khởi chạy nhanh chóng bằng Docker Compose (Khuyên dùng)
Yêu cầu hệ thống đã cài đặt **Docker** và **Docker Compose**. Phương thức này sẽ tự động khởi chạy và cấu hình toàn bộ hệ thống gồm MySQL Master, MySQL Slave, Redis, Backend, và Frontend chỉ với 1 câu lệnh duy nhất.

1.  **Cấu hình môi trường:**
    Sao chép file `.env.examples` ở thư mục gốc thành `.env`:
    ```bash
    cp .env.examples .env
    ```
    Mở file `.env` vừa tạo và điền các API Key của bạn (ví dụ: `GEMINI_API_KEY`, `MAIL_USER`, `MAIL_PASS`...).

2.  **Khởi chạy toàn bộ hệ thống:**
    Tại thư mục gốc của dự án, chạy lệnh:
    ```bash
    docker-compose up --build
    ```
    Docker sẽ tự động tải các image cần thiết, build mã nguồn Frontend/Backend và khởi chạy các container.
    *   **Frontend:** Hoạt động tại địa chỉ [http://localhost:3000](http://localhost:3000)
    *   **Backend API:** Hoạt động tại địa chỉ [http://localhost:5000](http://localhost:5000)
    *   **MySQL Master Port:** `3307`
    *   **MySQL Slave Port:** `3308`
    *   **Redis Port:** `6379`

---

### Cách 2: Khởi chạy thủ công trên môi trường Local

#### Bước 1: Chuẩn bị Cơ sở dữ liệu (MySQL) & Caching (Redis)
1.  Tạo một database trống trong MySQL của bạn có tên là `grabfood_mini`.
2.  Đảm bảo dịch vụ Redis Server đang chạy trên cổng mặc định `6379`.

#### Bước 2: Cài đặt và Khởi chạy Backend
1.  Di chuyển vào thư mục backend:
    ```bash
    cd backend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file cấu hình môi trường `.env` từ file mẫu:
    ```bash
    cp .env.examples .env
    ```
    *Cập nhật đầy đủ thông tin cấu hình MySQL (`DB_USER`, `DB_PASSWORD`), Redis, Cloudinary, PayOS và AI API Keys.*
4.  Khởi chạy server ở chế độ phát triển (Development):
    ```bash
    npm run dev
    ```
    *Hệ thống sẽ tự động tạo bảng (Sequelize Sync) và chèn dữ liệu mẫu (Seeding mock data) nếu phát hiện database trống.*

#### Bước 3: Cài đặt và Khởi chạy Frontend
1.  Mở một Terminal mới và di chuyển vào thư mục frontend:
    ```bash
    cd frontend
    ```
2.  Cài đặt các gói phụ thuộc:
    ```bash
    npm install
    ```
3.  Tạo file `.env` cho Frontend:
    ```bash
    echo "VITE_API_URL=http://localhost:5000/api/v1" > .env
    ```
4.  Khởi chạy ứng dụng Frontend:
    ```bash
    npm run dev
    ```
    *Giao diện người dùng sẽ hiển thị và chạy trên cổng mặc định [http://localhost:3000](http://localhost:3000) (hoặc cổng được Vite chỉ định).*

---

## 📊 Phân Quyền Hệ Thống (RBAC Matrix)

Dự án phân chia nghiệp vụ chặt chẽ qua 5 nhóm quyền hạn:

1.  **Guest (Khách vãng lai):** Duyệt danh sách các nhà hàng, tìm kiếm món ăn, xem menu và các đánh giá công khai.
2.  **User (Khách đặt hàng):** Đăng ký/Đăng nhập (OTP xác thực), quản lý giỏ hàng, áp dụng mã giảm giá, đặt đơn hàng, thanh toán online (VietQR) hoặc ví nội bộ, theo dõi trạng thái đơn hàng theo thời gian thực, viết đánh giá và trò chuyện với trợ lý ảo Smart Cart AI.
3.  **Vendor (Chủ nhà hàng):** Đăng ký gian hàng (chờ phê duyệt), CRUD món ăn, toppings và mã giảm giá cá nhân; quản lý đơn hàng của quán (Xác nhận -> Chuẩn bị -> Hoàn thành); quản lý ví doanh thu, yêu cầu rút tiền; trò chuyện với AI Strategy Copilot phân tích kinh doanh.
4.  **Manager (Điều phối viên):** Phê duyệt/từ chối yêu cầu đăng ký gian hàng mới của Vendor; duyệt các yêu cầu rút tiền của Vendor; quản lý và ẩn các đánh giá/bình luận vi phạm tiêu chuẩn cộng đồng.
5.  **Admin (Quản trị cao cấp):** Toàn quyền kiểm soát hệ thống, quản lý người dùng, ghi nhận nhật ký hệ thống (Admin Logs), phân vai trò (RBAC configuration), cấu hình phí sàn dịch vụ (Platform fee) và theo dõi biểu đồ doanh thu toàn bộ nền tảng.

---

## 🔒 Thiết Kế API Chuẩn Hóa

*   **Base URL:** `/api/v1`
*   **Header xác thực:** `Authorization: Bearer <access_token>`
*   **Định dạng phản hồi chuẩn (Standard JSON Response):**
    ```json
    {
      "success": true,
      "message": "Mô tả trạng thái thành công/thất bại",
      "data": { ... },
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 100
      }
    }
    ```

### Một số API Endpoints chính:
*   `POST /auth/register` & `/auth/login`: Đăng ký, gửi OTP, đăng nhập nhận JWT.
*   `POST /orders`: Tạo đơn hàng mới từ giỏ hàng (áp dụng mã giảm giá & xử lý thanh toán).
*   `GET /restaurants/:id/menu`: Lấy thực đơn của nhà hàng được phân loại theo danh mục.
*   `POST /vendor/wallet/withdraw`: Vendor tạo yêu cầu rút tiền từ số dư ví doanh thu.
*   `POST /ai/vendor/analyze`: Giao tiếp với AI Strategy Co-pilot (phân tích dữ liệu kinh doanh của quán).
*   `POST /ai/customer/chat`: Giao tiếp với AI Smart Cart (hỏi đáp món ăn, lên thực đơn và tự động thêm vào giỏ).

---

## 👥 Thành Viên Nhóm Thực Hiện (Nhóm 3 Người)

*   **The Vinh (Backend Lead):** Phụ trách thiết kế Database Schema, Cấu hình Master-Slave replication, Thiết lập bảo mật Auth/RBAC, Luồng xử lý Đơn hàng (Order Flow), Quản lý Ví điện tử, Xây dựng API Analytics và viết tài liệu API.
*   **LV Thuy (Frontend Lead):** Phụ trách phát triển UI/UX cho tất cả các giao diện người dùng (Guest, User, Vendor), Cấu hình React Router, Quản lý State tập trung (Zustand & React Query), Tích hợp gọi API từ backend và vẽ biểu đồ dashboard.
*   **Van Hieu (Fullstack Support):** Thiết kế giao diện Manager/Admin, Tích hợp cổng thanh toán VietQR (PayOS), Cấu hình Nodemailer gửi OTP, Tích hợp Cloudinary upload ảnh, Xây dựng module AI Agent, Viết kịch bản Docker-compose và triển khai hệ thống.

---
*Dự án GrabFood Mini được xây dựng nhằm đáp ứng yêu cầu môn học Đồ Án Cuối Kỳ, hướng tới sản phẩm đạt chuẩn chất lượng cao về cả tính năng, kiến trúc hệ thống lẫn khả năng ứng dụng thực tế.*
