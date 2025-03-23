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
  const apiKey = process.env.GA_API_KEY;

  console.log("GA Property ID:", propertyId);
  
  // If we don't have a property ID, we can't proceed
  if (!propertyId) {
    throw new Error('Missing required Google Analytics property ID in environment variables');
  }
  
  // Check if we have API key credentials
  if (apiKey) {
    console.log("Found API key, trying API key authentication first");
    try {
      // Create a client with API key
      const apiKeyClient = new BetaAnalyticsDataClient({
        apiKey: apiKey
      });
      
      // Test connection with API key
      await apiKeyClient.getMetadata({
        name: `properties/${propertyId}`
      });
      
      console.log("Successfully validated Google Analytics credentials using API key");
      return { analyticsDataClient: apiKeyClient, propertyId };
    } catch (apiKeyError: any) {
      console.log("API key authentication failed:", apiKeyError.message);
      // Continue with service account attempt if we have those credentials
      if (!rawPrivateKey || !clientEmail) {
        throw new Error('API key authentication failed and no service account credentials available');
      }
    }
  }

  // If we're here, we're using service account credentials
  if (!rawPrivateKey || !clientEmail) {
    throw new Error('Missing required Google Analytics service account credentials in environment variables');
  }
  
  console.log("GA Client Email:", clientEmail?.substring(0, 5) + "..." + (clientEmail?.slice(-5) || ""));
  
  try {
    // Format the private key correctly for the environment
    const privateKey = formatPrivateKey(rawPrivateKey);
    
    console.log("Private key length:", privateKey.length);
    console.log("First 10 chars of formatted key:", privateKey.substring(0, 10) + "...");
    console.log("Last 10 chars of formatted key:", "..." + privateKey.substring(privateKey.length - 10));
    
    // EXPERIMENTAL: Try a simpler key format with just the content, no PEM headers
    // This might work better with certain Node versions and OpenSSL versions
    const simplePEMKey = simplifyPEMKey(privateKey);
    console.log("Using simplified PEM format as fallback");

    // For testing with the hardcoded API key if needed (will be removed in production)
    const hardcodedTestApiKey = "AIzaSyC3zPEHuuQvMmpSJJ_vRfgqniBJzzImeXQ";
    const hasApiKey = !!apiKey;
    const useHardcodedApiKey = !hasApiKey; // Set to true to use the hardcoded key for testing

    try {
      // Attempt 1: Try API key authentication first if available, as it's the most reliable
      if (apiKey || useHardcodedApiKey) {
        console.log("Trying with API key authentication...");
        const apiKeyToUse = apiKey || (useHardcodedApiKey ? hardcodedTestApiKey : undefined);
        
        const apiKeyClient = new BetaAnalyticsDataClient({
          apiKey: apiKeyToUse,
        });
        
        // Test API key authentication
        await apiKeyClient.getMetadata({
          name: `properties/${propertyId}`
        });
        
        console.log("Successfully validated Google Analytics credentials using API key");
        return { analyticsDataClient: apiKeyClient, propertyId };
      }
      
      // Attempt 2: Standard formatted key
      console.log("Trying with formatted key...");
      const analyticsDataClient = new BetaAnalyticsDataClient({
        credentials: {
          client_email: clientEmail,
          private_key: privateKey,
        },
      });
      
      // Test connection
      await analyticsDataClient.getMetadata({
        name: `properties/${propertyId}`
      });
      
      console.log("Successfully validated Google Analytics credentials");
      return { analyticsDataClient, propertyId };
    } 
    catch (primaryError: any) {
      console.log("Primary auth method failed:", primaryError.message);
      
      try {
        // Attempt 2: Simplified PEM key
        console.log("Trying with simplified PEM key...");
        const fallbackClient = new BetaAnalyticsDataClient({
          credentials: {
            client_email: clientEmail,
            private_key: simplePEMKey,
          },
        });
        
        // Test connection with fallback
        await fallbackClient.getMetadata({
          name: `properties/${propertyId}`
        });
        
        console.log("Successfully validated Google Analytics credentials using simplified PEM key");
        return { analyticsDataClient: fallbackClient, propertyId };
      }
      catch (fallbackError: any) {
        console.log("Both service account auth methods failed. Error:", fallbackError.message);
        
        // Attempt 3: Try using API key again if we haven't yet
        if (apiKey) {
          try {
            console.log("Trying API key authentication as last resort...");
            
            // Create a client with API key
            const apiKeyClient = new BetaAnalyticsDataClient({
              apiKey: apiKey
            });
            
            // Test connection with API key
            await apiKeyClient.getMetadata({
              name: `properties/${propertyId}`
            });
            
            console.log("Successfully validated Google Analytics credentials using API key");
            return { analyticsDataClient: apiKeyClient, propertyId };
          }
          catch (apiKeyError: any) {
            console.error("All authentication methods failed. Final error:", apiKeyError.message);
            throw new Error(`Failed to validate GA credentials. Please check your credentials and try again.`);
          }
        } else {
          console.error("No API key available as fallback.");
          throw new Error(`Failed to validate GA credentials: ${primaryError.message}`);
        }
      }
    }
  } catch (error) {
    console.error('Error initializing Google Analytics client:', error);
    throw error;
  }
}

// New function to try a simpler key format for compatibility with different OpenSSL versions
function simplifyPEMKey(key: string): string {
  try {
    // Extract just the base64 content without headers
    const base64Content = key
      .replace('-----BEGIN PRIVATE KEY-----', '')
      .replace('-----END PRIVATE KEY-----', '')
      .replace(/\s/g, '');
    
    // Return a simplified key format
    return base64Content;
  } catch (error) {
    console.error("Error simplifying PEM key:", error);
    return key;
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