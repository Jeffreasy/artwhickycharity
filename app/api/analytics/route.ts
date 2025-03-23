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

function formatPrivateKey(rawKey: string): string {
  console.log("Original key length:", rawKey?.length);
  console.log("Key starts with:", rawKey?.substring(0, 10) + "...");
  
  if (!rawKey) {
    console.error("Empty private key provided");
    return '';
  }
  
  let formattedKey = rawKey;
  
  // Verwijder quotes aan begin en eind indien aanwezig (komt vaak voor in environment variables)
  if ((formattedKey.startsWith('"') && formattedKey.endsWith('"')) || 
      (formattedKey.startsWith("'") && formattedKey.endsWith("'"))) {
    formattedKey = formattedKey.substring(1, formattedKey.length - 1);
    console.log("Removed surrounding quotes");
  }
  
  // Vervang escaped newlines door echte newlines
  formattedKey = formattedKey.replace(/\\n/g, '\n');
  console.log("After replacing escape sequences, key length:", formattedKey.length);
  
  // Controleer of de sleutel het juiste PEM-formaat heeft
  const hasPemMarkers = formattedKey.includes('-----BEGIN PRIVATE KEY-----') && 
                       formattedKey.includes('-----END PRIVATE KEY-----');
  
  // Als de PEM headers ontbreken, voeg ze toe
  if (!hasPemMarkers) {
    console.log("Key missing PEM markers, reformatting to proper PEM structure");
    
    // Verwijder eventuele niet-base64 karakters
    const cleanKey = formattedKey.replace(/[^a-zA-Z0-9+/=]/g, '');
    
    // Maak het juiste PEM formaat met begin/eind markers en 64-karakter regels
    let pemKey = '-----BEGIN PRIVATE KEY-----\n';
    
    // Splits in regels van 64 karakters
    for (let i = 0; i < cleanKey.length; i += 64) {
      pemKey += cleanKey.substring(i, i + 64) + '\n';
    }
    
    pemKey += '-----END PRIVATE KEY-----\n';
    formattedKey = pemKey;
  }
  
  // Controleer het resulterende formaat
  console.log("Final key structure:");
  console.log("- Has BEGIN marker:", formattedKey.includes("BEGIN PRIVATE KEY"));
  console.log("- Has END marker:", formattedKey.includes("END PRIVATE KEY"));
  console.log("- Has newlines:", formattedKey.includes("\n"));
  console.log("- Count of newlines:", (formattedKey.match(/\n/g) || []).length);
  
  return formattedKey;
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
  // Property ID is numeriek en komt uit environment variables
  const propertyId = process.env.GA_PROPERTY_ID;
  
  if (!propertyId) {
    throw new Error('Missing required Google Analytics property ID in environment variables');
  }
  
  console.log("GA Property ID:", propertyId);
  
  // API verwacht een property ID in numeriek formaat
  const numericPropertyId = propertyId.toString().replace(/\D/g, '');
  console.log("Using numeric property ID for API calls:", numericPropertyId);
  
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
              name: `properties/${numericPropertyId}`
            });
            
            console.log("Successfully connected with service account credentials from GA_CREDENTIALS");
            return { analyticsDataClient, propertyId: numericPropertyId };
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
      
      // Toon een gedeelte van de client email voor debugging (zonder volledige email te lekken)
      if (clientEmail.includes('@')) {
        const emailParts = clientEmail.split('@');
        const username = emailParts[0].length > 3 
          ? emailParts[0].substring(0, 3) + '...' 
          : emailParts[0];
        const domain = emailParts[1];
        console.log("Client email format: " + username + "@" + domain);
      }
      
      // Formatteer de private key correct voor de omgeving
      const privateKey = formatPrivateKey(rawPrivateKey);
      
      // Log debug info over de private key (zonder de inhoud te lekken)
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
          name: `properties/${numericPropertyId}`
        });
        
        console.log("Successfully connected with GA_CLIENT_EMAIL and GA_PRIVATE_KEY credentials");
        return { analyticsDataClient, propertyId: numericPropertyId };
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
        name: `properties/${numericPropertyId}`
      });
      
      console.log("Successfully connected with application default credentials");
      return { analyticsDataClient, propertyId: numericPropertyId };
    } catch (defaultAuthError: any) {
      console.error("Error authenticating with application default credentials:", defaultAuthError.message);
      console.log("Error details:", defaultAuthError?.details || "No details available");
      
      // Stap 4: Als noodoplossing, check of we de measurement ID kunnen gebruiken (werkt alleen voor basic rapportage)
      const measurementId = process.env.NEXT_PUBLIC_GA_ID;
      if (measurementId && measurementId.startsWith('G-')) {
        console.log("Attempting to use GA4 Measurement ID as fallback:", measurementId);
        
        return { 
          analyticsDataClient: null, 
          propertyId: numericPropertyId, 
          useMeasurementProtocol: true,
          measurementId 
        };
      }
      
      throw new Error(`Failed to authenticate with Google Analytics API. Please check your credentials and permissions. Final error: ${defaultAuthError.message}`);
    }
  } catch (error: any) {
    console.error("All authentication methods failed for Google Analytics:", error);
    throw error;
  }
}

async function fetchAnalyticsData({ startDate, endDate }: AnalyticsQueryParams) {
  try {
    const { analyticsDataClient, propertyId, useMeasurementProtocol, measurementId } = await initializeAnalyticsClient();

    console.log(`Initialized GA client with property ID: ${propertyId}`);
    
    // Controleer of we de Analytics Data API of Measurement Protocol moeten gebruiken
    if (useMeasurementProtocol) {
      console.log(`Using GA4 Measurement Protocol with ID: ${measurementId}`);
      
      // Voor Measurement Protocol gebruiken we een vereenvoudigde implementatie
      // met noodoplossing data omdat we geen directe API hebben
      
      // Log deze fallback
      console.log("Measurement Protocol fallback doesn't have real data access capability");
      console.log("This would require implementing the GA4 Measurement Protocol for data collection");
      
      // Geef mock data terug met duidelijke reden
      return {
        ...MOCK_DATA,
        isMockData: true,
        mockReason: "Using GA4 Measurement ID fallback (no API data access)"
      };
    }
    
    // Regular API path when we have a valid analytics client
    if (!analyticsDataClient) {
      throw new Error("Analytics Data Client could not be initialized");
    }

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