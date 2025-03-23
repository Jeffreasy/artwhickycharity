import { NextResponse } from 'next/server';
import { BetaAnalyticsDataClient, protos } from '@google-analytics/data';

// Type definitions for Google Analytics responses
type RunReportResponse = protos.google.analytics.data.v1beta.IRunReportResponse;
type Row = protos.google.analytics.data.v1beta.IRow;

interface AnalyticsQueryParams {
  startDate: string;
  endDate: string;
}

// Mock data for fallback when GA API isn't available
const MOCK_DATA = {
  isMockData: true,
  mockReason: "Default fallback",
  visitors: 2438,
  pageviews: 8752,
  avgSessionDuration: 124, // seconds
  bounceRate: 42.8, // percentage
  topPages: [
    { path: '/', views: 3241, avgTime: 82 },
    { path: '/shop', views: 1867, avgTime: 143 },
    { path: '/about', views: 985, avgTime: 95 },
    { path: '/events', views: 754, avgTime: 127 },
    { path: '/contact', views: 532, avgTime: 68 }
  ],
  deviceBreakdown: {
    mobile: 58,
    desktop: 36,
    tablet: 6
  },
  countries: [
    { country: 'Netherlands', visitors: 1542 },
    { country: 'Belgium', visitors: 431 },
    { country: 'United Kingdom', visitors: 226 },
    { country: 'Germany', visitors: 124 },
    { country: 'United States', visitors: 115 }
  ]
};

export async function GET(request: Request) {
  try {
    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate') || getDefaultDateRange().startDate;
    const endDate = searchParams.get('endDate') || getDefaultDateRange().endDate;

    // Log request details for debugging
    console.log(`Analytics API request - startDate: ${startDate}, endDate: ${endDate}`);

    // Validate date format (YYYY-MM-DD)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Please use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Check if we have the necessary environment variables
    const hasCredentials = checkGACredentials();
    
    // Log environment variable status
    console.log(`GA API credentials status - GA_PROPERTY_ID: ${!!process.env.GA_PROPERTY_ID}, GA_CLIENT_EMAIL: ${!!process.env.GA_CLIENT_EMAIL}, GA_PRIVATE_KEY: ${!!process.env.GA_PRIVATE_KEY}`);
    
    // If credentials are missing, return mock data
    if (!hasCredentials) {
      console.log('Using mock data because Google Analytics credentials are missing or invalid');
      return NextResponse.json({
        ...MOCK_DATA,
        mockReason: "Missing GA credentials"
      });
    }

    // Get analytics data
    const analyticsData = await fetchAnalyticsData({ startDate, endDate });
    return NextResponse.json(analyticsData);
  } catch (error: any) {
    console.error('Error fetching analytics data:', error);
    // Return mock data in case of any error
    console.log('Using mock data due to error:', error.message);
    return NextResponse.json({
      ...MOCK_DATA,
      mockReason: `Error: ${error.message}`
    });
  }
}

function getDefaultDateRange() {
  const today = new Date();
  const endDate = today.toISOString().split('T')[0];
  const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const startDate = sevenDaysAgo.toISOString().split('T')[0];
  
  return { startDate, endDate };
}

function checkGACredentials() {
  const privateKey = process.env.GA_PRIVATE_KEY;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const propertyId = process.env.GA_PROPERTY_ID;

  return !!(privateKey && clientEmail && propertyId);
}

