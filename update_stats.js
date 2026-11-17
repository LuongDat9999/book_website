import { writeFile } from 'node:fs/promises';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

async function runReport() {
  try {
    // 1. Lấy thông tin từ các biến môi trường (được truyền từ GitHub Secrets)
    const credentialsJson = process.env.GA_SERVICE_ACCOUNT_JSON;
    const propertyId = process.env.GA_PROPERTY_ID;
    if (!credentialsJson || !propertyId) {
      throw new Error('Thiếu GA_SERVICE_ACCOUNT_JSON hoặc GA_PROPERTY_ID.');
    }
    const credentials = JSON.parse(credentialsJson);

    // 2. Khởi tạo Client bằng thông tin xác thực trực tiếp
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials,
    });

    // 3. Thực hiện gọi API để lấy số liệu người dùng hoạt động (Active Users) trong 30 ngày qua
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: '30daysAgo',
          endDate: 'today',
        },
      ],
      metrics: [
        {
          name: 'activeUsers',
        },
      ],
    });

    // 4. Tính toán tổng số lượng người dùng từ dữ liệu trả về
    let totalUsers = 0;
    if (response.rows) {
      response.rows.forEach(row => {
        totalUsers += parseInt(row.metricValues[0].value, 10);
      });
    }

    // 5. Chuẩn bị dữ liệu ghi ra file
    const outputData = {
      active_users_30_days: totalUsers,
      updated_at: new Date().toISOString()
    };

    // 6. Ghi dữ liệu vào file data.json tĩnh
    await writeFile('data.json', JSON.stringify(outputData, null, 2));
    console.log(`Cập nhật thành công! Tổng người dùng: ${totalUsers}`);

  } catch (error) {
    console.error('Đã xảy ra lỗi khi lấy dữ liệu GA4:', error);
    process.exit(1);
  }
}

runReport();
