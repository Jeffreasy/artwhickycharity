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
  const apiKey = process.env.GA_API_KEY;

  // We hebben een property ID nodig en ofwel service account credentials, ofwel een API sleutel
  const hasServiceAccountCreds = !!(privateKey && clientEmail);
  const hasApiKey = !!apiKey;

  console.log(`Credentials check - Property ID: ${!!propertyId}, Service Account: ${hasServiceAccountCreds}, API Key: ${hasApiKey}`);

  return !!(propertyId && (hasServiceAccountCreds || hasApiKey));
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
    
    // Replace escaped newlines with actual newlines
    formattedKey = formattedKey.replace(/\\n/g, '\n');
    
    // Check if the key already has the proper PEM format
    if (formattedKey.includes('-----BEGIN PRIVATE KEY-----') && 
        formattedKey.includes('-----END PRIVATE KEY-----')) {
      
      // Extract just the content between headers to recreate with proper format
      const contentMatch = formattedKey.match(/-----BEGIN PRIVATE KEY-----\s*([A-Za-z0-9+/=\s]+)\s*-----END PRIVATE KEY-----/);
      
      if (contentMatch && contentMatch[1]) {
        // Clean any extraneous whitespace from the base64 content
        const base64Content = contentMatch[1].replace(/\s/g, '');
        // Chunk the base64 into proper 64-character lines
        const chunks = [];
        for (let i = 0; i < base64Content.length; i += 64) {
          chunks.push(base64Content.substring(i, i + 64));
        }
        return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
      }
    } else {
      // Assume it's just the raw base64 without headers
      const base64Content = formattedKey.replace(/\s/g, '');
      // Chunk the base64 into proper 64-character lines
      const chunks = [];
      for (let i = 0; i < base64Content.length; i += 64) {
        chunks.push(base64Content.substring(i, i + 64));
      }
      return `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
    }
    
    // If we couldn't format it properly, return as is
    return formattedKey;
  } catch (error) {
    console.error('Error formatting private key:', error);
    return key || '';
  }
}

// Function to simplify PEM key format (sometimes works better with certain Node versions)
function simplifyPEMKey(key: string): string {
  try {
    // Extract just the base64 content (no headers, no line breaks)
    const contentStart = key.indexOf('BEGIN PRIVATE KEY-----') + 24;
    const contentEnd = key.indexOf('-----END PRIVATE KEY');
    
    if (contentStart > 24 && contentEnd > contentStart) {
      const base64Content = key.substring(contentStart, contentEnd).replace(/\s/g, '');
      // Return with minimal formatting - no line breaks in content
      return `-----BEGIN PRIVATE KEY-----\n${base64Content}\n-----END PRIVATE KEY-----`;
    }
    return key;
  } catch (error) {
    console.error('Error simplifying PEM key:', error);
    return key;
  }
}

async function initializeAnalyticsClient() {
  // Check if we have the necessary environment variables
  const rawPrivateKey = process.env.GA_PRIVATE_KEY;
  const clientEmail = process.env.GA_CLIENT_EMAIL;
  const propertyId = process.env.GA_PROPERTY_ID;

  console.log("GA Property ID:", propertyId);
  
  // If we don't have a property ID, we can't proceed
  if (!propertyId) {
    throw new Error('Missing required Google Analytics property ID in environment variables');
  }
  
  // We need to use service account because API keys are not supported
  if (!rawPrivateKey || !clientEmail) {
    throw new Error('Missing required Google Analytics service account credentials in environment variables');
  }
  
  console.log("GA Client Email:", clientEmail?.substring(0, 5) + "..." + (clientEmail?.slice(-5) || ""));
  
  try {
    // Format the private key correctly for the environment
    const privateKey = formatPrivateKey(rawPrivateKey);
    
    // Log debugging info
    console.log("Private key stats: Length:", privateKey.length);
    console.log("Has BEGIN marker:", privateKey.includes("BEGIN PRIVATE KEY"));
    console.log("Has END marker:", privateKey.includes("END PRIVATE KEY"));
    console.log("Has newlines:", privateKey.includes("\n"));
    console.log("Count of lines:", privateKey.split("\n").length);
    
    // Try using a more explicit credentials format for Node.js environments
    console.log("Creating Analytics client with explicit JWT format");
    
    // Create a simple key object that specifies the key type explicitly
    const keyData = {
      type: "service_account",
      project_id: "whisky4charity",
      private_key_id: "4fc6b8abe6c7ab28814ae613b56a8a8e1fe14e5f",
      private_key: privateKey,
      client_email: clientEmail,
      client_id: "110866566560065592416",
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(clientEmail)}`
    };
    
    // Create client with explicit key data
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: keyData
    });
    
    // Test the connection with a simple metadata request
    try {
      await analyticsDataClient.getMetadata({
        name: `properties/${propertyId}`
      });
      console.log("Successfully validated Google Analytics credentials");
      return { analyticsDataClient, propertyId };
    } catch (error: any) {
      console.error("Error during connection test:", error.message);
      throw error;
    }
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