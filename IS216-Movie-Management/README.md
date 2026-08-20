# IS216 Movie Management Project

## Overview

Đây là dự án quản lý rạp chiếu phim được xây dựng theo kiến trúc Monorepo, bao gồm toàn bộ mã nguồn Frontend, Backend và cấu hình cơ sở dữ liệu trong cùng một repository.

### Công nghệ sử dụng

| Thành phần       | Công nghệ         |
| ---------------- | ----------------- |
| Frontend         | React + Vite      |
| Backend          | Spring Boot + JPA |
| Database         | PostgreSQL        |
| Containerization | Docker Compose    |
| Package Manager  | npm               |

### Cấu trúc dự án

```text
project-root/
├── apps/
│   ├── website/      # Frontend React + Vite
│   └── server/       # Backend Spring Boot
├── docker-compose.yml
├── package.json
└── ...
```

---

# 1. Prerequisites

Trước khi chạy dự án, hãy đảm bảo máy tính của bạn đã cài đặt đầy đủ các công cụ sau:

### Node.js

Frontend của dự án được xây dựng bằng React và Vite, đồng thời toàn bộ monorepo sử dụng npm để quản lý package.

Yêu cầu:

```text
Node.js 20+
npm đi kèm với Node.js
```

Tải tại:

https://nodejs.org

---

### Java Development Kit (JDK)

Backend được phát triển bằng Spring Boot và yêu cầu Java 21.

Yêu cầu:

```text
Java 21
```

Kiểm tra:

```bash
java -version
```

---

### PostgreSQL

Hệ thống sử dụng PostgreSQL làm cơ sở dữ liệu chính.

Yêu cầu:

```text
PostgreSQL 15+
```

Nếu sử dụng Docker Compose thì PostgreSQL sẽ được khởi tạo tự động và không cần cài đặt thủ công.

---

### Docker Desktop

Docker được sử dụng để chạy các service phụ trợ như Database.

Tải tại:

https://www.docker.com/products/docker-desktop

Đảm bảo Docker Desktop đang hoạt động trước khi chạy dự án.

---

## Kiểm tra môi trường

Sau khi cài đặt xong, chạy các lệnh sau để xác nhận:

```bash
node -v
npm -v
java -version
psql --version
docker --version
```

Nếu tất cả các lệnh đều trả về phiên bản tương ứng thì môi trường đã sẵn sàng.

---

# 2. Cài đặt và chạy dự án

## Bước 1: Clone source code

```bash
git clone <repository-url>
cd <repository-name>
```

---

## Bước 2: Cài đặt dependencies

Tại thư mục gốc của dự án:

```bash
npm install
```

Lệnh này sẽ cài đặt toàn bộ dependencies cần thiết cho monorepo.

---

## Bước 3: Khởi động Docker

Mở Docker Desktop và đợi đến khi Docker chạy hoàn toàn.

Sau đó khởi động các container:

```bash
docker compose up -d
```

Giải thích:

* `up`: khởi động các service.
* `-d`: chạy dưới nền (detached mode).

Kiểm tra trạng thái:

```bash
docker ps
```

Nếu container PostgreSQL xuất hiện trong danh sách nghĩa là database đã hoạt động.

---

## Bước 4: Chạy Frontend và Backend

Tại thư mục gốc của dự án:

```bash
npm run dev
```

Lệnh này sẽ khởi động:

* Frontend React/Vite
* Backend Spring Boot

Sau khi chạy thành công:

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:8080
```

*(Có thể khác tùy cấu hình của dự án.)*

---

# 3. Git Hooks và Quy tắc Commit

Dự án sử dụng Husky để đảm bảo chất lượng source code trước khi commit.

## Pre-commit Hook

Trước mỗi lần commit, hệ thống sẽ tự động:

### lint-staged

Chỉ kiểm tra những file vừa được chỉnh sửa thay vì toàn bộ dự án.

### prettier

Tự động format code theo coding convention của nhóm.

Ví dụ:

```bash
git add .
git commit -m "feat: add movie booking flow"
```

Nếu source code không đạt tiêu chuẩn, commit sẽ bị từ chối.

---

## Conventional Commits

Commit message phải tuân theo chuẩn Conventional Commits.

Cú pháp:

```text
<type>: <description>
```

Ví dụ:

```bash
feat: add seat selection page
fix: resolve login validation bug
refactor: simplify booking service
docs: update README
style: format source code
test: add booking service tests
```

Các loại commit thường dùng:

| Type     | Ý nghĩa                                  |
| -------- | ---------------------------------------- |
| feat     | Thêm tính năng mới                       |
| fix      | Sửa lỗi                                  |
| refactor | Cải thiện code, không thay đổi chức năng |
| docs     | Cập nhật tài liệu                        |
| style    | Format code                              |
| test     | Thêm hoặc chỉnh sửa test                 |
| chore    | Công việc bảo trì khác                   |

---

# 4. Troubleshooting

Nếu gặp lỗi trong quá trình chạy dự án, hãy tham khảo các hướng dẫn dưới đây.

## Port Already In Use

Triệu chứng:

```text
Address already in use
Port xxxx is already occupied
```

Kiểm tra tiến trình đang sử dụng cổng:

Windows:

```bash
netstat -ano | findstr :8080
```

Linux/macOS:

```bash
lsof -i :8080
```

Sau đó dừng tiến trình đang chiếm cổng hoặc thay đổi port cấu hình.

---

## Database Connection Error

Triệu chứng:

```text
Cannot connect to database
Connection refused
```

Các bước kiểm tra:

1. Đảm bảo Docker Desktop đang chạy.
2. Kiểm tra container PostgreSQL:

```bash
docker ps
```

3. Khởi động lại database:

```bash
docker compose restart
```

4. Nếu vẫn lỗi:

```bash
docker compose down
docker compose up -d
```

---

## Frontend Dependency Issues

Triệu chứng:

```text
Module not found
Dependency conflict
```

Xóa thư mục dependencies và cài đặt lại:

```bash
rm -rf node_modules
npm install
```

Windows:

```bash
rmdir /s node_modules
npm install
```

---

## Gradle Build Issues

Nếu Backend gặp lỗi build:

```bash
./gradlew clean
./gradlew build
```

Hoặc:

```bash
./gradlew bootRun
```

Kiểm tra:

* Phiên bản Java có đúng là Java 21 hay không.
* Biến môi trường JAVA_HOME đã được cấu hình chính xác chưa.

---

# 5. Development Workflow

Quy trình làm việc được khuyến nghị:

1. Pull code mới nhất từ nhánh chính.

```bash
git pull origin main
```

2. Tạo nhánh mới cho task.

```bash
git checkout -b feature/movie-booking
```

3. Thực hiện thay đổi.

4. Commit theo Conventional Commit.

```bash
git commit -m "feat: add booking confirmation popup"
```

5. Push lên remote.

```bash
git push origin feature/movie-booking
```

6. Tạo Pull Request để review và merge.

---

# 6. Additional Notes

* Luôn chạy `npm install` sau khi pull các thay đổi mới.
* Không commit các file môi trường (`.env`) chứa thông tin nhạy cảm.
* Không sửa trực tiếp trên nhánh `main`.
* Đảm bảo dự án build thành công trước khi tạo Pull Request.
* Luôn đọc log lỗi đầy đủ trước khi xử lý sự cố.

Happy Coding! 🚀