// Function to properly format private key for different environments
function formatPrivateKey(key: string | undefined): string {
  if (!key) return '';
  
  try {
    // Remove any surrounding quotes if present
    let formattedKey = key.trim();
    if ((formattedKey.startsWith('"') && formattedKey.endsWith('"')) || 
        (formattedKey.startsWith("'") && formattedKey.endsWith("'"))) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    }
    
    // If the key is base64 without headers, add them
    if (!formattedKey.includes('-----BEGIN')) {
      // Clean the key: remove spaces and ensure no linebreaks in the base64 content
      formattedKey = formattedKey.replace(/\s/g, '');
      
      // Add proper PEM format with linebreaks for proper parsing
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + 
                     formattedKey.match(/.{1,64}/g)?.join('\n') + 
                     '\n-----END PRIVATE KEY-----';
    } else {
      // If the key already has headers but potentially incorrect formatting
      // Extract the base64 content between the headers
      const base64Content = formattedKey
        .replace('-----BEGIN PRIVATE KEY-----', '')
        .replace('-----END PRIVATE KEY-----', '')
        .replace(/\s/g, '');
      
      // Re-format with proper line breaks (PEM requires lines of max 64 chars)
      formattedKey = '-----BEGIN PRIVATE KEY-----\n' + 
                     base64Content.match(/.{1,64}/g)?.join('\n') + 
                     '\n-----END PRIVATE KEY-----';
    }
    
    // Log details for debugging
    console.log('Private key format check: Has header:', formattedKey.includes('-----BEGIN PRIVATE KEY-----'));
    console.log('Private key format check: Has footer:', formattedKey.includes('-----END PRIVATE KEY-----'));
    console.log('Private key format check: Number of lines:', formattedKey.split('\n').length);
    console.log('Private key format check: Has newlines:', formattedKey.includes('\n'));
    
    return formattedKey;
  } catch (error) {
    console.error('Error formatting private key:', error);
    return key || '';
  }
}

async function initializeAnalyticsClient() {
  // Check if we have the necessary environment variables
  const rawPrivateKey = process.env.GA_PRIVATE_KEY;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const propertyId = process.env.GA_PROPERTY_ID;

  console.log("GA Property ID:", propertyId);
  console.log("GA Client Email:", clientEmail?.substring(0, 5) + "..." + (clientEmail?.slice(-5) || ""));
  
  if (!rawPrivateKey || !clientEmail || !propertyId) {
    throw new Error('Missing required Google Analytics credentials in environment variables');
  }
  
  try {
    // Format the private key correctly for the environment
    const privateKey = formatPrivateKey(rawPrivateKey);
    
    console.log("Private key length:", privateKey.length);
    console.log("First 10 chars of formatted key:", privateKey.substring(0, 10) + "...");
    console.log("Last 10 chars of formatted key:", "..." + privateKey.substring(privateKey.length - 10));
    
    // FALLBACK: Use a hard-coded key for testing purposes if the formatted one fails
    // WARNING: This should be removed in production or only kept temporarily for debugging
    const useHardcodedKeyAsLastResort = false; // Set to true only for debugging in development
    const testKey = useHardcodedKeyAsLastResort ? 
      `-----BEGIN PRIVATE KEY-----
MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCtcwHAkkdq1eSq
zvs4mWXN4SsJsJutcE0IU4bS/vovXJ05c8rEa9pI6xWbYjNj8SL8Cnn0+j/Jy8jb
nwA1l26uCXGUOg+HVLdSFEcfPwLQY0xnGw2bKCfmFsTQ36S3T7qp9b1gkCgQIqDw
TfWovRRPVbzR7sBMDEQ7JSgPzT47vRRV1qXmIjrOsvvVx5+/Sw7fR8YRlXzQQpIc
cQk8TiKQPNebx0rKO0xHavCZE0B5mCPy7d7YnfWz/iNN62dTdlpkEOD+GnCsw6y1
NxP/vbMp66TA5kRdciZVd33cYGI0VqJ8L05hAkRDrz8O3av3+QjLKe5/9CzixKH+
nD9O6YppAgMBAAECggEABLWjkbI3xQMtzmjOFP4jCbWIfMKq1c7xlAmLEXVJXbhS
-----END PRIVATE KEY-----` : null;
    
    // Create an authorized client with the formatted key or testKey if testing
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: clientEmail,
        private_key: testKey || privateKey,
      },
    });
    
    // Test the client with a simple API call to verify credentials
    try {
      await analyticsDataClient.getMetadata({
        name: `properties/${propertyId}`
      });
      console.log("Successfully validated Google Analytics credentials");
    } catch (apiError: any) {
      console.error("Error validating Google Analytics client:", apiError);
      throw new Error(`Failed to validate GA credentials: ${apiError.message}`);
    }
    
    return { analyticsDataClient, propertyId };
  } catch (error) {
    console.error('Error initializing Google Analytics client:', error);
    throw error;
  }
}

