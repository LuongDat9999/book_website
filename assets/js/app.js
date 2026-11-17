const SUPABASE_URL = 'https://vmtugjuajprsbdyikzqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ob5pZ-I-_YvfeE-9CK9QmA_i8vUP0Hk';
const GA_MEASUREMENT_ID = 'G-LLPZJ6RPHP';
const money = value => new Intl.NumberFormat('vi-VN').format(value || 0) + ' ₫';
const $ = selector => document.querySelector(selector);
let books = [];
let cart = JSON.parse(localStorage.getItem('mocmien-cart') || '[]');

const articleSeed = [
  ['5 cách chọn sách phù hợp khi bạn mới bắt đầu đọc','Hướng dẫn','Chọn chủ đề gần với nhu cầu, đọc thử mục lục và đừng ngại bỏ dở cuốn sách không phù hợp.'],
  ['Review: Nhà giả kim và hành trình theo đuổi ước mơ','Review','Một câu chuyện ngắn gọn nhưng giàu năng lượng về việc lắng nghe tiếng gọi bên trong.'],
  ['Đọc sách giấy hay sách điện tử?','Góc nhìn','Mỗi định dạng có ưu điểm riêng; lựa chọn tốt nhất là định dạng giúp bạn đọc đều đặn.'],
  ['3 cuốn sách kỹ năng cho sinh viên năm nhất','Gợi ý','Từ giao tiếp đến quản lý thời gian, ba lựa chọn dễ đọc và có tính ứng dụng cao.'],
  ['Lập kế hoạch đọc 12 cuốn trong một năm','Thói quen','Chia nhỏ mục tiêu theo tháng và ghi lại một ý tưởng đáng nhớ sau mỗi chương.'],
  ['Tặng sách: món quà nhỏ, câu chuyện dài','Truyền thông','Chọn sách theo tính cách người nhận để món quà trở nên riêng tư và ý nghĩa hơn.'],
  ['Vì sao văn học thiếu nhi vẫn dành cho người lớn?','Góc nhìn','Những câu chuyện trong veo đôi khi giúp người lớn nhìn lại điều quan trọng đã lãng quên.'],
  ['Đọc chậm để hiểu sâu','Thói quen','Gạch chân vừa đủ, đặt câu hỏi và dành vài phút liên hệ với trải nghiệm của chính mình.']
].map((a, i) => ({ id:`seed-${i}`, title:a[0], type:a[1], text:a[2], image:`assets/img/article-${(i % 4) + 1}.svg` }));
let articles = articleSeed;
const normalizeText = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/gi, 'd').toLowerCase();

async function loadBooks() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/books?select=id,title,author,publisher,publication_year,reference_price,category,cover_url,short_description,source_url&order=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!response.ok) throw new Error('Không thể tải danh mục sách từ Supabase.');
  books = (await response.json()).map(book => ({
    ...book,
    year: book.publication_year,
    price: book.reference_price,
    image: book.cover_url
  }));
}
async function loadArticles() {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?select=id,title,article_type,excerpt,content,image_url&published=eq.true&order=id`, {
    headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` }
  });
  if (!response.ok) return;
  const data = await response.json();
  if (data.length) articles = data.map(article => ({ id:article.id, title:article.title, type:article.article_type, text:article.excerpt, image:article.image_url || 'assets/img/article-1.svg' }));
}
function renderBooks() {
  const query = normalizeText($('#bookSearch').value);
  const category = $('#categoryFilter').value;
  const sort = $('#sortBooks').value;
  const list = books.filter(book => (!category || book.category === category) && normalizeText(`${book.title} ${book.author}`).includes(query));
  if (sort === 'priceAsc') list.sort((a,b) => a.price - b.price);
  if (sort === 'title') list.sort((a,b) => a.title.localeCompare(b.title, 'vi'));
  $('#bookList').innerHTML = list.map(book => `<div class="col-sm-6 col-lg-3"><article class="book-card h-100"><a class="book-image" href="book-detail.html?id=${encodeURIComponent(book.id)}" aria-label="Xem chi tiết ${book.title}"><img src="${book.image}" alt="Bìa sách ${book.title}" loading="lazy" onerror="this.onerror=null;this.style.display='none'"></a><div class="book-body"><span class="tag">${book.category || 'Sách'}</span><h3><a class="book-title" href="book-detail.html?id=${encodeURIComponent(book.id)}">${book.title}</a></h3><p class="author">${book.author || 'Chưa cập nhật'}</p><small>${book.publisher || 'Chưa cập nhật'} · ${book.year || 'Chưa cập nhật'}</small><div class="book-bottom"><strong>${money(book.price)}</strong><button class="add-button" data-add="${book.id}" aria-label="Thêm ${book.title} vào giỏ"><i class="fa fa-plus"></i></button></div></div></article></div>`).join('') || '<p class="text-center py-5">Chưa tìm thấy sách phù hợp.</p>';
}

