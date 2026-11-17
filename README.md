# Mộc Miên Books

Website mô phỏng hoạt động giới thiệu, tìm hiểu và gửi yêu cầu mua sách trực tuyến. Dự án phục vụ nguyên mẫu học tập, không thực hiện thanh toán thật.
Mở trang website book shop Mộc Miên:

**https://luongdat9999.github.io/book_website/**
## Mục tiêu và đối tượng

- Đối tượng: sinh viên, người đi làm và người đọc muốn tìm sách được chọn lọc.
- Giá trị cung cấp: xem thông tin sách, đọc review, tham khảo nội dung và gửi yêu cầu mua/liên hệ.
- Nguồn tham khảo dữ liệu sách: Google Books và Fahasa.
- Nền tảng triển khai: GitHub Pages.

## Chức năng chính

- Trang chủ và điều hướng đến các khu vực: Sách, Góc đọc, Giới thiệu, Liên hệ.
- Danh sách 20 sách: ảnh bìa, nhan đề, tác giả, nhà xuất bản, năm xuất bản, giá tham khảo và mô tả ngắn.
- Tìm kiếm theo tên/tác giả, lọc thể loại, sắp xếp theo giá hoặc tên.
- Trang chi tiết sách và trang chi tiết bài viết.
- Góc đọc gồm tối thiểu 8 bài viết/review.
- Giỏ hàng mô phỏng: thêm sách, tăng/giảm số lượng, xóa sách và chuyển nội dung sang biểu mẫu yêu cầu mua.
- Biểu mẫu liên hệ/đặt mua thử nghiệm lưu dữ liệu vào Supabase; không yêu cầu thông tin thanh toán hoặc dữ liệu nhạy cảm.
- Trang quản trị mẫu để quản lý sách, bài viết, yêu cầu liên hệ và xem báo cáo thống kê lượng truy cập GA4.
- Trang chính sách bản quyền và quyền riêng tư.

## Hướng dẫn sử dụng trang quản trị

Mở trang quản trị tại:

**https://luongdat9999.github.io/book_website/admin**

Tài khoản đăng nhập được cung cấp riêng cho người chấm hoặc người quản lý website. Không chia sẻ thông tin đăng nhập công khai trong tài liệu hoặc trên mạng xã hội.

Tên đăng nhập hiện tại: `admin`. Mật khẩu được gửi riêng, không ghi trong README để tránh lộ tài khoản quản trị.

Sau khi đăng nhập, có thể sử dụng các khu vực sau:

### Thêm và quản lý sách

1. Chọn mục **Sách**.
2. Điền tên sách, tác giả, nhà xuất bản, năm xuất bản, giá tham khảo, thể loại và mô tả.
3. Chọn ảnh bìa rồi bấm **Lưu sách**.
4. Sách mới sẽ xuất hiện trong danh mục trên trang chủ. Danh sách bên dưới cho phép xem hoặc xóa sách.

### Thêm bài viết hoặc review

1. Chọn mục **Bài viết**.
2. Nhập tiêu đề, loại nội dung, tóm tắt và nội dung bài viết.
3. Có thể chọn thêm ảnh minh họa.
4. Bấm **Lưu bài viết** để bài viết xuất hiện trong mục **Góc đọc** trên trang chủ.

### Xem yêu cầu mua và liên hệ

Trong mục **Đơn đặt / Liên hệ**, người quản trị có thể xem tên, email và nội dung khách gửi từ biểu mẫu. Trạng thái yêu cầu có thể đổi thành **Mới**, **Đã xác nhận** hoặc **Từ chối**.

### Xem thống kê truy cập GA4

Trong mục **Google Analytics**, người quản trị có thể xem:

- Số phiên truy cập trong 30 ngày 

Số liệu được cập nhật tự động từ Google Analytics 4 (dữ liệu được cập sau mỗi 2 tiếng do giới hạn về chi phí). 
Đây là trang quản trị phục vụ nguyên mẫu học tập, không nên dùng để quản lý dữ liệu thương mại thật.


## Kiểm thử nghiệm thu

Thực hiện trên URL GitHub Pages trong cửa sổ ẩn danh:

1. Kiểm tra menu Trang chủ, Sách, Góc đọc, Giới thiệu, Liên hệ và các liên kết ở chân trang.
2. Mở trang chi tiết sách và bài viết; xác nhận không có trang rỗng hoặc liên kết hỏng.
3. Thêm sách vào giỏ, tăng/giảm số lượng, xóa sách và chuyển sang biểu mẫu yêu cầu mua.
4. Gửi biểu mẫu với dữ liệu hợp lệ; xác nhận yêu cầu xuất hiện trong khu vực quản trị.
5. Kiểm tra trên ít nhất hai kích thước màn hình:
   - Máy tính: `1440x900`.
   - Điện thoại: `390x844`.
6. Kiểm tra ảnh có `alt`, nút có nhãn dễ hiểu, chữ/nền đủ tương phản và không có lỗi 404 trong DevTools.
7. Mở GA4 Realtime để xác nhận lượt truy cập; đối chiếu báo cáo trong trang quản trị sau khi workflow cập nhật dữ liệu.

## Công nghệ

- HTML, CSS, JavaScript và Bootstrap.
- Supabase REST API, Database và Storage.
- Google Books API dùng ở bước nhập dữ liệu; trình duyệt chỉ đọc sách đã lưu trong Supabase.
- Google Analytics 4 (GA4) để đo lượt truy cập.
- GitHub Actions và GitHub Pages để cập nhật báo cáo, triển khai website.

Workflow tạo báo cáo trong `assets/data/analytics.json`; dashboard quản trị đọc file này mà không đưa service-account key xuống trình duyệt.

## Triển khai GitHub Pages

Workflow [static.yml](.github/workflows/static.yml) tự triển khai nội dung khi có push lên nhánh `main`. Có thể chạy thủ công trong tab **Actions**. Sau khi triển khai, lấy URL trong environment `github-pages`.

## Lưu ý bảo mật

Website là nguyên mẫu học tập. Không sử dụng mật khẩu thật, thông tin thẻ hoặc dữ liệu cá nhân nhạy cảm. Service-role key và thông tin xác thực GA4 chỉ được lưu trong biến môi trường hoặc GitHub Actions Secrets.