async function fetchAnalyticsData({ startDate, endDate }: AnalyticsQueryParams) {
  try {
    const { analyticsDataClient, propertyId } = await initializeAnalyticsClient();

    console.log(`Initialized GA client with property ID: ${propertyId}`);
    
    // Run reports in parallel for efficiency
    const [visitorStatsResponse, pagesResponse, deviceResponse, countryResponse] = await Promise.all([
      // Core metrics: visitors, pageviews, session duration, bounce rate
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
          { name: 'bounceRate' },
        ],
      }),

      // Top pages
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [
          { name: 'screenPageViews' },
          { name: 'averageSessionDuration' },
        ],
        orderBys: [
          { metric: { metricName: 'screenPageViews' }, desc: true },
        ],
        limit: 5,
      }),

      // Device breakdown
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'deviceCategory' }],
        metrics: [{ name: 'totalUsers' }],
      }),

      // Country breakdown
      analyticsDataClient.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: 'country' }],
        metrics: [{ name: 'totalUsers' }],
        orderBys: [
          { metric: { metricName: 'totalUsers' }, desc: true },
        ],
        limit: 5,
      }),
    ]);

    console.log("Successfully retrieved GA data");

    // Process visitor stats - extract from first response
    const visitorStats = visitorStatsResponse[0]?.rows?.[0]?.metricValues || [];
    const visitors = parseInt(visitorStats[0]?.value || '0');
    const pageviews = parseInt(visitorStats[1]?.value || '0');
    const avgSessionDuration = parseFloat(visitorStats[2]?.value || '0');
    const bounceRate = parseFloat(visitorStats[3]?.value || '0');

    // Process top pages - extract from second response
    const topPages = pagesResponse[0]?.rows?.map((row: Row) => {
      const path = row.dimensionValues?.[0]?.value || '';
      const views = parseInt(row.metricValues?.[0]?.value || '0');
      const avgTime = parseFloat(row.metricValues?.[1]?.value || '0');
      
      return { path, views, avgTime };
    }) || [];

    // Process device breakdown - extract from third response
    let totalDeviceUsers = 0;
    const deviceData: Record<string, number> = {};
    
    deviceResponse[0]?.rows?.forEach((row: Row) => {
      const device = (row.dimensionValues?.[0]?.value || '').toLowerCase();
      const users = parseInt(row.metricValues?.[0]?.value || '0');
      deviceData[device] = users;
      totalDeviceUsers += users;
    });

    // Calculate percentages
    const deviceBreakdown = {
      mobile: Math.round((deviceData.mobile || 0) / totalDeviceUsers * 100) || 0,
      desktop: Math.round((deviceData.desktop || 0) / totalDeviceUsers * 100) || 0,
      tablet: Math.round((deviceData.tablet || 0) / totalDeviceUsers * 100) || 0,
    };

    // Process countries - extract from fourth response
    const countries = countryResponse[0]?.rows?.map((row: Row) => {
      const country = row.dimensionValues?.[0]?.value || '';
      const visitors = parseInt(row.metricValues?.[0]?.value || '0');
      
      return { country, visitors };
    }) || [];

    return {
      isMockData: false,
      visitors,
      pageviews,
      avgSessionDuration,
      bounceRate: Math.round(bounceRate * 10) / 10, // Round to 1 decimal place
      topPages,
      deviceBreakdown,
      countries,
    };
  } catch (error) {
    console.error('Error fetching Google Analytics data:', error);
    // Return mock data in case of any API error
    return {
      ...MOCK_DATA,
      mockReason: `GA API error: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
} 