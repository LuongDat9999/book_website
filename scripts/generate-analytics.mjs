import { BetaAnalyticsDataClient } from '@google-analytics/data';
import { mkdir, writeFile } from 'node:fs/promises';

const propertyId = process.env.GA4_PROPERTY_ID || '16357193074';
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || './credentials.json';
const analyticsDataClient = new BetaAnalyticsDataClient({ keyFilename: credentialsPath });

let response;
try {
  [response] = await analyticsDataClient.runReport({
    property: `properties/${propertyId}`,
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'date' }],
    metrics: [{ name: 'activeUsers' }, { name: 'screenPageViews' }, { name: 'sessions' }]
  });
} catch (error) {
  if (error.code === 7) {
    throw new Error(`Service account chưa có quyền Viewer trên GA4 Property ${propertyId}. Hãy thêm email service account trong credentials.json vào Property access management.`);
  }
  throw error;
}

const rows = (response.rows || []).map(row => ({
  date: row.dimensionValues?.[0]?.value || '',
  activeUsers: Number(row.metricValues?.[0]?.value || 0),
  screenPageViews: Number(row.metricValues?.[1]?.value || 0),
  sessions: Number(row.metricValues?.[2]?.value || 0)
}));
const totals = rows.reduce((result, row) => ({
  activeUsers: result.activeUsers + row.activeUsers,
  screenPageViews: result.screenPageViews + row.screenPageViews,
  sessions: result.sessions + row.sessions
}), { activeUsers: 0, screenPageViews: 0, sessions: 0 });

await mkdir('assets/data', { recursive: true });
await writeFile('assets/data/analytics.json', JSON.stringify({
  propertyId,
  generatedAt: new Date().toISOString(),
  dateRange: '30 ngày gần nhất',
  totals,
  rows
}, null, 2));
console.log(`Generated GA4 report for property ${propertyId}: ${rows.length} days`);
