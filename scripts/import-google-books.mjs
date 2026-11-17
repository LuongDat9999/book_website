const googleApiKey = process.env.GOOGLE_BOOKS_API_KEY;
const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const batchSize = Math.max(1, Number.parseInt(process.env.BATCH_SIZE || '5', 10));
if (!googleApiKey || !supabaseUrl || !serviceRoleKey) {
  throw new Error('Cần GOOGLE_BOOKS_API_KEY, SUPABASE_URL và SUPABASE_SERVICE_ROLE_KEY.');
}

const titles = [
  'Nhà giả kim', 'Đắc nhân tâm', 'Tuổi trẻ đáng giá bao nhiêu?', 'Đi tìm lẽ sống',
  'Một đời như kẻ tìm đường', 'Cà phê cùng Tony', 'Totto-chan bên cửa sổ',
  'Dế Mèn phiêu lưu ký', 'Cho tôi xin một vé đi tuổi thơ', 'Mắt biếc',
  'Sapiens: Lược sử loài người', 'Nghệ thuật tinh tế của việc đếch quan tâm',
  'Atomic Habits', 'Bố già', 'Muôn kiếp nhân sinh', 'Cây cam ngọt của tôi',
  'Tư duy nhanh và chậm', 'Lược sử thời gian', 'Hoàng tử bé', 'Bắt trẻ đồng xanh',
  'Harry Potter', 'Những người khốn khổ', 'Không gia đình', 'Sherlock Holmes',
  'Nhà thờ Đức Bà Paris', 'Ông già và biển cả', 'Thép đã tôi thế đấy',
  'Khi lỗi thuộc về những vì sao', 'Tôi thấy hoa vàng trên cỏ xanh', 'Momo',
  'Những cuộc phiêu lưu của Tom Sawyer', 'Bảy bước tới mùa hè', 'Cánh đồng bất tận',
  'Nghìn lẻ một đêm', 'Lược sử vạn vật', 'Tư duy hệ thống', 'Cà phê cùng Tony',
  'Dạy con làm giàu', 'Tuần làm việc 4 giờ'
];

const categoryFor = title => title.includes('Dế Mèn') || title.includes('Totto') || title.includes('Hoàng tử') ? 'Thiếu nhi' : 'Sách chọn lọc';
const referencePrice = saleInfo => {
  const price = saleInfo?.listPrice;
  if (!price?.amount) return null;
  const amount = price.currencyCode === 'VND' ? price.amount : price.amount * 26000;
  return Number.isSafeInteger(Math.round(amount)) && amount <= 2147483647 ? Math.round(amount) : null;
};
const highResolutionCover = imageLinks => {
  const image = imageLinks?.extraLarge || imageLinks?.large || imageLinks?.medium || imageLinks?.small || imageLinks?.thumbnail;
  if (!image) return null;
  const url = new URL(image.replace('http://', 'https://'));
  url.searchParams.set('zoom', '2');
  return url.toString();
};
const existingResponse = await fetch(`${supabaseUrl}/rest/v1/books?select=google_books_id`, {
  headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` }
});
if (!existingResponse.ok) throw new Error(`Không thể đọc sách đã có từ Supabase: ${await existingResponse.text()}`);
const existingIds = new Set((await existingResponse.json()).map(book => book.google_books_id).filter(Boolean));
const targetCount = Math.min(batchSize, Math.max(0, 20 - existingIds.size));
if (!targetCount) {
  console.log('Supabase đã có đủ 20 sách.');
  process.exit(0);
}

const results = [];
const importedIds = new Set();
for (const title of titles) {
  if (results.length >= targetCount) break;
  const searchResponse = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(`intitle:${title}`)}&maxResults=10&langRestrict=vi&key=${googleApiKey}`);
  if (!searchResponse.ok) throw new Error(`Google Books lỗi khi tìm "${title}": ${searchResponse.status}`);
  const candidates = (await searchResponse.json()).items || [];
  for (const candidate of candidates) {
    if (results.length >= targetCount) break;
    if (!candidate.id || existingIds.has(candidate.id) || importedIds.has(candidate.id)) continue;
    const detailResponse = await fetch(`https://www.googleapis.com/books/v1/volumes/${encodeURIComponent(candidate.id)}?key=${googleApiKey}`);
    if (!detailResponse.ok) continue;
    const item = await detailResponse.json();
    const info = item.volumeInfo || {};
    const book = {
      title: info.title || title,
      author: (info.authors || []).join(', '),
      publisher: info.publisher || null,
      publication_year: Number.parseInt(info.publishedDate, 10) || null,
      reference_price: referencePrice(item.saleInfo),
      category: categoryFor(title),
      cover_url: highResolutionCover(info.imageLinks),
      short_description: info.description || null,
      source_url: info.infoLink || null,
      google_books_id: item.id
    };
    const requiredFields = ['author', 'publisher', 'publication_year', 'reference_price', 'cover_url', 'short_description'];
    if (requiredFields.some(field => !book[field])) continue;
    importedIds.add(candidate.id);
    results.push(book);
    console.log(`[${results.length}/${targetCount}] ${book.title}`);
  }
}

if (results.length < targetCount) {
  throw new Error(`Chỉ tìm được ${results.length}/${targetCount} sách đủ thông tin. Không ghi batch chưa đủ vào Supabase.`);
}

const response = await fetch(`${supabaseUrl}/rest/v1/books?on_conflict=google_books_id`, {
  method: 'POST',
  headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}`, 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' },
  body: JSON.stringify(results)
});
if (!response.ok) throw new Error(`Supabase lỗi: ${await response.text()}`);
console.log(`Đã nhập thêm ${results.length} sách vào Supabase. Tổng hiện có tối đa ${existingIds.size + results.length}/20.`);
