const SUPABASE_URL = 'https://vmtugjuajprsbdyikzqp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ob5pZ-I-_YvfeE-9CK9QmA_i8vUP0Hk';
const DEFAULT_ANALYTICS_PROPERTY = '449018860';
const client = supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
const $ = selector => document.querySelector(selector);
const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
const showMessage = (text, type = 'success') => { const element = $('#adminMessage'); element.textContent = text; element.className = `alert alert-${type}`; element.hidden = false; };
async function uploadImage(file) {
  if (!file) return null;
  const extension = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const path = `${crypto.randomUUID()}.${extension}`;
  const { error } = await client.storage.from('book-covers').upload(path, file, { upsert: false, contentType: file.type });
  if (error) throw error;
  return client.storage.from('book-covers').getPublicUrl(path).data.publicUrl;
}
async function loadBooks() {
  const { data, error } = await client.from('books').select('*').order('id', { ascending:false });
  if (error) throw error;
  $('#booksTable').innerHTML = `<table class="table"><thead><tr><th>Ảnh</th><th>Tên sách</th><th>Tác giả</th><th>Giá</th><th></th></tr></thead><tbody>${data.map(book => `<tr><td><img src="${escapeHtml(book.cover_url || 'assets/img/favicon.ico')}" alt="Bìa sách ${escapeHtml(book.title)}" title="${escapeHtml(book.title)}"></td><td>${escapeHtml(book.title)}<small class="d-block text-muted">${escapeHtml(book.category || '')}</small></td><td>${escapeHtml(book.author)}</td><td>${Number(book.reference_price || 0).toLocaleString('vi-VN')} ₫</td><td><button class="danger-link" data-delete-book="${book.id}">Xóa</button></td></tr>`).join('')}</tbody></table>` || '<p>Chưa có sách.</p>';
}
async function loadArticles() {
  const { data, error } = await client.from('articles').select('*').order('id', { ascending:false });
  if (error) throw error;
  $('#articlesTable').innerHTML = `<table class="table"><thead><tr><th>Tiêu đề</th><th>Loại</th><th>Ngày tạo</th><th></th></tr></thead><tbody>${data.map(article => `<tr><td>${escapeHtml(article.title)}<small class="d-block text-muted">${escapeHtml(article.excerpt)}</small></td><td>${escapeHtml(article.article_type)}</td><td>${new Date(article.created_at).toLocaleDateString('vi-VN')}</td><td><button class="danger-link" data-delete-article="${article.id}">Xóa</button></td></tr>`).join('')}</tbody></table>`;
}
async function loadContacts() {
  const { data, error } = await client.from('contacts').select('*').order('created_at', { ascending:false });
  if (error) throw error;
  $('#contactsTable').innerHTML = `<table class="table"><thead><tr><th>Thời gian</th><th>Khách hàng</th><th>Nội dung</th><th>Trạng thái</th></tr></thead><tbody>${data.map(contact => `<tr><td>${new Date(contact.created_at).toLocaleString('vi-VN')}</td><td><strong>${escapeHtml(contact.name)}</strong><small class="d-block">${escapeHtml(contact.email)}</small></td><td class="contact-message">${escapeHtml(contact.message)}</td><td><select class="status-button status-${escapeHtml(contact.status || 'new')}" data-status="${contact.id}"><option value="new" ${contact.status === 'new' ? 'selected' : ''}>Mới</option><option value="confirmed" ${contact.status === 'confirmed' ? 'selected' : ''}>Đã xác nhận</option><option value="rejected" ${contact.status === 'rejected' ? 'selected' : ''}>Từ chối</option></select></td></tr>`).join('')}</tbody></table>`;
}
function renderAnalyticsReport(report) {
  if (Object.hasOwn(report, 'active_users_30_days')) {
    $('#analyticsTable').innerHTML = `<div class="row g-3 mb-4"><div class="col-md-4"><div class="admin-stat"><strong>${Number(report.active_users_30_days || 0).toLocaleString('vi-VN')}</strong><span>Người dùng hoạt động 30 ngày</span></div></div></div><p class="small text-muted">Cập nhật ${new Date(report.updated_at).toLocaleString('vi-VN')}</p>`;
    return;
  }
  const totals = report.totals || {};
  $('#analyticsTable').innerHTML = `<div class="row g-3 mb-4"><div class="col-md-4"><div class="admin-stat"><strong>${Number(totals.activeUsers || 0).toLocaleString('vi-VN')}</strong><span>Người dùng hoạt động</span></div></div><div class="col-md-4"><div class="admin-stat"><strong>${Number(totals.screenPageViews || 0).toLocaleString('vi-VN')}</strong><span>Lượt xem trang</span></div></div><div class="col-md-4"><div class="admin-stat"><strong>${Number(totals.sessions || 0).toLocaleString('vi-VN')}</strong><span>Phiên truy cập</span></div></div></div><p class="small text-muted">Property ${escapeHtml(report.propertyId)} · ${escapeHtml(report.dateRange)} · cập nhật ${new Date(report.generatedAt).toLocaleString('vi-VN')}</p><table class="table"><thead><tr><th>Ngày</th><th>Người dùng</th><th>Lượt xem trang</th><th>Phiên</th></tr></thead><tbody>${(report.rows || []).map(row => `<tr><td>${escapeHtml(row.date)}</td><td>${Number(row.activeUsers || 0).toLocaleString('vi-VN')}</td><td>${Number(row.screenPageViews || 0).toLocaleString('vi-VN')}</td><td>${Number(row.sessions || 0).toLocaleString('vi-VN')}</td></tr>`).join('') || '<tr><td colspan="4">Chưa có dữ liệu.</td></tr>'}</tbody></table>`;
}
async function loadAnalyticsReport() {
  const response = await fetch('data.json', { cache:'no-store' });
  if (!response.ok) {
    $('#analyticsMessage').textContent = 'Chưa có báo cáo GA4. Hãy chạy workflow Update GA4 Statistics (Node.js). Secret có thể đặt tên GA_SERVICE_ACCOUNT_JSON hoặc GOOGLE_GA4_CREDENTIALS_JSON.';
    return;
  }
  renderAnalyticsReport(await response.json());
  $('#analyticsMessage').textContent = '';
}
async function refresh() { await Promise.all([loadBooks(), loadArticles(), loadContacts(), loadAnalyticsReport()]); }
async function verifyAdmin(username, password) {
  const { data, error } = await client.rpc('verify_admin', { p_username:username, p_password:password });
  if (error) throw error;
  if (!data) throw new Error('Tên admin hoặc mật khẩu không đúng.');
}
async function startDashboard() {
  $('#authView').hidden = true; $('#dashboardView').hidden = false; await refresh();
}
$('#loginForm').addEventListener('submit', async event => { event.preventDefault(); $('#loginMessage').textContent = 'Đang kiểm tra...'; const username = $('#loginUsername').value.trim(); const password = $('#loginPassword').value; try { await verifyAdmin(username, password); sessionStorage.setItem('mocmien-admin-session', JSON.stringify({ username })); await startDashboard(); } catch (error) { $('#loginMessage').textContent = error.message; } });
$('#logoutButton').addEventListener('click', () => { sessionStorage.removeItem('mocmien-admin-session'); location.reload(); });
document.addEventListener('click', async event => {
  const deleteBook = event.target.closest('[data-delete-book]'); const deleteArticle = event.target.closest('[data-delete-article]');
  try {
    if (deleteBook && confirm('Xóa sách này?')) { const { error } = await client.from('books').delete().eq('id', deleteBook.dataset.deleteBook); if (error) throw error; await loadBooks(); showMessage('Đã xóa sách.'); }
    if (deleteArticle && confirm('Xóa bài viết này?')) { const { error } = await client.from('articles').delete().eq('id', deleteArticle.dataset.deleteArticle); if (error) throw error; await loadArticles(); showMessage('Đã xóa bài viết.'); }
  } catch (error) { showMessage(error.message, 'danger'); }
});
document.addEventListener('change', async event => { const select = event.target.closest('[data-status]'); if (!select) return; try { const { error } = await client.from('contacts').update({ status:select.value, updated_at:new Date().toISOString() }).eq('id', select.dataset.status); if (error) throw error; select.className = `status-button status-${select.value}`; showMessage('Đã cập nhật trạng thái yêu cầu.'); } catch (error) { showMessage(error.message, 'danger'); } });
$('#bookForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.target); try { const coverUrl = await uploadImage(form.get('cover')); const payload = { title:form.get('title'), author:form.get('author'), publisher:form.get('publisher'), publication_year:Number(form.get('publication_year')) || null, reference_price:Number(form.get('reference_price')) || 0, category:form.get('category'), cover_url:coverUrl, short_description:form.get('short_description'), source_url:form.get('source_url') || null }; const { error } = await client.from('books').insert(payload); if (error) throw error; event.target.reset(); await loadBooks(); showMessage('Đã thêm sách và tải ảnh lên Storage.'); } catch (error) { showMessage(error.message, 'danger'); } });
$('#articleForm').addEventListener('submit', async event => { event.preventDefault(); const form = new FormData(event.target); try { const imageUrl = await uploadImage(form.get('image')); const { error } = await client.from('articles').insert({ title:form.get('title'), article_type:form.get('article_type'), excerpt:form.get('excerpt'), content:form.get('content'), image_url:imageUrl }); if (error) throw error; event.target.reset(); await loadArticles(); showMessage('Đã thêm bài viết.'); } catch (error) { showMessage(error.message, 'danger'); } });
document.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => { document.querySelectorAll('[data-tab]').forEach(item => item.classList.remove('active')); document.querySelectorAll('.admin-panel').forEach(panel => { panel.hidden = panel.id !== button.dataset.tab; }); button.classList.add('active'); }));
if (sessionStorage.getItem('mocmien-admin-session')) startDashboard().catch(error => { sessionStorage.removeItem('mocmien-admin-session'); $('#loginMessage').textContent = error.message; });
