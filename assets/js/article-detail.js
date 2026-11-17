const SUPABASE_URL = 'https://vmtugjuajprsbdyikzqp.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ob5pZ-I-_YvfeE-9CK9QmA_i8vUP0Hk';
const details = document.querySelector('#articleDetails');
const seedArticles = [
  ['5 cách chọn sách phù hợp khi bạn mới bắt đầu đọc','Hướng dẫn','Chọn chủ đề gần với nhu cầu, đọc thử mục lục và đừng ngại bỏ dở cuốn sách không phù hợp.'],
  ['Review: Nhà giả kim và hành trình theo đuổi ước mơ','Review','Một câu chuyện ngắn gọn nhưng giàu năng lượng về việc lắng nghe tiếng gọi bên trong.'],
  ['Đọc sách giấy hay sách điện tử?','Góc nhìn','Mỗi định dạng có ưu điểm riêng; lựa chọn tốt nhất là định dạng giúp bạn đọc đều đặn.'],
  ['3 cuốn sách kỹ năng cho sinh viên năm nhất','Gợi ý','Từ giao tiếp đến quản lý thời gian, ba lựa chọn dễ đọc và có tính ứng dụng cao.'],
  ['Lập kế hoạch đọc 12 cuốn trong một năm','Thói quen','Chia nhỏ mục tiêu theo tháng và ghi lại một ý tưởng đáng nhớ sau mỗi chương.'],
  ['Tặng sách: món quà nhỏ, câu chuyện dài','Truyền thông','Chọn sách theo tính cách người nhận để món quà trở nên riêng tư và ý nghĩa hơn.'],
  ['Vì sao văn học thiếu nhi vẫn dành cho người lớn?','Góc nhìn','Những câu chuyện trong veo đôi khi giúp người lớn nhìn lại điều quan trọng đã lãng quên.'],
  ['Đọc chậm để hiểu sâu','Thói quen','Gạch chân vừa đủ, đặt câu hỏi và dành vài phút liên hệ với trải nghiệm của chính mình.']
].map((article, index) => ({ id:`seed-${index}`, title:article[0], type:article[1], excerpt:article[2], content:article[2], image:`assets/img/article-${(index % 4) + 1}.svg` }));
const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char]));
async function loadArticle() {
  const id = new URLSearchParams(location.search).get('id');
  if (!id) throw new Error('Không tìm thấy mã bài viết.');
  let article = seedArticles.find(item => item.id === id);
  if (!article) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/articles?id=eq.${encodeURIComponent(id)}&published=eq.true&select=title,article_type,excerpt,content,image_url`, { headers:{ apikey:SUPABASE_ANON_KEY, Authorization:`Bearer ${SUPABASE_ANON_KEY}` } });
    if (!response.ok) throw new Error('Không thể tải bài viết.');
    const [remoteArticle] = await response.json();
    if (!remoteArticle) throw new Error('Bài viết không tồn tại.');
    article = { ...remoteArticle, type:remoteArticle.article_type, image:remoteArticle.image_url || 'assets/img/article-1.svg' };
  }
  document.title = `${article.title} | Mộc Miên Books`;
  details.innerHTML = `<article class="mx-auto" style="max-width:850px"><span class="tag">${escapeHtml(article.type)}</span><h1 class="my-3">${escapeHtml(article.title)}</h1><img class="article-detail-image mb-4" src="${escapeHtml(article.image)}" alt="" onerror="this.onerror=null;this.src='assets/img/article-1.svg'"><p class="article-content">${escapeHtml(article.content || article.excerpt)}</p><a class="btn btn-primary mt-3" href="index.html#goc-doc">Quay lại Góc đọc</a></article>`;
}
loadArticle().catch(error => { details.innerHTML = `<div class="alert alert-danger">${escapeHtml(error.message)}</div>`; });
