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
    const hasCredentials = checkCredentials();
    
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

function checkCredentials(): boolean {
  // Check if we have Google Analytics credentials either in the service account or OAuth JSON file
  return !!process.env.GA_CREDENTIALS || (!!process.env.GA_PROPERTY_ID && !!process.env.GA_CLIENT_EMAIL && !!process.env.GA_PRIVATE_KEY);
}

// Function to properly format private key specifically for Vercel environment
function formatPrivateKey(key: string | undefined): string {
  if (!key) return '';
  
  try {
    console.log("Original key format (first 10 chars):", key.substring(0, 10) + "...");
    console.log("Original key length:", key.length);
    
    // Step 1: Remove any surrounding quotes
    let formattedKey = key.trim();
    if ((formattedKey.startsWith('"') && formattedKey.endsWith('"')) || 
        (formattedKey.startsWith("'") && formattedKey.endsWith("'"))) {
      formattedKey = formattedKey.substring(1, formattedKey.length - 1);
      console.log("Removed surrounding quotes");
    }
    
    // Step 2: Replace escaped newlines with actual newlines
    if (formattedKey.includes('\\n')) {
      formattedKey = formattedKey.replace(/\\n/g, '\n');
      console.log("Replaced escaped newlines");
    }
    
    // Step 3: Fix the PEM format if it's all in one line or malformed
    if (!formattedKey.includes('\n') || 
        !formattedKey.includes('-----BEGIN PRIVATE KEY-----') || 
        !formattedKey.includes('-----END PRIVATE KEY-----')) {
      
      // Try to extract the base64 content, ignoring headers if present
      let base64Content = formattedKey;
      
      // If headers are present but format is wrong
      if (formattedKey.includes('PRIVATE KEY')) {
        // Use a compatible regex without 's' flag
        const beginIndex = formattedKey.indexOf('-----BEGIN PRIVATE KEY-----');
        const endIndex = formattedKey.indexOf('-----END PRIVATE KEY-----');
        
        if (beginIndex !== -1 && endIndex !== -1 && endIndex > beginIndex) {
          base64Content = formattedKey.substring(beginIndex + 27, endIndex).replace(/\s/g, '');
        } else {
          // Remove any potential header/footer fragments
          base64Content = formattedKey
            .replace(/-----BEGIN PRIVATE KEY-----/g, '')
            .replace(/-----END PRIVATE KEY-----/g, '')
            .replace(/\s/g, '');
        }
      }
      
      // Clean any non-base64 characters
      base64Content = base64Content.replace(/[^A-Za-z0-9+/=]/g, '');
      
      // Re-format with proper PEM structure
      // Format into 64-character lines
      const chunks = [];
      for (let i = 0; i < base64Content.length; i += 64) {
        chunks.push(base64Content.substring(i, i + 64));
      }
      
      formattedKey = `-----BEGIN PRIVATE KEY-----\n${chunks.join('\n')}\n-----END PRIVATE KEY-----`;
      console.log("Reformatted key to proper PEM format");
    }
    
    // Log the structure of the reformatted key
    console.log("Final key format check:");
    console.log("- Contains BEGIN marker:", formattedKey.includes("BEGIN PRIVATE KEY"));
    console.log("- Contains END marker:", formattedKey.includes("END PRIVATE KEY"));
    console.log("- Contains newlines:", formattedKey.includes("\n"));
    console.log("- Number of newlines:", (formattedKey.match(/\n/g) || []).length);
    console.log("- First line:", formattedKey.split('\n')[0]);
    console.log("- Last line:", formattedKey.split('\n').pop());
    
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
  const propertyId = process.env.GA_PROPERTY_ID;
  
  console.log("GA Property ID:", propertyId);
  
  if (!propertyId) {
    throw new Error('Missing required Google Analytics property ID in environment variables');
  }
  
  try {
    // Stap 1: Probeer eerst de GA_CREDENTIALS JSON als specifieke service account credentials
    if (process.env.GA_CREDENTIALS) {
      console.log("Trying with explicit service account JSON credentials via GA_CREDENTIALS...");
      
      try {
        // Parse de credentials JSON - Zorg ervoor dat het een valide JSON object is
        const credentials = JSON.parse(process.env.GA_CREDENTIALS);
        
        // Controleer of het een service account credentials object is
        if (credentials.type === "service_account") {
          console.log("Valid service account credentials found");
          console.log("Service account client email:", credentials.client_email);
          
          try {
            // Gebruik de service account credentials expliciet
            const analyticsDataClient = new BetaAnalyticsDataClient({
              projectId: credentials.project_id,
              credentials: {
                client_email: credentials.client_email,
                private_key: credentials.private_key
              }
            });
            
            // Test de verbinding met een eenvoudige metadata request
            await analyticsDataClient.getMetadata({
              name: `properties/${propertyId}`
            });
            
            console.log("Successfully connected with service account credentials from GA_CREDENTIALS");
            return { analyticsDataClient, propertyId };
          } catch (authError: any) {
            console.error("Error authenticating with service account credentials:", authError.message);
            console.log("Error details:", authError?.details || "No details available");
          }
        } else {
          console.error("GA_CREDENTIALS does not contain a valid service account (type should be 'service_account')");
        }
      } catch (parseError) {
        console.error("Error parsing GA_CREDENTIALS JSON:", parseError);
      }
    }
    
    // Stap 2: Gebruik de individuele environment variables als fallback
    if (process.env.GA_CLIENT_EMAIL && process.env.GA_PRIVATE_KEY) {
      console.log("Trying with individual GA_CLIENT_EMAIL and GA_PRIVATE_KEY credentials...");
      const clientEmail = process.env.GA_CLIENT_EMAIL;
      const rawPrivateKey = process.env.GA_PRIVATE_KEY;
      
      // Toon een gedeelte van de client email voor debugging
      console.log("Client email:", clientEmail.substring(0, 5) + "..." + clientEmail.slice(-5));
      
      // Formatteer de private key correct voor de omgeving
      const privateKey = formatPrivateKey(rawPrivateKey);
      
      // Log debug info over de private key
      console.log("Private key format check:");
      console.log("- Length:", privateKey.length);
      console.log("- Has BEGIN marker:", privateKey.includes("BEGIN PRIVATE KEY"));
      console.log("- Has END marker:", privateKey.includes("END PRIVATE KEY"));
      console.log("- Has newlines:", privateKey.includes("\n"));
      console.log("- Count of newlines:", (privateKey.match(/\n/g) || []).length);
      
      try {
        // Creëer een volledig service account object in het formaat dat Google verwacht
        const serviceAccountAuth = {
          type: "service_account",
          project_id: "whisky4charity",
          private_key: privateKey,
          client_email: clientEmail,
          token_uri: "https://oauth2.googleapis.com/token",
        };
        
        // Gebruik zeer expliciete credentials opzet
        const analyticsDataClient = new BetaAnalyticsDataClient({
          credentials: serviceAccountAuth,
          projectId: "whisky4charity"
        });
        
        // Test de verbinding met een eenvoudige metadata request
        await analyticsDataClient.getMetadata({
          name: `properties/${propertyId}`
        });
        
        console.log("Successfully connected with GA_CLIENT_EMAIL and GA_PRIVATE_KEY credentials");
        return { analyticsDataClient, propertyId };
      } catch (authError: any) {
        console.error("Error authenticating with GA_CLIENT_EMAIL and GA_PRIVATE_KEY:", authError.message);
        console.log("Error details:", authError?.details || "No details available");
      }
    }
    
    // Stap 3: Als laatste optie, probeer de environment variable GOOGLE_APPLICATION_CREDENTIALS
    console.log("Trying with application default credentials...");
    try {
      // Gebruik de standaard authentication zonder expliciete credentials
      // Dit probeert automatisch te authenticeren met ADC (Application Default Credentials)
      const analyticsDataClient = new BetaAnalyticsDataClient();
      
      // Test de verbinding met een eenvoudige metadata request
      await analyticsDataClient.getMetadata({
        name: `properties/${propertyId}`
      });
      
      console.log("Successfully connected with application default credentials");
      return { analyticsDataClient, propertyId };
    } catch (defaultAuthError: any) {
      console.error("Error authenticating with application default credentials:", defaultAuthError.message);
      console.log("Error details:", defaultAuthError?.details || "No details available");
      throw new Error(`Failed to authenticate with Google Analytics API. Please check your credentials and permissions. Final error: ${defaultAuthError.message}`);
    }
  } catch (error: any) {
    console.error("All authentication methods failed for Google Analytics:", error);
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