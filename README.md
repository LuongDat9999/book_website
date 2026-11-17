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