function renderArticles() { $('#articleList').innerHTML = articles.map((a, index) => `<div class="col-md-6 col-lg-3"><article class="article-card"><img src="${a.image}" alt="" loading="lazy"><div><span class="tag">${a.type}</span><h3>${a.title}</h3><p class="article-excerpt">${a.text}</p><a href="article-detail.html?id=${encodeURIComponent(a.id || `seed-${index}`)}">Đọc thêm <i class="fa fa-arrow-right"></i></a></div></article></div>`).join(''); }
function renderCart() {
  $('#cartCount').textContent = cart.reduce((total, item) => total + item.quantity, 0);
  $('#cartItems').innerHTML = cart.length ? cart.map(item => `<div class="cart-row"><img src="${item.image}" alt=""><div class="flex-grow-1"><strong>${item.title}</strong><small>${money(item.price)}</small></div><button data-quantity="${item.id}" data-change="-1">−</button><span>${item.quantity}</span><button data-quantity="${item.id}" data-change="1">+</button><button class="remove" data-remove="${item.id}" aria-label="Xóa"><i class="fa fa-trash"></i></button></div>`).join('') : '<div class="empty-cart"><i class="fa fa-book"></i><p>Giỏ sách đang trống.</p><a href="#san-pham" data-bs-dismiss="modal">Chọn một cuốn sách</a></div>';
  $('#cartTotal').textContent = money(cart.reduce((total, item) => total + item.price * item.quantity, 0));
}
function saveCart() { localStorage.setItem('mocmien-cart', JSON.stringify(cart)); renderCart(); }
async function submitRequest(payload) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/contacts`, { method:'POST', headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type':'application/json', Prefer:'return=minimal' }, body:JSON.stringify(payload) });
  if (!response.ok) throw new Error('Không thể lưu yêu cầu lên Supabase.');
}

document.addEventListener('click', event => {
  const add = event.target.closest('[data-add]');
  if (add) {
    const book = books.find(item => String(item.id) === add.dataset.add);
    if (!book) return;
    const existing = cart.find(item => item.id === book.id);
    existing ? existing.quantity++ : cart.push({...book, quantity:1});
    saveCart();
  }
  const change = event.target.closest('[data-quantity]');
  if (change) {
    const item = cart.find(book => String(book.id) === change.dataset.quantity);
    if (!item) return;
    item.quantity += Number(change.dataset.change);
    if (item.quantity < 1) cart = cart.filter(book => book.id !== item.id);
    saveCart();
  }
  const remove = event.target.closest('[data-remove]');
  if (remove) { cart = cart.filter(book => String(book.id) !== remove.dataset.remove); saveCart(); }
});

async function init() {
  renderCart();
  renderArticles();
  await loadArticles();
  renderArticles();
  try {
    await loadBooks();
    books.map(book => book.category).filter((value, index, list) => value && list.indexOf(value) === index).forEach(category => $('#categoryFilter').insertAdjacentHTML('beforeend', `<option>${category}</option>`));
    renderBooks();
  } catch (error) {
    $('#bookList').innerHTML = `<p class="text-center py-5 text-danger">${error.message}</p>`;
  }
}
['bookSearch','categoryFilter','sortBooks'].forEach(id => document.getElementById(id).addEventListener('input', renderBooks));
$('#contactForm').addEventListener('submit', async event => { event.preventDefault(); const message = $('#formMessage'); message.textContent = 'Đang gửi...'; try { const data = Object.fromEntries(new FormData(event.target)); await submitRequest({...data, created_at:new Date().toISOString()}); event.target.reset(); message.textContent = 'Đã nhận yêu cầu. Cảm ơn bạn đã liên hệ!'; } catch (error) { message.textContent = error.message; } });
$('#checkoutButton').addEventListener('click', () => { if (!cart.length) return; $('#contactMessage').value = `Tôi muốn đặt thử nghiệm: ${cart.map(item => `${item.title} (x${item.quantity})`).join(', ')}`; bootstrap.Modal.getInstance($('#cartModal')).hide(); location.hash = 'lien-he'; $('#contactName').focus(); });
if (GA_MEASUREMENT_ID) {
  const analyticsScript = document.createElement('script');
  analyticsScript.async = true;
  analyticsScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(analyticsScript);
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_MEASUREMENT_ID);
}
init();
