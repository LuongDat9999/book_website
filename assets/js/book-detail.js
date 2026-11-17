const SUPABASE_URL = 'https://vmtugjuajprsbdyikzqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ob5pZ-I-_YvfeE-9CK9QmA_i8vUP0Hk';
const money = value => new Intl.NumberFormat('vi-VN').format(value || 0) + ' ₫';
const details = document.querySelector('#bookDetails');

async function loadBook() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) throw new Error('Không tìm thấy mã sách.');
  const response = await fetch(`${SUPABASE_URL}/rest/v1/books?id=eq.${encodeURIComponent(id)}&select=title,author,publisher,publication_year,reference_price,category,cover_url,short_description`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!response.ok) throw new Error('Không thể tải thông tin sách.');
  const [book] = await response.json();
  if (!book) throw new Error('Sách không tồn tại.');
  document.title = `${book.title} | Mộc Miên Books`;
  details.innerHTML = `<div class="row g-5"><div class="col-md-5 text-center"><img class="book-detail-cover" src="${book.cover_url}" alt="Bìa sách ${book.title}" onerror="this.onerror=null;this.style.display='none'"></div><div class="col-md-7"><span class="tag">${book.category || 'Sách'}</span><h1>${book.title}</h1><p class="book-detail-author">${book.author || 'Chưa cập nhật'}</p><dl class="book-facts"><div><dt>Nhà xuất bản</dt><dd>${book.publisher || 'Chưa cập nhật'}</dd></div><div><dt>Năm xuất bản</dt><dd>${book.publication_year || 'Chưa cập nhật'}</dd></div><div><dt>Giá tham khảo</dt><dd>${money(book.reference_price)}</dd></div></dl><h2>Mô tả ngắn</h2><p class="book-description">${book.short_description || 'Chưa có mô tả cho sách này.'}</p><a class="btn btn-primary" href="index.html#san-pham">Quay lại danh mục sách</a></div></div>`;
}
loadBook().catch(error => { details.innerHTML = `<div class="alert alert-danger">${error.message}</div>`; });
