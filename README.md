# Mộc Miên Books

## Nạp 20 sách vào Supabase

1. Chạy `supabase/books.sql` trong Supabase SQL Editor.
2. Sao chép `.env.example` thành `.env` và điền Google Books API key cùng Supabase service-role key. Không đưa `.env` lên Git.
3. Chạy một lần:

```bash
set -a; source .env; set +a
node scripts/import-google-books.mjs
```

Script mặc định nhập tối đa 5 sách mỗi lần chạy (`BATCH_SIZE=5`), bỏ qua các mã sách đã có và dừng sau tổng cộng 20 sách. Nếu một batch chưa đủ, script không ghi batch dở dang vào Supabase. Website chỉ đọc dữ liệu đã lưu trong bảng `books` của Supabase; trình duyệt không gọi Google Books API.

## Nạp thống kê Google Analytics 4

Báo cáo GA4 được tạo bằng Node.js trong GitHub Actions, không đưa service-account key xuống trình duyệt.

1. Trong GA4 vào **Admin → Property access management**, thêm email `client_email` trong `credentials.json` với quyền **Viewer** cho Property `16357193074`.
2. Trong GitHub repository vào **Settings → Secrets and variables → Actions**, tạo secret `GA_SERVICE_ACCOUNT_JSON` bằng toàn bộ nội dung `credentials.json`, cùng `GA_PROPERTY_ID` là mã Property GA4.
3. Chạy workflow **Update GA4 Statistics (Node.js)**. Workflow sẽ tạo `data.json` ở thư mục gốc và tự commit file này; trang quản trị đọc file tĩnh sau khi admin đăng nhập, không cần OAuth trên trình duyệt.
4. Workflow **Deploy static content to Pages** sẽ triển khai `data.json` lên GitHub Pages. Workflow cập nhật thống kê chạy mỗi 2 giờ; không commit `credentials.json` hoặc private key vào Git.
