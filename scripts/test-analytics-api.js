/**
 * Script to test Google Analytics API connection
 * Run with: node scripts/test-analytics-api.js
 * 
 * Make sure to set the environment variables or update the values below:
 * - GA_PROPERTY_ID (Google Analytics property ID)
 * - GA_CLIENT_EMAIL (Service account email)
 * - GA_PRIVATE_KEY (Service account private key)
 */

const { BetaAnalyticsDataClient } = require('@google-analytics/data');

// Configuration - replace with your values or set environment variables
const GA_PROPERTY_ID = process.env.GA_PROPERTY_ID || 'YOUR_GA_PROPERTY_ID'; 
const GA_CLIENT_EMAIL = process.env.GA_CLIENT_EMAIL || 'YOUR_SERVICE_ACCOUNT_EMAIL';
const GA_PRIVATE_KEY = process.env.GA_PRIVATE_KEY || `-----BEGIN PRIVATE KEY-----
YOUR_PRIVATE_KEY_CONTENT_HERE
-----END PRIVATE KEY-----`;

// Date range for testing
const startDate = '2025-01-01';
const endDate = '2025-03-23';

/**
 * Test connection to Google Analytics API
 */
async function testAnalyticsConnection() {
  console.log('\n=== Google Analytics API Connection Test ===\n');
  console.log('Using the following credentials:');
  console.log(`- Property ID: ${GA_PROPERTY_ID}`);
  console.log(`- Client Email: ${GA_CLIENT_EMAIL}`);
  console.log(`- Private Key: ${GA_PRIVATE_KEY.substring(0, 20)}...${GA_PRIVATE_KEY.substring(GA_PRIVATE_KEY.length - 20)}`);
  
  try {
    // Initialize the client
    console.log('\nInitializing Google Analytics client...');
    const analyticsDataClient = new BetaAnalyticsDataClient({
      credentials: {
        client_email: GA_CLIENT_EMAIL,
        private_key: GA_PRIVATE_KEY,
      },
    });

    // Test metadata API call
    console.log('\nTesting API connection with metadata request...');
    try {
      await analyticsDataClient.getMetadata({
        name: `properties/${GA_PROPERTY_ID}`
      });
      console.log('✅ METADATA API TEST PASSED! Connection successful.');
    } catch (error) {
      console.error('❌ METADATA API TEST FAILED:', error.message);
      process.exit(1);
    }

    // Test running a basic report
    console.log('\nRunning a basic report to test data retrieval...');
    try {
      const [response] = await analyticsDataClient.runReport({
        property: `properties/${GA_PROPERTY_ID}`,
        dateRanges: [{ startDate, endDate }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'screenPageViews' },
        ],
      });

      // Check if we got a valid response
      if (response && response.rows && response.rows.length > 0) {
        const users = response.rows[0].metricValues[0].value;
        const pageviews = response.rows[0].metricValues[1].value;
        
        console.log('✅ DATA RETRIEVAL TEST PASSED!');
        console.log(`Retrieved data for date range ${startDate} to ${endDate}:`);
        console.log(`- Total Users: ${users}`);
        console.log(`- Pageviews: ${pageviews}`);
      } else {
        console.log('⚠️ DATA RETRIEVAL TEST WARNING: Received empty response. This could be normal if your property has no data for the selected date range.');
      }
    } catch (error) {
      console.error('❌ DATA RETRIEVAL TEST FAILED:', error.message);
    }

    console.log('\n=== Test Complete ===');
    console.log('If all tests passed, your Google Analytics API connection is working correctly!');
  } catch (error) {
    console.error('Error in test procedure:', error);
    process.exit(1);
  }
}

// Run the test
testAnalyticsConnection().catch(error => {
  console.error('Uncaught error:', error);
  process.exit(1);
}); 