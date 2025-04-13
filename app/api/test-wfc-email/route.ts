import { NextResponse } from 'next/server'
import { headers } from 'next/headers'

// Function to send a test email using WFC Email Service
async function sendTestEmailWithWFC() {
  // Skip API calls during build time in Vercel
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build'
  
  if (isBuildTime) {
    return NextResponse.json({ message: 'Skipping test during build' }, { status: 200 });
  }
  
  try {
    // Use the backend URL or default to the Render.com hosted service
    const backendUrl = process.env.WFC_BACKEND_URL || 'https://dklemailservice.onrender.com'
    const endpoint = '/api/wfc/test-email'
    
    // Create a test order for email
    const testData = {
      email: "laventejeffrey@gmail.com",
      subject: "Test Email from Whisky For Charity",
      message: "This is a test email from the Whisky For Charity website via the WFC Email Service."
    }
    
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout
    
    try {
      const apiKey = process.env.WFC_API_KEY || 'dkl_metrics_api_key_2025'
      
      const response = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': apiKey
        },
        body: JSON.stringify(testData),
        signal: controller.signal
      })
      
      clearTimeout(timeoutId)
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`API call failed with status: ${response.status}`)
      }
      
      const result = await response.json()
      
      return {
        success: true,
        result: result
      }
    } catch (error: any) {
      if (error.name === 'AbortError') {
        return {
          success: false,
          error: 'Request to WFC Email Service timed out after 5 seconds'
        }
      }
      throw error
    }
  } catch (error) {
    return {
      success: false,
      error: (error as Error).message
    }
  }
}

export async function GET(request: Request) {
  // Get Headers
  const headersList = headers();
  const referer = headersList.get('referer') || '';
  const userAgent = headersList.get('user-agent') || '';
  
  // Strikte controle voor Vercel build/prefetching
  const isBuildTime = process.env.VERCEL_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';
  const isVercelBot = userAgent.includes('Vercel') || userAgent.includes('bot') || userAgent.includes('crawler');
  const isPrefetch = referer === '' || !referer;
  
  // Prevent running during automated processes
  if (isBuildTime || isVercelBot || isPrefetch) {
    return NextResponse.json({ message: 'Skipping test during automated process' }, { status: 200 });
  }
  
  // Controleer op query parameter om handmatige test te forceren
  const { searchParams } = new URL(request.url);
  const forceTest = searchParams.get('force') === 'true';
  
  if (!forceTest) {
    return NextResponse.json({
      message: 'Use ?force=true query parameter to trigger a test email',
      skipped: true
    });
  }
  
  try {
    const result = await sendTestEmailWithWFC()
    
    // Check if it's a NextResponse object (meaning it was skipped)
    if (result instanceof NextResponse) {
        return result; // Return the skip response directly
    }
    
    // Otherwise, it should be the result object with success/error properties
    if (!result.success) {
      console.error('WFC Email Test Failed:', result.error);
      return NextResponse.json(
        { message: 'WFC Email Test Failed', error: result.error },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: 'WFC Email Test Successful',
      result: result.result,
    });
  } catch (error) {
    console.error('Error in test-wfc-email API route:', error)
    return NextResponse.json(
      { error: 'Failed to send test email', details: (error as Error).message },
      { status: 500 }
    )
  }
} 