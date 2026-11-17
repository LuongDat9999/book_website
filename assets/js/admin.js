const SUPABASE_URL = 'https://vmtugjuajprsbdyikzqp.supabase.co';
const SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_ob5pZ-I-_YvfeE-9CK9QmA_i8vUP0Hk';
const GOOGLE_CLIENT_ID = '735686010885-feb3urkl927hn0t3q3grff7vaamcsis9.apps.googleusercontent.com';
const DEFAULT_ANALYTICS_PROPERTY = '16357193074';
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
  $('#booksTable').innerHTML = `<table class="table"><thead><tr><th>Ảnh</th><th>Tên sách</th><th>Tác giả</th><th>Giá</th><th></th></tr></thead><tbody>${data.map(book => `<tr><td><img src="${escapeHtml(book.cover_url || 'assets/img/favicon.ico')}" alt=""></td><td>${escapeHtml(book.title)}<small class="d-block text-muted">${escapeHtml(book.category || '')}</small></td><td>${escapeHtml(book.author)}</td><td>${Number(book.reference_price || 0).toLocaleString('vi-VN')} ₫</td><td><button class="danger-link" data-delete-book="${book.id}">Xóa</button></td></tr>`).join('')}</tbody></table>` || '<p>Chưa có sách.</p>';
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
async function loadAnalyticsSettings() {
  const { data, error } = await client.from('admin_settings').select('setting_value').eq('setting_key', 'google_analytics_property_id').maybeSingle();
  if (error) {
    if (error.code === '42P01') {
      $('#analyticsProperty').value = DEFAULT_ANALYTICS_PROPERTY;
      return;
    }
    throw error;
  }
  const propertyId = data?.setting_value || DEFAULT_ANALYTICS_PROPERTY;
  $('#analyticsProperty').value = propertyId;
  localStorage.setItem('mocmien-ga-property', propertyId);
}
async function refresh() { await Promise.all([loadBooks(), loadArticles(), loadContacts(), loadAnalyticsSettings()]); }
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
const analyticsProperty = $('#analyticsProperty');
if (analyticsProperty) analyticsProperty.value = localStorage.getItem('mocmien-ga-property') || DEFAULT_ANALYTICS_PROPERTY;
$('#analyticsForm').addEventListener('submit', async event => {
  event.preventDefault();
  const propertyId = analyticsProperty.value.trim();
  if (!/^\d+$/.test(propertyId)) { $('#analyticsMessage').textContent = 'Property ID chỉ gồm chữ số.'; return; }
  const { error: saveError } = await client.from('admin_settings').upsert({ setting_key:'google_analytics_property_id', setting_value:propertyId, updated_at:new Date().toISOString() }, { onConflict:'setting_key' });
  if (saveError) { $('#analyticsMessage').textContent = `Không thể lưu Property ID vào database: ${saveError.message}. Hãy chạy supabase/admin.sql trước.`; return; }
  localStorage.setItem('mocmien-ga-property', propertyId);
  $('#analyticsMessage').textContent = 'Đang chờ cấp quyền Google...';
  if (!window.google?.accounts?.oauth2) { $('#analyticsMessage').textContent = 'Google Identity Services chưa sẵn sàng, hãy thử lại sau ít giây.'; return; }
  let tokenClient;
  try {
    tokenClient = google.accounts.oauth2.initTokenClient({ client_id:GOOGLE_CLIENT_ID, scope:'https://www.googleapis.com/auth/analytics.readonly', callback: async response => {
    if (response.error) { $('#analyticsMessage').textContent = 'OAuth Google bị từ chối. Hãy thêm origin hiện tại vào Authorized JavaScript origins của OAuth client.'; return; }
    try {
      const report = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`, { method:'POST', headers:{ Authorization:`Bearer ${response.access_token}`, 'Content-Type':'application/json' }, body:JSON.stringify({ dateRanges:[{ startDate:'30daysAgo', endDate:'today' }], metrics:[{ name:'activeUsers' },{ name:'eventCount' }], dimensions:[{ name:'date' }] }) });
      if (!report.ok) throw new Error('Google Analytics không trả về dữ liệu. Kiểm tra Property ID và quyền truy cập.');
      const data = await report.json();
      const rows = data.rows || [];
      $('#analyticsTable').innerHTML = `<table class="table"><thead><tr><th>Ngày</th><th>Người dùng hoạt động</th><th>Sự kiện</th></tr></thead><tbody>${rows.map(row => `<tr><td>${row.dimensionValues[0].value}</td><td>${row.metricValues[0].value}</td><td>${row.metricValues[1].value}</td></tr>`).join('') || '<tr><td colspan="3">Chưa có dữ liệu trong khoảng thời gian này.</td></tr>'}</tbody></table>`;
      $('#analyticsMessage').textContent = 'Đã tải số liệu 30 ngày gần nhất.';
    } catch (error) { $('#analyticsMessage').textContent = error.message; }
    }});
    tokenClient.requestAccessToken({ prompt:'consent' });
  } catch (error) {
    $('#analyticsMessage').textContent = `OAuth client chưa đăng ký origin ${location.origin}. Hãy thêm origin này vào Authorized JavaScript origins trên Google Cloud Console.`;
  }
});
if (sessionStorage.getItem('mocmien-admin-session')) startDashboard().catch(error => { sessionStorage.removeItem('mocmien-admin-session'); $('#loginMessage').textContent = error.message; });
